import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { BarraIngressos } from '@/components/BarraIngressos';
import { Rodape } from '@/components/Rodape';
import { Topo } from '@/components/Topo';
import { TransicaoPagina } from '@/components/TransicaoPagina';
import { INSTAGRAM_URL, proximos } from '@/lib/acervo';
import { DESCRICAO, NOME, SITE_URL } from '@/lib/site';
import './globals.css';

// <html suppressHydrationWarning>: páginas como /artistas/lucco marcam a abertura no <html> antes da 1ª pintura.
// Archivo variável (largura 62–125, peso 100–900): a fonte aprovada no brandbook da Royals.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${NOME} · Eventos de trap e funk em Manaus`, template: `%s · ${NOME}` },
  description: DESCRICAO,
  applicationName: NOME,
  alternates: { canonical: '/' },
  openGraph: { title: NOME, description: DESCRICAO, url: '/', siteName: NOME, type: 'website', locale: 'pt_BR' },
  twitter: { card: 'summary_large_image', title: NOME, description: DESCRICAO },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#050505', colorScheme: 'dark' };

const ORGANIZACAO_LD = { '@context': 'https://schema.org', '@type': 'Organization', name: NOME, url: SITE_URL, logo: `${SITE_URL}/marca/royals-gold-transparent.svg`, sameAs: [INSTAGRAM_URL] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const proximo = proximos().find((e) => e.ingressos);
  return (
    <html lang="pt-BR" className={archivo.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <a href="#conteudo" className="so-leitor">Pular para o conteúdo</a>
        <Topo ingressos={proximo?.ingressos ? { href: proximo.ingressos, externo: true } : { href: '/eventos' }} />
        <div id="conteudo">{children}</div>
        <Rodape />
        <BarraIngressos e={proximo} />
        <TransicaoPagina />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZACAO_LD) }} />
      </body>
    </html>
  );
}
