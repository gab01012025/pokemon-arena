import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      include: {
        clanMember: {
          include: {
            clan: {
              include: {
                leader: {
                  select: { username: true },
                },
                members: {
                  include: {
                    trainer: {
                      select: {
                        id: true,
                        username: true,
                        experience: true,
                        wins: true,
                        losses: true,
                      },
                    },
                  },
                  orderBy: [
                    { role: 'asc' },
                    { joinedAt: 'asc' },
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!trainer?.clanMember) {
      return NextResponse.json({ error: 'Você não está em um clã' }, { status: 404 });
    }

    const clan = trainer.clanMember.clan;
    
    // Calcular rank do clã (posição no ranking mundial por pontos)
    const higherRankedClans = await prisma.clan.count({
      where: {
        OR: [
          { points: { gt: clan.points } },
          {
            AND: [
              { points: clan.points },
              { wins: { gt: clan.wins } },
            ],
          },
        ],
      },
    });

    return NextResponse.json({
      id: clan.id,
      name: clan.name,
      tag: clan.tag,
      description: clan.description,
      memberCount: clan.members.length,
      experience: clan.points, // usando points como XP
      wins: clan.wins,
      losses: clan.losses,
      rank: higherRankedClans + 1,
      createdAt: clan.createdAt.toISOString(),
      founder: clan.leader,
      myRole: trainer.clanMember.role,
      members: clan.members.map(m => ({
        id: m.trainer.id,
        username: m.trainer.username,
        experience: m.trainer.experience,
        wins: m.trainer.wins,
        losses: m.trainer.losses,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching clan:', error);
    return NextResponse.json({ error: 'Erro ao buscar clã' }, { status: 500 });
  }
}
