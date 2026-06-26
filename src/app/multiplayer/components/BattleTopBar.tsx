'use client';

import { type Energy } from '@/lib/game-socket';

interface BattleTopBarProps {
  username: string;
  opponent: { username: string; level: number } | null;
  currentTurn: number;
  turnTimer: number;
  energy: Energy;
  opponentDisconnected: boolean;
  opponentReady?: boolean;
  isReady?: boolean;
}

// Energy type display colors and labels
const ENERGY_CONFIG: Record<string, { color: string; label: string; darkText?: boolean }> = {
  fire: { color: '#F08030', label: 'Fire' },
  water: { color: '#6890F0', label: 'Water' },
  grass: { color: '#78C850', label: 'Grass' },
  lightning: { color: '#F8D030', label: 'Elec', darkText: true },
  psychic: { color: '#F85888', label: 'Psy' },
  fighting: { color: '#C03028', label: 'Fight' },
  darkness: { color: '#705848', label: 'Dark' },
  metal: { color: '#B8B8D0', label: 'Steel', darkText: true },
  colorless: { color: '#A8A878', label: 'Any', darkText: true },
  fairy: { color: '#EE99AC', label: 'Fairy' },
};

export default function BattleTopBar({
  username,
  opponent,
  currentTurn,
  turnTimer,
  energy,
  opponentDisconnected,
  opponentReady,
  isReady,
}: BattleTopBarProps) {
  const timerPercent = (turnTimer / 90) * 100;
  const timerLevel = timerPercent > 60 ? 'high' : timerPercent > 30 ? 'medium' : 'low';

  return (
    <div className="na-top-bar">
      {opponentDisconnected && (
        <div className="disconnect-banner">
          Opponent disconnected — waiting for reconnect...
        </div>
      )}

      {/* Player info */}
      <div className="na-player-info">
        <div className="na-avatar">
          <img src="/images/ui/default-avatar.png" alt="You" />
        </div>
        <div className="na-player-details">
          <span className="na-player-name">{username}</span>
          {isReady && <span className="na-ready-badge ready">READY</span>}
        </div>
      </div>

      {/* Center: Turn + Timer + Energy */}
      <div className="na-center-info">
        <div className="na-turn-display">
          <span className="na-turn-label">TURN</span>
          <span className="na-turn-number">{currentTurn}</span>
        </div>

        <div className="na-timer">
          <span className={`na-timer-seconds ${turnTimer <= 10 ? 'critical' : ''}`}>{turnTimer}</span>
          <span className="na-timer-unit">s</span>
        </div>

        <div className="na-timer-bar">
          <div className={`na-timer-fill ${timerLevel}`} style={{ width: `${timerPercent}%` }} />
        </div>

        {/* Energy squares */}
        <div className="na-energy-pool">
          {Object.entries(energy).map(([type, amount]) => {
            if (amount <= 0) return null;
            const config = ENERGY_CONFIG[type];
            if (!config) return null;
            return Array.from({ length: Math.min(amount, 5) }, (_, i) => (
              <div
                key={`${type}-${i}`}
                className={`na-energy-square type-${type}`}
                title={`${config.label} (${amount})`}
                style={{
                  backgroundColor: config.color,
                  color: config.darkText ? '#333' : '#fff',
                }}
              />
            ));
          })}
        </div>
      </div>

      {/* Opponent info */}
      <div className="na-player-info enemy">
        <div className="na-player-details">
          <span className="na-player-name">{opponent?.username || 'Opponent'}</span>
          <span className="na-player-rank">Lv. {opponent?.level || '??'}</span>
          {opponentReady !== undefined && (
            <span className={`na-ready-badge ${opponentReady ? 'ready' : 'choosing'}`}>
              {opponentReady ? 'READY' : '...'}
            </span>
          )}
        </div>
        <div className="na-avatar">
          <img src="/images/ui/default-avatar.png" alt="Enemy" />
        </div>
      </div>
    </div>
  );
}
