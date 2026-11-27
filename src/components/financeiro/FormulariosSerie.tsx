'use client';
// Formulários da série recorrente: a série, os sócios dela (modelo das próximas edições) e os custos fixos.
import { useActionState, useState, type ChangeEvent } from 'react';
import { salvarCustoSerie, salvarSerie, salvarSocioSerie, type Estado } from '@/app/financeiro/acoes';
import { lerNumero, qtdTxt, reais, totalUnidade, unitTxt } from '@/lib/financeiro/dinheiro';

function Aviso({ e }: { e: Estado }) {
  if (e?.erro) return <p className="fin-aviso fin-aviso--erro" role="alert">{e.erro}</p>;
  if (e?.ok) return <p className="fin-aviso fin-aviso--ok" role="status">{e.ok}</p>;
  return null;
}

type Se = { id?: number; nome?: string; frequencia?: string; primeiraData?: string | null; local?: string | null; taxaTipo?: string; taxaValorTxt?: string; observacoes?: string | null; ativa?: boolean };

export function FormSerie({ s }: { s: Se }) {
  const [e, acao, enviando] = useActionState<Estado, FormData>(salvarSerie, null);
  const [taxa, setTaxa] = useState(s.taxaTipo ?? 'nenhuma');
  return (
    <form action={acao} className="fin-form">
      {s.id ? <input type="hidden" name="id" value={s.id} /> : null}
      <label className="fin-campo"><span>Nome da série</span><input name="nome" defaultValue={s.nome} required maxLength={60} placeholder="Ex.: Varandinha" /></label>
      <fieldset className="fin-campo" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="fin-legenda" style={{ marginBottom: 8 }}>Frequência</legend>
        <div className="fin-alternar fin-alternar--3" role="radiogroup" aria-label="Frequência">
          {[['semanal', 'Semanal'], ['quinzenal', 'Quinzenal'], ['mensal', 'Mensal']].map(([v, t]) => (
            <label key={v}><input type="radio" name="frequencia" value={v} defaultChecked={(s.frequencia ?? 'semanal') === v} /><span>{t}</span></label>
          ))}
        </div>
        <small>Dá para trocar quando quiser (ex.: de quinzenal para semanal). Vale para as próximas edições.</small>
      </fieldset>
      <div className="fin-linha2">
        <label className="fin-campo"><span>Data da 1ª edição</span><input type="date" name="primeiraData" defaultValue={s.primeiraData ?? ''} /></label>
        <label className="fin-campo"><span>Local</span><input name="local" defaultValue={s.local ?? ''} maxLength={80} /></label>
      </div>
      <fieldset className="fin-campo" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="fin-legenda" style={{ marginBottom: 8 }}>Taxa de produção da Royals (opcional)</legend>
        <select name="taxaTipo" value={taxa} onChange={(x) => setTaxa(x.target.value)}>
          <option value="nenhuma">Sem taxa</option>
          <option value="pct_receita">% sobre a receita de cada edição</option>
          <option value="pct_lucro">% sobre o lucro de cada edição</option>
          <option value="fixo">Valor fixo por edição</option>
        </select>
        {taxa !== 'nenhuma' ? <input name="taxaValor" inputMode="decimal" defaultValue={s.taxaValorTxt} placeholder={taxa === 'fixo' ? 'Valor em R$' : 'Percentual, ex.: 10'} required style={{ marginTop: 10 }} /> : null}
      </fieldset>
      {s.id ? (
        <label className="fin-campo"><span>Situação da série</span>
          <select name="ativa" defaultValue={s.ativa === false ? 'nao' : 'sim'}>
            <option value="sim">Ativa (continua acontecendo)</option>
            <option value="nao">Encerrada (some o botão “Próxima edição”)</option>
          </select>
        </label>
      ) : null}
      <label className="fin-campo"><span>Observações</span><textarea name="observacoes" defaultValue={s.observacoes ?? ''} maxLength={600} /></label>
      <Aviso e={e} />
      <div className="fin-salvar"><button className="botao botao--lg" disabled={enviando}>{enviando ? 'Salvando…' : s.id ? 'Salvar série' : 'Criar série'}</button></div>
    </form>
  );
}

type So = { id?: number; nome?: string; contato?: string | null; aporteTxt?: string; cotaTxt?: string; eRoyals?: boolean };
type Pessoa = { nome: string; contato: string | null; eRoyals: boolean; origem: 'royals' | 'equipe' | 'socio' };
const GRUPO = { royals: 'A própria Royals', equipe: 'Equipe da Royals', socio: 'Já foram sócios' } as const;

export function FormSocioSerie({ serieId, s, pessoas }: { serieId: number; s?: So; pessoas?: Pessoa[] }) {
  const [e, acao, enviando] = useActionState<Estado, FormData>(salvarSocioSerie, null);
  const escolher = (x: ChangeEvent<HTMLSelectElement>) => {
    const p = pessoas?.[Number(x.target.value)];
    const form = x.target.form;
    if (!p || !form) return;
    (form.elements.namedItem('nome') as HTMLInputElement).value = p.nome;
    (form.elements.namedItem('contato') as HTMLInputElement).value = p.contato ?? '';
    (form.elements.namedItem('eRoyals') as HTMLInputElement).checked = p.eRoyals;
    (form.elements.namedItem('cota') as HTMLInputElement).focus();
  };
  const grupos = (['royals', 'equipe', 'socio'] as const).map((g) => [g, (pessoas ?? []).map((p, i) => ({ ...p, i })).filter((p) => p.origem === g)] as const).filter(([, l]) => l.length);
  return (
    <form action={acao} className="fin-form" style={{ maxWidth: 'none' }}>
      <input type="hidden" name="serieId" value={serieId} />
      {s?.id ? <input type="hidden" name="id" value={s.id} /> : null}
      {!s?.id && grupos.length ? (
        <label className="fin-campo"><span>Escolher pessoa já cadastrada</span>
          <select defaultValue="" onChange={escolher}>
            <option value="" disabled>Selecione ou digite um nome novo abaixo</option>
            {grupos.map(([g, l]) => <optgroup key={g} label={GRUPO[g]}>{l.map((p) => <option key={p.i} value={p.i}>{p.nome}{p.contato ? ` · ${p.contato}` : ''}</option>)}</optgroup>)}
          </select>
        </label>
      ) : null}
      <label className="fin-campo"><span>Nome</span><input name="nome" defaultValue={s?.nome} required maxLength={60} /></label>
      <div className="fin-linha2">
        <label className="fin-campo"><span>Aporte por edição (R$)</span><input name="aporte" inputMode="decimal" defaultValue={s?.aporteTxt} placeholder="0,00" /></label>
        <label className="fin-campo"><span>Cota combinada (%)</span><input name="cota" inputMode="decimal" defaultValue={s?.cotaTxt} placeholder="Ex.: 40" required /></label>
      </div>
      <label className="fin-campo"><span>WhatsApp (opcional)</span><input name="contato" inputMode="tel" defaultValue={s?.contato ?? ''} placeholder="Para enviar o link direto" maxLength={30} /></label>
      <label className="fin-check"><input type="checkbox" name="eRoyals" defaultChecked={s?.eRoyals} /><span>É a própria Royals<small>A parte do lucro de cada edição entra no caixa da Royals no fechamento.</small></span></label>
      <Aviso e={e} />
      <div><button className="botao" disabled={enviando}>{enviando ? 'Salvando…' : s?.id ? 'Salvar sócio' : 'Adicionar sócio'}</button></div>
    </form>
  );
}

type Cu = { id?: number; descricao?: string; categoria?: string; valorTxt?: string; quantidade?: string; valorUnitario?: string };

export function FormCustoSerie({ serieId, categorias, c }: { serieId: number; categorias: string[]; c?: Cu }) {
  const [e, acao, enviando] = useActionState<Estado, FormData>(salvarCustoSerie, null);
  const [modo, setModo] = useState<'total' | 'unidade'>(c?.quantidade && c?.valorUnitario ? 'unidade' : 'total');
  const [unit, setUnit] = useState(c?.valorUnitario ?? '');
  const [qtd, setQtd] = useState(c?.quantidade ?? '');
  const u = lerNumero(unit), q = lerNumero(qtd);
  const ok = Number.isFinite(u) && u > 0 && Number.isFinite(q) && q > 0;
  const nomeGrupo = `modo-${c?.id ?? 'novo'}`;
  return (
    <form action={acao} className="fin-form" style={{ maxWidth: 'none' }}>
      <input type="hidden" name="serieId" value={serieId} />
      {c?.id ? <input type="hidden" name="id" value={c.id} /> : null}
      <input type="hidden" name="modo" value={modo} />
      <label className="fin-campo"><span>Descrição</span><input name="descricao" defaultValue={c?.descricao} required maxLength={140} placeholder="Ex.: DJ residente · Pulseira" /></label>
      <label className="fin-campo"><span>Categoria</span>
        <select name="categoria" defaultValue={c?.categoria ?? categorias[0]}>{categorias.map((x) => <option key={x} value={x}>{x}</option>)}</select>
      </label>
      <div className="fin-alternar fin-alternar--baixo" role="radiogroup" aria-label="Como lançar o valor">
        <label><input type="radio" name={nomeGrupo} checked={modo === 'total'} onChange={() => setModo('total')} /><span>Valor total</span></label>
        <label><input type="radio" name={nomeGrupo} checked={modo === 'unidade'} onChange={() => setModo('unidade')} /><span>Por unidade</span></label>
      </div>
      {modo === 'total' ? (
        <label className="fin-campo"><span>Valor por edição (R$)</span><input name="valor" inputMode="decimal" defaultValue={c?.valorTxt} placeholder="0,00" required /></label>
      ) : (
        <div className="fin-unidade">
          <div className="fin-linha2">
            <label className="fin-campo"><span>Valor unitário (R$)</span><input name="valorUnitario" inputMode="decimal" value={unit} onChange={(x) => setUnit(x.target.value)} placeholder="0,70" required /></label>
            <label className="fin-campo"><span>Quantidade</span><input name="quantidade" inputMode="decimal" value={qtd} onChange={(x) => setQtd(x.target.value)} placeholder="300" required /></label>
          </div>
          <div className="fin-unidade__total" aria-live="polite"><span>{ok ? `${qtdTxt(q)} × ${unitTxt(u)}` : 'Valor unitário × quantidade'}</span><b>{ok ? reais(totalUnidade(q, u)) : 'R$ 0,00'}</b></div>
        </div>
      )}
      <Aviso e={e} />
      <div><button className="botao" disabled={enviando}>{enviando ? 'Salvando…' : c?.id ? 'Salvar custo' : 'Adicionar custo fixo'}</button></div>
    </form>
  );
}
