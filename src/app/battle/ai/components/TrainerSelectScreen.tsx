'use client';

import Image from 'next/image';
import { Trainer } from '../types';

// Trainer sprite map - using PokeAPI trainer sprites
const TRAINER_SPRITES: Record<string, string> = {
  'Brock': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png',       // Geodude represents Brock
  'Misty': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png',      // Starmie represents Misty
  'Lt. Surge': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png',   // Raichu represents Lt. Surge
  'Erika': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png',       // Vileplume represents Erika
  'Sabrina': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png',     // Alakazam represents Sabrina
  'Koga': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/110.png',       // Weezing represents Koga
  'Blaine': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png',      // Arcanine represents Blaine
  'Giovanni': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png',   // Rhydon represents Giovanni
  'Professor Oak': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png', // Ditto represents Prof Oak
  'Nurse Joy': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png',  // Chansey represents Nurse Joy
  'Lance': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',      // Dragonite represents Lance
  'Red': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',          // Charizard represents Red
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
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, ${color}33, ${color}11)`,
                  border: `2px solid ${color}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 4,
                }}>
                  <Image
                    src={sprite}
                    alt={trainer.name}
                    width={40}
                    height={40}
                    unoptimized
                    style={{ imageRendering: 'pixelated', filter: `drop-shadow(0 2px 4px ${color}44)` }}
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
