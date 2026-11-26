// Ícones de traço (estilo Lucide, traço 1,5 e cantos vivos), como pede o design system da Royals.
type P = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'miter' as const, strokeLinecap: 'square' as const, viewBox: '0 0 24 24', 'aria-hidden': true };

export const Caixa = (p: P) => <svg {...base} {...p}><path d="M3 7h18v13H3z" /><path d="M3 7l3-4h12l3 4" /><path d="M16 13.5h2" /></svg>;
export const Calendario = (p: P) => <svg {...base} {...p}><path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4" /></svg>;
export const Mais = (p: P) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>;
export const Equipe = (p: P) => <svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3 3 3 6" /></svg>;
export const Clipe = (p: P) => <svg {...base} {...p}><path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1L13 4.3a3.3 3.3 0 0 1 4.7 4.7l-8.3 8.3a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6" /></svg>;
export const Olho = (p: P) => <svg {...base} {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
export const OlhoFechado = (p: P) => <svg {...base} {...p}><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>;
export const Seta = (p: P) => <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Camera = (p: P) => <svg {...base} {...p}><path d="M3 7h4l2-3h6l2 3h4v13H3z" /><circle cx="12" cy="13" r="4" /></svg>;
export const Arquivo = (p: P) => <svg {...base} {...p}><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></svg>;
