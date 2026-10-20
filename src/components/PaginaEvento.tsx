import type { Evento } from '@/data/eventos';
import { capaDoEvento, dataCurta, dataExtensa, destaqueDoEvento, diaSemana, midiasDoEvento, nomeCompleto, passados, ano } from '@/lib/acervo';
import { itensGaleria } from '@/lib/galeria';
import { Botao } from './Botao';
import { BotaoSom } from './BotaoSom';
import { CabecalhoSecao } from './CabecalhoSecao';
import { CartaoEvento } from './CartaoEvento';
import { Galeria } from './Galeria';
import { Assinatura } from './Marca';
import { Regua } from './Regua';
import { Revela } from './Revela';
import { VideoTopo } from './VideoTopo';

/** Página de um evento (próximo ou passado). Marca endossada: a identidade do evento entra só pela cor
 *  (--event-accent), pelo logo e pela imagem; header, rodapé e tipografia continuam Royals. */
export function PaginaEvento({ e, passado }: { e: Evento; passado: boolean }) {
  const capa = capaDoEvento(e);
  const reel = destaqueDoEvento(e);
  const midias = midiasDoEvento(e.slug);
  const fotos = midias.filter((m) => m.tipo === 'imagem');
  const videos = midias.filter((m) => m.tipo !== 'imagem');
  const estilo = e.cor ? ({ '--event-accent': e.cor, '--event-on-accent': e.sobreCor ?? '#050505' } as React.CSSProperties) : undefined;
  const celular = passado ? undefined : e.videoCelular;
  const outras = passados().filter((x) => x.slug !== e.slug && (x.nome === e.nome || x.atracoes.some((a) => e.atracoes.includes(a)))).slice(0, 3);

  return (
    <main style={estilo}>
      <section className={`hero evento-topo ${!passado && e.videoDesktop ? 'hero--lateral' : ''}`}>
        {capa && <VideoTopo video={passado ? undefined : reel?.video} capa={reel?.g ?? capa.g} desktop={passado ? undefined : e.videoDesktop} celular={celular} />}
        <Revela className="container hero__conteudo">
          <span className="surge"><span className={`tag ${passado ? '' : 'tag--evento'}`}>{passado ? `Edição de ${ano(e.data)}` : 'Próximo evento'}</span></span>
          {e.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <h1 className="surge" style={{ margin: 0 }}><img className="hero__logo-evento" src={e.logo} alt={nomeCompleto(e)} /></h1>
            : <h1 className="display"><span className="sobe"><span>{e.nome}</span></span>{e.edicao && <span className="sobe"><span className="rotulo-texto" style={{ fontSize: 'var(--text-h4)' }}>{e.edicao}</span></span>}</h1>}
          {e.resumo && <p className="lead surge">{e.resumo}</p>}
          {!passado && (e.ingressos || e.site || e.instagram) && (
            <div className="hero__acoes surge">
              {e.ingressos && <Botao href={e.ingressos} externo variante="evento" tamanho="lg">Ingressos</Botao>}
              {e.site && <Botao href={e.site} externo variante="secundario" tamanho="lg">Site do evento</Botao>}
              {!e.ingressos && e.ingressosEmBreve && <span className="tag tag--evento hero__em-breve">Ingressos em breve</span>}
              {e.instagram && <Botao href={e.instagram} externo variante={e.ingressos ? 'secundario' : 'evento'} tamanho="lg">Instagram do evento</Botao>}
              <BotaoSom />
            </div>
          )}
        </Revela>
      </section>

      <section className="secao">
        <div className="container pilha" style={{ gap: 'var(--space-12)' }}>
          <Revela className="surge">
            <Regua grande itens={[
              { rotulo: 'Data', valor: `${diaSemana(e.data).toUpperCase()} · ${dataCurta(e.data)}.${ano(e.data)}`, nota: [dataExtensa(e.data), e.hora].filter(Boolean).join(' · ') },
              { rotulo: 'Local', valor: e.local ?? e.cidade, nota: e.local ? e.cidade : undefined },
              e.atracoes.length ? { rotulo: e.atracoes.length > 1 ? 'Atrações' : 'Atração', valor: e.atracoes.join(' · ') } : { rotulo: 'Estilo', valor: e.estilo ?? 'Em breve', nota: e.estilo ? 'Line-up em breve' : undefined },
            ]} />
          </Revela>
          {!passado && e.ingressos && (
            <Revela className="chamada">
              <div className="pilha" style={{ gap: 12 }}>
                <span className="rotulo-texto surge">Ingressos</span>
                <h2 className="h2"><span className="sobe"><span>Garanta o seu no canal oficial</span></span></h2>
                <p className="lead surge">Os ingressos são vendidos só pela {e.ingressosOnde ?? 'plataforma oficial'}. Desconfie de vendas fora dela.</p>
              </div>
              <div className="surge"><Botao href={e.ingressos} externo variante="evento" tamanho="lg">Comprar ingresso</Botao></div>
            </Revela>
          )}
          {!passado && !e.ingressos && e.ingressosEmBreve && (
            <Revela className="chamada">
              <div className="pilha" style={{ gap: 12 }}>
                <span className="rotulo-texto surge">Ingressos</span>
                <h2 className="h2"><span className="sobe"><span>Vendas em breve</span></span></h2>
                <p className="lead surge">O link oficial sai primeiro no Instagram do evento. Ative as notificações para não perder a abertura.</p>
              </div>
              {e.instagram && <div className="surge"><Botao href={e.instagram} externo variante="evento" tamanho="lg">Seguir no Instagram</Botao></div>}
            </Revela>
          )}
          {e.apresentam && !e.parceiros && (
            <Revela className="surge"><p className="rotulo-texto rotulo-texto--mudo" style={{ margin: 0 }}>Apresentam · {e.apresentam.join(' · ')}</p></Revela>
          )}
          <div style={{ maxWidth: e.parceiros ? 560 : 480 }}><Assinatura parceiros={e.parceiros} rotulo={e.rotuloAssinatura} /></div>
        </div>
      </section>

      {midias.length > 0 && (
        <section className="secao secao--afundada">
          <div className="container">
            <CabecalhoSecao olho={passado ? 'Relembre' : 'Divulgação'} titulo={passado ? 'Como foi a noite' : 'Do Instagram'} descricao={`${contagem(fotos.length, 'foto', 'fotos', videos.length, 'vídeo', 'vídeos')} de ${nomeCompleto(e)} no acervo da Royals.`} />
            <Galeria itens={itensGaleria(midias)} filtros={videos.length && fotos.length ? [
              { rotulo: 'Tudo', valor: 'tudo', ids: midias.map((m) => m.id) },
              { rotulo: 'Fotos', valor: 'fotos', ids: fotos.map((m) => m.id) },
              { rotulo: 'Vídeos', valor: 'videos', ids: videos.map((m) => m.id) },
            ] : undefined} />
          </div>
        </section>
      )}

      {e.galeriaExterna && (
        <section className="secao">
          <div className="container">
            <CabecalhoSecao olho={e.galeriaExterna.olho} titulo={e.galeriaExterna.titulo} descricao={e.galeriaExterna.descricao} />
            <Galeria itens={e.galeriaExterna.itens.map((m) => ({ ...m, tipo: 'imagem' as const, link: m.link ?? e.instagram ?? '' }))} colunas={4} />
          </div>
        </section>
      )}

      {outras.length > 0 && (
        <section className="secao">
          <div className="container">
            <CabecalhoSecao olho="Acervo" titulo="Edições relacionadas" />
            <div className="grade grade--3">{outras.map((x) => <CartaoEvento key={x.slug} e={x} href={`/relembre-momentos/${x.slug}`} cta="Ver fotos e vídeos" />)}</div>
          </div>
        </section>
      )}
    </main>
  );
}

/** "3 fotos e 1 vídeo", "1 vídeo", "12 fotos": plural certo e sem contar o que é zero. */
function contagem(nA: number, umA: string, variosA: string, nB: number, umB: string, variosB: string) {
  const parte = (n: number, um: string, varios: string) => (n ? `${n} ${n === 1 ? um : varios}` : '');
  return [parte(nA, umA, variosA), parte(nB, umB, variosB)].filter(Boolean).join(' e ');
}
