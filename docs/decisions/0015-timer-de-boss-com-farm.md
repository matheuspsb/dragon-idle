# 0015 — Timer de boss com farm e "Enfrentar boss"

- **Data:** 2026-10-17
- **Status:** aceita

## Contexto

Até aqui o boss nunca vencia: a parede da curva (0005, 0011) só deixava o jogo mais lento. O item "Progressão de boss" da Fase 2 precisava de uma barreira de verdade, que é o que dá sentido ao rebirth (Fase 3). Foram consideradas três opções e o criador escolheu o modelo do Clicker Heroes.

## Decisão

- **Timer:** ao chegar no boss, `bossTimeLeftSeconds` começa em `BOSS_TIME_LIMIT_SECONDS = 30` (`src/config/stageConfig.ts`) e só corre pelo tick fixo (`tickBossTimer`).
- **Falha:** se o tempo zerar, o estágio recomeça com monstros novos e boss com HP cheio, e o combate entra no modo `farming`.
- **Farm:** os monstros continuam vindo e dando ouro, mas o boss não aparece; o estágio não avança.
- **Enfrentar boss:** `challengeBoss` (só no farm) leva direto ao boss, com HP e tempo cheios, e volta ao modo `progressing`.
- Matar o boss a tempo avança o estágio e zera o timer, como antes.
- **Tolerância de tempo** (`1e-9 s`): a soma de passos de 0,05 s deixa resíduo de ponto flutuante; sem ela o boss sobreviveria um tick a mais.
- **UI:** `BossTimer` (texto e barra, redesenha só quando o décimo de segundo exibido muda), botão "Enfrentar boss" visível só no farm, e o rótulo do estágio mostra "monstro N/5", "BOSS" ou "farmando".
- **Balance-sim:** o jogador simulado conta o timer e, no farm, só desafia o boss quando `DPS esperado × 30 s ≥ HP do boss` (`shouldChallengeBoss`); o relatório mostra quantos bosses foram perdidos.
- **Gancho de dev:** `skipTime(segundos)` e, no snapshot, modo, tipo de inimigo e tempo do boss.

## Alternativas consideradas

- **Timer e voltar ao começo do estágio, enfrentando o boss automaticamente:** mais simples, mas na parede vira um laço de derrotas sem escolha do jogador.
- **Sem timer, só destaque visual:** mantém a parede como "mais lento", sem barreira; o rebirth perderia motivo.

## Consequências

- Balance-sim (8 h, seed 1): no ativo, o estágio 300 chega em 4h17 (antes 3h00) e o final cai de 347 para 328, com 20 bosses perdidos; no idle, de 226 para 202, com 36 perdidos. O início não muda: o ativo chega ao estágio 50 em 4 min, porque o DPS do clique passa com folga de qualquer boss até perto do estágio 200.
- O começo continua fácil demais para quem clica (playtest do criador: estágio 57 sem esforço); fica para a rodada de simulações registrada no ROADMAP.
- A condição para vencer o boss é `DPS ≥ 8 × HP_monstro(s) / 30` (ver `docs/game-math.md`).
- `src/core/state/CombatState.ts` ganhou `mode` e `bossTimeLeftSeconds`; o save (próximo item) precisa guardá-los.
