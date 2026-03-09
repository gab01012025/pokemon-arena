'use client';

import Image from 'next/image';
import { Trainer } from '../types';

// Official trainer artwork - using Pokémon Showdown trainer sprites (full-body character art)
const TRAINER_SPRITES: Record<string, string> = {
  'Brock': 'https://play.pokemonshowdown.com/sprites/trainers/brock-gen1.png',
  'Misty': 'https://play.pokemonshowdown.com/sprites/trainers/misty-gen1.png',
  'Lt. Surge': 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge-gen1.png',
  'Erika': 'https://play.pokemonshowdown.com/sprites/trainers/erika-gen1.png',
  'Sabrina': 'https://play.pokemonshowdown.com/sprites/trainers/sabrina-gen1.png',
  'Koga': 'https://play.pokemonshowdown.com/sprites/trainers/koga-gen1.png',
  'Blaine': 'https://play.pokemonshowdown.com/sprites/trainers/blaine-gen1.png',
  'Giovanni': 'https://play.pokemonshowdown.com/sprites/trainers/giovanni-gen1.png',
  'Professor Oak': 'https://play.pokemonshowdown.com/sprites/trainers/oak.png',
  'Nurse Joy': 'https://play.pokemonshowdown.com/sprites/trainers/pokemonbreeder-gen4.png',
  'Lance': 'https://play.pokemonshowdown.com/sprites/trainers/lance-gen2.png',
  'Red': 'https://play.pokemonshowdown.com/sprites/trainers/red-gen1.png',
};

const TRAINER_COLORS: Record<string, string> = {
  'Brock': '#C03028',
  'Misty': '#6890F0',
  'Lt. Surge': '#F8D030',
  'Erika': '#78C850',
  'Sabrina': '#F85888',
  'Koga': '#A040A0',
  'Blaine': '#F08030',
  'Giovanni': '#705848',
  'Professor Oak': '#A8A878',
  'Nurse Joy': '#EE99AC',
  'Lance': '#7038F8',
  'Red': '#FF4444',
};

interface TrainerSelectScreenProps {
  trainers: Trainer[];
  playerTrainer: Trainer | null;
  setPlayerTrainer: (trainer: Trainer) => void;
  onConfirm: () => void;
}

export default function TrainerSelectScreen({
  trainers,
  playerTrainer,
  setPlayerTrainer,
  onConfirm,
}: TrainerSelectScreenProps) {
  return (
    <div className="energy-select-screen">
      <div>
        <div className="energy-select-title">CHOOSE YOUR TRAINER</div>
        <div className="energy-select-subtitle">Each trainer has a unique passive ability that helps during battle</div>
      </div>
      <div className="trainer-select-grid">
        {trainers.map((trainer, idx) => {
          const color = TRAINER_COLORS[trainer.name] || '#4fc3f7';
          const sprite = TRAINER_SPRITES[trainer.name];
          const isSelected = playerTrainer?.name === trainer.name;
          return (
            <div
              key={idx}
              className={`trainer-select-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setPlayerTrainer(trainer)}
              style={{ borderColor: isSelected ? color : undefined }}
            >
              {isSelected && <span className="checkmark">✓</span>}
              {sprite && (
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: 14,
                  background: `linear-gradient(180deg, ${color}30 0%, ${color}10 100%)`,
                  border: `2px solid ${color}55`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: 6,
                  overflow: 'hidden',
                  boxShadow: `0 4px 16px ${color}33`,
                }}>
                  <Image
                    src={sprite}
                    alt={trainer.name}
                    width={88}
                    height={88}
                    unoptimized
                    style={{ objectFit: 'contain', objectPosition: 'bottom', filter: `drop-shadow(0 2px 8px ${color}66)`, imageRendering: 'pixelated' }}
                  />
                </div>
              )}
              <div className="trainer-name">{trainer.name}</div>
              <div className="trainer-passive">{trainer.passive}</div>
              <div className="trainer-passive-desc">⚡ {trainer.passiveDesc}</div>
              <div className="trainer-passive-desc2">🔥 {trainer.passiveDesc2}</div>
            </div>
          );
        })}
      </div>
      <button
        className="energy-confirm-btn"
        onClick={onConfirm}
        disabled={!playerTrainer}
      >
        {playerTrainer ? `CONTINUE WITH ${playerTrainer.name.toUpperCase()}` : 'SELECT A TRAINER'}
      </button>
    </div>
  );
}
