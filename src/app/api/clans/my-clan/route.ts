import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth } from '@/lib/api-handler';

export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
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
    throw APIErrors.notFound('Você não está em um clã');
  }

  const clan = trainer.clanMember.clan;

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

  return APIResponse.success({
    id: clan.id,
    name: clan.name,
    tag: clan.tag,
    description: clan.description,
    memberCount: clan.members.length,
    experience: clan.points,
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
});
