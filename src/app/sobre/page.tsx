import type { Metadata } from 'next';
import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { LogoRevela } from '@/components/Marca';
import { Revela } from '@/components/Revela';
import { evento, nomeCompleto, passados } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Sobre', description: 'A Royals Entretenimento é a produtora por trás de eventos de trap e funk em Manaus. A coroa foi conquistada na pista.', alternates: { canonical: '/sobre' } };

// Marcos tirados das legendas do Instagram da própria Royals (src/data/eventos.ts). Nada além disso.
const MARCOS: { slug: string; texto: string }[] = [
  { slug: 'bloquinho-da-realeza', texto: 'O carnaval de 2019 abriu a agenda com o Bloquinho da Realeza, no Copacabana.' },
  { slug: 'sente-a-vibe', texto: 'Matuê, Xamã e Orochi no mesmo palco: o Sente a Vibe virou o maior festival de trap que Manaus já tinha visto.' },
  { slug: 'hungria-e-orochi', texto: 'Hungria e Orochi reuniram mais de 5 mil pessoas, o maior evento da Royals até então.' },
  { slug: 'manaus-trap-festival', texto: 'Cinco atrações nacionais no Manaus Trap Festival.' },
  { slug: 'orochi-exclusive', texto: 'A volta, em 2025, com o show exclusivo do Orochi no All Night Pub.' },
  { slug: 'oculto-manaus', texto: 'A O.C.U.L.T.O chegou a Manaus para a maior edição da história.' },
];

export default function Sobre() {
  const total = passados().length;
  return (
    <main className="pagina-topo">
      <section className="secao manifesto" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Sobre" titulo="A coroa foi conquistada na pista" />
          <Revela>
            <div className="texto lead surge" style={{ color: 'var(--text-body)' }}>
              <p>A Royals Entretenimento é uma produtora de eventos de trap e funk no Norte do Brasil. São mais de dez anos de pista e mais de 100 mil ingressos vendidos.</p>
              <p>Cada evento tem a sua própria marca, as suas cores e o seu jeito. A Royals assina por trás, como garantia de produção.</p>
              <p>O ouro representa o legado. O preto representa a noite. E a coroa pertence a quem faz o evento acontecer: artistas, público e promoters.</p>
            </div>
          </Revela>
        </div>
      </section>
      <section className="secao secao--fio">
        <div className="container">
          <CabecalhoSecao olho="Marcos" titulo="Algumas noites que fizeram história" descricao={`${total} edições estão no acervo do site.`} acao={<Botao href="/relembre-momentos" variante="fantasma">Linha do tempo</Botao>} />
          <div className="linha-tempo">
            {MARCOS.map((m) => {
              const e = evento(m.slug);
              if (!e) return null;
              return (
                <Revela className="linha-tempo__item" key={m.slug}>
                  <div className="linha-tempo__ano sobe"><span>{e.data.slice(0, 4)}</span></div>
                  <div className="pilha surge" style={{ gap: 8 }}>
                    <strong className="h3">{nomeCompleto(e)}</strong>
                    <p className="lead" style={{ margin: 0 }}>{m.texto}</p>
                    <div><Botao href={`/relembre-momentos/${e.slug}`} variante="fantasma" tamanho="sm">Ver a noite</Botao></div>
                  </div>
                </Revela>
              );
            })}
          </div>
        </div>
      </section>
      <section className="secao secao--afundada">
        <div className="container"><Revela><LogoRevela className="manifesto__logo" /></Revela></div>
      </section>
    </main>
  );
}
