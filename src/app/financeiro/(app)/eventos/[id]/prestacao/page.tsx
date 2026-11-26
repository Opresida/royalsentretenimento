import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Imprimir } from '@/components/financeiro/AoVivo';
import { STATUS_EVENTO, TAXA_ROTULO } from '@/lib/financeiro/calculo';
import { lerEvento } from '@/lib/financeiro/dados';
import { dataCurta, dataLonga, pct, reais } from '@/lib/financeiro/dinheiro';

export const metadata = { title: 'Prestação de contas' };

// Prestação de contas para imprimir ou salvar em PDF (papel branco, ouro escuro como no brandbook para documentos).
export default async function Prestacao({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const d = await lerEvento(Number((await params).id));
  if (!d) notFound();
  const { ev, lancs, conta: c } = d;
  const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Manaus' });
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

      <h2>Resumo</h2>
      <table><tbody>
        <tr><td>Aporte dos sócios</td><td className="n">{reais(c.aportes)}</td></tr>
        <tr><td>Receitas</td><td className="n">{reais(c.receitas)}</td></tr>
        <tr><td>Custos</td><td className="n">− {reais(c.custos)}</td></tr>
        {ev.taxaTipo !== 'nenhuma' ? <tr><td>Taxa de produção Royals ({ev.taxaTipo === 'fixo' ? 'valor fixo' : `${pct(ev.taxaValor)} ${TAXA_ROTULO[ev.taxaTipo].replace('% ', '')}`})</td><td className="n">− {reais(c.taxa)}</td></tr> : null}
        <tr><td><b>Lucro líquido</b></td><td className="n"><b>{reais(c.lucro)}</b></td></tr>
        {c.retornoBp !== null ? <tr><td>Retorno sobre o aporte</td><td className="n">{pct(c.retornoBp)}</td></tr> : null}
      </tbody></table>

      <h2>Divisão entre sócios</h2>
      <table>
        <thead><tr><th>Sócio</th><th className="n">Cota</th><th className="n">Aporte de volta</th><th className="n">Lucro</th><th className="n">Total a receber</th></tr></thead>
        <tbody>{c.divisao.map((x) => <tr key={x.id}><td>{x.nome}</td><td className="n">{pct(x.cotaBp)}</td><td className="n">{reais(x.aporte)}</td><td className="n">{reais(x.lucro)}</td><td className="n"><b>{reais(x.total)}</b></td></tr>)}</tbody>
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
