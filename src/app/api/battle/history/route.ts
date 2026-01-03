/**
 * Match History API - Get recent battles
 * GET /api/battle/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pokemon-arena-secret-key-2024'
);

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify JWT
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
    const trainerId = payload.trainerId as string;

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get battles where the trainer was player1 or player2
    const battles = await prisma.battle.findMany({
      where: {
        OR: [
          { player1Id: trainerId },
          { player2Id: trainerId }
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
      const isPlayer1 = battle.player1.id === trainerId;
      const won = battle.winnerId === trainerId;
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
          { player1Id: trainerId },
          { player2Id: trainerId }
        ],
        status: 'finished'
      }
    });

    return NextResponse.json({
      history,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get battle history error:', error);
    return NextResponse.json({ error: 'Failed to get battle history' }, { status: 500 });
  }
}
