import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

// GET - List clans (public)
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || '';

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { tag: { contains: search } }
        ]
      }
    : {};

  const total = await prisma.clan.count({ where });

  const clans = await prisma.clan.findMany({
    where,
    select: {
      id: true,
      name: true,
      tag: true,
      avatar: true,
      points: true,
      wins: true,
      losses: true,
      isRecruiting: true,
      minLevel: true,
      maxMembers: true,
      createdAt: true,
      leader: {
        select: {
          username: true,
        }
      },
      _count: {
        select: { members: true }
      }
    },
    orderBy: [
      { points: 'desc' },
      { wins: 'desc' }
    ],
    skip,
    take: limit,
  });

  const clanList = clans.map((clan, index) => ({
    rank: skip + index + 1,
    id: clan.id,
    name: clan.name,
    tag: clan.tag,
    avatar: clan.avatar,
    points: clan.points,
    wins: clan.wins,
    losses: clan.losses,
    memberCount: clan._count.members,
    maxMembers: clan.maxMembers,
    leader: clan.leader.username,
    isRecruiting: clan.isRecruiting,
    minLevel: clan.minLevel,
    createdAt: clan.createdAt,
  }));

  return APIResponse.success({
    clans: clanList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  });
});

// POST - Create a clan
export const POST = apiHandler(async (request: NextRequest) => {
  const { userId } = await requireAuth(request);

  const ip = getClientIP(request);
  if (!rateLimit(`create-clan:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { name, tag, description } = await request.json();

  if (!name || !tag) {
    throw APIErrors.badRequest('Name and tag are required');
  }

  if (!/^[A-Z]{2,5}$/.test(tag)) {
    throw APIErrors.badRequest('Tag must be 2-5 uppercase letters');
  }

  const existingMember = await prisma.clanMember.findUnique({
    where: { trainerId: userId }
  });

  if (existingMember) {
    throw APIErrors.badRequest('You are already in a clan. Leave first to create a new one.');
  }

  const existing = await prisma.clan.findFirst({
    where: {
      OR: [{ name }, { tag }]
    }
  });

  if (existing) {
    throw APIErrors.conflict('Clan name or tag already exists');
  }

  const clan = await prisma.clan.create({
    data: {
      name,
      tag,
      description: description || null,
      leaderId: userId,
      members: {
        create: {
          trainerId: userId,
          role: 'leader'
        }
      }
    },
    include: {
      leader: { select: { username: true } },
      _count: { select: { members: true } }
    }
  });

  return APIResponse.success({
    message: 'Clan created!',
    clan: {
      id: clan.id,
      name: clan.name,
      tag: clan.tag,
      leader: clan.leader.username,
      memberCount: clan._count.members,
    }
  });
});
