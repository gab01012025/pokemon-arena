'use client';

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
          <p>{isAuthError ? '🔒 ' : ''}Connection Failed: {state.connectionError}</p>
          {isAuthError ? (
            <a href="/login" className="find-match-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1rem' }}>
              Go to Login
            </a>
          ) : (
            <button onClick={onConnect}>Retry Connection</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="connecting-screen">
      <h2>Pokemon Arena Online</h2>
      <p>Connect to the game server to battle other trainers!</p>
      <button className="find-match-btn" onClick={onConnect}>
        Connect to Server
      </button>
    </div>
  );
}
