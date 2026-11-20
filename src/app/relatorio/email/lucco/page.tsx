import { RelatorioEmail, metadataRelatorio, type Artista } from '../RelatorioEmail';

// Relatório de prospecção do DJ LUCCO (pedido do Humberto, 20/11/2026). Conteúdo e fontes em ../RelatorioEmail.tsx.
const ARTISTA: Artista = { slug: 'lucco', nome: 'DJ LUCCO' };

export const metadata = metadataRelatorio(ARTISTA);

export default function Page() {
  return <RelatorioEmail {...ARTISTA} />;
}
