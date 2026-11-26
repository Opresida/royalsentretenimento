import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Imprimir } from '@/components/financeiro/AoVivo';
import { fontesDoEvento, STATUS_EVENTO } from '@/lib/financeiro/calculo';
import { lerEvento, sociosDaRoyals } from '@/lib/financeiro/dados';
import { linhasPagar, taxaTexto, totalADistribuir } from '@/components/financeiro/Fechamento';
import { dataCurta, dataLonga, pct, reais } from '@/lib/financeiro/dinheiro';

export const metadata = { title: 'Prestação de contas' };

// Prestação de contas para imprimir ou salvar em PDF (papel branco, ouro escuro como no brandbook para documentos).
export default async function Prestacao({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const d = await lerEvento(Number((await params).id));
  if (!d) notFound();
  const { ev, lancs, conta: c } = d;
  const socR = await sociosDaRoyals();
  const linhas = linhasPagar(c, socR);
  const totalPg = (v: number) => (v < 0 ? `deve repor ${reais(-v)}` : reais(v));
  const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Manaus' });
  const f = fontesDoEvento(lancs);
  const tabela = (tipo: string) => lancs.filter((l) => l.tipo === tipo).sort((a, b) => a.data.localeCompare(b.data));
  return (
    <div className="fin-prestacao" style={{ position: 'fixed', inset: 0, overflow: 'auto', zIndex: 100 }}>
      <div className="fin-nao-imprime"><Imprimir /><Link className="botao botao--secundario" href={`/financeiro/eventos/${ev.id}?aba=fechamento`}>Voltar</Link></div>
      <div className="fin-prestacao__topo">
        <div>
          <p style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase' }} className="ouro">Prestação de contas</p>
          <h1>{ev.nome}</h1>
          <p style={{ fontSize: 13 }}>{[ev.data && dataLonga(ev.data), ev.local, STATUS_EVENTO[ev.status]].filter(Boolean).join(' · ')} · emitido em {hoje}</p>
        </div>
        <img src="/marca/royals-gold-on-light.svg" alt="Royals Entretenimento" />
      </div>

      <h2>Conta do evento</h2>
      <table><tbody>
        <tr><td>Receitas (entradas)</td><td className="n">{reais(c.receitas)}</td></tr>
        <tr><td>− Custos (todas as saídas)</td><td className="n">− {reais(c.custos)}</td></tr>
        <tr><td><b>= Resultado bruto</b></td><td className="n"><b>{reais(c.resultado)}</b></td></tr>
        {ev.taxaTipo !== 'nenhuma' ? <tr><td>− Taxa de produção Royals ({taxaTexto(ev)})</td><td className="n">− {reais(c.taxa)}</td></tr> : null}
        <tr><td><b>= Lucro líquido</b></td><td className="n"><b>{reais(c.lucro)}</b></td></tr>
        <tr><td>+ Capital dos investidores devolvido (soma dos aportes)</td><td className="n">{reais(c.aportes)}</td></tr>
        {c.taxa ? <tr><td>+ Taxa de produção (vai para a Royals)</td><td className="n">{reais(c.taxa)}</td></tr> : null}
        <tr><td><b>= Total a distribuir</b></td><td className="n"><b>{reais(totalADistribuir(c))}</b></td></tr>
        {c.retornoBp !== null ? <tr><td>Retorno sobre o aporte</td><td className="n">{pct(c.retornoBp)}</td></tr> : null}
      </tbody></table>

      <h2>Bilheteria × Bar</h2>
      <table><tbody>
        <tr><td>Bilheteria</td><td className="n">{reais(f.bilheteria)}</td></tr>
        {f.camarote ? <tr><td>Camarote</td><td className="n">{reais(f.camarote)}</td></tr> : null}
        <tr><td>Bar · vendas</td><td className="n">{reais(f.bar.vendas)}</td></tr>
        <tr><td>Bar · custo</td><td className="n">− {reais(f.bar.custo)}</td></tr>
        <tr><td><b>Sobra do bar</b></td><td className="n"><b>{reais(f.bar.sobra)}</b>{f.bar.vendas > 0 ? ` (${Math.round((f.bar.sobra / f.bar.vendas) * 100)}%)` : ''}</td></tr>
        {f.patrocinio ? <tr><td>Patrocínio</td><td className="n">{reais(f.patrocinio)}</td></tr> : null}
        {f.outros ? <tr><td>Outras receitas</td><td className="n">{reais(f.outros)}</td></tr> : null}
      </tbody></table>

      <h2>Quanto pagar a cada um</h2>
      {c.lucro < 0 ? <p style={{ fontSize: 12, margin: '0 0 8px' }}>Prejuízo de {reais(-c.lucro)}, dividido pela cota de cada sócio: o total a pagar é o aporte menos a parte do prejuízo. Valor negativo = o sócio deve repor.</p> : null}
      <table>
        <thead><tr><th>Sócio</th><th className="n">Cota</th><th className="n">Aporte de volta</th><th className="n">{c.lucro >= 0 ? 'Parte do lucro' : 'Parte do prejuízo'}</th><th className="n">Total a pagar</th></tr></thead>
        <tbody>{linhas.map((x) => [
          <tr key={x.id}><td>{x.nome}{x.taxa ? ` (inclui taxa de produção ${reais(x.taxa)})` : ''}</td><td className="n">{x.cotaBp ? pct(x.cotaBp) : '—'}</td><td className="n">{reais(x.aporte)}</td><td className="n">{reais(x.lucro)}</td><td className="n"><b>{totalPg(x.total)}</b></td></tr>,
          ...x.interno.map((p) => <tr key={`i${x.id}-${p.id}`}><td style={{ paddingLeft: 18 }}>↳ {p.nome} ({pct(p.cotaBp, 2)} da Royals)</td><td /><td /><td /><td className="n">{totalPg(p.valor)}</td></tr>),
        ])}</tbody>
        <tfoot><tr><td><b>Total</b></td><td className="n">{pct(c.somaCotasBp)}</td><td className="n">{reais(c.aportes)}</td><td className="n">{reais(c.lucro)}</td><td className="n"><b>{reais(linhas.reduce((s2, x) => s2 + x.total, 0))}</b></td></tr></tfoot>
      </table>

      {(['receita', 'custo'] as const).map((t) => (
        <div key={t}>
          <h2>{t === 'receita' ? 'Receitas' : 'Custos'}</h2>
          <table>
            <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Situação</th><th>Comprov.</th><th className="n">Valor</th></tr></thead>
            <tbody>{tabela(t).map((l) => (
              <tr key={l.id}><td>{dataCurta(l.data)}</td><td>{l.descricao}</td><td>{l.categoria}</td><td>{l.quitado ? (t === 'custo' ? 'Pago' : 'Recebido') : t === 'custo' ? 'A pagar' : 'A receber'}</td><td>{l.comprovanteId ? 'sim' : '—'}</td><td className="n">{reais(l.valor)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ))}
      <p style={{ fontSize: 11, marginTop: 24 }}>Uma produção ROYALS · documento gerado pelo Financeiro Royals.</p>
    </div>
  );
}
