# Modelo matemático do jogo

Referência das fórmulas que regem a economia e o combate. Base: Anthony Pecorella (Kongregate), [_The Math of Idle Games, Part I_](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i), com valores de referência do Clicker Heroes e do AdVenture Capitalist. A decisão de adotar o modelo está em [0005](decisions/0005-custo-exponencial-de-upgrades.md); o combate, em [0004](decisions/0004-combate-por-estagios-com-criticos-em-camadas.md).

Todos os valores numéricos são placeholders em `src/config/`, a ajustar com o balance-sim e na Fase 4. Ao mudar uma fórmula ou constante estrutural, atualizar este documento.

## A ideia central

> O custo cresce de forma **exponencial**; a produção cresce de forma **linear** (com saltos).

Exponencial sempre vence linear no longo prazo. No começo a produção ganha (tudo é barato); depois o custo dispara e o jogador "bate na parede". Os **milestones** dão alívio periódico e o **rebirth** (Fase 3) recomeça a curva com um bônus permanente. Esse vai e vem entre aperto e alívio é o que dá ritmo ao jogo.

## Notação

| Símbolo | Significado                              | Valor atual            |
| ------- | ---------------------------------------- | ---------------------- |
| `b`     | custo base do upgrade                    | clique 5, cavaleiro 10 |
| `r`     | taxa de crescimento do custo (por nível) | 1.07                   |
| `k`     | nível atual                              | começa em 1            |
| `n`     | quantidade de níveis a comprar           | —                      |
| `c`     | ouro disponível                          | —                      |
| `M`     | intervalo de milestone (em níveis)       | 25                     |
| `m`     | multiplicador de milestone               | 4                      |
| `s`     | número do estágio                        | começa em 1            |

## Economia (upgrades)

Código: `src/core/systems/upgradeCost.ts`, `src/core/systems/upgradeSystem.ts`.

**Custo do próximo nível**

```
custo(k) = b × r^k
```

Cada nível custa `r − 1` (7%) a mais que o anterior; o custo dobra a cada `ln 2 / ln r ≈ 10.2` níveis.

**Custo de comprar `n` níveis de uma vez** (soma da progressão geométrica)

```
custo(k, n) = b × r^k × (r^n − 1) / (r − 1)        (se r = 1: b × n)
```

**Máximo de níveis que dá para comprar com `c` de ouro**

```
max = floor( log_r( c × (r − 1) / (b × r^k) + 1 ) )
```

O log em ponto flutuante pode errar por 1 exatamente no limite, então o código ajusta o resultado conferindo contra `custo(k, n)`.

**Faixa usual de `r`:** 1.07 a 1.15. Perto de 1.03 o jogo fica fácil demais; perto de 1.15 a parede chega cedo.

## Produção (dano)

Código: `src/core/systems/levelDamage.ts`.

```
dano(k) = dano_base × k × m^floor(k / M)
```

Linear no nível, multiplicado por `m` a cada `M` níveis. O multiplicador é calculado com potência nativa (`m ** x`) enquanto cabe em `number`, porque `Decimal.pow` erra potências inteiras (ver [0003](decisions/0003-break-eternity-para-numeros-grandes.md)).

**Ouro por ponto de dano** (quanto o próximo nível cobra por cada dano extra que dá):

```
custo(k) / (dano(k + 1) − dano(k))
```

Esse valor sobe sempre e cai a cada milestone. É a métrica mais útil para sentir a "parede".

## Combate e progressão

Código: `src/core/systems/stageGenerator.ts`, `src/core/systems/critRoll.ts`, `src/core/systems/damage.ts`. Estrutura definida em [0017](decisions/0017-zona-com-rampa-de-hp-e-boss-1k.md).

**Uma zona = 9 monstros + 1 boss** (o boss é o "10/10").

**Rampa dentro da zona** — a mesma ideia exponencial dos custos, aplicada aos inimigos: cada monstro é um fator fixo `q` mais forte que o anterior.

```
q = (HP_último / HP_primeiro)^(1/8) = (100 / 10)^(1/8) ≈ 1.334

HP_monstro(s, i) = 10 × q^(i − 1) × 1.20^(s − 1)        (i = 1..9)
HP_boss(s)       = 10 × HP_monstro(s, 9) = 1000 × 1.20^(s − 1)
```

Zona 1: 10 → 13 → 18 → 24 → 32 → 42 → 56 → 75 → 100, boss 1.000. Isso dá um ritmo em "dente de serra": kills rápidos no começo da zona, tensão crescendo até o boss e alívio ao entrar na zona seguinte.

**Ouro** — proporcional ao HP para os monstros, crescendo menos que o HP entre zonas; o boss paga à parte (ver [0019](decisions/0019-ouro-do-boss-e-ouro-por-hp.md)):

```
ouro_monstro(s, i) = HP(s, i) × 0.05 × (1.15 / 1.20)^(s − 1)
ouro_boss(s)       = 2 × ouro_monstro(s, 9)
```

Ou seja, o ouro total de uma zona cresce ×1.15 enquanto o HP cresce ×1.20. Essa diferença é a barreira entre zonas; dentro da zona, inimigo mais difícil paga mais. O boss paga só 2× o último monstro: pagar pelo HP inteiro dele (10×) fazia um único kill financiar várias zonas de uma vez.

Totais da zona 1: HP ≈ 1.370 (370 dos monstros + 1.000 do boss), ouro ≈ 28,5 (18,5 dos monstros + 10 do boss).

**Tempo para limpar uma zona:** `t(s) = HP_total(s) / DPS`.

**Timer de boss** (ver [0015](decisions/0015-timer-de-boss-com-farm.md)): o boss tem 30 s. Para vencê-lo é preciso

```
DPS ≥ HP_boss(s) / 30 = 1000 × 1.20^(s − 1) / 30 ≈ 33.3 × 1.20^(s − 1)
```

Se falhar, o jogador farma a zona (só monstros, com ouro) até conseguir esse DPS e desafiar de novo.

**Críticos:** não fazem parte do jogo base (ver [0018](decisions/0018-critico-so-por-upgrade.md)). A chance de crítico é estado do clique e começa em 0%; um upgrade futuro vai aumentá-la. Com chances `c` (crítico, ×2.5) e `sc` (super crítico, ×10), o multiplicador médio de um clique é

```
E = 1 + c × (2.5 − 1) + sc × (10 − 1)        (hoje c = sc = 0, então E = 1)
```

**Cavaleiros:** dano fixo `dano(k)` a cada `intervalo` segundos (hoje 1 s), sem crítico. `DPS_cavaleiro = dano(k) / intervalo`.

## Condição de equilíbrio (a "parede")

Para avançar um estágio, o dano precisa crescer `× 1.20` (o crescimento do HP). Ignorando o termo linear, o dano cresce `m^(1/M)` por nível, então são necessários

```
níveis por estágio = ln(1.20) / ln(m^(1/M))
```

e o custo desses níveis cresce, por estágio,

```
crescimento do custo por estágio = 1.20^( ln r / ln(m^(1/M)) )
```

O jogo só se sustenta se o ouro por estágio crescer pelo menos isso:

```
crescimento do ouro ≥ crescimento_HP^( ln r / ln(m^(1/M)) )
```

Com os valores atuais (`m = 4`, HP ×1.20): `ln 1.07 / (ln 4 / 25) ≈ 1.22`, então o ouro precisaria crescer `1.20^1.22 ≈ 1.249` por zona. Ele cresce `1.15`, **abaixo de propósito**: a parede é a barreira que leva ao rebirth (Fase 3), e chega entre as zonas 50 e 100 no jogo ativo (ver [0017](decisions/0017-zona-com-rampa-de-hp-e-boss-1k.md)). Histórico: com `m = 2` e HP ×1.15 o necessário era `≈ 1.41` (parede em ~40 min, [0011](decisions/0011-milestone-x4-para-adiar-a-parede.md)); com `m = 4` e HP ×1.15, `≈ 1.186` (sem barreira até ~200, o "fácil demais"); com HP 60 ×1.18, `≈ 1.224` ([0016](decisions/0016-hp-dos-monstros-x3-e-crescimento-1-18.md), que o criador achou travado).

Alavancas, se for preciso mover a parede de novo:

- crescimento do ouro por estágio (mais perto do necessário = parede mais tarde; igual ou acima = sem parede);
- `r` (menor = parede mais tarde);
- milestones mais fortes ou mais frequentes (aumentar `m^(1/M)`);
- rebirth (Fase 3), que recomeça a curva com bônus.

## Tempo e simulação

- A lógica roda em passos fixos (`src/systems/fixedStepTicker.ts`, ver [0009](decisions/0009-tick-de-passo-fixo-com-limite.md)). O tempo além do limite por frame vai para o progresso offline, que deve ser calculado de forma analítica (com as fórmulas acima), não golpe a golpe.
- Toda aleatoriedade vem de um `Rng` injetado; `createSeededRng(seed)` torna qualquer simulação reproduzível (ver [0008](decisions/0008-aleatoriedade-e-tempo-por-injecao.md)).

## Balance-sim

`npm run sim -- --hours=4 --cps=0,5 --seed=1` joga com as regras reais do core e mostra quando cada estágio-marco é alcançado (ver [0010](decisions/0010-balance-sim-no-terminal.md)). Rodar depois de qualquer mudança em `src/config/`.

**Teto de velocidade:** cada golpe mata no máximo um inimigo (o overkill é perdido) e uma zona tem 10 inimigos. Com dano sobrando, o tempo por zona para em `10 / golpes por segundo` (10 s no idle com 1 cavaleiro; ~1,7 s no ativo a 5 cliques/s). Quando o sim mostra esse piso, não há parede: o jogo virou corrida.

**Medições de 2026-10-15, curva antiga (HP 20, ×1.15, com crítico)** (4 h, seed 1; "tempo/estágio" é o tempo gasto no estágio indicado):

| Variante                                 | Ouro necessário | Ativo: estágio final | Ativo: tempo/estágio no 100 | Idle: estágio final |
| ---------------------------------------- | --------------- | -------------------- | --------------------------- | ------------------- |
| Anterior (×2 a cada 25)                  | ×1.406          | 102                  | ~13 min                     | 67                  |
| Ouro ×1.40 por estágio                   | ×1.406          | 4521                 | 1 s (piso)                  | 2131                |
| Milestone ×4 a cada 25 (adotado em 0011) | ×1.186          | 313                  | 4 s (parede ~estágio 300)   | 184                 |
| Milestone ×2 a cada 10                   | ×1.146          | 11921                | 1 s (piso)                  | 2179                |

Todas as variantes usam ouro ×1.15 por estágio, exceto a que muda o ouro. Leitura: no equilíbrio ou acima dele (ouro ≥ necessário) não existe parede; um pouco abaixo dele a parede só chega horas depois, o que combina com o rebirth da Fase 3.

**Com timer de boss, ainda na curva antiga (2026-10-17, 8 h, seed 1):** ativo chega ao estágio 50 em 4 min (igual), 300 em 4h17 (antes 3h00) e termina no 328 com 20 bosses perdidos; idle termina no 202 com 36 perdidos (antes 226).

**Curva antiga sem timer de boss, em 8 h** (seed 1): no ativo, estágio 200 em 28 min e 300 em 3 h, terminando no 347 (só +34 estágios entre a 4ª e a 8ª hora, ~5,5 min por estágio no 300); no idle, estágio 100 em 1h16 e 200 em 5h07, terminando no 226.

## Observações de playtest

- **2026-10-17:** o criador jogou um pouco e chegou ao **estágio 57 sem o mínimo de esforço** — está fácil demais; a vida dos monstros e bosses ficava bem abaixo do ideal ao subir de zona. Bate com o sim (perfil ativo chegava ao estágio 50 em ~4 min). **Resolvido em 0016:** HP inicial ×3 e crescimento ×1.18; sem crítico, o ativo chega ao 50 em ~22 min e encontra a barreira entre 50 e 100 (depois substituído por 0017, abaixo).

**Curva de 0016 (substituída por 0017), 2026-10-17, 8 h, seed 1, sem crítico:** ativo (5 cliques/s) chega ao estágio 50 em 22 min, 100 em 2h04 e termina no 130 (14 bosses perdidos); casual (2/s) 50 em 58 min, 100 em 6h45, final 106; idle termina no 66. Com o crítico ainda ligado, o ativo chega ao 50 em 17 min. A varredura completa de alternativas está em [0016](decisions/0016-hp-dos-monstros-x3-e-crescimento-1-18.md).

- **2026-10-17 (depois de 0016):** o criador achou o jogo **muito travado** e pediu outra mecânica: 9 monstros até o boss, com a vida subindo de 10 (1/10) até ~100 (9/10), boss de ~1k, e sem crítico padrão. Aplicado em [0017](decisions/0017-zona-com-rampa-de-hp-e-boss-1k.md) e [0018](decisions/0018-critico-so-por-upgrade.md).

**Curva de 0017 (ouro substituído por 0019), 2026-10-17, 8 h, seed 1, sem crítico:** ativo (5 cliques/s) chega à zona 10 em 1m09, 50 em 4m18 e 100 em 1h07, terminando na 130 (1ª derrota de boss com 11 min); 2 cliques/s chega à 50 em 11 min e 100 em 2h30, final 117; idle chega à 50 em 47 min, final 89. A varredura completa está em [0017](decisions/0017-zona-com-rampa-de-hp-e-boss-1k.md).

- **2026-10-17 (depois de 0017):** a primeira fase demorou, mas com o ouro do primeiro boss o criador chegou ao **estágio 4 em 10 s**, um clique matava qualquer inimigo e os bosses morriam em ~3 s. O sim já mostrava isso e tinha sido lido errado; agora mede o tempo de cada boss. Resolvido em [0019](decisions/0019-ouro-do-boss-e-ouro-por-hp.md): boss paga 2× o último monstro e 0.05 de ouro por HP.

**Curva atual (0019), 2026-10-17, 8 h, seed 1, sem crítico:** 5 cliques/s chega à zona 10 em 5m13, 50 em 25m36 e 100 em ~5h, com o boss levando 21,5 s (zonas 2–10), 13,3 s (11–30) e 15,7 s (31–60); 2 cliques/s chega à 10 em 10m38 e à 50 em 50 min, boss 14–19 s; idle chega à 50 em 3h35. Ao avaliar balanço, olhar a mediana do tempo de boss (`npm run sim`) junto com o tempo até cada zona.
