// Comprovante para o sócio: só se o link estiver ativo, o lançamento for do evento dele e a Royals tiver liberado.
import { and, eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { socioPorToken } from '@/lib/financeiro/dados';
import { servirComprovante } from '@/lib/financeiro/comprovante';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  const s = await socioPorToken(token);
  const lancId = Number(id);
  if (!s || !s.linkAtivo || !Number.isInteger(lancId)) return new Response('Não encontrado', { status: 404 });
  const db = await getDb();
  const [l] = await db.select().from(schema.finLancamentos)
    .where(and(eq(schema.finLancamentos.id, lancId), eq(schema.finLancamentos.eventoId, s.eventoId))).limit(1);
  if (!l || !l.mostrarAoSocio || !l.comprovanteId) return new Response('Não encontrado', { status: 404 });
  const [c] = await db.select().from(schema.finComprovantes).where(eq(schema.finComprovantes.id, l.comprovanteId)).limit(1);
  if (!c) return new Response('Não encontrado', { status: 404 });
  return servirComprovante(c);
}
