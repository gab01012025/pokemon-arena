import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse } from '@/lib/api-handler';
import { getPokemonImageUrl } from '@/lib/pokemon-images';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = apiHandler(async (request: NextRequest) => {
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
          cost: true,
          cooldown: true,
          duration: true,
          damage: true,
          healing: true,
          effects: true,
          target: true,
        }
      }
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
      type: firstType,
      secondaryType: secondType,
      types: Array.isArray(types) ? types.join(',') : types,
      category: p.category,
      health: p.health,
      imageUrl: getPokemonImageUrl(p.name, 'default'),
      traits: JSON.parse(p.traits),
      isStarter: p.isStarter,
      isUnlockable: !p.isStarter,
      unlockCost: p.unlockCost,
      moves: [],
    };

    const pokemonMoves = (p as { moves?: Array<{
      id: string;
      name: string;
      description: string;
      damage: number;
      cooldown: number;
      classes: string;
      effects: string;
      target: string;
      cost: string;
    }> }).moves;

    if (pokemonMoves && Array.isArray(pokemonMoves) && pokemonMoves.length > 0) {
      base.moves = pokemonMoves.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description || '',
        damage: m.damage || 10,
        power: m.damage || 10,
        cooldown: m.cooldown || 0,
        energyCost: m.cost || '{}',
        effect: m.effects || '[]',
        type: firstType?.toLowerCase() || 'normal',
      }));
    }

    base.hp = p.health;
    base.attack = 80 + Math.floor((p.health - 100) / 2);
    base.defense = 70 + Math.floor((p.health - 100) / 3);
    base.speed = 60 + Math.floor((p.health - 100) / 4);

    return base;
  });

  const response = APIResponse.success(transformedPokemon);
  response.headers.set('X-API-Version', '8.0.0');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
});
