// Roteador de IA com revezamento, no mesmo esquema do HCARE (server/aiRouter.ts): chama os provedores OFICIAIS direto,
// com as chaves da própria Royals (variáveis de ambiente), tentando uma fila e parando no primeiro que responde.
// Nada de gateway local (OmniRoute) em produção: ele só serve de laboratório para achar modelos grátis que funcionam.
// Fila testada em 31/10/2026 com as chaves grátis: gemini-3.5-flash-lite (~1,5 s), gemini-flash-lite-latest (~1 s),
// gemini-3.5-flash (~14 s, mais forte) e Pollinations openai-fast / openai (~6 s, só texto).
// Para trocar ou somar modelo: mexer na FILA (a ordem é a prioridade).

type Provedor = 'gemini' | 'pollinations';
type Tentativa = { provedor: Provedor; modelo: string; arquivos: boolean };

const FILA: Tentativa[] = [
  { provedor: 'gemini', modelo: 'gemini-3.5-flash-lite', arquivos: true },
  { provedor: 'gemini', modelo: 'gemini-flash-lite-latest', arquivos: true },
  { provedor: 'gemini', modelo: 'gemini-3.5-flash', arquivos: true },
  { provedor: 'pollinations', modelo: 'openai-fast', arquivos: false },
  { provedor: 'pollinations', modelo: 'openai', arquivos: false },
];

const TEMPO_MAX = 45_000;

export type Arquivo = { mime: string; base64: string };

export const iaLigada = () => !!(process.env.GEMINI_API_KEY || process.env.POLLINATIONS_API_KEY);

async function comPrazo<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TEMPO_MAX);
  try { return await fn(ctrl.signal); } finally { clearTimeout(t); }
}

async function gemini(modelo: string, sistema: string, texto: string, arquivos: Arquivo[]): Promise<string> {
  return comPrazo(async (signal) => {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY!.trim() },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: 'user', parts: [...arquivos.map((a) => ({ inlineData: { mimeType: a.mime, data: a.base64 } })), { text: texto }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    return String(j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '');
  });
}

async function pollinations(modelo: string, sistema: string, texto: string): Promise<string> {
  return comPrazo(async (signal) => {
    const res = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY?.trim()}` },
      body: JSON.stringify({ model: modelo, temperature: 0, messages: [{ role: 'system', content: sistema }, { role: 'user', content: texto }] }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    return String(j?.choices?.[0]?.message?.content ?? '');
  });
}

/** Lê o JSON de uma resposta que pode vir com cerca de código (```json ... ```). */
function json(txt: string): Record<string, unknown> | null {
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

/** Extrai um objeto JSON tentando a fila. Arquivos (PDF, foto) só vão para quem lê arquivo; sem arquivo, todos servem. */
export async function extrairJson(sistema: string, texto: string, arquivos: Arquivo[] = []): Promise<{ dados: Record<string, unknown>; modelo: string }> {
  const erros: string[] = [];
  for (const t of FILA) {
    if (arquivos.length && !t.arquivos) continue;
    if (t.provedor === 'gemini' && !process.env.GEMINI_API_KEY) continue;
    if (t.provedor === 'pollinations' && !process.env.POLLINATIONS_API_KEY) continue;
    try {
      const bruto = t.provedor === 'gemini' ? await gemini(t.modelo, sistema, texto, arquivos) : await pollinations(t.modelo, sistema, texto);
      const dados = json(bruto);
      if (dados) return { dados, modelo: `${t.provedor}/${t.modelo}` };
      erros.push(`${t.provedor}/${t.modelo}: resposta sem JSON`);
    } catch (e) {
      erros.push(`${t.provedor}/${t.modelo}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(`Todos os provedores de IA falharam [${erros.join(' | ')}]`);
}
