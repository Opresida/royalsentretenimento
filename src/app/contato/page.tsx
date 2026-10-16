import type { Metadata } from 'next';
import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { Regua } from '@/components/Regua';
import { Revela } from '@/components/Revela';
import { INSTAGRAM_URL, PERFIL } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Contato', description: 'Fale com a Royals Entretenimento: parcerias, imprensa e patrocínio.', alternates: { canonical: '/contato' } };

// Só contatos verificados (regra da marca). E-mail e telefone comercial entram quando a Royals passar.
export default function Contato() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container pilha" style={{ gap: 'var(--space-12)' }}>
          <CabecalhoSecao nivel={1} olho="Contato" titulo="Fale com a Royals" descricao="Parcerias, patrocínio, imprensa e artistas: o canal oficial é o direct do Instagram." />
          <Revela className="surge">
            <Regua grande itens={[
              { rotulo: 'Instagram', valor: `@${PERFIL.usuario}`, nota: 'Direct aberto' },
              { rotulo: 'Cidade', valor: 'Manaus', nota: 'Amazonas' },
              { rotulo: 'Ingressos', valor: 'Canal oficial', nota: 'Na página de cada evento' },
            ]} />
          </Revela>
          <div><Botao href={`https://ig.me/m/${PERFIL.usuario}`} externo tamanho="lg">Mandar mensagem</Botao></div>
          <p className="lead">Prefere ver antes? <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Abrir o perfil ↗</a></p>
        </div>
      </section>
    </main>
  );
}
