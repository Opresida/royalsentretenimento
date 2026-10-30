'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { TOCAR } from './PlayerLucco';

/** Vídeo do topo (mudo, loop): escolhe o vertical no celular e o 16:9 no computador já no navegador, para baixar só um.
 *  Sem JS ou com movimento reduzido fica só a capa. */
export function VideoTopo({ desktop, celular }: { desktop: { mp4: string; capa: string }; celular: { mp4: string; capa: string } }) {
  const [src, setSrc] = useState<{ mp4: string; capa: string } | null>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const mq = matchMedia('(min-aspect-ratio: 1/1)');
    const escolhe = () => setSrc(mq.matches ? desktop : celular);
    escolhe();
    mq.addEventListener('change', escolhe);
    return () => mq.removeEventListener('change', escolhe);
  }, [desktop, celular]);
  return src ? <video key={src.mp4} className="topo-l__video" src={src.mp4} poster={src.capa} autoPlay muted loop playsInline preload="auto" aria-hidden="true" /> : null;
}

/** "Ouvir o set": rola até o player e toca a faixa pedida. */
export function BotaoOuvir({ faixa, children, className }: { faixa: string; children: React.ReactNode; className?: string }) {
  return (
    <a href="#som" className={className} onClick={() => window.dispatchEvent(new CustomEvent(TOCAR, { detail: faixa }))}>
      {children}
    </a>
  );
}

/** Barra fixa "Contratar o LUCCO" (celular e tablet): some quando a seção de contratação está na tela. */
export function BarraContratar() {
  const [some, setSome] = useState(true);
  useEffect(() => {
    const alvo = document.getElementById('contratar');
    const topo = document.getElementById('topo-lucco');
    if (!alvo || !topo) return;
    let noAlvo = false, noTopo = true;
    const atualiza = () => setSome(noAlvo || noTopo);
    const io = new IntersectionObserver((itens) => {
      for (const it of itens) { if (it.target === alvo) noAlvo = it.isIntersecting; else noTopo = it.isIntersecting; }
      atualiza();
    }, { threshold: 0.12 });
    io.observe(alvo);
    io.observe(topo);
    return () => io.disconnect();
  }, []);
  return (
    <a href="#contratar" className={`barra-l ${some ? 'some' : ''}`} tabIndex={some ? -1 : 0} aria-hidden={some}>
      <span>Contratar o LUCCO</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
    </a>
  );
}

const nada = () => () => {};

/** Mostra o conteúdo só até `fim` (ISO). A página é estática: a conferência é feita no navegador. */
export function AteData({ fim, children }: { fim: string; children: React.ReactNode }) {
  const passou = useSyncExternalStore(nada, () => Date.now() > Date.parse(fim), () => false);
  return passou ? null : <>{children}</>;
}

/** Letreiro infinito (duplica a fileira; pausa com movimento reduzido). */
export function Letreiro({ itens }: { itens: string[] }) {
  return (
    <div className="letreiro-l" aria-hidden="true">
      {[0, 1].map((k) => (
        <div key={k} className="letreiro-l__fila">
          {itens.map((t) => <span key={t}>{t}<i>✦</i></span>)}
        </div>
      ))}
    </div>
  );
}

/** Selo do topo: ganha fundo sólido depois que a página rola (antes, só o degradê sobre o vídeo). */
export function SeloRolagem() {
  useEffect(() => {
    const selo = document.querySelector('.selo-l');
    const confere = () => selo?.classList.toggle('rolou', window.scrollY > 40);
    confere();
    window.addEventListener('scroll', confere, { passive: true });
    return () => window.removeEventListener('scroll', confere);
  }, []);
  return null;
}
