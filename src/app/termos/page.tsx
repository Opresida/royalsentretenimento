import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { INSTAGRAM_URL } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Termos de uso', alternates: { canonical: '/termos' } };

// Termos simples para o estado atual do site. Revisão jurídica pendente (TODO).
export default function Termos() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Legal" titulo="Termos de uso" descricao="Atualizados em outubro de 2026." />
          <div className="texto legal">
            <h2>Sobre o site</h2>
            <p>Este site é da Royals Entretenimento e serve para divulgar os eventos produzidos por ela e o acervo das edições anteriores.</p>
            <h2>Ingressos</h2>
            <p>O site não vende ingressos. Cada evento indica a sua plataforma oficial de venda, que é responsável pela compra, pelo pagamento, pelas regras de meia-entrada e pelas políticas de troca e reembolso. Compre só pelo canal indicado na página do evento.</p>
            <h2>Informações dos eventos</h2>
            <p>Datas, locais e atrações podem mudar por decisão da produção ou por motivo de força maior. As mudanças são comunicadas no Instagram oficial e na plataforma de ingressos.</p>
            <h2>Marcas e imagens</h2>
            <p>A marca Royals, as marcas dos eventos e o conteúdo do site pertencem aos seus titulares. Não é permitido usá-los sem autorização. As marcas de artistas e parceiros pertencem a eles.</p>
            <h2>Contato</h2>
            <p>Dúvidas sobre estes termos: direct do <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram da Royals</a>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
