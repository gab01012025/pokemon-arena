'use client';

import { type ClientFighter, type Energy } from '@/lib/game-socket';
import BattlePokemonCard from './BattlePokemonCard';

interface PlayerPanelProps {
  fighters: ClientFighter[];
  selectedSkills: Record<number, number | null>;
  energy: Energy;
  onSkillSelect: (fighterIdx: number, skillIdx: number) => void;
}

export default function PlayerPanel({ fighters, selectedSkills, energy, onSkillSelect }: PlayerPanelProps) {
  return (
    <div className="battle-side">
      {fighters.map((fighter, idx) => (
        <BattlePokemonCard
          key={idx}
          fighter={fighter}
          index={idx}
          isPlayer={true}
          selectedSkill={selectedSkills[idx] ?? null}
          onSkillSelect={onSkillSelect}
          isTargeting={false}
          energy={energy}
        />
      ))}
    </div>
  );
}
