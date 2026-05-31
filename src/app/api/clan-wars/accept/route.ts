import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth } from '@/lib/api-handler';

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);
  const { warId } = await req.json();

  if (!warId) {
    throw APIErrors.badRequest('War ID is required');
  }

  // Check if trainer is leader/officer of defender clan
  const membership = await prisma.clanMember.findUnique({
    where: { trainerId: userId },
  });

  if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) {
    throw APIErrors.forbidden('Only leaders and officers can accept wars');
  }

  // Find the war
  const war = await prisma.clanWar.findUnique({ where: { id: warId } });
  if (!war) {
    throw APIErrors.notFound('War not found');
  }

  if (war.defenderId !== membership.clanId) {
    throw APIErrors.forbidden('Only the defender clan can accept');
  }

  if (war.status !== 'pending') {
    throw APIErrors.badRequest('War is not pending');
  }

  // Accept war - set to active
  const updated = await prisma.clanWar.update({
    where: { id: warId },
    data: { status: 'active', startedAt: new Date() },
    include: {
      attacker: { select: { id: true, name: true, tag: true } },
      defender: { select: { id: true, name: true, tag: true } },
    },
  });

  return APIResponse.success({ war: updated });
});
