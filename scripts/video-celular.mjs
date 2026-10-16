// Royals · prepara e sobe o vídeo do topo de um evento para o CELULAR (toca mudo, em loop, atrás do bloco do evento).
// Uso: node scripts/video-celular.mjs <master-vertical.mp4> <inicio-seg> <fim-seg> <nome-base> [--som <arquivo> <inicio-seg>]
//   --som: pega o áudio de outro arquivo (ex.: o master 16:9, mesma linha do tempo) a partir de <inicio-seg>, com fade
//   curto nas pontas para o loop não dar tranco na música (o vídeo do celular é renderizado mudo, só o trecho).
//   ex.: node scripts/video-celular.mjs D:/dev/remotion-studio/out/baile/chefin-celular/baile-das-bruxas-chefin-9x16.mp4 \
//        0 22.73 baile-das-bruxas-chefin-9x16
// Serve para o vídeo 9:16 do topo no celular, montado no remotion-studio com o conteúdo no alto e a metade de baixo livre
// para o bloco do evento (ex.: Baile-Chefin-Apresentacao-Celular, que já sai cortado no trecho do loop: use 0 e a duração).
// 720×1280 (a tela do celular tem ~390 px de largura; 720 cobre telas 2x com folga), H.264, SEM áudio (no site ele toca
// mudo), faststart. A capa é o quadro 0,6 s depois do início. Sobem para o R2 royals-acervo em eventos/.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const iSom = process.argv.indexOf('--som');
const som = iSom > 0 ? { arq: process.argv[iSom + 1], ini: process.argv[iSom + 2] } : null;
const [master, ini, fim, base] = process.argv.slice(2, iSom > 0 ? iSom : undefined);
if (!master || !ini || !fim || !base) { console.error('uso: node scripts/video-celular.mjs <master.mp4> <inicio> <fim> <nome-base>'); process.exit(1); }
const env = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'cloudflare.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
fs.mkdirSync('.acervo/eventos', { recursive: true });
const mp4 = `.acervo/eventos/${base}.mp4`, png = `.acervo/eventos/${base}-capa.png`, webp = `.acervo/eventos/${base}-capa.webp`;
const dur = String(+(+fim - +ini).toFixed(3));

const audio = som ? ['-ss', som.ini, '-t', dur, '-i', som.arq, '-map', '0:v', '-map', '1:a', '-af', `afade=t=in:d=0.25,afade=t=out:st=${+dur - 0.6}:d=0.6`, '-c:a', 'aac', '-b:a', '128k'] : ['-an'];
const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', ini, '-t', dur, '-i', master, ...audio, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-shortest', mp4], { encoding: 'utf8' });
if (r.status !== 0) { console.error('ffmpeg:', r.stderr.slice(0, 400)); process.exit(1); }
spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(+ini + 0.6), '-i', master, '-frames:v', '1', png]);
await sharp(png).resize(720, 1280, { fit: 'cover' }).webp({ quality: 82 }).toFile(webp);
console.log(`${mp4}: ${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB, ${dur} s | ${webp}: ${(fs.statSync(webp).size / 1e3).toFixed(0)} KB`);

for (const [arq, tipo] of [[mp4, 'video/mp4'], [webp, 'image/webp']]) {
  const chave = `eventos/${path.basename(arq)}`;
  const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/royals-acervo/objects/${chave}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': tipo }, body: fs.readFileSync(arq) });
  console.log(resp.ok ? `R2 ok: https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev/${chave}` : `ERRO R2 ${resp.status} ${chave}: ${(await resp.text()).slice(0, 200)}`);
}
