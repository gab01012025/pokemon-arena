/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function RoadToChampion() {
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
          <h1 className="page-title">Road to Champion</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; <Link href="/ladders">Ladders</Link> &gt; <span className="current">Road to Champion</span>
          </div>

          <div className="section-content">
            <p>This section of the game manual provides an overview of the new Season format: Road to Champion. Here, you will find essential details, frequently asked questions, and helpful tips related to the seasonal ranking system. Road to Champion is a competitive mode where players climb the ladder by winning matches, earning xp, and reaching higher ranks over the course of a limited-time season. The goal is to rise through the ranks, improve your standing, and prove yourself as one of the top players of pokemon-arena.</p>
          </div>

          {/* Season System */}
          <div className="content-section">
            <div className="section-header">
              <span className="section-icon">⭐</span>
              <span className="section-title">Season System</span>
            </div>
            <div className="section-content">
              <p>With the long-awaited reset, the seasonal system has been completely reworked. The new format aims to give greater in-game value to seasons through exclusive rewards, new prestigious ranks, and an overall more competitive and organized structure. Inspired by the anime, a new rank hierarchy has been introduced featuring the Elite Four alongside Pokemon Master. This system is designed to enhance the competitive experience and provide more recognition to top-performing players.</p>
              
              <p>Below is a list of the main updates and changes:</p>
              
              <ol>
                <li>Season now have an official name and visual identity (<strong>Road to Champion</strong>).</li>
                <li>A <strong>countdown timer</strong> on the homepage shows the current season&apos;s duration.</li>
                <li>Players who finish in the <strong>Top 20</strong> will receive a seasonal achievement badge displayed on their profile.</li>
                <li>Five new prestigious ranks have been added: the <strong>Champion</strong>, <strong>Elite 1</strong>, <strong>Elite 2</strong>, <strong>Elite 3</strong> and <strong>Elite 4</strong> — each with their own unique rank icon, just like <strong>Pokemon Master</strong>.</li>
                <li>The top 20 players will receive rewards based on their final placement — the higher the rank, the greater the prizes.</li>
                <li>The Top 10 players will be immortalized in the <strong>Hall of Fame</strong> and awarded <strong>Fame Points</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Prizes */}
          <div className="content-section">
            <div className="section-header">
              <span className="section-icon">⭐</span>
              <span className="section-title">Prizes</span>
            </div>
            <div className="section-content">
              <ul>
                <li><strong>Top 1</strong> — Pokemon Master Title + First Skin Character + Season Border + Unique Border + 3 Existing Borders + 5 New Characters + Achievements on Profile + Hall of Fame (40 fame points ⭐)</li>
                <li><strong>Top 2</strong> — Champion Title + First Skin Character + Season Border + 3 Existing Borders + 4 New Characters + Achievements on Profile + Hall of Fame (30 fame points ⭐)</li>
                <li><strong>Top 3</strong> — Elite 1 Title + First Skin Character + Season Border + 2 Existing Borders + 3 New Characters + Achievements on Profile + Hall of Fame (25 fame points ⭐)</li>
                <li><strong>Top 4</strong> — Elite 2 Title + First Skin Character + Season Border + 2 Existing Border + 2 New Character + Achievements on Profile + Hall of Fame (20 fame points ⭐)</li>
                <li><strong>Top 5</strong> — Elite 3 Title + First Skin Character + Season Border + 2 Existing Border + 1 New Character + Achievements on Profile + Hall of Fame (15 fame points ⭐)</li>
                <li><strong>Top 6</strong> — Elite 4 Title + First Skin Character + Season Border + 1 Existing Border + 1 New Character + Achievements on Profile + Hall of Fame (10 fame points ⭐)</li>
                <li><strong>Top 10 ... Top 7</strong> — First Skin Character + Season Border + 1 New Characters + Achievements on Profile + Hall of Fame (5 fame points ⭐)</li>
                <li><strong>Top Elite of Season</strong> — Season Border</li>
              </ul>
            </div>
          </div>

          {/* FAQ */}
          <div className="content-section">
            <div className="section-header">
              <span className="section-icon">⭐</span>
              <span className="section-title">Answering possible doubts</span>
            </div>
            <div className="section-content">
              <p><strong>Q: Why does the Season now have an official name?</strong></p>
              <p>A: Giving the Season an official name helps create a stronger identity and theme — much like how leagues or esports events name their seasons. This makes seasons feel more meaningful and memorable, especially when combined with exclusive rewards.</p>
              
              <p><strong>Q: What is the countdown timer on the homepage?</strong></p>
              <p>A: The countdown timer shows how much time remains in the current season. This helps players plan their push for higher ranks before the season ends.</p>
              
              <p><strong>Q: What are the new Elite ranks?</strong></p>
              <p>A: The five new ranks (Champion, Elite 1, Elite 2, Elite 3, Elite 4) are awarded to the Top 2-6 players at the end of each season. The #1 player receives the Pokemon Master title.</p>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
