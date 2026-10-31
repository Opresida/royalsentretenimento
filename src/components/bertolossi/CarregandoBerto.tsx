/** Spinner do BERTOLOSSI: um "throw-up" de spray girando (anel tracejado, como o traço do pixo) e, no meio, a gota de
 *  tinta pulsando no tempo do funk (130 BPM). Aparece enquanto um set, um vídeo ou uma foto ampliada carregam.
 *  Tamanho por --tam (padrão 44 px). */
export function CarregandoBerto({ rotulo = 'Carregando', tam }: { rotulo?: string; tam?: number }) {
  return (
    <span className="bc" role="status" aria-label={rotulo} style={tam ? ({ '--tam': `${tam}px` } as React.CSSProperties) : undefined}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle className="bc__trilho" cx="24" cy="24" r="20" />
        <circle className="bc__anel" cx="24" cy="24" r="20" pathLength={100} />
        <path className="bc__gota" d="M24 15c3 5 6 8.4 6 12a6 6 0 0 1-12 0c0-3.6 3-7 6-12z" />
      </svg>
    </span>
  );
}
