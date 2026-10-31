import type { Metadata } from 'next';
import { GeradorContrato } from '@/components/contratos/GeradorContrato';
import { ARTISTAS_CONTRATO } from '@/data/contratos';
import { BOOKING_CONTATOS, EMPRESA, SITE_URL } from '@/lib/site';
import './contratos.css';

// Gerador do contrato de venda de show dos artistas do casting (pedido do Humberto, 31/10/2026): escolhe o artista,
// preenche o evento, o contratante e os valores, e baixa o PDF no papel timbrado da Royals. Uso interno: link direto,
// fora do menu e do sitemap, sem indexação. Nada é enviado a servidor; o rascunho fica só no navegador de quem preenche.
export const metadata: Metadata = {
  title: 'Contratos',
  description: 'Gerador de contrato de apresentação artística da Royals Entretenimento.',
  alternates: { canonical: '/contratos' },
  robots: { index: false, follow: false },
};

export default function PaginaContratos() {
  return (
    <main className="contratos">
      <div className="container contratos__topo">
        <span className="contratos__sobre">Uso interno · Casting Royals</span>
        <h1>Contrato de venda de show</h1>
        <p>Escolha o artista, preencha o evento e o contratante, e baixe o contrato pronto no papel timbrado da Royals.</p>
      </div>
      <div className="container">
        <GeradorContrato artistas={ARTISTAS_CONTRATO} empresa={EMPRESA} booking={BOOKING_CONTATOS[0].exibido} site={SITE_URL} />
      </div>
    </main>
  );
}
