import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getLadder() {
  const trainers = await prisma.trainer.findMany({
    select: {
      id: true,
      username: true,
      avatar: true,
      level: true,
      wins: true,
      losses: true,
      streak: true,
      ladderPoints: true,
      clanMember: {
        select: {
          clan: {
            select: { name: true, tag: true }
          }
        }
      }
    },
    orderBy: [
      { ladderPoints: 'desc' },
      { wins: 'desc' },
    ],
    take: 100,
  });
  
  return trainers.map((t, index) => ({
    rank: index + 1,
    ...t,
    winRate: t.wins + t.losses > 0 
      ? Math.round((t.wins / (t.wins + t.losses)) * 100) 
      : 0,
    clan: t.clanMember?.clan?.name || null,
    clanTag: t.clanMember?.clan?.tag || null,
  }));
}

export default async function TrainerLadder() {
  const trainers = await getLadder();

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    if (rank <= 10) return 'rank-elite';
    return '';
  };

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
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">🎮 DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>⚡ POKEMON ARENA ⚡</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">🏆 Trainer Ladder</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; 
            <Link href="/ladders">Ladders</Link> &gt; 
            <span className="current">Trainer Ladder</span>
          </div>

          <div className="content-section">
            <div className="section-title">Top 100 Trainers</div>
            <div className="section-content">
              {trainers.length === 0 ? (
                <p className="no-data">No trainers yet. Be the first to play!</p>
              ) : (
                <table className="ladder-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th>Trainer</th>
                      <th style={{ width: '100px' }}>Clan</th>
                      <th style={{ width: '80px' }}>Points</th>
                      <th style={{ width: '60px' }}>Wins</th>
                      <th style={{ width: '60px' }}>Losses</th>
                      <th style={{ width: '60px' }}>Win%</th>
                      <th style={{ width: '60px' }}>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainers.map((trainer) => (
                      <tr key={trainer.id} className={getRankClass(trainer.rank)}>
                        <td>
                          <span className={`rank-number rank-${trainer.rank}`}>
                            {trainer.rank <= 3 ? ['🥇', '🥈', '🥉'][trainer.rank - 1] : trainer.rank}
                          </span>
                        </td>
                        <td>
                          <Link href={`/profile/${trainer.username}`} className="trainer-link">
                            <span className="trainer-name">{trainer.username}</span>
                            <span className="trainer-level">Lv.{trainer.level}</span>
                          </Link>
                        </td>
                        <td>
                          {trainer.clan ? (
                            <Link href={`/clan/${trainer.clan?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`} className="clan-link">
                              [{trainer.clanTag}] {trainer.clan}
                            </Link>
                          ) : (
                            <span className="no-clan">-</span>
                          )}
                        </td>
                        <td className="points-cell">
                          <strong>{trainer.ladderPoints}</strong>
                        </td>
                        <td className="wins-cell">{trainer.wins}</td>
                        <td className="losses-cell">{trainer.losses}</td>
                        <td className="winrate-cell">{trainer.winRate}%</td>
                        <td className="streak-cell">
                          {trainer.streak > 0 ? `🔥 ${trainer.streak}` : trainer.streak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="content-section">
            <div className="section-title">How Ladder Points Work</div>
            <div className="section-content">
              <ul className="ladder-info">
                <li>Win a <strong>Ranked Match</strong> to gain points</li>
                <li>Points gained depend on opponent&apos;s rating</li>
                <li>Winning streaks give bonus points</li>
                <li>Top 10 at season end receive special rewards</li>
              </ul>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
