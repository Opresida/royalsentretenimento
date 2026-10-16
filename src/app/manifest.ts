import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Royals Entretenimento', short_name: 'Royals', description: 'Eventos de trap e funk em Manaus.',
    start_url: '/', display: 'standalone', background_color: '#050505', theme_color: '#050505',
    icons: [{ src: '/marca/icone-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  };
}
