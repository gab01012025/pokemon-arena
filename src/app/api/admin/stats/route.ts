import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// List of admin usernames (all lowercase for comparison)
const ADMIN_USERS = ['admin', 'gab01012025', 'gabriel', 'gab1234'];

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Check if user is admin (case insensitive)
    const username = session.user?.username?.toLowerCase() || '';
    if (!ADMIN_USERS.includes(username)) {
      return NextResponse.json({ 
        error: `Acesso negado. Usuário "${session.user?.username}" não é administrador.` 
      }, { status: 403 });
    }

    // Get all stats
    const [
      totalTrainers,
      totalBattles,
      activeBattles,
      totalPokemon,
      totalClans,
      totalMissions,
      recentTrainers,
      recentBattles,
      topPlayers,
      battlesByType
    ] = await Promise.all([
      prisma.trainer.count(),
      prisma.battle.count(),
      prisma.battle.count({ where: { status: 'active' } }),
      prisma.pokemon.count(),
      prisma.clan.count(),
      prisma.mission.count(),
      prisma.trainer.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          level: true,
          wins: true,
          losses: true,
          createdAt: true
        }
      }),
      prisma.battle.findMany({
        take: 10,
        orderBy: { startedAt: 'desc' },
        include: {
          player1: { select: { username: true } },
          player2: { select: { username: true } },
          winner: { select: { username: true } }
        }
      }),
      prisma.trainer.findMany({
        take: 10,
        orderBy: { ladderPoints: 'desc' },
        select: {
          id: true,
          username: true,
          level: true,
          wins: true,
          losses: true,
          ladderPoints: true
        }
      }),
      prisma.battle.groupBy({
        by: ['battleType'],
        _count: { id: true }
      })
    ]);

    // Calculate win rate average
    const trainersWithBattles = await prisma.trainer.findMany({
      where: { OR: [{ wins: { gt: 0 } }, { losses: { gt: 0 } }] },
      select: { wins: true, losses: true }
    });

    const avgWinRate = trainersWithBattles.length > 0
      ? trainersWithBattles.reduce((acc, t) => {
          const total = t.wins + t.losses;
          return total > 0 ? acc + (t.wins / total) : acc;
        }, 0) / trainersWithBattles.length * 100
      : 0;

    return NextResponse.json({
      stats: {
        totalTrainers,
        totalBattles,
        activeBattles,
        totalPokemon,
        totalClans,
        totalMissions,
        avgWinRate: avgWinRate.toFixed(1)
      },
      recentTrainers,
      recentBattles,
      topPlayers,
      battlesByType
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
