/**
 * API: Clans
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - List clans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where = search 
      ? { 
          OR: [
            { name: { contains: search } },
            { tag: { contains: search } }
          ]
        }
      : {};

    // Get total count
    const total = await prisma.clan.count({ where });

    // Get clans sorted by points
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

    // Format response with ranks
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

    return NextResponse.json({
      clans: clanList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Clans fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clans' },
      { status: 500 }
    );
  }
}

// POST - Create a clan
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, tag, description } = await request.json();

    if (!name || !tag) {
      return NextResponse.json(
        { error: 'Name and tag are required' },
        { status: 400 }
      );
    }

    // Validate tag (2-5 uppercase letters)
    if (!/^[A-Z]{2,5}$/.test(tag)) {
      return NextResponse.json(
        { error: 'Tag must be 2-5 uppercase letters' },
        { status: 400 }
      );
    }

    // Check if user already in a clan
    const existingMember = await prisma.clanMember.findUnique({
      where: { trainerId: session.user.id }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already in a clan. Leave first to create a new one.' },
        { status: 400 }
      );
    }

    // Check if name or tag already exists
    const existing = await prisma.clan.findFirst({
      where: {
        OR: [{ name }, { tag }]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Clan name or tag already exists' },
        { status: 400 }
      );
    }

    // Create clan and add leader as member
    const clan = await prisma.clan.create({
      data: {
        name,
        tag,
        description: description || null,
        leaderId: session.user.id,
        members: {
          create: {
            trainerId: session.user.id,
            role: 'leader'
          }
        }
      },
      include: {
        leader: { select: { username: true } },
        _count: { select: { members: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Clan created!',
      clan: {
        id: clan.id,
        name: clan.name,
        tag: clan.tag,
        leader: clan.leader.username,
        memberCount: clan._count.members,
      }
    });

  } catch (error) {
    console.error('Clan create error:', error);
    return NextResponse.json(
      { error: 'Failed to create clan' },
      { status: 500 }
    );
  }
}
