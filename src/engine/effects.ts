/**
 * Pokémon Arena - Battle Engine Effects
 * 
 * Pure functions for processing effects on fighters.
 * Based on naruto-unison's Game.Engine.Effects module.
 */

import type { 
  Fighter, 
  Effect, 
  EffectType, 
  SkillClass, 
  Status,
  BattleState,
  Player
} from './types';
import { isPlayerSlot, areAllies } from './types';

// =============================================================================
// EFFECT QUERIES
// =============================================================================

/**
 * Get all active effects of a specific type on a fighter
 */
export function getEffectsOfType(fighter: Fighter, type: EffectType): Effect[] {
  return fighter.effects.filter(e => e.type === type);
}

/**
 * Check if fighter has a specific effect type
 */
export function hasEffect(fighter: Fighter, type: EffectType): boolean {
  return fighter.effects.some(e => e.type === type);
}

/**
 * Check if fighter has a specific named status
 */
export function hasStatus(fighter: Fighter, name: string, source?: number): boolean {
  return fighter.statuses.some(s => 
    s.name === name && (source === undefined || s.source === source)
  );
}

/**
 * Count stacks of a status
 */
export function getStacks(fighter: Fighter, name: string, source?: number): number {
  return fighter.statuses
    .filter(s => s.name === name && (source === undefined || s.source === source))
    .reduce((sum, s) => sum + s.stacks, 0);
}

/**
 * Count stacks of own statuses (self-applied)
 */
export function getOwnStacks(fighter: Fighter, name: string): number {
  return getStacks(fighter, name, fighter.slot);
}

/**
 * Check if fighter is alive
 */
export function isAlive(fighter: Fighter): boolean {
  return fighter.health > 0;
}

// =============================================================================
// STUN / DISABLE CHECKS
// =============================================================================

/**
 * Get all stun effects affecting a fighter
 */
export function getStunEffects(fighter: Fighter): Effect[] {
  return fighter.effects.filter(e => e.type === 'stun');
}

/**
 * Get all skill classes that the fighter is stunned from using
 */
export function getStunnedClasses(fighter: Fighter): Set<SkillClass> {
  const stunned = new Set<SkillClass>();
  
  for (const effect of getStunEffects(fighter)) {
    for (const cls of effect.classes) {
      stunned.add(cls);
    }
  }
  
  return stunned;
}

/**
 * Check if a fighter can use a skill of given classes
 */
export function canUseSkillClass(fighter: Fighter, classes: SkillClass[]): boolean {
  // Check Focus effect - ignores stuns
  if (hasEffect(fighter, 'bypass')) { // Focus equivalent
    return true;
  }
  
  const stunnedClasses = getStunnedClasses(fighter);
  
  // 'all' stun means completely stunned
  if (stunnedClasses.has('all')) {
    return false;
  }
  
  // Check if any of the skill's classes are stunned
  for (const cls of classes) {
    if (stunnedClasses.has(cls)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if fighter is silenced (can't apply non-damage effects)
 */
export function isSilenced(fighter: Fighter): boolean {
  return hasEffect(fighter, 'silence');
}

// =============================================================================
// SNARE / COOLDOWN MODIFIERS
// =============================================================================

/**
 * Get total snare amount on a fighter (increases cooldowns)
 */
export function getSnare(fighter: Fighter): number {
  return getEffectsOfType(fighter, 'snare')
    .reduce((sum, e) => sum + e.value, 0);
}

// =============================================================================
// INVULNERABILITY CHECKS
// =============================================================================

/**
 * Get all invulnerability effects on a fighter
 */
export function getInvulnerabilities(fighter: Fighter): Effect[] {
  return getEffectsOfType(fighter, 'invulnerable');
}

/**
 * Check if fighter is invulnerable to a skill of given classes
 */
export function isInvulnerable(fighter: Fighter, skillClasses: SkillClass[]): boolean {
  // Check Expose effect - cannot be invulnerable
  if (hasEffect(fighter, 'expose')) {
    return false;
  }
  
  const invulns = getInvulnerabilities(fighter);
  
  for (const invuln of invulns) {
    // 'all' invulnerability blocks everything
    if (invuln.classes.includes('all')) {
      return true;
    }
    
    // Check if skill classes match invulnerability classes
    for (const skillClass of skillClasses) {
      if (invuln.classes.includes(skillClass)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a skill bypasses invulnerability
 */
export function bypassesInvulnerability(fighter: Fighter, skillClasses: SkillClass[]): boolean {
  // Skill is bypassing
  if (skillClasses.includes('bypassing')) {
    return true;
  }
  
  // Fighter has bypass effect
  if (hasEffect(fighter, 'bypass')) {
    return true;
  }
  
  return false;
}

// =============================================================================
// DAMAGE CALCULATIONS
// =============================================================================

/**
 * Calculate total damage reduction for incoming damage
 */
export function getDamageReduction(
  fighter: Fighter, 
  damageClasses: SkillClass[], 
  isAffliction: boolean
): number {
  // Expose negates all reduction
  if (hasEffect(fighter, 'expose')) {
    return 0;
  }
  
  const reductions = getEffectsOfType(fighter, 'reduce');
  let totalReduction = 0;
  
  for (const reduce of reductions) {
    // Check if reduction applies to this damage class
    const applies = reduce.classes.includes('all') || 
      damageClasses.some(dc => reduce.classes.includes(dc));
    
    // Affliction damage ignores normal reduction
    // Unless the reduction specifically includes affliction class
    if (isAffliction && !reduce.classes.includes('affliction')) {
      continue;
    }
    
    if (applies) {
      if (reduce.amountType === 'flat') {
        totalReduction += reduce.value;
      } else {
        // Percent reduction handled separately
        totalReduction += reduce.value; // Simplified - should be multiplicative
      }
    }
  }
  
  return totalReduction;
}

/**
 * Calculate total damage bonus from strengthen effects
 */
export function getDamageBonus(
  fighter: Fighter,
  damageClasses: SkillClass[]
): number {
  const strengthens = getEffectsOfType(fighter, 'strengthen');
  let totalBonus = 0;
  
  for (const strengthen of strengthens) {
    const applies = strengthen.classes.includes('all') ||
      damageClasses.some(dc => strengthen.classes.includes(dc));
    
    if (applies) {
      if (strengthen.amountType === 'flat') {
        totalBonus += strengthen.value;
      } else {
        totalBonus += strengthen.value; // Simplified
      }
    }
  }
  
  return totalBonus;
}

/**
 * Calculate total damage penalty from weaken effects
 */
export function getDamagePenalty(
  fighter: Fighter,
  damageClasses: SkillClass[]
): number {
  const weakens = getEffectsOfType(fighter, 'weaken');
  let totalPenalty = 0;
  
  for (const weaken of weakens) {
    const applies = weaken.classes.includes('all') ||
      damageClasses.some(dc => weaken.classes.includes(dc));
    
    if (applies) {
      if (weaken.amountType === 'flat') {
        totalPenalty += weaken.value;
      }
    }
  }
  
  return totalPenalty;
}

/**
 * Calculate additional damage taken from bleed effects
 */
export function getBleedDamage(
  fighter: Fighter,
  damageClasses: SkillClass[]
): number {
  const bleeds = getEffectsOfType(fighter, 'bleed');
  let totalBleed = 0;
  
  for (const bleed of bleeds) {
    const applies = bleed.classes.includes('all') ||
      damageClasses.some(dc => bleed.classes.includes(dc));
    
    if (applies) {
      totalBleed += bleed.value;
    }
  }
  
  return totalBleed;
}

/**
 * Get damage limit (maximum damage that can be taken)
 */
export function getDamageLimit(fighter: Fighter): number | null {
  const limits = getEffectsOfType(fighter, 'limit');
  if (limits.length === 0) return null;
  
  // Return the lowest limit
  return Math.min(...limits.map(l => l.value));
}

/**
 * Get damage threshold (minimum damage to affect target)
 */
export function getDamageThreshold(fighter: Fighter): number {
  const thresholds = getEffectsOfType(fighter, 'threshold');
  if (thresholds.length === 0) return 0;
  
  // Return the highest threshold
  return Math.max(...thresholds.map(t => t.value));
}

/**
 * Calculate final damage after all modifiers
 */
export function calculateDamage(
  attacker: Fighter,
  defender: Fighter,
  baseDamage: number,
  damageClasses: SkillClass[],
  isPiercing: boolean,
  isAffliction: boolean
): number {
  // Start with base damage
  let damage = baseDamage;
  
  // Add strengthen bonus
  damage += getDamageBonus(attacker, damageClasses);
  
  // Subtract weaken penalty
  damage -= getDamagePenalty(attacker, damageClasses);
  
  // Ensure damage doesn't go negative from weaken
  damage = Math.max(0, damage);
  
  // Add bleed bonus to incoming damage
  damage += getBleedDamage(defender, damageClasses);
  
  // Check threshold - if damage below threshold, it's nullified
  const threshold = getDamageThreshold(defender);
  if (baseDamage <= threshold) {
    return 0;
  }
  
  // Apply reduction (unless piercing or affliction)
  if (!isPiercing && !isAffliction) {
    const reduction = getDamageReduction(defender, damageClasses, isAffliction);
    damage -= reduction;
  }
  
  // Apply limit
  const limit = getDamageLimit(defender);
  if (limit !== null) {
    damage = Math.min(damage, limit);
  }
  
  // Ensure damage doesn't go negative
  return Math.max(0, damage);
}

// =============================================================================
// DEFENSE CALCULATIONS
// =============================================================================

/**
 * Get total destructible defense
 */
export function getTotalDefense(fighter: Fighter): number {
  return fighter.defense.reduce((sum, d) => sum + d.amount, 0);
}

/**
 * Get total barrier amount
 */
export function getTotalBarrier(fighter: Fighter): number {
  return fighter.barrier.reduce((sum, b) => sum + b.amount, 0);
}

/**
 * Apply damage to destructible defense first, then health
 * Returns { remainingDamage, newDefenses }
 */
export function applyDamageToDefense(
  fighter: Fighter,
  damage: number
): { remainingDamage: number; newDefenses: typeof fighter.defense } {
  let remaining = damage;
  const newDefenses = [...fighter.defense];
  
  // Apply damage to each defense in order
  for (let i = 0; i < newDefenses.length && remaining > 0; i++) {
    const defense = newDefenses[i];
    if (defense.amount >= remaining) {
      newDefenses[i] = { ...defense, amount: defense.amount - remaining };
      remaining = 0;
    } else {
      remaining -= defense.amount;
      newDefenses[i] = { ...defense, amount: 0 };
    }
  }
  
  // Remove depleted defenses
  const filteredDefenses = newDefenses.filter(d => d.amount > 0);
  
  return { remainingDamage: remaining, newDefenses: filteredDefenses };
}

// =============================================================================
// HEAL CALCULATIONS
// =============================================================================

/**
 * Get heal bonus from bless effects
 */
export function getHealBonus(fighter: Fighter): number {
  // Look for bless-like effects (stored as strengthen with heal context)
  // In our simplified model, we don't have a specific bless effect
  return 0;
}

/**
 * Check if fighter can be healed (not plagued)
 */
export function canBeHealed(fighter: Fighter): boolean {
  return !hasEffect(fighter, 'plague');
}

/**
 * Calculate final healing amount
 */
export function calculateHealing(
  healer: Fighter,
  target: Fighter,
  baseHealing: number
): number {
  if (!canBeHealed(target)) {
    return 0;
  }
  
  let healing = baseHealing + getHealBonus(healer);
  
  // Don't overheal
  const maxHeal = target.maxHealth - target.health;
  return Math.min(healing, maxHeal);
}

// =============================================================================
// HP OVER TIME
// =============================================================================

/**
 * Calculate total afflict damage per turn
 */
export function getAfflictDamage(fighter: Fighter): number {
  return getEffectsOfType(fighter, 'afflict')
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Calculate total heal per turn
 */
export function getHealPerTurn(fighter: Fighter): number {
  if (!canBeHealed(fighter)) {
    return 0;
  }
  
  return getEffectsOfType(fighter, 'heal')
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Calculate net HP change per turn (positive = damage, negative = heal)
 */
export function getHpOverTime(fighter: Fighter): number {
  return getAfflictDamage(fighter) - getHealPerTurn(fighter);
}

// =============================================================================
// COUNTER / REFLECT CHECKS
// =============================================================================

/**
 * Check if fighter has a counter ready
 */
export function hasCounter(fighter: Fighter): boolean {
  return hasEffect(fighter, 'counter');
}

/**
 * Check if fighter can reflect the skill
 */
export function canReflect(fighter: Fighter, skillClasses: SkillClass[]): boolean {
  if (skillClasses.includes('unreflectable')) {
    return false;
  }
  
  return hasEffect(fighter, 'reflect');
}

/**
 * Get redirect target if any
 */
export function getRedirectTarget(fighter: Fighter): number | null {
  const redirects = getEffectsOfType(fighter, 'redirect');
  if (redirects.length === 0) return null;
  
  // Return the source of the redirect (who to redirect to)
  return redirects[0].source;
}

// =============================================================================
// EFFECT MODIFIERS
// =============================================================================

/**
 * Compile active effects from statuses
 */
export function compileEffects(statuses: Status[]): Effect[] {
  const effects: Effect[] = [];
  
  for (const status of statuses) {
    for (const effect of status.effects) {
      effects.push(effect);
    }
  }
  
  return effects;
}

/**
 * Decrement duration of all effects, remove expired ones
 */
export function decrementEffects(statuses: Status[]): Status[] {
  return statuses
    .map(status => ({
      ...status,
      duration: status.duration > 0 ? status.duration - 1 : status.duration,
      effects: status.effects.map(e => ({
        ...e,
        duration: e.duration > 0 ? e.duration - 1 : e.duration,
      })).filter(e => e.duration !== 0),
    }))
    .filter(s => s.duration !== 0 && s.effects.length > 0);
}

/**
 * Remove harmful effects (cure)
 */
export function cure(statuses: Status[], cureHidden: boolean = false): Status[] {
  return statuses.filter(s => {
    // Keep helpful statuses
    if (s.effects.every(e => e.helpful)) {
      return true;
    }
    
    // Keep non-removable
    if (!s.removable) {
      return true;
    }
    
    // Keep hidden unless specifically curing hidden
    if (!s.visible && !cureHidden) {
      return true;
    }
    
    // Remove harmful
    return false;
  });
}

/**
 * Remove all statuses from a specific source
 */
export function clearFromSource(statuses: Status[], source: number): Status[] {
  return statuses.filter(s => s.source !== source);
}

/**
 * Count helpful effects from allies (not self)
 */
export function countHelpfulFromAllies(fighter: Fighter): number {
  let count = 0;
  
  for (const status of fighter.statuses) {
    if (status.source === fighter.slot) continue; // Skip self
    if (!areAllies(fighter.slot, status.source)) continue; // Skip enemies
    if (!status.visible) continue; // Skip hidden
    
    for (const effect of status.effects) {
      if (effect.helpful) {
        count += status.stacks;
      }
    }
  }
  
  return count;
}

/**
 * Count harmful effects from others
 */
export function countHarmful(fighter: Fighter): number {
  let count = 0;
  
  for (const status of fighter.statuses) {
    if (status.source === fighter.slot) continue; // Skip self
    if (!status.visible) continue; // Skip hidden
    
    for (const effect of status.effects) {
      if (!effect.helpful) {
        count += status.stacks;
      }
    }
  }
  
  return count;
}

// =============================================================================
// ENDURE CHECK
// =============================================================================

/**
 * Get minimum health (1 if Endure, 0 otherwise)
 */
export function getMinHealth(fighter: Fighter): number {
  return hasEffect(fighter, 'endure') ? 1 : 0;
}

/**
 * Adjust health respecting Endure effect
 */
export function adjustHealth(fighter: Fighter, change: number): number {
  const newHealth = fighter.health + change;
  const minHealth = getMinHealth(fighter);
  
  return Math.max(minHealth, Math.min(fighter.maxHealth, newHealth));
}
