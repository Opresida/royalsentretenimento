import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { INSTAGRAM_URL } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Privacidade', alternates: { canonical: '/privacidade' } };

// Texto honesto para o estado atual do site (sem formulário, sem cookie de rastreamento). Revisão jurídica pendente (TODO).
export default function Privacidade() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Legal" titulo="Política de privacidade" descricao="Atualizada em outubro de 2026." />
          <div className="texto legal">
            <p>Este site apresenta os eventos da Royals Entretenimento. Esta página explica, em linguagem simples, como ele trata dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
            <h2>O que coletamos</h2>
            <p>Hoje o site não tem cadastro, formulário nem login, e não usa cookies de rastreamento ou de publicidade. Navegar por ele não exige nenhum dado pessoal.</p>
            <p>Como qualquer site, o provedor de hospedagem registra dados técnicos de acesso (como endereço IP e tipo de navegador) para segurança e funcionamento, pelo tempo exigido em lei.</p>
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
