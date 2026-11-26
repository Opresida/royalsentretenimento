// Fechamento = "quanto pagar a cada um" (pedido do Humberto, 26/11/2026, msg 4860).
// A conta com rótulos explícitos (bruto → taxa → líquido → capital devolvido → total a distribuir) e a tabela
// por sócio: aporte de volta + parte do lucro (ou − parte do prejuízo) = total a pagar. A linha da Royals soma a
// taxa de produção e, logo abaixo, divide o total entre os sócios da Royals (cota da página Equipe).
import Link from 'next/link';
import { dividirPorCota, TAXA_ROTULO, type Conta } from '@/lib/financeiro/calculo';
import type { SocioRoyals } from '@/lib/financeiro/dados';
import { pct, reais } from '@/lib/financeiro/dinheiro';

export type LinhaPagar = {
  id: number; nome: string; eRoyals: boolean; cotaBp: number; aporte: number; lucro: number; taxa: number; total: number;
  interno: { id: number; nome: string; cotaBp: number; valor: number }[];
};
export type SociosRoyalsInfo = { configurada: boolean; somaBp: number; lista: SocioRoyals[] };

export function taxaTexto(ev: { taxaTipo: string; taxaValor: number }) {
  return ev.taxaTipo === 'fixo' ? 'valor fixo' : `${pct(ev.taxaValor)} ${TAXA_ROTULO[ev.taxaTipo]?.replace('% ', '') ?? ''}`;
}

/** Aportes + lucro líquido + taxa (= aportes + resultado bruto): o dinheiro do evento a ser pago aos sócios e à Royals. */
export function totalADistribuir(c: Conta) {
  return c.aportes + c.lucro + c.taxa;
}

/** Linhas da tabela "Quanto pagar a cada um". A taxa vai na (primeira) linha da Royals; sem sócio Royals, vira uma linha própria. */
export function linhasPagar(c: Conta, socR: SociosRoyalsInfo | null): LinhaPagar[] {
  const linhas: LinhaPagar[] = c.divisao.map((x) => ({ ...x, taxa: 0, interno: [] }));
  if (c.taxa) {
    const r = linhas.find((l) => l.eRoyals);
    if (r) { r.taxa = c.taxa; r.total += c.taxa; }
    else linhas.push({ id: 0, nome: 'Royals Entretenimento (taxa de produção)', eRoyals: true, cotaBp: 0, aporte: 0, lucro: 0, taxa: c.taxa, total: c.taxa, interno: [] });
  }
  if (socR?.configurada) {
    const cotas = socR.lista.map((s) => s.cotaBp ?? 0);
    for (const l of linhas.filter((x) => x.eRoyals)) {
      const partes = dividirPorCota(l.total, cotas);
      l.interno = socR.lista.map((s, i) => ({ id: s.id, nome: s.nome, cotaBp: s.cotaBp ?? 0, valor: partes[i] }));
    }
  }
  return linhas;
}

export function TotalPagar({ v }: { v: number }) {
  return v < 0 ? <b className="vermelho">deve repor {reais(-v)}</b> : <b>{reais(v)}</b>;
}

/** A conta do fechamento, linha a linha (página do evento e página do sócio). */
export function ContaFechamento({ c, ev, capital = true }: { c: Conta; ev: { taxaTipo: string; taxaValor: number }; capital?: boolean }) {
  return (
    <div className="fin-conta">
      <div><span>Receitas <small className="fin-sub">(entradas)</small></span><b className="verde">{reais(c.receitas)}</b></div>
      <div><span>− Custos <small className="fin-sub">(todas as saídas)</small></span><b className="vermelho">{reais(c.custos)}</b></div>
      <div className="fin-conta__sub"><span>= Resultado bruto</span><b className={c.resultado >= 0 ? '' : 'vermelho'}>{reais(c.resultado)}</b></div>
      {ev.taxaTipo !== 'nenhuma' ? <div><span>− Taxa de produção Royals <small className="fin-sub">({taxaTexto(ev)})</small></span><b className="ouro">{reais(c.taxa)}</b></div> : null}
      <div className="fin-conta__total"><span>= Lucro líquido</span><span className={c.lucro >= 0 ? 'verde' : 'vermelho'}>{reais(c.lucro)}</span></div>
      {capital ? (
        <>
          <div><span>+ Capital dos investidores devolvido <small className="fin-sub">(soma dos aportes)</small></span><b>{reais(c.aportes)}</b></div>
          {c.taxa ? <div><span>+ Taxa de produção <small className="fin-sub">(vai para a Royals)</small></span><b className="ouro">{reais(c.taxa)}</b></div> : null}
          <div className="fin-conta__total"><span>= Total a distribuir</span><span>{reais(totalADistribuir(c))}</span></div>
        </>
      ) : null}
    </div>
  );
}

/** Tabela "Quanto pagar a cada um" (página do evento). */
export function QuantoPagar({ c, linhas, socR }: { c: Conta; linhas: LinhaPagar[]; socR: SociosRoyalsInfo | null }) {
  const soma = linhas.reduce((s, l) => s + l.total, 0);
  const temRoyals = linhas.some((l) => l.eRoyals);
  return (
    <>
      {c.lucro < 0 ? <p className="fin-aviso fin-aviso--ambar" style={{ marginBottom: 14 }}>O evento deu prejuízo de {reais(-c.lucro)}. Ele sai de cada sócio na mesma proporção da cota: o total a pagar é o aporte menos a parte do prejuízo. Quem fica negativo deve repor a diferença.</p> : null}
      <div className="fin-tabela-rolo fin-pagar-caixa">
        <table className="fin-tabela fin-tabela--cartoes fin-pagar">
          <thead><tr><th>Sócio</th><th>Cota</th><th>Aporte de volta</th><th>{c.lucro >= 0 ? 'Parte do lucro' : 'Parte do prejuízo'}</th><th>Total a pagar</th></tr></thead>
          <tbody>{linhas.map((x) => <LinhaSocio key={x.id} x={x} />)}</tbody>
          <tfoot><tr><td>Total</td><td data-r="Cota" className={c.cotasOk ? '' : 'ambar'}>{pct(c.somaCotasBp)}</td><td data-r="Aporte de volta">{reais(c.aportes)}</td><td data-r={c.lucro >= 0 ? 'Lucro' : 'Prejuízo'}>{reais(c.lucro)}{c.taxa ? <small className="fin-sub"> + taxa {reais(c.taxa)}</small> : null}</td><td data-r="Total a pagar">{reais(soma)}</td></tr></tfoot>
        </table>
      </div>
      {c.cotasOk && soma !== totalADistribuir(c) ? <p className="fin-aviso fin-aviso--ambar" style={{ marginTop: 10 }}>A soma da tabela ({reais(soma)}) não bate com o total a distribuir ({reais(totalADistribuir(c))}).</p> : null}
      {temRoyals && !socR?.configurada ? <p className="fin-sub" style={{ marginTop: 12, fontSize: 13 }}>A parte da Royals ainda não está dividida entre os sócios da Royals: <Link className="ouro" href="/financeiro/equipe#socios-royals">configure a divisão na Equipe</Link>.</p> : null}
      {temRoyals && socR?.configurada && socR.somaBp !== 10000 ? <p className="fin-aviso fin-aviso--ambar" style={{ marginTop: 10 }}>As % dos sócios da Royals somam {pct(socR.somaBp, 2)}. <Link href="/financeiro/equipe#socios-royals">Ajuste na Equipe</Link>.</p> : null}
    </>
  );
}

function LinhaSocio({ x }: { x: LinhaPagar }) {
  return (
    <>
      <tr className={x.eRoyals ? 'fin-pagar__royals' : undefined}>
        <td>{x.nome}{x.eRoyals && !/royals/i.test(x.nome) ? <span className="ouro"> · Royals</span> : null}{x.taxa ? <small className="fin-sub" style={{ display: 'block' }}>inclui a taxa de produção {reais(x.taxa)}</small> : null}</td>
        <td data-r="Cota">{x.cotaBp ? pct(x.cotaBp) : '—'}</td>
        <td data-r="Aporte de volta">{reais(x.aporte)}</td>
        <td data-r={x.lucro >= 0 ? 'Parte do lucro' : 'Parte do prejuízo'} className={x.lucro > 0 ? 'verde' : x.lucro < 0 ? 'vermelho' : ''}>{x.lucro ? reais(x.lucro, { sinal: true }) : reais(0)}</td>
        <td data-r="Total a pagar" className="fin-pagar__total"><TotalPagar v={x.total} /></td>
      </tr>
      {x.interno.map((p) => (
        <tr key={`i${p.id}`} className="fin-pagar__interno">
          <td>↳ {p.nome}</td>
          <td data-r="Da Royals">{pct(p.cotaBp, 2)}</td>
          <td className="fin-pagar__vazio" />
          <td className="fin-pagar__vazio" />
          <td data-r="Recebe" className="fin-pagar__total"><TotalPagar v={p.valor} /></td>
        </tr>
      ))}
    </>
  );
}
