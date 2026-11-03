// Royals · mídia da página geral do casting (/artistas), pedido do Humberto em 03/11/2026.
// Os vídeos-case de 1 minuto que a BrandSquad fez de cada artista (60 s, 9:16, com a trilha do artista) viram MP4 leve
// para a web (720×1280, H.264, AAC, faststart) + capa webp, e sobem para o R2 royals-acervo em artistas/casting/.
// Uso: node scripts/casting-midia.mjs [--sem-r2]   →   grava src/data/casting-midia.json
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const SEM_R2 = process.argv.includes('--sem-r2');
const R2 = 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev';
const TMP = '.acervo/artistas/casting';
fs.mkdirSync(TMP, { recursive: true });
const env = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'cloudflare.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^'|'$/g, '')]));
const ff = (args) => { const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 28 }); if (r.status !== 0) throw new Error(r.stderr.slice(0, 500)); return r; };
async function sobe(arq, chave, tipo) {
  if (SEM_R2) return `${R2}/${chave}`;
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/royals-acervo/objects/${chave}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': tipo }, body: fs.readFileSync(arq) });
  if (!r.ok) throw new Error(`R2 ${r.status} ${chave}: ${(await r.text()).slice(0, 200)}`);
  return `${R2}/${chave}`;
}

const CASES = {
  lucco: {
    video: 'D:/CLIENTES BRANDSQUADS/Royals Entretenimento/DJ LUCCO/Apresentação de site/case-lucco-brandsquad-FINAL.mp4',
    capa: 'D:/CLIENTES BRANDSQUADS/Royals Entretenimento/DJ LUCCO/Apresentação de site/case-lucco-brandsquad-FINAL-capa.png',
  },
  bertolossi: {
    video: 'D:/dev/remotion-studio/out/bertolossi/case-bertolossi-FINAL.mp4',
    capa: 'D:/dev/remotion-studio/out/bertolossi/case-capa.png',
  },
};

const saida = {};
for (const [slug, c] of Object.entries(CASES)) {
  const mp4 = `${TMP}/case-${slug}.mp4`;
  ff(['-i', c.video, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', mp4]);
  const capa = `${TMP}/case-${slug}-capa.webp`;
  await sharp(c.capa).resize({ width: 720 }).webp({ quality: 82 }).toFile(capa);
  const v = Date.now().toString(36); // versão no nome: o R2 público guarda em cache
  saida[slug] = {
    mp4: await sobe(mp4, `artistas/casting/case-${slug}-${v}.mp4`, 'video/mp4'),
    capa: await sobe(capa, `artistas/casting/case-${slug}-capa-${v}.webp`, 'image/webp'),
    w: 720, h: 1280, mb: +(fs.statSync(mp4).size / 1048576).toFixed(1),
  };
  console.log(slug, saida[slug].mb, 'MB');
}
fs.writeFileSync('src/data/casting-midia.json', JSON.stringify({ cases: saida }, null, 1));
console.log('ok · src/data/casting-midia.json');
