/**
 * API: Database Migration
 * Applies schema changes directly via SQL
 * Protected by secret key
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MIGRATION_SECRET = process.env.SEED_SECRET || 'kanto-seed-2026';

export async function POST(request: NextRequest) {
  try {
    // Check secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    // Add isActive column to TrainerPokemon if not exists
    try {
      await prisma.$executeRaw`
        ALTER TABLE "TrainerPokemon" 
        ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true
      `;
      results.push('✓ Added isActive column');
    } catch (e) {
      results.push(`! isActive: ${e instanceof Error ? e.message : 'Already exists or error'}`);
    }

    // Add position column to TrainerPokemon if not exists
    try {
      await prisma.$executeRaw`
        ALTER TABLE "TrainerPokemon" 
        ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0
      `;
      results.push('✓ Added position column');
    } catch (e) {
      results.push(`! position: ${e instanceof Error ? e.message : 'Already exists or error'}`);
    }

    // Update existing records to set proper positions for active Pokemon
    try {
      // Get all trainers with Pokemon
      const trainers = await prisma.trainer.findMany({
        select: { id: true },
      });

      for (const trainer of trainers) {
        // Get trainer's Pokemon
        const trainerPokemon = await prisma.trainerPokemon.findMany({
          where: { trainerId: trainer.id },
          orderBy: { unlockedAt: 'asc' },
        });

        // Set first 3 as active with positions
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

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check current schema
  try {
    // Try to query with new fields
    const sample = await prisma.trainerPokemon.findFirst({
      select: {
        id: true,
        isActive: true,
        position: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Schema check passed',
      sample: sample || 'No records found',
      fieldsExist: {
        isActive: true,
        position: true,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Schema check failed - fields may not exist',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
