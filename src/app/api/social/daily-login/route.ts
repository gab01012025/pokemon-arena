import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, requireAuth, rateLimit, getClientIP } from '@/lib/api-handler';
import { claimDailyLogin, DAILY_REWARDS } from '@/lib/social';
import { checkLoginAchievements } from '@/lib/achievements';
import { prisma } from '@/lib/prisma';

// POST /api/social/daily-login — Claim daily login bonus
export const POST = apiHandler(async (req: NextRequest) => {
  const clientIP = getClientIP(req);
  if (!rateLimit(`social:daily:${clientIP}`, 10, 60_000)) {
    throw new Error('Too many requests');
  }

  const { userId } = await requireAuth(req);
  const result = await claimDailyLogin(userId);

  // Check for login-streak achievements
  let newAchievements: string[] = [];
  if (result.claimed) {
    const existing = await prisma.achievement.findMany({
      where: { trainerId: userId },
      select: { code: true },
    });
    const alreadyUnlocked = new Set(existing.map(a => a.code));
    newAchievements = checkLoginAchievements(result.newStreak, alreadyUnlocked);

    if (newAchievements.length > 0) {
      await prisma.achievement.createMany({
        data: newAchievements.map(code => ({ trainerId: userId, code })),
        skipDuplicates: true,
      });
    }
  }

  return APIResponse.success({
    ...result,
    newAchievements,
    rewards: DAILY_REWARDS,
  });
});

// GET /api/social/daily-login — Get daily login status
export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: { lastLoginDate: true, loginStreak: true },
  });

  if (!trainer) {
    return APIResponse.success({ streak: 0, claimedToday: false, rewards: DAILY_REWARDS });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let claimedToday = false;

  if (trainer.lastLoginDate) {
    const lastLogin = new Date(trainer.lastLoginDate);
    const lastDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
    claimedToday = lastDay.getTime() === today.getTime();
  }

  return APIResponse.success({
    streak: trainer.loginStreak,
    claimedToday,
    rewards: DAILY_REWARDS,
  });
});
