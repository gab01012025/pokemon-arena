/**
 * API: Missions
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = apiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const myProgress = searchParams.get('myProgress') === 'true';

  let userId: string | null = null;
  try {
    const auth = await requireAuth(req);
    userId = auth.userId;
  } catch {
    // Not authenticated - OK for listing missions
  }

  const where: Record<string, unknown> = { isActive: true };
  if (category) {
    where.category = category;
  }

  const missions = await prisma.mission.findMany({
    where,
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ],
  });

  let userProgress: Record<string, { status: string; progress: string }> = {};
  let completedMissionNames = new Set<string>();
  let trainerLevel = 0;
  let trainerWins = 0;

  if (userId && myProgress) {
    const trainerMissions = await prisma.trainerMission.findMany({
      where: { trainerId: userId },
      include: { mission: { select: { name: true } } },
    });

    userProgress = trainerMissions.reduce((acc, tm) => {
      acc[tm.missionId] = { status: tm.status, progress: tm.progress };
      if (tm.status === 'completed') {
        completedMissionNames.add(tm.mission.name);
      }
      return acc;
    }, {} as Record<string, { status: string; progress: string }>);

    const trainer = await prisma.trainer.findUnique({
      where: { id: userId },
      select: { level: true, wins: true },
    });
    if (trainer) {
      trainerLevel = trainer.level;
      trainerWins = trainer.wins;
    }
  }

  const formattedMissions = missions.map(m => {
    const requirements = JSON.parse(m.requirements);
    const existingStatus = userProgress[m.id]?.status;

    let userStatus: string;
    if (existingStatus) {
      userStatus = existingStatus;
    } else if (!userId || !myProgress) {
      userStatus = 'locked';
    } else {
      // Determine status based on prerequisites
      const levelOk = !requirements.level || trainerLevel >= requirements.level;
      const winsOk = !requirements.wins || trainerWins >= requirements.wins;
      const prereqMissions: string[] = requirements.completedMissions || [];
      const prereqsOk = prereqMissions.every((name: string) => completedMissionNames.has(name));

      if (levelOk && winsOk && prereqsOk) {
        userStatus = 'available';
      } else {
        userStatus = 'locked';
      }
    }

    return {
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      requirements,
      objectives: JSON.parse(m.objectives),
      rewardExp: m.rewardExp,
      rewardPokemon: m.rewardPokemon,
      rewardItems: m.rewardItems ? JSON.parse(m.rewardItems) : null,
      userStatus,
      userProgress: userProgress[m.id]?.progress ? JSON.parse(userProgress[m.id].progress) : null,
    };
  });

  const grouped = formattedMissions.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, typeof formattedMissions>);

  return APIResponse.success({
    missions: formattedMissions,
    grouped,
    categories: Object.keys(grouped),
  });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`missions-post:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const { missionId } = await req.json();

  if (!missionId) {
    throw APIErrors.badRequest('missionId is required');
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId }
  });

  if (!mission) {
    throw APIErrors.notFound('Mission not found');
  }

  const requirements = JSON.parse(mission.requirements);
  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: { level: true, wins: true }
  });

  if (trainer) {
    if (requirements.level && trainer.level < requirements.level) {
      throw APIErrors.badRequest(`Requires level ${requirements.level}`);
    }
    if (requirements.wins && trainer.wins < requirements.wins) {
      throw APIErrors.badRequest(`Requires ${requirements.wins} wins`);
    }
  }

  // Check prerequisite missions
  const prereqMissions: string[] = requirements.completedMissions || [];
  if (prereqMissions.length > 0) {
    const completedPrereqs = await prisma.trainerMission.findMany({
      where: {
        trainerId: userId,
        status: 'completed',
        mission: { name: { in: prereqMissions } },
      },
    });
    const completedNames = new Set(completedPrereqs.map(tm => tm.missionId));
    // Need to check by mission name, so get the mission records
    const prereqMissionRecords = await prisma.mission.findMany({
      where: { name: { in: prereqMissions } },
      select: { id: true, name: true },
    });
    const completedPrereqNames = new Set<string>();
    for (const pm of prereqMissionRecords) {
      const tm = completedPrereqs.find(t => t.missionId === pm.id);
      if (tm) completedPrereqNames.add(pm.name);
    }
    const missing = prereqMissions.filter(name => !completedPrereqNames.has(name));
    if (missing.length > 0) {
      throw APIErrors.badRequest(`Complete first: ${missing.join(', ')}`);
    }
  }

  const existing = await prisma.trainerMission.findUnique({
    where: {
      trainerId_missionId: {
        trainerId: userId,
        missionId
      }
    }
  });

  if (existing && existing.status !== 'locked') {
    throw APIErrors.badRequest('Mission already started or completed');
  }

  const trainerMission = await prisma.trainerMission.upsert({
    where: {
      trainerId_missionId: {
        trainerId: userId,
        missionId
      }
    },
    update: {
      status: 'in_progress',
      startedAt: new Date(),
      progress: '{}'
    },
    create: {
      trainerId: userId,
      missionId,
      status: 'in_progress',
      startedAt: new Date(),
      progress: '{}'
    }
  });

  return APIResponse.success({
    message: 'Mission started!',
    mission: trainerMission
  });
});
