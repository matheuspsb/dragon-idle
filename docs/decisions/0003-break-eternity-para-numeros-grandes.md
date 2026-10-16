# 0003 — break_eternity.js para números grandes

- **Data:** 2026-05-27 (registrada retroativamente em 2026-10-15)
- **Status:** aceita

## Contexto

Idle games crescem exponencialmente: HP, ouro e custos passam rápido do limite do `number` do JavaScript (~1.8e308), e o prestígio infinito (new game+) leva isso ainda mais longe.

## Decisão

Usar `break_eternity.js` para todo valor de jogo que pode crescer sem limite (HP, dano, ouro, custos). O tipo é reexportado por `src/utils/Decimal.ts` para que o resto do código não dependa da biblioteca diretamente. Contadores pequenos (nível, índice de inimigo, número do estágio) continuam `number`.

## Alternativas consideradas

Não há registro das alternativas avaliadas na época. Alternativas conhecidas:

- `number` nativo: limitado a ~1.8e308.
- `break_infinity.js`: mais leve e rápido, mas limitado a ~1e9e15.

_(Completar se outras foram avaliadas.)_

## Consequências

- Números praticamente sem limite, com o custo de alocar um objeto por operação (ficar atento em loops quentes).
- A biblioteca tem armadilhas de precisão já encontradas e cobertas por testes de regressão:
  - `Decimal.pow` passa por logaritmos e erra potências inteiras (`2^3 = 7.999…`).
  - Comparações com `NaN` passam (`NaN.gte(0) === true`); validar com `isFinite()`.
  - `toExponential` não leva o arredondamento ao expoente (`9.9999e99 → "10e99"`).
