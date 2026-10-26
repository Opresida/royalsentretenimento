# Pacote da LOGO ANIMADA da Royals para produtores parceiros (pedido do Humberto, 26/10/2026).
# Desenvolvido por BrandSquad · brandsquad.com.br
#
# Junta em public/marca/download/animada:
#   - os vídeos renderizados no remotion-studio (composições Royals-Logo-Animada-*): MP4 com fundo preto e WebM com
#     fundo transparente, em 16:9 e 9:16, mais os GIFs;
#   - o código: o componente Remotion (RoyalsLogo + LogoAnimada) e uma versão HTML/CSS pura, feita a partir do SVG
#     oficial em camadas (asset.svg), com a mesma coreografia;
#   - um LEIA-ME e dois ZIPs (só o código, e tudo da animação).
# Uso: python -I scripts/logo-animada-pacote.py   (rodar depois do render no remotion-studio)
import os, re, shutil, zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'public', 'marca', 'download', 'animada')
ESTUDIO = r'D:\dev\remotion-studio'
RENDER = os.path.join(ESTUDIO, 'out', 'royals', 'logo-animada')
ASSET_SVG = r'D:\CLIENTES BRANDSQUADS\Royals Entretenimento\Royals Entretenimento - Material Proprio\assets\logo\asset.svg'
ASSINATURA = 'Desenvolvido por BrandSquad · brandsquad.com.br'

MIDIAS = [f'royals-logo-animada-{v}{s}' for v in ('16x9', '9x16') for s in ('.mp4', '-transparente.webm', '.gif')]

os.makedirs(os.path.join(SAIDA, 'codigo', 'remotion'), exist_ok=True)
os.makedirs(os.path.join(SAIDA, 'codigo', 'web'), exist_ok=True)
for m in MIDIAS:
    shutil.copyfile(os.path.join(RENDER, m), os.path.join(SAIDA, m))

# ——— código Remotion: os dois arquivos do estúdio, como estão ———
for arq in ('RoyalsLogo.tsx', 'LogoAnimada.tsx'):
    shutil.copyfile(os.path.join(ESTUDIO, 'src', 'royals', arq), os.path.join(SAIDA, 'codigo', 'remotion', arq))

# ——— código web: o SVG oficial em camadas, animado só com CSS ———
svg = open(ASSET_SVG, encoding='utf-8').read()
svg = re.sub(r'<metadata>.*?</metadata>', '', svg, flags=re.S)
svg = re.sub(r'\swidth="876" height="876"', '', svg, count=1)
# recorte só da área da logo (o quadro oficial é 876×876 com a logo no meio), com folga para a coroa entrar
svg = svg.replace('viewBox="0 0 876 876"', 'viewBox="40 280 796 320"', 1)
svg = svg.replace('xmlns:c2pa="http://c2pa.org/manifest"', '')
reflexo = svg.replace('<svg ', '<svg class="logo reflexo" aria-hidden="true" ', 1)
svg = svg.replace('<svg ', '<svg class="logo animada" ', 1)

letras = ''.join(
    f'.animada [id^="letter-0{i + 1}-"] {{ animation: sobe .47s {0.8 + i * 0.067:.3f}s cubic-bezier(.16,1,.3,1) both; }}\n'
    for i in range(6))
slogan = ''.join(
    f'.animada [id^="tagline-letter-{i + 1:02d}-"] {{ animation: acende .33s {1.33 + i * 0.033:.3f}s cubic-bezier(.16,1,.3,1) both; }}\n'
    for i in range(14))

html = f'''<!doctype html>
<!--
  ROYALS · LOGO ANIMADA (versão web: HTML + CSS, sem biblioteca)
  {ASSINATURA}

  A logo oficial em camadas se monta em ~3 s e fica respirando:
    coroa (base, asas e pico) → raios dourados → R O Y A L S → ENTRETENIMENTO → brilho metálico.
  Opções na URL:  ?transparente  (sem fundo, para sobrepor)   ?loop  (repete a cada 5 s)
  Para usar num site: copie o <style> e os dois <svg> da .cena; o botão "Repetir" é opcional.
-->
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Royals · logo animada</title>
<style>
  :root {{ --preto: #050505; --ouro: #BB9E38; --ouro-claro: #DBBC58; }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; height: 100%; }}
  body {{ display: grid; place-items: center; background: var(--preto); font-family: system-ui, sans-serif; }}
  body.transparente {{ background: transparent; }}
  .cena {{ position: relative; width: min(86vw, 214vh); aspect-ratio: 796 / 320; display: grid; place-items: center; }}
  .cena::before {{ content: ""; position: absolute; inset: -20% 15%; border-radius: 50%; background: radial-gradient(closest-side, rgba(187,158,56,.22), rgba(5,5,5,0)); opacity: 0; animation: halo 1.5s .67s ease-out both; }}
  body.transparente .cena::before {{ display: none; }}
  .logo {{ position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }}
  .logo #background {{ display: none; }}
  .logo path, .logo g {{ transform-box: fill-box; transform-origin: center; }}

  /* respiração e empurrão lento da câmera, depois de montada */
  .animada {{ animation: respira 3s 2.93s ease-in-out infinite; }}

  /* coroa: base sobe, asas entram dos lados, pico cai por cima */
  .animada #crown-base  {{ animation: base .47s .1s cubic-bezier(.34,1.56,.64,1) both; }}
  .animada #crown-left  {{ animation: asa-esq .47s .23s cubic-bezier(.34,1.56,.64,1) both; }}
  .animada #crown-right {{ animation: asa-dir .47s .3s cubic-bezier(.34,1.56,.64,1) both; }}
  .animada #crown-peak  {{ animation: pico .4s .43s cubic-bezier(.34,1.56,.64,1) both; }}
{letras}{slogan}
  /* brilho metálico: cópia mais clara da logo, vista só por uma faixa que atravessa */
  .reflexo {{ filter: brightness(2.1) saturate(.55); opacity: 0; pointer-events: none;
    -webkit-mask-image: linear-gradient(105deg, transparent 40%, #000 50%, transparent 60%); mask-image: linear-gradient(105deg, transparent 40%, #000 50%, transparent 60%);
    -webkit-mask-size: 300% 100%; mask-size: 300% 100%; animation: brilho .8s 2.07s ease-in-out both; }}

  /* raios que se abrem da coroa quando ela fecha */
  /* centro da coroa no recorte: (499 − 40) / 796 e (364 − 280) / 320 */
  .raios {{ position: absolute; left: 57.7%; top: 26.3%; width: 0; height: 0; }}
  .raios i {{ position: absolute; left: 0; top: 0; width: 2px; height: 22%; background: linear-gradient(var(--ouro-claro), rgba(219,188,88,0)); transform-origin: 50% 0; opacity: 0; animation: raio 1s .67s ease-out both; }}

  @keyframes base    {{ from {{ opacity: 0; transform: translateY(40px); }} }}
  @keyframes asa-esq {{ from {{ opacity: 0; transform: translate(-46px, 12px) rotate(-24deg); }} }}
  @keyframes asa-dir {{ from {{ opacity: 0; transform: translate(46px, 12px) rotate(24deg); }} }}
  @keyframes pico    {{ from {{ opacity: 0; transform: translateY(-60px) scale(1.5); }} }}
  @keyframes sobe    {{ from {{ opacity: 0; transform: translateY(70px) scale(.85); }} }}
  @keyframes acende  {{ from {{ opacity: 0; transform: translateY(10px); }} }}
  @keyframes brilho  {{ 0% {{ opacity: 1; -webkit-mask-position: 100% 0; mask-position: 100% 0; }} 99% {{ opacity: 1; }} 100% {{ opacity: 0; -webkit-mask-position: 0 0; mask-position: 0 0; }} }}
  @keyframes halo    {{ to {{ opacity: 1; }} }}
  @keyframes respira {{ 50% {{ transform: scale(1.012); }} }}
  @keyframes raio    {{ 0% {{ opacity: 0; transform: rotate(var(--a)) translateY(20px) scaleY(.2); }} 15% {{ opacity: .85; }} 100% {{ opacity: 0; transform: rotate(var(--a)) translateY(120px) scaleY(1); }} }}

  .repetir {{ position: fixed; right: 16px; bottom: 16px; padding: 10px 16px; border: 1px solid var(--ouro); background: transparent; color: var(--ouro); font: 600 12px/1 system-ui, sans-serif; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; }}
  .repetir:hover {{ background: var(--ouro); color: var(--preto); }}
  @media (prefers-reduced-motion: reduce) {{ .cena *, .cena::before {{ animation-duration: .01s !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; }} }}
</style>
</head>
<body>
<div class="cena" id="cena">
  <div class="raios" aria-hidden="true">{''.join(f'<i style="--a:{i * 360 / 22:.1f}deg"></i>' for i in range(22))}</div>
  {svg}
  {reflexo}
</div>
<button class="repetir" type="button" onclick="repetir()">Repetir</button>
<script>
  // {ASSINATURA}
  const q = new URLSearchParams(location.search);
  if (q.has('transparente')) document.body.classList.add('transparente');
  function repetir() {{
    const cena = document.getElementById('cena');
    const nova = cena.cloneNode(true);
    cena.replaceWith(nova);
  }}
  if (q.has('loop')) setInterval(repetir, 5000);
</script>
</body>
</html>
'''
open(os.path.join(SAIDA, 'codigo', 'web', 'royals-logo-animada.html'), 'w', encoding='utf-8').write(html)

leia = f'''ROYALS ENTRETENIMENTO · LOGO ANIMADA
{ASSINATURA}

A logo oficial da Royals se monta em 5 segundos: a coroa (base, asas e pico), os raios dourados,
R O Y A L S letra a letra, ENTRETENIMENTO e um brilho metálico; depois fica respirando.

VÍDEOS
  royals-logo-animada-16x9.mp4                1920×1080, fundo preto. Para telão, YouTube, abertura de vídeo.
  royals-logo-animada-9x16.mp4                1080×1920, fundo preto. Para Reels, stories e TikTok.
  royals-logo-animada-16x9-transparente.webm  1920×1080, FUNDO TRANSPARENTE. Para pôr por cima de outro vídeo.
  royals-logo-animada-9x16-transparente.webm  1080×1920, FUNDO TRANSPARENTE.
    O WebM com transparência abre direto no CapCut, no DaVinci Resolve e nos navegadores.
    No Premiere e no After Effects, use o MP4 com o modo de mesclagem "Tela" (Screen), que some com o preto.

GIF
  royals-logo-animada-16x9.gif  960×540    royals-logo-animada-9x16.gif  540×960
  Para sites, e-mail e apresentações (PowerPoint, Keynote, Google Slides).

CÓDIGO
  codigo/web/royals-logo-animada.html
    Versão para site: só HTML e CSS, sem biblioteca. Abra no navegador para ver.
    Na URL: ?transparente (sem fundo) e ?loop (repete a cada 5 s).
    Para levar ao seu site: copie o <style> e o bloco <div class="cena">.
  codigo/remotion/LogoAnimada.tsx + RoyalsLogo.tsx
    Versão Remotion (React), a mesma que gerou os vídeos. Num projeto Remotion:
      1. copie os dois arquivos para src/;
      2. no Root.tsx: import {{ RoyalsLogoAnimadaComposicoes }} from './LogoAnimada';
         e coloque <RoyalsLogoAnimadaComposicoes /> dentro do RemotionRoot;
      3. renderize:
         npx remotion render Royals-Logo-Animada-16x9 royals-16x9.mp4
         npx remotion render Royals-Logo-Animada-9x16-Alfa royals-9x16.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
    Composições: Royals-Logo-Animada-16x9, -9x16, -16x9-Alfa e -9x16-Alfa (transparentes).
    Tempo, cores e tamanho estão no topo do LogoAnimada.tsx (30 qps, 150 quadros).

USO DA MARCA
  Use a logo como está: sem esticar, girar, trocar as cores ou aplicar efeitos por cima.
  Dúvidas sobre a aplicação da marca: fale com a equipe da Royals.

{ASSINATURA}
'''
open(os.path.join(SAIDA, 'LEIA-ME.txt'), 'w', encoding='utf-8').write(leia)

def zipar(nome, arquivos):
    with zipfile.ZipFile(os.path.join(SAIDA, nome), 'w', zipfile.ZIP_DEFLATED) as z:
        for rel in arquivos:
            z.write(os.path.join(SAIDA, rel), rel)

codigo = ['LEIA-ME.txt', 'codigo/web/royals-logo-animada.html', 'codigo/remotion/LogoAnimada.tsx', 'codigo/remotion/RoyalsLogo.tsx']
zipar('royals-logo-animada-codigo.zip', codigo)
zipar('royals-logo-animada-completo.zip', codigo + MIDIAS)
for n in sorted(os.listdir(SAIDA)):
    p = os.path.join(SAIDA, n)
    if os.path.isfile(p): print(f'{n}: {os.path.getsize(p) // 1024} KB')
