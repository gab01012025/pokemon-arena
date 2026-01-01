/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

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
          <h1 className="page-title">Register</h1>

          {/* Register Form */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Create Your Account</h2>
            </div>
            <div className="content-box-body">
              <form className="register-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" name="username" placeholder="Choose a username" required />
                  <p className="form-hint">3-20 characters, letters and numbers only</p>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="Your email address" required />
                  <p className="form-hint">We&apos;ll send a confirmation email</p>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" name="password" placeholder="Choose a password" required />
                  <p className="form-hint">Minimum 6 characters</p>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm your password" required />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" required />
                    I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">Create Account</button>
                </div>

                <div className="form-footer">
                  <p>Already have an account? <Link href="/">Login here</Link></p>
                </div>
              </form>
            </div>
          </div>

          {/* Info Boxes */}
          <div className="info-grid">
            <div className="info-box">
              <div className="info-box-icon">⚔️</div>
              <h3>Battle System</h3>
              <p>Choose 3 characters and battle against other players in strategic turn-based combat.</p>
            </div>
            <div className="info-box">
              <div className="info-box-icon">🏆</div>
              <h3>Ranking System</h3>
              <p>Climb the ladder from Academy Student to Kage and become a legend!</p>
            </div>
            <div className="info-box">
              <div className="info-box-icon">👥</div>
              <h3>Join a Clan</h3>
              <p>Team up with other players and compete in clan battles and tournaments.</p>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
