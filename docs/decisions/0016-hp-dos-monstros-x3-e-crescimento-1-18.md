# 0016 — HP dos monstros ×3 e crescimento de ×1.18 por estágio

- **Data:** 2026-10-17
- **Status:** substituída por 0017

## Contexto

No playtest de 2026-10-17 o criador chegou ao estágio 57 "sem o mínimo de esforço": clique e cavaleiros matavam rápido demais e não havia barreira ao subir de zona. O balance-sim confirmou: no perfil ativo (5 cliques/s), estágio 50 em ~4 min e 100 em ~8 min, com a primeira derrota de boss só por volta do estágio 200. O dano do jogador (linear com milestones ×4, ver 0011) crescia bem mais rápido que o HP (×1.15 por estágio).

## Decisão

Em `src/config/stageConfig.ts`:

- `BASE_MONSTER_HP`: 20 → **60** (o começo fica ~3× mais lento, sem mudar o formato da curva).
- `HP_GROWTH_PER_STAGE`: 1.15 → **1.18** (cria a barreira ao longo das zonas).

O ouro continua crescendo ×1.15. A condição de equilíbrio passa a pedir ×1.224, ou seja, a parede agora é intencional e existe para levar ao rebirth (Fase 3).

Medido sem crítico (o crítico vai sair do jogo base; ver ROADMAP), 8 h, seed 1:

| Perfil              | Estágio 50 | Estágio 100 | Final 8 h |
| ------------------- | ---------- | ----------- | --------- |
| Ativo (5 cliques/s) | 22 min     | 2h04        | 130       |
| Casual (2/s)        | 58 min     | 6h45        | 106       |
| Idle                | 4h27       | —           | 66        |

## Alternativas consideradas

Todas medidas no mesmo sim, 4 h, sem crítico (estágio 50 / 100 / final no perfil ativo):

- **Só HP inicial ×3 (A):** 13 min / 24 min / 236 — começo mais lento, mas sem barreira até perto do estágio 200.
- **Custo base dos upgrades ×4:** 15 min / 27 min / 234 — parecido com A.
- **Milestone de volta a ×2:** 12 min / — / 79 — a parede volta cedo (motivo de 0011).
- **Crescimento do custo 1.07 → 1.09:** 8 min / 45 min / 130 — começo continua rápido.
- **HP e ouro crescendo ×1.18:** 15 min / 29 min / 200 — o ouro compensa e a barreira some.
- **HP crescendo ×1.20:** 33 min / — / 85 — duro demais; quem não clica quase não avança.
- **Boss ×12:** praticamente igual a ×8; na parede o gargalo é o ouro, não o boss.
- **HP ×1.17 + boss ×10:** 18 min / 1h12 / 135 — meio-termo, mas com duas constantes.

## Consequências

- O 1º boss (480 HP) já vence quem acabou de começar (~1 min de jogo ativo): o jogador aprende farm e "Enfrentar boss" logo de cara.
- O começo idle (1 cavaleiro, sem clique) ficou bem lento: ~1h11 até o estágio 5. Fica para a Fase 4 (mais cavaleiros, upgrades de velocidade).
- Sem rebirth (Fase 3), a progressão praticamente para por volta do estágio 100–130 em algumas horas de jogo ativo.
- Testes de simulação do idle passaram a usar 1 h em vez de 10–15 min, e os e2e de boss/clique precisam de mais ouro para um clique letal (60 HP).
