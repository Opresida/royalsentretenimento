// Os eventos da Royals, levantados das legendas do próprio Instagram (@royalsentretenimento) em 15/10/2026.
// Regra da marca: nada inventado. Data, local e atrações só entram se estiverem escritos nas legendas (ou, no caso do
// Baile das Bruxas, no site oficial do evento). O que a legenda não diz fica de fora (ex.: o local do Sente a Vibe 2.0).
// `janela` = período de posts do Instagram que pertencem ao evento (do anúncio ao agradecimento depois da festa).
// Os artistas aparecem pelo nome artístico; o @ fica só no Instagram.

export type Evento = {
  slug: string;
  nome: string;
  edicao?: string;
  data: string;            // AAAA-MM-DD
  hora?: string;
  local?: string;
  cidade: string;
  atracoes: string[];
  resumo?: string;
  janela: [string, string];
  /** palavras da legenda que puxam o post para este evento mesmo fora da janela (dias em que dois eventos se cruzam) */
  palavras?: RegExp;
  /** cor de destaque do evento (marca endossada: só a cor muda, o resto é Royals). Contraste conferido com --event-on-accent. */
  cor?: string;
  sobreCor?: string;
  ingressos?: string;
  ingressosOnde?: string;
  apresentam?: string[];
  /** marcas que coproduzem o evento com a Royals: a assinatura vira "Apresentam" com as logos (monocromáticas, marfim) */
  parceiros?: { nome: string; logo: string }[];
  logo?: string;
  capa?: string;            // id do post do Instagram usado como capa
  /** post da vitrine "No Instagram" da home, quando não é a capa: o flyer ou a capa de reel mais profissional do evento
   *  (curadoria de 16/10 com scripts/curadoria-instagram.mjs). Sem ele, a vitrine usa a `capa`. */
  vitrine?: string;
  /** capa fora do Instagram (key visual do evento): caminho em public/ sem o sufixo -600.webp / -1600.webp */
  capaImagem?: string;
  destaque?: string;        // id do reel usado no topo
  /** versão 16:9 do vídeo do topo para o desktop (montada com a metade esquerda livre para o bloco do evento) */
  videoDesktop?: { video: string; capa: string; som?: boolean };
  /** versão 9:16 do vídeo do topo para o CELULAR, montada com o conteúdo no alto e a metade de baixo livre para o bloco
   *  do evento (remotion-studio: Baile-Chefin-Apresentacao-Celular → scripts/video-celular.mjs) */
  videoCelular?: { video: string; capa: string; som?: boolean };
  /** site oficial do evento, quando existe */
  site?: string;
  /** arte 4:5 sob medida para o CARTÃO do evento (agenda), sem data (o cartão escreve) e com o canto de cima à
   *  esquerda livre para o selo: caminho em public/ sem o sufixo -600.webp / -1200.webp */
  cartaoImagem?: string;
  /** imagem de compartilhamento (Open Graph, 1200×630) exclusiva do evento, em public/ */
  og?: string;
  /** perfil do evento no Instagram (botão no topo da página quando ainda não há ingresso) */
  instagram?: string;
  /** sem atração anunciada: a régua mostra o estilo musical no lugar (texto do próprio evento) */
  estilo?: string;
  /** ingressos ainda não abertos: a página mostra a chamada "em breve" (nada de link inventado) */
  ingressosEmBreve?: boolean;
  /** rótulo da assinatura com os parceiros (padrão: "Apresentam") */
  rotuloAssinatura?: string;
  /** evento próximo que NÃO assume o topo da home (decisão do Humberto: o Baile segue no topo) */
  foraDoTopoHome?: boolean;
  /** fotos que não estão no Instagram da Royals (ex.: perfil do próprio evento), já no R2 (scripts/galeria-externa.mjs) */
  galeriaExterna?: { olho: string; titulo: string; descricao: string; itens: { id: string; w: number; h: number; p: string; g: string; link?: string }[] };
};

export const EVENTOS: Evento[] = [
  {
    // Varandinha (19/10/2026): Royals × Cúpulla. Data, horário, local, endereço e slogan passados pelo Humberto; estilo e
    // "uma experiência fora do comum" vêm da bio do @_varandiinha. As fotos são das edições de 2024 (perfil do evento).
    slug: 'varandinha', nome: 'Varandinha', edicao: 'Manaus', data: '2026-11-01', hora: 'a partir das 16h', local: 'Cúpulla', cidade: 'Manaus',
    atracoes: [], estilo: 'Pagode · Sertanejo · Eletrônica',
    resumo: 'A Varandinha mais charmosa da cidade. Pagode, sertanejo e eletrônica numa experiência fora do comum, na Cúpulla, Av. João Valério, 209.',
    janela: ['2026-10-19', '2026-11-30'], palavras: /varandinha|varandiinha/i, cor: '#B9C6A8', sobreCor: '#24361D',
    ingressosEmBreve: true, instagram: 'https://www.instagram.com/_varandiinha/', foraDoTopoHome: true,
    rotuloAssinatura: 'Realização', apresentam: ['Royals', 'Cúpulla'],
    parceiros: [{ nome: 'Cúpulla', logo: '/eventos/varandinha/parceiros/cupulla.webp' }], logo: '/eventos/varandinha/logo.webp', capaImagem: '/eventos/varandinha/capa', og: '/eventos/varandinha/og.jpg', cartaoImagem: '/eventos/varandinha/cartao',
    videoDesktop: { video: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha-16x9.mp4', capa: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha-16x9-capa.webp' },
    videoCelular: { video: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha-9x16.mp4', capa: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha-9x16-capa.webp' },
    galeriaExterna: {
      olho: 'Edições anteriores', titulo: 'Como é a Varandinha',
      descricao: 'Fotos das edições de 2024, do Instagram oficial @_varandiinha.',
      itens: [{"id":"varandinha-edicao-01","w":1350,"h":1687,"p":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-01-600.webp","g":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-01-1600.webp","link":"https://www.instagram.com/_varandiinha/"},{"id":"varandinha-edicao-02","w":1440,"h":1800,"p":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-02-600.webp","g":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-02-1600.webp","link":"https://www.instagram.com/_varandiinha/"},{"id":"varandinha-edicao-03","w":1440,"h":1800,"p":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-03-600.webp","g":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-03-1600.webp","link":"https://www.instagram.com/_varandiinha/"},{"id":"varandinha-edicao-05","w":1080,"h":1080,"p":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-05-600.webp","g":"https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/varandinha/edicao-05-1600.webp","link":"https://www.instagram.com/_varandiinha/"}],
    },
  },
  {
    slug: 'baile-das-bruxas', nome: 'Baile das Bruxas', data: '2026-11-13', hora: '21h00', local: 'Tarumã Fest', cidade: 'Manaus',
    atracoes: ['Chefin'], resumo: 'O último baile do ano. Chefin desembarca no Tarumã Fest.',
    janela: ['2026-10-10', '2026-11-30'], palavras: /bruxas/i, cor: '#FF7A14', sobreCor: '#050505',
    ingressos: 'https://app.igare.com.br/e/baile-das-bruxas-2', ingressosOnde: 'Igarê',
    apresentam: ['Royals', '100 Mídia', 'Baile do Poderoso'],
    parceiros: [{ nome: '100 Mídia', logo: '/eventos/baile-das-bruxas/parceiros/100-midia.webp' }, { nome: 'Baile do Poderoso', logo: '/eventos/baile-das-bruxas/parceiros/baile-do-poderoso.webp' }], logo: '/eventos/baile-das-bruxas/logo.png', site: 'https://bailedasbruxas.vercel.app', capaImagem: '/eventos/baile-das-bruxas/capa',
    videoDesktop: { video: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/baile-das-bruxas-chefin-16x9-som.mp4', capa: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/baile-das-bruxas-chefin-16x9-som-capa.webp', som: true },
    videoCelular: { video: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/baile-das-bruxas-chefin-9x16-som.mp4', capa: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/eventos/baile-das-bruxas-chefin-9x16-som-capa.webp', som: true },
  },
  {
    slug: 'oculto-manaus', capa: '18115312337083200', vitrine: '18118029238934885', nome: 'O.C.U.L.T.O', edicao: '4ª edição · Manaus', data: '2026-10-11', hora: '22h00', local: 'All Night Pub', cidade: 'Manaus',
    atracoes: ['Flakke', 'DJ Bertolossi', 'Jyou Guerra'],
    resumo: 'Depois de Balneário Camboriú, Maceió e Aracaju, a O.C.U.L.T.O desembarcou em Manaus para a maior edição da história.',
    janela: ['2026-09-01', '2026-10-09'], palavras: /o\.?c\.?u\.?l\.?t\.?o|festaoculto/i, cor: '#B9B9B6', sobreCor: '#050505',
  },
  {
    slug: 'halloween-da-royals-2025', capa: '18039794447437829', nome: 'Halloween da Royals', data: '2025-10-10', local: 'All Night Pub', cidade: 'Manaus',
    atracoes: ['Caio Luccas'], resumo: 'A noite mais assustadora do ano, com show exclusivo do Caio Luccas.',
    janela: ['2025-08-20', '2025-10-31'],
  },
  {
    slug: 'orochi-exclusive', capa: '18300098866172895', vitrine: '17955376481951092', nome: 'Orochi Exclusive', data: '2025-06-14', local: 'All Night Pub', cidade: 'Manaus',
    atracoes: ['Orochi'], resumo: 'A volta da Royals, com o show exclusivo do Orochi.',
    janela: ['2025-05-01', '2025-07-31'],
  },
  {
    slug: 'trapzin', capa: '17919157664410349', nome: 'Trapzin', data: '2022-08-13', cidade: 'Manaus',
    atracoes: ['Delacruz', 'MD Chefe', 'Azzy', 'Dom Laike', 'Coletivo 333'], resumo: 'Em parceria com a Lyon Produções.',
    janela: ['2022-07-01', '2022-08-31'],
  },
  {
    slug: 'manaus-trap-festival', capa: '17914784342441281', nome: 'Manaus Trap Festival', data: '2022-06-03', local: 'Espaço Via Torres', cidade: 'Manaus',
    atracoes: ['TZ da Coronel', 'MC Maneirinho', 'PK Freestyle', 'Felp Cacife', 'Hyperanhas'], resumo: 'Cinco atrações nacionais no maior festival de trap da cidade.',
    janela: ['2022-04-10', '2022-06-30'],
  },
  {
    slug: 'sente-a-vibe-2', capa: '18116420902283632', nome: 'Sente a Vibe', edicao: '2.0', data: '2022-03-26', cidade: 'Manaus',
    atracoes: ['Orochi', 'Chris Beats ZN', '2T Real'], resumo: 'A segunda edição do Sente a Vibe, com o Orochi de volta.',
    janela: ['2021-11-01', '2022-04-09'], palavras: /orochi|2treal|chrisbeats/i,
  },
  {
    slug: 'tribo-da-periferia', capa: '17887789906434261', nome: 'Tribo da Periferia', data: '2019-12-14', hora: '22h00', local: 'Tropical Hotel', cidade: 'Manaus',
    atracoes: ['Tribo da Periferia'], resumo: 'O último show de 2019.',
    janela: ['2019-11-10', '2019-12-31'],
  },
  {
    slug: 'hungria-e-orochi', capa: '18022152358243322', vitrine: '17892939658379625', nome: 'Hungria e Orochi', data: '2019-10-05', local: 'Copacabana', cidade: 'Manaus',
    atracoes: ['Hungria', 'Orochi'], resumo: 'O maior evento produzido pela Royals até então: mais de 5 mil pessoas.',
    janela: ['2019-09-06', '2019-11-09'],
  },
  {
    slug: 'baile-do-tue', capa: '18090259798022591', vitrine: '18049238449174816', nome: 'Baile do Tuê', data: '2019-09-13', local: 'Copacabana', cidade: 'Manaus',
    atracoes: ['Matuê', 'Wiu'], resumo: 'O primeiro Baile do Tuê em Manaus, com lançamento ao vivo de "Kenny G".',
    janela: ['2019-08-06', '2019-09-17'],
  },
  {
    slug: 'e-o-trap-e-o-rap-e-o-funk', capa: '17884562449370879', nome: 'É o Trap É o Rap É o Funk', data: '2019-08-03', local: 'Copacabana', cidade: 'Manaus',
    atracoes: ['Jovem Dex', 'Recayd Mob', 'WC no Beat'], resumo: 'Três atrações nacionais escolhidas pelo público.',
    janela: ['2019-06-10', '2019-08-05'],
  },
  {
    slug: 'sente-a-vibe', capa: '17991857668205570', nome: 'Sente a Vibe', edicao: '1ª edição', data: '2019-06-01', hora: '21h00', local: 'Arena Tropical', cidade: 'Manaus',
    atracoes: ['Matuê', 'Xamã', 'Orochi'], resumo: 'O maior festival de trap que Manaus já tinha visto.',
    janela: ['2019-03-25', '2019-06-09'],
  },
  {
    slug: 'baile-da-royals', capa: '18008415523086060', nome: 'Baile da Royals', data: '2019-02-22', local: 'Copacabana', cidade: 'Manaus',
    atracoes: ['MC L da Vinte', 'Lucas e Bianchi', 'Leon Correia'], resumo: 'MC L da Vinte pela primeira vez em Manaus, com o hit "Parado no Bailão".',
    janela: ['2019-02-05', '2019-03-10'], palavras: /da ?vinte|bail(ã|a)o|baile da royals|lucasebianchi|leoncorreia/i,
  },
  {
    slug: 'bloquinho-da-realeza', capa: '17983959862197054', vitrine: '17914871680279094', nome: 'Bloquinho da Realeza', data: '2019-01-27', hora: '15h00', local: 'Copacabana', cidade: 'Manaus',
    atracoes: ['Vem K Sambar', 'Prata Filho', 'João Victor e Rodrigo', 'Marrakesh', 'John Veiga', 'DJ Ítalo'], resumo: 'O bloco de carnaval que abriu a história da Royals.',
    janela: ['2019-01-01', '2019-02-04'], palavras: /bloquinho/i,
  },
];
