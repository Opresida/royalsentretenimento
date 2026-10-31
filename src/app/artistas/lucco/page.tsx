import type { Metadata } from 'next';
import { Cormorant_Garamond, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import { Revela } from '@/components/Revela';
import { AberturaLucco, PRE_PINTURA } from '@/components/lucco/AberturaLucco';
import { FormContratar } from '@/components/artistas/FormContratar';
import { GaleriaLucco } from '@/components/lucco/GaleriaLucco';
import { AteData, BarraContratar, BotaoOuvir, Letreiro, SeloRolagem, VideoTopo } from '@/components/lucco/Interativos';
import { LogoLucco } from '@/components/lucco/LogoLucco';
import { PlayerLucco } from '@/components/lucco/PlayerLucco';
import { VideosLucco } from '@/components/lucco/VideosLucco';
import { BIO, CIDADES, DURACAO, FAIXAS, FORMATOS, foto, GALERIA, LUCCO, NUMEROS, PALCOS, RIDER, SUN_HYPE, TIPOS_DE_EVENTO, TOPO, VIDEOS } from '@/data/artistas/lucco';
import { INSTAGRAM_URL, PERFIL } from '@/lib/acervo';
import { SITE_URL } from '@/lib/site';
import './lucco.css';

// Página do artista DJ LUCCO (pedido do Humberto, 29/10/2026): a versão viva do presskit v6, para o contratante ouvir,
// conhecer e pedir a data à Royals. Visual próprio do artista (o mesmo do presskit: café, champanhe, Cormorant +
// Space Grotesk), sem o menu e o rodapé da Royals; a Royals assina no selo do topo e no fim (decisão dele).
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--lf-serif', display: 'swap' });
const sans = Space_Grotesk({ subsets: ['latin'], variable: '--lf-sans', display: 'swap' });

const TITULO = 'LUCCO · DJ de House, Tech House e Afro House';
const DESCRICAO = 'DJ e produtor de Aracaju, criador da SUN HYPE, com passagem por Ibiza. Ouça o SET SUNRISE, veja os formatos de set e o rider, e contrate pela Royals Entretenimento.';
export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: '/artistas/lucco' },
  // a imagem vem de opengraph-image.jpg nesta pasta (fonte em pecas/og-lucco/og.html)
  openGraph: { title: 'LUCCO · Royals Entretenimento', description: DESCRICAO, url: '/artistas/lucco', siteName: 'Royals Entretenimento', locale: 'pt_BR', type: 'profile' },
  twitter: { card: 'summary_large_image', title: 'LUCCO · Royals Entretenimento', description: DESCRICAO },
};

const LD = {
  '@context': 'https://schema.org', '@type': 'Person', name: 'LUCCO', alternateName: 'LUCCODJ', jobTitle: 'DJ e produtor',
  url: `${SITE_URL}/artistas/lucco`, image: `${SITE_URL}/artistas/lucco/fotos/capa-1280.webp`, genre: ['House', 'Tech House', 'Afro House'],
  homeLocation: { '@type': 'Place', name: 'Aracaju, SE, Brasil' }, sameAs: [LUCCO.instagram.url, LUCCO.soundcloud.url],
  memberOf: { '@type': 'Organization', name: 'Royals Entretenimento', url: SITE_URL },
};

function Foto({ nome, alt = '', sizes, className, prioridade }: { nome: string; alt?: string; sizes: string; className?: string; prioridade?: boolean }) {
  const f = foto(nome, alt);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={`${f.base}-640.webp`} srcSet={f.larguras.map((l) => `${f.base}-${l}.webp ${l}w`).join(', ')} sizes={sizes}
      alt={alt} width={f.w} height={f.h} loading={prioridade ? 'eager' : 'lazy'} fetchPriority={prioridade ? 'high' : undefined} decoding="async" />
  );
}

function Cabeca({ rot, children, id }: { rot: string; children: React.ReactNode; id?: string }) {
  return (
    <header className="cab-l">
      <span className="rot-l rl">{rot}</span>
      <h2 id={id} className="rl">{children}</h2>
      <span className="fio-l" aria-hidden="true" />
    </header>
  );
}

const Seta = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

export default function PaginaLucco() {
  return (
    <main className={`lucco ${serif.variable} ${sans.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: PRE_PINTURA }} />
      <noscript><style>{'.topo-l .ll__p{fill-opacity:1!important;stroke:none!important;transform:none!important}.topo-l__rot,.topo-l__generos,.topo-l__frase,.topo-l__acoes{opacity:1!important}.lucco .revela .rl,.lucco .revela .fio-l{opacity:1!important;transform:none!important}'}</style></noscript>
      <AberturaLucco />

      {/* selo da Royals + atalhos */}
      <header className="selo-l">
        <Link href="/" className="selo-l__royals" aria-label="Royals Entretenimento apresenta">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/royals-gold-transparent.svg" alt="" width={120} height={34} />
          <span>apresenta</span>
        </Link>
        <nav aria-label="Seções" className="selo-l__nav">
          <a href="#som">O som</a><a href="#palcos">Palcos</a><a href="#aovivo">Ao vivo</a><a href="#formatos">Formatos</a><a href="#fotos">Fotos</a>
        </nav>
        <a href="#contratar" className="bt bt--linha selo-l__cta">Contratar</a>
        <SeloRolagem />
      </header>

      {/* 1 · TOPO */}
      <section id="topo-lucco" className="topo-l" aria-labelledby="titulo-lucco">
        <div className="topo-l__midia">
          <picture>
            <source media="(min-aspect-ratio: 1/1)" srcSet={TOPO.desktop.capa} />
            <img className="topo-l__capa" src={TOPO.celular.capa} alt="" fetchPriority="high" />
          </picture>
          <VideoTopo desktop={TOPO.desktop} celular={TOPO.celular} />
          <span className="topo-l__veu" />
          <span className="topo-l__sol" />
        </div>
        <div className="topo-l__conteudo">
          <p className="rot-l topo-l__rot">DJ · Produtor · {LUCCO.base}</p>
          <h1 id="titulo-lucco" className="topo-l__logo"><LogoLucco id="ll-topo" titulo="LUCCO" /></h1>
          <p className="topo-l__generos">{LUCCO.generos.join('  ·  ')}</p>
          <p className="topo-l__frase">Do groove ao <em>pôr do sol</em>. Criador da SUN HYPE, com passagem por Ibiza.</p>
          <div className="topo-l__acoes">
            <BotaoOuvir faixa="set-sunrise" className="bt bt--cheio"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>Ouvir o SET SUNRISE</BotaoOuvir>
            <a href="#contratar" className="bt bt--linha">Contratar o LUCCO <Seta /></a>
          </div>
        </div>
        <a href="#som" className="topo-l__desce" aria-label="Descer para o som"><span /></a>
      </section>

      {/* 2 · O SOM */}
      <Revela como="section" id="som" className="secao-l som-l">
        <div className="caixa-l">
          <Cabeca rot="O som · aperte o play">Do groove ao <em>pôr do sol</em></Cabeca>
          <p className="intro-l rl">House, Tech House e Afro House com leitura de pista: groove para o fim de tarde, pegada para o pico da noite. O set completo e trechos ao vivo, direto da cabine.</p>
          <div className="rl"><PlayerLucco faixas={FAIXAS} /></div>
          <noscript><p className="intro-l"><a href={LUCCO.soundcloud.set}>Ouça o SET SUNRISE no SoundCloud</a></p></noscript>
        </div>
      </Revela>

      {/* 3 · QUEM É */}
      <Revela como="section" id="quem" className="secao-l quem-l">
        <div className="caixa-l quem-l__grade">
          <figure className="quem-l__foto rl"><Foto nome="bio" alt="LUCCO de jaqueta varsity preta e óculos escuros" sizes="(max-width: 899px) 100vw, 40vw" /></figure>
          <div className="quem-l__texto">
            <Cabeca rot="Biografia">Quem é <em>Lucco</em></Cabeca>
            {BIO.map((p, i) => <p key={i} className="rl">{p}</p>)}
            <ul className="numeros-l">
              {NUMEROS.map((n) => <li key={n.valor} className="rl"><b>{n.valor}</b><span>{n.rotulo}</span></li>)}
            </ul>
          </div>
        </div>
      </Revela>

      {/* 4 · PALCOS */}
      <Revela como="section" id="palcos" className="secao-l palcos-l">
        <div className="caixa-l">
          <Cabeca rot="Apresentações">Palcos &amp; <em>pistas</em></Cabeca>
          <div className="palcos-l__grade">
            <article className="ibiza-l rl">
              <Foto nome="vivo4" alt="LUCCO tocando com o sol de neon atrás" sizes="(max-width: 899px) 100vw, 50vw" />
              <div>
                <span className="rot-l">Ibiza · Espanha</span>
                <p>Levou o som até a capital mundial da música eletrônica: tocou no <b>Beach Club Ibiza</b> e participou da rádio da <b>Playabout Ibiza</b>.</p>
              </div>
            </article>
            <div className="palcos-l__lista">
              <ul className="lista-l">
                {PALCOS.map((p) => <li key={p.nome} className={`rl ${p.destaque ? 'destaque' : ''}`}><span>{p.nome}</span><span>{p.onde}</span></li>)}
              </ul>
              <div className="palcos-l__extra rl">
                <div><span className="rot-l">Cidades</span><p>{CIDADES.join('  ·  ')}</p></div>
                <div><span className="rot-l">Atende</span><p className="chips-l">{TIPOS_DE_EVENTO.map((t) => <span key={t} className="chip-l">{t}</span>)}</p></div>
              </div>
            </div>
          </div>
        </div>
        <Letreiro itens={PALCOS.map((p) => p.nome)} />
      </Revela>

      {/* 5 · SUN HYPE */}
      <Revela como="section" id="sunhype" className="secao-l sun-l">
        <div className="sun-l__foto"><Foto nome="praia1" alt="LUCCO de fone na praia, ao pôr do sol" sizes="(max-width: 899px) 100vw, 45vw" /></div>
        <div className="sun-l__texto">
          <Cabeca rot="Criada pelo Lucco">Sun <em>Hype</em></Cabeca>
          <p className="sun-l__lema rl">{SUN_HYPE.lema}</p>
          <blockquote className="sun-l__frase rl">“{SUN_HYPE.frase}”</blockquote>
          <p className="rl">{SUN_HYPE.texto}</p>
          <AteData fim={SUN_HYPE.proxima.fim}>
            <div className="sun-l__proxima rl">
              <span className="rot-l">Próxima edição</span>
              <div className="sun-l__cards">
                <div><b>III</b><span>edição</span></div>
                <div className="destaque"><b>29.11</b><span>{SUN_HYPE.proxima.horario}</span></div>
                <div><b>6</b><span>DJs no line-up</span></div>
              </div>
              <p><b>{SUN_HYPE.proxima.titulo}</b>: {SUN_HYPE.proxima.texto}</p>
            </div>
          </AteData>
          <a className="bt bt--linha rl" href={LUCCO.sunHype.url} target="_blank" rel="noopener noreferrer">@{LUCCO.sunHype.usuario} no Instagram <Seta /></a>
        </div>
      </Revela>

      {/* 6 · AO VIVO */}
      <Revela como="section" id="aovivo" className="secao-l">
        <div className="caixa-l">
          <Cabeca rot="Direto da cabine">Ao <em>vivo</em></Cabeca>
          <div className="rl"><VideosLucco videos={VIDEOS} /></div>
        </div>
      </Revela>

      {/* 7 · FORMATOS & RIDER */}
      <Revela como="section" id="formatos" className="secao-l formatos-l">
        <div className="caixa-l">
          <Cabeca rot="Contratação">Formatos de <em>set</em></Cabeca>
          <ol className="formatos-l__cards">
            {FORMATOS.map((f, i) => (
              <li key={f.nome} className={`rl ${f.destaque ? 'destaque' : ''}`} style={{ '--i': i } as React.CSSProperties}>
                <span className="formatos-l__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.nome}</h3>
                <p>{f.texto}</p>
                <span className="formatos-l__dur">{DURACAO}</span>
              </li>
            ))}
          </ol>
          <div className="formatos-l__base rl">
            <div className="rider-l">
              <details open>
                <summary><span className="rot-l">Rider técnico</span>Cabine &amp; técnica</summary>
                <ul className="lista-l">{RIDER.equipamento.map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}</ul>
              </details>
              <details>
                <summary><span className="rot-l">Camarim</span>Camarim &amp; logística</summary>
                <ul className="lista-l">{RIDER.camarim.map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}</ul>
              </details>
              <p className="rider-l__nota">Cidade-base: Aracaju (SE). Ajustes de cabine e camarim são combinados no fechamento de cada data.</p>
            </div>
            <div className="valores-l">
              <p className="valores-l__titulo">Valores <em>sob consulta</em></p>
              <p>Proposta personalizada para cada evento, com data, cidade, formato e estrutura.</p>
              <a href="#contratar" className="bt bt--cheio">Pedir proposta <Seta /></a>
            </div>
          </div>
        </div>
      </Revela>

      {/* 8 · FOTOS */}
      <Revela como="section" id="fotos" className="secao-l">
        <div className="caixa-l">
          <div className="fotos-l__topo">
            <Cabeca rot="Imprensa & divulgação">Fotos em <em>alta</em></Cabeca>
            <a className="bt bt--linha rl" href={LUCCO.drive} target="_blank" rel="noopener noreferrer">Baixar o pacote completo <Seta /></a>
          </div>
          <div className="rl"><GaleriaLucco fotos={GALERIA} /></div>
          <p className="fotos-l__credito">Uso livre para divulgação · fotos: {LUCCO.creditoFotos}</p>
        </div>
      </Revela>

      {/* 9 · CONTRATAR */}
      <Revela como="section" id="contratar" className="secao-l contratar-l">
        <div className="contratar-l__foto"><Foto nome="g5" alt="LUCCO de fone, sorrindo e fazendo o sinal do rock" sizes="(max-width: 1023px) 100vw, 45vw" /></div>
        <div className="contratar-l__texto">
          <Cabeca rot="Booking · Royals Entretenimento">Leve o <em>hype</em> para a sua pista</Cabeca>
          <p className="rl">Conte a data, a cidade e o formato. A Royals Entretenimento responde com a proposta e fecha a agenda do LUCCO.</p>
          <div className="rl"><FormContratar artista="DJ LUCCO" pagina="do LUCCO" formatos={['Warm-up', 'Set principal', 'Sunset', 'Closing', 'Ainda não sei']} formatoPadrao={1} instagramRoyals={PERFIL.usuario} /></div>
          <ul className="contatos-l rl">
            <li><span>Royals</span><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@{PERFIL.usuario}</a></li>
            <li><span>Artista</span><a href={LUCCO.instagram.url} target="_blank" rel="noopener noreferrer">@{LUCCO.instagram.usuario}</a></li>
            <li><span>SoundCloud</span><a href={LUCCO.soundcloud.url} target="_blank" rel="noopener noreferrer">LUCCOBR</a></li>
          </ul>
        </div>
      </Revela>

      <footer className="rodape-l">
        <LogoLucco id="ll-rodape" className="rodape-l__logo" />
        <div className="rodape-l__marcas">
          <span className="rot-l">Representação</span>
          <div>
            <Link href="/" aria-label="Royals Entretenimento">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" width={150} height={42} />
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/artistas/lucco/marca/royals-records.png" alt="Royals Records" width={150} height={50} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/artistas/lucco/marca/brandsquad.png" alt="BrandSquad" width={140} height={28} className="rodape-l__bs" />
          </div>
        </div>
        <p className="rodape-l__fim">© 2026 Royals Entretenimento · <Link href="/">Voltar ao site da Royals</Link></p>
      </footer>

      <div id="lucco-dock" className="dock-l"><BarraContratar /></div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
    </main>
  );
}
