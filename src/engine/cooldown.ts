/**
 * Pokémon Arena - Battle Engine Cooldown Management
 * 
 * Pure functions for managing skill cooldowns and charges.
 * Based on naruto-unison's Game.Engine.Cooldown module.
 */

import type { Fighter, Skill } from './types';
import { skillKey } from './types';
import { getSnare } from './effects';

// =============================================================================
// COOLDOWN MANAGEMENT
// =============================================================================

/**
 * Alter (add/subtract) cooldown for a specific skill
 */
export function alterCooldown(
  fighter: Fighter,
  skillName: string,
  owner: number,
  change: number
): Fighter {
  const key = `${skillName}:${owner}`;
  const cooldowns = new Map(fighter.cooldowns);
  const current = cooldowns.get(key) ?? 0;
  const newValue = Math.max(0, current + change);
  
  if (newValue > 0) {
    cooldowns.set(key, newValue);
  } else {
    cooldowns.delete(key);
  }
  
  return { ...fighter, cooldowns };
}

/**
 * Set cooldown when a skill is used.
 * Takes into account snare effects that increase cooldowns.
 * 
 * Formula from naruto-unison:
 * cd = max 0 $ sync (Skill.cooldown skill) + 2 + 2 * Effects.snare n
 * 
 * The sync function converts duration to turns (divide by 2 and add 1 if odd)
 * The +2 accounts for the current turn and the opponent's turn
 */
export function updateCooldown(fighter: Fighter, skill: Skill): Fighter {
  if (skill.cooldown <= 0) {
    return fighter; // No cooldown to set
  }
  
  const key = skillKey(skill);
  const snare = getSnare(fighter);
  
  // Calculate cooldown: base cooldown + 2 (for turn system) + snare bonus
  // In Naruto Arena, cooldowns are synced to the 2-turn cycle
  const cd = Math.max(0, skill.cooldown + 2 + (2 * snare));
  
  const cooldowns = new Map(fighter.cooldowns);
  cooldowns.set(key, cd);
  
  return { ...fighter, cooldowns };
}

/**
 * Spend a charge when using a limited-use skill
 */
export function spendCharge(fighter: Fighter, skill: Skill): Fighter {
  if (skill.charges <= 0) {
    return fighter; // Skill has unlimited uses
  }
  
  const key = skillKey(skill);
  const charges = new Map(fighter.charges);
  const current = charges.get(key) ?? 0;
  charges.set(key, current + 1);
  
  return { ...fighter, charges };
}

/**
 * Reset cooldown for a specific skill to 0
 */
export function resetCooldown(
  fighter: Fighter,
  skillName: string,
  owner: number
): Fighter {
  const key = `${skillName}:${owner}`;
  const cooldowns = new Map(fighter.cooldowns);
  cooldowns.delete(key);
  
  return { ...fighter, cooldowns };
}

/**
 * Reset all cooldowns to 0
 */
export function resetAllCooldowns(fighter: Fighter): Fighter {
  return { ...fighter, cooldowns: new Map() };
}

/**
 * Decrement all cooldowns by 1 (called at end of turn)
 */
export function decrementCooldowns(fighter: Fighter): Fighter {
  const cooldowns = new Map<string, number>();
  
  for (const [key, value] of fighter.cooldowns) {
    const newValue = value - 1;
    if (newValue > 0) {
      cooldowns.set(key, newValue);
    }
    // Don't add if <= 0 (cooldown finished)
  }
  
  return { ...fighter, cooldowns };
}

/**
 * Get current cooldown for a skill
 */
export function getCooldown(fighter: Fighter, skill: Skill): number {
  return fighter.cooldowns.get(skillKey(skill)) ?? 0;
}

/**
 * Get charges used for a skill
 */
export function getChargesUsed(fighter: Fighter, skill: Skill): number {
  return fighter.charges.get(skillKey(skill)) ?? 0;
}

/**
 * Get remaining charges for a skill
 */
export function getRemainingCharges(fighter: Fighter, skill: Skill): number {
  if (skill.charges <= 0) {
    return Infinity; // Unlimited
  }
  
  return Math.max(0, skill.charges - getChargesUsed(fighter, skill));
}

/**
 * Check if a skill is on cooldown
 */
export function isOnCooldown(fighter: Fighter, skill: Skill): boolean {
  return getCooldown(fighter, skill) > 0;
}

/**
 * Check if a skill has charges remaining
 */
export function hasCharges(fighter: Fighter, skill: Skill): boolean {
  return getRemainingCharges(fighter, skill) > 0;
}

/**
 * Check if a skill is usable (not on cooldown and has charges)
 */
export function isSkillAvailable(fighter: Fighter, skill: Skill): boolean {
  return !isOnCooldown(fighter, skill) && hasCharges(fighter, skill);
}
