import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, requireAdmin } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = apiHandler(async (req: NextRequest) => {
  await requireAdmin(req);

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

  return APIResponse.success({
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
});
