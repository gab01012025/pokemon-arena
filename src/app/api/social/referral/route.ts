import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { ensureReferralCode, getReferralUrl, buildReferralShareData } from '@/lib/social';
import { checkReferralAchievements } from '@/lib/achievements';
import { prisma } from '@/lib/prisma';

// GET /api/social/referral — Get my referral code & stats
export const GET = apiHandler(async (req: NextRequest) => {
  const { userId, username } = await requireAuth(req);

  // Ensure this trainer has a referral code
  const referralCode = await ensureReferralCode(userId);

  // Count referrals
  const referralCount = await prisma.referral.count({
    where: { referrerId: userId },
  });

  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      createdAt: true,
      bonusClaimed: true,
      referred: { select: { username: true, avatar: true } },
    },
  });

  const shareData = buildReferralShareData(username, referralCode);
  const referralUrl = getReferralUrl(referralCode);

  return APIResponse.success({
    referralCode,
    referralUrl,
    referralCount,
    shareData,
    referrals: referrals.map(r => ({
      username: r.referred.username,
      avatar: r.referred.avatar,
      joinedAt: r.createdAt.toISOString(),
      bonusClaimed: r.bonusClaimed,
    })),
  });
});

// POST /api/social/referral — Claim referral bonus
export const POST = apiHandler(async (req: NextRequest) => {
  const clientIP = getClientIP(req);
  if (!rateLimit(`social:referral:${clientIP}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  // Find unclaimed referral bonuses
  const unclaimedReferrals = await prisma.referral.findMany({
    where: { referrerId: userId, bonusClaimed: false },
  });

  if (unclaimedReferrals.length === 0) {
    return APIResponse.success({ claimed: 0, xpGained: 0 });
  }

  const XP_PER_REFERRAL = 200;
  const totalXP = unclaimedReferrals.length * XP_PER_REFERRAL;

  // Mark as claimed & award XP
  await prisma.$transaction([
    prisma.referral.updateMany({
      where: { id: { in: unclaimedReferrals.map(r => r.id) } },
      data: { bonusClaimed: true },
    }),
    prisma.trainer.update({
      where: { id: userId },
      data: { experience: { increment: totalXP } },
    }),
  ]);

  // Check for referral achievements
  const totalReferrals = await prisma.referral.count({ where: { referrerId: userId } });
  const existing = await prisma.achievement.findMany({
    where: { trainerId: userId },
    select: { code: true },
  });
  const alreadyUnlocked = new Set(existing.map(a => a.code));
  const newAchievements = checkReferralAchievements(totalReferrals, alreadyUnlocked);

  if (newAchievements.length > 0) {
    await prisma.achievement.createMany({
      data: newAchievements.map(code => ({ trainerId: userId, code })),
      skipDuplicates: true,
    });
  }

  return APIResponse.success({
    claimed: unclaimedReferrals.length,
    xpGained: totalXP,
    newAchievements,
  });
});
