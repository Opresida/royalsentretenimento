// Formatação e leitura de dinheiro, percentuais e datas do Financeiro (valores em centavos, cotas em pontos-base).

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const BRL0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0, minimumFractionDigits: 0 });

// inteiro: arredonda para reais (números de resumo); o valor exato aparece nas listas e no fechamento.
export function reais(centavos: number, opts?: { sinal?: boolean; inteiro?: boolean }): string {
  if (opts?.inteiro) centavos = Math.round(centavos / 100) * 100;
  const v = Math.abs(centavos) / 100;
  const txt = (opts?.inteiro ? BRL0 : BRL).format(v).replace(/ /g, ' ');
  if (opts?.sinal) return (centavos < 0 ? '− ' : centavos > 0 ? '+ ' : '') + txt;
  return centavos < 0 ? '− ' + txt : txt;
}

// "1.500,00" · "1500" · "1500.5" · "R$ 1.500" → centavos. Inválido → NaN.
export function lerReais(txt: string | null | undefined): number {
  if (!txt) return NaN;
  let s = String(txt).replace(/[R$\s]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export function pct(bp: number, casas = 1): string {
  const v = bp / 100;
  return (Number.isInteger(v) ? String(v) : v.toFixed(casas).replace('.', ',')) + '%';
}

// "50" · "33,3" → pontos-base (5000 · 3330)
export function lerPct(txt: string | null | undefined): number {
  if (!txt) return NaN;
  const n = Number(String(txt).replace('%', '').replace(',', '.').trim());
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export function dataCurta(iso: string | null | undefined): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}.${m}`;
}

export function dataLonga(iso: string | null | undefined): string {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}.${m}.${a}`;
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export function nomeMes(am: string): string {
  const [a, m] = am.split('-').map(Number);
  return `${MESES[m - 1]} ${a}`;
}

// Data de hoje em Manaus (AAAA-MM-DD)
export function hojeManaus(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus' }).format(new Date());
}

// instante atual (fora do corpo do componente, para a regra de pureza do React)
export const agora = () => Date.now();
