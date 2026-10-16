'use client';
import { useLayoutEffect, useRef } from 'react';
import { LogoRevela } from './Marca';
import { FIM_DA_ABERTURA, visita } from '@/lib/transicoes';

const DURACAO = 3450; // a timeline inteira (CSS .abertura): logo 0–1,9 s, parada até 3,0 s, saída 3,0–3,45 s

/**
 * Abertura com a logo da Royals, sempre que o site é aberto na home (pedido do Humberto, 16/10). A animação é toda em
 * CSS e já vem no HTML: a página nunca pisca antes dela e, sem JavaScript, a cortina sai sozinha.
 * Aqui só: (1) se a home foi aberta navegando dentro do site, some antes de pintar (lá toca a transição da página);
 * (2) toque, clique ou Esc pulam; (3) a rolagem fica travada até a cortina sair; (4) avisa o topo da home
 * (Revela aguardaAbertura) para animar só depois.
 */
export function AberturaMarca() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const html = document.documentElement;
    const termina = () => {
      if (el.dataset.fim) return;
      el.dataset.fim = 'true';
      html.classList.remove('abertura-ativa');
      window.dispatchEvent(new Event(FIM_DA_ABERTURA));
    };
    if (visita.navegou || performance.now() > DURACAO) { el.dataset.fim = 'true'; return; }
    html.classList.add('abertura-ativa');
    const pula = () => { el.dataset.pular = 'true'; };
    const tecla = (ev: KeyboardEvent) => { if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') pula(); };
    const acabou = (ev: AnimationEvent) => { if (ev.target === el) termina(); };
    const garantia = window.setTimeout(termina, DURACAO - performance.now() + 200);
    el.addEventListener('animationend', acabou);
    el.addEventListener('pointerdown', pula);
    window.addEventListener('keydown', tecla);
    return () => {
      window.clearTimeout(garantia);
      el.removeEventListener('animationend', acabou);
      el.removeEventListener('pointerdown', pula);
      window.removeEventListener('keydown', tecla);
      html.classList.remove('abertura-ativa');
    };
  }, []);
  return (
    <div ref={ref} className="abertura" aria-hidden="true">
      <LogoRevela className="abertura__logo" prefixo="ab" />
    </div>
  );
}
