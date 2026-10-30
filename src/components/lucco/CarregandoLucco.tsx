/** Spinner da marca LUCCO: anel champanhe girando e, no meio, o corte inclinado da logo pulsando no tempo de 124 BPM.
 *  Aparece enquanto o set, um vídeo ou uma foto ampliada carregam. Tamanho por --tam (padrão 44 px). */
export function CarregandoLucco({ rotulo = 'Carregando', tam }: { rotulo?: string; tam?: number }) {
  return (
    <span className="lc" role="status" aria-label={rotulo} style={tam ? ({ '--tam': `${tam}px` } as React.CSSProperties) : undefined}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle className="lc__trilho" cx="24" cy="24" r="21" />
        <circle className="lc__anel" cx="24" cy="24" r="21" pathLength={100} />
        <line className="lc__corte" x1="13" y1="27.5" x2="35" y2="20.5" />
      </svg>
    </span>
  );
}
