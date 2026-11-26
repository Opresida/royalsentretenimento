// Importar com IA (pedido do Humberto, 26/11/2026): sobe um relatório (CSV de bilheteria, PDF de fechamento de bar, foto de
// nota) e o Gemini devolve os lançamentos organizados. Nada entra no banco aqui: o admin confere e escolhe o que lançar.
// Só servidor. A chave fica em GEMINI_API_KEY (nunca vai para o navegador nem para o log).
import { CATEGORIAS } from './calculo';

export const MAX_IMPORTAR = 4 * 1024 * 1024;
export const TIPOS_ACEITOS = /^(text\/csv|text\/plain|application\/vnd\.ms-excel|application\/pdf|image\/(jpeg|png|webp|heic|heif))$/;

export type ItemLido = { tipo: 'custo' | 'receita'; descricao: string; categoria: string; valor: number; data: string | null; quitado: boolean };
export type SomaColuna = { coluna: string; soma: number; linhas: number }; // soma em centavos
export type Leitura = { itens: ItemLido[]; totalLido: number | null; observacoes: string; somasCsv: SomaColuna[]; modelo: string };

// modelos em ordem de preferência; quando um está sobrecarregado (503) ou saiu do ar, tenta o próximo
const MODELOS = (process.env.GEMINI_MODELO ? [process.env.GEMINI_MODELO] : []).concat(['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest']);
const TODAS = [...new Set([...CATEGORIAS.receita, ...CATEGORIAS.custo])];

export function ehCsv(nome: string, mime: string) {
  return /\.csv$/i.test(nome) || mime === 'text/csv' || mime === 'application/vnd.ms-excel';
}

// CSV vem do Excel brasileiro em UTF-8 ou Windows-1252: tenta UTF-8 e cai para latin1 se aparecer o caractere quebrado
export function textoDoCsv(buf: Buffer): string {
  const utf = buf.toString('utf8').replace(/^﻿/, '');
  return utf.includes('�') ? buf.toString('latin1') : utf;
}

function separador(linha: string) {
  const c = (ch: string) => linha.split(ch).length - 1;
  return [';', ',', '\t'].sort((a, b) => c(b) - c(a))[0];
}

function quebrar(linha: string, sep: string): string[] {
  const out: string[] = [];
  let cur = '', aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (ch === '"') { if (aspas && linha[i + 1] === '"') { cur += '"'; i++; } else aspas = !aspas; }
    else if (ch === sep && !aspas) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

// "1.234,56", "R$ 80,00", "80.00", "80" → centavos (NaN se não for número)
export function numeroBr(txt: string): number {
  let s = txt.replace(/[R$\s]/g, '');
  if (!s || !/^-?[\d.,]+$/.test(s)) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

// Conferência sem IA: soma as colunas de valor do CSV (Valor, Total, Preço, Pago, Líquido...).
export function somarColunasCsv(texto: string): SomaColuna[] {
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim());
  if (linhas.length < 2) return [];
  const sep = separador(linhas[0]);
  const cab = quebrar(linhas[0], sep);
  const alvo = /valor|total|pre[cç]o|pago|bruto|l[ií]quido|receita|venda|faturamento/i;
  const somas: SomaColuna[] = [];
  cab.forEach((nome, i) => {
    if (!alvo.test(nome)) return;
    let soma = 0, n = 0;
    for (const l of linhas.slice(1)) {
      const v = numeroBr(quebrar(l, sep)[i] ?? '');
      if (Number.isFinite(v)) { soma += v; n++; }
    }
    if (n) somas.push({ coluna: nome, soma, linhas: n });
  });
  return somas.slice(0, 6);
}

const ESQUEMA = {
  type: 'OBJECT',
  properties: {
    itens: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          tipo: { type: 'STRING', enum: ['custo', 'receita'] },
          descricao: { type: 'STRING' },
          categoria: { type: 'STRING', enum: TODAS },
          valor: { type: 'NUMBER', description: 'em reais, positivo, com centavos (ex.: 1234.5)' },
          data: { type: 'STRING', nullable: true, description: 'AAAA-MM-DD ou null' },
          quitado: { type: 'BOOLEAN', description: 'true = já pago/recebido' },
        },
        required: ['tipo', 'descricao', 'categoria', 'valor', 'quitado'],
      },
    },
    total_lido: { type: 'NUMBER', nullable: true, description: 'total geral que aparece no documento, em reais; null se não houver' },
    observacoes: { type: 'STRING' },
  },
  required: ['itens', 'observacoes'],
};

function instrucoes(evento: { nome: string; data: string | null }) {
  return [
    `Você organiza o financeiro de um evento da Royals Entretenimento: "${evento.nome}"${evento.data ? `, data ${evento.data}` : ''}.`,
    'Leia o arquivo (relatório de bilheteria, fechamento de bar, nota fiscal, extrato ou planilha) e devolva os lançamentos financeiros.',
    'Regras:',
    '- NUNCA invente valor. Use só números que estão no arquivo. Se não tiver certeza, deixe de fora e explique em observacoes.',
    '- Relatório de venda com uma linha por ingresso ou por pedido: AGRUPE em poucos lançamentos por tipo de ingresso, lote ou setor (ex.: "Bilheteria · Pista · 1º lote (42 ingressos)"), somando os valores. Não devolva uma linha por pessoa.',
    '- Ingressos de pista/área comum = receita "Bilheteria". Camarote, mesa ou área VIP = receita "Camarote". Venda de bebida e comida = receita "Bar".',
    '- Compra de bebida, gelo, insumos do bar e equipe do bar = custo "Bar". Cachê de artista = custo "Cachê". Taxas de plataforma, maquininha ou venda = custo "Taxas".',
    '- Se o relatório mostrar valor bruto e taxa da plataforma, lance a receita BRUTA e a taxa como custo separado "Taxas".',
    '- Cortesias com valor zero não viram lançamento; cite a quantidade em observacoes.',
    `- Categorias de receita: ${CATEGORIAS.receita.join(', ')}. Categorias de custo: ${CATEGORIAS.custo.join(', ')}.`,
    '- valor sempre positivo, em reais (ponto como decimal). data no formato AAAA-MM-DD quando o arquivo mostrar; senão null.',
    '- quitado = true quando já foi pago ou recebido; false quando o documento indicar que está pendente.',
    '- total_lido = o total geral que o próprio documento mostra (se houver).',
    '- descricao curta e clara, em português, sem dados pessoais (nada de CPF, e-mail ou telefone de comprador).',
    '- observacoes: 1 a 3 frases sobre o que foi agrupado, o que ficou de fora e qualquer dúvida.',
  ].join('\n');
}

export class ErroImportar extends Error {}

// Chama o Gemini com resposta em JSON; tenta o próximo modelo quando um está sobrecarregado ou fora do ar.
async function pedirJson(chave: string, sistema: string, partes: object[], esquema: object): Promise<{ dados: Record<string, unknown>; modelo: string }> {
  const corpo = JSON.stringify({
    system_instruction: { parts: [{ text: sistema }] },
    contents: [{ role: 'user', parts: partes }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: esquema, temperature: 0 },
  });
  let ultimoErro = 'A IA não respondeu.';
  for (const modelo of MODELOS) {
    let r: Response;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': chave }, body: corpo, signal: AbortSignal.timeout(75_000),
      });
    } catch {
      ultimoErro = 'A IA demorou demais para responder.';
      continue;
    }
    if ([404, 429, 500, 502, 503, 504].includes(r.status)) { ultimoErro = r.status === 429 ? 'Limite de uso da IA atingido agora.' : 'A IA está sobrecarregada agora.'; continue; }
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) throw new ErroImportar(r.status === 400 ? 'A IA não conseguiu abrir este arquivo. Confira se é um CSV, PDF ou foto legível.' : 'A IA recusou o pedido. Tente de novo em instantes.');
    const texto: string = (j.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('');
    try { return { dados: JSON.parse(texto), modelo }; } catch { ultimoErro = 'A IA devolveu uma resposta fora do formato.'; continue; }
  }
  throw new ErroImportar(`${ultimoErro} Tente de novo em 1 minuto.`);
}

// ——— CSV: a IA só diz QUAIS colunas usar e como classificar cada grupo; quem soma é o código (a IA erra contagem de linhas) ———
const PESSOAL = /cpf|cnpj|documento|e-?mail|telefone|celular|whats|comprador|cliente|nome|participante|titular|endere[cç]o/i;

type Tabela = { cab: string[]; linhas: string[][] };
export function lerTabela(texto: string): Tabela {
  const brutas = texto.split(/\r?\n/).filter((l) => l.trim());
  if (!brutas.length) return { cab: [], linhas: [] };
  const sep = separador(brutas[0]);
  return { cab: quebrar(brutas[0], sep), linhas: brutas.slice(1).map((l) => quebrar(l, sep)) };
}

// amostra para a IA, sem dado pessoal: colunas de nome/CPF/e-mail/telefone saem como ***
function amostraSegura(t: Tabela): string {
  const esconder = t.cab.map((c) => PESSOAL.test(c));
  const linha = (l: string[]) => l.map((v, i) => (esconder[i] ? '***' : v)).join(' ; ');
  const distintos = t.cab.map((c, i) => {
    if (esconder[i]) return null;
    const cont = new Map<string, number>();
    for (const l of t.linhas) cont.set(l[i] ?? '', (cont.get(l[i] ?? '') ?? 0) + 1);
    if (cont.size > 40 || cont.size === t.linhas.length) return null;
    return `- "${c}": ${[...cont.entries()].map(([v, n]) => `"${v}" (${n})`).join(', ')}`;
  }).filter((x): x is string => !!x);
  return [
    `Colunas: ${t.cab.map((c) => `"${c}"`).join(', ')}`,
    `Total de linhas: ${t.linhas.length}`,
    'Primeiras linhas:', ...t.linhas.slice(0, 25).map(linha),
    distintos.length ? 'Valores distintos das colunas de categoria (com quantas linhas cada):' : '', ...distintos,
  ].join('\n');
}

const ESQUEMA_CSV = {
  type: 'OBJECT',
  properties: {
    coluna_grupo: { type: 'STRING', description: 'coluna que separa os lançamentos (tipo de ingresso, lote, setor, produto ou descrição)' },
    coluna_valor: { type: 'STRING', description: 'coluna com o valor que o evento recebe/paga em cada linha, SEM a taxa de serviço quando ela vem separada' },
    valor_e_unitario: { type: 'BOOLEAN', description: 'true se coluna_valor é preço unitário e precisa multiplicar pela quantidade' },
    coluna_quantidade: { type: 'STRING', nullable: true },
    coluna_taxa: { type: 'STRING', nullable: true, description: 'coluna de taxa de serviço/conveniência, se houver' },
    coluna_status: { type: 'STRING', nullable: true },
    status_validos: { type: 'ARRAY', items: { type: 'STRING' }, description: 'valores de coluna_status que contam (ex.: Pago, Aprovado). Vazio = todos' },
    grupos: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          valor: { type: 'STRING', description: 'valor exato que aparece em coluna_grupo' },
          tipo: { type: 'STRING', enum: ['custo', 'receita'] },
          categoria: { type: 'STRING', enum: TODAS },
          descricao: { type: 'STRING', description: 'nome curto do lançamento, sem quantidade' },
        },
        required: ['valor', 'tipo', 'categoria', 'descricao'],
      },
    },
    observacoes: { type: 'STRING' },
  },
  required: ['coluna_grupo', 'coluna_valor', 'valor_e_unitario', 'grupos', 'observacoes'],
};

function instrucoesCsv(evento: { nome: string; data: string | null }) {
  return [
    `Você organiza o financeiro de um evento da Royals Entretenimento: "${evento.nome}"${evento.data ? `, data ${evento.data}` : ''}.`,
    'Você recebe só o cabeçalho, uma amostra e os valores distintos de uma planilha CSV. NÃO some nada: o sistema soma as linhas.',
    'Sua tarefa é dizer quais colunas usar e como classificar cada grupo:',
    '- coluna_grupo: a coluna que separa os lançamentos (ex.: "Ingresso", "Lote", "Setor", "Produto"). Use o nome EXATO do cabeçalho.',
    '- coluna_valor: o valor de cada linha que é do evento (preço do ingresso/produto), sem taxa de serviço quando ela está em coluna própria.',
    '- coluna_taxa: a coluna de taxa de serviço/conveniência, se houver.',
    '- coluna_status e status_validos: só contam linhas pagas/aprovadas (ignore canceladas, estornadas, pendentes).',
    '- grupos: um item para CADA valor distinto de coluna_grupo, com tipo, categoria e descricao curta.',
    '- Ingresso de pista/área comum = receita "Bilheteria". Camarote, mesa, VIP = receita "Camarote". Bebida e comida vendida = receita "Bar". Compra de bebida/insumo = custo "Bar".',
    `- Categorias de receita: ${CATEGORIAS.receita.join(', ')}. Categorias de custo: ${CATEGORIAS.custo.join(', ')}.`,
    '- observacoes: 1 a 2 frases sobre o que é a planilha e qualquer dúvida.',
  ].join('\n');
}

function idx(cab: string[], nome: unknown): number {
  if (typeof nome !== 'string' || !nome.trim()) return -1;
  const k = nome.trim().toLowerCase();
  return cab.findIndex((c) => c.trim().toLowerCase() === k);
}

function somarCsvPeloMapa(t: Tabela, m: Record<string, unknown>): { itens: ItemLido[]; notas: string[] } | null {
  const iG = idx(t.cab, m.coluna_grupo), iV = idx(t.cab, m.coluna_valor);
  if (iG < 0 || iV < 0) return null;
  const iQ = idx(t.cab, m.coluna_quantidade), iT = idx(t.cab, m.coluna_taxa), iS = idx(t.cab, m.coluna_status);
  const validos = new Set((Array.isArray(m.status_validos) ? m.status_validos : []).map((x) => String(x).trim().toLowerCase()));
  const unit = m.valor_e_unitario === true;
  const defs = new Map<string, { tipo: 'custo' | 'receita'; categoria: string; descricao: string }>();
  for (const g of Array.isArray(m.grupos) ? m.grupos : []) {
    const o = (g ?? {}) as Record<string, unknown>;
    const tipo = o.tipo === 'custo' ? 'custo' : 'receita';
    const lista: string[] = tipo === 'custo' ? CATEGORIAS.custo : CATEGORIAS.receita;
    defs.set(String(o.valor ?? '').trim(), { tipo, categoria: lista.includes(String(o.categoria)) ? String(o.categoria) : 'Outros', descricao: String(o.descricao ?? '').trim().slice(0, 90) });
  }
  const somas = new Map<string, { valor: number; qtd: number }>();
  let ignoradas = 0, cortesias = 0, taxa = 0, semValor = 0;
  for (const l of t.linhas) {
    if (iS >= 0 && validos.size && !validos.has((l[iS] ?? '').trim().toLowerCase())) { ignoradas++; continue; }
    const v = numeroBr(l[iV] ?? '');
    if (!Number.isFinite(v)) { semValor++; continue; }
    const q = iQ >= 0 ? Math.max(1, parseInt((l[iQ] ?? '1').replace(/\D/g, ''), 10) || 1) : 1;
    if (v === 0) { cortesias += q; continue; }
    const g = (l[iG] ?? '').trim() || 'Sem nome';
    const s = somas.get(g) ?? { valor: 0, qtd: 0 };
    s.valor += unit ? v * q : v;
    s.qtd += q;
    somas.set(g, s);
    if (iT >= 0) { const tx = numeroBr(l[iT] ?? ''); if (Number.isFinite(tx)) taxa += tx; }
  }
  const itens: ItemLido[] = [...somas.entries()].map(([g, s]) => {
    const d = defs.get(g) ?? { tipo: 'receita' as const, categoria: 'Outros', descricao: g };
    const ingresso = d.tipo === 'receita' && ['Bilheteria', 'Camarote'].includes(d.categoria);
    const unidade = ingresso ? (s.qtd === 1 ? 'ingresso' : 'ingressos') : s.qtd === 1 ? 'item' : 'itens';
    return { tipo: d.tipo, categoria: d.categoria, descricao: `${d.descricao || g} (${s.qtd} ${unidade})`.slice(0, 120), valor: Math.round(s.valor), data: null, quitado: true };
  }).sort((a, b) => b.valor - a.valor);
  const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const notas = [`Somado linha a linha pelo sistema: ${t.linhas.length - ignoradas - semValor} linhas.`];
  if (ignoradas) notas.push(`${ignoradas} linhas fora do status pago ficaram de fora.`);
  if (cortesias) notas.push(`${cortesias} cortesias (valor zero) não viram lançamento.`);
  if (taxa) notas.push(`Taxa de serviço na planilha: ${brl(taxa)}, cobrada à parte e fora da receita do evento.`);
  return { itens, notas };
}

export async function lerComIA(arq: { nome: string; mime: string; buf: Buffer }, evento: { nome: string; data: string | null }): Promise<Leitura> {
  const chave = process.env.GEMINI_API_KEY?.trim();
  if (!chave) throw new ErroImportar('A leitura com IA ainda não está ligada neste site (falta a chave do Gemini). Lance pelo + Lançamento por enquanto.');

  if (ehCsv(arq.nome, arq.mime)) {
    const texto = textoDoCsv(arq.buf);
    const tabela = lerTabela(texto);
    if (tabela.linhas.length < 1) throw new ErroImportar('A planilha está vazia ou sem cabeçalho.');
    if (tabela.linhas.length > 20_000) throw new ErroImportar('A planilha tem mais de 20 mil linhas. Separe em partes menores (por dia ou por setor).');
    const somasCsv = somarColunasCsv(texto);
    const { dados, modelo } = await pedirJson(chave, instrucoesCsv(evento), [{ text: `Planilha "${arq.nome}":\n\n${amostraSegura(tabela)}` }], ESQUEMA_CSV);
    const r = somarCsvPeloMapa(tabela, dados);
    if (!r || !r.itens.length) throw new ErroImportar('A IA não conseguiu entender as colunas desta planilha. Confira se a 1ª linha é o cabeçalho, ou mande em PDF.');
    return { itens: r.itens.slice(0, 300), totalLido: null, observacoes: [String(dados.observacoes ?? '').slice(0, 400), ...r.notas].filter(Boolean).join(' '), somasCsv, modelo };
  }

  const { dados, modelo } = await pedirJson(chave, instrucoes(evento), [{ inline_data: { mime_type: arq.mime, data: arq.buf.toString('base64') } }, { text: 'Organize este arquivo em lançamentos seguindo as regras.' }], ESQUEMA);
  const itens = (Array.isArray(dados.itens) ? dados.itens : []).map(limparItem).filter((x): x is ItemLido => !!x).slice(0, 300);
  const total = typeof dados.total_lido === 'number' && Number.isFinite(dados.total_lido) ? Math.round(dados.total_lido * 100) : null;
  return { itens, totalLido: total, observacoes: String(dados.observacoes ?? '').slice(0, 800), somasCsv: [], modelo };
}

function limparItem(x: unknown): ItemLido | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as Record<string, unknown>;
  const tipo = o.tipo === 'custo' ? 'custo' : 'receita';
  const valor = Math.round(Math.abs(Number(o.valor)) * 100);
  if (!Number.isFinite(valor) || valor <= 0) return null;
  const lista: string[] = tipo === 'custo' ? CATEGORIAS.custo : CATEGORIAS.receita;
  const categoria = lista.includes(String(o.categoria)) ? String(o.categoria) : 'Outros';
  const data = typeof o.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.data) ? o.data : null;
  return { tipo, descricao: String(o.descricao ?? '').trim().slice(0, 120) || 'Lançamento importado', categoria, valor, data, quitado: o.quitado !== false };
}
