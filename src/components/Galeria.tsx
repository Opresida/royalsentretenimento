'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Carregando } from './Carregando';
import { Carrossel } from './Carrossel';

export type ItemGaleria = { id: string; tipo: 'imagem' | 'video' | 'so-capa'; p: string; g: string; video?: string; link: string; legenda?: string; meta?: string; titulo?: string; rotulo?: string; detalhe?: string; w: number; h: number };

/** Mosaico de fotos e vídeos do acervo + lightbox (Dialog da marca) com navegação por setas e teclado.
 *  Reels sem arquivo (a Meta bloqueia música com direito autoral) abrem a capa e o link para assistir no Instagram. */
export function Galeria({ itens, proporcao = '4x5', filtros, colunas, carrossel }: { itens: ItemGaleria[]; proporcao?: '4x5' | '9x16' | '1x1'; colunas?: 4; filtros?: { rotulo: string; valor: string; ids: string[] }[]; carrossel?: { sentido: 'esquerda' | 'direita'; rotulo: string } }) {
  const [filtro, setFiltro] = useState(filtros?.[0]?.valor);
  const lista = useMemo(() => {
    const f = filtros?.find((x) => x.valor === filtro);
    return f ? itens.filter((i) => f.ids.includes(i.id)) : itens;
  }, [itens, filtros, filtro]);
  const [aberto, setAberto] = useState<number | null>(null);
  const fechar = useCallback(() => setAberto(null), []);
  const andar = useCallback((d: number) => setAberto((a) => (a === null ? a : (a + d + lista.length) % lista.length)), [lista.length]);
  useEffect(() => {
    if (aberto === null) return;
    document.body.style.overflow = 'hidden';
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); if (e.key === 'ArrowRight') andar(1); if (e.key === 'ArrowLeft') andar(-1); };
    window.addEventListener('keydown', k);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', k); };
  }, [aberto, fechar, andar]);
  const atual = aberto !== null ? lista[aberto] : null;
  return (
    <>
      {filtros && filtros.length > 1 && (
        <div className="abas" role="tablist">
          {filtros.map((f) => (
            <button key={f.valor} type="button" role="tab" aria-selected={filtro === f.valor} onClick={() => setFiltro(f.valor)}>{f.rotulo}<span>{f.ids.length}</span></button>
          ))}
        </div>
      )}
      {(() => {
        const pecas = lista.map((m, i) => (
          m.rotulo ? (
            // capa padronizada de vídeo (molde do brandbook): rótulo do tipo, play, fio de ouro, evento, ano e duração
            <button key={m.id} type="button" className={`midia midia--${proporcao} midia--video`} onClick={() => setAberto(i)} aria-label={`${m.rotulo}: ${m.titulo}, ${m.detalhe}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.p} alt="" loading="lazy" />
              <span className="midia__rotulo">{m.rotulo}</span>
              <span className="midia__play" aria-hidden="true">▶</span>
              <span className="midia__texto">
                <span className="midia__fio" aria-hidden="true" />
                <span className="midia__titulo">{m.titulo}</span>
                <span className="midia__meta">{m.detalhe}</span>
              </span>
            </button>
          ) : (
          <button key={m.id} type="button" className={`midia midia--${proporcao}`} onClick={() => setAberto(i)} aria-label={m.titulo ?? (m.tipo === 'imagem' ? 'Abrir foto' : 'Abrir vídeo')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.p} alt="" loading="lazy" />
            {m.tipo !== 'imagem' && <span className="midia__play" aria-hidden="true">▶</span>}
            {(m.meta || m.titulo) && <span className="midia__texto">{m.meta && <span className="midia__meta">{m.meta}</span>}{m.titulo && <span className="midia__titulo">{m.titulo}</span>}</span>}
          </button>
          )
        ));
        return carrossel
          ? <Carrossel sentido={carrossel.sentido} rotulo={carrossel.rotulo} quantidade={lista.length} segundosPorItem={5} className="carrossel--midia">{pecas}</Carrossel>
          : <div className={`grade grade--mosaico${colunas ? ` grade--vitrine-${colunas}` : ''}`}>{pecas}</div>;
      })()}
      {atual && (
        <div className="dialogo" onClick={fechar}>
          <div className="dialogo__caixa" role="dialog" aria-modal="true" aria-label={atual.titulo ?? 'Mídia do acervo'} onClick={(e) => e.stopPropagation()}>
            <div className="dialogo__topo">
              <span className="rotulo-texto">{atual.rotulo ? `${atual.rotulo} · ${atual.titulo}` : atual.meta ?? 'Acervo'}{lista.length > 1 && ` · ${aberto! + 1}/${lista.length}`}</span>
              <div className="dialogo__nav">
                {lista.length > 1 && <button type="button" className="fechar" aria-label="Anterior" onClick={() => andar(-1)}>←</button>}
                {lista.length > 1 && <button type="button" className="fechar" aria-label="Próxima" onClick={() => andar(1)}>→</button>}
                <button type="button" className="fechar" aria-label="Fechar" onClick={fechar}>×</button>
              </div>
            </div>
            <PalcoMidia key={atual.id} m={atual} />
            {atual.legenda && <p className="dialogo__legenda">{atual.legenda}</p>}
            <a className="botao botao--fantasma botao--sm" href={atual.link} target="_blank" rel="noopener noreferrer">{atual.tipo === 'so-capa' ? 'Assistir no Instagram' : 'Ver no Instagram'}<span className="seta" aria-hidden="true">↗</span></a>
          </div>
        </div>
      )}
    </>
  );
}

/** A mídia aberta no visualizador, com o spinner da marca até ela carregar. Uma por item (key), então o estado reinicia. */
function PalcoMidia({ m }: { m: ItemGaleria }) {
  const [pronta, setPronta] = useState(false);
  return (
    <div className="dialogo__palco">
      {m.video
        ? <video src={m.video} poster={m.g} controls autoPlay playsInline onCanPlay={() => setPronta(true)} />
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={m.g} alt={m.titulo ?? ''} onLoad={() => setPronta(true)} style={{ opacity: pronta ? 1 : 0, transition: 'opacity var(--dur-element) linear' }} />}
      {!pronta && <Carregando tamanho={32} />}
    </div>
  );
}
