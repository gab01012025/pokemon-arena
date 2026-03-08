import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import {
  calculateBattleXP,
  isFirstBattleOfDay,
  levelFromTotalXP,
  checkPackEarned,
  checkPokemonUnlocks,
} from '@/lib/progression';

export const POST = apiHandler(async (req: NextRequest) => {
  // Rate limit
  const ip = getClientIP(req);
  if (!rateLimit(`battle:ai-result:${ip}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
    throw APIErrors.tooManyRequests('Too many requests');
  }

  const { userId } = await requireAuth(req);

  const body = await req.json();
  const { won } = body;

  // Get trainer with progression fields
  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      experience: true, level: true, totalXP: true, ladderPoints: true,
      wins: true, losses: true, streak: true, maxStreak: true,
      pendingPacks: true, packWinCounter: true, lastBattleDate: true,
      unlockedPokemon: { select: { pokemon: { select: { name: true } } } },
      achievements: { select: { code: true } },
    },
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

  // Calculate XP using progression system
  const firstOfDay = isFirstBattleOfDay(trainer.lastBattleDate);
  const newStreak = won ? trainer.streak + 1 : 0;
  const xpResult = calculateBattleXP({
    won,
    isPvP: false,
    streak: newStreak,
    isFirstBattleOfDay: firstOfDay,
    playerLevel: trainer.level,
    opponentLevel: trainer.level, // AI is same level
  });

  const newTotalXP = trainer.totalXP + xpResult.totalXP;
  const levelInfo = levelFromTotalXP(newTotalXP);
  const leveledUp = levelInfo.level > trainer.level;
  const newMaxStreak = Math.max(trainer.maxStreak, newStreak);

  // Card pack check
  const packCheck = checkPackEarned(trainer.packWinCounter, won, trainer.pendingPacks);

  // Check for new Pokemon unlocks
  const ownedNames = trainer.unlockedPokemon.map(up => up.pokemon.name);
  const achievementCodes = trainer.achievements.map(a => a.code);
  const newUnlocks = checkPokemonUnlocks(levelInfo.level, newMaxStreak, achievementCodes, ownedNames);

  // Update trainer
  const updatedTrainer = await prisma.trainer.update({
    where: { id: userId },
    data: {
      wins: won ? { increment: 1 } : undefined,
      losses: won ? undefined : { increment: 1 },
      experience: levelInfo.currentLevelXP,
      level: levelInfo.level,
      totalXP: newTotalXP,
      streak: newStreak,
      maxStreak: newMaxStreak,
      pendingPacks: trainer.pendingPacks + (packCheck.earnedPack ? 1 : 0),
      packWinCounter: packCheck.newCounter,
      lastBattleDate: new Date(),
    },
  });

  // Grant new Pokemon unlocks
  const granted: string[] = [];
  for (const unlock of newUnlocks) {
    const pokemon = await prisma.pokemon.findFirst({
      where: { name: { equals: unlock.pokemonName, mode: 'insensitive' } },
    });
    if (pokemon) {
      try {
        await prisma.trainerPokemon.create({
          data: { trainerId: userId, pokemonId: pokemon.id, obtainedMethod: unlock.method, isNew: true },
        });
        granted.push(unlock.pokemonName);
      } catch { /* Already owned */ }
    }
  }

  // Update daily/weekly quest progress
  try {
    const now = new Date();
    const dailyQuests = await prisma.dailyQuest.findMany({
      where: { trainerId: userId, expiresAt: { gt: now }, completed: false },
    });
    for (const quest of dailyQuests) {
      let newValue = quest.currentValue;
      switch (quest.questType) {
        case 'win_battle': case 'win_battles_3':
          if (won) newValue++; break;
        case 'play_battles': newValue++; break;
        case 'win_streak_3':
          if (won) newValue = Math.max(newValue, newStreak); break;
      }
      if (newValue !== quest.currentValue) {
        await prisma.dailyQuest.update({
          where: { id: quest.id },
          data: { currentValue: newValue, completed: newValue >= quest.targetValue },
        });
      }
    }

    const weeklyQuests = await prisma.weeklyQuest.findMany({
      where: { trainerId: userId, expiresAt: { gt: now }, completed: false },
    });
    for (const quest of weeklyQuests) {
      let newValue = quest.currentValue;
      switch (quest.questType) {
        case 'win_10_battles': if (won) newValue++; break;
        case 'play_20_battles': newValue++; break;
        case 'streak_5': if (won) newValue = Math.max(newValue, newStreak); break;
      }
      if (newValue !== quest.currentValue) {
        await prisma.weeklyQuest.update({
          where: { id: quest.id },
          data: { currentValue: newValue, completed: newValue >= quest.targetValue },
        });
      }
    }
  } catch { /* Non-critical */ }

  return APIResponse.success({
    won,
    rewards: {
      experience: xpResult.totalXP,
      baseXP: xpResult.baseXP,
      streakBonus: xpResult.streakBonus,
      firstDayBonus: xpResult.firstDayBonus,
      levelUp: leveledUp,
      packEarned: packCheck.earnedPack,
      newUnlocks: granted,
    },
    newStats: {
      level: updatedTrainer.level,
      experience: updatedTrainer.experience,
      totalXP: updatedTrainer.totalXP,
      ladderPoints: updatedTrainer.ladderPoints,
      wins: updatedTrainer.wins,
      losses: updatedTrainer.losses,
      streak: updatedTrainer.streak,
      pendingPacks: updatedTrainer.pendingPacks,
    },
  });
});
