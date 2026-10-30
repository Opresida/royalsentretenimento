# Logo do DJ LUCCO em vetor (pedido do Humberto, 29/10/2026). O artista só tem a logo em PNG (Drive/Logomarca/Logo.PNG,
# recortada no presskit como lucco-logo.png, 1164x205): ela é ampliada 4x, vetorizada com potrace e separada em peças
# (cada letra tem a parte de cima e a de baixo do corte inclinado). Saída:
#   public/artistas/lucco/marca/lucco.svg (+ -preto.svg)  e  src/components/lucco/logo.ts (gerado: não editar à mão)
# Uso: python scripts/lucco-logo.py   (pip install potracer scipy pillow numpy pymupdf)
import json, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')
import numpy as np, potrace
from PIL import Image
from scipy import ndimage

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEM = pathlib.Path(r'D:\CLIENTES BRANDSQUADS\Royals Entretenimento\DJ LUCCO\Presskit\fonte\img\lucco-logo.png')
ESCALA = 4

alfa = Image.open(ORIGEM).convert('RGBA').getchannel('A')
W, H = alfa.size
grande = np.array(alfa.resize((W * ESCALA, H * ESCALA), Image.LANCZOS)) > 127
rotulos, n = ndimage.label(grande)

def caminho(mascara):
    """potrace de uma peça → path SVG (contornos + furos, regra evenodd), em unidades do PNG original."""
    curvas = potrace.Bitmap(~mascara).trace(  # potracer: pixel "escuro" (0) é o desenho
        turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
    f = lambda p: f'{p.x / ESCALA:.2f} {p.y / ESCALA:.2f}'
    d = []
    for c in curvas:
        d.append(f'M{f(c.start_point)}')
        for s in c.segments:
            d.append(f'C{f(s.c1)} {f(s.c2)} {f(s.end_point)}' if not s.is_corner else f'L{f(s.c)} {f(s.end_point)}')
        d.append('Z')
    return ''.join(d)

# peças: ignora sujeira (< 0,05% da área), ordena da esquerda para a direita
pecas = []
for i, fatia in enumerate(ndimage.find_objects(rotulos), start=1):
    m = rotulos == i
    if m.sum() < grande.sum() * 0.0005: continue
    ys, xs = np.nonzero(m)
    pecas.append({'x': xs.mean() / ESCALA, 'y': ys.mean() / ESCALA, 'x0': xs.min() / ESCALA, 'x1': xs.max() / ESCALA, 'm': m})
pecas.sort(key=lambda p: p['x0'])

# letra de cada peça: as 7 letras ocupam faixas em x; a peça cai na letra cujo centro está mais perto
LETRAS = 'LUCCODJ'
centros = sorted([p for p in pecas], key=lambda p: -p['m'].sum())[:7]
centros = sorted(p['x'] for p in centros)
saida = []
for p in pecas:
    k = int(np.argmin([abs(p['x'] - c) for c in centros]))
    saida.append({'letra': LETRAS[k], 'k': k, 'y': p['y'], 'd': caminho(p['m'])})
# parte de cima x de baixo do corte: dentro da mesma letra, a peça com centro mais baixo é a "base"
for k in range(7):
    grupo = [s for s in saida if s['k'] == k]
    for s in grupo: s['parte'] = 'base' if len(grupo) > 1 and s['y'] == max(g['y'] for g in grupo) else 'topo'
saida.sort(key=lambda s: (s['k'], s['parte'] != 'topo'))

pasta_marca = RAIZ / 'public' / 'artistas' / 'lucco' / 'marca'
pasta_marca.mkdir(parents=True, exist_ok=True)
for nome, cor in (('lucco.svg', '#F3E9DC'), ('lucco-preto.svg', '#120C08')):
    corpo = ''.join(f'<path d="{s["d"]}"/>' for s in saida)
    (pasta_marca / nome).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="{cor}" fill-rule="evenodd">{corpo}</svg>', encoding='utf-8')

ts = ['// GERADO por scripts/lucco-logo.py a partir da logo PNG do artista. Não editar à mão.',
      f"export const LOGO_VIEWBOX = '0 0 {W} {H}';",
      'export const PECAS: { letra: string; i: number; parte: \'topo\' | \'base\'; d: string }[] = ' +
      json.dumps([{'letra': s['letra'], 'i': s['k'], 'parte': s['parte'], 'd': s['d']} for s in saida], ensure_ascii=False) + ';', '']
(RAIZ / 'src' / 'components' / 'lucco').mkdir(parents=True, exist_ok=True)
(RAIZ / 'src' / 'components' / 'lucco' / 'logo.ts').write_text('\n'.join(ts), encoding='utf-8')

# conferência: rasteriza o SVG e compara com o PNG (IoU)
import pymupdf
svg = (pasta_marca / 'lucco.svg').read_bytes()
pix = pymupdf.open('svg', svg)[0].get_pixmap(alpha=True, matrix=pymupdf.Matrix(1, 1))
a = np.frombuffer(pix.samples, np.uint8).reshape(pix.h, pix.w, 4)[:, :, 3][:H, :W] > 127
b = np.array(alfa) > 127
iou = (a & b).sum() / (a | b).sum()
print(f'{len(saida)} peças · ' + ' '.join(f"{s['letra']}{'↑' if s['parte'] == 'topo' else '↓'}" for s in saida) + f' · IoU {iou:.4f}')
sys.exit(0 if iou >= 0.97 else 1)
