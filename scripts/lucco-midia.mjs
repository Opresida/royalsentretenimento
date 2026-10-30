// Royals · mídia da página do artista DJ LUCCO (/artistas/lucco), pedido do Humberto em 29/10/2026.
// Uso: node scripts/lucco-midia.mjs [--sem-r2]
// 1. Fotos (já curadas no presskit + a foto nova em alta) → webp 640/1280/2000 em public/artistas/lucco/fotos/.
// 2. Vídeos do Drive do artista (HEVC do iPhone, que nem todo navegador toca) → MP4 H.264 + capa webp:
//    - topo: loop mudo (desktop 16:9 do IMG_1709, celular 9:16 do "Warmup sunrise");
//    - "ao vivo": 720p com som, tocam só no clique.
// 3. Trechos de áudio para o player: o som de cada vídeo, volume igualado (loudnorm −14 LUFS), AAC 160k, com a forma da
//    onda (picos em 0–1) calculada aqui. São trechos do artista tocando ao vivo (o mesmo que ele posta no Instagram).
// 4. SET SUNRISE (SoundCloud): id da faixa, duração e a forma da onda (o JSON do próprio SoundCloud), porque no
//    navegador esse JSON pode vir bloqueado.
// Vídeos e áudios sobem para o R2 royals-acervo em artistas/lucco/. Grava src/data/artistas/lucco-midia.json.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const SEM_R2 = process.argv.includes('--sem-r2');
const R2 = 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev';
const ARTISTA = 'D:/CLIENTES BRANDSQUADS/Royals Entretenimento/DJ LUCCO';
const IMG = `${ARTISTA}/Presskit/fonte/img`;
const VID = `${ARTISTA}/Drive/Vídeos`;
const TMP = '.acervo/artistas/lucco';
const PUB = 'public/artistas/lucco/fotos';
const SOUNDCLOUD = 'https://soundcloud.com/alaf-santos-938996911/set-sunrise';
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(PUB, { recursive: true });
const env = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'cloudflare.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^'|'$/g, '')]));

const ff = (args) => { const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 28 }); if (r.status !== 0) throw new Error(r.stderr.slice(0, 500)); return r; };
async function sobe(arq, chave, tipo) {
  if (SEM_R2) return `${R2}/${chave}`;
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/royals-acervo/objects/${chave}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': tipo }, body: fs.readFileSync(arq) });
  if (!r.ok) throw new Error(`R2 ${r.status} ${chave}: ${(await r.text()).slice(0, 200)}`);
  return `${R2}/${chave}`;
}

// ——— 1. Fotos ———
const FOTOS = [
  ['retrato-alta', `${ARTISTA}/Foto em alta nova/IMG_8044.JPG.jpeg`],
  ['capa', `${IMG}/capa.jpg`], ['bio', `${IMG}/bio.jpg`], ['rider', `${IMG}/rider.jpg`], ['retrato2', `${IMG}/retrato2.jpg`],
  ['vivo1', `${IMG}/vivo1.jpg`], ['vivo3', `${IMG}/vivo3.jpg`], ['vivo4', `${IMG}/vivo4.jpg`],
  ['praia1', `${IMG}/praia1.jpg`], ['praia2', `${IMG}/praia2.jpg`], ['warmup', `${IMG}/warmup.jpg`], ['video1', `${IMG}/video1.jpg`],
  ...['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'].map((g) => [g, `${IMG}/${g}.jpg`]),
];
const fotos = {};
for (const [nome, arq] of FOTOS) {
  const m = await sharp(arq).metadata();
  const w = (m.orientation ?? 1) >= 5 ? m.height : m.width; // foto de celular gira pelo EXIF
  const larguras = [640, 1280, 2000].filter((l, i) => i === 0 || l <= w);
  for (const l of larguras) await sharp(arq).rotate().resize({ width: l }).webp({ quality: l > 1280 ? 80 : 82 }).toFile(`${PUB}/${nome}-${l}.webp`);
  const p = await sharp(`${PUB}/${nome}-640.webp`).metadata();
  fotos[nome] = { w: 640, h: p.height, larguras }; // proporção da foto (w/h), já de pé
}
console.log(`fotos: ${Object.keys(fotos).length}`);

// ——— 2. Vídeos ———
const VIDEOS = {
  // topo (mudo, loop)
  'topo-desktop': { arq: `${VID}/IMG_1709.mov`, ini: 4, dur: 14, vf: 'scale=1920:1080:flags=lanczos', crf: 28, som: false },
  'topo-celular': { arq: `${VID}/Warmup sunrise`, ini: 0, dur: 19.6, vf: 'scale=720:1280:flags=lanczos', crf: 28, som: false },
  // ao vivo (com som, tocam no clique)
  'warmup-sunrise': { arq: `${VID}/Warmup sunrise`, vf: 'scale=720:1280:flags=lanczos', crf: 27, som: true },
  'praia': { arq: `${VID}/Vídeo praia.mov`, vf: 'scale=720:1280:flags=lanczos', crf: 27, som: true },
  'pista': { arq: `${VID}/de16b889057b44e8921e0e0dfdf66a0e.mp4`, vf: 'scale=720:1280:flags=lanczos', crf: 27, som: true },
  'cabine': { arq: `${VID}/IMG_8464.mov`, vf: 'scale=720:-2:flags=lanczos', crf: 27, som: true },
  'open-air': { arq: `${VID}/993543c7-9ad0-4876-96d6-aac44aaa4fc7.mov`, vf: 'scale=720:-2:flags=lanczos', crf: 27, som: true },
};
const videos = {};
for (const [nome, v] of Object.entries(VIDEOS)) {
  const mp4 = `${TMP}/${nome}.mp4`, png = `${TMP}/${nome}.png`, webp = `${TMP}/${nome}-capa.webp`;
  const corte = v.dur ? ['-ss', String(v.ini), '-t', String(v.dur)] : [];
  ff([...corte, '-i', v.arq, '-map', '0:v:0', ...(v.som ? ['-map', '0:a:0', '-c:a', 'aac', '-b:a', '128k', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11'] : ['-an']),
    '-vf', `${v.vf},fps=30,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(v.crf), '-profile:v', 'high', '-movflags', '+faststart', mp4]);
  ff(['-ss', String((v.ini ?? 0) + 0.8), '-i', v.arq, '-frames:v', '1', '-vf', v.vf, png]);
  await sharp(png).webp({ quality: 80 }).toFile(webp);
  const m = await sharp(webp).metadata();
  videos[nome] = { mp4: await sobe(mp4, `artistas/lucco/${nome}.mp4`, 'video/mp4'), capa: await sobe(webp, `artistas/lucco/${nome}-capa.webp`, 'image/webp'), w: m.width, h: m.height, mb: +(fs.statSync(mp4).size / 1e6).toFixed(1) };
  console.log(`vídeo ${nome}: ${videos[nome].mb} MB`);
}

// ——— 3. Trechos de áudio + forma da onda ———
const BARRAS = 72;
function picos(arq) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', arq, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const s = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length >> 1);
  const passo = Math.floor(s.length / BARRAS), out = [];
  for (let b = 0; b < BARRAS; b++) { let q = 0; for (let i = b * passo; i < (b + 1) * passo; i++) q += s[i] * s[i]; out.push(Math.sqrt(q / passo)); }
  const max = Math.max(...out);
  return { picos: out.map((x) => +(x / max).toFixed(3)), dur: +(s.length / 8000).toFixed(1) };
}
const TRECHOS = ['warmup-sunrise', 'praia', 'pista', 'cabine', 'open-air'];
const audios = {};
for (const nome of TRECHOS) {
  const m4a = `${TMP}/${nome}.m4a`;
  const dur = picos(VIDEOS[nome].arq).dur;
  ff(['-i', VIDEOS[nome].arq, '-vn', '-ac', '2', '-af', `loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, dur - 1.2)}:d=1.2`, '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', m4a]);
  audios[nome] = { src: await sobe(m4a, `artistas/lucco/audio/${nome}.m4a`, 'audio/mp4'), dur, picos: picos(m4a).picos };
  console.log(`áudio ${nome}: ${dur} s`);
}

// ——— 4. SET SUNRISE (SoundCloud) ———
let set = { url: SOUNDCLOUD, id: null, dur: null, picos: null };
try {
  const html = await (await fetch(SOUNDCLOUD, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
  const id = html.match(/soundcloud:\/\/sounds:(\d+)/)?.[1] ?? html.match(/"id":(\d+),"kind":"track"/)?.[1];
  const dur = html.match(/"full_duration":(\d+)/)?.[1] ?? html.match(/"duration":(\d+)/)?.[1];
  const wurl = html.match(/"waveform_url":"([^"]+)"/)?.[1];
  set = { ...set, id: id ? +id : null, dur: dur ? Math.round(+dur / 1000) : null };
  if (wurl) {
    const w = await (await fetch(wurl.replace('.png', '.json'))).json();
    const amostras = w.samples, n = 120, passo = amostras.length / n, max = w.height || Math.max(...amostras);
    set.picos = Array.from({ length: n }, (_, b) => { const f = amostras.slice(Math.floor(b * passo), Math.floor((b + 1) * passo)); return +(Math.max(...f) / max).toFixed(3); });
  }
} catch (e) { console.warn('SoundCloud:', e.message); }
console.log(`SET SUNRISE: id ${set.id}, ${set.dur} s, onda ${set.picos ? 'ok' : 'sem'}`);

fs.mkdirSync('src/data/artistas', { recursive: true });
fs.writeFileSync('src/data/artistas/lucco-midia.json', JSON.stringify({ fotos, videos, audios, set }, null, 1));
console.log('ok: src/data/artistas/lucco-midia.json');
