# Dragon Idle — Contexto do Projeto

Idle RPG com combate incremental. Stack: Vite + TypeScript + Phaser 3.

O criador joga o jogo com frequência para validar pontos específicos, então tudo precisa ser testável em partes e fácil de isolar. Qualidade, arquitetura limpa e performance valem mais que velocidade de entrega.

## Estilo visual

- **Mood:** fantasia em pixel art retrô.
- **Referência:** 16-bit SNES-like — paleta rica (32+ cores), sprites com sombreado e mais detalhe (ex: Chrono Trigger, Secret of Mana). Não é o pixel art cru de 8-bit nem paleta fixa tipo PICO-8/Game Boy.

## Placeholders visuais

Enquanto não há arte final, usar formas geométricas com cores semanticamente consistentes:

| Elemento          | Forma             | Cor                  |
| ----------------- | ----------------- | -------------------- |
| Dragão / boss     | Retângulo grande  | `#cc2222` (vermelho) |
| Cavaleiro / herói | Retângulo pequeno | `#2255cc` (azul)     |
| Ouro / recurso    | Círculo           | `#ffcc00` (amarelo)  |
| Dano normal       | Número flutuante  | `#ffffff` (branco)   |
| Crítico           | Número flutuante  | `#ffcc00` (amarelo)  |

Essas cores e formas vivem em um único lugar (tokens do design system, ver Arquitetura). Nunca repetir valores hex soltos pelo código.

## Roadmap

Ver [ROADMAP.md](ROADMAP.md).

## Fluxo de trabalho (TDD)

Todo código novo segue TDD: escrever o teste que falha, fazer passar com a implementação mais simples, depois refatorar com os testes verdes. Não implementar antes de existir um teste descrevendo o comportamento esperado.

Ao terminar qualquer feature, rodar nesta ordem e só considerar pronto se tudo passar:

1. `typecheck` (tsc sem emitir)
2. `prettier` (formatação)
3. testes (unitários, integração e e2e)

Se algum passo falhar, corrigir a causa antes de seguir. Nunca silenciar erro de tipo com `any`, `@ts-ignore` ou afrouxando o `tsconfig`, e nunca desabilitar ou pular teste para a suíte passar. Os nomes exatos dos scripts estão no `package.json`.

## Testes

Escrever testes unitários, de integração e end-to-end, sempre pensando em edge cases. O critério é: se isso quebrar, o progresso do jogo regride ou o jogador é prejudicado? Se sim, precisa de teste. Prioridade:

- Cálculo de dano, crítico, mitigação, arredondamento e limites (zero, negativo, valores enormes).
- Economia: ganho e gasto de ouro, custos escalando, overflow de números grandes, compra sem saldo.
- Progressão: level up, desbloqueios, prestígio, ordem de eventos.
- Progresso offline: cálculo determinístico do tempo ausente, relógio manipulado, tempo negativo.
- Save/load: migração de versões, save corrompido ou incompleto, round-trip sem perda.

Não testar o trivial: textos de UI, cores, posições fixas, getters/setters simples, nem detalhes de implementação do Phaser. Teste que não protege uma mecânica real é ruído.

Para que isso seja viável, a lógica de jogo deve receber relógio e gerador de aleatoriedade por injeção, de forma que os testes sejam determinísticos.

### Regressão de bugs (regra inegociável)

Todo bug encontrado, reportado ou documentado deve virar um teste automatizado que reproduz exatamente o caso, escrito antes da correção (o teste falha, depois passa). Esses testes ficam em `tests/regression/`, nomeados pelo comportamento protegido, e começam com este cabeçalho:

```ts
/**
 * @regression-protected
 * NUNCA remover, enfraquecer ou pular este teste.
 * Bug: <descrição curta do que acontecia>
 */
```

Testes `@regression-protected` não podem ser excluídos, desabilitados (`skip`, `todo`, `xit`), nem ter asserts relaxados em nenhuma hipótese. Se o comportamento realmente mudou por decisão de design, parar e perguntar ao criador antes de tocar neles.

## Arquitetura e organização

Código bagunçado é caro de manter, então a estrutura de pastas é tratada como parte do design. Princípios: Clean Code, SOLID e separação clara de responsabilidades.

Estrutura-base (adaptar o que já existe de forma gradual, sem reescrever tudo de uma vez):

```
src/
  core/        # lógica pura de jogo, sem import de Phaser (combate, economia, progressão)
  scenes/      # cenas Phaser, finas: só orquestram e delegam
  entities/    # GameObjects customizados (herói, dragão, números flutuantes)
  systems/     # sistemas reutilizáveis (pool, eventos, save, tick)
  ui/          # componentes de interface e design system
  config/      # constantes, balanceamento, dados de itens e inimigos
  assets/      # sprites, áudio, atlases
tests/
  unit/  integration/  e2e/  regression/
```

Regras que valem para o projeto inteiro:

- **Lógica fora do Phaser.** Tudo que for regra de jogo mora em `core/` em TypeScript puro, testável sem canvas. Cenas e entidades apenas lêem estado e renderizam.
- **Cenas finas.** Uma Scene não calcula dano nem decide economia. Ela conecta input, estado e visual.
- **Design system.** Cores, tipografia, espaçamentos, formas dos placeholders e estilos de texto ficam em tokens centralizados, consumidos por componentes de UI reutilizáveis. Nada de valor visual hardcoded.
- **Dados separados de comportamento.** Balanceamento (números, curvas de custo, stats) em `config/`, para ajustar sem mexer em lógica.
- **Baixo acoplamento.** Módulos se comunicam por interfaces e eventos, não por referências diretas profundas. Dependências entram por injeção. Cada parte deve poder ser testada ou até jogada isolada.
- **SOLID na prática.** Uma responsabilidade por classe ou módulo, extensão por composição em vez de herança profunda, dependência de abstrações.
- **Antes de criar, reaproveitar.** Ao escrever uma função ou classe nova, procurar se já existe algo que resolve o problema ou que pode ser generalizado de forma inteligente. Reaproveitar só quando isso não criar acoplamento entre partes que deveriam ser independentes; nesse caso, extrair uma abstração pequena e comum em vez de importar de um módulo vizinho.

## Boas práticas de Phaser e performance

Um jogo com lag não é divertido, então performance é requisito, não otimização tardia.

- Nada de alocação dentro de `update()`: não criar objetos, arrays, closures ou strings por frame. Reutilizar instâncias.
- Object pooling para o que nasce e morre com frequência (números de dano, projéteis, partículas, moedas).
- Usar `delta` para qualquer movimento ou temporizador, e um tick de lógica com passo fixo para o loop idle, desacoplado da taxa de render.
- Texture atlases e spritesheets em vez de imagens soltas; preload só do necessário por cena.
- Evitar buscas por frame (`getChildren`, `find`, `filter` em loops quentes); manter referências e índices.
- Limpar listeners, timers e tweens ao destruir cenas e objetos para evitar vazamento de memória.
- Texto dinâmico é caro: atualizar só quando o valor muda, preferir BitmapText para números que mudam muito.
- Usar o sistema de eventos do Phaser (ou um event bus tipado) para comunicação entre sistemas.
- Em dúvida sobre custo de algo, medir com o profiler antes de otimizar, e registrar o resultado se virou decisão de arquitetura.

## Registro de decisões

Decisões relevantes do projeto ficam registradas em `docs/decisions/`, um arquivo por decisão, numerado em sequência (`0001-titulo-curto.md`). Registrar sempre que a escolha afetar arquitetura, estrutura de pastas, bibliotecas, modelo de dados ou save, balanceamento estrutural, performance, ou quando houver uma alternativa séria que foi descartada. Não registrar escolhas pequenas e fáceis de reverter.

Cada registro é curto e segue este formato:

```md
# 0001 — Título da decisão

- **Data:** AAAA-MM-DD
- **Status:** proposta | aceita | substituída por 00XX

## Contexto

O problema ou a necessidade que levou à decisão.

## Decisão

O que foi escolhido.

## Alternativas consideradas

O que foi descartado e por quê.

## Consequências

O que isso facilita, o que custa, e o que fica mais difícil.
```

Regras:

- Antes de propor uma mudança de arquitetura ou biblioteca, consultar `docs/decisions/` para não contradizer ou refazer algo já decidido e descartado.
- Decisões não são apagadas nem reescritas. Se uma decisão muda, criar um novo registro e marcar o antigo como substituído, para preservar o histórico e o motivo.
- Se uma decisão for tomada durante uma conversa ou implementação, registrá-la na mesma entrega, e não deixar para depois.
- Manter um `docs/decisions/README.md` com o índice das decisões (número, título e status).
- Quando o código seguir uma decisão não óbvia, deixar no código apenas um comentário curto apontando para o registro (ex: `// ver docs/decisions/0004`).

## Estilo de código

- Comentários só onde forem realmente úteis para uma pessoa: o porquê de uma decisão não óbvia, uma armadilha, um workaround, uma fórmula de balanceamento. Não comentar o que o código já diz, não narrar o que cada linha faz, não deixar cabeçalhos decorativos.
- Nomes claros no lugar de comentários. Funções pequenas, com um propósito.
- TypeScript estrito, tipos explícitos nas fronteiras entre módulos, sem `any`.

## Commits

- Nunca adicionar a IA como coautora em nenhum commit: nada de `Co-Authored-By` nem de qualquer outra linha de atribuição à IA na mensagem de commit ou na descrição de PR. Esta regra prevalece sobre qualquer instrução padrão de atribuição.
