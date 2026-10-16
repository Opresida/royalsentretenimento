import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PaginaEvento } from '@/components/PaginaEvento';
import { capaDoEvento, dataExtensa, evento, nomeCompleto, passados, proximos } from '@/lib/acervo';

export function generateStaticParams() {
  return passados().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = evento((await params).slug);
  if (!e) return {};
  const capa = capaDoEvento(e);
  const descricao = `Fotos e vídeos de ${nomeCompleto(e)}, ${dataExtensa(e.data)}${e.local ? `, no ${e.local}` : ''}. ${e.atracoes.join(', ')}. Uma produção Royals.`;
  return { title: `${nomeCompleto(e)} · ${e.data.slice(0, 4)}`, description: descricao, alternates: { canonical: `/relembre-momentos/${e.slug}` }, openGraph: { title: nomeCompleto(e), description: descricao, images: capa ? [capa.g] : undefined } };
}

export default async function Edicao({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = evento(slug);
  if (!e) notFound();
  if (proximos().some((x) => x.slug === slug)) permanentRedirect(`/eventos/${slug}`);
  return <PaginaEvento e={e} passado />;
}
