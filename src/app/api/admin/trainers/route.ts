import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAdmin, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = apiHandler(async (req: NextRequest) => {
  await requireAdmin(req);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  const where = search ? {
    OR: [
      { username: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {};

  const [trainers, total] = await Promise.all([
    prisma.trainer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        level: true,
        experience: true,
        wins: true,
        losses: true,
        ladderPoints: true,
        createdAt: true,
        clanMember: {
          include: {
            clan: { select: { name: true } }
          }
        }
      }
    }),
    prisma.trainer.count({ where })
  ]);

  return APIResponse.success({
    trainers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const DELETE = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-trainers-delete:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  await requireAdmin(req);

  const { trainerId } = await req.json();

  if (!trainerId) {
    throw APIErrors.badRequest('ID do treinador é obrigatório');
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { isAdmin: true }
  });

  if (trainer?.isAdmin) {
    throw APIErrors.forbidden('Não é possível deletar conta de administrador');
  }

  await prisma.session.deleteMany({ where: { trainerId } });
  await prisma.trainerPokemon.deleteMany({ where: { trainerId } });
  await prisma.trainerMission.deleteMany({ where: { trainerId } });
  await prisma.clanMember.deleteMany({ where: { trainerId } });
  await prisma.trainer.delete({ where: { id: trainerId } });

  return APIResponse.success({ message: 'Treinador deletado com sucesso' });
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-trainers-patch:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  await requireAdmin(req);

  const { trainerId, updates } = await req.json();

  if (!trainerId || !updates) {
    throw APIErrors.badRequest('Dados incompletos');
  }

  const allowedUpdates: Record<string, unknown> = {};
  const allowedFields = ['level', 'experience', 'wins', 'losses', 'ladderPoints', 'streak', 'maxStreak'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      allowedUpdates[field] = parseInt(updates[field]);
    }
  }

  const updatedTrainer = await prisma.trainer.update({
    where: { id: trainerId },
    data: allowedUpdates,
    select: {
      id: true,
      username: true,
      level: true,
      wins: true,
      losses: true,
      ladderPoints: true
    }
  });

  return APIResponse.success({ trainer: updatedTrainer });
});
