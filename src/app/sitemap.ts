import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];

  const staticRoutes = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // TODO: Add dynamic routes (profiles, clans, characters)
  // This would require fetching from database

  return staticRoutes;
}
