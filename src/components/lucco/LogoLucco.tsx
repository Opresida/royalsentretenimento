import { LOGO_VIEWBOX, PECAS } from './logo';

/** Logo do LUCCO em vetor (logo.ts, gerado por scripts/lucco-logo.py). Cada letra tem a parte de cima e a de baixo do
 *  corte inclinado: na animação o contorno se desenha, as letras enchem, a base desliza e encaixa no corte e um fio de
 *  luz champanhe atravessa o corte (o "nascer do sol" da marca). CSS em lucco.css (.ll).
 *  `id` precisa ser único na página (gradiente e recorte do brilho). */
export function LogoLucco({ id, className = '', titulo = 'LUCCO' }: { id: string; className?: string; titulo?: string }) {
  return (
    <svg className={`ll ${className}`} viewBox={LOGO_VIEWBOX} role="img" aria-label={titulo}>
      <defs>
        <clipPath id={`${id}-recorte`}>{PECAS.map((p, k) => <path key={k} d={p.d} />)}</clipPath>
        <linearGradient id={`${id}-luz`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFE7C2" stopOpacity="0" />
          <stop offset=".5" stopColor="#FFE7C2" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFE7C2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="ll__letras" fillRule="evenodd">
        {PECAS.map((p, k) => (
          <path key={k} d={p.d} pathLength={1} className={`ll__p ll__p--${p.parte}`} style={{ '--i': p.i } as React.CSSProperties} />
        ))}
      </g>
      {/* fio de luz no corte (y = 193,5 − 0,0712·x, medido nas peças de baixo) */}
      <line className="ll__corte" x1="120" y1="185" x2="1100" y2="115.2" pathLength={1} />
      <g clipPath={`url(#${id}-recorte)`}>
        <rect className="ll__brilho" x="-260" y="-40" width="220" height="300" fill={`url(#${id}-luz)`} transform="skewX(-14)" />
      </g>
    </svg>
  );
}
