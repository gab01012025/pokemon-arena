/**
 * Battle Result API - Update stats after battle completion
 * POST /api/battle/result
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

// EXP required for each level (like Naruto Arena)
const EXP_TABLE: Record<number, number> = {
  1: 100,
  2: 200,
  3: 350,
  4: 550,
  5: 800,
  6: 1100,
  7: 1450,
  8: 1850,
  9: 2300,
  10: 2800,
  11: 3350,
  12: 3950,
  13: 4600,
  14: 5300,
  15: 6050,
  16: 6850,
  17: 7700,
  18: 8600,
  19: 9550,
  20: 10550,
};

// Calculate EXP needed for a level (continues exponentially after 20)
function getExpForLevel(level: number): number {
  if (level <= 20) return EXP_TABLE[level] || 10550;
  // After level 20: exponential growth
  return Math.floor(10550 + (level - 20) * 1500 + Math.pow(level - 20, 2) * 100);
}

// Calculate EXP reward based on battle outcome
function calculateExpReward(
  won: boolean, 
  playerLevel: number, 
  opponentLevel: number,
  surrendered: boolean
): number {
  let baseExp = 50;
  
  if (won) {
    // Base win EXP + level difference bonus
    const levelDiff = opponentLevel - playerLevel;
    baseExp = 100;
    
    // Bonus for beating higher level opponents
    if (levelDiff > 0) {
      baseExp += levelDiff * 25;
    }
    // Reduced EXP for beating lower level opponents
    else if (levelDiff < 0) {
      baseExp = Math.max(25, baseExp + levelDiff * 10);
    }
    
    // Extra bonus for winning streaks (handled separately)
  } else {
    // Lose: Still get some EXP for participating
    baseExp = surrendered ? 10 : 25;
    
    // Less reduction for losing to higher level
    const levelDiff = opponentLevel - playerLevel;
    if (levelDiff > 0) {
      baseExp += Math.min(levelDiff * 5, 25);
    }
  }
  
  return Math.floor(baseExp);
}

// Calculate ladder points change
function calculateLadderPoints(
  won: boolean, 
  playerPoints: number, 
  opponentPoints: number,
  surrendered: boolean
): number {
  const pointDiff = opponentPoints - playerPoints;
  
  if (won) {
    // Base points for win
    let points = 15;
    
    // Bonus for beating higher-ranked players
    if (pointDiff > 0) {
      points += Math.floor(pointDiff / 50);
    }
    // Less points for beating lower-ranked players
    else if (pointDiff < 0) {
      points = Math.max(5, points + Math.floor(pointDiff / 100));
    }
    
    return Math.floor(points);
  } else {
    // Lose: Lose points
    let lostPoints = -10;
    
    // Lose more to lower-ranked players
    if (pointDiff < 0) {
      lostPoints -= Math.floor(Math.abs(pointDiff) / 100);
    }
    // Lose less to higher-ranked players
    else if (pointDiff > 0) {
      lostPoints = Math.max(-5, lostPoints + Math.floor(pointDiff / 100));
    }
    
    // Surrender penalty
    if (surrendered) {
      lostPoints -= 5;
    }
    
    return Math.floor(lostPoints);
  }
}

export const POST = apiHandler(async (req: NextRequest) => {
  // Rate limit
  const ip = getClientIP(req);
  if (!rateLimit(`battle:result:${ip}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
    throw APIErrors.tooManyRequests('Too many requests');
  }

  const { userId } = await requireAuth(req);

  const body = await req.json();
  const { 
    won, 
    surrendered = false,
    opponentLevel = 1,
    opponentLadderPoints = 0 
  } = body;

  if (typeof won !== 'boolean') {
    throw APIErrors.badRequest('Invalid result');
  }

  // Get current trainer stats
  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      id: true,
      level: true,
      experience: true,
      wins: true,
      losses: true,
      streak: true,
      maxStreak: true,
      ladderPoints: true,
    }
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

    // Calculate rewards
    const expGained = calculateExpReward(won, trainer.level, opponentLevel, surrendered);
    const ladderChange = calculateLadderPoints(won, trainer.ladderPoints, opponentLadderPoints, surrendered);

    // Calculate new values
    let newExp = trainer.experience + expGained;
    let newLevel = trainer.level;
    const newStreak = won ? trainer.streak + 1 : 0;
    const newMaxStreak = Math.max(trainer.maxStreak, newStreak);
    
    // Streak bonus EXP (5% per win in streak, max 50%)
    if (won && newStreak > 1) {
      const streakBonus = Math.min(newStreak - 1, 10) * 0.05;
      newExp += Math.floor(expGained * streakBonus);
    }

    // Check for level up
    let leveledUp = false;
    while (newExp >= getExpForLevel(newLevel)) {
      newExp -= getExpForLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }

    // Update trainer in database
    const updatedTrainer = await prisma.trainer.update({
      where: { id: userId },
      data: {
        experience: newExp,
        level: newLevel,
        wins: won ? trainer.wins + 1 : trainer.wins,
        losses: won ? trainer.losses : trainer.losses + 1,
        streak: newStreak,
        maxStreak: newMaxStreak,
        ladderPoints: Math.max(0, trainer.ladderPoints + ladderChange),
      },
      select: {
        level: true,
        experience: true,
        wins: true,
        losses: true,
        streak: true,
        ladderPoints: true,
      }
    });

    return APIResponse.success({
      rewards: {
        exp: expGained,
        streakBonus: won && newStreak > 1 ? Math.floor(expGained * Math.min(newStreak - 1, 10) * 0.05) : 0,
        ladderPoints: ladderChange,
        leveledUp,
        newLevel: leveledUp ? newLevel : null,
      },
      stats: {
        level: updatedTrainer.level,
        experience: updatedTrainer.experience,
        expToNextLevel: getExpForLevel(updatedTrainer.level),
        wins: updatedTrainer.wins,
        losses: updatedTrainer.losses,
        streak: updatedTrainer.streak,
        ladderPoints: updatedTrainer.ladderPoints,
      }
    });
});

// GET - Get current trainer stats
export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      username: true,
      level: true,
      experience: true,
      wins: true,
      losses: true,
      streak: true,
      maxStreak: true,
      ladderPoints: true,
    }
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

  return APIResponse.success({
    ...trainer,
    expToNextLevel: getExpForLevel(trainer.level),
    winRate: trainer.wins + trainer.losses > 0 
      ? ((trainer.wins / (trainer.wins + trainer.losses)) * 100).toFixed(1)
      : '0.0'
  });
});
