# 🚨 PROBLEMAS URGENTES IDENTIFICADOS

**Data**: 2026-02-20  
**Status**: 🔴 CRÍTICO - CORREÇÃO IMEDIATA NECESSÁRIA

---

## ❌ PROBLEMAS ENCONTRADOS

### 1. ENERGIAS ERRADAS ⚠️

#### Problema
O código atual tem **10 tipos de energia**, mas o **Pokemon TCG Pocket oficial tem apenas 8**:

**❌ ATUAL (ERRADO)**:
```typescript
type EnergyType = 'grass' | 'fire' | 'water' | 'electric' | 'psychic' | 
                  'fighting' | 'darkness' | 'metal' | 'dragon' | 'random';
// 10 tipos!
```

**✅ CORRETO (TCG POCKET OFICIAL)**:
```typescript
type EnergyType = 'grass' | 'fire' | 'water' | 'lightning' | 'psychic' | 
                  'fighting' | 'darkness' | 'metal';
// 8 tipos + Colorless (que funciona com qualquer energia)
```

#### Diferenças:
- ❌ `electric` → ✅ `lightning` (nome oficial)
- ❌ `dragon` → **NÃO EXISTE** no TCG Pocket
- ❌ `random` → ✅ `colorless` (funciona com qualquer energia)

---

### 2. EVOLUÇÕES APARECENDO ⚠️

#### Problema
O jogo está mostrando Pokémon evoluídos na seleção inicial, mas deveria mostrar **APENAS OS INICIAIS DE KANTO**:

**❌ ATUAL**: Mostra evoluções (Charizard, Blastoise, Venusaur, etc)

**✅ CORRETO**: Apenas iniciais:
- Charmander (Fire)
- Squirtle (Water)
- Bulbasaur (Grass)
- Pikachu (Lightning) - Mascote
- Meowth (Colorless) - Opcional
- Eevee (Colorless) - Opcional

---

### 3. SELEÇÃO DE ENERGIA GENÉRICA ⚠️

#### Problema
A tela pede para selecionar "4 energias + random", mas no TCG Pocket:

**❌ ATUAL**: Selecionar 4 tipos fixos + random
**✅ CORRETO**: Selecionar até 3 tipos de energia para o deck

#### Como funciona no TCG Pocket:
1. Você escolhe até **3 tipos de energia** para seu deck
2. A cada turno, 1 energia é gerada automaticamente
3. Se você tem múltiplos tipos, a energia gerada é **aleatória** entre eles
4. Para competitivo, recomenda-se usar **1 tipo só** para consistência

---

### 4. NOMES DE ENERGIA INCONSISTENTES ⚠️

#### Problema
```typescript
const ENERGY_NAMES: Record<EnergyType, string> = {
  electric: 'Lightning',  // ❌ Tipo chamado 'electric' mas nome 'Lightning'
  dragon: 'Dragon',       // ❌ Não existe no TCG Pocket
  random: 'Random',       // ❌ Deveria ser 'Colorless'
};
```

**✅ CORRETO**:
- Grass
- Fire  
- Water
- Lightning (não Electric)
- Psychic
- Fighting
- Darkness
- Metal
- Colorless (não Random)

---

### 5. MAPEAMENTO DE TIPOS ERRADO ⚠️

#### Problema Atual
```typescript
const TYPE_TO_ENERGY: Record<PokemonType, EnergyType> = {
  dragon: 'random',  // ❌ Dragon não existe como energia
  normal: 'random',  // ❌ Deveria ser 'colorless'
  flying: 'random',  // ❌ Deveria ser 'colorless'
};
```

**✅ CORRETO (TCG Pocket Official)**:
```typescript
const TYPE_TO_ENERGY: Record<PokemonType, EnergyType> = {
  // Energias diretas
  fire: 'fire',
  water: 'water',
  grass: 'grass',
  electric: 'lightning',
  psychic: 'psychic',
  fighting: 'fighting',
  dark: 'darkness',
  steel: 'metal',
  
  // Tipos que usam energias existentes
  ghost: 'psychic',
  rock: 'fighting',
  ground: 'fighting',
  poison: 'darkness',
  bug: 'grass',
  ice: 'water',
  
  // Colorless (qualquer energia)
  normal: 'colorless',
  flying: 'colorless',
  dragon: 'colorless',
  fairy: 'colorless',
};
```

---

### 6. UI NÃO PARECE TCG POCKET ⚠️

#### Problemas Visuais
- ❌ Layout genérico
- ❌ Cores não são do TCG Pocket
- ❌ Ícones de energia genéricos (emojis)
- ❌ Falta estilo card do TCG

**✅ Deveria ter**:
- Design de cartas do TCG Pocket
- Cores oficiais das energias
- Ícones oficiais (ou similares)
- Layout de batalha do TCG Pocket

---

### 7. ERROS NO CONSOLE 🐛

Pelos screenshots, há múltiplos erros:
- `Minified React error #418`
- `Minified React error #419`
- Problemas de CORS
- Falhas de API

---

## 🔧 PLANO DE CORREÇÃO URGENTE

### FASE 1: CORRIGIR ENERGIAS (30 min)
1. ✅ Remover `dragon` e `random` como energias
2. ✅ Renomear `electric` para `lightning`
3. ✅ Adicionar `colorless` corretamente
4. ✅ Atualizar todos os ícones e nomes
5. ✅ Corrigir mapeamento TYPE_TO_ENERGY

### FASE 2: CORRIGIR POKÉMON INICIAIS (20 min)
1. ✅ Criar lista de APENAS iniciais de Kanto
2. ✅ Remover evoluções da seleção
3. ✅ Adicionar Pikachu como opção especial
4. ✅ Garantir apenas 3-6 iniciais disponíveis

### FASE 3: CORRIGIR SELEÇÃO DE ENERGIA (15 min)
1. ✅ Mudar de "selecionar 4" para "selecionar até 3"
2. ✅ Atualizar UI da seleção
3. ✅ Atualizar lógica de geração de energia

### FASE 4: CORRIGIR ERROS DO CONSOLE (20 min)
1. ✅ Investigar erros React
2. ✅ Corrigir problemas de CORS
3. ✅ Validar todas as APIs

### FASE 5: MELHORAR UI (30 min)
1. ✅ Aplicar cores oficiais do TCG Pocket
2. ✅ Melhorar design das cartas
3. ✅ Adicionar ícones melhores para energias
4. ✅ Layout mais próximo do TCG Pocket

---

## 📊 IMPACTO

### Antes (Atual)
- ❌ 10 tipos de energia (errado)
- ❌ Evoluções disponíveis (errado)
- ❌ Selecionar 4 energias (errado)
- ❌ Nomes inconsistentes
- ❌ Erros no console
- ❌ UI genérica

### Depois (Corrigido)
- ✅ 8 tipos de energia + colorless (correto)
- ✅ Apenas iniciais de Kanto (correto)
- ✅ Selecionar até 3 energias (correto)
- ✅ Nomes oficiais do TCG Pocket
- ✅ Sem erros no console
- ✅ UI estilo TCG Pocket

---

## ⏱️ TEMPO ESTIMADO

**Total**: 2 horas
- Correções críticas: 1h 15min
- Testes: 30min
- Deploy: 15min

---

## 🎯 PRIORIDADE

**CRÍTICO** - Deve ser corrigido IMEDIATAMENTE antes de qualquer uso público.

O jogo atual está **funcionalmente incorreto** em relação ao Pokemon TCG Pocket oficial.
