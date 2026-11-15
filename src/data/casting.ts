// Casting da Royals (Royals Entretenimento + Royals Records) · página geral /artistas (pedido do Humberto, 03/11/2026).
// Tudo vem dos dados de cada artista (src/data/artistas) e do release de imprensa aprovado em 01/11/2026
// (D:\CLIENTES BRANDSQUADS\Royals Entretenimento\Imprensa\Lançamento Royals Records\fonte\conteudo.py). Nada inventado.
// Artista novo no casting = um item a mais em CASTING.
import * as B from './artistas/bertolossi';
import * as L from './artistas/lucco';
import midia from './casting-midia.json';

export type Trecho = { id: string; titulo: string; sub: string; src: string; dur: number; picos: number[]; capa: string };
export type FotoCasting = { base: string; w: number; h: number; larguras: number[]; alt: string; credito?: string };
export type Artista = {
  slug: string;
  nome: string;
  logo: string;
  base: string;
  generos: string;
  frase: [string, string]; // [começo, destaque]
  resumo: string;
  // cores da identidade do artista (as da página dele), usadas na "janela" de cada um
  cor: { fundo: string; tinta: string; destaque: string; fio: string };
  topo: { desktop: { mp4: string; capa: string }; celular: { mp4: string; capa: string } };
  numeros: { valor: string; rotulo: string }[];
  palcos: { titulo: string; itens: string[] };
  extra: { titulo: string; texto: string; itens?: string[] };
  trechos: Trecho[];
  videoCase: { mp4: string; capa: string };
  galeria: FotoCasting[];
  set: string;
  instagram: { usuario: string; url: string };
};

const trechos = (faixas: readonly { tipo: string }[], ids: string[]) =>
  ids.map((id) => faixas.find((f) => f.tipo === 'trecho' && (f as unknown as Trecho).id === id) as unknown as Trecho).filter(Boolean);
const C = (midia as { cases: Record<string, { mp4: string; capa: string }> }).cases;

export const CASTING: Artista[] = [
  {
    slug: 'lucco',
    nome: 'DJ LUCCO',
    logo: '/artistas/lucco/marca/lucco.svg',
    base: 'Aracaju · SE',
    generos: 'House · Tech House · Afro House',
    frase: ['Do groove ao', 'pôr do sol.'],
    resumo: 'DJ e produtor sergipano. Começou nos afters em 2020, subiu aos palcos em 2024 e levou o som até Ibiza. Criou e comanda a SUN HYPE, a festa que junta música e natureza.',
    cor: { fundo: '#120C08', tinta: '#F3E9DC', destaque: '#D9B98A', fio: 'rgba(217,185,138,.35)' },
    topo: L.TOPO,
    numeros: [
      { valor: 'Ibiza', rotulo: 'Beach Club Ibiza e rádio da Playabout' },
      { valor: '61 min', rotulo: 'SET SUNRISE, abrindo a noite do LIU' },
      { valor: 'SUN HYPE', rotulo: 'a festa dele, no mar, no rio e no pôr do sol' },
      { valor: '2024', rotulo: 'início da carreira artística' },
    ],
    palcos: { titulo: 'Onde já tocou', itens: L.PALCOS.map((p) => p.nome) },
    extra: { titulo: 'O que ele toca', texto: `${L.DURACAO}: do warm-up ao closing.`, itens: L.FORMATOS.map((f) => f.nome) },
    trechos: trechos(L.FAIXAS, ['warmup-sunrise', 'praia', 'pista']),
    videoCase: C.lucco,
    galeria: L.GALERIA.slice(0, 6),
    set: L.LUCCO.soundcloud.set,
    instagram: L.LUCCO.instagram,
  },
  {
    slug: 'bertolossi',
    nome: 'DJ BERTOLOSSI',
    logo: '/artistas/bertolossi/marca/bertolossi.svg',
    base: 'Morro do Martins · São Gonçalo · RJ',
    generos: 'Funk carioca · Tamborzão · Acid Pro',
    frase: ['A Vida Rasa 4‑4‑2', 'é dele.'], // hífen que não quebra: o 4-4-2 não se separa no celular
    resumo: 'Cria do Morro do Martins, toca desde 2014 e produz tudo o que lança: mais de dez hits na conta. Gravou com MC Carol, Sodré e Kevin O Chris, tocou em Londres e fez turnê nos EUA.',
    cor: { fundo: '#0C0C0E', tinta: '#F6F2EA', destaque: '#FF8A1E', fio: 'rgba(255,138,30,.35)' },
    topo: B.TOPO,
    numeros: [
      { valor: '+12 mi', rotulo: 'plays de Vida Rasa 4-4-2 somando as plataformas' },
      { valor: '82 mil', rotulo: 'ouvintes por mês no Spotify' },
      { valor: '10+', rotulo: 'hits, todos produzidos por ele' },
      { valor: 'Londres · EUA', rotulo: 'shows em 2024 e turnê em 2025' },
    ],
    palcos: { titulo: 'Onde já tocou', itens: B.CASAS.map((c) => `${c.nome} · ${c.onde}`) },
    extra: { titulo: 'Quem já gravou com ele', texto: 'Barbaridades com a MC Carol, Louca de Gin produzida pro Sodré e dois lançamentos com Kevin O Chris.', itens: B.PARCERIAS.map((p) => p.nome) },
    trechos: trechos(B.FAIXAS, ['all-in', 'casa-cheia', 'larah-juca']),
    videoCase: C.bertolossi,
    galeria: B.GALERIA.slice(0, 6),
    set: B.BERTO.soundcloud,
    instagram: B.BERTO.instagram,
  },
];

/** A gravadora, com o texto do release de imprensa. */
export const ROYALS_RECORDS = {
  linhaFina: 'A Royals Records começa com dois DJs: LUCCO, de house music, e BERTOLOSSI, cria do Morro do Martins com mais de dez hits no funk. Os dois têm agenda aberta para eventos no Amazonas.',
  textos: [
    'A Royals Records é a gravadora do grupo Royals. Ela cuida da agenda dos artistas do casting no Amazonas: casas noturnas, festas e produtores do estado fecham data direto com a Royals.',
    'Por trás está a Royals Entretenimento, com mais de dez anos de pista e mais de 100 mil ingressos vendidos. Foi ela que colocou Matuê, Xamã e Orochi no mesmo palco no Sente a Vibe, reuniu mais de 5 mil pessoas no show de Hungria e Orochi e trouxe a O.C.U.L.T.O para Manaus.',
  ],
  numeros: [
    { valor: '10+', rotulo: 'anos de pista' },
    { valor: '100 mil+', rotulo: 'ingressos vendidos' },
    { valor: '2', rotulo: 'artistas no casting' },
  ],
};

/** Vídeo do topo da home quando não há evento à venda (15/11/2026): o casting em loop, LUCCO + BERTOLOSSI, só imagem real
 *  dos shows. Fonte: remotion-studio src/royals/HeroArtistas.tsx (Royals-Hero-Artistas-16x9 e -9x16); preparo e envio ao
 *  R2 por scripts/video-desktop.mjs e scripts/video-celular.mjs. O 16:9 encosta à direita (as janelas dos artistas ficam
 *  à direita; telas mais quadradas cortam a esquerda, que é vazia). */
const R2 = 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos';
export const HERO_CASTING = {
  desktop: { video: `${R2}/hero-artistas-16x9-v1.mp4`, capa: `${R2}/hero-artistas-16x9-v1-capa.webp`, posicao: '100% 50%' },
  celular: { video: `${R2}/hero-artistas-9x16-v1.mp4`, capa: `${R2}/hero-artistas-9x16-v1-capa.webp` },
};
