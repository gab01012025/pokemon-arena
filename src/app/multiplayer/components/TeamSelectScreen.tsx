'use client';

import { useState, useCallback } from 'react';
import { type UseMultiplayerState } from '@/hooks/useMultiplayer';
import { type RosterPokemon } from '../data';
import TeamSlot from './TeamSlot';
import PokemonRosterCard from './PokemonRosterCard';

interface TeamSelectScreenProps {
  state: UseMultiplayerState;
  roster: RosterPokemon[];
  loadingRoster: boolean;
  selectedTeam: RosterPokemon[];
  queueType: 'quick' | 'ranked';
  privateRoomCode: string;
  onTogglePokemon: (pokemon: RosterPokemon) => void;
  onRemovePokemon: (index: number) => void;
  onSetQueueType: (type: 'quick' | 'ranked') => void;
  onJoinQueue: () => void;
  onDisconnect: () => void;
  onCreatePrivateRoom: () => void;
  onJoinPrivateRoom: () => void;
  onSetPrivateRoomCode: (code: string) => void;
}

export default function TeamSelectScreen({
  state,
  roster,
  loadingRoster,
  selectedTeam,
  queueType,
  privateRoomCode,
  onTogglePokemon,
  onRemovePokemon,
  onSetQueueType,
  onJoinQueue,
  onDisconnect,
  onCreatePrivateRoom,
  onJoinPrivateRoom,
  onSetPrivateRoomCode,
}: TeamSelectScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(() => {
    if (!state.privateRoomId) return;
    navigator.clipboard.writeText(state.privateRoomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [state.privateRoomId]);

  const handleShareLink = useCallback(() => {
    if (!state.privateRoomId) return;
    const url = `${window.location.origin}/multiplayer?room=${state.privateRoomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [state.privateRoomId]);

  return (
    <>
      {/* Lobby Header */}
      <div className="lobby-header">
        <h1>Pokemon Arena Online</h1>
        <div className="online-status">
          <span className="online-dot" />
          <span>{state.onlineCount} Online</span>
        </div>
        {state.username && (
          <div className="online-status">
            <span>🎮 {state.username}</span>
          </div>
        )}
      </div>

      {/* Lobby Content */}
      <div className="lobby-content">
        {/* Team Selection */}
        <div className="team-selection-panel">
          <h2>Select Your Team (3 Pokemon)</h2>
          <div className="selected-team-slots">
            {[0, 1, 2].map((i) => (
              <TeamSlot
                key={i}
                pokemon={selectedTeam[i] || null}
                onRemove={selectedTeam[i] ? () => onRemovePokemon(i) : undefined}
              />
            ))}
          </div>

          {loadingRoster ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
              Loading Pokemon roster...
            </div>
          ) : (
            <div className="pokemon-roster">
              {roster.map((pokemon) => (
                <PokemonRosterCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isSelected={selectedTeam.some(p => p.id === pokemon.id)}
                  onClick={() => onTogglePokemon(pokemon)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Queue Panel */}
        <div className="queue-panel">
          <h2>Find a Match</h2>
          <div className="queue-type-selector">
            <button
              className={`queue-type-btn ${queueType === 'quick' ? 'active' : ''}`}
              onClick={() => onSetQueueType('quick')}
            >
              ⚡ Quick Match
              <span className="queue-desc">Casual battle, no ranking impact</span>
            </button>
            <button
              className={`queue-type-btn ${queueType === 'ranked' ? 'active' : ''}`}
              onClick={() => onSetQueueType('ranked')}
            >
              🏆 Ranked Match
              <span className="queue-desc">Competitive battle, gain/lose ladder points</span>
            </button>
          </div>

          <button
            className="find-match-btn"
            disabled={selectedTeam.length !== 3}
            onClick={onJoinQueue}
          >
            {selectedTeam.length === 3 ? 'Find Match' : `Select ${3 - selectedTeam.length} more Pokemon`}
          </button>

          {/* Private Room Section */}
          <div className="private-room-section">
            <h3>🔒 Private Room</h3>
            <button
              className="find-match-btn"
              disabled={selectedTeam.length !== 3}
              onClick={onCreatePrivateRoom}
              style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}
            >
              Create Private Room
            </button>

            {state.privateRoomId && (
              <div className="room-code-display">
                <span className="room-code-label">Room Code</span>
                <span className="room-code-value">{state.privateRoomId}</span>
                <div className="room-code-actions">
                  <button
                    className={`copy-code-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopyCode}
                  >
                    {copied ? '✓ Copied' : '📋 Copy Code'}
                  </button>
                  <button className="share-link-btn" onClick={handleShareLink}>
                    🔗 Share Link
                  </button>
                </div>
              </div>
            )}

            <div className="room-join-row">
              <input
                className="room-join-input"
                type="text"
                placeholder="Enter room code"
                value={privateRoomCode}
                onChange={(e) => onSetPrivateRoomCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button
                className="find-match-btn"
                disabled={selectedTeam.length !== 3 || privateRoomCode.length < 4}
                onClick={onJoinPrivateRoom}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Join
              </button>
            </div>
          </div>

          <button className="back-btn" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </>
  );
}
