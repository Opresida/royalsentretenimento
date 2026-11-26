import { agora } from '@/lib/financeiro/dinheiro';
import { adminAtual, exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { excluirSocio, fecharEvento, gerenciarLink, reabrirEvento } from '@/app/financeiro/acoes';
import { AoVivo } from '@/components/financeiro/AoVivo';
import { CopiarLink, FormSocio } from '@/components/financeiro/Formularios';
import { ListaLancamentos } from '@/components/financeiro/ListaLancamentos';
import { STATUS_EVENTO, TAXA_ROTULO } from '@/lib/financeiro/calculo';
import { lerEvento } from '@/lib/financeiro/dados';
import { dataLonga, pct, reais } from '@/lib/financeiro/dinheiro';

type Aba = 'resumo' | 'custos' | 'receitas' | 'socios' | 'fechamento';
const ABAS: [Aba, string][] = [['resumo', 'Resumo'], ['custos', 'Custos'], ['receitas', 'Receitas'], ['socios', 'Sócios'], ['fechamento', 'Fechamento']];

const ACOES: Record<string, string> = {
  evento_criado: 'criou o evento', evento_editado: 'editou o evento', lancamento_criado: 'lançou', lancamento_editado: 'alterou',
  lancamento_excluido: 'excluiu', socio_criado: 'adicionou o sócio', socio_editado: 'alterou o sócio', socio_excluido: 'removeu o sócio',
  link_revogar: 'revogou o link de', link_novo: 'gerou link novo para', link_reativar: 'reativou o link de', evento_fechado: 'fechou o evento',
  evento_reaberto: 'reabriu o evento', comprovante_mostrado: 'mostrou aos sócios o comprovante de', comprovante_ocultado: 'escondeu dos sócios o comprovante de',
};

function detalheTxt(d: unknown): string {
  if (!d || typeof d !== 'object') return '';
  const o = d as Record<string, unknown>;
  if (o.descricao) return `${o.descricao}${o.valor ? ` (${o.valor})` : o.para ? ` (${o.de} → ${o.para})` : ''}`;
  if (o.nome) return String(o.nome);
  if (o.lucro) return `lucro ${o.lucro}`;
  return '';
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  if (!(await adminAtual())) return { title: 'Evento' };
  const d = await lerEvento(Number((await params).id));
  return { title: d?.ev.nome ?? 'Evento' };
}

export default async function PaginaEvento({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aba?: string; salvo?: string; erro?: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const { id } = await params;
  const sp = await searchParams;
  const d = await lerEvento(Number(id));
  if (!d) notFound();
  const { ev, lancs, socios, historico, conta: c } = d;
  const aba: Aba = (ABAS.map((a) => a[0]) as string[]).includes(sp.aba ?? '') ? (sp.aba as Aba) : 'resumo';
  const fechado = ev.status === 'fechado';
  const h = await headers();
  const origem = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
  const custos = lancs.filter((l) => l.tipo === 'custo');
  const receitas = lancs.filter((l) => l.tipo === 'receita');
  const porCat = Object.entries(custos.reduce<Record<string, number>>((a, l) => ({ ...a, [l.categoria]: (a[l.categoria] ?? 0) + l.valor }), {})).sort((a, b) => b[1] - a[1]);
  const porCatRec = Object.entries(receitas.reduce<Record<string, number>>((a, l) => ({ ...a, [l.categoria]: (a[l.categoria] ?? 0) + l.valor }), {})).sort((a, b) => b[1] - a[1]);
  const maiorCat = Math.max(1, ...porCat.map((x) => x[1]));
  const temSocios = socios.length > 0;
  const pendentes = lancs.filter((l) => !l.quitado);

  return (
    <>
      <p className="fin-trilha"><Link href="/financeiro/eventos">Eventos</Link> / {ev.nome}</p>
      <div className="fin-cab" style={{ marginTop: 8 }}>
        <div>
          <div className="fin-cab__titulo">
            <h1 className="fin-titulo">{ev.nome}</h1>
            <span className={`fin-selo fin-selo--${ev.status}`}>{STATUS_EVENTO[ev.status]}</span>
          </div>
          <p className="fin-sub">{[ev.data && dataLonga(ev.data), ev.local].filter(Boolean).join(' · ')}{ev.data || ev.local ? ' · ' : ''}<AoVivo em={agora()} intervalo={30000} /></p>
        </div>
        <div className="fin-cab__acoes">
          <Link className="botao botao--secundario botao--sm" href={`/financeiro/eventos/${ev.id}/editar`}>Editar</Link>
          {!fechado ? <Link className="botao botao--secundario botao--sm" href={`/financeiro/eventos/${ev.id}?aba=socios`}>Convidar sócio</Link> : null}
          {!fechado ? <Link className="botao botao--sm" href={`/financeiro/lancar?evento=${ev.id}`}>+ Lançamento</Link> : null}
        </div>
      </div>

      {sp.salvo ? <p className="fin-aviso fin-aviso--ok" role="status" style={{ marginBottom: 16 }}>Lançamento salvo.</p> : null}
      {sp.erro === 'fechado' ? <p className="fin-aviso fin-aviso--erro" style={{ marginBottom: 16 }}>O evento está fechado. Reabra na aba Fechamento para mexer.</p> : null}

      <nav className="fin-abas" aria-label="Seções do evento">
        {ABAS.map(([k, t]) => <Link key={k} href={`/financeiro/eventos/${ev.id}?aba=${k}`} aria-current={aba === k ? 'page' : undefined}>{t}{k === 'socios' ? ` (${socios.length})` : ''}</Link>)}
      </nav>

      <div className="fin-kpis">
        <div className="fin-kpi"><span className="fin-rot">Aporte dos sócios</span><b>{reais(c.aportes, { inteiro: true })}</b></div>
        <div className="fin-kpi"><span className="fin-rot">Custos</span><b className="vermelho">{reais(c.custos, { inteiro: true })}</b>{c.custosPendentes ? <small className="ambar">{reais(c.custosPendentes, { inteiro: true })} a pagar</small> : null}</div>
        <div className="fin-kpi"><span className="fin-rot">Receitas</span><b className="verde">{reais(c.receitas, { inteiro: true })}</b>{c.receitasPendentes ? <small className="ambar">{reais(c.receitasPendentes, { inteiro: true })} a receber</small> : null}</div>
        <div className="fin-kpi"><span className="fin-rot">{fechado ? 'Lucro líquido' : 'Resultado'}</span><b className={c.lucro > 0 ? 'verde' : c.lucro < 0 ? 'vermelho' : ''}>{reais(c.lucro, { sinal: true, inteiro: true })}</b>{c.taxa ? <small>depois da taxa de {reais(c.taxa, { inteiro: true })}</small> : null}</div>
      </div>

      {aba === 'resumo' ? (
        <div className="fin-duas">
          <section className="fin-bloco">
            <div className="fin-bloco__cab"><h2 className="fin-h2">Últimos lançamentos</h2><Link className="fin-mini" href={`/financeiro/eventos/${ev.id}?aba=custos`}>Ver todos</Link></div>
            <ListaLancamentos lancs={lancs.slice(0, 8)} vazio="Nada lançado ainda. Use o + para lançar o primeiro custo ou receita." socios={temSocios} travado={fechado} />
          </section>
          <div>
            <section className="fin-bloco">
              <h2 className="fin-h2" style={{ fontSize: 14, marginBottom: 14 }}>Custos por categoria</h2>
              {porCat.length ? <div className="fin-cats">{porCat.map(([k, v]) => <div key={k}><span>{k}</span><b>{reais(v, { inteiro: true })}</b><div className="fin-barra"><i style={{ width: `${(v / maiorCat) * 100}%` }} /></div></div>)}</div> : <p className="fin-vazio">Sem custos ainda.</p>}
            </section>
            <section className="fin-bloco">
              <h2 className="fin-h2" style={{ fontSize: 14, marginBottom: 14 }}>Histórico</h2>
              <ul className="fin-historico">
                {historico.slice(0, 10).map((x) => <li key={x.id}><b>{x.admin ?? 'Royals'}</b> {ACOES[x.acao] ?? x.acao} {detalheTxt(x.detalhe)} · {new Date(x.em).toLocaleString('pt-BR', { timeZone: 'America/Manaus', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</li>)}
                {!historico.length ? <li>Sem registros.</li> : null}
              </ul>
            </section>
          </div>
        </div>
      ) : null}

      {aba === 'custos' || aba === 'receitas' ? (
        <section className="fin-bloco">
          <div className="fin-bloco__cab">
            <h2 className="fin-h2">{aba === 'custos' ? `Custos · ${reais(c.custos)}` : `Receitas · ${reais(c.receitas)}`}</h2>
            {!fechado ? <Link className="fin-mini fin-mini--ouro" href={`/financeiro/lancar?evento=${ev.id}&tipo=${aba === 'custos' ? 'custo' : 'receita'}`}>+ {aba === 'custos' ? 'Custo' : 'Receita'}</Link> : null}
          </div>
          {aba === 'receitas' && porCatRec.length ? <p className="fin-sub" style={{ marginTop: -4, marginBottom: 10 }}>{porCatRec.map(([k, v]) => `${k} ${reais(v, { inteiro: true })}`).join(' · ')}</p> : null}
          <ListaLancamentos lancs={aba === 'custos' ? custos : receitas} vazio={aba === 'custos' ? 'Nenhum custo lançado.' : 'Nenhuma receita lançada.'} socios={temSocios} travado={fechado} />
          {temSocios ? <p className="fin-sub" style={{ fontSize: 12, marginTop: 14 }}>O olho mostra se os sócios veem o comprovante. Toque para mostrar ou esconder.</p> : null}
        </section>
      ) : null}

      {aba === 'socios' ? (
        <div className="fin-duas fin-duas--meio">
          <section className="fin-bloco">
            <div className="fin-bloco__cab"><h2 className="fin-h2">Sócios do evento</h2><span className="fin-rot">Aporte total {reais(c.aportes, { inteiro: true })}</span></div>
            {socios.length ? <div className="fin-segmentos">{socios.map((s) => <i key={s.id} style={{ flex: Math.max(1, s.cotaBp) }} title={`${s.nome} ${pct(s.cotaBp)}`} />)}</div> : null}
            {!c.cotasOk ? <p className="fin-aviso fin-aviso--ambar" style={{ marginBottom: 14 }}>As cotas somam {pct(c.somaCotasBp)}. Para fechar o evento, a soma precisa dar 100%.</p> : null}
            <div className="fin-socios">
              {socios.map((s) => (
                <div key={s.id} className="fin-socio">
                  <div className={`fin-socio__av ${s.eRoyals ? 'fin-socio__av--royals' : ''}`}>{s.eRoyals ? <img src="/marca/royals-symbol-gold.svg" alt="" /> : s.nome.trim()[0]?.toUpperCase()}</div>
                  <div className="fin-socio__nome">{s.nome}</div>
                  <div className="fin-socio__cota">{pct(s.cotaBp)}</div>
                  <div className="fin-socio__info">aporte {reais(s.aporte)} · {s.eRoyals ? <span className="ouro">Royals</span> : !s.linkAtivo ? <span className="vermelho">link revogado</span> : s.ultimoAcesso ? <span className="verde">viu {new Date(s.ultimoAcesso).toLocaleDateString('pt-BR', { timeZone: 'America/Manaus', day: '2-digit', month: '2-digit' })}</span> : <span className="ambar">ainda não abriu</span>}</div>
                  <div className="fin-socio__link">
                    {s.linkAtivo ? <CopiarLink url={`${origem}/socio/${s.token}`} nome={s.nome} evento={ev.nome} contato={s.contato} /> : null}
                    <div className="fin-socio__botoes">
                      <form action={gerenciarLink}><input type="hidden" name="id" value={s.id} />
                        {s.linkAtivo ? <button name="acao" value="revogar" className="fin-mini fin-mini--perigo">Revogar link</button> : <button name="acao" value="reativar" className="fin-mini">Reativar link</button>}
                      </form>
                      <form action={gerenciarLink}><input type="hidden" name="id" value={s.id} /><button name="acao" value="novo" className="fin-mini" title="O link antigo para de funcionar">Gerar link novo</button></form>
                      {!fechado ? (
                        <details className="fin-detalhes" style={{ width: '100%' }}>
                          <summary className="fin-mini">Editar sócio</summary>
                          <div style={{ marginTop: 14 }}>
                            <FormSocio eventoId={ev.id} s={{ id: s.id, nome: s.nome, contato: s.contato, aporteTxt: (s.aporte / 100).toFixed(2).replace('.', ','), cotaTxt: String(s.cotaBp / 100).replace('.', ','), eRoyals: s.eRoyals }} />
                            <form action={excluirSocio} style={{ marginTop: 10 }}><input type="hidden" name="id" value={s.id} /><button className="fin-mini fin-mini--perigo">Remover sócio</button></form>
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {!socios.length ? <p className="fin-vazio">Nenhum sócio ainda. Adicione quem investiu no evento, com o aporte e a cota combinada.</p> : null}
            </div>
          </section>
          {!fechado ? (
            <section className="fin-bloco">
              <h2 className="fin-h2" style={{ marginBottom: 6 }}>Adicionar sócio</h2>
              <p className="fin-sub" style={{ marginBottom: 18 }}>Cada sócio ganha um link pessoal: abre sem senha, só para ver, e você pode revogar quando quiser. No WhatsApp o link chega com a imagem do evento.</p>
              <FormSocio eventoId={ev.id} />
            </section>
          ) : null}
        </div>
      ) : null}

      {aba === 'fechamento' ? (
        <>
          {sp.erro === 'cotas' ? <p className="fin-aviso fin-aviso--erro" style={{ marginBottom: 16 }}>As cotas dos sócios somam {pct(c.somaCotasBp)}. Ajuste para 100% antes de fechar.</p> : null}
          <div className="fin-duas fin-duas--meio">
            <section className="fin-bloco">
              <h2 className="fin-h2" style={{ marginBottom: 8 }}>Receitas → custos → lucro</h2>
              <Cascata receitas={c.receitas} custos={c.custos} taxa={c.taxa} lucro={c.lucro} />
              <div className="fin-conta" style={{ marginTop: 18 }}>
                {porCatRec.map(([k, v]) => <div key={k}><span>{k}</span><span className="verde">{reais(v)}</span></div>)}
                <div><span>Receitas</span><b className="verde">{reais(c.receitas)}</b></div>
                <div><span>− Custos</span><b className="vermelho">{reais(c.custos)}</b></div>
                {ev.taxaTipo !== 'nenhuma' ? <div><span>− Taxa de produção Royals <small className="fin-sub">({ev.taxaTipo === 'fixo' ? 'valor fixo' : `${pct(ev.taxaValor)} ${TAXA_ROTULO[ev.taxaTipo].replace('% ', '')}`})</small></span><b className="ouro">{reais(c.taxa)}</b></div> : null}
                <div className="fin-conta__total"><span>= Lucro líquido</span><span className={c.lucro >= 0 ? 'verde' : 'vermelho'}>{reais(c.lucro)}</span></div>
              </div>
            </section>
            <section className="fin-bloco">
              <div className="fin-bloco__cab"><h2 className="fin-h2">Divisão entre sócios</h2>{c.retornoBp !== null ? <span className={`fin-selo ${c.retornoBp >= 0 ? '' : 'fin-selo--ao_vivo'}`} style={{ color: c.retornoBp >= 0 ? 'var(--verde)' : undefined, borderColor: c.retornoBp >= 0 ? 'rgba(95,179,122,.5)' : undefined }}>Retorno {c.retornoBp >= 0 ? '+' : ''}{pct(c.retornoBp)}</span> : null}</div>
              {socios.length ? (
                <div className="fin-tabela-rolo">
                  <table className="fin-tabela fin-tabela--cartoes">
                    <thead><tr><th>Sócio</th><th>Cota</th><th>Aporte de volta</th><th>Lucro</th><th>Total a receber</th></tr></thead>
                    <tbody>{c.divisao.map((x) => (
                      <tr key={x.id}><td>{x.nome}{x.eRoyals && !/royals/i.test(x.nome) ? <span className="ouro"> · Royals</span> : null}</td><td data-r="Cota">{pct(x.cotaBp)}</td><td data-r="Aporte de volta">{reais(x.aporte)}</td><td data-r="Lucro" className={x.lucro >= 0 ? 'verde' : 'vermelho'}>{reais(x.lucro)}</td><td data-r="Total a receber"><b>{reais(x.total)}</b></td></tr>
                    ))}</tbody>
                    <tfoot><tr><td>Total</td><td data-r="Cota" className={c.cotasOk ? '' : 'ambar'}>{pct(c.somaCotasBp)}</td><td data-r="Aporte de volta">{reais(c.aportes)}</td><td data-r="Lucro">{reais(c.divisao.reduce((s, x) => s + x.lucro, 0))}</td><td data-r="Total a receber">{reais(c.divisao.reduce((s, x) => s + x.total, 0))}</td></tr></tfoot>
                  </table>
                </div>
              ) : <p className="fin-vazio">Cadastre os sócios na aba Sócios para ver a divisão.</p>}
              {c.royalsRecebe ? <p className="fin-sub" style={{ marginTop: 14 }}>A Royals fica com <b className="ouro">{reais(c.royalsRecebe)}</b> ({c.taxa ? 'taxa de produção' : ''}{c.taxa && c.royalsRecebe !== c.taxa ? ' + ' : ''}{c.royalsRecebe !== c.taxa ? 'parte do lucro' : ''}). Isso entra no caixa da Royals ao fechar.</p> : null}
              {pendentes.length ? <p className="fin-aviso fin-aviso--ambar" style={{ marginTop: 14 }}>{pendentes.length} {pendentes.length === 1 ? 'lançamento ainda está' : 'lançamentos ainda estão'} a pagar ou a receber · {reais(pendentes.reduce((s, l) => s + l.valor, 0))}</p> : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
                <Link className="botao botao--secundario" href={`/financeiro/eventos/${ev.id}/prestacao`} target="_blank">Gerar PDF</Link>
                {!fechado ? (
                  <form action={fecharEvento}><input type="hidden" name="id" value={ev.id} /><button className="botao" disabled={!c.cotasOk || !socios.length}>Fechar evento</button></form>
                ) : (
                  <form action={reabrirEvento}><input type="hidden" name="id" value={ev.id} /><button className="botao botao--secundario">Reabrir evento</button></form>
                )}
              </div>
              <p className="fin-sub" style={{ fontSize: 12 }}>{fechado ? `Fechado em ${ev.fechadoEm ? new Date(ev.fechadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Manaus' }) : ''}. Lançamentos travados. Reabrir tira do caixa o que o fechamento lançou.` : 'Depois de fechado, os lançamentos ficam travados (dá para reabrir).'}</p>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}

function Cascata({ receitas, custos, taxa, lucro }: { receitas: number; custos: number; taxa: number; lucro: number }) {
  const topo = Math.max(1, receitas, custos);
  const h = (v: number) => `${(Math.abs(v) / topo) * 100}%`;
  return (
    <>
      <div className="fin-cascata" aria-hidden>
        <div><i style={{ bottom: 0, height: h(receitas), background: 'var(--verde)' }} /><em style={{ bottom: h(receitas) }}>{reais(receitas, { inteiro: true })}</em></div>
        <div><i style={{ bottom: lucro >= 0 ? h(lucro + taxa) : 0, height: h(custos), background: 'var(--vermelho)', opacity: 0.9 }} /><em style={{ bottom: h(Math.max(receitas, custos)) }}>{reais(custos, { inteiro: true })}</em></div>
        <div><i style={{ bottom: 0, height: h(lucro), background: lucro >= 0 ? 'var(--royal-gold)' : 'var(--vermelho)' }} /><em style={{ bottom: h(lucro) }}>{reais(lucro, { inteiro: true })}</em></div>
      </div>
      <div className="fin-cascata-rot"><span>Receitas</span><span>Custos</span><span>Lucro líquido</span></div>
    </>
  );
}
