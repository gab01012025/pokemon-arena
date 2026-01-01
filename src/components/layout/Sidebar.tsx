/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export function LeftSidebar() {
  return (
    <aside className="sidebar-left">
      {/* Users Online */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Users Online</div>
        <div className="sidebar-box-content">
          <div className="users-online-count">
            <span className="users-online-icon"></span>
            <span className="users-online-number">226</span>
          </div>
        </div>
      </div>

      {/* Patreon */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Patreon</div>
        <div className="sidebar-box-content">
          <a href="https://www.patreon.com" className="patreon-button">
            🅿️ PATREON
          </a>
          <p className="patreon-desc">Buy Characters on Patreon And Support the game!</p>
        </div>
      </div>

      {/* Pokemon-Boards */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Pokemon-Boards</div>
        <div className="sidebar-box-content">
          <p>Visit the</p>
          <p><Link href="#">Pokemon-Boards.site</Link></p>
          <p>The official Pokemon Arena Forums.</p>
        </div>
      </div>

      {/* Pokemon Helper */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Pokemon Helper</div>
        <div className="sidebar-box-content">
          <p>Visit the</p>
          <p><Link href="#">Pokemon Helper Site</Link></p>
          <p>The official Pokemon Arena Helper.</p>
        </div>
      </div>

      {/* Account */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Account</div>
        <div className="sidebar-box-content">
          <div className="account-links">
            <p>Welcome, <strong>gab123</strong></p>
            <p><Link href="/profile/gab123">View Profile</Link></p>
            <p><Link href="#">Control Panel</Link></p>
            <p><Link href="#" className="highlight">Change Title (NEW)</Link></p>
            <p><Link href="#" className="highlight">Choose Starter (NEW)</Link></p>
            <p><Link href="#">Change Avatar</Link></p>
            <p><Link href="#">Clan Panel</Link></p>
            <p><Link href="#">Desktop Background</Link></p>
            <p><Link href="#">Reset Account</Link></p>
            <p><Link href="#">Logout</Link></p>
          </div>
        </div>
      </div>

      {/* Battle Guides */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Battle Guides</div>
        <div className="sidebar-box-content">
          <p className="video-section-title">Looking for team suggestions?<br />Check out the channels below:</p>
          <div className="video-link">
            <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
            <Link href="#">PokeTuber (Youtube)</Link>
          </div>
          <div className="video-link">
            <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
            <Link href="#">PokeGuides (Youtube)</Link>
          </div>
          <p className="video-section-title">Recent Battle Videos:</p>
          <div className="video-link">
            <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
            <Link href="#">Unlocking Mewtwo (S)</Link>
          </div>
          <div className="video-link">
            <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
            <Link href="#">Unlocking Charizard (S)</Link>
          </div>
        </div>
      </div>

      {/* Ladder Videos */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Ladder Videos</div>
        <div className="sidebar-box-content">
          <p className="video-section-title">Looking for teams to rank up in Ladder Game?<br />Check out the channels below:</p>
          <div className="video-section">
            <div className="video-link">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="#">PokeRanker (Youtube)</Link>
            </div>
            <div className="video-link">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="#">ArenaChamp (Youtube)</Link>
            </div>
          </div>
          <p className="video-section-title">Recent Ladder Videos:</p>
          <div className="video-link">
            <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
            <Link href="#">Becoming a Pokemon Trainer | New Player Teams</Link>
          </div>
          <div className="video-link">
            <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
            <Link href="#">+26 STARTER TEAM</Link>
          </div>
        </div>
      </div>

      {/* News Archive */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">News Archive</div>
        <div className="sidebar-box-content">
          <div className="news-archive-list">
            <div className="news-archive-item">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="/news-archive/balance-update-1-3-9-5">Balance Update 1.3.9.5</Link>
            </div>
            <div className="news-archive-item">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="/news-archive">Balance Update 1.3.9 + Event Missions</Link>
            </div>
            <div className="news-archive-item">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="/news-archive">Balance Update 1.3.8</Link>
            </div>
            <div className="news-archive-item">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="/news-archive">Balance Update 1.3.7</Link>
            </div>
            <div className="news-archive-item">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="/news-archive">Balance 03/11/2025</Link>
            </div>
            <div className="news-archive-item">
              <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
              <Link href="/news-archive">Major Update 1.3.6 + Ladder Reset</Link>
            </div>
          </div>
          <div className="see-more">
            <Link href="/news-archive">See more</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function RightSidebar() {
  return (
    <aside className="sidebar-right">
      {/* Random Screenshot */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Random Screenshot</div>
        <div className="sidebar-box-content screenshot-box">
          <Link href="#">
            <img src="https://i.imgur.com/keSQK8h.jpg" alt="Random Screenshot" />
          </Link>
        </div>
      </div>

      {/* First Time Playing */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">First time playing?</div>
        <div className="sidebar-box-content">
          <div className="first-time-note">
            <strong>Note:</strong> If this is your first time playing, be sure to check out the{' '}
            <Link href="/the-basics">The Basics</Link> before you start battling.
          </div>
        </div>
      </div>

      {/* Time to Season End */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Time to season end:</div>
        <div className="sidebar-box-content">
          <div className="season-timer">
            <div className="season-timer-value">15 days, 9 hours, 52 minutes remaining</div>
          </div>
        </div>
      </div>

      {/* Pokemon Master */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Pokemon Master</div>
        <div className="sidebar-box-content">
          <div className="rikudou-item">
            <img src="https://i.imgur.com/BHkYpfb.png" alt="Pokemon Master" className="rikudou-icon" />
            <div className="rikudou-info">
              <div className="rikudou-name"><Link href="/profile/TaigiCiaAs">TaigiCiaAs</Link></div>
              <div className="rikudou-rank">1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Elite Four + Champion */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Elite Four + Champion</div>
        <div className="sidebar-box-content">
          <div className="kage-item">
            <img src="https://imgur.com/4f5yXZV.png" alt="Champion" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/ransfordwest">ransfordwest</Link></span>
            <span className="kage-streak">39</span>
          </div>
          <div className="kage-item">
            <img src="https://i.imgur.com/fMdAQbr.png" alt="Elite 1" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/Cemito">Cemito</Link></span>
            <span className="kage-streak">36</span>
          </div>
          <div className="kage-item">
            <img src="https://i.imgur.com/5yQwRWE.png" alt="Elite 2" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/Trevor">Trevor</Link></span>
            <span className="kage-streak">36</span>
          </div>
          <div className="kage-item">
            <img src="https://i.imgur.com/uXjWKi8.png" alt="Elite 3" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/Kershark">Kershark</Link></span>
            <span className="kage-streak">1</span>
          </div>
          <div className="kage-item">
            <img src="https://i.imgur.com/w79ztu2.png" alt="Elite 4" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/tsogu">tsogu</Link></span>
            <span className="kage-streak">25</span>
          </div>
        </div>
      </div>

      {/* Road To Champion */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Road To Champion</div>
        <div className="sidebar-box-content">
          <div className="top-list">
            {[
              { rank: '01', name: 'Rafa', value: '62' },
              { rank: '02', name: 'HalfDead-', value: '61' },
              { rank: '03', name: 'Eight', value: '61' },
              { rank: '04', name: 'Kries', value: '59' },
              { rank: '05', name: 'MadoushiX', value: '59' },
              { rank: '06', name: 'ichi404', value: '58' },
              { rank: '07', name: 'Derlas', value: '58' },
              { rank: '08', name: 'slovak2202', value: '58' },
              { rank: '09', name: 'brunox1', value: '58' },
              { rank: '10', name: 'RasenWHO', value: '58' },
            ].map((player, i) => (
              <div key={i} className="top-list-item">
                <span className={`top-rank ${i < 3 ? `top-rank-${i + 1}` : ''}`}>{player.rank}</span>
                <span className="top-name"><Link href={`/profile/${player.name}`}>{player.name}</Link></span>
                <span className="top-value">{player.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Clanladder */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Top 10 Clanladder</div>
        <div className="sidebar-box-content">
          <div className="top-list">
            {[
              { rank: '01', name: 'Hoshigama', value: '251' },
              { rank: '02', name: 'Kaminari O Shiri', value: '206' },
              { rank: '03', name: 'One Piece', value: '188' },
              { rank: '04', name: 'Juryoku', value: '154' },
              { rank: '05', name: 'Imperium', value: '151' },
              { rank: '06', name: 'Kyaouuko', value: '126' },
              { rank: '07', name: 'Shock', value: '123' },
              { rank: '08', name: 'Elite Four', value: '121' },
              { rank: '09', name: 'Kokuryukai', value: '108' },
              { rank: '10', name: 'Black Bulls', value: '97' },
            ].map((clan, i) => (
              <div key={i} className="top-list-item">
                <span className={`top-rank ${i < 3 ? `top-rank-${i + 1}` : ''}`}>{clan.rank}</span>
                <span className="top-name"><Link href={`/clan/${clan.name.toLowerCase().replace(/ /g, '-')}`}>{clan.name}</Link></span>
                <span className="top-value">{clan.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Winstreak */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">
          Top 10 Winstreak
          <span className="help-icon" title="Shows the highest win streaks starting from December 20, 2025.">?</span>
        </div>
        <div className="sidebar-box-content">
          <div className="top-list">
            {[
              { rank: '1.', name: 'ace', value: '+56 streak' },
              { rank: '2.', name: 'Konan', value: '+53 streak' },
              { rank: '3.', name: 'Kanabi', value: '+23 streak' },
              { rank: '4.', name: 'Sleke', value: '+17 streak' },
              { rank: '5.', name: 'DonJuan', value: '+15 streak' },
              { rank: '6.', name: 'Johel_R05', value: '+15 streak' },
              { rank: '7.', name: 'HashiramaSenju', value: '+13 streak' },
              { rank: '8.', name: 'Erenn', value: '+12 streak' },
              { rank: '9.', name: 'neptz', value: '+11 streak' },
              { rank: '10.', name: 'msdetox', value: '+11 streak' },
            ].map((player, i) => (
              <div key={i} className="top-list-item">
                <span className={`top-rank ${i < 3 ? `top-rank-${i + 1}` : ''}`}>{player.rank}</span>
                <span className="top-name"><Link href={`/profile/${player.name}`}>{player.name}</Link></span>
                <span className="top-value">{player.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Version Info</div>
        <div className="sidebar-box-content">
          <div className="version-info">Version OFFICIAL 1.0</div>
        </div>
      </div>
    </aside>
  );
}
