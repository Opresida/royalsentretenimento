// Conteúdo da página /produtores: a parceria Royals Entretenimento + BrandSquad + Royals Tickets para o evento de
// outro produtor. Termos definidos pelo Humberto em 26/10/2026 (planos, divisão, regra de recebimento). Nada além disso:
// sem número que não esteja aprovado, sem prazo inventado, sem nome de ticketeira concorrente.
// Roteiro da VSL: D:\CLIENTES BRANDSQUADS\Royals Entretenimento\Parceria Produtor\ROTEIRO-VSL.md

/** Vídeo de vendas (VSL): o MP4 fica no R2 público da Royals (bucket royals-acervo, pasta vsl/). Com `video`, a página
 *  vira página de VSL (só o vídeo; o resto aparece 2 s antes do fim). Sem ele, o topo mostra as três forças. */
export const VSL: { video?: string; capa?: string } = {
  video: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/vsl/royals-vsl-produtores.mp4',
  capa: 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/vsl/royals-vsl-produtores-capa.jpg',
};

export const DORES = [
  { n: '01', titulo: 'Vender', texto: 'Arte feita às pressas, post na hora errada, comentário "quanto é?" sem resposta e influenciador que cobra e não vende. O primeiro lote anda devagar.' },
  { n: '02', titulo: 'Organizar', texto: 'Atração, estrutura, som, luz, segurança, portaria. Cinco fornecedores que não se falam e tudo saindo do seu bolso antes do primeiro ingresso.' },
  { n: '03', titulo: 'Receber', texto: 'O evento lota e o dinheiro fica parado. Tem ticketeira em Manaus que segura o repasse do produtor por até 15 dias depois do evento.' },
];

export const PILARES = [
  {
    marca: 'Royals Entretenimento',
    papel: 'Organiza e vende',
    itens: ['Organização e produção com quem tem 10+ anos de trap e funk em Manaus', 'Curadoria e experiência de pista', 'Um exército de influenciadores vendendo o seu evento', 'A marca Royals assinando a sua noite'],
  },
  {
    marca: 'BrandSquad',
    papel: 'Cuida de todo o marketing',
    itens: ['Identidade visual do evento', 'Criativos, Reels e vídeos em motion', 'Postagens automáticas no horário certo', 'Robô que responde comentário e manda o link do ingresso no direct', 'Página do evento'],
  },
  {
    marca: 'Royals Tickets',
    papel: 'Cuida da bilheteria',
    itens: ['Checkout próprio, com Pix e cartão', 'Split de pagamento pela Pagar.me: cada venda já nasce dividida', 'Ingresso com QR Code no celular e portaria com lista', 'Painel com cada venda em tempo real'],
  },
];

/** O dinheiro: regra de recebimento definida pelo Humberto (26/10/2026) e regra pública da Pagar.me para o Pix. */
export const RECEBIMENTO = [
  { rotulo: 'Pix', valor: 'Na hora', nota: 'A sua parte cai assim que o comprador paga, já dividida pelo split' },
  { rotulo: 'Cartão', valor: 'Dia seguinte ao evento', nota: 'A Royals antecipa para você. O custo da antecipação sai da sua parte e aparece no painel' },
  { rotulo: 'Saque', valor: 'Acabou, recebeu', nota: 'Terminou o evento, você pede o saque e o pagamento sai' },
];

export const COMPARATIVO: { item: string; comum: string; royals: string }[] = [
  { item: 'Quando o dinheiro chega', comum: 'Até 15 dias depois do evento', royals: 'Pix na hora; cartão no dia seguinte ao evento' },
  { item: 'Como a venda é dividida', comum: 'A ticketeira recebe tudo e repassa depois', royals: 'Split: cada venda já nasce dividida' },
  { item: 'O que você enxerga', comum: 'O relatório que mandarem', royals: 'Painel com cada venda em tempo real' },
  { item: 'Marketing do evento', comum: 'Por sua conta', royals: 'BrandSquad cuidando de tudo' },
];

export const JORNADA = [
  { etapa: 'Fechamento', texto: 'Você conta o evento, a gente escolhe o modelo da parceria e monta o plano.' },
  { etapa: 'Lançamento', texto: 'Identidade, página, bilheteria aberta e a primeira leva de criativos e influenciadores.' },
  { etapa: 'Vendas', texto: 'Postagem automática, robô respondendo no direct e influenciadores vendendo. Você acompanha tudo no painel.' },
  { etapa: 'A noite', texto: 'Produção Royals, ingresso com QR Code e portaria com lista.' },
  { etapa: 'Dia seguinte', texto: 'Você pede o saque e recebe. Sem ligar para ninguém pedindo o que é seu.' },
];

/** Planos definidos pelo Humberto (26/10/2026). `entrada` em reais e `parte` = fatia da parceria na bilheteria e no bar. */
export const PLANOS = [
  { nome: 'Modelo 1', entrada: 5000, parte: 40, resumo: 'Menos dinheiro na entrada' },
  { nome: 'Modelo 2', entrada: 10000, parte: 30, resumo: 'Mais dinheiro no seu bolso em evento grande' },
] as const;

export const FAQ = [
  { p: 'O que entra na conta da bilheteria e do bar?', r: 'Todo o faturamento de ingressos e do bar do evento. A divisão do modelo escolhido vale para os dois.' },
  { p: 'Quem paga a atração?', r: 'O produtor. A atração é sua: você contrata e paga. A parceria cuida da organização, do marketing e da bilheteria.' },
  { p: 'Quando eu recebo?', r: 'No Pix, a sua parte cai na hora, já dividida pelo split da Pagar.me. No cartão, a Royals antecipa e o dinheiro cai no dia seguinte ao evento.' },
  { p: 'Quem paga a antecipação do cartão?', r: 'O custo da antecipação sai da parte do produtor. Ele aparece no painel, venda por venda, sem letra miúda.' },
  { p: 'Qual modelo é melhor para mim?', r: 'Depende do tamanho do evento. Use o simulador acima e, se o seu evento for grande, peça o modelo sob medida.' },
  { p: 'Eu acompanho as vendas?', r: 'Sim. O painel da Royals Tickets mostra cada venda em tempo real.' },
  { p: 'O evento é só de trap e funk?', r: 'Esse é o nosso terreno há mais de dez anos, mas conta o seu evento: a gente avalia cada caso.' },
];
