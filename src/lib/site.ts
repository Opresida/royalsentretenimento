// Dados fixos do site da Royals. Só contatos e links verificados (regra da marca: nada inventado).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://royalsentretenimento.vercel.app';
export const NOME = 'Royals Entretenimento';
export const DESCRICAO = 'Produtora de eventos de trap e funk em Manaus. Próximos eventos, ingressos no canal oficial e o acervo de todas as edições.';

export const MENU = [
  { rotulo: 'Eventos', href: '/eventos' },
  { rotulo: 'Relembre momentos', href: '/relembre-momentos' },
  { rotulo: 'Vídeos', href: '/melhores-momentos' },
  { rotulo: 'Promoters', href: '/promoters' },
  { rotulo: 'Sobre', href: '/sobre' },
];
