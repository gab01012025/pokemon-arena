/**
 * Pokemon Arena - Advanced Battle Mechanics
 * Counter, Reflect, Piercing, Skill Class Interactions
 * Based on Naruto Arena mechanics
 */

import { 
  BattlePokemon, 
  Move, 
  StatusEffect, 
  SkillClass, 
  EffectType 
} from '@/types/game';
import { calculateDamage, DamageResult } from './type-effectiveness';

// ==================== SKILL CLASS INTERACTIONS ====================

/**
 * Check if a skill bypasses counter effects
 * Ranged, Special, and Bypassing skills ignore counter
 */
export function bypassesCounter(move: Move): boolean {
  const bypassClasses: SkillClass[] = ['Ranged', 'Special', 'Bypassing'];
  return move.classes.some(c => bypassClasses.includes(c));
}

/**
 * Check if a skill bypasses reflect effects
 * Mental (Psychic type), Unreflectable skills ignore reflect
 */
export function bypassesReflect(move: Move): boolean {
  if (move.classes.includes('Unreflectable')) return true;
  // Psychic type moves are considered "mental" and bypass reflect
  if (move.type === 'Psychic') return true;
  return false;
}

/**
 * Check if a skill triggers counter (Contact/Physical moves)
 */
export function triggersCounter(move: Move): boolean {
  const triggerClasses: SkillClass[] = ['Contact', 'Physical'];
  return move.classes.some(c => triggerClasses.includes(c)) && !bypassesCounter(move);
}

/**
 * Check if a skill can be reflected
 */
export function canBeReflected(move: Move): boolean {
  return !bypassesReflect(move) && move.damage > 0;
}

/**
 * Check if a skill bypasses invulnerability and damage reduction
 */
export function bypassesDefense(move: Move): boolean {
  return move.classes.includes('Bypassing');
}

/**
 * Check if a skill has priority (goes first)
 */
export function hasPriority(move: Move): boolean {
  return move.classes.includes('Priority');
}

/**
 * Check if a skill is invisible (hidden until used)
 */
export function isInvisible(move: Move): boolean {
  return move.classes.includes('Invisible');
}

/**
 * Check if an effect can be removed/cleansed
 */
export function canBeRemoved(effect: StatusEffect): boolean {
  return !effect.classes.includes('Unremovable');
}

// ==================== COUNTER SYSTEM ====================

export interface CounterResult {
  triggered: boolean;
  damage: number;
  message: string;
}

/**
 * Process counter effect when a Pokemon is attacked
 * Counter returns physical damage to the attacker
 */
export function processCounter(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move,
  damageDealt: number
): CounterResult {
  // Check if move triggers counter
  if (!triggersCounter(move)) {
    return { triggered: false, damage: 0, message: '' };
  }

  // Check if defender has counter effect active
  const counterEffect = defender.effects.find(e => e.type === 'counter');
  if (!counterEffect) {
    return { triggered: false, damage: 0, message: '' };
  }

  // Counter damage is either fixed value or percentage of damage received
  const counterDamage = counterEffect.value > 0 
    ? counterEffect.value 
    : Math.floor(damageDealt * 0.5); // 50% of damage dealt if no value specified

  return {
    triggered: true,
    damage: counterDamage,
    message: `${defender.name}'s counter deals ${counterDamage} damage to ${attacker.name}!`
  };
}

// ==================== REFLECT SYSTEM ====================

export interface ReflectResult {
  reflected: boolean;
  damage: number;
  effects: StatusEffect[];
  message: string;
}

/**
 * Process reflect effect - reflects the skill back to the attacker
 */
export function processReflect(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move,
  damageResult: DamageResult
): ReflectResult {
  // Check if move can be reflected
  if (!canBeReflected(move)) {
    return { reflected: false, damage: 0, effects: [], message: '' };
  }

  // Check if defender has reflect effect active
  const reflectEffect = defender.effects.find(e => e.type === 'reflect');
  if (!reflectEffect) {
    return { reflected: false, damage: 0, effects: [], message: '' };
  }

  // Reflect the full damage back
  const reflectedDamage = damageResult.finalDamage;

  // Also reflect any negative status effects
  const reflectedEffects = move.effects
    .filter(e => ['stun', 'burn', 'poison', 'paralyze', 'freeze', 'sleep', 'weaken'].includes(e.type))
    .map(e => ({
      id: `reflected-${e.type}-${Date.now()}`,
      name: `Reflected ${e.type}`,
      type: e.type as EffectType,
      value: e.value || 0,
      duration: e.duration || 1,
      source: defender.id,
      classes: [] as SkillClass[],
    }));

  return {
    reflected: true,
    damage: reflectedDamage,
    effects: reflectedEffects,
    message: `${defender.name} reflects ${move.name} back to ${attacker.name} for ${reflectedDamage} damage!`
  };
}

// ==================== COMPLETE DAMAGE CALCULATION ====================

export interface FullDamageResult {
  finalDamage: number;
  damageToAttacker: number;
  wasReflected: boolean;
  wasCountered: boolean;
  wasPiercing: boolean;
  wasInvulnerable: boolean;
  typeMultiplier: number;
  isCritical: boolean;
  messages: string[];
}

/**
 * Calculate complete damage with all mechanics
 */
export function calculateFullDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move
): FullDamageResult {
  const messages: string[] = [];
  let damageToDefender = 0;
  let damageToAttacker = 0;
  let wasReflected = false;
  let wasCountered = false;
  let wasPiercing = false;
  let wasInvulnerable = false;

  // Check if attacker is stunned
  if (attacker.effects.some(e => e.type === 'stun')) {
    messages.push(`${attacker.name} is stunned and can't move!`);
    return {
      finalDamage: 0,
      damageToAttacker: 0,
      wasReflected: false,
      wasCountered: false,
      wasPiercing: false,
      wasInvulnerable: false,
      typeMultiplier: 1,
      isCritical: false,
      messages
    };
  }

  // Calculate base damage with type effectiveness
  const damageResult = calculateDamage(
    move.damage,
    move.type,
    attacker.types,
    defender.types
  );

  // Apply strengthen bonus
  const strengthBonus = attacker.effects
    .filter(e => e.type === 'strengthen')
    .reduce((sum, e) => sum + e.value, 0);

  // Apply weaken penalty to attacker
  const weakenPenalty = attacker.effects
    .filter(e => e.type === 'weaken')
    .reduce((sum, e) => sum + e.value, 0);

  let baseDamage = damageResult.finalDamage + strengthBonus - weakenPenalty;
  baseDamage = Math.max(0, baseDamage);

  // Check for piercing/bypassing
  wasPiercing = bypassesDefense(move);

  // Check invulnerability (unless piercing)
  if (!wasPiercing && defender.effects.some(e => e.type === 'invulnerable')) {
    wasInvulnerable = true;
    messages.push(`${defender.name} is invulnerable!`);
    return {
      finalDamage: 0,
      damageToAttacker: 0,
      wasReflected: false,
      wasCountered: false,
      wasPiercing: false,
      wasInvulnerable: true,
      typeMultiplier: damageResult.typeMultiplier,
      isCritical: damageResult.isCritical,
      messages
    };
  }

  // Check for reflect first (before damage reduction)
  const reflectResult = processReflect(attacker, defender, move, damageResult);
  if (reflectResult.reflected) {
    wasReflected = true;
    damageToAttacker = reflectResult.damage;
    damageToDefender = 0;
    messages.push(reflectResult.message);
  } else {
    // Apply damage reduction (unless piercing)
    if (!wasPiercing) {
      const damageReduction = defender.effects
        .filter(e => e.type === 'reduce')
        .reduce((sum, e) => sum + e.value, 0);
      baseDamage = Math.max(0, baseDamage - damageReduction);
    }

    // Apply expose (target takes more damage)
    const exposeBonus = defender.effects
      .filter(e => e.type === 'expose')
      .reduce((sum, e) => sum + e.value, 0);
    baseDamage += exposeBonus;

    damageToDefender = baseDamage;

    // Add effectiveness message
    if (damageResult.effectivenessMessage) {
      messages.push(damageResult.effectivenessMessage);
    }

    // Add critical message
    if (damageResult.isCritical) {
      messages.push('A critical hit!');
    }

    // Check for counter after damage is dealt
    const counterResult = processCounter(attacker, defender, move, damageToDefender);
    if (counterResult.triggered) {
      wasCountered = true;
      damageToAttacker = counterResult.damage;
      messages.push(counterResult.message);
    }
  }

  if (wasPiercing && damageToDefender > 0) {
    messages.push(`${move.name} pierces through defenses!`);
  }

  return {
    finalDamage: damageToDefender,
    damageToAttacker,
    wasReflected,
    wasCountered,
    wasPiercing,
    wasInvulnerable,
    typeMultiplier: damageResult.typeMultiplier,
    isCritical: damageResult.isCritical,
    messages
  };
}

// ==================== PRIORITY ORDERING ====================

export interface BattleAction {
  pokemonId: string;
  moveIndex: number;
  targetIds: string[];
  priority: number;
}

/**
 * Sort actions by priority (Priority moves first, then by speed/random)
 */
export function sortActionsByPriority(
  actions: BattleAction[],
  allPokemon: BattlePokemon[]
): BattleAction[] {
  return [...actions].sort((a, b) => {
    const pokemonA = allPokemon.find(p => p.id === a.pokemonId);
    const pokemonB = allPokemon.find(p => p.id === b.pokemonId);
    
    if (!pokemonA || !pokemonB) return 0;

    const moveA = pokemonA.moves[a.moveIndex];
    const moveB = pokemonB.moves[b.moveIndex];

    if (!moveA || !moveB) return 0;

    // Priority moves go first
    const priorityA = hasPriority(moveA) ? 1 : 0;
    const priorityB = hasPriority(moveB) ? 1 : 0;

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }

    // Random tiebreaker
    return Math.random() - 0.5;
  });
}

// ==================== STATUS EFFECT APPLICATION ====================

/**
 * Apply status effect to a Pokemon
 */
export function applyStatusEffect(
  target: BattlePokemon,
  effect: StatusEffect
): BattlePokemon {
  // Check for immunity based on type
  // Fire types can't be burned
  if (effect.type === 'burn' && target.types.includes('Fire')) {
    return target;
  }
  // Electric types can't be paralyzed
  if (effect.type === 'paralyze' && target.types.includes('Electric')) {
    return target;
  }
  // Ice types can't be frozen
  if (effect.type === 'freeze' && target.types.includes('Ice')) {
    return target;
  }
  // Poison/Steel types can't be poisoned
  if (effect.type === 'poison' && (target.types.includes('Poison') || target.types.includes('Steel'))) {
    return target;
  }

  // Check if already has this effect type (non-stackable status)
  const nonStackable: EffectType[] = ['burn', 'poison', 'paralyze', 'freeze', 'sleep', 'stun'];
  if (nonStackable.includes(effect.type)) {
    const hasStatus = target.effects.some(e => nonStackable.includes(e.type));
    if (hasStatus) {
      return target; // Can't apply another major status
    }
  }

  return {
    ...target,
    effects: [...target.effects, effect]
  };
}

// ==================== EFFECT DURATION MANAGEMENT ====================

/**
 * Decrement effect durations and remove expired effects
 */
export function processEffectDurations(pokemon: BattlePokemon): BattlePokemon {
  const updatedEffects = pokemon.effects
    .map(e => ({ ...e, duration: e.duration - 1 }))
    .filter(e => e.duration > 0);

  return {
    ...pokemon,
    effects: updatedEffects
  };
}

/**
 * Process cooldowns at end of turn
 */
export function processCooldowns(pokemon: BattlePokemon): BattlePokemon {
  const updatedCooldowns = pokemon.cooldowns.map(cd => Math.max(0, cd - 1));
  return {
    ...pokemon,
    cooldowns: updatedCooldowns
  };
}

// ==================== ABSORB/LIFESTEAL ====================

/**
 * Calculate healing from absorb effects
 */
export function calculateAbsorb(
  attacker: BattlePokemon,
  damageDealt: number,
  move: Move
): number {
  // Check if move has absorb effect
  const absorbEffect = move.effects.find(e => e.type === 'absorb');
  if (!absorbEffect) return 0;

  // Absorb percentage (default 50%)
  const absorbPercent = absorbEffect.value || 50;
  const healing = Math.floor(damageDealt * (absorbPercent / 100));

  return Math.min(healing, attacker.maxHealth - attacker.currentHealth);
}

// ==================== ENRAGE SYSTEM ====================

/**
 * Process enrage effect - damage increases when hit
 */
export function processEnrage(pokemon: BattlePokemon, damageTaken: number): BattlePokemon {
  const enrageEffect = pokemon.effects.find(e => e.type === 'enrage');
  if (!enrageEffect) return pokemon;

  // Each time damaged, add to strengthen
  const enrageBonus = Math.floor(damageTaken * 0.1); // 10% of damage taken as bonus
  
  const existingStrengthen = pokemon.effects.find(e => e.type === 'strengthen');
  if (existingStrengthen) {
    return {
      ...pokemon,
      effects: pokemon.effects.map(e => 
        e.type === 'strengthen' 
          ? { ...e, value: e.value + enrageBonus }
          : e
      )
    };
  }

  return {
    ...pokemon,
    effects: [...pokemon.effects, {
      id: `enrage-strengthen-${Date.now()}`,
      name: 'Enrage Bonus',
      type: 'strengthen' as EffectType,
      value: enrageBonus,
      duration: enrageEffect.duration,
      source: pokemon.id,
      classes: [] as SkillClass[]
    }]
  };
}
