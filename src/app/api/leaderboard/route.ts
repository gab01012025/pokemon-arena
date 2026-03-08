/**
 * API: Competitive Leaderboard
 * Returns top 100 players with competitive rank info
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse } from '@/lib/api-handler';
import { getRank, getTierInfo, getDivisionProgress, formatRank, type CompetitiveTier } from '@/lib/ranking';

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
  const search = searchParams.get('search') || '';
  const tierFilter = searchParams.get('tier') as CompetitiveTier | null;
  const trainerId = searchParams.get('trainerId') || '';

  const skip = (page - 1) * limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.username = { contains: search, mode: 'insensitive' };
  }
  if (tierFilter) {
    const tierInfo = getTierInfo(
      tierFilter === 'pokeball' ? 0 :
      tierFilter === 'greatball' ? 300 :
      tierFilter === 'ultraball' ? 600 :
      tierFilter === 'masterball' ? 1000 :
      1500
    );
    // Next tier starts at:
    const tierIndex = ['pokeball', 'greatball', 'ultraball', 'masterball', 'champion'].indexOf(tierFilter);
    const nextTierLP = tierIndex < 4
      ? [300, 600, 1000, 1500, 99999][tierIndex + 1]
      : 99999;
    where.ladderPoints = { gte: tierInfo.minLP, lt: nextTierLP };
  }

  // Get total count
  const total = await prisma.trainer.count({ where });

  // Get trainers sorted by LP
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

  // Get current season
  const currentSeason = await prisma.season.findFirst({
    where: { isActive: true },
    select: { id: true, name: true, number: true, startDate: true, endDate: true },
  });

  // Format with competitive rank info
  const leaderboard = trainers.map((trainer, index) => {
    const rank = getRank(trainer.ladderPoints);
    const tierInfo = getTierInfo(trainer.ladderPoints);
    const progress = getDivisionProgress(trainer.ladderPoints);
    const totalGames = trainer.wins + trainer.losses;

    return {
      position: skip + index + 1,
      id: trainer.id,
      username: trainer.username,
      avatar: trainer.avatar,
      level: trainer.level,
      lp: trainer.ladderPoints,
      wins: trainer.wins,
      losses: trainer.losses,
      winRate: totalGames > 0 ? Math.round((trainer.wins / totalGames) * 100) : 0,
      streak: trainer.streak,
      maxStreak: trainer.maxStreak,
      clan: trainer.clanMember?.clan?.name || null,
      clanTag: trainer.clanMember?.clan?.tag || null,
      // Competitive rank
      rankLabel: rank.label,
      rankTier: rank.tier,
      rankDivision: rank.division,
      rankIndex: rank.index,
      tierColor: tierInfo.color,
      tierGradient: tierInfo.gradient,
      tierGlow: tierInfo.glow,
      tierIcon: tierInfo.icon,
      // Division progress
      divisionProgress: progress.percentage,
      lpToNextDivision: progress.lpToNextDivision,
    };
  });

  // Get user's own position if requested
  let myPosition = null;
  if (trainerId) {
    const myTrainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      select: { ladderPoints: true, username: true, wins: true, losses: true, streak: true, level: true, avatar: true },
    });
    if (myTrainer) {
      const higherCount = await prisma.trainer.count({
        where: { ladderPoints: { gt: myTrainer.ladderPoints } },
      });
      const rank = getRank(myTrainer.ladderPoints);
      const tierInfo = getTierInfo(myTrainer.ladderPoints);
      const progress = getDivisionProgress(myTrainer.ladderPoints);
      const totalGames = myTrainer.wins + myTrainer.losses;

      myPosition = {
        position: higherCount + 1,
        username: myTrainer.username,
        avatar: myTrainer.avatar,
        level: myTrainer.level,
        lp: myTrainer.ladderPoints,
        wins: myTrainer.wins,
        losses: myTrainer.losses,
        winRate: totalGames > 0 ? Math.round((myTrainer.wins / totalGames) * 100) : 0,
        streak: myTrainer.streak,
        rankLabel: rank.label,
        rankTier: rank.tier,
        rankDivision: rank.division,
        tierColor: tierInfo.color,
        tierGradient: tierInfo.gradient,
        tierIcon: tierInfo.icon,
        divisionProgress: progress.percentage,
        lpToNextDivision: progress.lpToNextDivision,
      };
    }
  }

  return APIResponse.success({
    leaderboard,
    myPosition,
    season: currentSeason,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
