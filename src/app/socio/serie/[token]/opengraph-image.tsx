// OG própria da série no link do sócio (nome da série, sem números).
import { lerSerieCurta, serieSocioPorToken } from '@/lib/financeiro/dados';
import { OG_TAMANHO, ogFinanceiro } from '@/lib/financeiro/og';

export const alt = 'Prestação de contas da série · Royals Entretenimento';
export const size = OG_TAMANHO;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const s = await serieSocioPorToken((await params).token);
  const serie = s && s.linkAtivo ? await lerSerieCurta(s.serieId) : null;
  return ogFinanceiro({
    selo: 'Prestação de contas · todas as edições',
    titulo: serie?.nome ?? 'Área do sócio',
    linha: 'Acompanhe cada edição em tempo real · Uma produção ROYALS',
  });
}
