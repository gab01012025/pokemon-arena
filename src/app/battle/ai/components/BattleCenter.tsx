'use client';

import { Move, SelectedAction } from '../types';
import { STATUS_ICONS } from '../data';
import EnergyIcon from './EnergyIcon';

interface BattleCenterProps {
  selectedActions: SelectedAction[];
  hoveredSkill: { move: Move; pokemonName: string } | null;
}

export default function BattleCenter({
  selectedActions,
  hoveredSkill,
}: BattleCenterProps) {
  return (
    <div className="center-area">
      <div className="vs-display">VS</div>
      <div className="action-queue">
        {[0, 1, 2].map(i => (
          <div key={i} className={`queue-slot ${selectedActions[i] ? 'filled' : ''}`}>
            {selectedActions[i] ? '✓' : '?'}
          </div>
        ))}
      </div>
      {hoveredSkill && (
        <div className="skill-info-panel">
          <div className="skill-info-header">
            <span className="skill-info-name">{hoveredSkill.move.name}</span>
            <div className="skill-info-cost">
              {hoveredSkill.move.cost.map((c, i) => (
                <div key={i} className={`energy-orb ${c.type}`} title={`${c.amount}× ${c.type}`}>
                  {c.amount > 1 ? c.amount : <EnergyIcon type={c.type} size={16} />}
                </div>
              ))}
            </div>
          </div>
          <div className="skill-info-desc">{hoveredSkill.move.description}</div>
          <div className="skill-info-footer">
            <span>PWR: {hoveredSkill.move.power || '-'}</span>
            <span>ACC: {hoveredSkill.move.accuracy}%</span>
            <span>CD: {hoveredSkill.move.cooldown}</span>
          </div>
          {hoveredSkill.move.statusEffect && (
            <div className="skill-info-status">
              {STATUS_ICONS[hoveredSkill.move.statusEffect.type]} {hoveredSkill.move.statusEffect.chance}% {hoveredSkill.move.statusEffect.type} ({hoveredSkill.move.statusEffect.duration}t)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
