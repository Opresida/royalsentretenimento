// OG própria do /financeiro (a rota nova não herda a da home).
import { OG_TAMANHO, ogFinanceiro } from '@/lib/financeiro/og';

export const alt = 'Financeiro Royals · uso interno';
export const size = OG_TAMANHO;
export const contentType = 'image/png';

export default async function Image() {
  return ogFinanceiro({ selo: 'Uso interno', titulo: 'Financeiro Royals', linha: 'Caixa da produtora, eventos, sócios e prestação de contas' });
}
