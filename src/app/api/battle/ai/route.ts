/**
 * API: AI Battle
 * Start a battle against AI opponent
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

// AI Pokemon teams based on difficulty
const AI_TEAMS = {
  easy: ['pikachu', 'bulbasaur', 'squirtle'],
  normal: ['charizard', 'blastoise', 'venusaur'],
  hard: ['mewtwo', 'gengar', 'alakazam'],
};

const AI_NAMES = {
  easy: 'Youngster Joey',
  normal: 'Trainer Red',
  hard: 'Champion Blue',
};

// GET - Check if user has an active AI battle
export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  // Check for active AI battles
  const activeBattle = await prisma.battle.findFirst({
    where: {
      player1Id: userId,
      battleType: 'ai',
      status: 'active',
    },
    orderBy: {
      startedAt: 'desc',
    },
  });

  if (activeBattle) {
    return APIResponse.success({
      hasBattle: true,
      battleId: activeBattle.id,
    });
  }

  return APIResponse.success({
    hasBattle: false,
  });
});

export const POST = apiHandler(async (req: NextRequest) => {
  // Rate limit
  const ip = getClientIP(req);
  if (!rateLimit(`battle:ai:${ip}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
    throw APIErrors.tooManyRequests('Too many requests');
  }

  const { userId, username } = await requireAuth(req);

  const body = await req.json();
  const { teamPokemonIds, difficulty = 'normal' } = body;

  if (!teamPokemonIds || !Array.isArray(teamPokemonIds) || teamPokemonIds.length !== 3) {
    throw APIErrors.badRequest('You must select exactly 3 Pokemon');
  }

  // Validate difficulty
  if (!['easy', 'normal', 'hard'].includes(difficulty)) {
    throw APIErrors.badRequest('Invalid difficulty. Use: easy, normal, or hard');
  }

    // Fetch player's Pokemon
    const playerPokemon = await prisma.pokemon.findMany({
      where: { id: { in: teamPokemonIds } },
      include: { moves: true },
    });

    if (playerPokemon.length !== 3) {
      throw APIErrors.badRequest('One or more Pokemon not found');
    }

    // Fetch AI Pokemon based on difficulty
    const aiTeamNames = AI_TEAMS[difficulty as keyof typeof AI_TEAMS];
    const aiPokemon = await prisma.pokemon.findMany({
      where: { 
        name: { in: aiTeamNames.map(n => n.charAt(0).toUpperCase() + n.slice(1)) } 
      },
      include: { moves: true },
    });

    // If we don't have the specific AI Pokemon, just use first 3 available
    let finalAiTeam = aiPokemon;
    if (aiPokemon.length < 3) {
      finalAiTeam = await prisma.pokemon.findMany({
        take: 3,
        include: { moves: true },
      });
    }

    // Create battle teams first
    const team1 = await prisma.battleTeam.create({
      data: {
        name: `${username}'s Team`,
        slots: {
          create: playerPokemon.map((p, idx) => ({
            position: idx,
            pokemonId: p.id,
          })),
        },
      },
    });

    // For AI, we create a dummy trainer or use a system trainer
    // First check if AI trainer exists, if not create one
    let aiTrainer = await prisma.trainer.findFirst({
      where: { username: `AI_${difficulty}` },
    });

    if (!aiTrainer) {
      aiTrainer = await prisma.trainer.create({
        data: {
          username: `AI_${difficulty}`,
          email: `ai_${difficulty}@pokemon-arena.local`,
          password: 'not_a_real_password', // AI doesn't need real auth
          level: difficulty === 'easy' ? 5 : difficulty === 'normal' ? 20 : 50,
          experience: 0,
        },
      });
    }

    const team2 = await prisma.battleTeam.create({
      data: {
        name: `${AI_NAMES[difficulty as keyof typeof AI_NAMES]}'s Team`,
        slots: {
          create: finalAiTeam.map((p, idx) => ({
            position: idx,
            pokemonId: p.id,
          })),
        },
      },
    });

    // Create initial game state
    const initialGameState = {
      isAiBattle: true,
      aiDifficulty: difficulty,
      aiName: AI_NAMES[difficulty as keyof typeof AI_NAMES],
      player1: {
        team: playerPokemon.map((p, idx) => ({
          position: idx,
          pokemonId: p.id,
          name: p.name,
          types: p.types,
          currentHp: p.health,
          maxHp: p.health,
          status: null,
          cooldowns: {},
        })),
        energy: { electric: 0, fire: 0, water: 0, grass: 0, colorless: 1 },
      },
      player2: {
        team: finalAiTeam.map((p, idx) => ({
          position: idx,
          pokemonId: p.id,
          name: p.name,
          types: p.types,
          currentHp: p.health,
          maxHp: p.health,
          status: null,
          cooldowns: {},
        })),
        energy: { electric: 0, fire: 0, water: 0, grass: 0, colorless: 1 },
      },
      turnDeadline: Date.now() + 90000,
    };

    // Create the AI battle in database
    const battle = await prisma.battle.create({
      data: {
        status: 'active',
        player1Id: userId,
        player2Id: aiTrainer.id,
        team1Id: team1.id,
        team2Id: team2.id,
        turn: 1,
        currentPlayer: 1,
        gameState: JSON.stringify(initialGameState),
        battleType: 'ai',
      },
    });

    return APIResponse.success({
      battleId: battle.id,
      message: `Battle started against ${AI_NAMES[difficulty as keyof typeof AI_NAMES]}!`,
      opponent: {
        name: AI_NAMES[difficulty as keyof typeof AI_NAMES],
        difficulty,
        team: finalAiTeam.map(p => ({
          id: p.id,
          name: p.name,
          types: p.types,
          health: p.health,
        })),
      },
    });
});
