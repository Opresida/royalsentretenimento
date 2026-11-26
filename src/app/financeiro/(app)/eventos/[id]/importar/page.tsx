import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Importador } from '@/components/financeiro/Importador';
import { CATEGORIAS } from '@/lib/financeiro/calculo';
import { lerEvento } from '@/lib/financeiro/dados';

export const metadata = { title: 'Importar com IA' };
export const maxDuration = 180; // a leitura da IA pode levar 1–2 min num PDF grande

// Importar planilha ou PDF (pedido do Humberto, 26/11/2026): a IA organiza, o admin confere e só então lança.
export default async function Importar({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const d = await lerEvento(Number((await params).id));
  if (!d) notFound();
  const { ev } = d;
  if (ev.status === 'fechado') redirect(`/financeiro/eventos/${ev.id}?erro=fechado`);
  return (
    <>
      <p className="fin-trilha"><Link href="/financeiro/eventos">Eventos</Link> / <Link href={`/financeiro/eventos/${ev.id}`}>{ev.nome}</Link> / Importar</p>
      <div className="fin-cab" style={{ marginTop: 8 }}>
        <div>
          <p className="fin-rot fin-rot--ouro">Importar com IA</p>
          <h1 className="fin-titulo">Planilha ou PDF</h1>
          <p className="fin-sub">Suba o relatório da bilheteria, o fechamento do bar, uma nota ou extrato. A IA separa em lançamentos e você confere antes de entrar no evento.</p>
        </div>
      </div>
      <Importador eventoId={ev.id} categorias={{ custo: CATEGORIAS.custo, receita: CATEGORIAS.receita }} />
    </>
  );
}
