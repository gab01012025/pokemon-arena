import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth } from '@/lib/api-handler';

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);
  const { defenderTag } = await req.json();

  if (!defenderTag) {
    throw APIErrors.badRequest('Defender clan tag is required');
  }

  // Check if trainer is leader/officer
  const membership = await prisma.clanMember.findUnique({
    where: { trainerId: userId },
    include: { clan: true },
  });

  if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) {
    throw APIErrors.forbidden('Only leaders and officers can declare war');
  }

  // Find defender clan
  const defenderClan = await prisma.clan.findFirst({
    where: { tag: { equals: defenderTag, mode: 'insensitive' } },
  });

  if (!defenderClan) {
    throw APIErrors.notFound('Clan not found with that tag');
  }

  if (defenderClan.id === membership.clanId) {
    throw APIErrors.badRequest('Cannot declare war on your own clan');
  }

  // Check if there's already an active/pending war between these clans
  const existingWar = await prisma.clanWar.findFirst({
    where: {
      OR: [
        { attackerId: membership.clanId, defenderId: defenderClan.id, status: { in: ['pending', 'active'] } },
        { attackerId: defenderClan.id, defenderId: membership.clanId, status: { in: ['pending', 'active'] } },
      ],
    },
  });

  if (existingWar) {
    throw APIErrors.conflict('There is already an ongoing war between these clans');
  }

  // Create war
  const war = await prisma.clanWar.create({
    data: {
      attackerId: membership.clanId,
      defenderId: defenderClan.id,
      status: 'pending',
    },
    include: {
      attacker: { select: { id: true, name: true, tag: true } },
      defender: { select: { id: true, name: true, tag: true } },
    },
  });

  return APIResponse.success({ war });
});
