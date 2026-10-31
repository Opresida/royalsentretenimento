// Valor em reais por extenso, para contratos ("R$ 12.500,00 (doze mil e quinhentos reais)"). Vai até 999 milhões.
const UN = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CEM = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function ate999(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100), r = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CEM[c]);
  if (r < 20) { if (r) partes.push(UN[r]); }
  else { const d = Math.floor(r / 10), u = r % 10; partes.push(u ? `${DEZ[d]} e ${UN[u]}` : DEZ[d]); }
  return partes.join(' e ');
}

function inteiro(n: number): string {
  if (n === 0) return 'zero';
  const mi = Math.floor(n / 1_000_000), mil = Math.floor((n % 1_000_000) / 1000), resto = n % 1000;
  const grupos: { txt: string; valor: number }[] = [];
  if (mi) grupos.push({ txt: mi === 1 ? 'um milhão' : `${ate999(mi)} milhões`, valor: mi });
  if (mil) grupos.push({ txt: mil === 1 ? 'mil' : `${ate999(mil)} mil`, valor: mil });
  if (resto) grupos.push({ txt: ate999(resto), valor: resto });
  // "e" antes do último grupo quando ele é menor que 100 ou centena redonda (mil e quinhentos, mil e vinte)
  return grupos.reduce((acc, g, i) => {
    if (i === 0) return g.txt;
    const usaE = i === grupos.length - 1 && (g.valor < 100 || g.valor % 100 === 0);
    return `${acc}${usaE ? ' e ' : ' '}${g.txt}`;
  }, '');
}

export function reaisPorExtenso(valor: number): string {
  const centavosTotal = Math.round(valor * 100);
  const reais = Math.floor(centavosTotal / 100), cent = centavosTotal % 100;
  const milhaoRedondo = reais >= 1_000_000 && reais % 1_000_000 === 0;
  const pReais = reais ? `${inteiro(reais)}${milhaoRedondo ? ' de' : ''} ${reais === 1 ? 'real' : 'reais'}` : '';
  const pCent = cent ? `${inteiro(cent)} ${cent === 1 ? 'centavo' : 'centavos'}` : '';
  if (pReais && pCent) return `${pReais} e ${pCent}`;
  return pReais || pCent || 'zero real';
}

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** "12.500,50" / "12500,5" / "12500.50" → 12500.5 */
export function lerValor(txt: string): number | null {
  const limpo = txt.replace(/[^\d,.]/g, '');
  if (!limpo) return null;
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}
