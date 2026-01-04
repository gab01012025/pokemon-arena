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

    // Verificar permissões
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      include: { clanMember: true },
    });

    if (!trainer?.clanMember) {
      return NextResponse.json({ error: 'Você não está em um clã' }, { status: 404 });
    }

    const hasPermission = trainer.clanMember.role === 'leader' || trainer.clanMember.role === 'officer';
    if (!hasPermission) {
      return NextResponse.json({ error: 'Você não tem permissão para expulsar membros' }, { status: 403 });
    }

    // Buscar membro a ser expulso
    const targetMember = await prisma.clanMember.findFirst({
      where: {
        trainerId: memberId,
        clanId: trainer.clanMember.clanId,
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Membro não encontrado no clã' }, { status: 404 });
    }

    // Não pode expulsar líder
    if (targetMember.role === 'leader') {
      return NextResponse.json({ error: 'Não é possível expulsar o líder' }, { status: 403 });
    }

    // Oficial não pode expulsar outro oficial
    if (trainer.clanMember.role === 'officer' && targetMember.role === 'officer') {
      return NextResponse.json({ error: 'Você não pode expulsar outro oficial' }, { status: 403 });
    }

    await prisma.clanMember.delete({
      where: { id: targetMember.id },
    });

    return NextResponse.json({ message: 'Membro expulso com sucesso' });
  } catch (error) {
    console.error('Error kicking member:', error);
    return NextResponse.json({ error: 'Erro ao expulsar membro' }, { status: 500 });
  }
}
