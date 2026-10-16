import { Carregando } from '@/components/Carregando';

// Enquanto uma página carrega (troca de rota), o spinner da marca no centro da tela.
export default function CarregandoPagina() {
  return (
    <main className="pagina-carregando">
      <Carregando tamanho={48} texto="Carregando" />
    </main>
  );
}
