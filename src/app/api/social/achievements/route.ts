import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, requireAuth } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS, getAchievementDef } from '@/lib/achievements';

// GET /api/social/achievements — Get my achievements
export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const unlocked = await prisma.achievement.findMany({
    where: { trainerId: userId },
    select: { code: true, unlockedAt: true },
    orderBy: { unlockedAt: 'desc' },
  });

  const unlockedMap = new Map(unlocked.map(a => [a.code, a.unlockedAt]));

  const achievements = ACHIEVEMENTS.map(def => ({
    code: def.code,
    name: def.name,
    description: def.description,
    icon: def.icon,
    category: def.category,
    unlocked: unlockedMap.has(def.code),
    unlockedAt: unlockedMap.get(def.code)?.toISOString() || null,
  }));

  return APIResponse.success({
    total: ACHIEVEMENTS.length,
    unlocked: unlocked.length,
    achievements,
  });
});
