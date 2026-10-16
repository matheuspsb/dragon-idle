# 0007 — Tokens do design system em `src/ui/tokens.ts`

- **Data:** 2026-10-15
- **Status:** aceita

## Contexto

O CLAUDE.md pede que cores, tipografia, espaçamentos, formas dos placeholders e estilos de texto fiquem em tokens centralizados, sem valores visuais hardcoded. As cores estavam repetidas em `main.ts` e `GameScene.ts`, às vezes como string (`'#cc2222'`) e às vezes como número (`0xcc2222`).

## Decisão

- Um único módulo, `src/ui/tokens.ts`, com duas camadas de cor: `palette` (privada, os hex de fato) e `colors` (pública, nomes semânticos como `boss`, `gold`, `damageCrit`). O código só usa `colors`.
- Também em `tokens.ts`: `fontSizes`, `textStyles` (estilos de texto do Phaser prontos), `spacing` e `placeholders` (tamanho e cor de cada forma).
- Cores são guardadas como string `#rrggbb`. Onde o Phaser exige número (formas), `toColorNumber()` converte e rejeita formatos inválidos.
- Componentes reutilizáveis em `src/ui/` consomem os tokens; o primeiro é `placeholders.ts` (`addBossPlaceholder`, `addKnightPlaceholder`, `addGoldPlaceholder`).

## Alternativas consideradas

- **Guardar cores como número (`0xcc2222`):** evita a conversão nas formas, mas textos do Phaser pedem string; teria a conversão inversa.
- **Arquivo JSON de tokens:** mais neutro, mas perde a checagem de tipos e o `satisfies TextStyle`.

## Consequências

- Trocar uma cor ou fonte é uma edição em um lugar só; a arte final (Fase 5) entra pelos mesmos tokens.
- Paleta 16-bit com 32+ cores (ver Estilo visual no CLAUDE.md) cabe na camada `palette` sem mudar o código que usa `colors`.
- O fundo da página em `index.html` (`#000`, fora do canvas) ainda é CSS solto, fora dos tokens.
