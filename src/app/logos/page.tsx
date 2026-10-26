import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import './logos.css';

// Kit de logos para produtores parceiros (pedido do Humberto, 26/10/2026): cada versão oficial da marca com a prévia no
// fundo certo e o download em SVG, PNG e JPEG, mais o kit inteiro em ZIP. Os arquivos saem de
// scripts/logos-download.mjs (a partir dos SVGs do material próprio da Royals) para public/marca/download.
// Página de link direto: fora do menu e do sitemap, e sem indexação.
export const metadata: Metadata = {
  title: 'Kit de logos',
  description: 'Logos oficiais da Royals Entretenimento para parceiros: SVG, PNG e JPEG.',
  alternates: { canonical: '/logos' },
  robots: { index: false, follow: false },
};

type Versao = { arq: string; nome: string; uso: string; fundo: 'escuro' | 'claro'; previa?: 'quadro'; png: string; jpg: string; pngTransparente: boolean };

// tamanhos em px conferidos na geração (o PNG segue a proporção do SVG; o JPEG leva 12% de margem em volta)
const VERSOES: Versao[] = [
  { arq: 'royals-original', nome: 'Original', uso: 'A logo no quadro preto, como no perfil da Royals.', fundo: 'escuro', previa: 'quadro', png: '3000 × 3000', jpg: '3720 × 3720', pngTransparente: false },
  { arq: 'royals-gold-transparent', nome: 'Dourada', uso: 'Para fundos escuros e fotos com pouca luz.', fundo: 'escuro', png: '4000 × 1390', jpg: '4960 × 2350', pngTransparente: true },
  { arq: 'royals-gold-on-light', nome: 'Dourada para fundo claro', uso: 'Para fundos brancos e claros.', fundo: 'claro', png: '4000 × 1390', jpg: '4960 × 2350', pngTransparente: true },
  { arq: 'royals-mono-white', nome: 'Branca', uso: 'Uma cor só, para fundos escuros ou coloridos.', fundo: 'escuro', png: '4000 × 1390', jpg: '4960 × 2350', pngTransparente: true },
  { arq: 'royals-mono-black', nome: 'Preta', uso: 'Uma cor só, para fundos claros e impressão.', fundo: 'claro', png: '4000 × 1390', jpg: '4960 × 2350', pngTransparente: true },
  { arq: 'royals-symbol-gold', nome: 'Símbolo', uso: 'Só a coroa, para espaços pequenos e ícones.', fundo: 'escuro', png: '2000 × 1434', jpg: '2480 × 1914', pngTransparente: true },
];

const PASTA = path.join(process.cwd(), 'public', 'marca', 'download');
const peso = (arquivo: string) => {
  const b = fs.statSync(path.join(PASTA, arquivo)).size;
  return b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.round(b / 1024)} KB`;
};
const url = (arquivo: string) => `/marca/download/${arquivo}`;

function Baixar({ arquivo, formato, detalhe }: { arquivo: string; formato: string; detalhe: string }) {
  return (
    <a className="logos-baixar" href={url(arquivo)} download={arquivo}>
      <span className="logos-baixar__formato">{formato}</span>
      <span className="logos-baixar__detalhe">{detalhe} · {peso(arquivo)}</span>
      <span className="logos-baixar__seta" aria-hidden="true">↓</span>
    </a>
  );
}

export default function Logos() {
  return (
    <main className="pagina-topo logos">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container pilha" style={{ gap: 'var(--space-12)' }}>
          <CabecalhoSecao nivel={1} olho="Para parceiros" titulo="Kit de logos" descricao="As versões oficiais da marca Royals. Escolha a versão pelo fundo da sua arte e baixe no formato que precisar." />
          <div className="logos-kit">
            <a className="botao botao--lg" href={url('royals-kit-de-logos.zip')} download="royals-kit-de-logos.zip">
              Baixar o kit completo<span className="seta" aria-hidden="true">↓</span>
            </a>
            <span className="rotulo-texto rotulo-texto--mudo">ZIP com as 6 versões em SVG, PNG e JPEG · {peso('royals-kit-de-logos.zip')}</span>
          </div>

          <div className="logos-grade">
            {VERSOES.map((v) => (
              <article key={v.arq} className="logos-cartao">
                <div className={`logos-previa logos-previa--${v.previa ?? v.fundo}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url(`${v.arq}.svg`)} alt={`Logo Royals, versão ${v.nome.toLowerCase()}`} loading="lazy" />
                </div>
                <div className="logos-info">
                  <h2 className="h3">{v.nome}</h2>
                  <p>{v.uso}</p>
                </div>
                <div className="logos-formatos">
                  <Baixar arquivo={`${v.arq}.svg`} formato="SVG" detalhe="Vetor, qualquer tamanho" />
                  <Baixar arquivo={`${v.arq}.png`} formato="PNG" detalhe={`${v.png} px${v.pngTransparente ? ', transparente' : ''}`} />
                  <Baixar arquivo={`${v.arq}.jpg`} formato="JPEG" detalhe={`${v.jpg} px, fundo ${v.fundo === 'claro' ? 'branco' : 'preto'}`} />
                </div>
              </article>
            ))}
          </div>

          <p className="logos-nota">Use os arquivos como estão: sem esticar, girar, trocar as cores ou aplicar efeitos. Dúvidas sobre a aplicação da marca, fale com a equipe da Royals.</p>
        </div>
      </section>
    </main>
  );
}
