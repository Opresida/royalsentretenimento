import Link from 'next/link';
import { alternarMostrar } from '@/app/financeiro/acoes';
import type { FinLancamento } from '@/db/schema';
import { dataCurta, reais } from '@/lib/financeiro/dinheiro';
import { Clipe, Olho, OlhoFechado } from './icones';

// Lista de lançamentos: cartão no celular, tabela no computador (mesmo HTML, CSS muda).
export function ListaLancamentos({ lancs, vazio, socios, travado }: { lancs: FinLancamento[]; vazio: string; socios: boolean; travado?: boolean }) {
  if (!lancs.length) return <p className="fin-vazio">{vazio}</p>;
  return (
    <>
      <div className="fin-lista__cab" aria-hidden><span>Data</span><span>Descrição</span><span>Categoria</span><span>Situação</span><span>Comprovante</span><span>Valor</span></div>
      <ul className="fin-lista">
        {lancs.map((l) => {
          const pend = !l.quitado;
          const sit = l.tipo === 'custo' ? (pend ? 'A pagar' : 'Pago') : pend ? 'A receber' : 'Recebido';
          const editavel = l.origem !== 'fechamento' && !travado;
          return (
            <li key={l.id} className="fin-item">
              {editavel ? <Link className="fin-item__desc" href={`/financeiro/lancar?id=${l.id}`}>{l.descricao}</Link> : <span className="fin-item__desc">{l.descricao}</span>}
              <span className={`fin-item__valor ${l.tipo === 'receita' ? 'verde' : 'vermelho'}`}>{l.tipo === 'receita' ? '+ ' : '− '}{reais(l.valor)}</span>
              <span className="fin-item__meta">
                <span className="fin-item__data">{dataCurta(l.data)}</span>
                <span className="fin-cat">{l.categoria}</span>
                <span className={pend ? 'ambar' : l.tipo === 'receita' ? 'verde' : ''}>{sit}{pend && l.vencimento ? ` · vence ${dataCurta(l.vencimento)}` : ''}</span>
                <span>
                  {l.comprovanteId ? (
                    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <a className="fin-clip" href={`/financeiro/comprovante/${l.comprovanteId}`} target="_blank" rel="noreferrer"><Clipe />ver</a>
                      {socios ? (
                        <form action={alternarMostrar} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={l.id} />
                          <button className={`fin-olho ${l.mostrarAoSocio ? 'fin-olho--on' : ''}`} title={l.mostrarAoSocio ? 'Os sócios veem este comprovante. Toque para esconder.' : 'Escondido dos sócios. Toque para mostrar.'}>
                            {l.mostrarAoSocio ? <Olho /> : <OlhoFechado />}{l.mostrarAoSocio ? 'sócios veem' : 'oculto'}
                          </button>
                        </form>
                      ) : null}
                    </span>
                  ) : <span>—</span>}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
