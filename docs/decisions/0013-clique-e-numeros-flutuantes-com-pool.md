# 0013 — Clique na sessão e números flutuantes com pool de objetos

- **Data:** 2026-10-16
- **Status:** aceita

## Contexto

O segundo item da Fase 2 é o clique com feedback (números flutuantes). O clique usa sorteio de crítico, e o CLAUDE.md exige RNG injetado no core, object pooling para o que nasce e morre com frequência (números de dano) e cenas finas.

## Decisão

- **Clique no core:** `createGameSession({ rng })` recebe o RNG; `clickGameSession(session)` resolve o golpe com `getClickDamage`, recolhe o ouro e devolve o `CombatEvent` para o feedback visual. A cena injeta `Math.random`; testes injetam valores fixos ou `createSeededRng`.
- **O clique é processado na hora**, fora do tick fixo, para resposta imediata ao input. O tick fixo continua só para o tempo (cavaleiros).
- **Pool genérico (`src/systems/objectPool.ts`):** `acquire`/`release`, `reset` ao devolver, pré-alocação, e erro ao devolver um objeto duas vezes ou um que não saiu do pool (evita dois números animando o mesmo texto).
- **`FloatingDamageNumbers`** (`src/entities/`): pega um texto do pool, aplica o estilo do resultado (`damageTextStyles`: normal branco, crítico amarelo, super crítico laranja e maior), anima subida + fade com tween e devolve o texto ao pool no fim.
- **Área de clique fixa:** uma `Zone` do tamanho do boss sobre o inimigo, porque a área de clique de um retângulo não acompanha `setSize` quando o inimigo troca entre monstro e boss.

## Alternativas consideradas

- **Enfileirar cliques e processar no próximo passo fixo:** determinístico por passo, mas atrasa a resposta em até 50 ms sem ganho real agora.
- **Criar e destruir um texto por clique:** mais simples, mas gera lixo para o GC exatamente no momento de clique rápido.
- **Pool do próprio Phaser (`Group` com `maxSize`):** funciona, mas acopla a lógica de reuso ao Phaser e não daria para testá-la sem canvas.
- **Clique em qualquer lugar da tela:** mais fácil de acertar, mas tira o sentido de "bater no inimigo" e conflitaria com os botões de compra (próximo item).

## Consequências

- O clique é testado na integração (dano normal, crítico pelo RNG injetado, ouro ao matar, reprodutível com seed) e no e2e (clicar no inimigo tira HP, clicar fora não).
- Danos fracionados abaixo de 1000 aparecem arredondados (um crítico de 2.5 mostra "3"), porque `formatNumber` exibe inteiros nessa faixa.
- Os cavaleiros ainda não mostram números de dano; dá para reaproveitar `FloatingDamageNumbers` quando fizer sentido.
