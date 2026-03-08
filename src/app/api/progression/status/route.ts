/**
 * Progression Status API
 * GET /api/progression/status - Get current XP, level, unlocks, pending packs, quests
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import {
  levelFromTotalXP,
  xpForLevel,
  checkPokemonUnlocks,
  ALL_UNLOCK_DEFS,
  STARTER_POKEMON,
  MAX_PENDING_PACKS,
  WINS_PER_PACK,
} from '@/lib/progression';

export const GET = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`progression-status:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      level: true,
      experience: true,
      totalXP: true,
      wins: true,
      losses: true,
      streak: true,
      maxStreak: true,
      ladderPoints: true,
      pendingPacks: true,
      packWinCounter: true,
      lastBattleDate: true,
      unlockedPokemon: {
        select: {
          pokemonId: true,
          obtainedMethod: true,
          isNew: true,
          pokemon: { select: { name: true, types: true, category: true, health: true } },
        },
      },
      achievements: {
        select: { code: true },
      },
    },
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

  // Calculate level info from totalXP
  const levelInfo = levelFromTotalXP(trainer.totalXP);
  const ownedNames = trainer.unlockedPokemon.map(up => up.pokemon.name);
  const achievementCodes = trainer.achievements.map(a => a.code);

  // Get pending unlocks (Pokemon they qualify for but don't own)
  const pendingUnlocks = checkPokemonUnlocks(
    levelInfo.level,
    trainer.maxStreak,
    achievementCodes,
    ownedNames,
  );

  // Build full collection status
  const allPokemonDefs = ALL_UNLOCK_DEFS;
  const collection = allPokemonDefs.map(def => {
    const owned = ownedNames.some(n => n.toLowerCase() === def.pokemonName.toLowerCase());
    const trainerPoke = trainer.unlockedPokemon.find(
      up => up.pokemon.name.toLowerCase() === def.pokemonName.toLowerCase()
    );
    return {
      pokemonName: def.pokemonName,
      method: def.method,
      requirement: def.requirement,
      description: def.description,
      owned,
      isNew: trainerPoke?.isNew ?? false,
      obtainedMethod: trainerPoke?.obtainedMethod ?? null,
    };
  });

  // Active daily/weekly quests
  const now = new Date();
  const [dailyQuests, weeklyQuests] = await Promise.all([
    prisma.dailyQuest.findMany({
      where: { trainerId: userId, expiresAt: { gt: now } },
      orderBy: { assignedAt: 'desc' },
    }),
    prisma.weeklyQuest.findMany({
      where: { trainerId: userId, expiresAt: { gt: now } },
      orderBy: { assignedAt: 'desc' },
    }),
  ]);

  return APIResponse.success({
    level: levelInfo.level,
    currentLevelXP: levelInfo.currentLevelXP,
    xpToNextLevel: levelInfo.xpNeeded,
    progress: Math.round(levelInfo.progress * 100),
    totalXP: trainer.totalXP,
    pendingPacks: trainer.pendingPacks,
    packWinCounter: trainer.packWinCounter,
    winsUntilPack: WINS_PER_PACK - trainer.packWinCounter,
    maxPendingPacks: MAX_PENDING_PACKS,
    ownedPokemon: ownedNames.length,
    totalPokemon: allPokemonDefs.length,
    pendingUnlocks,
    collection,
    dailyQuests: dailyQuests.map(q => ({
      id: q.id,
      type: q.questType,
      description: q.description,
      current: q.currentValue,
      target: q.targetValue,
      rewardXP: q.rewardXP,
      completed: q.completed,
      expiresAt: q.expiresAt.toISOString(),
    })),
    weeklyQuests: weeklyQuests.map(q => ({
      id: q.id,
      type: q.questType,
      description: q.description,
      current: q.currentValue,
      target: q.targetValue,
      rewardXP: q.rewardXP,
      rewardPack: q.rewardPack,
      completed: q.completed,
      expiresAt: q.expiresAt.toISOString(),
    })),
    stats: {
      wins: trainer.wins,
      losses: trainer.losses,
      streak: trainer.streak,
      maxStreak: trainer.maxStreak,
      ladderPoints: trainer.ladderPoints,
    },
  });
});
