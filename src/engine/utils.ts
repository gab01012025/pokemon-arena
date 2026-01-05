/**
 * Pokémon Arena - Battle Engine Utilities
 * 
 * Pure utility functions for the battle engine.
 * Includes deterministic randomness, cloning, and helpers.
 */

import type { 
  BattleState, 
  Fighter, 
  Energy, 
  Skill,
  Status,
  Effect,
  BattleLogEvent,
  BattleLogEventType,
  TurnPhase
} from './types';
import { ZERO_ENERGY, isPlayerSlot, getAllySlots, getEnemySlots } from './types';

// =============================================================================
// DETERMINISTIC RANDOM NUMBER GENERATOR
// =============================================================================

/**
 * Mulberry32 - A fast, deterministic 32-bit PRNG
 * This ensures that given the same seed, the same sequence of "random" 
 * numbers is generated, making the battle engine fully deterministic.
 */
export class DeterministicRandom {
  private state: number;
  
  constructor(seed: number) {
    this.state = seed >>> 0;
  }
  
  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  
  /**
   * Generate random integer between min (inclusive) and max (inclusive)
   */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  /**
   * Pick random element from array
   */
  pick<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.int(0, array.length - 1)];
  }
  
  /**
   * Pick random energy type (excluding 'random')
   */
  pickEnergyType(): 'fire' | 'water' | 'grass' | 'electric' {
    const types: ('fire' | 'water' | 'grass' | 'electric')[] = ['fire', 'water', 'grass', 'electric'];
    return types[this.int(0, 3)];
  }
  
  /**
   * Get current state (for saving)
   */
  getState(): number {
    return this.state;
  }
  
  /**
   * Clone this RNG
   */
  clone(): DeterministicRandom {
    return new DeterministicRandom(this.state);
  }
}

// =============================================================================
// DEEP CLONE
// =============================================================================

/**
 * Deep clone a battle state (immutability helper)
 */
export function cloneState(state: BattleState): BattleState {
  return {
    ...state,
    fighters: state.fighters.map(cloneFighter),
    playerEnergy: { ...state.playerEnergy },
    opponentEnergy: { ...state.opponentEnergy },
    actionQueue: [...state.actionQueue],
    log: [...state.log],
  };
}

/**
 * Deep clone a fighter
 */
export function cloneFighter(fighter: Fighter): Fighter {
  return {
    ...fighter,
    skills: fighter.skills.map(cloneSkill),
    cooldowns: new Map(fighter.cooldowns),
    charges: new Map(fighter.charges),
    statuses: fighter.statuses.map(cloneStatus),
    defense: fighter.defense.map(d => ({ ...d })),
    barrier: fighter.barrier.map(b => ({ ...b })),
    channels: fighter.channels.map(c => ({ ...c, skill: cloneSkill(c.skill) })),
    traps: fighter.traps.map(t => ({ ...t, skill: cloneSkill(t.skill) })),
    effects: fighter.effects.map(e => ({ ...e })),
    lastSkill: fighter.lastSkill ? cloneSkill(fighter.lastSkill) : null,
  };
}

/**
 * Deep clone a skill
 */
export function cloneSkill(skill: Skill): Skill {
  return {
    ...skill,
    cost: { ...skill.cost },
    classes: [...skill.classes],
    start: [...skill.start],
    effects: [...skill.effects],
    interrupt: [...skill.interrupt],
    variations: skill.variations?.map(cloneSkill),
  };
}

/**
 * Deep clone a status
 */
export function cloneStatus(status: Status): Status {
  return {
    ...status,
    effects: status.effects.map(e => ({ ...e, classes: [...e.classes] })),
    classes: [...status.classes],
  };
}

// =============================================================================
// ENERGY HELPERS
// =============================================================================

/**
 * Add two energy amounts
 */
export function addEnergy(a: Energy, b: Energy): Energy {
  return {
    fire: a.fire + b.fire,
    water: a.water + b.water,
    grass: a.grass + b.grass,
    electric: a.electric + b.electric,
    random: a.random + b.random,
  };
}

/**
 * Subtract energy (b from a)
 */
export function subtractEnergy(a: Energy, b: Energy): Energy {
  return {
    fire: a.fire - b.fire,
    water: a.water - b.water,
    grass: a.grass - b.grass,
    electric: a.electric - b.electric,
    random: a.random - b.random,
  };
}

/**
 * Check if energy a has enough to pay for b
 * Random energy can substitute for any specific type
 */
export function canAfford(available: Energy, cost: Energy): boolean {
  // Calculate specific costs after using available specific energy
  let fireNeeded = Math.max(0, cost.fire - available.fire);
  let waterNeeded = Math.max(0, cost.water - available.water);
  let grassNeeded = Math.max(0, cost.grass - available.grass);
  let electricNeeded = Math.max(0, cost.electric - available.electric);
  
  // Total specific energy still needed
  const specificNeeded = fireNeeded + waterNeeded + grassNeeded + electricNeeded;
  
  // Calculate leftover specific energy that can be used for random cost
  const fireLeftover = Math.max(0, available.fire - cost.fire);
  const waterLeftover = Math.max(0, available.water - cost.water);
  const grassLeftover = Math.max(0, available.grass - cost.grass);
  const electricLeftover = Math.max(0, available.electric - cost.electric);
  const specificLeftover = fireLeftover + waterLeftover + grassLeftover + electricLeftover;
  
  // Total random available (actual random + leftover specific)
  const totalRandom = available.random + specificLeftover;
  
  // Can we cover the specific shortfall and the random cost?
  return specificNeeded <= available.random && 
         cost.random <= (totalRandom - specificNeeded);
}

/**
 * Pay for a skill cost, using random energy to cover shortfalls
 * Returns the new energy state after payment
 */
export function payEnergy(available: Energy, cost: Energy, rng: DeterministicRandom): Energy {
  const result = { ...available };
  
  // Pay specific costs first
  result.fire -= cost.fire;
  result.water -= cost.water;
  result.grass -= cost.grass;
  result.electric -= cost.electric;
  
  // Use random energy to cover any negative values
  const shortfall = 
    Math.max(0, -result.fire) + 
    Math.max(0, -result.water) + 
    Math.max(0, -result.grass) + 
    Math.max(0, -result.electric);
  
  result.random -= shortfall;
  
  // Fix negative specific values (they were covered by random)
  result.fire = Math.max(0, result.fire);
  result.water = Math.max(0, result.water);
  result.grass = Math.max(0, result.grass);
  result.electric = Math.max(0, result.electric);
  
  // Pay random cost from leftover specific energy
  let randomCost = cost.random;
  while (randomCost > 0) {
    // Prefer using random energy first
    if (result.random > 0) {
      result.random--;
      randomCost--;
    } else {
      // Use specific energy (pick randomly for fairness)
      const available: ('fire' | 'water' | 'grass' | 'electric')[] = [];
      if (result.fire > 0) available.push('fire');
      if (result.water > 0) available.push('water');
      if (result.grass > 0) available.push('grass');
      if (result.electric > 0) available.push('electric');
      
      if (available.length === 0) break; // Shouldn't happen if canAfford was checked
      
      const type = rng.pick(available)!;
      result[type]--;
      randomCost--;
    }
  }
  
  return result;
}

/**
 * Get total energy count
 */
export function totalEnergy(energy: Energy): number {
  return energy.fire + energy.water + energy.grass + energy.electric + energy.random;
}

/**
 * Generate random energy for turn start
 */
export function generateTurnEnergy(rng: DeterministicRandom): Energy {
  const type = rng.pickEnergyType();
  return {
    ...ZERO_ENERGY,
    [type]: 1,
  };
}

// =============================================================================
// LOGGING HELPERS
// =============================================================================

/**
 * Create a battle log event
 */
export function createLogEvent(
  state: BattleState,
  type: BattleLogEventType,
  message: string,
  options: Partial<BattleLogEvent> = {}
): BattleLogEvent {
  return {
    turn: state.turnNumber,
    phase: state.phase,
    type,
    message,
    ...options,
  };
}

/**
 * Add a log event to the state
 */
export function addLog(state: BattleState, event: BattleLogEvent): BattleState {
  return {
    ...state,
    log: [...state.log, event],
  };
}

// =============================================================================
// FIGHTER HELPERS
// =============================================================================

/**
 * Get a fighter by slot
 */
export function getFighter(state: BattleState, slot: number): Fighter | undefined {
  return state.fighters.find(f => f.slot === slot);
}

/**
 * Update a fighter in the state
 */
export function updateFighter(state: BattleState, slot: number, updater: (f: Fighter) => Fighter): BattleState {
  return {
    ...state,
    fighters: state.fighters.map(f => f.slot === slot ? updater(cloneFighter(f)) : f),
  };
}

/**
 * Update all fighters
 */
export function updateAllFighters(state: BattleState, updater: (f: Fighter) => Fighter): BattleState {
  return {
    ...state,
    fighters: state.fighters.map(f => updater(cloneFighter(f))),
  };
}

/**
 * Get all alive fighters
 */
export function getAliveFighters(state: BattleState): Fighter[] {
  return state.fighters.filter(f => f.alive);
}

/**
 * Get player's alive fighters
 */
export function getPlayerFighters(state: BattleState): Fighter[] {
  return state.fighters.filter(f => isPlayerSlot(f.slot) && f.alive);
}

/**
 * Get opponent's alive fighters  
 */
export function getOpponentFighters(state: BattleState): Fighter[] {
  return state.fighters.filter(f => !isPlayerSlot(f.slot) && f.alive);
}

/**
 * Get allies for a slot (excluding self)
 */
export function getAllies(state: BattleState, slot: number): Fighter[] {
  const allySlots = getAllySlots(slot).filter(s => s !== slot);
  return state.fighters.filter(f => allySlots.includes(f.slot) && f.alive);
}

/**
 * Get enemies for a slot
 */
export function getEnemies(state: BattleState, slot: number): Fighter[] {
  const enemySlots = getEnemySlots(slot);
  return state.fighters.filter(f => enemySlots.includes(f.slot) && f.alive);
}

// =============================================================================
// SKILL HELPERS
// =============================================================================

/**
 * Get a fighter's skill by index
 */
export function getSkill(fighter: Fighter, skillIndex: number): Skill | undefined {
  const skill = fighter.skills[skillIndex];
  if (!skill) return undefined;
  
  // If skill has variations, return the current variation
  if (skill.variations && skill.variations.length > 0) {
    const varIndex = skill.variationIndex;
    if (varIndex > 0 && varIndex <= skill.variations.length) {
      return skill.variations[varIndex - 1];
    }
  }
  
  return skill;
}

// =============================================================================
// VICTORY CHECK
// =============================================================================

/**
 * Check if a team has lost (all fighters dead)
 */
export function checkVictory(state: BattleState): BattleState {
  const playerAlive = getPlayerFighters(state).length > 0;
  const opponentAlive = getOpponentFighters(state).length > 0;
  
  if (!playerAlive && !opponentAlive) {
    return { ...state, victor: null }; // Draw
  } else if (!playerAlive) {
    return { ...state, victor: 'opponent' };
  } else if (!opponentAlive) {
    return { ...state, victor: 'player' };
  }
  
  return state;
}

// =============================================================================
// FIGHTER STATE UPDATES
// =============================================================================

/**
 * Update fighter's alive status based on health
 */
export function updateAliveStatus(fighter: Fighter): Fighter {
  return {
    ...fighter,
    alive: fighter.health > 0,
  };
}

/**
 * Reset acted flag for all fighters
 */
export function resetActedFlags(state: BattleState): BattleState {
  return updateAllFighters(state, f => ({ ...f, acted: false }));
}
