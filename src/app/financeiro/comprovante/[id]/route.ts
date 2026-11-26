// Comprovante para o admin (precisa estar logado). Nada é público: o arquivo sai do banco só para quem pode ver.
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { adminAtual } from '@/lib/financeiro/auth';
import { servirComprovante } from '@/lib/financeiro/comprovante';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminAtual())) return new Response('Não autorizado', { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new Response('Não encontrado', { status: 404 });
  const db = await getDb();
  const [c] = await db.select().from(schema.finComprovantes).where(eq(schema.finComprovantes.id, id)).limit(1);
  if (!c) return new Response('Não encontrado', { status: 404 });
  return servirComprovante(c);
}
