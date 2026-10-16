'use client';
import { useEffect, useRef } from 'react';
import { FIM_DA_ABERTURA } from '@/lib/transicoes';

/** Marca o bloco como "visivel" quando ele entra na tela: dispara as revelações por máscara (CSS em globals.css).
 *  `aguardaAbertura`: com a abertura da logo na tela (AberturaMarca), só começa depois que a cortina sai. */
export function Revela({ children, className = '', como: Tag = 'div', id, aguardaAbertura }: { children: React.ReactNode; className?: string; como?: 'div' | 'section' | 'header'; id?: string; aguardaAbertura?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((itens) => {
      for (const it of itens) if (it.isIntersecting) { el.classList.add('visivel'); io.disconnect(); }
    }, { rootMargin: '0px 0px -12% 0px' });
    const comeca = () => io.observe(el);
    if (aguardaAbertura && document.documentElement.classList.contains('abertura-ativa')) window.addEventListener(FIM_DA_ABERTURA, comeca, { once: true });
    else comeca();
    return () => { io.disconnect(); window.removeEventListener(FIM_DA_ABERTURA, comeca); };
  }, [aguardaAbertura]);
  return <Tag ref={ref as never} id={id} className={`revela ${className}`}>{children}</Tag>;
}
