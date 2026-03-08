import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const ip = getClientIP(req);
  if (!rateLimit(`kick-member:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
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

  const hasPermission = trainer.clanMember.role === 'leader' || trainer.clanMember.role === 'officer';
  if (!hasPermission) {
    throw APIErrors.forbidden('Você não tem permissão para expulsar membros');
  }

  const targetMember = await prisma.clanMember.findFirst({
    where: {
      trainerId: memberId,
      clanId: trainer.clanMember.clanId,
    },
  });

  if (!targetMember) {
    throw APIErrors.notFound('Membro não encontrado no clã');
  }

  if (targetMember.role === 'leader') {
    throw APIErrors.forbidden('Não é possível expulsar o líder');
  }

  if (trainer.clanMember.role === 'officer' && targetMember.role === 'officer') {
    throw APIErrors.forbidden('Você não pode expulsar outro oficial');
  }

  await prisma.clanMember.delete({
    where: { id: targetMember.id },
  });

  return APIResponse.success({ message: 'Membro expulso com sucesso' });
});
