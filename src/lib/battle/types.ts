/**
 * Pokemon Arena Battle System - Types
 * Based on Naruto Arena/Naruto Unison mechanics
 */

// ============== CHAKRA/ENERGY SYSTEM ==============
export interface Energy {
  fire: number;      // Bloodline equivalent
  water: number;     // Genjutsu equivalent
  grass: number;     // Ninjutsu equivalent  
  electric: number;  // Taijutsu equivalent
  random: number;    // Random chakra
}

export const EMPTY_ENERGY: Energy = {
  fire: 0,
  water: 0,
  grass: 0,
  electric: 0,
  random: 0,
};

// ============== EFFECT TYPES ==============
export type EffectType =
  // Damage Effects
  | 'damage'           // Direct damage
  | 'pierce'           // Piercing damage (ignores reduction)
  | 'afflict'          // Damage over time (ignores all defense)
  | 'recoil'           // Self-damage
  
  // Healing Effects
  | 'heal'             // Direct healing
  | 'healOverTime'     // Heal each turn
  
  // Status Effects
  | 'stun'             // Cannot use skills of a type
  | 'silence'          // Cannot apply non-damage effects
  | 'expose'           // Cannot reduce damage or be invulnerable
  | 'weaken'           // Reduce damage dealt
  | 'strengthen'       // Increase damage dealt
  | 'reduce'           // Reduce damage received
  | 'bleed'            // Increase damage received
  | 'invulnerable'     // Immune to skill types
  | 'reflect'          // Reflect first skill
  | 'counter'          // Counter attack on hit
  | 'endure'           // Cannot die (HP stays at 1)
  | 'enrage'           // Ignore harmful effects
  | 'focus'            // Ignore stuns/disables
  | 'seal'             // Ignore helpful effects
  | 'plague'           // Cannot be healed
  | 'taunt'            // Forced to target user
  | 'redirect'         // Redirect skills to another target
  | 'share'            // Share damage with another
  | 'snare'            // Increase cooldowns
  
  // Skill Modifiers
  | 'cooldownReduce'   // Reduce cooldowns
  | 'costReduce'       // Reduce energy costs
  | 'bypass'           // Bypass invulnerability
  | 'exhaust';         // Increase skill costs

export type SkillClass = 
  | 'Physical'    // Taijutsu
  | 'Special'     // Ninjutsu/Genjutsu
  | 'Mental'      // Genjutsu
  | 'Ranged'      // Long-range
  | 'Melee'       // Close-range
  | 'All';        // All types

export type TargetType =
  | 'Self'
  | 'Ally'
  | 'XAlly'       // Ally excluding self
  | 'Allies'      // All allies
  | 'Enemy'
  | 'Enemies'     // All enemies
  | 'Everyone';   // All characters

// ============== EFFECT STRUCTURE ==============
export interface Effect {
  type: EffectType;
  value: number;
  duration: number;        // -1 = permanent, 0 = instant
  classes?: SkillClass[];  // Affected skill classes
  chance?: number;         // Percentage chance (0-100)
  target?: TargetType;
  source?: string;         // Skill that applied this
  user?: number;           // Slot of the user
}

// ============== STATUS ON CHARACTER ==============
export interface Status {
  name: string;
  effects: Effect[];
  duration: number;
  user: number;           // Who applied this
  classes: SkillClass[];  // Classes of the skill that applied
  removable: boolean;     // Can be removed/cleansed
  visible: boolean;       // Shown to enemy
  helpful: boolean;       // Buff vs debuff
}

// ============== SKILL STRUCTURE ==============
export interface Skill {
  id: string;
  name: string;
  description: string;
  classes: SkillClass[];
  cost: Partial<Energy>;
  cooldown: number;
  currentCooldown: number;
  charges?: number;        // Uses before needs recharge
  currentCharges?: number;
  targets: TargetType[];
  effects: Effect[];
  require?: SkillRequirement;
  interrupt?: Effect[];    // Effects if skill is interrupted
}

export interface SkillRequirement {
  type: 'hasStatus' | 'healthAbove' | 'healthBelow' | 'hasEnergy';
  value: string | number;
}

// ============== CHARACTER IN BATTLE ==============
export interface BattleCharacter {
  id: string;
  slot: number;            // 0-2 for player, 3-5 for enemy
  name: string;
  types: string[];
  health: number;
  maxHealth: number;
  alive: boolean;
  
  // Skills
  skills: Skill[];
  
  // Status Effects
  statuses: Status[];
  
  // Barriers/Defense
  barrier: number;         // Destructible defense
  barrierName?: string;
  
  // Flags
  acted: boolean;          // Has acted this turn
  
  // Cached effects for quick lookup
  cachedEffects: {
    stunned: SkillClass[];
    invulnerable: SkillClass[];
    damageReduction: number;
    damageBonus: number;
    healingReduction: number;
  };
}

// ============== PLAYER STATE ==============
export interface PlayerState {
  id: string;
  username: string;
  team: BattleCharacter[];
  energy: Energy;
  exchangedThisTurn: boolean;
}

// ============== ACTION ==============
export interface BattleAction {
  user: number;            // Slot of acting character
  skillIndex: number;      // Which skill (0-3)
  targets: number[];       // Target slot(s)
}

// ============== BATTLE LOG ==============
export interface BattleLogEntry {
  turn: number;
  action: 'skill' | 'status' | 'death' | 'system' | 'damage' | 'heal';
  source?: string;
  target?: string;
  skill?: string;
  value?: number;
  message: string;
}

// ============== GAME STATE ==============
export interface GameState {
  id: string;
  status: 'waiting' | 'active' | 'finished';
  
  // Players
  player1: PlayerState;
  player2: PlayerState;
  
  // Turn info
  turn: number;
  phase: 'selection' | 'execution';
  currentPlayer: 1 | 2;
  turnDeadline: number;
  
  // Actions queued for this turn
  queuedActions: {
    player1: BattleAction[];
    player2: BattleAction[];
  };
  
  // Result
  victor: 1 | 2 | 'draw' | null;
  forfeit: boolean;
  
  // Log
  log: BattleLogEntry[];
}

// ============== AI DIFFICULTY ==============
export interface AIConfig {
  difficulty: 'easy' | 'normal' | 'hard';
  name: string;
  thinkTime: number;       // Milliseconds to "think"
  randomness: number;      // 0-1, how random choices are
  priorities: {
    damage: number;
    healing: number;
    defense: number;
    status: number;
  };
}

export const AI_CONFIGS: Record<string, AIConfig> = {
  easy: {
    difficulty: 'easy',
    name: 'Youngster Joey',
    thinkTime: 500,
    randomness: 0.5,
    priorities: { damage: 1, healing: 0.5, defense: 0.3, status: 0.2 },
  },
  normal: {
    difficulty: 'normal',
    name: 'Trainer Red',
    thinkTime: 1000,
    randomness: 0.3,
    priorities: { damage: 1, healing: 1, defense: 0.8, status: 0.6 },
  },
  hard: {
    difficulty: 'hard',
    name: 'Champion Blue',
    thinkTime: 1500,
    randomness: 0.1,
    priorities: { damage: 1, healing: 1, defense: 1, status: 1 },
  },
};

// ============== UTILITY FUNCTIONS ==============
export function totalEnergy(energy: Energy): number {
  return energy.fire + energy.water + energy.grass + energy.electric + energy.random;
}

export function canAfford(available: Energy, cost: Partial<Energy>): boolean {
  let remaining = { ...available };
  
  // Check specific costs
  for (const [type, amount] of Object.entries(cost)) {
    if (type === 'random') continue;
    const typeKey = type as keyof Energy;
    if ((remaining[typeKey] || 0) < (amount || 0)) {
      return false;
    }
    remaining[typeKey] -= amount || 0;
  }
  
  // Check random cost can be paid with remaining
  const randomNeeded = cost.random || 0;
  const randomAvailable = totalEnergy(remaining);
  
  return randomAvailable >= randomNeeded;
}

export function spendEnergy(available: Energy, cost: Partial<Energy>): Energy {
  const result = { ...available };
  
  // Spend specific costs
  for (const [type, amount] of Object.entries(cost)) {
    if (type === 'random') continue;
    const typeKey = type as keyof Energy;
    result[typeKey] = Math.max(0, (result[typeKey] || 0) - (amount || 0));
  }
  
  // Spend random from whatever's available
  let randomNeeded = cost.random || 0;
  const types: (keyof Energy)[] = ['fire', 'water', 'grass', 'electric'];
  
  for (const type of types) {
    if (randomNeeded <= 0) break;
    const spend = Math.min(result[type], randomNeeded);
    result[type] -= spend;
    randomNeeded -= spend;
  }
  
  return result;
}

export function isHelpful(effect: Effect): boolean {
  const helpfulTypes: EffectType[] = [
    'heal', 'healOverTime', 'strengthen', 'reduce', 'invulnerable',
    'reflect', 'counter', 'endure', 'enrage', 'focus', 'cooldownReduce',
    'costReduce', 'bypass'
  ];
  return helpfulTypes.includes(effect.type);
}

export function isStunned(character: BattleCharacter, skillClass: SkillClass): boolean {
  return character.cachedEffects.stunned.includes(skillClass) ||
         character.cachedEffects.stunned.includes('All');
}

export function isInvulnerable(character: BattleCharacter, skillClass: SkillClass): boolean {
  return character.cachedEffects.invulnerable.includes(skillClass) ||
         character.cachedEffects.invulnerable.includes('All');
}
