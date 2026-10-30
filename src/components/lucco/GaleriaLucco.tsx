'use client';
import { useEffect, useRef, useState } from 'react';
import { CarregandoLucco } from './CarregandoLucco';

type Foto = { base: string; w: number; h: number; larguras: number[]; alt: string };
const srcSet = (f: Foto) => f.larguras.map((l) => `${f.base}-${l}.webp ${l}w`).join(', ');

/** Fotos em colunas + ampliação em <dialog> (setas, Esc, arrastar no celular). A foto grande mostra o spinner da marca
 *  até carregar. */
export function GaleriaLucco({ fotos }: { fotos: Foto[] }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const [carregou, setCarregou] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  const toque = useRef(0);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (aberta !== null && !d.open) d.showModal();
    if (aberta === null && d.open) d.close();
  }, [aberta]);

  const vai = (passo: number) => { setCarregou(false); setAberta((a) => (a === null ? a : (a + passo + fotos.length) % fotos.length)); };
  const f = aberta !== null ? fotos[aberta] : null;

  return (
    <>
      <div className="galeria">
        {fotos.map((x, i) => (
          <button type="button" key={x.base} className="galeria__item" style={{ aspectRatio: `${x.w} / ${x.h}`, '--i': i } as React.CSSProperties}
            onClick={() => { setCarregou(false); setAberta(i); }} aria-label={`Ampliar: ${x.alt}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${x.base}-640.webp`} srcSet={srcSet(x)} sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw" alt={x.alt} width={x.w} height={x.h} loading="lazy" />
          </button>
        ))}
      </div>
      <dialog ref={dlg} className="amplia" onClose={() => setAberta(null)} onClick={(e) => { if (e.target === dlg.current) setAberta(null); }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') vai(1); if (e.key === 'ArrowLeft') vai(-1); }}
        onTouchStart={(e) => { toque.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - toque.current; if (Math.abs(dx) > 50) vai(dx < 0 ? 1 : -1); }}>
        {f && (
          <figure>
            {!carregou && <span className="amplia__carrega"><CarregandoLucco rotulo="Carregando a foto" /></span>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={f.base} src={`${f.base}-${f.larguras.at(-1)}.webp`} alt={f.alt} onLoad={() => setCarregou(true)} className={carregou ? 'ok' : ''} />
            <figcaption>{(aberta ?? 0) + 1} / {fotos.length}</figcaption>
          </figure>
        )}
        <button type="button" className="amplia__fecha" onClick={() => setAberta(null)} aria-label="Fechar">×</button>
        <button type="button" className="amplia__seta amplia__seta--ant" onClick={() => vai(-1)} aria-label="Foto anterior">‹</button>
        <button type="button" className="amplia__seta amplia__seta--prox" onClick={() => vai(1)} aria-label="Próxima foto">›</button>
      </dialog>
    </>
  );
}
