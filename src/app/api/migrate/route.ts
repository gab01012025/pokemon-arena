/**
 * API: Database Migration
 * Applies schema changes directly via SQL
 * Protected by secret key
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

const MIGRATION_SECRET = process.env.SEED_SECRET || 'kanto-seed-2026';

export const POST = apiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== MIGRATION_SECRET) {
    throw APIErrors.unauthorized('Unauthorized');
  }

  const results: string[] = [];

  try {
    await prisma.$executeRaw`
      ALTER TABLE "TrainerPokemon" 
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true
    `;
    results.push('✓ Added isActive column');
  } catch (e) {
    results.push(`! isActive: ${e instanceof Error ? e.message : 'Already exists or error'}`);
  }

  try {
    await prisma.$executeRaw`
      ALTER TABLE "TrainerPokemon" 
      ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0
    `;
    results.push('✓ Added position column');
  } catch (e) {
    results.push(`! position: ${e instanceof Error ? e.message : 'Already exists or error'}`);
  }

  try {
    const trainers = await prisma.trainer.findMany({
      select: { id: true },
    });

    for (const trainer of trainers) {
      const trainerPokemon = await prisma.trainerPokemon.findMany({
        where: { trainerId: trainer.id },
        orderBy: { unlockedAt: 'asc' },
      });

      for (let i = 0; i < trainerPokemon.length; i++) {
        await prisma.trainerPokemon.update({
          where: { id: trainerPokemon[i].id },
          data: {
            isActive: i < 3,
            position: i < 3 ? i : -1,
          },
        });
      }
    }
    results.push(`✓ Updated positions for ${trainers.length} trainers`);
  } catch (e) {
    results.push(`! Position update: ${e instanceof Error ? e.message : 'Error'}`);
  }

  return APIResponse.success({
    message: 'Migration completed',
    results,
  });
});

export const GET = apiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== MIGRATION_SECRET) {
    throw APIErrors.unauthorized('Unauthorized');
  }

  const sample = await prisma.trainerPokemon.findFirst({
    select: {
      id: true,
      isActive: true,
      position: true,
    },
  });

  return APIResponse.success({
    message: 'Schema check passed',
    sample: sample || 'No records found',
    fieldsExist: {
      isActive: true,
      position: true,
    },
  });
});
