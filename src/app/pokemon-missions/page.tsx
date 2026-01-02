/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function PokemonMissions() {
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
          <h1 className="page-title">Pokemon Missions</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; <span className="current">Pokemon Missions</span>
          </div>

          <div className="section-content">
            <p>Pokemon Missions are tasks that can be done to unlock more characters.</p>
            <p><strong>Step-by-step guide to do a mission:</strong></p>
            <ol>
              <li>Be the required rank or higher.</li>
              <li>Have any required missions completed.</li>
              <li>Press the Start Playing button.</li>
              <li>Select any characters involved in any missions you wish to work on.</li>
              <li>Play the game normally.</li>
              <li>Finally understand that missions are not a separate game but work in the background passively.</li>
            </ol>
          </div>

          <div className="search-box">
            <strong>Search Character Section:</strong>
            <input type="text" placeholder="Search character..." />
          </div>

          {/* Special Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Special Missions</span>
              </div>
              <p className="mission-desc">The Special Missions are unique missions that do not follow the main progression. With these missions you are able to take part in exclusive challenges and special events.</p>
              <Link href="#" className="mission-link">Check out the Special Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/pokemon-group-1.jpg" alt="Special" />
              <img src="/images/pokemon-group-2.jpg" alt="Special" />
            </div>
          </div>

          {/* Tales Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Tales Missions</span>
              </div>
              <p className="mission-desc">With the Tales Mission, you are able to unlock pokemon that participated in past events.</p>
              <Link href="#" className="mission-link">Check out the Tales Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/pokemon-saga.jpg" alt="Tales" />
              <img src="/images/pokemon-anime.jpg" alt="Tales" />
            </div>
          </div>

          {/* D and C Rank Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">D and C Rank Missions</span>
              </div>
              <p className="mission-desc">The D and C Rank Missions are assigned to new and unexperienced trainers. With these missions you are able to unlock notably the Team Rocket members.</p>
              <Link href="#" className="mission-link">Check out the D and C Rank Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/bulbasaur.jpg" alt="D/C Rank" />
              <img src="/images/pokemon-pikachu.jpg" alt="D/C Rank" />
            </div>
          </div>

          {/* B Rank Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">B Rank Missions</span>
              </div>
              <p className="mission-desc">The B Rank Missions are only assigned to to experienced trainers. With these missions you are able to unlock villains and subordinates of the most dangerous pokemon.</p>
              <Link href="#" className="mission-link">Check out the B Rank Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/pokemon-artwork.jpg" alt="B Rank" />
              <img src="/images/pokemon-battle.webp" alt="B Rank" />
            </div>
          </div>

          {/* A Rank Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">A Rank Missions</span>
              </div>
              <p className="mission-desc">The A Rank Missions are only assigned to to highly experienced trainers. With these missions you are able to unlock teamleaders.</p>
              <Link href="#" className="mission-link">Check out the A Rank Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/all-pokemon-1.webp" alt="A Rank" />
              <img src="/images/all-pokemon-2.webp" alt="A Rank" />
            </div>
          </div>

          {/* S Rank Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">S Rank Missions</span>
              </div>
              <p className="mission-desc">The S Rank Missions are only assigned to the best of the best. With these missions you are able to unlock legendary pokemon and champions.</p>
              <Link href="#" className="mission-link">Check out the S Rank Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/pokemon-adventure.jpg" alt="S Rank" />
              <img src="/images/pokemon-poster.jpg" alt="S Rank" />
            </div>
          </div>

          {/* Evolution Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Evolution Missions</span>
              </div>
              <p className="mission-desc">The Evolution Missions are the newest missions in town! With these missions you are able to unlock many new characters and upgrades to existing characters.</p>
              <Link href="#" className="mission-link">Check out the Evolution Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/pokemon-characters.webp" alt="Evolution" />
              <img src="/images/ash-ketchum.webp" alt="Evolution" />
            </div>
          </div>

          {/* Elite Four Summit Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Elite Four Summit Missions</span>
              </div>
              <p className="mission-desc">The elite four are reunited to discuss how to deal with Team Rocket. With these missions you are able to unlock pokemon that participated in Elite Four Summit Arc.</p>
              <Link href="#" className="mission-link">Check out the Elite Four Summit Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/pokemon-anime.jpg" alt="Elite Four" />
              <img src="/images/pokemon-saga.jpg" alt="Elite Four" />
            </div>
          </div>

          {/* Pokemon League Tournament Pt. 1 Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Pokemon League Tournament Pt. 1 Missions</span>
              </div>
              <p className="mission-desc">Giovanni declared war against the Elite Four and the leader of the Pokemon League. With these missions you are able to unlock pokemon that participated in the beginning of Pokemon League Tournament.</p>
              <Link href="#" className="mission-link">Check out the Pokemon League Tournament Pt. 1 Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="/images/pokemon-battle.webp" alt="War" />
              <img src="/images/pokemon-adventure.jpg" alt="War" />
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
