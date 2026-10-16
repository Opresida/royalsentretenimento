// Royals · sincroniza o acervo do Instagram (@royalsentretenimento) com o site.
// Uso: node scripts/instagram-sync.mjs [--limite=N] [--sem-upload]
//
// Como funciona
// 1. Lê os posts pela API OFICIAL da Meta (Graph API, "business_discovery"): qualquer conta profissional pode ler o
//    perfil público de outra conta profissional. O token é o do Humberto (app MAZARI Publisher), guardado FORA do repo,
//    em ~/.claude/secrets/meta.env (META_IG_TOKEN). Nunca vai para o repositório nem para a Vercel.
// 2. Baixa cada mídia (o link da Meta expira em poucos dias) para .acervo/bruto/ (fora do git).
// 3. Imagem → webp em dois tamanhos (600 e 1600 px no lado maior). Vídeo → MP4 H.264 com o lado menor em 720 px e
//    "faststart" (começa a tocar antes de baixar tudo) + capa tirada do vídeo (webp 600 e 1600).
// 4. Sobe tudo para o bucket público R2 "royals-acervo" (credenciais em ~/.claude/secrets/cloudflare.env).
// 5. Grava src/data/instagram.json (o catálogo que o site lê). Rodar de novo só baixa e sobe o que é novo.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const SEGREDOS = path.join(os.homedir(), '.claude', 'secrets');
const lerEnv = (arq) => Object.fromEntries(fs.readFileSync(path.join(SEGREDOS, arq), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^'|'$/g, '')]));
const META = lerEnv('meta.env');
const CF = lerEnv('cloudflare.env');

const PERFIL = 'royalsentretenimento';
const BUCKET = 'royals-acervo';
export const R2_PUBLICO = 'https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev';
const GRAPH = 'https://graph.facebook.com/v21.0';
const BRUTO = '.acervo/bruto';
const PRONTO = '.acervo/pronto';
const CATALOGO = 'src/data/instagram.json';
const args = process.argv.slice(2);
const LIMITE = Number((args.find((a) => a.startsWith('--limite=')) || '').split('=')[1]) || Infinity;
const SEM_UPLOAD = args.includes('--sem-upload');

fs.mkdirSync(BRUTO, { recursive: true });
fs.mkdirSync(PRONTO, { recursive: true });
fs.mkdirSync(path.dirname(CATALOGO), { recursive: true });

async function graph(caminho, q) {
  const u = `${GRAPH}/${caminho}?${new URLSearchParams({ ...q, access_token: META.META_IG_TOKEN })}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(u);
    const j = await r.json();
    if (!j.error) return j;
    if (t === 3 || ![4, 17, 32, 613, 2].includes(j.error.code)) throw new Error(`Graph: ${j.error.message}`);
    await new Promise((ok) => setTimeout(ok, 15000 * (t + 1)));
  }
}

// a conta que faz a leitura: a primeira conta profissional ligada ao token
const contas = await graph('me/accounts', { fields: 'instagram_business_account{id,username}' });
const leitor = contas.data.map((p) => p.instagram_business_account).find(Boolean);
if (!leitor) throw new Error('O token não tem conta profissional do Instagram ligada.');

const CAMPOS = 'id,media_type,media_product_type,timestamp,caption,permalink,media_url,thumbnail_url,like_count,comments_count,children{id,media_type,media_url,thumbnail_url}';
let perfil = null;
const posts = [];
let depois = null;
while (posts.length < LIMITE) {
  const media = `media${depois ? `.after(${depois})` : ''}.limit(40){${CAMPOS}}`;
  const r = await graph(leitor.id, { fields: `business_discovery.username(${PERFIL}){username,name,biography,website,followers_count,media_count,profile_picture_url,${media}}` });
  const b = r.business_discovery;
  perfil ??= { usuario: b.username, nome: b.name, bio: b.biography, site: b.website, seguidores: b.followers_count, posts: b.media_count, foto: b.profile_picture_url };
  posts.push(...b.media.data);
  depois = b.media.paging?.cursors?.after;
  process.stdout.write(`\rlidos ${posts.length}/${b.media_count}`);
  // no business_discovery a página não traz "next": segue enquanto houver cursor e posts faltando
  if (!b.media.data.length || !depois || posts.length >= b.media_count) break;
}
console.log('');

// ——— mídia ———
const anterior = fs.existsSync(CATALOGO) ? JSON.parse(fs.readFileSync(CATALOGO, 'utf8')) : { posts: [] };
const jaFeito = new Map(anterior.posts.flatMap((p) => p.midias.map((m) => [m.id, m])));

async function baixar(url, destino) {
  if (fs.existsSync(destino) && fs.statSync(destino).size > 0) return true;
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
      return true;
    } catch (e) {
      if (t === 2) { console.warn(`  falhou ao baixar ${path.basename(destino)}: ${e.message}`); return false; }
    }
  }
}

async function webps(entrada, base) {
  const meta = await sharp(entrada).metadata();
  for (const [suf, lado] of [['600', 600], ['1600', 1600]]) {
    const saida = `${PRONTO}/${base}-${suf}.webp`;
    if (!fs.existsSync(saida)) await sharp(entrada).rotate().resize(lado, lado, { fit: 'inside', withoutEnlargement: true }).webp({ quality: suf === '600' ? 72 : 80 }).toFile(saida);
  }
  const larg = meta.orientation >= 5 ? meta.height : meta.width;
  const alt = meta.orientation >= 5 ? meta.width : meta.height;
  return { w: larg, h: alt };
}

function video(entrada, base) {
  const mp4 = `${PRONTO}/${base}.mp4`;
  if (!fs.existsSync(mp4)) {
    // lado menor em 720 px, sem aumentar o que já é menor; áudio AAC; "faststart" para tocar na hora
    const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', entrada, '-vf', "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)'", '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', mp4], { encoding: 'utf8' });
    if (r.status !== 0) { console.warn(`  ffmpeg falhou em ${base}: ${r.stderr.slice(0, 200)}`); return null; }
  }
  const capa = `${BRUTO}/${base}-capa.jpg`;
  if (!fs.existsSync(capa)) spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', '0.6', '-i', mp4, '-frames:v', '1', '-q:v', '2', capa]);
  const pr = spawnSync(ffmpeg, ['-hide_banner', '-i', mp4], { encoding: 'utf8' });
  const dur = (pr.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/) || []).slice(1).map(Number);
  return { capa, duracao: dur.length ? dur[0] * 3600 + dur[1] * 60 + dur[2] : null };
}

async function subir(arquivo, chave) {
  if (SEM_UPLOAD) return;
  const tipo = arquivo.endsWith('.mp4') ? 'video/mp4' : 'image/webp';
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${BUCKET}/objects/${chave}`;
  for (let t = 0; t < 3; t++) {
    const r = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${CF.CLOUDFLARE_API_TOKEN}`, 'Content-Type': tipo }, body: fs.readFileSync(arquivo) });
    if (r.ok) return;
    if (t === 2) throw new Error(`R2 ${r.status} em ${chave}: ${(await r.text()).slice(0, 200)}`);
  }
}

const catalogo = [];
let novos = 0, semMidia = 0;
for (const [i, p] of posts.entries()) {
  process.stdout.write(`\rprocessando ${i + 1}/${posts.length} (novas mídias: ${novos})`);
  const itens = p.media_type === 'CAROUSEL_ALBUM' ? (p.children?.data || []) : [{ id: p.id, media_type: p.media_type, media_url: p.media_url, thumbnail_url: p.thumbnail_url }];
  const midias = [];
  for (const [k, it] of itens.entries()) {
    const pronto = jaFeito.get(it.id);
    if (pronto) { midias.push(pronto); continue; }
    const base = `${p.id}${itens.length > 1 ? `-${k + 1}` : ''}`;
    // a Meta não entrega o arquivo de alguns reels (música com direito autoral): fica só a capa, e o site leva ao Instagram
    if (!it.media_url) {
      if (!it.thumbnail_url) { semMidia++; continue; }
      const capa = `${BRUTO}/${base}-capa.jpg`;
      if (!(await baixar(it.thumbnail_url, capa))) continue;
      const dim = await webps(capa, base);
      for (const suf of ['600', '1600']) await subir(`${PRONTO}/${base}-${suf}.webp`, `ig/${base}-${suf}.webp`);
      midias.push({ id: it.id, tipo: 'so-capa', w: dim.w, h: dim.h, p: `${R2_PUBLICO}/ig/${base}-600.webp`, g: `${R2_PUBLICO}/ig/${base}-1600.webp` });
      semMidia++;
      novos++;
      continue;
    }
    const ehVideo = it.media_type === 'VIDEO';
    const bruto = `${BRUTO}/${base}.${ehVideo ? 'mp4' : 'jpg'}`;
    if (!(await baixar(it.media_url, bruto))) continue;
    let m;
    if (ehVideo) {
      const v = video(bruto, base);
      if (!v) continue;
      const dim = await webps(v.capa, base);
      await subir(`${PRONTO}/${base}.mp4`, `ig/${base}.mp4`);
      m = { id: it.id, tipo: 'video', w: dim.w, h: dim.h, duracao: v.duracao, video: `${R2_PUBLICO}/ig/${base}.mp4` };
    } else {
      const dim = await webps(bruto, base);
      m = { id: it.id, tipo: 'imagem', w: dim.w, h: dim.h };
    }
    for (const suf of ['600', '1600']) await subir(`${PRONTO}/${base}-${suf}.webp`, `ig/${base}-${suf}.webp`);
    m.p = `${R2_PUBLICO}/ig/${base}-600.webp`;
    m.g = `${R2_PUBLICO}/ig/${base}-1600.webp`;
    midias.push(m);
    novos++;
  }
  catalogo.push({
    id: p.id, data: p.timestamp, tipo: p.media_product_type === 'REELS' ? 'reel' : p.media_type === 'CAROUSEL_ALBUM' ? 'carrossel' : p.media_type === 'VIDEO' ? 'video' : 'imagem',
    legenda: p.caption || '', link: p.permalink, curtidas: p.like_count ?? null, comentarios: p.comments_count ?? null, midias,
  });
}
console.log('');
fs.writeFileSync(CATALOGO, JSON.stringify({ atualizado: new Date().toISOString(), perfil: { ...perfil, foto: undefined }, posts: catalogo }, null, 1));
console.log(`${CATALOGO}: ${catalogo.length} posts | ${novos} mídias novas | ${semMidia} só com capa (sem arquivo na API) | ${catalogo.filter((p) => !p.midias.length).length} posts sem mídia`);
