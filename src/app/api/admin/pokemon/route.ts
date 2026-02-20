import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const ADMIN_USERS = ['admin', 'gab01012025', 'gabriel', 'gab1234'];

// GET - List all pokemon
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const pokemon = await prisma.pokemon.findMany({
      orderBy: { name: 'asc' },
      include: {
        moves: true,
        _count: {
          select: { trainers: true }
        }
      }
    });

    return NextResponse.json({ pokemon });

  } catch (error) {
    console.error('Admin pokemon error:', error);
    return NextResponse.json({ error: 'Erro ao buscar pokémon' }, { status: 500 });
  }
}

// POST - Create new pokemon
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = await request.json();

    const pokemon = await prisma.pokemon.create({
      data: {
        name: data.name,
        description: data.description || '',
        types: JSON.stringify(data.types || []),
        category: data.category || 'Normal',
        health: data.health || 100,
        traits: JSON.stringify(data.traits || []),
        isStarter: data.isStarter || false,
        unlockCost: data.unlockCost || 0
      }
    });

    return NextResponse.json({ success: true, pokemon });

  } catch (error) {
    console.error('Create pokemon error:', error);
    return NextResponse.json({ error: 'Erro ao criar pokémon' }, { status: 500 });
  }
}

// DELETE - Delete pokemon
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { pokemonId } = await request.json();

    if (!pokemonId) {
      return NextResponse.json({ error: 'ID do pokémon é obrigatório' }, { status: 400 });
    }

    // Delete related data
    await prisma.trainerPokemon.deleteMany({ where: { pokemonId } });
    await prisma.move.deleteMany({ where: { pokemonId } });
    await prisma.battleSlot.deleteMany({ where: { pokemonId } });
    
    // Delete pokemon
    await prisma.pokemon.delete({ where: { id: pokemonId } });

    return NextResponse.json({ success: true, message: 'Pokémon deletado com sucesso' });

  } catch (error) {
    console.error('Delete pokemon error:', error);
    return NextResponse.json({ error: 'Erro ao deletar pokémon' }, { status: 500 });
  }
}

// PATCH - Update pokemon
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { pokemonId, updates } = await request.json();

    if (!pokemonId || !updates) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const allowedUpdates: Record<string, unknown> = {};
    
    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.description) allowedUpdates.description = updates.description;
    if (updates.health !== undefined) allowedUpdates.health = parseInt(updates.health);
    if (updates.unlockCost !== undefined) allowedUpdates.unlockCost = parseInt(updates.unlockCost);
    if (updates.isStarter !== undefined) allowedUpdates.isStarter = updates.isStarter;
    if (updates.types) allowedUpdates.types = JSON.stringify(updates.types);
    if (updates.category) allowedUpdates.category = updates.category;

    const updatedPokemon = await prisma.pokemon.update({
      where: { id: pokemonId },
      data: allowedUpdates
    });

    return NextResponse.json({ success: true, pokemon: updatedPokemon });

  } catch (error) {
    console.error('Update pokemon error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pokémon' }, { status: 500 });
  }
}
