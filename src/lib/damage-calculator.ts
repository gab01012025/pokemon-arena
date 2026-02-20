/**
 * Pokemon Damage Calculator
 * Based on Smogon's damage-calc (https://github.com/smogon/damage-calc)
 * 
 * This implements the official Pokemon damage formula used in the games
 */

import { PokemonType } from '@/types/game';
import { 
  getTypeEffectiveness, 
  STAB_MULTIPLIER,
  CRITICAL_HIT_MULTIPLIER,
  CRITICAL_HIT_CHANCE 
} from './type-effectiveness';

// ==================== CONSTANTS ====================

// Weather effects
export type Weather = 'clear' | 'sun' | 'rain' | 'sand' | 'hail' | 'snow';

// Terrain effects  
export type Terrain = 'none' | 'electric' | 'grassy' | 'misty' | 'psychic';

// Move categories
export type MoveCategory = 'physical' | 'special' | 'status';

// ==================== INTERFACES ====================

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface StatModifiers {
  attack: number;  // -6 to +6
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  accuracy: number;
  evasion: number;
}

export interface BattlePokemonState {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: PokemonStats;
  level: number;
  currentHp: number;
  maxHp: number;
  statModifiers: StatModifiers;
  status?: 'burn' | 'paralysis' | 'poison' | 'toxic' | 'freeze' | 'sleep';
  ability?: string;
  item?: string;
  isCriticalHitStage: number; // 0-3
  isTerastallized?: boolean;
  teraType?: PokemonType;
}

export interface MoveData {
  name: string;
  type: PokemonType;
  category: MoveCategory;
  basePower: number;
  accuracy: number | null; // null = always hits
  pp: number;
  priority: number;
  makesContact: boolean;
  isMultiHit?: { min: number; max: number };
  drain?: number; // % of damage healed
  recoil?: number; // % of damage as recoil
  critRatio?: number; // 1 = normal, 2 = high crit, 3 = always crits
  ignoresDefense?: boolean;
  ignoresEvasion?: boolean;
  effectChance?: number;
  effect?: string;
}

export interface DamageCalcResult {
  minDamage: number;
  maxDamage: number;
  averageDamage: number;
  damageRolls: number[]; // All 16 possible damage values
  critMinDamage: number;
  critMaxDamage: number;
  minPercent: number;
  maxPercent: number;
  isCrit: boolean;
  typeEffectiveness: number;
  isSTAB: boolean;
  effectivenessText: string;
  koChance: {
    chance: number;
    hits: number;
  };
}

// ==================== STAT CALCULATION ====================

/**
 * Get stat modifier multiplier (Gen 3+)
 * Stage -6: 2/8, -5: 2/7, -4: 2/6, -3: 2/5, -2: 2/4, -1: 2/3
 * Stage 0: 2/2
 * Stage +1: 3/2, +2: 4/2, +3: 5/2, +4: 6/2, +5: 7/2, +6: 8/2
 */
export function getStatModifier(stage: number): number {
  stage = Math.max(-6, Math.min(6, stage));
  
  if (stage >= 0) {
    return (2 + stage) / 2;
  } else {
    return 2 / (2 - stage);
  }
}

/**
 * Calculate effective stat with modifiers
 */
export function getEffectiveStat(
  baseStat: number,
  stage: number,
  isHp: boolean = false
): number {
  if (isHp) return baseStat; // HP can't be modified by stages
  
  const modifier = getStatModifier(stage);
  return Math.floor(baseStat * modifier);
}

/**
 * Calculate HP stat (different formula)
 */
export function calculateHP(base: number, level: number, iv: number = 31, ev: number = 0): number {
  if (base === 1) return 1; // Shedinja
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

/**
 * Calculate other stats
 */
export function calculateStat(
  base: number, 
  level: number, 
  nature: number = 1, // 0.9, 1, or 1.1
  iv: number = 31, 
  ev: number = 0
): number {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature);
}

// ==================== DAMAGE CALCULATION ====================

/**
 * Main damage calculation function
 * Based on the official Pokemon damage formula
 * 
 * Damage = ((((2 × Level / 5 + 2) × Power × A / D) / 50) + 2) × Modifiers
 */
export function calculateDamage(
  attacker: BattlePokemonState,
  defender: BattlePokemonState,
  move: MoveData,
  options: {
    weather?: Weather;
    terrain?: Terrain;
    isCrit?: boolean;
    isMultiBattle?: boolean;
    otherMods?: number;
  } = {}
): DamageCalcResult {
  // Status moves don't deal damage
  if (move.category === 'status' || move.basePower === 0) {
    return createNoDamageResult(defender);
  }
  
  const { weather = 'clear', terrain = 'none', isCrit = false } = options;
  
  // Determine attacking and defending stats
  const isPhysical = move.category === 'physical';
  const attackStat = isPhysical ? 'attack' : 'spAtk';
  const defenseStat = isPhysical ? 'defense' : 'spDef';
  
  // Get base stats
  let attack = attacker.baseStats[attackStat];
  let defense = defender.baseStats[defenseStat];
  
  // Apply stat stages
  const attackStage = attacker.statModifiers[attackStat];
  const defenseStage = defender.statModifiers[defenseStat];
  
  // Critical hits ignore negative attack stages and positive defense stages
  if (isCrit) {
    attack = getEffectiveStat(attack, Math.max(0, attackStage));
    defense = getEffectiveStat(defense, Math.min(0, defenseStage));
  } else {
    attack = getEffectiveStat(attack, attackStage);
    defense = getEffectiveStat(defense, defenseStage);
  }
  
  // Calculate base damage
  const level = attacker.level;
  const basePower = move.basePower;
  
  const baseDamage = Math.floor(
    Math.floor(
      Math.floor((2 * level) / 5 + 2) * basePower * attack / defense
    ) / 50
  ) + 2;
  
  // Apply modifiers
  const modifiers = calculateModifiers(attacker, defender, move, {
    weather,
    terrain,
    isCrit,
    isMultiBattle: options.isMultiBattle,
  });
  
  // Calculate damage rolls (random factor: 85-100%)
  const damageRolls: number[] = [];
  for (let roll = 85; roll <= 100; roll++) {
    let damage = Math.floor(baseDamage * roll / 100);
    
    // Apply all modifiers
    damage = applyModifiers(damage, modifiers);
    
    damageRolls.push(Math.max(1, damage));
  }
  
  // Calculate crit damage rolls
  const critModifiers = { ...modifiers, critMod: CRITICAL_HIT_MULTIPLIER };
  const critDamageRolls: number[] = [];
  for (let roll = 85; roll <= 100; roll++) {
    let damage = Math.floor(baseDamage * roll / 100);
    damage = applyModifiers(damage, critModifiers);
    critDamageRolls.push(Math.max(1, damage));
  }
  
  const minDamage = Math.min(...damageRolls);
  const maxDamage = Math.max(...damageRolls);
  const averageDamage = Math.floor(damageRolls.reduce((a, b) => a + b, 0) / damageRolls.length);
  
  return {
    minDamage,
    maxDamage,
    averageDamage,
    damageRolls,
    critMinDamage: Math.min(...critDamageRolls),
    critMaxDamage: Math.max(...critDamageRolls),
    minPercent: (minDamage / defender.maxHp) * 100,
    maxPercent: (maxDamage / defender.maxHp) * 100,
    isCrit: isCrit || checkCriticalHit(attacker, move),
    typeEffectiveness: modifiers.typeMod,
    isSTAB: modifiers.stabMod > 1,
    effectivenessText: getEffectivenessText(modifiers.typeMod),
    koChance: calculateKOChance(damageRolls, defender.currentHp),
  };
}

interface DamageModifiers {
  weatherMod: number;
  stabMod: number;
  typeMod: number;
  burnMod: number;
  critMod: number;
  otherMod: number;
}

function calculateModifiers(
  attacker: BattlePokemonState,
  defender: BattlePokemonState,
  move: MoveData,
  options: { weather?: Weather; terrain?: Terrain; isCrit?: boolean; isMultiBattle?: boolean }
): DamageModifiers {
  const { weather = 'clear', isCrit = false } = options;
  
  // Weather modifier
  let weatherMod = 1;
  if (weather === 'sun') {
    if (move.type === 'Fire') weatherMod = 1.5;
    if (move.type === 'Water') weatherMod = 0.5;
  } else if (weather === 'rain') {
    if (move.type === 'Water') weatherMod = 1.5;
    if (move.type === 'Fire') weatherMod = 0.5;
  }
  
  // STAB (Same Type Attack Bonus)
  let stabMod = 1;
  const attackerTypes = attacker.isTerastallized && attacker.teraType 
    ? [attacker.teraType] 
    : attacker.types;
  if (attackerTypes.includes(move.type)) {
    stabMod = STAB_MULTIPLIER;
    // Adaptability ability would make this 2.0
    if (attacker.ability === 'adaptability') {
      stabMod = 2.0;
    }
  }
  
  // Type effectiveness
  const typeMod = getTypeEffectiveness(move.type, defender.types);
  
  // Burn modifier (halves physical attack damage, except with Guts)
  let burnMod = 1;
  if (attacker.status === 'burn' && move.category === 'physical' && attacker.ability !== 'guts') {
    burnMod = 0.5;
  }
  
  // Critical hit modifier
  const critMod = isCrit ? CRITICAL_HIT_MULTIPLIER : 1;
  
  // Other modifiers (items, abilities, etc.)
  let otherMod = 1;
  
  // Life Orb
  if (attacker.item === 'life-orb') {
    otherMod *= 1.3;
  }
  
  // Choice items
  if (attacker.item === 'choice-band' && move.category === 'physical') {
    otherMod *= 1.5;
  }
  if (attacker.item === 'choice-specs' && move.category === 'special') {
    otherMod *= 1.5;
  }
  
  // Expert Belt on super effective
  if (attacker.item === 'expert-belt' && typeMod > 1) {
    otherMod *= 1.2;
  }
  
  return {
    weatherMod,
    stabMod,
    typeMod,
    burnMod,
    critMod,
    otherMod,
  };
}

function applyModifiers(damage: number, mods: DamageModifiers): number {
  // Apply in the correct order (important for rounding)
  damage = Math.floor(damage * mods.weatherMod);
  damage = Math.floor(damage * mods.critMod);
  damage = Math.floor(damage * mods.stabMod);
  damage = Math.floor(damage * mods.typeMod);
  damage = Math.floor(damage * mods.burnMod);
  damage = Math.floor(damage * mods.otherMod);
  
  return damage;
}

function checkCriticalHit(attacker: BattlePokemonState, move: MoveData): boolean {
  // Critical hit stages: 0 = 1/24, 1 = 1/8, 2 = 1/2, 3+ = always
  const critStage = attacker.isCriticalHitStage + (move.critRatio || 0);
  
  if (critStage >= 3) return true;
  
  const critChances = [1/24, 1/8, 1/2, 1];
  const chance = critChances[Math.min(critStage, 3)];
  
  return Math.random() < chance;
}

function calculateKOChance(damageRolls: number[], defenderHp: number): { chance: number; hits: number } {
  const koCount = damageRolls.filter(d => d >= defenderHp).length;
  const ohkoChance = koCount / damageRolls.length;
  
  if (ohkoChance > 0) {
    return { chance: ohkoChance * 100, hits: 1 };
  }
  
  // Check 2HKO
  let twoHitKOs = 0;
  for (const roll1 of damageRolls) {
    for (const roll2 of damageRolls) {
      if (roll1 + roll2 >= defenderHp) {
        twoHitKOs++;
      }
    }
  }
  const twoHkoChance = twoHitKOs / (damageRolls.length * damageRolls.length);
  
  if (twoHkoChance > 0) {
    return { chance: twoHkoChance * 100, hits: 2 };
  }
  
  // Estimate hits to KO
  const avgDamage = damageRolls.reduce((a, b) => a + b, 0) / damageRolls.length;
  const hitsToKO = Math.ceil(defenderHp / avgDamage);
  
  return { chance: 100, hits: hitsToKO };
}

function getEffectivenessText(multiplier: number): string {
  if (multiplier === 0) return "Não afeta...";
  if (multiplier === 0.25) return "Não é muito efetivo... (1/4)";
  if (multiplier === 0.5) return "Não é muito efetivo...";
  if (multiplier === 2) return "É super efetivo!";
  if (multiplier === 4) return "É super efetivo! (4x)";
  return "";
}

function createNoDamageResult(_defender: BattlePokemonState): DamageCalcResult {
  return {
    minDamage: 0,
    maxDamage: 0,
    averageDamage: 0,
    damageRolls: [0],
    critMinDamage: 0,
    critMaxDamage: 0,
    minPercent: 0,
    maxPercent: 0,
    isCrit: false,
    typeEffectiveness: 1,
    isSTAB: false,
    effectivenessText: "",
    koChance: { chance: 0, hits: Infinity },
  };
}

// ==================== QUICK DAMAGE CALCULATION ====================

/**
 * Simplified damage calculation for arena-style battles
 * Uses a simplified formula more suitable for Naruto Arena style gameplay
 */
export function calculateArenaDamage(
  baseDamage: number,
  attackType: PokemonType,
  attackerTypes: PokemonType[],
  defenderTypes: PokemonType[],
  options: {
    forceCrit?: boolean;
    ignoreTypeChart?: boolean;
    damageBonus?: number;
    damageReduction?: number;
  } = {}
): {
  damage: number;
  isCrit: boolean;
  typeMultiplier: number;
  effectivenessText: string;
} {
  const { forceCrit = false, ignoreTypeChart = false, damageBonus = 0, damageReduction = 0 } = options;
  
  // Type effectiveness
  const typeMultiplier = ignoreTypeChart ? 1 : getTypeEffectiveness(attackType, defenderTypes);
  
  // STAB bonus
  const stabMultiplier = attackerTypes.includes(attackType) ? STAB_MULTIPLIER : 1;
  
  // Critical hit
  const isCrit = forceCrit || Math.random() < CRITICAL_HIT_CHANCE;
  const critMultiplier = isCrit ? CRITICAL_HIT_MULTIPLIER : 1;
  
  // Random factor (85-100%)
  const randomFactor = 0.85 + Math.random() * 0.15;
  
  // Calculate final damage
  let damage = baseDamage;
  damage *= typeMultiplier;
  damage *= stabMultiplier;
  damage *= critMultiplier;
  damage *= randomFactor;
  damage += damageBonus;
  damage -= damageReduction;
  damage = Math.max(1, Math.floor(damage));
  
  return {
    damage,
    isCrit,
    typeMultiplier,
    effectivenessText: getEffectivenessText(typeMultiplier),
  };
}

// ==================== SPEED CALCULATION ====================

/**
 * Determine turn order based on speed
 */
export function getSpeedOrder(
  pokemon: BattlePokemonState[],
  moves: { pokemon: BattlePokemonState; move: MoveData }[]
): { pokemon: BattlePokemonState; move: MoveData }[] {
  return moves.sort((a, b) => {
    // Priority moves go first
    if (a.move.priority !== b.move.priority) {
      return b.move.priority - a.move.priority;
    }
    
    // Then by speed
    const speedA = getEffectiveStat(a.pokemon.baseStats.speed, a.pokemon.statModifiers.speed);
    const speedB = getEffectiveStat(b.pokemon.baseStats.speed, b.pokemon.statModifiers.speed);
    
    // Paralysis halves speed
    const finalSpeedA = a.pokemon.status === 'paralysis' ? speedA / 2 : speedA;
    const finalSpeedB = b.pokemon.status === 'paralysis' ? speedB / 2 : speedB;
    
    if (finalSpeedA !== finalSpeedB) {
      return finalSpeedB - finalSpeedA;
    }
    
    // Speed tie: random
    return Math.random() - 0.5;
  });
}

// ==================== ACCURACY CALCULATION ====================

/**
 * Calculate if a move hits
 */
export function checkAccuracy(
  attacker: BattlePokemonState,
  defender: BattlePokemonState,
  move: MoveData
): boolean {
  // Moves with null accuracy always hit
  if (move.accuracy === null) return true;
  
  // Get accuracy and evasion stages
  const accStage = attacker.statModifiers.accuracy;
  const evaStage = defender.statModifiers.evasion;
  
  // Calculate effective stage (capped at -6 to +6)
  let effectiveStage = accStage - evaStage;
  effectiveStage = Math.max(-6, Math.min(6, effectiveStage));
  
  // Stage multipliers for accuracy/evasion
  let stageMultiplier: number;
  if (effectiveStage >= 0) {
    stageMultiplier = (3 + effectiveStage) / 3;
  } else {
    stageMultiplier = 3 / (3 - effectiveStage);
  }
  
  const finalAccuracy = move.accuracy * stageMultiplier;
  
  return Math.random() * 100 < finalAccuracy;
}

const damageCalculator = {
  calculateDamage,
  calculateArenaDamage,
  getSpeedOrder,
  checkAccuracy,
  getStatModifier,
  getEffectiveStat,
  calculateHP,
  calculateStat,
};

export default damageCalculator;
