import { createHash, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extrairJson, iaLigada, type Arquivo } from '@/lib/iaRouter';

// Leitura por IA para o gerador de contratos (/contratos): recebe um PDF, uma foto ou um texto colado (cartão CNPJ,
// contrato social, documento, conversa de WhatsApp com os dados do evento) e devolve os campos do contrato.
// Protegida por senha da equipe (CONTRATOS_SENHA). Nada é guardado: o arquivo vai para a IA e a resposta volta.
// Com CNPJ achado, a razão social e o endereço vêm do cadastro público (BrasilAPI), que vale mais que a leitura da IA.

export const maxDuration = 60;

const MAX_ARQUIVO = 4 * 1024 * 1024; // limite de corpo da Vercel é 4,5 MB
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const tentativas = new Map<string, { n: number; fim: number }>();
function limitado(ip: string) {
  const agora = Date.now();
  const t = tentativas.get(ip);
  if (!t || t.fim < agora) { tentativas.set(ip, { n: 1, fim: agora + 60_000 }); return false; }
  return ++t.n > 10;
}

const hash = (s: string) => createHash('sha256').update(s).digest();
function senhaOk(enviada: string | null) {
  const certa = process.env.CONTRATOS_SENHA?.trim(); // trim: valor cadastrado pelo terminal pode vir com quebra de linha
  if (!certa || !enviada) return false;
  return timingSafeEqual(hash(enviada), hash(certa));
}

const SISTEMA = `Você extrai dados para um contrato de apresentação artística (venda de show) no Brasil.
Leia o material enviado (documento, cartão CNPJ, contrato social, RG/CNH, conversa de WhatsApp, e-mail) e responda SOMENTE um JSON com esta forma:
{
  "contratante": { "tipo": "pj" | "pf" | "", "nome": "", "doc": "", "rgIe": "", "endereco": "", "representante": "", "repCpf": "", "email": "", "whatsapp": "" },
  "evento": { "nome": "", "data": "", "horario": "", "local": "", "endereco": "", "cidade": "", "publico": "" },
  "valores": { "cache": "" },
  "observacoes": ""
}
Regras:
- Use só o que está escrito no material. Campo sem informação fica "" (string vazia). Nunca invente.
- contratante.tipo: "pj" se for empresa (CNPJ), "pf" se for pessoa física (CPF).
- contratante.nome: razão social (pj) ou nome completo (pf). contratante.doc: CNPJ (pj) ou CPF (pf), com pontuação.
- contratante.rgIe: inscrição estadual (pj) ou RG (pf). contratante.representante e repCpf: quem assina pela empresa.
- contratante.endereco: endereço da empresa ou da pessoa contratante, só se estiver escrito como endereço DELA (não use o endereço do evento). Completo, com cidade/UF e CEP se houver.
- evento.data no formato AAAA-MM-DD. evento.horario como "23h00". evento.cidade como "Manaus/AM".
- valores.cache: só o número em reais, como "10000,00", se o valor do cachê aparecer.
- observacoes: até 2 frases com algo importante para o contrato que não coube nos campos (em português).`;

type Saida = { contratante: Record<string, string>; evento: Record<string, string>; valores: Record<string, string>; observacoes: string };

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '');
function limpa(d: Record<string, unknown>): Saida {
  const sec = (k: string, campos: string[]) => {
    const o = (d[k] && typeof d[k] === 'object' ? d[k] : {}) as Record<string, unknown>;
    return Object.fromEntries(campos.map((c) => [c, str(o[c])]));
  };
  const s: Saida = {
    contratante: sec('contratante', ['tipo', 'nome', 'doc', 'rgIe', 'endereco', 'representante', 'repCpf', 'email', 'whatsapp']),
    evento: sec('evento', ['nome', 'data', 'horario', 'local', 'endereco', 'cidade', 'publico']),
    valores: sec('valores', ['cache']),
    observacoes: str(d.observacoes, 400),
  };
  if (!['pj', 'pf'].includes(s.contratante.tipo)) s.contratante.tipo = '';
  if (s.evento.data && !/^\d{4}-\d{2}-\d{2}$/.test(s.evento.data)) s.evento.data = '';
  return s;
}

const fmtCnpj = (d: string) => d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
const fmtCep = (d: string) => d.replace(/^(\d{5})(\d{3})$/, '$1-$2');
const titulo = (s: string) => s.toLowerCase().replace(/(^|\s)(\S)/g, (m) => m.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E)\b/g, (m) => m.toLowerCase());

/** Cadastro público do CNPJ (grátis): BrasilAPI e, se falhar, CNPJ.ws. Devolve null se nenhum achar.
 *  (A BrasilAPI responde 403 para pedido sem User-Agent.) */
type Publico = { razao: string; endereco: string; situacao: string; socio: string };
const montaEndereco = (rua: string, numero: string, compl: string, bairro: string, cidade: string, uf: string, cep: string) => {
  const partes = [rua && titulo(rua), numero, compl && titulo(compl), bairro && titulo(bairro)].filter(Boolean);
  return `${partes.join(', ')}${partes.length ? ', ' : ''}${titulo(cidade)}/${uf}${cep ? `, CEP ${fmtCep(cep)}` : ''}`;
};
async function cnpjPublico(cnpj: string): Promise<Publico | null> {
  const opc = { headers: { 'User-Agent': 'royals-contratos/1.0', Accept: 'application/json' }, signal: AbortSignal.timeout(10_000) };
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, opc);
    if (r.ok) {
      const j = await r.json();
      const rua = [j.descricao_tipo_de_logradouro, j.logradouro].filter(Boolean).join(' ').trim();
      // empresário individual sai com a rua escondida na BrasilAPI: aí o CNPJ.ws (abaixo) costuma ter o endereço inteiro
      if (rua) return {
        razao: String(j.razao_social ?? '').replace(/\s*\**\d{3,11}\**$/, '').trim(),
        endereco: montaEndereco(rua, String(j.numero ?? ''), String(j.complemento ?? ''), String(j.bairro ?? ''), String(j.municipio ?? ''), String(j.uf ?? ''), String(j.cep ?? '')),
        situacao: String(j.descricao_situacao_cadastral ?? ''),
        socio: Array.isArray(j.qsa) && j.qsa.length === 1 ? titulo(String(j.qsa[0].nome_socio ?? '')) : '',
      };
    }
  } catch {}
  try {
    const r = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`, opc);
    if (!r.ok) return null;
    const j = await r.json();
    const e = j.estabelecimento ?? {};
    const rua = [e.tipo_logradouro, e.logradouro].filter(Boolean).join(' ').trim();
    return {
      razao: String(j.razao_social ?? '').replace(/\s*\**\d{3,11}\**$/, '').trim(),
      endereco: montaEndereco(rua, String(e.numero ?? ''), String(e.complemento ?? ''), String(e.bairro ?? ''), String(e.cidade?.nome ?? ''), String(e.estado?.sigla ?? ''), String(e.cep ?? '')),
      situacao: String(e.situacao_cadastral ?? '').toUpperCase(),
      socio: Array.isArray(j.socios) && j.socios.length === 1 ? titulo(String(j.socios[0].nome ?? '')) : '',
    };
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (limitado(ip)) return NextResponse.json({ ok: false, error: 'Muitas leituras seguidas. Tente em um minuto.' }, { status: 429 });
  if (!process.env.CONTRATOS_SENHA || !iaLigada()) return NextResponse.json({ ok: false, error: 'A leitura por IA ainda não está configurada no servidor.' }, { status: 503 });
  if (!senhaOk(req.headers.get('x-contratos-senha'))) return NextResponse.json({ ok: false, error: 'Senha incorreta.' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: 'Envio inválido.' }, { status: 400 });
  const texto = str(form.get('texto'), 20_000);
  const arquivos: Arquivo[] = [];
  for (const f of form.getAll('arquivo')) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (!TIPOS.includes(f.type)) return NextResponse.json({ ok: false, error: 'Envie PDF, JPG, PNG ou WEBP.' }, { status: 400 });
    if (f.size > MAX_ARQUIVO) return NextResponse.json({ ok: false, error: 'Arquivo acima de 4 MB.' }, { status: 400 });
    arquivos.push({ mime: f.type, base64: Buffer.from(await f.arrayBuffer()).toString('base64') });
  }
  if (!texto && !arquivos.length) return NextResponse.json({ ok: false, error: 'Mande um arquivo ou cole um texto.' }, { status: 400 });

  try {
    const { dados, modelo } = await extrairJson(SISTEMA, texto ? `Material enviado:\n${texto}` : 'Extraia os dados do material em anexo.', arquivos);
    const s = limpa(dados);
    const avisos: string[] = [];
    const digitos = s.contratante.doc.replace(/\D/g, '');
    if (digitos.length === 14) {
      s.contratante.tipo = 'pj';
      const pub = await cnpjPublico(digitos);
      if (pub) {
        s.contratante.doc = fmtCnpj(digitos);
        if (pub.razao) s.contratante.nome = pub.razao;
        if (pub.endereco && (/\d/.test(pub.endereco.split('/')[0]) || !s.contratante.endereco)) s.contratante.endereco = pub.endereco;
        if (!s.contratante.representante && pub.socio) s.contratante.representante = pub.socio;
        if (pub.situacao && pub.situacao !== 'ATIVA') avisos.push(`O CNPJ está com situação ${pub.situacao} na Receita.`);
        avisos.push('Razão social e endereço conferidos no cadastro público do CNPJ.');
      } else avisos.push('Não achei esse CNPJ no cadastro público: confira o número.');
    } else if (digitos.length === 11 && !s.contratante.tipo) s.contratante.tipo = 'pf';
    return NextResponse.json({ ok: true, dados: s, avisos, modelo });
  } catch {
    return NextResponse.json({ ok: false, error: 'A IA não conseguiu ler agora. Tente de novo em instantes.' }, { status: 502 });
  }
}
