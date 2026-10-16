import type { Metadata } from 'next';
import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';

// Confirmação do cadastro de promoters (sitemap do brandbook). Fica pronta para quando o cadastro abrir.
export const metadata: Metadata = { title: 'Obrigado', robots: { index: false } };

export default function Obrigado() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container pilha" style={{ gap: 32 }}>
          <CabecalhoSecao nivel={1} olho="Cadastro recebido" titulo="Obrigado" descricao="A equipe da Royals vai analisar e entrar em contato." />
          <div><Botao href="/">Voltar ao início</Botao></div>
        </div>
      </section>
    </main>
  );
}
