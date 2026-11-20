import { RelatorioEmail, metadataRelatorio, type Artista } from '../RelatorioEmail';

// Relatório de prospecção do DJ BERTOLOSSI (pedido do Humberto, 20/11/2026). Conteúdo e fontes em ../RelatorioEmail.tsx.
const ARTISTA: Artista = { slug: 'bertolossi', nome: 'DJ BERTOLOSSI' };

export const metadata = metadataRelatorio(ARTISTA);

export default function Page() {
  return <RelatorioEmail {...ARTISTA} />;
}
