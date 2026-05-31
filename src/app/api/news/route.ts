import { NextResponse } from 'next/server';

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  category: 'balance' | 'update' | 'event' | 'announcement';
}

// Static news data - can be migrated to database later
const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    slug: 'balance-update-1-3-9-5',
    title: 'Balance Update 1.3.9.5',
    date: '2025-12-25',
    author: 'Dark',
    excerpt: 'Merry Christmas! 3 nerfs and 3 buffs to shake up the META.',
    category: 'balance',
  },
  {
    id: '2',
    slug: 'balance-update-1-3-9',
    title: 'Balance Update 1.3.9 + Event Missions',
    date: '2025-12-15',
    author: 'Dark',
    excerpt: 'New event missions for the holiday season! Plus balance changes.',
    category: 'event',
  },
  {
    id: '3',
    slug: 'balance-update-1-3-8',
    title: 'Balance Update 1.3.8',
    date: '2025-12-01',
    author: 'Dark',
    excerpt: 'Major balance changes. Several S-tier characters adjusted.',
    category: 'balance',
  },
  {
    id: '4',
    slug: 'major-update-1-4-0',
    title: 'Major Update 1.4.0 - New Characters!',
    date: '2026-01-02',
    author: 'Dark',
    excerpt: 'New characters have arrived! Season reset and ladder changes.',
    category: 'update',
  },
  {
    id: '5',
    slug: 'season-2-announcement',
    title: 'Season 2 Announcement',
    date: '2026-01-15',
    author: 'Staff',
    excerpt: 'Season 2 begins with new rewards, battle pass, and ranked changes.',
    category: 'announcement',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');
  const category = searchParams.get('category');

  let items = NEWS_ITEMS;

  if (category) {
    items = items.filter(item => item.category === category);
  }

  items = items.slice(0, limit);

  return NextResponse.json({
    news: items,
    total: NEWS_ITEMS.length,
  });
}
