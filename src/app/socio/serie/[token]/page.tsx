import { agora } from '@/lib/financeiro/dinheiro';
import type { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { AoVivo } from '@/components/financeiro/AoVivo';
import { STATUS_EVENTO } from '@/lib/financeiro/calculo';
import { edicoesDoSocioDaSerie, lerSerieCurta, serieSocioPorToken } from '@/lib/financeiro/dados';
import { dataLonga, pct, reais } from '@/lib/financeiro/dinheiro';
import { diaDaSemana, FREQUENCIAS } from '@/lib/financeiro/serie';
import '../../../financeiro/financeiro.css';

export const dynamic = 'force-dynamic';

// Link do sócio da SÉRIE: um link só, todas as edições em que ele entrou. Cada edição abre a prestação completa
// (o link pessoal daquela edição). Sem senha, só leitura. A OG (ao lado) tem o nome da série e nenhum número.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const s = await serieSocioPorToken((await params).token);
  const serie = s && s.linkAtivo ? await lerSerieCurta(s.serieId) : null;
  const titulo = serie ? `Prestação de contas · ${serie.nome}` : 'Área do sócio · Royals';
  const desc = 'Todas as edições, em tempo real. Uma produção ROYALS.';
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

export default async function SocioDaSerie({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const s = await serieSocioPorToken(token);
  if (!s) return <Fora titulo="Link não encontrado" texto="Confira se o link está completo ou peça um novo à Royals." />;
  if (!s.linkAtivo) return <Fora titulo="Link desativado" texto="Este acesso foi desativado pela Royals. Se precisar, peça um link novo." />;
  const serie = await lerSerieCurta(s.serieId);
  if (!serie) return <Fora titulo="Série não encontrada" texto="Fale com a Royals." />;
  const db = await getDb();
  await db.update(schema.finSerieSocios).set({ ultimoAcesso: new Date() }).where(eq(schema.finSerieSocios.id, s.id));

  const eds = await edicoesDoSocioDaSerie(s.id);
  const fechadas = eds.filter((e) => e.ev.status === 'fechado');
  const aporteTotal = eds.reduce((t, e) => t + e.socio.aporte, 0);
  const recebido = fechadas.reduce((t, e) => t + (e.parte?.total ?? 0), 0);
  const lucroMeu = fechadas.reduce((t, e) => t + (e.parte?.lucro ?? 0), 0);
  const primeiro = s.nome.trim().split(/\s+/)[0];

  return (
    <div className="fin">
      <main className="fin-socio-pag">
        <div className="fin-socio-topo"><img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" /><span className="fin-rot">Área do sócio</span></div>
        <h1 className="fin-titulo" style={{ fontSize: 'clamp(28px, 7vw, 44px)' }}>{serie.nome}</h1>
        <div className="fin-ev__linha" style={{ marginTop: 10 }}>
          <span className="fin-selo fin-selo--serie">{FREQUENCIAS[serie.frequencia]}</span>
          <span>{eds.length} {eds.length === 1 ? 'edição' : 'edições'} com você</span>
          {!s.ativo ? <span className="ambar">você não está nas próximas edições</span> : null}
          <AoVivo em={agora()} />
        </div>
        <p style={{ marginTop: 22, fontSize: 20, color: 'var(--text-primary)' }}>Olá, {primeiro}</p>

        <div className="fin-tres" style={{ marginTop: 16 }}>
          <div><span className="fin-rot">Seus aportes</span><b>{reais(aporteTotal, { inteiro: true })}</b></div>
          <div><span className="fin-rot">Recebido (fechadas)</span><b className={recebido >= 0 ? 'verde' : 'vermelho'}>{reais(recebido, { inteiro: true })}</b></div>
          <div><span className="fin-rot">Seu lucro</span><b className={lucroMeu >= 0 ? 'verde' : 'vermelho'}>{reais(lucroMeu, { sinal: true, inteiro: true })}</b></div>
        </div>

        <section className="fin-bloco">
          <h2 className="fin-h2" style={{ marginBottom: 12 }}>Edições</h2>
          {eds.length ? (
            <ul className="fin-lista">
              {eds.map(({ socio, ev, conta, parte }) => {
                const fechado = ev.status === 'fechado';
                const conteudo = (
                  <>
                    <span className="fin-item__desc">{ev.data ? dataLonga(ev.data) : ev.nome}<small className="fin-item__un">Edição {ev.edicao ?? '—'}{ev.data ? ` · ${diaDaSemana(ev.data)}` : ''} · cota {pct(socio.cotaBp)}</small></span>
                    <span className={`fin-item__valor ${parte && parte.total >= socio.aporte ? 'verde' : 'vermelho'}`}>{parte ? (parte.total < 0 ? `repor ${reais(-parte.total)}` : reais(parte.total)) : '—'}</span>
                    <span className="fin-item__meta" style={{ display: 'flex' }}>
                      <span className={`fin-selo fin-selo--${ev.status}`}>{STATUS_EVENTO[ev.status]}</span>
                      <span>{fechado ? 'você recebeu' : 'previsão'}</span>
                      <span>evento {reais(conta.lucro, { sinal: true, inteiro: true })}</span>
                    </span>
                  </>
                );
                return (
                  <li key={socio.id} className="fin-item" style={{ gridTemplateColumns: '1fr auto' }}>
                    {socio.linkAtivo ? <Link href={`/socio/${socio.token}`} className="fin-item__link">{conteudo}</Link> : conteudo}
                  </li>
                );
              })}
            </ul>
          ) : <p className="fin-vazio">Nenhuma edição com você ainda. Assim que a Royals criar a próxima, ela aparece aqui.</p>}
          <p className="fin-sub" style={{ fontSize: 12, marginTop: 12 }}>Toque numa edição para ver os lançamentos e a conta completa dela.</p>
        </section>
        <p className="fin-rodape-socio">Somente leitura · link pessoal, não compartilhe · Uma produção ROYALS</p>
      </main>
    </div>
  );
}
