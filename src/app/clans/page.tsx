/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

const topClans = [
  { rank: 1, name: 'Hoshigama', slug: 'hoshigama', points: 251, members: 25 },
  { rank: 2, name: 'Kaminari O Shiri', slug: 'kaminari-o-shiri', points: 206, members: 22 },
  { rank: 3, name: 'One Piece', slug: 'one-piece', points: 188, members: 20 },
  { rank: 4, name: 'Juryoku', slug: 'juryoku', points: 154, members: 18 },
  { rank: 5, name: 'Imperium', slug: 'imperium', points: 151, members: 19 },
  { rank: 6, name: 'Kyaouuko', slug: 'kyaouuko', points: 126, members: 15 },
  { rank: 7, name: 'Shock', slug: 'shock', points: 123, members: 14 },
  { rank: 8, name: 'Elite Four', slug: 'elite-four', points: 121, members: 12 },
  { rank: 9, name: 'Kokuryukai', slug: 'kokuryukai', points: 108, members: 11 },
  { rank: 10, name: 'Black Bulls', slug: 'black-bulls', points: 97, members: 10 },
];

export default function ClansPage() {
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
          <h1 className="page-title">Clans</h1>
            
            {/* Clan Ladder */}
            <div className="content-section">
              <div className="section-title">Clan Ladder - Top 50</div>
              <div className="section-content">
                <table className="ladder-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Rank</th>
                      <th>Clan Name</th>
                      <th style={{ width: '80px' }}>Points</th>
                      <th style={{ width: '80px' }}>Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClans.map((clan) => (
                      <tr key={clan.rank} className={clan.rank <= 3 ? 'top-rank' : ''}>
                        <td>
                          <span className={`rank-number rank-${clan.rank}`}>{clan.rank}</span>
                        </td>
                        <td>
                          <Link href={`/clan/${clan.slug}`} className="clan-link">
                            {clan.name}
                          </Link>
                        </td>
                        <td className="points-cell">{clan.points}</td>
                        <td>{clan.members}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Clan */}
            <div className="content-section">
              <div className="section-title">Create a Clan</div>
              <div className="section-content">
                <p>Want to start your own clan? You need to meet the following requirements:</p>
                <ul className="requirements-list">
                  <li>Be at least Rank 30 (Jonin)</li>
                  <li>Have at least 500 wins</li>
                  <li>Have at least 3 founding members ready to join</li>
                  <li>Pay the clan creation fee of 1000 points</li>
                </ul>
                <button className="btn-submit" style={{ marginTop: '15px' }}>Create Clan</button>
              </div>
            </div>

            {/* Clan Info */}
            <div className="content-section">
              <div className="section-title">About Clans</div>
              <div className="section-content">
                <p>Clans are groups of players who team up to compete in the Clan Ladder. Being in a clan offers several benefits:</p>
                <ul className="benefits-list">
                  <li><strong>Clan Chat:</strong> Private chat room for clan members</li>
                  <li><strong>Clan Wars:</strong> Compete against other clans for ranking</li>
                  <li><strong>Exclusive Rewards:</strong> Top clans receive special rewards at season end</li>
                  <li><strong>Community:</strong> Find teammates and friends to play with</li>
                </ul>
              </div>
            </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
