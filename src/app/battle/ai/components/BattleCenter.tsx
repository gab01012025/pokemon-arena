'use client';

import { Move, SelectedAction, BattlePokemon, PokemonType } from '../types';
import { STATUS_ICONS, TYPE_COLORS } from '../data';
import { STAB_MULTIPLIER, TCG_WEAKNESS_BONUS } from '../engine';
import EnergyIcon from './EnergyIcon';

interface BattleCenterProps {
  selectedActions: SelectedAction[];
  hoveredSkill: { move: Move; pokemonName: string; pokemonTypes?: PokemonType[] } | null;
}

export default function BattleCenter({
  selectedActions,
  hoveredSkill,
}: BattleCenterProps) {
  // Calculate expected damage range for the hovered skill
  const getDamageInfo = () => {
    if (!hoveredSkill || hoveredSkill.move.power <= 0) return null;
    const move = hoveredSkill.move;
    const types = hoveredSkill.pokemonTypes || [];
    const hasStab = types.includes(move.type as PokemonType);
    const base = move.power;
    const stabDmg = hasStab ? Math.floor(base * STAB_MULTIPLIER) : base;
    const withWeakness = stabDmg + TCG_WEAKNESS_BONUS;
    return { base, stabDmg, hasStab, withWeakness };
  };

  const dmgInfo = getDamageInfo();
  const moveColors = hoveredSkill ? (TYPE_COLORS[hoveredSkill.move.type] || TYPE_COLORS.normal) : null;

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
            <span className="skill-info-type-badge" style={{ background: moveColors?.bg, color: moveColors?.text }}>
              {hoveredSkill.move.type.toUpperCase()}
            </span>
          </div>
          <div className="skill-info-cost-row">
            {hoveredSkill.move.cost.map((c, i) => (
              <div key={i} className={`energy-orb ${c.type}`} title={`${c.amount}× ${c.type}`}>
                {Array.from({ length: c.amount }).map((_, ai) => (
                  <EnergyIcon key={ai} type={c.type} size={16} />
                ))}
              </div>
            ))}
            {hoveredSkill.move.cost.length === 0 && <span className="skill-free-tag">FREE</span>}
          </div>
          <div className="skill-info-desc">{hoveredSkill.move.description}</div>
          {dmgInfo && (
            <div className="skill-info-damage">
              <span className="dmg-base">Base: {dmgInfo.base}</span>
              {dmgInfo.hasStab && <span className="dmg-stab">STAB: {dmgInfo.stabDmg}</span>}
              <span className="dmg-weak">vs Weak: {dmgInfo.withWeakness}</span>
            </div>
          )}
          {hoveredSkill.move.healing && hoveredSkill.move.healing > 0 && (
            <div className="skill-info-heal">Heal: +{hoveredSkill.move.healing} HP</div>
          )}
          <div className="skill-info-footer">
            <span>PWR: {hoveredSkill.move.power || '-'}</span>
            <span>ACC: {hoveredSkill.move.accuracy}%</span>
            <span>CD: {hoveredSkill.move.cooldown > 0 ? `${hoveredSkill.move.cooldown}t` : '-'}</span>
            <span>TGT: {hoveredSkill.move.targetType === 'self' ? 'Self' : hoveredSkill.move.targetType === 'all-enemies' ? 'All' : 'Single'}</span>
          </div>
          {hoveredSkill.move.statusEffect && (
            <div className="skill-info-status">
              {STATUS_ICONS[hoveredSkill.move.statusEffect.type]}{' '}
              <strong>{hoveredSkill.move.statusEffect.type}</strong>{' '}
              {hoveredSkill.move.statusEffect.chance}% chance · {hoveredSkill.move.statusEffect.duration} turn{hoveredSkill.move.statusEffect.duration > 1 ? 's' : ''}
              {hoveredSkill.move.statusEffect.value ? ` · ${hoveredSkill.move.statusEffect.value}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
