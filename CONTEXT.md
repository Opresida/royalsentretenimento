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
- Hospedagem: GitHub `Opresida/royals` + Vercel (conta opresida), endereço provisório `.vercel.app`; domínio próprio depois.

## Regras da marca (readme do design system)
- Nunca inventar eventos, artistas, datas, números, links ou depoimentos. Dados de evento só se estiverem nas legendas do Instagram ou no site oficial do evento.
- Preto domina (~70%), ouro só em destaque (~10%), marfim no texto. Degradê de ouro só no logo e em títulos de destaque.
- Archivo variável: display 800, largura 125, caixa alta; rótulos 600 com entreletra 0,3–0,35em.
- Cantos retos, hierarquia por fios (2 px ouro no topo de seções), sem sombra fora de overlays, sem blur.
- Motion: entrada expo out, revelação por máscara de baixo para cima, 60–80 ms entre itens; `prefers-reduced-motion` vira esmaecimento.
- O logo nunca é digitado em fonte: sempre os SVGs de `public/marca/`.
- No máximo um ponto de exclamação por página; sem emoji.
- Telefones de camarote do Baile das Bruxas NÃO confirmados para site (ver `D:\dev\bailedasbruxas`): não publicar.
