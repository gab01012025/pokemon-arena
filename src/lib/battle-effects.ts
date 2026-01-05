/**
 * Pokemon Arena - Battle Effects System
 * Inspired by Naruto Arena's effect mechanics
 * 
 * This module handles all status effects, damage modifiers, and special mechanics
 */

import { EffectType, SkillClass, StatusEffect } from '@/types/game';

// ==================== EFFECT CATEGORIES ====================

/**
 * Effect categories for targeting and processing
 */
export type EffectCategory = 
  | 'Harmful'     // Negative effects (damage, debuffs)
  | 'Helpful'     // Positive effects (heal, buffs)
  | 'Control'     // Movement/action restriction (stun, snare)
  | 'Defensive'   // Protection effects (invulnerable, reduce)
  | 'Offensive';  // Damage modifiers (strengthen, expose)

/**
 * Get the category of an effect type
 */
export function getEffectCategory(type: EffectType): EffectCategory {
  switch (type) {
    case 'damage':
    case 'afflict':
    case 'pierce':
    case 'poison':
    case 'burn':
      return 'Harmful';
    
    case 'heal':
    case 'absorb':
      return 'Helpful';
    
    case 'stun':
    case 'paralyze':
    case 'freeze':
    case 'sleep':
    case 'confuse':
      return 'Control';
    
    case 'invulnerable':
    case 'reduce':
    case 'counter':
    case 'reflect':
      return 'Defensive';
    
    case 'strengthen':
    case 'weaken':
    case 'expose':
    case 'enrage':
    case 'reveal':
    case 'tag':
      return 'Offensive';
    
    default:
      return 'Harmful';
  }
}

// ==================== EFFECT PROCESSING ====================

export interface EffectResult {
  type: EffectType;
  value: number;
  blocked: boolean;
  message: string;
}

/**
 * Check if a character is immune to harmful effects
 */
export function isImmune(
  targetEffects: StatusEffect[],
  incomingType: EffectType,
  incomingClasses: SkillClass[]
): boolean {
  // Check for general invulnerability
  const hasInvuln = targetEffects.some(e => e.type === 'invulnerable');
  if (hasInvuln && getEffectCategory(incomingType) === 'Harmful') {
    return true;
  }
  
  // Check for class-specific invulnerability
  for (const effect of targetEffects) {
    if (effect.type === 'invulnerable' && effect.classes) {
      const blockedClasses = effect.classes;
      if (incomingClasses.some(c => blockedClasses.includes(c))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Calculate damage after applying all modifiers
 * Based on Naruto Arena's formula system
 */
export function calculateModifiedDamage(
  baseDamage: number,
  attackerEffects: StatusEffect[],
  defenderEffects: StatusEffect[],
  moveClasses: SkillClass[],
  isPiercing: boolean = false
): { finalDamage: number; breakdown: DamageBreakdown } {
  let damage = baseDamage;
  const breakdown: DamageBreakdown = {
    base: baseDamage,
    strengthenBonus: 0,
    weakenPenalty: 0,
    bleedBonus: 0,
    reducePenalty: 0,
    exposedBonus: 0,
    final: 0,
  };
  
  // === ATTACKER MODIFIERS ===
  
  // Strengthen: Increases outgoing damage (flat + percent)
  const strengthenFlat = attackerEffects
    .filter(e => e.type === 'strengthen')
    .reduce((sum, e) => sum + (e.value || 0), 0);
  
  const strengthenPercent = attackerEffects
    .filter(e => e.type === 'strengthen' && e.name?.includes('%'))
    .reduce((sum, e) => sum + (e.value || 0) / 100, 0);
  
  breakdown.strengthenBonus = strengthenFlat + Math.floor(damage * strengthenPercent);
  damage += breakdown.strengthenBonus;
  
  // Weaken: Decreases outgoing damage
  const weakenFlat = attackerEffects
    .filter(e => e.type === 'weaken')
    .reduce((sum, e) => sum + (e.value || 0), 0);
  
  breakdown.weakenPenalty = weakenFlat;
  damage -= breakdown.weakenPenalty;
  
  // === DEFENDER MODIFIERS ===
  
  // Reduce: Decreases incoming damage (ignored by Pierce)
  if (!isPiercing) {
    const reduceFlat = defenderEffects
      .filter(e => e.type === 'reduce')
      .reduce((sum, e) => sum + (e.value || 0), 0);
    
    breakdown.reducePenalty = reduceFlat;
    damage -= breakdown.reducePenalty;
  }
  
  // Expose: Increases incoming damage (cannot reduce/become invulnerable)
  const exposedFlat = defenderEffects
    .filter(e => e.type === 'expose')
    .reduce((sum, e) => sum + (e.value || 0), 0);
  
  breakdown.exposedBonus = exposedFlat;
  damage += breakdown.exposedBonus;
  
  // Bleed: Increases damage taken from certain sources
  const bleedFlat = defenderEffects
    .filter(e => e.name === 'Bleed')
    .reduce((sum, e) => sum + (e.value || 0), 0);
  
  if (moveClasses.includes('Physical')) {
    breakdown.bleedBonus = bleedFlat;
    damage += breakdown.bleedBonus;
  }
  
  // Minimum damage is 0
  breakdown.final = Math.max(0, damage);
  
  return { finalDamage: breakdown.final, breakdown };
}

export interface DamageBreakdown {
  base: number;
  strengthenBonus: number;
  weakenPenalty: number;
  bleedBonus: number;
  reducePenalty: number;
  exposedBonus: number;
  final: number;
}

// ==================== DESTRUCTIBLE DEFENSE ====================

export interface Defense {
  id: string;
  name: string;
  amount: number;
  duration: number;
  source: string;
}

/**
 * Apply damage to destructible defense first, then health
 * Returns remaining damage after defense is depleted
 */
export function applyDamageToDefense(
  damage: number,
  defenses: Defense[]
): { remainingDamage: number; updatedDefenses: Defense[] } {
  let remainingDamage = damage;
  const updatedDefenses: Defense[] = [];
  
  for (const defense of defenses) {
    if (remainingDamage <= 0) {
      updatedDefenses.push(defense);
      continue;
    }
    
    if (defense.amount > remainingDamage) {
      // Defense absorbs all damage
      updatedDefenses.push({
        ...defense,
        amount: defense.amount - remainingDamage,
      });
      remainingDamage = 0;
    } else {
      // Defense is destroyed
      remainingDamage -= defense.amount;
      // Don't add to updated defenses - it's gone
    }
  }
  
  return { remainingDamage, updatedDefenses };
}

// ==================== STUN MECHANICS ====================

export type StunType = 'All' | 'Physical' | 'Special' | 'Status' | 'Mental';

/**
 * Check if a character can use a skill based on stun effects
 */
export function canUseSkill(
  characterEffects: StatusEffect[],
  skillClasses: SkillClass[]
): { canUse: boolean; reason?: string } {
  // Check for complete stun
  const fullStun = characterEffects.find(e => 
    e.type === 'stun' && (!e.classes || e.classes.length === 0)
  );
  
  if (fullStun) {
    return { canUse: false, reason: 'Stunned' };
  }
  
  // Check for class-specific stuns
  for (const effect of characterEffects) {
    if (effect.type === 'stun' && effect.classes) {
      const blockedClasses = effect.classes;
      if (skillClasses.some(c => blockedClasses.includes(c))) {
        return { canUse: false, reason: `${blockedClasses.join('/')} skills are stunned` };
      }
    }
  }
  
  // Check sleep/freeze/paralyze
  const hasControlEffect = characterEffects.some(e => 
    e.type === 'sleep' || e.type === 'freeze'
  );
  
  if (hasControlEffect) {
    return { canUse: false, reason: 'Cannot act' };
  }
  
  // Paralyze has chance to fail
  const hasParalyze = characterEffects.some(e => e.type === 'paralyze');
  if (hasParalyze && Math.random() < 0.25) {
    return { canUse: false, reason: 'Paralyzed' };
  }
  
  return { canUse: true };
}

// ==================== HEALING MECHANICS ====================

/**
 * Calculate healing after modifiers
 */
export function calculateHealing(
  baseHealing: number,
  targetEffects: StatusEffect[],
  healerEffects: StatusEffect[]
): number {
  let healing = baseHealing;
  
  // Check for anti-healing effects (like "Plague" in Naruto Arena)
  const hasAntiHeal = targetEffects.some(e => 
    e.name === 'Plague' || e.name === 'Heal Block'
  );
  
  if (hasAntiHeal) {
    return 0;
  }
  
  // Bless: Increases healing received
  const blessBonus = healerEffects
    .filter(e => e.name === 'Bless')
    .reduce((sum, e) => sum + (e.value || 0), 0);
  
  healing += blessBonus;
  
  return Math.max(0, healing);
}

// ==================== DAMAGE OVER TIME ====================

export interface DotResult {
  type: EffectType;
  damage: number;
  source: string;
}

/**
 * Process all damage-over-time effects
 */
export function processDamageOverTime(effects: StatusEffect[]): DotResult[] {
  const results: DotResult[] = [];
  
  for (const effect of effects) {
    if (['afflict', 'burn', 'poison'].includes(effect.type)) {
      results.push({
        type: effect.type,
        damage: effect.value,
        source: effect.source,
      });
    }
  }
  
  return results;
}

// ==================== COUNTER/REFLECT MECHANICS ====================

/**
 * Check if an attack should be countered
 */
export function checkCounter(
  defenderEffects: StatusEffect[],
  attackClasses: SkillClass[]
): { countered: boolean; counterEffect?: StatusEffect } {
  for (const effect of defenderEffects) {
    if (effect.type === 'counter') {
      // Check if counter matches attack classes
      if (!effect.classes || effect.classes.length === 0) {
        return { countered: true, counterEffect: effect };
      }
      
      if (attackClasses.some(c => effect.classes?.includes(c))) {
        return { countered: true, counterEffect: effect };
      }
    }
  }
  
  return { countered: false };
}

/**
 * Check if an attack should be reflected
 */
export function checkReflect(
  defenderEffects: StatusEffect[],
  attackClasses: SkillClass[]
): { reflected: boolean; reflectEffect?: StatusEffect } {
  for (const effect of defenderEffects) {
    if (effect.type === 'reflect') {
      // Check if reflect matches attack classes
      if (!effect.classes || effect.classes.length === 0) {
        return { reflected: true, reflectEffect: effect };
      }
      
      if (attackClasses.some(c => effect.classes?.includes(c))) {
        return { reflected: true, reflectEffect: effect };
      }
    }
  }
  
  return { reflected: false };
}

// ==================== EFFECT DURATION PROCESSING ====================

/**
 * Decrement all effect durations and remove expired ones
 */
export function processEffectDurations(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map(effect => ({
      ...effect,
      duration: effect.duration - 1,
    }))
    .filter(effect => effect.duration > 0);
}

// ==================== EFFECT APPLICATION ====================

/**
 * Apply a new effect to a character, handling stacking rules
 */
export function applyEffect(
  currentEffects: StatusEffect[],
  newEffect: StatusEffect,
  stackable: boolean = false
): StatusEffect[] {
  if (stackable) {
    return [...currentEffects, newEffect];
  }
  
  // Check if effect already exists from same source
  const existingIndex = currentEffects.findIndex(e => 
    e.name === newEffect.name && e.source === newEffect.source
  );
  
  if (existingIndex >= 0) {
    // Refresh duration
    const updated = [...currentEffects];
    updated[existingIndex] = {
      ...updated[existingIndex],
      duration: Math.max(updated[existingIndex].duration, newEffect.duration),
      value: Math.max(updated[existingIndex].value, newEffect.value),
    };
    return updated;
  }
  
  return [...currentEffects, newEffect];
}

/**
 * Remove effects by name and/or source
 */
export function removeEffects(
  effects: StatusEffect[],
  name?: string,
  source?: string
): StatusEffect[] {
  return effects.filter(e => {
    if (name && source) {
      return e.name !== name || e.source !== source;
    }
    if (name) {
      return e.name !== name;
    }
    if (source) {
      return e.source !== source;
    }
    return true;
  });
}

/**
 * Remove all harmful effects (cure)
 */
export function cureHarmfulEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter(e => {
    const category = getEffectCategory(e.type);
    return category !== 'Harmful' && category !== 'Control';
  });
}

/**
 * Remove all helpful effects (purge)
 */
export function purgeHelpfulEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter(e => {
    const category = getEffectCategory(e.type);
    return category !== 'Helpful' && category !== 'Defensive';
  });
}

// ==================== THRESHOLD MECHANICS ====================

/**
 * Check if damage passes threshold (minimum damage needed to affect target)
 */
export function checkDamageThreshold(
  damage: number,
  targetEffects: StatusEffect[]
): boolean {
  const threshold = targetEffects
    .filter(e => e.name === 'Threshold')
    .reduce((max, e) => Math.max(max, e.value), 0);
  
  return damage > threshold;
}
