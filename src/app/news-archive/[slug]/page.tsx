/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Mock news data - In real app, fetch from database
const getNewsDetails = (slug: string) => {
  const newsMap: Record<string, { title: string; date: string; author: string; content: string }> = {
    'balance-update-1.3.9.5': {
      title: 'Balance Update 1.3.9.5',
      date: 'Thursday, December 25th, 2025 at 16:01',
      author: 'Dark',
      content: `
        <p><strong>Merry Christmas everyone!</strong></p>
        <p>We've decided to bring you some news today:</p>
        <ul>
          <li>We will be moving the end of this season to January 1st, 2026 at 23:59 (UTC+0).</li>
          <li>As a result, Major Update 1.4.0 (New Characters) has also been postponed to January 2nd, 2026.</li>
          <li>Top 10 Winstreaks will now only show players who played during the current Season (counting from December 20th).</li>
          <li>Top 20 Highest Streak has been added.</li>
        </ul>
        <hr />
        <p>So for now, we didn't want to leave the game with no update, so we're bringing a new BU with 3 nerfs and 3 buffs to shake up the META!</p>
        <p class="news-post-signature">~ Pokemon Arena Classic Staff</p>
      `
    },
    'balance-update-1.3.9-+-event-missions': {
      title: 'Balance Update 1.3.9 + Event Missions',
      date: 'Friday, December 20th, 2025 at 14:30',
      author: 'Dark',
      content: `
        <p>Balance Update 1.3.9 is here with new Event Missions!</p>
        <p>Complete special missions during the holiday season to earn exclusive rewards.</p>
        <p class="news-post-signature">~ Pokemon Arena Classic Staff</p>
      `
    },
    'balance-update-1.3.8': {
      title: 'Balance Update 1.3.8',
      date: 'Monday, December 15th, 2025 at 10:00',
      author: 'Dark',
      content: `
        <p>Balance Update 1.3.8 brings important changes to the meta.</p>
        <p>Check the changelog for details on all the changes.</p>
        <p class="news-post-signature">~ Pokemon Arena Classic Staff</p>
      `
    }
  };
  
  return newsMap[slug] || null;
};

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = getNewsDetails(slug);

  if (!news) {
    return (
      <div className="page-wrapper">
        <div className="main-container">
          <LeftSidebar />
          <main className="center-content">
            <div className="page-content">
              <h1 className="page-title">News Not Found</h1>
              <div className="content-section">
                <div className="section-content">
                  <p>The news article you&apos;re looking for could not be found.</p>
                  <p><Link href="/news-archive">Back to News Archive</Link></p>
                </div>
              </div>
            </div>
          </main>
          <RightSidebar />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <LeftSidebar />

        <main className="center-content">
          <div className="page-content">
            <div className="news-detail">
              <article className="news-post">
                <div className="news-post-header">
                  <div className="news-post-title">
                    <img src="/images/pokemon-characters.webp" alt="icon" />
                    {news.title}
                  </div>
                  <div className="news-post-date">
                    {news.date} by <Link href={`/profile/${news.author}`}>{news.author}</Link>
                  </div>
                </div>
                <div 
                  className="news-post-content"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              </article>
              
              <div className="news-navigation">
                <Link href="/news-archive" className="back-link">
                  ← Back to News Archive
                </Link>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
