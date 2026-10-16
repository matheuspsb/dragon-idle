# 0010 — Balance-sim no terminal com as regras reais do core

- **Data:** 2026-10-15
- **Status:** aceita

## Contexto

A Fase 1 termina com "simulação funciona no terminal". A condição de equilíbrio em `docs/game-math.md` previa uma parede cedo, mas faltava medir em quanto tempo de jogo ela aparece e comparar ajustes antes de mexer na config.

## Decisão

- **Motor em `src/sim/`**, puro e testado, que joga com as regras reais do core (`resolveHit`, `tickAutoDps`, `collectGold`, `buyLevels`) e RNG com seed, então cada execução é reproduzível.
- **Jogador roteirizado:** clica a uma taxa fixa (`clicksPerSecond`) e compra de forma gulosa o próximo nível com mais DPS por ouro (`chooseBestUpgrade`); se o melhor ainda não cabe no bolso, espera. O ganho do clique usa o multiplicador médio de crítico (`expectedHitMultiplier`, 1.27).
- **CLI fino em `scripts/balance-sim.ts`**, rodado com `tsx`: `npm run sim -- --hours=4 --cps=0,5 --seed=1 --step=0.1`. Imprime quando cada estágio-marco foi alcançado e quanto tempo se passou nele, mais a condição de equilíbrio calculada (`requiredGoldGrowthPerStage`).
- **Tipos de Node isolados:** `@types/node` foi instalado para os scripts, e para não vazar para o jogo os programas TypeScript foram separados: `tsconfig.json` cobre só `src/` (`types: []`), `tests/tsconfig.json` cobre testes e configs de ferramentas, `scripts/tsconfig.json` cobre os scripts. `npm run typecheck` checa os três. Antes, `vitest` e `@playwright/test` puxavam os tipos de Node para o programa inteiro; com `@types/node` instalado, `process` passaria a compilar dentro de `src/`.

## Alternativas consideradas

- **Rodar a simulação dentro do Vitest:** evitaria `tsx`, mas mistura ferramenta de análise com a suíte de testes e esconde a saída.
- **Build com Vite em modo SSR e rodar com Node:** sem dependência nova, mas com etapa de build a cada execução.
- **Fórmula analítica em vez de simulação:** já existe (`requiredGoldGrowthPerStage`), mas não mostra o tempo real de jogo, o teto de um golpe por inimigo nem a escolha entre clique e cavaleiro.

## Consequências

- Ajustes de balanço passam a ser comparados com números (tempo até cada estágio) em segundos de execução.
- A config é lida direto de `src/config/`; para testar uma variante, muda-se a config e roda-se de novo. Se isso virar rotina, o core vai precisar receber a config por parâmetro.
- A política gulosa é uma aproximação de jogador; jogadores reais podem ser piores (ou melhores) que ela.
- Primeiros achados (4 h, seed 1): a parede aparece por volta do estágio 75 no perfil ativo e do 40 no idle; o começo idle é lento (10 min até o estágio 5); e, quando o clique escala bem, a política ignora os cavaleiros por completo.
