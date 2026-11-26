// Imagem de compartilhamento (OG) do Financeiro e da área do sócio: preto, fio de ouro, diagonais da coroa, logo oficial.
// Nunca leva número: a prévia do WhatsApp fica visível para qualquer um da conversa.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const OG_TAMANHO = { width: 1200, height: 630 };

let cache: Promise<[Buffer, Buffer, string]> | null = null;
function recursos() {
  return (cache ??= Promise.all([
    readFile(join(process.cwd(), 'assets/fontes/archivo-800.ttf')),
    readFile(join(process.cwd(), 'assets/fontes/archivo-500.ttf')),
    readFile(join(process.cwd(), 'assets/royals-gold.svg'), 'utf8').then((s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`),
  ]));
}

export async function ogFinanceiro({ selo, titulo, linha }: { selo: string; titulo: string; linha: string }) {
  const [f800, f500, logo] = await recursos();
  const grande = titulo.length > 22 ? (titulo.length > 34 ? 64 : 80) : 100;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#050505', padding: '64px 72px', position: 'relative', fontFamily: 'Archivo' }}>
        <div style={{ position: 'absolute', right: -120, top: 0, bottom: 0, width: 520, display: 'flex', backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 46px, rgba(187,158,56,0.28) 46px 48px)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: '#BB9E38', display: 'flex' }} />
        <img src={logo} width={260} height={124} style={{ objectFit: 'contain', objectPosition: 'left' }} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: 8, color: '#BB9E38', textTransform: 'uppercase' }}>{selo}</div>
          <div style={{ fontSize: grande, fontWeight: 800, color: '#F2EEE4', textTransform: 'uppercase', lineHeight: 0.95, marginTop: 18 }}>{titulo}</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: '#A8A59D', marginTop: 26 }}>{linha}</div>
        </div>
      </div>
    ),
    { ...OG_TAMANHO, fonts: [{ name: 'Archivo', data: f800, weight: 800, style: 'normal' }, { name: 'Archivo', data: f500, weight: 500, style: 'normal' }] },
  );
}
