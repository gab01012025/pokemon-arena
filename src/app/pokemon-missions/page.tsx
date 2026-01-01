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
            <img src="https://i.imgur.com/GNheiTq.png" alt="Pokemon Arena Banner" className="header-logo" />
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
              <img src="https://i.imgur.com/special1.png" alt="Special" />
              <img src="https://i.imgur.com/special2.png" alt="Special" />
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
              <img src="https://i.imgur.com/tales1.png" alt="Tales" />
              <img src="https://i.imgur.com/tales2.png" alt="Tales" />
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
              <img src="https://i.imgur.com/dcrank1.png" alt="D/C Rank" />
              <img src="https://i.imgur.com/dcrank2.png" alt="D/C Rank" />
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
              <img src="https://i.imgur.com/brank1.png" alt="B Rank" />
              <img src="https://i.imgur.com/brank2.png" alt="B Rank" />
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
              <img src="https://i.imgur.com/arank1.png" alt="A Rank" />
              <img src="https://i.imgur.com/arank2.png" alt="A Rank" />
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
              <img src="https://i.imgur.com/srank1.png" alt="S Rank" />
              <img src="https://i.imgur.com/srank2.png" alt="S Rank" />
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
              <img src="https://i.imgur.com/shippuuden1.png" alt="Evolution" />
              <img src="https://i.imgur.com/shippuuden2.png" alt="Evolution" />
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
              <img src="https://i.imgur.com/fivekage1.png" alt="Elite Four" />
              <img src="https://i.imgur.com/fivekage2.png" alt="Elite Four" />
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
              <img src="https://i.imgur.com/war1.png" alt="War" />
              <img src="https://i.imgur.com/war2.png" alt="War" />
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
