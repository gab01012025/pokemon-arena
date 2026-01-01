/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function NewsArchive() {
  const newsItems = [
    {
      slug: 'balance-update-1-3-9-5',
      title: 'Balance Update 1.3.9.5',
      date: 'December 25, 2025',
      author: 'Dark',
      excerpt: 'Merry Christmas everyone! We\'ve decided to bring you some news today with 3 nerfs and 3 buffs.',
    },
    {
      slug: 'balance-update-1-3-9',
      title: 'Balance Update 1.3.9 + Event Missions',
      date: 'December 15, 2025',
      author: 'Dark',
      excerpt: 'New event missions for the holiday season! Plus balance changes to several characters.',
    },
    {
      slug: 'balance-update-1-3-8',
      title: 'Balance Update 1.3.8',
      date: 'December 1, 2025',
      author: 'Dark',
      excerpt: 'Major balance changes to the meta. Several S-tier characters have been adjusted.',
    },
    {
      slug: 'balance-update-1-3-7',
      title: 'Balance Update 1.3.7 + Staff Official Tournament: N-A Draft',
      date: 'November 20, 2025',
      author: 'Dark',
      excerpt: 'Announcing the official staff tournament with draft format!',
    },
    {
      slug: 'balance-03-11-2025',
      title: 'Balance 03/11/2025',
      date: 'November 3, 2025',
      author: 'Staff',
      excerpt: 'Minor balance adjustments and bug fixes.',
    },
    {
      slug: 'major-update-1-3-6',
      title: 'Major Update 1.3.6 + Ladder Reset',
      date: 'October 15, 2025',
      author: 'Dark',
      excerpt: 'New season begins! Ladder has been reset and new characters have been added.',
    },
    {
      slug: 'balance-update-1-3-5-2',
      title: 'Balance Update 1.3.5.2',
      date: 'October 1, 2025',
      author: 'Staff',
      excerpt: 'Hotfix for critical issues discovered in 1.3.5.',
    },
    {
      slug: 'balance-update-1-3-5',
      title: 'Balance Update 1.3.5',
      date: 'September 20, 2025',
      author: 'Dark',
      excerpt: 'Comprehensive balance pass affecting 20+ characters.',
    },
    {
      slug: 'balance-update-1-3-4',
      title: 'Balance Update 1.3.4',
      date: 'September 1, 2025',
      author: 'Staff',
      excerpt: 'Quality of life improvements and minor balance changes.',
    },
    {
      slug: 'season-reset-new-ranking',
      title: 'Season Reset & New Ranking System',
      date: 'August 15, 2025',
      author: 'Dark',
      excerpt: 'Introducing the new ranking system with improved matchmaking!',
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/ninja-missions" className="nav-btn-top">Ninja Missions</Link>
              <a href="https://discord.gg/narutoarena" className="nav-btn-top discord-btn">🎮 DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <img src="https://i.imgur.com/GNheiTq.png" alt="Naruto Arena Banner" className="header-logo" />
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">News Archive</h1>

          {/* News Archive */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>News Archive</h2>
            </div>
            <div className="content-box-body">
              <div className="news-list">
                {newsItems.map((news, index) => (
                  <article key={index} className="news-list-item">
                    <div className="news-list-header">
                      <h3>
                        <Link href={`/news-archive/${news.slug}`}>
                          <img src="https://i.imgur.com/TpjIGzV.gif" alt="icon" className="news-icon" />
                          {news.title}
                        </Link>
                      </h3>
                      <span className="news-list-date">
                        {news.date} by <Link href={`/profile/${news.author}`}>{news.author}</Link>
                      </span>
                    </div>
                    <p className="news-list-excerpt">{news.excerpt}</p>
                    <Link href={`/news-archive/${news.slug}`} className="news-read-more">
                      Read more →
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button className="pagination-btn" disabled>« First</button>
                <button className="pagination-btn" disabled>‹ Prev</button>
                <span className="pagination-info">Page 1 of 5</span>
                <button className="pagination-btn">Next ›</button>
                <button className="pagination-btn">Last »</button>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
