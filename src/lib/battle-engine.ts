/**
 * Pokemon Arena - Battle Engine
 * Core game logic for turn-based battles
 */

import {
  Pokemon,
  BattlePokemon,
  BattleState,
  PlayerState,
  StatusEffect,
  EnergyPool,
  EnergyType,
  Move,
  TargetType,
  EffectType,
  Action,
} from '@/types/game';

// ==================== INITIALIZATION ====================

/**
 * Create a BattlePokemon from a Pokemon template
 */
export function createBattlePokemon(pokemon: Pokemon, position: number): BattlePokemon {
  return {
    id: `${pokemon.id}-${position}`,
    pokemonId: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    currentHealth: pokemon.hp,
    maxHealth: pokemon.hp,
    position,
    moves: pokemon.moves,
    effects: [],
    cooldowns: [0, 0, 0, 0], // One for each move slot
    traits: pokemon.traits,
  };
}

/**
 * Initialize a new battle state
 */
export function initBattle(
  battleId: string,
  player1Id: string,
  player1Name: string,
  player1Team: Pokemon[],
  player2Id: string,
  player2Name: string,
  player2Team: Pokemon[]
): BattleState {
  const player1State: PlayerState = {
    oderId: player1Id,
    username: player1Name,
    team: player1Team.map((p, i) => createBattlePokemon(p, i)),
    energy: generateInitialEnergy(),
    selectedActions: [],
  };

  const player2State: PlayerState = {
    oderId: player2Id,
    username: player2Name,
    team: player2Team.map((p, i) => createBattlePokemon(p, i)),
    energy: generateInitialEnergy(),
    selectedActions: [],
  };

  return {
    id: battleId,
    turn: 1,
    phase: 'selection',
    currentPlayer: 1,
    player1: player1State,
    player2: player2State,
    turnHistory: [],
  };
}

// ==================== ENERGY SYSTEM ====================

/**
 * Generate initial energy pool (all zeros)
 */
function generateInitialEnergy(): EnergyPool {
  return { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
}

/**
 * Generate random energy for a turn based on team composition
 */
export function generateEnergy(team: BattlePokemon[]): EnergyPool {
  const pool: EnergyPool = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
  
  // Get energy types based on alive Pokemon types
  const aliveTypes: EnergyType[] = [];
  
  team.forEach(pokemon => {
    if (pokemon.currentHealth > 0) {
      pokemon.types.forEach(type => {
        const energyType = type.toLowerCase() as EnergyType;
        if (energyType in pool && energyType !== 'colorless') {
          aliveTypes.push(energyType);
        }
      });
    }
  });
  
  // Generate 3 random energy from available types (or colorless if no match)
  for (let i = 0; i < 3; i++) {
    if (aliveTypes.length > 0) {
      const randomIndex = Math.floor(Math.random() * aliveTypes.length);
      const type = aliveTypes[randomIndex];
      pool[type]++;
    } else {
      pool.colorless++;
    }
  }
  
  return pool;
}

/**
 * Add energy to existing pool
 */
export function addEnergy(current: EnergyPool, generated: EnergyPool): EnergyPool {
  return {
    fire: current.fire + generated.fire,
    water: current.water + generated.water,
    grass: current.grass + generated.grass,
    electric: current.electric + generated.electric,
    colorless: current.colorless + generated.colorless,
  };
}

/**
 * Check if player can afford a move cost
 */
export function canPayCost(available: EnergyPool, cost: Partial<Record<EnergyType, number>>): boolean {
  const tempPool = { ...available };
  
  // First check specific energy types
  const types: EnergyType[] = ['fire', 'water', 'grass', 'electric'];
  for (const type of types) {
    const needed = cost[type] || 0;
    if (tempPool[type] < needed) return false;
    tempPool[type] -= needed;
  }
  
  // Then check colorless (can be paid with any remaining energy)
  const colorlessNeeded = cost.colorless || 0;
  const totalRemaining = tempPool.fire + tempPool.water + tempPool.grass + tempPool.electric + tempPool.colorless;
  
  return totalRemaining >= colorlessNeeded;
}

/**
 * Pay energy cost and return new pool
 */
export function payEnergyCost(pool: EnergyPool, cost: Partial<Record<EnergyType, number>>): EnergyPool {
  const result = { ...pool };
  
  // Pay specific costs
  result.fire -= cost.fire || 0;
  result.water -= cost.water || 0;
  result.grass -= cost.grass || 0;
  result.electric -= cost.electric || 0;
  
  // Pay colorless from any remaining
  let colorlessToPay = cost.colorless || 0;
  const types: EnergyType[] = ['fire', 'water', 'grass', 'electric', 'colorless'];
  
  for (const type of types) {
    while (colorlessToPay > 0 && result[type] > 0) {
      result[type]--;
      colorlessToPay--;
    }
  }
  
  return result;
}

// ==================== MOVE VALIDATION ====================

interface MoveValidation {
  canUse: boolean;
  reason?: string;
}

/**
 * Check if a Pokemon can use a move
 */
export function canUseMove(
  battlePokemon: BattlePokemon,
  moveIndex: number,
  energy: EnergyPool
): MoveValidation {
  // Check if Pokemon is alive
  if (battlePokemon.currentHealth <= 0) {
    return { canUse: false, reason: 'Pokemon is fainted' };
  }
  
  const move = battlePokemon.moves[moveIndex];
  if (!move) {
    return { canUse: false, reason: 'Move not found' };
  }
  
  // Check cooldown
  if (battlePokemon.cooldowns[moveIndex] > 0) {
    return { canUse: false, reason: `On cooldown: ${battlePokemon.cooldowns[moveIndex]} turns` };
  }
  
  // Check stun effects
  const isStunned = battlePokemon.effects.some(e => e.type === 'stun');
  if (isStunned) {
    return { canUse: false, reason: 'Pokemon is stunned' };
  }
  
  // Check energy cost
  if (!canPayCost(energy, move.cost)) {
    return { canUse: false, reason: 'Not enough energy' };
  }
  
  // Check move requirements (e.g., needs a specific effect active)
  if (move.require) {
    const hasRequiredEffect = battlePokemon.effects.some(e => e.name === move.require);
    if (!hasRequiredEffect) {
      return { canUse: false, reason: `Requires: ${move.require}` };
    }
  }
  
  return { canUse: true };
}

// ==================== TARGETING ====================

interface TargetSelection {
  valid: boolean;
  positions: number[];
  isEnemy: boolean;
}

/**
 * Get valid targets for a move
 */
export function getValidTargets(
  target: TargetType,
  ownTeam: BattlePokemon[],
  enemyTeam: BattlePokemon[],
  userPosition: number
): TargetSelection {
  const aliveOwn = ownTeam.filter(p => p.currentHealth > 0);
  const aliveEnemy = enemyTeam.filter(p => p.currentHealth > 0);
  
  switch (target) {
    case 'Self':
      return {
        valid: true,
        positions: [userPosition],
        isEnemy: false
      };
      
    case 'OneAlly':
      return {
        valid: aliveOwn.length > 0,
        positions: aliveOwn.map(p => p.position),
        isEnemy: false
      };
      
    case 'AllAllies':
      return {
        valid: aliveOwn.length > 0,
        positions: aliveOwn.map(p => p.position),
        isEnemy: false
      };
      
    case 'OneEnemy':
      return {
        valid: aliveEnemy.length > 0,
        positions: aliveEnemy.map(p => p.position),
        isEnemy: true
      };
      
    case 'AllEnemies':
      return {
        valid: aliveEnemy.length > 0,
        positions: aliveEnemy.map(p => p.position),
        isEnemy: true
      };
      
    case 'AllCharacters':
      return {
        valid: true,
        positions: [...aliveOwn.map(p => p.position), ...aliveEnemy.map(p => p.position)],
        isEnemy: false
      };
      
    default:
      return { valid: false, positions: [], isEnemy: false };
  }
}

// ==================== ACTION RESOLUTION ====================

interface ActionResult {
  attacker: BattlePokemon;
  move: Move;
  targets: BattlePokemon[];
  effects: AppliedEffectResult[];
}

interface AppliedEffectResult {
  targetId: string;
  type: EffectType;
  value: number;
  message: string;
}

/**
 * Resolve a single action
 */
export function resolveAction(
  action: Action,
  attackerTeam: BattlePokemon[],
  defenderTeam: BattlePokemon[],
  energy: EnergyPool
): { result: ActionResult; newEnergy: EnergyPool; updatedAttacker: BattlePokemon; updatedDefenders: BattlePokemon[] } {
  const attacker = attackerTeam.find(p => p.id === action.pokemonId);
  if (!attacker) throw new Error('Attacker not found');
  
  const move = attacker.moves[action.moveIndex];
  if (!move) throw new Error('Move not found');
  
  const effects: AppliedEffectResult[] = [];
  const updatedDefenders = [...defenderTeam];
  let updatedAttacker = { ...attacker };
  
  // Calculate damage with modifiers
  const strengthBonus = attacker.effects
    .filter(e => e.type === 'strengthen')
    .reduce((sum: number, e: StatusEffect) => sum + e.value, 0);
  
  // Process each target
  for (const targetId of action.targetIds) {
    const targetIndex = updatedDefenders.findIndex(p => p.id === targetId);
    let target = targetIndex >= 0 ? updatedDefenders[targetIndex] : attackerTeam.find(p => p.id === targetId);
    
    if (!target || target.currentHealth <= 0) continue;
    
    // Check invulnerability
    const isInvulnerable = target.effects.some(e => e.type === 'invulnerable');
    if (isInvulnerable && targetIndex >= 0) {
      effects.push({
        targetId: target.id,
        type: 'invulnerable',
        value: 0,
        message: `${target.name} is protected!`
      });
      continue;
    }
    
    // Calculate damage
    if (move.damage > 0) {
      const damageReduction = target.effects
        .filter(e => e.type === 'reduce')
        .reduce((sum: number, e: StatusEffect) => sum + e.value, 0);
      
      const damageIncrease = target.effects
        .filter(e => e.type === 'expose')
        .reduce((sum: number, e: StatusEffect) => sum + e.value, 0);
      
      const baseDamage = move.damage + strengthBonus;
      const finalDamage = Math.max(0, baseDamage - damageReduction + damageIncrease);
      
      target = {
        ...target,
        currentHealth: Math.max(0, target.currentHealth - finalDamage)
      };
      
      if (targetIndex >= 0) {
        updatedDefenders[targetIndex] = target;
      }
      
      effects.push({
        targetId: target.id,
        type: 'damage',
        value: finalDamage,
        message: `${attacker.name} dealt ${finalDamage} damage to ${target.name}!`
      });
    }
    
    // Apply healing
    if (move.healing > 0) {
      const healed = Math.min(move.healing, target.maxHealth - target.currentHealth);
      target = {
        ...target,
        currentHealth: target.currentHealth + healed
      };
      
      if (targetIndex >= 0) {
        updatedDefenders[targetIndex] = target;
      } else if (target.id === attacker.id) {
        updatedAttacker = { ...updatedAttacker, currentHealth: target.currentHealth };
      }
      
      effects.push({
        targetId: target.id,
        type: 'heal',
        value: healed,
        message: `${target.name} recovered ${healed} HP!`
      });
    }
    
    // Apply status effects from move
    for (const effect of move.effects) {
      const statusEffect: StatusEffect = {
        id: `${move.id}-${effect.type}-${Date.now()}`,
        name: move.name,
        type: effect.type,
        value: effect.value || 0,
        duration: effect.duration || 1,
        source: attacker.id,
        classes: move.classes,
      };
      
      target = {
        ...target,
        effects: [...target.effects, statusEffect]
      };
      
      if (targetIndex >= 0) {
        updatedDefenders[targetIndex] = target;
      } else if (target.id === attacker.id) {
        updatedAttacker = { ...updatedAttacker, effects: target.effects };
      }
      
      effects.push({
        targetId: target.id,
        type: effect.type,
        value: effect.value || 0,
        message: `${target.name} is affected by ${move.name}!`
      });
    }
  }
  
  // Set cooldown
  const newCooldowns = [...updatedAttacker.cooldowns];
  newCooldowns[action.moveIndex] = move.cooldown;
  updatedAttacker = { ...updatedAttacker, cooldowns: newCooldowns };
  
  // Pay energy
  const newEnergy = payEnergyCost(energy, move.cost);
  
  return {
    result: {
      attacker: updatedAttacker,
      move,
      targets: action.targetIds.map(id => 
        updatedDefenders.find(p => p.id === id) || attackerTeam.find(p => p.id === id)!
      ),
      effects,
    },
    newEnergy,
    updatedAttacker,
    updatedDefenders,
  };
}

// ==================== TURN PROCESSING ====================

/**
 * Process end of turn effects (cooldowns, status durations)
 */
export function processEndOfTurn(team: BattlePokemon[]): BattlePokemon[] {
  return team.map(pokemon => {
    // Reduce cooldowns
    const newCooldowns = pokemon.cooldowns.map(cd => Math.max(0, cd - 1));
    
    // Reduce effect durations and remove expired
    const newEffects = pokemon.effects
      .map(effect => ({ ...effect, duration: effect.duration - 1 }))
      .filter(effect => effect.duration > 0);
    
    // Apply damage over time effects
    let newHealth = pokemon.currentHealth;
    pokemon.effects.forEach(effect => {
      if (effect.type === 'afflict' || effect.type === 'burn' || effect.type === 'poison') {
        newHealth = Math.max(0, newHealth - effect.value);
      }
    });
    
    return {
      ...pokemon,
      cooldowns: newCooldowns,
      effects: newEffects,
      currentHealth: newHealth,
    };
  });
}

/**
 * Check if battle is over
 */
export function checkBattleEnd(state: BattleState): { ended: boolean; winner?: string } {
  const player1Alive = state.player1.team.some(p => p.currentHealth > 0);
  const player2Alive = state.player2.team.some(p => p.currentHealth > 0);
  
  if (!player1Alive && !player2Alive) {
    return { ended: true, winner: undefined }; // Draw
  }
  
  if (!player1Alive) {
    return { ended: true, winner: state.player2.oderId };
  }
  
  if (!player2Alive) {
    return { ended: true, winner: state.player1.oderId };
  }
  
  return { ended: false };
}

/**
 * Start a new turn
 */
export function startNewTurn(state: BattleState): BattleState {
  const player1Energy = addEnergy(state.player1.energy, generateEnergy(state.player1.team));
  const player2Energy = addEnergy(state.player2.energy, generateEnergy(state.player2.team));
  
  return {
    ...state,
    turn: state.turn + 1,
    phase: 'selection',
    player1: {
      ...state.player1,
      energy: player1Energy,
      selectedActions: [],
    },
    player2: {
      ...state.player2,
      energy: player2Energy,
      selectedActions: [],
    },
  };
}
