import { agora } from '@/lib/financeiro/dinheiro';
import type { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { AoVivo } from '@/components/financeiro/AoVivo';
import { Clipe } from '@/components/financeiro/icones';
import { QuadroFontes } from '@/components/financeiro/QuadroFontes';
import { fontesDoEvento, STATUS_EVENTO, TAXA_ROTULO } from '@/lib/financeiro/calculo';
import { lerEvento, socioPorToken } from '@/lib/financeiro/dados';
import { dataCurta, dataLonga, pct, reais } from '@/lib/financeiro/dinheiro';
import '../../financeiro/financeiro.css';

export const dynamic = 'force-dynamic';

// Área do sócio: abre pelo link pessoal, sem senha, só leitura. A OG é a do evento (opengraph-image.tsx ao lado)
// e não mostra nenhum número: a prévia do WhatsApp não pode vazar o financeiro.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const s = await socioPorToken((await params).token);
  const ev = s && s.linkAtivo ? (await lerEvento(s.eventoId))?.ev : null;
  const titulo = ev ? `Prestação de contas · ${ev.nome}` : 'Área do sócio · Royals';
  const desc = 'Acompanhe o financeiro do evento em tempo real. Uma produção ROYALS.';
  return {
    title: { absolute: titulo }, description: desc,
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
    openGraph: { title: titulo, description: desc, siteName: 'Royals Entretenimento', locale: 'pt_BR', type: 'website' },
    twitter: { card: 'summary_large_image', title: titulo, description: desc },
  };
}

function Fora({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="fin"><main className="fin-entrar"><div className="fin-entrar__caixa">
      <img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" />
      <h1 className="fin-titulo" style={{ fontSize: 26 }}>{titulo}</h1>
      <p className="fin-sub">{texto}</p>
    </div></main></div>
  );
}

export default async function AreaDoSocio({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ ver?: string }> }) {
  const { token } = await params;
  const ver = (await searchParams).ver;
  const s = await socioPorToken(token);
  if (!s) return <Fora titulo="Link não encontrado" texto="Confira se o link está completo ou peça um novo à Royals." />;
  if (!s.linkAtivo) return <Fora titulo="Link desativado" texto="Este acesso foi desativado pela Royals. Se precisar, peça um link novo." />;
  const d = await lerEvento(s.eventoId);
  if (!d) return <Fora titulo="Evento não encontrado" texto="Fale com a Royals." />;

  const db = await getDb();
  await db.update(schema.finSocios).set({ ultimoAcesso: new Date() }).where(eq(schema.finSocios.id, s.id));

  const { ev, lancs, conta: c } = d;
  const eu = c.divisao.find((x) => x.id === s.id)!;
  const filtro = ver === 'custos' ? 'custo' : ver === 'receitas' ? 'receita' : null;
  const lista = filtro ? lancs.filter((l) => l.tipo === filtro) : lancs;
  const fechado = ev.status === 'fechado';
  const primeiro = s.nome.trim().split(/\s+/)[0];

  return (
    <div className="fin">
      <main className="fin-socio-pag">
        <div className="fin-socio-topo"><img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" /><span className="fin-rot">Área do sócio</span></div>
        <div className="fin-socio-grade">
          <div>
            <h1 className="fin-titulo" style={{ fontSize: 'clamp(28px, 7vw, 44px)' }}>{ev.nome}</h1>
            <div className="fin-ev__linha" style={{ marginTop: 10 }}>
              <span className={`fin-selo fin-selo--${ev.status}`}>{STATUS_EVENTO[ev.status]}</span>
              {ev.data ? <span>{dataLonga(ev.data)}</span> : null}
              <AoVivo em={agora()} />
            </div>
            <p style={{ marginTop: 22, fontSize: 20, color: 'var(--text-primary)' }}>Olá, {primeiro}</p>

            <div className="fin-voce">
              <div className="fin-voce__dois">
                <div><span className="fin-rot">Seu aporte</span><b>{reais(s.aporte)}</b></div>
                <div style={{ textAlign: 'right' }}><span className="fin-rot">Sua cota</span><b>{pct(s.cotaBp)}</b></div>
              </div>
              <div className="fin-voce__recebe">
                <span className="fin-rot">{fechado ? 'Você recebe' : 'Você recebe (previsão)'}</span>
                <b className={eu.total >= s.aporte ? 'verde' : 'vermelho'}>{reais(eu.total)}</b>
                <small>aporte {reais(s.aporte)} {eu.lucro >= 0 ? '+ lucro' : '− prejuízo'} {reais(Math.abs(eu.lucro))}</small>
              </div>
            </div>

            <div className="fin-tres">
              <div><span className="fin-rot">Receitas</span><b className="verde">{reais(c.receitas, { inteiro: true })}</b></div>
              <div><span className="fin-rot">Custos</span><b className="vermelho">{reais(c.custos, { inteiro: true })}</b></div>
              <div><span className="fin-rot">Lucro</span><b className={c.lucro >= 0 ? 'verde' : 'vermelho'}>{reais(c.lucro, { sinal: true, inteiro: true })}</b></div>
            </div>
            {c.taxa ? <p className="fin-sub" style={{ fontSize: 13, marginTop: -12, marginBottom: 20 }}>Lucro já descontada a taxa de produção da Royals: {reais(c.taxa)} ({ev.taxaTipo === 'fixo' ? 'valor fixo' : `${pct(ev.taxaValor)} ${TAXA_ROTULO[ev.taxaTipo].replace('% ', '')}`}).</p> : null}
            <QuadroFontes f={fontesDoEvento(lancs)} />
            {!fechado && (c.custosPendentes || c.receitasPendentes) ? <p className="fin-aviso fin-aviso--ambar" style={{ marginBottom: 20, fontSize: 13 }}>Previsão: ainda há {c.custosPendentes ? `${reais(c.custosPendentes)} a pagar` : ''}{c.custosPendentes && c.receitasPendentes ? ' e ' : ''}{c.receitasPendentes ? `${reais(c.receitasPendentes)} a receber` : ''}. Os valores mudam até o fechamento.</p> : null}
          </div>

          <section className="fin-bloco">
            <div className="fin-bloco__cab">
              <h2 className="fin-h2">Lançamentos</h2>
              <div className="fin-filtros">
                <Link href={`/socio/${token}`} aria-current={!filtro ? 'page' : undefined}>Todos</Link>
                <Link href={`/socio/${token}?ver=custos`} aria-current={filtro === 'custo' ? 'page' : undefined}>Custos</Link>
                <Link href={`/socio/${token}?ver=receitas`} aria-current={filtro === 'receita' ? 'page' : undefined}>Receitas</Link>
              </div>
            </div>
            {lista.length ? (
              <ul className="fin-lista">
                {lista.map((l) => (
                  <li key={l.id} className="fin-item" style={{ gridTemplateColumns: '1fr auto' }}>
                    <span className="fin-item__desc">{l.descricao}</span>
                    <span className={`fin-item__valor ${l.tipo === 'receita' ? 'verde' : 'vermelho'}`}>{l.tipo === 'receita' ? '+ ' : '− '}{reais(l.valor)}</span>
                    <span className="fin-item__meta" style={{ display: 'flex' }}>
                      <span>{dataCurta(l.data)}</span><span className="fin-cat">{l.categoria}</span>
                      {!l.quitado ? <span className="ambar">{l.tipo === 'custo' ? 'A pagar' : 'A receber'}</span> : null}
                      {l.comprovanteId && l.mostrarAoSocio ? <a className="fin-clip ouro" href={`/socio/${token}/comprovante/${l.id}`} target="_blank" rel="noreferrer"><Clipe />Ver comprovante</a> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="fin-vazio">Nada lançado ainda.</p>}
          </section>
        </div>
        <p className="fin-rodape-socio">Somente leitura · link pessoal, não compartilhe · Uma produção ROYALS</p>
      </main>
    </div>
  );
}
