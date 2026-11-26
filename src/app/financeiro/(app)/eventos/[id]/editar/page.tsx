import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { excluirEvento } from '@/app/financeiro/acoes';
import { FormEvento } from '@/components/financeiro/Formularios';
import { lerEvento } from '@/lib/financeiro/dados';
import { pct, reais } from '@/lib/financeiro/dinheiro';

export const metadata = { title: 'Editar evento' };

export default async function EditarEvento({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const { id } = await params;
  const sp = await searchParams;
  const d = await lerEvento(Number(id));
  if (!d) notFound();
  const { ev } = d;
  const taxaValorTxt = ev.taxaTipo === 'fixo' ? reais(ev.taxaValor).replace('R$ ', '') : ev.taxaTipo === 'nenhuma' ? '' : pct(ev.taxaValor, 2).replace('%', '');
  return (
    <>
      <p className="fin-trilha"><Link href="/financeiro/eventos">Eventos</Link> / <Link href={`/financeiro/eventos/${ev.id}`}>{ev.nome}</Link> / Editar</p>
      <h1 className="fin-titulo" style={{ marginBottom: 24 }}>Editar evento</h1>
      <FormEvento ev={{ id: ev.id, nome: ev.nome, data: ev.data, local: ev.local, status: ev.status, taxaTipo: ev.taxaTipo, taxaValorTxt, observacoes: ev.observacoes }} />

      <details className="fin-bloco fin-detalhes" style={{ marginTop: 40, maxWidth: 640, borderTopColor: 'var(--vermelho)' }}>
        <summary className="fin-h2" style={{ fontSize: 14 }}>Excluir evento</summary>
        <form action={excluirEvento} className="fin-form" style={{ marginTop: 16 }}>
          <input type="hidden" name="id" value={ev.id} />
          <p className="fin-sub">Apaga o evento, os {d.lancs.length} lançamentos, os comprovantes ligados a eles e os {d.socios.length} sócios (os links param de funcionar). Não tem volta.</p>
          <label className="fin-campo"><span>Digite EXCLUIR para confirmar</span><input name="confirmar" autoComplete="off" /></label>
          {sp.erro === 'confirmar' ? <p className="fin-aviso fin-aviso--erro">Digite EXCLUIR para confirmar.</p> : null}
          <div><button className="fin-mini fin-mini--perigo">Excluir de vez</button></div>
        </form>
      </details>
    </>
  );
}
