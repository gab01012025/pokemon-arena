import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      include: {
        clanMember: {
          include: { clan: true },
        },
      },
    });

    if (!trainer?.clanMember) {
      return NextResponse.json({ error: 'Você não está em um clã' }, { status: 404 });
    }

    const isLeader = trainer.clanMember.role === 'leader';
    const clan = trainer.clanMember.clan;

    // Se for líder, dissolver o clã
    if (isLeader) {
      await prisma.$transaction([
        // Remover todos os membros
        prisma.clanMember.deleteMany({
          where: { clanId: clan.id },
        }),
        // Deletar o clã
        prisma.clan.delete({
          where: { id: clan.id },
        }),
      ]);

      return NextResponse.json({ message: 'Clã dissolvido com sucesso' });
    }

    // Se não for líder, apenas sair
    await prisma.clanMember.delete({
      where: { id: trainer.clanMember.id },
    });

    return NextResponse.json({ message: 'Você saiu do clã com sucesso' });
  } catch (error) {
    console.error('Error leaving clan:', error);
    return NextResponse.json({ error: 'Erro ao sair do clã' }, { status: 500 });
  }
}
