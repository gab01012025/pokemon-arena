import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      level: true,
      experience: true,
      wins: true,
      losses: true,
      ladderPoints: true,
      createdAt: true,
      clanMember: {
        select: {
          clan: {
            select: {
              id: true,
              name: true,
              tag: true,
            },
          },
        },
      },
      unlockedPokemon: {
        where: {
          isActive: true,
        },
        orderBy: {
          position: 'asc',
        },
        select: {
          id: true,
          isActive: true,
          position: true,
          pokemon: {
            select: {
              id: true,
              name: true,
              types: true,
              health: true,
              moves: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  damage: true,
                  cooldown: true,
                  cost: true,
                  effects: true,
                  target: true,
                  slot: true,
                },
                orderBy: {
                  slot: 'asc',
                },
              },
            },
          },
        },
        take: 3,
      },
    },
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

  const recentBattles = await prisma.battle.findMany({
    where: {
      OR: [
        { player1Id: userId },
        { player2Id: userId },
      ],
      status: 'finished',
    },
    take: 10,
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      winnerId: true,
      startedAt: true,
      player1: {
        select: { id: true, username: true },
      },
      player2: {
        select: { id: true, username: true },
      },
    },
  });

  const formattedBattles = recentBattles.map((battle) => {
    const isWinner = battle.winnerId === userId;
    const opponent = battle.player1.id === userId ? battle.player2 : battle.player1;
    
    return {
      id: battle.id,
      result: isWinner ? 'win' : 'loss',
      opponent: opponent?.username || 'Unknown',
      date: battle.startedAt.toISOString(),
    };
  });

  const formattedTeam = trainer.unlockedPokemon.length >= 3 ? {
    id: 'current',
    name: 'Meu Time',
    pokemon: trainer.unlockedPokemon.slice(0, 3).map((up, index) => ({
      id: up.id,
      slot: index,
      pokemon: {
        id: up.pokemon.id,
        name: up.pokemon.name,
        type: JSON.parse(up.pokemon.types)[0] || 'normal',
        hp: up.pokemon.health,
        attack: 80,
        defense: 70,
        speed: 60,
        moves: (up.pokemon.moves || []).map(m => ({
          id: m.id,
          name: m.name,
          description: m.description || '',
          type: (() => {
            try { return JSON.parse(up.pokemon.types)[0] || 'normal'; } 
            catch { return 'normal'; }
          })(),
          power: m.damage || 10,
          cooldown: m.cooldown || 0,
        })),
      },
    })),
  } : null;

  return APIResponse.success({
    id: trainer.id,
    username: trainer.username,
    email: trainer.email,
    level: trainer.level,
    experience: trainer.experience,
    wins: trainer.wins,
    losses: trainer.losses,
    ladderPoints: trainer.ladderPoints,
    createdAt: trainer.createdAt,
    clan: trainer.clanMember?.clan || null,
    team: formattedTeam,
    recentBattles: formattedBattles,
  });
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`trainer-profile-patch:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const body = await req.json();
  const { username } = body;

  if (username) {
    if (username.length < 3 || username.length > 20) {
      throw APIErrors.badRequest('Username deve ter entre 3 e 20 caracteres');
    }

    const existingTrainer = await prisma.trainer.findFirst({
      where: { 
        username, 
        NOT: { id: userId } 
      },
    });

    if (existingTrainer) {
      throw APIErrors.conflict('Username já está em uso');
    }
  }

  const updatedTrainer = await prisma.trainer.update({
    where: { id: userId },
    data: {
      ...(username && { username }),
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  return APIResponse.success(updatedTrainer);
});
