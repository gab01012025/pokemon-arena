/**
 * API: Trainer Ladder (Ranking)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where = search 
      ? { username: { contains: search } }
      : {};

    // Get total count
    const total = await prisma.trainer.count({ where });

    // Get trainers sorted by ladder points
    const trainers = await prisma.trainer.findMany({
      where,
      select: {
        id: true,
        username: true,
        avatar: true,
        level: true,
        wins: true,
        losses: true,
        streak: true,
        maxStreak: true,
        ladderPoints: true,
        clanMember: {
          select: {
            clan: {
              select: {
                name: true,
                tag: true,
              }
            }
          }
        }
      },
      orderBy: [
        { ladderPoints: 'desc' },
        { wins: 'desc' },
        { streak: 'desc' }
      ],
      skip,
      take: limit,
    });

    // Format response with ranks
    const ladder = trainers.map((trainer, index) => ({
      rank: skip + index + 1,
      id: trainer.id,
      username: trainer.username,
      avatar: trainer.avatar,
      level: trainer.level,
      wins: trainer.wins,
      losses: trainer.losses,
      winRate: trainer.wins + trainer.losses > 0 
        ? Math.round((trainer.wins / (trainer.wins + trainer.losses)) * 100) 
        : 0,
      streak: trainer.streak,
      maxStreak: trainer.maxStreak,
      ladderPoints: trainer.ladderPoints,
      clan: trainer.clanMember?.clan?.name || null,
      clanTag: trainer.clanMember?.clan?.tag || null,
    }));

    return NextResponse.json({
      trainers: ladder,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Ladder fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ladder' },
      { status: 500 }
    );
  }
}
