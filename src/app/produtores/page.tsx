import type { Metadata } from 'next';
import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { CartaoEvento } from '@/components/CartaoEvento';
import { Carrossel } from '@/components/Carrossel';
import { ContaNumero } from '@/components/ContaNumero';
import { FundoLoop } from '@/components/FundoLoop';
import { Regua } from '@/components/Regua';
import { Revela } from '@/components/Revela';
import { COMPARATIVO, DORES, FAQ, JORNADA, PILARES, PLANOS, RECEBIMENTO, VSL } from '@/data/parceria';
import { passados } from '@/lib/acervo';
import { Formulario } from './Formulario';
import { Simulador } from './Simulador';
import './produtores.css';

export const metadata: Metadata = {
  title: 'Para produtores: o seu evento já nasce grande',
  description: 'Organização Royals, marketing BrandSquad e bilheteria Royals Tickets com split de pagamento: Pix na hora e cartão no dia seguinte ao evento. A parceria completa para o produtor de Manaus.',
  alternates: { canonical: '/produtores' },
};

// Página de captura da parceria para produtores (pedido do Humberto, 26/10/2026), em formato de VSL: o vídeo no topo
// (quando gravado, ver VSL em src/data/parceria.ts) e as seções contando caso a caso. Conteúdo em src/data/parceria.ts.
const real = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function Produtores() {
  const anteriores = passados();
  return (
    <main className="pagina-topo prod">
      {/* 01 · TOPO: a promessa (e a VSL quando estiver gravada) */}
      <section className="secao secao--fundo prod-topo" style={{ paddingTop: 0 }}>
        <FundoLoop tipo="diagonais" />
        <div className="container">
          <Revela className="prod-topo__grade">
            <div className="pilha prod-topo__texto">
              <span className="rotulo-texto surge">Para produtores de evento</span>
              <h1 className="display prod-topo__titulo">
                <span className="sobe"><span>O seu evento</span></span>
                <span className="sobe"><span className="ouro-degrade">já nasce grande.</span></span>
              </h1>
              <p className="lead surge">Organização, marketing e bilheteria com o dinheiro na hora. Tudo o que o produtor precisa, num lugar só.</p>
              <div className="prod-topo__acoes surge">
                <Botao href="#contato" tamanho="lg">Quero fazer meu evento</Botao>
                <Botao href="#dinheiro" variante="secundario" tamanho="lg">Como eu recebo</Botao>
              </div>
            </div>
            {VSL.youtube ? (
              <div className="prod-vsl surge">
                <iframe src={`https://www.youtube-nocookie.com/embed/${VSL.youtube}?rel=0`} title="Parceria Royals para produtores" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
              </div>
            ) : (
              // sem a VSL gravada, o lado direito mostra as três forças da parceria
              <ol className="prod-topo__lado surge">
                {PILARES.map((p, i) => (
                  <li key={p.marca}>
                    <span className="prod-pilar__n">0{i + 1}</span>
                    <strong>{p.marca}</strong>
                    <span>{p.papel}</span>
                  </li>
                ))}
              </ol>
            )}
          </Revela>
        </div>
      </section>

      {/* 02 · A DOR */}
      <section className="secao secao--fio">
        <div className="container">
          <CabecalhoSecao olho="A realidade do produtor" titulo="Evento cheio, bolso vazio" descricao="Você paga tudo antes de vender o primeiro ingresso. E quando dá certo, o dinheiro fica com outra empresa." />
          <Revela className="prod-dores">
            {DORES.map((d) => (
              <div key={d.n} className="prod-dor">
                <div className="pilar__topo surge"><span className="pilar__n">{d.n}</span><span className="pilar__nome">{d.titulo}</span></div>
                <span className="pilar__fio" />
                <p className="surge">{d.texto}</p>
              </div>
            ))}
          </Revela>
        </div>
      </section>

      {/* 03 · O ECOSSISTEMA */}
      <section className="secao secao--afundada" id="ecossistema">
        <div className="container">
          <CabecalhoSecao olho="O ecossistema" titulo="Três forças, um evento" descricao="Cada parte faz o que sabe fazer melhor, e todas trabalham juntas pelo seu evento." />
          <Revela className="prod-pilares">
            {PILARES.map((p, i) => (
              <article key={p.marca} className="prod-pilar">
                <span className="prod-pilar__n">0{i + 1}</span>
                <h3 className="h3">{p.marca}</h3>
                <p className="rotulo-texto">{p.papel}</p>
                <ul>{p.itens.map((it) => <li key={it}>{it}</li>)}</ul>
              </article>
            ))}
          </Revela>
        </div>
      </section>

      {/* 04 · O DINHEIRO: split, prazos e comparativo */}
      <section className="secao secao--fundo" id="dinheiro">
        <FundoLoop tipo="brilho" />
        <div className="container pilha" style={{ gap: 'var(--space-16)' }}>
          <CabecalhoSecao olho="Royals Tickets" titulo="O seu dinheiro, sem esperar 15 dias" descricao="Cada venda já nasce dividida, pelo split de pagamento da Pagar.me. A sua parte é sua desde o primeiro ingresso." />
          <Revela className="prod-split" >
            <div className="prod-split__no surge"><span className="rotulo-texto rotulo-texto--mudo">Comprador</span><strong>Paga o ingresso</strong></div>
            <span className="prod-split__seta" aria-hidden="true" />
            <div className="prod-split__no surge"><span className="rotulo-texto rotulo-texto--mudo">Pagar.me</span><strong>Divide na hora</strong></div>
            <span className="prod-split__seta prod-split__seta--duas" aria-hidden="true" />
            <div className="prod-split__fim surge">
              <div className="prod-split__no prod-split__no--ouro"><span className="rotulo-texto">Produtor</span><strong>A sua parte</strong></div>
              <div className="prod-split__no"><span className="rotulo-texto rotulo-texto--mudo">Parceria</span><strong>A parte combinada</strong></div>
            </div>
          </Revela>
          <Revela className="surge"><Regua grande itens={RECEBIMENTO} /></Revela>
          <Revela className="prod-tabela surge">
            <table>
              <thead><tr><th scope="col"><span className="so-leitor">Item</span></th><th scope="col">O que o produtor costuma enfrentar</th><th scope="col">Na parceria Royals</th></tr></thead>
              <tbody>{COMPARATIVO.map((c) => <tr key={c.item}><th scope="row">{c.item}</th><td data-rotulo="O que o produtor costuma enfrentar">{c.comum}</td><td data-rotulo="Na parceria Royals">{c.royals}</td></tr>)}</tbody>
            </table>
          </Revela>
        </div>
      </section>

      {/* 05 · MARKETING (BrandSquad): o robô do direct como exemplo concreto */}
      <section className="secao secao--fio">
        <div className="container prod-duas">
          <CabecalhoSecao olho="BrandSquad" titulo="Marketing que vende enquanto você dorme" descricao="Identidade do evento, criativos, Reels em motion e postagem automática no horário certo. E ninguém fica sem resposta: a pessoa comenta e recebe o link do ingresso no direct, na hora." />
          <Revela className="prod-robo surge" >
            <div className="prod-robo__post"><span className="rotulo-texto rotulo-texto--mudo">Comentário no Reel</span><p><b>@quemvai</b> INGRESSO</p></div>
            <span className="prod-robo__fio" aria-hidden="true" />
            <div className="prod-robo__direct">
              <span className="rotulo-texto rotulo-texto--mudo">No direct, segundos depois</span>
              <p>Aqui está o link dos ingressos do seu evento. Pix na hora, ingresso com QR Code no celular.</p>
              <span className="prod-robo__botao">Comprar ingresso</span>
            </div>
          </Revela>
        </div>
      </section>

      {/* 06 · ORGANIZAÇÃO E INFLUENCIADORES (Royals Entretenimento) */}
      <section className="secao secao--afundada">
        <div className="container pilha" style={{ gap: 'var(--space-12)' }}>
          <CabecalhoSecao olho="Royals Entretenimento" titulo="Quem já fez, faz com você" descricao="Organização e produção com quem vive a pista há mais de dez anos, e um exército de influenciadores para vender o seu evento." />
          <Revela className="numeros">
            {[{ valor: 10, sufixo: '+', texto: 'Anos de trap e funk no Norte' }, { valor: 100, sufixo: 'MIL+', texto: 'Ingressos vendidos' }, { valor: anteriores.length, texto: 'Noites no acervo da Royals' }].map((n, i) => (
              <div className="numero" key={n.texto}>
                <p className="numero__valor"><ContaNumero valor={n.valor} atraso={i * 80} />{n.sufixo && <span className="numero__sufixo">{n.sufixo}</span>}</p>
                <span className="numero__fio" />
                <span className="numero__texto surge">{n.texto}</span>
              </div>
            ))}
          </Revela>
          <Carrossel sentido="direita" rotulo="Eventos da Royals" quantidade={anteriores.length} className="carrossel--cartoes">
            {anteriores.map((e) => <CartaoEvento key={e.slug} e={e} href={`/relembre-momentos/${e.slug}`} cta="Ver como foi" />)}
          </Carrossel>
        </div>
      </section>

      {/* 07 · A JORNADA DO EVENTO */}
      <section className="secao secao--fio">
        <div className="container">
          <CabecalhoSecao olho="Como funciona" titulo="Do fechamento ao dia seguinte" />
          <Revela className="linha-tempo">
            {JORNADA.map((j, i) => (
              <div key={j.etapa} className="linha-tempo__item">
                <span className="linha-tempo__ano surge">0{i + 1}</span>
                <div className="surge"><h3 className="h3">{j.etapa}</h3><p className="lead">{j.texto}</p></div>
              </div>
            ))}
          </Revela>
        </div>
      </section>

      {/* 08 · MODELOS DE PARCERIA + SIMULADOR */}
      <section className="secao secao--afundada" id="modelos">
        <div className="container pilha" style={{ gap: 'var(--space-12)' }}>
          <CabecalhoSecao olho="Modelos de parceria" titulo="Escolha como entrar" descricao="A parceria fica com uma parte da bilheteria e do bar do evento. Você escolhe quanto quer colocar na entrada." />
          <Revela className="prod-planos">
            {PLANOS.map((p) => (
              <article key={p.nome} className="prod-plano surge">
                <span className="rotulo-texto">{p.nome}</span>
                <p className="prod-plano__valor">{real(p.entrada)}<small>de entrada</small></p>
                <p className="prod-plano__parte">+ {p.parte}% <small>da bilheteria e do bar</small></p>
                <p className="prod-plano__resumo">{p.resumo}</p>
              </article>
            ))}
            <article className="prod-plano prod-plano--sob-medida surge">
              <span className="rotulo-texto">Modelo 3</span>
              <p className="prod-plano__valor">Sob medida</p>
              <p className="prod-plano__parte"><small>de acordo com o tamanho do seu evento</small></p>
              <p className="prod-plano__resumo">Para evento grande</p>
            </article>
          </Revela>
          <div className="pilha" style={{ gap: 'var(--space-6)' }}>
            <h3 className="h3">Simule o seu evento</h3>
            <Simulador />
          </div>
        </div>
      </section>

      {/* 09 · PERGUNTAS */}
      <section className="secao secao--fio">
        <div className="container">
          <CabecalhoSecao olho="Dúvidas" titulo="Perguntas frequentes" />
          <div className="prod-faq">
            {FAQ.map((f) => (
              <details key={f.p}>
                <summary>{f.p}</summary>
                <p>{f.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · CONTATO */}
      <section className="secao" id="contato">
        <div className="container">
          <Revela className="chamada prod-contato">
            <div className="pilha" style={{ gap: 16 }}>
              <span className="rotulo-texto surge">Vamos fazer o seu evento</span>
              <h2 className="h1"><span className="sobe"><span>Conta pra gente</span></span></h2>
              <p className="lead surge">Preencha em um minuto. A equipe da parceria chama você no WhatsApp para entender o evento e indicar o melhor modelo.</p>
            </div>
            <div className="surge"><Formulario /></div>
          </Revela>
        </div>
      </section>
    </main>
  );
}
