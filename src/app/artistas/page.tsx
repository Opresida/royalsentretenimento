/* eslint-disable @next/next/no-img-element -- logos em SVG e fotos já em webp nas larguras certas (srcSet próprio) */
import type { Metadata } from 'next';
import { Botao } from '@/components/Botao';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { Revela } from '@/components/Revela';
import { FormContratar } from '@/components/artistas/FormContratar';
import { LoopArtista, PlayerTrechos, VideoCase } from '@/components/casting/Casting';
import { CASTING, ROYALS_RECORDS } from '@/data/casting';
import { PERFIL } from '@/lib/acervo';
import { BOOKING_CONTATOS, linkWhatsApp, WHATSAPP_BOOKING } from '@/lib/site';
import './artistas.css';

// /artistas · página geral do casting da Royals Entretenimento e da Royals Records (pedido do Humberto, 03/11/2026).
// Porta de entrada para as páginas de cada artista: a gravadora, cada artista com a cor dele (vídeo de topo, números,
// trechos ao vivo, o vídeo-case de 1 minuto da BrandSquad, palcos, fotos) e a contratação pelo WhatsApp oficial.
const DESCRICAO = 'Os artistas da Royals Records e da Royals Entretenimento: DJ LUCCO e DJ BERTOLOSSI. Ouça os sets, veja os vídeos e feche data no Amazonas com a Royals.';
export const metadata: Metadata = {
  title: 'Artistas',
  description: DESCRICAO,
  alternates: { canonical: '/artistas' },
  // a imagem vem de opengraph-image.jpg nesta pasta (pecas/og-casting)
  openGraph: { title: 'Artistas · Royals Records', description: DESCRICAO, url: '/artistas', siteName: 'Royals Entretenimento', locale: 'pt_BR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Artistas · Royals Records', description: DESCRICAO },
};

const srcSet = (base: string, larguras: number[]) => larguras.map((l) => `${base}-${l}.webp ${l}w`).join(', ');
const zap = (nome: string) => (WHATSAPP_BOOKING ? linkWhatsApp(WHATSAPP_BOOKING, `Olá, Royals. Quero saber de data do ${nome} no Amazonas.\n\n(enviado pela página /artistas no site da Royals)`) : null);

export default function Artistas() {
  return (
    <main className="pagina-topo casting">
      {/* abertura: o casting e as portas de cada artista */}
      <section className="secao casting-topo" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Casting · Royals Records" titulo="Os artistas da Royals" descricao={ROYALS_RECORDS.linhaFina} />
          <div className="casting-portas">
            {CASTING.map((a) => (
              <Revela key={a.slug} className="casting-porta">
                <a href={`#${a.slug}`} className="casting-porta__link" style={{ ['--a-fundo' as string]: a.cor.fundo, ['--a-tinta' as string]: a.cor.tinta, ['--a-destaque' as string]: a.cor.destaque }}>
                  <LoopArtista desktop={a.topo.desktop} celular={a.topo.celular} alt={`${a.nome} ao vivo`} />
                  <span className="casting-porta__veu" aria-hidden="true" />
                  <span className="casting-porta__miolo">
                    <img src={a.logo} alt={a.nome} className="casting-porta__logo" />
                    <span className="casting-porta__generos">{a.generos}</span>
                    <span className="casting-porta__base">{a.base}</span>
                    <span className="casting-porta__ir">Conhecer <span aria-hidden="true">↓</span></span>
                  </span>
                </a>
              </Revela>
            ))}
          </div>
        </div>
      </section>

      {/* a gravadora */}
      <section className="secao secao--fio casting-records">
        <div className="container casting-records__grade">
          <Revela className="casting-records__marca">
            <img src="/artistas/lucco/marca/royals-records.png" alt="Royals Records" width={480} height={159} />
            <span className="rotulo-texto">Gravadora do grupo Royals</span>
          </Revela>
          <Revela className="casting-records__texto">
            {ROYALS_RECORDS.textos.map((t) => <p key={t.slice(0, 20)} className="lead">{t}</p>)}
            <ul className="casting-records__numeros">
              {ROYALS_RECORDS.numeros.map((n) => <li key={n.rotulo}><b>{n.valor}</b><span>{n.rotulo}</span></li>)}
            </ul>
          </Revela>
        </div>
      </section>

      {/* um bloco por artista, na cor dele */}
      {CASTING.map((a, i) => {
        const link = zap(a.nome);
        return (
          <section key={a.slug} id={a.slug} className="casting-artista" style={{ ['--a-fundo' as string]: a.cor.fundo, ['--a-tinta' as string]: a.cor.tinta, ['--a-destaque' as string]: a.cor.destaque, ['--a-fio' as string]: a.cor.fio }}>
            <div className="container">
              <Revela className="casting-artista__cab">
                <span className="casting-artista__n">{String(i + 1).padStart(2, '0')} / {String(CASTING.length).padStart(2, '0')}</span>
                <img src={a.logo} alt={a.nome} className="casting-artista__logo" />
                <p className="casting-artista__meta">{a.base} · {a.generos}</p>
                <h2 className="casting-artista__frase">{a.frase[0]} <em>{a.frase[1]}</em></h2>
                <p className="casting-artista__resumo">{a.resumo}</p>
              </Revela>

              <ul className="casting-artista__numeros">
                {a.numeros.map((n) => <li key={n.rotulo}><b>{n.valor}</b><span>{n.rotulo}</span></li>)}
              </ul>

              <div className="casting-artista__midia">
                <div className="casting-artista__ouvir">
                  <h3 className="casting-artista__h3">Ouça ao vivo</h3>
                  <PlayerTrechos trechos={a.trechos} artista={a.slug} />
                  <a className="casting-artista__set" href={a.set} target="_blank" rel="noopener noreferrer">Ouvir o set completo no SoundCloud <span aria-hidden="true">↗</span></a>

                  <div className="casting-artista__palcos">
                    <h3 className="casting-artista__h3">{a.palcos.titulo}</h3>
                    <ul className="chips">{a.palcos.itens.map((p) => <li key={p}>{p}</li>)}</ul>
                    <h3 className="casting-artista__h3">{a.extra.titulo}</h3>
                    <p>{a.extra.texto}</p>
                    {a.extra.itens ? <ul className="chips chips--destaque">{a.extra.itens.map((p) => <li key={p}>{p}</li>)}</ul> : null}
                  </div>
                </div>
                <div className="casting-artista__case">
                  <h3 className="casting-artista__h3">Em 1 minuto</h3>
                  <VideoCase mp4={a.videoCase.mp4} capa={a.videoCase.capa} artista={a.slug} />
                  <p className="casting-artista__credito">Vídeo de apresentação feito pela BrandSquad</p>
                </div>
              </div>

              <ul className="casting-artista__fotos">
                {a.galeria.map((f) => (
                  <li key={f.base}>
                    <img src={`${f.base}-640.webp`} srcSet={srcSet(f.base, f.larguras.filter((l) => l <= 1280))} sizes="(max-width: 700px) 50vw, 33vw" alt={f.alt} width={f.w} height={f.h} loading="lazy" />
                    {f.credito ? <span>{f.credito}</span> : null}
                  </li>
                ))}
              </ul>

              <div className="casting-artista__acoes">
                <Botao href={`/artistas/${a.slug}`} variante="secundario">Página completa do {a.nome}</Botao>
                {link ? <Botao href={link} externo>Fechar data no WhatsApp</Botao> : null}
                <Botao href={a.instagram.url} externo variante="fantasma">@{a.instagram.usuario}</Botao>
              </div>
            </div>
          </section>
        );
      })}

      {/* contratação */}
      <section className="secao casting-contratar" id="contratar">
        <div className="container casting-contratar__grade">
          <div>
            <CabecalhoSecao olho="Contratação" titulo="Pra fechar data no Amazonas, é com a Royals." />
            <ol className="casting-passos">
              <li><b>01</b><span>Você manda a data, a cidade e o local do evento.</span></li>
              <li><b>02</b><span>A Royals responde com a agenda do artista e o formato do set.</span></li>
              <li><b>03</b><span>Tudo certo, o contrato sai no papel timbrado da Royals.</span></li>
            </ol>
            <p className="casting-contratar__zap">WhatsApp da Royals: <b>{BOOKING_CONTATOS[0].exibido}</b></p>
          </div>
          <Revela className="casting-contratar__form">
            <FormContratar
              artista="artista do casting" pagina="/artistas" escolheArtista classe="cform"
              formatos={[...CASTING.map((a) => a.nome), 'Ainda não sei']} formatoPadrao={CASTING.length}
              instagramRoyals={PERFIL.usuario}
              rotulos={{ formato: 'Artista' }}
            />
          </Revela>
        </div>
      </section>

      <section className="casting-marcas" aria-label="Quem assina">
        <div className="container casting-marcas__linha">
          <img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" className="casting-marcas__royals" />
          <span aria-hidden="true" />
          <img src="/artistas/lucco/marca/royals-records.png" alt="Royals Records" className="casting-marcas__records" />
          <span aria-hidden="true" />
          <img src="/artistas/lucco/marca/brandsquad.png" alt="BrandSquad" className="casting-marcas__bs" />
        </div>
      </section>
    </main>
  );
}
