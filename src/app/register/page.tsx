/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Register() {
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
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">Register</h1>
          <p className="page-subtitle">Begin Your Pokemon Journey!</p>

          {/* Register Form */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Create Your Trainer Account</h2>
            </div>
            <div className="content-box-body auth-container">
              <RegisterForm />
            </div>
          </div>

          {/* Info Boxes */}
          <div className="info-grid">
            <div className="info-box">
              <div className="info-box-icon">⚔️</div>
              <h3>Battle System</h3>
              <p>Choose 3 Pokemon and battle against other trainers in strategic turn-based combat.</p>
            </div>
            <div className="info-box">
              <div className="info-box-icon">🏆</div>
              <h3>Ranking System</h3>
              <p>Climb the ladder from Beginner to Champion and become a legend!</p>
            </div>
            <div className="info-box">
              <div className="info-box-icon">👥</div>
              <h3>Join a Team</h3>
              <p>Team up with other trainers and compete in team battles and tournaments.</p>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
