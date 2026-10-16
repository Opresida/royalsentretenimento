'use client';
import { useEffect, useRef, useState } from 'react';

const formata = (v: number, casas: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** Número que conta de 0 até `valor` quando entra na tela (curva expo, como os tokens de motion da marca).
 *  Sem JavaScript ou com movimento reduzido, mostra o valor final direto. */
export function ContaNumero({ valor, casas = 0, atraso = 0, duracao = 1400 }: { valor: number; casas?: number; atraso?: number; duracao?: number }) {
  const [mostra, setMostra] = useState(valor);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, inicio = 0;
    setMostra(0);
    const passo = (t: number) => {
      if (!inicio) inicio = t + atraso;
      const p = Math.min(1, Math.max(0, (t - inicio) / duracao));
      setMostra(valor * (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    const io = new IntersectionObserver(([it]) => { if (it.isIntersecting) { raf = requestAnimationFrame(passo); io.disconnect(); } }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [valor, atraso, duracao]);
  return <span ref={ref} className="numero__num">{formata(casas ? mostra : Math.round(mostra), casas)}</span>;
}
