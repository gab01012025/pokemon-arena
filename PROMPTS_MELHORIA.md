# 🎮 PROMPTS DE MELHORIA — Pokémon Arena (naruto-arena)

> Cada prompt abaixo é auto-contido e pode ser usado diretamente com um LLM de código.  
> Ordem sugerida de execução: **Prompt 1 → 2 → 3 → ... → 12**  
> Prompts independentes podem ser feitos em paralelo.

---

## ⚡ PROMPT 1 — Sistema de Turnos Alternados (Turn-Based)

```
CONTEXTO:
Tenho um jogo estilo Naruto Arena feito em Next.js/React em /src/app/battle/ai/page.tsx.
Atualmente os dois jogadores jogam ao mesmo tempo (ambos selecionam ações e executam juntos).
Preciso mudar para um sistema de TURNOS ALTERNADOS, onde cada jogador tem sua vez separada.

ARQUIVOS PRINCIPAIS:
- src/app/battle/ai/page.tsx (componente principal da batalha)
- src/app/battle/ai/types.ts (tipos - GamePhase já tem 'player1-turn' | 'player2-turn')
- src/app/battle/ai/engine.ts (helpers de energia e efeitos)

REGRAS DO SISTEMA DE TURNOS:
1. O jogo alterna entre 'player1-turn' e 'player2-turn'
2. No turno do Player 1 (jogador humano):
   - Ele seleciona ações para seus 3 Pokémon (ou menos, se tiver faintados)
   - Clica "END TURN" para executar
   - As ações são executadas uma a uma com animação
3. Após Player 1 executar, passa para 'player2-turn':
   - A IA seleciona e executa suas ações automaticamente
   - Após a IA terminar, inicia um novo turno voltando para 'player1-turn'
4. O timer só roda no turno do jogador humano
5. Cooldowns diminuem 1 no INÍCIO de cada turno completo (não de cada meio-turno)
6. Status effects também processam no início de cada turno completo

ALTERAÇÕES NECESSÁRIAS NO page.tsx:
- handleEndTurn(): Quando phase === 'player1-turn', executar ações do player, depois mudar para 'player2-turn' e executar IA, depois chamar startNewTurn()
- startNewTurn(): Incrementar turno, gerar energia para AMBOS, processar status, reduzir cooldowns
- O fluxo deve ser: player1-turn → executing → player2-turn → executing → player1-turn (novo turno)
- No BattleTopBar, o botão deve mostrar "END TURN" apenas quando for player1-turn, e "OPPONENT TURN" / "EXECUTING..." nos outros estados

NÃO altere a estrutura de componentes (PlayerColumn, EnemyColumn, etc).
Mantenha toda a lógica existente de itens, evolução e passivas de treinador.
Corrija qualquer variável 'newTurn' que esteja sendo usada antes de ser declarada (há um bug na function confirmEnergySelection que usa 'newTurn' antes da declaração).
```

---

## ⚡ PROMPT 2 — Corrigir Acúmulo de Energia

```
CONTEXTO:
No meu jogo Pokémon Arena (src/app/battle/ai/page.tsx), as energias NÃO estão acumulando entre turnos.
A cada turno, o jogador deveria GANHAR energia adicional (somando à existente), mas parece que está resetando ou não somando corretamente.

ARQUIVOS:
- src/app/battle/ai/engine.ts — função generateTurnEnergy() e addEnergy()
- src/app/battle/ai/page.tsx — function startNewTurn() e confirmEnergySelection()

PROBLEMAS IDENTIFICADOS:
1. generateTurnEnergy() retorna um EnergyState NOVO com apenas a energia gerada naquele turno, o que está correto.
2. MAS no page.tsx, a chamada setEnergy(prev => addEnergy(prev, newEnergy)) pode ter race conditions com React state porque outros setEnergy() podem estar acontecendo no mesmo ciclo de render.
3. Na confirmEnergySelection(), a energia inicial é gerada mas NÃO está sendo setada com addEnergy — está substituindo com setEnergy(initialEnergy) ao invés de somar.
4. Quando o jogador gasta energia (spendEnergyForMove), precisa garantir que apenas as energias gastas são subtraídas, e o restante permanece.

REGRA DE ENERGIA (TCG Pocket style):
- Turno 1: O primeiro jogador recebe APENAS 1 energia aleatória (dos 4 tipos selecionados + colorless)
- Turno 2+: Cada jogador recebe energia = número de Pokémon VIVOS
- A energia ACUMULA de turno em turno
- Energia gasta é subtraída imediatamente quando ações são executadas
- A IA também acumula energia da mesma forma

CORREÇÕES NECESSÁRIAS:
1. Em startNewTurn(), usar: setEnergy(prev => addEnergy(prev, newEnergy)) — garantir que isso está funcionando com o state mais recente
2. Em confirmEnergySelection(), setar a energia inicial corretamente
3. Em handleEndTurn(), gastar energia das ações ANTES de executá-las, usando um único setEnergy() com todas as subtrações
4. Garantir que aiEnergy também acumula corretamente

Corrija TODOS os pontos onde energia é manipulada para garantir acúmulo correto.
Adicione logs de debug no console para cada mudança de energia (console.log('[ENERGY]', ...)).
```

---

## ⚡ PROMPT 3 — Habilidades Mais Responsivas (Dano e Efeitos Funcionando Corretamente)

```
CONTEXTO:
No meu jogo Pokémon Arena, os danos e efeitos das habilidades NÃO estão respondendo conforme descrito na habilidade. Exemplo: um move diz "45 damage" mas pode causar muito mais ou muito menos.

ARQUIVOS:
- src/app/battle/ai/page.tsx — function executeAction()
- src/lib/damage-calculator.ts — calculateArenaDamage()
- src/lib/type-effectiveness.ts — getTypeEffectiveness()
- src/app/battle/ai/data.ts — definição dos moves com power, accuracy, statusEffect

PROBLEMAS:
1. O cálculo de dano na executeAction() é muito complexo — aplica defenseRatio (spAtk/spDef), STAB, type effectiveness, strengthen, weaken, reduce-damage, increase-damage, trainer passives, etc. O resultado final é MUITO diferente do power base da habilidade.
2. Os efeitos de status (burn, poison, paralyze, etc.) nem sempre são aplicados mesmo quando a chance é 100%.
3. O sistema de accuracy (miss chance) frustra o jogador quando moves importantes erram.
4. Moves com healing nem sempre curam o valor correto.

REGRAS DESEJADAS (estilo Naruto Arena/TCG simplificado):
1. Dano = move.power * typeEffectiveness * STAB (se aplicável)
   - Sem defenseRatio complexo (remover o cálculo de spAtk/spDef)
   - Super effective = 2x, Not very effective = 0.5x, No effect = 0x
   - STAB = 1.5x se o Pokémon tem o mesmo tipo do ataque
   - O crit chance pode ficar como está (6.25%, 1.5x multiplier)
2. Dano modificado por status effects:
   - strengthen: +value% de dano
   - weaken: -value% de dano no atacante
   - reduce-damage: -value flat de dano no defensor (mínimo 1)
   - increase-damage: +value flat de dano extra no defensor
   - reflect: reduz dano em value%
   - counter: reflete value% do dano de volta
3. Efeitos de status SEMPRE aplicam quando chance >= 100, e rolam corretamente para chances menores
4. Healing cura exatamente o valor especificado (capped em maxHp)
5. Accuracy: se accuracy = 100, NUNCA erra. Só erra se accuracy < 100.

REFATORE a function executeAction() no page.tsx para seguir essas regras EXATAMENTE.
Crie uma helper function calculateBattleDamage() no engine.ts que recebe:
  (basePower, moveType, attackerTypes, defenderTypes, attackerEffects, defenderEffects)
e retorna { damage, isCrit, effectiveness, effectivenessText }

Substitua a chamada a calculateArenaDamage() pela nova função.
Teste que "Flamethrower" (power 45, type fire) contra um Pokémon grass faz: 45 * 2.0 * 1.5 (STAB) = 135 dano base.
```

---

## ⚡ PROMPT 4 — Adicionar TODAS as Energias do Pokémon TCG Pocket

```
CONTEXTO:
O jogo já tem as 8 energias do TCG Pocket (grass, fire, water, lightning, psychic, fighting, darkness, metal) + colorless.
Preciso garantir que o sistema está COMPLETO e correto.

ARQUIVOS:
- src/app/battle/ai/types.ts — EnergyType
- src/app/battle/ai/data.ts — ALL_SELECTABLE_ENERGY_TYPES, TYPE_TO_ENERGY, ENERGY_ICONS, etc.
- src/app/battle/ai/engine.ts — energy helpers

VERIFICAR E COMPLETAR:
1. ✅ EnergyType já tem: 'grass' | 'fire' | 'water' | 'lightning' | 'psychic' | 'fighting' | 'darkness' | 'metal' | 'colorless'
2. ✅ ALL_SELECTABLE_ENERGY_TYPES já tem os 8 tipos (sem colorless)
3. Verificar TYPE_TO_ENERGY mapping — garantir que TODOS os 18 tipos Pokemon mapeiam para a energia correta do TCG Pocket:
   - Fire → fire
   - Water → water  
   - Grass → grass
   - Electric → lightning
   - Psychic → psychic
   - Fighting → fighting
   - Dark → darkness
   - Steel → metal
   - Ghost → psychic (no TCG Pocket, ghost usa psychic energy)
   - Rock → fighting
   - Ground → fighting
   - Poison → darkness
   - Bug → grass
   - Ice → water
   - Normal → colorless
   - Flying → colorless
   - Dragon → colorless OU fire/water dependendo do Pokémon (usar colorless como padrão)
   - Fairy → psychic (no TCG Pocket, fairy usa psychic energy)
4. Atualizar os ENERGY_ICONS para usar emojis melhores ou ícones SVG
5. No EnergySelectScreen, garantir que o jogador vê claramente quais energias seus Pokémon precisam
6. Garantir que a IA recebe as energias corretas baseado nos tipos do seu time

O jogador escolhe EXATAMENTE 4 tipos de energia antes da batalha.
Durante a batalha, a cada turno, N energias aleatórias são geradas dos 4 tipos escolhidos + colorless.
O colorless SEMPRE está disponível como possibilidade de geração.
```

---

## ⚡ PROMPT 5 — Vantagem e Desvantagem de Tipo (TCG Pocket Style)

```
CONTEXTO:
Preciso implementar o sistema de Weakness e Resistance do Pokémon TCG Pocket no meu jogo.

DIFERENÇA TCG Pocket vs Jogos Principais:
- No TCG Pocket, cada Pokémon tem UMA weakness e NENHUMA ou UMA resistance
- Weakness no TCG Pocket = +20 de dano (NÃO multiplica por 2, é flat +20)
- Resistance no TCG Pocket = -20 de dano
- É mais simples que o jogo principal

IMPLEMENTAÇÃO:
1. Em src/app/battle/ai/types.ts, adicionar ao BattlePokemon:
   weakness?: PokemonType;  // Tipo ao qual é fraco (+20 dano)
   resistance?: PokemonType; // Tipo ao qual resiste (-20 dano)

2. Em src/app/battle/ai/data.ts, criar TCG_POCKET_WEAKNESS_TABLE:
   Cada tipo Pokémon tem uma weakness específica:
   - Fire → Water weakness
   - Water → Lightning weakness
   - Grass → Fire weakness
   - Lightning → Fighting weakness
   - Psychic → Darkness weakness
   - Fighting → Psychic weakness
   - Darkness → Fighting weakness (ou Grass, seguindo TCG Pocket)
   - Metal → Fire weakness
   - Dragon → Dragon weakness (ou Ice/Fairy)
   - Normal → Fighting weakness
   - Etc.

3. No cálculo de dano (executeAction ou nova calculateBattleDamage):
   - Se moveType === defender.weakness: dano final += 20
   - Se moveType === defender.resistance: dano final -= 20 (mínimo 0)
   - Isso é ADICIONAL ao cálculo de type effectiveness (pode coexistir ou substituir)

4. No UI, mostrar ícone de weakness/resistance no card do Pokémon
5. No battle log, indicar "It's super effective! (+20)" ou "It's not very effective... (-20)"

O JOGADOR precisa escolher se quer usar o sistema de tipo CLÁSSICO (multiplier 2x/0.5x) ou o sistema TCG POCKET (+20/-20). Adicione uma opção na tela de seleção de energia ou treinador.

OU, se preferir simplificar, use o sistema TCG Pocket como PADRÃO e remova os multipliers do sistema clássico.
```

---

## ⚡ PROMPT 6 — Todos os Efeitos de Status (Naruto Arena + Pokémon)

```
CONTEXTO:
Preciso ter TODOS os efeitos do Naruto Arena + efeitos clássicos de Pokémon implementados e funcionando corretamente.

ARQUIVOS:
- src/app/battle/ai/types.ts — StatusType (já tem bastante, mas verificar)
- src/app/battle/ai/engine.ts — processStatusEffects(), canAct()
- src/app/battle/ai/page.tsx — executeAction()

LISTA COMPLETA DE EFEITOS:

=== EFEITOS DE DANO ===
1. burn: -6% maxHp por turno, NÃO stacka
2. poison: -8% maxHp por turno, NÃO stacka
3. drain-hp: -value HP por turno (stacka)

=== EFEITOS DE CONTROLE ===
4. stun: Não pode agir por N turnos (o efeito mais forte do Naruto Arena)
5. sleep: Não pode agir, 20% de chance de acordar por turno
6. freeze: Não pode agir, 20% de chance de descongelar. Moves fire descongelam.
7. paralyze: 25% de chance de não agir, reduz speed em 50%
8. confuse: 33% de chance de se bater, causando 5% maxHp

=== EFEITOS DEFENSIVOS ===
9. invulnerable: Bloqueia TODO dano e efeitos por N turnos
10. reduce-damage: Reduz dano recebido em value (flat)
11. reflect: Reflete value% do dano de volta ao atacante
12. counter: Ao ser atacado, causa value% do dano de volta
13. endure: Não pode morrer (fica com 1 HP mínimo)

=== EFEITOS OFENSIVOS ===
14. strengthen: Aumenta dano causado em value%
15. weaken: Reduz dano causado em value%
16. increase-damage: Alvo recebe +value dano flat em todos ataques
17. bleed: Aumenta dano recebido em value (similar a increase-damage)

=== EFEITOS DE ENERGY/RECURSO ===
18. remove-energy: Remove value energias aleatórias do oponente
19. steal-energy: Rouba value energias aleatórias (remove do oponente, adiciona ao seu)
20. cooldown-increase: Aumenta cooldowns das habilidades do alvo em value
21. cooldown-reduce: Reduz cooldowns próprios em value

=== EFEITOS ESPECIAIS ===
22. silence: Não pode usar habilidades com power 0 (só suporte)
23. taunt: Forçado a usar apenas habilidades com power > 0 (só ataque)
24. cannot-be-healed: Bloqueia toda cura
25. heal-over-time: Cura value HP por turno
26. expose: Remove todas as defesas e impede de ganhar novas

PARA CADA EFEITO:
- Garantir que processStatusEffects() no engine.ts processa corretamente
- Garantir que canAct() verifica stun/sleep/freeze/paralyze
- Garantir que executeAction() no page.tsx aplica os modificadores de dano
- Garantir que os efeitos duram o número correto de turnos (decrementam no início de cada turno)
- Garantir que efeitos são removidos quando duração chega a 0
- Garantir que o battle log mostra mensagens claras para cada efeito
- Garantir que STATUS_ICONS tem ícone para cada efeito

Implemente TODOS esses efeitos de forma que funcionem perfeitamente.
```

---

## ⚡ PROMPT 7 — Sistema de Evolução Completo

```
CONTEXTO:
O jogo já tem evolução básica, mas preciso de um sistema completo de evolução estilo Pokémon TCG.

ARQUIVOS:
- src/app/battle/ai/types.ts — BattlePokemon tem canEvolve, evolvesTo, evolutionEnergyCost
- src/app/battle/ai/data.ts — EVOLUTION_DATA, KANTO_POKEMON
- src/app/battle/ai/page.tsx — evolvePokemon(), canEvolvePokemon()

MELHORIAS:
1. O botão de evolução no BattleBottomBar é genérico — deve mostrar QUAL Pokémon pode evoluir
2. Múltiplos Pokémon podem poder evoluir ao mesmo tempo — dar opção de escolher
3. Cadeia de evolução: Bulbasaur → Ivysaur → Venusaur (3 estágios)
   - Já está no EVOLUTION_DATA, mas verificar se funciona após a primeira evolução
   - Após Bulbasaur virar Ivysaur, o Ivysaur deve poder evoluir para Venusaur

4. Quando um Pokémon evolui:
   - HP aumenta (hpBonus)
   - Stats aumentam (statBonus)
   - Moves são atualizados para os moves do tipo evoluído
   - Sprite muda para o novo Pokémon
   - Animação de evolução (já existe)
   - Efeitos de status são mantidos
   - Cooldowns são resetados

5. Adicionar MAIS Pokémon que podem evoluir no KANTO_POKEMON:
   - Pikachu → Raichu (✅ já existe)
   - Bulbasaur → Ivysaur → Venusaur (✅ já existe)
   - Charmander → Charmeleon → Charizard (✅ já existe)
   - Squirtle → Wartortle → Blastoise (✅ já existe)
   - Eevee → Vaporeon/Jolteon/Flareon (NÃO existe — adicionar escolha de evolução)
   - Meowth → Persian
   - Gastly → Haunter → Gengar
   - Abra → Kadabra → Alakazam
   - Machop → Machoke → Machamp
   - Geodude → Graveler → Golem

6. Para Eevee, ao clicar em evoluir, mostrar opção de qual evolução (baseado na energia disponível):
   - Vaporeon: 2 Water energy
   - Jolteon: 2 Lightning energy
   - Flareon: 2 Fire energy

7. A IA NÃO evolui seus Pokémon (eles já são estágio final no AI_POKEMON_POOL).

Implemente todas essas melhorias no sistema de evolução.
```

---

## ⚡ PROMPT 8 — Sistema de Treinadores com Passivas

```
CONTEXTO:
O jogo já tem treinadores com passivas básicas. Preciso expandir e garantir que TODAS as passivas funcionam.

ARQUIVO:
- src/app/battle/ai/data.ts — TRAINERS array
- src/app/battle/ai/page.tsx — applyPassive é chamado em startNewTurn()

TREINADORES ATUAIS E NOVOS:
Atualizar/adicionar os seguintes treinadores com passivas REAIS que afetam a batalha:

1. **Brock** — "Sturdy Defense"
   - Se Onix, Golem, Geodude, Rhydon ou qualquer Rock/Ground estiver no time, eles recebem -15 de dano em TODOS os ataques
   - Implementação: Na executeAction, ao calcular dano nos Pokémon do player, verificar se o treinador é Brock e se o defensor é Rock/Ground

2. **Misty** — "Tidal Surge"  
   - Recebe +1 Water energy a cada 2 turnos (✅ já funciona)
   - ADICIONAR: Pokémon Water no time ganham +10% de dano em ataques Water

3. **Lt. Surge** — "Lightning Rod"
   - Recebe +1 Lightning energy a cada 2 turnos (✅ já funciona)
   - ADICIONAR: Pokémon Electric são imunes a paralyze

4. **Erika** — "Natural Cure"
   - Pokémon Grass curam 10 HP por turno (✅ já funciona)
   - ADICIONAR: Pokémon Grass são imunes a poison

5. **Sabrina** — "Mind Reader"
   - Moves Psychic ganham +10% accuracy (✅ já funciona)  
   - ADICIONAR: Pokémon Psychic ganham +5 de dano em moves Psychic

6. **Koga** — "Toxic Master"
   - Poison dura 1 turno extra (✅ já funciona)
   - ADICIONAR: Moves poison do player têm +20% chance de envenenar

7. **Blaine** — "Flame Body"
   - Moves fire têm +20% burn chance (✅ já funciona)
   - ADICIONAR: Pokémon Fire recebem -25% dano de moves Fire (resistência extra)

8. **Giovanni** — "Intimidate"
   - Inimigos causam 10% menos dano (✅ já funciona)
   - ADICIONAR: No primeiro turno, reduz 1 energia aleatória do oponente

9. **Professor Oak** (NOVO) — "Pokemon Research"
   - +1 energia colorless no início de cada turno
   - Pokémon no time ganham +5 maxHp

10. **Nurse Joy** (NOVO) — "Healing Touch"
    - A cada 3 turnos, cura 20 HP ao Pokémon aliado com menos HP
    - Items de cura (potions) curam 50% a mais

11. **Lance** (NOVO) — "Dragon Master"
    - Pokémon Dragon ganham +20% de dano
    - Se Dragonite estiver no time, ele ganha +1 em todas as moves

12. **Red** (NOVO) — "Champion's Spirit"
    - Quando um Pokémon aliado fainta, os outros ganham +10% de dano permanente
    - Começa com +1 energia de cada tipo selecionado

IMPLEMENTAÇÃO:
- Cada passiva deve ter DOIS efeitos: um passivo (verificado a cada turno) e um condicional (verificado durante execução de ação)
- applyPassive() é chamado no início de cada turno para efeitos de turno
- Na executeAction(), verificar passivas condicionais do treinador
- No TrainerSelectScreen, mostrar os dois efeitos de cada treinador claramente
```

---

## ⚡ PROMPT 9 — Sistema de Itens Completo

```
CONTEXTO:
O jogo tem itens básicos (potions, revive, etc). Preciso expandir com todos os itens da franquia Pokémon relevantes.

ARQUIVOS:
- src/app/battle/ai/data.ts — DEFAULT_ITEMS
- src/app/battle/ai/page.tsx — useItem(), applyItemToTarget()

ITENS ATUAIS E NOVOS:

=== CURA ===
1. Potion — Cura 30 HP (2 usos) ✅
2. Super Potion — Cura 60 HP (1 uso) ✅
3. Hyper Potion — Cura 120 HP (1 uso) ✅
4. Max Potion (NOVO) — Cura TODO o HP (1 uso)
5. Full Restore (NOVO) — Cura TODO o HP + remove status (1 uso)

=== STATUS ===
6. Full Heal — Remove todos os status (2 usos) ✅
7. Antidote (NOVO) — Remove poison (3 usos)  
8. Burn Heal (NOVO) — Remove burn (3 usos)
9. Paralyze Heal (NOVO) — Remove paralyze (3 usos)
10. Awakening (NOVO) — Remove sleep (3 usos)
11. Ice Heal (NOVO) — Remove freeze (3 usos)

=== REVIVE ===
12. Revive — Revive com 50% HP (1 uso) ✅
13. Max Revive (NOVO) — Revive com 100% HP (1 uso)

=== BOOST ===
14. X Attack — +30% dano por 3 turnos (1 uso) ✅
15. X Defense — -20 dano recebido por 3 turnos (1 uso) ✅
16. X Speed (NOVO) — +1 prioridade nas ações por 3 turnos (1 uso)
17. X Special (NOVO) — +30% dano special por 3 turnos (1 uso)

=== ENERGIA ===
18. Energy Boost — +1 colorless energy (1 uso) ✅
19. Rare Candy (NOVO) — Permite evolução instantânea sem custo de energia (1 uso)

=== ESPECIAIS ===
20. Poké Doll (NOVO) — Um Pokémon fica invulnerable por 1 turno (1 uso)
21. Switch (NOVO) — Remove todos os status negativos de um Pokémon (1 uso, diferente do Full Heal por ser instantâneo sem gastar turno)

REGRAS DE ITENS:
- Itens são pré-definidos — o jogador começa com o set completo de itens
- Usar um item NÃO gasta o turno nem a ação do Pokémon (pode usar item + ações)
- Limite: 1 item por turno
- Items são usados ANTES de selecionar ações
- Após usar item, ainda pode selecionar ações normalmente

Implemente todos os itens e ajuste o BattleOverlays/BattleBottomBar para mostrar os itens organizados por categoria.
```

---

## ⚡ PROMPT 10 — Remover Borda Vermelha + Background de Batalha com Imagens do Anime

```
CONTEXTO:
Na batalha, preciso remover a borda vermelha dos cards e usar fundos de batalha com imagens do anime Pokémon.

ARQUIVOS:
- src/app/battle/ai/battle.css — estilos de batalha
- src/app/battle/ai/data.ts — BATTLE_BACKGROUNDS
- src/app/battle/ai/page.tsx — battleBackground state

ALTERAÇÕES CSS:

1. REMOVER toda borda vermelha:
   - Procurar qualquer "border: *red*" ou "border-color: red" ou "border: *#ff*" nos character-cards
   - Substituir por borda transparente ou borda sutil (1px solid rgba(255,255,255,0.1))
   - O card do enemy NÃO deve ter borda vermelha — deve ter borda sutil azul ou nenhuma
   - O card do player pode ter borda dourada ou verde sutil

2. BACKGROUND de batalha:
   - Usar imagens de anime Pokémon como background
   - As imagens devem cobrir toda a tela (background-size: cover)
   - Adicionar overlay escuro semi-transparente para legibilidade (rgba(0,0,0,0.4))
   - Randomizar background a cada partida (já está implementado)

3. ADICIONAR novos backgrounds ao BATTLE_BACKGROUNDS:
   - Manter os backgrounds de cenários existentes
   - Adicionar URLs de imagens de batalhas do anime (exemplo dado pelo cliente):
     'https://www.pokemon.com/static-assets/content-assets/cms2/img/watch-pokemon-tv/seasons/season15/season15_ep42_ss01.jpg'
   - Adicionar pelo menos 5 novos backgrounds de cenas de batalha Pokemon
   - Usar imagens publicamente disponíveis do site oficial Pokemon

4. MELHORIAS VISUAIS GERAIS:
   - Cards dos Pokémon com fundo semi-transparente (backdrop-filter: blur)
   - HP bar mais suave e com gradientes
   - Skill buttons com hover effect mais bonito
   - Animação suave quando HP muda
   - Status badges com glow effect
   - Centralizar melhor o layout de batalha
   - Garantir que em mobile os cards ficam legíveis

Não mude a estrutura HTML/componentes, apenas CSS e data.
```

---

## ⚡ PROMPT 11 — Expandir Pokédex e Adicionar Mais Pokémon

```
CONTEXTO:
O jogo tem poucos Pokémon disponíveis. Preciso expandir significativamente.

ARQUIVOS:
- src/app/battle/ai/data.ts — KANTO_POKEMON (player pool), AI_POKEMON_POOL
- src/app/battle/ai/ai.ts — createOpponentTeam()

EXPANDIR KANTO_POKEMON (pool do jogador) com TODOS os starters e populares:
Adicionar pelo menos 30 Pokémon no pool do player, incluindo:
- Todos os starters Gen 1: Bulbasaur, Charmander, Squirtle ✅
- Pikachu ✅, Eevee ✅, Meowth ✅
- Geodude, Machop, Abra, Gastly (com cadeias de evolução)
- Vulpix, Growlithe, Poliwag, Oddish
- Magikarp (com evolução para Gyarados!)
- Dratini (com evolução para Dragonair → Dragonite)
- Clefairy, Jigglypuff
- Caterpie, Weedle (com evolução)
- Pidgey (com evolução)
- Nidoran M/F (com evolução)
- Ponyta, Magnemite, Voltorb, Cubone

Para CADA Pokémon adicionar:
- id, name, types, hp corretos
- canEvolve + evolvesTo + evolutionEnergyCost (quando aplicável)
- Adicionar dados de evolução no EVOLUTION_DATA

EXPANDIR AI_POKEMON_POOL:
- Adicionar pelo menos 10 mais Pokémon ao pool da IA
- Incluir: Arcanine ✅, Gyarados ✅, Alakazam ✅, Machamp ✅, Gengar ✅
- Adicionar: Aerodactyl, Articuno, Zapdos, Moltres, Mew
- Adicionar: Tauros, Kangaskhan, Pinsir, Electabuzz, Magmar

Para os MOVES:
- getDefaultMoves() já tem moves por tipo
- Adicionar movesets especiais para Pokémon lendários (poder mais alto, custos maiores)
- Magikarp deve ter apenas "Splash" (0 damage, sem efeito) até evoluir

Cada Pokémon deve ter moves tematicamente corretos para aquele Pokémon.
```

---

## ⚡ PROMPT 12 — Polish Final: UX, Animações e Vício

```
CONTEXTO:
Com todos os sistemas implementados, preciso de polish final para tornar o jogo VICIANTE.

ARQUIVOS:
- src/app/battle/ai/battle.css
- src/app/battle/ai/mobile.css
- src/app/battle/ai/page.tsx + componentes

FEATURES DE VÍCIO:

1. **Win Streak System**:
   - Contador de vitórias seguidas
   - A cada 3 vitórias, ganhar um bonus de XP
   - A cada 5 vitórias, IA fica mais difícil (mais HP, moves melhores)
   - Mostrar "🔥 Win Streak: X" no top bar

2. **Daily Challenge**:
   - 1 batalha especial por dia contra um time pré-definido difícil
   - Recompensa dobrada de XP
   - Indicador "Daily Challenge Available!" na tela

3. **Sound Effects** (opcional, comentado):
   - Preparar a estrutura para sons de ataque, cura, faint, vitória
   - Adicionar comentários indicando onde colocar os sons

4. **Animações Melhoradas**:
   - Shake nos cards quando um Pokémon leva dano
   - Flash de cor quando aplica status (vermelho para burn, roxo para poison, etc)
   - Pulse no HP bar quando HP está baixo (<25%)
   - Animação de fade in/out quando Pokémon fainta
   - Particle effects simples (CSS only) para moves super effective
   - Transição suave entre turnos

5. **Battle Stats Screen**:
   - Após a batalha, mostrar estatísticas detalhadas:
     - Dano total causado/recebido
     - Pokémon MVP (mais dano)
     - Moves mais usados
     - Status effects aplicados
     - Turnos totais

6. **Quick Rematch**:
   - Botão "Rematch" que mantém o mesmo time e enfrenta um novo oponente
   - Botão "Change Team" que volta para a seleção

7. **Mobile Responsivo**:
   - Garantir que todos os cards cabem na tela em mobile
   - Skills empilhados verticalmente em telas pequenas
   - Bottom bar colapsável
   - Touch-friendly (botões maiores)

Implemente todas essas features para tornar o jogo viciante e polido.
```

---

## ⚡ PROMPT 13 — Sistema PvP Completo (Player vs Player em Tempo Real)

```
CONTEXTO:
O jogo JÁ TEM infraestrutura de PvP com WebSocket, mas preciso garantir que tudo funciona perfeitamente e melhorar a experiência.

ARQUIVOS EXISTENTES:
- src/server/game-server.ts — Servidor WebSocket completo com matchmaking MMR, JWT auth, reconnect, private rooms
- src/app/multiplayer/page.tsx — UI de batalha PvP (connecting, queue, battle, result)
- src/app/multiplayer/components/ — 13 componentes (ConnectingScreen, QueueScreen, TeamSelectScreen, BattleTopBar, PlayerPanel, OpponentPanel, BattleLog, BattleChat, BattleResultModal, etc.)
- src/app/multiplayer/multiplayer.css — Estilos (1124 linhas)
- src/app/multiplayer/data.ts — Types, sprites, roster fetch
- src/hooks/useMultiplayer.ts — Hook React com state management completo
- src/lib/game-socket.ts — Socket.io client singleton
- src/app/play/page.tsx — Play page com botões BATTLE, QUICK, LADDER
- src/hooks/useGameSocket.ts — Hook alternativo (legado)

O SERVIDOR (game-server.ts) JÁ TEM:
- JWT authentication via src/server/auth.ts
- MMR matchmaking (MMR_RANGE_START=100, cresce +50 a cada 5s)
- Private rooms com código de 8 chars
- Resolução de turnos usando src/engine (resolveTurn)
- Persistência de resultado no banco (saveBattleResult)
- Missões (updateMissionProgress)
- Chat in-battle
- Reconnection com grace period de 30s
- Timer de turno de 90s

MELHORIAS NECESSÁRIAS:

1. **Sincronizar Visual AI ↔ PvP**:
   - A batalha PvP deve usar o MESMO visual da batalha contra IA (backgrounds anime, cards sem borda vermelha, HP bars bonitas, etc)
   - Copiar os estilos de src/app/battle/ai/battle.css para multiplayer.css ou usar CSS compartilhado
   - Mesma animação de dano, status, faint entre AI e PvP

2. **Matchmaking Melhorado**:
   - Mostrar tempo estimado na fila com animação de loading
   - Se não encontrar oponente em 30s, expandir range de MMR mais rápido
   - Mostrar "X jogadores online" na tela de fila
   - Ao encontrar oponente, mostrar tela de "VS" animada com os times de ambos antes de iniciar

3. **Private Rooms Melhorados**:
   - Botão de copiar código da sala para clipboard
   - Botão de "Share Link" que gera um link direto: /multiplayer?room=ABCD1234
   - Ao acessar o link, auto-preenche o código da sala
   - Chat na sala de espera antes do jogo começar

4. **Battle UI PvP**:
   - No PvP, ambos jogam SIMULTÂNEO (diferente da IA que é turn-based)
   - Indicador de "Opponent is choosing..." quando o oponente não confirmou
   - Indicador de "Ready ✓" quando o oponente confirmou
   - Timer visual (barra que diminui) do turno
   - Emotes rápidos: "GG", "Nice!", "Wow!", "Sorry" (4 botões)
   - Overlay de "VICTORY!" / "DEFEAT!" animado no final

5. **Resultado da Batalha PvP**:
   - Tela de resultado mostrando:
     - XP ganho
     - LP (Ladder Points) ganhos ou perdidos  
     - Novo ranking
     - Win streak
     - Botões: "Rematch" (convida o mesmo oponente), "New Match" (volta pra fila), "Exit"
   - Se levelou up, animação especial de level up

6. **Spectator Mode** (bonus, pode ser futuro):
   - Estrutura básica no servidor para permitir spectators
   - socket.on('spectate', battleId) → envia state dos dois lados
   - Link compartilhável: /multiplayer/watch?id=BATTLE_ID

REGRAS PvP vs AI:
- PvP: Ambos jogadores escolhem ações SIMULTANEAMENTE, depois executam juntas (como Naruto Arena original)
- AI Battle: Turnos ALTERNADOS (prompt 1)
- PvP: Timer de 90s por turno, se não escolher, pula
- PvP: Surrender dá derrota + LP loss
- PvP: Disconnect com 30s grace period, se não voltar = derrota

IMPLEMENTAÇÃO:
- Garantir que o game-server.ts use o MESMO engine/cálculo de dano corrigido (do Prompt 3)
- Ajustar pokemonToFighter() no game-server.ts para mapear corretamente os skills com o novo sistema de dano
- buildSkillEffects() deve usar o mesmo cálculo simplificado
- O sistema de energia no PvP deve funcionar igual ao da IA (acúmulo, custo de moves, etc)
```

---

## ⚡ PROMPT 14 — Ranked Ladder, Leaderboard e Temporadas

```
CONTEXTO:
Preciso de um sistema de ranking competitivo que motive os jogadores a continuarem jogando.

ARQUIVOS:
- prisma/schema.prisma — Schema do banco de dados (Trainer model já tem ladderPoints, wins, losses, winStreak)
- src/server/game-server.ts — Já calcula LP gain/loss
- src/server/battle-result.ts — Persistência de resultado
- src/app/multiplayer/components/BattleResultModal.tsx — Tela de resultado

IMPLEMENTAR:

1. **Sistema de Ranks** (como League of Legends):
   Tiers baseados em Ladder Points (LP):
   - 🔰 Pokéball (0-299 LP) — Iniciante
   - ⭐ Great Ball (300-599 LP) — Intermediário
   - 💎 Ultra Ball (600-999 LP) — Avançado
   - 🏆 Master Ball (1000-1499 LP) — Expert
   - 👑 Champion (1500+ LP) — Elite
   
   Cada tier tem 3 divisões: I, II, III (ex: Ultra Ball III → Ultra Ball II → Ultra Ball I → Master Ball III)
   
   Criar em src/lib/ranking.ts:
   - getRank(lp: number) → { tier, division, name, icon, color, nextThreshold }
   - getLPForNextDivision(currentLP: number) → number
   - formatRank(lp: number) → string (ex: "Ultra Ball II")

2. **LP Gain/Loss Calculation** (ELO-style):
   - Vitória contra rank maior: +30-40 LP
   - Vitória contra rank similar: +20-25 LP
   - Vitória contra rank menor: +10-15 LP
   - Derrota: inverso (perde menos contra rank maior)
   - Win streak bonus: +5 LP por vitória consecutiva (cap em +25 extra)
   - Não pode cair abaixo de 0 LP
   - Atualizar src/server/battle-result.ts com este cálculo

3. **Leaderboard Page** (/leaderboard):
   Criar src/app/leaderboard/page.tsx:
   - Top 100 jogadores globais
   - Mostrar: posição, avatar, username, rank icon, LP, W/L ratio, win streak
   - Destaque em dourado para top 3
   - Filtros: "Global", "Friends", "Clan"
   - Busca por username
   - Sua posição aparece fixada no bottom se não estiver no top 100
   
   API Route: src/app/api/leaderboard/route.ts
   - GET /api/leaderboard?page=1&limit=100&type=global
   - Retorna trainers ordenados por ladderPoints DESC

4. **Profile Card com Rank**:
   Em toda a UI onde aparece o jogador, mostrar:
   - Ícone do tier atual
   - Barra de progresso para próxima divisão
   - LP atual
   - Win rate %
   - Win streak current

5. **Temporadas (Seasons)**:
   - Cada temporada dura 30 dias
   - No final, top 10 ganham badge especial no perfil
   - LP reseta para base do tier anterior (ex: Master Ball → Ultra Ball com LP base)
   - Histórico de temporadas passadas no perfil
   
   Schema Prisma:
   - Model Season { id, name, startDate, endDate, isActive }
   - Model SeasonResult { trainerId, seasonId, finalLP, finalRank, reward }

6. **Rank-up/Rank-down Animation**:
   - Quando o jogador sobe de divisão/tier, animação especial
   - Mostrar o novo rank com efeito de glow
   - Quando desce, animação mais sutil

Isso cria o LOOP COMPETITIVO que mantém jogadores voltando.
```

---

## ⚡ PROMPT 15 — Features Virais e Sociais (Para Explodir de Acessos)

```
CONTEXTO:
Preciso que o jogo tenha features que façam os jogadores COMPARTILHAREM e CONVIDAREM amigos.
O objetivo é crescimento viral — cada jogador deve trazer pelo menos 1 amigo.

ARQUIVOS a criar/modificar:
- src/app/api/social/* (novas API routes)
- src/app/profile/page.tsx (perfil público)
- src/lib/social.ts (helpers sociais)
- Componentes de compartilhamento

FEATURES VIRAIS:

1. **Share Battle Result** (CRÍTICO para viralização):
   Após cada vitória, botão "Share Victory":
   - Gera uma imagem/card para compartilhar (canvas ou HTML-to-image):
     - Background estilizado do jogo
     - "🏆 [USERNAME] VENCEU!" em destaque
     - Os 3 Pokémon do time vencedor com sprites
     - Estatísticas da batalha (turnos, dano total, MVP)
     - Rank atual do jogador
     - QR code ou link curto para o jogo
   - Botões de share:
     - 📋 "Copy Image" → copia para clipboard
     - 📱 "Share" → usa Web Share API (mobile nativo)
     - 🔗 "Copy Link" → copia link do perfil
   - Texto pré-formatado para WhatsApp/Discord:
     "🏆 Acabei de vencer no Pokémon Arena! Meu time: [Pokemon1], [Pokemon2], [Pokemon3]. Rank: [Rank]. Vem me desafiar! [LINK]"

2. **Referral System** (sistema de convite):
   Cada jogador tem um código de convite único (6 chars)
   - /join/[CODE] → Registra e credita o convite
   - Quem convida ganha: +50 bonus XP + badge "Recruiter"
   - A cada 5 convites: desbloqueia Pokémon exclusivo (ex: Mew como skin)
   - A cada 10 convites: badge dourada "Pokemon Master Recruiter"
   - Convidado ganha: +20 XP de boas-vindas + 1 item raro grátis
   
   Schema Prisma:
   - Trainer.referralCode String @unique
   - Trainer.referredBy String? (quem convidou)
   - Model Referral { referrerId, referredId, createdAt, bonusClaimed }

3. **Public Profile** (/profile/[username]):
   Página pública acessível por qualquer pessoa (mesmo sem login):
   - Avatar + Username + Rank com badge
   - Estatísticas: W/L, Win Rate, Melhor Win Streak, Total de batalhas
   - Time favorito (os 3 Pokémon mais usados)
   - Últimas 10 batalhas (resultado + oponente)
   - Badges/Achievements conquistados
   - Botão "Challenge!" → redireciona para o jogo
   - Meta tags OG para preview bonito quando compartilhar o link

4. **Challenge Link** (Desafiar amigo direto):
   - Botão "Challenge a Friend" na home
   - Gera link: /battle/challenge/[CODE]
   - Quem acessar o link é redirecionado para criar conta (se não tiver) e entrar direto na sala privada
   - Notificação push (se implementar depois) ou por link mesmo

5. **Achievement/Badge System**:
   Badges que aparecem no perfil e motivam a jogar:
   - 🔥 "First Victory" — Ganhe sua primeira batalha
   - ⚡ "Lightning Fast" — Ganhe em 5 turnos ou menos
   - 🛡️ "Untouchable" — Ganhe sem perder nenhum Pokémon
   - 🎯 "Sharpshooter" — Ganhe com super effective no último golpe
   - 🏆 "Champion" — Chegue ao rank Champion
   - 🔥 "On Fire" — 10 vitórias seguidas
   - 💀 "Comeback King" — Ganhe com apenas 1 Pokémon restante
   - 🧠 "Strategist" — Use 3 itens diferentes em uma batalha
   - 👥 "Social Butterfly" — Convide 5 amigos
   - 📅 "Dedicated" — Jogue 7 dias seguidos
   - ⭐ "Collector" — Use 20 Pokémon diferentes
   - 🎖️ "Veteran" — 100 batalhas totais
   
   Implementar em:
   - src/lib/achievements.ts — checkAchievements(trainerId, battleData)
   - Chamar após cada batalha
   - Schema: Model Achievement { trainerId, code, unlockedAt }

6. **Daily Login Bonus**:
   - Dia 1: 10 XP
   - Dia 2: 20 XP
   - Dia 3: 30 XP + 1 item
   - Dia 4: 40 XP
   - Dia 5: 50 XP + item raro
   - Dia 6: 60 XP
   - Dia 7: 100 XP + badge "Dedicated Week" + Pokémon exclusivo temporário
   - Reseta se perder um dia
   - Mostrar popup de login bonus ao entrar no jogo
   
7. **Social Proof na Landing Page**:
   Na landing page (/), mostrar:
   - "🔥 X jogadores online agora"
   - "⚔️ Y batalhas acontecendo"
   - "🏆 Último vencedor: [USERNAME] com [POKEMON]"
   - Ticker rolante com batalhas recentes
   - Contador total de batalhas (ex: "10,432 batalhas já aconteceram!")

8. **Discord Integration** (opcional mas poderoso):
   - Webhook para canal Discord: "🏆 [User] acabou de ganhar uma batalha épica!"
   - Link do Discord na sidebar
   - Rich Presence data para Discord (se vir a fazer app desktop)

Estas features transformam cada jogador em um VETOR DE CRESCIMENTO.
O jogo cresce organicamente quando vitórias são compartilháveis e convidar amigos dá recompensas.
```

---

## ⚡ PROMPT 16 — Sistema de Progressão e Desbloqueio (Gacha/Unlock)

```
CONTEXTO:
Para reter jogadores a longo prazo, preciso de um sistema de progressão onde jogar desbloqueia conteúdo novo.

ARQUIVOS:
- prisma/schema.prisma — Adicionar models de progressão
- src/lib/progression.ts (novo)
- src/app/api/progression/* (novas routes)

IMPLEMENTAR:

1. **XP e Level System**:
   - Vitória PvP: 50 XP base + LP bonus
   - Vitória AI: 25 XP base
   - Derrota: 10 XP (nunca zero — sempre recompensar)
   - Daily Challenge: 100 XP
   - Primeiro jogo do dia: +50% XP bonus
   
   Level thresholds:
   - Level 1: 0 XP
   - Level 2: 100 XP
   - Level 3: 250 XP
   - Level 5: 600 XP
   - Level 10: 2000 XP
   - Level 20: 8000 XP
   - Level 50: 50000 XP
   - Formula: XP = floor(level^2 * 20)
   
   A cada level up, desbloqueia algo (Pokémon, item, trainer, badge)

2. **Pokemon Unlock System**:
   Nem todos os Pokémon ficam disponíveis de cara.
   - Starter Pool (grátis): Bulbasaur, Charmander, Squirtle, Pikachu, Caterpie, Rattata, Pidgey, Weedle (8 básicos)
   - Level Unlocks:
     - Level 3: Eevee, Meowth
     - Level 5: Geodude, Machop, Abra, Gastly
     - Level 8: Vulpix, Growlithe, Poliwag, Oddish
     - Level 10: Sandshrew, Ekans, Magikarp
     - Level 15: Dratini, Clefairy, Jigglypuff
     - Level 20: Ponyta, Magnemite, Cubone
   - Win Streak Unlocks:
     - 5 wins: Scyther
     - 10 wins: Lapras
     - 20 wins: Snorlax
   - Achievement Unlocks:
     - "Champion" badge: Mewtwo (LENDÁRIO!)
     - "On Fire" badge: Moltres
     - "Lightning Fast": Zapdos
     - "Untouchable": Articuno
   
   Na tela de seleção de time, Pokémon trancados mostram com cadeado + condição de unlock
   
3. **Trainer Unlock System**:
   Mesma ideia para treinadores:
   - Grátis: Brock, Misty
   - Level 5: Lt. Surge, Erika
   - Level 10: Sabrina, Koga
   - Level 15: Blaine, Giovanni
   - Level 20: Professor Oak, Nurse Joy
   - Level 30: Lance
   - Level 50 ou Rank Champion: Red

4. **Pokémon Card Packs** (Gacha-lite — SEM dinheiro real):
   A cada 3 vitórias, ganha um "Card Pack" que pode conter:
   - Common (60%): Um Pokémon do pool básico que já tem (duplicata = +5 XP)
   - Uncommon (25%): Um Pokémon do próximo tier (desbloqueia antes do level!)
   - Rare (12%): Um item exclusivo ou Pokémon raro
   - Ultra Rare (3%): Skin especial para um Pokémon (ex: Pikachu com boné do Ash)
   
   Animação de abrir pack:
   - 3 cards virados pra baixo
   - Flip animation um a um
   - Brilho especial para rare/ultra rare
   - "NEW!" tag para primeiro desbloqueio
   
   Limite: 1 pack grátis a cada 3 vitórias. Máximo 3 packs acumulados.

5. **Mission/Quest System** (diário e semanal):
   Diárias (resetam todo dia):
   - "Win 1 battle" → 20 XP
   - "Use a Fire-type Pokémon" → 15 XP
   - "Win with full team alive" → 30 XP
   - "Play 3 battles" → 25 XP
   
   Semanais (resetam toda semana):
   - "Win 10 battles" → 100 XP + Card Pack
   - "Reach a new rank" → 150 XP
   - "Evolve 3 Pokémon in battles" → 80 XP
   - "Use 5 different Pokémon" → 60 XP
   
   UI: Barra lateral ou modal com lista de missões + progresso
   Schema: Model Mission { id, trainerId, code, progress, target, completed, expiresAt }

6. **Collection Page** (/collection):
   - Grid de TODOS os Pokémon do jogo
   - Os que você tem: coloridos e clicáveis
   - Os que você NÃO tem: silhueta com condição de unlock
   - % de coleção completada
   - "Pokémon #??? — Reach Level 15 to unlock"
   - Filtro por tipo, por status (obtido/não obtido)

DADOS NO BANCO:
- Model TrainerPokemon { trainerId, pokemonId, obtainedAt, obtainedMethod, isNew }
  - obtainedMethod: 'starter' | 'level-up' | 'achievement' | 'card-pack' | 'win-streak' | 'referral'
- Model CardPack { trainerId, openedAt, contents Json }
- Atualizar Model Trainer com: totalXP Int, pendingPacks Int

Este sistema garante que SEMPRE há algo para desbloquear, criando o loop:
Jogar → Ganhar XP → Subir Level → Desbloquear Pokémon → Querer testar → Jogar mais
```

---

## ⚡ PROMPT 17 — Landing Page Épica + SEO + PWA

```
CONTEXTO:
A landing page precisa CONVERTER visitantes em jogadores. Também preciso que o jogo funcione como PWA (instalável no celular).

ARQUIVOS:
- src/app/page.tsx — Landing page atual
- src/app/layout.tsx — Layout root
- public/manifest.json (criar)
- public/sw.js (criar — service worker)

IMPLEMENTAR:

1. **Landing Page Redesign** (src/app/page.tsx):
   Hero section:
   - Background animado com partículas/sprites de Pokémon
   - Título grande: "POKÉMON ARENA" com glow effect
   - Subtítulo: "Battle. Rank. Dominate."
   - Botão CTA gigante: "PLAY NOW — FREE" (pulsando)
   - Abaixo: "🔥 X players online | ⚔️ Y battles today"
   
   Features section:
   - "Real-time PvP Battles" com ícone
   - "150+ Pokémon to collect" com ícone
   - "Ranked competitive ladder" com ícone
   - "Free to play, no pay to win" com ícone
   
   Social proof:
   - Ticker de batalhas recentes
   - Top 5 jogadores do ranking
   - Contador de batalhas totais
   
   CTA final:
   - "Join X trainers already battling"
   - Botão de registro/login
   
   Footer:
   - Links para Discord, GitHub
   - "Made with ❤️ by [creator]"

2. **SEO Otimizado**:
   Em src/app/layout.tsx:
   - Title: "Pokémon Arena — Free Online Pokémon Battle Game"
   - Meta description otimizada
   - Open Graph tags com imagem preview do jogo
   - Twitter Card tags
   - Schema.org VideoGame markup
   - Canonical URL
   
   Criar src/app/sitemap.ts:
   - Gerar sitemap dinâmico com todas as páginas públicas
   
   Criar src/app/robots.ts:
   - Allow all crawlers

3. **PWA (Progressive Web App)**:
   public/manifest.json:
   {
     "name": "Pokémon Arena",
     "short_name": "PokéArena",
     "start_url": "/play",
     "display": "standalone",
     "background_color": "#1a1a2e",
     "theme_color": "#FFD700",
     "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }, ...]
   }
   
   Service worker básico:
   - Cache de assets estáticos (sprites, CSS, JS)
   - Cache de sprite images do PokeAPI para uso offline
   - Offline fallback page
   
   No layout.tsx:
   - <link rel="manifest" href="/manifest.json">
   - Registrar service worker
   
   Resultado: jogadores podem "instalar" o jogo no celular como app nativo!

4. **Install Prompt**:
   - Detectar quando o browser oferece "Add to Home Screen"
   - Mostrar banner customizado: "📱 Instale o Pokémon Arena no seu celular!"
   - Botão "Install" que trigga o prompt nativo
   - Após instalar, nunca mais mostrar o banner

5. **Performance**:
   - Lazy load de sprites (IntersectionObserver)
   - Preconnect ao PokeAPI CDN
   - next/image para otimização de imagens
   - Prefetch da página /play e /battle/ai

Esta landing converte VISITANTES em JOGADORES e o PWA garante RETENÇÃO mobile.
```

---

# 📋 RESUMO DA ORDEM DE EXECUÇÃO

| # | Prompt | Prioridade | Dependências |
|---|--------|-----------|-------------|
| 1 | Turnos Alternados | 🔴 CRÍTICA | Nenhuma |
| 2 | Acúmulo de Energia | 🔴 CRÍTICA | Prompt 1 |
| 3 | Dano Responsivo | 🔴 CRÍTICA | Prompt 1 |
| 4 | Energias TCG Pocket | 🟡 ALTA | Nenhuma |
| 5 | Weakness/Resistance TCG | 🟡 ALTA | Prompt 3, 4 |
| 6 | Todos os Status Effects | 🟡 ALTA | Prompt 3 |
| 7 | Sistema de Evolução | 🟢 MÉDIA | Prompt 2 |
| 8 | Treinadores + Passivas | 🟢 MÉDIA | Prompt 3 |
| 9 | Itens Completos | 🟢 MÉDIA | Nenhuma |
| 10 | Visual/Background | 🟢 MÉDIA | Nenhuma |
| 11 | Mais Pokémon | 🟡 ALTA | Prompts 4, 5, 7 |
| 12 | Polish/Vício | 🟢 MÉDIA | Todos anteriores |
| **13** | **PvP Completo** | **🔴 CRÍTICA** | **Prompts 1, 2, 3** |
| **14** | **Ranked Ladder + Leaderboard** | **🔴 CRÍTICA** | **Prompt 13** |
| **15** | **Features Virais + Social** | **🔴 CRÍTICA** | **Prompt 14** |
| **16** | **Progressão + Desbloqueio** | **🟡 ALTA** | **Prompts 12, 14** |
| **17** | **Landing Page + SEO + PWA** | **🟡 ALTA** | **Prompt 15** |

---

# 🚀 ROADMAP PARA EXPLODIR

### Fase 1 — FUNDAÇÃO (Prompts 1-3)
Corrigir os bugs críticos: turnos, energia, dano. Sem isso nada funciona.

### Fase 2 — GAMEPLAY COMPLETO (Prompts 4-9)
Energias, status, evolução, treinadores, itens. Jogo precisa ser DIVERTIDO primeiro.

### Fase 3 — VISUAL INCRÍVEL (Prompts 10-12)
Backgrounds anime, animações, mobile responsivo, polish. Jogo precisa ser BONITO.

### Fase 4 — PvP + COMPETITIVO (Prompts 13-14)
PvP funcionando com ranked ladder. Jogadores precisam ter RAZÃO para voltar todo dia.

### Fase 5 — VIRALIZAR (Prompts 15-17)
Share de vitórias, convites, achievements, landing page, PWA. Cada jogador TRAZ mais jogadores.

**Meta**: Implementar tudo → Lançar no ProductHunt/Reddit/Discord → Viralizar 🚀

---

**Dica**: Execute os prompts 1, 2 e 3 PRIMEIRO — eles corrigem os bugs mais críticos (turnos, energia e dano). Depois faça o 13 (PvP) para ter o multiplayer funcionando. Então 14-15 para o loop competitivo + viral.
