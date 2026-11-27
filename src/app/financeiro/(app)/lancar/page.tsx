import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { excluirLancamento } from '@/app/financeiro/acoes';
import { FormLancamento } from '@/components/financeiro/FormLancamento';
import { CATEGORIAS } from '@/lib/financeiro/calculo';
import { lerEvento, lerLancamento, listarEventos } from '@/lib/financeiro/dados';
import { hojeManaus } from '@/lib/financeiro/dinheiro';

export const metadata = { title: 'Lançamento' };

// numeric do banco ("300.000", "0.7000") → texto do campo ("300", "0,70")
function virgula(n: string | null): string | undefined {
  if (n == null) return undefined;
  const v = Number(n);
  if (!Number.isFinite(v)) return undefined;
  const t = String(v);
  return (/\.\d$/.test(t) ? t + '0' : t).replace('.', ',');
}

// /financeiro/lancar                 → escolhe onde lançar (caixa ou evento aberto)
// /financeiro/lancar?evento=7        → novo lançamento no evento
// /financeiro/lancar?caixa=1         → novo lançamento no caixa da Royals
// /financeiro/lancar?id=12           → editar
export default async function Lancar({ searchParams }: { searchParams: Promise<{ evento?: string; caixa?: string; id?: string; tipo?: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const sp = await searchParams;

  if (sp.id) {
    const r = await lerLancamento(Number(sp.id));
    if (!r) notFound();
    const { l, comprovante } = r;
    if (l.origem === 'fechamento') redirect(l.eventoId ? `/financeiro/eventos/${l.eventoId}` : '/financeiro');
    const ev = l.eventoId ? await lerEvento(l.eventoId) : null;
    if (ev?.ev.status === 'fechado') redirect(`/financeiro/eventos/${ev.ev.id}?erro=fechado`);
    const cats = ev ? { custo: CATEGORIAS.custo, receita: CATEGORIAS.receita } : { custo: CATEGORIAS.caixaCusto, receita: CATEGORIAS.caixaReceita };
    return (
      <>
        <p className="fin-trilha">{ev ? <><Link href={`/financeiro/eventos/${ev.ev.id}`}>{ev.ev.nome}</Link> / Editar lançamento</> : <><Link href="/financeiro">Caixa Royals</Link> / Editar lançamento</>}</p>
        <h1 className="fin-titulo" style={{ marginBottom: 20 }}>Editar lançamento</h1>
        <FormLancamento eventoId={l.eventoId} eventoNome={ev?.ev.nome ?? 'Caixa Royals'} categorias={cats} socios={!!ev?.socios.length}
          inicial={{ id: l.id, tipo: l.tipo as 'custo' | 'receita', descricao: l.descricao, categoria: l.categoria, valor: (l.valor / 100).toFixed(2).replace('.', ','), quantidade: virgula(l.quantidade), valorUnitario: virgula(l.valorUnitario), quitado: l.quitado, data: l.data, vencimento: l.vencimento, mostrarAoSocio: l.mostrarAoSocio, comprovante }} />
        <details className="fin-detalhes" style={{ marginTop: 32, maxWidth: 640 }}>
          <summary className="fin-mini fin-mini--perigo">Excluir lançamento</summary>
          <form action={excluirLancamento} style={{ marginTop: 12 }}>
            <input type="hidden" name="id" value={l.id} />
            <p className="fin-sub" style={{ marginBottom: 10 }}>O lançamento e o comprovante dele somem. Fica registrado no histórico do evento.</p>
            <button className="fin-mini fin-mini--perigo">Confirmar exclusão</button>
          </form>
        </details>
      </>
    );
  }

  const tipo = sp.tipo === 'receita' ? 'receita' : 'custo';
  if (sp.evento) {
    const d = await lerEvento(Number(sp.evento));
    if (!d) notFound();
    if (d.ev.status === 'fechado') redirect(`/financeiro/eventos/${d.ev.id}?erro=fechado`);
    return (
      <>
        <p className="fin-trilha"><Link href={`/financeiro/eventos/${d.ev.id}`}>{d.ev.nome}</Link> / Novo lançamento</p>
        <h1 className="fin-titulo" style={{ marginBottom: 20 }}>Novo lançamento</h1>
        <FormLancamento eventoId={d.ev.id} eventoNome={d.ev.nome} categorias={{ custo: CATEGORIAS.custo, receita: CATEGORIAS.receita }} socios={d.socios.length > 0} inicial={{ tipo, data: hojeManaus() }} />
      </>
    );
  }

  if (sp.caixa) {
    return (
      <>
        <p className="fin-trilha"><Link href="/financeiro">Caixa Royals</Link> / Novo lançamento</p>
        <h1 className="fin-titulo" style={{ marginBottom: 20 }}>Novo lançamento</h1>
        <FormLancamento eventoId={null} eventoNome="Caixa Royals" categorias={{ custo: CATEGORIAS.caixaCusto, receita: CATEGORIAS.caixaReceita }} socios={false} inicial={{ tipo, data: hojeManaus() }} />
      </>
    );
  }

  // escolher onde lançar
  const abertos = (await listarEventos()).filter((e) => e.status !== 'fechado');
  return (
    <>
      <h1 className="fin-titulo" style={{ marginBottom: 8 }}>Lançar onde?</h1>
      <p className="fin-sub" style={{ marginBottom: 24 }}>No financeiro de um evento ou no caixa da própria Royals.</p>
      <div className="fin-eventos" style={{ maxWidth: 640 }}>
        {abertos.map((e) => (
          <Link key={e.id} href={`/financeiro/lancar?evento=${e.id}`} className="fin-ev" style={{ gridTemplateColumns: '1fr auto' }}>
            <span className="fin-ev__nome">{e.nome}</span><span className={`fin-selo fin-selo--${e.status}`}>{e.status === 'ao_vivo' ? 'Ao vivo' : 'Em montagem'}</span>
          </Link>
        ))}
        <Link href="/financeiro/lancar?caixa=1" className="fin-ev" style={{ gridTemplateColumns: '1fr auto', borderTopColor: 'var(--border-strong)' }}>
          <span className="fin-ev__nome">Caixa Royals</span><span className="fin-rot">aluguel, salários, impostos…</span>
        </Link>
      </div>
    </>
  );
}
