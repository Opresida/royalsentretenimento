# TODO

## Pendente
- [x] 26/11/2026 · **Financeiro Royals NO AR** (STARK): banco `royals` no projeto Neon da BrandSquad (credenciais em `~/.claude/secrets/royals-financeiro.env`), `DATABASE_URL` + `FIN_SESSAO_SEGREDO` na Vercel (produção), testado no ar e zerado; convite de primeiro acesso do admin `humberto` enviado.
- [ ] Financeiro: domínio próprio (os links dos sócios usam o host atual; trocar de domínio = reenviar links). Comprovantes ficam no banco (base64): se crescer muito, mudar para R2 privado.
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
- [x] 15/11: novo deploy com o Baile das Bruxas no acervo; topo da home virou o casting (LUCCO + BERTOLOSSI) e a barra do celular diz "Nos encontramos novamente em dezembro"
- [ ] Rodar `pnpm instagram` para trazer os posts do Baile das Bruxas (13/11) ao acervo
- [ ] Quando o evento de dezembro tiver data e link de ingresso: entrada em `eventos.ts` (o topo e a barra voltam a ser do evento sozinhos); trocar `AVISO_SEM_EVENTO` (src/lib/site.ts) se o recado mudar
- [ ] Artista novo no casting: entrar no vídeo do topo (remotion-studio `src/royals/HeroArtistas.tsx`) e subir com nova versão (-v2) em `HERO_CASTING`

## Concluído
- [x] 15/11/2026 · (NO AR, commit 1bb5fd0) Topo do casting (sem evento à venda): vídeo em loop com LUCCO + BERTOLOSSI (16:9 com as duas janelas à direita; 9:16 alternando em tela cheia), "Nossos artistas", régua dos dois e botões Conhecer/Contratar. Conferido em 1920×1080, 2560×1080, 1440×900, 1280×720, 1024×768, 768×1024, 844×390, 390×844 e 360×740. Barra fixa do celular sem evento: "Agenda Royals · Nos encontramos novamente em dezembro" + Seguir (Instagram).
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
- [x] 31/10/2026 · Número oficial da Royals (79) 98116-9231 em `WHATSAPP_BOOKING` e `BOOKING_CONTATOS` (substitui Renan/Ricardo)
- [x] 31/10/2026 · WhatsApp de booking da Royals em `WHATSAPP_BOOKING`: Renan (92) 98140-4577 (+ Ricardo (47) 99687-7069 em `BOOKING_CONTATOS`)
- [x] 29/10/2026 · Publicado com o ok do Humberto (commit c568b7a): https://royalsentretenimento.vercel.app/artistas/lucco, ainda sem o WhatsApp da Royals (pedido vai pelo direct)
- [ ] Os 3 nomes que faltam no line-up da SUN HYPE On Board (29.11) e o camarim real do artista
- [ ] Domínio próprio: incluir na regra de CORS do R2 `royals-acervo` (senão os trechos tocam sem o espectro)
- [x] 03/11/2026 · Página geral /artistas (casting Royals Entretenimento + Royals Records): portas com o vídeo de topo de cada artista, a gravadora (texto do release), um bloco por artista na cor dele (números, trechos ao vivo, vídeo-case de 1 min da BrandSquad, palcos, parcerias, fotos, página completa e WhatsApp) e contratação escolhendo o artista. "Artistas" entrou no menu. Dados em `src/data/casting.ts`; vídeos-case no R2 via `scripts/casting-midia.mjs`; OG em `pecas/og-casting`
- [x] 03/11/2026 · /artistas publicada com o ok do Humberto (tsc + eslint limpos, mídias e links conferidos)

## Casting · DJ BERTOLOSSI
- [x] 30/10/2026 · Cadastro /cadastro-artista/bertolossi (8 grupos, 36 perguntas; links de todas as plataformas e fotos ao vivo), OG próprio, publicado com o ok do Humberto
- [x] 30/10/2026 · Direção visual "noite no morro" aprovada
- [x] 31/10/2026 · Cadastro respondido; presskit v2 aprovado
- [x] 31/10/2026 · Página /artistas/bertolossi (logo vetorizada com spray, abertura a cada carregamento, player 4 faixas SoundCloud + 5 trechos, parcerias, hits, história, palcos, 7 vídeos, rider, galeria, fechar data no WhatsApp, OG, sitemap). Formulário de contratação virou `src/components/artistas/FormContratar.tsx` (o LUCCO usa o mesmo)
- [ ] Publicar /artistas/bertolossi (aguardando ok do Humberto)
- [ ] Artes/carrosséis e vídeo-case do Bertolossi

## Contratos e papel timbrado
- [x] 31/10/2026 · Gerador /contratos (link direto, noindex, fora do menu e do sitemap): escolhe o artista, preenche evento, contratante (PJ/PF), valores e logística, prévia ao vivo no papel timbrado e "Baixar PDF" (impressão A4 com cabeçalho/rodapé repetidos e nº de página). Nada vai a servidor; rascunho no localStorage. `?exemplo=1&artista=<slug>` preenche dados fictícios
- [x] 31/10/2026 · Dados da empresa em `EMPRESA` (src/lib/site.ts), do cadastro público do CNPJ 48.017.851/0001-73
- [x] 31/10/2026 · Papel timbrado (PDF + Word, genérico e por artista) em `D:\CLIENTES BRANDSQUADS\Royals Entretenimento\Papel Timbrado`
- [x] 31/10/2026 · /contratos publicado com o ok do Humberto
- [x] 31/10/2026 · Leitura por IA no /contratos (bloco 0): PDF, foto ou texto colado → `/api/contratos/ler` preenche contratante, evento e cachê (só campo vazio). Revezamento no esquema do HCARE (`src/lib/iaRouter.ts`: Gemini grátis → Pollinations). CNPJ achado → razão social e endereço do cadastro público (BrasilAPI, CNPJ.ws). Senha da equipe em `CONTRATOS_SENHA`
- [x] 31/10/2026 · Variáveis da leitura por IA cadastradas na Vercel (produção) e testadas no ar; OG próprio da /contratos (`pecas/og-contratos/og.html`)
- [ ] Revisão do texto do contrato pelo advogado da Royals
- [ ] Conta / chave Pix da Royals para deixar fixa no contrato (hoje é campo do formulário)
- [ ] Na Receita o nome fantasia é "Royals Soluções Financeiras" e o CNAE não tem agenciamento artístico: ver com o contador

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
