/**
 * Pokemon Type Effectiveness System
 * Based on official Pokemon type chart (Gen 6+)
 */

import { PokemonType } from '@/types/game';

// Type effectiveness multipliers
export const SUPER_EFFECTIVE = 2.0;
export const NOT_VERY_EFFECTIVE = 0.5;
export const NO_EFFECT = 0;
export const NORMAL = 1.0;

// STAB (Same Type Attack Bonus)
export const STAB_MULTIPLIER = 1.5;

// Critical hit mechanics
export const CRITICAL_HIT_CHANCE = 0.0625; // 6.25% = 1/16
export const CRITICAL_HIT_MULTIPLIER = 1.5;

/**
 * Complete Pokemon Type Chart
 * Key = Attacking type
 * Value = Map of defending type to effectiveness
 */
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Normal: {
    Rock: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Ghost: NO_EFFECT,
  },
  Fire: {
    Fire: NOT_VERY_EFFECTIVE,
    Water: NOT_VERY_EFFECTIVE,
    Rock: NOT_VERY_EFFECTIVE,
    Dragon: NOT_VERY_EFFECTIVE,
    Grass: SUPER_EFFECTIVE,
    Ice: SUPER_EFFECTIVE,
    Bug: SUPER_EFFECTIVE,
    Steel: SUPER_EFFECTIVE,
  },
  Water: {
    Water: NOT_VERY_EFFECTIVE,
    Grass: NOT_VERY_EFFECTIVE,
    Dragon: NOT_VERY_EFFECTIVE,
    Fire: SUPER_EFFECTIVE,
    Ground: SUPER_EFFECTIVE,
    Rock: SUPER_EFFECTIVE,
  },
  Electric: {
    Electric: NOT_VERY_EFFECTIVE,
    Grass: NOT_VERY_EFFECTIVE,
    Dragon: NOT_VERY_EFFECTIVE,
    Water: SUPER_EFFECTIVE,
    Flying: SUPER_EFFECTIVE,
    Ground: NO_EFFECT,
  },
  Grass: {
    Fire: NOT_VERY_EFFECTIVE,
    Grass: NOT_VERY_EFFECTIVE,
    Poison: NOT_VERY_EFFECTIVE,
    Flying: NOT_VERY_EFFECTIVE,
    Bug: NOT_VERY_EFFECTIVE,
    Dragon: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Water: SUPER_EFFECTIVE,
    Ground: SUPER_EFFECTIVE,
    Rock: SUPER_EFFECTIVE,
  },
  Ice: {
    Fire: NOT_VERY_EFFECTIVE,
    Water: NOT_VERY_EFFECTIVE,
    Ice: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Grass: SUPER_EFFECTIVE,
    Ground: SUPER_EFFECTIVE,
    Flying: SUPER_EFFECTIVE,
    Dragon: SUPER_EFFECTIVE,
  },
  Fighting: {
    Poison: NOT_VERY_EFFECTIVE,
    Flying: NOT_VERY_EFFECTIVE,
    Psychic: NOT_VERY_EFFECTIVE,
    Bug: NOT_VERY_EFFECTIVE,
    Fairy: NOT_VERY_EFFECTIVE,
    Normal: SUPER_EFFECTIVE,
    Ice: SUPER_EFFECTIVE,
    Rock: SUPER_EFFECTIVE,
    Dark: SUPER_EFFECTIVE,
    Steel: SUPER_EFFECTIVE,
    Ghost: NO_EFFECT,
  },
  Poison: {
    Poison: NOT_VERY_EFFECTIVE,
    Ground: NOT_VERY_EFFECTIVE,
    Rock: NOT_VERY_EFFECTIVE,
    Ghost: NOT_VERY_EFFECTIVE,
    Grass: SUPER_EFFECTIVE,
    Fairy: SUPER_EFFECTIVE,
    Steel: NO_EFFECT,
  },
  Ground: {
    Grass: NOT_VERY_EFFECTIVE,
    Bug: NOT_VERY_EFFECTIVE,
    Fire: SUPER_EFFECTIVE,
    Electric: SUPER_EFFECTIVE,
    Poison: SUPER_EFFECTIVE,
    Rock: SUPER_EFFECTIVE,
    Steel: SUPER_EFFECTIVE,
    Flying: NO_EFFECT,
  },
  Flying: {
    Electric: NOT_VERY_EFFECTIVE,
    Rock: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Grass: SUPER_EFFECTIVE,
    Fighting: SUPER_EFFECTIVE,
    Bug: SUPER_EFFECTIVE,
  },
  Psychic: {
    Psychic: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Fighting: SUPER_EFFECTIVE,
    Poison: SUPER_EFFECTIVE,
    Dark: NO_EFFECT,
  },
  Bug: {
    Fire: NOT_VERY_EFFECTIVE,
    Fighting: NOT_VERY_EFFECTIVE,
    Poison: NOT_VERY_EFFECTIVE,
    Flying: NOT_VERY_EFFECTIVE,
    Ghost: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Fairy: NOT_VERY_EFFECTIVE,
    Grass: SUPER_EFFECTIVE,
    Psychic: SUPER_EFFECTIVE,
    Dark: SUPER_EFFECTIVE,
  },
  Rock: {
    Fighting: NOT_VERY_EFFECTIVE,
    Ground: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Fire: SUPER_EFFECTIVE,
    Ice: SUPER_EFFECTIVE,
    Flying: SUPER_EFFECTIVE,
    Bug: SUPER_EFFECTIVE,
  },
  Ghost: {
    Dark: NOT_VERY_EFFECTIVE,
    Psychic: SUPER_EFFECTIVE,
    Ghost: SUPER_EFFECTIVE,
    Normal: NO_EFFECT,
  },
  Dragon: {
    Steel: NOT_VERY_EFFECTIVE,
    Dragon: SUPER_EFFECTIVE,
    Fairy: NO_EFFECT,
  },
  Dark: {
    Fighting: NOT_VERY_EFFECTIVE,
    Dark: NOT_VERY_EFFECTIVE,
    Fairy: NOT_VERY_EFFECTIVE,
    Psychic: SUPER_EFFECTIVE,
    Ghost: SUPER_EFFECTIVE,
  },
  Steel: {
    Fire: NOT_VERY_EFFECTIVE,
    Water: NOT_VERY_EFFECTIVE,
    Electric: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Ice: SUPER_EFFECTIVE,
    Rock: SUPER_EFFECTIVE,
    Fairy: SUPER_EFFECTIVE,
  },
  Fairy: {
    Fire: NOT_VERY_EFFECTIVE,
    Poison: NOT_VERY_EFFECTIVE,
    Steel: NOT_VERY_EFFECTIVE,
    Fighting: SUPER_EFFECTIVE,
    Dragon: SUPER_EFFECTIVE,
    Dark: SUPER_EFFECTIVE,
  },
};

/**
 * Calculate type effectiveness multiplier
 * @param attackType - The type of the move being used
 * @param defenderTypes - Array of the defending Pokemon's types
 * @returns Multiplier (0, 0.25, 0.5, 1, 2, or 4)
 */
export function getTypeEffectiveness(
  attackType: PokemonType,
  defenderTypes: PokemonType[]
): number {
  let multiplier = NORMAL;
  
  for (const defType of defenderTypes) {
    const chart = TYPE_CHART[attackType];
    if (chart && chart[defType] !== undefined) {
      multiplier *= chart[defType]!;
    }
  }
  
  return multiplier;
}

/**
 * Check if attacker gets STAB bonus
 * @param attackType - The type of the move
 * @param attackerTypes - Array of the attacker's types
 * @returns true if STAB applies
 */
export function hasSTAB(attackType: PokemonType, attackerTypes: PokemonType[]): boolean {
  return attackerTypes.includes(attackType);
}

/**
 * Roll for critical hit
 * @returns true if critical hit
 */
export function rollCriticalHit(): boolean {
  return Math.random() < CRITICAL_HIT_CHANCE;
}

/**
 * Get effectiveness message for UI
 */
export function getEffectivenessMessage(multiplier: number): string {
  if (multiplier === 0) return "It doesn't affect...";
  if (multiplier < 1) return "It's not very effective...";
  if (multiplier > 1) return "It's super effective!";
  return "";
}

/**
 * Get type color for UI
 */
export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: '#A8A878',
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Grass: '#78C850',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Psychic: '#F85888',
  Bug: '#A8B820',
  Rock: '#B8A038',
  Ghost: '#705898',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Fairy: '#EE99AC',
};

/**
 * Get type icon/emoji for UI
 */
export const TYPE_ICONS: Record<PokemonType, string> = {
  Normal: '⬜',
  Fire: '🔥',
  Water: '💧',
  Electric: '⚡',
  Grass: '🌿',
  Ice: '❄️',
  Fighting: '🥊',
  Poison: '☠️',
  Ground: '🏜️',
  Flying: '🕊️',
  Psychic: '🔮',
  Bug: '🐛',
  Rock: '🪨',
  Ghost: '👻',
  Dragon: '🐲',
  Dark: '🌙',
  Steel: '⚙️',
  Fairy: '✨',
};

/**
 * Calculate complete damage with all modifiers
 */
export interface DamageResult {
  baseDamage: number;
  typeMultiplier: number;
  stabMultiplier: number;
  criticalMultiplier: number;
  finalDamage: number;
  isCritical: boolean;
  effectivenessMessage: string;
}

export function calculateDamage(
  baseDamage: number,
  attackType: PokemonType,
  attackerTypes: PokemonType[],
  defenderTypes: PokemonType[],
  forceCrit: boolean = false
): DamageResult {
  const typeMultiplier = getTypeEffectiveness(attackType, defenderTypes);
  const stabMultiplier = hasSTAB(attackType, attackerTypes) ? STAB_MULTIPLIER : NORMAL;
  const isCritical = forceCrit || rollCriticalHit();
  const criticalMultiplier = isCritical ? CRITICAL_HIT_MULTIPLIER : NORMAL;
  
  const finalDamage = Math.floor(
    baseDamage * typeMultiplier * stabMultiplier * criticalMultiplier
  );
  
  return {
    baseDamage,
    typeMultiplier,
    stabMultiplier,
    criticalMultiplier,
    finalDamage,
    isCritical,
    effectivenessMessage: getEffectivenessMessage(typeMultiplier),
  };
}
