// ==========================================
// POKÉMON ARENA - PROGRESSION SYSTEM
// XP, Levels, Unlocks, Card Packs, Quests
// Loop: Play → Earn XP → Level Up → Unlock Pokémon → Want to test → Play more
// ==========================================

// ==========================================
// XP & LEVEL SYSTEM
// Formula: XP needed = floor(level² × 20)
// ==========================================

export function xpForLevel(level: number): number {
  return Math.floor(level * level * 20);
}

/** Total cumulative XP needed to reach a given level */
export function totalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/** Calculate current level from total XP */
export function levelFromTotalXP(totalXP: number): { level: number; currentLevelXP: number; xpNeeded: number; progress: number } {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const needed = xpForLevel(level);
  return {
    level,
    currentLevelXP: remaining,
    xpNeeded: needed,
    progress: needed > 0 ? remaining / needed : 0,
  };
}

// ==========================================
// XP REWARDS
// ==========================================

export interface BattleXPParams {
  won: boolean;
  isPvP: boolean;
  streak: number;
  isFirstBattleOfDay: boolean;
  playerLevel: number;
  opponentLevel: number;
  surrendered?: boolean;
}

export function calculateBattleXP(params: BattleXPParams): { baseXP: number; streakBonus: number; firstDayBonus: number; totalXP: number } {
  const { won, isPvP, streak, isFirstBattleOfDay, playerLevel, opponentLevel, surrendered } = params;

  let baseXP: number;

  if (won) {
    if (isPvP) {
      // PvP win: 50 base + level difference bonus
      baseXP = 50;
      const levelDiff = opponentLevel - playerLevel;
      if (levelDiff > 0) baseXP += levelDiff * 10;
      else if (levelDiff < 0) baseXP = Math.max(20, baseXP + levelDiff * 5);
    } else {
      // AI win: 25 base
      baseXP = 25;
    }
  } else {
    // Loss: 10 XP
    baseXP = surrendered ? 5 : 10;
  }

  // Streak bonus: +5% per win in streak (max +50%)
  const streakMultiplier = won && streak > 1 ? Math.min((streak - 1) * 0.05, 0.5) : 0;
  const streakBonus = Math.floor(baseXP * streakMultiplier);

  // First battle of the day: +50%
  const firstDayBonus = isFirstBattleOfDay ? Math.floor(baseXP * 0.5) : 0;

  return {
    baseXP,
    streakBonus,
    firstDayBonus,
    totalXP: baseXP + streakBonus + firstDayBonus,
  };
}

/** Check if this is the first battle of the day */
export function isFirstBattleOfDay(lastBattleDate: Date | null): boolean {
  if (!lastBattleDate) return true;
  const now = new Date();
  const last = new Date(lastBattleDate);
  return now.toDateString() !== last.toDateString();
}

// ==========================================
// POKEMON UNLOCK SYSTEM
// ==========================================

export type UnlockMethod = 'starter' | 'level' | 'streak' | 'achievement' | 'pack' | 'mission';

export interface PokemonUnlockDef {
  pokemonName: string;
  method: UnlockMethod;
  requirement: number | string; // level number, streak number, or achievement code
  description: string;
}

// Starter pool: Free from the start
export const STARTER_POKEMON = [
  'Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Eevee',
];

// Level-based unlocks
export const LEVEL_UNLOCKS: PokemonUnlockDef[] = [
  { pokemonName: 'Typhlosion',  method: 'level', requirement: 3,  description: 'Reach Level 3' },
  { pokemonName: 'Feraligatr',  method: 'level', requirement: 3,  description: 'Reach Level 3' },
  { pokemonName: 'Meganium',    method: 'level', requirement: 3,  description: 'Reach Level 3' },
  { pokemonName: 'Gengar',      method: 'level', requirement: 5,  description: 'Reach Level 5' },
  { pokemonName: 'Alakazam',    method: 'level', requirement: 5,  description: 'Reach Level 5' },
  { pokemonName: 'Machamp',     method: 'level', requirement: 5,  description: 'Reach Level 5' },
  { pokemonName: 'Arcanine',    method: 'level', requirement: 7,  description: 'Reach Level 7' },
  { pokemonName: 'Exeggutor',   method: 'level', requirement: 7,  description: 'Reach Level 7' },
  { pokemonName: 'Golem',       method: 'level', requirement: 7,  description: 'Reach Level 7' },
  { pokemonName: 'Nidoking',    method: 'level', requirement: 7,  description: 'Reach Level 7' },
  { pokemonName: 'Vaporeon',    method: 'level', requirement: 10, description: 'Reach Level 10' },
  { pokemonName: 'Jolteon',     method: 'level', requirement: 10, description: 'Reach Level 10' },
  { pokemonName: 'Flareon',     method: 'level', requirement: 10, description: 'Reach Level 10' },
  { pokemonName: 'Lucario',     method: 'level', requirement: 12, description: 'Reach Level 12' },
  { pokemonName: 'Garchomp',    method: 'level', requirement: 15, description: 'Reach Level 15' },
  { pokemonName: 'Dragonite',   method: 'level', requirement: 15, description: 'Reach Level 15' },
  { pokemonName: 'Tyranitar',   method: 'level', requirement: 18, description: 'Reach Level 18' },
  { pokemonName: 'Mew',         method: 'level', requirement: 20, description: 'Reach Level 20' },
];

// Streak-based unlocks
export const STREAK_UNLOCKS: PokemonUnlockDef[] = [
  { pokemonName: 'Scizor',  method: 'streak', requirement: 5,  description: 'Achieve 5 win streak' },
  { pokemonName: 'Lapras',  method: 'streak', requirement: 10, description: 'Achieve 10 win streak' },
  { pokemonName: 'Snorlax', method: 'streak', requirement: 15, description: 'Achieve 15 win streak' },
];

// Achievement-based unlocks
export const ACHIEVEMENT_UNLOCKS: PokemonUnlockDef[] = [
  { pokemonName: 'Mewtwo',   method: 'achievement', requirement: 'champion_rank', description: 'Reach Champion rank' },
];

// All unlock definitions combined
export const ALL_UNLOCK_DEFS: PokemonUnlockDef[] = [
  ...STARTER_POKEMON.map(name => ({
    pokemonName: name,
    method: 'starter' as UnlockMethod,
    requirement: 0,
    description: 'Available from start',
  })),
  ...LEVEL_UNLOCKS,
  ...STREAK_UNLOCKS,
  ...ACHIEVEMENT_UNLOCKS,
];

// ==========================================
// TRAINER UNLOCK SYSTEM
// ==========================================

export interface TrainerUnlockDef {
  trainerName: string;
  requiredLevel: number;
  description: string;
}

export const TRAINER_UNLOCKS: TrainerUnlockDef[] = [
  { trainerName: 'Brock',     requiredLevel: 1,  description: 'Free' },
  { trainerName: 'Misty',     requiredLevel: 1,  description: 'Free' },
  { trainerName: 'Lt. Surge', requiredLevel: 5,  description: 'Reach Level 5' },
  { trainerName: 'Erika',     requiredLevel: 5,  description: 'Reach Level 5' },
  { trainerName: 'Koga',      requiredLevel: 8,  description: 'Reach Level 8' },
  { trainerName: 'Sabrina',   requiredLevel: 10, description: 'Reach Level 10' },
  { trainerName: 'Blaine',    requiredLevel: 12, description: 'Reach Level 12' },
  { trainerName: 'Giovanni',  requiredLevel: 15, description: 'Reach Level 15' },
  { trainerName: 'Lorelei',   requiredLevel: 18, description: 'Reach Level 18' },
  { trainerName: 'Bruno',     requiredLevel: 18, description: 'Reach Level 18' },
  { trainerName: 'Agatha',    requiredLevel: 20, description: 'Reach Level 20' },
  { trainerName: 'Lance',     requiredLevel: 20, description: 'Reach Level 20' },
];

// ==========================================
// CHECK FOR NEW UNLOCKS
// ==========================================

export interface UnlockCheckResult {
  newPokemonUnlocks: PokemonUnlockDef[];
  leveledUp: boolean;
  newLevel: number;
  totalXP: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  packsEarned: number;
}

/**
 * Check what Pokemon should be unlocked for a trainer based on their stats
 * Returns only NEW unlocks (not already owned)
 */
export function checkPokemonUnlocks(
  level: number,
  maxStreak: number,
  achievementCodes: string[],
  ownedPokemonNames: string[],
): PokemonUnlockDef[] {
  const newUnlocks: PokemonUnlockDef[] = [];
  const owned = new Set(ownedPokemonNames.map(n => n.toLowerCase()));

  // Check starters
  for (const name of STARTER_POKEMON) {
    if (!owned.has(name.toLowerCase())) {
      newUnlocks.push({ pokemonName: name, method: 'starter', requirement: 0, description: 'Available from start' });
    }
  }

  // Check level unlocks
  for (const unlock of LEVEL_UNLOCKS) {
    if (level >= (unlock.requirement as number) && !owned.has(unlock.pokemonName.toLowerCase())) {
      newUnlocks.push(unlock);
    }
  }

  // Check streak unlocks
  for (const unlock of STREAK_UNLOCKS) {
    if (maxStreak >= (unlock.requirement as number) && !owned.has(unlock.pokemonName.toLowerCase())) {
      newUnlocks.push(unlock);
    }
  }

  // Check achievement unlocks
  for (const unlock of ACHIEVEMENT_UNLOCKS) {
    if (achievementCodes.includes(unlock.requirement as string) && !owned.has(unlock.pokemonName.toLowerCase())) {
      newUnlocks.push(unlock);
    }
  }

  return newUnlocks;
}

/**
 * Get the unlock requirement for a specific Pokemon
 */
export function getUnlockInfo(pokemonName: string): PokemonUnlockDef | null {
  return ALL_UNLOCK_DEFS.find(d => d.pokemonName.toLowerCase() === pokemonName.toLowerCase()) || null;
}

/**
 * Check if a Pokemon is available to the trainer
 */
export function isPokemonUnlocked(
  pokemonName: string,
  level: number,
  maxStreak: number,
  achievementCodes: string[],
): boolean {
  const def = getUnlockInfo(pokemonName);
  if (!def) return false; // Unknown Pokemon

  switch (def.method) {
    case 'starter':
      return true;
    case 'level':
      return level >= (def.requirement as number);
    case 'streak':
      return maxStreak >= (def.requirement as number);
    case 'achievement':
      return achievementCodes.includes(def.requirement as string);
    case 'pack':
    case 'mission':
      return true; // These are checked via ownership, not conditions
    default:
      return false;
  }
}

// ==========================================
// CARD PACK SYSTEM
// Gacha-lite: No real money, earn through playing
// 3 wins = 1 pack, max 5 stored
// ==========================================

export const MAX_PENDING_PACKS = 5;
export const WINS_PER_PACK = 3;

export type PackRarity = 'common' | 'uncommon' | 'rare' | 'ultra_rare';

export interface PackCard {
  pokemonName: string;
  rarity: PackRarity;
  isDuplicate: boolean;
  duplicateXP: number; // XP gained if duplicate
}

// Weight distribution for pack rarities
const RARITY_WEIGHTS: Record<PackRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 12,
  ultra_rare: 3,
};

// Pokemon pools by rarity
const PACK_POOLS: Record<PackRarity, string[]> = {
  common: ['Typhlosion', 'Feraligatr', 'Meganium', 'Arcanine', 'Exeggutor', 'Golem', 'Nidoking'],
  uncommon: ['Gengar', 'Alakazam', 'Machamp', 'Vaporeon', 'Jolteon', 'Flareon'],
  rare: ['Lucario', 'Scizor', 'Lapras', 'Snorlax', 'Garchomp', 'Dragonite'],
  ultra_rare: ['Tyranitar', 'Mew', 'Mewtwo'],
};

function pickWeightedRarity(): PackRarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS) as [PackRarity, number][]) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return 'common';
}

function pickRandomFromPool(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Generate 3 cards for a pack opening */
export function generatePackCards(ownedPokemonNames: string[]): PackCard[] {
  const owned = new Set(ownedPokemonNames.map(n => n.toLowerCase()));
  const cards: PackCard[] = [];

  for (let i = 0; i < 3; i++) {
    const rarity = pickWeightedRarity();
    const pool = PACK_POOLS[rarity];
    const pokemonName = pickRandomFromPool(pool);
    const isDuplicate = owned.has(pokemonName.toLowerCase());

    cards.push({
      pokemonName,
      rarity,
      isDuplicate,
      duplicateXP: isDuplicate ? getDuplicateXP(rarity) : 0,
    });

    // Add to owned set so we can track within same pack
    if (!isDuplicate) {
      owned.add(pokemonName.toLowerCase());
    }
  }

  return cards;
}

function getDuplicateXP(rarity: PackRarity): number {
  switch (rarity) {
    case 'common': return 5;
    case 'uncommon': return 10;
    case 'rare': return 20;
    case 'ultra_rare': return 50;
  }
}

/** Check if a pack should be earned from wins */
export function checkPackEarned(packWinCounter: number, won: boolean, pendingPacks: number): { earnedPack: boolean; newCounter: number } {
  if (!won) return { earnedPack: false, newCounter: packWinCounter };

  const newCounter = packWinCounter + 1;
  if (newCounter >= WINS_PER_PACK && pendingPacks < MAX_PENDING_PACKS) {
    return { earnedPack: true, newCounter: 0 };
  }
  return { earnedPack: false, newCounter: newCounter >= WINS_PER_PACK ? 0 : newCounter };
}

// ==========================================
// QUEST DEFINITIONS
// ==========================================

export interface DailyQuestDef {
  questType: string;
  description: string;
  targetValue: number;
  rewardXP: number;
}

export interface WeeklyQuestDef {
  questType: string;
  description: string;
  targetValue: number;
  rewardXP: number;
  rewardPack: boolean;
}

export const DAILY_QUEST_POOL: DailyQuestDef[] = [
  { questType: 'win_battle',    description: 'Win 1 battle',                   targetValue: 1, rewardXP: 20 },
  { questType: 'win_battles_3', description: 'Win 3 battles',                  targetValue: 3, rewardXP: 40 },
  { questType: 'play_battles',  description: 'Play 3 battles',                 targetValue: 3, rewardXP: 25 },
  { questType: 'win_full_team', description: 'Win with all 3 Pokémon alive',   targetValue: 1, rewardXP: 30 },
  { questType: 'play_pvp',      description: 'Play a PvP battle',              targetValue: 1, rewardXP: 15 },
  { questType: 'win_streak_3',  description: 'Achieve a 3 win streak',         targetValue: 3, rewardXP: 35 },
];

export const WEEKLY_QUEST_POOL: WeeklyQuestDef[] = [
  { questType: 'win_10_battles',    description: 'Win 10 battles this week',           targetValue: 10, rewardXP: 100, rewardPack: true },
  { questType: 'play_20_battles',   description: 'Play 20 battles this week',          targetValue: 20, rewardXP: 80,  rewardPack: false },
  { questType: 'win_5_pvp',         description: 'Win 5 PvP battles this week',        targetValue: 5,  rewardXP: 120, rewardPack: true },
  { questType: 'use_5_different',   description: 'Use 5 different Pokémon this week',  targetValue: 5,  rewardXP: 60,  rewardPack: false },
  { questType: 'streak_5',          description: 'Reach a 5 win streak this week',     targetValue: 5,  rewardXP: 80,  rewardPack: false },
];

/** Pick 3 random daily quests for a trainer */
export function pickDailyQuests(): DailyQuestDef[] {
  const shuffled = [...DAILY_QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

/** Pick 2 random weekly quests for a trainer */
export function pickWeeklyQuests(): WeeklyQuestDef[] {
  const shuffled = [...WEEKLY_QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

/** Get end of current day (UTC midnight) */
export function getEndOfDayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
}

/** Get end of current week (Sunday midnight UTC) */
export function getEndOfWeekUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSunday, 0, 0, 0));
}

// ==========================================
// LEVEL THRESHOLDS TABLE (for reference)
// ==========================================
// Level 1:  0 XP needed (start)
// Level 2:  20 XP   (1² × 20)
// Level 3:  80 XP   (2² × 20)
// Level 4:  180 XP  (3² × 20)
// Level 5:  320 XP  (4² × 20)
// Level 6:  500 XP
// Level 7:  720 XP
// Level 8:  980 XP
// Level 9:  1280 XP
// Level 10: 1620 XP
// Level 15: 4200 XP
// Level 20: 7600 XP
// Level 25: 12000 XP
// Level 30: 17400 XP
