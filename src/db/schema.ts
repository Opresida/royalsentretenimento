// Banco do Financeiro Royals (/financeiro e /socio). Pedido do Humberto em 25/11/2026.
// Valores em centavos (inteiro). Cota e taxa percentual em pontos-base (5000 = 50%).
import { bigint, boolean, index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const finAdmins = pgTable('fin_admins', {
  id: serial('id').primaryKey(),
  usuario: text('usuario').notNull(),
  nome: text('nome').notNull(),
  senhaHash: text('senha_hash').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  // primeiro acesso: link de uso único para a pessoa criar a própria senha (nenhuma senha passa por mensagem)
  convite: text('convite'),
  conviteExpira: timestamp('convite_expira', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('fin_admins_usuario').on(t.usuario)]);

// status: montagem (antes) · ao_vivo (acontecendo / acertando contas) · fechado (travado)
// taxaTipo: nenhuma · pct_receita · pct_lucro · fixo   (taxa de produção da Royals, opcional)
export const finEventos = pgTable('fin_eventos', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  data: text('data'), // AAAA-MM-DD
  local: text('local'),
  status: text('status').notNull().default('montagem'),
  taxaTipo: text('taxa_tipo').notNull().default('nenhuma'),
  taxaValor: bigint('taxa_valor', { mode: 'number' }).notNull().default(0), // pontos-base ou centavos (fixo)
  observacoes: text('observacoes'),
  fechadoEm: timestamp('fechado_em', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const finSocios = pgTable('fin_socios', {
  id: serial('id').primaryKey(),
  eventoId: integer('evento_id').notNull().references(() => finEventos.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  contato: text('contato'),
  aporte: bigint('aporte', { mode: 'number' }).notNull().default(0),
  cotaBp: integer('cota_bp').notNull().default(0),
  eRoyals: boolean('e_royals').notNull().default(false),
  token: text('token').notNull(),
  linkAtivo: boolean('link_ativo').notNull().default(true),
  ultimoAcesso: timestamp('ultimo_acesso', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('fin_socios_token').on(t.token), index('fin_socios_evento').on(t.eventoId)]);

export const finComprovantes = pgTable('fin_comprovantes', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  mime: text('mime').notNull(),
  tamanho: integer('tamanho').notNull(),
  dados: text('dados').notNull(), // base64 (cabe em qualquer driver; arquivo até ~4 MB)
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

// eventoId nulo = lançamento do caixa da própria Royals.
// origem: manual · importacao (Importar com IA; vários podem dividir o mesmo comprovante) · fechamento (criado ao fechar um evento; some ao reabrir)
export const finLancamentos = pgTable('fin_lancamentos', {
  id: serial('id').primaryKey(),
  eventoId: integer('evento_id').references(() => finEventos.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(), // custo · receita
  descricao: text('descricao').notNull(),
  categoria: text('categoria').notNull(),
  valor: bigint('valor', { mode: 'number' }).notNull(),
  quitado: boolean('quitado').notNull().default(true), // pago / recebido
  data: text('data').notNull(), // AAAA-MM-DD
  vencimento: text('vencimento'),
  comprovanteId: integer('comprovante_id').references(() => finComprovantes.id, { onDelete: 'set null' }),
  mostrarAoSocio: boolean('mostrar_ao_socio').notNull().default(false),
  origem: text('origem').notNull().default('manual'),
  origemEventoId: integer('origem_evento_id'),
  criadoPor: integer('criado_por'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('fin_lanc_evento').on(t.eventoId), index('fin_lanc_data').on(t.data)]);

export const finHistorico = pgTable('fin_historico', {
  id: serial('id').primaryKey(),
  eventoId: integer('evento_id'),
  adminId: integer('admin_id'),
  acao: text('acao').notNull(),
  detalhe: jsonb('detalhe'),
  em: timestamp('em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('fin_hist_evento').on(t.eventoId)]);

export type FinEvento = typeof finEventos.$inferSelect;
export type FinSocio = typeof finSocios.$inferSelect;
export type FinLancamento = typeof finLancamentos.$inferSelect;
