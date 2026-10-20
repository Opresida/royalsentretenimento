import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PaginaEvento } from '@/components/PaginaEvento';
import { capaDoEvento, dataExtensa, evento, nomeCompleto, passados, proximos } from '@/lib/acervo';
import { SITE_URL } from '@/lib/site';

// Só os próximos eventos moram em /eventos; uma edição que já passou vai para /relembre-momentos.
export function generateStaticParams() {
  return proximos().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = evento((await params).slug);
  if (!e) return {};
  const capa = capaDoEvento(e);
  const descricao = `${nomeCompleto(e)}, ${dataExtensa(e.data)}${e.local ? `, no ${e.local}` : ''}, ${e.cidade}. ${e.atracoes.length ? e.atracoes.join(', ') : e.estilo ?? ''}. ${e.parceiros?.length ? `${e.rotuloAssinatura ?? 'Apresentam'}: Royals e ${e.parceiros.map((p) => p.nome).join(', ')}` : 'Uma produção Royals'}.`;
  return { title: nomeCompleto(e), description: descricao, alternates: { canonical: `/eventos/${e.slug}` }, openGraph: { title: nomeCompleto(e), description: descricao, images: e.og ? [{ url: e.og, width: 1200, height: 630, alt: nomeCompleto(e) }] : capa ? [capa.g] : undefined }, ...(e.og ? { twitter: { card: 'summary_large_image', title: nomeCompleto(e), description: descricao, images: [e.og] } } : {}) };
}

export default async function PaginaProximo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = evento(slug);
  if (!e) notFound();
  if (passados().some((x) => x.slug === slug)) permanentRedirect(`/relembre-momentos/${slug}`);
  const ld = {
    '@context': 'https://schema.org', '@type': 'MusicEvent', name: nomeCompleto(e), startDate: e.data,
    eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: e.local ?? e.cidade, address: e.cidade },
    performer: e.atracoes.map((name) => ({ '@type': 'MusicGroup', name })),
    organizer: { '@type': 'Organization', name: 'Royals Entretenimento', url: SITE_URL },
    ...(e.ingressos ? { offers: { '@type': 'Offer', url: e.ingressos } } : {}),
  };
  return (
    <>
      <PaginaEvento e={e} passado={false} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
