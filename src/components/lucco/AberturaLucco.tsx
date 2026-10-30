'use client';
import { useEffect } from 'react';
import { LogoLucco } from './LogoLucco';

export const FIM_ABERTURA_LUCCO = 'lucco:fim-abertura';
const CHAVE = 'lucco-abertura';
const MINIMO_MS = 2400; // a logo inteira: contorno, enche, base encaixa, luz no corte
const MAXIMO_MS = 5000;

/** Roda antes da 1ª pintura (script inline no topo da página): decide se a abertura aparece, para a cortina nunca
 *  piscar para quem não deve vê-la. Trava de segurança: se o React não subir em 6,5 s, tira a cortina. */
export const PRE_PINTURA = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('${CHAVE}')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('lucco-sem-abertura')}else{d.classList.add('lucco-abertura');setTimeout(function(){if(!window.__luccoVivo){d.classList.remove('lucco-abertura');d.classList.add('lucco-sem-abertura')}},6500)}}catch(e){document.documentElement.classList.add('lucco-sem-abertura')}})();`;

/** Abertura com a logo do LUCCO (uma vez por sessão; "Pular" e Esc encerram). Sai em cortina para cima e avisa a página
 *  (evento lucco:fim-abertura), que só então anima o topo. Na navegação interna (vindo de outra página da Royals) o
 *  script inline não roda: a decisão é tomada aqui. */
export function AberturaLucco() {
  useEffect(() => {
    const d = document.documentElement;
    (window as unknown as { __luccoVivo?: boolean }).__luccoVivo = true;
    if (!d.classList.contains('lucco-abertura') && !d.classList.contains('lucco-sem-abertura')) {
      let viu = false;
      try { viu = !!sessionStorage.getItem(CHAVE); } catch {}
      d.classList.add(viu || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'lucco-sem-abertura' : 'lucco-abertura');
    }
    const timers: number[] = [];
    let feito = false;
    const avisa = () => window.dispatchEvent(new Event(FIM_ABERTURA_LUCCO));
    if (!d.classList.contains('lucco-abertura')) { avisa(); return () => d.classList.remove('lucco-sem-abertura'); }

    const inicio = performance.now();
    const fecha = () => {
      if (feito) return;
      feito = true;
      try { sessionStorage.setItem(CHAVE, '1'); } catch {}
      d.classList.add('lucco-abertura-saindo');
      timers.push(window.setTimeout(() => {
        d.classList.remove('lucco-abertura', 'lucco-abertura-saindo');
        d.classList.add('lucco-sem-abertura');
        avisa();
      }, 700));
    };
    const pronto = () => timers.push(window.setTimeout(fecha, Math.max(0, MINIMO_MS - (performance.now() - inicio))));
    if (document.readyState === 'complete') pronto(); else window.addEventListener('load', pronto, { once: true });
    timers.push(window.setTimeout(fecha, MAXIMO_MS));
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fecha(); };
    window.addEventListener('keydown', tecla);
    const pular = document.getElementById('lucco-pular');
    pular?.addEventListener('click', fecha);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('load', pronto);
      window.removeEventListener('keydown', tecla);
      pular?.removeEventListener('click', fecha);
      d.classList.remove('lucco-abertura', 'lucco-abertura-saindo', 'lucco-sem-abertura');
    };
  }, []);

  return (
    <div className="lab" aria-hidden="true">
      <div className="lab__halo" />
      <div className="lab__miolo">
        <span className="lab__rot">Royals Entretenimento apresenta</span>
        <LogoLucco id="ll-abertura" className="lab__logo" />
        <span className="lab__barra"><span /></span>
        <span className="lab__generos">House · Tech House · Afro House</span>
      </div>
      <button type="button" id="lucco-pular" className="lab__pular" tabIndex={-1}>Pular</button>
    </div>
  );
}
