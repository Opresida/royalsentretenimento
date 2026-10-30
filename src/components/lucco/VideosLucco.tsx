'use client';
import { useEffect, useRef, useState } from 'react';
import { CarregandoLucco } from './CarregandoLucco';
import { SOM_PLAYER, SOM_VIDEO } from './PlayerLucco';

type Video = { id: string; titulo: string; mp4: string; capa: string; w: number; h: number };

/** "Ao vivo": vídeos do artista tocando. Só a capa até o clique (economiza dados); aí o vídeo entra com som, o spinner
 *  da marca fica até ele começar e o player de música pausa. Tocar música no player pausa o vídeo. */
export function VideosLucco({ videos }: { videos: Video[] }) {
  const [ativo, setAtivo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const para = () => ref.current?.pause();
    window.addEventListener(SOM_PLAYER, para);
    return () => window.removeEventListener(SOM_PLAYER, para);
  }, []);

  return (
    <div className="aovivo">
      {videos.map((v, i) => {
        const deitado = v.w > v.h;
        const on = ativo === v.id;
        return (
          <figure key={v.id} className={`aovivo__item ${deitado ? 'deitado' : ''} ${on ? 'on' : ''}`} style={{ '--i': i } as React.CSSProperties}>
            {on ? (
              <>
                <video ref={ref} src={v.mp4} poster={v.capa} controls autoPlay playsInline preload="auto"
                  onPlay={() => window.dispatchEvent(new Event(SOM_VIDEO))}
                  onPlaying={() => setCarregando(false)} onWaiting={() => setCarregando(true)} onEnded={() => setAtivo(null)} />
                {carregando && <span className="aovivo__carrega"><CarregandoLucco rotulo={`Carregando ${v.titulo}`} /></span>}
              </>
            ) : (
              <button type="button" className="aovivo__capa" onClick={() => { setAtivo(v.id); setCarregando(true); }} aria-label={`Assistir: ${v.titulo}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.capa} alt="" width={v.w} height={v.h} loading="lazy" />
                <span className="aovivo__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
              </button>
            )}
            <figcaption><span>{String(i + 1).padStart(2, '0')}</span>{v.titulo}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
