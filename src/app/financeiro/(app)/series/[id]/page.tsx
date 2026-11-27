import { adminAtual, exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { criarEdicao, excluirCustoSerie, gerenciarSocioSerie } from '@/app/financeiro/acoes';
import { CopiarLink } from '@/components/financeiro/Formularios';
import { FormCustoSerie, FormSocioSerie } from '@/components/financeiro/FormulariosSerie';
import { un } from '@/components/financeiro/ListaLancamentos';
import { CATEGORIAS, STATUS_EVENTO } from '@/lib/financeiro/calculo';
import { lerSerie, pessoasConhecidas } from '@/lib/financeiro/dados';
import { dataLonga, hojeManaus, pct, reais } from '@/lib/financeiro/dinheiro';
import { diaDaSemana, FREQ_CURTA, FREQUENCIAS, proximaData } from '@/lib/financeiro/serie';

type Aba = 'edicoes' | 'socios' | 'custos';
const ABAS: [Aba, string][] = [['edicoes', 'Edições'], ['socios', 'Sócios da série'], ['custos', 'Custos fixos']];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  if (!(await adminAtual())) return { title: 'Série' };
  const d = await lerSerie(Number((await params).id));
  return { title: d?.serie.nome ?? 'Série' };
}

const decimal = (n: string | null) => (n == null ? undefined : String(Number(n)).replace('.', ','));

export default async function PaginaSerie({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aba?: string; erro?: string; nova?: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const { id } = await params;
  const sp = await searchParams;
  const d = await lerSerie(Number(id));
  if (!d) notFound();
  const { serie, socios, custosFixos, edicoes } = d;
  const aba: Aba = (ABAS.map((a) => a[0]) as string[]).includes(sp.aba ?? '') ? (sp.aba as Aba) : 'edicoes';
  const sugestao = proximaData(serie, d.ultimaData, hojeManaus());
  const ativos = socios.filter((s) => s.ativo);
  const somaCotas = ativos.reduce((t, s) => t + s.cotaBp, 0);
  const totalFixos = custosFixos.reduce((t, c) => t + c.valor, 0);
  const fechadas = edicoes.filter((e) => e.status === 'fechado');
  const melhor = fechadas.length ? fechadas.reduce((m, e) => (e.conta.lucro > m.conta.lucro ? e : m)) : null;
  const pior = fechadas.length > 1 ? fechadas.reduce((m, e) => (e.conta.lucro < m.conta.lucro ? e : m)) : null;
  const mes = hojeManaus().slice(0, 7);
  const doMes = edicoes.filter((e) => e.data?.startsWith(mes));
  const h = await headers();
  const origem = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
  const pessoas = aba === 'socios' ? (await pessoasConhecidas()).filter((p) => !ativos.some((s) => s.nome.trim().toLowerCase() === p.nome.trim().toLowerCase())) : [];

  return (
    <>
      <p className="fin-trilha"><Link href="/financeiro/eventos">Eventos</Link> / {serie.nome}</p>
      <div className="fin-cab" style={{ marginTop: 8 }}>
        <div>
          <div className="fin-cab__titulo">
            <h1 className="fin-titulo">{serie.nome}</h1>
            <span className="fin-selo fin-selo--serie">{FREQ_CURTA[serie.frequencia]}</span>
            {!serie.ativa ? <span className="fin-selo fin-selo--fechado">Encerrada</span> : null}
          </div>
          <p className="fin-sub">{FREQUENCIAS[serie.frequencia]}{serie.local ? ` · ${serie.local}` : ''} · {edicoes.length} {edicoes.length === 1 ? 'edição' : 'edições'}</p>
        </div>
        <div className="fin-cab__acoes">
          <Link className="botao botao--secundario botao--sm" href={`/financeiro/series/${serie.id}/editar`}>Editar série</Link>
        </div>
      </div>

      {sp.nova ? <p className="fin-aviso fin-aviso--ok" role="status" style={{ marginBottom: 16 }}>Série criada. Cadastre os sócios e os custos fixos: cada edição nova já nasce com eles.</p> : null}
      {sp.erro === 'repetida' ? <p className="fin-aviso fin-aviso--erro" style={{ marginBottom: 16 }}>Já existe uma edição nessa data.</p> : null}
      {sp.erro === 'data' ? <p className="fin-aviso fin-aviso--erro" style={{ marginBottom: 16 }}>Escolha a data da edição.</p> : null}
      {sp.erro === 'encerrada' ? <p className="fin-aviso fin-aviso--erro" style={{ marginBottom: 16 }}>A série está encerrada. Reative em “Editar série” para criar edições.</p> : null}

      {serie.ativa ? (
        <form action={criarEdicao} className="fin-proxima">
          <input type="hidden" name="serieId" value={serie.id} />
          <div className="fin-proxima__txt">
            <span className="fin-rot fin-rot--ouro">Próxima edição · sugestão {diaDaSemana(sugestao)}, {dataLonga(sugestao)}</span>
            <small>{ativos.length} {ativos.length === 1 ? 'sócio' : 'sócios'}{somaCotas !== 10000 && ativos.length ? <span className="ambar"> (cotas somam {pct(somaCotas)})</span> : ''} · {custosFixos.length} {custosFixos.length === 1 ? 'custo fixo' : 'custos fixos'}{totalFixos ? ` (${reais(totalFixos, { inteiro: true })})` : ''} entram sozinhos</small>
          </div>
          <input className="fin-proxima__data" type="date" name="data" defaultValue={sugestao} required aria-label="Data da próxima edição" />
          <button className="botao">Criar edição</button>
        </form>
      ) : null}

      <nav className="fin-abas" aria-label="Seções da série">
        {ABAS.map(([k, t]) => <Link key={k} href={`/financeiro/series/${serie.id}?aba=${k}`} aria-current={aba === k ? 'page' : undefined}>{t}{k === 'socios' ? ` (${ativos.length})` : k === 'custos' ? ` (${custosFixos.length})` : ` (${edicoes.length})`}</Link>)}
      </nav>

      {aba === 'edicoes' ? (
        <>
          <div className="fin-kpis">
            <div className="fin-kpi"><span className="fin-rot">Receitas da série</span><b className="verde">{reais(d.receitas, { inteiro: true })}</b></div>
            <div className="fin-kpi"><span className="fin-rot">Custos da série</span><b className="vermelho">{reais(d.custos, { inteiro: true })}</b></div>
            <div className="fin-kpi"><span className="fin-rot">Lucro acumulado</span><b className={d.lucro > 0 ? 'verde' : d.lucro < 0 ? 'vermelho' : ''}>{reais(d.lucro, { sinal: true, inteiro: true })}</b>{d.abertas ? <small className="ambar">{d.abertas} {d.abertas === 1 ? 'edição aberta' : 'edições abertas'}</small> : null}</div>
            <div className="fin-kpi"><span className="fin-rot">Este mês</span><b className={doMes.reduce((t, e) => t + e.conta.lucro, 0) >= 0 ? 'verde' : 'vermelho'}>{reais(doMes.reduce((t, e) => t + e.conta.lucro, 0), { sinal: true, inteiro: true })}</b><small>{doMes.length} {doMes.length === 1 ? 'edição' : 'edições'}</small></div>
          </div>
          <section className="fin-bloco">
            <div className="fin-bloco__cab"><h2 className="fin-h2">Edições</h2>{melhor ? <span className="fin-rot">Melhor: {melhor.data ? dataLonga(melhor.data) : melhor.nome} · {reais(melhor.conta.lucro, { sinal: true, inteiro: true })}{pior ? ` · Pior: ${pior.data ? dataLonga(pior.data) : pior.nome} · ${reais(pior.conta.lucro, { sinal: true, inteiro: true })}` : ''}</span> : null}</div>
            {edicoes.length ? (
              <div className="fin-tabela-rolo">
                <table className="fin-tabela fin-tabela--edicoes">
                  <thead><tr><th>Edição</th><th>Situação</th><th>Receitas</th><th>Custos</th><th>Resultado</th></tr></thead>
                  <tbody>
                    {edicoes.map((e) => (
                      <tr key={e.id}>
                        <td><Link href={`/financeiro/eventos/${e.id}`} className="fin-edicao"><b>{e.data ? dataLonga(e.data) : e.nome}</b><small>Edição {e.edicao ?? '—'}{e.data ? ` · ${diaDaSemana(e.data)}` : ''}</small></Link></td>
                        <td><span className={`fin-selo fin-selo--${e.status}`}>{STATUS_EVENTO[e.status]}</span></td>
                        <td className="verde">{reais(e.conta.receitas, { inteiro: true })}</td>
                        <td className="vermelho">{reais(e.conta.custos, { inteiro: true })}</td>
                        <td className={e.conta.lucro > 0 ? 'verde' : e.conta.lucro < 0 ? 'vermelho' : ''}><b>{reais(e.conta.lucro, { sinal: true, inteiro: true })}</b></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr><td>Total</td><td /><td>{reais(d.receitas, { inteiro: true })}</td><td>{reais(d.custos, { inteiro: true })}</td><td>{reais(d.lucro, { sinal: true, inteiro: true })}</td></tr></tfoot>
                </table>
              </div>
            ) : <p className="fin-vazio">Nenhuma edição ainda. Use “Criar edição” acima quando a data estiver definida.</p>}
            <p className="fin-sub" style={{ fontSize: 12, marginTop: 14 }}>Cada edição tem lançamentos, sócios e fechamento próprios (acerto a cada edição). Toque numa edição para lançar.</p>
          </section>
        </>
      ) : null}

      {aba === 'socios' ? (
        <div className="fin-duas fin-duas--meio">
          <section className="fin-bloco">
            <div className="fin-bloco__cab"><h2 className="fin-h2">Sócios da série</h2><span className="fin-rot">Cotas {pct(somaCotas)}</span></div>
            <p className="fin-sub" style={{ marginBottom: 14 }}>Este é o modelo das <b>próximas</b> edições. Mudou alguém ou a %? Edite aqui: as edições que já existem não mudam (se precisar, ajuste dentro da edição).</p>
            {ativos.length && somaCotas !== 10000 ? <p className="fin-aviso fin-aviso--ambar" style={{ marginBottom: 14 }}>As cotas somam {pct(somaCotas)}. Para fechar cada edição, a soma precisa dar 100%.</p> : null}
            <div className="fin-socios">
              {socios.map((s) => (
                <div key={s.id} className={`fin-socio ${s.ativo ? '' : 'fin-socio--saiu'}`}>
                  <div className={`fin-socio__av ${s.eRoyals ? 'fin-socio__av--royals' : ''}`}>{s.eRoyals ? <img src="/marca/royals-symbol-gold.svg" alt="" /> : s.nome.trim()[0]?.toUpperCase()}</div>
                  <div className="fin-socio__nome">{s.nome}</div>
                  <div className="fin-socio__cota">{s.ativo ? pct(s.cotaBp) : 'saiu'}</div>
                  <div className="fin-socio__info">aporte por edição {reais(s.aporte)}{s.eRoyals ? <> · <span className="ouro">Royals</span></> : !s.linkAtivo ? <> · <span className="vermelho">link revogado</span></> : s.ultimoAcesso ? <> · <span className="verde">viu {new Date(s.ultimoAcesso).toLocaleDateString('pt-BR', { timeZone: 'America/Manaus', day: '2-digit', month: '2-digit' })}</span></> : null}</div>
                  <div className="fin-socio__link">
                    {!s.eRoyals && s.linkAtivo ? <CopiarLink url={`${origem}/socio/serie/${s.token}`} nome={s.nome} evento={`${serie.nome} (todas as edições)`} contato={s.contato} /> : null}
                    <div className="fin-socio__botoes">
                      {!s.eRoyals ? (
                        <form action={gerenciarSocioSerie}><input type="hidden" name="id" value={s.id} />
                          {s.linkAtivo ? <button name="acao" value="revogar" className="fin-mini fin-mini--perigo">Revogar link</button> : <button name="acao" value="reativar" className="fin-mini">Reativar link</button>}
                        </form>
                      ) : null}
                      <form action={gerenciarSocioSerie}><input type="hidden" name="id" value={s.id} />
                        {s.ativo ? <button name="acao" value="sair" className="fin-mini fin-mini--perigo" title="Não entra nas próximas edições. O que já passou fica.">Tirar da série</button> : <button name="acao" value="voltar" className="fin-mini">Voltar para a série</button>}
                      </form>
                      {s.ativo ? (
                        <details className="fin-detalhes" style={{ width: '100%' }}>
                          <summary className="fin-mini">Editar sócio</summary>
                          <div style={{ marginTop: 14 }}>
                            <FormSocioSerie serieId={serie.id} s={{ id: s.id, nome: s.nome, contato: s.contato, aporteTxt: (s.aporte / 100).toFixed(2).replace('.', ','), cotaTxt: String(s.cotaBp / 100).replace('.', ','), eRoyals: s.eRoyals }} />
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {!socios.length ? <p className="fin-vazio">Nenhum sócio na série ainda.</p> : null}
            </div>
          </section>
          <section className="fin-bloco">
            <h2 className="fin-h2" style={{ marginBottom: 6 }}>Adicionar sócio à série</h2>
            <p className="fin-sub" style={{ marginBottom: 18 }}>Entra a partir da próxima edição criada. O investidor ganha UM link da série e vê todas as edições em que participou.</p>
            <FormSocioSerie serieId={serie.id} pessoas={pessoas} />
          </section>
        </div>
      ) : null}

      {aba === 'custos' ? (
        <div className="fin-duas fin-duas--meio">
          <section className="fin-bloco">
            <div className="fin-bloco__cab"><h2 className="fin-h2">Custos fixos de cada edição</h2><span className="fin-rot">{reais(totalFixos)} por edição</span></div>
            <p className="fin-sub" style={{ marginBottom: 14 }}>Entram sozinhos como <b>a pagar</b> em toda edição nova. Na edição você confirma o pagamento ou ajusta o valor.</p>
            {custosFixos.length ? (
              <ul className="fin-lista">
                {custosFixos.map((c) => (
                  <li key={c.id} className="fin-item fin-item--fixo">
                    <span className="fin-item__desc">{c.descricao}{un(c)}</span>
                    <span className="fin-item__valor vermelho">− {reais(c.valor)}</span>
                    <span className="fin-item__meta" style={{ display: 'flex' }}>
                      <span className="fin-cat">{c.categoria}</span>
                      <details className="fin-detalhes"><summary className="fin-mini">Editar</summary>
                        <div style={{ marginTop: 12 }}><FormCustoSerie serieId={serie.id} categorias={CATEGORIAS.custo} c={{ id: c.id, descricao: c.descricao, categoria: c.categoria, valorTxt: (c.valor / 100).toFixed(2).replace('.', ','), quantidade: decimal(c.quantidade), valorUnitario: decimal(c.valorUnitario) }} /></div>
                      </details>
                      <form action={excluirCustoSerie}><input type="hidden" name="id" value={c.id} /><button className="fin-mini fin-mini--perigo">Remover</button></form>
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="fin-vazio">Nenhum custo fixo. Ex.: DJ residente, som, segurança, pulseiras.</p>}
          </section>
          <section className="fin-bloco">
            <h2 className="fin-h2" style={{ marginBottom: 18 }}>Adicionar custo fixo</h2>
            <FormCustoSerie serieId={serie.id} categorias={CATEGORIAS.custo} />
          </section>
        </div>
      ) : null}
    </>
  );
}
