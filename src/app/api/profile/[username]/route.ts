/**
 * API: User Profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Get trainer with all related data (SQLite case-insensitive workaround)
    const trainer = await prisma.trainer.findFirst({
      where: { 
        username: username
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        createdAt: true,
        level: true,
        experience: true,
        wins: true,
        losses: true,
        streak: true,
        maxStreak: true,
        ladderPoints: true,
        clanMember: {
          select: {
            role: true,
            joinedAt: true,
            clan: {
              select: {
                id: true,
                name: true,
                tag: true,
              }
            }
          }
        },
        unlockedPokemon: {
          select: {
            unlockedAt: true,
            pokemon: {
              select: {
                id: true,
                name: true,
                types: true,
              }
            }
          },
          orderBy: { unlockedAt: 'desc' },
          take: 10
        },
        missions: {
          where: { status: 'completed' },
          select: {
            completedAt: true,
            mission: {
              select: {
                name: true,
                category: true,
              }
            }
          },
          orderBy: { completedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!trainer) {
      return NextResponse.json(
        { error: 'Trainer not found' },
        { status: 404 }
      );
    }

    // Get recent battles
    const recentBattles = await prisma.battle.findMany({
      where: {
        OR: [
          { player1Id: trainer.id },
          { player2Id: trainer.id }
        ],
        status: 'finished'
      },
      select: {
        id: true,
        winnerId: true,
        finishedAt: true,
        battleType: true,
        player1: { select: { username: true } },
        player2: { select: { username: true } },
        player1Id: true,
        player2Id: true,
      },
      orderBy: { finishedAt: 'desc' },
      take: 10
    });

    // Calculate rank
    const rank = await prisma.trainer.count({
      where: { ladderPoints: { gt: trainer.ladderPoints } }
    }) + 1;

    // Format response
    const profile = {
      id: trainer.id,
      username: trainer.username,
      avatar: trainer.avatar,
      level: trainer.level,
      experience: trainer.experience,
      rank,
      stats: {
        wins: trainer.wins,
        losses: trainer.losses,
        winRate: trainer.wins + trainer.losses > 0 
          ? Math.round((trainer.wins / (trainer.wins + trainer.losses)) * 100) 
          : 0,
        streak: trainer.streak,
        maxStreak: trainer.maxStreak,
        ladderPoints: trainer.ladderPoints,
      },
      clan: trainer.clanMember ? {
        id: trainer.clanMember.clan.id,
        name: trainer.clanMember.clan.name,
        tag: trainer.clanMember.clan.tag,
        role: trainer.clanMember.role,
        joinedAt: trainer.clanMember.joinedAt,
      } : null,
      unlockedPokemon: trainer.unlockedPokemon.map(up => ({
        ...up.pokemon,
        types: JSON.parse(up.pokemon.types),
        unlockedAt: up.unlockedAt,
      })),
      recentMissions: trainer.missions.map(tm => ({
        name: tm.mission.name,
        category: tm.mission.category,
        completedAt: tm.completedAt,
      })),
      recentBattles: recentBattles.map(b => ({
        id: b.id,
        result: b.winnerId === trainer.id ? 'win' : 'loss',
        opponent: b.player1Id === trainer.id ? b.player2.username : b.player1.username,
        type: b.battleType,
        date: b.finishedAt,
      })),
      joinDate: trainer.createdAt,
    };

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
