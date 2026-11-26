// OG própria de cada evento no link do sócio (nome do evento, sem números).
import { lerEvento, socioPorToken } from '@/lib/financeiro/dados';
import { OG_TAMANHO, ogFinanceiro } from '@/lib/financeiro/og';

export const alt = 'Prestação de contas do evento · Royals Entretenimento';
export const size = OG_TAMANHO;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const s = await socioPorToken((await params).token);
  const ev = s && s.linkAtivo ? (await lerEvento(s.eventoId))?.ev : null;
  return ogFinanceiro({
    selo: 'Prestação de contas',
    titulo: ev?.nome ?? 'Área do sócio',
    linha: 'Acompanhe o financeiro do evento em tempo real · Uma produção ROYALS',
  });
}
