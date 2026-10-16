@AGENTS.md

# Como trabalhar neste projeto
- Ler README, CONTEXT, ARCHITECTURE, TODO e este arquivo ao começar; atualizar os cinco antes de encerrar.
- Porta **3500**. Nunca rodar `pnpm build` com o `pnpm dev` no ar.
- Regras da marca em CONTEXT.md: nada inventado (evento, data, artista, número, link). Novo evento = entrada em `src/data/eventos.ts` com o que está escrito nas legendas ou no site oficial do evento.
- `src/data/instagram.json` é gerado: atualizar só com `pnpm instagram`. O token da Meta e as chaves da Cloudflare ficam em `~/.claude/secrets/` e nunca entram no repo, em log ou em resposta.
- Visual: só o design system da Royals (tokens em `src/styles/tokens`, componentes em `globals.css`). Nada do visual do Baile das Bruxas, do O.C.U.L.T.O ou da BrandSquad.
- Conferência visual: Playwright em 1440 e 390 px. Atenção: o navegador do Playwright abre o localhost com zoom de 75% (pedir largura × 0,75 e conferir `innerWidth`).
- Publicação (push na `main` → Vercel) só com o ok do Humberto.
