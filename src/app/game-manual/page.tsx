/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function GameManual() {
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
          <h1 className="page-title">Game Manual</h1>
          <div className="breadcrumb">
            <Link href="/">Naruto Arena</Link> &gt; <span className="current">Game Manual</span>
          </div>

          <div className="section-content">
            <p>For new players entering the Naruto-Arena for the first time, our game manual provides you with all the information you need to get started right away. It contains info about the game itself, and everything related to it.</p>
          </div>

          {/* The Basics */}
          <div className="ladder-section">
            <div className="ladder-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">The basics</span>
              </div>
              <p className="ladder-desc">Before you start playing it&apos;s important that you know the basics of the game. This page gives you an introduction to the gameplay.</p>
              <Link href="/the-basics" className="ladder-link">Read more about The basics</Link>
            </div>
            <div className="ladder-image">
              <img src="https://i.imgur.com/basics.png" alt="The Basics" />
            </div>
          </div>

          {/* Characters and Skills */}
          <div className="ladder-section">
            <div className="ladder-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">Characters and Skills</span>
              </div>
              <p className="ladder-desc">Naruto Arena focuses on characters and skills. This page gives you an overview of all characters available in the Naruto-Arena game.</p>
              <Link href="/characters" className="ladder-link">Read more about Characters and Skills</Link>
            </div>
            <div className="ladder-image">
              <img src="https://i.imgur.com/characters.png" alt="Characters" />
            </div>
          </div>

          {/* The ninja ladder */}
          <div className="ladder-section">
            <div className="ladder-text">
              <div className="section-header">
                <span className="section-icon">⭐</span>
                <span className="section-title">The ninja ladder</span>
              </div>
              <p className="ladder-desc">The ladder is a solution for everyone who wants to compete with players around the world. This section contains all the information you need to know about the ninjaladder.</p>
              <Link href="/ladders" className="ladder-link">Read more about The ninja ladder</Link>
            </div>
            <div className="ladder-image">
              <img src="https://i.imgur.com/ladder.png" alt="Ninja Ladder" />
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
