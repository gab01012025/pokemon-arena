'use client';

import { useCallback, useMemo } from 'react';
import { type ClientFighter, type ClientSkill, type Energy } from '@/lib/game-socket';
import { ENERGY_ICONS, getSpriteUrl } from '../data';

const STATUS_EMOJI: Record<string, string> = {
  burn: '🔥', poison: '☠️', paralyze: '⚡', paralysis: '⚡',
  freeze: '❄️', stun: '💫', sleep: '💤', confuse: '🌀',
};

interface BattlePokemonCardProps {
  fighter: ClientFighter;
  index: number;
  isPlayer: boolean;
  selectedSkill: number | null;
  onSkillSelect?: (fighterIdx: number, skillIdx: number) => void;
  onTargetSelect?: (enemyIdx: number) => void;
  isTargeting: boolean;
  energy: Energy;
}

export default function BattlePokemonCard({
  fighter,
  index,
  isPlayer,
  selectedSkill,
  onSkillSelect,
  onTargetSelect,
  isTargeting,
  energy,
}: BattlePokemonCardProps) {
  const hpPercent = fighter.maxHealth > 0 ? (fighter.health / fighter.maxHealth) * 100 : 0;
  const isFainted = !fighter.alive;
  const hpLevel = hpPercent > 50 ? 'high' : hpPercent > 25 ? 'medium' : 'low';

  // Status-based CSS classes for card glow effects
  const statusClasses = useMemo(() => {
    const cls: string[] = [];
    fighter.statuses.forEach(s => {
      if (s.name === 'burn') cls.push('burning');
      if (s.name === 'poison') cls.push('poisoned');
      if (s.name === 'freeze') cls.push('frozen');
    });
    return cls.join(' ');
  }, [fighter.statuses]);

  const canAfford = useCallback((skill: ClientSkill): boolean => {
    if (!skill.cost) return true;
    const e = energy as unknown as Record<string, number>;
    for (const [type, amount] of Object.entries(skill.cost)) {
      if ((e[type] || 0) < amount) return false;
    }
    return true;
  }, [energy]);

  const sideClass = isPlayer ? 'player-card' : 'enemy-card';

  return (
    <div
      className={`pokemon-battle-card ${sideClass} ${isFainted ? 'fainted' : ''} ${selectedSkill !== null ? 'has-action' : ''} ${!isPlayer && isTargeting && fighter.alive ? 'targetable' : ''} ${statusClasses}`}
      onClick={!isPlayer && isTargeting && fighter.alive ? () => onTargetSelect?.(index) : undefined}
    >
      {/* Portrait with HP overlay */}
      <div className="pokemon-portrait">
        <img
          className="pokemon-portrait-img"
          src={getSpriteUrl(fighter.name)}
          alt={fighter.name}
        />
        {/* Status icons - show ALL statuses */}
        {fighter.statuses.length > 0 && (
          <div className="status-icons">
            {fighter.statuses.map((s, si) => (
              <span key={si} className={`status-badge ${s.name}`} title={s.name}>
                {STATUS_EMOJI[s.name] || '⚠️'}
              </span>
            ))}
          </div>
        )}
        <span className="pokemon-name-tag">{fighter.name}</span>
        {/* HP bar inside portrait */}
        <div className="hp-bar-overlay">
          <div className="hp-bar-inner">
            <div className={`hp-fill ${hpLevel}`} style={{ width: `${hpPercent}%` }} />
          </div>
        </div>
        <span className="hp-text-overlay">{fighter.health}/{fighter.maxHealth}</span>
      </div>

      {/* Skill buttons (player only) */}
      {isPlayer && !isFainted && (
        <div className="pokemon-info">
          <div className="move-buttons">
            {fighter.skills.map((skill, sIdx) => {
              const affordable = canAfford(skill);
              const onCooldown = fighter.cooldowns[sIdx] > 0;
              const isSelected = selectedSkill === sIdx;
              const mainType = Object.entries(skill.cost).find(([, v]) => v > 0)?.[0] || 'colorless';
              return (
                <button
                  key={sIdx}
                  className={`move-btn type-${mainType} ${isSelected ? 'selected' : ''}`}
                  disabled={!affordable || onCooldown || isFainted}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkillSelect?.(index, sIdx);
                  }}
                  title={`${skill.name} - ${skill.description}`}
                >
                  <span className="move-icon">{ENERGY_ICONS[mainType] || '⭐'}</span>
                  <span className="move-name">{skill.name}</span>
                  {onCooldown && <span className="cooldown-badge">{fighter.cooldowns[sIdx]}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
