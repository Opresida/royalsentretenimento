import { LOGO_CAMADAS, LOGO_VIEWBOX } from './marca/logo-camadas';

// O logo nunca é digitado com fonte: sempre o vetor da marca (public/marca).
const ARQUIVO = { ouro: '/marca/royals-gold-transparent.svg', marfim: '/marca/royals-mono-white.svg', preto: '/marca/royals-mono-black.svg' } as const;

/** `brilho`: o fio de luz branca que passa pela logo (o `Shine` das revelações do remotion-studio: faixa fina inclinada
 *  −18°, recortada no formato da marca). CSS em `.logo-brilho`. */
export function Logo({ variante = 'ouro', largura = 112, className, brilho }: { variante?: keyof typeof ARQUIVO; largura?: number; className?: string; brilho?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={ARQUIVO[variante]} alt="Royals Entretenimento" width={largura} height={Math.round((largura * 255) / 734)} className={className} />;
  if (!brilho) return img;
  return <span className="logo-brilho" style={{ '--logo': `url(${ARQUIVO[variante]})` } as React.CSSProperties}>{img}</span>;
}

/** O logo que se revela (conceito do brandbook): fio de ouro, coroa, ROYALS por máscara letra a letra, descritor.
 *  A animação dispara quando o bloco <Revela> em volta entra na tela (classe "visivel").
 *  `prefixo`: nome dos degradês de ouro. Cada cópia na mesma página precisa do seu: o navegador pinta todas com o degradê
 *  da PRIMEIRA cópia e, se ela some (a abertura da home, depois que a cortina sai), as outras ficam sem cor. */
export function LogoRevela({ className, prefixo = 'rv' }: { className?: string; prefixo?: string }) {
  return (
    <svg className={`logo-revela ${className ?? ''}`} viewBox={LOGO_VIEWBOX} role="img" aria-label="Royals Entretenimento">
      <rect className="fio" x="71" y="436" width="734" height="2.5" fill="#DBBC58" />
      <g dangerouslySetInnerHTML={{ __html: prefixo === 'rv' ? LOGO_CAMADAS : LOGO_CAMADAS.replaceAll('rv-grad-', `${prefixo}-grad-`) }} />
    </svg>
  );
}

/** As três barras do E do descritor: marcador de seção, divisor e ícone de menu. */
export function Marcador() {
  return <span className="marcador" aria-hidden="true"><span /><span /><span /></span>;
}

/** A assinatura "Uma produção ROYALS" (marca endossada: o evento lidera, a Royals assina). Em evento coproduzido
 *  (`parceiros`), vira "Apresentam" com a Royals e as logos das outras marcas, todas em marfim, separadas por fios. */
export function Assinatura({ rotulo, parceiros }: { rotulo?: string; parceiros?: { nome: string; logo: string }[] }) {
  if (!parceiros?.length) {
    return (
      <div className="assinatura">
        <div className="assinatura__fio" />
        <div className="assinatura__linha">
          <span>{rotulo ?? 'Uma produção'}</span>
          <Logo variante="marfim" largura={120} />
        </div>
      </div>
    );
  }
  return (
    <div className="assinatura assinatura--varias">
      <div className="assinatura__fio" />
      <div className="assinatura__linha">
        <span>{rotulo ?? 'Apresentam'}</span>
        <div className="assinatura__marcas">
          <Logo variante="marfim" largura={104} />
          {parceiros.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.nome} src={p.logo} alt={p.nome} className="assinatura__parceiro" />
          ))}
        </div>
      </div>
    </div>
  );
}
