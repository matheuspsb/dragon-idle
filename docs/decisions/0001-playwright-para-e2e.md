# 0001 — Playwright para testes end-to-end

- **Data:** 2026-10-15
- **Status:** aceita

## Contexto

O fluxo de trabalho exige testes unitários, de integração e e2e antes de considerar uma feature pronta. A lógica de jogo já é testada com Vitest, mas nada verificava se o jogo de fato sobe no navegador (Phaser, canvas, erros de runtime).

## Decisão

Usar `@playwright/test` com Chromium para os testes e2e, em `tests/e2e/*.spec.ts`. O Playwright sobe o servidor do Vite sozinho (`webServer` em `playwright.config.ts`). O Vitest ignora `tests/e2e/`.

O primeiro teste (`boot.spec.ts`) é um smoke test: o jogo cria um único canvas 800×600 sem erros no console nem exceções na página.

A sequência de verificação fica em `npm run check`: `typecheck` → `format:check` → `test` → `test:e2e`.

## Alternativas consideradas

- **Vitest Browser Mode:** reaproveitaria o Vitest, mas ainda depende de um provider (o próprio Playwright) e é pensado para testar componentes isolados, não o jogo inteiro rodando.
- **Adiar o e2e para a Fase 2:** descartado porque o CLAUDE.md exige e2e na sequência de verificação desde já, e um smoke test barato já pega erros de boot.

## Consequências

- Facilita testar fluxos reais do jogo (clique, compra, save/load) quando a UI da Fase 2 existir.
- Custa uma devDependency a mais e o download do Chromium (~90 MB) em cada máquina (`npx playwright install chromium`).
- A config não usa `process.env` (sem CI por enquanto), para não precisar de `@types/node` no tsconfig compartilhado com o código do jogo. Se surgir CI, rever isso com um tsconfig separado para arquivos de Node.
