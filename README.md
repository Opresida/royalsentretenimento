# Royals Entretenimento · site institucional

Site da produtora-mãe dos eventos (O.C.U.L.T.O, Baile das Bruxas e o acervo desde 2019). Next.js 16 + React 19, sem banco: o conteúdo vem de `src/data/eventos.ts` e do acervo do Instagram (`src/data/instagram.json`), com a mídia no Cloudflare R2.

## Rodar
```bash
pnpm install
pnpm dev            # http://localhost:3500
pnpm typecheck && pnpm lint
pnpm build          # derrube o dev antes (o build derruba o next dev)
```

## Atualizar o acervo do Instagram
```bash
pnpm instagram      # = node scripts/instagram-sync.mjs  (só baixa e sobe o que é novo)
```
Lê @royalsentretenimento pela API oficial da Meta (token em `~/.claude/secrets/meta.env`, fora do repo), converte a mídia (webp 600/1600, vídeo 720p) e sobe para o bucket público R2 `royals-acervo` (`https://pub-46e61d386ffa419b95ae09d732d774af.r2.dev`). Depois: commit do `src/data/instagram.json` e push.

## Rotas
| Rota | O quê |
|---|---|
| `/` | Home no wireframe do brandbook (hero do próximo evento, agenda, indicadores, manifesto, acervo, vídeos, promoters, Instagram, contato) |
| `/eventos` · `/eventos/[slug]` | Próximos eventos (o slug de um evento que já passou redireciona para o acervo) |
| `/relembre-momentos` · `/relembre-momentos/[slug]` | Linha do tempo e galeria de cada edição |
| `/melhores-momentos` | Vídeos, com filtro por evento |
| `/promoters` · `/obrigado` | Programa de promoters (cadastro "em breve") |
| `/sobre` · `/contato` · `/privacidade` · `/termos` | Institucional e legal |
| `/artistas/lucco` | Página do artista DJ LUCCO (casting Royals): player com o SET SUNRISE + trechos ao vivo, vídeos, formatos, rider, fotos e pedido de data. Visual próprio do artista, sem o menu da Royals. Mídia: `node scripts/lucco-midia.mjs`; logo: `python scripts/lucco-logo.py` |
| `/cadastro-artista/lucco` · `/logos` | Links diretos, fora do menu e sem indexação (cadastro do artista; kit de logos) |

## Estado
No ar desde 16/10/2026: **https://royalsentretenimento.vercel.app**. Código em GitHub `Opresida/royalsentretenimento` (branch `main`); projeto Vercel `opresidas-projects/royalsentretenimento`, conectado ao GitHub: todo push na `main` publica sozinho. Endereço oficial em `src/lib/site.ts` (`SITE_URL`, ou a variável `NEXT_PUBLIC_SITE_URL`).
