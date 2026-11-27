import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { CartaoEvento } from '@/components/financeiro/CartaoEvento';
import { listarEventos, listarSeries } from '@/lib/financeiro/dados';
import { dataLonga, hojeManaus, reais } from '@/lib/financeiro/dinheiro';
import { FREQ_CURTA, proximaData } from '@/lib/financeiro/serie';

export const metadata = { title: 'Eventos' };

export default async function Eventos() {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const [todos, series] = await Promise.all([listarEventos(), listarSeries()]);
  // edição fechada de série fica dentro da série (senão a lista enche toda semana); aberta aparece aqui também
  const eventos = todos.filter((e) => !e.serieId || e.status !== 'fechado');
  const hoje = hojeManaus();
  const grupos = [
    { t: 'Ao vivo', l: eventos.filter((e) => e.status === 'ao_vivo') },
    { t: 'Em montagem', l: eventos.filter((e) => e.status === 'montagem') },
    { t: 'Fechados', l: eventos.filter((e) => e.status === 'fechado') },
  ].filter((g) => g.l.length);
  return (
    <>
      <div className="fin-cab">
        <div><p className="fin-rot">{eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}</p><h1 className="fin-titulo">Eventos</h1></div>
        <div className="fin-cab__acoes"><Link className="botao botao--secundario" href="/financeiro/series/nova">Nova série recorrente</Link><Link className="botao" href="/financeiro/eventos/novo">Novo evento</Link></div>
      </div>
      {series.length ? (
        <section style={{ marginBottom: 28 }}>
          <h2 className="fin-rot fin-rot--ouro" style={{ marginBottom: 12 }}>Recorrentes</h2>
          <div className="fin-eventos">
            {series.map((s) => (
              <Link key={s.id} href={`/financeiro/series/${s.id}`} className="fin-ev fin-ev--serie">
                <div>
                  <div className="fin-ev__nome">{s.nome}</div>
                  <div className="fin-ev__linha" style={{ marginTop: 8 }}>
                    <span className="fin-selo fin-selo--serie">{FREQ_CURTA[s.frequencia]}</span>
                    {!s.ativa ? <span className="fin-selo fin-selo--fechado">Encerrada</span> : null}
                    <span>{s.edicoes.length} {s.edicoes.length === 1 ? 'edição' : 'edições'}</span>
                    {s.ativa ? <span>próxima {dataLonga(proximaData(s, s.ultimaData, hoje))}</span> : null}
                  </div>
                </div>
                <div className="fin-ev__num">
                  <span className="fin-rot">Lucro acumulado</span>
                  <b className={s.lucro > 0 ? 'verde' : s.lucro < 0 ? 'vermelho' : ''}>{reais(s.lucro, { sinal: true, inteiro: true })}</b>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {grupos.length ? grupos.map((g) => (
        <section key={g.t} style={{ marginBottom: 28 }}>
          <h2 className="fin-rot fin-rot--ouro" style={{ marginBottom: 12 }}>{g.t}</h2>
          <div className="fin-eventos">{g.l.map((e) => <CartaoEvento key={e.id} e={e} />)}</div>
        </section>
      )) : (
        <div className="fin-bloco fin-vazio"><b>Nenhum evento ainda</b>Cada evento tem o próprio financeiro e os próprios sócios.<div style={{ marginTop: 16 }}><Link className="botao" href="/financeiro/eventos/novo">Criar o primeiro evento</Link></div></div>
      )}
    </>
  );
}
