// Kit de logos para produtores parceiros (pedido do Humberto, 26/10/2026): pega os SVGs oficiais em
// D:\CLIENTES BRANDSQUADS\Royals Entretenimento\Royals Entretenimento - Material Proprio\assets\logo e gera, para cada
// versão, o SVG (cópia fiel), um PNG em alta (fundo transparente, a não ser a original, que já tem o quadro preto) e um
// JPEG com o fundo indicado e uma margem de respiro. Tudo vai para public/marca/download e num ZIP com o kit inteiro.
// Uso: node scripts/logos-download.mjs   (precisa do Chrome instalado e do Python com Pillow)
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ORIGEM = 'D:/CLIENTES BRANDSQUADS/Royals Entretenimento/Royals Entretenimento - Material Proprio/assets/logo';
const SAIDA = path.resolve('public/marca/download');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// largura do PNG em px (a altura segue a proporção do SVG) e o fundo do JPEG
export const VERSOES = [
  { arq: 'royals-original', larg: 3000, fundoJpg: '#050505' },
  { arq: 'royals-gold-transparent', larg: 4000, fundoJpg: '#050505' },
  { arq: 'royals-gold-on-light', larg: 4000, fundoJpg: '#FFFFFF' },
  { arq: 'royals-mono-white', larg: 4000, fundoJpg: '#050505' },
  { arq: 'royals-mono-black', larg: 4000, fundoJpg: '#FFFFFF' },
  { arq: 'royals-symbol-gold', larg: 2000, fundoJpg: '#050505' },
];

fs.mkdirSync(SAIDA, { recursive: true });
const tmp = fs.mkdtempSync(path.join(process.env.TEMP || 'D:/Temp', 'royals-logos-'));
for (const v of VERSOES) {
  const svg = fs.readFileSync(`${ORIGEM}/${v.arq}.svg`, 'utf8');
  fs.writeFileSync(`${SAIDA}/${v.arq}.svg`, svg);
  const vb = svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
  const alt = Math.round((v.larg * vb[3]) / vb[2]);
  fs.copyFileSync(`${ORIGEM}/${v.arq}.svg`, `${tmp}/${v.arq}.svg`);
  fs.writeFileSync(`${tmp}/${v.arq}.html`, `<!doctype html><html><body style="margin:0;background:transparent"><img src="${v.arq}.svg" style="display:block;width:${v.larg}px;height:${alt}px"></body></html>`);
  const png = `${SAIDA}/${v.arq}.png`;
  const r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${tmp}/perfil`, '--default-background-color=00000000',
    `--window-size=${v.larg},${alt}`, `--screenshot=${png}`, `file:///${tmp.split(path.sep).join('/')}/${v.arq}.html`], { encoding: 'utf8' });
  if (!fs.existsSync(png)) { console.error('falhou', v.arq, r.stderr); process.exit(1); }
  console.log(`${v.arq}: png ${v.larg}×${alt}`);
}
// JPEG: o PNG sobre o fundo, com margem de 12% em volta; e o ZIP com tudo
const pyCorpo = `
import json, sys, zipfile, os
from PIL import Image
saida, versoes = sys.argv[1], json.loads(sys.argv[2])
for v in versoes:
    im = Image.open(os.path.join(saida, v['arq'] + '.png')).convert('RGBA')
    m = int(max(im.size) * 0.12)
    fundo = Image.new('RGB', (im.width + 2 * m, im.height + 2 * m), v['fundoJpg'])
    fundo.paste(im, (m, m), im)
    fundo.save(os.path.join(saida, v['arq'] + '.jpg'), quality=93, optimize=True)
    print(v['arq'], 'jpg', fundo.size)
with zipfile.ZipFile(os.path.join(saida, 'royals-kit-de-logos.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    for v in versoes:
        for ext in ('svg', 'png', 'jpg'):
            z.write(os.path.join(saida, v['arq'] + '.' + ext), f"{ext.upper()}/{v['arq']}.{ext}")
    z.writestr('LEIA-ME.txt', LEIA_ME)
print('zip ok')
`;
// vai dentro do ZIP do kit; assinatura pedida pelo Humberto (26/10/2026)
const LEIA_ME = `ROYALS ENTRETENIMENTO · KIT DE LOGOS
Desenvolvido por BrandSquad · brandsquad.com.br

SVG  vetor, qualquer tamanho (sites, impressão, telão)
PNG  alta resolução; fundo transparente (a original já vem no quadro preto)
JPEG alta resolução, com fundo (branco ou preto) e margem

Versões: original, dourada (fundo escuro), dourada para fundo claro, branca, preta e símbolo (só a coroa).
Use os arquivos como estão: sem esticar, girar, trocar as cores ou aplicar efeitos.
Dúvidas sobre a aplicação da marca: fale com a equipe da Royals.

Desenvolvido por BrandSquad · brandsquad.com.br
`;
const py = `LEIA_ME = ${JSON.stringify(LEIA_ME)}
` + pyCorpo;
const r = spawnSync('python', ['-I', '-c', py, SAIDA, JSON.stringify(VERSOES)], { encoding: 'utf8' });
process.stdout.write(r.stdout); if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
fs.rmSync(tmp, { recursive: true, force: true });
