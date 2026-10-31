// Royals · mídia da página do artista DJ BERTOLOSSI (/artistas/bertolossi), pedido do Humberto em 31/10/2026.
// Uso: node scripts/bertolossi-midia.mjs [--sem-r2] [--so-fotos] [--videos=nome,nome] [--so-capas]
//   --videos: refaz só esses vídeos (e os áudios deles); o resto vem do JSON anterior. --so-capas: só as capas, a partir
//   dos MP4 já cortados em .acervo (capa = quadro escolhido a dedo em `capa`, segundos dentro do clipe).
// 1. Fotos (já tratadas no presskit v2: ao vivo ampliadas e com a cor "noite no morro", quadros dos vídeos, ensaio
//    digital e capas das faixas) → webp 640/1280/2000 em public/artistas/bertolossi/fotos/.
// 2. Vídeos do Drive do artista (HEVC 4K do iPhone, que nem todo navegador toca) → MP4 H.264 + capa webp:
//    - topo: loop mudo (desktop 16:9 do vídeo "Light", celular 9:16 do show de branco IMG_0188);
//    - "ao vivo": 720p com som, tocam só no clique.
// 3. Trechos de áudio para o player: o som de cada vídeo ao vivo, volume igualado (loudnorm −14 LUFS), AAC 160k, com a
//    forma da onda (picos em 0–1).
// 4. Faixas do SoundCloud escolhidas pelo Humberto: id, duração e a forma da onda (o JSON do próprio SoundCloud).
// Vídeos e áudios sobem para o R2 royals-acervo em artistas/bertolossi/. Grava src/data/artistas/bertolossi-midia.json.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const SEM_R2 = process.argv.includes('--sem-r2');
const SO_FOTOS = process.argv.includes('--so-fotos');
const SO_CAPAS = process.argv.includes('--so-capas');
const SO = process.argv.find((a) => a.startsWith('--videos='))?.slice(9).split(',') ?? null;
const refaz = (nome) => !SO || SO.includes(nome);
const R2 = 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev';
const ARTISTA = 'D:/CLIENTES BRANDSQUADS/Royals Entretenimento/DJ BERTOLOSSI';
const IMG = `${ARTISTA}/Presskit/fonte/img`;
const DIV = fs.readdirSync(`${ARTISTA}/Drive`).find((d) => d.startsWith('VIDEOS DE DIVULGA')); // nome com acento: acha pela pasta
const VID = `${ARTISTA}/Drive/${DIV}`;
const VID2 = `${ARTISTA}/Videos`;
const TMP = '.acervo/artistas/bertolossi';
const PUB = 'public/artistas/bertolossi/fotos';
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(`${PUB}/capas`, { recursive: true });
const env = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'cloudflare.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^'|'$/g, '')]));
const anterior = fs.existsSync('src/data/artistas/bertolossi-midia.json') ? JSON.parse(fs.readFileSync('src/data/artistas/bertolossi-midia.json', 'utf8')) : {};

const ff = (args) => { const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 28 }); if (r.status !== 0) throw new Error(r.stderr.slice(0, 500)); return r; };
async function sobe(arq, chave, tipo) {
  if (SEM_R2) return `${R2}/${chave}`;
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/royals-acervo/objects/${chave}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': tipo }, body: fs.readFileSync(arq) });
  if (!r.ok) throw new Error(`R2 ${r.status} ${chave}: ${(await r.text()).slice(0, 200)}`);
  return `${R2}/${chave}`;
}
/** acha o arquivo pelo começo do nome (os nomes do Drive têm acento e espaço no fim) */
const acha = (pasta, inicio) => { const n = fs.readdirSync(pasta).find((f) => f.normalize('NFC').startsWith(inicio)); if (!n) throw new Error(`não achei ${inicio} em ${pasta}`); return `${pasta}/${n}`; };

// ——— 1. Fotos ———
const FOTOS = [
  'vivo-1050', 'vivo-1051', 'vivo-1052', 'vivo-1053-pb', 'vivo-1054-pb',
  'casa-28', 'casa-60', 'casa-84', 'casa-108', 'casa-152',
  'bday-10', 'bday-20', 'bday-26', 'bday-58', 'palco-0',
  'g-light-26', 'g-light-34', 'g-light-54',
  'ensaio-beco', 'ensaio-cabine', 'ensaio-escadaria', 'ensaio-paredao',
];
const CAPAS = ['vida-rasa', 'piquezinho', 'famosa', 'barreira', 'elas-pulam', 'bom-dia', 'borogodo', 'conto-do-vigario', 'louca-de-gin'];
const fotos = SO || SO_CAPAS ? anterior.fotos : {};
for (const nome of SO || SO_CAPAS ? [] : FOTOS) {
  const arq = `${IMG}/${nome}.jpg`;
  const m = await sharp(arq).metadata();
  const larguras = [640, 1280, 2000].filter((l, i) => i === 0 || l <= m.width);
  for (const l of larguras) await sharp(arq).rotate().resize({ width: l }).webp({ quality: l > 1280 ? 80 : 82 }).toFile(`${PUB}/${nome}-${l}.webp`);
  const p = await sharp(`${PUB}/${nome}-640.webp`).metadata();
  fotos[nome] = { w: 640, h: p.height, larguras };
}
for (const nome of SO || SO_CAPAS ? [] : CAPAS) await sharp(`${IMG}/capas/${nome}.jpg`).resize({ width: 480 }).webp({ quality: 84 }).toFile(`${PUB}/capas/${nome}.webp`);
console.log(`fotos: ${Object.keys(fotos).length} + ${CAPAS.length} capas`);
if (SO_FOTOS) {
  fs.writeFileSync('src/data/artistas/bertolossi-midia.json', JSON.stringify({ ...anterior, fotos }, null, 1));
  process.exit(0);
}

// ——— 2. Vídeos ———
const V9 = 'scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280';
const VIDEOS = {
  // topo (mudo, loop)
  'topo-desktop': { arq: acha(VID, 'BERTOLOSSI LIGHT'), ini: 22, dur: 16, vf: 'scale=1920:1080:flags=lanczos', crf: 28, som: false, capa: 8 },
  'topo-celular': { arq: `${VID2}/IMG_0188.MOV`, ini: 96, dur: 14, vf: V9, crf: 28, som: false, capa: 4 }, // sem o quadro em branco dos 94 s
  // ao vivo (com som, tocam no clique)
  'casa-cheia': { arq: `${VID2}/IMG_0188.MOV`, ini: 78, dur: 52, vf: V9, crf: 27, som: true, capa: 22 },
  'light': { arq: acha(VID, 'BERTOLOSSI LIGHT'), vf: 'scale=1280:720:flags=lanczos', crf: 27, som: true, capa: 29 },
  'all-in': { arq: acha(VID, 'BERTOLOSSI - ALL IN 442'), vf: V9, crf: 27, som: true, capa: 29 },
  'larah-juca': { arq: acha(VID, 'BERTOLOSSI - FESTA DA LARAH'), vf: V9, crf: 27, som: true, capa: 49 },
  'vitrinni': { arq: acha(VID, 'BERTOLOSSI VITRINNI'), vf: V9, crf: 27, som: true, capa: 4 },
  'martins': { arq: `${VID2}/lv_0_20260906093623.mp4`, vf: V9, crf: 27, som: true, capa: 20 },
  'country': { arq: acha(VID, 'BERTOLOSSI - COUNTRY'), vf: V9, crf: 27, som: true, capa: 2 },
};
const videos = { ...(anterior.videos ?? {}) };
for (const [nome, v] of Object.entries(VIDEOS)) {
  if (!SO_CAPAS && !refaz(nome)) continue;
  const mp4 = `${TMP}/${nome}.mp4`, png = `${TMP}/${nome}.png`, webp = `${TMP}/${nome}-capa.webp`;
  if (!SO_CAPAS) {
    const corte = v.dur ? ['-ss', String(v.ini), '-t', String(v.dur)] : [];
    ff([...corte, '-i', v.arq, '-map', '0:v:0', ...(v.som ? ['-map', '0:a:0', '-c:a', 'aac', '-b:a', '128k', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11'] : ['-an']),
      '-vf', `${v.vf},fps=30,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(v.crf), '-profile:v', 'high', '-movflags', '+faststart', mp4]);
  }
  ff(['-ss', String(v.capa ?? 2), '-i', mp4, '-frames:v', '1', png]); // capa escolhida a dedo (ele aparecendo)
  fs.rmSync(webp, { force: true });
  await sharp(png).webp({ quality: 80 }).toFile(webp);
  const m = await sharp(webp).metadata();
  const versao = Date.now().toString(36); // a capa muda de conteúdo: nome novo para não pegar cache
  videos[nome] = {
    mp4: SO_CAPAS ? videos[nome].mp4 : await sobe(mp4, `artistas/bertolossi/${nome}.mp4`, 'video/mp4'),
    capa: await sobe(webp, `artistas/bertolossi/${nome}-capa-${versao}.webp`, 'image/webp'), w: m.width, h: m.height, mb: +(fs.statSync(mp4).size / 1e6).toFixed(1),
  };
  console.log(`vídeo ${nome}: ${videos[nome].mb} MB${SO_CAPAS ? ' (só capa)' : ''}`);
}
if (SO_CAPAS) {
  fs.writeFileSync('src/data/artistas/bertolossi-midia.json', JSON.stringify({ ...anterior, videos }, null, 1));
  console.log('ok (capas)');
  process.exit(0);
}

// ——— 3. Trechos de áudio + forma da onda (do vídeo já cortado) ———
const BARRAS = 72;
function picos(arq) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', arq, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const s = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length >> 1);
  const passo = Math.floor(s.length / BARRAS), out = [];
  for (let b = 0; b < BARRAS; b++) { let q = 0; for (let i = b * passo; i < (b + 1) * passo; i++) q += s[i] * s[i]; out.push(Math.sqrt(q / passo)); }
  const max = Math.max(...out);
  return { picos: out.map((x) => +(x / max).toFixed(3)), dur: +(s.length / 8000).toFixed(1) };
}
const TRECHOS = ['casa-cheia', 'all-in', 'larah-juca', 'vitrinni', 'martins'];
const audios = { ...(anterior.audios ?? {}) };
for (const nome of TRECHOS.filter(refaz)) {
  const m4a = `${TMP}/${nome}.m4a`, origem = `${TMP}/${nome}.mp4`;
  const dur = picos(origem).dur;
  ff(['-i', origem, '-vn', '-ac', '2', '-af', `loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, dur - 1.2)}:d=1.2`, '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', m4a]);
  audios[nome] = { src: await sobe(m4a, `artistas/bertolossi/audio/${nome}.m4a`, 'audio/mp4'), dur, picos: picos(m4a).picos };
  console.log(`áudio ${nome}: ${dur} s`);
}

// ——— 4. Faixas do SoundCloud (escolha do Humberto, 31/10) ———
const SC = {
  'sequencia-antigas-2': 'https://soundcloud.com/djbertolossi/sequenciadasantigas',
  'audiovisual-2025': 'https://soundcloud.com/djbertolossi/audiovisual-set2025',
  'sequencia-antigas-003': 'https://soundcloud.com/djbertolossi/sequencia-das-antigas-003',
  '10-minutos-2026': 'https://soundcloud.com/djbertolossi/10-minutos-2026',
};
const sets = { ...(anterior.sets ?? {}) };
for (const [nome, url] of Object.entries(SC).filter(() => !SO)) {
  let s = { url, id: null, dur: null, picos: null };
  try {
    const html = await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const id = html.match(/soundcloud:\/\/sounds:(\d+)/)?.[1] ?? html.match(/"id":(\d+),"kind":"track"/)?.[1];
    const dur = html.match(/"full_duration":(\d+)/)?.[1] ?? html.match(/"duration":(\d+)/)?.[1];
    const wurl = html.match(/"waveform_url":"([^"]+)"/)?.[1];
    s = { ...s, id: id ? +id : null, dur: dur ? Math.round(+dur / 1000) : null };
    if (wurl) {
      const w = await (await fetch(wurl.replace('.png', '.json'))).json();
      const amostras = w.samples, n = 120, passo = amostras.length / n, max = w.height || Math.max(...amostras);
      s.picos = Array.from({ length: n }, (_, b) => { const f = amostras.slice(Math.floor(b * passo), Math.floor((b + 1) * passo)); return +(Math.max(...f) / max).toFixed(3); });
    }
  } catch (e) { console.warn(`SoundCloud ${nome}:`, e.message); }
  sets[nome] = s;
  console.log(`SoundCloud ${nome}: id ${s.id}, ${s.dur} s, onda ${s.picos ? 'ok' : 'sem'}`);
}

fs.mkdirSync('src/data/artistas', { recursive: true });
fs.writeFileSync('src/data/artistas/bertolossi-midia.json', JSON.stringify({ fotos, videos, audios, sets }, null, 1));
console.log('ok: src/data/artistas/bertolossi-midia.json');
