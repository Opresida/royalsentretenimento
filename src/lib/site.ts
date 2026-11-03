// Dados fixos do site da Royals. Só contatos e links verificados (regra da marca: nada inventado).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://royalsentretenimento.vercel.app';
export const NOME = 'Royals Entretenimento';
export const DESCRICAO = 'Produtora de eventos de trap e funk em Manaus. Próximos eventos, ingressos no canal oficial e o acervo de todas as edições.';

export const MENU = [
  { rotulo: 'Eventos', href: '/eventos' },
  { rotulo: 'Artistas', href: '/artistas' },
  { rotulo: 'Relembre momentos', href: '/relembre-momentos' },
  { rotulo: 'Vídeos', href: '/melhores-momentos' },
  { rotulo: 'Promoters', href: '/promoters' },
  { rotulo: 'Para produtores', href: '/produtores' },
  { rotulo: 'Sobre', href: '/sobre' },
];

/** WhatsApp oficial da Royals (contratação de artistas do casting), só dígitos com 55 + DDD.
 *  Número oficial passado pelo Humberto em 31/10/2026: (79) 98116-9231 (substituiu Renan/Ricardo).
 *  Se voltar a null, o "Contratar" das páginas de artista abre o direct do Instagram. */
export const WHATSAPP_BOOKING: string | null = '5579981169231';
export const BOOKING_CONTATOS = [
  { nome: 'Royals Entretenimento', whatsapp: '5579981169231', exibido: '(79) 98116-9231' },
] as const;
export const linkWhatsApp = (numero: string, mensagem: string) => `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

/** Dados da empresa para contratos e papel timbrado (CNPJ enviado pelo Humberto em 31/10/2026; o resto vem do cadastro
 *  público da Receita, conferido na BrasilAPI e no CNPJ.ws no mesmo dia). É empresário individual: a razão social é o
 *  nome do titular, que assina pela empresa. Na Receita o nome fantasia é "Royals Soluções Financeiras"; nos documentos
 *  a marca usada é Royals Entretenimento. Dados bancários / Pix ainda não informados: o gerador pede no formulário. */
export const EMPRESA = {
  marca: 'Royals Entretenimento',
  razaoSocial: 'RICARDO MAIA GARRIDO DO NASCIMENTO',
  tipo: 'empresário individual',
  cnpj: '48.017.851/0001-73',
  endereco: 'Rua Barão do Rio Branco, 699, Flores, Manaus/AM, CEP 69058-581',
  cidade: 'Manaus/AM',
  representante: 'Ricardo Maia Garrido do Nascimento',
  cargo: 'titular',
  email: 'ricardo.garrido.adm@gmail.com',
} as const;
