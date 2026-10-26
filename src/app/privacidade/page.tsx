import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { INSTAGRAM_URL } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Privacidade', alternates: { canonical: '/privacidade' } };

// Texto honesto para o estado atual do site (um formulário só, o de /produtores; sem cookie de rastreamento).
// Revisão jurídica pendente (TODO).
export default function Privacidade() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Legal" titulo="Política de privacidade" descricao="Atualizada em outubro de 2026." />
          <div className="texto legal">
            <p>Este site apresenta os eventos da Royals Entretenimento. Esta página explica, em linguagem simples, como ele trata dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
            <h2>O que coletamos</h2>
            <p>O site não tem cadastro nem login e não usa cookies de rastreamento ou de publicidade. Navegar por ele não exige nenhum dado pessoal.</p>
            <p>O único formulário é o da página <a href="/produtores">Para produtores</a>, preenchido por quem quer fazer um evento em parceria com a Royals. Ele pede nome, WhatsApp e, se você quiser, Instagram e informações do evento (nome, data prevista, público esperado, estilo e observações). Esses dados servem só para a equipe da parceria entrar em contato sobre o seu evento.</p>
            <p>Como qualquer site, o provedor de hospedagem registra dados técnicos de acesso (como endereço IP e tipo de navegador) para segurança e funcionamento, pelo tempo exigido em lei.</p>
            <h2>Com quem os dados do formulário são compartilhados</h2>
            <p>A parceria para produtores reúne a Royals Entretenimento, a agência BrandSquad e a Royals Tickets. Os dados do formulário ficam guardados no sistema de atendimento da BrandSquad, que avisa a equipe e organiza o contato. Eles não são vendidos nem usados para publicidade, e são apagados a seu pedido.</p>
            <h2>Ingressos e links externos</h2>
            <p>Os ingressos são vendidos em plataformas de terceiros, indicadas na página de cada evento. Ao comprar, você passa a seguir a política de privacidade da plataforma escolhida. O mesmo vale para o Instagram e outros sites para os quais este site aponta.</p>
            <h2>Imagens</h2>
            <p>As fotos e os vídeos do acervo foram publicados nos perfis oficiais da Royals. Se você aparece em alguma imagem e quer que ela seja retirada, peça pelo canal de contato abaixo.</p>
            <h2>Seus direitos e contato</h2>
            <p>Você pode pedir informação, correção ou exclusão de dados pessoais pelo direct do <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram da Royals</a>.</p>
            <p>Quando o cadastro de promoters abrir, esta política será atualizada antes, explicando quais dados serão pedidos e para quê.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
