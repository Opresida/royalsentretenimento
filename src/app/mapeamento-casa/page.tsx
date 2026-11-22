import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import type { Grupo } from '../cadastro-artista/FormularioArtista';
import { FormularioMapeamento } from './FormularioMapeamento';
import '../cadastro-artista/cadastro.css';

// Mapeamento de casa noturna antes de fechar a noite semanal "É o Trap, é o Rap, é o Funk" (22/11/2026, pedido do Humberto
// pelo Telegram). Acordo proposto: 50% da porta + 50% do bar. Link direto, fora do menu e do sitemap, sem indexação.
export const metadata: Metadata = {
  title: 'Mapeamento da casa · Royals',
  description: 'O que olhar e perguntar antes de fechar a noite semanal.',
  alternates: { canonical: '/mapeamento-casa' },
  robots: { index: false, follow: false },
};

const SN = ['Sim', 'Não', 'Não sei'];
const GRUPOS: Grupo[] = [
  { titulo: 'A casa', pagina: 'quem é e como funciona', perguntas: [
    { id: 'casa-nome', rotulo: 'Nome da casa e endereço' },
    { id: 'casa-ig', rotulo: '@ do Instagram da casa (e quantos seguidores)' },
    { id: 'casa-dono', rotulo: 'Quem é o dono e quem é o gerente da noite (nome e WhatsApp). Quem decide na hora?', tipo: 'longo' },
    { id: 'casa-dias', rotulo: 'Que dias a casa abre, quais lotam e que público vai em cada dia', tipo: 'longo' },
    { id: 'casa-lotacao', rotulo: 'Lotação oficial (AVCB) e quantas pessoas cabem de verdade no pico' },
    { id: 'casa-horario', rotulo: 'Horário de funcionamento e até que horas o alvará permite' },
    { id: 'casa-dia-proposto', rotulo: 'Que dia da semana seria a "É o Trap, é o Rap, é o Funk"?' },
  ] },
  { titulo: 'O acordo 50/50', pagina: 'onde mora o risco', perguntas: [
    { id: 'porta-base', rotulo: 'Os 50% da PORTA são de quê?', tipo: 'opcoes', opcoes: ['Faturamento bruto da porta', 'Porta menos as taxas (plataforma/maquininha)', 'Porta menos custos da noite', 'Não ficou claro'] },
    { id: 'bar-base', rotulo: 'Os 50% do BAR são de quê?', ajuda: 'Faturamento = metade de tudo que o bar vendeu. Lucro = desconta o custo da bebida antes (dá bem menos).', tipo: 'opcoes', opcoes: ['Faturamento do bar', 'lucro do bar (depois do custo da bebida)', 'Não ficou claro'] },
    { id: 'custos-antes', rotulo: 'Quais custos saem ANTES da divisão (divide o que sobra)?', tipo: 'opcoes', opcoes: ['Segurança', 'Limpeza', 'Som e luz', 'DJ residente', 'ECAD', 'Taxa da maquininha', 'Taxa da plataforma de ingresso', 'Divulgação', 'Nenhum'] },
    { id: 'custos-meus', rotulo: 'Quais custos são SÓ SEUS?', tipo: 'opcoes', opcoes: ['Atrações e DJs', 'Divulgação e tráfego', 'Segurança extra', 'Decoração/estrutura extra', 'Equipe de porta', 'Promoters'] },
    { id: 'conferir', rotulo: 'Como você vai CONFERIR o número do bar e da porta?', tipo: 'opcoes', opcoes: ['Relatório do sistema/maquininha', 'Fechamento do caixa assinado pelos dois', 'Alguém meu acompanha o fechamento', 'Acesso ao painel da maquininha', 'Só a palavra da casa'] },
    { id: 'repasse', rotulo: 'Quem fica com o dinheiro na noite e em quanto tempo cai a sua parte?' },
    { id: 'prazo', rotulo: 'Prazo do acordo: tem período de teste? Quantas semanas?' },
    { id: 'exclusividade', rotulo: 'Exclusividade: outro produtor pode fazer trap/funk na casa em outro dia?', tipo: 'opcoes', opcoes: ['Exclusivo meu', 'Não é exclusivo', 'Não falamos disso'] },
    { id: 'flop', rotulo: 'E se a noite flopar ou chover? Tem mínimo garantido pra casa ou multa?', tipo: 'longo' },
  ] },
  { titulo: 'O bar', pagina: 'onde o dinheiro vaza', perguntas: [
    { id: 'bar-sistema', rotulo: 'Como o público paga a bebida?', tipo: 'opcoes', opcoes: ['Ficha de papel', 'Comanda', 'Cartão/pulseira pré-paga', 'Direto no balcão (maquininha)'] },
    { id: 'bar-ficha', rotulo: 'A ficha é rasgada/inutilizada na entrega e vai pra uma urna?', tipo: 'opcoes', opcoes: SN },
    { id: 'bar-caixa', rotulo: 'O caixa é separado do bar (quem vende não serve)?', tipo: 'opcoes', opcoes: SN },
    { id: 'bar-equipe', rotulo: 'Quantos caixas e quantos atendentes no pico? Quanto tempo de fila você viu?' },
    { id: 'bar-dosador', rotulo: 'Destilado é servido com dosador e copo padrão?', tipo: 'opcoes', opcoes: ['Dosador e copo padrão', 'Só copo padrão', 'No olho', 'Não vi'] },
    { id: 'bar-estoque', rotulo: 'Contam o estoque na abertura e no fechamento?', tipo: 'opcoes', opcoes: ['Toda noite, com planilha', 'Só de vez em quando', 'Não contam', 'Não sei'] },
    { id: 'bar-estoque-quem', rotulo: 'Quem conta o estoque e onde ele fica guardado?' },
    { id: 'bar-fornecedor', rotulo: 'Quem fornece as bebidas? Tem contrato de exclusividade com alguma cervejaria/marca?', tipo: 'longo' },
    { id: 'bar-precos', rotulo: 'Preço de venda dos itens que mais saem (e o custo, se souber)', ajuda: 'Ex.: cerveja lata R$ 10 (custo R$ 4) · combo R$ 150 · dose R$ 20.', tipo: 'longo' },
    { id: 'bar-quebra', rotulo: 'Como registram quebra, cortesia e o consumo da equipe?' },
    { id: 'bar-pix', rotulo: 'Pix e maquininha caem SÓ na conta da casa (nunca na chave do barman)?', tipo: 'opcoes', opcoes: SN },
    { id: 'bar-taxa', rotulo: 'Qual a taxa da maquininha?' },
  ] },
  { titulo: 'A porta', pagina: 'o ingresso', perguntas: [
    { id: 'porta-preco', rotulo: 'Quanto custa a entrada hoje (e se tem lote/meia/feminino free)?' },
    { id: 'porta-venda', rotulo: 'Como vendem?', tipo: 'opcoes', opcoes: ['Online (plataforma)', 'Na porta', 'Promoters', 'Lista'] },
    { id: 'porta-plataforma', rotulo: 'Qual plataforma de ingresso e qual a taxa?' },
    { id: 'porta-contagem', rotulo: 'Como contam quem entra?', tipo: 'opcoes', opcoes: ['Catraca', 'Leitor de QR', 'Pulseira contada', 'Ninguém conta'] },
    { id: 'porta-lista', rotulo: 'Como funciona lista, cortesia e comissão de promoter?', tipo: 'longo' },
  ] },
  { titulo: 'Estrutura', pagina: 'o que tem e o que falta', perguntas: [
    { id: 'est-som', rotulo: 'Som, luz, telão e cabine: o que a casa tem e o que você precisaria alugar', tipo: 'longo' },
    { id: 'est-camarote', rotulo: 'Tem camarote/mesas? Quantas e por quanto vendem?' },
    { id: 'est-palco', rotulo: 'Palco e camarim pra atração?' },
    { id: 'est-local', rotulo: 'Estacionamento, transporte e segurança da rua' },
  ] },
  { titulo: 'Segurança e documentos', pagina: 'se fechar, o prejuízo é seu', perguntas: [
    { id: 'doc-alvara', rotulo: 'Alvará de funcionamento, AVCB e licença sanitária em dia?', tipo: 'opcoes', opcoes: ['Tudo em dia', 'Falta algum', 'Não sei'] },
    { id: 'doc-seguranca', rotulo: 'Quantos seguranças, brigadista e quem paga?' },
    { id: 'doc-menor', rotulo: 'Como controlam menor de idade na porta?' },
    { id: 'doc-historico', rotulo: 'Já tiveram problema com polícia, vizinhança ou fechamento?', tipo: 'longo' },
  ] },
  { titulo: 'O público', pagina: 'pra quem é a noite', perguntas: [
    { id: 'pub-perfil', rotulo: 'Perfil de quem frequenta (idade, estilo, de onde vem)', tipo: 'longo' },
    { id: 'pub-trap', rotulo: 'Já teve noite de trap/rap/funk lá? Como foi?', tipo: 'longo' },
    { id: 'pub-concorrencia', rotulo: 'Que festas de trap/rap/funk disputam esse público na cidade, e em que dia?', tipo: 'longo' },
    { id: 'pub-divulga', rotulo: 'A casa divulga a sua noite nas redes dela?', tipo: 'opcoes', opcoes: SN },
  ] },
  { titulo: 'Os números de uma noite cheia', pagina: 'pra bater a conta', perguntas: [
    { id: 'n-pagantes', rotulo: 'Pagantes numa noite cheia (número)', ajuda: 'Só números. A conta aparece logo abaixo.' },
    { id: 'n-ingresso', rotulo: 'Preço médio da entrada (R$)' },
    { id: 'n-bar', rotulo: 'Quanto o bar faturou nessa noite (R$)' },
    { id: 'n-custo-bebida', rotulo: 'Custo da bebida em % do preço de venda (se não souber, deixe em branco que uso 35%)' },
    { id: 'n-meus-custos', rotulo: 'Quanto VOCÊ gastaria por noite (atrações + divulgação + extras), em R$' },
  ] },
  { titulo: 'As suas impressões', pagina: 'o que você sentiu', perguntas: [
    { id: 'imp-gostou', rotulo: 'O que você gostou da casa?', tipo: 'longo' },
    { id: 'imp-risco', rotulo: 'O que te preocupou?', tipo: 'longo' },
    { id: 'imp-fotos', rotulo: 'Tirou fotos do espaço (pista, bar, palco, entrada, camarote)?', tipo: 'opcoes', opcoes: ['Sim, mando no WhatsApp', 'Não'] },
  ] },
];

export default function MapeamentoCasa() {
  return (
    <main className="secao">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
        <CabecalhoSecao nivel={1} olho="Royals · uso interno" titulo="Mapeamento da casa" descricao="É o Trap, é o Rap, é o Funk · noite semanal. Acordo proposto: 50% da porta + 50% do bar. Preencha durante a visita; o rascunho fica salvo no celular e, no fim, o botão envia tudo pra Sexta-feira bater a conta." />
        <FormularioMapeamento grupos={GRUPOS} />
      </div>
    </main>
  );
}
