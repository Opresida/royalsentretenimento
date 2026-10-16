// Royals Tickets · dados do checkout de cada evento (/eventos/<slug>/checkout). Valores em CENTAVOS.
// Estrutura do modelo aprovado (D:\CLIENTES BRANDSQUADS\Royals Tickets\Checkout): ingressos por setor com inteira e meia,
// lote com contagem, taxa de serviço, limite por pedido, Pix e cartão processados pelo Pagar.me.
// Regra: nada inventado. Lote com contagem, depoimentos e "compras recentes" só entram com dado real (vazio = oculto).
// Enquanto `vendasAbertas` for false, o checkout é uma PRÉVIA (pedido do Humberto, 16/10: "só mostrar pros sócios"):
// fora do Google, sem link no site, e o "Pagar" avisa que a venda pelo site abre em breve e leva ao `linkExterno`.

export type Ingresso = {
  id: string;
  nome: string;
  descricao?: string;
  /** preço da inteira e da meia-entrada; meia ausente = setor sem meia */
  preco: number;
  meia?: number;
  disponivel: boolean;
  ultimos?: boolean;
  lote?: string;
};

export type DadosCheckout = {
  vendasAbertas: boolean;
  linkExterno?: string;
  /** de onde vieram os valores, para a faixa de prévia */
  referencia?: string;
  classificacao?: string;
  abertura?: string;
  taxaPercent: number;
  maxPorPedido: number;
  reservaMinutos: number;
  pagamento: { metodos: ('pix' | 'cartao')[]; parcelasMax: number; parcelasSemJuros: number; pixMinutos: number };
  lote?: { nome: string; terminaEm?: string; vendidoPercent?: number; proximo?: string };
  ingressos: Ingresso[];
  depoimentos: { texto: string; nome: string; evento: string }[];
  comprasRecentes: { cidade: string; qtd: number; ingresso: string; minutos: number }[];
};

export const CHECKOUT: Record<string, DadosCheckout> = {
  // Baile das Bruxas: setores e preços "a partir de" da página oficial na Igarê (conferida em 16/10/2026). A confirmar com
  // a produção: lotes, meia-entrada, taxa de serviço e parcelamento. Os camarotes premium e fechados esgotaram.
  'baile-das-bruxas': {
    vendasAbertas: false,
    linkExterno: 'https://app.igare.com.br/e/baile-das-bruxas-2',
    referencia: 'Igarê',
    classificacao: 'Menores acompanhados',
    abertura: '21h00',
    taxaPercent: 10,
    maxPorPedido: 8,
    reservaMinutos: 10,
    pagamento: { metodos: ['pix', 'cartao'], parcelasMax: 12, parcelasSemJuros: 1, pixMinutos: 30 },
    ingressos: [
      { id: 'pista', nome: 'Pista', descricao: 'Acesso à área geral', preco: 3300, disponivel: true },
      { id: 'frontstage', nome: 'Frontstage', descricao: 'Em frente ao palco', preco: 7700, disponivel: true },
      { id: 'camarote-individual', nome: 'Camarote individual', descricao: 'Acesso ao camarote, por pessoa', preco: 16500, disponivel: true },
    ],
    depoimentos: [],
    comprasRecentes: [],
  },
};

export const checkoutDo = (slug: string) => CHECKOUT[slug];
