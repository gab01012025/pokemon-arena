// ==========================================
// POKÉMON ARENA - RANK SYSTEM
// ==========================================

export type RankTier = 
  | 'bronze'
  | 'prata'
  | 'ouro'
  | 'platina'
  | 'esmeralda'
  | 'rubi'
  | 'safira'
  | 'diamante'
  | 'mestre'
  | 'grao-mestre'
  | 'lendario';

export interface RankInfo {
  tier: RankTier;
  name: string;
  nameEn: string;
  minLevel: number;
  maxLevel: number;
  badge: string;
  crown: string;
  color: string;
  gradient: string;
  glow: string;
}

// Rank definitions based on level
export const RANKS: RankInfo[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    nameEn: 'Bronze',
    minLevel: 1,
    maxLevel: 5,
    badge: '/images/badges/all-ranks.jpeg',
    crown: '/images/badges/crowns/bronze.jpeg',
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B5A2B 100%)',
    glow: 'rgba(205, 127, 50, 0.5)',
  },
  {
    tier: 'prata',
    name: 'Prata',
    nameEn: 'Silver',
    minLevel: 6,
    maxLevel: 10,
    badge: '/images/badges/all-ranks.jpeg',
    crown: '/images/badges/crowns/prata.jpeg',
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #A0A0A0 100%)',
    glow: 'rgba(192, 192, 192, 0.5)',
  },
  {
    tier: 'ouro',
    name: 'Ouro',
    nameEn: 'Gold',
    minLevel: 11,
    maxLevel: 15,
    badge: '/images/badges/all-ranks.jpeg',
    crown: '/images/badges/crowns/ouro.jpeg',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
    glow: 'rgba(255, 215, 0, 0.5)',
  },
  {
    tier: 'platina',
    name: 'Platina',
    nameEn: 'Platinum',
    minLevel: 16,
    maxLevel: 20,
    badge: '/images/badges/all-ranks.jpeg',
    crown: '/images/badges/crowns/platina.jpeg',
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #8E9AAF 100%)',
    glow: 'rgba(229, 228, 226, 0.5)',
  },
  {
    tier: 'esmeralda',
    name: 'Esmeralda',
    nameEn: 'Emerald',
    minLevel: 21,
    maxLevel: 25,
    badge: '/images/badges/all-ranks.jpeg',
    crown: '/images/badges/crowns/esmeralda.jpeg',
    color: '#50C878',
    gradient: 'linear-gradient(135deg, #50C878 0%, #2E8B57 100%)',
    glow: 'rgba(80, 200, 120, 0.5)',
  },
  {
    tier: 'rubi',
    name: 'Rubi',
    nameEn: 'Ruby',
    minLevel: 26,
    maxLevel: 30,
    badge: '/images/badges/all-ranks.jpeg',
    crown: '/images/badges/crowns/rubi.jpeg',
    color: '#E0115F',
    gradient: 'linear-gradient(135deg, #E0115F 0%, #9B111E 100%)',
    glow: 'rgba(224, 17, 95, 0.5)',
  },
  {
    tier: 'safira',
    name: 'Safira',
    nameEn: 'Sapphire',
    minLevel: 31,
    maxLevel: 35,
    badge: '/images/badges/all-ranks.jpeg',
    crown: '/images/badges/crowns/safira.jpeg',
    color: '#0F52BA',
    gradient: 'linear-gradient(135deg, #0F52BA 0%, #082567 100%)',
    glow: 'rgba(15, 82, 186, 0.5)',
  },
  {
    tier: 'diamante',
    name: 'Diamante',
    nameEn: 'Diamond',
    minLevel: 36,
    maxLevel: 40,
    badge: '/images/badges/diamante.jpeg',
    crown: '/images/badges/crowns/diamante.jpeg',
    color: '#B9F2FF',
    gradient: 'linear-gradient(135deg, #B9F2FF 0%, #7DF9FF 50%, #00CED1 100%)',
    glow: 'rgba(185, 242, 255, 0.6)',
  },
  {
    tier: 'mestre',
    name: 'Mestre',
    nameEn: 'Master',
    minLevel: 41,
    maxLevel: 45,
    badge: '/images/badges/mestre.jpeg',
    crown: '/images/badges/crowns/mestre.jpeg',
    color: '#9B30FF',
    gradient: 'linear-gradient(135deg, #9B30FF 0%, #6A0DAD 100%)',
    glow: 'rgba(155, 48, 255, 0.6)',
  },
  {
    tier: 'grao-mestre',
    name: 'Grão Mestre',
    nameEn: 'Grand Master',
    minLevel: 46,
    maxLevel: 50,
    badge: '/images/badges/grao-mestre.jpeg',
    crown: '/images/badges/crowns/grao-mestre.jpeg',
    color: '#8B0000',
    gradient: 'linear-gradient(135deg, #DC143C 0%, #8B0000 50%, #4A0000 100%)',
    glow: 'rgba(220, 20, 60, 0.6)',
  },
  {
    tier: 'lendario',
    name: 'Lendário',
    nameEn: 'Legendary',
    minLevel: 46,
    maxLevel: 50, // + Top 10
    badge: '/images/badges/lendario.jpeg',
    crown: '/images/badges/crowns/lendario.jpeg',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #87CEEB 50%, #00CED1 100%)',
    glow: 'rgba(255, 215, 0, 0.8)',
  },
];

/**
 * Get rank info based on player level and ladder position
 */
export function getRankByLevel(level: number, ladderPosition?: number): RankInfo {
  // Lendário: Level 46-50 AND Top 10 in ladder
  if (level >= 46 && ladderPosition !== undefined && ladderPosition <= 10) {
    return RANKS.find(r => r.tier === 'lendario')!;
  }
  
  // Find rank by level
  const rank = RANKS.find(r => level >= r.minLevel && level <= r.maxLevel);
  return rank || RANKS[0]; // Default to Bronze
}

/**
 * Get rank info by tier name
 */
export function getRankByTier(tier: RankTier): RankInfo {
  return RANKS.find(r => r.tier === tier) || RANKS[0];
}

/**
 * Calculate XP needed for next level
 */
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

/**
 * Calculate total XP needed to reach a level
 */
export function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXp(totalXp: number): { level: number; currentXp: number; xpToNext: number } {
  let level = 1;
  let remainingXp = totalXp;
  
  while (remainingXp >= getXpForLevel(level) && level < 50) {
    remainingXp -= getXpForLevel(level);
    level++;
  }
  
  return {
    level,
    currentXp: remainingXp,
    xpToNext: getXpForLevel(level),
  };
}

/**
 * Get XP reward for winning a battle
 */
export function getBattleXpReward(playerLevel: number, opponentLevel: number, won: boolean): number {
  const baseXp = won ? 25 : 5;
  const levelDiff = opponentLevel - playerLevel;
  const multiplier = Math.max(0.5, Math.min(2, 1 + levelDiff * 0.1));
  return Math.floor(baseXp * multiplier);
}

/**
 * Get ladder points for battle result
 */
export function getLadderPoints(playerRank: RankTier, opponentRank: RankTier, won: boolean): number {
  const rankOrder = RANKS.map(r => r.tier);
  const playerIndex = rankOrder.indexOf(playerRank);
  const opponentIndex = rankOrder.indexOf(opponentRank);
  
  const basePoints = won ? 25 : -15;
  const rankDiff = opponentIndex - playerIndex;
  const multiplier = Math.max(0.5, Math.min(2, 1 + rankDiff * 0.15));
  
  return Math.floor(basePoints * multiplier);
}
