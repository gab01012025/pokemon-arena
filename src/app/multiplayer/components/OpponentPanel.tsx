'use client';

import { type ClientFighter, type Energy } from '@/lib/game-socket';
import BattlePokemonCard from './BattlePokemonCard';

interface OpponentPanelProps {
  fighters: ClientFighter[];
  isTargeting: boolean;
  onTargetSelect: (enemyIdx: number) => void;
}

export default function OpponentPanel({ fighters, isTargeting, onTargetSelect }: OpponentPanelProps) {
  const dummyEnergy = { fire: 0, water: 0, grass: 0, lightning: 0, colorless: 0 };

  return (
    <div className="battle-side">
      {fighters.map((fighter, idx) => (
        <BattlePokemonCard
          key={idx}
          fighter={fighter}
          index={idx}
          isPlayer={false}
          selectedSkill={null}
          isTargeting={isTargeting}
          onTargetSelect={onTargetSelect}
          energy={dummyEnergy}
        />
      ))}
    </div>
  );
}
