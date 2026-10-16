# Dragon Idle — Roadmap

## Fase 0 — Setup `(1-2 semanas, ~10-15h)`

- [x] Repo Git, Vite + TS + Phaser + ESLint + Prettier
- [x] "Hello world" de Phaser rodando
- [x] break_eternity integrado e funcionando
- [x] Scaffold de pastas
- [x] Decidir estilo visual (paleta, mood) usando referências

**Saída:** projeto vazio mas estruturado.

---

## Fase 1 — Core simulation `(3-4 semanas, ~25h)`

- [x] Sistema de Big Numbers
- [x] Modelo de combate (clique → dano → boss HP)
- [x] Cavaleiros com DPS auto
- [x] Sistema de ouro e custo de upgrade
- [x] Infraestrutura de qualidade: testes unitários, de regressão e e2e (Playwright), `npm run check`, registro de decisões (`docs/decisions/`) e modelo matemático (`docs/game-math.md`)
- [x] Testes unitários do core, incluindo casos de borda (dano/tempo inválidos, intervalos ≤ 0, números enormes)
- [x] Script de balance-sim rodando (`npm run sim`)
- [x] Ajuste da parede de ouro × custo com o balance-sim: milestone ×4 a cada 25 níveis (ver `docs/decisions/0011`)

**Saída:** simulação funciona no terminal, ainda sem UI bonita.

---

## Fase 2 — Gameplay loop visual `(4-5 semanas, ~35h)`

- [x] Base do loop: tick de lógica com passo fixo e tokens do design system com placeholders
- [ ] Phaser renderizando boss, cavaleiros, ouro
- [ ] Clique funcional com feedback (números flutuantes)
- [ ] Compra de upgrades via UI
- [ ] Progressão de boss
- [ ] Save/load LocalStorage
- [ ] Polimento básico de UX

**Saída:** jogo jogável end-to-end com 1 zona.

---

## Fase 3 — Meta-progressão `(3-4 semanas, ~25h)`

- [ ] Rebirth implementado
- [ ] Almas Ancestrais e upgrades permanentes
- [ ] Cálculo de offline rewards + modal de boas-vindas (consumir `pendingOfflineSeconds` do ticker, de forma analítica)
- [ ] Sistema de unlocks por feature flag

**Saída:** loop completo (run → rebirth → próxima run mais forte).

---

## Fase 4 — Conteúdo e balanceamento `(4-6 semanas, ~40h)`

- [ ] 15 bosses únicos (mesmo que reutilizando sprite com paleta)
- [ ] 5 cavaleiros com identidade própria
- [ ] 8 upgrades de alma
- [ ] MUITA simulação de balanço — ajustar curvas até o loop ser viciante
- [ ] Playtest com 2-3 amigos

**Saída:** jogo divertido por 10-15 horas + new game+ infinito.

---

## Fase 5 — Polish e Steam `(4-6 semanas, ~40h)`

- [ ] Arte final (asset packs ou comissão)
- [ ] Música e sound design completos
- [ ] Empacotamento Electron
- [ ] Integração Steamworks (achievements, cloud save)
- [ ] Steam page, screenshots, trailer
- [ ] Closed beta com 10-20 pessoas
- [ ] Bug fixing

**Saída:** build de release pronto.

---

## Fase 6 — Lançamento e pós `(contínuo)`

- [ ] Steam release
- [ ] Patches de bugs nas primeiras 2 semanas
- [ ] Decidir baseado em vendas: DLC? Sequência? Próximo projeto?
