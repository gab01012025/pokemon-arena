import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAdmin, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = apiHandler(async (req: NextRequest) => {
  await requireAdmin(req);

  const pokemon = await prisma.pokemon.findMany({
    orderBy: { name: 'asc' },
    include: {
      moves: true,
      _count: {
        select: { trainers: true }
      }
    }
  });

  return APIResponse.success({ pokemon });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-pokemon-post:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  await requireAdmin(req);

  const data = await req.json();

  const pokemon = await prisma.pokemon.create({
    data: {
      name: data.name,
      description: data.description || '',
      types: JSON.stringify(data.types || []),
      category: data.category || 'Normal',
      health: data.health || 100,
      traits: JSON.stringify(data.traits || []),
      isStarter: data.isStarter || false,
      unlockCost: data.unlockCost || 0
    }
  });

  return APIResponse.created({ pokemon });
});

export const DELETE = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-pokemon-delete:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  await requireAdmin(req);

  const { pokemonId } = await req.json();

  if (!pokemonId) {
    throw APIErrors.badRequest('ID do pokémon é obrigatório');
  }

  await prisma.trainerPokemon.deleteMany({ where: { pokemonId } });
  await prisma.move.deleteMany({ where: { pokemonId } });
  await prisma.battleSlot.deleteMany({ where: { pokemonId } });
  await prisma.pokemon.delete({ where: { id: pokemonId } });

  return APIResponse.success({ message: 'Pokémon deletado com sucesso' });
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-pokemon-patch:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  await requireAdmin(req);

  const { pokemonId, updates } = await req.json();

  if (!pokemonId || !updates) {
    throw APIErrors.badRequest('Dados incompletos');
  }

  const allowedUpdates: Record<string, unknown> = {};
  
  if (updates.name) allowedUpdates.name = updates.name;
  if (updates.description) allowedUpdates.description = updates.description;
  if (updates.health !== undefined) allowedUpdates.health = parseInt(updates.health);
  if (updates.unlockCost !== undefined) allowedUpdates.unlockCost = parseInt(updates.unlockCost);
  if (updates.isStarter !== undefined) allowedUpdates.isStarter = updates.isStarter;
  if (updates.types) allowedUpdates.types = JSON.stringify(updates.types);
  if (updates.category) allowedUpdates.category = updates.category;

  const updatedPokemon = await prisma.pokemon.update({
    where: { id: pokemonId },
    data: allowedUpdates
  });

  return APIResponse.success({ pokemon: updatedPokemon });
});
