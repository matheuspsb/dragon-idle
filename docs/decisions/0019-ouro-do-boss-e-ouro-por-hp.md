# 0019 — Ouro do boss separado do HP e ouro por HP menor

- **Data:** 2026-10-17
- **Status:** aceita (ajusta o ouro de 0017; a estrutura da zona continua a mesma)

## Contexto

No playtest da zona nova (0017), o criador relatou que a primeira fase até demorou, mas **ao receber o ouro do primeiro boss chegou ao estágio 4 em 10 segundos**, um clique matava qualquer inimigo e os bosses morriam em ~3 s.

Causa: com ouro proporcional ao HP, o boss de 1.000 HP pagava 200 de ouro (~73% do ouro da zona) de uma vez. Isso comprava o clique até o nível ~25, onde o milestone ×4 faz o dano saltar de ~25 para ~100. O sim já mostrava isso (zona 10 em 1m09 no ativo) e tinha sido lido como "fluido" — por isso ganhou uma métrica nova: o **tempo para matar cada boss** (`bossKills`, e a mediana por faixa de zonas no `npm run sim`). Na curva de 0017, a mediana era ~2,3 s nas zonas 2–10 no ativo.

## Decisão

Em `src/config/stageConfig.ts`:

- `BOSS_GOLD_MULTIPLIER = 2`: o boss paga 2× o ouro do último monstro, independente do HP dele (antes, 10× via HP).
- `GOLD_PER_HP`: 0.2 → **0.05**.
- HP, rampa, boss de 1k e crescimentos por zona (×1.20 de HP, ×1.15 de ouro) continuam os de 0017.

Balance-sim (8 h, seed 1, sem crítico):

| Perfil      | Zona 10 | Zona 50 | Zona 100 | Final | Boss z2–10 / 11–30 / 31–60 |
| ----------- | ------- | ------- | -------- | ----- | -------------------------- |
| 5 cliques/s | 5m13    | 25m36   | 4h58     | 106   | 21,5 / 13,3 / 15,7 s       |
| 2 cliques/s | 10m38   | 49m55   | —        | 93    | 14,1 / 17,6 / 18,6 s       |
| Idle        | 32m53   | 3h35    | —        | 64    | 23,1 / 17,1 / 16,1 s       |

## Alternativas consideradas

Medidas no mesmo sim (4 h, seed 1), perfil 5 cliques/s (zona 4 / 10 / 50; boss z2–10 / z11–30):

- **Atual de 0017 (boss 10×, 0.2/HP):** 48s / 1m09 / 4m18; 2,3 / 1,5 s.
- **P: boss 2×, 0.2/HP:** 1m05 / 1m40 / 6m50; 3,5 / 3,1 s — cortar só o ouro do boss não basta.
- **Q: boss 2×, 0.1/HP:** 2m18 / 3m21 / 14m; 5,9 / 6,5 s.
- **R: boss 3×, 0.1/HP:** 2m15 / 3m12 / 12m; 5,5 / 5,3 s.
- **T: S + custos dos upgrades ×3:** 3m38 / 7m43 / 37m; 26 / 17 s — boss perto do limite em quase toda zona, muitas derrotas seguidas.

## Consequências

- Bosses passam a levar uma parte real dos 30 s (13–21 s no ativo), sem morrer em segundos nem encostar no limite toda vez.
- O começo idle (sem clicar) voltou a ficar lento (~26 min até a zona 5, zona 50 em ~3h35); fica para a Fase 4 (mais cavaleiros e upgrades de velocidade).
- O salto do milestone ×4 ao nível 25 continua existindo; com menos ouro ele chega mais tarde e o boss segura melhor. Se voltar a incomodar, a alavanca é o milestone (0011).
- Ao avaliar balanço, olhar a mediana do tempo de boss junto com o tempo até cada zona.
