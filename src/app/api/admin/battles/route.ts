import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

const ADMIN_USERS = ['admin', 'gab01012025', 'gabriel', 'gab1234'];

export const GET = apiHandler(async (req: NextRequest) => {
  const { username } = await requireAuth(req);

  if (!ADMIN_USERS.includes(username.toLowerCase())) {
    throw APIErrors.forbidden('Admin access required');
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || '';

  const where = status ? { status } : {};

  const [battles, total] = await Promise.all([
    prisma.battle.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
        winner: { select: { username: true } }
      }
    }),
    prisma.battle.count({ where })
  ]);

  return APIResponse.success({
    battles,
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
  if (!rateLimit(`admin-battles-delete:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { username } = await requireAuth(req);

  if (!ADMIN_USERS.includes(username.toLowerCase())) {
    throw APIErrors.forbidden('Admin access required');
  }

  const { battleId } = await req.json();

  if (!battleId) {
    throw APIErrors.badRequest('ID da batalha é obrigatório');
  }

  await prisma.battle.delete({ where: { id: battleId } });

  return APIResponse.success({ message: 'Batalha deletada com sucesso' });
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-battles-patch:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { username } = await requireAuth(req);

  if (!ADMIN_USERS.includes(username.toLowerCase())) {
    throw APIErrors.forbidden('Admin access required');
  }

  const { battleId, action, winnerId } = await req.json();

  if (!battleId || !action) {
    throw APIErrors.badRequest('Dados incompletos');
  }

  if (action === 'forceEnd') {
    await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'finished',
        finishedAt: new Date(),
        winnerId: winnerId || null
      }
    });
  }

  return APIResponse.success({ message: 'Batalha atualizada' });
});
