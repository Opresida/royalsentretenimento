// DJ LUCCO · conteúdo da página /artistas/lucco (pedido do Humberto, 29/10/2026). Tudo vem do presskit v6
// (D:\CLIENTES BRANDSQUADS\Royals Entretenimento\DJ LUCCO\Presskit), que o próprio artista conferiu pelo cadastro
// (/cadastro-artista/lucco). Nada inventado: o que ele não respondeu (camarim, nomes do line-up) fica genérico ou fora.
// Mídia (fotos, vídeos, áudios, onda do set) é gerada por scripts/lucco-midia.mjs em lucco-midia.json.
import midia from './lucco-midia.json';

export const LUCCO = {
  nome: 'LUCCO',
  generos: ['House', 'Tech House', 'Afro House'],
  base: 'Aracaju · SE',
  instagram: { usuario: 'luccodj', url: 'https://www.instagram.com/luccodj/' },
  soundcloud: { url: 'https://soundcloud.com/alaf-santos-938996911', set: midia.set.url },
  sunHype: { usuario: 'suunhype', url: 'https://www.instagram.com/suunhype/' },
  drive: 'https://drive.google.com/drive/folders/1DqJfpj83MPrbmw3Rqa_XeNQtrr8y2nK7',
  email: 'luccodjj@gmail.com',
  creditoFotos: '@bocaalvess',
};

export const BIO = [
  'LUCCO é DJ e produtor de House, Tech House e Afro House, artista do casting da Royals Entretenimento e da gravadora Royals Records.',
  'Nascido e criado em Aracaju, começou em 2020 tocando nos afters entre amigos. Em 2024, assumiu a carreira artística e hoje é criador e CEO da SUN HYPE, marca que conecta música e natureza.',
  'O groove do House com a pegada do Tech House: sets pensados para segurar a pista do primeiro ao último disco. Na Sunrise, abrindo a noite para LIU, gravou ao vivo o SET SUNRISE.',
];

export const NUMEROS = [
  { valor: '2024', rotulo: 'carreira artística' },
  { valor: 'Ibiza', rotulo: 'Beach Club e rádio Playabout' },
  { valor: 'SUN HYPE', rotulo: 'criador e CEO' },
];

/** Palcos e pistas: o que está no presskit, com cidade quando ele informou. */
export const PALCOS = [
  { nome: 'Beach Club Ibiza', onde: 'Ibiza · Espanha', destaque: true },
  { nome: 'Playabout Ibiza', onde: 'rádio · Ibiza, Espanha', destaque: true },
  { nome: 'Sunrise', onde: 'warm-up para LIU' },
  { nome: 'Réveillon Milagres', onde: 'beach club · Milagres, AL' },
  { nome: 'Manipura Club', onde: 'Aracaju, SE' },
  { nome: 'SUN HYPE', onde: 'o evento dele' },
  { nome: 'SUN RISE', onde: 'evento' },
  { nome: 'Shild Club', onde: 'Nordeste' },
  { nome: 'Bali Night', onde: 'Nordeste' },
];
export const CIDADES = ['Ibiza · Espanha', 'Aracaju · SE', 'Milagres · AL'];
export const TIPOS_DE_EVENTO = ['Clubes', 'Beach clubs', 'Sunset / pôr do sol'];

export const SUN_HYPE = {
  lema: 'Conexão · Música · Movimento',
  frase: 'Sun Hype não é só uma festa. É memória.',
  texto: 'Criada e comandada pelo LUCCO, a SUN HYPE leva a música para perto da natureza: cada edição acontece junto ao mar, ao rio ou ao pôr do sol. Agora a marca abre também o formato Wellness.',
  // próxima edição: o card some sozinho depois do fim do evento
  proxima: { titulo: 'SUN HYPE On Board', edicao: 'III edição', data: '29.11.2026', horario: '10h30 às 18h', fim: '2026-11-29T18:00:00-03:00', texto: 'Um catamarã pelas ilhas de Sergipe, saindo da Orlinha Pôr do Sol (Crôa do Goré), com 6 DJs no line-up.' },
};

export const FORMATOS = [
  { nome: 'Warm-up', texto: 'Aquece a pista antes do headliner.' },
  { nome: 'Set principal', texto: 'House e Tech House no horário de pico.' },
  { nome: 'Sunset', texto: 'Do dia ao pôr do sol: praia, open-air e barco.', destaque: true },
  { nome: 'Closing', texto: 'Fecha a noite no alto.' },
];
export const DURACAO = '1h até long set';

export const RIDER = {
  equipamento: [
    ['2 × Pioneer CDJ-3000 ou CDJ-3000X', 'linkados'],
    ['1 × mixer Pioneer DJM-900 ou DJM-A9', ''],
    ['2 × monitores de retorno na cabine', 'controle de volume'],
    ['Cabine firme, na altura da cintura', ''],
    ['Tomada 220 V / 110 V perto da cabine', ''],
    ['Fone e pen drives', 'do artista'],
  ],
  camarim: [
    ['Água e gelo na cabine', ''],
    ['Toalha', ''],
    ['Acesso para o artista + 1', ''],
    ['Passagem e hospedagem', 'fora de Aracaju'],
    ['Transporte local', ''],
  ],
};

/** Faixas do player: o set completo (SoundCloud) + trechos ao vivo (o som dos vídeos dele, no R2). */
export type Faixa =
  | { tipo: 'set'; id: string; titulo: string; sub: string; dur: number; picos: number[]; trackId: number | null; url: string; capa: string }
  | { tipo: 'trecho'; id: string; titulo: string; sub: string; dur: number; picos: number[]; src: string; capa: string };

const T = midia.audios;
const V = midia.videos;
export const FAIXAS: Faixa[] = [
  { tipo: 'set', id: 'set-sunrise', titulo: 'SET SUNRISE', sub: 'Set completo · warm-up para LIU · SoundCloud', dur: midia.set.dur ?? 3661, picos: midia.set.picos ?? [], trackId: midia.set.id, url: midia.set.url, capa: '/artistas/lucco/fotos/warmup-640.webp' },
  { tipo: 'trecho', id: 'warmup-sunrise', titulo: 'Warm-up · Sunrise', sub: 'Ao vivo · abrindo para LIU', ...T['warmup-sunrise'], capa: V['warmup-sunrise'].capa },
  { tipo: 'trecho', id: 'praia', titulo: 'Pôr do sol na praia', sub: 'Ao vivo · sunset', ...T.praia, capa: V.praia.capa },
  { tipo: 'trecho', id: 'pista', titulo: 'Pista cheia', sub: 'Ao vivo · noite', ...T.pista, capa: V.pista.capa },
  { tipo: 'trecho', id: 'cabine', titulo: 'Na cabine', sub: 'Ao vivo · clube', ...T.cabine, capa: V.cabine.capa },
  { tipo: 'trecho', id: 'open-air', titulo: 'Open-air de dia', sub: 'Ao vivo · ao ar livre', ...T['open-air'], capa: V['open-air'].capa },
];

/** Vídeos "ao vivo" (tocam com som só no clique). */
export const VIDEOS = [
  { id: 'warmup-sunrise', titulo: 'Warm-up · Sunrise', ...V['warmup-sunrise'] },
  { id: 'praia', titulo: 'Pôr do sol na praia', ...V.praia },
  { id: 'pista', titulo: 'Pista cheia', ...V.pista },
  { id: 'cabine', titulo: 'Na cabine', ...V.cabine },
  { id: 'open-air', titulo: 'Open-air de dia', ...V['open-air'] },
];
export const TOPO = { desktop: V['topo-desktop'], celular: V['topo-celular'] };

/** Fotos: caminho base em public/artistas/lucco/fotos (sem a largura) + proporção. */
const F = midia.fotos as Record<string, { w: number; h: number; larguras: number[] }>;
export const foto = (nome: string, alt = '') => ({ base: `/artistas/lucco/fotos/${nome}`, w: F[nome].w, h: F[nome].h, larguras: F[nome].larguras, alt });
export const GALERIA = [
  foto('capa', 'LUCCO de casaco caramelo e fone, fazendo o sinal do rock'),
  foto('vivo4', 'LUCCO tocando com o sol de neon atrás'),
  foto('g1', 'LUCCO de jaqueta varsity preta'),
  foto('retrato-alta', 'LUCCO na cabine, com luz vermelha e telão'),
  foto('g7', 'Close do LUCCO com óculos laranja e fone'),
  foto('praia2', 'LUCCO tocando na praia'),
  foto('g2', 'LUCCO de boné e regata do Brasil'),
  foto('vivo1', 'LUCCO na cabine com luz vermelha'),
  foto('g6', 'LUCCO de fone, mão no rosto'),
  foto('g3', 'LUCCO de casaco caramelo e fone'),
  foto('vivo3', 'LUCCO tocando sob luz laranja'),
  foto('g8', 'Retrato do LUCCO de camiseta preta'),
];
