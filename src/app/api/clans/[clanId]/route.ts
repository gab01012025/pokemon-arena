import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';

// GET - Get clan details
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ clanId: string }> }
) {
  const { clanId } = await context.params;
  return apiHandler(async () => {
    const clan = await prisma.clan.findFirst({
      where: {
        OR: [
          { id: clanId },
          { name: clanId },
          { tag: clanId.toUpperCase() }
        ]
      },
      select: {
        id: true,
        name: true,
        tag: true,
        description: true,
        avatar: true,
        banner: true,
        points: true,
        wins: true,
        losses: true,
        isRecruiting: true,
        minLevel: true,
        maxMembers: true,
        createdAt: true,
        leader: {
          select: {
            id: true,
            username: true,
            avatar: true,
          }
        },
        members: {
          select: {
            role: true,
            joinedAt: true,
            trainer: {
              select: {
                id: true,
                username: true,
                avatar: true,
                level: true,
                wins: true,
                ladderPoints: true,
              }
            }
          },
          orderBy: [
            { role: 'asc' },
            { joinedAt: 'asc' }
          ]
        },
        warsAsAttacker: {
          where: { status: 'finished' },
          select: {
            id: true,
            attackerWins: true,
            defenderWins: true,
            finishedAt: true,
            defender: { select: { name: true, tag: true } }
          },
          orderBy: { finishedAt: 'desc' },
          take: 5
        },
        warsAsDefender: {
          where: { status: 'finished' },
          select: {
            id: true,
            attackerWins: true,
            defenderWins: true,
            finishedAt: true,
            attacker: { select: { name: true, tag: true } }
          },
          orderBy: { finishedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!clan) {
      throw APIErrors.notFound('Clan not found');
    }

    const rank = await prisma.clan.count({
      where: { points: { gt: clan.points } }
    }) + 1;

    const members = clan.members.map(m => ({
      id: m.trainer.id,
      username: m.trainer.username,
      avatar: m.trainer.avatar,
      level: m.trainer.level,
      wins: m.trainer.wins,
      ladderPoints: m.trainer.ladderPoints,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    const warHistory = [
      ...clan.warsAsAttacker.map(w => ({
        id: w.id,
        opponent: w.defender.name,
        opponentTag: w.defender.tag,
        ourWins: w.attackerWins,
        theirWins: w.defenderWins,
        result: w.attackerWins > w.defenderWins ? 'win' : 'loss',
        date: w.finishedAt,
      })),
      ...clan.warsAsDefender.map(w => ({
        id: w.id,
        opponent: w.attacker.name,
        opponentTag: w.attacker.tag,
        ourWins: w.defenderWins,
        theirWins: w.attackerWins,
        result: w.defenderWins > w.attackerWins ? 'win' : 'loss',
        date: w.finishedAt,
      }))
    ].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()).slice(0, 10);

    return APIResponse.success({
      id: clan.id,
      name: clan.name,
      tag: clan.tag,
      description: clan.description,
      avatar: clan.avatar,
      banner: clan.banner,
      rank,
      stats: {
        points: clan.points,
        wins: clan.wins,
        losses: clan.losses,
        winRate: clan.wins + clan.losses > 0
          ? Math.round((clan.wins / (clan.wins + clan.losses)) * 100)
          : 0,
      },
      recruitment: {
        isRecruiting: clan.isRecruiting,
        minLevel: clan.minLevel,
        memberCount: members.length,
        maxMembers: clan.maxMembers,
      },
      leader: clan.leader,
      members,
      warHistory,
      createdAt: clan.createdAt,
    });
  })(req);
}

// POST - Join clan
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ clanId: string }> }
) {
  const { clanId } = await context.params;
  return apiHandler(async (req) => {
    const { userId } = await requireAuth(req);

    const ip = getClientIP(req);
    if (!rateLimit(`join-clan:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
      throw APIErrors.tooManyRequests();
    }

    const clan = await prisma.clan.findUnique({
      where: { id: clanId },
      include: {
        _count: { select: { members: true } }
      }
    });

    if (!clan) {
      throw APIErrors.notFound('Clan not found');
    }

    if (!clan.isRecruiting) {
      throw APIErrors.badRequest('This clan is not recruiting');
    }

    if (clan._count.members >= clan.maxMembers) {
      throw APIErrors.badRequest('This clan is full');
    }

    const existingMember = await prisma.clanMember.findUnique({
      where: { trainerId: userId }
    });

    if (existingMember) {
      throw APIErrors.badRequest('You are already in a clan');
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: userId },
      select: { level: true }
    });

    if (trainer && trainer.level < clan.minLevel) {
      throw APIErrors.badRequest(`Requires level ${clan.minLevel} to join`);
    }

    await prisma.clanMember.create({
      data: {
        clanId: clan.id,
        trainerId: userId,
        role: 'member'
      }
    });

    return APIResponse.success({ message: `Joined ${clan.name}!` });
  })(req);
}

// DELETE - Leave clan
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ clanId: string }> }
) {
  const { clanId } = await context.params;
  return apiHandler(async (req) => {
    const { userId } = await requireAuth(req);

    const ip = getClientIP(req);
    if (!rateLimit(`leave-clan:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
      throw APIErrors.tooManyRequests();
    }

    const member = await prisma.clanMember.findFirst({
      where: {
        trainerId: userId,
        clanId
      },
      include: {
        clan: { select: { leaderId: true, name: true } }
      }
    });

    if (!member) {
      throw APIErrors.badRequest('You are not a member of this clan');
    }

    if (member.clan.leaderId === userId) {
      throw APIErrors.badRequest('Leaders cannot leave. Transfer leadership or disband the clan.');
    }

    await prisma.clanMember.delete({
      where: { id: member.id }
    });

    return APIResponse.success({ message: `Left ${member.clan.name}` });
  })(req);
}
