import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const ADMIN_USERS = ['admin', 'gab01012025', 'gabriel', 'gab1234'];

// GET - List all trainers with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [trainers, total] = await Promise.all([
      prisma.trainer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
            include: {
              clan: { select: { name: true } }
            }
          }
        }
      }),
      prisma.trainer.count({ where })
    ]);

    return NextResponse.json({
      trainers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin trainers error:', error);
    return NextResponse.json({ error: 'Erro ao buscar treinadores' }, { status: 500 });
  }
}

// DELETE - Delete a trainer
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { trainerId } = await request.json();

    if (!trainerId) {
      return NextResponse.json({ error: 'ID do treinador é obrigatório' }, { status: 400 });
    }

    // Don't allow deleting admin accounts
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      select: { username: true }
    });

    if (trainer && ADMIN_USERS.includes(trainer.username.toLowerCase())) {
      return NextResponse.json({ error: 'Não é possível deletar conta de administrador' }, { status: 403 });
    }

    // Delete related data first
    await prisma.session.deleteMany({ where: { trainerId } });
    await prisma.trainerPokemon.deleteMany({ where: { trainerId } });
    await prisma.trainerMission.deleteMany({ where: { trainerId } });
    await prisma.clanMember.deleteMany({ where: { trainerId } });
    
    // Delete trainer
    await prisma.trainer.delete({ where: { id: trainerId } });

    return NextResponse.json({ success: true, message: 'Treinador deletado com sucesso' });

  } catch (error) {
    console.error('Delete trainer error:', error);
    return NextResponse.json({ error: 'Erro ao deletar treinador' }, { status: 500 });
  }
}

// PATCH - Update trainer
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { trainerId, updates } = await request.json();

    if (!trainerId || !updates) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Only allow updating specific fields
    const allowedUpdates: Record<string, unknown> = {};
    const allowedFields = ['level', 'experience', 'wins', 'losses', 'ladderPoints', 'streak', 'maxStreak'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        allowedUpdates[field] = parseInt(updates[field]);
      }
    }

    const updatedTrainer = await prisma.trainer.update({
      where: { id: trainerId },
      data: allowedUpdates,
      select: {
        id: true,
        username: true,
        level: true,
        wins: true,
        losses: true,
        ladderPoints: true
      }
    });

    return NextResponse.json({ success: true, trainer: updatedTrainer });

  } catch (error) {
    console.error('Update trainer error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar treinador' }, { status: 500 });
  }
}
