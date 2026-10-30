# ARCHITECTURE

```
src/
  app/                    rotas (App Router). layout.tsx = fonte Archivo, Topo, Rodape, BarraIngressos (mobile)
    page.tsx              home (ordem do wireframe do brandbook)
    eventos/ · relembre-momentos/ · melhores-momentos/ · promoters/ · obrigado/ · sobre/ · contato/ · privacidade/ · termos/
    robots.ts · sitemap.ts · manifest.ts · icon.png · apple-icon.png · opengraph-image.jpg (gerados por scripts/marca-imagens.mjs)
  components/
    Marca.tsx             Logo (SVG), LogoRevela (logo reveal do brandbook em CSS), Marcador (três barras), Assinatura
    marca/logo-camadas.ts camadas nomeadas do logo (crown-*, letter-01..06, logo-tagline) para a animação
    Revela.tsx            IntersectionObserver → classe "visivel" (dispara .sobe / .surge / marcador / logo)
    Botao · CabecalhoSecao · Regua (InfoRule) · CartaoEvento (EventCard) · Galeria (MediaTile + lightbox) · VideoTopo
    FundoLoop (fundos em loop da biblioteca de motion: F1 diagonais, F2 brilho; CSS com @property --orbita, pausa fora da tela) · ContaNumero (contagem ao entrar na tela)
    Carregando (spinner da marca, três barras) · Topo (header fixo + menu tela cheia) · Rodape · BarraIngressos · PaginaEvento (molde de evento próximo/passado)
  data/
    eventos.ts            os 14 eventos (data, local, atrações, janela de posts, palavras-chave, cor, ingressos)
    instagram.json        GERADO por scripts/instagram-sync.mjs (não editar à mão)
  lib/
    acervo.ts             liga posts a eventos (palavras da legenda, depois janela de datas), capa, destaque, formatos
    galeria.ts            mídia do acervo → itens da Galeria (componente de navegador)
    site.ts               URL, nome, menu
  styles/tokens/          tokens copiados do design system (cores, tipografia, espaçamento, efeitos, motion)
  app/globals.css         componentes da marca em CSS (classes em português)
scripts/
  instagram-sync.mjs      Graph API (business_discovery) → .acervo/ (fora do git) → webp/mp4 → R2 royals-acervo → instagram.json
  marca-imagens.mjs       ícones e imagem de compartilhamento a partir dos SVGs
  capas-videos.mjs        capa padronizada de cada vídeo: escolhe o quadro (cor, contraste, nitidez; ajuste manual em src/data/capas-ajustes.json), trata no padrão do brandbook (4:5, ouro, vinheta, grão) → R2 capas/ → src/data/capas-videos.json
  video-desktop.mjs       master 16:9 do Remotion → versão do site (1080p, sem áudio) + capa webp → R2 eventos/
public/marca/             SVGs do logo (sem metadados) e ícone 512
public/eventos/<slug>/    logos de evento
```

## Fluxo do conteúdo
Instagram → `pnpm instagram` → `instagram.json` (URLs do R2) → `lib/acervo.ts` agrupa por evento → páginas estáticas no build.
Evento "próximo" × "passado" é decidido no build pela data de Manaus: depois do dia da festa, um novo build/deploy move o evento para o acervo.

## Marca endossada no código
Página de evento troca só `--event-accent` / `--event-on-accent` (cor do evento em `eventos.ts`), o logo e a imagem. Header, rodapé e tipografia continuam Royals.

## Vídeo do topo
`VideoTopo` escolhe a versão: desktop (≥900 px e deitado) usa `evento.videoDesktop` (16:9, montado no remotion-studio com a metade esquerda livre para o bloco do evento) e a classe `hero--lateral` troca o degradê de baixo por um degradê da esquerda; celular: `evento.videoCelular` (9:16 montado no remotion-studio, composição Baile-Chefin-Apresentacao-Celular: a coluna de conteúdo do 16:9 no alto, a 82%, e a metade de baixo só com atmosfera; preparado por `scripts/video-celular.mjs`) toca ATRÁS do topo, com a classe `hero__midia--celular` (sem véu em cima, degradê forte só da metade para baixo); sem ele, o reel vertical do acervo. No celular o bloco do evento fica enxuto para começar na metade da tela: logo menor (min(230px, 56vw)), régua só com data e local, botões lado a lado, sem a assinatura. A barra fixa de ingressos (`BarraFixa`) some enquanto os botões do topo estão na tela.
Vitrines da home (vídeos e "No Instagram"): `umPorEvento` (uma peça por evento, a mais curtida, "A noite" na frente) + `fileirasCheias` (corta no múltiplo das colunas) + `grade--vitrine-4/6` (colunas fixas por largura).


## Abertura, spinner e transições de página (16/10)
- `AberturaMarca` (só na home): cortina com o `LogoRevela` em 3,4 s (fio → coroa → ROYALS → descritor → 1 s parada com a logo completa → cortina sobe). Toda em CSS (`.abertura`), já vem no HTML; sem JS a cortina sai sozinha. JS: pular (toque/clique/Esc), travar rolagem (`html.abertura-ativa`), não tocar quando a home é aberta navegando no site (`visita.navegou` em `src/lib/transicoes.ts`) e avisar o topo (`Revela aguardaAbertura` espera o evento `royals:abertura-fim`).
- `Carregando`: spinner da marca = a coroa (`src/components/marca/coroa.ts`, paths tirados de `logo-camadas.ts`) desenhando, enchendo de ouro e brilhando em loop de 1,6 s; com `texto`, o logotipo ROYALS enche embaixo. Mesma API de antes.
- `TransicaoPagina` (no layout): intercepta clique em link interno → metade "cobrir" → `router.push` → com a rota pintada, metade "revelar". Voltar/avançar: só revelar. Movimento reduzido: navega direto. Rota lenta: spinner aparece depois de 300 ms coberto. Mapa em `src/lib/transicoes.ts` (a transição é a do DESTINO):
  `/` diagonais (T1) · `/eventos*` faixas (T2) · `/relembre-momentos*` cortina (03) · `/melhores-momentos` glitch (T3) · `/promoters` colunas (T2 girada) · `/sobre` diagonais-inv · `/contato` cortina-inv · resto fade. CSS: `.transicao--<tipo>` + `--cobrindo/--coberto/--revelando`; as peças andam por `translate`/`scale` (propriedades individuais).

- `Carrossel` (16/10): faixa infinita só em CSS (fileira duplicada, anda metade do trilho; `sentido` esquerda|direita; duração = itens × `segundosPorItem`). Largura da tela toda com máscara nas bordas (`secao--carrossel` corta o excesso). Para no hover/foco e fora da tela; com movimento reduzido vira fileira arrastável. Na home: Relembre momentos → direita (todas as edições, `CartaoEvento`); Melhores momentos → esquerda (`Galeria carrossel`, um vídeo por evento, abre o visualizador).
- `Logo brilho` (16/10): fio de luz branca na logo do menu (topo e menu do celular) e do rodapé, o `Shine` das revelações do remotion-studio portado para CSS (`.logo-brilho::after`: faixa fina a −18° recortada pela própria imagem da logo via mask). Passa em 1,3 s a cada 6 s (rodapé defasado em ~3 s) e no hover da logo do menu; com movimento reduzido, não aparece.
- Chamada dos Promoters com pessoa (16/10): influencer recortada (rembg local, `D:\devvatar-relight\scripts
emover_fundo.py`; original e recorte em `.acervo/influencer/`) exportada em `public/pessoas/promoters-{640,1100}.webp`. Classe `chamada--pessoa`: foto ancorada na base à direita, atrás do botão (z-index 1 < botão 3), base em degradê; foto limpa (sem sombra/degradê). A coroa do Pulso é o charme: no desktop pulsa no centro exato da caixa (texto à esquerda em max 36vw, pessoa à direita); no celular fica centralizada logo acima da cabeça dela. A luz do Pulso acompanha a coroa.
- Vitrine "No Instagram" (16/10, curadoria): um post por evento com flyer ou capa de reel PROFISSIONAL, com a imagem original do Instagram. Regra: `evento.vitrine ?? evento.capa`; sem os dois (Baile das Bruxas), o post automático com a capa padronizada do vídeo. Quadros em 4:5. Para curar de novo: `node scripts/curadoria-instagram.mjs` gera provas de contato numeradas por evento em `.acervo/curadoria/` (<slug>.jpg + .txt com os ids).
- Fio de luz também na logo do manifesto (16/10): `LogoRevela` dentro de `.logo-brilho.manifesto__brilho` (máscara = royals-gold-transparent.svg, mesma proporção do SVG). Só liga com `.revela.visivel`, 3,4 s depois (quando a logo termina de se montar), e repete a cada 6 s.
- Som no vídeo do topo (16/10): os vídeos do Baile têm versão com trilha (`-som`: `video-desktop.mjs --som`; `video-celular.mjs ... --som <master 16:9> <início>`, com fade nas pontas do loop) e `som: true` nos dados. O vídeo começa mudo (regra dos navegadores) e o `BotaoSom`, na fileira de botões do topo, liga o áudio com um toque; desliga sozinho quando o topo sai da tela ou a aba fica oculta. `VideoTopo` e `BotaoSom` conversam por `src/lib/somTopo.ts` (useSyncExternalStore).
- Evento coproduzido (16/10): `evento.parceiros` ({ nome, logo }) troca a assinatura "Uma produção ROYALS" por "Apresentam" + Royals | parceiros (logos em marfim com fundo transparente, geradas das originais do remotion-studio por luminância → `public/eventos/<slug>/parceiros/`). Baile das Bruxas: 100 Mídia e Baile do Poderoso. Vale no topo da home (desktop) e na página do evento.
- Topo no desktop CABE na altura da tela (16/10): se o bloco do evento passa de 100svh, o vídeo 16:9 é ampliado e corta as laterais. Logo limitado a 48svh, espaçamentos que encolhem em tela baixa, três botões sempre numa linha (o de som vira ícone < 1360 px) e, abaixo de 680 px de altura, a assinatura sai do topo. Conferido em 1920×1080, 1440×900, 1366×768, 1280×720, 1024×768 e 960×600.
- Varredura do celular (16/10): 13 rotas × 320/360/390/414 px, sem rolagem lateral, título cortado, imagem quebrada nem botão estourado. Ajustes: títulos menores abaixo de 380 px, frase do manifesto em 8vw (logo 61vw) abaixo de 480 px, botões do topo quebram linha em vez de empurrar a página, logos dos parceiros menores abaixo de 420 px, plural certo na contagem de fotos/vídeos da página do evento.

## Royals Tickets · checkout (16/10/2026)
- Rota `/eventos/<slug>/checkout` (`src/app/eventos/[slug]/checkout/page.tsx` + `src/components/checkout/Checkout.tsx` + `checkout.css`), portada do modelo aprovado (`D:\CLIENTES BRANDSQUADS\Royals Tickets\Checkout`). Etapas: ingressos (inteira/meia, limite por pedido) → dados (máscaras, CPF validado) → pagamento (Pix / cartão até 12x) + resumo fixo; no celular, barra com o total. Esconde menu, rodapé e barra de ingressos do site (`body:has(.ck)`).
- Dados por evento em `src/data/ingressos.ts` (centavos). Lote com contagem, depoimentos e compras recentes só com dado real (vazio = oculto).
- Banner do evento em 3 tamanhos (contrato do modelo): desktop 1920×640 (≥1024 px), tablet 1280×720 (640–1023), celular 1080×1350 (<640) → `public/eventos/<slug>/banner/{desktop,tablet,celular}.webp` (Baile: remotion-studio `Baile-Banner-Checkout-*`). O checkout escreve nome/data/selos no canto de baixo à esquerda: o banner deixa essa área escura.
- `vendasAbertas: false` = PRÉVIA para os sócios: noindex, fora do sitemap, sem link no site; o "Pagar" valida e abre o aviso "a venda pelo site abre em breve" → Igarê. Pagar.me (cobrança, webhook, pedidos, estoque, e-mail com QR Code) é a próxima etapa.

## Varandinha · página de evento coproduzido com galeria externa (19/10/2026)
- `/eventos/varandinha` (Royals × Cúpulla, 01/11/2026). Campos novos em `eventos.ts`: `instagram` (botão no topo quando não há ingresso), `estilo` (régua sem atração anunciada: "Estilo"), `ingressosEmBreve` (chamada "Vendas em breve" + Instagram; nenhum link inventado), `rotuloAssinatura` ("Realização" em vez de "Apresentam"), `foraDoTopoHome` (o evento entra na agenda, mas o topo da home continua no próximo SEM essa marca: decisão de 19/10, o Baile segue no topo) e `galeriaExterna` (fotos de fora do Instagram da Royals, no R2 por `scripts/galeria-externa.mjs`).
- Galeria externa: 4 fotos das edições de 2024 do @_varandiinha (lidas pela Graph API, `.acervo/varandinha/`), `colunas={4}` para fechar as fileiras (4 no desktop, 2 no celular).
- Vídeo do topo: remotion-studio `Varandinha-Topo-16x9` / `-9x16` (`src/varandinha/TopoSite.tsx`): a varanda ao pôr do sol + janela em ARCO (monograma da marca) com as fotos das edições trocando por uma onda do calçadão; mudo, loop de 416 quadros. Preparado por `video-desktop.mjs` / `video-celular.mjs` → R2 `eventos/varandinha-16x9|9x16`.
- Transição própria: `ondas` (`src/lib/transicoes.ts`, destino `/eventos/varandinha`): 3 camadas sálvia/oliva/verde com borda em onda (máscara SVG) sobem da base e saem por cima.
- `BarraFixa` recebe o `slug` do evento da barra e some nas páginas de OUTRO evento (/eventos/<x> e /relembre-momentos/<x>).
- OG exclusivo (19/10/2026): campo `og` em eventos.ts (1200×630 em public/) vira og:image e twitter:image da página do evento; Varandinha = `public/eventos/varandinha/og.jpg`, gerado por `D:/dev/remotion-studio/scripts/varandinha-og.py`.
- Arte do cartão (19/10/2026): campo `cartaoImagem` (4:5, `-600/-1200.webp`) substitui a capa só no `CartaoEvento`; sem data (o cartão escreve) e com o canto de cima à esquerda livre para o selo. Varandinha: `D:/dev/remotion-studio/scripts/varandinha-cartao.py`.

## /produtores (26/10/2026)
- `src/app/produtores/page.tsx` (seções), `Simulador.tsx` (cliente, só aritmética dos planos), `Formulario.tsx` (cliente) e `produtores.css` (prefixo `prod-`). Conteúdo em `src/data/parceria.ts`.
- `src/app/api/produtores/route.ts`: valida, aplica limite por IP e campo-isca, e repassa para `https://www.brandsquad.com.br/api/leads`.
- A `BarraFixa` (barra de ingressos do celular) não aparece em /produtores.

## /artistas/lucco · página do artista (29/10/2026)
- `src/app/artistas/lucco/page.tsx` + `lucco.css` (tudo dentro de `.lucco`; resets com `:where()` para não pesar sobre as regras dos blocos). Esconde Topo/Rodapé/BarraIngressos com `body:has(.lucco)`, como o checkout. Fontes do artista via `next/font` só na página (`--lf-serif`, `--lf-sans`).
- Conteúdo em `src/data/artistas/lucco.ts`; mídia gerada em `src/data/artistas/lucco-midia.json` por `scripts/lucco-midia.mjs` (fotos webp em `public/artistas/lucco/fotos`; vídeos H.264 + capas + áudios m4a com loudnorm −14 LUFS no R2 `royals-acervo/artistas/lucco/`; picos da onda dos trechos; id, duração e onda do SET SUNRISE lidos da página do SoundCloud).
- **Logo:** só existia em PNG → `scripts/lucco-logo.py` (potrace, 4×; IoU 0,9975 com o PNG) gera `public/artistas/lucco/marca/lucco.svg` e `src/components/lucco/logo.ts` (12 peças: parte de cima e de baixo do corte inclinado de cada letra). `LogoLucco`: contorno desenha → enche → base encaixa no corte → fio de luz no corte → brilho que atravessa (repete a cada 7 s no topo).
- **Abertura** (`AberturaLucco`): uma vez por sessão (`sessionStorage lucco-abertura`), script inline antes da 1ª pintura marca `html.lucco-abertura`/`lucco-sem-abertura` (por isso o `<html suppressHydrationWarning>` no layout raiz), trava de 6,5 s, mínimo 2,4 s, Pular/Esc, cortina para cima. Na navegação interna a decisão é tomada no efeito.
- **Spinner** (`CarregandoLucco`): anel champanhe + o corte da logo batendo a 124 BPM. No play, nos vídeos e na foto ampliada.
- **Player** (`PlayerLucco`): uma fila (set + trechos), um som por vez. Set = widget do SoundCloud num iframe escondido com controle próprio; se o navegador barrar o play (iPhone), mostra o player oficial. Trechos = `Audio` com `crossOrigin` + Web Audio `AnalyserNode` (espectro real); o R2 tem regra de CORS (GET/HEAD) para royalsentretenimento.vercel.app e localhost:3500/127.0.0.x — **domínio novo precisa entrar nessa regra** (sem ela o trecho toca sem a análise). Onda clicável, teclado (espaço, setas), mini-player no `#lucco-dock` quando o deck sai da tela. Eventos: `lucco:tocar`, `lucco:som-player`, `lucco:som-video` (vídeo pausa a música e vice-versa).
- OG: `pecas/og-lucco/og.html` → Chrome headless 1200×630 → `opengraph-image.jpg`/`twitter-image.jpg` da rota.
- Conferência (29/10): 360–1920 px sem estouro lateral; Lighthouse celular: acessibilidade, boas práticas e SEO 100; LCP 1,3 s (4G, CPU 4×), CLS 0. Playwright local: usar `localhost:3500` (no 127.0.0.2 o dev do Next bloqueia o JS e a página não hidrata).
