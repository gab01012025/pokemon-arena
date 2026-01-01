import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function Ladders() {
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
          <h1 className="page-title">Ladders</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; <span className="current">Ladders</span>
          </div>

          <div className="section-content">
            <p>The Pokemon Arena ladders is a way to measure the players&apos; individual or a country&apos;s skill in the Pokemon Arena game. They&apos;re a rating system which gives you and all the other players around the opportunity to compete with each other. This feature is the most important one in the Pokemon Arena game.</p>
          </div>

          {/* Road to Champion */}
          <div className="ladder-section">
            <div className="ladder-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Road to Champion</span>
              </div>
              <p className="ladder-desc">This page covers everything Road to Champion. It contains a mini FAQ and more information about the new Season system and its improvements.</p>
              <Link href="/road-to-champion" className="ladder-link">View Road to Champion</Link>
            </div>
            <div className="ladder-image">
              <img src="https://i.imgur.com/road-champion.png" alt="Road to Champion" />
            </div>
          </div>

          {/* Hall of Fame */}
          <div className="ladder-section">
            <div className="ladder-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Hall of Fame</span>
              </div>
              <p className="ladder-desc">This page will immortalize the top 10 players from Road to Champion Season. You&apos;ll be able to check out the players and their top 10 rankings for each future season.</p>
              <Link href="/hall-of-fame" className="ladder-link">View Hall of Fame</Link>
            </div>
            <div className="ladder-image">
              <img src="https://i.imgur.com/hall-fame.png" alt="Hall of Fame" />
            </div>
          </div>

          {/* Trainer Ladder */}
          <div className="ladder-section">
            <div className="ladder-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Trainer ladder</span>
              </div>
              <p className="ladder-desc">The most important ladder of Pokemon Arena. It&apos;s an international ladder which everyone automatically joins when he/she starts playing a ladder game. It shows a player&apos;s individual skill.</p>
              <Link href="/trainer-ladder" className="ladder-link">View Trainer Ladder</Link>
            </div>
            <div className="ladder-image">
              <img src="https://i.imgur.com/trainer-ladder.png" alt="Trainer Ladder" />
            </div>
          </div>

          {/* Clan Ladder */}
          <div className="ladder-section">
            <div className="ladder-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Clan Ladder</span>
              </div>
              <p className="ladder-desc">Page of clan ladder of Pokemon Arena. It&apos;s an international clan ladder which clan automatically joins when they members starts playing a ladder game.</p>
              <Link href="/clans" className="ladder-link">View Clan Ladder</Link>
            </div>
            <div className="ladder-image">
              <img src="https://i.imgur.com/clan-ladder.png" alt="Clan Ladder" />
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
