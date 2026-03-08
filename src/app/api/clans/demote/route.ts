import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const ip = getClientIP(req);
  if (!rateLimit(`demote-member:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { memberId } = await req.json();

  if (!memberId) {
    throw APIErrors.badRequest('ID do membro é obrigatório');
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    include: { clanMember: true },
  });

  if (!trainer?.clanMember) {
    throw APIErrors.notFound('Você não está em um clã');
  }

  if (trainer.clanMember.role !== 'leader') {
    throw APIErrors.forbidden('Apenas o líder pode rebaixar membros');
  }

  const targetMember = await prisma.clanMember.findFirst({
    where: {
      trainerId: memberId,
      clanId: trainer.clanMember.clanId,
    },
  });

  if (!targetMember) {
    throw APIErrors.notFound('Membro não encontrado');
  }

  if (targetMember.role !== 'officer') {
    throw APIErrors.badRequest('Membro não é oficial');
  }

  await prisma.clanMember.update({
    where: { id: targetMember.id },
    data: { role: 'member' },
  });

  return APIResponse.success({ message: 'Membro rebaixado com sucesso' });
});
