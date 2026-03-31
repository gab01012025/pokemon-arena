'use client';

import Link from 'next/link';
import { type UseMultiplayerState } from '@/hooks/useMultiplayer';

interface ConnectingScreenProps {
  state: UseMultiplayerState;
  onConnect: () => void;
}

export default function ConnectingScreen({ state, onConnect }: ConnectingScreenProps) {
  if (state.isConnecting) {
    return (
      <div className="connecting-screen">
        <div className="pokeball-spinner" />
        <h2>Connecting to Server...</h2>
        <p>Establishing connection and authenticating</p>
      </div>
    );
  }

  if (state.connectionError && !state.isConnected) {
    const isAuthError = state.connectionError.toLowerCase().includes('log in') ||
                        state.connectionError.toLowerCase().includes('auth');
    return (
      <div className="connecting-screen">
        <div className="connection-error">
          <p>{isAuthError ? '🔒 ' : '⚠️ '}Connection Failed: {state.connectionError}</p>
          {isAuthError ? (
            <Link href="/login" className="find-match-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1rem' }}>
              Go to Login
            </Link>
          ) : (
            <>
              <button onClick={onConnect} style={{ marginTop: '1rem' }}>Retry Connection</button>
              <p style={{ margin: '1rem 0 0.5rem', color: '#aaa', fontSize: '0.85rem' }}>Server may be offline. You can still play vs AI:</p>
              <Link href="/battle/ai" className="find-match-btn" style={{ display: 'inline-block', textDecoration: 'none', background: '#555', marginTop: '0.5rem' }}>
                Play vs AI Instead
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="connecting-screen">
      <h2>Pokemon Arena Online PvP</h2>
      <p>Connect to the game server to battle other trainers in real-time!</p>
      <button className="find-match-btn" onClick={onConnect}>
        Connect to Server
      </button>
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Or play against AI:</p>
        <Link href="/battle/ai" className="find-match-btn" style={{ display: 'inline-block', textDecoration: 'none', background: '#555' }}>
          Battle vs AI
        </Link>
      </div>
    </div>
  );
}
