'use client';

import { useEffect, useRef, useState } from 'react';

// Mostra o HTML do e-mail num iframe do mesmo site e ajusta a altura ao conteúdo (sem barra de rolagem interna).
// O iframe pode terminar de carregar antes da hidratação (aí o onLoad do React não dispara): por isso mede no efeito,
// escuta o load e acompanha o corpo do e-mail com ResizeObserver (imagens que chegam depois, largura do celular).
export function CopiaEmail({ src }: { src: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [altura, setAltura] = useState(800);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let obs: ResizeObserver | undefined;
    const ligar = () => {
      const body = iframe.contentDocument?.body;
      if (!body) return;
      const medir = () => setAltura(Math.ceil(body.getBoundingClientRect().height) + 2); // + a borda de 1px em cima e embaixo
      medir();
      obs?.disconnect();
      obs = new ResizeObserver(medir);
      obs.observe(body);
    };
    if (iframe.contentDocument?.readyState === 'complete') ligar();
    iframe.addEventListener('load', ligar);
    return () => { iframe.removeEventListener('load', ligar); obs?.disconnect(); };
  }, []);

  return (
    <div className="rel-email">
      <iframe ref={ref} src={src} title="Cópia do e-mail enviado às casas de show" style={{ height: altura }} />
      <a className="rel-email__abrir" href={src} target="_blank" rel="noopener">Abrir o e-mail em tela cheia ↗</a>
    </div>
  );
}
