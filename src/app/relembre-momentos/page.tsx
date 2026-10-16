import type { Metadata } from 'next';
import Link from 'next/link';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { Revela } from '@/components/Revela';
import { ano, capaDoEvento, dataCurta, midiasDoEvento, nomeCompleto, passados } from '@/lib/acervo';

export const metadata: Metadata = { title: 'Relembre momentos', description: 'A linha do tempo da Royals Entretenimento: todas as edições, com fotos e vídeos de cada noite.', alternates: { canonical: '/relembre-momentos' } };

export default function RelembreMomentos() {
  const lista = passados();
  const porAno = lista.reduce<Record<string, typeof lista>>((acc, e) => { (acc[ano(e.data)] ??= []).push(e); return acc; }, {});
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <CabecalhoSecao nivel={1} olho="Acervo" titulo="Relembre momentos" descricao={`${lista.length} edições desde ${ano(lista[lista.length - 1].data)}. Escolha uma noite para ver as fotos e os vídeos.`} />
          <div className="linha-tempo">
            {Object.keys(porAno).sort((a, b) => b.localeCompare(a)).map((a) => (
              <Revela className="linha-tempo__item" key={a}>
                <div className="linha-tempo__ano sobe"><span>{a}</span></div>
                <div className="grade grade--3">
                  {porAno[a].map((e) => {
                    const capa = capaDoEvento(e);
                    const n = midiasDoEvento(e.slug).length;
                    return (
                      <Link key={e.slug} href={`/relembre-momentos/${e.slug}`} className="midia midia--forte surge" aria-label={`${nomeCompleto(e)}, ${dataCurta(e.data)}.${ano(e.data)}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {capa && <img src={capa.p} alt="" loading="lazy" />}
                        <span className="midia__texto">
                          <span className="midia__meta">{dataCurta(e.data)} · {n} {n === 1 ? 'mídia' : 'mídias'}</span>
                          <span className="midia__titulo" style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: 22 }}>{nomeCompleto(e)}</span>
                          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{e.atracoes.slice(0, 3).join(' · ')}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </Revela>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
