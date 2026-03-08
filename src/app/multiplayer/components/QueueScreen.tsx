'use client';

import { useState, useEffect } from 'react';
import { type UseMultiplayerState } from '@/hooks/useMultiplayer';
import { type RosterPokemon, getSpriteUrlStatic } from '../data';

interface QueueScreenProps {
  state: UseMultiplayerState;
  selectedTeam: RosterPokemon[];
  onCancel: () => void;
}

export default function QueueScreen({ state, selectedTeam, onCancel }: QueueScreenProps) {
  const [elapsed, setElapsed] = useState(0);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="queue-screen">
      <h2>Searching for Opponent...</h2>
      <div className="pokeball-spinner" />
      <div className="queue-info">
        <p>Queue Type: <strong>{state.queueType === 'ranked' ? 'Ranked' : 'Quick Match'}</strong></p>
        <div className="queue-elapsed">{formatTime(elapsed)}</div>
        <p>Position: <strong>#{state.queuePosition || '?'}</strong></p>
        {state.onlineCount > 0 && (
          <div className="queue-online-count">
            <span className="online-dot" />
            {state.onlineCount} players online
          </div>
        )}
      </div>
      <div className="selected-team-preview">
        {selectedTeam.map((p) => (
          <div key={p.id} className="team-preview-slot">
            <img src={getSpriteUrlStatic(p.name)} alt={p.name} />
          </div>
        ))}
      </div>
      <button className="cancel-queue-btn" onClick={onCancel}>
        Cancel Search
      </button>
    </div>
  );
}
