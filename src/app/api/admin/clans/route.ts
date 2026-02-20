import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const ADMIN_USERS = ['admin', 'gab01012025', 'gabriel', 'gab1234'];

// GET - List all clans
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clans = await prisma.clan.findMany({
      include: {
        leader: {
          select: {
            id: true,
            username: true,
          }
        },
        members: {
          include: {
            trainer: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { points: 'desc' }
    });

    // Transform to include member count
    const clansWithCount = clans.map(clan => ({
      ...clan,
      memberCount: clan.members.length
    }));

    return NextResponse.json({ clans: clansWithCount });
  } catch (error) {
    console.error('Error fetching clans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a clan
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { clanId } = await request.json();

    if (!clanId) {
      return NextResponse.json({ error: 'ID do clã é obrigatório' }, { status: 400 });
    }

    // Delete members first
    await prisma.clanMember.deleteMany({ where: { clanId } });
    
    // Delete clan
    await prisma.clan.delete({ where: { id: clanId } });

    return NextResponse.json({ success: true, message: 'Clã deletado com sucesso' });

  } catch (error) {
    console.error('Delete clan error:', error);
    return NextResponse.json({ error: 'Erro ao deletar clã' }, { status: 500 });
  }
}

// PATCH - Update clan
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user.username.toLowerCase())) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { clanId, updates } = await request.json();

    if (!clanId || !updates) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const allowedUpdates: Record<string, unknown> = {};
    
    if (updates.points !== undefined) allowedUpdates.points = parseInt(updates.points);
    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.description) allowedUpdates.description = updates.description;

    const updatedClan = await prisma.clan.update({
      where: { id: clanId },
      data: allowedUpdates
    });

    return NextResponse.json({ success: true, clan: updatedClan });

  } catch (error) {
    console.error('Update clan error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar clã' }, { status: 500 });
  }
}
