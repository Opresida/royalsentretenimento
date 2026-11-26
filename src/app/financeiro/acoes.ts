'use server';
// Ações do Financeiro Royals. Toda ação confere o admin (exigirAdmin) antes de mexer no banco.
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb, schema } from '@/db';
import { apagarSessao, conferirSenha, exigirAdmin, gravarSessao, hashSenha, novoTokenSocio, type Admin } from '@/lib/financeiro/auth';
import { CATEGORIAS, calcular } from '@/lib/financeiro/calculo';
import { ehCsv, ErroImportar, lerComIA, MAX_IMPORTAR, TIPOS_ACEITOS, type Leitura } from '@/lib/financeiro/importar';
import { hojeManaus, lerPct, lerReais, reais } from '@/lib/financeiro/dinheiro';

const { finAdmins, finEventos, finLancamentos, finSocios, finComprovantes, finHistorico } = schema;
export type Estado = { erro?: string; ok?: string } | null;

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const dataOk = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const MAX_ARQUIVO = 4 * 1024 * 1024;

async function registrar(admin: Admin, eventoId: number | null, acao: string, detalhe?: unknown) {
  const db = await getDb();
  await db.insert(finHistorico).values({ eventoId, adminId: admin.id, acao, detalhe: (detalhe ?? null) as never });
}

function atualizar(eventoId?: number | null) {
  revalidatePath('/financeiro', 'layout');
  if (eventoId) revalidatePath(`/financeiro/eventos/${eventoId}`);
}

// o comprovante de uma importação é dividido por vários lançamentos: só apaga quando ninguém mais usa
async function apagarComprovanteSeSolto(id: number | null | undefined, menosLancamento?: number) {
  if (!id) return;
  const db = await getDb();
  const usos = await db.select({ id: finLancamentos.id }).from(finLancamentos).where(eq(finLancamentos.comprovanteId, id));
  if (usos.some((u) => u.id !== menosLancamento)) return;
  await db.delete(finComprovantes).where(eq(finComprovantes.id, id));
}

async function eventoAberto(id: number) {
  const db = await getDb();
  const [ev] = await db.select().from(finEventos).where(eq(finEventos.id, id)).limit(1);
  return ev && ev.status !== 'fechado' ? ev : null;
}

// ——— login ———
export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  const usuario = txt(f, 'usuario').toLowerCase();
  const senha = String(f.get('senha') ?? '');
  const db = await getDb();
  const [a] = usuario ? await db.select().from(finAdmins).where(eq(finAdmins.usuario, usuario)).limit(1) : [];
  const ok = a && a.ativo && (await conferirSenha(senha, a.senhaHash));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 700)); // freia tentativa em sequência
    return { erro: 'Usuário ou senha incorretos.' };
  }
  await gravarSessao(a.id);
  redirect('/financeiro');
}

export async function sair() {
  await apagarSessao();
  redirect('/financeiro/entrar');
}

// ——— eventos ———
export async function salvarEvento(_: Estado, f: FormData): Promise<Estado> {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id')) || null;
  const nome = txt(f, 'nome');
  const data = txt(f, 'data');
  const local = txt(f, 'local') || null;
  const status = ['montagem', 'ao_vivo', 'fechado'].includes(txt(f, 'status')) ? txt(f, 'status') : 'montagem';
  const taxaTipo = ['nenhuma', 'pct_receita', 'pct_lucro', 'fixo'].includes(txt(f, 'taxaTipo')) ? txt(f, 'taxaTipo') : 'nenhuma';
  let taxaValor = 0;
  if (taxaTipo === 'fixo') taxaValor = lerReais(txt(f, 'taxaValor'));
  else if (taxaTipo !== 'nenhuma') taxaValor = lerPct(txt(f, 'taxaValor'));
  if (!nome) return { erro: 'Dê um nome ao evento.' };
  if (data && !dataOk(data)) return { erro: 'Data inválida.' };
  if (taxaTipo !== 'nenhuma' && (!Number.isFinite(taxaValor) || taxaValor < 0)) return { erro: 'Confira o valor da taxa de produção.' };
  if (taxaTipo.startsWith('pct') && taxaValor > 10000) return { erro: 'A taxa não pode passar de 100%.' };
  const db = await getDb();
  const valores = { nome, data: data || null, local, taxaTipo, taxaValor: taxaTipo === 'nenhuma' ? 0 : taxaValor, observacoes: txt(f, 'observacoes') || null };
  let eventoId = id;
  if (id) {
    const [ev] = await db.select().from(finEventos).where(eq(finEventos.id, id)).limit(1);
    if (!ev) return { erro: 'Evento não encontrado.' };
    // fechar/reabrir tem ação própria (mexe no caixa); aqui só muda entre montagem e ao vivo
    const novoStatus = ev.status === 'fechado' ? 'fechado' : status === 'fechado' ? ev.status : status;
    await db.update(finEventos).set({ ...valores, status: novoStatus }).where(eq(finEventos.id, id));
    await registrar(admin, id, 'evento_editado', { nome, status: novoStatus });
  } else {
    const [novo] = await db.insert(finEventos).values({ ...valores, status: status === 'fechado' ? 'montagem' : status }).returning({ id: finEventos.id });
    eventoId = novo.id;
    await registrar(admin, eventoId, 'evento_criado', { nome });
  }
  atualizar(eventoId);
  redirect(`/financeiro/eventos/${eventoId}`);
}

export async function excluirEvento(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  if (txt(f, 'confirmar').toUpperCase() !== 'EXCLUIR') redirect(`/financeiro/eventos/${id}/editar?erro=confirmar`);
  const db = await getDb();
  const comps = (await db.select({ c: finLancamentos.comprovanteId }).from(finLancamentos).where(eq(finLancamentos.eventoId, id))).map((x) => x.c).filter((x): x is number => !!x);
  const compsUnicos = [...new Set(comps)];
  await db.delete(finLancamentos).where(eq(finLancamentos.origemEventoId, id));
  await db.delete(finEventos).where(eq(finEventos.id, id)); // lançamentos e sócios vão junto (cascade)
  if (compsUnicos.length) await db.delete(finComprovantes).where(inArray(finComprovantes.id, compsUnicos));
  await registrar(admin, null, 'evento_excluido', { id });
  atualizar();
  redirect('/financeiro');
}

// ——— lançamentos ———
export async function salvarLancamento(_: Estado, f: FormData): Promise<Estado> {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id')) || null;
  const eventoId = Number(txt(f, 'eventoId')) || null;
  const tipo = txt(f, 'tipo') === 'receita' ? 'receita' : 'custo';
  const valor = lerReais(txt(f, 'valor'));
  const descricao = txt(f, 'descricao');
  const categoria = txt(f, 'categoriaOutra') || txt(f, 'categoria') || 'Outros';
  const quitado = txt(f, 'quitado') !== 'nao';
  const data = txt(f, 'data') || hojeManaus();
  const vencimento = txt(f, 'vencimento') || null;
  const mostrarAoSocio = f.get('mostrarAoSocio') === 'on';
  if (!Number.isFinite(valor) || valor <= 0) return { erro: 'Informe um valor maior que zero.' };
  if (!descricao) return { erro: 'Escreva uma descrição.' };
  if (!dataOk(data) || (vencimento && !dataOk(vencimento))) return { erro: 'Data inválida.' };
  if (eventoId && !(await eventoAberto(eventoId))) return { erro: 'Este evento está fechado. Reabra para lançar.' };

  const db = await getDb();
  let anterior: typeof finLancamentos.$inferSelect | undefined;
  if (id) {
    [anterior] = await db.select().from(finLancamentos).where(eq(finLancamentos.id, id)).limit(1);
    if (!anterior) return { erro: 'Lançamento não encontrado.' };
    if (anterior.origem === 'fechamento') return { erro: 'Este lançamento foi criado pelo fechamento de um evento.' };
    if (anterior.eventoId && !(await eventoAberto(anterior.eventoId))) return { erro: 'Este evento está fechado. Reabra para editar.' };
  }

  let comprovanteId = anterior?.comprovanteId ?? null;
  const arq = f.get('comprovante');
  if (arq instanceof File && arq.size > 0) {
    if (arq.size > MAX_ARQUIVO) return { erro: 'O comprovante passa de 4 MB. Mande uma foto ou um PDF menor.' };
    if (!/^image\/(jpeg|png|webp|heic|heif|gif)$|^application\/pdf$/.test(arq.type)) return { erro: 'O comprovante precisa ser foto (JPG, PNG, WEBP, HEIC) ou PDF.' };
    const dados = Buffer.from(await arq.arrayBuffer()).toString('base64');
    const [c] = await db.insert(finComprovantes).values({ nome: arq.name || 'comprovante', mime: arq.type, tamanho: arq.size, dados }).returning({ id: finComprovantes.id });
    await apagarComprovanteSeSolto(comprovanteId, id ?? undefined);
    comprovanteId = c.id;
  } else if (f.get('removerComprovante') === 'on' && comprovanteId) {
    await apagarComprovanteSeSolto(comprovanteId, id ?? undefined);
    comprovanteId = null;
  }

  const valores = { eventoId, tipo, descricao, categoria, valor, quitado, data, vencimento: quitado ? null : vencimento, comprovanteId, mostrarAoSocio, atualizadoEm: new Date() };
  if (id) {
    await db.update(finLancamentos).set(valores).where(eq(finLancamentos.id, id));
    await registrar(admin, eventoId, 'lancamento_editado', { id, descricao, de: anterior ? reais(anterior.valor) : null, para: reais(valor), tipo });
  } else {
    const [n] = await db.insert(finLancamentos).values({ ...valores, criadoPor: admin.id }).returning({ id: finLancamentos.id });
    await registrar(admin, eventoId, 'lancamento_criado', { id: n.id, descricao, valor: reais(valor), tipo });
  }
  atualizar(eventoId);
  redirect(eventoId ? `/financeiro/eventos/${eventoId}?aba=${tipo === 'receita' ? 'receitas' : 'custos'}&salvo=1` : '/financeiro?salvo=1');
}

export async function excluirLancamento(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  const db = await getDb();
  const [l] = await db.select().from(finLancamentos).where(eq(finLancamentos.id, id)).limit(1);
  if (!l) redirect('/financeiro');
  if (l.eventoId && !(await eventoAberto(l.eventoId))) redirect(`/financeiro/eventos/${l.eventoId}?erro=fechado`);
  if (l.origem === 'fechamento') redirect('/financeiro');
  await db.delete(finLancamentos).where(eq(finLancamentos.id, id));
  await apagarComprovanteSeSolto(l.comprovanteId);
  await registrar(admin, l.eventoId, 'lancamento_excluido', { id, descricao: l.descricao, valor: reais(l.valor), tipo: l.tipo });
  atualizar(l.eventoId);
  redirect(l.eventoId ? `/financeiro/eventos/${l.eventoId}?aba=${l.tipo === 'receita' ? 'receitas' : 'custos'}` : '/financeiro');
}

// o Humberto escolhe quais comprovantes o sócio vê
export async function alternarMostrar(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  const db = await getDb();
  const [l] = await db.select().from(finLancamentos).where(eq(finLancamentos.id, id)).limit(1);
  if (!l) return;
  await db.update(finLancamentos).set({ mostrarAoSocio: !l.mostrarAoSocio }).where(eq(finLancamentos.id, id));
  await registrar(admin, l.eventoId, l.mostrarAoSocio ? 'comprovante_ocultado' : 'comprovante_mostrado', { id, descricao: l.descricao });
  atualizar(l.eventoId);
}

// ——— importar com IA ———
// 1º passo: a IA lê o arquivo e devolve a proposta (nada é gravado). O admin confere na tela.
export type RespostaLeitura = { erro: string } | { leitura: Leitura };

export async function lerArquivoImportar(f: FormData): Promise<RespostaLeitura> {
  await exigirAdmin();
  const eventoId = Number(txt(f, 'eventoId'));
  const ev = await eventoAberto(eventoId);
  if (!ev) return { erro: 'Este evento está fechado. Reabra para importar.' };
  const arq = f.get('arquivo');
  if (!(arq instanceof File) || !arq.size) return { erro: 'Escolha um arquivo.' };
  if (arq.size > MAX_IMPORTAR) return { erro: 'O arquivo passa de 4 MB. Separe em partes menores ou mande um PDF mais leve.' };
  const mime = arq.type || (/\.csv$/i.test(arq.name) ? 'text/csv' : '');
  if (/\.xlsx?$/i.test(arq.name) && !ehCsv(arq.name, mime)) return { erro: 'Planilha do Excel ainda não. No Excel: Arquivo › Salvar como › CSV, e suba o CSV. Ou mande em PDF.' };
  if (!TIPOS_ACEITOS.test(mime)) return { erro: 'Mande um CSV, PDF ou foto (JPG, PNG, WEBP, HEIC).' };
  try {
    const leitura = await lerComIA({ nome: arq.name, mime, buf: Buffer.from(await arq.arrayBuffer()) }, { nome: ev.nome, data: ev.data });
    if (!leitura.itens.length) return { erro: `A IA não achou lançamentos neste arquivo.${leitura.observacoes ? ` ${leitura.observacoes}` : ''}` };
    return { leitura };
  } catch (e) {
    if (e instanceof ErroImportar) return { erro: e.message };
    console.error('importar: falha inesperada', e instanceof Error ? e.name : 'erro'); // sem conteúdo do arquivo no log
    return { erro: 'Não deu para ler o arquivo agora. Tente de novo em instantes.' };
  }
}

// 2º passo: grava só os itens que o admin marcou, com o arquivo original anexado UMA vez como comprovante.
export async function lancarImportados(_: Estado, f: FormData): Promise<Estado> {
  const admin = await exigirAdmin();
  const eventoId = Number(txt(f, 'eventoId'));
  const ev = await eventoAberto(eventoId);
  if (!ev) return { erro: 'Este evento está fechado. Reabra para importar.' };
  let brutos: unknown;
  try { brutos = JSON.parse(String(f.get('itens') ?? '[]')); } catch { return { erro: 'Não deu para ler a lista. Recarregue a página.' }; }
  if (!Array.isArray(brutos) || !brutos.length) return { erro: 'Marque pelo menos um lançamento.' };
  if (brutos.length > 300) return { erro: 'São mais de 300 lançamentos. Agrupe antes de importar.' };
  const hoje = hojeManaus();
  const itens: { tipo: string; descricao: string; categoria: string; valor: number; quitado: boolean; data: string }[] = [];
  for (const b of brutos) {
    const o = (b ?? {}) as Record<string, unknown>;
    const tipo = o.tipo === 'custo' ? 'custo' : 'receita';
    const valor = lerReais(String(o.valor ?? ''));
    const descricao = String(o.descricao ?? '').trim().slice(0, 120);
    const lista: string[] = tipo === 'custo' ? CATEGORIAS.custo : CATEGORIAS.receita;
    const categoria = lista.includes(String(o.categoria)) ? String(o.categoria) : 'Outros';
    const data = typeof o.data === 'string' && dataOk(o.data) ? o.data : ev.data && dataOk(ev.data) ? ev.data : hoje;
    if (!descricao) return { erro: 'Tem lançamento sem descrição.' };
    if (!Number.isFinite(valor) || valor <= 0) return { erro: `Confira o valor de "${descricao}".` };
    itens.push({ tipo, descricao, categoria, valor, quitado: o.quitado !== false, data });
  }
  const db = await getDb();
  let comprovanteId: number | null = null;
  const arq = f.get('arquivo');
  if (arq instanceof File && arq.size > 0 && arq.size <= MAX_IMPORTAR) {
    const mime = arq.type || (/\.csv$/i.test(arq.name) ? 'text/csv' : 'application/octet-stream');
    const [c] = await db.insert(finComprovantes).values({ nome: arq.name || 'importado', mime, tamanho: arq.size, dados: Buffer.from(await arq.arrayBuffer()).toString('base64') }).returning({ id: finComprovantes.id });
    comprovanteId = c.id;
  }
  await db.insert(finLancamentos).values(itens.map((i) => ({ ...i, eventoId, comprovanteId, mostrarAoSocio: false, origem: 'importacao', criadoPor: admin.id })));
  const total = itens.reduce((s, i) => s + (i.tipo === 'receita' ? i.valor : -i.valor), 0);
  await registrar(admin, eventoId, 'lancamentos_importados', { descricao: `${itens.length} lançamento${itens.length > 1 ? 's' : ''} de ${arq instanceof File ? arq.name : 'arquivo'}`, valor: reais(total) });
  atualizar(eventoId);
  const soReceita = itens.every((i) => i.tipo === 'receita');
  redirect(`/financeiro/eventos/${eventoId}?aba=${soReceita ? 'receitas' : itens.every((i) => i.tipo === 'custo') ? 'custos' : 'resumo'}&importados=${itens.length}`);
}

// ——— sócios ———
export async function salvarSocio(_: Estado, f: FormData): Promise<Estado> {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id')) || null;
  const eventoId = Number(txt(f, 'eventoId'));
  const nome = txt(f, 'nome');
  const aporte = lerReais(txt(f, 'aporte') || '0');
  const cotaBp = lerPct(txt(f, 'cota'));
  const eRoyals = f.get('eRoyals') === 'on';
  if (!nome) return { erro: 'Escreva o nome do sócio.' };
  if (!Number.isFinite(aporte) || aporte < 0) return { erro: 'Confira o aporte.' };
  if (!Number.isFinite(cotaBp) || cotaBp < 0 || cotaBp > 10000) return { erro: 'A cota vai de 0 a 100%.' };
  if (!(await eventoAberto(eventoId))) return { erro: 'Este evento está fechado. Reabra para mexer nos sócios.' };
  const db = await getDb();
  const valores = { nome, contato: txt(f, 'contato') || null, aporte, cotaBp, eRoyals };
  if (id) {
    await db.update(finSocios).set(valores).where(and(eq(finSocios.id, id), eq(finSocios.eventoId, eventoId)));
    await registrar(admin, eventoId, 'socio_editado', { nome, aporte: reais(aporte), cota: cotaBp / 100 });
  } else {
    await db.insert(finSocios).values({ ...valores, eventoId, token: novoTokenSocio() });
    await registrar(admin, eventoId, 'socio_criado', { nome, aporte: reais(aporte), cota: cotaBp / 100 });
  }
  atualizar(eventoId);
  return { ok: id ? 'Sócio atualizado.' : 'Sócio adicionado. O link dele já está pronto.' };
}

export async function excluirSocio(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  const db = await getDb();
  const [s] = await db.select().from(finSocios).where(eq(finSocios.id, id)).limit(1);
  if (!s || !(await eventoAberto(s.eventoId))) return;
  await db.delete(finSocios).where(eq(finSocios.id, id));
  await registrar(admin, s.eventoId, 'socio_excluido', { nome: s.nome });
  atualizar(s.eventoId);
}

export async function gerenciarLink(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  const acao = txt(f, 'acao');
  const db = await getDb();
  const [s] = await db.select().from(finSocios).where(eq(finSocios.id, id)).limit(1);
  if (!s) return;
  if (acao === 'revogar') await db.update(finSocios).set({ linkAtivo: false }).where(eq(finSocios.id, id));
  else if (acao === 'novo') await db.update(finSocios).set({ linkAtivo: true, token: novoTokenSocio() }).where(eq(finSocios.id, id));
  else if (acao === 'reativar') await db.update(finSocios).set({ linkAtivo: true }).where(eq(finSocios.id, id));
  await registrar(admin, s.eventoId, `link_${acao}`, { nome: s.nome });
  atualizar(s.eventoId);
}

// ——— fechamento ———
// Fechar trava os lançamentos e registra no caixa da Royals o que ela ganha no evento (taxa + parte do lucro).
export async function fecharEvento(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  const db = await getDb();
  const ev = await eventoAberto(id);
  if (!ev) redirect(`/financeiro/eventos/${id}?aba=fechamento`);
  const [lancs, socios] = await Promise.all([
    db.select().from(finLancamentos).where(eq(finLancamentos.eventoId, id)),
    db.select().from(finSocios).where(eq(finSocios.eventoId, id)),
  ]);
  const conta = calcular(ev, lancs, socios);
  if (!conta.cotasOk) redirect(`/financeiro/eventos/${id}?aba=fechamento&erro=cotas`);
  const hoje = hojeManaus();
  const parteRoyals = conta.divisao.filter((d) => d.eRoyals).reduce((s, d) => s + d.lucro, 0);
  const novos: (typeof finLancamentos.$inferInsert)[] = [];
  if (conta.taxa > 0) novos.push({ eventoId: null, tipo: 'receita', descricao: `Taxa de produção · ${ev.nome}`, categoria: 'Taxa de produção', valor: conta.taxa, quitado: true, data: hoje, origem: 'fechamento', origemEventoId: id, criadoPor: admin.id });
  if (parteRoyals !== 0) novos.push({ eventoId: null, tipo: parteRoyals > 0 ? 'receita' : 'custo', descricao: `${parteRoyals > 0 ? 'Lucro' : 'Prejuízo'} da Royals · ${ev.nome}`, categoria: 'Resultado de evento', valor: Math.abs(parteRoyals), quitado: true, data: hoje, origem: 'fechamento', origemEventoId: id, criadoPor: admin.id });
  if (novos.length) await db.insert(finLancamentos).values(novos);
  await db.update(finEventos).set({ status: 'fechado', fechadoEm: new Date() }).where(eq(finEventos.id, id));
  await registrar(admin, id, 'evento_fechado', { lucro: reais(conta.lucro), taxa: reais(conta.taxa) });
  atualizar(id);
  redirect(`/financeiro/eventos/${id}?aba=fechamento`);
}

export async function reabrirEvento(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  const db = await getDb();
  await db.delete(finLancamentos).where(and(eq(finLancamentos.origemEventoId, id), isNull(finLancamentos.eventoId)));
  await db.update(finEventos).set({ status: 'ao_vivo', fechadoEm: null }).where(eq(finEventos.id, id));
  await registrar(admin, id, 'evento_reaberto');
  atualizar(id);
  redirect(`/financeiro/eventos/${id}?aba=fechamento`);
}

// ——— equipe (admins) ———
// Pessoa nova da Royals: ganha um link de uso único (7 dias) para criar a própria senha.
export async function criarAdmin(_: Estado, f: FormData): Promise<Estado> {
  const admin = await exigirAdmin();
  const usuario = txt(f, 'usuario').toLowerCase();
  const nome = txt(f, 'nome');
  if (!/^[a-z0-9._-]{3,32}$/.test(usuario)) return { erro: 'Usuário: 3 a 32 letras minúsculas, números, ponto ou traço.' };
  if (!nome) return { erro: 'Escreva o nome.' };
  const db = await getDb();
  const [existe] = await db.select({ id: finAdmins.id }).from(finAdmins).where(eq(finAdmins.usuario, usuario)).limit(1);
  if (existe) return { erro: 'Esse usuário já existe.' };
  const convite = novoTokenSocio();
  await db.insert(finAdmins).values({ usuario, nome, senhaHash: '!', convite, conviteExpira: new Date(Date.now() + 7 * 864e5) });
  await registrar(admin, null, 'admin_criado', { usuario });
  revalidatePath('/financeiro/equipe');
  return { ok: `Convite criado para ${nome} (usuário "${usuario}"). Mande o link de primeiro acesso, que aparece na lista ao lado e vale por 7 dias.` };
}

export async function renovarConvite(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  const db = await getDb();
  await db.update(finAdmins).set({ convite: novoTokenSocio(), conviteExpira: new Date(Date.now() + 7 * 864e5) }).where(eq(finAdmins.id, id));
  await registrar(admin, null, 'convite_renovado', { id });
  revalidatePath('/financeiro/equipe');
}

export async function definirSenha(_: Estado, f: FormData): Promise<Estado> {
  const convite = txt(f, 'convite');
  const senha = String(f.get('senha') ?? '');
  const conf = String(f.get('confirmar') ?? '');
  if (senha.length < 10) return { erro: 'A senha precisa de pelo menos 10 caracteres.' };
  if (senha !== conf) return { erro: 'As duas senhas não são iguais.' };
  const db = await getDb();
  const [a] = convite ? await db.select().from(finAdmins).where(eq(finAdmins.convite, convite)).limit(1) : [];
  if (!a || !a.ativo || !a.conviteExpira || a.conviteExpira.getTime() < Date.now()) return { erro: 'Este link expirou ou já foi usado. Peça um novo.' };
  await db.update(finAdmins).set({ senhaHash: await hashSenha(senha), convite: null, conviteExpira: null }).where(eq(finAdmins.id, a.id));
  await db.insert(finHistorico).values({ adminId: a.id, acao: 'senha_definida' });
  await gravarSessao(a.id);
  redirect('/financeiro');
}

export async function trocarSenha(_: Estado, f: FormData): Promise<Estado> {
  const admin = await exigirAdmin();
  const atual = String(f.get('atual') ?? '');
  const nova = String(f.get('nova') ?? '');
  if (nova.length < 10) return { erro: 'A nova senha precisa de pelo menos 10 caracteres.' };
  const db = await getDb();
  const [a] = await db.select().from(finAdmins).where(eq(finAdmins.id, admin.id)).limit(1);
  if (!a || !(await conferirSenha(atual, a.senhaHash))) return { erro: 'A senha atual não confere.' };
  await db.update(finAdmins).set({ senhaHash: await hashSenha(nova) }).where(eq(finAdmins.id, admin.id));
  await registrar(admin, null, 'senha_trocada');
  return { ok: 'Senha trocada.' };
}

export async function alternarAdmin(f: FormData) {
  const admin = await exigirAdmin();
  const id = Number(txt(f, 'id'));
  if (id === admin.id) return; // ninguém se desativa sozinho
  const db = await getDb();
  const [a] = await db.select().from(finAdmins).where(eq(finAdmins.id, id)).limit(1);
  if (!a) return;
  await db.update(finAdmins).set({ ativo: !a.ativo }).where(eq(finAdmins.id, id));
  await registrar(admin, null, a.ativo ? 'admin_desativado' : 'admin_reativado', { usuario: a.usuario });
  revalidatePath('/financeiro/equipe');
}
