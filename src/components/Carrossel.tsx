'use client';
import { useEffect, useRef } from 'react';

/**
 * Carrossel infinito (faixa que corre sozinha). A fileira é renderizada duas vezes e anda metade do trilho em loop, então
 * a emenda não aparece. Só CSS no movimento (sem JavaScript por quadro), em velocidade constante: `segundosPorItem`.
 * Para quando o mouse ou o foco do teclado estão em cima (dá para clicar) e quando o carrossel sai da tela.
 * A cópia é só visual: some para leitores de tela e sai da ordem do Tab. Com movimento reduzido, vira uma fileira
 * parada que se arrasta com o dedo (CSS).
 */
export function Carrossel({ children, sentido, segundosPorItem = 6, quantidade, rotulo, className = '' }: {
  children: React.ReactNode; sentido: 'esquerda' | 'direita'; segundosPorItem?: number; quantidade: number; rotulo: string; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll('.carrossel__grupo--copia a, .carrossel__grupo--copia button').forEach((x) => x.setAttribute('tabindex', '-1'));
    const io = new IntersectionObserver(([it]) => { el.dataset.ativo = it.isIntersecting ? 'true' : 'false'; }, { rootMargin: '100px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`carrossel carrossel--${sentido} ${className}`} data-ativo="false" role="region" aria-label={rotulo}
      style={{ '--duracao': `${quantidade * segundosPorItem}s` } as React.CSSProperties}>
      <div className="carrossel__trilho">
        <div className="carrossel__grupo">{children}</div>
        <div className="carrossel__grupo carrossel__grupo--copia" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
