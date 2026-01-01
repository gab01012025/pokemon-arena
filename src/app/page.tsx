/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export default function Home() {
  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          {/* Left Navigation */}
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">
                🎮 DISCORD
              </a>
            </div>
          </div>
          
          {/* Banner */}
          <div className="header-banner">
            <img 
              src="https://i.imgur.com/GNheiTq.png" 
              alt="Pokemon Arena Banner" 
              className="header-logo"
            />
          </div>
        </div>

        {/* Left Sidebar */}
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
                Patreon
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
              <form className="login-form">
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <label className="remember-me">
                  <input type="checkbox" />
                  Remember Me
                </label>
                <div className="login-buttons">
                  <button type="submit" className="btn-login">Login</button>
                  <Link href="/register" className="btn-register">Register</Link>
                </div>
                <p className="lost-password">
                  <Link href="/forgot-password">Lost your password?</Link>
                </p>
              </form>
            </div>
          </div>

          {/* Mission Videos */}
          <div className="sidebar-box">
            <div className="sidebar-box-header">Battle Guides</div>
            <div className="sidebar-box-content">
              <p className="video-section-title">Looking for team suggestions?<br />Check out the channels below:</p>
              <div className="video-section">
                <div className="video-link">
                  <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
                  <Link href="#">PokeTuber (Youtube)</Link>
                </div>
                <div className="video-link">
                  <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
                  <Link href="#">PokeGuides (Youtube)</Link>
                </div>
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
                  <Link href="#">Balance Update 1.3.9.5</Link>
                </div>
                <div className="news-archive-item">
                  <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
                  <Link href="#">Balance Update 1.3.9 + Event Missions</Link>
                </div>
                <div className="news-archive-item">
                  <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
                  <Link href="#">Balance Update 1.3.8</Link>
                </div>
                <div className="news-archive-item">
                  <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
                  <Link href="#">Balance Update 1.3.7</Link>
                </div>
                <div className="news-archive-item">
                  <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
                  <Link href="#">Balance 03/11/2025</Link>
                </div>
                <div className="news-archive-item">
                  <img src="https://i.imgur.com/NAlZ4gn.gif" alt="bullet" />
                  <Link href="#">Major Update 1.3.6 + Ladder Reset</Link>
                </div>
              </div>
              <div className="see-more">
                <Link href="/news-archive">See more</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <main className="center-content">
          {/* Header */}
          <div className="center-header">
            <h1 className="site-title">Pokemon Arena</h1>
            <p className="site-subtitle">Your #1 Pokemon Online Multiplayer Game</p>
          </div>

          {/* Banner */}
          <div className="banner-container">
            <img 
              src="https://i.imgur.com/GNheiTq.png" 
              alt="Pokemon Arena Banner" 
              className="banner-image"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="nav-buttons">
            <Link href="/play" className="nav-btn">
              <div className="nav-btn-icon">▶</div>
              Start Playing
            </Link>
            <Link href="/play" className="nav-btn">
              <div className="nav-btn-icon">▶</div>
              Start Playing
            </Link>
            <Link href="/play" className="nav-btn">
              <div className="nav-btn-icon">▶</div>
              Start Playing
            </Link>
            <Link href="/play" className="nav-btn">
              <div className="nav-btn-icon">▶</div>
              Start Playing
            </Link>
            <Link href="/play" className="nav-btn">
              <div className="nav-btn-icon">▶</div>
              Start Playing
            </Link>
          </div>

          {/* News Post */}
          <article className="news-post">
            <div className="news-post-header">
              <div className="news-post-title">
                <img src="https://i.imgur.com/TpjIGzV.gif" alt="icon" />
                Balance Update 1.3.9.5
              </div>
              <div className="news-post-date">
                Thursday, December 25th, 2025 at 16:01 by <Link href="/profile/Dark">Dark</Link>
              </div>
            </div>
            <div className="news-post-content">
              <p><strong>Merry Christmas everyone!</strong></p>
              <p>We&apos;ve decided to bring you some news today:</p>
              
              <ul>
                <li>We will be moving the end of this season to January 1st, 2026 at 23:59 (UTC+0).</li>
                <li>As a result, Major Update 1.4.0 (New Characters) has also been postponed to January 2nd, 2026.</li>
                <li>Top 10 Winstreaks will now only show players who played during the current Season (counting from December 20th).</li>
                <li>Top 20 Highest Streak has been added.</li>
              </ul>

              <hr style={{ borderColor: '#333', margin: '15px 0' }} />

              <p>So for now, we didn&apos;t want to leave the game with no update, so we&apos;re bringing a new BU with 3 nerfs and 3 buffs to shake up the META!</p>

              <p>PS: We still plan, in Major Update 1.4.0, to bring a small BU reverting all full stuns and new unecessary drain effects introduced in BU 1.3.7 and 1.3.8, and with that, restore the damage those characters lost while making few improvements.</p>

              <p className="news-post-signature">~ Pokemon Arena Classic Staff</p>

              <img 
                src="https://i.imgur.com/PPyxDke.png" 
                alt="Christmas Banner" 
                className="news-post-image"
              />
              <p style={{ fontSize: '10px', color: '#888' }}>~Made by MrChans</p>

              <p className="news-section-title">Balance:</p>
              <p>
                <strong>Nerfs:</strong>{' '}
                <Link href="#" className="news-link-red">Mewtwo (S)</Link>,{' '}
                <Link href="#" className="news-link-red">Rayquaza (S)</Link>,{' '}
                <Link href="#" className="news-link-red">Garchomp (S)</Link>.
              </p>
              <p>
                <strong>Boosts:</strong>{' '}
                <Link href="#" className="news-link-green">Pikachu (S)</Link>,{' '}
                <Link href="#" className="news-link-green">Charizard (S)</Link>.
              </p>
              <p>
                <strong>Tweaks/Minor Reworks/Rollbacks:</strong>{' '}
                <Link href="#" className="news-link-blue">Gengar</Link>.
              </p>

              {/* Character Stats Example */}
              <div className="balance-section balance-nerf">
                <div className="balance-title">Changes: Nerfs</div>
                <div className="char-stats">
                  <span className="char-stats-label">Wins:</span>
                  <span className="char-stats-wins">3744 (59.90%)</span>
                  <span className="char-stats-label">Matches Played:</span>
                  <span className="char-stats-matches">6250 (4.20%)</span>
                </div>
                <div className="skill-change">
                  <div className="skill-name">Psystrike</div>
                  <div className="skill-desc">
                    This skill no longer ignores stun.<br />
                    This skill now grants 10 points of unpierceable damage reduction, instead of 30% unpierceable damage reduction.
                  </div>
                </div>
              </div>

              <div className="balance-section balance-boost">
                <div className="balance-title">Changes: Boosts</div>
                <div className="char-stats">
                  <span className="char-stats-label">Wins:</span>
                  <span className="char-stats-wins">497 (40.64%)</span>
                  <span className="char-stats-label">Matches Played:</span>
                  <span className="char-stats-matches">1223 (0.82%)</span>
                </div>
                <div className="skill-change">
                  <div className="skill-name">Thunder</div>
                  <div className="skill-desc">
                    Now deals 5 affliction damage to Pikachu, down 5 from 10.
                  </div>
                </div>
              </div>
            </div>
            <div className="news-reactions">
              <span className="reaction"><span className="reaction-emoji">🔥</span> 12</span>
              <span className="reaction"><span className="reaction-emoji">😡</span> 14</span>
              <span className="reaction"><span className="reaction-emoji">😮</span> 4</span>
              <span className="reaction"><span className="reaction-emoji">🙄</span> 5</span>
              <span className="reaction"><span className="reaction-emoji">❤️</span> 3</span>
              <span className="reaction"><span className="reaction-emoji">+</span></span>
            </div>
          </article>

          {/* Footer Nav */}
          <div className="footer-nav">
            <Link href="/game-manual" className="footer-nav-item">
              <img src="https://i.imgur.com/khPXzVM.gif" alt="Game Manual" />
            </Link>
          </div>
        </main>

        {/* Right Sidebar */}
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
                <div className="top-list-item">
                  <span className="top-rank top-rank-1">01</span>
                  <span className="top-name"><Link href="/profile/Rafa">Rafa</Link></span>
                  <span className="top-value">62</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-2">02</span>
                  <span className="top-name"><Link href="/profile/HalfDead-">HalfDead-</Link></span>
                  <span className="top-value">61</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-3">03</span>
                  <span className="top-name"><Link href="/profile/Eight">Eight</Link></span>
                  <span className="top-value">61</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">04</span>
                  <span className="top-name"><Link href="/profile/Kries">Kries</Link></span>
                  <span className="top-value">59</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">05</span>
                  <span className="top-name"><Link href="/profile/MadoushiX">MadoushiX</Link></span>
                  <span className="top-value">59</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">06</span>
                  <span className="top-name"><Link href="/profile/ichi404">ichi404</Link></span>
                  <span className="top-value">58</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">07</span>
                  <span className="top-name"><Link href="/profile/Derlas">Derlas</Link></span>
                  <span className="top-value">58</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">08</span>
                  <span className="top-name"><Link href="/profile/slovak2202">slovak2202</Link></span>
                  <span className="top-value">58</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">09</span>
                  <span className="top-name"><Link href="/profile/brunox1">brunox1</Link></span>
                  <span className="top-value">58</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">10</span>
                  <span className="top-name"><Link href="/profile/RasenWHO">RasenWHO</Link></span>
                  <span className="top-value">58</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 10 Clanladder */}
          <div className="sidebar-box">
            <div className="sidebar-box-header">Top 10 Clanladder</div>
            <div className="sidebar-box-content">
              <div className="top-list">
                <div className="top-list-item">
                  <span className="top-rank top-rank-1">01</span>
                  <span className="top-name"><Link href="/clan/team-valor">Team Valor</Link></span>
                  <span className="top-value">251</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-2">02</span>
                  <span className="top-name"><Link href="/clan/team-mystic">Team Mystic</Link></span>
                  <span className="top-value">206</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-3">03</span>
                  <span className="top-name"><Link href="/clan/team-instinct">Team Instinct</Link></span>
                  <span className="top-value">188</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">04</span>
                  <span className="top-name"><Link href="/clan/pokemon-masters">Pokemon Masters</Link></span>
                  <span className="top-value">154</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">05</span>
                  <span className="top-name"><Link href="/clan/pallet-town">Pallet Town</Link></span>
                  <span className="top-value">151</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">06</span>
                  <span className="top-name"><Link href="/clan/indigo-league">Indigo League</Link></span>
                  <span className="top-value">126</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">07</span>
                  <span className="top-name"><Link href="/clan/thunderbolts">Thunderbolts</Link></span>
                  <span className="top-value">123</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">08</span>
                  <span className="top-name"><Link href="/clan/elite-four">Elite Four</Link></span>
                  <span className="top-value">121</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">09</span>
                  <span className="top-name"><Link href="/clan/dragon-tamers">Dragon Tamers</Link></span>
                  <span className="top-value">108</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">10</span>
                  <span className="top-name"><Link href="/clan/ghost-squad">Ghost Squad</Link></span>
                  <span className="top-value">97</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 10 Winstreak */}
          <div className="sidebar-box">
            <div className="sidebar-box-header">
              Top 10 Winstreak
              <span className="help-icon" title="Shows the highest win streaks starting from December 20, 2025. Each new Season resets the start date for the Top Win Streak counter.">?</span>
            </div>
            <div className="sidebar-box-content">
              <div className="top-list">
                <div className="top-list-item">
                  <span className="top-rank top-rank-1">1.</span>
                  <span className="top-name"><Link href="/profile/ace">ace</Link></span>
                  <span className="top-value">+56 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-2">2.</span>
                  <span className="top-name"><Link href="/profile/Konan">Konan</Link></span>
                  <span className="top-value">+53 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-3">3.</span>
                  <span className="top-name"><Link href="/profile/Kanabi">Kanabi</Link></span>
                  <span className="top-value">+23 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">4.</span>
                  <span className="top-name"><Link href="/profile/Sleke">Sleke</Link></span>
                  <span className="top-value">+17 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">5.</span>
                  <span className="top-name"><Link href="/profile/DonJuan">DonJuan</Link></span>
                  <span className="top-value">+15 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">6.</span>
                  <span className="top-name"><Link href="/profile/Johel_R05">Johel_R05</Link></span>
                  <span className="top-value">+15 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">7.</span>
                  <span className="top-name"><Link href="/profile/HashiramaSenju">HashiramaSenju</Link></span>
                  <span className="top-value">+13 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">8.</span>
                  <span className="top-name"><Link href="/profile/Erenn">Erenn</Link></span>
                  <span className="top-value">+12 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">9.</span>
                  <span className="top-name"><Link href="/profile/neptz">neptz</Link></span>
                  <span className="top-value">+11 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">10.</span>
                  <span className="top-name"><Link href="/profile/msdetox">msdetox</Link></span>
                  <span className="top-value">+11 streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 10 Most Wins */}
          <div className="sidebar-box">
            <div className="sidebar-box-header">Top 10 Most Wins</div>
            <div className="sidebar-box-content">
              <div className="top-list">
                <div className="top-list-item">
                  <span className="top-rank top-rank-1">1.</span>
                  <span className="top-name"><Link href="/profile/GoodySan">GoodySan</Link></span>
                  <span className="top-value">+7216 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-2">2.</span>
                  <span className="top-name"><Link href="/profile/juicewrld999">juicewrld999</Link></span>
                  <span className="top-value">+6575 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-3">3.</span>
                  <span className="top-name"><Link href="/profile/rogerindopneu">rogerindopneu</Link></span>
                  <span className="top-value">+6558 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">4.</span>
                  <span className="top-name"><Link href="/profile/One_jb">One_jb</Link></span>
                  <span className="top-value">+5745 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">5.</span>
                  <span className="top-name"><Link href="/profile/gravidadeTAUBATE">gravidadeTAUBATE</Link></span>
                  <span className="top-value">+4586 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">6.</span>
                  <span className="top-name"><Link href="/profile/julio0612">julio0612</Link></span>
                  <span className="top-value">+4188 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">7.</span>
                  <span className="top-name"><Link href="/profile/nigh1234">nigh1234</Link></span>
                  <span className="top-value">+4186 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">8.</span>
                  <span className="top-name"><Link href="/profile/leohyuga25">leohyuga25</Link></span>
                  <span className="top-value">+4140 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">9.</span>
                  <span className="top-name"><Link href="/profile/sirrap">sirrap</Link></span>
                  <span className="top-value">+4073 wins</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">10.</span>
                  <span className="top-name"><Link href="/profile/Rafa">Rafa</Link></span>
                  <span className="top-value">+3931 wins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 20 HighestStreaks */}
          <div className="sidebar-box">
            <div className="sidebar-box-header">Top 20 HighestStreaks</div>
            <div className="sidebar-box-content">
              <div className="top-list">
                <div className="top-list-item">
                  <span className="top-rank top-rank-1">1.</span>
                  <span className="top-name"><Link href="/profile/Buffy">Buffy</Link></span>
                  <span className="top-value">+80 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-2">2.</span>
                  <span className="top-name"><Link href="/profile/-hoshigama-">-hoshigama-</Link></span>
                  <span className="top-value">+76 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank top-rank-3">3.</span>
                  <span className="top-name"><Link href="/profile/Cloudprince">Cloudprince</Link></span>
                  <span className="top-value">+76 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">4.</span>
                  <span className="top-name"><Link href="/profile/-GodEneru">-GodEneru</Link></span>
                  <span className="top-value">+74 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">5.</span>
                  <span className="top-name"><Link href="/profile/AkatsKonan">AkatsKonan</Link></span>
                  <span className="top-value">+73 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">6.</span>
                  <span className="top-name"><Link href="/profile/HalfDead-">HalfDead-</Link></span>
                  <span className="top-value">+72 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">7.</span>
                  <span className="top-name"><Link href="/profile/-Shark">-Shark</Link></span>
                  <span className="top-value">+67 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">8.</span>
                  <span className="top-name"><Link href="/profile/Demon">Demon</Link></span>
                  <span className="top-value">+65 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">9.</span>
                  <span className="top-name"><Link href="/profile/Gercsak">Gercsak</Link></span>
                  <span className="top-value">+65 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">10.</span>
                  <span className="top-name"><Link href="/profile/Dan">Dan</Link></span>
                  <span className="top-value">+63 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">11.</span>
                  <span className="top-name"><Link href="/profile/mrChans">mrChans</Link></span>
                  <span className="top-value">+61 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">12.</span>
                  <span className="top-name"><Link href="/profile/Sakura">Sakura</Link></span>
                  <span className="top-value">+60 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">13.</span>
                  <span className="top-name"><Link href="/profile/Rafa">Rafa</Link></span>
                  <span className="top-value">+60 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">14.</span>
                  <span className="top-name"><Link href="/profile/Myotismon">Myotismon</Link></span>
                  <span className="top-value">+60 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">15.</span>
                  <span className="top-name"><Link href="/profile/videogame33">videogame33</Link></span>
                  <span className="top-value">+60 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">16.</span>
                  <span className="top-name"><Link href="/profile/Sasuke">Sasuke</Link></span>
                  <span className="top-value">+60 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">17.</span>
                  <span className="top-name"><Link href="/profile/Bolts">Bolts</Link></span>
                  <span className="top-value">+59 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">18.</span>
                  <span className="top-name"><Link href="/profile/Douglasschanu">Douglasschanu</Link></span>
                  <span className="top-value">+57 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">19.</span>
                  <span className="top-name"><Link href="/profile/ace">ace</Link></span>
                  <span className="top-value">+56 streak</span>
                </div>
                <div className="top-list-item">
                  <span className="top-rank">20.</span>
                  <span className="top-name"><Link href="/profile/Gojo">Gojo</Link></span>
                  <span className="top-value">+56 streak</span>
                </div>
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
      </div>
    </div>
  );
}
