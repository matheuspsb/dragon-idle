# 0005 — Custo exponencial de upgrades com milestones

- **Data:** 2026-10-15
- **Status:** aceita; o multiplicador de milestone (×2) foi substituído por 0011

## Contexto

O sistema de ouro precisava de uma curva de custo que não deixasse o jogo fácil demais nem travasse cedo. O modelo padrão de idle games, descrito por Anthony Pecorella (Kongregate) em _The Math of Idle Games, Part I_, foi pesquisado antes da implementação.

## Decisão

- **Custo do próximo nível:** `custo = base × r^nível`, com `r = 1.07` (mesma taxa do Clicker Heroes e do AdVenture Capitalist).
- **Compra em lote:** soma geométrica em forma fechada, `base × r^k × (r^n − 1) / (r − 1)`.
- **Máximo comprável:** `floor(log_r(ouro × (r − 1) / (base × r^k) + 1))`, corrigido contra o custo exato porque o log em ponto flutuante pode errar por 1 no limite.
- **Produção:** dano cresce linear com o nível, `× 2` a cada 25 níveis (milestones).
- Clique e cavaleiros usam o mesmo contrato `Upgradable` (`level`, `baseCost`, `costGrowth`).

Valores em `src/config/upgradeConfig.ts`.

## Alternativas consideradas

- **Custo polinomial ou linear:** a produção alcançaria o custo e não haveria "parede"; o jogo ficaria fácil e sem decisões.
- **`r` próximo de 1.15:** a parede chega cedo demais para a primeira run.
- **Sem milestones:** dano linear contra custo exponencial fica inviável rápido; os milestones dão alívio periódico.

## Consequências

- Curva conhecida e fácil de balancear com simulação; compra em lote sem laço.
- **Tensão de balanço já identificada:** para manter o ritmo, o ouro por estágio precisaria crescer cerca de `1.15^(ln 1.07 / (ln 2 / 25)) ≈ 1.41` por estágio (desconsiderando o termo linear do dano), mas hoje cresce `1.15` (ver 0004). Isso cria uma parede cedo; deve ser ajustado com o script de balance-sim e o rebirth (Fase 3).
