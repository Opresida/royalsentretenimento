import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { excluirSerie } from '@/app/financeiro/acoes';
import { FormSerie } from '@/components/financeiro/FormulariosSerie';
import { lerSerie } from '@/lib/financeiro/dados';
import { pct, reais } from '@/lib/financeiro/dinheiro';

export const metadata = { title: 'Editar série' };

export default async function EditarSerie({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  const { id } = await params;
  const sp = await searchParams;
  const d = await lerSerie(Number(id));
  if (!d) notFound();
  const { serie } = d;
  const taxaValorTxt = serie.taxaTipo === 'fixo' ? reais(serie.taxaValor).replace('R$ ', '') : serie.taxaTipo === 'nenhuma' ? '' : pct(serie.taxaValor, 2).replace('%', '');
  return (
    <>
      <p className="fin-trilha"><Link href="/financeiro/eventos">Eventos</Link> / <Link href={`/financeiro/series/${serie.id}`}>{serie.nome}</Link> / Editar</p>
      <h1 className="fin-titulo" style={{ marginBottom: 8 }}>Editar série</h1>
      <p className="fin-sub" style={{ marginBottom: 24, maxWidth: 640 }}>Frequência, local e taxa valem para as próximas edições. As edições já criadas não mudam.</p>
      <FormSerie s={{ id: serie.id, nome: serie.nome, frequencia: serie.frequencia, primeiraData: serie.primeiraData, local: serie.local, taxaTipo: serie.taxaTipo, taxaValorTxt, observacoes: serie.observacoes, ativa: serie.ativa }} />

      <details className="fin-bloco fin-detalhes" style={{ marginTop: 40, maxWidth: 640, borderTopColor: 'var(--vermelho)' }}>
        <summary className="fin-h2" style={{ fontSize: 14 }}>Excluir série</summary>
        {d.edicoes.length ? (
          <p className="fin-sub" style={{ marginTop: 16 }}>A série já tem {d.edicoes.length} {d.edicoes.length === 1 ? 'edição' : 'edições'}, então não dá para excluir (o histórico se perderia). Para parar, marque a série como <b>Encerrada</b> acima.</p>
        ) : (
          <form action={excluirSerie} className="fin-form" style={{ marginTop: 16 }}>
            <input type="hidden" name="id" value={serie.id} />
            <p className="fin-sub">Apaga a série, os sócios e os custos fixos dela. Não tem volta.</p>
            <label className="fin-campo"><span>Digite EXCLUIR para confirmar</span><input name="confirmar" autoComplete="off" /></label>
            {sp.erro === 'confirmar' ? <p className="fin-aviso fin-aviso--erro">Digite EXCLUIR para confirmar.</p> : null}
            <div><button className="fin-mini fin-mini--perigo">Excluir de vez</button></div>
          </form>
        )}
        {sp.erro === 'edicoes' ? <p className="fin-aviso fin-aviso--erro" style={{ marginTop: 12 }}>A série tem edições: encerre em vez de excluir.</p> : null}
      </details>
    </>
  );
}
