'use client';
import { useEffect, useRef, useState } from 'react';

const LIVRE = 'vsl-produtores-livre'; // a pessoa já chegou ao fim uma vez: a página abre inteira nas próximas visitas
const PONTO = 'vsl-produtores-t'; // onde ela parou, para continuar dali
const ANTES_DO_FIM = 2; // segundos: a proposta aparece 2 s antes do vídeo acabar (pedido do Humberto)

const guarda = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* sem armazenamento: segue sem lembrar */ } };
const le = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

/** Abre a página: tudo o que está em .prod-trava aparece (ver produtores.css). */
function libera() {
  if (document.documentElement.dataset.vsl === 'livre') return;
  document.documentElement.dataset.vsl = 'livre';
  guarda(LIVRE, '1');
}

/** O vídeo de vendas no topo da /produtores, em formato de página de VSL: sem barra de avanço (a linha de ouro que
 *  percorre o contorno é o progresso, no ritmo do vídeo), continua de onde a pessoa parou e libera o resto da página
 *  2 segundos antes do fim. */
export function Vsl({ video, capa }: { video: string; capa?: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const linha = useRef<SVGRectElement>(null);
  const [comecou, setComecou] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [livre, setLivre] = useState(false);
  const [acabou, setAcabou] = useState(false);
  const [retoma, setRetoma] = useState(0);
  const [medida, setMedida] = useState({ w: 1600, h: 900 });

  // o contorno é desenhado na medida real da caixa (espessura igual nos quatro lados, em qualquer tela)
  useEffect(() => {
    const c = caixa.current;
    if (!c) return;
    const ro = new ResizeObserver(([e]) => setMedida({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  // a linha de ouro: desenha a fração assistida do contorno, quadro a quadro enquanto o vídeo toca
  const desenha = () => {
    const v = ref.current;
    if (!v || !linha.current || !v.duration) return;
    linha.current.style.strokeDashoffset = String(1 - Math.min(1, v.currentTime / v.duration));
    if (v.currentTime >= v.duration - ANTES_DO_FIM) { libera(); setLivre(true); }
  };

  // o que o navegador lembra (só existe no cliente, depois da hidratação)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (document.documentElement.dataset.vsl === 'livre' || le(LIVRE)) { libera(); setLivre(true); }
    const t = Number(le(PONTO) || 0);
    if (t > 3) setRetoma(t);
  }, []);

  useEffect(() => {
    if (!tocando) return;
    let id = 0, ultimo = 0;
    const passo = (agora: number) => {
      desenha();
      const v = ref.current;
      if (v && agora - ultimo > 2000) { ultimo = agora; guarda(PONTO, String(Math.floor(v.currentTime))); }
      id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    // reserva: se o navegador segurar os quadros de animação, a conferência do tempo segue a cada 0,1 s
    const reserva = window.setInterval(desenha, 100);
    return () => { cancelAnimationFrame(id); window.clearInterval(reserva); };
  }, [tocando]);

  function play() {
    const v = ref.current;
    if (!v) return;
    if (!comecou) {
      setComecou(true);
      if (retoma && (!v.duration || retoma < v.duration - ANTES_DO_FIM - 1)) v.currentTime = retoma;
    }
    if (acabou) { v.currentTime = 0; setAcabou(false); }
    v.play().catch(() => setTocando(false));
  }
  function alterna() { const v = ref.current; if (!v) return; if (v.paused) play(); else v.pause(); }
  function telaCheia() {
    const c = caixa.current, v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (c?.requestFullscreen) c.requestFullscreen().catch(() => v?.webkitEnterFullscreen?.());
    else v?.webkitEnterFullscreen?.();
  }
  const verProposta = () => document.getElementById('proposta')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="prod-vsl-bloco">
      <div ref={caixa} className={`prod-vsl${tocando ? ' prod-vsl--tocando' : ''}`}>
        <video
          ref={ref}
          src={video}
          poster={capa}
          playsInline
          preload="metadata"
          onClick={alterna}
          onPlay={() => setTocando(true)}
          onPause={() => setTocando(false)}
          onLoadedMetadata={desenha}
          onSeeked={desenha}
          onEnded={() => { setTocando(false); setAcabou(true); libera(); setLivre(true); guarda(PONTO, null); desenha(); }}
          onError={() => { libera(); setLivre(true); }}
          onVolumeChange={() => setMudo(!!ref.current?.muted)}
        />
        {/* a linha que percorre o contorno no tempo do vídeo (começa no canto de cima, à esquerda, e anda no sentido horário) */}
        <svg className="prod-vsl__contorno" viewBox={`0 0 ${medida.w} ${medida.h}`} aria-hidden="true">
          <rect ref={linha} x="1.5" y="1.5" width={Math.max(0, medida.w - 3)} height={Math.max(0, medida.h - 3)} pathLength={1} />
        </svg>
        {!tocando && (
          <button type="button" className={`prod-vsl__play${acabou ? ' prod-vsl__play--capa prod-vsl__play--fim' : comecou ? '' : ' prod-vsl__play--capa'}`} onClick={play} aria-label={comecou ? 'Continuar o vídeo' : 'Assistir ao vídeo da parceria'}>
            <span className="prod-vsl__circulo" aria-hidden="true"><span className="prod-vsl__triangulo" /></span>
            <span className="rotulo-texto">
              {acabou ? 'Assistir de novo' : comecou ? 'Continuar assistindo' : retoma ? 'Continuar de onde parou' : 'Assista · 4 min'}
            </span>
          </button>
        )}
        {comecou && (
          <div className="prod-vsl__controles">
            <button type="button" onClick={() => { if (ref.current) ref.current.muted = !ref.current.muted; }} aria-label={mudo ? 'Ligar o som' : 'Tirar o som'}>
              {mudo ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9l5 6M21 9l-5 6" fill="none" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" /></svg>
              )}
            </button>
            <button type="button" onClick={telaCheia} aria-label="Tela cheia">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" /></svg>
            </button>
          </div>
        )}
      </div>
      {livre ? (
        <button type="button" className="prod-vsl__aviso prod-vsl__aviso--livre" onClick={verProposta}>
          <span aria-hidden="true">↓</span> A proposta completa está logo abaixo
        </button>
      ) : (
        <p className="prod-vsl__aviso">Assista até o fim: a proposta completa aparece logo depois do vídeo.</p>
      )}
    </div>
  );
}
