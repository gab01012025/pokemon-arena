'use client';

import { EnergyType, EnergyState, Trainer, GamePhase } from '../types';
import { RankInfo } from '@/lib/ranks';
import { ENERGY_ICONS, ENERGY_NAMES } from '../data';
import { getTotalEnergy } from '../engine';

interface BattleTopBarProps {
  playerName: string;
  playerLevel: number;
  playerRank: RankInfo;
  playerTrainer: Trainer | null;
  opponentName: string;
  opponentLevel: number;
  opponentRank: RankInfo;
  turn: number;
  timer: number;
  phase: GamePhase;
  energy: EnergyState;
  selectedEnergyTypes: EnergyType[];
  onEndTurn: () => void;
  winStreak: number;
  isDailyChallenge: boolean;
  dailyChallengeCompleted: boolean;
}

export default function BattleTopBar({
  playerName,
  playerLevel,
  playerRank,
  playerTrainer,
  opponentName,
  opponentLevel,
  opponentRank,
  turn,
  timer,
  phase,
  energy,
  selectedEnergyTypes,
  onEndTurn,
  winStreak,
  isDailyChallenge,
  dailyChallengeCompleted,
}: BattleTopBarProps) {
  return (
    <div className="top-bar">
      <div className="player-info">
        <div className="player-avatar">
          <div className="rank-badge-mini" style={{ background: playerRank.gradient }} title={playerRank.name}>
            <span>Lv{playerLevel}</span>
          </div>
        </div>
        <div className="player-details">
          <div className="player-name">{playerName}</div>
          <div className="player-rank" style={{ color: playerRank.color }}>{playerRank.name}</div>
          {playerTrainer && <div className="trainer-passive" title={playerTrainer.passiveDesc}>🎖️ {playerTrainer.name}: {playerTrainer.passive}</div>}
          {winStreak > 0 && (
            <div className={`win-streak-badge ${winStreak >= 5 ? 'hot' : ''} ${winStreak >= 10 ? 'on-fire' : ''}`}>
              🔥 {winStreak} streak
            </div>
          )}
          {isDailyChallenge && !dailyChallengeCompleted && (
            <div className="daily-challenge-badge">⭐ Daily Challenge: 2x XP!</div>
          )}
        </div>
      </div>

      <div className="center-controls">
        <div className="turn-info">TURN {turn}</div>
        <button className="ready-btn" onClick={onEndTurn} disabled={phase !== 'player1-turn'}>
          {phase === 'player1-turn' ? 'END TURN' : phase === 'executing' ? 'EXECUTING...' : phase === 'player2-turn' ? 'OPPONENT TURN' : 'WAIT...'}
        </button>
        <div className="timer-container">
          <div className="timer-bar">
            <div className="timer-fill" style={{ width: `${timer}%` }} />
          </div>
        </div>
        <div className="energy-pool">
          {[...new Set([...selectedEnergyTypes, 'colorless' as EnergyType])].map(type => (
            energy[type] > 0 ? (
              <div key={type} className="energy-item">
                <div className={`energy-orb ${type}`} title={ENERGY_NAMES[type]}>{ENERGY_ICONS[type]}</div>
                <span className="energy-count">×{energy[type]}</span>
              </div>
            ) : null
          ))}
          <div className="energy-total">
            <span className="total-label">T</span>
            <span className="energy-count">×{getTotalEnergy(energy)}</span>
          </div>
        </div>
      </div>

      <div className="player-info right">
        <div className="player-details" style={{ textAlign: 'right' }}>
          <div className="player-name" style={{ color: opponentRank.color }}>{opponentName}</div>
          <div className="player-rank" style={{ color: opponentRank.color }}>{opponentRank.name}</div>
        </div>
        <div className="player-avatar">
          <div className="rank-badge-mini" style={{ background: opponentRank.gradient }} title={opponentRank.name}>
            <span>Lv{opponentLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
