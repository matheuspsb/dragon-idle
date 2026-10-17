# 0014 — Compra de upgrades pela UI com modos x1, x10 e Máx

- **Data:** 2026-10-17
- **Status:** aceita

## Contexto

O terceiro item da Fase 2 é comprar upgrades pela interface. As fórmulas de custo, compra em lote e máximo comprável já existiam (0005); faltava expor isso de forma que a UI mostrasse o preço certo antes de comprar e o e2e conseguisse testar compras sem farmar ouro.

## Decisão

- **Cotação pura (`quotePurchase`)**: para um upgrade, um modo (`x1`, `x10`, `max`) e o ouro atual, devolve quantos níveis, o custo e se dá para pagar. No modo `max` sem ouro suficiente, cota 1 nível como indisponível. Ouro inválido (NaN, negativo, infinito) conta como zero. `buyWithMode` compra exatamente o que a cotação prometeu.
- **Na sessão**: `UpgradeTarget` (`{ kind: 'click' }` ou `{ kind: 'knight', index }`), `quoteUpgrade`, `buyUpgrade` e `resolveUpgradable` (índice de cavaleiro inválido lança `RangeError`).
- **UI**: `Button` reutilizável (habilitado, desabilitado, selecionado e hover; texto só muda quando o rótulo muda) e `UpgradePanel` com os 3 modos e uma linha por upgrade (nível, +N níveis, dano atual → novo, custo). O painel recalcula a cotação só quando o ouro, o nível ou o modo mudam.
- **Gancho de dev**: `grantGold(amount)` em `window.__DRAGON_IDLE__` (só em dev) para o e2e e para o criador testar compras sem farmar. O snapshot passou a incluir os níveis.
- **Helpers de e2e** em `tests/e2e/support/devHook.ts` (`openGame`, `snapshot`, `grantGold`, `clickCanvas`), compartilhados entre os specs; as posições dos botões vêm dos mesmos tokens da UI.

## Alternativas consideradas

- **Só compra de 1 nível:** mais simples, mas compras em lote são padrão do gênero e a fórmula já existia.
- **Modos x25/x100:** adiados; a lista de modos é um array em `UpgradePanel` e cresce sem mudar a lógica.
- **Dar ouro pelo e2e matando inimigos:** o primeiro upgrade custa ~5 de ouro, ou seja, ~6 kills de 20 de HP; lento e frágil.

## Consequências

- O preço exibido é exatamente o cobrado. Isso exigiu corrigir `bulkCost` para 1 nível, que divergia de `nextCost` na última casa (teste de regressão `bulk-cost-of-one-level-equals-next-cost`).
- `maxAffordable` com orçamento infinito travava num loop infinito; corrigido junto (teste de regressão `max-affordable-rejects-invalid-budget`).
- Com mais cavaleiros (Fase 4), o painel vai precisar de rolagem ou paginação; hoje há uma linha por cavaleiro inicial.
