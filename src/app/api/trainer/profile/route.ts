import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'poke-arena-secret-key-2024');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const trainerId = payload.trainerId as string;

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      select: {
        id: true,
        username: true,
        email: true,
        level: true,
        experience: true,
        wins: true,
        losses: true,
        ladderPoints: true,
        createdAt: true,
        clanMember: {
          select: {
            clan: {
              select: {
                id: true,
                name: true,
                tag: true,
              },
            },
          },
        },
        unlockedPokemon: {
          select: {
            id: true,
            pokemon: {
              select: {
                id: true,
                name: true,
                types: true,
                health: true,
                moves: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    damage: true,
                    cooldown: true,
                    cost: true,
                    effects: true,
                    target: true,
                  },
                },
              },
            },
          },
          take: 3,
        },
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    // Buscar batalhas recentes
    const recentBattles = await prisma.battle.findMany({
      where: {
        OR: [
          { player1Id: trainerId },
          { player2Id: trainerId },
        ],
        status: 'finished',
      },
      take: 10,
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        winnerId: true,
        startedAt: true,
        player1: {
          select: { id: true, username: true },
        },
        player2: {
          select: { id: true, username: true },
        },
      },
    });

    const formattedBattles = recentBattles.map((battle) => {
      const isWinner = battle.winnerId === trainerId;
      const opponent = battle.player1.id === trainerId ? battle.player2 : battle.player1;
      
      return {
        id: battle.id,
        result: isWinner ? 'win' : 'loss',
        opponent: opponent?.username || 'Unknown',
        date: battle.startedAt.toISOString(),
      };
    });

    // Formatar resposta
    const formattedTeam = trainer.unlockedPokemon.length >= 3 ? {
      id: 'current',
      name: 'Meu Time',
      pokemon: trainer.unlockedPokemon.slice(0, 3).map((up, index) => ({
        id: up.id,
        slot: index,
        pokemon: {
          id: up.pokemon.id,
          name: up.pokemon.name,
          type: JSON.parse(up.pokemon.types)[0] || 'normal',
          hp: up.pokemon.health,
          attack: 80,
          defense: 70,
          speed: 60,
          moves: up.pokemon.moves.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            type: JSON.parse(up.pokemon.types)[0] || 'normal',
            power: m.damage,
            cooldown: m.cooldown,
          })),
        },
      })),
    } : null;

    return NextResponse.json({
      id: trainer.id,
      username: trainer.username,
      email: trainer.email,
      level: trainer.level,
      experience: trainer.experience,
      wins: trainer.wins,
      losses: trainer.losses,
      ladderPoints: trainer.ladderPoints,
      createdAt: trainer.createdAt,
      clan: trainer.clanMember?.clan || null,
      team: formattedTeam,
      recentBattles: formattedBattles,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Atualizar perfil
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const trainerId = payload.trainerId as string;

    const body = await request.json();
    const { username } = body;

    // Validar username se fornecido
    if (username) {
      if (username.length < 3 || username.length > 20) {
        return NextResponse.json(
          { error: 'Username deve ter entre 3 e 20 caracteres' },
          { status: 400 }
        );
      }

      // Verificar se username já existe
      const existingTrainer = await prisma.trainer.findFirst({
        where: { 
          username, 
          NOT: { id: trainerId } 
        },
      });

      if (existingTrainer) {
        return NextResponse.json(
          { error: 'Username já está em uso' },
          { status: 400 }
        );
      }
    }

    const updatedTrainer = await prisma.trainer.update({
      where: { id: trainerId },
      data: {
        ...(username && { username }),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json(updatedTrainer);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
