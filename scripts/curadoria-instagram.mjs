// Royals · provas de contato para curar a vitrine "No Instagram" da home (pedido do Humberto, 16/10: "mostrar os reels com
// capa profissional ou fotos de chamada de evento", como o reel do Baile das Bruxas e o flyer do Halloween da Royals).
// Uso: node scripts/curadoria-instagram.mjs
// Para cada evento, monta .acervo/curadoria/<slug>.jpg com TODAS as capas originais do Instagram daquele evento (a capa
// que a Royals publicou, não o quadro tirado do vídeo), numeradas, com tipo e curtidas, e lista os ids em <slug>.txt.
// A escolha vai à mão em src/data/eventos.ts, no campo `vitrine` (id do post).
import fs from 'fs';
import ts from 'typescript';
import sharp from 'sharp';

const src = ts.transpileModule(fs.readFileSync('src/data/eventos.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', src)(mod, mod.exports);
const EVENTOS = mod.exports.EVENTOS;
const ig = JSON.parse(fs.readFileSync('src/data/instagram.json', 'utf8'));

// mesma regra de src/lib/acervo.ts (eventoDoPost)
const dia = (iso) => iso.slice(0, 10);
const addDias = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const eventoDoPost = (p) => EVENTOS.find((e) => e.palavras && e.palavras.test(p.legenda) && dia(p.data) >= addDias(e.janela[0], -20) && dia(p.data) <= addDias(e.janela[1], 30))
  ?? EVENTOS.find((e) => dia(p.data) >= e.janela[0] && dia(p.data) <= e.janela[1]);

const TW = 180, TH = 225, COLS = 8, ROT = 26;
fs.mkdirSync('.acervo/curadoria', { recursive: true });
const posts = ig.posts.filter((p) => p.midias.length && !/ganhador/i.test(p.legenda));
for (const e of EVENTOS) {
  const lista = posts.filter((p) => eventoDoPost(p)?.slug === e.slug).sort((a, b) => a.data.localeCompare(b.data));
  if (!lista.length) continue;
  const tiles = [];
  for (const [i, p] of lista.entries()) {
    const buf = Buffer.from(await (await fetch(p.midias[0].p)).arrayBuffer());
    const img = await sharp(buf).resize(TW, TH, { fit: 'contain', background: '#1a1a1a' }).toBuffer();
    const rot = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${ROT}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="18" font-family="Arial" font-size="15" font-weight="700" fill="#DBBC58">${i + 1}</text><text x="34" y="18" font-family="Arial" font-size="12" fill="#ccc">${p.tipo} · ${p.curtidas ?? '?'}♥ · ${p.data.slice(0, 10)}</text></svg>`);
    const tile = await sharp({ create: { width: TW, height: TH + ROT, channels: 3, background: '#000' } }).composite([{ input: img, top: 0, left: 0 }, { input: rot, top: TH, left: 0 }]).png().toBuffer();
    tiles.push(tile);
  }
  const linhas = Math.ceil(tiles.length / COLS);
  await sharp({ create: { width: COLS * (TW + 6), height: linhas * (TH + ROT + 6), channels: 3, background: '#222' } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % COLS) * (TW + 6), top: Math.floor(i / COLS) * (TH + ROT + 6) })))
    .jpeg({ quality: 82 }).toFile(`.acervo/curadoria/${e.slug}.jpg`);
  fs.writeFileSync(`.acervo/curadoria/${e.slug}.txt`, lista.map((p, i) => `${i + 1}\t${p.id}\t${p.tipo}\t${p.curtidas}\t${p.legenda.replace(/\s+/g, ' ').slice(0, 90)}`).join('\n'));
  console.log(e.slug, lista.length);
}
