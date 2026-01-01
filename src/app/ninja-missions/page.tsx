/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function NinjaMissions() {
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
          <h1 className="page-title">Ninja Missions</h1>
          <div className="breadcrumb">
            <Link href="/">Naruto Arena</Link> &gt; <span className="current">Ninja Missions</span>
          </div>

          <div className="section-content">
            <p>Ninja Missions are tasks that can be done to unlock more characters.</p>
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
              <p className="mission-desc">With the Tales Mission, you are able to unlock ninjas that participated in past events.</p>
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
              <p className="mission-desc">The D and C Rank Missions are assigned to new and unexperienced ninja. With these missions you are able to unlock notably the Sound ninja.</p>
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
              <p className="mission-desc">The B Rank Missions are only assigned to to experienced ninja. With these missions you are able to unlock villains and subordinates of the most dangerous ninjas.</p>
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
              <p className="mission-desc">The A Rank Missions are only assigned to to highly experienced ninja. With these missions you are able to unlock teamleaders.</p>
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
              <p className="mission-desc">The S Rank Missions are only assigned to the best of the best. With these missions you are able to unlock legendary ninja and hokages.</p>
              <Link href="#" className="mission-link">Check out the S Rank Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="https://i.imgur.com/srank1.png" alt="S Rank" />
              <img src="https://i.imgur.com/srank2.png" alt="S Rank" />
            </div>
          </div>

          {/* Shippuuden Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Shippuuden Missions</span>
              </div>
              <p className="mission-desc">The Shippuuden Missions are the newest missions in town! With these missions you are able to unlock many new characters and upgrades to existing characters.</p>
              <Link href="#" className="mission-link">Check out the Shippuuden Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="https://i.imgur.com/shippuuden1.png" alt="Shippuuden" />
              <img src="https://i.imgur.com/shippuuden2.png" alt="Shippuuden" />
            </div>
          </div>

          {/* Five Kage Summit Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Five Kage Summit Missions</span>
              </div>
              <p className="mission-desc">The five kages are reunited to discuss how to deal with Akatsuki. With these missions you are able to unlock ninjas that participated in Five Kage Summit Arc.</p>
              <Link href="#" className="mission-link">Check out the Five Kage Summit Missions Missions!</Link>
            </div>
            <div className="mission-images">
              <img src="https://i.imgur.com/fivekage1.png" alt="Five Kage" />
              <img src="https://i.imgur.com/fivekage2.png" alt="Five Kage" />
            </div>
          </div>

          {/* Fourth Shinobi World War Pt. 1 Missions */}
          <div className="mission-card">
            <div className="mission-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Fourth Shinobi World War Pt. 1 Missions</span>
              </div>
              <p className="mission-desc">Tobi declared war against the five Kages and the leader of the Land of Iron. With these missions you are able to unlock ninjas that participated in the beginning of Fourth Shinobi World War.</p>
              <Link href="#" className="mission-link">Check out the Fourth Shinobi World War Pt. 1 Missions Missions!</Link>
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
