import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { CartaoEvento } from '@/components/financeiro/CartaoEvento';
import { listarEventos } from '@/lib/financeiro/dados';

export const metadata = { title: 'Eventos' };

export default async function Eventos() {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const eventos = await listarEventos();
  const grupos = [
    { t: 'Ao vivo', l: eventos.filter((e) => e.status === 'ao_vivo') },
    { t: 'Em montagem', l: eventos.filter((e) => e.status === 'montagem') },
    { t: 'Fechados', l: eventos.filter((e) => e.status === 'fechado') },
  ].filter((g) => g.l.length);
  return (
    <>
      <div className="fin-cab">
        <div><p className="fin-rot">{eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}</p><h1 className="fin-titulo">Eventos</h1></div>
        <div className="fin-cab__acoes"><Link className="botao" href="/financeiro/eventos/novo">Novo evento</Link></div>
      </div>
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
