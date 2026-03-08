import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

const CLAN_CREATION_COST = 10000;

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const ip = getClientIP(req);
  if (!rateLimit(`create-clan:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { name, tag, description } = await req.json();

  if (!name || name.length < 3 || name.length > 30) {
    throw APIErrors.badRequest('Nome deve ter entre 3 e 30 caracteres');
  }

  if (!tag || tag.length < 2 || tag.length > 5) {
    throw APIErrors.badRequest('Tag deve ter entre 2 e 5 caracteres');
  }

  if (!/^[A-Z0-9]+$/.test(tag)) {
    throw APIErrors.badRequest('Tag deve conter apenas letras maiúsculas e números');
  }

  if (description && description.length > 500) {
    throw APIErrors.badRequest('Descrição não pode ter mais de 500 caracteres');
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

  if (trainer.experience < CLAN_CREATION_COST) {
    throw APIErrors.badRequest(`Você precisa de ${CLAN_CREATION_COST.toLocaleString()} XP para criar um clã`);
  }

  const existingClan = await prisma.clan.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { tag: { equals: tag, mode: 'insensitive' } },
      ],
    },
  });

  if (existingClan) {
    throw APIErrors.conflict('Nome ou tag do clã já está em uso');
  }

  const clan = await prisma.clan.create({
    data: {
      name,
      tag,
      description: description || '',
      leaderId: userId,
      members: {
        create: {
          trainerId: userId,
          role: 'leader',
        },
      },
    },
  });

  await prisma.trainer.update({
    where: { id: userId },
    data: { experience: { decrement: CLAN_CREATION_COST } },
  });

  return APIResponse.success({
    message: 'Clã criado com sucesso',
    clan: {
      id: clan.id,
      name: clan.name,
      tag: clan.tag,
    },
  });
});
