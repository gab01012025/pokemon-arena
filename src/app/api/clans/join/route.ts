import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const ip = getClientIP(req);
  if (!rateLimit(`join-clan:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { clanId } = await req.json();

  if (!clanId) {
    throw APIErrors.badRequest('ID do clã é obrigatório');
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    include: { clanMember: true },
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer não encontrado');
  }

  if (trainer.clanMember) {
    throw APIErrors.badRequest('Você já está em um clã');
  }

  const clan = await prisma.clan.findUnique({
    where: { id: clanId },
    include: {
      members: true,
    },
  });

  if (!clan) {
    throw APIErrors.notFound('Clã não encontrado');
  }

  if (clan.members.length >= 50) {
    throw APIErrors.badRequest('Este clã está cheio (máximo 50 membros)');
  }

  await prisma.clanMember.create({
    data: {
      trainerId: userId,
      clanId: clan.id,
      role: 'member',
    },
  });

  return APIResponse.success({
    message: `Você entrou no clã [${clan.tag}] ${clan.name}!`,
    clan: {
      id: clan.id,
      name: clan.name,
      tag: clan.tag,
    },
  });
});
