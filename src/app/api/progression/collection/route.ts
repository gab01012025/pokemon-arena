/**
 * Collection API
 * GET /api/progression/collection - Full Pokemon collection with lock/unlock status
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { ALL_UNLOCK_DEFS, isPokemonUnlocked, levelFromTotalXP } from '@/lib/progression';

export const GET = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`collection:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      totalXP: true,
      maxStreak: true,
      unlockedPokemon: {
        select: {
          pokemonId: true,
          obtainedMethod: true,
          isNew: true,
          unlockedAt: true,
          pokemon: {
            select: {
              id: true,
              name: true,
              types: true,
              category: true,
              health: true,
              description: true,
            },
          },
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

  const levelInfo = levelFromTotalXP(trainer.totalXP);
  const achievementCodes = trainer.achievements.map(a => a.code);
  const ownedMap = new Map(
    trainer.unlockedPokemon.map(up => [up.pokemon.name.toLowerCase(), up])
  );

  // Get all Pokemon from DB for complete data
  const allDbPokemon = await prisma.pokemon.findMany({
    select: {
      id: true,
      name: true,
      types: true,
      category: true,
      health: true,
      description: true,
    },
  });

  const collection = allDbPokemon.map(poke => {
    const owned = ownedMap.get(poke.name.toLowerCase());
    const unlockDef = ALL_UNLOCK_DEFS.find(d => d.pokemonName.toLowerCase() === poke.name.toLowerCase());
    const canUnlock = unlockDef
      ? isPokemonUnlocked(poke.name, levelInfo.level, trainer.maxStreak, achievementCodes)
      : false;

    return {
      id: poke.id,
      name: poke.name,
      types: poke.types,
      category: poke.category,
      health: poke.health,
      description: owned ? poke.description : null, // Hide description for locked
      owned: !!owned,
      isNew: owned?.isNew ?? false,
      obtainedMethod: owned?.obtainedMethod ?? null,
      unlockedAt: owned?.unlockedAt?.toISOString() ?? null,
      canUnlock: !owned && canUnlock,
      unlockMethod: unlockDef?.method ?? null,
      unlockRequirement: unlockDef?.requirement ?? null,
      unlockDescription: unlockDef?.description ?? 'Card Pack exclusive',
    };
  });

  // Sort: owned first, then by unlock level
  collection.sort((a, b) => {
    if (a.owned && !b.owned) return -1;
    if (!a.owned && b.owned) return 1;
    if (a.canUnlock && !b.canUnlock) return -1;
    if (!a.canUnlock && b.canUnlock) return 1;
    return a.name.localeCompare(b.name);
  });

  return APIResponse.success({
    collection,
    stats: {
      owned: collection.filter(c => c.owned).length,
      total: collection.length,
      percentage: Math.round((collection.filter(c => c.owned).length / collection.length) * 100),
    },
    level: levelInfo.level,
  });
});
