/**
 * Missions/Quests API
 * GET  /api/progression/missions - Get active daily/weekly quests (auto-assign if expired)
 * POST /api/progression/missions - Claim completed quest reward
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import {
  pickDailyQuests,
  pickWeeklyQuests,
  getEndOfDayUTC,
  getEndOfWeekUTC,
} from '@/lib/progression';

/**
 * Ensure trainer has active daily & weekly quests.
 * If their quests have expired, assign new ones.
 */
async function ensureQuests(trainerId: string) {
  const now = new Date();

  // Check daily quests
  const activeDailies = await prisma.dailyQuest.findMany({
    where: { trainerId, expiresAt: { gt: now } },
  });

  if (activeDailies.length === 0) {
    // Clean up old expired quests
    await prisma.dailyQuest.deleteMany({
      where: { trainerId, expiresAt: { lte: now } },
    });

    // Assign new daily quests
    const dailyDefs = pickDailyQuests();
    const expiresAt = getEndOfDayUTC();

    await prisma.dailyQuest.createMany({
      data: dailyDefs.map(d => ({
        trainerId,
        questType: d.questType,
        description: d.description,
        targetValue: d.targetValue,
        rewardXP: d.rewardXP,
        expiresAt,
      })),
    });
  }

  // Check weekly quests
  const activeWeeklies = await prisma.weeklyQuest.findMany({
    where: { trainerId, expiresAt: { gt: now } },
  });

  if (activeWeeklies.length === 0) {
    await prisma.weeklyQuest.deleteMany({
      where: { trainerId, expiresAt: { lte: now } },
    });

    const weeklyDefs = pickWeeklyQuests();
    const expiresAt = getEndOfWeekUTC();

    await prisma.weeklyQuest.createMany({
      data: weeklyDefs.map(w => ({
        trainerId,
        questType: w.questType,
        description: w.description,
        targetValue: w.targetValue,
        rewardXP: w.rewardXP,
        rewardPack: w.rewardPack,
        expiresAt,
      })),
    });
  }
}

export const GET = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`missions:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  // Ensure quests exist
  await ensureQuests(userId);

  const now = new Date();
  const [dailyQuests, weeklyQuests] = await Promise.all([
    prisma.dailyQuest.findMany({
      where: { trainerId: userId, expiresAt: { gt: now } },
      orderBy: { assignedAt: 'desc' },
    }),
    prisma.weeklyQuest.findMany({
      where: { trainerId: userId, expiresAt: { gt: now } },
      orderBy: { assignedAt: 'desc' },
    }),
  ]);

  return APIResponse.success({
    dailyQuests: dailyQuests.map(q => ({
      id: q.id,
      type: q.questType,
      description: q.description,
      current: q.currentValue,
      target: q.targetValue,
      rewardXP: q.rewardXP,
      completed: q.completed,
      expiresAt: q.expiresAt.toISOString(),
    })),
    weeklyQuests: weeklyQuests.map(q => ({
      id: q.id,
      type: q.questType,
      description: q.description,
      current: q.currentValue,
      target: q.targetValue,
      rewardXP: q.rewardXP,
      rewardPack: q.rewardPack,
      completed: q.completed,
      expiresAt: q.expiresAt.toISOString(),
    })),
  });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`mission-claim:${ip}`, 30, 60000)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const body = await req.json();
  const { questId, questType } = body as { questId: string; questType: 'daily' | 'weekly' };

  if (!questId || !questType) {
    throw APIErrors.badRequest('questId and questType are required');
  }

  if (questType === 'daily') {
    const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } });
    if (!quest || quest.trainerId !== userId) throw APIErrors.notFound('Quest not found');
    if (!quest.completed) throw APIErrors.badRequest('Quest not yet completed');

    // Grant XP reward
    await prisma.trainer.update({
      where: { id: userId },
      data: {
        totalXP: { increment: quest.rewardXP },
        experience: { increment: quest.rewardXP },
      },
    });

    // Delete the claimed quest
    await prisma.dailyQuest.delete({ where: { id: questId } });

    return APIResponse.success({ xpGained: quest.rewardXP, questType: 'daily' });
  } else {
    const quest = await prisma.weeklyQuest.findUnique({ where: { id: questId } });
    if (!quest || quest.trainerId !== userId) throw APIErrors.notFound('Quest not found');
    if (!quest.completed) throw APIErrors.badRequest('Quest not yet completed');

    // Grant rewards
    const updates: Record<string, { increment: number }> = {
      totalXP: { increment: quest.rewardXP },
      experience: { increment: quest.rewardXP },
    };
    if (quest.rewardPack) {
      updates.pendingPacks = { increment: 1 };
    }

    await prisma.trainer.update({
      where: { id: userId },
      data: updates,
    });

    await prisma.weeklyQuest.delete({ where: { id: questId } });

    return APIResponse.success({
      xpGained: quest.rewardXP,
      packEarned: quest.rewardPack,
      questType: 'weekly',
    });
  }
});
