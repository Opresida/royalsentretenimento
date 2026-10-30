'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { Faixa } from '@/data/artistas/lucco';
import { CarregandoLucco } from './CarregandoLucco';

/** Eventos entre as partes da página: tocar uma faixa (botão do topo), e um som corta o outro (player × vídeos). */
export const TOCAR = 'lucco:tocar';
export const SOM_PLAYER = 'lucco:som-player';
export const SOM_VIDEO = 'lucco:som-video';

type Widget = {
  bind: (ev: string, fn: (e?: { currentPosition: number; relativePosition: number }) => void) => void;
  play: () => void; pause: () => void; seekTo: (ms: number) => void;
};
type SC = { Widget: ((el: HTMLIFrameElement) => Widget) & { Events: Record<string, string> } };

const tempo = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`;
};

const semAssinatura = () => () => {};

let scPromessa: Promise<SC> | null = null;
function carregaSoundCloud(): Promise<SC> {
  scPromessa ??= new Promise((ok, falha) => {
    const w = window as unknown as { SC?: SC };
    if (w.SC) return ok(w.SC);
    const s = document.createElement('script');
    s.src = 'https://w.soundcloud.com/player/api.js';
    s.async = true;
    s.onload = () => (w.SC ? ok(w.SC) : falha(new Error('SC')));
    s.onerror = () => { scPromessa = null; falha(new Error('SC')); };
    document.head.appendChild(s);
  });
  return scPromessa;
}

/**
 * Player do LUCCO ("o deck"): o SET SUNRISE completo (widget oficial do SoundCloud num iframe escondido, com controle
 * próprio) + trechos ao vivo (o som dos vídeos dele, no R2, tocados pela página). Um som por vez.
 * - Faixa em movimento: a onda (picos pré-calculados) acende conforme toca e aceita clique para avançar; em cima, um
 *   espectro ao vivo: nos trechos vem do som de verdade (Web Audio, AnalyserNode; o R2 libera CORS para o site); no set,
 *   que toca dentro do iframe do SoundCloud, as barras seguem a onda do set no ponto em que ele está.
 * - Se o navegador não deixar o SoundCloud tocar sozinho (iPhone), o player oficial aparece para um toque.
 * - Mini-player fixo (portal em #lucco-dock) quando o deck sai da tela com som tocando.
 */
export function PlayerLucco({ faixas }: { faixas: Faixa[] }) {
  const [idx, setIdx] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [pos, setPos] = useState(0); // segundos
  const [mostraSC, setMostraSC] = useState(false);
  const [scAtivo, setScAtivo] = useState(false); // iframe montado
  const [deckVisivel, setDeckVisivel] = useState(true);
  const dock = useSyncExternalStore(semAssinatura, () => document.getElementById('lucco-dock'), () => null);

  const faixa = faixas[idx];
  const deckRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const semAnalise = useRef(false);
  const ctxRef = useRef<{ ctx: AudioContext; an: AnalyserNode; dados: Uint8Array<ArrayBuffer> } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<Widget | null>(null);
  const espectros = useRef<Set<HTMLCanvasElement>>(new Set());
  const estado = useRef({ idx: 0, tocando: false, pos: 0 });
  estado.current = { idx, tocando, pos };
  const timerSC = useRef<number | undefined>(undefined);

  // ——— áudio dos trechos ———
  const audio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const a = new Audio();
    a.preload = 'none';
    if (!semAnalise.current) a.crossOrigin = 'anonymous';
    a.addEventListener('playing', () => { setCarregando(false); setTocando(true); });
    a.addEventListener('waiting', () => setCarregando(true));
    a.addEventListener('pause', () => setTocando(false));
    a.addEventListener('timeupdate', () => setPos(a.currentTime));
    a.addEventListener('ended', () => proximaRef.current());
    a.addEventListener('error', () => {
      // sem CORS (ex.: domínio novo fora da regra do R2): toca sem a análise do som
      if (a.crossOrigin && !ctxRef.current) {
        semAnalise.current = true;
        const src = a.src;
        audioRef.current = null;
        const b = audio();
        b.src = src;
        b.play().catch(() => setCarregando(false));
      } else setCarregando(false);
    });
    audioRef.current = a;
    return a;
  }, []);

  const liga = useCallback((a: HTMLAudioElement) => {
    if (ctxRef.current || semAnalise.current) { ctxRef.current?.ctx.resume(); return; }
    try {
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      an.smoothingTimeConstant = 0.78;
      ctx.createMediaElementSource(a).connect(an);
      an.connect(ctx.destination);
      ctxRef.current = { ctx, an, dados: new Uint8Array(an.frequencyBinCount) };
    } catch { semAnalise.current = true; }
  }, []);

  // ——— SoundCloud ———
  const tocaSet = useCallback(async () => {
    const f = faixas.find((x) => x.tipo === 'set');
    if (!f || f.tipo !== 'set') return;
    setCarregando(true);
    if (widgetRef.current) { widgetRef.current.play(); return; }
    setScAtivo(true); // monta o iframe com auto_play (o toque do usuário já aconteceu)
    try {
      const SC = await carregaSoundCloud();
      await new Promise((r) => requestAnimationFrame(r));
      const el = iframeRef.current;
      if (!el) return;
      const w = SC.Widget(el);
      widgetRef.current = w;
      const E = SC.Widget.Events;
      w.bind(E.PLAY, () => { window.clearTimeout(timerSC.current); setCarregando(false); setTocando(true); setMostraSC(false); });
      w.bind(E.PAUSE, () => setTocando(false));
      w.bind(E.PLAY_PROGRESS, (e) => e && setPos(e.currentPosition / 1000));
      w.bind(E.FINISH, () => proximaRef.current());
      w.bind(E.READY, () => w.play());
      // o navegador barrou o play automático: mostra o player oficial para um toque
      timerSC.current = window.setTimeout(() => { if (!estado.current.tocando) { setCarregando(false); setMostraSC(true); } }, 4500);
    } catch { setCarregando(false); setMostraSC(true); }
  }, [faixas]);

  // ——— comandos ———
  const pausa = useCallback(() => {
    audioRef.current?.pause();
    widgetRef.current?.pause();
    setTocando(false);
  }, []);

  const toca = useCallback((i: number) => {
    const f = faixas[i];
    window.dispatchEvent(new Event(SOM_PLAYER));
    if (i !== estado.current.idx) { setPos(0); setIdx(i); }
    if (f.tipo === 'set') {
      audioRef.current?.pause();
      tocaSet();
    } else {
      widgetRef.current?.pause();
      const a = audio();
      if (!a.src.endsWith(f.src)) { a.src = f.src; a.currentTime = 0; }
      liga(a);
      setCarregando(true);
      a.play().catch(() => setCarregando(false));
    }
  }, [faixas, audio, liga, tocaSet]);

  const proxima = useCallback(() => toca((estado.current.idx + 1) % faixas.length), [toca, faixas.length]);
  const anterior = useCallback(() => {
    if (estado.current.pos > 4) return busca(0);
    toca((estado.current.idx - 1 + faixas.length) % faixas.length);
  }, [toca, faixas.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const proximaRef = useRef(proxima);
  useEffect(() => { proximaRef.current = proxima; }, [proxima]);

  const alterna = useCallback(() => (estado.current.tocando ? pausa() : toca(estado.current.idx)), [pausa, toca]);

  function busca(seg: number) {
    const f = faixas[estado.current.idx];
    seg = Math.max(0, Math.min(f.dur - 0.5, seg));
    if (f.tipo === 'set') widgetRef.current?.seekTo(seg * 1000);
    else if (audioRef.current) audioRef.current.currentTime = seg;
    setPos(seg);
  }

  // botões de fora (topo "Ouvir o set") e vídeos tocando
  useEffect(() => {
    const pedido = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const i = Math.max(0, faixas.findIndex((f) => f.id === id));
      toca(i);
    };
    window.addEventListener(TOCAR, pedido);
    window.addEventListener(SOM_VIDEO, pausa);
    return () => { window.removeEventListener(TOCAR, pedido); window.removeEventListener(SOM_VIDEO, pausa); };
  }, [faixas, toca, pausa]);

  // deck na tela? (o mini-player só aparece fora dele)
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDeckVisivel(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // limpeza ao sair da página
  useEffect(() => () => {
    audioRef.current?.pause();
    widgetRef.current?.pause();
    ctxRef.current?.ctx.close();
    window.clearTimeout(timerSC.current);
  }, []);

  // ——— espectro ao vivo (canvas) ———
  useEffect(() => {
    let raf = 0;
    const alturas = new Float32Array(32);
    const desenha = (t: number) => {
      const { idx: i, tocando: on, pos: p } = estado.current;
      const f = faixas[i];
      const n = alturas.length;
      const c = ctxRef.current;
      if (on && f.tipo === 'trecho' && c && !semAnalise.current) {
        c.an.getByteFrequencyData(c.dados);
        for (let k = 0; k < n; k++) alturas[k] += ((c.dados[Math.min(c.dados.length - 1, Math.floor(k * 1.6) + 1)] / 255) - alturas[k]) * 0.5;
      } else {
        const base = f.picos.length ? f.picos[Math.min(f.picos.length - 1, Math.floor((p / f.dur) * f.picos.length))] : 0.6;
        for (let k = 0; k < n; k++) {
          const alvo = on ? Math.max(0.06, base * (0.45 + 0.55 * Math.abs(Math.sin(t / (180 + k * 23) + k * 1.7))) * (1 - k / (n * 1.6))) : 0.04;
          alturas[k] += (alvo - alturas[k]) * 0.18;
        }
      }
      for (const cv of espectros.current) {
        const g = cv.getContext('2d');
        if (!g) continue;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const W = cv.clientWidth, H = cv.clientHeight;
        if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        const larg = W / n;
        const grad = g.createLinearGradient(0, H, 0, 0);
        grad.addColorStop(0, 'rgba(217,185,138,.95)');
        grad.addColorStop(1, 'rgba(255,170,90,.55)');
        g.fillStyle = grad;
        for (let k = 0; k < n; k++) {
          const h = Math.max(2, alturas[k] * H);
          g.fillRect(k * larg + larg * 0.22, H - h, larg * 0.56, h);
        }
      }
      raf = requestAnimationFrame(desenha);
    };
    raf = requestAnimationFrame(desenha);
    return () => cancelAnimationFrame(raf);
  }, [faixas]);
  const espectro = useCallback((cv: HTMLCanvasElement | null) => { if (cv) espectros.current.add(cv); }, []);

  // teclado no deck: espaço = tocar/pausar, setas = 10 s
  const tecla = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    if (e.key === ' ') { e.preventDefault(); alterna(); }
    if (e.key === 'ArrowRight') busca(estado.current.pos + 10);
    if (e.key === 'ArrowLeft') busca(estado.current.pos - 10);
  };

  const prog = Math.min(1, pos / faixa.dur);
  const clicaOnda = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (!estado.current.tocando && estado.current.pos === 0) toca(idx);
    busca(((e.clientX - r.left) / r.width) * faixa.dur);
  };
  const tecladoOnda = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); busca(pos + 10); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); busca(pos - 10); }
  };
  const icone = tocando ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>;

  const scSrc = faixas[0].tipo === 'set' && faixas[0].trackId
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://api.soundcloud.com/tracks/${faixas[0].trackId}`)}&auto_play=true&visual=false&show_artwork=false&buying=false&sharing=false&download=false&show_comments=false&show_playcount=false&show_user=false&hide_related=true&color=%23d9b98a`
    : null;

  return (
    <section ref={deckRef} className={`deck ${tocando ? 'tocando' : ''}`} aria-label="Player do LUCCO" onKeyDown={tecla}>
      <div className="deck__agora">
        <div className="deck__capa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={faixa.capa} alt="" width={640} height={1138} loading="lazy" />
          <span className={`deck__disco ${tocando ? 'gira' : ''}`} aria-hidden="true" />
        </div>
        <div className="deck__info">
          <span className="deck__rot">{faixa.tipo === 'set' ? 'Set completo' : 'Trecho ao vivo'} · {String(idx + 1).padStart(2, '0')}/{String(faixas.length).padStart(2, '0')}</span>
          <h3 className="deck__titulo">{faixa.titulo}</h3>
          <p className="deck__sub">{faixa.sub}</p>
          <canvas ref={espectro} className="deck__espectro" aria-hidden="true" />
          <div className="deck__onda" role="slider" tabIndex={0} aria-label="Posição na faixa" aria-valuemin={0} aria-valuemax={Math.round(faixa.dur)} aria-valuenow={Math.round(pos)} aria-valuetext={`${tempo(pos)} de ${tempo(faixa.dur)}`}
            onClick={clicaOnda} onKeyDown={tecladoOnda} style={{ '--p': prog } as React.CSSProperties}>
            {faixa.picos.map((v, k) => <span key={k} className={k / faixa.picos.length < prog ? 'on' : ''} style={{ '--v': Math.max(0.08, v) } as React.CSSProperties} />)}
          </div>
          <div className="deck__tempos"><span>{tempo(pos)}</span><span>{tempo(faixa.dur)}</span></div>
          <div className="deck__controles">
            <button type="button" className="deck__bt" onClick={anterior} aria-label="Faixa anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg></button>
            <button type="button" className="deck__play" onClick={alterna} aria-label={tocando ? 'Pausar' : 'Tocar'}>
              {carregando ? <CarregandoLucco tam={34} rotulo="Carregando a faixa" /> : icone}
            </button>
            <button type="button" className="deck__bt" onClick={proxima} aria-label="Próxima faixa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg></button>
            {faixa.tipo === 'set' && <a className="deck__sc" href={faixa.url} target="_blank" rel="noopener noreferrer">Ouvir no SoundCloud</a>}
          </div>
          <p className="so-leitor" aria-live="polite">{tocando ? `Tocando ${faixa.titulo}` : ''}</p>
        </div>
        {scAtivo && scSrc && (
          <div className={`deck__sc-iframe ${mostraSC ? 'visivel' : ''}`}>
            {mostraSC && <p>Toque no play do SoundCloud para ouvir o set.</p>}
            <iframe ref={iframeRef} title="SET SUNRISE no SoundCloud" src={scSrc} allow="autoplay; encrypted-media" />
          </div>
        )}
      </div>

      <ol className="deck__lista">
        {faixas.map((f, i) => (
          <li key={f.id}>
            <button type="button" className={`deck__faixa ${i === idx ? 'ativa' : ''}`} aria-current={i === idx ? 'true' : undefined} onClick={() => (i === idx ? alterna() : toca(i))}>
              <span className="deck__n">{i === idx && tocando ? <span className="eq" aria-hidden="true"><i /><i /><i /></span> : String(i + 1).padStart(2, '0')}</span>
              <span className="deck__ft"><b>{f.titulo}</b><small>{f.sub}</small></span>
              <span className="deck__fd">{tempo(f.dur)}</span>
            </button>
          </li>
        ))}
      </ol>

      {dock && createPortal(
        <div className={`mini ${tocando && !deckVisivel ? 'visivel' : ''}`} aria-hidden={!(tocando && !deckVisivel)}>
          <button type="button" className="mini__play" onClick={alterna} aria-label={tocando ? 'Pausar' : 'Tocar'} tabIndex={tocando && !deckVisivel ? 0 : -1}>{icone}</button>
          <canvas ref={espectro} className="mini__espectro" aria-hidden="true" />
          <button type="button" className="mini__info" tabIndex={tocando && !deckVisivel ? 0 : -1} onClick={() => deckRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            <b>{faixa.titulo}</b><small>{tempo(pos)} · {tempo(faixa.dur)}</small>
          </button>
          <span className="mini__prog" style={{ transform: `scaleX(${prog})` }} />
        </div>,
        dock,
      )}
    </section>
  );
}
