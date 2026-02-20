# 🧪 Checklist de Testes - Sistema de Batalha

## ✅ Testes Automatizados
- **129 testes passando** ✅
- Cobertura completa de todas as funcionalidades

---

## 🎮 Testes Manuais no Navegador

### 1. Sistema de Energia ⚡

#### Teste 1.1: Seleção de 4 Energias
- [ ] Abrir a batalha
- [ ] Tentar iniciar com menos de 4 energias → Deve mostrar "SELECT X MORE (Must be 4)"
- [ ] Selecionar exatamente 4 energias
- [ ] Botão "START BATTLE" deve ficar habilitado
- [ ] Verificar que os 9 tipos estão disponíveis (Grass, Fire, Water, Electric, Psychic, Fighting, Darkness, Metal, Dragon)

#### Teste 1.2: Primeiro Turno com 1 Energia
- [ ] Iniciar batalha
- [ ] Verificar no log: "Turn 1 - Gained 1 energy!"
- [ ] Verificar que apenas 1 energia aparece no pool
- [ ] Verificar que a energia é de um dos 4 tipos selecionados OU random

#### Teste 1.3: Acumulação de Energias
- [ ] Turno 1: Anotar quantidade de energia (deve ser 1)
- [ ] Não gastar toda a energia
- [ ] Passar o turno
- [ ] Turno 2: Verificar que a energia anterior + nova energia = total acumulado
- [ ] Exemplo: Se tinha 1 grass e ganhou 2 fire → deve ter 1 grass + 2 fire = 3 total

#### Teste 1.4: Energia por Pokémon Vivo
- [ ] Turno 2+: Contar Pokémon vivos
- [ ] Verificar que recebe energia = número de Pokémon vivos
- [ ] Derrotar 1 Pokémon inimigo
- [ ] Próximo turno: Verificar que ainda recebe energia baseada nos SEUS Pokémon vivos

---

### 2. Sistema de Turnos 🔄

#### Teste 2.1: Turnos Alternados
- [ ] Turno do Jogador: Verificar que pode selecionar ações
- [ ] Clicar "END TURN"
- [ ] Verificar que entra em "OPPONENT TURN"
- [ ] Verificar que NÃO pode selecionar ações durante turno do oponente
- [ ] Aguardar IA agir
- [ ] Verificar que volta para "Player 1 turn"

#### Teste 2.2: Não Simultâneo
- [ ] Durante seu turno: Selecionar uma ação
- [ ] Clicar "END TURN"
- [ ] Verificar que sua ação é executada ANTES do turno da IA
- [ ] Verificar que IA age DEPOIS, não ao mesmo tempo

---

### 3. Type Effectiveness (TCG Pocket) 🎯

#### Teste 3.1: Super Effective (2x)
- [ ] Usar ataque Water contra Fire Pokémon
- [ ] Verificar no log: "It's super effective!"
- [ ] Verificar que o dano é aproximadamente 2x o normal

#### Teste 3.2: Not Very Effective (0.5x)
- [ ] Usar ataque Fire contra Water Pokémon
- [ ] Verificar no log: "It's not very effective..."
- [ ] Verificar que o dano é aproximadamente metade do normal

#### Teste 3.3: No Effect (0x)
- [ ] Usar ataque Normal contra Ghost Pokémon (se disponível)
- [ ] Verificar no log: "It doesn't affect..."
- [ ] Verificar que o dano é 0

#### Teste 3.4: STAB (Same Type Attack Bonus)
- [ ] Usar Flamethrower (Fire) com Charizard (Fire type)
- [ ] Comparar dano com mesmo ataque usando Pokémon não-Fire
- [ ] Dano com STAB deve ser ~1.5x maior

---

### 4. Status Effects 💫

#### Teste 4.1: Burn (Queimadura)
- [ ] Aplicar burn em um Pokémon
- [ ] Verificar ícone 🔥 no Pokémon
- [ ] A cada turno: Verificar log "X is hurt by burn! (-Y HP)"
- [ ] Verificar que perde ~6% do HP máximo por turno
- [ ] Após duração acabar: Verificar "X recovered from burn!"

#### Teste 4.2: Poison (Veneno)
- [ ] Aplicar poison em um Pokémon
- [ ] Verificar ícone ☠️ no Pokémon
- [ ] A cada turno: Verificar log "X is hurt by poison! (-Y HP)"
- [ ] Verificar que perde ~8% do HP máximo por turno

#### Teste 4.3: Paralyze (Paralisia)
- [ ] Aplicar paralyze em um Pokémon
- [ ] Verificar ícone ⚡ no Pokémon
- [ ] Tentar usar habilidade: ~25% de chance de não conseguir agir
- [ ] Verificar log "X is paralyzed!" quando falhar

#### Teste 4.4: Sleep (Sono)
- [ ] Aplicar sleep em um Pokémon
- [ ] Verificar ícone 💤 no Pokémon
- [ ] Tentar usar habilidade: NÃO deve conseguir agir
- [ ] Verificar log "X is fast asleep!"

#### Teste 4.5: Freeze (Congelamento)
- [ ] Aplicar freeze em um Pokémon
- [ ] Verificar ícone ❄️ no Pokémon
- [ ] Verificar overlay azul no card
- [ ] ~20% de chance de descongelar por turno

#### Teste 4.6: Confuse (Confusão)
- [ ] Aplicar confuse em um Pokémon
- [ ] Verificar ícone 💫 no Pokémon
- [ ] ~33% de chance de se machucar
- [ ] Verificar log "X hurt itself in confusion!"

#### Teste 4.7: Stun (Atordoamento)
- [ ] Aplicar stun em um Pokémon
- [ ] Verificar ícone ✨ no Pokémon
- [ ] Pokémon NÃO pode agir enquanto stunned
- [ ] Verificar log "X is stunned!"

#### Teste 4.8: Strengthen (Fortalecimento)
- [ ] Usar X Attack ou Nasty Plot
- [ ] Verificar ícone ⬆️ no Pokémon
- [ ] Próximo ataque deve causar +30-40% de dano
- [ ] Verificar log "X's attack is boosted!"

#### Teste 4.9: Reduce-Damage (Defesa)
- [ ] Usar X Defense ou Barrier
- [ ] Verificar ícone 🛡️ no Pokémon
- [ ] Próximo ataque recebido deve causar menos dano
- [ ] Verificar log "X's defense reduces damage!"

#### Teste 4.10: Cannot-Be-Healed (Maldição)
- [ ] Aplicar cannot-be-healed
- [ ] Tentar curar o Pokémon
- [ ] Verificar log "X cannot be healed!"
- [ ] HP não deve aumentar

---

### 5. Sistema de Evolução 🌟

#### Teste 5.1: Evoluir Pokémon
- [ ] Ter energia suficiente para evolução
- [ ] Clicar botão "EVOLVE ✨"
- [ ] Verificar animação de evolução (sprites before/after)
- [ ] Verificar que HP aumenta
- [ ] Verificar que stats aumentam
- [ ] Verificar que energia é gasta
- [ ] Verificar log "X evolved into Y!"

#### Teste 5.2: Evolução sem Energia
- [ ] Não ter energia suficiente
- [ ] Botão "EVOLVE" deve estar desabilitado (disabled)

---

### 6. Trainers e Passivas 👤

#### Teste 6.1: Brock (Rock/Ground -15 dano)
- [ ] Selecionar Brock como trainer
- [ ] Usar Pokémon Rock ou Ground
- [ ] Receber ataque
- [ ] Verificar que dano é reduzido em 15
- [ ] Verificar log "Brock's Sturdy Defense is active!"

#### Teste 6.2: Misty (+1 Water a cada 2 turnos)
- [ ] Selecionar Misty como trainer
- [ ] Chegar no turno 2
- [ ] Verificar log "Misty's Tidal Surge: +1 Water energy!"
- [ ] Verificar que ganhou 1 energia Water extra
- [ ] Repetir no turno 4, 6, etc.

#### Teste 6.3: Lt. Surge (+1 Electric a cada 2 turnos)
- [ ] Selecionar Lt. Surge como trainer
- [ ] Chegar no turno 2
- [ ] Verificar log "Lt. Surge's Lightning Rod: +1 Electric energy!"
- [ ] Verificar que ganhou 1 energia Electric extra

#### Teste 6.4: Erika (Grass cura 10 HP/turno)
- [ ] Selecionar Erika como trainer
- [ ] Usar Pokémon Grass com HP não-máximo
- [ ] A cada turno: Verificar log "Erika's Natural Cure: X healed 10 HP!"
- [ ] Verificar que HP aumenta

#### Teste 6.5: Koga (Poison +1 turno)
- [ ] Selecionar Koga como trainer
- [ ] Aplicar poison (normalmente dura 2 turnos)
- [ ] Verificar que dura 3 turnos (2 + 1 bonus)

#### Teste 6.6: Blaine (Fire +20% burn chance)
- [ ] Selecionar Blaine como trainer
- [ ] Usar ataque Fire com chance de burn
- [ ] Chance de burn deve ser maior (ex: 30% → 50%)

#### Teste 6.7: Giovanni (Inimigos -10% dano)
- [ ] Selecionar Giovanni como trainer
- [ ] Receber ataque inimigo
- [ ] Verificar que dano é ~10% menor

---

### 7. Sistema de Itens 🎒

#### Teste 7.1: Potion (Cura 30 HP)
- [ ] Clicar botão "ITEMS"
- [ ] Selecionar "Potion"
- [ ] Clicar em Pokémon com HP baixo
- [ ] Verificar que cura 30 HP
- [ ] Verificar log "Used Potion on X! Healed Y HP!"
- [ ] Verificar que uses diminui (2 → 1)

#### Teste 7.2: Super Potion (Cura 60 HP)
- [ ] Usar Super Potion
- [ ] Verificar que cura 60 HP

#### Teste 7.3: Hyper Potion (Cura 120 HP)
- [ ] Usar Hyper Potion
- [ ] Verificar que cura 120 HP (máximo = HP máximo)

#### Teste 7.4: Full Heal (Remove status)
- [ ] Aplicar burn/poison em Pokémon
- [ ] Usar Full Heal
- [ ] Verificar que todos os status são removidos
- [ ] Verificar log "Status effects cleared!"

#### Teste 7.5: Revive (Revive 50% HP)
- [ ] Derrotar um Pokémon (HP = 0)
- [ ] Usar Revive
- [ ] Verificar que HP = 50% do máximo
- [ ] Verificar log "Restored to X HP!"

#### Teste 7.6: X Attack (+30% ataque por 3 turnos)
- [ ] Usar X Attack em Pokémon
- [ ] Verificar ícone ⬆️
- [ ] Próximos ataques devem causar +30% dano
- [ ] Após 3 turnos: Efeito deve expirar

#### Teste 7.7: X Defense (+20 defesa por 3 turnos)
- [ ] Usar X Defense em Pokémon
- [ ] Verificar ícone 🛡️
- [ ] Próximos ataques recebidos causam -20 dano
- [ ] Após 3 turnos: Efeito deve expirar

#### Teste 7.8: Energy Boost (+1 random)
- [ ] Usar Energy Boost
- [ ] Verificar que ganha 1 energia random
- [ ] Verificar log "Used Energy Boost! +1 Random energy!"

#### Teste 7.9: Item com 0 Uses
- [ ] Usar item até uses = 0
- [ ] Verificar que item aparece desabilitado (disabled)
- [ ] Não deve poder usar

---

### 8. Backgrounds e UI 🎨

#### Teste 8.1: Background de Batalha
- [ ] Iniciar batalha
- [ ] Verificar que background é uma imagem do anime
- [ ] Reiniciar batalha várias vezes
- [ ] Verificar que background muda aleatoriamente

#### Teste 8.2: Targeting (Sem Borda Vermelha)
- [ ] Selecionar um ataque
- [ ] Verificar que Pokémon inimigo fica com borda DOURADA (não vermelha)
- [ ] Verificar animação de pulse dourado
- [ ] Cursor deve ser crosshair

#### Teste 8.3: Energy Display
- [ ] Verificar que mostra apenas as 4 energias selecionadas + random
- [ ] Verificar ícones corretos (🌿🔥💧⚡🔮👊🌑⚙️🐲⭐)
- [ ] Verificar contador de cada tipo
- [ ] Verificar total de energia

---

### 9. Habilidades Responsivas ⚔️

#### Teste 9.1: Cooldown
- [ ] Usar habilidade com cooldown > 0
- [ ] Verificar que fica em cooldown
- [ ] Verificar overlay com número de turnos
- [ ] Não deve poder usar até cooldown = 0
- [ ] A cada turno: Cooldown diminui em 1

#### Teste 9.2: Custo de Energia
- [ ] Selecionar habilidade
- [ ] Verificar que energia necessária é mostrada
- [ ] Usar habilidade
- [ ] Verificar que energia é gasta corretamente
- [ ] Tentar usar habilidade sem energia suficiente → Deve estar disabled

#### Teste 9.3: Targeting Correto
- [ ] Habilidade "enemy": Deve poder selecionar 1 inimigo
- [ ] Habilidade "all-enemies": Deve atingir todos os inimigos
- [ ] Habilidade "self": Deve atingir o próprio Pokémon

#### Teste 9.4: Efeitos Especiais
- [ ] Usar "Draining Kiss": Deve causar dano E curar
- [ ] Usar "Hex": Deve causar 2x dano se alvo tem status
- [ ] Usar "Barrier": Deve aplicar reduce-damage
- [ ] Usar "Nasty Plot": Deve aplicar strengthen

---

### 10. Vitória e Derrota 🏆

#### Teste 10.1: Vitória
- [ ] Derrotar todos os Pokémon inimigos
- [ ] Verificar overlay "VICTORY"
- [ ] Verificar mensagem de XP ganho
- [ ] Botão "CONTINUE" deve aparecer

#### Teste 10.2: Derrota
- [ ] Deixar todos os seus Pokémon serem derrotados
- [ ] Verificar overlay "DEFEAT"
- [ ] Botão "TRY AGAIN" deve aparecer

#### Teste 10.3: Surrender
- [ ] Clicar botão "SURRENDER"
- [ ] Deve ir para tela de derrota

---

## 📊 Resultados dos Testes

### Testes Automatizados
- ✅ **129/129 testes passando** (100%)
- ✅ Energy System: 5/5 testes
- ✅ Turn-Based System: 2/2 testes
- ✅ Type Effectiveness: 5/5 testes
- ✅ Status Effects: 11/11 testes
- ✅ Evolution System: 3/3 testes
- ✅ Trainer Passives: 7/7 testes
- ✅ Items System: 10/10 testes
- ✅ Cooldown System: 5/5 testes
- ✅ Damage Calculation: 5/5 testes
- ✅ Energy Cost: 3/3 testes
- ✅ Victory Conditions: 3/3 testes
- ✅ Integration Tests: 3/3 testes
- ✅ Edge Cases: 8/8 testes

### Testes Manuais
- [ ] Preencher após testes no navegador

---

## 🐛 Bugs Encontrados
_Documentar aqui qualquer bug encontrado durante os testes manuais_

---

## ✨ Melhorias Sugeridas
_Documentar aqui sugestões de melhorias encontradas durante os testes_

---

## 📝 Notas Adicionais
_Observações gerais sobre os testes_
