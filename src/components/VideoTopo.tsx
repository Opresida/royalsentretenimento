'use client';
import { useEffect, useRef, useState } from 'react';
import { somTopo } from '@/lib/somTopo';
import { Carregando } from './Carregando';

/** `som`: o arquivo tem trilha (o botão de som do topo aparece e liga o áudio com um toque). */
type Versao = { video?: string; capa: string; som?: boolean };

// No desktop (tela larga e deitada) entra a versão 16:9, montada para deixar a metade esquerda livre para o bloco do
// evento; no celular, a versão vertical montada para o site (`celular`: conteúdo no alto, metade de baixo livre para o
// bloco do evento) ou, sem ela, o reel vertical do acervo. Para quem prefere movimento reduzido (ou economia de dados), só a imagem.
const DESKTOP = '(min-width: 900px) and (min-aspect-ratio: 6/5)';

/** Vídeo do topo: começa mudo, em loop, com a capa na frente e o spinner da marca até ele começar a tocar.
 *  Com trilha (`som`), o BotaoSom liga o áudio; o som desliga sozinho quando o topo sai da tela ou a aba fica oculta. */
export function VideoTopo({ video, capa, desktop, celular }: { video?: string; capa: string; desktop?: Versao; celular?: Versao }) {
  const [largo, setLargo] = useState(false);
  const [pode, setPode] = useState(false);
  const [tocando, setTocando] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const economia = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const muda = () => { setLargo(mq.matches); setTocando(false); somTopo.definir({ ligado: false }); };
    muda();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPode(!reduzido && !economia);
    mq.addEventListener('change', muda);
    return () => mq.removeEventListener('change', muda);
  }, []);
  const lateral = largo && !!desktop;
  const atual: Versao = lateral && desktop ? desktop : celular ?? { video, capa };
  const tocar = pode && !!atual.video;
  const comSom = tocar && !!atual.som;

  // som: o botão liga e desliga; sair da tela (ou esconder a aba) desliga
  useEffect(() => {
    if (!comSom) return;
    const silencia = () => { const v = videoRef.current; if (v && !v.muted) { v.muted = true; somTopo.definir({ ligado: false }); } };
    somTopo.registrar(() => {
      const v = videoRef.current;
      if (!v) return;
      if (v.muted) { v.muted = false; v.volume = 1; v.play().catch(() => {}); somTopo.definir({ ligado: true }); }
      else silencia();
    });
    somTopo.definir({ disponivel: true, ligado: false });
    const io = new IntersectionObserver(([it]) => { if (it.intersectionRatio < 0.25) silencia(); }, { threshold: [0, 0.25] });
    if (caixa.current) io.observe(caixa.current);
    const aba = () => { if (document.hidden) silencia(); };
    document.addEventListener('visibilitychange', aba);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', aba); somTopo.registrar(null); somTopo.definir({ disponivel: false, ligado: false }); };
  }, [comSom, atual.video]);

  return (
    <div ref={caixa} className={`hero__midia ${lateral ? 'hero__midia--lateral' : ''} ${!lateral && celular ? 'hero__midia--celular' : ''}`} aria-hidden="true">
      {tocar
        ? <video ref={videoRef} key={atual.video} src={atual.video} poster={atual.capa} autoPlay muted loop playsInline preload="auto" onPlaying={() => setTocando(true)} onWaiting={() => setTocando(false)} />
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={atual.capa} alt="" />}
      {tocar && !tocando && <Carregando className="hero__carregando" tamanho={28} />}
    </div>
  );
}
