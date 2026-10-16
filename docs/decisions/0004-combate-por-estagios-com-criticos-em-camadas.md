# 0004 — Combate por estágios com críticos em camadas

- **Data:** 2026-08-26 (registrada retroativamente em 2026-10-15)
- **Status:** aceita

## Contexto

O núcleo do jogo é clicar (e ter cavaleiros atacando) para derrotar inimigos e avançar. Era preciso definir a unidade de progressão e como o dano varia.

## Decisão

- **Estágios:** cada estágio tem 5 monstros seguidos de 1 boss. Derrotar o boss gera o próximo estágio.
- **Curvas por estágio:** HP e ouro crescem `× 1.15` por estágio; o boss tem `× 8` de HP e de ouro em relação ao monstro.
- **Críticos em camadas (só no clique):** um único sorteio decide o resultado — super crítico (1%, `× 10`), crítico (12%, `× 2.5`) ou normal.
- **Cavaleiros:** dano fixo por ataque em intervalo próprio, sem crítico.
- O gerador de aleatoriedade é injetável (`rng`) para testes determinísticos.

Todos os números são placeholders em `src/data/stageConfig.ts` e `src/data/critConfig.ts`, a ajustar na Fase 4.

## Alternativas consideradas

Não há registro das alternativas avaliadas na época. _(Completar se houver.)_

## Consequências

- Progressão simples de ler e de simular (um estágio = uma unidade de progresso).
- O crítico deixa o clique ativo mais recompensador que o dano passivo dos cavaleiros.
- Ouro e HP crescendo na mesma taxa (1.15) interagem com o custo dos upgrades; ver 0005.
