/**
 * API: Specific Clan Details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - Get clan details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clanId: string }> }
) {
  try {
    const { clanId } = await params;

    // Try to find by ID or by name/tag (SQLite case-insensitive workaround)
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
      return NextResponse.json(
        { error: 'Clan not found' },
        { status: 404 }
      );
    }

    // Calculate rank
    const rank = await prisma.clan.count({
      where: { points: { gt: clan.points } }
    }) + 1;

    // Format members
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

    // Format wars history
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

    return NextResponse.json({
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

  } catch (error) {
    console.error('Clan fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clan' },
      { status: 500 }
    );
  }
}

// POST - Join clan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clanId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { clanId } = await params;

    // Get clan
    const clan = await prisma.clan.findUnique({
      where: { id: clanId },
      include: {
        _count: { select: { members: true } }
      }
    });

    if (!clan) {
      return NextResponse.json(
        { error: 'Clan not found' },
        { status: 404 }
      );
    }

    if (!clan.isRecruiting) {
      return NextResponse.json(
        { error: 'This clan is not recruiting' },
        { status: 400 }
      );
    }

    if (clan._count.members >= clan.maxMembers) {
      return NextResponse.json(
        { error: 'This clan is full' },
        { status: 400 }
      );
    }

    // Check if user already in a clan
    const existingMember = await prisma.clanMember.findUnique({
      where: { trainerId: session.user.id }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already in a clan' },
        { status: 400 }
      );
    }

    // Check user level
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      select: { level: true }
    });

    if (trainer && trainer.level < clan.minLevel) {
      return NextResponse.json(
        { error: `Requires level ${clan.minLevel} to join` },
        { status: 400 }
      );
    }

    // Join clan
    await prisma.clanMember.create({
      data: {
        clanId: clan.id,
        trainerId: session.user.id,
        role: 'member'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Joined ${clan.name}!`
    });

  } catch (error) {
    console.error('Clan join error:', error);
    return NextResponse.json(
      { error: 'Failed to join clan' },
      { status: 500 }
    );
  }
}

// DELETE - Leave clan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clanId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { clanId } = await params;

    // Get member record
    const member = await prisma.clanMember.findFirst({
      where: {
        trainerId: session.user.id,
        clanId
      },
      include: {
        clan: { select: { leaderId: true, name: true } }
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this clan' },
        { status: 400 }
      );
    }

    // Leaders can't leave (must transfer or disband)
    if (member.clan.leaderId === session.user.id) {
      return NextResponse.json(
        { error: 'Leaders cannot leave. Transfer leadership or disband the clan.' },
        { status: 400 }
      );
    }

    // Leave clan
    await prisma.clanMember.delete({
      where: { id: member.id }
    });

    return NextResponse.json({
      success: true,
      message: `Left ${member.clan.name}`
    });

  } catch (error) {
    console.error('Clan leave error:', error);
    return NextResponse.json(
      { error: 'Failed to leave clan' },
      { status: 500 }
    );
  }
}
