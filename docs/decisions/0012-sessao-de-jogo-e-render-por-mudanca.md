# 0012 — Sessão de jogo pura e render só quando o estado muda

- **Data:** 2026-10-16
- **Status:** aceita

## Contexto

A Fase 2 começa ligando o core à cena do Phaser. O CLAUDE.md pede cenas finas (só conectam input, estado e visual), lógica fora do Phaser, tick de passo fixo, texto dinâmico atualizado só quando o valor muda e nada de trabalho desnecessário em `update()`. Também era preciso um jeito de o e2e verificar o estado do jogo, já que o canvas não expõe texto ao DOM.

## Decisão

- **Sessão de jogo (`src/core/systems/gameSession.ts`):** compõe combate, cavaleiros, clique, carteira e o `fixedStepTicker`. `advanceGameSession(session, deltaSeconds)` roda os passos fixos (`LOGIC_STEP_SECONDS = 0.05`, no máximo `MAX_LOGIC_STEPS_PER_FRAME = 200` por frame, em `src/config/loopConfig.ts`). O callback do passo é criado uma vez, na sessão. Testada em `tests/integration/`.
- **Cena fina:** `GameScene` cria a sessão e as views, e em `update()` só avança a sessão e chama `render` de cada view.
- **Views que só redesenham na mudança:** `EnemyView` e `KnightsView` (`src/entities/`), `GoldCounter` e `StageLabel` (`src/ui/`). Como o core substitui os `Decimal` (imutáveis) a cada mudança, uma comparação de referência (`enemy.hp === shownHp`) decide se é preciso formatar texto ou mexer na barra.
- **Barra de HP:** `getHpRatio(enemy)` no core (0 a 1, sem NaN quando o HP máximo é 0, funciona além do limite do `number`); a view só aplica em `scaleX`.
- **Gancho de e2e:** `installDevHook` expõe `window.__DRAGON_IDLE__.snapshot()` com números simples, **só em dev** (`import.meta.env.DEV`); o build de produção não contém o gancho.
- `tsconfig` de `src/`, `tests/` e `scripts/` passam a incluir os tipos `vite/client` (para `import.meta.env`), sem trazer os tipos de Node para o jogo.

## Alternativas consideradas

- **Lógica dentro da cena:** mais rápido de escrever, mas fere "cenas finas" e não daria para testar sem canvas.
- **Atualizar todos os textos a cada frame:** simples, mas formata strings 60 vezes por segundo sem necessidade.
- **E2e por pixels/screenshot:** frágil a qualquer ajuste visual; o snapshot do estado testa a mecânica.
- **Gancho também em produção:** facilitaria depurar builds, mas expõe o estado do jogo a qualquer um.

## Consequências

- A cena fica trivial e a mecânica continua 100% testável fora do navegador.
- O e2e verifica o loop real no navegador (o teste falha se a cena parar de avançar a sessão).
- Novas views devem seguir o mesmo padrão de comparação de referência para não redesenhar à toa.
- `pendingOfflineSeconds` da sessão ainda não é consumido (Fase 3).
