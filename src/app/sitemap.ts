import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://naruto-arena-delta.vercel.app';

  // Static pages
  const staticPages = [
    '',
    '/login',
    '/register',
    '/forgot-password',
    '/play',
    '/battle/ai',
    '/multiplayer',
    '/ladder',
    '/clans',
    '/characters',
    '/pokedex',
    '/missions',
    '/tutorial',
    '/the-basics',
    '/game-manual',
    '/news-archive',
    '/select-team',
    '/trainer-ladder',
    '/road-to-champion',
    '/collection',
    '/ladders',
    '/unlock-pokemon',
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : route === '/play' ? 0.9 : 0.8,
  }));

  // Dynamic routes: Player profiles
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const trainers = await prisma.trainer.findMany({
      select: { username: true, updatedAt: true },
      orderBy: { ladderPoints: 'desc' },
      take: 200,
    });
    profileRoutes = trainers.map((t) => ({
      url: `${baseUrl}/profile/${encodeURIComponent(t.username)}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable during build — skip dynamic routes
  }

  // Dynamic routes: Clans
  let clanRoutes: MetadataRoute.Sitemap = [];
  try {
    const clans = await prisma.clan.findMany({
      select: { id: true, createdAt: true },
      orderBy: { points: 'desc' },
      take: 100,
    });
    clanRoutes = clans.map((c) => ({
      url: `${baseUrl}/clan/${c.id}`,
      lastModified: c.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
  } catch {
    // DB unavailable during build — skip dynamic routes
  }

  return [...staticRoutes, ...profileRoutes, ...clanRoutes];
}
