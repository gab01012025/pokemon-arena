/**
 * API: Select Initial Team
 * Save trainer's initial Pokemon selection using TrainerPokemon model
 * Note: Team model is for Clans, BattleTeam/BattleSlot for battle teams
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`select-team-post:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const body = await req.json();
  const { pokemonIds } = body;

  if (!pokemonIds || !Array.isArray(pokemonIds) || pokemonIds.length !== 3) {
    throw APIErrors.badRequest('You must select exactly 3 Pokémon');
  }

  const pokemon = await prisma.pokemon.findMany({
    where: { 
      id: { in: pokemonIds },
      isStarter: true,
    },
  });

  if (pokemon.length !== 3) {
    throw APIErrors.badRequest('Invalid Pokémon selection. Please select 3 starter Pokémon.');
  }

  const existingPokemon = await prisma.trainerPokemon.findMany({
    where: { trainerId: userId },
  });

  if (existingPokemon.length > 0) {
    throw APIErrors.badRequest('You already have Pokémon selected');
  }

  await prisma.trainerPokemon.createMany({
    data: pokemonIds.map((pokemonId: string, index: number) => ({
      trainerId: userId,
      pokemonId: pokemonId,
      isActive: true,
      position: index,
    })),
  });

  return APIResponse.success({
    message: 'Team selected successfully!',
    pokemon: pokemon.map(p => ({ id: p.id, name: p.name })),
  });
});

export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const trainerPokemon = await prisma.trainerPokemon.findMany({
    where: { trainerId: userId },
    include: {
      pokemon: {
        include: {
          moves: {
            orderBy: { slot: 'asc' },
          },
        },
      },
    },
    orderBy: [
      { isActive: 'desc' },
      { position: 'asc' },
      { unlockedAt: 'asc' },
    ],
  });

  if (trainerPokemon.length === 0) {
    return APIResponse.success({ hasTeam: false });
  }

  return APIResponse.success({
    hasTeam: true,
    pokemon: trainerPokemon.map(tp => ({
      id: tp.pokemon.id,
      name: tp.pokemon.name,
      description: tp.pokemon.description,
      types: JSON.parse(tp.pokemon.types),
      health: tp.pokemon.health,
      moves: tp.pokemon.moves,
      unlockedAt: tp.unlockedAt,
      isActive: tp.isActive,
      position: tp.position,
    })),
  });
});
