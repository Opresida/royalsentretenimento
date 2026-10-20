// Royals · fotos de um evento que NÃO vêm do Instagram da Royals (ex.: o perfil do próprio evento), para a seção
// "galeria externa" da página do evento. Converte cada foto em webp 600 e 1600 e sobe para o R2 royals-acervo, em
// eventos/<slug>/<nome>-600.webp | -1600.webp. Imprime a lista pronta para colar em `galeriaExterna.itens` (eventos.ts).
// Uso: node scripts/galeria-externa.mjs <slug> <link-do-post|-> <foto1.jpg> [foto2.jpg ...]
//   ex.: node scripts/galeria-externa.mjs varandinha https://www.instagram.com/_varandiinha/ .acervo/varandinha/*.jpg
// Criado em 19/10/2026 para a Varandinha (fotos das edições de 2024, perfil @_varandiinha, lidas pela Graph API).
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

const [slug, link, ...fotos] = process.argv.slice(2);
if (!slug || !fotos.length) { console.error('uso: node scripts/galeria-externa.mjs <slug> <link|-> <fotos...>'); process.exit(1); }
const env = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'cloudflare.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^'|'$/g, '')]));
const PUBLICO = 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev';
const sobe = async (chave, corpo) => {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/royals-acervo/objects/${chave}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'image/webp' }, body: corpo });
  if (!r.ok) throw new Error(`${chave}: ${r.status}`);
  return `${PUBLICO}/${chave}`;
};
const itens = [];
for (const [i, f] of fotos.entries()) {
  const nome = `edicao-${String(i + 1).padStart(2, '0')}`;
  const { width: w, height: h } = await sharp(f).metadata();
  const p = await sobe(`eventos/${slug}/${nome}-600.webp`, await sharp(f).resize({ width: 600 }).webp({ quality: 82 }).toBuffer());
  const g = await sobe(`eventos/${slug}/${nome}-1600.webp`, await sharp(f).resize({ width: Math.min(1600, w) }).webp({ quality: 84 }).toBuffer());
  itens.push({ id: `${slug}-${nome}`, w, h, p, g, ...(link && link !== '-' ? { link } : {}) });
}
console.log(JSON.stringify(itens, null, 1));
