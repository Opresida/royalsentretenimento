'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { FaixaBerto } from '@/data/artistas/bertolossi';
import { CarregandoBerto } from './CarregandoBerto';

/** Eventos entre as partes da página: tocar uma faixa (botão do topo), e um som corta o outro (player × vídeos). */
export const TOCAR = 'berto:tocar';
export const SOM_PLAYER = 'berto:som-player';
export const SOM_VIDEO = 'berto:som-video';

type Widget = {
  bind: (ev: string, fn: (e?: { currentPosition: number; relativePosition: number }) => void) => void;
  play: () => void; pause: () => void; seekTo: (ms: number) => void;
  load: (url: string, op: Record<string, unknown> & { callback?: () => void }) => void;
};
type SC = { Widget: ((el: HTMLIFrameElement) => Widget) & { Events: Record<string, string> } };

const tempo = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`;
};
const semAssinatura = () => () => {};
const OPCOES = { visual: false, show_artwork: false, buying: false, sharing: false, download: false, show_comments: false, show_playcount: false, show_user: false, hide_related: true, color: '#ff8a1e' };
const apiTrack = (id: number) => `https://api.soundcloud.com/tracks/${id}`;
const srcIframe = (id: number) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(apiTrack(id))}&auto_play=true&${Object.entries(OPCOES).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')}`;

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
 * Player do BERTOLOSSI: as 4 faixas do SoundCloud que o Humberto escolheu (um widget oficial escondido, trocado com
 * widget.load) + trechos ao vivo (o som dos vídeos dele, no R2, tocados pela página). Um som por vez.
 * - A onda (picos pré-calculados) acende conforme toca e aceita clique para avançar; em cima, o espectro: nos trechos é o
 *   som de verdade (Web Audio); no SoundCloud, que toca dentro do iframe, as barras seguem a onda no ponto em que está.
 * - Se o navegador barrar o play do SoundCloud (iPhone), o player oficial aparece para um toque.
 * - Mini-player fixo (portal em #berto-dock) quando o deck sai da tela com som tocando.
 */
export function PlayerBerto({ faixas }: { faixas: FaixaBerto[] }) {
  const [idx, setIdx] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [pos, setPos] = useState(0);
  const [mostraSC, setMostraSC] = useState(false);
  const [scInicial, setScInicial] = useState<number | null>(null); // track do 1º iframe montado
  const [deckVisivel, setDeckVisivel] = useState(true);
  const dock = useSyncExternalStore(semAssinatura, () => document.getElementById('berto-dock'), () => null);

  const faixa = faixas[idx];
  const deckRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const semAnalise = useRef(false);
  const ctxRef = useRef<{ ctx: AudioContext; an: AnalyserNode; dados: Uint8Array<ArrayBuffer> } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<Widget | null>(null);
  const carregadaRef = useRef<number | null>(null); // track carregada no widget
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
      an.smoothingTimeConstant = 0.74;
      ctx.createMediaElementSource(a).connect(an);
      an.connect(ctx.destination);
      ctxRef.current = { ctx, an, dados: new Uint8Array(an.frequencyBinCount) };
    } catch { semAnalise.current = true; }
  }, []);

  // ——— SoundCloud ———
  const vigiaPlay = () => {
    window.clearTimeout(timerSC.current);
    // o navegador barrou o play automático: mostra o player oficial para um toque
    timerSC.current = window.setTimeout(() => { if (!estado.current.tocando) { setCarregando(false); setMostraSC(true); } }, 4500);
  };
  const tocaSC = useCallback(async (f: Extract<FaixaBerto, { tipo: 'sc' }>) => {
    if (!f.trackId) { window.open(f.url, '_blank', 'noopener'); return; }
    setCarregando(true);
    const w = widgetRef.current;
    if (w) {
      if (carregadaRef.current === f.trackId) w.play();
      else {
        carregadaRef.current = f.trackId;
        w.load(apiTrack(f.trackId), { ...OPCOES, auto_play: true, callback: () => w.play() });
      }
      vigiaPlay();
      return;
    }
    carregadaRef.current = f.trackId;
    setScInicial(f.trackId); // monta o iframe com auto_play (o toque do usuário já aconteceu)
    try {
      const SCapi = await carregaSoundCloud();
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      const el = iframeRef.current;
      if (!el) return;
      const nw = SCapi.Widget(el);
      widgetRef.current = nw;
      const E = SCapi.Widget.Events;
      nw.bind(E.PLAY, () => { window.clearTimeout(timerSC.current); setCarregando(false); setTocando(true); setMostraSC(false); });
      nw.bind(E.PAUSE, () => setTocando(false));
      nw.bind(E.PLAY_PROGRESS, (e) => e && setPos(e.currentPosition / 1000));
      nw.bind(E.FINISH, () => proximaRef.current());
      nw.bind(E.READY, () => nw.play());
      vigiaPlay();
    } catch { setCarregando(false); setMostraSC(true); }
  }, []);

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
    if (f.tipo === 'sc') {
      audioRef.current?.pause();
      tocaSC(f);
    } else {
      widgetRef.current?.pause();
      const a = audio();
      if (!a.src.endsWith(f.src)) { a.src = f.src; a.currentTime = 0; }
      liga(a);
      setCarregando(true);
      a.play().catch(() => setCarregando(false));
    }
  }, [faixas, audio, liga, tocaSC]);

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
    if (f.tipo === 'sc') widgetRef.current?.seekTo(seg * 1000);
    else if (audioRef.current) audioRef.current.currentTime = seg;
    setPos(seg);
  }

  // botões de fora ("Ouvir" do topo) e vídeos tocando
  useEffect(() => {
    const pedido = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      toca(Math.max(0, faixas.findIndex((f) => f.id === id)));
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

  useEffect(() => () => {
    audioRef.current?.pause();
    widgetRef.current?.pause();
    ctxRef.current?.ctx.close();
    window.clearTimeout(timerSC.current);
  }, []);

  // ——— espectro (canvas): só roda tocando e enquanto as barras descem depois da pausa ———
  const alturasRef = useRef(new Float32Array(28));
  useEffect(() => {
    let raf = 0;
    const alturas = alturasRef.current;
    const desenha = (t: number) => {
      const { idx: i, tocando: on, pos: p } = estado.current;
      const f = faixas[i];
      const n = alturas.length;
      const c = ctxRef.current;
      if (on && f.tipo === 'trecho' && c && !semAnalise.current) {
        c.an.getByteFrequencyData(c.dados);
        for (let k = 0; k < n; k++) alturas[k] += ((c.dados[Math.min(c.dados.length - 1, Math.floor(k * 1.7) + 1)] / 255) - alturas[k]) * 0.5;
      } else {
        const base = f.picos.length ? f.picos[Math.min(f.picos.length - 1, Math.floor((p / f.dur) * f.picos.length))] : 0.6;
        for (let k = 0; k < n; k++) {
          // pulso no tempo do funk (130 BPM ≈ 461 ms)
          const batida = 0.55 + 0.45 * Math.pow(Math.abs(Math.cos((t / 461.5) * Math.PI)), 6);
          const alvo = on ? Math.max(0.06, base * batida * (0.5 + 0.5 * Math.abs(Math.sin(t / (170 + k * 21) + k * 1.9))) * (1 - k / (n * 1.5))) : 0.04;
          alturas[k] += (alvo - alturas[k]) * 0.2;
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
        grad.addColorStop(0, 'rgba(255,138,30,.95)');
        grad.addColorStop(1, 'rgba(255,46,116,.75)');
        g.fillStyle = grad;
        for (let k = 0; k < n; k++) {
          const h = Math.max(2, alturas[k] * H);
          g.fillRect(k * larg + larg * 0.18, H - h, larg * 0.64, h);
        }
      }
      if (on || alturas.some((v) => v > 0.05)) raf = requestAnimationFrame(desenha);
    };
    raf = requestAnimationFrame(desenha);
    return () => cancelAnimationFrame(raf);
  }, [faixas, tocando]);
  const espectro = useCallback((cv: HTMLCanvasElement | null) => { if (cv) espectros.current.add(cv); }, []);

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

  return (
    <section ref={deckRef} className={`bd ${tocando ? 'tocando' : ''}`} aria-label="Player do Bertolossi" onKeyDown={tecla}>
      <div className="bd__agora">
        <div className="bd__capa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={faixa.capa} src={faixa.capa} alt="" width={640} height={1138} loading="lazy" />
          <span className="bd__selo">{faixa.tipo === 'sc' ? 'SoundCloud' : 'ao vivo'}</span>
        </div>
        <div className="bd__info">
          <span className="bd__rot">{String(idx + 1).padStart(2, '0')} de {String(faixas.length).padStart(2, '0')}</span>
          <h3 className="bd__titulo">{faixa.titulo}</h3>
          <p className="bd__sub">{faixa.sub}</p>
          <canvas ref={espectro} className="bd__espectro" aria-hidden="true" />
          <div className="bd__onda" role="slider" tabIndex={0} aria-label="Posição na faixa" aria-valuemin={0} aria-valuemax={Math.round(faixa.dur)} aria-valuenow={Math.round(pos)} aria-valuetext={`${tempo(pos)} de ${tempo(faixa.dur)}`}
            onClick={clicaOnda} onKeyDown={tecladoOnda}>
            {faixa.picos.map((v, k) => <span key={k} className={k / faixa.picos.length < prog ? 'on' : ''} style={{ '--v': Math.max(0.08, v) } as React.CSSProperties} />)}
          </div>
          <div className="bd__tempos"><span>{tempo(pos)}</span><span>{tempo(faixa.dur)}</span></div>
          <div className="bd__controles">
            <button type="button" className="bd__bt" onClick={anterior} aria-label="Faixa anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg></button>
            <button type="button" className="bd__play" onClick={alterna} aria-label={tocando ? 'Pausar' : 'Tocar'}>
              {carregando ? <CarregandoBerto tam={34} rotulo="Carregando a faixa" /> : icone}
            </button>
            <button type="button" className="bd__bt" onClick={proxima} aria-label="Próxima faixa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg></button>
            {faixa.tipo === 'sc' && <a className="bd__sc" href={faixa.url} target="_blank" rel="noopener noreferrer">abrir no SoundCloud</a>}
          </div>
          <p className="so-leitor" aria-live="polite">{tocando ? `Tocando ${faixa.titulo}` : ''}</p>
        </div>
        {scInicial && (
          <div className={`bd__sc-iframe ${mostraSC ? 'visivel' : ''}`}>
            {mostraSC && <p>Toque no play do SoundCloud pra ouvir.</p>}
            <iframe ref={iframeRef} title="Faixa do Bertolossi no SoundCloud" src={srcIframe(scInicial)} allow="autoplay; encrypted-media" />
          </div>
        )}
      </div>

      <ol className="bd__lista">
        {faixas.map((f, i) => (
          <li key={f.id}>
            <button type="button" className={`bd__faixa ${i === idx ? 'ativa' : ''} ${f.tipo}`} aria-current={i === idx ? 'true' : undefined} onClick={() => (i === idx ? alterna() : toca(i))}>
              <span className="bd__n">{i === idx && tocando ? <span className="beq" aria-hidden="true"><i /><i /><i /></span> : String(i + 1).padStart(2, '0')}</span>
              <span className="bd__ft"><b>{f.titulo}</b><small>{f.sub}</small></span>
              <span className="bd__fd">{tempo(f.dur)}</span>
            </button>
          </li>
        ))}
      </ol>

      {dock && createPortal(
        <div className={`bmini ${tocando && !deckVisivel ? 'visivel' : ''}`} aria-hidden={!(tocando && !deckVisivel)}>
          <button type="button" className="bmini__play" onClick={alterna} aria-label={tocando ? 'Pausar' : 'Tocar'} tabIndex={tocando && !deckVisivel ? 0 : -1}>{icone}</button>
          <canvas ref={espectro} className="bmini__espectro" aria-hidden="true" />
          <button type="button" className="bmini__info" tabIndex={tocando && !deckVisivel ? 0 : -1} onClick={() => deckRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            <b>{faixa.titulo}</b><small>{tempo(pos)} · {tempo(faixa.dur)}</small>
          </button>
          <span className="bmini__prog" style={{ transform: `scaleX(${prog})` }} />
        </div>,
        dock,
      )}
    </section>
  );
}
