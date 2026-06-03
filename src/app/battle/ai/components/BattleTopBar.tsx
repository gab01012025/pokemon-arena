'use client';

import Image from 'next/image';
import { EnergyType, EnergyState, Trainer, GamePhase } from '../types';
import { RankInfo } from '@/lib/ranks';
import { getTotalEnergy } from '../engine';
import EnergyIcon from './EnergyIcon';

const TRAINER_SPRITES: Record<string, string> = {
  'Brock': 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
  'Misty': 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
  'Lt. Surge': 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png',
  'Erika': 'https://play.pokemonshowdown.com/sprites/trainers/erika.png',
  'Sabrina': 'https://play.pokemonshowdown.com/sprites/trainers/sabrina.png',
  'Koga': 'https://play.pokemonshowdown.com/sprites/trainers/koga.png',
  'Blaine': 'https://play.pokemonshowdown.com/sprites/trainers/blaine.png',
  'Giovanni': 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
  'Professor Oak': 'https://play.pokemonshowdown.com/sprites/trainers/oak.png',
  'Nurse Joy': 'https://play.pokemonshowdown.com/sprites/trainers/pokemonbreeder.png',
  'Lance': 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
  'Red': 'https://play.pokemonshowdown.com/sprites/trainers/red.png',
};

const AI_TRAINER_SPRITES = [
  'https://play.pokemonshowdown.com/sprites/trainers/youngster.png',
  'https://play.pokemonshowdown.com/sprites/trainers/lass.png',
  'https://play.pokemonshowdown.com/sprites/trainers/bugcatcher.png',
  'https://play.pokemonshowdown.com/sprites/trainers/hiker.png',
  'https://play.pokemonshowdown.com/sprites/trainers/fisherman.png',
  'https://play.pokemonshowdown.com/sprites/trainers/psychic.png',
];

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
  onExchangeEnergy?: () => void;
  canExchange?: boolean;
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
  onExchangeEnergy,
  canExchange,
}: BattleTopBarProps) {
  const trainerSprite = playerTrainer ? TRAINER_SPRITES[playerTrainer.name] : null;
  const opponentSprite = AI_TRAINER_SPRITES[Math.abs(opponentName.charCodeAt(0)) % AI_TRAINER_SPRITES.length];

  return (
    <div className="top-bar">
      <div className="player-info">
        <div className="player-avatar">
          {trainerSprite ? (
            <Image src={trainerSprite} alt={playerTrainer?.name || ''} width={40} height={40} unoptimized
              style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top' }} />
          ) : (
            <div className="rank-badge-mini" style={{ background: playerRank.gradient }} title={playerRank.name}>
              <span>Lv{playerLevel}</span>
            </div>
          )}
        </div>
        <div className="player-details">
          <div className="player-name">{playerName}</div>
          <div className="player-rank" style={{ color: playerRank.color }}>{playerRank.name}</div>
          {winStreak > 0 && (
            <div className={`win-streak-badge ${winStreak >= 5 ? 'hot' : ''} ${winStreak >= 10 ? 'on-fire' : ''}`}>
              {winStreak} streak
            </div>
          )}
        </div>
      </div>

      <div className="center-controls">
        <button className="ready-btn" onClick={onEndTurn} disabled={phase !== 'player1-turn'}>
          {phase === 'player1-turn' ? 'PRESS WHEN READY' : phase === 'executing' ? 'EXECUTING...' : phase === 'player2-turn' ? 'OPPONENT TURN...' : 'WAITING...'}
        </button>
        <div className="timer-container">
          <div className="timer-bar">
            <div className="timer-fill" style={{ width: `${timer}%` }} />
          </div>
        </div>
        <div className="energy-inline-row">
          {selectedEnergyTypes.map(type => (
            <span key={type} className={`energy-inline-item ${energy[type] === 0 ? 'empty' : ''}`}>
              <EnergyIcon type={type} size={16} />
              <span className="energy-inline-count">x{energy[type]}</span>
            </span>
          ))}
          <span className="energy-inline-total">T x{getTotalEnergy(energy)}</span>
        </div>
        {phase === 'player1-turn' && onExchangeEnergy && (
          <button className="exchange-chakra-btn" onClick={onExchangeEnergy} disabled={!canExchange}>
            EXCHANGE ENERGY
          </button>
        )}
      </div>

      <div className="player-info right">
        <div className="player-details" style={{ textAlign: 'right' }}>
          <div className="player-name" style={{ color: opponentRank.color }}>{opponentName}</div>
          <div className="player-rank" style={{ color: opponentRank.color }}>{opponentRank.name}</div>
        </div>
        <div className="player-avatar">
          <Image src={opponentSprite} alt={opponentName} width={40} height={40} unoptimized
            style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
      </div>
    </div>
  );
}
