/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function ForgotPasswordPage() {
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
          <h1 className="page-title">Password Recovery</h1>
            
            <div className="content-section">
              <div className="section-title">Recover Your Account</div>
              <div className="section-content">
                <p>Enter your email address below to receive password reset instructions.</p>
                
                <form className="forgot-password-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">Send Reset Link</button>
                  </div>
                </form>
                
                <div className="form-info">
                  <p>Remember your password? <Link href="/">Login here</Link></p>
                  <p>Don&apos;t have an account? <Link href="/register">Register now</Link></p>
                </div>
              </div>
            </div>
            
            <div className="content-section">
              <div className="section-title">Troubleshooting</div>
              <div className="section-content">
                <ul>
                  <li>Check your spam/junk folder if you don&apos;t receive the email</li>
                  <li>Make sure you&apos;re using the email address associated with your account</li>
                  <li>If you still have issues, contact support on our forums</li>
                </ul>
              </div>
            </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
