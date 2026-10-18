# 0017 — Zona com 9 monstros em rampa de HP, boss de 1k e ouro por HP

- **Data:** 2026-10-17
- **Status:** aceita (substitui 0016 e a estrutura de estágio de 0004); o ouro (por HP e do boss) foi ajustado por 0019

## Contexto

Depois de 0016 (HP 60, ×1.18), o criador jogou e achou o jogo **muito travado**. Pediu outra mecânica de zona: 9 inimigos normais até o boss, a vida subindo de ~10 no primeiro (1/10) até ~100 no nono (9/10), e um primeiro boss de ~1k, usando a "função que deixa os clickers viciantes" — o crescimento exponencial do modelo da Kongregate (ver `docs/game-math.md`).

## Decisão

Em `src/config/stageConfig.ts`:

- `MONSTERS_PER_STAGE = 9` (o boss é o 10º inimigo).
- **Rampa geométrica dentro da zona:** `FIRST_MONSTER_HP = 10`, `LAST_MONSTER_HP = 100`; cada monstro é `q = (100/10)^(1/8) ≈ 1.334` vezes o anterior (10, 13, 18, 24, 32, 42, 56, 75, 100).
- **Boss:** `BOSS_HP_MULTIPLIER = 10` × o último monstro (1.000 na zona 1).
- **Entre zonas:** tudo cresce `HP_GROWTH_PER_STAGE = 1.20`.
- **Ouro proporcional ao HP dentro da zona** (`GOLD_PER_HP = 0.2`), mas crescendo `GOLD_GROWTH_PER_STAGE = 1.15` por zona — menos que o HP. A diferença é a barreira entre zonas (equilíbrio pede ×1.249).
- Rótulo da zona: "inimigo N/10", "BOSS" no 10º.

Balance-sim (8 h, seed 1, sem crítico — ver 0018):

| Perfil      | Zona 10 | Zona 50 | Zona 100 | Final | 1ª derrota de boss |
| ----------- | ------- | ------- | -------- | ----- | ------------------ |
| Ativo (5/s) | 1m09    | 4m18    | 1h07     | 130   | 11 min             |
| 2 cliques/s | 3m14    | 11m05   | 2h30     | 117   | 1m15               |
| Idle (0/s)  | 10m06   | 47m     | —        | 89    | 3m12               |

## Alternativas consideradas

Medidas no mesmo sim (4 h, seed 1), perfil ativo (zona 10 / 50 / 100 / final):

- **Ouro igual ao HP também entre zonas (0.05–0.2 por HP):** 1–4 min / 3–7 min / 6–13 min / 230–280 — flui, mas a barreira entre zonas some (o "fácil demais" volta).
- **K: ouro 0.1/HP, HP ×1.18, ouro ×1.15:** 2m25 / 5m34 / 28m / 145 — o 1º boss vence no primeiro minuto e obriga a farmar (sensação de "travado").
- **L: ouro 0.2/HP, HP ×1.18, ouro ×1.15:** 1m09 / 3m24 / 13m / 160 — barreira suave e tardia.
- **N: ouro 0.1/HP, HP ×1.20, ouro ×1.15:** 2m28 / 7m16 / 2h15 / 114 — começo farmado e barreira dura.
- **O: ouro 0.2/HP, HP ×1.18, ouro ×1.12:** 1m09 / 4m17 / 2h02 / 108 — parecido com M, barreira um pouco mais dura.

## Consequências

- Ritmo em "dente de serra": kills rápidos no começo de cada zona, tensão até o boss, alívio na zona seguinte.
- O começo flui (zona 50 em ~4 min no ativo) e a barreira aparece entre as zonas 50 e 100 (~1 h no ativo), onde o rebirth (Fase 3) vai entrar.
- O idle melhorou bastante em relação a 0016 (zona 50 em 47 min em vez de ~4h27), porque a rampa começa em 10 HP.
- O teto de velocidade sobe: uma zona tem 10 inimigos, então o mínimo por zona é `10 / golpes por segundo`.
- Ainda é placeholder de balanço: a Fase 4 refina com cavaleiros e upgrades novos.
