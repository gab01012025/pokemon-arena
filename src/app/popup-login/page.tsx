'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Image from 'next/image';

function PopupLoginInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/play';
  const { login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(username, password);
      if (result.success) {
        // Notify main page to refresh auth state
        try {
          const bc = new BroadcastChannel('pokearena-auth');
          bc.postMessage({ type: 'login' });
          bc.close();
        } catch { /* BroadcastChannel not supported */ }
        // Also try opener
        if (window.opener && !window.opener.closed) {
          try { window.opener.location.reload(); } catch { /* cross-origin */ }
        }
        window.location.href = redirect;
      } else {
        setError(result.message);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pl-bg">
      {/* Pokemon silhouettes */}
      <div className="pl-deco pl-deco-1">
        <Image src="/pokemon-anime/6.png" alt="" width={200} height={200} unoptimized />
      </div>
      <div className="pl-deco pl-deco-2">
        <Image src="/pokemon-anime/150.png" alt="" width={220} height={220} unoptimized />
      </div>
      <div className="pl-deco pl-deco-3">
        <Image src="/pokemon-anime/25.png" alt="" width={100} height={100} unoptimized />
      </div>

      {/* Pokeball stripe across the middle */}
      <div className="pl-stripe" />
      <div className="pl-stripe-btn" />

      <div className="pl-card">
        {/* Pokemon logo area */}
        <div className="pl-logo-area">
          <div className="pl-pokeball-icon">
            <div className="pl-pb-line" />
            <div className="pl-pb-center"><div className="pl-pb-dot" /></div>
          </div>
          <div className="pl-logo-text">
            <span className="pl-logo-poke">POKE</span>
            <span className="pl-logo-arena">ARENA</span>
          </div>
          <div className="pl-tagline">Battle. Evolve. Conquer.</div>
        </div>

        {error && <div className="pl-error">{error}</div>}

        <form onSubmit={handleSubmit} className="pl-form">
          <div className="pl-field">
            <label className="pl-label">TRAINER ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              required
              autoComplete="username"
              placeholder="Username or Email"
              className="pl-input"
            />
          </div>
          <div className="pl-field">
            <label className="pl-label">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              autoComplete="current-password"
              placeholder="Enter password"
              className="pl-input"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="pl-btn">
            {isSubmitting ? (
              <>
                <span className="pl-btn-spinner" />
                CONNECTING...
              </>
            ) : (
              <>
                <span className="pl-btn-arrow">&#9654;</span>
                START BATTLE
              </>
            )}
          </button>
        </form>

        <div className="pl-bottom">
          <span>New trainer?</span>
          <a href="/register" target="_blank" rel="noopener noreferrer">CREATE ACCOUNT</a>
        </div>
      </div>

      <style jsx>{`
        .pl-bg {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a0000 0%, #0a0a20 30%, #000a1a 60%, #1a0005 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Rajdhani', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Red/blue ambient light */
        .pl-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -30%;
          width: 80%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(220,30,30,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .pl-bg::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -30%;
          width: 80%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(30,80,220,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Pokeball stripe across screen */
        .pl-stripe {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 6px;
          background: #222;
          transform: translateY(-50%);
          z-index: 0;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .pl-stripe-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 5px solid #333;
          background: radial-gradient(circle, #fff 40%, #ddd 100%);
          z-index: 0;
          box-shadow: 0 0 20px rgba(255,255,255,0.1);
        }

        /* Pokemon decorations */
        .pl-deco {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }
        .pl-deco-1 {
          left: -30px;
          bottom: -10px;
          opacity: 0.06;
          filter: drop-shadow(0 0 40px rgba(255,100,30,0.3));
          animation: bob1 8s ease-in-out infinite;
        }
        .pl-deco-2 {
          right: -40px;
          top: -20px;
          opacity: 0.06;
          filter: drop-shadow(0 0 40px rgba(120,60,200,0.3));
          animation: bob2 7s ease-in-out infinite;
        }
        .pl-deco-3 {
          left: 50%;
          bottom: 10px;
          transform: translateX(-50%);
          opacity: 0.05;
          filter: drop-shadow(0 0 30px rgba(255,220,50,0.3));
          animation: bob1 6s ease-in-out infinite;
        }
        @keyframes bob1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bob2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Card */
        .pl-card {
          width: 380px;
          background: rgba(8, 10, 25, 0.95);
          border: 2px solid rgba(255,215,0,0.12);
          border-radius: 16px;
          padding: 0;
          position: relative;
          z-index: 2;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 20px 60px rgba(0,0,0,0.7),
            0 0 80px rgba(255,50,50,0.04),
            0 0 80px rgba(50,50,255,0.04);
          overflow: hidden;
        }

        /* Logo area — red gradient header */
        .pl-logo-area {
          background: linear-gradient(180deg, #8b0000 0%, #5a0000 100%);
          padding: 20px 24px 16px;
          text-align: center;
          border-bottom: 3px solid #FFD700;
          position: relative;
        }
        .pl-logo-area::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #FFD700, transparent);
        }

        .pl-pokeball-icon {
          width: 36px;
          height: 36px;
          margin: 0 auto 8px;
          border-radius: 50%;
          background: linear-gradient(180deg, #fff 0%, #fff 46%, #333 46%, #333 54%, #cc0000 54%, #cc0000 100%);
          border: 2px solid rgba(255,255,255,0.3);
          position: relative;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        }
        .pl-pb-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 3px;
          background: #333;
          transform: translateY(-50%);
        }
        .pl-pb-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #333;
          z-index: 1;
        }
        .pl-pb-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ddd;
        }

        .pl-logo-text {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
        }
        .pl-logo-poke {
          font-family: 'Press Start 2P', monospace;
          font-size: 20px;
          color: #FFD700;
          text-shadow: 0 2px 0 #b8860b, 0 0 20px rgba(255,215,0,0.5);
          letter-spacing: 3px;
        }
        .pl-logo-arena {
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          color: #fff;
          text-shadow: 0 1px 0 #666, 0 0 10px rgba(255,255,255,0.3);
          letter-spacing: 4px;
        }
        .pl-tagline {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 4px;
          font-weight: 600;
        }

        /* Form area */
        .pl-form {
          padding: 20px 24px 16px;
        }
        .pl-field {
          margin-bottom: 12px;
        }
        .pl-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,215,0,0.6);
          letter-spacing: 2px;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .pl-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .pl-input:focus {
          border-color: rgba(255,215,0,0.4);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 2px rgba(255,215,0,0.08);
        }
        .pl-input::placeholder {
          color: rgba(255,255,255,0.2);
          font-weight: 500;
        }

        .pl-error {
          margin: 0 24px;
          padding: 8px 12px;
          background: rgba(255,50,50,0.1);
          border: 1px solid rgba(255,50,50,0.2);
          border-radius: 6px;
          color: #ff6b6b;
          font-size: 12px;
          text-align: center;
          margin-top: -4px;
        }

        /* Button */
        .pl-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(180deg, #cc0000 0%, #990000 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          font-family: 'Rajdhani', sans-serif;
          letter-spacing: 4px;
          text-transform: uppercase;
          cursor: pointer;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 0 #660000, 0 6px 20px rgba(150,0,0,0.3);
          margin-top: 4px;
          position: relative;
        }
        .pl-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #dd1111 0%, #aa0000 100%);
          transform: translateY(-1px);
          box-shadow: 0 5px 0 #660000, 0 8px 24px rgba(150,0,0,0.4);
        }
        .pl-btn:active:not(:disabled) {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #660000, 0 4px 12px rgba(150,0,0,0.3);
        }
        .pl-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .pl-btn-arrow {
          font-size: 12px;
        }
        .pl-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Bottom */
        .pl-bottom {
          padding: 12px 24px 16px;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .pl-bottom a {
          color: #FFD700;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 1px;
          font-size: 11px;
        }
        .pl-bottom a:hover {
          color: #fff;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default function PopupLoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0a0a1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFD700',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '12px',
      }}>
        Loading...
      </div>
    }>
      <PopupLoginInner />
    </Suspense>
  );
}
