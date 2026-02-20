import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const ADMIN_USERS = ['admin', 'gab01012025', 'gabriel', 'gab1234'];

// GET - List all battles with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';

    const where = status ? { status } : {};

    const [battles, total] = await Promise.all([
      prisma.battle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          player1: { select: { username: true } },
          player2: { select: { username: true } },
          winner: { select: { username: true } }
        }
      }),
      prisma.battle.count({ where })
    ]);

    return NextResponse.json({
      battles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin battles error:', error);
    return NextResponse.json({ error: 'Erro ao buscar batalhas' }, { status: 500 });
  }
}

// DELETE - Delete a battle
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { battleId } = await request.json();

    if (!battleId) {
      return NextResponse.json({ error: 'ID da batalha é obrigatório' }, { status: 400 });
    }

    await prisma.battle.delete({ where: { id: battleId } });

    return NextResponse.json({ success: true, message: 'Batalha deletada com sucesso' });

  } catch (error) {
    console.error('Delete battle error:', error);
    return NextResponse.json({ error: 'Erro ao deletar batalha' }, { status: 500 });
  }
}

// PATCH - Force end a battle
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { battleId, action, winnerId } = await request.json();

    if (!battleId || !action) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (action === 'forceEnd') {
      await prisma.battle.update({
        where: { id: battleId },
        data: {
          status: 'finished',
          finishedAt: new Date(),
          winnerId: winnerId || null
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Batalha atualizada' });

  } catch (error) {
    console.error('Update battle error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar batalha' }, { status: 500 });
  }
}
