'use client';
import { useEffect, useRef } from 'react';

/**
 * Fundos em loop da biblioteca de motion da Royals (Material Proprio/motion/motion-catalog.jsx, família 04),
 * portados para CSS (sem redesenhar a cada quadro em JavaScript):
 *   diagonais (F1) · duas camadas de linhas a 45° em velocidades diferentes, acesas por uma luz que circula. Uso: fundo de site.
 *   brilho    (F2) · luz quente de ouro circulando sobre o preto, reflexo horizontal e grão de filme. Uso: hero e peças.
 *   pulso     (F3) · 130 BPM: a coroa pulsa na batida, uma faixa de luz a 45° troca de lugar a cada batida, flash a cada 4.
 *                    No site, versão ESCURECIDA (pedido do Humberto, 16/10, para a chamada dos promoters): luz e faixa
 *                    bem mais fracas, coroa como marca-d'água e o flash quase apagado (o catálogo o destina ao telão).
 * `evento`: a luz troca o ouro pela cor do evento (--event-accent), para o topo do evento no celular.
 * A animação só roda com o fundo na tela (data-ativo); com movimento reduzido, fica um quadro parado (CSS).
 */
export function FundoLoop({ tipo, evento }: { tipo: 'diagonais' | 'brilho' | 'pulso'; evento?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([it]) => { el.dataset.ativo = it.isIntersecting ? 'true' : 'false'; }, { rootMargin: '120px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`fundo-loop fundo-loop--${tipo}${evento ? ' fundo-loop--evento' : ''}`} data-ativo="false" aria-hidden="true">
      {tipo === 'diagonais' && (
        <div className="fundo-loop__luz">
          <div className="fundo-loop__linhas fundo-loop__linhas--finas" />
          <div className="fundo-loop__linhas" />
        </div>
      )}
      {tipo === 'brilho' && <div className="fundo-loop__reflexo" />}
      {tipo === 'pulso' && (
        <>
          <div className="fundo-loop__halo" />
          <div className="fundo-loop__faixa" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fundo-loop__coroa" src="/marca/royals-symbol-gold.svg" alt="" />
          <div className="fundo-loop__flash" />
        </>
      )}
      <div className="fundo-loop__vinheta" />
    </div>
  );
}
