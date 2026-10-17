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

Código: `src/core/systems/stageGenerator.ts`, `src/core/systems/critRoll.ts`, `src/core/systems/damage.ts`.

**Inimigos por estágio:** 5 monstros + 1 boss.

```
HP_monstro(s)   = 20 × 1.15^(s − 1)
ouro_monstro(s) =  1 × 1.15^(s − 1)
boss            = 8 × monstro   (HP e ouro)
```

Totais por estágio: `HP(s) = 260 × 1.15^(s − 1)` e `ouro(s) = 13 × 1.15^(s − 1)`.

**Tempo para limpar um estágio:** `t(s) = HP(s) / DPS`.

**Timer de boss** (ver [0015](decisions/0015-timer-de-boss-com-farm.md)): o boss tem 30 s. Para vencê-lo é preciso

```
DPS ≥ HP_boss(s) / 30 = 8 × 20 × 1.15^(s − 1) / 30 ≈ 5.33 × 1.15^(s − 1)
```

Se falhar, o jogador farma o estágio (só monstros, com ouro) até conseguir esse DPS e desafiar de novo.

**Críticos (só no clique):** um sorteio decide o resultado. Super crítico: 1%, `× 10`. Crítico: 12%, `× 2.5`. Normal: o resto.

Multiplicador médio de um clique:

```
E = 1 + 0.12 × (2.5 − 1) + 0.01 × (10 − 1) = 1.27
```

**Cavaleiros:** dano fixo `dano(k)` a cada `intervalo` segundos (hoje 1 s), sem crítico. `DPS_cavaleiro = dano(k) / intervalo`.

## Condição de equilíbrio (a "parede")

Para avançar um estágio, o dano precisa crescer `× 1.15` (o crescimento do HP). Ignorando o termo linear, o dano cresce `m^(1/M)` por nível, então são necessários

```
níveis por estágio = ln(1.15) / ln(m^(1/M))
```

e o custo desses níveis cresce, por estágio,

```
crescimento do custo por estágio = 1.15^( ln r / ln(m^(1/M)) )
```

O jogo só se sustenta se o ouro por estágio crescer pelo menos isso:

```
crescimento do ouro ≥ crescimento_HP^( ln r / ln(m^(1/M)) )
```

Com os valores atuais (`m = 4`): `ln 1.07 / (ln 4 / 25) ≈ 1.22`, então o ouro precisaria crescer `1.15^1.22 ≈ 1.186` por estágio. Ele cresce `1.15`, **um pouco abaixo de propósito**: a parede existe, mas só chega depois de algumas horas, o que leva o jogador ao rebirth (Fase 3). Com `m = 2` o necessário era `≈ 1.41` e a parede chegava em ~40 min (ver [0011](decisions/0011-milestone-x4-para-adiar-a-parede.md)).

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

**Teto de velocidade:** cada golpe mata no máximo um inimigo (o overkill é perdido) e um estágio tem 6 inimigos. Com dano sobrando, o tempo por estágio para em `6 / golpes por segundo` (6 s no idle com 1 cavaleiro; ~1 s no ativo a 5 cliques/s). Quando o sim mostra esse piso, não há parede: o jogo virou corrida.

**Medições de 2026-10-15** (4 h, seed 1; "tempo/estágio" é o tempo gasto no estágio indicado):

| Variante                          | Ouro necessário | Ativo: estágio final | Ativo: tempo/estágio no 100 | Idle: estágio final |
| --------------------------------- | --------------- | -------------------- | --------------------------- | ------------------- |
| Anterior (×2 a cada 25)           | ×1.406          | 102                  | ~13 min                     | 67                  |
| Ouro ×1.40 por estágio            | ×1.406          | 4521                 | 1 s (piso)                  | 2131                |
| **Atual: milestone ×4 a cada 25** | ×1.186          | 313                  | 4 s (parede ~estágio 300)   | 184                 |
| Milestone ×2 a cada 10            | ×1.146          | 11921                | 1 s (piso)                  | 2179                |

Todas as variantes usam ouro ×1.15 por estágio, exceto a que muda o ouro. Leitura: no equilíbrio ou acima dele (ouro ≥ necessário) não existe parede; um pouco abaixo dele a parede só chega horas depois, o que combina com o rebirth da Fase 3.

**Com timer de boss (2026-10-17, 8 h, seed 1):** ativo chega ao estágio 50 em 4 min (igual), 300 em 4h17 (antes 3h00) e termina no 328 com 20 bosses perdidos; idle termina no 202 com 36 perdidos (antes 226).

**Curva sem timer de boss, em 8 h** (seed 1): no ativo, estágio 200 em 28 min e 300 em 3 h, terminando no 347 (só +34 estágios entre a 4ª e a 8ª hora, ~5,5 min por estágio no 300); no idle, estágio 100 em 1h16 e 200 em 5h07, terminando no 226.

## Observações de playtest

- **2026-10-17:** o criador jogou um pouco e chegou ao **estágio 57 sem o mínimo de esforço** — está fácil demais. Bate com o sim (perfil ativo chega ao estágio 50 em ~4 min). Rodar simulações e ajustar depois que o timer de boss existir, já que ele muda a parede.
