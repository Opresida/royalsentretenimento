import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { ListaLancamentos } from '@/components/financeiro/ListaLancamentos';
import { CartaoEvento } from '@/components/financeiro/CartaoEvento';
import { hojeManaus, nomeMes, pct, reais } from '@/lib/financeiro/dinheiro';
import { lancamentosDoCaixa, listarEventos, sociosDaRoyals } from '@/lib/financeiro/dados';
import { dividirPorCota } from '@/lib/financeiro/calculo';

export const metadata = { title: 'Caixa Royals' };

function mesAnterior(am: string, n: number) {
  const [a, m] = am.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1 - n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function CaixaRoyals({ searchParams }: { searchParams: Promise<{ mes?: string; salvo?: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const sp = await searchParams;
  const mesAtual = hojeManaus().slice(0, 7);
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? '') ? sp.mes! : mesAtual;
  const [caixa, eventos, socR] = await Promise.all([lancamentosDoCaixa(), listarEventos(), sociosDaRoyals()]);

  const saldo = caixa.filter((l) => l.quitado).reduce((s, l) => s + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
  const doMes = caixa.filter((l) => l.data.startsWith(mes));
  const entradas = doMes.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const saidas = doMes.filter((l) => l.tipo === 'custo').reduce((s, l) => s + l.valor, 0);
  const aPagarCaixa = caixa.filter((l) => l.tipo === 'custo' && !l.quitado).reduce((s, l) => s + l.valor, 0);
  const aPagarEventos = eventos.reduce((s, e) => s + e.conta.custosPendentes, 0);

  const meses = Array.from({ length: 6 }, (_, i) => mesAnterior(mesAtual, 5 - i)).map((m) => {
    const ls = caixa.filter((l) => l.data.startsWith(m));
    return { m, e: ls.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0), s: ls.filter((l) => l.tipo === 'custo').reduce((s, l) => s + l.valor, 0) };
  });
  const maior = Math.max(1, ...meses.flatMap((x) => [x.e, x.s]));
  const abertos = eventos.filter((e) => e.status !== 'fechado');
  // divisão entre os sócios da Royals: saldo em caixa (tudo abatido) e resultado do mês (entrou − saiu)
  const cotasR = socR.configurada ? socR.lista.map((s) => s.cotaBp ?? 0) : [];
  const partesSaldo = dividirPorCota(saldo, cotasR);
  const partesMes = dividirPorCota(entradas - saidas, cotasR);

  return (
    <>
      <div className="fin-cab">
        <div>
          <p className="fin-rot">{nomeMes(mes)}</p>
          <h1 className="fin-titulo">Caixa Royals</h1>
        </div>
        <div className="fin-cab__acoes">
          <Link className="botao botao--secundario" href="/financeiro/eventos/novo">Novo evento</Link>
          <Link className="botao" href="/financeiro/lancar">+ Lançamento</Link>
        </div>
      </div>
      {sp.salvo ? <p className="fin-aviso fin-aviso--ok" role="status" style={{ marginBottom: 20 }}>Lançamento salvo.</p> : null}

      <div className="fin-kpis">
        <div className="fin-kpi"><span className="fin-rot">Saldo em caixa</span><b className={saldo < 0 ? 'vermelho' : ''}>{reais(saldo, { inteiro: true })}</b></div>
        <div className="fin-kpi"><span className="fin-rot">Entradas do mês</span><b className="verde">{reais(entradas, { inteiro: true })}</b></div>
        <div className="fin-kpi"><span className="fin-rot">Saídas do mês</span><b className="vermelho">{reais(saidas, { inteiro: true })}</b></div>
        <div className="fin-kpi"><span className="fin-rot">A pagar</span><b className="ambar">{reais(aPagarCaixa + aPagarEventos, { inteiro: true })}</b><small>{reais(aPagarCaixa, { inteiro: true })} caixa · {reais(aPagarEventos, { inteiro: true })} eventos</small></div>
      </div>

      <div className="fin-duas">
        <section>
          <div className="fin-bloco__cab"><h2 className="fin-h2">Eventos em andamento</h2><Link className="fin-mini" href="/financeiro/eventos">Todos os eventos</Link></div>
          {abertos.length ? (
            <div className="fin-eventos">{abertos.map((e) => <CartaoEvento key={e.id} e={e} />)}</div>
          ) : (
            <div className="fin-bloco fin-vazio"><b>Nenhum evento em andamento</b>Crie o evento, cadastre os sócios e comece a lançar.<div style={{ marginTop: 16 }}><Link className="botao" href="/financeiro/eventos/novo">Criar evento</Link></div></div>
          )}
        </section>
        <section className="fin-bloco">
          <div className="fin-bloco__cab"><h2 className="fin-h2" style={{ fontSize: 14 }}>Entradas × saídas · 6 meses</h2></div>
          <div className="fin-meses">
            {meses.map((x) => (
              <div key={x.m} title={`${nomeMes(x.m)}: entradas ${reais(x.e)} · saídas ${reais(x.s)}`}>
                <span className="barras"><i style={{ height: `${(x.e / maior) * 100}%` }} /><i style={{ height: `${(x.s / maior) * 100}%` }} /></span>
                <small>{nomeMes(x.m).slice(0, 3)}</small>
              </div>
            ))}
          </div>
          <p className="fin-sub" style={{ fontSize: 12 }}><span className="ouro">■</span> entradas · <span className="vermelho">■</span> saídas do caixa da Royals</p>
        </section>
      </div>

      <section className="fin-bloco fin-divisao" style={{ marginTop: 8 }}>
        <div className="fin-bloco__cab"><h2 className="fin-h2">Divisão entre os sócios da Royals</h2><Link className="fin-mini" href="/financeiro/equipe#socios-royals">{socR.configurada ? 'Ajustar %' : 'Configurar'}</Link></div>
        {socR.configurada ? (
          <>
            {socR.somaBp !== 10000 ? <p className="fin-aviso fin-aviso--ambar" style={{ marginBottom: 12 }}>As % somam {pct(socR.somaBp, 2)}. Ajuste na Equipe para fechar 100%.</p> : null}
            <div className="fin-divisao__cab"><span>Sócio</span><span>%</span><span>Saldo em caixa</span><span>Resultado de {nomeMes(mes).split(' ')[0].toLowerCase()}</span></div>
            <div className="fin-divisao__linhas">
              {socR.lista.map((s, i) => (
                <div key={s.id} className="fin-divisao__linha">
                  <span className="fin-divisao__nome">{s.nome}</span>
                  <span className="fin-divisao__pct">{pct(s.cotaBp ?? 0, 2)}</span>
                  <span className="fin-divisao__vals">
                    <span><small>saldo </small><b className={partesSaldo[i] < 0 ? 'vermelho' : ''}>{reais(partesSaldo[i])}</b></span>
                    <span><small>mês </small><b className={partesMes[i] < 0 ? 'vermelho' : partesMes[i] > 0 ? 'verde' : ''}>{reais(partesMes[i], { sinal: true })}</b></span>
                  </span>
                </div>
              ))}
            </div>
            <p className="fin-sub" style={{ fontSize: 12, marginTop: 10 }}>Saldo em caixa {reais(saldo)} (só o que já foi pago e recebido) · resultado do mês {reais(entradas - saidas, { sinal: true })}.</p>
          </>
        ) : (
          <p className="fin-vazio" style={{ textAlign: 'left' }}>A divisão ainda não foi configurada. Marque na Equipe a % de cada sócio da Royals e este quadro mostra quanto do caixa cabe a cada um.</p>
        )}
      </section>

      <section className="fin-bloco" style={{ marginTop: 8 }}>
        <div className="fin-bloco__cab">
          <h2 className="fin-h2">Lançamentos do caixa · {nomeMes(mes)}</h2>
          <div className="fin-filtros">
            <Link href={`/financeiro?mes=${mesAnterior(mes, 1)}`}>← anterior</Link>
            {mes !== mesAtual ? <Link href="/financeiro">mês atual</Link> : null}
          </div>
        </div>
        <ListaLancamentos lancs={doMes} vazio="Nenhum lançamento do caixa neste mês." socios={false} />
      </section>
    </>
  );
}
