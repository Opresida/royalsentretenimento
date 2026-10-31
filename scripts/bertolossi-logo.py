# Logo do DJ BERTOLOSSI em vetor (pedido do Humberto, 31/10/2026, página /artistas/bertolossi). A logo só existe em PNG
# (Drive do artista, LOGO BERTOLOSSI/LOGO-6.png, com alfa): recorta, amplia 3x, vetoriza com potrace e separa em peças
# (cada parte do estêncil vira uma peça; a linha de cima é BERTOLOSSI e a de baixo HITMAKER). Saída:
#   public/artistas/bertolossi/marca/bertolossi.svg (+ -preto.svg)  e  src/components/bertolossi/logo.ts (gerado: não editar à mão)
# Uso: python scripts/bertolossi-logo.py   (pip install potracer scipy pillow numpy pymupdf)
import json, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')
import numpy as np, potrace
from PIL import Image
from scipy import ndimage

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEM = pathlib.Path(r'D:\CLIENTES BRANDSQUADS\Royals Entretenimento\DJ BERTOLOSSI\Drive\LOGO BERTOLOSSI\LOGO-6.png')
ESCALA = 3
MARGEM = 4

img = Image.open(ORIGEM).convert('RGBA')
x0, y0, x1, y1 = img.getchannel('A').getbbox()
alfa = img.crop((x0 - MARGEM, y0 - MARGEM, x1 + MARGEM, y1 + MARGEM)).getchannel('A')
W, H = alfa.size
grande = np.array(alfa.resize((W * ESCALA, H * ESCALA), Image.LANCZOS)) > 127
rotulos, n = ndimage.label(grande)

def caminho(mascara):
    """potrace de uma peça → path SVG (contornos + furos, regra evenodd), em unidades do recorte original."""
    curvas = potrace.Bitmap(~mascara).trace(turdsize=6, alphamax=1.0, opticurve=True, opttolerance=0.2)
    f = lambda p: f'{p.x / ESCALA:.2f} {p.y / ESCALA:.2f}'
    d = []
    for c in curvas:
        d.append(f'M{f(c.start_point)}')
        for s in c.segments:
            d.append(f'C{f(s.c1)} {f(s.c2)} {f(s.end_point)}' if not s.is_corner else f'L{f(s.c)} {f(s.end_point)}')
        d.append('Z')
    return ''.join(d)

# peças: ignora sujeira; linha pela altura do centro (HITMAKER fica bem abaixo do nome)
pecas = []
total = grande.sum()
for i, _ in enumerate(ndimage.find_objects(rotulos), start=1):
    m = rotulos == i
    if m.sum() < total * 0.0004: continue
    ys, xs = np.nonzero(m)
    pecas.append({'x': xs.mean() / ESCALA, 'y': ys.mean() / ESCALA, 'x0': xs.min() / ESCALA, 'm': m})
corte = H * 0.72  # abaixo disso é a linha do HITMAKER
saida = []
for linha in ('nome', 'sub'):
    grupo = sorted([p for p in pecas if (p['y'] > corte) == (linha == 'sub')], key=lambda p: p['x0'])
    for k, p in enumerate(grupo):
        saida.append({'linha': linha, 'i': k, 'x': round(p['x'] / W, 4), 'd': caminho(p['m'])})

pasta_marca = RAIZ / 'public' / 'artistas' / 'bertolossi' / 'marca'
pasta_marca.mkdir(parents=True, exist_ok=True)
for nome, cor in (('bertolossi.svg', '#F6F2EA'), ('bertolossi-preto.svg', '#0C0C0E')):
    corpo = ''.join(f'<path d="{s["d"]}"/>' for s in saida)
    (pasta_marca / nome).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="{cor}" fill-rule="evenodd">{corpo}</svg>', encoding='utf-8')

ts = ['// GERADO por scripts/bertolossi-logo.py a partir da logo PNG do artista. Não editar à mão.',
      f"export const LOGO_VIEWBOX = '0 0 {W} {H}';",
      "export const PECAS: { linha: 'nome' | 'sub'; i: number; x: number; d: string }[] = " +
      json.dumps(saida, ensure_ascii=False) + ';', '']
(RAIZ / 'src' / 'components' / 'bertolossi').mkdir(parents=True, exist_ok=True)
(RAIZ / 'src' / 'components' / 'bertolossi' / 'logo.ts').write_text('\n'.join(ts), encoding='utf-8')

# conferência: rasteriza o SVG e compara com o PNG (IoU)
import pymupdf
svg = (pasta_marca / 'bertolossi.svg').read_bytes()
pix = pymupdf.open('svg', svg)[0].get_pixmap(alpha=True, matrix=pymupdf.Matrix(1, 1))
a = np.frombuffer(pix.samples, np.uint8).reshape(pix.h, pix.w, 4)[:, :, 3][:H, :W] > 127
b = np.array(alfa) > 127
iou = (a & b).sum() / (a | b).sum()
nomes = sum(1 for s in saida if s['linha'] == 'nome')
print(f'{len(saida)} peças ({nomes} no nome, {len(saida) - nomes} no HITMAKER) · {W}x{H} · IoU {iou:.4f}')
sys.exit(0 if iou >= 0.97 else 1)
