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

## Estado
v1 em desenvolvimento local (15/10/2026). Publicação (GitHub `Opresida/royals` + Vercel) só com o ok do Humberto.
