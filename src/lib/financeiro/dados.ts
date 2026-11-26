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

// Pessoas que podem ser escolhidas como sócio num evento (pedido do Humberto, 26/11/2026): quem está na Equipe
// (ativos, inclusive quem ainda não criou a senha) + quem já foi sócio em outro evento. Sem repetir nome.
export type PessoaConhecida = { nome: string; contato: string | null; eRoyals: boolean; origem: 'royals' | 'equipe' | 'socio' };

export async function pessoasConhecidas(eventoId?: number): Promise<PessoaConhecida[]> {
  const db = await getDb();
  const [admins, socios] = await Promise.all([
    db.select({ nome: finAdmins.nome }).from(finAdmins).where(eq(finAdmins.ativo, true)).orderBy(asc(finAdmins.nome)),
    db.select({ nome: finSocios.nome, contato: finSocios.contato, eRoyals: finSocios.eRoyals, eventoId: finSocios.eventoId, id: finSocios.id })
      .from(finSocios).orderBy(desc(finSocios.id)),
  ]);
  const chave = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
  const jaNoEvento = new Set(socios.filter((s) => s.eventoId === eventoId).map((s) => chave(s.nome)));
  const mapa = new Map<string, PessoaConhecida>();
  // o sócio mais recente traz o WhatsApp mais atual
  for (const s of socios) {
    const k = chave(s.nome);
    if (!k || jaNoEvento.has(k)) continue;
    const atual = mapa.get(k);
    if (!atual) mapa.set(k, { nome: s.nome.trim(), contato: s.contato, eRoyals: s.eRoyals, origem: 'socio' });
    else if (!atual.contato && s.contato) atual.contato = s.contato;
  }
  for (const a of admins) {
    const k = chave(a.nome);
    if (!k || jaNoEvento.has(k)) continue;
    const atual = mapa.get(k);
    if (atual) atual.origem = 'equipe';
    else mapa.set(k, { nome: a.nome.trim(), contato: null, eRoyals: false, origem: 'equipe' });
  }
  const lista = [...mapa.values()];
  const ordem = { royals: 0, equipe: 1, socio: 2 };
  // a própria Royals sempre dá pra escolher (marca "É a própria Royals" sozinho), a não ser que já seja sócia deste evento
  const royalsNoEvento = socios.some((s) => s.eventoId === eventoId && s.eRoyals);
  if (!royalsNoEvento && !lista.some((p) => p.eRoyals)) lista.push({ nome: 'Royals Entretenimento', contato: null, eRoyals: true, origem: 'royals' });
  for (const p of lista) if (p.eRoyals) p.origem = 'royals';
  return lista.filter((p) => !(royalsNoEvento && p.eRoyals)).sort((a, b) => ordem[a.origem] - ordem[b.origem] || a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function listarAdmins() {
  const db = await getDb();
  return db.select({ id: finAdmins.id, usuario: finAdmins.usuario, nome: finAdmins.nome, ativo: finAdmins.ativo, criadoEm: finAdmins.criadoEm })
    .from(finAdmins).orderBy(asc(finAdmins.id));
}

export type SocioRoyals = { id: number; nome: string; usuario: string; cotaBp: number | null; pendente: boolean };

/** Sócios da Royals (Equipe ativa com % marcada na página Equipe). Sem divisão configurada, `configurada` é false e
 *  a lista traz a Equipe ativa inteira: é quem acompanha os eventos pelo login. */
export async function sociosDaRoyals(): Promise<{ configurada: boolean; somaBp: number; lista: SocioRoyals[] }> {
  const db = await getDb();
  const admins = await db.select().from(finAdmins).where(eq(finAdmins.ativo, true)).orderBy(asc(finAdmins.id));
  const todos = admins.map((a) => ({ id: a.id, nome: a.nome, usuario: a.usuario, cotaBp: a.cotaBp ?? null, pendente: a.senhaHash === '!' }));
  const com = todos.filter((a) => a.cotaBp !== null && a.cotaBp > 0);
  return com.length ? { configurada: true, somaBp: com.reduce((s, a) => s + (a.cotaBp ?? 0), 0), lista: com } : { configurada: false, somaBp: 0, lista: todos };
}
