import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { clanId } = body;

    if (!clanId) {
      return NextResponse.json({ error: 'ID do clã é obrigatório' }, { status: 400 });
    }

    // Verificar se trainer já está em um clã
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      include: { clanMember: true },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer não encontrado' }, { status: 404 });
    }

    if (trainer.clanMember) {
      return NextResponse.json(
        { error: 'Você já está em um clã' },
        { status: 400 }
      );
    }

    // Verificar se o clã existe
    const clan = await prisma.clan.findUnique({
      where: { id: clanId },
      include: {
        members: true,
      },
    });

    if (!clan) {
      return NextResponse.json({ error: 'Clã não encontrado' }, { status: 404 });
    }

    // Verificar limite de membros (50)
    if (clan.members.length >= 50) {
      return NextResponse.json(
        { error: 'Este clã está cheio (máximo 50 membros)' },
        { status: 400 }
      );
    }

    // Adicionar membro ao clã
    await prisma.clanMember.create({
      data: {
        trainerId: trainer.id,
        clanId: clan.id,
        role: 'member',
      },
    });

    return NextResponse.json({
      message: `Você entrou no clã [${clan.tag}] ${clan.name}!`,
      clan: {
        id: clan.id,
        name: clan.name,
        tag: clan.tag,
      },
    });
  } catch (error) {
    console.error('Error joining clan:', error);
    return NextResponse.json({ error: 'Erro ao entrar no clã' }, { status: 500 });
  }
}
