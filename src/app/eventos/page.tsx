import type { Metadata } from 'next';
import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { CartaoEvento } from '@/components/CartaoEvento';
import { INSTAGRAM_URL, dataCurta, passados, proximos } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Próximos eventos', description: 'A agenda da Royals Entretenimento: próximos eventos de trap e funk em Manaus, com ingressos no canal oficial.', alternates: { canonical: '/eventos' } };

export default function Eventos() {
  const agenda = proximos();
  const ultimos = passados().slice(0, 3);
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Agenda" titulo="Próximos eventos" descricao="Os ingressos são vendidos no canal oficial de cada evento." />
          {agenda.length ? (
            <div className="grade grade--3">
              {agenda.map((e) => <CartaoEvento key={e.slug} e={e} href={`/eventos/${e.slug}`} cta={e.ingressos ? 'Ingressos e informações' : 'Ver evento'} tag={{ texto: dataCurta(e.data), tom: 'evento' }} />)}
            </div>
          ) : (
            <div className="pilha" style={{ gap: 24 }}>
              <p className="lead">A próxima data sai em breve. Ative as notificações no Instagram.</p>
              <div><Botao href={INSTAGRAM_URL} externo>Instagram</Botao></div>
            </div>
          )}
        </div>
      </section>
      <section className="secao secao--fio">
        <div className="container">
          <CabecalhoSecao olho="Acervo" titulo="Últimas edições" acao={<Botao href="/relembre-momentos" variante="fantasma">Linha do tempo</Botao>} />
          <div className="grade grade--3">{ultimos.map((e) => <CartaoEvento key={e.slug} e={e} href={`/relembre-momentos/${e.slug}`} cta="Ver fotos e vídeos" />)}</div>
        </div>
      </section>
    </main>
  );
}
