import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

export const PUT = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const ip = getClientIP(req);
  if (!rateLimit(`update-clan:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { description } = await req.json();

  if (description && description.length > 500) {
    throw APIErrors.badRequest('Descrição não pode ter mais de 500 caracteres');
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    include: { clanMember: true },
  });

  if (!trainer?.clanMember) {
    throw APIErrors.notFound('Você não está em um clã');
  }

  if (trainer.clanMember.role !== 'leader') {
    throw APIErrors.forbidden('Apenas o líder pode editar o clã');
  }

  await prisma.clan.update({
    where: { id: trainer.clanMember.clanId },
    data: { description: description || '' },
  });

  return APIResponse.success({ message: 'Clã atualizado com sucesso' });
});
