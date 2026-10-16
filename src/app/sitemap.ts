import type { MetadataRoute } from 'next';
import { passados, proximos } from '@/lib/acervo';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const fixas = ['', '/eventos', '/relembre-momentos', '/melhores-momentos', '/promoters', '/sobre', '/contato', '/privacidade', '/termos'];
  return [
    ...fixas.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.6 })),
    ...proximos().map((e) => ({ url: `${SITE_URL}/eventos/${e.slug}`, changeFrequency: 'daily' as const, priority: 0.9 })),
    ...passados().map((e) => ({ url: `${SITE_URL}/relembre-momentos/${e.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
