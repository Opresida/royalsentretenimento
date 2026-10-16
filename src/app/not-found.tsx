import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';

export default function NaoEncontrada() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container pilha" style={{ gap: 32 }}>
          <CabecalhoSecao nivel={1} olho="404" titulo="Essa página saiu da pista" descricao="O endereço não existe ou mudou de lugar." />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Botao href="/">Início</Botao><Botao href="/eventos" variante="secundario">Próximos eventos</Botao></div>
        </div>
      </section>
    </main>
  );
}
