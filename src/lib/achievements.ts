// ==========================================
// POKÉMON ARENA - ACHIEVEMENT SYSTEM
// Badges that appear on profile & motivate play
// ==========================================

export interface AchievementDef {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'battle' | 'social' | 'dedication' | 'collection';
  /** Hidden achievements only show after unlock */
  hidden?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // --- Battle ---
  {
    code: 'first_victory',
    name: 'First Victory',
    description: 'Win your first battle',
    icon: '🔥',
    category: 'battle',
  },
  {
    code: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Win a battle in 5 turns or less',
    icon: '⚡',
    category: 'battle',
  },
  {
    code: 'untouchable',
    name: 'Untouchable',
    description: 'Win without losing any Pokémon',
    icon: '🛡️',
    category: 'battle',
  },
  {
    code: 'comeback_king',
    name: 'Comeback King',
    description: 'Win with only 1 Pokémon remaining',
    icon: '💀',
    category: 'battle',
  },
  {
    code: 'on_fire',
    name: 'On Fire',
    description: 'Achieve a 10 win streak',
    icon: '🔥',
    category: 'battle',
  },
  {
    code: 'champion_rank',
    name: 'Champion',
    description: 'Reach Champion rank (1500+ LP)',
    icon: '🏆',
    category: 'battle',
  },
  {
    code: 'veteran',
    name: 'Veteran',
    description: 'Play 100 battles total',
    icon: '🎖️',
    category: 'battle',
  },
  {
    code: 'centurion',
    name: 'Centurion',
    description: 'Win 50 battles',
    icon: '⚔️',
    category: 'battle',
  },

  // --- Social ---
  {
    code: 'recruiter',
    name: 'Recruiter',
    description: 'Invite your first friend',
    icon: '👤',
    category: 'social',
  },
  {
    code: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Invite 5 friends',
    icon: '👥',
    category: 'social',
  },
  {
    code: 'master_recruiter',
    name: 'Master Recruiter',
    description: 'Invite 10 friends',
    icon: '🌟',
    category: 'social',
  },

  // --- Dedication ---
  {
    code: 'dedicated_3',
    name: 'Getting Hooked',
    description: 'Play 3 days in a row',
    icon: '📅',
    category: 'dedication',
  },
  {
    code: 'dedicated_7',
    name: 'Dedicated Week',
    description: 'Play 7 days in a row',
    icon: '📅',
    category: 'dedication',
  },
  {
    code: 'dedicated_30',
    name: 'True Dedication',
    description: 'Play 30 days in a row',
    icon: '🗓️',
    category: 'dedication',
  },

  // --- Collection ---
  {
    code: 'collector_5',
    name: 'Collector',
    description: 'Unlock 5 different Pokémon',
    icon: '⭐',
    category: 'collection',
  },
  {
    code: 'collector_20',
    name: 'Master Collector',
    description: 'Unlock 20 different Pokémon',
    icon: '🌟',
    category: 'collection',
  },
];

export function getAchievementDef(code: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.code === code);
}

// --- Battle context for achievement checking ---
export interface BattleAchievementContext {
  trainerId: string;
  won: boolean;
  turns: number;
  /** How many of your 3 Pokemon survived */
  pokemonSurvived: number;
  /** Current win streak after this battle */
  newStreak: number;
  /** Trainer's total wins after this battle */
  totalWins: number;
  /** Trainer's total battles (wins+losses) after this battle */
  totalBattles: number;
  /** Trainer's current LP after this battle */
  currentLP: number;
  /** Different Pokémon IDs this trainer has used in any battle */
  uniquePokemonUsed?: number;
}

/**
 * Determine which achievements should be newly unlocked after a battle.
 * Returns array of achievement codes to grant.
 */
export function checkBattleAchievements(
  ctx: BattleAchievementContext,
  alreadyUnlocked: Set<string>,
): string[] {
  const newAchievements: string[] = [];

  function grant(code: string) {
    if (!alreadyUnlocked.has(code)) {
      newAchievements.push(code);
    }
  }

  if (ctx.won) {
    // First Victory
    if (ctx.totalWins >= 1) grant('first_victory');

    // Lightning Fast — win in 5 turns or less
    if (ctx.turns <= 5) grant('lightning_fast');

    // Untouchable — win without losing any Pokémon (all 3 survived)
    if (ctx.pokemonSurvived >= 3) grant('untouchable');

    // Comeback King — win with only 1 Pokémon remaining
    if (ctx.pokemonSurvived === 1) grant('comeback_king');

    // On Fire — 10 win streak
    if (ctx.newStreak >= 10) grant('on_fire');

    // Centurion — 50 wins
    if (ctx.totalWins >= 50) grant('centurion');
  }

  // Veteran — 100 total battles
  if (ctx.totalBattles >= 100) grant('veteran');

  // Champion rank
  if (ctx.currentLP >= 1500) grant('champion_rank');

  return newAchievements;
}

/**
 * Check referral-based achievements.
 */
export function checkReferralAchievements(
  referralCount: number,
  alreadyUnlocked: Set<string>,
): string[] {
  const newAchievements: string[] = [];

  function grant(code: string) {
    if (!alreadyUnlocked.has(code)) {
      newAchievements.push(code);
    }
  }

  if (referralCount >= 1) grant('recruiter');
  if (referralCount >= 5) grant('social_butterfly');
  if (referralCount >= 10) grant('master_recruiter');

  return newAchievements;
}

/**
 * Check login-streak achievements.
 */
export function checkLoginAchievements(
  loginStreak: number,
  alreadyUnlocked: Set<string>,
): string[] {
  const newAchievements: string[] = [];

  function grant(code: string) {
    if (!alreadyUnlocked.has(code)) {
      newAchievements.push(code);
    }
  }

  if (loginStreak >= 3) grant('dedicated_3');
  if (loginStreak >= 7) grant('dedicated_7');
  if (loginStreak >= 30) grant('dedicated_30');

  return newAchievements;
}

/**
 * Check collection achievements based on unlocked pokemon count.
 */
export function checkCollectionAchievements(
  unlockedCount: number,
  alreadyUnlocked: Set<string>,
): string[] {
  const newAchievements: string[] = [];

  function grant(code: string) {
    if (!alreadyUnlocked.has(code)) {
      newAchievements.push(code);
    }
  }

  if (unlockedCount >= 5) grant('collector_5');
  if (unlockedCount >= 20) grant('collector_20');

  return newAchievements;
}
