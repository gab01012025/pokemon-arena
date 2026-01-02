import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function LoginPage() {
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.imgur.com/GNheiTq.png" alt="Pokemon Arena Banner" className="header-logo" />
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">Login</h1>
          <p className="page-subtitle">Welcome back, Trainer!</p>
          
          <div className="content-box">
            <div className="content-box-header">
              <h2>Sign In to Your Account</h2>
            </div>
            <div className="content-box-body auth-container">
              <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
