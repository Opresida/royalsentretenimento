// Regras puras da série recorrente (sem banco): próxima data, rótulos.

export const FREQUENCIAS: Record<string, string> = { semanal: 'Toda semana', quinzenal: 'A cada 15 dias', mensal: 'Todo mês' };
export const FREQ_CURTA: Record<string, string> = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal' };

// AAAA-MM-DD + frequência → próxima data. Mensal mantém o dia (31 vira o último dia do mês seguinte).
export function somarFrequencia(iso: string, frequencia: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  if (frequencia === 'mensal') {
    const ultimo = new Date(Date.UTC(a, m + 1, 0)).getUTCDate();
    return new Date(Date.UTC(a, m, Math.min(d, ultimo))).toISOString().slice(0, 10);
  }
  const dias = frequencia === 'quinzenal' ? 14 : 7;
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

// sugestão da próxima edição: depois da última edição; sem edição, a 1ª data da série (ou hoje)
export function proximaData(serie: { frequencia: string; primeiraData: string | null }, ultimaData: string | null, hoje: string): string {
  if (ultimaData) return somarFrequencia(ultimaData, serie.frequencia);
  return serie.primeiraData ?? hoje;
}

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export function diaDaSemana(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
}

export function nomeEdicao(serie: string, iso: string): string {
  const [, m, d] = iso.split('-');
  return `${serie} · ${d}/${m}`;
}
