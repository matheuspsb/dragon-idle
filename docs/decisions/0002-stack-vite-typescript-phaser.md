# 0002 — Stack: Vite + TypeScript + Phaser 3

- **Data:** 2026-05-26 (registrada retroativamente em 2026-10-15)
- **Status:** aceita

## Contexto

O jogo é um idle RPG em 2D para rodar no navegador e, mais tarde, empacotado com Electron para a Steam (Fase 5). Era preciso escolher engine, linguagem e build.

## Decisão

- **Phaser 3** como engine de renderização e input.
- **TypeScript** em modo estrito.
- **Vite** como dev server e bundler.
- **ESLint + Prettier** para lint e formatação; **Vitest** para testes (adicionado depois).

## Alternativas consideradas

Não há registro das alternativas avaliadas na época. _(Completar se houver.)_

## Consequências

- Lógica de jogo em TypeScript puro roda e é testada sem canvas; o Phaser fica restrito a `scenes/` e à renderização.
- Web primeiro: o empacotamento para a Steam depende do Electron (Fase 5).
- O Phaser 3 é baseado em canvas/WebGL, então testes de UI dependem de e2e em navegador real (ver 0001).
