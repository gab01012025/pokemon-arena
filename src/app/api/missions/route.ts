/**
 * API: Missions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - List all missions or user's mission progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const myProgress = searchParams.get('myProgress') === 'true';

    const session = await getSession();

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };
    if (category) {
      where.category = category;
    }

    // Get all missions
    const missions = await prisma.mission.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });

    // If user is logged in and wants progress, include it
    let userProgress: Record<string, { status: string; progress: string }> = {};
    
    if (session && myProgress) {
      const trainerMissions = await prisma.trainerMission.findMany({
        where: { trainerId: session.user.id },
        select: {
          missionId: true,
          status: true,
          progress: true,
        }
      });
      
      userProgress = trainerMissions.reduce((acc, tm) => {
        acc[tm.missionId] = { status: tm.status, progress: tm.progress };
        return acc;
      }, {} as Record<string, { status: string; progress: string }>);
    }

    // Format missions
    const formattedMissions = missions.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      requirements: JSON.parse(m.requirements),
      objectives: JSON.parse(m.objectives),
      rewardExp: m.rewardExp,
      rewardPokemon: m.rewardPokemon,
      rewardItems: m.rewardItems ? JSON.parse(m.rewardItems) : null,
      userStatus: userProgress[m.id]?.status || 'locked',
      userProgress: userProgress[m.id]?.progress ? JSON.parse(userProgress[m.id].progress) : null,
    }));

    // Group by category
    const grouped = formattedMissions.reduce((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {} as Record<string, typeof formattedMissions>);

    return NextResponse.json({
      missions: formattedMissions,
      grouped,
      categories: Object.keys(grouped),
    });

  } catch (error) {
    console.error('Missions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}

// POST - Start a mission
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { missionId } = await request.json();

    if (!missionId) {
      return NextResponse.json(
        { error: 'missionId is required' },
        { status: 400 }
      );
    }

    // Check if mission exists
    const mission = await prisma.mission.findUnique({
      where: { id: missionId }
    });

    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    // Check requirements
    const requirements = JSON.parse(mission.requirements);
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      select: { level: true, wins: true }
    });

    if (trainer) {
      if (requirements.level && trainer.level < requirements.level) {
        return NextResponse.json(
          { error: `Requires level ${requirements.level}` },
          { status: 400 }
        );
      }
      if (requirements.wins && trainer.wins < requirements.wins) {
        return NextResponse.json(
          { error: `Requires ${requirements.wins} wins` },
          { status: 400 }
        );
      }
    }

    // Check if already started
    const existing = await prisma.trainerMission.findUnique({
      where: {
        trainerId_missionId: {
          trainerId: session.user.id,
          missionId
        }
      }
    });

    if (existing && existing.status !== 'locked') {
      return NextResponse.json(
        { error: 'Mission already started or completed' },
        { status: 400 }
      );
    }

    // Start the mission
    const trainerMission = await prisma.trainerMission.upsert({
      where: {
        trainerId_missionId: {
          trainerId: session.user.id,
          missionId
        }
      },
      update: {
        status: 'in_progress',
        startedAt: new Date(),
        progress: '{}'
      },
      create: {
        trainerId: session.user.id,
        missionId,
        status: 'in_progress',
        startedAt: new Date(),
        progress: '{}'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Mission started!',
      mission: trainerMission
    });

  } catch (error) {
    console.error('Mission start error:', error);
    return NextResponse.json(
      { error: 'Failed to start mission' },
      { status: 500 }
    );
  }
}
