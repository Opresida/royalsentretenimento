// O acervo do site: os posts do Instagram (src/data/instagram.json, gerado por scripts/instagram-sync.mjs) ligados aos
// eventos de src/data/eventos.ts. Só roda no servidor (o JSON não vai para o navegador).
import ig from '@/data/instagram.json';
import { EVENTOS, type Evento } from '@/data/eventos';
import capasVideos from '@/data/capas-videos.json';

export type Midia = { id: string; tipo: 'imagem' | 'video' | 'so-capa'; w: number; h: number; p: string; g: string; video?: string; duracao?: number | null };
export type Post = { id: string; data: string; tipo: 'reel' | 'carrossel' | 'video' | 'imagem'; legenda: string; link: string; curtidas: number | null; comentarios: number | null; midias: Midia[] };

export const PERFIL = ig.perfil as { usuario: string; nome: string; bio: string; site: string; seguidores: number; posts: number };
export const INSTAGRAM_URL = `https://www.instagram.com/${PERFIL.usuario}/`;
export const POSTS: Post[] = (ig.posts as Post[]).filter((p) => p.midias.length).sort((a, b) => b.data.localeCompare(a.data));

const dia = (iso: string) => iso.slice(0, 10);

/** A que evento pertence um post: primeiro pelas palavras da legenda, depois pela janela de datas. */
export function eventoDoPost(p: Post): Evento | undefined {
  const porPalavra = EVENTOS.find((e) => e.palavras && e.palavras.test(p.legenda) && dia(p.data) >= addDias(e.janela[0], -20) && dia(p.data) <= addDias(e.janela[1], 30));
  if (porPalavra) return porPalavra;
  return EVENTOS.find((e) => dia(p.data) >= e.janela[0] && dia(p.data) <= e.janela[1]);
}

function addDias(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const CACHE = new Map<string, Post[]>();
export function postsDoEvento(slug: string): Post[] {
  if (!CACHE.size) {
    for (const p of POSTS) {
      const e = eventoDoPost(p);
      const k = e?.slug ?? 'outros';
      CACHE.set(k, [...(CACHE.get(k) ?? []), p]);
    }
  }
  return CACHE.get(slug) ?? [];
}

export const evento = (slug: string) => EVENTOS.find((e) => e.slug === slug);

/** Hoje no fuso de Manaus (o site é gerado no build; os eventos viram "passados" no build seguinte ao dia da festa). */
export function hojeManaus() {
  return new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 10);
}
export const proximos = () => EVENTOS.filter((e) => e.data >= hojeManaus()).sort((a, b) => a.data.localeCompare(b.data));
export const passados = () => EVENTOS.filter((e) => e.data < hojeManaus()).sort((a, b) => b.data.localeCompare(a.data));

/** Mídia de capa do evento: a do post fixado em `capa`, senão a imagem do post mais curtido da janela. */
export function capaDoEvento(e: Evento): Midia | undefined {
  if (e.capaImagem) return { id: `${e.slug}-capa`, tipo: 'imagem', w: 1080, h: 1920, p: `${e.capaImagem}-600.webp`, g: `${e.capaImagem}-1600.webp` };
  const posts = postsDoEvento(e.slug);
  if (e.capa) {
    const p = posts.find((x) => x.id === e.capa);
    if (p) return p.midias[0];
  }
  const ordenados = [...posts].sort((a, b) => (b.curtidas ?? 0) - (a.curtidas ?? 0));
  return ordenados[0]?.midias[0];
}

/** O reel de destaque de um evento (para o topo das páginas): o fixado em `destaque`, senão o vídeo mais curtido. */
export function destaqueDoEvento(e: Evento): Midia | undefined {
  const posts = postsDoEvento(e.slug);
  if (e.destaque) {
    const p = posts.find((x) => x.id === e.destaque);
    if (p?.midias[0]?.video) return p.midias[0];
  }
  return [...posts].sort((a, b) => (b.curtidas ?? 0) - (a.curtidas ?? 0)).flatMap((p) => p.midias).find((m) => m.video);
}

/** Todas as mídias de um evento (carrosséis abertos), da mais nova para a mais antiga. */
export function midiasDoEvento(slug: string) {
  return postsDoEvento(slug).flatMap((p) => p.midias.map((m) => ({ ...m, post: p })));
}

/** Vídeos que ficam fora da biblioteca: gravações de tela de sorteio (lista de comentários), sem imagem da noite. */
const FORA_DA_BIBLIOTECA = /ganhador/i;

/** Os vídeos do acervo (com arquivo ou só com a capa do reel), do mais novo ao mais antigo. */
export function videos() {
  return POSTS.filter((p) => !FORA_DA_BIBLIOTECA.test(p.legenda)).flatMap((p) => p.midias.filter((m) => m.tipo !== 'imagem').map((m) => ({ ...m, post: p, evento: eventoDoPost(p) })));
}

/** Capa padronizada do vídeo (quadro escolhido + tratamento do brandbook, scripts/capas-videos.mjs), se existir. */
const CAPAS = capasVideos as Record<string, { p: string; g: string }>;
export const capaDoVideo = (m: Midia) => CAPAS[m.id];

/** Tipo do vídeo para o rótulo da capa, lido da legenda: a noite em si, recado/anúncio de atração, ou chamada de venda. */
export function tipoDeVideo(legenda: string) {
  if (/obrigad|gratid|como foi|que show|after ?movie|que evento|deu certo|como é bom estar de volta|vibe do baile/i.test(legenda)) return 'A noite';
  if (/recado|deu o papo|confirmad|está chegando|tá chegando|chegou|desembarca|revela|segredo|confirmou/i.test(legenda)) return 'Atração';
  return 'Anúncio';
}
/** Uma peça por evento (a de mais curtidas; `preferir` passa na frente), na ordem dos eventos, do mais novo para o mais antigo.
 *  Para as vitrines da home não ficarem tomadas pelo evento que mais postou (pedido do Humberto, 16/10). */
export function umPorEvento<T extends { post: Post }>(lista: T[], preferir?: (x: T) => boolean): T[] {
  const nota = (x: T) => (preferir?.(x) ? 1e9 : 0) + (x.post.curtidas ?? 0);
  const melhor = new Map<string, T>();
  for (const x of lista) {
    const e = eventoDoPost(x.post);
    if (!e) continue;
    const atual = melhor.get(e.slug);
    if (!atual || nota(x) > nota(atual)) melhor.set(e.slug, x);
  }
  return [...EVENTOS].sort((a, b) => b.data.localeCompare(a.data)).flatMap((e) => melhor.get(e.slug) ?? []);
}
/** Corta a lista no maior múltiplo de `passo`, para a grade fechar sem buraco na última fileira. */
export const fileirasCheias = <T,>(lista: T[], passo: number, max: number) => lista.slice(0, Math.min(max, Math.floor(lista.length / passo) * passo));
export const tempoDeVideo = (seg?: number | null) => (seg ? `${Math.floor(seg / 60)}:${String(Math.round(seg % 60)).padStart(2, '0')}` : undefined);

// ——— formatos ———
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const dataCurta = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
export const ano = (iso: string) => iso.slice(0, 4);
export const diaSemana = (iso: string) => SEMANA[new Date(`${iso}T12:00:00Z`).getUTCDay()];
export const dataExtensa = (iso: string) => `${Number(iso.slice(8, 10))} de ${MESES[Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`;
export const milhar = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : String(n));
/** Legenda sem hashtags e sem espaços sobrando. */
export const limpaLegenda = (t: string) => t.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
export const nomeCompleto = (e: Evento) => (e.edicao ? `${e.nome} ${e.edicao}` : e.nome);
