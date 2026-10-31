'use client';
/* eslint-disable @next/next/no-img-element -- logos dos artistas em SVG, sem otimização a fazer */
// Gerador do contrato de venda de show (/contratos). O contrato é montado no navegador; só a leitura por IA (bloco 0)
// manda o arquivo ao servidor, sem guardar. O rascunho fica salvo só neste aparelho (localStorage).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ArtistaContrato } from '@/data/contratos';
import { brl, lerValor } from '@/lib/extenso';
import type { EMPRESA as EmpresaT } from '@/lib/site';
import { Contrato, type DadosContrato, type Quem, Timbrado } from './Contrato';
import { type DadosLidos, LeituraIA } from './LeituraIA';

const CHAVE = 'royals-contrato-rascunho-v1';
const hojeIso = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

type Form = Omit<DadosContrato, 'valores'> & { artista: string; valores: Omit<DadosContrato['valores'], 'cache' | 'sinal'> & { cache: string; sinal: string } };

const VAZIO = (): Form => ({
  artista: '',
  numero: '',
  evento: { nome: '', data: '', horario: '', duracao: '', formato: '', local: '', endereco: '', cidade: '', publico: '', passagemSom: '', chegada: '' },
  contratante: { tipo: 'pj', nome: '', doc: '', rgIe: '', endereco: '', representante: '', repCpf: '', email: '', whatsapp: '' },
  valores: { cache: '', modo: 'sinal', sinal: '', sinalData: '', saldoData: '', unicoData: '', pagamento: '', multa: '', remarcarDias: '', devolucaoDias: '' },
  logistica: { passagem: 'contratante', hospedagem: 'contratante', alimentacao: 'contratante', translado: 'contratante', equipe: '', origem: '' },
  extras: { reservaComSinal: true, saldoAntes: true, especiais: '' },
  assinatura: { cidade: 'Manaus/AM', data: hojeIso() },
});

// ?exemplo=1: preenche com dados fictícios, marcados como EXEMPLO (para o PDF de modelo e para conferir o layout)
const EXEMPLO = (artista: string): Form => ({
  ...VAZIO(),
  artista,
  numero: 'EXEMPLO-001',
  evento: { nome: 'EXEMPLO · Baile de Sexta', data: '2026-12-12', horario: '01h00', duracao: '1 hora', formato: 'Set solo', local: 'EXEMPLO · Casa de Shows', endereco: 'Av. Exemplo, 100, Centro', cidade: 'Manaus/AM', publico: '1.500 pessoas', passagemSom: '20h00', chegada: '1 hora' },
  contratante: { tipo: 'pj', nome: 'EXEMPLO PRODUÇÕES LTDA', doc: '00.000.000/0001-00', rgIe: '', endereco: 'Rua Exemplo, 10, Centro, Manaus/AM', representante: 'Fulano de Tal', repCpf: '000.000.000-00', email: 'exemplo@exemplo.com', whatsapp: '(92) 90000-0000' },
  valores: { cache: '10.000,00', modo: 'sinal', sinal: '5.000,00', sinalData: '2026-11-20', saldoData: '2026-12-10', unicoData: '', pagamento: 'EXEMPLO · Pix (chave a informar)', multa: '50', remarcarDias: '90', devolucaoDias: '30' },
  logistica: { passagem: 'contratante', hospedagem: 'contratante', alimentacao: 'contratante', translado: 'contratante', equipe: '3', origem: 'Rio de Janeiro/RJ' },
  extras: { reservaComSinal: true, saldoAntes: true, especiais: '' },
  assinatura: { cidade: 'Manaus/AM', data: '2026-11-15' },
});

const soDigitos = (s: string) => s.replace(/\D/g, '');
const mascaraDoc = (s: string, pj: boolean) => {
  const d = soDigitos(s).slice(0, pj ? 14 : 11);
  return pj
    ? d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
    : d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// campos sem os quais o contrato não sai (o resto é opcional e some do texto quando vazio)
function faltando(f: Form, cache: number | null, sinal: number | null): string[] {
  const x: string[] = [];
  const ok = (v: string) => v.trim().length > 0;
  if (!f.artista) x.push('artista');
  if (!ok(f.numero)) x.push('número do contrato');
  const e = f.evento;
  ([['nome', 'nome do evento'], ['data', 'data do show'], ['horario', 'horário'], ['duracao', 'duração'], ['formato', 'formato'], ['local', 'local'], ['endereco', 'endereço do local'], ['cidade', 'cidade/UF']] as const)
    .forEach(([k, r]) => { if (!ok(e[k])) x.push(r); });
  const c = f.contratante;
  if (!ok(c.nome)) x.push(c.tipo === 'pj' ? 'razão social' : 'nome do contratante');
  if (soDigitos(c.doc).length !== (c.tipo === 'pj' ? 14 : 11)) x.push(c.tipo === 'pj' ? 'CNPJ completo' : 'CPF completo');
  if (!ok(c.endereco)) x.push('endereço do contratante');
  if (c.tipo === 'pj' && !ok(c.representante)) x.push('representante');
  if (c.tipo === 'pj' && soDigitos(c.repCpf).length !== 11) x.push('CPF do representante');
  const v = f.valores;
  if (!cache) x.push('cachê');
  if (v.modo === 'sinal') {
    if (!sinal) x.push('sinal'); else if (cache && sinal >= cache) x.push('sinal menor que o cachê');
    if (!v.sinalData) x.push('data do sinal');
    if (!v.saldoData) x.push('data do saldo');
  } else if (!v.unicoData) x.push('data do pagamento');
  if (!ok(v.pagamento)) x.push('dados de pagamento');
  if (!ok(v.multa)) x.push('% da multa');
  if (!ok(f.assinatura.cidade) || !f.assinatura.data) x.push('cidade e data da assinatura');
  return x;
}

type Props = { artistas: ArtistaContrato[]; empresa: typeof EmpresaT; booking: string; site: string };

export function GeradorContrato({ artistas, empresa, booking, site }: Props) {
  const [f, setF] = useState<Form>(VAZIO);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const previaRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);

  // rascunho salvo neste aparelho, ou exemplo pela URL
  // lê o rascunho/exemplo só no navegador (no servidor não há localStorage nem URL): setState aqui é de propósito
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('exemplo')) { setF(EXEMPLO(q.get('artista') || artistas[0].slug)); setPronto(true); return; }
      const s = localStorage.getItem(CHAVE);
      if (s) setF({ ...VAZIO(), ...JSON.parse(s) });
    } catch {}
    setPronto(true);
  }, [artistas]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { if (!pronto) return; try { localStorage.setItem(CHAVE, JSON.stringify(f)); } catch {} }, [f, pronto]);

  // a folha A4 (794 px) encolhe para caber na coluna da prévia
  useLayoutEffect(() => {
    const el = previaRef.current, doc = docRef.current;
    if (!el || !doc) return;
    const ajusta = () => { doc.style.setProperty('--escala', String(Math.min(1, (el.clientWidth - 2) / 794))); };
    ajusta();
    const ro = new ResizeObserver(ajusta); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const artista = artistas.find((a) => a.slug === f.artista) ?? null;
  const cache = lerValor(f.valores.cache), sinal = lerValor(f.valores.sinal);
  const dados: DadosContrato = useMemo(() => ({ ...f, valores: { ...f.valores, cache, sinal } }), [f, cache, sinal]);
  const falta = faltando(f, cache, sinal);

  type Secao = 'evento' | 'contratante' | 'valores' | 'logistica' | 'extras' | 'assinatura';
  const set = <S extends Secao>(s: S, k: keyof Form[S], val: unknown) => setF((p) => ({ ...p, [s]: { ...p[s], [k]: val } }));
  const campo = <S extends Secao>(s: S, k: keyof Form[S] & string, rot: string, extra: { tipo?: string; dica?: string; obrig?: boolean; mascara?: (v: string) => string; lista?: string[] } = {}) => {
    const id = `c-${s}-${k}`;
    const val = String(f[s][k] ?? '');
    return (
      <label className="gc-campo" htmlFor={id}>
        <span>{rot}{extra.obrig ? <i aria-hidden="true"> *</i> : null}</span>
        <input id={id} type={extra.tipo ?? 'text'} value={val} list={extra.lista ? `${id}-l` : undefined} placeholder={extra.dica}
          onChange={(ev) => set(s, k, extra.mascara ? extra.mascara(ev.target.value) : ev.target.value)} />
        {extra.lista ? <datalist id={`${id}-l`}>{extra.lista.map((o) => <option key={o} value={o} />)}</datalist> : null}
      </label>
    );
  };
  const quem = (k: 'passagem' | 'hospedagem' | 'alimentacao' | 'translado', rot: string) => (
    <fieldset className="gc-quem">
      <legend>{rot}</legend>
      {(['contratante', 'royals', 'na'] as Quem[]).map((q) => (
        <label key={q}><input type="radio" name={`q-${k}`} checked={f.logistica[k] === q} onChange={() => set('logistica', k, q)} />{q === 'contratante' ? 'Contratante' : q === 'royals' ? 'Royals' : 'Não se aplica'}</label>
      ))}
    </fieldset>
  );

  const escolheArtista = (slug: string) => setF((p) => {
    const a = artistas.find((x) => x.slug === slug);
    const sufixo = (p.evento.data || hojeIso()).replaceAll('-', '');
    return { ...p, artista: slug, numero: p.numero && !p.numero.startsWith('RE-') ? p.numero : a ? `RE-${slug.slice(0, 4).toUpperCase()}-${sufixo}` : '', evento: { ...p.evento, formato: p.evento.formato || a?.formatos[0] || '' } };
  });

  const baixar = () => {
    if (falta.length) { setAviso(`Falta preencher: ${falta.join(', ')}.`); return; }
    setAviso('');
    const antes = document.title;
    document.title = `Contrato ${artista?.nome ?? ''} - ${f.evento.nome} - ${f.evento.data}`.replace(/[\\/:*?"<>|]/g, '');
    window.print();
    document.title = antes;
  };
  const copiar = async () => {
    const t = docRef.current?.querySelector('.cdoc-corpo') as HTMLElement | null;
    try { await navigator.clipboard.writeText(t?.innerText ?? ''); setAviso('Texto copiado.'); } catch { setAviso('Não deu para copiar neste navegador.'); }
  };
  // junta o que a IA leu: só preenche campo vazio (o que já foi digitado não é trocado)
  const ROTULOS: Record<string, string> = { nome: 'nome', doc: 'documento', rgIe: 'RG/IE', endereco: 'endereço', representante: 'representante', repCpf: 'CPF do representante', email: 'e-mail', whatsapp: 'WhatsApp', data: 'data', horario: 'horário', local: 'local', cidade: 'cidade', publico: 'público', cache: 'cachê' };
  const aplicarIA = (d: DadosLidos): string[] => {
    const feitos: string[] = [];
    const prox: Form = structuredClone(f);
    const c = d.contratante ?? {};
    const contratanteVazio = !prox.contratante.nome.trim() && !prox.contratante.doc.trim();
    if (contratanteVazio && (c.tipo === 'pj' || c.tipo === 'pf')) prox.contratante.tipo = c.tipo;
    (['nome', 'doc', 'rgIe', 'endereco', 'representante', 'repCpf', 'email', 'whatsapp'] as const).forEach((k) => {
      let v = (c[k] ?? '').trim();
      if (!v || prox.contratante[k].trim()) return;
      if (k === 'doc') v = mascaraDoc(v, prox.contratante.tipo === 'pj');
      if (k === 'repCpf') v = mascaraDoc(v, false);
      prox.contratante[k] = v; feitos.push(`${ROTULOS[k]} do contratante`);
    });
    const e = d.evento ?? {};
    (['nome', 'data', 'horario', 'local', 'endereco', 'cidade', 'publico'] as const).forEach((k) => {
      const v = (e[k] ?? '').trim();
      if (!v || prox.evento[k].trim()) return;
      prox.evento[k] = v; feitos.push(k === 'nome' ? 'nome do evento' : k === 'endereco' ? 'endereço do local' : ROTULOS[k]);
    });
    const cache = (d.valores?.cache ?? '').trim();
    if (cache && !prox.valores.cache.trim() && lerValor(cache)) { prox.valores.cache = cache; feitos.push('cachê'); }
    setF(prox);
    return feitos;
  };
  const limpar = () => { if (window.confirm('Apagar tudo o que foi preenchido?')) setF(VAZIO()); };

  return (
    <div className="gc">
      <form className="gc-form" onSubmit={(e) => { e.preventDefault(); baixar(); }}>
        <LeituraIA onDados={aplicarIA} />
        <fieldset className="gc-bloco">
          <legend><b>1</b> Artista</legend>
          <div className="gc-artistas">
            {artistas.map((a) => (
              <button type="button" key={a.slug} className={`gc-artista${f.artista === a.slug ? ' is-on' : ''}`} aria-pressed={f.artista === a.slug} onClick={() => escolheArtista(a.slug)}>
                <img src={a.logo} alt="" /><span>{a.nome}</span><small>{a.generos} · {a.base}</small>
              </button>
            ))}
          </div>
          {artista ? <p className="gc-dica">Set de referência na página dele: {artista.duracao}.</p> : null}
          <label className="gc-campo" htmlFor="c-numero"><span>Nº do contrato <i aria-hidden="true">*</i></span>
            <input id="c-numero" value={f.numero} onChange={(e) => setF((p) => ({ ...p, numero: e.target.value }))} placeholder="sai sozinho ao escolher o artista" /></label>
        </fieldset>

        <fieldset className="gc-bloco">
          <legend><b>2</b> Evento</legend>
          {campo('evento', 'nome', 'Nome do evento', { obrig: true })}
          <div className="gc-linha">
            {campo('evento', 'data', 'Data do show', { tipo: 'date', obrig: true })}
            {campo('evento', 'horario', 'Horário do show', { dica: '01h00', obrig: true })}
          </div>
          <div className="gc-linha">
            {campo('evento', 'duracao', 'Duração do set', { dica: artista?.duracao ?? '1 hora', obrig: true })}
            {campo('evento', 'formato', 'Formato', { obrig: true, lista: artista?.formatos })}
          </div>
          {campo('evento', 'local', 'Local (casa, espaço)', { obrig: true })}
          {campo('evento', 'endereco', 'Endereço do local', { obrig: true })}
          <div className="gc-linha">
            {campo('evento', 'cidade', 'Cidade/UF', { dica: 'Manaus/AM', obrig: true })}
            {campo('evento', 'publico', 'Público estimado', { dica: 'opcional' })}
          </div>
          <div className="gc-linha">
            {campo('evento', 'passagemSom', 'Passagem de som', { dica: 'opcional · 20h00' })}
            {campo('evento', 'chegada', 'Chegada antes do show', { dica: 'opcional · 1 hora' })}
          </div>
        </fieldset>

        <fieldset className="gc-bloco">
          <legend><b>3</b> Contratante</legend>
          <div className="gc-seg" role="radiogroup" aria-label="Tipo de contratante">
            {(['pj', 'pf'] as const).map((t) => (
              <label key={t}><input type="radio" name="tipo" checked={f.contratante.tipo === t} onChange={() => setF((p) => ({ ...p, contratante: { ...p.contratante, tipo: t, doc: mascaraDoc(p.contratante.doc, t === 'pj') } }))} />{t === 'pj' ? 'Empresa (CNPJ)' : 'Pessoa física (CPF)'}</label>
            ))}
          </div>
          {campo('contratante', 'nome', f.contratante.tipo === 'pj' ? 'Razão social' : 'Nome completo', { obrig: true })}
          <div className="gc-linha">
            {campo('contratante', 'doc', f.contratante.tipo === 'pj' ? 'CNPJ' : 'CPF', { obrig: true, mascara: (v) => mascaraDoc(v, f.contratante.tipo === 'pj') })}
            {campo('contratante', 'rgIe', f.contratante.tipo === 'pj' ? 'Inscrição estadual' : 'RG', { dica: 'opcional' })}
          </div>
          {campo('contratante', 'endereco', 'Endereço completo (com cidade/UF)', { obrig: true })}
          {f.contratante.tipo === 'pj' ? (
            <div className="gc-linha">
              {campo('contratante', 'representante', 'Representante (quem assina)', { obrig: true })}
              {campo('contratante', 'repCpf', 'CPF do representante', { obrig: true, mascara: (v) => mascaraDoc(v, false) })}
            </div>
          ) : null}
          <div className="gc-linha">
            {campo('contratante', 'email', 'E-mail', { tipo: 'email', dica: 'opcional' })}
            {campo('contratante', 'whatsapp', 'WhatsApp', { dica: 'opcional' })}
          </div>
        </fieldset>

        <fieldset className="gc-bloco">
          <legend><b>4</b> Valores</legend>
          {campo('valores', 'cache', 'Cachê total (R$)', { dica: '10.000,00', obrig: true })}
          <div className="gc-seg" role="radiogroup" aria-label="Forma de pagamento">
            <label><input type="radio" name="modo" checked={f.valores.modo === 'sinal'} onChange={() => set('valores', 'modo', 'sinal')} />Sinal + saldo</label>
            <label><input type="radio" name="modo" checked={f.valores.modo === 'unico'} onChange={() => set('valores', 'modo', 'unico')} />Pagamento único</label>
          </div>
          {f.valores.modo === 'sinal' ? (
            <>
              <div className="gc-linha">
                {campo('valores', 'sinal', 'Sinal (R$)', { obrig: true })}
                {campo('valores', 'sinalData', 'Sinal até', { tipo: 'date', obrig: true })}
              </div>
              <div className="gc-linha">
                <div className="gc-campo gc-campo--calc"><span>Saldo</span><output>{cache && sinal != null && cache > sinal ? brl(cache - sinal) : '—'}</output></div>
                {campo('valores', 'saldoData', 'Saldo até', { tipo: 'date', obrig: true })}
              </div>
            </>
          ) : campo('valores', 'unicoData', 'Pagamento até', { tipo: 'date', obrig: true })}
          {campo('valores', 'pagamento', 'Conta ou chave Pix da Royals', { obrig: true, dica: 'banco, agência, conta ou chave Pix' })}
          <div className="gc-linha gc-linha--3">
            {campo('valores', 'multa', 'Multa de cancelamento (%)', { tipo: 'number', obrig: true })}
            {campo('valores', 'remarcarDias', 'Remarcar em até (dias)', { tipo: 'number', dica: 'opcional' })}
            {campo('valores', 'devolucaoDias', 'Devolução em até (dias)', { tipo: 'number', dica: 'opcional' })}
          </div>
          <label className="gc-check"><input type="checkbox" checked={f.extras.reservaComSinal} onChange={(e) => set('extras', 'reservaComSinal', e.target.checked)} />A data só fica reservada depois do sinal pago</label>
          <label className="gc-check"><input type="checkbox" checked={f.extras.saldoAntes} onChange={(e) => set('extras', 'saldoAntes', e.target.checked)} />Sem pagamento completo no prazo, o show não acontece (conta como cancelamento)</label>
        </fieldset>

        <fieldset className="gc-bloco">
          <legend><b>5</b> Viagem e estadia</legend>
          <div className="gc-linha">
            {campo('logistica', 'equipe', 'Pessoas que viajam', { tipo: 'number', dica: 'artista + equipe' })}
            {campo('logistica', 'origem', 'Saindo de', { dica: artista?.base })}
          </div>
          {quem('passagem', 'Passagens')}
          {quem('hospedagem', 'Hospedagem')}
          {quem('alimentacao', 'Alimentação')}
          {quem('translado', 'Translado')}
        </fieldset>

        <fieldset className="gc-bloco">
          <legend><b>6</b> Fechamento</legend>
          <label className="gc-campo" htmlFor="c-especiais"><span>Condições especiais (opcional)</span>
            <textarea id="c-especiais" rows={3} value={f.extras.especiais} onChange={(e) => set('extras', 'especiais', e.target.value)} placeholder="Algo combinado só neste show. Vira uma cláusula própria." /></label>
          <div className="gc-linha">
            {campo('assinatura', 'cidade', 'Assinado em', { obrig: true })}
            {campo('assinatura', 'data', 'Data da assinatura', { tipo: 'date', obrig: true })}
          </div>
        </fieldset>

        <div className="gc-acoes">
          <p className="gc-status" role="status" aria-live="polite">{aviso || (falta.length ? `${falta.length} ${falta.length === 1 ? 'campo obrigatório' : 'campos obrigatórios'} em amarelo na prévia.` : 'Tudo preenchido.')}</p>
          <div>
            <button type="submit" className="gc-btn gc-btn--ouro">Baixar PDF</button>
            <button type="button" className="gc-btn" onClick={copiar}>Copiar texto</button>
            <button type="button" className="gc-btn gc-btn--leve" onClick={limpar}>Limpar</button>
          </div>
          <p className="gc-dica">No Baixar PDF, escolha <b>Salvar como PDF</b> e deixe <b>Gráficos de plano de fundo</b> ligado. O contrato é montado neste aparelho e nada do que você digita fica guardado no servidor.</p>
        </div>
      </form>

      <div className="gc-previa" ref={previaRef} aria-label="Prévia do contrato">
        <div className="gc-folha" ref={docRef}>
          <Timbrado artista={artista} empresa={empresa} booking={booking} site={site}>
            <Contrato d={dados} artista={artista} empresa={empresa} />
          </Timbrado>
        </div>
      </div>
    </div>
  );
}
