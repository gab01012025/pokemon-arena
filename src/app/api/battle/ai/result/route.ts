import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pokemon-arena-super-secret-key-change-in-production-2026'
);

const COOKIE_NAME = 'pokemon-arena-session';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const trainerId = payload.trainerId as string;

    const body = await request.json();
    const { won, difficulty } = body;

    // Recompensas baseadas na dificuldade
    const rewards = {
      easy: { exp: 50, lp: won ? 5 : -2 },
      normal: { exp: 100, lp: won ? 15 : -5 },
      hard: { exp: 200, lp: won ? 30 : -10 },
    };

    const reward = rewards[difficulty as keyof typeof rewards] || rewards.normal;

    // Atualizar estatísticas do treinador
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      select: { experience: true, level: true, ladderPoints: true },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    const newExperience = trainer.experience + reward.exp;
    const expForNextLevel = trainer.level * 1000;
    const shouldLevelUp = newExperience >= expForNextLevel;

    const updatedTrainer = await prisma.trainer.update({
      where: { id: trainerId },
      data: {
        wins: won ? { increment: 1 } : undefined,
        losses: won ? undefined : { increment: 1 },
        experience: shouldLevelUp ? newExperience - expForNextLevel : newExperience,
        level: shouldLevelUp ? { increment: 1 } : undefined,
        ladderPoints: { increment: Math.max(-trainer.ladderPoints, reward.lp) },
      },
    });

    return NextResponse.json({
      success: true,
      won,
      rewards: {
        experience: reward.exp,
        ladderPoints: reward.lp,
        levelUp: shouldLevelUp,
      },
      newStats: {
        level: updatedTrainer.level,
        experience: updatedTrainer.experience,
        ladderPoints: updatedTrainer.ladderPoints,
        wins: updatedTrainer.wins,
        losses: updatedTrainer.losses,
      },
    });
  } catch (error) {
    console.error('Save battle result error:', error);
    return NextResponse.json(
      { error: 'Failed to save battle result' },
      { status: 500 }
    );
  }
}
