/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/lib/prisma';
import { ClansClient } from './ClansClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getTopClans() {
  const clans = await prisma.clan.findMany({
    select: {
      id: true,
      name: true,
      tag: true,
      description: true,
      points: true,
      wins: true,
      losses: true,
      _count: {
        select: { members: true }
      }
    },
    orderBy: { points: 'desc' },
    take: 50
  });

  return clans.map((clan, index) => ({
    rank: index + 1,
    id: clan.id,
    name: clan.name,
    tag: clan.tag,
    description: clan.description || '',
    experience: clan.points, // usando points como XP
    wins: clan.wins,
    losses: clan.losses,
    members: clan._count.members
  }));
}

export default async function ClansPage() {
  const topClans = await getTopClans();

  return <ClansClient initialClans={topClans} />;
}
