// DJ BERTOLOSSI · conteúdo da página /artistas/bertolossi (pedido do Humberto, 31/10/2026). O texto é o do presskit v2
// aprovado (D:\CLIENTES BRANDSQUADS\Royals Entretenimento\DJ BERTOLOSSI\Presskit\copy-v2.txt, com a fonte de cada fato):
// voz "produtor pra produtor", sem frase de IA, nada inventado. Cadastro respondido pelo Marcos Paulo (produtor dele) +
// complemento do Humberto; números conferidos no Spotify e no SoundCloud em 31/10/2026.
// Mídia (fotos, vídeos, áudios, ondas do SoundCloud) é gerada por scripts/bertolossi-midia.mjs em bertolossi-midia.json.
import midia from './bertolossi-midia.json';

export const BERTO = {
  nome: 'DJ BERTOLOSSI',
  base: 'Morro do Martins · São Gonçalo · RJ',
  instagram: { usuario: 'djbertolossi', url: 'https://www.instagram.com/djbertolossi/' },
  soundcloud: 'https://soundcloud.com/djbertolossi',
  spotify: 'https://open.spotify.com/artist/75MGRS4iY2kusB2g0i43Bq',
  drive: 'https://drive.google.com/drive/folders/1uYPprBfez0PBhwpdGN0oI5WiHnXNTjv9',
};

export const QUEM = {
  titulo: 'Matheus tem 29 anos e toca desde 2014.',
  texto: 'Cresceu no Morro do Martins vendo o baile da área e os DJs de lá, como Yago Gomes, Selminho e R15. Hoje produz tudo o que lança: a batida, a montagem e o efeito saem do computador dele.',
  hitmaker: 'Hitmaker é criador de hit. São mais de dez na conta, e ele mesmo produziu todos.',
  acidPro: 'Acid Pro é o programa em que ele produz. O apelido é pra quem domina o programa e tira dele beat, montagem e efeito diferente.',
};

/** Parede de números (conferidos em 31/10/2026). */
export const NUMEROS = {
  data: '31.10.2026',
  vidaRasaSpotify: '9.781.614',
  cartazes: [
    { rot: 'Spotify', valor: '82 mil', texto: 'pessoas ouvem ele por mês.', cor: 'papel' },
    { rot: 'SoundCloud', valor: '75 mil', texto: 'seguidores. Perfil verificado, 489 faixas.', cor: 'rosa' },
    { rot: 'Instagram e TikTok', valor: '135 mil', texto: 'no Instagram e 53 mil no TikTok.', cor: 'escuro' },
    { rot: 'e tem mais', valor: 'Piquezinho dos Crias 2,5 mi', texto: 'Tamborzinho do Martins tem 1,86 milhão de plays no Spotify.', cor: 'papel' },
  ],
  anota: 'Sequência das Antigas 2: 728 mil no SoundCloud',
};

const capa = (n: string) => `/artistas/bertolossi/fotos/capas/${n}.webp`;
const sp = (t: string) => `https://open.spotify.com/track/${t}`;
const al = (a: string) => `https://open.spotify.com/album/${a}`;

/** Parcerias (Spotify, Apple Music e Genius, conferidos em 31/10/2026). */
export const PARCERIAS = [
  {
    nome: 'MC Carol', cor: 'rosa',
    texto: ['Barbaridades tá no álbum da MC Carol, o Borogodó, de 2021. Ele divide a faixa com ela e assina a composição. 217 mil plays no Spotify.', 'Em 2024 os dois voltaram juntos no remix de Conto do Vigário.'],
    faixas: [
      { titulo: 'Barbaridades', capa: capa('borogodo'), url: sp('671vasXoQf0Ddi23Q6VnY9') },
      { titulo: 'Conto do Vigário (Remix)', capa: capa('conto-do-vigario'), url: sp('3CURIugtU9ohDLylv6ddp1') },
    ],
  },
  {
    nome: 'Sodré', cor: 'poste', selo: 'Warner Music',
    texto: ['Louca de Gin, do Sodré, saiu em 2020 pela Ideal Hit, com licença da Warner Music. A produção é do Bertolossi.'],
    faixas: [{ titulo: 'Louca de Gin', capa: capa('louca-de-gin'), url: sp('4V1givNXdA4nkybfueAqxT') }],
  },
  {
    nome: 'Kevin O Chris', cor: 'flash',
    texto: ['Com o Kevin O Chris ele lançou Elas Pulam na Piscina, em 2020, e Bom Dia, Bom Dia, com o MC Jajau, em 2021.'],
    faixas: [
      { titulo: 'Elas Pulam na Piscina', capa: capa('elas-pulam'), url: al('0ntWykvyvJ2teW8kErHSSq') },
      { titulo: 'Bom Dia, Bom Dia', capa: capa('bom-dia'), url: al('15vBzoDsGBSex08b9zT7yV') },
    ],
  },
];
export const MAIS_MCS = ['MC GW', 'Os Quebradeiras', 'Mapu', 'MC Jhonny Oliver', 'MC Gordinho do Catarina', 'MC Lekão', 'MC Darlan', 'MC Aleff', 'MC Flavinho', 'MC Orelha', 'MC LC do Escadão', 'Blogueirinho da Colina', 'MC Rodrigo do CN', 'MC Rkostta'];
export const MAIS_DJS = ['DJ Biel do Furduncinho', 'DJ LC de Niterói', 'DJ Lafon do MD', 'DJ RD do Martins', 'DG do Brooklyn', 'DJ JR do MD', 'DJ 2F'];

/** Os 10 hits, na ordem escolhida pela equipe dele (anos e plays do Spotify). */
export const HITS = [
  { titulo: 'Sequência do Peito' },
  { titulo: 'Elas Pulam na Piscina', info: 'com Kevin O Chris · 2020' },
  { titulo: 'Tamborzinho do Martins', info: '1,86 mi' },
  { titulo: 'Piquezinho dos Crias', info: '2021 · 2,5 mi' },
  { titulo: 'Bom Dia, Bom Dia', info: 'com MC Jajau e Kevin O Chris · 2021' },
  { titulo: 'Vida Rasa 4-4-2', info: '2023 · 9,78 mi', destaque: true },
  { titulo: 'Famosa', info: '2024' },
  { titulo: 'É Gol do Brasil' },
  { titulo: 'A Barreira é o Mundo', info: '2024' },
  { titulo: 'Embola e Joga pro Ar', info: 'com Os Quebradeiras, MC GW e Mapu' },
];
export const CAPAS_HITS = [
  { capa: capa('vida-rasa'), alt: 'Capa de Vida Rasa 4-4-2' },
  { capa: capa('piquezinho'), alt: 'Capa de Piquezinho dos Crias' },
  { capa: capa('barreira'), alt: 'Capa de A Barreira é o Mundo' },
  { capa: capa('famosa'), alt: 'Capa de Famosa' },
];

export const HISTORIA = {
  titulo: ['O show que ele', 'mais lembra foi', 'em casa.'],
  textos: [
    'Foi no aniversário de São Gonçalo, a cidade dele. Era o primeiro show depois de perder o pai, a pessoa que mais apoiava ele em tudo. Ele subiu no palco e tocou pra cidade dele.',
    'Começou em 2014, tocando no próprio Martins. Depois levou o som pra Londres, em 2024, e pros Estados Unidos, em 2025. Continua morando em São Gonçalo.',
  ],
};

export const ESTRADA = [
  { ano: '2014', texto: 'começa no Martins' },
  { ano: '2023', texto: 'primeira turnê' },
  { ano: '2024', texto: 'primeiro show fora do país, em Londres' },
  { ano: '2025', texto: 'turnê nos EUA: Boston e Filadélfia' },
  { ano: '2026', texto: 'Manaus, pela Royals' },
];
export const CASAS = [
  { nome: 'Palm Club e Country', onde: 'Niterói' },
  { nome: 'Vitrinni e All In', onde: 'Rio de Janeiro' },
  { nome: 'Aniversário da Larah Juca', onde: 'Rio de Janeiro' },
  { nome: 'ITA Music', onde: 'Itaboraí' },
  { nome: 'O.C.U.L.T.O, no Allnight', onde: 'Manaus', destaque: true },
];
export const LETREIRO = ['Palm Club', 'Country', 'Vitrinni', 'All In', 'ITA Music', 'O.C.U.L.T.O', 'Londres', 'Boston', 'Filadélfia', 'Manaus', 'São Luís', 'Macapá'];
export const ESTADOS = ['Rio de Janeiro', 'Minas Gerais', 'Espírito Santo', 'Amapá', 'Maranhão', 'Amazonas'];

export const SHOW = {
  titulo: 'Set solo de 45 minutos a 1 hora, na XDJ-RX2 dele.',
  texto: 'Toca funk carioca, tamborzão, sequência das antigas, funk 150 e as montagens que faz no Acid Pro. Leva vídeo próprio pro telão: se a casa tiver LED, ele usa. Viaja com 1 ou 2 produtores.',
  estilos: ['Funk carioca · Ritmo RJ', 'Tamborzão', 'Acid Pro', 'Sequência das antigas', 'Funk 150 BPM'],
  onde: 'Casa noturna, baile de comunidade, festa universitária, festival, camarote, aniversário, evento de empresa e turnê fora do país.',
  light: 'Pra evento de empresa e festa de família tem versão light: Vida Rasa 442 Light, com DG do Brooklyn e DJ RD do Martins.',
};
export const RIDER = {
  tecnico: ['1 microfone sem fio', '1 tomada 110 V', '1 mesa praticável 2 × 1 m (até 1,50 m de altura)', '2 cabos XLR'],
  seDer: ['2 bicos de CO2 e 2 cilindros de 25 kg', 'Telão ou LED pro vídeo dele'],
  camarim: ['1 whisky Black Label', '8 Red Bull · 5 Budweiser', '5 Coca-Cola lata · 5 águas', '8 gelos de coco', '1 pizza grande calabresa + 4 queijos', '1 pizza grande frango com catupiry + portuguesa', '250 salgadinhos', 'Acesso pra equipe de 3 e convidados'],
  foraDoRio: 'Passagem, hospedagem, transporte e alimentação ficam com o contratante. Som, luz e estrutura seguem o que a equipe dele pedir.',
};

/** Faixas do player: as 4 do SoundCloud (escolha do Humberto) + trechos ao vivo (o som dos vídeos dele, no R2). */
export type FaixaBerto =
  | { tipo: 'sc'; id: string; titulo: string; sub: string; dur: number; picos: number[]; trackId: number | null; url: string; capa: string }
  | { tipo: 'trecho'; id: string; titulo: string; sub: string; dur: number; picos: number[]; src: string; capa: string };

type SetMidia = { url: string; id: number | null; dur: number | null; picos: number[] | null };
const S = (midia as unknown as { sets: Record<string, SetMidia> }).sets;
const A = (midia as unknown as { audios: Record<string, { src: string; dur: number; picos: number[] }> }).audios;
const V = (midia as unknown as { videos: Record<string, { mp4: string; capa: string; w: number; h: number }> }).videos;
const sc = (id: string, titulo: string, sub: string, capaFoto: string): FaixaBerto => ({ tipo: 'sc', id, titulo, sub, dur: S[id].dur ?? 600, picos: S[id].picos ?? [], trackId: S[id].id, url: S[id].url, capa: capaFoto });
const foto640 = (n: string) => `/artistas/bertolossi/fotos/${n}-640.webp`;

export const FAIXAS: FaixaBerto[] = [
  sc('sequencia-antigas-2', 'Sequência das Antigas 2', 'Com DJ Lafon · 728 mil no SoundCloud', foto640('vivo-1051')),
  sc('audiovisual-2025', 'Audio Visual Set 2025', 'Ao vivo no Baile do Martins · SoundCloud', foto640('bday-20')),
  sc('sequencia-antigas-003', 'Sequência das Antigas 003', 'Com DJ Lafon e DJ Geh da LGD · SoundCloud', foto640('casa-152')),
  sc('10-minutos-2026', '10 Minutos 2026', 'SoundCloud', foto640('vivo-1050')),
  { tipo: 'trecho', id: 'casa-cheia', titulo: 'Casa cheia', sub: 'Trecho ao vivo', ...A['casa-cheia'], capa: V['casa-cheia'].capa },
  { tipo: 'trecho', id: 'all-in', titulo: 'All In · Vida Rasa 4-4-2', sub: 'Trecho ao vivo · Rio de Janeiro', ...A['all-in'], capa: V['all-in'].capa },
  { tipo: 'trecho', id: 'larah-juca', titulo: 'Aniversário da Larah Juca', sub: 'Trecho ao vivo · Rio de Janeiro', ...A['larah-juca'], capa: V['larah-juca'].capa },
  { tipo: 'trecho', id: 'vitrinni', titulo: 'Vitrinni', sub: 'Trecho ao vivo · Rio de Janeiro', ...A.vitrinni, capa: V.vitrinni.capa },
  { tipo: 'trecho', id: 'martins', titulo: 'No Martins', sub: 'Trecho ao vivo · São Gonçalo', ...A.martins, capa: V.martins.capa },
];

/** Vídeos "ao vivo" (tocam com som só no clique). */
export const VIDEOS = [
  { id: 'casa-cheia', titulo: 'Casa cheia', ...V['casa-cheia'] },
  { id: 'light', titulo: 'Light', ...V.light },
  { id: 'all-in', titulo: 'All In · Vida Rasa', ...V['all-in'] },
  { id: 'larah-juca', titulo: 'Larah Juca', ...V['larah-juca'] },
  { id: 'vitrinni', titulo: 'Vitrinni', ...V.vitrinni },
  { id: 'country', titulo: 'Country · Niterói', ...V.country },
  { id: 'martins', titulo: 'No Martins', ...V.martins },
];
export const TOPO = { desktop: V['topo-desktop'], celular: V['topo-celular'] };

/** Fotos: caminho base em public/artistas/bertolossi/fotos (sem a largura) + proporção. */
const F = (midia as unknown as { fotos: Record<string, { w: number; h: number; larguras: number[] }> }).fotos;
export const foto = (nome: string, alt = '', credito = '') => ({ base: `/artistas/bertolossi/fotos/${nome}`, w: F[nome].w, h: F[nome].h, larguras: F[nome].larguras, alt, credito });
export const GALERIA = [
  foto('vivo-1051', 'Bertolossi na cabine, cantando no microfone, com o letreiro BERTOLOSSI HITMAKER na mesa', 'ao vivo · @maltinho'),
  foto('ensaio-cabine', 'Bertolossi de preto em frente à cabine, com jatos de CO2 e a pista atrás', 'ensaio digital'),
  foto('casa-28', 'Bertolossi de branco sorrindo no palco, com a casa cheia', 'ao vivo'),
  foto('vivo-1054-pb', 'Bertolossi na cabine, em preto e branco', 'ao vivo · @maltinho'),
  foto('ensaio-beco', 'Bertolossi de casaco puffer num beco grafitado à noite', 'ensaio digital'),
  foto('g-light-34', 'Bertolossi acenando no meio do confete', 'ao vivo'),
  foto('vivo-1050', 'Bertolossi cantando de boné na cabine', 'ao vivo · @maltinho'),
  foto('ensaio-paredao', 'Bertolossi abrindo o casaco em frente a um paredão de som', 'ensaio digital'),
  foto('casa-152', 'Bertolossi de branco cantando na cabine com o nome dele na mesa', 'ao vivo'),
  foto('bday-58', 'Letreiro BERTOLOSSI aceso numa quadra à noite', 'ao vivo'),
  foto('ensaio-escadaria', 'Bertolossi agachado numa escadaria de comunidade à noite', 'ensaio digital'),
  foto('vivo-1053-pb', 'Bertolossi cantando, em preto e branco', 'ao vivo · @maltinho'),
];

export const CONTRATAR = {
  titulo: ['Pra fechar data no Amazonas,', 'é com a Royals.'],
  texto: 'Ele já tocou em Manaus com a gente, no O.C.U.L.T.O, em outubro. Manda a data, a cidade e o local do evento que a gente responde.',
  formatos: ['Set solo (45 min a 1 h)', 'Versão light', 'Ainda não sei'],
};
