import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startersOnly = searchParams.get('starters') === 'true';
    const includeMoves = searchParams.get('includeMoves') === 'true';
    
    const pokemon = await prisma.pokemon.findMany({
      where: startersOnly ? { isStarter: true } : undefined,
      include: {
        moves: includeMoves ? {
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
            cost: true,
          }
        } : false
      },
      orderBy: [
        { isStarter: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform data to match expected frontend format
    const transformedPokemon = pokemon.map(p => {
      let types: string | string[] = 'Normal';
      try {
        types = p.types ? JSON.parse(p.types) : 'Normal';
      } catch {
        types = p.types || 'Normal';
      }
      const firstType = Array.isArray(types) ? (types[0] || 'Normal') : (typeof types === 'string' ? types : 'Normal');
      const secondType = Array.isArray(types) && types.length > 1 ? types[1] : null;
      
      const base: Record<string, unknown> = {
        id: p.id,
        name: p.name,
        description: p.description,
        // For backwards compatibility, provide both formats
        type: firstType,
        secondaryType: secondType,
        types: Array.isArray(types) ? types.join(',') : types,
        category: p.category,
        health: p.health,
        imageUrl: `/images/pokemon/${p.name.toLowerCase()}.png`,
        traits: JSON.parse(p.traits),
        isStarter: p.isStarter,
        isUnlockable: !p.isStarter,
        unlockCost: p.unlockCost,
        moves: [],  // Default empty array
      };
      
      if (includeMoves && 'moves' in p) {
        base.moves = (p.moves as Array<{
          id: string;
          name: string;
          description: string;
          damage: number;
          cooldown: number;
          classes: string;
          effects: string;
          target: string;
          cost: string;
        }>).map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          damage: m.damage,
          cooldown: m.cooldown,
          energyCost: m.cost,
          effect: m.effects,
          type: firstType || 'normal',
        }));
      }
      
      return base;
    });

    return NextResponse.json(transformedPokemon);
  } catch (error) {
    console.error('Failed to fetch Pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon' },
      { status: 500 }
    );
  }
}
