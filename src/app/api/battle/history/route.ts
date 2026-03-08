/**
 * Match History API - Get recent battles
 * GET /api/battle/history
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth } from '@/lib/api-handler';

export const GET = apiHandler(async (request: NextRequest) => {
  const { userId } = await requireAuth(request);

  // Get query params for pagination
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  // Get trainer to find their ID mapping
  const trainer = await prisma.trainer.findFirst({
    where: { id: userId },
    select: { id: true },
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

  // Get battles where the trainer was player1 or player2
  const battles = await prisma.battle.findMany({
    where: {
      OR: [
        { player1Id: trainer.id },
        { player2Id: trainer.id }
      ],
      status: 'finished'
    },
    orderBy: {
      finishedAt: 'desc'
    },
    take: limit,
    skip: offset,
    select: {
      id: true,
      status: true,
      turn: true,
      battleType: true,
      startedAt: true,
      finishedAt: true,
      winnerId: true,
      player1: {
        select: {
          id: true,
          username: true,
          level: true,
          avatar: true
        }
      },
      player2: {
        select: {
          id: true,
          username: true,
          level: true,
          avatar: true
        }
      }
    }
  });

  // Transform battles to include win/loss info
  const history = battles.map(battle => {
    const isPlayer1 = battle.player1.id === trainer.id;
    const won = battle.winnerId === trainer.id;
    const opponent = isPlayer1 ? battle.player2 : battle.player1;

    return {
      id: battle.id,
      opponent: {
        username: opponent.username,
        level: opponent.level,
        avatar: opponent.avatar
      },
      result: won ? 'victory' : 'defeat',
      turns: battle.turn,
      battleType: battle.battleType,
      date: battle.finishedAt,
      duration: battle.startedAt && battle.finishedAt
        ? Math.floor((new Date(battle.finishedAt).getTime() - new Date(battle.startedAt).getTime()) / 1000)
        : null
    };
  });

  // Get total count for pagination
  const totalCount = await prisma.battle.count({
    where: {
      OR: [
        { player1Id: trainer.id },
        { player2Id: trainer.id }
      ],
      status: 'finished'
    }
  });

  return APIResponse.success({
    history,
    pagination: {
      total: totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount
    }
  });
});
