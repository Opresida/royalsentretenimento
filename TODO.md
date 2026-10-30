# TODO

## Pendente
- [x] Publicado em 16/10/2026 com o ok do Humberto: GitHub `Opresida/royalsentretenimento` (branch `main`) + Vercel `opresidas-projects/royalsentretenimento` → https://royalsentretenimento.vercel.app (push na `main` publica sozinho). OG novo (remotion-studio `Royals-OG`)
- [ ] Domínio próprio e e-mail de contato da Royals (hoje o contato é só o Instagram)
- [ ] Regras do programa de promoters e quem recebe os cadastros → abrir o formulário (e atualizar a política de privacidade antes)
- [ ] Revisão jurídica de `/privacidade` e `/termos`
- [ ] Arquivo original do logo (AI/PDF/SVG) para substituir a vetorização a partir do JPEG
- [ ] Fotos em alta resolução dos eventos (o acervo hoje é só o que está no Instagram)
- [ ] Confirmar se "Realeza de rua" pode virar assinatura pública (hoje não aparece como slogan)
- [ ] Confirmar o "10+ anos" (legenda de 2020 sugere início em 2018)
- [ ] Telefones de camarote do Baile das Bruxas, se a Royals quiser no site
- [ ] Estender os fundos em loop / revelações às outras seções da home, se o Humberto aprovar o padrão
- [ ] Painel /admin (2ª etapa)
- [ ] Aba Vídeos: decidir curadoria (anúncios fora da biblioteca?) e trocar as 14 abas por fileiras por evento
- [x] Hero no celular (16/10, refeito): o bloco separado saiu; vídeo 9:16 novo ATRÁS do topo (conteúdo no alto, metade de baixo livre), logo do evento menor e bloco enxuto. Próximos eventos: montar a versão celular no remotion-studio e preencher `videoCelular`
- [x] Abertura com a logo (home, 2,4 s), spinner da coroa e uma transição de página por rota, da biblioteca de motion (16/10)
- [x] Vitrines da home (16/10): um item por evento (`umPorEvento`), capas padronizadas, grade sempre fechada (`fileirasCheias`)
- [ ] Depois de 13/11: novo deploy para o Baile das Bruxas virar acervo; rodar `pnpm instagram`

## Concluído
- [x] 16/10/2026 · Home, caixa de Contato: foto da influencer de imprensa à direita, atrás dos botões (mesmo encaixe da caixa dos Promoters, classe `chamada--contato`). Foto recortada em `public/pessoas/contato-640|1100.webp`; original em `.acervo/influencer/contato-imprensa-original.png`. Conferida em 390, 1024 e 1440 px.
- [x] 16/10/2026 · Capa padronizada para os 112 vídeos (quadro escolhido + tratamento do brandbook) e molde único (tipo · evento · ano · duração) na home, em /melhores-momentos e nas galerias dos eventos; sorteios de comentários fora da biblioteca
- [x] 16/10/2026 · Varredura de responsividade (320/360/390/768 px, 12 rotas): títulos, botões e caixas de chamada corrigidos; brilho do fundo dos indicadores suavizado
- [x] 16/10/2026 · Indicadores com fundo "Brilho" (F2) e números que contam; Manifesto com fundo "Diagonais" (F1), frase "Conquistada na pista" e pilares numerados; textos reescritos
- [x] 16/10/2026 · Topo do Baile no desktop com o vídeo do Chefin em 16:9 (reeditado com a metade esquerda livre), degradê lateral; vertical continua no celular
- [x] 16/10/2026 · Spinner da marca (`Carregando`): troca de página, vídeo do topo e visualizador da galeria
- [x] 15/10/2026 · Estrutura Next.js 16 com o design system da Royals (tokens + componentes portados)
- [x] 15/10/2026 · Sincronização do Instagram pela API oficial → R2 `royals-acervo`
- [x] 15/10/2026 · 14 eventos levantados das legendas (2019–2026)
- [x] 15/10/2026 · Todas as páginas do sitemap do brandbook

## Casting · DJ LUCCO (/artistas/lucco)
- [x] 29/10/2026 · Página do artista: logo vetorizada e animada, abertura, spinner, player (SET SUNRISE + 5 trechos ao vivo com espectro), vídeos, formatos, rider, fotos, pedido de data, OG próprio, sitemap
- [ ] **Número de WhatsApp de booking da Royals** em `WHATSAPP_BOOKING` (src/lib/site.ts) → só então publicar
- [ ] Publicar (commit + push na `main`) com o ok do Humberto
- [ ] Os 3 nomes que faltam no line-up da SUN HYPE On Board (29.11) e o camarim real do artista
- [ ] Domínio próprio: incluir na regra de CORS do R2 `royals-acervo` (senão os trechos tocam sem o espectro)
- [ ] Item "Casting" no menu quando houver mais artistas

## Parceria para produtores (/produtores)
- [x] 26/10/2026 · Página de captura com 10 seções, simulador e formulário; privacidade atualizada; sitemap
- [x] 26/10/2026 · VSL no ar: página em formato de VSL (vídeo primeiro, resto abre 2 s antes do fim, linha de ouro no contorno)
- [ ] VSL versão Reels (9:16) para divulgar a página
- [ ] Imagem de compartilhamento (OG) própria da /produtores
- [ ] Link para /produtores no rodapé ou no menu, se o Humberto quiser
- [ ] Confirmar com a Royals: quem custeia atração e estrutura em cada modelo (a página não fala disso)

## Royals Tickets
- [x] Checkout em prévia: /eventos/baile-das-bruxas/checkout (16/10), banner nos 3 tamanhos
- [ ] Confirmar com a produção: lotes, meia-entrada, taxa de serviço (hoje 10% do modelo), parcelamento e classificação
- [ ] Pagar.me: chaves (sandbox → produção), cobrança Pix/cartão no servidor, webhook, banco de pedidos/estoque por lote, reserva de 10 min, e-mail com ingresso (QR Code)
- [ ] Abrir a venda: vendasAbertas = true, botões do site apontando para o checkout, tirar o noindex

## Varandinha (19/10/2026)
- [ ] Link oficial de ingressos (trocar `ingressosEmBreve` por `ingressos` + `ingressosOnde` em eventos.ts).
- [ ] Atrações/line-up quando forem anunciadas (`atracoes`).
- [ ] Depois de 01/11: a página vai para /relembre-momentos no próximo build; avaliar se a Varandinha (recorrente) ganha a próxima edição.
