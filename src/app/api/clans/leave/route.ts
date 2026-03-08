import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const ip = getClientIP(req);
  if (!rateLimit(`leave-clan:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    include: {
      clanMember: {
        include: { clan: true },
      },
    },
  });

  if (!trainer?.clanMember) {
    throw APIErrors.notFound('Você não está em um clã');
  }

  const isLeader = trainer.clanMember.role === 'leader';
  const clan = trainer.clanMember.clan;

  // Se for líder, dissolver o clã
  if (isLeader) {
    await prisma.$transaction([
      prisma.clanMember.deleteMany({
        where: { clanId: clan.id },
      }),
      prisma.clan.delete({
        where: { id: clan.id },
      }),
    ]);

    return APIResponse.success({ message: 'Clã dissolvido com sucesso' });
  }

  // Se não for líder, apenas sair
  await prisma.clanMember.delete({
    where: { id: trainer.clanMember.id },
  });

  return APIResponse.success({ message: 'Você saiu do clã com sucesso' });
});
