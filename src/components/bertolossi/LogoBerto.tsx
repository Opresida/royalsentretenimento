import { LOGO_VIEWBOX, PECAS } from './logo';

/** Logo do BERTOLOSSI em vetor (logo.ts, gerado por scripts/bertolossi-logo.py). Animação "estêncil no spray": a tinta
 *  revela o nome da esquerda para a direita (recorte animado) com a névoa laranja do spray (marca/spray-bico.webp,
 *  imagem pronta) correndo na borda; o respingo (overspray) laranja fica atrás do nome; depois as letras do HITMAKER
 *  caem uma a uma, como adesivo. Sem filtro animado: só recorte e transform, que a placa de vídeo move sem repintar
 *  (os filtros SVG animados custavam ~1 s de processador no celular). CSS em bertolossi.css (.blogo).
 *  `id` precisa ser único na página (filtro do respingo). `estatica`: só os paths (rodapé). */
export function LogoBerto({ id, className = '', titulo = 'BERTOLOSSI', estatica }: { id: string; className?: string; titulo?: string; estatica?: boolean }) {
  const nome = PECAS.filter((p) => p.linha === 'nome');
  const sub = PECAS.filter((p) => p.linha === 'sub');
  if (estatica) return (
    <svg className={`blogo blogo--estatica ${className}`} viewBox={LOGO_VIEWBOX} role="img" aria-label={titulo}>
      <g className="blogo__nome" fillRule="evenodd">{PECAS.map((p, k) => <path key={k} d={p.d} />)}</g>
    </svg>
  );
  return (
    <span className={`blogo ${className}`} role="img" aria-label={titulo}>
      <svg className="blogo__tinta" viewBox={LOGO_VIEWBOX} aria-hidden="true">
        <defs>
          <filter id={`${id}-respingo`} x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <g className="blogo__respingo" filter={`url(#${id}-respingo)`}>{nome.map((p, k) => <path key={k} d={p.d} />)}</g>
        <g className="blogo__nome" fillRule="evenodd">{nome.map((p, k) => <path key={k} d={p.d} />)}</g>
      </svg>
      <span className="blogo__bico" aria-hidden="true" />
      <svg className="blogo__sub" viewBox={LOGO_VIEWBOX} aria-hidden="true">
        <g fillRule="evenodd">{sub.map((p, k) => <path key={k} d={p.d} style={{ '--i': p.i } as React.CSSProperties} />)}</g>
      </svg>
    </span>
  );
}
