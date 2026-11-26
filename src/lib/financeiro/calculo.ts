// A conta do evento. Regra combinada com o Humberto (26/11/2026):
// receitas − custos = resultado; sai a taxa de produção da Royals (opcional); o que sobra é o lucro líquido.
// O aporte pagou os custos: cada sócio recebe o aporte de volta + a cota combinada (%) do lucro líquido.
// Prejuízo é dividido pela mesma cota.

export type LancCalc = { tipo: string; valor: number; quitado: boolean };
export type SocioCalc = { id: number; nome: string; aporte: number; cotaBp: number; eRoyals: boolean };
export type EventoCalc = { taxaTipo: string; taxaValor: number };

export type Conta = {
  receitas: number;
  receitasPendentes: number;
  custos: number;
  custosPendentes: number;
  resultado: number; // receitas − custos
  taxa: number; // taxa de produção da Royals
  lucro: number; // lucro líquido (resultado − taxa)
  aportes: number;
  somaCotasBp: number;
  cotasOk: boolean;
  retornoBp: number | null; // lucro / aportes
  divisao: { id: number; nome: string; eRoyals: boolean; aporte: number; cotaBp: number; lucro: number; total: number }[];
  royalsRecebe: number; // taxa + parte do lucro dos sócios marcados como Royals
};

export function calcular(ev: EventoCalc, lancs: LancCalc[], socios: SocioCalc[]): Conta {
  let receitas = 0, receitasPendentes = 0, custos = 0, custosPendentes = 0;
  for (const l of lancs) {
    if (l.tipo === 'receita') { receitas += l.valor; if (!l.quitado) receitasPendentes += l.valor; }
    else { custos += l.valor; if (!l.quitado) custosPendentes += l.valor; }
  }
  const resultado = receitas - custos;
  let taxa = 0;
  if (ev.taxaTipo === 'pct_receita') taxa = Math.round((receitas * ev.taxaValor) / 10000);
  else if (ev.taxaTipo === 'pct_lucro') taxa = resultado > 0 ? Math.round((resultado * ev.taxaValor) / 10000) : 0;
  else if (ev.taxaTipo === 'fixo') taxa = ev.taxaValor;
  const lucro = resultado - taxa;
  const aportes = socios.reduce((s, x) => s + x.aporte, 0);
  const somaCotasBp = socios.reduce((s, x) => s + x.cotaBp, 0);

  // divide o lucro pela cota; o arredondamento que sobrar vai para o maior cotista
  const partes = socios.map((s) => Math.trunc((lucro * s.cotaBp) / 10000));
  if (socios.length && somaCotasBp === 10000) {
    const sobra = lucro - partes.reduce((a, b) => a + b, 0);
    const maior = socios.reduce((iM, s, i) => (s.cotaBp > socios[iM].cotaBp ? i : iM), 0);
    partes[maior] += sobra;
  }
  const divisao = socios.map((s, i) => ({ id: s.id, nome: s.nome, eRoyals: s.eRoyals, aporte: s.aporte, cotaBp: s.cotaBp, lucro: partes[i], total: s.aporte + partes[i] }));
  const royalsRecebe = taxa + divisao.filter((d) => d.eRoyals).reduce((s, d) => s + d.lucro, 0);

  return {
    receitas, receitasPendentes, custos, custosPendentes, resultado, taxa, lucro, aportes, somaCotasBp,
    cotasOk: socios.length === 0 || somaCotasBp === 10000,
    retornoBp: aportes > 0 ? Math.round((lucro / aportes) * 10000) : null,
    divisao, royalsRecebe,
  };
}

export const TAXA_ROTULO: Record<string, string> = {
  nenhuma: 'Sem taxa de produção',
  pct_receita: '% sobre a receita',
  pct_lucro: '% sobre o lucro',
  fixo: 'Valor fixo',
};

export const STATUS_EVENTO: Record<string, string> = { montagem: 'Em montagem', ao_vivo: 'Ao vivo', fechado: 'Fechado' };

export const CATEGORIAS = {
  custo: ['Cachê', 'Viagem', 'Hospedagem', 'Alimentação', 'Estrutura', 'Equipe', 'Criativo', 'Divulgação', 'Bar', 'Segurança', 'Taxas', 'Outros'],
  receita: ['Bilheteria', 'Bar', 'Camarote', 'Patrocínio', 'Outros'],
  caixaCusto: ['Aluguel', 'Salários', 'Impostos', 'Ferramentas', 'Divulgação', 'Aporte em evento', 'Outros'],
  caixaReceita: ['Resultado de evento', 'Taxa de produção', 'Serviço', 'Outros'],
};
