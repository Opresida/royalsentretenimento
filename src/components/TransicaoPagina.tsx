'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Carregando } from './Carregando';
import { TRANSICOES, duracao, transicaoDe, visita, type Transicao } from '@/lib/transicoes';

type Fase = 'parado' | 'cobrindo' | 'coberto' | 'revelando';

/**
 * Transição entre páginas (mapa em src/lib/transicoes.ts). Intercepta o clique em link interno, toca a metade "cobrir",
 * troca a rota e, com a página nova pintada, toca a metade "revelar". Voltar/avançar do navegador: só "revelar".
 * Com movimento reduzido, nada disso: o link navega direto. Se a página nova demorar, o spinner da marca aparece no meio.
 */
export function TransicaoPagina() {
  const router = useRouter();
  const caminho = usePathname();
  const [fase, setFase] = useState<Fase>('parado');
  const [tipo, setTipo] = useState<Transicao>('fade');
  const [ciclo, setCiclo] = useState(0);
  const faseRef = useRef<Fase>('parado');
  const anterior = useRef(caminho);
  const timers = useRef<number[]>([]);
  const muda = (f: Fase) => { faseRef.current = f; setFase(f); };
  const depois = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };

  // clique em link interno
  useEffect(() => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clique = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const a = (ev.target as Element | null)?.closest?.('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      visita.navegou = true;
      if (reduzido.matches) return; // o Link navega sozinho
      ev.preventDefault();
      if (faseRef.current === 'cobrindo' || faseRef.current === 'coberto') return; // já está trocando de página
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const t = transicaoDe(url.pathname);
      const href = url.pathname + url.search + url.hash;
      router.prefetch(href);
      setTipo(t);
      muda('cobrindo');
      depois(duracao(t), () => { muda('coberto'); router.push(href); });
      // rede ruim: se a rota não chegar, revela assim mesmo (a página atual continua lá)
      depois(duracao(t) + 8000, () => { if (faseRef.current === 'coberto') muda('revelando'); });
    };
    const volta = () => { visita.navegou = true; };
    window.addEventListener('click', clique, true);
    window.addEventListener('popstate', volta);
    return () => { window.removeEventListener('click', clique, true); window.removeEventListener('popstate', volta); };
  }, [router]);

  // rota nova pintada: revela
  useEffect(() => {
    if (anterior.current === caminho) return; // primeira pintura (e o efeito duplicado do modo estrito do React)
    anterior.current = caminho;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // sempre a transição do DESTINO (também no voltar/avançar, que só tem a metade "revelar")
    let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => { setTipo(transicaoDe(caminho)); setCiclo((c) => c + 1); muda('revelando'); }); });
    return () => cancelAnimationFrame(raf);
  }, [caminho]);

  // fim do "revelar" (ciclo: cada revelação conta do zero, mesmo emendada em outra)
  useEffect(() => {
    if (fase !== 'revelando') return;
    const id = window.setTimeout(() => muda('parado'), duracao(tipo) + 40);
    return () => window.clearTimeout(id);
  }, [fase, tipo, ciclo]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  if (fase === 'parado') return null;
  const { pecas, passo, dur } = TRANSICOES[tipo];
  return (
    <div key={`${tipo}-${ciclo}`} className={`transicao transicao--${tipo} transicao--${fase}`} aria-hidden="true" style={{ '--dur': `${dur}ms`, '--passo': `${passo}ms`, '--n': pecas } as React.CSSProperties}>
      <div className="transicao__palco">
        {Array.from({ length: pecas }, (_, i) => <span key={i} className="transicao__peca" style={{ '--i': i } as React.CSSProperties} />)}
      </div>
      {tipo === 'glitch' && <span className="transicao__flash" />}
      {fase === 'coberto' && <Carregando className="transicao__carregando" tamanho={56} />}
    </div>
  );
}
