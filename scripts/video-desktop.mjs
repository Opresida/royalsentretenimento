// Royals · prepara e sobe a versão 16:9 do vídeo do topo de um evento (desktop do site).
// Uso: node scripts/video-desktop.mjs <master.mp4> <capa.png> <nome-base> [--som]
//   ex.: node scripts/video-desktop.mjs D:/dev/remotion-studio/out/baile/chefin16/baile-das-bruxas-chefin-16x9-4k.mp4 \
//        D:/dev/remotion-studio/out/baile/chefin16/baile-das-bruxas-chefin-16x9-capa.png baile-das-bruxas-chefin-16x9
// Do master (4K) sai a versão do site: 1920×1080, H.264, "faststart" para começar a tocar antes de baixar tudo. Sem
// áudio, a não ser com --som (AAC 128k): no site o vídeo começa mudo e o botão de som do topo liga a trilha. Reduzir a partir do 4K (lanczos) deixa a imagem mais nítida que renderizar direto em 1080p.
// A capa vira webp 1920. Os dois sobem para o bucket R2 royals-acervo, em eventos/<nome-base>(.mp4 | -capa.webp).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const SOM = process.argv.includes('--som');
const [master, capa, base] = process.argv.slice(2).filter((a) => a !== '--som');
if (!master || !capa || !base) { console.error('uso: node scripts/video-desktop.mjs <master.mp4> <capa.png> <nome-base>'); process.exit(1); }
const env = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'cloudflare.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
fs.mkdirSync('.acervo/eventos', { recursive: true });
const mp4 = `.acervo/eventos/${base}.mp4`, webp = `.acervo/eventos/${base}-capa.webp`;

const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', master, ...(SOM ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']), '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', mp4], { encoding: 'utf8' });
if (r.status !== 0) { console.error('ffmpeg:', r.stderr.slice(0, 400)); process.exit(1); }
await sharp(capa).resize(1920, 1080, { fit: 'cover' }).webp({ quality: 84 }).toFile(webp);
console.log(`${mp4}: ${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB | ${webp}: ${(fs.statSync(webp).size / 1e3).toFixed(0)} KB`);

for (const [arq, tipo] of [[mp4, 'video/mp4'], [webp, 'image/webp']]) {
  const chave = `eventos/${path.basename(arq)}`;
  const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/royals-acervo/objects/${chave}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': tipo }, body: fs.readFileSync(arq) });
  console.log(resp.ok ? `R2 ok: https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/${chave}` : `ERRO R2 ${resp.status} ${chave}: ${(await resp.text()).slice(0, 200)}`);
}
