'use client';

import { useCallback, useMemo, useState } from 'react';
import { type ClientFighter, type ClientSkill, type Energy } from '@/lib/game-socket';
import { ENERGY_ICONS, getSpriteUrl } from '../data';

const STATUS_EMOJI: Record<string, string> = {
  burn: '🔥', poison: '☠️', paralyze: '⚡', paralysis: '⚡',
  freeze: '❄️', stun: '💫', sleep: '💤', confuse: '🌀',
};

// Energy type colors for the skill boxes
const ENERGY_COLORS: Record<string, string> = {
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  lightning: '#F8D030',
  psychic: '#F85888',
  fighting: '#C03028',
  darkness: '#705848',
  metal: '#B8B8D0',
  colorless: '#A8A878',
  fairy: '#EE99AC',
};

// Type weakness/resistance data (simplified)
const TYPE_WEAKNESSES: Record<string, string[]> = {
  fire: ['water', 'rock', 'ground'],
  water: ['electric', 'grass'],
  grass: ['fire', 'ice', 'flying', 'poison', 'bug'],
  electric: ['ground'],
  psychic: ['bug', 'ghost', 'dark'],
  fighting: ['flying', 'psychic', 'fairy'],
  normal: ['fighting'],
  ice: ['fire', 'fighting', 'rock', 'steel'],
  dragon: ['ice', 'dragon', 'fairy'],
  dark: ['fighting', 'bug', 'fairy'],
  ghost: ['ghost', 'dark'],
  steel: ['fire', 'fighting', 'ground'],
  poison: ['ground', 'psychic'],
  flying: ['electric', 'ice', 'rock'],
  bug: ['fire', 'flying', 'rock'],
  rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
  ground: ['water', 'grass', 'ice'],
  fairy: ['poison', 'steel'],
};

const TYPE_RESISTANCES: Record<string, string[]> = {
  fire: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
  water: ['fire', 'water', 'ice', 'steel'],
  grass: ['water', 'electric', 'grass', 'ground'],
  electric: ['electric', 'flying', 'steel'],
  psychic: ['fighting', 'psychic'],
  fighting: ['bug', 'rock', 'dark'],
  normal: [],
  ice: ['ice'],
  dragon: ['fire', 'water', 'grass', 'electric'],
  dark: ['ghost', 'dark'],
  ghost: ['poison', 'bug'],
  steel: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'],
  poison: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
  flying: ['grass', 'fighting', 'bug'],
  bug: ['grass', 'fighting', 'ground'],
  rock: ['normal', 'fire', 'poison', 'flying'],
  ground: ['poison', 'rock'],
  fairy: ['fighting', 'bug', 'dark'],
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
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const hpPercent = fighter.maxHealth > 0 ? (fighter.health / fighter.maxHealth) * 100 : 0;
  const isFainted = !fighter.alive;
  const hpLevel = hpPercent > 50 ? 'high' : hpPercent > 25 ? 'medium' : 'low';

  // Evolution bar (derived from XP or a fixed progress)
  const evoPercent = (fighter as unknown as Record<string, unknown>).evoProgress
    ? Number((fighter as unknown as Record<string, unknown>).evoProgress)
    : 0;

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

  // Get the primary type of the fighter
  const primaryType = (fighter as unknown as Record<string, unknown>).types
    ? ((fighter as unknown as Record<string, unknown>).types as string[])[0]?.toLowerCase()
    : null;

  // Get active (non-instant) statuses for showing active skill icons
  const activeEffects = fighter.statuses.filter(s => s.duration && s.duration > 0);

  // Hovered skill data for tooltip
  const hoveredSkillData = hoveredSkill !== null ? fighter.skills[hoveredSkill] : null;

  // Get main energy type for a skill
  const getSkillEnergyType = (skill: ClientSkill): string => {
    return Object.entries(skill.cost).find(([, v]) => v > 0)?.[0] || 'colorless';
  };

  return (
    <div
      className={`na-char-slot ${isPlayer ? 'player-slot' : 'enemy-slot'} ${isFainted ? 'fainted' : ''} ${selectedSkill !== null ? 'has-action' : ''} ${!isPlayer && isTargeting && fighter.alive ? 'targetable' : ''} ${statusClasses}`}
      onClick={!isPlayer && isTargeting && fighter.alive ? () => onTargetSelect?.(index) : undefined}
    >
      {/* Portrait */}
      <div className={`na-portrait ${primaryType ? `type-bg-${primaryType}` : ''}`}>
        <img
          className={`na-portrait-img ${isPlayer ? 'player-sprite' : ''}`}
          src={getSpriteUrl(fighter.name)}
          alt={fighter.name}
        />

        {/* Status icons overlay */}
        {fighter.statuses.length > 0 && (
          <div className="na-status-icons">
            {fighter.statuses.map((s, si) => (
              <span key={si} className={`na-status-badge ${s.name}`} title={`${s.name}${s.duration ? ` (${s.duration}t)` : ''}`}>
                {STATUS_EMOJI[s.name] || '⚠️'}
              </span>
            ))}
          </div>
        )}

        {/* Active skill effect miniatures */}
        {activeEffects.length > 0 && (
          <div className="na-active-effects">
            {activeEffects.slice(0, 4).map((eff, i) => (
              <div key={i} className="na-effect-mini" title={`${eff.name} (${eff.duration}t)`}>
                <span className="na-effect-icon">{STATUS_EMOJI[eff.name] || '✦'}</span>
                {eff.duration && <span className="na-effect-dur">{eff.duration}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Type badge */}
        {primaryType && (
          <div className={`na-type-indicator type-${primaryType}`}>
            {primaryType.charAt(0).toUpperCase() + primaryType.slice(1)}
          </div>
        )}

        {/* Dead overlay */}
        {isFainted && <div className="na-dead-overlay">✕</div>}
      </div>

      {/* HP + EVO bars */}
      <div className="na-bars">
        <div className="na-hp-row">
          <div className="na-hp-bar">
            <div className={`na-hp-fill ${hpLevel}`} style={{ width: `${hpPercent}%` }} />
          </div>
          <span className="na-hp-text">{fighter.health}/{fighter.maxHealth}</span>
        </div>
        {evoPercent > 0 && (
          <div className="na-evo-bar">
            <div className="na-evo-fill" style={{ width: `${evoPercent}%` }} />
          </div>
        )}
        <div className="na-name-row">
          <span className="na-fighter-name">{fighter.name}</span>
          {/* Weakness/Resistance indicators */}
          {primaryType && TYPE_WEAKNESSES[primaryType] && (
            <div className="na-type-info">
              <span className="na-weak-label" title={`Weak to: ${TYPE_WEAKNESSES[primaryType]?.join(', ')}`}>
                ▼{TYPE_WEAKNESSES[primaryType]?.length}
              </span>
              <span className="na-resist-label" title={`Resists: ${TYPE_RESISTANCES[primaryType]?.join(', ')}`}>
                ▲{TYPE_RESISTANCES[primaryType]?.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Skill Frame - 4 skill boxes in horizontal row */}
      <div className="na-skill-frame">
        {fighter.skills.map((skill, sIdx) => {
          const affordable = isPlayer ? canAfford(skill) : true;
          const onCooldown = fighter.cooldowns[sIdx] > 0;
          const isSelected = selectedSkill === sIdx;
          const energyType = getSkillEnergyType(skill);
          const canClick = isPlayer && !isFainted && affordable && !onCooldown;

          return (
            <div
              key={sIdx}
              className={`na-skill-box ${canClick ? 'click' : 'noclick'} ${isSelected ? 'queued' : ''} ${onCooldown ? 'oncd' : ''}`}
              style={{
                borderColor: isSelected ? '#4CAF50' : `${ENERGY_COLORS[energyType] || '#666'}55`,
                backgroundColor: `${ENERGY_COLORS[energyType] || '#333'}22`,
              }}
              onClick={canClick ? (e) => {
                e.stopPropagation();
                onSkillSelect?.(index, sIdx);
              } : undefined}
              onMouseEnter={() => setHoveredSkill(sIdx)}
              onMouseLeave={() => setHoveredSkill(null)}
              data-cd={onCooldown ? fighter.cooldowns[sIdx] : undefined}
            >
              <span className="na-skill-icon">{ENERGY_ICONS[energyType] || '⭐'}</span>
              {isSelected && <span className="na-skill-check">✓</span>}
              {onCooldown && <span className="na-cd-number">{fighter.cooldowns[sIdx]}</span>}
            </div>
          );
        })}
      </div>

      {/* Skill tooltip on hover */}
      {hoveredSkillData && (
        <div className="na-skill-tooltip">
          <div className="na-tooltip-header">
            <span className="na-tooltip-name">{hoveredSkillData.name}</span>
            <div className="na-tooltip-cost">
              {Object.entries(hoveredSkillData.cost).map(([type, amount]) => (
                amount > 0 && (
                  <span key={type} className="na-cost-item">
                    <span className={`na-energy-square type-${type}`} />
                    <span>×{amount}</span>
                  </span>
                )
              ))}
            </div>
          </div>
          <p className="na-tooltip-desc">{hoveredSkillData.description}</p>
          <div className="na-tooltip-meta">
            {hoveredSkillData.damage > 0 && <span className="na-meta-dmg">DMG: {hoveredSkillData.damage}</span>}
            {hoveredSkillData.healing > 0 && <span className="na-meta-heal">HEAL: {hoveredSkillData.healing}</span>}
            {hoveredSkillData.cooldown > 0 && <span className="na-meta-cd">CD: {hoveredSkillData.cooldown}t</span>}
            <span className="na-meta-target">{hoveredSkillData.target}</span>
          </div>
          {hoveredSkillData.classes && hoveredSkillData.classes.length > 0 && (
            <div className="na-tooltip-classes">
              {hoveredSkillData.classes.map((cls, i) => (
                <span key={i} className="na-class-tag">{cls}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
