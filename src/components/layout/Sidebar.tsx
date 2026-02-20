/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { AccountBox } from '@/components/auth/AccountBox';

export function LeftSidebar() {
  return (
    <aside className="sidebar-left">
      {/* Discord Oficial */}
      <div className="sidebar-box discord-box">
        <div className="sidebar-box-header" style={{ 
          background: 'linear-gradient(135deg, #5865F2, #7289DA)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
          </svg>
          Discord Oficial
        </div>
        <div className="sidebar-box-content" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '12px', color: '#ccc' }}>Entre na nossa comunidade!</p>
          <a 
            href="https://discord.gg/cnnM32wK" 
            target="_blank" 
            rel="noopener noreferrer"
            className="discord-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#5865F2',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
            </svg>
            Entrar no Discord
          </a>
          <p style={{ fontSize: '0.75rem', marginTop: '10px', color: '#888' }}>Chat, torneios e novidades!</p>
        </div>
      </div>

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

      {/* Pokédex */}
      <div className="sidebar-box pokedex-box">
        <div className="sidebar-box-header" style={{ background: 'linear-gradient(135deg, #E3350D, #FFCB05)' }}>Pokédex</div>
        <div className="sidebar-box-content">
          <p>Explore todos os Pokémon!</p>
          <Link href="/pokedex" className="pokedex-button">
            Abrir Pokédex
          </Link>
          <p style={{ fontSize: '0.8rem', marginTop: '8px', color: '#888' }}>Dados da PokeAPI</p>
        </div>
      </div>

      {/* Account - Dinâmico */}
      <AccountBox />

      {/* Battle Guides */}
      <div className="sidebar-box">
        <div className="sidebar-box-header">Battle Guides</div>
        <div className="sidebar-box-content">
          <p className="video-section-title">Looking for team suggestions?<br />Check out the channels below:</p>
          <div className="video-link">
            <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
            <Link href="#">PokeTuber (Youtube)</Link>
          </div>
          <div className="video-link">
            <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
            <Link href="#">PokeGuides (Youtube)</Link>
          </div>
          <p className="video-section-title">Recent Battle Videos:</p>
          <div className="video-link">
            <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
            <Link href="#">Unlocking Mewtwo (S)</Link>
          </div>
          <div className="video-link">
            <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
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
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
              <Link href="#">PokeRanker (Youtube)</Link>
            </div>
            <div className="video-link">
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
              <Link href="#">ArenaChamp (Youtube)</Link>
            </div>
          </div>
          <p className="video-section-title">Recent Ladder Videos:</p>
          <div className="video-link">
            <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
            <Link href="#">Becoming a Pokemon Trainer | New Player Teams</Link>
          </div>
          <div className="video-link">
            <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
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
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
              <Link href="/news-archive/balance-update-1-3-9-5">Balance Update 1.3.9.5</Link>
            </div>
            <div className="news-archive-item">
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
              <Link href="/news-archive">Balance Update 1.3.9 + Event Missions</Link>
            </div>
            <div className="news-archive-item">
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
              <Link href="/news-archive">Balance Update 1.3.8</Link>
            </div>
            <div className="news-archive-item">
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
              <Link href="/news-archive">Balance Update 1.3.7</Link>
            </div>
            <div className="news-archive-item">
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
              <Link href="/news-archive">Balance 03/11/2025</Link>
            </div>
            <div className="news-archive-item">
              <img src="/images/pokemon-pikachu.jpg" alt="bullet" />
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
            <img src="/images/pokemon-battle.webp" alt="Random Screenshot" />
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
            <img src="/images/ash-ketchum.webp" alt="Pokemon Master" className="rikudou-icon" />
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
            <img src="/images/pokemon-poster.jpg" alt="Champion" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/ransfordwest">ransfordwest</Link></span>
            <span className="kage-streak">39</span>
          </div>
          <div className="kage-item">
            <img src="/images/bulbasaur.jpg" alt="Elite 1" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/Cemito">Cemito</Link></span>
            <span className="kage-streak">36</span>
          </div>
          <div className="kage-item">
            <img src="/images/pokemon-group-1.jpg" alt="Elite 2" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/Trevor">Trevor</Link></span>
            <span className="kage-streak">36</span>
          </div>
          <div className="kage-item">
            <img src="/images/pokemon-group-2.jpg" alt="Elite 3" className="kage-icon" />
            <span className="kage-name"><Link href="/profile/Kershark">Kershark</Link></span>
            <span className="kage-streak">1</span>
          </div>
          <div className="kage-item">
            <img src="/images/pokemon-pikachu.jpg" alt="Elite 4" className="kage-icon" />
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
