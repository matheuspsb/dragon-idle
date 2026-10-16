# 0006 — Estrutura de pastas e direção das dependências no core

- **Data:** 2026-10-15
- **Status:** aceita

## Contexto

O CLAUDE.md define uma estrutura-base (`src/config/`, `tests/unit|integration|e2e|regression/`) e pede baixo acoplamento. O projeto tinha `src/data/` para balanceamento, testes ao lado do código e entidades/estados importando de `systems/`, o que fazia os dados dependerem das regras.

## Decisão

- `src/data/` passa a ser `src/config/`.
- Testes unitários saem de `src/` e vão para `tests/unit/`, espelhando o caminho do arquivo testado (ex: `src/core/systems/upgradeCost.ts` → `tests/unit/core/systems/upgradeCost.test.ts`).
- Dentro de `src/core/`, as dependências seguem uma direção só: `systems/` → `state/` → `entities/`, e todos podem ler `config/` e `utils/`. `entities/` e `state/` não importam de `systems/`.
  - `getKnightDamage` e `getClickDamage` foram para `systems/levelDamage.ts`.
  - `collectGold` foi para `systems/goldSystem.ts`.
  - `createCombatState` foi para `systems/combatSystem.ts`.
- Lint e prettier passam a cobrir `tests/`.

## Alternativas consideradas

- **Manter testes ao lado do código:** imports mais curtos, mas contraria a estrutura do CLAUDE.md e mistura testes no bundle de `src/`.
- **Alias de import (`@/`):** deixaria os imports dos testes mais curtos que `../../../../src/...`, mas exige configurar `tsconfig` e Vite em conjunto. Adiado até os imports longos virarem um problema real.
- **Separar já os testes de integração:** testes como `autoDpsSystem` e `combatSystem` exercitam vários módulos juntos, mas são puros e rápidos; ficam em `tests/unit/` até existir integração com estado real (save/load, tick do jogo).

## Consequências

- Entidades e estados viram dados simples, fáceis de serializar no save (Fase 2) e de testar isolados.
- Regras ficam todas em `systems/`, então um sistema novo não precisa mexer nas entidades.
- Imports dos testes ficam longos (`../../../../src/...`).
