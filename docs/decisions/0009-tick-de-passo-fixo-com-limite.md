# 0009 — Tick de passo fixo com limite de passos por frame

- **Data:** 2026-10-15
- **Status:** aceita

## Contexto

O CLAUDE.md pede um tick de lógica com passo fixo, desacoplado da taxa de render, e nada de alocação em `update()`. A suspeita era que `tickAutoDps`, por criar um array e objetos de evento a cada chamada, pesaria quando rodasse por frame. Antes de otimizar, o custo foi medido (Node 22, 200 mil chamadas após aquecimento):

| Cenário                                        | Custo por frame | % de um frame a 60 fps |
| ---------------------------------------------- | --------------- | ---------------------- |
| 1 cavaleiro, sem ataque no frame (array vazio) | 0.04 µs         | 0.0003%                |
| 1 cavaleiro atacando todo frame                | 2.7 µs          | 0.016%                 |
| 5 cavaleiros atacando todo frame               | 12.8 µs         | 0.077%                 |
| 50 cavaleiros atacando todo frame              | 124 µs          | 0.74%                  |

O array é desprezível; o custo de cada ataque (~2.5 µs) vem das operações com `Decimal`, que sempre alocam (ver 0003). O risco real é o **catch-up**: com a aba em segundo plano por 1 hora, o próximo `delta` seria 3600 s e cada cavaleiro simularia 3600 golpes (~9 ms cada), travando a tela.

## Decisão

- `src/systems/fixedStepTicker.ts`: acumula o `delta` do frame e chama a lógica uma vez por passo fixo completo, passando sempre o mesmo `stepSeconds`.
- **Limite por frame** (`maxStepsPerAdvance`): o tempo além do limite não é simulado; vai para `pendingOfflineSeconds`, que o progresso offline (Fase 3) consome com `takePendingOfflineSeconds`.
- `delta` negativo, `NaN` ou infinito é ignorado.
- **Não** mexer no array de `tickAutoDps`: a medição não justifica, e a alocação dominante (`Decimal`) não seria removida.
- O ticker será ligado à cena quando o loop do jogo for montado (Fase 2).

## Alternativas consideradas

- **Buffer reaproveitado em `tickAutoDps`:** segue a regra ao pé da letra, mas sem ganho medido, e complica a API.
- **Simular todo o tempo ausente golpe a golpe:** correto, mas trava a tela; o progresso offline deve ser calculado de forma analítica.
- **Deixar o ticker para a Fase 2:** adiaria a proteção contra catch-up para quando o loop já estivesse montado sem ela.

## Consequências

- A lógica fica determinística e independente do frame rate (testado: 60 e 144 fps dão os mesmos passos, sem drift em 1 hora).
- Um frame nunca roda mais que `maxStepsPerAdvance` passos de lógica.
- A Fase 3 precisa consumir `pendingOfflineSeconds`; até lá, esse tempo é perdido.
- Se o número de cavaleiros ou de golpes por passo crescer muito, medir de novo antes de otimizar.
