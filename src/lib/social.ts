// ==========================================
// POKÉMON ARENA - SOCIAL & VIRAL UTILITIES
// Sharing, referral codes, daily login bonuses
// ==========================================

import { prisma } from './prisma';

// ==================== REFERRAL CODES ====================

const REFERRAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion

/** Generate a unique 6-character referral code */
export function generateReferralCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += REFERRAL_CHARS[Math.floor(Math.random() * REFERRAL_CHARS.length)];
  }
  return code;
}

/**
 * Ensure a trainer has a referral code; generate one if missing.
 * Returns the (possibly newly created) referral code.
 */
export async function ensureReferralCode(trainerId: string): Promise<string> {
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { referralCode: true },
  });
  if (trainer?.referralCode) return trainer.referralCode;

  // Try up to 5 times to avoid collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    try {
      await prisma.trainer.update({
        where: { id: trainerId },
        data: { referralCode: code },
      });
      return code;
    } catch {
      // Collision — try again
    }
  }
  throw new Error('Could not generate unique referral code');
}

/**
 * Process a referral: link the new user to the referrer.
 * Called during registration if a referral code is provided.
 */
export async function applyReferral(newTrainerId: string, referralCode: string) {
  const referrer = await prisma.trainer.findUnique({
    where: { referralCode },
    select: { id: true },
  });
  if (!referrer || referrer.id === newTrainerId) return null;

  // Check if referral already exists for this user
  const existing = await prisma.referral.findUnique({
    where: { referredId: newTrainerId },
  });
  if (existing) return null;

  const referral = await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredId: newTrainerId,
    },
  });

  // Mark referredBy on the new trainer
  await prisma.trainer.update({
    where: { id: newTrainerId },
    data: { referredBy: referrer.id },
  });

  return referral;
}

// ==================== DAILY LOGIN BONUS ====================

export interface DailyLoginReward {
  day: number;      // 1-7
  xp: number;
  label: string;
  icon: string;
}

export const DAILY_REWARDS: DailyLoginReward[] = [
  { day: 1, xp: 50,  label: '50 XP',           icon: '⭐' },
  { day: 2, xp: 75,  label: '75 XP',           icon: '⭐' },
  { day: 3, xp: 100, label: '100 XP',          icon: '🌟' },
  { day: 4, xp: 150, label: '150 XP',          icon: '🌟' },
  { day: 5, xp: 200, label: '200 XP',          icon: '✨' },
  { day: 6, xp: 300, label: '300 XP',          icon: '✨' },
  { day: 7, xp: 500, label: '500 XP + Streak!', icon: '🔥' },
];

export interface DailyLoginResult {
  claimed: boolean;
  alreadyClaimed: boolean;
  reward: DailyLoginReward | null;
  newStreak: number;
  streakReset: boolean;
}

/**
 * Process a daily login claim.
 * - If already claimed today, returns { alreadyClaimed: true }
 * - If consecutive day, increments streak
 * - If missed a day, resets streak to 1
 * Returns reward info & new streak
 */
export async function claimDailyLogin(trainerId: string): Promise<DailyLoginResult> {
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { lastLoginDate: true, loginStreak: true, experience: true },
  });
  if (!trainer) throw new Error('Trainer not found');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (trainer.lastLoginDate) {
    const lastLogin = new Date(trainer.lastLoginDate);
    const lastDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

    // Already claimed today
    if (lastDay.getTime() === today.getTime()) {
      return {
        claimed: false,
        alreadyClaimed: true,
        reward: null,
        newStreak: trainer.loginStreak,
        streakReset: false,
      };
    }

    // Check if yesterday — consecutive
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastDay.getTime() === yesterday.getTime();

    const newStreak = isConsecutive ? trainer.loginStreak + 1 : 1;
    const rewardDay = ((newStreak - 1) % 7) + 1; // Cycle 1-7
    const reward = DAILY_REWARDS[rewardDay - 1];

    await prisma.trainer.update({
      where: { id: trainerId },
      data: {
        lastLoginDate: now,
        loginStreak: newStreak,
        experience: { increment: reward.xp },
      },
    });

    return {
      claimed: true,
      alreadyClaimed: false,
      reward,
      newStreak,
      streakReset: !isConsecutive,
    };
  }

  // First ever login
  const reward = DAILY_REWARDS[0];
  await prisma.trainer.update({
    where: { id: trainerId },
    data: {
      lastLoginDate: now,
      loginStreak: 1,
      experience: { increment: reward.xp },
    },
  });

  return {
    claimed: true,
    alreadyClaimed: false,
    reward,
    newStreak: 1,
    streakReset: false,
  };
}

// ==================== SHARE HELPERS ====================

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pokemon-arena.vercel.app';

export function getProfileUrl(username: string): string {
  return `${BASE_URL}/profile/${encodeURIComponent(username)}`;
}

export function getChallengeUrl(username: string): string {
  return `${BASE_URL}/battle/challenge/${encodeURIComponent(username)}`;
}

export function getReferralUrl(code: string): string {
  return `${BASE_URL}/join/${code}`;
}

/** Build share data for a battle victory */
export function buildVictoryShareData(params: {
  username: string;
  won: boolean;
  turns: number;
  lpGained: number;
  currentLP: number;
  rankLabel: string;
}): ShareData {
  const { username, won, turns, lpGained, currentLP, rankLabel } = params;

  if (!won) {
    return {
      title: 'Pokémon Arena Battle',
      text: `I just battled on Pokémon Arena! ${turns} turns of intense action. Can you beat me? 🎮`,
      url: getProfileUrl(username),
    };
  }

  return {
    title: `🏆 Victory on Pokémon Arena!`,
    text: `🏆 I won on Pokémon Arena in ${turns} turns! +${lpGained} LP (${currentLP} LP - ${rankLabel}). Think you can beat me? ⚔️`,
    url: getProfileUrl(username),
  };
}

/** Build share data for a rank-up */
export function buildRankUpShareData(username: string, newRankLabel: string): ShareData {
  return {
    title: `⬆️ Rank Up on Pokémon Arena!`,
    text: `⬆️ I just ranked up to ${newRankLabel} on Pokémon Arena! 🎉 Challenge me and see if you can keep up! ⚔️`,
    url: getProfileUrl(username),
  };
}

/** Build share data for referral invite */
export function buildReferralShareData(username: string, referralCode: string): ShareData {
  return {
    title: 'Join me on Pokémon Arena!',
    text: `🎮 ${username} invited you to Pokémon Arena! Join with my code "${referralCode}" for bonus rewards! ⚡`,
    url: getReferralUrl(referralCode),
  };
}

// ==================== SOCIAL PROOF ====================

export interface SocialProofStats {
  totalTrainers: number;
  totalBattles: number;
  onlineNow: number;
  recentWinners: Array<{
    username: string;
    avatar: string;
    rankLabel: string;
  }>;
}

export async function getSocialProofStats(): Promise<SocialProofStats> {
  const [totalTrainers, totalBattles, onlineCount, recentBattles] = await Promise.all([
    prisma.trainer.count(),
    prisma.battle.count(),
    prisma.onlineUser.count(),
    prisma.battle.findMany({
      take: 5,
      orderBy: { startedAt: 'desc' },
      where: { winnerId: { not: null } },
      include: {
        winner: {
          select: { username: true, avatar: true, ladderPoints: true },
        },
      },
    }),
  ]);

  // Lazy import to avoid circular deps
  const { formatRank } = await import('./ranking');

  const recentWinners = recentBattles
    .filter(b => b.winner != null)
    .map(b => ({
      username: b.winner!.username,
      avatar: b.winner!.avatar,
      rankLabel: formatRank(b.winner!.ladderPoints),
    }));

  return {
    totalTrainers,
    totalBattles,
    onlineNow: onlineCount,
    recentWinners,
  };
}
