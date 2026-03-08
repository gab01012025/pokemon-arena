/**
 * API: Battle Team Management
 * GET: Returns the current active battle team (3 Pokemon)
 * PUT: Updates which Pokemon are in the active battle team
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const battleTeam = await prisma.trainerPokemon.findMany({
    where: { 
      trainerId: userId,
      isActive: true,
    },
    orderBy: { position: 'asc' },
    include: {
      pokemon: {
        include: {
          moves: {
            orderBy: { slot: 'asc' },
          },
        },
      },
    },
    take: 3,
  });

  return APIResponse.success({
    battleTeam: battleTeam.map((tp) => ({
      id: tp.id,
      position: tp.position,
      pokemon: {
        id: tp.pokemon.id,
        name: tp.pokemon.name,
        types: JSON.parse(tp.pokemon.types),
        health: tp.pokemon.health,
        description: tp.pokemon.description,
        moves: tp.pokemon.moves.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          damage: m.damage,
          cooldown: m.cooldown,
          cost: m.cost,
          effects: m.effects,
          target: m.target,
          slot: m.slot,
        })),
      },
    })),
  });
});

export const PUT = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`battle-team-put:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const body = await req.json();
  const { pokemonIds } = body;

  if (!pokemonIds || !Array.isArray(pokemonIds) || pokemonIds.length !== 3) {
    throw APIErrors.badRequest('You must select exactly 3 Pokémon for your battle team');
  }

  const trainerPokemon = await prisma.trainerPokemon.findMany({
    where: { 
      trainerId: userId,
      pokemonId: { in: pokemonIds },
    },
  });

  if (trainerPokemon.length !== 3) {
    throw APIErrors.badRequest('You can only select Pokémon that you have unlocked');
  }

  await prisma.trainerPokemon.updateMany({
    where: { trainerId: userId },
    data: { isActive: false, position: -1 },
  });

  for (let i = 0; i < pokemonIds.length; i++) {
    await prisma.trainerPokemon.updateMany({
      where: { 
        trainerId: userId,
        pokemonId: pokemonIds[i],
      },
      data: { 
        isActive: true, 
        position: i,
      },
    });
  }

  const updatedTeam = await prisma.trainerPokemon.findMany({
    where: { 
      trainerId: userId,
      isActive: true,
    },
    orderBy: { position: 'asc' },
    include: {
      pokemon: {
        select: { id: true, name: true },
      },
    },
  });

  return APIResponse.success({
    message: 'Battle team updated successfully!',
    battleTeam: updatedTeam.map((tp) => ({
      position: tp.position,
      pokemonId: tp.pokemonId,
      pokemonName: tp.pokemon.name,
    })),
  });
});
