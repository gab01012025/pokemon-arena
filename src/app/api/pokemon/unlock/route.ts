/**
 * API: Unlock Pokemon
 * Sistema para desbloquear novos Pokémon com moedas/XP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar Pokémon disponíveis para desbloquear
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar Pokémon já desbloqueados pelo usuário
    const unlockedPokemon = await prisma.trainerPokemon.findMany({
      where: { trainerId: session.user.id },
      select: { pokemonId: true },
    });

    const unlockedIds = new Set(unlockedPokemon.map(tp => tp.pokemonId));

    // Buscar todos os Pokémon
    const allPokemon = await prisma.pokemon.findMany({
      include: {
        moves: {
          select: {
            id: true,
            name: true,
            description: true,
            damage: true,
            cooldown: true,
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { unlockCost: 'asc' },
        { name: 'asc' }
      ]
    });

    // Formatar dados
    const formattedPokemon = allPokemon.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      types: JSON.parse(p.types),
      category: p.category,
      health: p.health,
      traits: JSON.parse(p.traits),
      isStarter: p.isStarter,
      unlockCost: p.unlockCost,
      isUnlocked: unlockedIds.has(p.id),
      moves: p.moves,
    }));

    // Agrupar por categoria
    const grouped = formattedPokemon.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {} as Record<string, typeof formattedPokemon>);

    return NextResponse.json({
      pokemon: formattedPokemon,
      grouped,
      categories: Object.keys(grouped),
      unlockedCount: unlockedIds.size,
      totalCount: allPokemon.length,
    });

  } catch (error) {
    console.error('Pokemon list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon' },
      { status: 500 }
    );
  }
}

// POST - Desbloquear um Pokémon
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pokemonId } = await request.json();

    if (!pokemonId) {
      return NextResponse.json(
        { error: 'pokemonId is required' },
        { status: 400 }
      );
    }

    // Verificar se o Pokémon existe
    const pokemon = await prisma.pokemon.findUnique({
      where: { id: pokemonId },
    });

    if (!pokemon) {
      return NextResponse.json(
        { error: 'Pokemon not found' },
        { status: 404 }
      );
    }

    // Verificar se já foi desbloqueado
    const existing = await prisma.trainerPokemon.findUnique({
      where: {
        trainerId_pokemonId: {
          trainerId: session.user.id,
          pokemonId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Pokemon already unlocked' },
        { status: 400 }
      );
    }

    // Buscar informações do treinador
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      select: { level: true, experience: true },
    });

    if (!trainer) {
      return NextResponse.json(
        { error: 'Trainer not found' },
        { status: 404 }
      );
    }

    // Verificar se tem XP suficiente (cada unlock custa XP baseado no custo)
    const xpCost = pokemon.unlockCost;
    
    if (xpCost > 0 && trainer.experience < xpCost) {
      return NextResponse.json(
        { 
          error: `XP insuficiente. Necessário: ${xpCost}, Você tem: ${trainer.experience}` 
        },
        { status: 400 }
      );
    }

    // Desbloquear o Pokémon
    await prisma.trainerPokemon.create({
      data: {
        trainerId: session.user.id,
        pokemonId,
      },
    });

    // Deduzir XP se houver custo
    if (xpCost > 0) {
      await prisma.trainer.update({
        where: { id: session.user.id },
        data: {
          experience: trainer.experience - xpCost,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${pokemon.name} desbloqueado com sucesso!`,
      pokemon: {
        id: pokemon.id,
        name: pokemon.name,
        types: JSON.parse(pokemon.types),
      },
      xpSpent: xpCost,
      xpRemaining: trainer.experience - xpCost,
    });

  } catch (error) {
    console.error('Pokemon unlock error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock Pokemon' },
      { status: 500 }
    );
  }
}
