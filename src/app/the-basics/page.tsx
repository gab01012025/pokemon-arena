/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function TheBasics() {
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
          <h1 className="page-title">The basics</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; <Link href="/game-manual">Game manual</Link> &gt; <span className="current">The basics</span>
          </div>

          <div className="section-content">
            <p>This section of the game manual is a basic overview of the user interface, game play, and standard terminology within the game. Pokemon Arena is a turn based strategy game where your team of three pokemon is pitted against another player&apos;s team of three pokemon with the goal of reducing your opposition to 0 health points and winning the match.</p>
          </div>

          {/* Selection Screen */}
          <div className="content-section">
            <div className="section-header">
              <span className="section-icon">⭐</span>
              <span className="section-title">Selection Screen</span>
            </div>
            <div className="section-content">
              <img src="/images/all-pokemon-2.webp" alt="Selection Screen" style={{ width: '100%', maxWidth: 600, marginBottom: 15 }} />
              
              <p>The first thing you will see when beginning a game of Pokemon Arena is the screen below (without the big blue letters). This is the Character Selection screen and what ever is and does is explained below.</p>
              
              <ul>
                <li><strong>A:</strong> This section displays your player information. It shows your avatar, username, trainer rank, ladder rank, win-loss record, and win-loss streak, all in that order.</li>
                <li><strong>B:</strong> This section has three boxes for you to drag and drop the pokemon you wish to use in your team. Only when you have selected three pokemon may you begin a match.</li>
                <li><strong>C:</strong> This is the character section. Each page has 21 characters on it and you use the white arrows to scroll through the pages. Some characters may appear grayed-out and you will not be able to drag these characters into your team. These characters are mission characters and you must complete their mission before you may use them.</li>
                <li><strong>D:</strong> This is where individual character information is displayed. By clicking on a character&apos;s icon in section &apos;C&apos; this section will appear. The primary function of this section is so that you may study that character&apos;s skills.</li>
                <li><strong>E:</strong> By clicking on a skill icon of a character in section &apos;D&apos; this section will display the information about that skill. The upper left cut text is the name of the skill. The upper right is the energy cost of the skill. The center is the description.</li>
                <li><strong>F:</strong> These are the game mode buttons. Start Ladder Game is ranked play. Start Quick Game is unranked. Start Private Game lets you play against friends.</li>
              </ul>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
