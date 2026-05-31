import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, requireAuth } from '@/lib/api-handler';

export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  // Find trainer's clan
  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    include: { clanMember: true },
  });

  if (!trainer?.clanMember) {
    return APIResponse.success({ wars: [] });
  }

  const clanId = trainer.clanMember.clanId;

  // Fetch wars involving this clan
  const wars = await prisma.clanWar.findMany({
    where: {
      OR: [
        { attackerId: clanId },
        { defenderId: clanId },
      ],
    },
    include: {
      attacker: { select: { id: true, name: true, tag: true } },
      defender: { select: { id: true, name: true, tag: true } },
    },
    orderBy: { startedAt: 'desc' },
    take: 20,
  });

  return APIResponse.success({ wars });
});
