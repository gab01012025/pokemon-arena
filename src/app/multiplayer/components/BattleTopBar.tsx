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

const ENERGY_STYLES: Record<string, string> = {
  fire: 'fire', water: 'water', grass: 'grass',
  lightning: 'lightning', colorless: 'colorless',
  psychic: 'psychic', fighting: 'fighting',
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
    <div className="battle-header">
      {opponentDisconnected && (
        <div className="disconnect-banner">
          ⚠ Opponent disconnected — waiting for reconnect...
        </div>
      )}

      <div className="player-header">
        <div className="player-avatar-mp">
          <img src="/images/ui/default-avatar.png" alt="You" />
        </div>
        <div>
          <div className="player-battle-name">{username}</div>
          {isReady && (
            <span className="opponent-ready-indicator ready">READY</span>
          )}
        </div>
      </div>

      <div className="turn-indicator">
        <div className="turn-number">TURN {currentTurn}</div>
        <div className="turn-timer">
          <span className={`timer-seconds ${turnTimer <= 10 ? 'low' : ''}`}>{turnTimer}</span>
          <span className="timer-label">sec</span>
        </div>
        <div className="timer-bar">
          <div className={`timer-fill ${timerLevel}`} style={{ width: `${timerPercent}%` }} />
        </div>
        {/* Energy orbs */}
        <div className="energy-pool-mp">
          {Object.entries(energy).map(([type, amount]) => {
            if (amount <= 0) return null;
            return Array.from({ length: amount }, (_, i) => (
              <div key={`${type}-${i}`} className={`energy-orb ${ENERGY_STYLES[type] || 'colorless'}`} title={type}>
                {amount > 3 && i === 0 ? amount : ''}
              </div>
            )).slice(0, 3); // Max 3 orbs per type, show count on first
          })}
        </div>
      </div>

      <div className="enemy-header">
        <div className="player-avatar-mp">
          <img src="/images/ui/default-avatar.png" alt="Enemy" />
        </div>
        <div>
          <div className="player-battle-name">{opponent?.username || 'Opponent'}</div>
          <div className="player-battle-rank">Lv. {opponent?.level || '??'}</div>
          {opponentReady !== undefined && (
            <span className={`opponent-ready-indicator ${opponentReady ? 'ready' : 'choosing'}`}>
              {opponentReady ? '✓ READY' : '... choosing'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
