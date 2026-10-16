// Royals · capas padronizadas dos vídeos do acervo (pedido do Humberto, 16/10/2026: "uma capa para cada um, no padrão
// do brandbook Royals, padronizar, senão fica solto demais").
// Uso: node scripts/capas-videos.mjs [--refazer] [--sem-upload]
//
// Para cada vídeo (e cada reel que a Meta entrega só com a capa):
// 1. ESCOLHE O QUADRO: tira 9 quadros (de 10% a 90% da duração) e pontua cada um: cor (gente, luz de palco) e
//    contraste valem ponto; quadro escuro demais, estourado ou chapado (as telas de texto dos anúncios) perde ponto.
//    Dá para fixar o segundo à mão em src/data/capas-ajustes.json ({ "<id da mídia>": 12.5 }).
// 2. TRATA A IMAGEM na direção de fotografia do brandbook: pretos profundos, altas-luzes quentes puxando para o ouro,
//    saturação contida, vinheta e grão leve. Corte em 4:5 (formato de card do brandbook) pelo ponto de interesse.
// 3. Sobe para o R2 (royals-acervo/capas/<id>-600.webp e -1200.webp) e grava src/data/capas-videos.json.
// O texto da capa (tipo, evento, ano, duração) NÃO vai na imagem: é o molde do site, em HTML, igual para todas.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const args = process.argv.slice(2);
const REFAZER = args.includes('--refazer'), SEM_UPLOAD = args.includes('--sem-upload');
const R2 = 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev';
const env = Object.fromEntries(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'cloudflare.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const ig = JSON.parse(fs.readFileSync('src/data/instagram.json', 'utf8'));
const SAIDA = 'src/data/capas-videos.json';
const AJUSTES = 'src/data/capas-ajustes.json';
const ajustes = fs.existsSync(AJUSTES) ? JSON.parse(fs.readFileSync(AJUSTES, 'utf8')) : {};
const feitas = fs.existsSync(SAIDA) && !REFAZER ? JSON.parse(fs.readFileSync(SAIDA, 'utf8')) : {};
const TMP = '.acervo/capas';
fs.mkdirSync(TMP, { recursive: true });

/** Nota de um quadro: cor (Hasler-Süsstrunk) + contraste, com castigo para escuro, estourado e chapado. */
async function nota(arquivo) {
  const { data, info } = await sharp(arquivo).resize(160).raw().toBuffer({ resolveWithObject: true });
  let srg = 0, syb = 0, mrg = 0, myb = 0, ml = 0, sl = 0;
  const n = info.width * info.height, c = info.channels;
  const rg = new Float32Array(n), yb = new Float32Array(n), lu = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * c], g = data[i * c + 1], b = data[i * c + 2];
    rg[i] = r - g; yb[i] = 0.5 * (r + g) - b; lu[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    mrg += rg[i]; myb += yb[i]; ml += lu[i];
  }
  mrg /= n; myb /= n; ml /= n;
  for (let i = 0; i < n; i++) { srg += (rg[i] - mrg) ** 2; syb += (yb[i] - myb) ** 2; sl += (lu[i] - ml) ** 2; }
  const cor = Math.sqrt(srg / n + syb / n) + 0.3 * Math.sqrt(mrg * mrg + myb * myb);
  const contraste = Math.sqrt(sl / n);
  let castigo = 0;
  if (ml < 38) castigo += (38 - ml) * 1.6;
  if (ml > 200) castigo += (ml - 200) * 1.6;
  if (cor < 18) castigo += (18 - cor) * 2; // tela chapada, quase sem cor (o texto dos anúncios)
  // nitidez (estimativa do próprio sharp): quadro borrado (movimento, desfoque de lente) perde ponto
  const { sharpness } = await sharp(arquivo).resize(360).greyscale().stats();
  if (sharpness < 2.2) castigo += (2.2 - sharpness) * 22;
  return cor * 1.0 + contraste * 0.6 + Math.min(sharpness, 6) * 4 - castigo;
}

const quadro = (video, seg, destino, largura = 0) => spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(seg), '-i', video, '-frames:v', '1', ...(largura ? ['-vf', `scale=${largura}:-2`] : []), '-q:v', '2', destino]).status === 0;
const duracao = (video) => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', video], { encoding: 'utf8' });
  const m = r.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
};

// camadas do tratamento (geradas uma vez, no tamanho final 1200×1500)
const W = 1200, H = 1500;
const vinheta = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="v" cx="50%" cy="46%" r="72%"><stop offset="55%" stop-color="#050505" stop-opacity="0"/><stop offset="100%" stop-color="#050505" stop-opacity=".78"/></radialGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="52%" stop-color="#050505" stop-opacity="0"/><stop offset="100%" stop-color="#050505" stop-opacity=".55"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#v)"/><rect width="100%" height="100%" fill="url(#b)"/></svg>`);
const ouro = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#BB9E38" fill-opacity=".34"/></svg>`);
const grao = await sharp('public/marca/grao.png').resize(300).toBuffer();

/** O tratamento do brandbook sobre um quadro: corte 4:5, saturação contida, pretos fundos, luz quente, vinheta, grão. */
async function trata(entrada, base) {
  const img = sharp(entrada).resize(W, H, { fit: 'cover', position: sharp.strategy.attention })
    .modulate({ saturation: 0.78, brightness: 0.97 })
    .linear(1.12, -14) // contraste: pretos mais fundos
    .composite([
      { input: ouro, blend: 'soft-light' },   // altas-luzes quentes, puxando para o ouro
      { input: vinheta, blend: 'over' },
      { input: grao, tile: true, blend: 'soft-light' },
    ]);
  const buf = await img.toBuffer();
  await sharp(buf).webp({ quality: 82 }).toFile(`${TMP}/${base}-1200.webp`);
  await sharp(buf).resize(600, 750).webp({ quality: 76 }).toFile(`${TMP}/${base}-600.webp`);
}

async function sobe(arq, chave) {
  if (SEM_UPLOAD) return;
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/royals-acervo/objects/${chave}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'image/webp' }, body: fs.readFileSync(arq) });
  if (!r.ok) throw new Error(`R2 ${r.status} ${chave}`);
}

const lista = ig.posts.flatMap((p) => p.midias.filter((m) => m.tipo === 'video' || m.tipo === 'so-capa'));
const saida = { ...feitas };
let n = 0;
for (const m of lista) {
  n++;
  const ajuste = ajustes[m.id];
  if (saida[m.id] && ajuste === undefined) continue;
  process.stdout.write(`\r${n}/${lista.length} ${m.id}          `);
  let fonte, seg = null;
  if (m.tipo === 'video') {
    const base = m.video.split('/').pop().replace('.mp4', '');
    const video = `.acervo/pronto/${base}.mp4`;
    if (!fs.existsSync(video)) { console.warn(`\nsem arquivo local: ${video}`); continue; }
    const d = duracao(video);
    if (typeof ajuste === 'number') seg = ajuste;
    else {
      let melhor = -Infinity;
      for (let k = 1; k <= 9; k++) {
        const t = +(d * k / 10).toFixed(2), arq = `${TMP}/_t${k}.jpg`;
        if (!quadro(video, t, arq, 360)) continue;
        const v = await nota(arq);
        if (v > melhor) { melhor = v; seg = t; }
      }
    }
    fonte = `${TMP}/_escolhido.jpg`;
    quadro(video, seg, fonte);
  } else {
    // reel sem arquivo: a capa que a Meta entrega é o único quadro que existe
    fonte = `${TMP}/_capa.webp`;
    fs.writeFileSync(fonte, Buffer.from(await (await fetch(m.g)).arrayBuffer()));
  }
  await trata(fonte, m.id);
  await sobe(`${TMP}/${m.id}-600.webp`, `capas/${m.id}-600.webp`);
  await sobe(`${TMP}/${m.id}-1200.webp`, `capas/${m.id}-1200.webp`);
  saida[m.id] = { p: `${R2}/capas/${m.id}-600.webp`, g: `${R2}/capas/${m.id}-1200.webp`, seg };
  fs.writeFileSync(SAIDA, JSON.stringify(saida, null, 1));
}
console.log(`\n${SAIDA}: ${Object.keys(saida).length} capas`);
