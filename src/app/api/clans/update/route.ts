import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Descrição não pode ter mais de 500 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se é líder
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      include: { clanMember: true },
    });

    if (!trainer?.clanMember) {
      return NextResponse.json({ error: 'Você não está em um clã' }, { status: 404 });
    }

    if (trainer.clanMember.role !== 'leader') {
      return NextResponse.json(
        { error: 'Apenas o líder pode editar o clã' },
        { status: 403 }
      );
    }

    await prisma.clan.update({
      where: { id: trainer.clanMember.clanId },
      data: { description: description || '' },
    });

    return NextResponse.json({ message: 'Clã atualizado com sucesso' });
  } catch (error) {
    console.error('Error updating clan:', error);
    return NextResponse.json({ error: 'Erro ao atualizar clã' }, { status: 500 });
  }
}
