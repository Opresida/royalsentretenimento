// Dados fixos do site da Royals. Só contatos e links verificados (regra da marca: nada inventado).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://royalsentretenimento.vercel.app';
export const NOME = 'Royals Entretenimento';
export const DESCRICAO = 'Produtora de eventos de trap e funk em Manaus. Próximos eventos, ingressos no canal oficial e o acervo de todas as edições.';

export const MENU = [
  { rotulo: 'Eventos', href: '/eventos' },
  { rotulo: 'Relembre momentos', href: '/relembre-momentos' },
  { rotulo: 'Vídeos', href: '/melhores-momentos' },
  { rotulo: 'Promoters', href: '/promoters' },
  { rotulo: 'Para produtores', href: '/produtores' },
  { rotulo: 'Sobre', href: '/sobre' },
];

/** WhatsApp de booking da Royals (contratação de artistas do casting), só dígitos com 55 + DDD.
 *  Principal: Renan Correa (92) 98140-4577. Segundo contato: Ricardo Garrido (47) 99687-7069 (BOOKING_CONTATOS).
 *  Se voltar a null, o "Contratar" das páginas de artista abre o direct do Instagram. */
export const WHATSAPP_BOOKING: string | null = '5592981404577';
export const BOOKING_CONTATOS = [
  { nome: 'Renan Correa', whatsapp: '5592981404577', exibido: '(92) 98140-4577' },
  { nome: 'Ricardo Garrido', whatsapp: '5547996877069', exibido: '(47) 99687-7069' },
] as const;
export const linkWhatsApp = (numero: string, mensagem: string) => `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
