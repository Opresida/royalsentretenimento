import Link from 'next/link';
import type { Evento } from '@/data/eventos';
import { capaDoEvento, dataCurta, ano, nomeCompleto } from '@/lib/acervo';

/** Cartão da agenda e do acervo: imagem no topo (4:5), data e cidade na cor do evento, título, local e chamada. */
export function CartaoEvento({ e, href, cta = 'Ver evento', tag, paisagem }: { e: Evento; href: string; cta?: string; tag?: { texto: string; tom?: 'ouro' | 'evento' | 'marfim' | 'aovivo' }; paisagem?: boolean }) {
  const capa = capaDoEvento(e);
  const estilo = e.cor ? ({ '--event-accent': e.cor, '--event-on-accent': e.sobreCor ?? '#050505' } as React.CSSProperties) : undefined;
  return (
    <Link href={href} className={`cartao-evento ${paisagem ? 'cartao-evento--paisagem' : ''}`} style={estilo}>
      <div className="cartao-evento__img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {capa && <img src={capa.p} alt="" loading="lazy" />}
        {tag && <span className={`tag tag--${tag.tom ?? 'ouro'} cartao-evento__tag`}>{tag.texto}</span>}
      </div>
      <div className="cartao-evento__corpo">
        <span className="cartao-evento__quando">{dataCurta(e.data)}.{ano(e.data)} · {e.cidade}</span>
        <span className="cartao-evento__titulo">{nomeCompleto(e)}</span>
        {(e.local || e.atracoes.length > 0) && <span className="cartao-evento__local">{[e.local, e.atracoes.slice(0, 3).join(', ')].filter(Boolean).join(' · ')}</span>}
        <span className="cartao-evento__cta">{cta}<span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
