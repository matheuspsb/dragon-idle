# 0008 — Aleatoriedade e tempo entram no core por injeção

- **Data:** 2026-10-15
- **Status:** aceita

## Contexto

O CLAUDE.md exige que a lógica de jogo receba relógio e gerador de aleatoriedade por injeção, para que os testes sejam determinísticos. As funções de combate já aceitavam `rng`, mas usavam `Math.random` como padrão, então um chamador podia esquecer de injetar e ganhar um comportamento não reproduzível sem perceber. Nada impedia que código novo do core chamasse `Math.random` ou `Date.now` direto.

## Decisão

- `rng` é **obrigatório** em `rollHitOutcome`, `applyDamage` e `resolveHit`, com o tipo `Rng = () => number` (`src/utils/random.ts`).
- `createSeededRng(seed)` (Mulberry32) gera sequências reproduzíveis para balance-sim, testes e reprodução de bugs. Quem monta o jogo (cena/composition root) escolhe entre ele e `Math.random`.
- **Tempo:** o core nunca lê o relógio. Hoje o tempo entra como `deltaSeconds` (`tickAutoDps`). Quando surgir a primeira necessidade de horário absoluto (progresso offline, timestamp de save, Fase 2/3), ele entra como parâmetro ou por uma interface `Clock` injetada, criada nesse momento.
- **Trava automática:** o ESLint proíbe `Math.random`, `Date.now`, `performance.now` e `new Date()` em `src/core/**`. O `npm run check` passa a rodar o lint (`typecheck → lint → format:check → test → test:e2e`).

## Alternativas consideradas

- **Manter `Math.random` como padrão:** mais cômodo, mas esconde não determinismo justamente onde ele mais atrapalha (simulação e repro de bugs).
- **Criar a interface `Clock` agora:** ainda não há código que precise de horário absoluto; criar antes seria abstração sem uso. A regra de lint já impede o atalho.
- **RNG de biblioteca (ex: seedrandom):** dependência a mais para algo que cabe em poucas linhas.

## Consequências

- Todo resultado de combate é reproduzível a partir de uma seed.
- Chamadores precisam passar o `rng` explicitamente (um parâmetro a mais nas cenas).
- Mulberry32 não é criptográfico, o que não importa para gameplay.
