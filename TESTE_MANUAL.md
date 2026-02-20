# 🧪 TESTE MANUAL - TCG POCKET BATTLE SYSTEM

## ✅ CHECKLIST DE TESTES

### 1. Seleção de Pokémon Iniciais
- [ ] Acessar `/battle/ai`
- [ ] Verificar que aparecem APENAS 6 Pokémon:
  - [ ] Bulbasaur (Grass/Poison)
  - [ ] Charmander (Fire)
  - [ ] Squirtle (Water)
  - [ ] Pikachu (Electric)
  - [ ] Eevee (Normal)
  - [ ] Meowth (Normal)
- [ ] Verificar que NÃO aparecem evoluções (Ivysaur, Charmeleon, etc.)
- [ ] Selecionar 3 Pokémon diferentes
- [ ] Clicar em "CONFIRM TEAM"

**Resultado Esperado:** Avança para seleção de energia

---

### 2. Seleção de Energia (1-3 tipos)
- [ ] Verificar que aparecem 8 tipos de energia:
  - [ ] 🌿 Grass (Verde)
  - [ ] 🔥 Fire (Laranja)
  - [ ] 💧 Water (Azul)
  - [ ] ⚡ Lightning (Amarelo)
  - [ ] 🔮 Psychic (Rosa)
  - [ ] 👊 Fighting (Vermelho escuro)
  - [ ] 🌑 Darkness (Marrom)
  - [ ] ⚙️ Metal (Cinza)
- [ ] Verificar que Colorless (⭐) NÃO aparece para seleção
- [ ] Verificar texto: "Choose 1-3 energy types for your deck"

#### Teste A: Selecionar 1 energia
- [ ] Selecionar apenas Fire
- [ ] Botão deve estar HABILITADO
- [ ] Clicar em "CONFIRM ENERGY"

#### Teste B: Selecionar 2 energias
- [ ] Selecionar Water e Lightning
- [ ] Botão deve estar HABILITADO
- [ ] Clicar em "CONFIRM ENERGY"

#### Teste C: Selecionar 3 energias
- [ ] Selecionar Grass, Fire e Water
- [ ] Botão deve estar HABILITADO
- [ ] Clicar em "CONFIRM ENERGY"

#### Teste D: Tentar selecionar 4 energias
- [ ] Selecionar 4 energias
- [ ] Botão deve estar DESABILITADO
- [ ] Mensagem de erro deve aparecer

**Resultado Esperado:** Batalha inicia com energias selecionadas

---

### 3. Durante a Batalha - Energias

#### Visualização de Energia
- [ ] Verificar que energias têm glow effect (brilho)
- [ ] Verificar cores corretas:
  - [ ] Grass: Verde (#78C850)
  - [ ] Fire: Laranja (#F08030)
  - [ ] Water: Azul (#6890F0)
  - [ ] Lightning: Amarelo (#F8D030)
  - [ ] Psychic: Rosa (#F85888)
  - [ ] Fighting: Vermelho (#C03028)
  - [ ] Darkness: Marrom (#705848)
  - [ ] Metal: Cinza (#B8B8D0)
  - [ ] Colorless: Bege (#A8A878)

#### Geração de Energia
- [ ] A cada turno, 1 energia aleatória deve ser adicionada
- [ ] Energia deve ser de um dos tipos selecionados
- [ ] Contador de energia deve atualizar corretamente

#### Uso de Energia
- [ ] Selecionar um move que custa energia
- [ ] Verificar que energia é gasta corretamente
- [ ] Moves com custo Colorless devem aceitar qualquer energia
- [ ] Moves com custo específico devem usar energia do tipo + Colorless se necessário

**Resultado Esperado:** Sistema de energia funciona perfeitamente

---

### 4. Sistema de Evolução

#### Evolução de Bulbasaur
- [ ] Ter Bulbasaur no time
- [ ] Acumular 2 energias Grass
- [ ] Botão "EVOLVE" deve aparecer
- [ ] Clicar em "EVOLVE"
- [ ] Animação de evolução deve tocar
- [ ] Bulbasaur evolui para Ivysaur
- [ ] Stats aumentam corretamente
- [ ] HP aumenta em 35

#### Evolução de Ivysaur
- [ ] Acumular 3 energias Grass
- [ ] Ivysaur evolui para Venusaur
- [ ] HP aumenta em 40
- [ ] Stats aumentam em 15

#### Evolução de Charmander
- [ ] 2 energias Fire → Charmeleon
- [ ] 3 energias Fire → Charizard

#### Evolução de Squirtle
- [ ] 2 energias Water → Wartortle
- [ ] 3 energias Water → Blastoise

#### Evolução de Pikachu
- [ ] 2 energias Lightning → Raichu
- [ ] Verificar que usa "lightning" e não "electric"

**Resultado Esperado:** Todas as evoluções funcionam corretamente

---

### 5. Passivas de Trainers

#### Lt. Surge (Lightning)
- [ ] Selecionar Lt. Surge como trainer
- [ ] A cada 3 turnos, deve ganhar +1 Lightning energy
- [ ] Verificar log: "Lt. Surge's Electric Mastery! +1 Lightning energy!"

#### Misty (Water)
- [ ] Selecionar Misty como trainer
- [ ] A cada 2 turnos, deve ganhar +1 Water energy
- [ ] Verificar log: "Misty's Tidal Surge! +1 Water energy!"

#### Brock (Rock/Ground)
- [ ] Selecionar Brock como trainer
- [ ] Pokémon Rock/Ground devem tomar 15 menos de dano
- [ ] Verificar log: "Brock's Sturdy Defense is active!"

**Resultado Esperado:** Passivas funcionam corretamente

---

### 6. Moves e Custos de Energia

#### Moves com Custo Específico
- [ ] Vine Whip (Bulbasaur): 1 Grass
- [ ] Ember (Charmander): 1 Fire
- [ ] Water Gun (Squirtle): 1 Water
- [ ] Thunder Shock (Pikachu): 1 Lightning

#### Moves com Custo Colorless
- [ ] Quick Attack: 1 Colorless (aceita qualquer energia)
- [ ] Tackle: 1 Colorless (aceita qualquer energia)

#### Moves com Múltiplas Energias
- [ ] Razor Leaf: 2 Grass
- [ ] Flamethrower: 2 Fire
- [ ] Hydro Pump: 2 Water

**Resultado Esperado:** Todos os custos funcionam corretamente

---

### 7. Console Errors

#### Abrir DevTools (F12)
- [ ] Abrir Console
- [ ] Verificar se há erros em vermelho
- [ ] Verificar se há warnings em amarelo
- [ ] Anotar quaisquer erros encontrados

#### Erros Comuns a Verificar
- [ ] Nenhum erro de "Property 'random' does not exist"
- [ ] Nenhum erro de "Property 'electric' does not exist"
- [ ] Nenhum erro de tipo TypeScript
- [ ] Nenhum erro de React Hydration

**Resultado Esperado:** Console limpo, sem erros

---

### 8. Responsividade Mobile

#### Teste em Mobile (ou DevTools Mobile)
- [ ] Abrir em dispositivo mobile ou F12 → Toggle Device Toolbar
- [ ] Testar seleção de Pokémon
- [ ] Testar seleção de energia
- [ ] Testar botões de move
- [ ] Testar scroll
- [ ] Verificar que UI não quebra

**Resultado Esperado:** UI responsiva e funcional em mobile

---

### 9. Performance

#### Verificar Performance
- [ ] Batalha roda suavemente (60 FPS)
- [ ] Animações são fluidas
- [ ] Sem lag ao clicar em moves
- [ ] Sem lag ao evoluir Pokémon
- [ ] Transições suaves entre telas

**Resultado Esperado:** Performance excelente

---

### 10. Batalha Completa

#### Jogar uma Batalha do Início ao Fim
- [ ] Selecionar time de 3 Pokémon
- [ ] Selecionar 2 energias
- [ ] Jogar até vencer ou perder
- [ ] Verificar XP ganho
- [ ] Verificar tela de vitória/derrota
- [ ] Botão "PLAY AGAIN" funciona

**Resultado Esperado:** Batalha completa sem crashes

---

## 📊 RESUMO DE TESTES

### Testes Passados: __ / 50
### Testes Falhados: __ / 50
### Bugs Encontrados: __

---

## 🐛 BUGS ENCONTRADOS

### Bug #1
**Descrição:**
**Passos para Reproduzir:**
1. 
2. 
3. 

**Resultado Esperado:**
**Resultado Atual:**
**Severidade:** [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo

---

### Bug #2
**Descrição:**
**Passos para Reproduzir:**
1. 
2. 
3. 

**Resultado Esperado:**
**Resultado Atual:**
**Severidade:** [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo

---

## 📝 NOTAS ADICIONAIS

- 
- 
- 

---

**Testador:**
**Data:**
**Versão:** 1.0.0 (TCG Pocket Update)
**Commit:** 459a18f
