import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Checkout } from '@/components/checkout/Checkout';
import { checkoutDo, CHECKOUT } from '@/data/ingressos';
import { ano, dataCurta, diaSemana, evento, nomeCompleto, proximos } from '@/lib/acervo';

// Royals Tickets · /eventos/<slug>/checkout (pedido do Humberto, 16/10). Só para próximos eventos com dados de venda em
// src/data/ingressos.ts. Enquanto a venda pelo site não abre, é uma PRÉVIA para os sócios: fora do Google (noindex),
// fora do sitemap e sem link no site; os botões de ingresso continuam levando à Igarê.

export function generateStaticParams() {
  return proximos().filter((e) => CHECKOUT[e.slug]).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = evento((await params).slug);
  if (!e) return {};
  return { title: `Ingressos · ${nomeCompleto(e)}`, description: `Compre ingressos para ${nomeCompleto(e)} pela Royals Tickets.`, robots: { index: false, follow: false } };
}

export default async function PaginaCheckout({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = evento(slug);
  const dados = checkoutDo(slug);
  if (!e || !dados || !proximos().some((x) => x.slug === slug)) notFound();
  const dia = diaSemana(e.data);
  const base = `/eventos/${e.slug}/banner`;
  return (
    <Checkout
      dados={dados}
      evento={{
        nome: nomeCompleto(e), dataCurta: `${dataCurta(e.data)}.${ano(e.data)}`, diaSemana: dia.charAt(0).toUpperCase() + dia.slice(1),
        abertura: e.hora ?? dados.abertura, local: e.local, cidade: e.cidade, cor: e.cor, sobreCor: e.sobreCor,
        banner: { desktop: `${base}/desktop.webp`, tablet: `${base}/tablet.webp`, celular: `${base}/celular.webp` },
      }}
    />
  );
}
