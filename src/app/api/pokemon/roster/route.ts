/**
 * API: Get Pokemon Roster for Multiplayer
 * Returns all available Pokemon with their moves for team selection.
 * For authenticated users, includes ownership data and lock status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUnlockInfo, isPokemonUnlocked, STARTER_POKEMON, levelFromTotalXP } from '@/lib/progression';

export async function GET(req: NextRequest) {
  try {
    // Try to get auth info for lock status
    let trainerData: { level: number; maxStreak: number; achievementCodes: string[]; ownedNames: Set<string> } | null = null;

    try {
      const token = req.cookies.get('pokemon-arena-session')?.value;
      if (token) {
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
        const { jwtVerify } = await import('jose');
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const trainerId = (payload.trainerId || payload.userId) as string | undefined;
        
        if (trainerId) {
          const trainer = await prisma.trainer.findUnique({
            where: { id: trainerId },
            select: {
              totalXP: true,
              maxStreak: true,
              unlockedPokemon: { select: { pokemon: { select: { name: true } } } },
              achievements: { select: { code: true } },
            },
          });
          if (trainer) {
            const levelInfo = levelFromTotalXP(trainer.totalXP);
            trainerData = {
              level: levelInfo.level,
              maxStreak: trainer.maxStreak,
              achievementCodes: trainer.achievements.map(a => a.code),
              ownedNames: new Set(trainer.unlockedPokemon.map(up => up.pokemon.name.toLowerCase())),
            };
          }
        }
      }
    } catch {
      // Auth is optional, continue without it
    }

    const pokemon = await prisma.pokemon.findMany({
      include: {
        moves: {
          orderBy: { slot: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const roster = pokemon.map((p) => {
      const unlockInfo = getUnlockInfo(p.name);
      const isOwned = trainerData ? trainerData.ownedNames.has(p.name.toLowerCase()) : true;
      const isUnlocked = trainerData 
        ? (isOwned || isPokemonUnlocked(p.name, trainerData.level, trainerData.maxStreak, trainerData.achievementCodes))
        : true;

      return {
        id: p.id,
        name: p.name,
        types: safeJsonParse(p.types, []),
        health: p.health,
        category: p.category,
        isStarter: p.isStarter,
        isOwned,
        isUnlocked,
        unlockMethod: unlockInfo?.method ?? null,
        unlockDescription: unlockInfo?.description ?? null,
        skills: p.moves.map((m) => ({
          name: m.name,
          description: m.description,
          damage: m.damage,
          healing: m.healing,
          target: m.target,
          cost: safeJsonParse(m.cost, {}),
          effects: safeJsonParse(m.effects, []),
          classes: safeJsonParse(m.classes, []),
          cooldown: m.cooldown,
        })),
      };
    });

    return NextResponse.json({ roster });
  } catch (error) {
    console.error('Failed to fetch pokemon roster:', error);
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 });
  }
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
