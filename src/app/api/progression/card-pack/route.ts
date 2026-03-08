/**
 * Card Pack API
 * POST /api/progression/card-pack - Open a card pack
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { generatePackCards, levelFromTotalXP, type PackCard } from '@/lib/progression';

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`card-pack:${ip}`, 10, 60000)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      id: true,
      pendingPacks: true,
      totalXP: true,
      unlockedPokemon: {
        select: { pokemon: { select: { name: true, id: true } } },
      },
    },
  });

  if (!trainer) throw APIErrors.notFound('Trainer not found');
  if (trainer.pendingPacks <= 0) throw APIErrors.badRequest('No packs available to open');

  // Generate pack contents
  const ownedNames = trainer.unlockedPokemon.map(up => up.pokemon.name);
  const cards = generatePackCards(ownedNames);

  // Calculate duplicate XP bonus
  const duplicateXP = cards.reduce((sum, c) => sum + c.duplicateXP, 0);

  // Process pack opening in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Decrement pending packs
    await tx.trainer.update({
      where: { id: userId },
      data: {
        pendingPacks: { decrement: 1 },
        totalXP: { increment: duplicateXP },
        experience: { increment: duplicateXP },
      },
    });

    // Unlock new Pokemon from pack
    const unlockedNew: string[] = [];
    for (const card of cards) {
      if (!card.isDuplicate) {
        // Find the Pokemon in DB
        const pokemon = await tx.pokemon.findFirst({
          where: { name: { equals: card.pokemonName, mode: 'insensitive' } },
        });
        if (pokemon) {
          try {
            await tx.trainerPokemon.create({
              data: {
                trainerId: userId,
                pokemonId: pokemon.id,
                obtainedMethod: 'pack',
                isNew: true,
              },
            });
            unlockedNew.push(card.pokemonName);
          } catch {
            // Already owned (race condition) — treat as duplicate
            card.isDuplicate = true;
            card.duplicateXP = 5;
          }
        }
      }
    }

    // Determine pack rarity by best card
    const rarityOrder = ['common', 'uncommon', 'rare', 'ultra_rare'];
    const bestRarity = cards.reduce((best, c) => {
      return rarityOrder.indexOf(c.rarity) > rarityOrder.indexOf(best) ? c.rarity : best;
    }, 'common' as string);

    // Save card pack record
    await tx.cardPack.create({
      data: {
        trainerId: userId,
        rarity: bestRarity,
        contents: JSON.stringify(cards),
      },
    });

    return { cards, unlockedNew, duplicateXP, bestRarity };
  });

  // Recalculate level after XP changes
  const updatedTrainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: { totalXP: true, level: true },
  });
  const levelInfo = updatedTrainer ? levelFromTotalXP(updatedTrainer.totalXP) : null;

  return APIResponse.success({
    cards: result.cards.map(c => ({
      pokemonName: c.pokemonName,
      rarity: c.rarity,
      isDuplicate: c.isDuplicate,
      duplicateXP: c.duplicateXP,
    })),
    newUnlocks: result.unlockedNew,
    duplicateXPGained: result.duplicateXP,
    packRarity: result.bestRarity,
    remainingPacks: (trainer.pendingPacks - 1),
    level: levelInfo?.level,
    currentLevelXP: levelInfo?.currentLevelXP,
    xpToNextLevel: levelInfo?.xpNeeded,
  });
});
