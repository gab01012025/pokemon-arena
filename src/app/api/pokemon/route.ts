import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startersOnly = searchParams.get('starters') === 'true';
    
    const pokemon = await prisma.pokemon.findMany({
      where: startersOnly ? { isStarter: true } : undefined,
      include: {
        moves: {
          select: {
            id: true,
            name: true,
            description: true,
            classes: true,
            damage: true,
            healing: true,
            cooldown: true,
            duration: true,
            effects: true,
            target: true,
            slot: true,
          }
        }
      },
      orderBy: [
        { isStarter: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform data to match expected frontend format
    const transformedPokemon = pokemon.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      types: JSON.parse(p.types),
      category: p.category,
      health: p.health,
      traits: JSON.parse(p.traits),
      isStarter: p.isStarter,
      unlockCost: p.unlockCost,
      moves: p.moves.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        power: m.damage, // Map damage to power for frontend
        type: JSON.parse(p.types)[0] || 'normal', // Use pokemon's first type
        cooldown: m.cooldown,
        classes: JSON.parse(m.classes),
        effects: JSON.parse(m.effects),
        target: m.target,
      }))
    }));

    return NextResponse.json(transformedPokemon);
  } catch (error) {
    console.error('Failed to fetch Pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon' },
      { status: 500 }
    );
  }
}
