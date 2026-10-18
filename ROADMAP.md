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
- [x] Phaser renderizando boss, cavaleiros, ouro (estado real do core, barra de HP, estágio)
- [x] Clique funcional com feedback (números flutuantes por tipo de golpe, com pool de objetos)
- [x] Compra de upgrades via UI (modos x1, x10 e Máx)
- [x] Progressão de boss (timer de 30 s, farm e "Enfrentar boss")
- [x] Simulações de balanço do "fácil demais" (playtest de 2026-10-17): HP inicial ×3 e crescimento ×1.18 por estágio (ver `docs/decisions/0016`); o sim agora mede a 1ª derrota de boss e um perfil casual
- [x] Zona com 9 monstros em rampa de HP (10 → 100), boss de 1k e ouro proporcional ao HP, depois do playtest "muito travado" (ver `docs/decisions/0017`)
- [x] Pós-boss rápido demais (playtest: estágio 4 em 10 s, boss morrendo em 3 s): boss paga 2× o último monstro e 0.05 de ouro por HP; o sim mede o tempo de cada boss (ver `docs/decisions/0019`)
- [x] Tirar o crítico do jogo base: a chance vira estado do clique começando em 0% (ver `docs/decisions/0018`)
- [ ] Save/load LocalStorage
- [ ] Polimento básico de UX

**Saída:** jogo jogável end-to-end com 1 zona.

---

## Fase 3 — Meta-progressão `(3-4 semanas, ~25h)`

- [ ] Rebirth implementado
- [ ] Almas Ancestrais e upgrades permanentes
- [ ] Upgrade de crítico (chance e multiplicador) — o crítico só existe via upgrade; decidir se é comprado com ouro ou com almas
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

---

## Brainstorm — ideias para o futuro

> Ideias soltas, **sem prioridade nem compromisso**. Quando uma ideia virar plano, ela sai daqui e entra numa fase acima (e ganha registro em `docs/decisions/` se for estrutural). Antes de entrar, passar pelo balance-sim quando mexer em números. 🌐 = exige servidor/online, o que hoje o projeto não tem (decisão grande, avaliar junto com Steamworks).

### Upgrades compráveis

**Com ouro (dentro da run, zeram no rebirth)**

- Crítico: chance, multiplicador e super crítico (já previsto na Fase 3)
- Dano de clique escalando com o DPS dos cavaleiros (ex: clique ganha +1% do DPS total), para o clique não ficar inútil no idle
- Velocidade de ataque dos cavaleiros (reduz o intervalo entre golpes)
- Novos cavaleiros: desbloquear o 2º, 3º, 4º... cada um com custo e dano base próprios
- Multiplicador global de dano
- Dano extra contra boss
- Tempo extra contra boss (+5 s no timer)
- Ouro extra por kill e chance de "baú" com ouro bônus
- Desconto no custo dos upgrades
- Auto-clique (cliques automáticos por segundo)
- Habilidades ativas com recarga: Fúria (×2 de dano por 30 s), Chuva de ouro, Golpe do dragão (dano em área), Congelar o timer do boss

**Com almas (permanentes, entre runs)**

- Bônus permanente de dano e de ouro por alma acumulada
- Começar a run num estágio mais alto
- Mais almas por rebirth
- Ganho offline maior e limite de tempo offline maior
- Cavaleiros começam a run com nível mínimo
- Desbloqueio de automações: auto-compra de upgrades, auto-enfrentar boss
- Upgrades de crítico permanentes (se o crítico for de alma)

### Mecânicas que podem virar roadmap

**Progressão e conteúdo**

- Zonas/mapas temáticos (floresta, montanha, vulcão, gelo), cada um com inimigos, cores e bônus próprios
- Mapa de bosses: escolher qual dragão enfrentar, cada um com uma mecânica (escudo que absorve clique, regeneração, fúria ao ficar com pouco HP, imune a cavaleiros por alguns segundos)
- Bosses lendários ou semanais com recompensa rara
- Fraquezas elementais (fogo, gelo, raio) entre cavaleiros e dragões
- Eventos sazonais com bosses e recompensas temáticas

**Heróis e cavaleiros**

- Heróis com classe e identidade (tanque, mago, arqueiro, paladino) e uma habilidade passiva cada
- Sinergias de grupo: bônus por combinação de classes
- Equipamentos (armas, armaduras, anéis) com raridade, encantamento e forja
- Árvore de talentos por herói
- Pets e montarias (filhotes de dragão aliados que ajudam no combate)
- Recrutamento de heróis por sorteio justo, sem dinheiro real

**Meta-progressão**

- Rebirth em camadas (rebirth → ascensão → transcendência), cada camada com sua moeda
- Artefatos/relíquias permanentes com efeitos únicos
- Conquistas com bônus pequenos (integram com as conquistas da Steam)
- Desafios: runs com regras especiais (sem clique, só um cavaleiro, tempo limitado) que dão recompensas permanentes
- Bestiário: cada tipo de dragão derrotado dá um bônus de coleção

**Social e online 🌐**

- Guildas com bônus coletivo e chat
- Raids: boss gigante com HP compartilhado pela guilda ou pela comunidade, com recompensa por contribuição
- Rankings (estágio máximo, DPS, velocidade de rebirth)
- Torneios e temporadas competitivas
- Troca de itens entre jogadores

**Qualidade de vida**

- Estatísticas da run (DPS, ouro por segundo, tempo por estágio, bosses perdidos)
- Notação numérica configurável (sufixos, científica)
- Tela de boas-vindas offline detalhada (o que foi ganho enquanto estava fora)
- Configurações de áudio, números flutuantes e efeitos
- Cloud save (já previsto na Fase 5)
