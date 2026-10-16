import type { Metadata } from 'next';
import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { Revela } from '@/components/Revela';
import { INSTAGRAM_URL } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Promoters', description: 'O programa de promoters da Royals Entretenimento está chegando. Quem leva a galera faz parte da noite.', alternates: { canonical: '/promoters' } };

// Decisão do Humberto (15/10/2026): a página fica pronta e o cadastro aparece como "em breve" até a Royals definir as
// regras do programa e quem recebe os cadastros. Nada de regra, comissão ou prazo inventado aqui.
export default function Promoters() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Promoters" titulo="A coroa também é sua" descricao="Quem leva a galera faz parte da noite. O programa de promoters da Royals está sendo preparado." />
          <Revela className="chamada">
            <div className="pilha" style={{ gap: 16 }}>
              <span className="rotulo-texto surge">Cadastro</span>
              <h2 className="h2"><span className="sobe"><span>Abre em breve</span></span></h2>
              <p className="lead surge">As regras e o formulário de cadastro saem aqui e no Instagram. Ative as notificações para não perder a abertura.</p>
            </div>
            <div className="surge pilha" style={{ gap: 12 }}>
              <Botao href="/promoters" desligado tamanho="lg">Cadastro em breve</Botao>
              <Botao href={INSTAGRAM_URL} externo variante="secundario">Seguir no Instagram</Botao>
            </div>
          </Revela>
        </div>
      </section>
    </main>
  );
}
