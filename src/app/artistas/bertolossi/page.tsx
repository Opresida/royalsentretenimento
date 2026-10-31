import type { Metadata } from 'next';
import { Anton, Barlow, Barlow_Condensed, Sedgwick_Ave_Display } from 'next/font/google';
import Link from 'next/link';
import { Revela } from '@/components/Revela';
import { FormContratar } from '@/components/artistas/FormContratar';
import { AberturaBerto, PRE_PINTURA } from '@/components/bertolossi/AberturaBerto';
import { GaleriaBerto } from '@/components/bertolossi/GaleriaBerto';
import { BarraFecharData, BotaoOuvir, Letreiro, SeloRolagem, VideoTopo } from '@/components/bertolossi/Interativos';
import { LogoBerto } from '@/components/bertolossi/LogoBerto';
import { PlayerBerto } from '@/components/bertolossi/PlayerBerto';
import { VideosBerto } from '@/components/bertolossi/VideosBerto';
import {
  BERTO, CAPAS_HITS, CASAS, CONTRATAR, ESTADOS, ESTRADA, FAIXAS, foto, GALERIA, HISTORIA, HITS, LETREIRO, MAIS_DJS, MAIS_MCS,
  NUMEROS, PARCERIAS, QUEM, RIDER, SHOW, TOPO, VIDEOS,
} from '@/data/artistas/bertolossi';
import { INSTAGRAM_URL, PERFIL } from '@/lib/acervo';
import { BOOKING_CONTATOS, linkWhatsApp, SITE_URL } from '@/lib/site';
import './bertolossi.css';

// Página do artista DJ BERTOLOSSI (pedido do Humberto, 31/10/2026): a versão viva do presskit v2 aprovado, para o
// contratante do Amazonas ouvir, conhecer e fechar a data com a Royals pelo WhatsApp. Direção "noite no morro"
// (asfalto, poste de vapor de sódio, rosa do baile, lambe-lambe e pixo), própria do artista: nada do visual do LUCCO.
// Sem o menu e o rodapé da Royals; a Royals assina no selo do topo e no fim, com a Royals Records e a BrandSquad.
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--bf-anton', display: 'swap' });
const pixo = Sedgwick_Ave_Display({ subsets: ['latin'], weight: '400', variable: '--bf-pixo', display: 'swap' });
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--bf-barlow', display: 'swap' });
const cond = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--bf-cond', display: 'swap' });

const TITULO = 'DJ BERTOLOSSI · DJ e produtor de funk carioca';
const DESCRICAO = 'Cria do Morro do Martins, em São Gonçalo (RJ). A Vida Rasa 4-4-2 é dele. Ouça os sets, veja o show e o rider, e feche a data no Amazonas com a Royals Entretenimento.';
export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: '/artistas/bertolossi' },
  // a imagem vem de opengraph-image.jpg nesta pasta (fonte em pecas/og-bertolossi/og.html)
  openGraph: { title: 'DJ BERTOLOSSI · Royals Entretenimento', description: DESCRICAO, url: '/artistas/bertolossi', siteName: 'Royals Entretenimento', locale: 'pt_BR', type: 'profile' },
  twitter: { card: 'summary_large_image', title: 'DJ BERTOLOSSI · Royals Entretenimento', description: DESCRICAO },
};

const LD = {
  '@context': 'https://schema.org', '@type': 'Person', name: 'DJ BERTOLOSSI', alternateName: ['Bertolossi', 'DJ Bertolossi do Martins', 'Bertolossi Hitmaker'],
  jobTitle: 'DJ e produtor', url: `${SITE_URL}/artistas/bertolossi`, image: `${SITE_URL}/artistas/bertolossi/fotos/vivo-1051-1280.webp`,
  genre: ['Funk carioca'], homeLocation: { '@type': 'Place', name: 'São Gonçalo, RJ, Brasil' },
  sameAs: [BERTO.instagram.url, BERTO.soundcloud, BERTO.spotify],
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

/** Cabeçalho de seção: rótulo em pixo (a voz da rua) + o fato em Anton. */
function Cabeca({ pixo: rot, children, id }: { pixo: string; children: React.ReactNode; id?: string }) {
  return (
    <header className="bcab">
      <span className="bcab__pixo rl">{rot}</span>
      <h2 id={id} className="rl">{children}</h2>
    </header>
  );
}

/** Seta riscada a mão (anotação em pixo). */
const SetaPixo = ({ className = '', d = 'M78,8 C55,2 25,10 6,34', ponta = 'M4,22 L5,36 L18,33' }: { className?: string; d?: string; ponta?: string }) => (
  <svg className={`brisco ${className}`} viewBox="0 0 80 46" aria-hidden="true"><path pathLength={1} d={d} /><path pathLength={1} d={ponta} /></svg>
);
const Seta = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
const Lambe = ({ k, cor = 'papel', children, className = '', style }: { k: string; cor?: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`blambe blambe--${cor} rl ${className}`} style={style}><span className="blambe__k">{k}</span>{children}</div>
);

export default function PaginaBertolossi() {
  return (
    <main className={`berto ${anton.variable} ${pixo.variable} ${barlow.variable} ${cond.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: PRE_PINTURA }} />
      <noscript><style>{'.btopo .blogo__tinta{clip-path:none!important}.btopo .blogo__sub path{opacity:1!important;transform:none!important}.btopo__pixo,.btopo__frase,.btopo__sub,.btopo__acoes,.btopo__fichas{opacity:1!important}.berto .revela .rl{opacity:1!important;transform:none!important}'}</style></noscript>
      <AberturaBerto />

      {/* selo da Royals + atalhos */}
      <header className="bselo">
        <Link href="/" className="bselo__royals" aria-label="Royals Entretenimento Amazonas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/royals-gold-transparent.svg" alt="" width={120} height={34} />
          <span>Amazonas</span>
        </Link>
        <nav aria-label="Seções" className="bselo__nav">
          <a href="#som">O som</a><a href="#parcerias">Parcerias</a><a href="#palcos">Palcos</a><a href="#aovivo">Ao vivo</a><a href="#rider">Rider</a><a href="#fotos">Fotos</a>
        </nav>
        <a href="#fechar" className="bt bt--linha bselo__cta">Fechar data</a>
        <SeloRolagem />
      </header>

      {/* 1 · TOPO */}
      <section id="topo-berto" className="btopo" aria-labelledby="titulo-berto">
        <div className="btopo__midia">
          <picture>
            <source media="(min-aspect-ratio: 1/1)" srcSet={TOPO.desktop.capa} />
            <img className="btopo__capa" src={TOPO.celular.capa} alt="" fetchPriority="high" />
          </picture>
          <VideoTopo desktop={TOPO.desktop} celular={TOPO.celular} />
          <span className="btopo__veu" />
          <span className="btopo__poste" />
          <span className="retic" />
        </div>
        <span className="btag btopo__tag" aria-hidden="true">Martins 021</span>
        <div className="btopo__conteudo">
          <p className="btopo__pixo">DJ e produtor</p>
          <h1 id="titulo-berto" className="btopo__logo"><LogoBerto id="bl-topo" titulo="DJ BERTOLOSSI" /></h1>
          <p className="btopo__frase">A Vida Rasa 4-4-2 <em>é dele.</em></p>
          <p className="btopo__sub">Bertolossi é DJ e produtor lá do <b>Morro do Martins</b>, em São Gonçalo (RJ).</p>
          <div className="btopo__acoes">
            <BotaoOuvir faixa="sequencia-antigas-2" className="bt bt--cheio"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>Ouvir o som dele</BotaoOuvir>
            <a href="#fechar" className="bt bt--linha">Fechar data <Seta /></a>
          </div>
          <ul className="btopo__fichas">
            <li><b>82 mil</b> ouvintes por mês no Spotify</li>
            <li>Já tocou em <b>Londres</b> e nos <b>EUA</b></li>
            <li>Manaus · <b>O.C.U.L.T.O 2026</b></li>
          </ul>
        </div>
      </section>

      {/* 2 · O SOM */}
      <Revela como="section" id="som" className="bsecao bsom">
        <div className="bcaixa">
          <Cabeca pixo="aperta o play">Os sets que ele <em>solta</em> no SoundCloud</Cabeca>
          <p className="bintro rl">Quatro faixas do SoundCloud dele e, depois, o som de cinco vídeos tocando ao vivo.</p>
          <div className="rl"><PlayerBerto faixas={FAIXAS} /></div>
          <noscript><p className="bintro"><a href={BERTO.soundcloud}>Ouça no SoundCloud do Bertolossi</a></p></noscript>
        </div>
      </Revela>

      {/* 3 · QUEM É */}
      <Revela como="section" id="quem" className="bsecao bquem">
        <div className="bcaixa bquem__grade">
          <figure className="bquem__foto rl">
            <Foto nome="casa-28" alt="Bertolossi de branco sorrindo no palco, com a casa cheia atrás" sizes="(max-width: 899px) 100vw, 42vw" />
            <span className="badesivo badesivo--rosa">ao vivo</span>
            <span className="btag btag--poste bquem__tag" aria-hidden="true">cria do Martins</span>
          </figure>
          <div className="bquem__texto">
            <Cabeca pixo="quem é o cara">Matheus tem 29 anos e toca desde <em>2014</em>.</Cabeca>
            <p className="rl">{QUEM.texto}</p>
            <div className="bquem__lambes">
              <Lambe k="Hitmaker" style={{ '--r': '-2deg' } as React.CSSProperties}><p>{QUEM.hitmaker}</p></Lambe>
              <Lambe k="Apelão do Acid Pro" cor="escuro" style={{ '--r': '1.6deg' } as React.CSSProperties}><p>{QUEM.acidPro}</p></Lambe>
            </div>
          </div>
        </div>
      </Revela>

      {/* 4 · NÚMEROS */}
      <Revela como="section" id="numeros" className="bsecao bnum">
        <div className="bnum__fundo"><Foto nome="g-light-54" alt="" sizes="100vw" /></div>
        <div className="bcaixa">
          <Cabeca pixo={`contagem de ${NUMEROS.data.slice(0, 5).replace('.', '/')}`}>A Vida Rasa passou de <em>12 milhões</em> de plays.</Cabeca>
          <p className="banota bnum__anota rl">somando todas<br />as plataformas<SetaPixo /></p>
          <div className="bnum__parede">
            <Lambe k="Vida Rasa 4-4-2" cor="poste" className="bnum__grande" style={{ '--r': '-1.5deg' } as React.CSSProperties}>
              <strong className="bnum__circ">{NUMEROS.vidaRasaSpotify}<svg className="brisco brisco--circ" viewBox="0 0 300 90" aria-hidden="true"><path pathLength={1} d="M20,48 C40,8 250,0 285,36 C300,62 220,86 130,84 C50,82 4,70 14,40 C22,20 80,12 120,10" /></svg></strong>
              <p>plays só no Spotify, desde 2023.</p>
            </Lambe>
            {NUMEROS.cartazes.map((c, i) => (
              <Lambe key={c.rot} k={c.rot} cor={c.cor} style={{ '--r': `${[2, -2.5, 1.5, -1][i]}deg`, '--i': i + 1 } as React.CSSProperties}>
                <strong>{c.valor}</strong><p>{c.texto}</p>
              </Lambe>
            ))}
          </div>
          <p className="banota bnum__rodape rl">{NUMEROS.anota}</p>
          <p className="bnum__data rl">números conferidos em {NUMEROS.data}</p>
        </div>
      </Revela>

      {/* 5 · PARCERIAS */}
      <Revela como="section" id="parcerias" className="bsecao bparc">
        <div className="bcaixa">
          <Cabeca pixo="quem já gravou com ele">Já gravou com a <em>MC Carol</em>, com o <em>Sodré</em> e com o <em>Kevin O Chris</em>.</Cabeca>
          <div className="bparc__grade">
            {PARCERIAS.map((p, i) => (
              <article key={p.nome} className={`bparc__item rl bparc__item--${p.cor}`} style={{ '--i': i } as React.CSSProperties}>
                <div className="bparc__capas">
                  {p.faixas.map((f, k) => (
                    <a key={f.titulo} className="bcapa" href={f.url} target="_blank" rel="noopener noreferrer" style={{ '--r': `${k ? 5 : -4}deg` } as React.CSSProperties} aria-label={`Ouvir ${f.titulo} no Spotify`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.capa} alt={`Capa de ${f.titulo}`} width={480} height={480} loading="lazy" />
                    </a>
                  ))}
                  {p.selo && <span className="badesivo badesivo--ouro bparc__selo">{p.selo}</span>}
                </div>
                <h3 className="bparc__nome">{p.nome}</h3>
                {p.texto.map((t, k) => <p key={k}>{t}</p>)}
              </article>
            ))}
          </div>
          <div className="bparc__mais rl">
            <div><span className="bpx-rot">e tem mais</span><p>{MAIS_MCS.join(' · ')}</p></div>
            <div><span className="bpx-rot">nas pick-ups</span><p>{MAIS_DJS.join(' · ')}</p></div>
          </div>
        </div>
      </Revela>

      {/* 6 · HITS */}
      <Revela como="section" id="hits" className="bsecao bhits">
        <div className="bcaixa bhits__grade">
          <div>
            <Cabeca pixo="os hits dele">Dez faixas, todas produzidas <em>por ele</em>.</Cabeca>
            <ol className="bhits__lista">
              {HITS.map((h, i) => (
                <li key={h.titulo} className={`rl ${h.destaque ? 'destaque' : ''}`} style={{ '--i': i } as React.CSSProperties}>
                  <span className="bhits__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="bhits__t">{h.titulo}</span>
                  {h.info && <small>{h.info}</small>}
                </li>
              ))}
            </ol>
            <p className="bnum__data rl">ordem escolhida pela equipe dele</p>
          </div>
          <div className="bhits__lado">
            <div className="bhits__capas">
              {CAPAS_HITS.map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={c.capa} className="bcapa rl" src={c.capa} alt={c.alt} width={480} height={480} loading="lazy" style={{ '--r': `${[-4, 5, 3, -3][i]}deg`, '--i': i } as React.CSSProperties} />
              ))}
            </div>
            <p className="banota rl">a nº 6 da lista:<br />9,78 milhões só no Spotify</p>
            <div className="bhits__links rl">
              <a className="bt bt--linha" href={BERTO.spotify} target="_blank" rel="noopener noreferrer">Spotify <Seta /></a>
              <a className="bt bt--linha" href={BERTO.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud <Seta /></a>
            </div>
          </div>
        </div>
      </Revela>

      {/* 7 · A HISTÓRIA */}
      <Revela como="section" id="historia" className="bsecao bhist">
        <div className="bhist__foto">
          <Foto nome="bday-20" alt="Vista de drone do Morro do Martins à noite, com a quadra lotada e fogos" sizes="(max-width: 899px) 100vw, 50vw" />
          <span className="btag bhist__tag" aria-hidden="true">Martins</span>
          <span className="btag btag--poste bhist__sg" aria-hidden="true">SG</span>
        </div>
        <div className="bhist__texto">
          <Cabeca pixo="São Gonçalo">{HISTORIA.titulo[0]} {HISTORIA.titulo[1]} <em>{HISTORIA.titulo[2]}</em></Cabeca>
          {HISTORIA.textos.map((t, i) => <p key={i} className="rl">{t}</p>)}
          <div className="bhist__coladas rl">
            <figure className="bcolada" style={{ '--r': '-2deg' } as React.CSSProperties}><Foto nome="vivo-1053-pb" alt="Bertolossi cantando no microfone, em preto e branco" sizes="(max-width: 899px) 50vw, 22vw" /></figure>
            <figure className="bcolada" style={{ '--r': '3deg' } as React.CSSProperties}><Foto nome="vivo-1050" alt="Bertolossi cantando de boné na cabine" sizes="(max-width: 899px) 50vw, 22vw" /></figure>
          </div>
        </div>
      </Revela>

      {/* 8 · PALCOS */}
      <Revela como="section" id="palcos" className="bsecao bpalcos">
        <div className="bcaixa">
          <Cabeca pixo="onde ele já tocou">Já tocou em seis estados do Brasil, em <em>Londres</em> e nos <em>EUA</em>.</Cabeca>
          <div className="bpalcos__grade">
            <div className="rl">
              <span className="bpx-rot">a estrada</span>
              <ol className="bpalcos__estrada">
                {ESTRADA.map((e) => <li key={e.ano}><b>{e.ano}</b><span>{e.texto}</span></li>)}
              </ol>
            </div>
            <div className="rl">
              <span className="bpx-rot">as casas</span>
              <ul className="bpalcos__casas">
                {CASAS.map((c) => <li key={c.nome} className={c.destaque ? 'destaque' : ''}><span>{c.nome}</span><span>{c.onde}</span></li>)}
              </ul>
              <span className="bpx-rot">os estados</span>
              <p className="bpalcos__estados">{ESTADOS.map((e, i) => <span key={e} className={e === 'Maranhão' ? 'mar' : ''}>{e}{i < ESTADOS.length - 1 ? ' · ' : ''}</span>)}</p>
              <p className="bpalcos__nota">Macapá, São Luís e Manaus. Fora do Brasil: Londres, Boston e Filadélfia.</p>
            </div>
            <figure className="bpalcos__foto rl">
              <Foto nome="casa-84" alt="Bertolossi em cima da cabine com o público acendendo os celulares" sizes="(max-width: 899px) 100vw, 30vw" />
              <span className="badesivo badesivo--ouro">lotado</span>
            </figure>
          </div>
          <Lambe k="pela Royals" cor="rosa" className="bpalcos__royals" style={{ '--r': '-1deg' } as React.CSSProperties}>
            <p>Em Manaus ele já tocou pela Royals: <b>O.C.U.L.T.O</b>, no Allnight, dia <b>11 de outubro de 2026</b>.</p>
          </Lambe>
        </div>
        <Letreiro itens={LETREIRO} />
      </Revela>

      {/* 9 · AO VIVO */}
      <Revela como="section" id="aovivo" className="bsecao">
        <div className="bcaixa">
          <Cabeca pixo="direto do palco">Ele <em>ao vivo</em></Cabeca>
          <p className="bintro rl">Toca com som. Aperta em cima.</p>
          <div className="rl"><VideosBerto videos={VIDEOS} /></div>
        </div>
      </Revela>

      {/* 10 · O SET + RIDER */}
      <Revela como="section" id="rider" className="bsecao bset">
        <div className="bcaixa">
          <Cabeca pixo="o set">Set solo de 45 minutos a 1 hora, na <em>XDJ-RX2 dele</em>.</Cabeca>
          <div className="bset__grade">
            <div className="rl">
              <p className="bset__texto">{SHOW.texto}</p>
              <p className="bset__chips">{SHOW.estilos.map((e) => <span key={e} className="bchip">{e}</span>)}</p>
              <span className="bpx-rot">onde ele toca</span>
              <p>{SHOW.onde}</p>
              <Lambe k="versão light" cor="ouro" className="bset__light" style={{ '--r': '-.8deg' } as React.CSSProperties}><p>{SHOW.light}</p></Lambe>
            </div>
            <div className="bset__rider rl">
              <span className="bpx-rot">o que ele precisa</span>
              <p className="bset__frase">Ele leva a XDJ-RX2. A casa entra com o resto da lista.</p>
              <details open>
                <summary>Técnico</summary>
                <ul>{RIDER.tecnico.map((r) => <li key={r}>{r}</li>)}</ul>
              </details>
              <details>
                <summary>Se der</summary>
                <ul>{RIDER.seDer.map((r) => <li key={r}>{r}</li>)}</ul>
              </details>
              <details>
                <summary>Camarim</summary>
                <ul>{RIDER.camarim.map((r) => <li key={r}>{r}</li>)}</ul>
              </details>
              <details>
                <summary>Fora do Rio</summary>
                <p>{RIDER.foraDoRio}</p>
              </details>
              <Lambe k="cachê" cor="poste" className="bset__cache" style={{ '--r': '-1.5deg' } as React.CSSProperties}><strong>Sob consulta com a Royals</strong></Lambe>
            </div>
          </div>
        </div>
      </Revela>

      {/* 11 · FOTOS */}
      <Revela como="section" id="fotos" className="bsecao">
        <div className="bcaixa">
          <div className="bfotos__topo">
            <Cabeca pixo="foto pra divulgar">O pacote completo tá no Drive: fotos, logo e vídeos.</Cabeca>
            <a className="bt bt--cheio rl" href={BERTO.drive} target="_blank" rel="noopener noreferrer">Baixar o pacote <Seta /></a>
          </div>
          <div className="rl"><GaleriaBerto fotos={GALERIA} /></div>
          <p className="bnum__data">ao vivo: @maltinho · estúdio: @menegoy · ensaio digital: BrandSquad</p>
        </div>
      </Revela>

      {/* 12 · FECHAR DATA */}
      <Revela como="section" id="fechar" className="bsecao bfechar">
        <div className="bfechar__foto">
          <Foto nome="casa-108" alt="Público com os celulares acesos e faíscas no palco" sizes="(max-width: 1023px) 100vw, 45vw" />
          <span className="btag btag--rosa bfechar__tag" aria-hidden="true">Royals</span>
          <span className="btag bfechar__am" aria-hidden="true">Manaus · AM</span>
        </div>
        <div className="bfechar__texto">
          <Cabeca pixo="contato">{CONTRATAR.titulo[0]} <em>{CONTRATAR.titulo[1]}</em></Cabeca>
          <p className="rl">{CONTRATAR.texto}</p>
          <div className="rl">
            <FormContratar artista="DJ BERTOLOSSI" pagina="do Bertolossi" formatos={CONTRATAR.formatos} instagramRoyals={PERFIL.usuario} classe="bform"
              botao={{ whatsapp: 'Mandar no WhatsApp da Royals', instagram: 'Mandar no direct da Royals' }} />
          </div>
          <ul className="bcontatos rl">
            {BOOKING_CONTATOS.map((c) => (
              <li key={c.nome}><span>WhatsApp</span><a href={linkWhatsApp(c.whatsapp, 'Olá, Royals. Quero contratar o DJ BERTOLOSSI.')} target="_blank" rel="noopener noreferrer">{c.nome} · {c.exibido}</a></li>
            ))}
            <li><span>Instagram</span><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@{PERFIL.usuario}</a></li>
            <li><span>Artista</span><a href={BERTO.instagram.url} target="_blank" rel="noopener noreferrer">@{BERTO.instagram.usuario}</a></li>
          </ul>
        </div>
      </Revela>

      <footer className="brodape">
        <LogoBerto id="bl-rodape" className="brodape__logo" estatica />
        <div className="brodape__marcas">
          <span className="bpx-rot">quem assina</span>
          <div>
            <Link href="/" aria-label="Royals Entretenimento">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" width={150} height={42} />
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/artistas/bertolossi/marca/royals-records.png" alt="Royals Records" width={150} height={50} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/artistas/bertolossi/marca/brandsquad.png" alt="BrandSquad" width={140} height={28} className="brodape__bs" />
          </div>
        </div>
        <p className="brodape__fim">© 2026 Royals Entretenimento · <Link href="/">Voltar ao site da Royals</Link></p>
      </footer>

      <div id="berto-dock" className="bdock"><BarraFecharData /></div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
    </main>
  );
}
