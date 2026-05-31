'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  category: 'balance' | 'update' | 'event' | 'announcement';
}

const CATEGORY_COLORS: Record<string, string> = {
  balance: '#f59e0b',
  update: '#3b82f6',
  event: '#8b5cf6',
  announcement: '#ef4444',
};

const CATEGORY_LABELS: Record<string, string> = {
  balance: 'Balance',
  update: 'Update',
  event: 'Event',
  announcement: 'News',
};

interface NewsFeedProps {
  limit?: number;
  compact?: boolean;
}

export function NewsFeed({ limit = 5, compact = false }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news?limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setNews(data.news || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="news-feed-loading">
        <div className="news-feed-skeleton" />
        <div className="news-feed-skeleton" />
        <div className="news-feed-skeleton" />
      </div>
    );
  }

  if (news.length === 0) {
    return <div className="news-feed-empty">No news available</div>;
  }

  if (compact) {
    return (
      <div className="news-feed-compact">
        {news.map(item => (
          <Link
            key={item.id}
            href={`/news-archive/${item.slug}`}
            className="news-feed-compact-item"
          >
            <span
              className="news-feed-category-dot"
              style={{ background: CATEGORY_COLORS[item.category] }}
            />
            <span className="news-feed-compact-title">{item.title}</span>
            <span className="news-feed-compact-date">
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="news-feed">
      {news.map(item => (
        <Link
          key={item.id}
          href={`/news-archive/${item.slug}`}
          className="news-feed-item"
        >
          <div className="news-feed-item-header">
            <span
              className="news-feed-category-badge"
              style={{
                background: `${CATEGORY_COLORS[item.category]}20`,
                color: CATEGORY_COLORS[item.category],
                borderColor: `${CATEGORY_COLORS[item.category]}40`,
              }}
            >
              {CATEGORY_LABELS[item.category]}
            </span>
            <span className="news-feed-date">
              {new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h3 className="news-feed-title">{item.title}</h3>
          <p className="news-feed-excerpt">{item.excerpt}</p>
          <span className="news-feed-author">by {item.author}</span>
        </Link>
      ))}
      <Link href="/news-archive" className="news-feed-see-all">
        View all news &rarr;
      </Link>
    </div>
  );
}
