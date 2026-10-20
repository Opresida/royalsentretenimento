'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** A casca da barra de ingressos do celular: sai de cena enquanto os botões do topo (`.hero__acoes`, que já têm
 *  "Ingressos") estão na tela, para não cobri-los, e volta assim que a pessoa rola para baixo. Sem esses botões na
 *  página, fica sempre. Na página de OUTRO evento (ex.: /eventos/varandinha) não aparece: venderia um evento por cima
 *  da página de outro. */
export function BarraFixa({ children, estilo, slug }: { children: React.ReactNode; estilo?: React.CSSProperties; slug?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const caminho = usePathname();
  const outroEvento = !!slug && /^\/(eventos|relembre-momentos)\/[^/]+/.test(caminho) && !caminho.split('/').includes(slug);
  useEffect(() => {
    const barra = ref.current;
    if (!barra) return;
    barra.dataset.oculta = 'false';
    const io = new IntersectionObserver(([it]) => { barra.dataset.oculta = it.isIntersecting ? 'true' : 'false'; });
    // na troca de página a rota nova pode chegar depois (tela de carregamento antes): espera os botões aparecerem
    const liga = () => { const botoes = document.querySelector('.hero__acoes'); if (!botoes) return false; io.observe(botoes); return true; };
    const mo = new MutationObserver(() => { if (liga()) mo.disconnect(); });
    if (!liga()) mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [caminho]);
  if (outroEvento) return null;
  return <div ref={ref} className="barra-ingressos" style={estilo} data-oculta="false">{children}</div>;
}
