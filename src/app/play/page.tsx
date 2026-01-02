/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function PlayPage() {
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
          <h1 className="page-title">Play Pokemon Arena</h1>
            
            {/* Team Selection */}
            <div className="content-section">
              <div className="section-title">Select Your Team</div>
              <div className="section-content">
                <p className="play-intro">Choose 3 characters to form your battle team. Each character has unique skills and abilities.</p>
                
                <div className="team-selection">
                  <div className="team-slots">
                    <div className="team-slot empty">
                      <div className="slot-number">1</div>
                      <div className="slot-label">Empty Slot</div>
                    </div>
                    <div className="team-slot empty">
                      <div className="slot-number">2</div>
                      <div className="slot-label">Empty Slot</div>
                    </div>
                    <div className="team-slot empty">
                      <div className="slot-number">3</div>
                      <div className="slot-label">Empty Slot</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Character Categories */}
            <div className="content-section">
              <div className="section-title">Character Categories</div>
              <div className="section-content">
                <div className="character-categories">
                  <div className="category-group">
                    <h3 className="category-title">Kanto Region</h3>
                    <div className="character-grid">
                      <Link href="/chars/pikachu" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Pikachu" />
                        <span>Pikachu</span>
                      </Link>
                      <Link href="/chars/charizard" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Charizard" />
                        <span>Charizard</span>
                      </Link>
                      <Link href="/chars/bulbasaur" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Bulbasaur" />
                        <span>Bulbasaur</span>
                      </Link>
                      <Link href="/chars/mewtwo" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Mewtwo" />
                        <span>Mewtwo</span>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="category-group">
                    <h3 className="category-title">Team Rocket</h3>
                    <div className="character-grid">
                      <Link href="/chars/giovanni" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Giovanni" />
                        <span>Giovanni</span>
                      </Link>
                      <Link href="/chars/meowth" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Meowth" />
                        <span>Meowth</span>
                      </Link>
                      <Link href="/chars/arbok" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Arbok" />
                        <span>Arbok</span>
                      </Link>
                      <Link href="/chars/weezing" className="character-thumb">
                        <img src="/images/pokemon-artwork.jpg" alt="Weezing" />
                        <span>Weezing</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Modes */}
            <div className="content-section">
              <div className="section-title">Game Modes</div>
              <div className="section-content">
                <div className="game-modes">
                  <div className="game-mode">
                    <h3>Quick Game</h3>
                    <p>Play a casual match against another player. No rank changes.</p>
                    <button className="btn-play" disabled>Select Team First</button>
                  </div>
                  <div className="game-mode">
                    <h3>Ladder Game</h3>
                    <p>Compete for ranking! Win to increase your rank and unlock rewards.</p>
                    <button className="btn-play" disabled>Select Team First</button>
                  </div>
                  <div className="game-mode">
                    <h3>Private Game</h3>
                    <p>Challenge a specific player to a match.</p>
                    <button className="btn-play" disabled>Select Team First</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="content-section">
              <div className="section-title">How to Play</div>
              <div className="section-content">
                <ol className="play-instructions">
                  <li>Select 3 characters to form your team</li>
                  <li>Choose a game mode</li>
                  <li>Wait for an opponent to be matched</li>
                  <li>Use your characters&apos; skills strategically to defeat the enemy team</li>
                  <li>Win by reducing all enemy characters&apos; health to zero</li>
                </ol>
                <p>New to the game? Check out the <Link href="/the-basics">Game Basics</Link> and <Link href="/game-manual">Game Manual</Link> for more information.</p>
              </div>
            </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
