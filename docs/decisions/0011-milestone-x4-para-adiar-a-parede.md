# 0011 — Milestone ×4 a cada 25 níveis para adiar a parede

- **Data:** 2026-10-15
- **Status:** aceita (substitui o multiplicador de milestone ×2 de 0005)

## Contexto

Com milestone ×2 a cada 25 níveis, a condição de equilíbrio pedia ouro crescendo ×1.406 por estágio, mas ele cresce ×1.15. O balance-sim (0010) mostrou a consequência: no perfil ativo, ~13 min por estágio já no estágio 100, e a parede chegava em ~40 min de jogo; no idle, travava por volta do estágio 50. O rebirth (Fase 3) ainda nem existe, então a parede chegava antes de haver uma saída para ela.

## Decisão

`MILESTONE_MULTIPLIER` passa de 2 para 4 (`src/config/upgradeConfig.ts`). O resto do modelo de 0005 continua valendo.

Com isso o ouro necessário cai para ×1.186 por estágio, um pouco acima do ×1.15 real: a parede continua existindo, mas chega horas depois.

Resultado no balance-sim (8 h, seed 1): no ativo, estágio 300 em 3 h e 347 ao fim, com ~5,5 min por estágio na parede; no idle, estágio 200 em 5 h e 226 ao fim.

## Alternativas consideradas

Todas medidas no mesmo sim (4 h, seed 1):

- **Ouro ×1.40 por estágio:** chega ao equilíbrio e a parede some; o jogo vira corrida limitada só pela velocidade de ataque (1 s por estágio no ativo, estágio 4521 em 4 h). Sem parede, o rebirth perde sentido.
- **Milestone ×2 a cada 10 níveis:** mesmo efeito (equilíbrio ×1.146 < ×1.15), estágio 11921 em 4 h.
- **Manter ×2 e resolver com rebirth:** a parede em ~40 min chega cedo demais para a primeira run.

## Consequências

- A primeira run fica jogável por algumas horas antes de desacelerar, o que dá tempo de o rebirth (Fase 3) entrar como saída natural.
- Os saltos de dano nos milestones ficam mais visíveis (×4), o que reforça a sensação de "marco" ao chegar no nível 25, 50...
- O começo idle continua lento (10 min até o estágio 5) e o clique continua dominando os cavaleiros no perfil ativo; ambos ficam para a Fase 4.
- Qualquer nova mudança em `src/config/` deve ser validada de novo com `npm run sim`.
