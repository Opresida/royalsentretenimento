import Link from 'next/link';
import { AberturaMarca } from '@/components/AberturaMarca';
import { Botao } from '@/components/Botao';
import { BotaoSom } from '@/components/BotaoSom';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { CartaoEvento } from '@/components/CartaoEvento';
import { Carrossel } from '@/components/Carrossel';
import { ContaNumero } from '@/components/ContaNumero';
import { FundoLoop } from '@/components/FundoLoop';
import { Galeria } from '@/components/Galeria';
import { Assinatura, LogoRevela } from '@/components/Marca';
import { Regua } from '@/components/Regua';
import { Revela } from '@/components/Revela';
import { EVENTOS } from '@/data/eventos';
import { VideoTopo } from '@/components/VideoTopo';
import { INSTAGRAM_URL, PERFIL, POSTS, capaDoEvento, capaDoVideo, dataCurta, destaqueDoEvento, eventoDoPost, diaSemana, fileirasCheias, nomeCompleto, passados, proximos, tipoDeVideo, umPorEvento, videos } from '@/lib/acervo';
import { itensGaleria } from '@/lib/galeria';

// Home, na ordem do wireframe do brandbook: header · hero (evento em destaque) · próximos eventos · indicadores ·
// manifesto · relembre momentos · vídeos · promoters · Instagram · contato e rodapé.
// Pilares do conceito, do brandbook aprovado (Proposta 01, "Pilares do conceito")
const PILARES = [
  { nome: 'Ouro', ideia: 'O legado.', texto: 'Dez anos de pista e mais de 100 mil ingressos. O histórico é patrimônio.' },
  { nome: 'Preto', ideia: 'A noite.', texto: 'Palco, fumaça e pista. O fundo onde a luz ganha força.' },
  { nome: 'Coroa', ideia: 'As pessoas.', texto: 'Artista, público e promoter em primeiro plano. Gente real, sem pose.' },
];

export default function Home() {
  const agenda = proximos();
  const destaque = agenda[0];
  const anteriores = passados();
  const capa = destaque ? capaDoEvento(destaque) : undefined;
  const reel = destaque ? destaqueDoEvento(destaque) : undefined;
  const estiloEvento = destaque?.cor ? ({ '--event-accent': destaque.cor, '--event-on-accent': destaque.sobreCor ?? '#050505' } as React.CSSProperties) : undefined;
  // vitrines: um item por evento (senão o evento que mais postou toma a seção), com a grade sempre fechada
  const reels = umPorEvento(videos(), (v) => tipoDeVideo(v.post.legenda) === 'A noite'); // um por evento, em carrossel
  // "No Instagram": por evento, o flyer ou a capa de reel profissional (curadoria: `vitrine`, senão a `capa` do evento),
  // com a imagem ORIGINAL do Instagram. Sem curadoria (Baile das Bruxas: um reel só, com capa escura), o post automático
  // com a capa padronizada do vídeo.
  const automatico = umPorEvento(POSTS.map((p) => ({ post: p })));
  const vitrine = fileirasCheias([...EVENTOS].sort((a, b) => b.data.localeCompare(a.data)).flatMap((e) => {
    const id = e.vitrine ?? e.capa;
    const curado = id ? POSTS.find((p) => p.id === id) : undefined;
    const post = curado ?? automatico.find((x) => eventoDoPost(x.post)?.slug === e.slug)?.post;
    if (!post) return [];
    const m = post.midias[0];
    return [{ post, m, img: curado ? m.p : (m.tipo !== 'imagem' && capaDoVideo(m)?.p) || m.p, evento: nomeCompleto(e) }];
  }), 12, 12);
  // números: 10+ anos e 100 mil+ ingressos confirmados pelo Humberto; os outros dois saem do acervo e do Instagram
  const INDICADORES = [
    { valor: 10, sufixo: '+', texto: 'Anos de trap e funk no Norte' },
    { valor: 100, sufixo: 'MIL+', texto: 'Ingressos vendidos' },
    { valor: anteriores.length + agenda.length, texto: 'Noites registradas no acervo' },
    { valor: Math.round(PERFIL.seguidores / 100) / 10, casas: 1, sufixo: 'MIL', texto: 'Seguindo a Royals no Instagram' },
  ];

  return (
    <main>
      {/* 01 · ABERTURA com a logo (só quando o site é aberto na home; navegando pelo site, toca a transição) */}
      <AberturaMarca />
      {/* 02 · HERO: o evento em destaque lidera; a Royals assina */}
      {destaque && capa ? (
        <section className={`hero ${destaque.videoDesktop ? 'hero--lateral' : ''}`} style={estiloEvento}>
          <VideoTopo video={reel?.video} capa={reel?.g ?? capa.g} desktop={destaque.videoDesktop} celular={destaque.videoCelular} />
          <Revela className="container hero__conteudo" aguardaAbertura>
            <span className="surge"><span className="tag tag--evento">Próximo evento</span></span>
            {destaque.logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <h1 className="surge" style={{ margin: 0 }}><img className="hero__logo-evento" src={destaque.logo} alt={nomeCompleto(destaque)} /></h1>
              : <h1 className="display"><span className="sobe"><span>{nomeCompleto(destaque)}</span></span></h1>}
            <div className="surge hero__regua">
              <Regua grande itens={[
                { rotulo: 'Data', valor: `${diaSemana(destaque.data).toUpperCase()} · ${dataCurta(destaque.data)}`, nota: destaque.hora },
                ...(destaque.local ? [{ rotulo: 'Local', valor: destaque.local, nota: destaque.cidade }] : []),
                { rotulo: destaque.atracoes.length > 1 ? 'Atrações' : 'Atração', valor: destaque.atracoes.join(' · ') },
              ]} />
            </div>
            <div className="hero__acoes surge">
              {destaque.ingressos && <Botao href={destaque.ingressos} externo variante="evento" tamanho="lg">Ingressos</Botao>}
              <Botao href={`/eventos/${destaque.slug}`} variante="secundario" tamanho="lg">Ver evento</Botao>
              <BotaoSom />
            </div>
            <div className="surge hero__assinatura" style={{ maxWidth: destaque.parceiros ? 520 : 420 }}><Assinatura parceiros={destaque.parceiros} /></div>
          </Revela>
        </section>
      ) : null}
      {destaque && capa ? null : (
        <section className="hero">
          <Revela className="container hero__conteudo"><LogoRevela className="manifesto__logo" /></Revela>
        </section>
      )}

      {/* 03 · PRÓXIMOS EVENTOS */}
      <section className="secao">
        <div className="container">
          <CabecalhoSecao olho="Agenda" titulo="Próximos eventos" acao={<Botao href="/eventos" variante="fantasma">Ver agenda</Botao>} />
          {agenda.length ? (
            <div className="grade grade--3">
              {agenda.map((e) => <CartaoEvento key={e.slug} e={e} href={`/eventos/${e.slug}`} cta={e.ingressos ? 'Ingressos e informações' : 'Ver evento'} tag={{ texto: dataCurta(e.data), tom: 'evento' }} />)}
            </div>
          ) : <p className="lead">A próxima data sai em breve. Acompanhe no Instagram.</p>}
        </div>
      </section>

      {/* 04 · INDICADORES · fundo "Brilho" (F2 da biblioteca de motion) e números que contam ao entrar na tela */}
      <section className="secao secao--fundo">
        <FundoLoop tipo="brilho" />
        <div className="container">
          <CabecalhoSecao olho="A Royals" titulo="Feita na pista" />
          <Revela className="numeros">
            {INDICADORES.map((n, i) => (
              <div className="numero" key={n.texto}>
                <p className="numero__valor"><ContaNumero valor={n.valor} casas={n.casas} atraso={i * 80} />{n.sufixo && <span className="numero__sufixo">{n.sufixo}</span>}</p>
                <span className="numero__fio" />
                <span className="numero__texto surge">{n.texto}</span>
              </div>
            ))}
          </Revela>
        </div>
      </section>

      {/* 05 · MANIFESTO · fundo "Diagonais" (F1): as linhas a 45° da coroa, acesas por uma luz que circula */}
      <section className="secao secao--fundo manifesto">
        <FundoLoop tipo="diagonais" />
        <div className="container">
          <Revela>
            {/* o fio de luz da logo (mesmo do menu e do rodapé), só depois que a logo termina de se montar */}
            <span className="logo-brilho manifesto__brilho" style={{ '--logo': 'url(/marca/royals-gold-transparent.svg)' } as React.CSSProperties}>
              <LogoRevela className="manifesto__logo" />
            </span>
            <h2 className="manifesto__frase">
              <span className="sobe"><span>Conquistada</span></span>
              <span className="sobe"><span className="ouro-degrade">na pista.</span></span>
            </h2>
            <p className="manifesto__apoio surge">O ouro é o legado. O preto é a noite. A coroa é de quem faz o evento acontecer.</p>
            <div className="pilares">
              {PILARES.map((p, i) => (
                <div className="pilar" key={p.nome}>
                  <div className="pilar__topo surge"><span className="pilar__n">0{i + 1}</span><span className="pilar__nome">{p.nome}</span></div>
                  <span className="pilar__fio" />
                  <p className="surge"><em>{p.ideia}</em> {p.texto}</p>
                </div>
              ))}
            </div>
          </Revela>
        </div>
      </section>

      {/* 06 · RELEMBRE MOMENTOS (carrossel para a direita) */}
      <section className="secao secao--fio secao--carrossel">
        <div className="container">
          <CabecalhoSecao olho="Acervo" titulo="Relembre momentos" descricao="Cada edição que a Royals levou para a pista, com as fotos e os vídeos de cada noite." acao={<Botao href="/relembre-momentos" variante="fantasma">Linha do tempo</Botao>} />
          <Carrossel sentido="direita" rotulo="Edições anteriores da Royals" quantidade={anteriores.length} className="carrossel--cartoes">
            {anteriores.map((e) => <CartaoEvento key={e.slug} e={e} href={`/relembre-momentos/${e.slug}`} cta="Ver fotos e vídeos" />)}
          </Carrossel>
        </div>
      </section>

      {/* 07 · VÍDEOS (carrossel para a esquerda) */}
      <section className="secao secao--afundada secao--carrossel">
        <div className="container">
          <CabecalhoSecao olho="Vídeos" titulo="Melhores momentos" acao={<Botao href="/melhores-momentos" variante="fantasma">Ver todos</Botao>} />
          <Galeria itens={itensGaleria(reels, true)} carrossel={{ sentido: 'esquerda', rotulo: 'Vídeos dos eventos da Royals' }} />
        </div>
      </section>

      {/* 08 · PROMOTERS */}
      <section className="secao">
        <div className="container">
          <Revela className="chamada chamada--loop chamada--pulso chamada--pessoa">
            <FundoLoop tipo="pulso" />
            {/* a influencer à direita, atrás do botão: humaniza a chamada (foto recortada: public/pessoas, gerada de .acervo/influencer) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="chamada__pessoa" src="/pessoas/promoters-640.webp" srcSet="/pessoas/promoters-640.webp 423w, /pessoas/promoters-1100.webp 727w" sizes="(max-width: 720px) 230px, 320px" alt="" loading="lazy" width={423} height={640} />
            <div className="pilha" style={{ gap: 16 }}>
              <span className="rotulo-texto surge">Promoters</span>
              <h2 className="h1"><span className="sobe"><span>A coroa também é sua</span></span></h2>
              <p className="lead surge">Quem leva a galera faz parte da noite. O programa de promoters da Royals está chegando.</p>
            </div>
            <div className="surge"><Botao href="/promoters" tamanho="lg">Quero ser promoter</Botao></div>
          </Revela>
        </div>
      </section>

      {/* 09 · INSTAGRAM */}
      <section className="secao secao--fio">
        <div className="container">
          <CabecalhoSecao olho={`@${PERFIL.usuario}`} titulo="No Instagram" acao={<Botao href={INSTAGRAM_URL} externo variante="secundario">Seguir</Botao>} />
          <div className="grade grade--mosaico grade--vitrine-6">
            {vitrine.map(({ post, m, img, evento }) => (
              <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="midia midia--4x5 midia--insta" aria-label={`${evento}: abrir post no Instagram`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" loading="lazy" />
                {m.tipo !== 'imagem' && <span className="midia__play" aria-hidden="true">▶</span>}
                <span className="midia__texto"><span className="midia__titulo">{evento}</span></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · CONTATO (fundo F1 Diagonais) */}
      <section className="secao secao--afundada">
        <div className="container">
          <Revela className="chamada chamada--loop chamada--diagonais chamada--pessoa chamada--contato">
            <FundoLoop tipo="diagonais" />
            {/* a influencer de imprensa à direita, atrás dos botões (pedido do Humberto, 16/10): o mesmo encaixe da chamada dos
                promoters. Foto já recortada; original em .acervo/influencer/contato-imprensa-original.png */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="chamada__pessoa" src="/pessoas/contato-640.webp" srcSet="/pessoas/contato-640.webp 429w, /pessoas/contato-1100.webp 737w" sizes="(max-width: 720px) 230px, 320px" alt="" loading="lazy" width={429} height={640} />
            <div className="pilha" style={{ gap: 16 }}>
              <span className="rotulo-texto surge">Contato</span>
              <h2 className="h2"><span className="sobe"><span>Parcerias, imprensa e reservas</span></span></h2>
              <p className="lead surge">Fale com a Royals pelo direct do Instagram. Ingressos de cada evento são vendidos só no canal oficial.</p>
            </div>
            <div className="surge" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Botao href={INSTAGRAM_URL} externo>Instagram</Botao>
              <Link className="botao botao--secundario" href="/contato">Contato<span className="seta" aria-hidden="true">→</span></Link>
            </div>
          </Revela>
        </div>
      </section>
    </main>
  );
}
