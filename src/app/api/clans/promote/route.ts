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
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'ID do membro é obrigatório' }, { status: 400 });
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
        { error: 'Apenas o líder pode promover membros' },
        { status: 403 }
      );
    }

    // Buscar membro
    const targetMember = await prisma.clanMember.findFirst({
      where: {
        trainerId: memberId,
        clanId: trainer.clanMember.clanId,
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    if (targetMember.role !== 'member') {
      return NextResponse.json({ error: 'Membro já é oficial ou líder' }, { status: 400 });
    }

    await prisma.clanMember.update({
      where: { id: targetMember.id },
      data: { role: 'officer' },
    });

    return NextResponse.json({ message: 'Membro promovido a oficial com sucesso' });
  } catch (error) {
    console.error('Error promoting member:', error);
    return NextResponse.json({ error: 'Erro ao promover membro' }, { status: 500 });
  }
}
