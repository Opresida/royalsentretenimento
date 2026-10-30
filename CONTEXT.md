# CONTEXT · decisões e regras

## Quem é o cliente
Royals Entretenimento, produtora de eventos de trap e funk em Manaus (cliente da BrandSquad, atendido pelo Humberto). Marca-mãe com **marca endossada**: cada evento tem logo, cores e brandbook próprios; a Royals assina ("Uma produção ROYALS").

## Fontes
- Design system e brandbook aprovados: `D:\CLIENTES BRANDSQUADS\Royals Entretenimento\Royals Entretenimento - Material Proprio` (`readme.md` = regras; `brandbook/Royals Proposta 01.dc.html` = sitemap e wireframe da home).
- Instagram @royalsentretenimento (275 posts, desde jan/2019), lido pela API oficial da Meta.

## Decisões do Humberto (15/10/2026)
- Site público agora; **painel /admin na 2ª etapa** (o conteúdo fica em arquivos que eu atualizo).
- **Promoters:** página pronta, cadastro "em breve" até a Royals definir regras e quem recebe.
- **Indicadores:** mostrar "10+ anos" e "100 mil+ ingressos" (ele confirmou). Observação: uma legenda de 30/09/2020 diz "a dois anos atrás começamos um sonho", o que aponta para início em 2018; avisado a ele.
- Hospedagem: GitHub `Opresida/royalsentretenimento` + Vercel (conta opresida, projeto `royalsentretenimento`), no ar em https://royalsentretenimento.vercel.app desde 16/10/2026; domínio próprio depois.

## Regras da marca (readme do design system)
- Nunca inventar eventos, artistas, datas, números, links ou depoimentos. Dados de evento só se estiverem nas legendas do Instagram ou no site oficial do evento.
- Preto domina (~70%), ouro só em destaque (~10%), marfim no texto. Degradê de ouro só no logo e em títulos de destaque.
- Archivo variável: display 800, largura 125, caixa alta; rótulos 600 com entreletra 0,3–0,35em.
- Cantos retos, hierarquia por fios (2 px ouro no topo de seções), sem sombra fora de overlays, sem blur.
- Motion: entrada expo out, revelação por máscara de baixo para cima, 60–80 ms entre itens; `prefers-reduced-motion` vira esmaecimento.
- O logo nunca é digitado em fonte: sempre os SVGs de `public/marca/`.
- No máximo um ponto de exclamação por página; sem emoji.
- Telefones de camarote do Baile das Bruxas NÃO confirmados para site (ver `D:\dev\bailedasbruxas`): não publicar.

## Varandinha (19/10/2026)
- Evento recorrente, **realização Royals + Cúpulla** (a Cúpulla é sócia da Royals no evento e dona do local). 1ª edição em Manaus: domingo 01/11/2026, a partir das 16h, na Cúpulla (Av. João Valério, 209 · Nossa Sra. das Graças). Slogan: "A Varandinha mais charmosa da cidade". Instagram oficial @_varandiinha.
- Sem atrações nem link de ingresso ainda (Humberto, 19/10): página com "Ingressos em breve". Topo da home continua no Baile das Bruxas (escolha dele).
- Fotos da página: edições de 2024 (perfil do evento), sempre rotuladas "Edições anteriores".

## Parceria para produtores (26/10/2026)
- Oferta para o evento de OUTRO produtor: Royals Entretenimento (organização + influenciadores) + BrandSquad (todo o marketing) + Royals Tickets (bilheteria com split pela Pagar.me).
- Planos definidos pelo Humberto: R$ 5.000 de entrada + 40% da bilheteria e do bar; R$ 10.000 + 30%; ou sob medida. Empate entre os dois em R$ 50 mil de bilheteria + bar.
- Recebimento: Pix na hora (regra da Pagar.me: liquida no saldo assim que o comprador paga); cartão antecipado, cai no dia seguinte ao evento, com o custo da antecipação saindo da parte do produtor (decisão dele). Sem antecipação, a Pagar.me paga cartão em 29 dias corridos + 2 úteis.
- A dor das "ticketeiras que seguram até 15 dias" é dele; nunca citar ticketeira pelo nome.
- Página /produtores publicada para captar ANTES de o checkout do Royals Tickets estar ligado de verdade (escolha dele).
- Leads: /api/produtores (deste site) repassa para o /api/leads da BrandSquad (isca PRODUTOR, source site_form). Servidor para servidor: não precisa de LEADS_ALLOWED_ORIGINS.
- Roteiro da VSL (YouTube e Reels, jornada do herói) em `D:\CLIENTES BRANDSQUADS\Royals Entretenimento\Parceria Produtor\ROTEIRO-VSL.md`; quem narra é alguém da Royals (decisão dele). Motion no remotion-studio (`src/royals/vsl/VslProdutores.tsx`, 4 min 15 s).
- /produtores é página de VSL (pedido dele, 26/10/2026): primeiro só o vídeo (MP4 e capa no R2 `royals-acervo/vsl/`); o resto da página e o rodapé abrem 2 s antes do fim. Sem barra de avanço: uma linha de ouro percorre o contorno do vídeo no tempo dele. Quem já chegou ao fim abre a página inteira (localStorage `vsl-produtores-livre`); o vídeo continua de onde parou (`vsl-produtores-t`). Lógica em `src/app/produtores/Vsl.tsx`.

## Casting · página do DJ LUCCO (29/10/2026)
- Pedido do Humberto: landing page do artista para contratantes, a partir do presskit v6 (`D:\CLIENTES BRANDSQUADS\Royals Entretenimento\DJ LUCCO\Presskit`), como rota do site: **/artistas/lucco** (o próximo artista vira /artistas/<nome>).
- **Exceção de visual, decidida por ele:** página imersiva com a identidade do ARTISTA (a do presskit: café #120C08, champanhe #D9B98A, Cormorant Garamond + Space Grotesk), sem o menu, o rodapé e a barra de ingressos da Royals. A Royals assina no selo "apresenta" do topo e no rodapé (Royals, Royals Records, BrandSquad).
- Contato de contratação = **número da Royals** (escolha dele). O número ainda não foi passado: enquanto `WHATSAPP_BOOKING` (src/lib/site.ts) for null, o formulário copia a mensagem e abre o direct do Instagram da Royals. Publicada em 29/10/2026 sem o número, a pedido dele (o pedido vai pelo direct até o número chegar).
- Músicas: o SoundCloud dele tem 1 set (SET SUNRISE, 61 min) → player com o set (widget oficial do SoundCloud) + 5 trechos ao vivo tirados dos vídeos do Drive dele. Os trechos têm músicas de outros produtores tocadas no set (como nos vídeos que ele posta); avisado.
- Conteúdo só do presskit/cadastro. O que ele não respondeu fica genérico (camarim padrão) ou fora (os 3 nomes do line-up de 29.11). Sem preço ("Valores sob consulta").
