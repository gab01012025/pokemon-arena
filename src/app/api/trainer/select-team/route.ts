/**
 * API: Select Initial Team
 * Save trainer's initial Pokemon selection using TrainerPokemon model
 * Note: Team model is for Clans, BattleTeam/BattleSlot for battle teams
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pokemonIds } = body;

    if (!pokemonIds || !Array.isArray(pokemonIds) || pokemonIds.length !== 3) {
      return NextResponse.json(
        { error: 'You must select exactly 3 Pokémon' },
        { status: 400 }
      );
    }

    // Verify all Pokemon exist and are starters
    const pokemon = await prisma.pokemon.findMany({
      where: { 
        id: { in: pokemonIds },
        isStarter: true,
      },
    });

    if (pokemon.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid Pokémon selection. Please select 3 starter Pokémon.' },
        { status: 400 }
      );
    }

    // Check if trainer already has unlocked Pokemon
    const existingPokemon = await prisma.trainerPokemon.findMany({
      where: { trainerId: session.user.id },
    });

    if (existingPokemon.length > 0) {
      return NextResponse.json(
        { error: 'You already have Pokémon selected' },
        { status: 400 }
      );
    }

    // Add Pokemon to trainer's unlocked collection
    await prisma.trainerPokemon.createMany({
      data: pokemonIds.map((pokemonId: string) => ({
        trainerId: session.user.id,
        pokemonId: pokemonId,
      })),
    });

    return NextResponse.json({
      success: true,
      message: 'Team selected successfully!',
      pokemon: pokemon.map(p => ({ id: p.id, name: p.name })),
    });

  } catch (error) {
    console.error('Select team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get trainer's unlocked Pokemon
    const trainerPokemon = await prisma.trainerPokemon.findMany({
      where: { trainerId: session.user.id },
      include: {
        pokemon: {
          include: {
            moves: true,
          },
        },
      },
      orderBy: { unlockedAt: 'asc' },
    });

    if (trainerPokemon.length === 0) {
      return NextResponse.json({
        hasTeam: false,
      });
    }

    return NextResponse.json({
      hasTeam: true,
      pokemon: trainerPokemon.map(tp => ({
        id: tp.pokemon.id,
        name: tp.pokemon.name,
        description: tp.pokemon.description,
        types: JSON.parse(tp.pokemon.types),
        health: tp.pokemon.health,
        moves: tp.pokemon.moves,
        unlockedAt: tp.unlockedAt,
      })),
    });

  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
