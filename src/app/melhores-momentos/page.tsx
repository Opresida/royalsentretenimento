import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { Galeria } from '@/components/Galeria';
import { nomeCompleto, videos } from '@/lib/acervo';
import { itensGaleria } from '@/lib/galeria';

export const metadata: Metadata = { title: 'Melhores momentos', description: 'A biblioteca de vídeos da Royals Entretenimento: anúncios, bastidores e aftermovies de cada evento.', alternates: { canonical: '/melhores-momentos' } };

export default function MelhoresMomentos() {
  const lista = videos();
  // filtro por evento: só os eventos que têm vídeo, na ordem do mais novo para o mais antigo
  const porEvento = new Map<string, { rotulo: string; ids: string[] }>();
  for (const v of lista) {
    const k = v.evento?.slug ?? 'outros';
    const rotulo = v.evento ? nomeCompleto(v.evento) : 'Outros';
    porEvento.set(k, { rotulo, ids: [...(porEvento.get(k)?.ids ?? []), v.id] });
  }
  const filtros = [{ rotulo: 'Todos', valor: 'todos', ids: lista.map((v) => v.id) }, ...[...porEvento.entries()].map(([valor, f]) => ({ valor, ...f }))];
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Vídeos" titulo="Melhores momentos" descricao={`${lista.length} vídeos do acervo da Royals, do anúncio da atração ao aftermovie.`} />
          <Galeria itens={itensGaleria(lista, true)} filtros={filtros} />
        </div>
      </section>
    </main>
  );
}
