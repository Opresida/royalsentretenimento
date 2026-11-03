'use client';
/* eslint-disable @next/next/no-img-element -- capas vêm do R2 público (fora do otimizador do Next) */
// Peças interativas da página geral do casting (/artistas): o vídeo de topo de cada artista em loop mudo (só carrega
// quando aparece na tela; com "menos movimento" fica a capa), os trechos ao vivo com a onda real (um tocando por vez na
// página toda) e o vídeo-case de 1 minuto da BrandSquad (som só no clique).
import { useEffect, useRef, useState } from 'react';
import type { Trecho } from '@/data/casting';

const EVENTO = 'casting:toca'; // quem começa a tocar avisa; os outros param

function useVisivel<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisto(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visto] as const;
}

/** Vídeo de topo do artista em loop, mudo. Celular usa o vertical; tela larga, o horizontal. */
export function LoopArtista({ desktop, celular, alt }: { desktop: { mp4: string; capa: string }; celular: { mp4: string; capa: string }; alt: string }) {
  const [ref, visto] = useVisivel<HTMLDivElement>();
  const [calmo, setCalmo] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preferência do aparelho, só existe no navegador
    setCalmo(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return (
    <div ref={ref} className="loop-art" role="img" aria-label={alt}>
      <picture>
        <source media="(min-width: 900px)" srcSet={desktop.capa} />
        <img src={celular.capa} alt="" className="loop-art__capa" />
      </picture>
      {visto && !calmo ? (
        <>
          <video className="loop-art__video loop-art__video--celular" src={celular.mp4} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" />
          <video className="loop-art__video loop-art__video--desktop" src={desktop.mp4} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
}

const tempo = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Trechos ao vivo com a forma da onda; um tocando por vez na página inteira. */
export function PlayerTrechos({ trechos, artista }: { trechos: Trecho[]; artista: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [atual, setAtual] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const para = (e: Event) => { if ((e as CustomEvent).detail !== artista) { audio.current?.pause(); setTocando(false); } };
    window.addEventListener(EVENTO, para);
    return () => { window.removeEventListener(EVENTO, para); audio.current?.pause(); };
  }, [artista]);

  const toca = (t: Trecho) => {
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.addEventListener('timeupdate', () => { const a = audio.current!; setProg(a.duration ? a.currentTime / a.duration : 0); });
      audio.current.addEventListener('ended', () => { setTocando(false); setProg(0); });
    }
    const a = audio.current;
    if (atual === t.id) {
      if (a.paused) { window.dispatchEvent(new CustomEvent(EVENTO, { detail: artista })); a.play(); setTocando(true); } else { a.pause(); setTocando(false); }
      return;
    }
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: artista }));
    a.src = t.src; a.currentTime = 0; a.play(); setAtual(t.id); setTocando(true); setProg(0);
  };

  return (
    <ul className="trechos">
      {trechos.map((t) => {
        const ativo = atual === t.id;
        const barras = t.picos.length > 64 ? t.picos.filter((_, i) => i % Math.ceil(t.picos.length / 64) === 0) : t.picos;
        return (
          <li key={t.id}>
            <button type="button" className={`trecho${ativo ? ' is-ativo' : ''}`} onClick={() => toca(t)} aria-pressed={ativo && tocando} aria-label={`${ativo && tocando ? 'Pausar' : 'Ouvir'} ${t.titulo}`}>
              <span className="trecho__play" aria-hidden="true">{ativo && tocando ? '❚❚' : '▶'}</span>
              <span className="trecho__texto"><b>{t.titulo}</b><small>{t.sub} · {tempo(t.dur)}</small></span>
              <span className="trecho__onda" aria-hidden="true">
                {barras.map((p, i) => (
                  <i key={i} style={{ height: `${Math.max(8, p * 100)}%` }} className={ativo && i / barras.length <= prog ? 'cheia' : undefined} />
                ))}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Vídeo-case vertical de 1 minuto (BrandSquad): capa com play; o som só entra no clique. */
export function VideoCase({ mp4, capa, artista }: { mp4: string; capa: string; artista: string }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const para = (e: Event) => { if ((e as CustomEvent).detail !== `case-${artista}`) ref.current?.pause(); };
    window.addEventListener(EVENTO, para);
    return () => window.removeEventListener(EVENTO, para);
  }, [artista]);
  return (
    <div className="case">
      {aberto ? (
        <video ref={ref} className="case__video" src={mp4} poster={capa} controls autoPlay playsInline onPlay={() => window.dispatchEvent(new CustomEvent(EVENTO, { detail: `case-${artista}` }))} />
      ) : (
        <button type="button" className="case__capa" onClick={() => setAberto(true)} aria-label={`Assistir o vídeo de 1 minuto de ${artista}`}>
          <img src={capa} alt="" loading="lazy" />
          <span className="case__play" aria-hidden="true">▶</span>
        </button>
      )}
    </div>
  );
}
