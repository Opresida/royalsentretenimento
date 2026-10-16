// Royals · gera os ícones e a imagem de compartilhamento a partir dos vetores da marca (public/marca).
// Uso: node scripts/marca-imagens.mjs
import fs from 'fs';
import sharp from 'sharp';

const PRETO = '#050505';
const simbolo = fs.readFileSync('public/marca/royals-symbol-gold.svg');
const logo = fs.readFileSync('public/marca/royals-gold-transparent.svg');

async function icone(lado, saida, folga = 0.2) {
  const s = Math.round(lado * (1 - 2 * folga));
  const sim = await sharp(simbolo, { density: 1200 }).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: lado, height: lado, channels: 4, background: PRETO } }).composite([{ input: sim, gravity: 'center' }]).png().toFile(saida);
  console.log(saida);
}

await icone(512, 'src/app/icon.png');
await icone(180, 'src/app/apple-icon.png', 0.16);
await icone(512, 'public/marca/icone-512.png');

// compartilhamento 1200×630: preto, diagonais da coroa bem leves, fio de ouro e o logo no centro
const W = 1200, H = 630;
const diagonais = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><pattern id="d" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="48" fill="rgba(187,158,56,0.09)"/></pattern></defs><rect width="100%" height="100%" fill="url(#d)"/><rect x="0" y="${H - 6}" width="${W}" height="6" fill="#BB9E38"/></svg>`);
const marca = await sharp(logo, { density: 600 }).resize(760).png().toBuffer();
await sharp({ create: { width: W, height: H, channels: 3, background: PRETO } }).composite([{ input: diagonais }, { input: marca, gravity: 'center' }]).jpeg({ quality: 88 }).toFile('src/app/opengraph-image.jpg');
fs.copyFileSync('src/app/opengraph-image.jpg', 'src/app/twitter-image.jpg');
fs.writeFileSync('src/app/opengraph-image.alt.txt', 'Royals Entretenimento');
fs.writeFileSync('src/app/twitter-image.alt.txt', 'Royals Entretenimento');
console.log('src/app/opengraph-image.jpg');

// grão de filme do fundo "Brilho" (F2 da biblioteca de motion): ruído cinza 200×200, repetido e tremendo via CSS
{
  const lado = 200, px = Buffer.alloc(lado * lado * 3);
  let s = 20261016;
  for (let i = 0; i < lado * lado; i++) { s = (s * 1103515245 + 12345) >>> 0; const v = s >>> 24; px[i * 3] = px[i * 3 + 1] = px[i * 3 + 2] = v; }
  await sharp(px, { raw: { width: lado, height: lado, channels: 3 } }).png().toFile('public/marca/grao.png');
  console.log('public/marca/grao.png');
}
