/**
 * API: Battle Team Management
 * GET: Returns the current active battle team (3 Pokemon)
 * PUT: Updates which Pokemon are in the active battle team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get current battle team
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active battle team Pokemon (isActive=true, ordered by position)
    const battleTeam = await prisma.trainerPokemon.findMany({
      where: { 
        trainerId: session.user.id,
        isActive: true,
      },
      orderBy: { position: 'asc' },
      include: {
        pokemon: {
          include: {
            moves: {
              orderBy: { slot: 'asc' },
            },
          },
        },
      },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      battleTeam: battleTeam.map((tp) => ({
        id: tp.id,
        position: tp.position,
        pokemon: {
          id: tp.pokemon.id,
          name: tp.pokemon.name,
          types: JSON.parse(tp.pokemon.types),
          health: tp.pokemon.health,
          description: tp.pokemon.description,
          moves: tp.pokemon.moves.map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            damage: m.damage,
            cooldown: m.cooldown,
            cost: m.cost,
            effects: m.effects,
            target: m.target,
            slot: m.slot,
          })),
        },
      })),
    });

  } catch (error) {
    console.error('Get battle team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update battle team selection
export async function PUT(request: NextRequest) {
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
        { error: 'You must select exactly 3 Pokémon for your battle team' },
        { status: 400 }
      );
    }

    // Verify all Pokemon are unlocked by this trainer
    const trainerPokemon = await prisma.trainerPokemon.findMany({
      where: { 
        trainerId: session.user.id,
        pokemonId: { in: pokemonIds },
      },
    });

    if (trainerPokemon.length !== 3) {
      return NextResponse.json(
        { error: 'You can only select Pokémon that you have unlocked' },
        { status: 400 }
      );
    }

    // First, set all trainer's Pokemon to inactive
    await prisma.trainerPokemon.updateMany({
      where: { trainerId: session.user.id },
      data: { isActive: false, position: -1 },
    });

    // Then, set the selected Pokemon as active with positions
    for (let i = 0; i < pokemonIds.length; i++) {
      await prisma.trainerPokemon.updateMany({
        where: { 
          trainerId: session.user.id,
          pokemonId: pokemonIds[i],
        },
        data: { 
          isActive: true, 
          position: i,
        },
      });
    }

    // Get updated battle team
    const updatedTeam = await prisma.trainerPokemon.findMany({
      where: { 
        trainerId: session.user.id,
        isActive: true,
      },
      orderBy: { position: 'asc' },
      include: {
        pokemon: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Battle team updated successfully!',
      battleTeam: updatedTeam.map((tp) => ({
        position: tp.position,
        pokemonId: tp.pokemonId,
        pokemonName: tp.pokemon.name,
      })),
    });

  } catch (error) {
    console.error('Update battle team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
