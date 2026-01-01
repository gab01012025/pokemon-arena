/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Mock user data - in real app this would come from database
  const userData = {
    username: username,
    avatar: 'https://i.imgur.com/BHkYpfb.png',
    level: 'Kage',
    rank: 1,
    wins: 1250,
    losses: 320,
    winRate: '79.6%',
    streak: 15,
    maxStreak: 45,
    exp: 62,
    clan: 'Hoshigama',
    joinDate: 'January 15, 2024',
    lastOnline: '2 hours ago',
    favoriteCharacters: ['Naruto (S)', 'Sasuke (S)', 'Kakashi'],
    recentMatches: [
      { result: 'win', opponent: 'Player123', date: '2 hours ago' },
      { result: 'win', opponent: 'NinjaKing', date: '3 hours ago' },
      { result: 'loss', opponent: 'ShadowMaster', date: '5 hours ago' },
      { result: 'win', opponent: 'LeafNinja', date: '6 hours ago' },
      { result: 'win', opponent: 'AkatsukiFan', date: '8 hours ago' },
    ],
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
          <h1 className="page-title">Profile: {userData.username}</h1>

          {/* Profile Header */}
          <div className="content-box profile-header-box">
            <div className="profile-header">
              <div className="profile-avatar">
                <img src={userData.avatar} alt={userData.username} />
                <span className={`level-badge level-${userData.level.toLowerCase()}`}>
                  {userData.level}
                </span>
              </div>
              <div className="profile-info">
                <h2 className="profile-username">{userData.username}</h2>
                <div className="profile-meta">
                  <span className="profile-rank">Rank #{userData.rank}</span>
                  <span className="profile-clan">
                    Clan: <Link href={`/clan/${userData.clan.toLowerCase()}`}>{userData.clan}</Link>
                  </span>
                </div>
                <div className="profile-dates">
                  <span>Joined: {userData.joinDate}</span>
                  <span>Last online: {userData.lastOnline}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn-primary">Challenge</button>
                <button className="btn-secondary">Add Friend</button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Statistics</h2>
            </div>
            <div className="content-box-body">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value stat-wins">{userData.wins}</span>
                  <span className="stat-label">Wins</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value stat-losses">{userData.losses}</span>
                  <span className="stat-label">Losses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userData.winRate}</span>
                  <span className="stat-label">Win Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value stat-streak">{userData.streak}</span>
                  <span className="stat-label">Current Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userData.maxStreak}</span>
                  <span className="stat-label">Max Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userData.exp}</span>
                  <span className="stat-label">EXP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Characters */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Favorite Characters</h2>
            </div>
            <div className="content-box-body">
              <div className="favorite-chars">
                {userData.favoriteCharacters.map((char, i) => (
                  <div key={i} className="favorite-char">
                    <div className="char-placeholder">
                      <span>{char.charAt(0)}</span>
                    </div>
                    <span className="char-name">{char}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Recent Matches</h2>
            </div>
            <div className="content-box-body">
              <div className="match-history">
                {userData.recentMatches.map((match, i) => (
                  <div key={i} className={`match-item match-${match.result}`}>
                    <span className={`match-result result-${match.result}`}>
                      {match.result.toUpperCase()}
                    </span>
                    <span className="match-opponent">
                      vs <Link href={`/profile/${match.opponent}`}>{match.opponent}</Link>
                    </span>
                    <span className="match-date">{match.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
