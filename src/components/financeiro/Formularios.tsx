'use client';
// Formulários pequenos do Financeiro: entrar, evento, sócio, equipe; e o copiar link do sócio.
import { useActionState, useState, type ChangeEvent } from 'react';
import { criarAdmin, definirSenha, entrar, salvarEvento, salvarSocio, salvarSociosRoyals, trocarSenha, type Estado } from '@/app/financeiro/acoes';

function Aviso({ e }: { e: Estado }) {
  if (e?.erro) return <p className="fin-aviso fin-aviso--erro" role="alert">{e.erro}</p>;
  if (e?.ok) return <p className="fin-aviso fin-aviso--ok" role="status">{e.ok}</p>;
  return null;
}

export function FormEntrar() {
  const [e, acao, enviando] = useActionState<Estado, FormData>(entrar, null);
  return (
    <form action={acao} className="fin-form">
      <label className="fin-campo"><span>Usuário</span><input name="usuario" autoComplete="username" autoCapitalize="none" required /></label>
      <label className="fin-campo"><span>Senha</span><input type="password" name="senha" autoComplete="current-password" required /></label>
      <Aviso e={e} />
      <button className="botao botao--lg" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}

type Ev = { id?: number; nome?: string; data?: string | null; local?: string | null; status?: string; taxaTipo?: string; taxaValorTxt?: string; observacoes?: string | null };

export function FormEvento({ ev }: { ev: Ev }) {
  const [e, acao, enviando] = useActionState<Estado, FormData>(salvarEvento, null);
  const [taxa, setTaxa] = useState(ev.taxaTipo ?? 'nenhuma');
  return (
    <form action={acao} className="fin-form">
      {ev.id ? <input type="hidden" name="id" value={ev.id} /> : null}
      <label className="fin-campo"><span>Nome do evento</span><input name="nome" defaultValue={ev.nome} required maxLength={80} placeholder="Ex.: Baile das Bruxas 2027" /></label>
      <div className="fin-linha2">
        <label className="fin-campo"><span>Data</span><input type="date" name="data" defaultValue={ev.data ?? ''} /></label>
        <label className="fin-campo"><span>Local</span><input name="local" defaultValue={ev.local ?? ''} maxLength={80} /></label>
      </div>
      {ev.status !== 'fechado' ? (
        <label className="fin-campo"><span>Situação</span>
          <select name="status" defaultValue={ev.status ?? 'montagem'}>
            <option value="montagem">Em montagem</option>
            <option value="ao_vivo">Ao vivo (acontecendo ou acertando contas)</option>
          </select>
        </label>
      ) : null}
      <fieldset className="fin-campo" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="fin-legenda" style={{ marginBottom: 8 }}>Taxa de produção da Royals (opcional)</legend>
        <select name="taxaTipo" value={taxa} onChange={(x) => setTaxa(x.target.value)}>
          <option value="nenhuma">Sem taxa</option>
          <option value="pct_receita">% sobre a receita do evento</option>
          <option value="pct_lucro">% sobre o lucro do evento</option>
          <option value="fixo">Valor fixo</option>
        </select>
        {taxa !== 'nenhuma' ? (
          <input name="taxaValor" inputMode="decimal" defaultValue={ev.taxaValorTxt} placeholder={taxa === 'fixo' ? 'Valor em R$' : 'Percentual, ex.: 10'} required style={{ marginTop: 10 }} />
        ) : null}
        <small>Sai antes da divisão entre os sócios e entra no caixa da Royals quando o evento for fechado.</small>
      </fieldset>
      <label className="fin-campo"><span>Observações</span><textarea name="observacoes" defaultValue={ev.observacoes ?? ''} maxLength={600} /></label>
      <Aviso e={e} />
      <div className="fin-salvar"><button className="botao botao--lg" disabled={enviando}>{enviando ? 'Salvando…' : ev.id ? 'Salvar evento' : 'Criar evento'}</button></div>
    </form>
  );
}

type So = { id?: number; nome?: string; contato?: string | null; aporteTxt?: string; cotaTxt?: string; eRoyals?: boolean };
type Pessoa = { nome: string; contato: string | null; eRoyals: boolean; origem: 'royals' | 'equipe' | 'socio' };
const GRUPO = { royals: 'A própria Royals', equipe: 'Equipe da Royals', socio: 'Já foram sócios' } as const;

export function FormSocio({ eventoId, s, onFeito, pessoas }: { eventoId: number; s?: So; onFeito?: () => void; pessoas?: Pessoa[] }) {
  const [e, acao, enviando] = useActionState<Estado, FormData>(async (p, f) => {
    const r = await salvarSocio(p, f);
    if (r?.ok) onFeito?.();
    return r;
  }, null);
  // escolher alguém já cadastrado preenche nome, WhatsApp e "é a Royals"; aporte e cota continuam a ser digitados
  const escolher = (x: ChangeEvent<HTMLSelectElement>) => {
    const p = pessoas?.[Number(x.target.value)];
    const form = x.target.form;
    if (!p || !form) return;
    (form.elements.namedItem('nome') as HTMLInputElement).value = p.nome;
    (form.elements.namedItem('contato') as HTMLInputElement).value = p.contato ?? '';
    (form.elements.namedItem('eRoyals') as HTMLInputElement).checked = p.eRoyals;
    (form.elements.namedItem('aporte') as HTMLInputElement).focus();
  };
  const grupos = (['royals', 'equipe', 'socio'] as const).map((g) => [g, (pessoas ?? []).map((p, i) => ({ ...p, i })).filter((p) => p.origem === g)] as const).filter(([, l]) => l.length);
  return (
    <form action={acao} className="fin-form" style={{ maxWidth: 'none' }}>
      <input type="hidden" name="eventoId" value={eventoId} />
      {s?.id ? <input type="hidden" name="id" value={s.id} /> : null}
      {!s?.id && grupos.length ? (
        <label className="fin-campo"><span>Escolher pessoa já cadastrada</span>
          <select defaultValue="" onChange={escolher} aria-describedby="fin-escolher-ajuda">
            <option value="" disabled>Selecione ou digite um nome novo abaixo</option>
            {grupos.map(([g, l]) => (
              <optgroup key={g} label={GRUPO[g]}>{l.map((p) => <option key={p.i} value={p.i}>{p.nome}{p.contato ? ` · ${p.contato}` : ''}</option>)}</optgroup>
            ))}
          </select>
          <small id="fin-escolher-ajuda">Quem está na Equipe e quem já foi sócio em outro evento aparece aqui. Aporte e cota são deste evento.</small>
        </label>
      ) : null}
      <label className="fin-campo"><span>Nome</span><input name="nome" defaultValue={s?.nome} required maxLength={60} /></label>
      <div className="fin-linha2">
        <label className="fin-campo"><span>Aporte (R$)</span><input name="aporte" inputMode="decimal" defaultValue={s?.aporteTxt} placeholder="0,00" /></label>
        <label className="fin-campo"><span>Cota combinada (%)</span><input name="cota" inputMode="decimal" defaultValue={s?.cotaTxt} placeholder="Ex.: 40" required /></label>
      </div>
      <label className="fin-campo"><span>WhatsApp (opcional)</span><input name="contato" inputMode="tel" defaultValue={s?.contato ?? ''} placeholder="Para enviar o link direto" maxLength={30} /></label>
      <label className="fin-check"><input type="checkbox" name="eRoyals" defaultChecked={s?.eRoyals} /><span>É a própria Royals<small>A parte do lucro entra no caixa da Royals no fechamento.</small></span></label>
      <Aviso e={e} />
      <div><button className="botao" disabled={enviando}>{enviando ? 'Salvando…' : s?.id ? 'Salvar sócio' : 'Adicionar sócio'}</button></div>
    </form>
  );
}

export function CopiarLink({ url, nome, evento, contato }: { url: string; nome: string; evento: string; contato?: string | null }) {
  const [copiado, setCopiado] = useState(false);
  const texto = `Olá, ${nome}! Aqui está o seu acesso ao financeiro do evento ${evento}, da Royals. Você acompanha tudo em tempo real por este link pessoal: ${url}`;
  const numero = (contato ?? '').replace(/\D/g, '');
  const zap = `https://wa.me/${numero ? (numero.length <= 11 ? '55' + numero : numero) : ''}?text=${encodeURIComponent(texto)}`;
  return (
    <>
      <div className="fin-copiar">
        <input readOnly value={url} aria-label={`Link de ${nome}`} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="fin-mini fin-mini--ouro" style={{ height: 44 }} onClick={async () => { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 1800); }}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <a className="fin-mini fin-mini--zap" href={zap} target="_blank" rel="noreferrer">Enviar no WhatsApp</a>
    </>
  );
}

export function FormEquipe() {
  const [e, acao, enviando] = useActionState<Estado, FormData>(criarAdmin, null);
  return (
    <form action={acao} className="fin-form">
      <div className="fin-linha2">
        <label className="fin-campo"><span>Nome</span><input name="nome" required maxLength={60} /></label>
        <label className="fin-campo"><span>Usuário</span><input name="usuario" required autoCapitalize="none" maxLength={32} /></label>
      </div>
      <small className="fin-sub" style={{ marginTop: -6 }}>A pessoa recebe um link de primeiro acesso e cria a própria senha. Nenhuma senha passa por mensagem.</small>
      <Aviso e={e} />
      <div><button className="botao" disabled={enviando}>{enviando ? 'Salvando…' : 'Gerar convite'}</button></div>
    </form>
  );
}

export function FormDefinirSenha({ convite }: { convite: string }) {
  const [e, acao, enviando] = useActionState<Estado, FormData>(definirSenha, null);
  return (
    <form action={acao} className="fin-form">
      <input type="hidden" name="convite" value={convite} />
      <label className="fin-campo"><span>Nova senha</span><input type="password" name="senha" autoComplete="new-password" required minLength={10} /><small>Pelo menos 10 caracteres.</small></label>
      <label className="fin-campo"><span>Repita a senha</span><input type="password" name="confirmar" autoComplete="new-password" required minLength={10} /></label>
      <Aviso e={e} />
      <button className="botao botao--lg" disabled={enviando}>{enviando ? 'Salvando…' : 'Criar senha e entrar'}</button>
    </form>
  );
}

export function CopiarTexto({ valor, rotulo }: { valor: string; rotulo: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="fin-copiar" style={{ marginTop: 8 }}>
      <input readOnly value={valor} aria-label={rotulo} onFocus={(x) => x.currentTarget.select()} />
      <button type="button" className="fin-mini fin-mini--ouro" style={{ height: 44 }} onClick={async () => { await navigator.clipboard.writeText(valor); setOk(true); setTimeout(() => setOk(false), 1800); }}>{ok ? 'Copiado' : 'Copiar'}</button>
    </div>
  );
}

export function FormSenha() {
  const [e, acao, enviando] = useActionState<Estado, FormData>(trocarSenha, null);
  return (
    <form action={acao} className="fin-form">
      <label className="fin-campo"><span>Senha atual</span><input type="password" name="atual" autoComplete="current-password" required /></label>
      <label className="fin-campo"><span>Nova senha</span><input type="password" name="nova" autoComplete="new-password" required minLength={10} /></label>
      <Aviso e={e} />
      <div><button className="botao botao--secundario" disabled={enviando}>{enviando ? 'Salvando…' : 'Trocar senha'}</button></div>
    </form>
  );
}

// Sócios da Royals (página Equipe): a % de cada um no Caixa Royals. Vazio = não é sócio. A soma aparece ao vivo.
const bpTxt = (bp: number) => (bp % 100 === 0 ? String(bp / 100) : (bp / 100).toFixed(2).replace('.', ','));
const txtBp = (t: string) => {
  const n = Number(t.replace('%', '').replace(',', '.').trim());
  return t.trim() && Number.isFinite(n) ? Math.round(n * 100) : null;
};

export function FormSociosRoyals({ pessoas }: { pessoas: { id: number; nome: string; cotaBp: number | null; pendente: boolean }[] }) {
  const [e, acao, enviando] = useActionState<Estado, FormData>(salvarSociosRoyals, null);
  const [vals, setVals] = useState<Record<number, string>>(() => Object.fromEntries(pessoas.map((p) => [p.id, p.cotaBp ? bpTxt(p.cotaBp) : ''])));
  const marcados = pessoas.filter((p) => (vals[p.id] ?? '').trim());
  const soma = marcados.reduce((s, p) => s + (txtBp(vals[p.id]) ?? 0), 0);
  const invalido = marcados.some((p) => { const b = txtBp(vals[p.id]); return b === null || b < 0 || b > 10000; });
  function dividirIgual() {
    const alvo = marcados.length ? marcados : pessoas;
    if (!alvo.length) return;
    const base = Math.floor(10000 / alvo.length);
    const resto = 10000 - base * alvo.length;
    const novo: Record<number, string> = Object.fromEntries(pessoas.map((p) => [p.id, '']));
    alvo.forEach((p, i) => { novo[p.id] = bpTxt(base + (i >= alvo.length - resto ? 1 : 0)); });
    setVals(novo);
  }
  return (
    <form action={acao} className="fin-form">
      <div className="fin-divisao-form">
        {pessoas.map((p) => (
          <label key={p.id} className="fin-divisao-form__linha">
            <span>{p.nome}{p.pendente ? <small className="ambar"> ainda não criou a senha</small> : null}</span>
            <span className="fin-divisao-form__pct">
              <input name={`cota_${p.id}`} inputMode="decimal" value={vals[p.id] ?? ''} placeholder="—" aria-label={`% de ${p.nome}`}
                onChange={(x) => setVals((v) => ({ ...v, [p.id]: x.target.value }))} />%
            </span>
          </label>
        ))}
      </div>
      <p className={`fin-aviso ${!marcados.length ? '' : soma === 10000 && !invalido ? 'fin-aviso--ok' : 'fin-aviso--ambar'}`} role="status">
        {!marcados.length ? 'Ninguém marcado: o Caixa Royals não mostra divisão.' : invalido ? 'Confira os números: cada % vai de 0 a 100.' : soma === 10000 ? `Soma 100%. Fechado.` : `Soma ${bpTxt(soma)}%. Precisa fechar 100%.`}
      </p>
      <Aviso e={e} />
      <div className="fin-linha-botoes">
        <button type="button" className="botao botao--secundario" onClick={dividirIgual}>Dividir igual</button>
        <button className="botao" disabled={enviando || invalido || (marcados.length > 0 && soma !== 10000)}>{enviando ? 'Salvando…' : 'Salvar divisão'}</button>
      </div>
    </form>
  );
}
