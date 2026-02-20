/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface ClanPageProps {
  params: Promise<{
    clanname: string;
  }>;
}

export default async function ClanPage({ params }: ClanPageProps) {
  const { clanname } = await params;
  const formattedName = decodeURIComponent(clanname)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Mock clan data
  const clanData = {
    name: formattedName,
    tag: '[' + formattedName.substring(0, 3).toUpperCase() + ']',
    description: 'A powerful clan of elite trainers dedicated to becoming the best in the arena.',
    leader: 'Rafa',
    coLeaders: ['HalfDead-', 'Eight'],
    members: 45,
    maxMembers: 50,
    rank: 1,
    points: 251,
    wins: 1250,
    losses: 380,
    winRate: '76.7%',
    founded: 'March 10, 2024',
    topMembers: [
      { name: 'Rafa', role: 'Leader', wins: 320, streak: 15 },
      { name: 'HalfDead-', role: 'Co-Leader', wins: 290, streak: 12 },
      { name: 'Eight', role: 'Co-Leader', wins: 275, streak: 10 },
      { name: 'Kries', role: 'Elite', wins: 250, streak: 8 },
      { name: 'MadoushiX', role: 'Elite', wins: 240, streak: 6 },
      { name: 'ichi404', role: 'Member', wins: 220, streak: 5 },
      { name: 'Derlas', role: 'Member', wins: 210, streak: 4 },
      { name: 'slovak2202', role: 'Member', wins: 200, streak: 3 },
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
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">{clanData.name}</h1>

          {/* Clan Header */}
          <div className="content-box clan-header-box">
            <div className="clan-header">
              <div className="clan-emblem">
                <span className="clan-tag">{clanData.tag}</span>
              </div>
              <div className="clan-info">
                <h2 className="clan-name">{clanData.name}</h2>
                <p className="clan-description">{clanData.description}</p>
                <div className="clan-meta">
                  <span className="clan-rank">Rank #{clanData.rank}</span>
                  <span className="clan-points">{clanData.points} Points</span>
                  <span className="clan-members">{clanData.members}/{clanData.maxMembers} Members</span>
                </div>
              </div>
              <div className="clan-actions">
                <button className="btn-primary">Apply to Join</button>
              </div>
            </div>
          </div>

          {/* Clan Stats */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Clan Statistics</h2>
            </div>
            <div className="content-box-body">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value stat-wins">{clanData.wins}</span>
                  <span className="stat-label">Clan Wins</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value stat-losses">{clanData.losses}</span>
                  <span className="stat-label">Clan Losses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{clanData.winRate}</span>
                  <span className="stat-label">Win Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{clanData.points}</span>
                  <span className="stat-label">Ladder Points</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">#{clanData.rank}</span>
                  <span className="stat-label">Clan Rank</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{clanData.founded}</span>
                  <span className="stat-label">Founded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Leadership</h2>
            </div>
            <div className="content-box-body">
              <div className="leadership-grid">
                <div className="leader-card leader-main">
                  <div className="leader-avatar">👑</div>
                  <div className="leader-info">
                    <span className="leader-role">Leader</span>
                    <Link href={`/profile/${clanData.leader}`} className="leader-name">
                      {clanData.leader}
                    </Link>
                  </div>
                </div>
                {clanData.coLeaders.map((coLeader, i) => (
                  <div key={i} className="leader-card leader-co">
                    <div className="leader-avatar">⭐</div>
                    <div className="leader-info">
                      <span className="leader-role">Co-Leader</span>
                      <Link href={`/profile/${coLeader}`} className="leader-name">
                        {coLeader}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Top Members</h2>
            </div>
            <div className="content-box-body">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Wins</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {clanData.topMembers.map((member, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <Link href={`/profile/${member.name}`}>{member.name}</Link>
                      </td>
                      <td>
                        <span className={`role-badge role-${member.role?.toLowerCase().replace('-', '') || 'member'}`}>
                          {member.role}
                        </span>
                      </td>
                      <td>{member.wins}</td>
                      <td className="streak-cell">
                        {member.streak > 0 ? (
                          <span className="streak-positive">+{member.streak}</span>
                        ) : (
                          <span className="streak-neutral">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
