# 0018 — Crítico só por upgrade (fora do jogo base)

- **Data:** 2026-10-17
- **Status:** aceita (substitui os críticos fixos de 0004: 12% ×2.5 e 1% ×10 em todo clique)

## Contexto

O criador notou que o dano crítico aparecia desde o começo e pediu para tirá-lo do jogo base, deixando esse tipo de efeito para um upgrade.

## Decisão

- A chance de crítico vira **estado do clique**: `ClickState.critChances = { crit, superCrit }`, começando em `STARTING_CRIT_CHANCES = { crit: 0, superCrit: 0 }` (`src/config/critConfig.ts`).
- `rollHitOutcome(rng, chances)`, `applyDamage(..., critChances)` e `resolveHit(..., critChances)` recebem as chances explicitamente; `expectedHitMultiplier(chances)` dá 1 enquanto não houver upgrade.
- Os multiplicadores (×2.5 e ×10), os estilos dos números flutuantes de crítico e o sorteio continuam prontos: o upgrade (Fase 3) só precisa aumentar `critChances`.

## Alternativas consideradas

- **Zerar `CRIT_CHANCE` na config:** mais rápido, mas a chance continuaria global e fixa; um upgrade teria que reescrever a config em tempo de jogo.
- **Apagar o sistema de crítico:** simplifica agora, mas teria de ser refeito para o upgrade.

## Consequências

- O dano do clique fica previsível no começo; o crítico vira uma recompensa de progressão.
- O balance-sim e os testes passam a assumir 0% de crítico por padrão; os testes de crítico usam chances explícitas.
- O save (próximo item) precisa guardar `critChances` quando o upgrade existir.
