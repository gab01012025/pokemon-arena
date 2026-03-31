import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAdmin, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = apiHandler(async (req: NextRequest) => {
  await requireAdmin(req);

  const clans = await prisma.clan.findMany({
    include: {
      leader: {
        select: {
          id: true,
          username: true,
        }
      },
      members: {
        include: {
          trainer: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }
    },
    orderBy: { points: 'desc' }
  });

  const clansWithCount = clans.map(clan => ({
    ...clan,
    memberCount: clan.members.length
  }));

  return APIResponse.success({ clans: clansWithCount });
});

export const DELETE = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-clans-delete:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  await requireAdmin(req);

  const { clanId } = await req.json();

  if (!clanId) {
    throw APIErrors.badRequest('ID do clã é obrigatório');
  }

  await prisma.clanMember.deleteMany({ where: { clanId } });
  await prisma.clan.delete({ where: { id: clanId } });

  return APIResponse.success({ message: 'Clã deletado com sucesso' });
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`admin-clans-patch:${ip}`, rateLimits.admin.maxRequests, rateLimits.admin.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  await requireAdmin(req);

  const { clanId, updates } = await req.json();

  if (!clanId || !updates) {
    throw APIErrors.badRequest('Dados incompletos');
  }

  const allowedUpdates: Record<string, unknown> = {};
  
  if (updates.points !== undefined) allowedUpdates.points = parseInt(updates.points);
  if (updates.name) allowedUpdates.name = updates.name;
  if (updates.description) allowedUpdates.description = updates.description;

  const updatedClan = await prisma.clan.update({
    where: { id: clanId },
    data: allowedUpdates
  });

  return APIResponse.success({ clan: updatedClan });
});
