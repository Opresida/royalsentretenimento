// Transições de página da Royals (pedido do Humberto, 16/10: "uma diferente para cada página", da biblioteca de motion).
// Biblioteca: Material Proprio/motion/motion-catalog.jsx (T1 Diagonais, T2 Três faixas, T3 Glitch) e royals-motion.jsx
// (03 · Transição diagonal). São 4 movimentos para 7 páginas: as outras 3 são esses mesmos movimentos em outra direção.
// Cada uma tem a metade "cobrir" (antes de trocar a rota) e a metade "revelar" (com a página nova já pintada).

export type Transicao = 'diagonais' | 'faixas' | 'cortina' | 'glitch' | 'colunas' | 'diagonais-inv' | 'cortina-inv' | 'fade';

/** Peças, intervalo entre elas e duração de cada uma (ms). O tempo total de cada metade é dur + (pecas - 1) * passo. */
export const TRANSICOES: Record<Transicao, { pecas: number; passo: number; dur: number }> = {
  diagonais: { pecas: 12, passo: 25, dur: 450 },      // T1 · 12 faixas a 45°, sobem e saem por cima
  faixas: { pecas: 3, passo: 80, dur: 400 },          // T2 · 3 faixas horizontais, entram pela esquerda e saem pela direita
  cortina: { pecas: 17, passo: 18, dur: 420 },        // 03 · 17 colunas a 45° atravessam na diagonal
  glitch: { pecas: 8, passo: 0, dur: 260 },           // T3 · 8 fatias que deslizam para os lados, com flash no corte
  colunas: { pecas: 3, passo: 80, dur: 400 },         // T2 girada · 3 colunas sobem de baixo
  'diagonais-inv': { pecas: 12, passo: 25, dur: 450 }, // T1 espelhada · faixas a −45° descem do alto
  'cortina-inv': { pecas: 17, passo: 18, dur: 420 },   // 03 espelhada · da esquerda para a direita
  fade: { pecas: 1, passo: 0, dur: 260 },             // 07 · Saída: escurece e clareia
};

export const duracao = (t: Transicao) => { const x = TRANSICOES[t]; return x.dur + (x.pecas - 1) * x.passo; };

/** A transição de cada página é a do DESTINO. */
export function transicaoDe(caminho: string): Transicao {
  if (caminho === '/') return 'diagonais';
  if (caminho.startsWith('/eventos')) return 'faixas';
  if (caminho.startsWith('/relembre-momentos')) return 'cortina';
  if (caminho.startsWith('/melhores-momentos')) return 'glitch';
  if (caminho.startsWith('/promoters')) return 'colunas';
  if (caminho.startsWith('/sobre')) return 'diagonais-inv';
  if (caminho.startsWith('/contato')) return 'cortina-inv';
  return 'fade';
}

/** Estado da visita (memória do navegador, não persiste): se a pessoa já navegou dentro do site. A abertura com a logo
 *  só toca quando o site é aberto na home (endereço, link de fora, recarregar), não quando se volta para a home navegando. */
export const visita = { navegou: false };
export const FIM_DA_ABERTURA = 'royals:abertura-fim';
