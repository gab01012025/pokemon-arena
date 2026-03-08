'use client';

import { Trainer } from '../types';

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
        {trainers.map((trainer, idx) => (
          <div
            key={idx}
            className={`trainer-select-card ${playerTrainer?.name === trainer.name ? 'selected' : ''}`}
            onClick={() => setPlayerTrainer(trainer)}
          >
            {playerTrainer?.name === trainer.name && <span className="checkmark">✓</span>}
            <div className="trainer-name">{trainer.name}</div>
            <div className="trainer-passive">{trainer.passive}</div>
            <div className="trainer-passive-desc">⚡ {trainer.passiveDesc}</div>
            <div className="trainer-passive-desc2">🔥 {trainer.passiveDesc2}</div>
          </div>
        ))}
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
