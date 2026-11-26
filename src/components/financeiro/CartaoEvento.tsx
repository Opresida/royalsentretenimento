import Link from 'next/link';
import type { Conta } from '@/lib/financeiro/calculo';
import { STATUS_EVENTO } from '@/lib/financeiro/calculo';
import { dataLonga, reais } from '@/lib/financeiro/dinheiro';
import { Seta } from './icones';

type E = { id: number; nome: string; data: string | null; local: string | null; status: string; conta: Conta; nSocios: number };

export function CartaoEvento({ e }: { e: E }) {
  const c = e.conta;
  const uso = c.aportes > 0 ? c.custos / c.aportes : 0;
  const rotulo = e.status === 'fechado' ? 'Lucro líquido' : 'Resultado parcial';
  return (
    <Link href={`/financeiro/eventos/${e.id}`} className="fin-ev">
      <div>
        <div className="fin-ev__nome">{e.nome}</div>
        <div className="fin-ev__linha" style={{ marginTop: 8 }}>
          <span className={`fin-selo fin-selo--${e.status}`}>{STATUS_EVENTO[e.status]}</span>
          {e.data ? <span>{dataLonga(e.data)}</span> : null}
          <span>{e.nSocios} {e.nSocios === 1 ? 'sócio' : 'sócios'}</span>
        </div>
      </div>
      <div className="fin-ev__num">
        <span className="fin-rot">{rotulo}</span>
        <b className={c.lucro > 0 ? 'verde' : c.lucro < 0 ? 'vermelho' : ''}>{reais(c.lucro, { sinal: true, inteiro: true })}</b>
      </div>
      <div>
        <span className="fin-rot">Custos / aporte</span>
        <div className={`fin-barra ${uso > 1 ? 'fin-barra--estouro' : ''}`} style={{ marginTop: 10 }}><i style={{ width: `${Math.min(100, uso * 100)}%` }} /></div>
        <div className="fin-ev__linha" style={{ marginTop: 6 }}>{reais(c.custos, { inteiro: true })} de {reais(c.aportes, { inteiro: true })}{uso > 1 ? <span className="vermelho">acima do aporte</span> : null}</div>
      </div>
      <Seta className="ouro" />
    </Link>
  );
}
