// Leituras do Financeiro (só servidor). As contas saem de calculo.ts.
import { and, asc, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { calcular, type Conta } from './calculo';

const { finEventos, finLancamentos, finSocios, finHistorico, finAdmins } = schema;

export async function listarEventos() {
  const db = await getDb();
  const [eventos, lancs, socios] = await Promise.all([
    db.select().from(finEventos).orderBy(desc(finEventos.data), desc(finEventos.id)),
    db.select({ eventoId: finLancamentos.eventoId, tipo: finLancamentos.tipo, valor: finLancamentos.valor, quitado: finLancamentos.quitado })
      .from(finLancamentos).where(isNotNull(finLancamentos.eventoId)),
    db.select().from(finSocios),
  ]);
  return eventos.map((e) => {
    const conta = calcular(e, lancs.filter((l) => l.eventoId === e.id), socios.filter((s) => s.eventoId === e.id));
    return { ...e, conta, nSocios: socios.filter((s) => s.eventoId === e.id).length };
  });
}

export async function lancamentosDoCaixa() {
  const db = await getDb();
  return db.select().from(finLancamentos).where(isNull(finLancamentos.eventoId)).orderBy(desc(finLancamentos.data), desc(finLancamentos.id));
}

export async function lerEvento(id: number) {
  const db = await getDb();
  const [ev] = await db.select().from(finEventos).where(eq(finEventos.id, id)).limit(1);
  if (!ev) return null;
  const [lancs, socios, historico] = await Promise.all([
    db.select().from(finLancamentos).where(eq(finLancamentos.eventoId, id)).orderBy(desc(finLancamentos.data), desc(finLancamentos.id)),
    db.select().from(finSocios).where(eq(finSocios.eventoId, id)).orderBy(desc(finSocios.cotaBp), asc(finSocios.id)),
    db.select({ id: finHistorico.id, acao: finHistorico.acao, detalhe: finHistorico.detalhe, em: finHistorico.em, admin: finAdmins.nome })
      .from(finHistorico).leftJoin(finAdmins, eq(finAdmins.id, finHistorico.adminId))
      .where(eq(finHistorico.eventoId, id)).orderBy(desc(finHistorico.id)).limit(30),
  ]);
  const conta: Conta = calcular(ev, lancs, socios);
  return { ev, lancs, socios, historico, conta };
}

export async function lerLancamento(id: number) {
  const db = await getDb();
  const [l] = await db.select().from(finLancamentos).where(eq(finLancamentos.id, id)).limit(1);
  if (!l) return null;
  let comprovante: { id: number; nome: string; mime: string; tamanho: number } | null = null;
  if (l.comprovanteId) {
    const [c] = await db.select({ id: schema.finComprovantes.id, nome: schema.finComprovantes.nome, mime: schema.finComprovantes.mime, tamanho: schema.finComprovantes.tamanho })
      .from(schema.finComprovantes).where(eq(schema.finComprovantes.id, l.comprovanteId)).limit(1);
    comprovante = c ?? null;
  }
  return { l, comprovante };
}

export async function socioPorToken(token: string) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const db = await getDb();
  const [s] = await db.select().from(finSocios).where(and(eq(finSocios.token, token))).limit(1);
  return s ?? null;
}

export async function listarAdmins() {
  const db = await getDb();
  return db.select({ id: finAdmins.id, usuario: finAdmins.usuario, nome: finAdmins.nome, ativo: finAdmins.ativo, criadoEm: finAdmins.criadoEm })
    .from(finAdmins).orderBy(asc(finAdmins.id));
}
