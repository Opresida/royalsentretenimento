'use client';
import { useEffect } from 'react';
import { LogoBerto } from './LogoBerto';

export const FIM_ABERTURA_BERTO = 'berto:fim-abertura';
const MINIMO_MS = 2600; // a tag pichada + a passada do spray no estêncil
const MAXIMO_MS = 5000;

/** Roda antes da 1ª pintura (script inline no topo da página): decide se a abertura aparece, para a cortina nunca piscar
 *  para quem não deve vê-la (só quem pediu menos movimento no aparelho). Trava de segurança: se o React não subir em
 *  6,5 s, tira a cortina. */
export const PRE_PINTURA = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('berto-sem-abertura')}else{d.classList.add('berto-abertura');setTimeout(function(){if(!window.__bertoVivo){d.classList.remove('berto-abertura');d.classList.add('berto-sem-abertura')}},6500)}}catch(e){document.documentElement.classList.add('berto-sem-abertura')}})();`;

/** Abertura do BERTOLOSSI (a cada carregamento da página, pedido do Humberto em 31/10/2026; "Pular" e Esc encerram):
 *  a tag "Bertolossi" é pichada na parede e a logo entra no estêncil. Sai rasgando para cima (como lambe arrancado) e
 *  avisa a página (berto:fim-abertura). */
export function AberturaBerto() {
  useEffect(() => {
    const d = document.documentElement;
    (window as unknown as { __bertoVivo?: boolean }).__bertoVivo = true;
    if (!d.classList.contains('berto-abertura') && !d.classList.contains('berto-sem-abertura')) {
      d.classList.add(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'berto-sem-abertura' : 'berto-abertura');
    }
    const timers: number[] = [];
    let feito = false;
    const avisa = () => window.dispatchEvent(new Event(FIM_ABERTURA_BERTO));
    if (!d.classList.contains('berto-abertura')) { avisa(); return () => d.classList.remove('berto-sem-abertura'); }

    const inicio = performance.now();
    const fecha = () => {
      if (feito) return;
      feito = true;
      d.classList.add('berto-abertura-saindo');
      timers.push(window.setTimeout(() => {
        d.classList.remove('berto-abertura', 'berto-abertura-saindo');
        d.classList.add('berto-sem-abertura');
        avisa();
      }, 750));
    };
    const pronto = () => timers.push(window.setTimeout(fecha, Math.max(0, MINIMO_MS - (performance.now() - inicio))));
    if (document.readyState === 'complete') pronto(); else window.addEventListener('load', pronto, { once: true });
    timers.push(window.setTimeout(fecha, MAXIMO_MS));
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fecha(); };
    window.addEventListener('keydown', tecla);
    const pular = document.getElementById('berto-pular');
    pular?.addEventListener('click', fecha);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('load', pronto);
      window.removeEventListener('keydown', tecla);
      pular?.removeEventListener('click', fecha);
      d.classList.remove('berto-abertura', 'berto-abertura-saindo', 'berto-sem-abertura');
    };
  }, []);

  return (
    <div className="bab" aria-hidden="true">
      <div className="bab__poste" />
      <div className="bab__miolo">
        <span className="bab__rot">Royals Entretenimento apresenta</span>
        <span className="bab__tag">Bertolossi</span>
        <LogoBerto id="bl-abertura" className="bab__logo" />
        <span className="bab__onde">Morro do Martins · São Gonçalo · RJ</span>
      </div>
      <button type="button" id="berto-pular" className="bab__pular" tabIndex={-1}>Pular</button>
    </div>
  );
}
