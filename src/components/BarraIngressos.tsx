import type { Evento } from '@/data/eventos';
import { dataCurta, nomeCompleto } from '@/lib/acervo';
import { BarraFixa } from './BarraFixa';

/** No mobile, a barra de ingressos fica fixa no rodapé (wireframe do brandbook). Leva sempre ao canal oficial.
 *  Some enquanto os botões do topo estão na tela (BarraFixa). Montada no servidor: o acervo não vai para o navegador. */
export function BarraIngressos({ e }: { e?: Evento }) {
  if (!e?.ingressos) return null;
  const estilo = e.cor ? ({ '--event-accent': e.cor, '--event-on-accent': e.sobreCor ?? '#050505' } as React.CSSProperties) : undefined;
  return (
    <BarraFixa estilo={estilo} slug={e.slug}>
      <div className="barra-ingressos__info">
        <span>{dataCurta(e.data)} · {e.local ?? e.cidade}</span>
        <strong>{nomeCompleto(e)}</strong>
      </div>
      <a className="botao botao--evento botao--sm" href={e.ingressos} target="_blank" rel="noopener noreferrer">Ingressos<span className="seta" aria-hidden="true">↗</span></a>
    </BarraFixa>
  );
}
