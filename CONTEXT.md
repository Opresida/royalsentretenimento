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
