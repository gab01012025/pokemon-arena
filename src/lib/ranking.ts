// ==========================================
// POKÉMON ARENA - COMPETITIVE RANKING SYSTEM
// LP-based tiers & divisions (League style)
// ==========================================

// --- Tiers ---
export type CompetitiveTier = 'pokeball' | 'greatball' | 'ultraball' | 'masterball' | 'champion';

// --- Divisions (within a tier) ---
export type Division = 'III' | 'II' | 'I';

export interface CompetitiveRank {
  tier: CompetitiveTier;
  division: Division;
  /** Display name, e.g. "Great Ball II" */
  label: string;
  /** Numeric index 0–14 for comparison (higher = better) */
  index: number;
}

// --- Tier metadata ---
export interface TierInfo {
  tier: CompetitiveTier;
  name: string;
  nameEn: string;
  /** Minimum LP to enter this tier (division III) */
  minLP: number;
  /** LP per division inside the tier */
  divisionSize: number;
  color: string;
  gradient: string;
  glow: string;
  icon: string; // emoji fallback
}

export const TIERS: TierInfo[] = [
  {
    tier: 'pokeball',
    name: 'Poké Ball',
    nameEn: 'Poké Ball',
    minLP: 0,
    divisionSize: 100,  // III: 0-99, II: 100-199, I: 200-299
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B5A2B 100%)',
    glow: 'rgba(205, 127, 50, 0.5)',
    icon: '🔴',
  },
  {
    tier: 'greatball',
    name: 'Great Ball',
    nameEn: 'Great Ball',
    minLP: 300,
    divisionSize: 100,  // III: 300-399, II: 400-499, I: 500-599
    color: '#4A90D9',
    gradient: 'linear-gradient(135deg, #4A90D9 0%, #2B5EA0 100%)',
    glow: 'rgba(74, 144, 217, 0.5)',
    icon: '🔵',
  },
  {
    tier: 'ultraball',
    name: 'Ultra Ball',
    nameEn: 'Ultra Ball',
    minLP: 600,
    divisionSize: 133,  // III: 600-732, II: 733-865, I: 866-999
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
    glow: 'rgba(255, 215, 0, 0.5)',
    icon: '🟡',
  },
  {
    tier: 'masterball',
    name: 'Master Ball',
    nameEn: 'Master Ball',
    minLP: 1000,
    divisionSize: 167,  // III: 1000-1166, II: 1167-1333, I: 1334-1499
    color: '#9B30FF',
    gradient: 'linear-gradient(135deg, #9B30FF 0%, #6A0DAD 100%)',
    glow: 'rgba(155, 48, 255, 0.6)',
    icon: '🟣',
  },
  {
    tier: 'champion',
    name: 'Champion',
    nameEn: 'Champion',
    minLP: 1500,
    divisionSize: 200,  // III: 1500-1699, II: 1700-1899, I: 1900+
    color: '#DC143C',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #DC143C 50%, #8B0000 100%)',
    glow: 'rgba(220, 20, 60, 0.7)',
    icon: '👑',
  },
];

const DIVISIONS: Division[] = ['III', 'II', 'I'];

// --- Core helpers ---

/**
 * Get the tier info for a given LP value.
 */
export function getTierInfo(lp: number): TierInfo {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (lp >= TIERS[i].minLP) return TIERS[i];
  }
  return TIERS[0];
}

/**
 * Get full competitive rank (tier + division) from LP.
 */
export function getRank(lp: number): CompetitiveRank {
  const tierInfo = getTierInfo(lp);
  const lpInTier = lp - tierInfo.minLP;
  const divIndex = Math.min(2, Math.floor(lpInTier / tierInfo.divisionSize));
  const division = DIVISIONS[divIndex];

  const tierIndex = TIERS.findIndex(t => t.tier === tierInfo.tier);
  const index = tierIndex * 3 + divIndex;

  return {
    tier: tierInfo.tier,
    division,
    label: `${tierInfo.name} ${division}`,
    index,
  };
}

/**
 * Get the numeric rank index (0-14) for comparison.
 */
export function getRankIndex(lp: number): number {
  return getRank(lp).index;
}

/**
 * Get LP progress within the current division.
 * Returns { current, required, percentage }.
 */
export function getDivisionProgress(lp: number): {
  current: number;
  required: number;
  percentage: number;
  lpToNextDivision: number;
} {
  const tierInfo = getTierInfo(lp);
  const lpInTier = lp - tierInfo.minLP;
  const divIndex = Math.min(2, Math.floor(lpInTier / tierInfo.divisionSize));
  const divStart = divIndex * tierInfo.divisionSize;
  const current = lpInTier - divStart;
  const required = tierInfo.divisionSize;
  const percentage = Math.min(100, Math.round((current / required) * 100));
  const lpToNextDivision = required - current;

  return { current, required, percentage, lpToNextDivision };
}

/**
 * Format LP into a human-readable rank string.
 */
export function formatRank(lp: number): string {
  const rank = getRank(lp);
  return rank.label;
}

/**
 * Get the primary color for a given LP value.
 */
export function getRankColor(lp: number): string {
  return getTierInfo(lp).color;
}

/**
 * Get the gradient for a given LP value.
 */
export function getRankGradient(lp: number): string {
  return getTierInfo(lp).gradient;
}

/**
 * Get the glow effect color for a LP value.
 */
export function getRankGlow(lp: number): string {
  return getTierInfo(lp).glow;
}

/**
 * Get the icon emoji for a given LP value.
 */
export function getRankIcon(lp: number): string {
  return getTierInfo(lp).icon;
}

// --- ELO-style LP calculation ---

interface LPCalcParams {
  won: boolean;
  playerLP: number;
  opponentLP: number;
  surrendered: boolean;
  streak: number; // current win streak BEFORE this game
}

/**
 * Calculate LP gain/loss with ELO-style modifiers.
 *
 * Factors:
 * - Rank difference (beating higher rank = more LP)
 * - Win streak bonus (+3 LP per consecutive win, capped at +15)
 * - Surrender penalty (-5 extra)
 * - Tier-aware base values
 */
export function calculateCompetitiveLP(params: LPCalcParams): number {
  const { won, playerLP, opponentLP, surrendered, streak } = params;

  const playerRank = getRankIndex(playerLP);
  const opponentRank = getRankIndex(opponentLP);
  const rankDiff = opponentRank - playerRank; // positive = opponent higher

  if (won) {
    // Base LP: 20
    let pts = 20;

    // Rank difference modifier
    if (rankDiff > 0) {
      // Beating higher rank: +5 per rank tier above
      pts += Math.min(rankDiff * 5, 20);
    } else if (rankDiff < 0) {
      // Beating lower rank: reduce gain
      pts = Math.max(8, pts + rankDiff * 3);
    }

    // Win streak bonus: +3 per consecutive win (capped at +15)
    if (streak > 0) {
      pts += Math.min(streak * 3, 15);
    }

    return Math.floor(pts);
  }

  // --- Loss ---
  let pts = -15;

  // Rank difference modifier
  if (rankDiff > 0) {
    // Losing to higher rank: reduce penalty
    pts = Math.min(-5, pts + rankDiff * 3);
  } else if (rankDiff < 0) {
    // Losing to lower rank: harsher penalty
    pts -= Math.min(Math.abs(rankDiff) * 3, 15);
  }

  // Surrender penalty
  if (surrendered) {
    pts -= 5;
  }

  return Math.floor(pts);
}

// --- Rank change detection ---

export interface RankChangeResult {
  oldRank: CompetitiveRank;
  newRank: CompetitiveRank;
  rankUp: boolean;
  rankDown: boolean;
  tierChanged: boolean;
}

/**
 * Detect if a rank change occurred between old LP and new LP.
 */
export function detectRankChange(oldLP: number, newLP: number): RankChangeResult {
  const oldRank = getRank(oldLP);
  const newRank = getRank(newLP);

  return {
    oldRank,
    newRank,
    rankUp: newRank.index > oldRank.index,
    rankDown: newRank.index < oldRank.index,
    tierChanged: oldRank.tier !== newRank.tier,
  };
}

// --- Season helpers ---

/**
 * Calculate LP after a season reset.
 * Players keep a portion of their LP based on their tier:
 * - Champion: reset to 1200
 * - Master Ball: reset to 800
 * - Ultra Ball: reset to 500
 * - Great Ball: reset to 200
 * - Poké Ball: reset to 0
 */
export function getSeasonResetLP(currentLP: number): number {
  const tier = getTierInfo(currentLP).tier;
  switch (tier) {
    case 'champion': return 1200;
    case 'masterball': return 800;
    case 'ultraball': return 500;
    case 'greatball': return 200;
    case 'pokeball': return 0;
    default: return 0;
  }
}

/**
 * Get the season reward tier based on final LP.
 */
export function getSeasonRewardTier(finalLP: number): {
  tier: CompetitiveTier;
  rewardLabel: string;
  badge: string;
} {
  const tierInfo = getTierInfo(finalLP);
  return {
    tier: tierInfo.tier,
    rewardLabel: `${tierInfo.name} Season Badge`,
    badge: `/images/badges/season-${tierInfo.tier}.png`,
  };
}
