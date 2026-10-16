import { COROA, COROA_VIEWBOX, ROYALS, ROYALS_VIEWBOX } from './marca/coroa';

/** Spinner da marca: a coroa da Royals (o vetor da marca) em loop de 1,6 s. O contorno se desenha em ouro claro, o miolo
 *  enche com o degradê de ouro, um brilho atravessa na diagonal e tudo esvazia para recomeçar.
 *  `tamanho` em px (largura da coroa). Com `texto`, o logotipo ROYALS aparece embaixo, enchendo da esquerda (tela de
 *  carregamento); o texto vira o rótulo para leitores de tela. Com movimento reduzido, a coroa só pulsa (CSS). */
export function Carregando({ tamanho = 36, texto, className = '' }: { tamanho?: number; texto?: string; className?: string }) {
  return (
    <span className={`carregando ${className}`} role="status" aria-live="polite" style={{ '--tam': `${tamanho}px` } as React.CSSProperties}>
      <svg className="carregando__coroa" viewBox={COROA_VIEWBOX} aria-hidden="true">
        <defs>
          <linearGradient id="carregando-ouro" gradientUnits="userSpaceOnUse" x1="466" y1="339" x2="526" y2="384">
            <stop offset=".1" stopColor="#A58F35" /><stop offset=".5" stopColor="#B49C3F" /><stop offset=".9" stopColor="#DBBC58" />
          </linearGradient>
          <clipPath id="carregando-recorte">{COROA.map((d, i) => <path key={i} d={d} />)}</clipPath>
          <linearGradient id="carregando-luz" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFF8E6" stopOpacity="0" /><stop offset=".5" stopColor="#FFF8E6" stopOpacity=".85" /><stop offset="1" stopColor="#FFF8E6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="carregando__miolo" fill="url(#carregando-ouro)">{COROA.map((d, i) => <path key={i} d={d} fillRule="evenodd" />)}</g>
        <g className="carregando__contorno">{COROA.map((d, i) => <path key={i} d={d} pathLength={1} style={{ animationDelay: `${i * 80}ms` }} />)}</g>
        <g clipPath="url(#carregando-recorte)"><rect className="carregando__brilho" x="430" y="300" width="34" height="130" fill="url(#carregando-luz)" /></g>
      </svg>
      {texto && (
        <svg className="carregando__royals" viewBox={ROYALS_VIEWBOX} aria-hidden="true">
          <g fill="url(#carregando-ouro)">{ROYALS.map((d, i) => <path key={i} d={d} fillRule="evenodd" />)}</g>
        </svg>
      )}
      <span className="so-leitor">{texto ?? 'Carregando'}</span>
    </span>
  );
}
