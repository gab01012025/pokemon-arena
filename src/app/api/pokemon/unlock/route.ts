import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

// GET - Listar Pokémon disponíveis para desbloquear
export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const unlockedPokemon = await prisma.trainerPokemon.findMany({
    where: { trainerId: userId },
    select: { pokemonId: true },
  });

  const unlockedIds = new Set(unlockedPokemon.map(tp => tp.pokemonId));

  const allPokemon = await prisma.pokemon.findMany({
    include: {
      moves: {
        select: {
          id: true,
          name: true,
          description: true,
          damage: true,
          cooldown: true,
        }
      }
    },
    orderBy: [
      { category: 'asc' },
      { unlockCost: 'asc' },
      { name: 'asc' }
    ]
  });

  const formattedPokemon = allPokemon.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    types: JSON.parse(p.types),
    category: p.category,
    health: p.health,
    traits: JSON.parse(p.traits),
    isStarter: p.isStarter,
    unlockCost: p.unlockCost,
    isUnlocked: unlockedIds.has(p.id),
    moves: p.moves,
  }));

  const grouped = formattedPokemon.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof formattedPokemon>);

  return APIResponse.success({
    pokemon: formattedPokemon,
    grouped,
    categories: Object.keys(grouped),
    unlockedCount: unlockedIds.size,
    totalCount: allPokemon.length,
  });
});

// POST - Desbloquear um Pokémon
export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const ip = getClientIP(req);
  if (!rateLimit(`unlock-pokemon:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { pokemonId } = await req.json();

  if (!pokemonId) {
    throw APIErrors.badRequest('pokemonId is required');
  }

  const pokemon = await prisma.pokemon.findUnique({
    where: { id: pokemonId },
  });

  if (!pokemon) {
    throw APIErrors.notFound('Pokemon not found');
  }

  const existing = await prisma.trainerPokemon.findUnique({
    where: {
      trainerId_pokemonId: {
        trainerId: userId,
        pokemonId,
      },
    },
  });

  if (existing) {
    throw APIErrors.badRequest('Pokemon already unlocked');
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: { level: true, experience: true },
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

  const xpCost = pokemon.unlockCost;

  if (xpCost > 0 && trainer.experience < xpCost) {
    throw APIErrors.badRequest(`XP insuficiente. Necessário: ${xpCost}, Você tem: ${trainer.experience}`);
  }

  await prisma.trainerPokemon.create({
    data: {
      trainerId: userId,
      pokemonId,
    },
  });

  if (xpCost > 0) {
    await prisma.trainer.update({
      where: { id: userId },
      data: {
        experience: trainer.experience - xpCost,
      },
    });
  }

  return APIResponse.success({
    message: `${pokemon.name} desbloqueado com sucesso!`,
    pokemon: {
      id: pokemon.id,
      name: pokemon.name,
      types: JSON.parse(pokemon.types),
    },
    xpSpent: xpCost,
    xpRemaining: trainer.experience - xpCost,
  });
});
