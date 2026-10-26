'use client';
import { useState } from 'react';
import { PLANOS } from '@/data/parceria';

const real = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const numero = (s: string) => Math.max(0, Number(s.replace(/\D/g, '')) || 0);

/** Simulador: o produtor digita público, ingresso médio e consumo no bar; a conta mostra a parte dele em cada modelo.
 *  Só aritmética com os termos dos planos (entrada + % da bilheteria e do bar). Sem taxas, antecipação nem custos do
 *  evento, e a página diz isso. Empate entre os modelos: faturamento de R$ 50 mil (0,6x − 5 mil = 0,7x − 10 mil). */
export function Simulador() {
  const [publico, setPublico] = useState('800');
  const [ingresso, setIngresso] = useState('60');
  const [bar, setBar] = useState('40');
  const total = numero(publico) * (numero(ingresso) + numero(bar));
  const contas = PLANOS.map((p) => ({ ...p, parceria: (total * p.parte) / 100, sua: total * (1 - p.parte / 100) - p.entrada }));
  const melhor = contas.reduce((a, b) => (b.sua > a.sua ? b : a));

  return (
    <div className="prod-sim">
      <div className="prod-sim__campos">
        <Campo rotulo="Público esperado" sufixo="pessoas" valor={publico} aoMudar={setPublico} />
        <Campo rotulo="Ingresso médio" prefixo="R$" valor={ingresso} aoMudar={setIngresso} />
        <Campo rotulo="Consumo médio no bar" prefixo="R$" sufixo="por pessoa" valor={bar} aoMudar={setBar} />
      </div>
      <div className="prod-sim__total">
        <span className="rotulo-texto rotulo-texto--mudo">Bilheteria + bar</span>
        <strong>{real(total)}</strong>
      </div>
      <div className="prod-sim__planos">
        {contas.map((c) => (
          <div key={c.nome} className={`prod-sim__plano${total > 0 && c.nome === melhor.nome ? ' prod-sim__plano--melhor' : ''}`}>
            <div className="prod-sim__plano-topo">
              <span className="rotulo-texto">{c.nome}</span>
              {total > 0 && c.nome === melhor.nome && <span className="tag tag--ouro">Melhor para este evento</span>}
            </div>
            <p className="prod-sim__regra">{real(c.entrada)} de entrada + {c.parte}%</p>
            <dl>
              <div><dt>Parte da parceria</dt><dd>{real(c.parceria)}</dd></div>
              <div><dt>Entrada</dt><dd>{real(c.entrada)}</dd></div>
              <div className="prod-sim__sua"><dt>A sua parte</dt><dd>{real(c.sua)}</dd></div>
            </dl>
          </div>
        ))}
      </div>
      <p className="prod-sim__nota">
        Conta simples, com os números que você digitou: antes das taxas de pagamento, da antecipação do cartão e dos custos do seu evento. Até {real(50000)} de bilheteria + bar, o Modelo 1 deixa mais com você; acima disso, o Modelo 2.
      </p>
    </div>
  );
}

function Campo({ rotulo, valor, aoMudar, prefixo, sufixo }: { rotulo: string; valor: string; aoMudar: (v: string) => void; prefixo?: string; sufixo?: string }) {
  return (
    <label className="prod-campo">
      <span>{rotulo}</span>
      <div className="prod-campo__caixa">
        {prefixo && <em>{prefixo}</em>}
        <input inputMode="numeric" value={valor} onChange={(e) => aoMudar(e.target.value.replace(/\D/g, '').slice(0, 7))} />
        {sufixo && <em>{sufixo}</em>}
      </div>
    </label>
  );
}
