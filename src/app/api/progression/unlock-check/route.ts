/**
 * Unlock Check API
 * POST /api/progression/unlock-check - Grant newly qualified Pokemon unlocks after level-up/streak/achievement
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { checkPokemonUnlocks, levelFromTotalXP } from '@/lib/progression';

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`unlock-check:${ip}`, 20, 60000)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      totalXP: true,
      maxStreak: true,
      unlockedPokemon: {
        select: { pokemon: { select: { name: true } } },
      },
      achievements: {
        select: { code: true },
      },
    },
  });

  if (!trainer) throw APIErrors.notFound('Trainer not found');

  const levelInfo = levelFromTotalXP(trainer.totalXP);
  const ownedNames = trainer.unlockedPokemon.map(up => up.pokemon.name);
  const achievementCodes = trainer.achievements.map(a => a.code);

  const newUnlocks = checkPokemonUnlocks(
    levelInfo.level,
    trainer.maxStreak,
    achievementCodes,
    ownedNames,
  );

  // Grant new unlocks
  const granted: string[] = [];
  for (const unlock of newUnlocks) {
    const pokemon = await prisma.pokemon.findFirst({
      where: { name: { equals: unlock.pokemonName, mode: 'insensitive' } },
    });

    if (pokemon) {
      try {
        await prisma.trainerPokemon.create({
          data: {
            trainerId: userId,
            pokemonId: pokemon.id,
            obtainedMethod: unlock.method,
            isNew: true,
          },
        });
        granted.push(unlock.pokemonName);
      } catch {
        // Already owned
      }
    }
  }

  return APIResponse.success({
    newUnlocks: granted,
    totalOwned: ownedNames.length + granted.length,
    level: levelInfo.level,
  });
});
