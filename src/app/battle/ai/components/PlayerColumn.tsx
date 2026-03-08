'use client';

import Image from 'next/image';
import { BattlePokemon, Move, SelectedAction, GamePhase } from '../types';
import { TYPE_COLORS, MOVE_ABBREV, STATUS_ICONS, ENERGY_ICONS, TYPE_TO_ENERGY } from '../data';
import { getHpClass } from '../engine';

interface PlayerColumnProps {
  playerTeam: BattlePokemon[];
  selectedActions: SelectedAction[];
  phase: GamePhase;
  canUseMove: (move: Move, pIdx: number) => boolean;
  onSkillClick: (pIdx: number, move: Move) => void;
  onRemoveAction: (pIdx: number) => void;
  onItemTarget: (pIdx: number) => void;
  onHoverSkill: (move: Move, pokemonName: string) => void;
  onLeaveSkill: () => void;
}

export default function PlayerColumn({
  playerTeam,
  selectedActions,
  phase,
  canUseMove,
  onSkillClick,
  onRemoveAction,
  onItemTarget,
  onHoverSkill,
  onLeaveSkill,
}: PlayerColumnProps) {
  return (
    <div className="character-column">
      {playerTeam.map((poke, idx) => {
        const hasAction = selectedActions.some(a => a.pokemonIndex === idx);
        const selectedMove = selectedActions.find(a => a.pokemonIndex === idx)?.move;
        const hasBurn = poke.statusEffects.some(e => e.type === 'burn');
        const hasPoison = poke.statusEffects.some(e => e.type === 'poison');
        const hasFrozen = poke.statusEffects.some(e => e.type === 'freeze');
        return (
          <div
            key={`p-${poke.id}-${idx}`}
            className={`character-card player ${poke.hp <= 0 ? 'fainted' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''} ${phase === 'item-target' && poke.hp > 0 ? 'targetable' : ''}`}
            onClick={() => phase === 'item-target' && poke.hp > 0 && onItemTarget(idx)}
          >
            <div className="portrait-container">
              {poke.statusEffects.length > 0 && (
                <div className="status-icons">
                  {poke.statusEffects.map((se, si) => (
                    <div key={si} className={`status-badge ${se.type}`} title={`${se.type} (${se.duration}t)`}>
                      {STATUS_ICONS[se.type]}
                    </div>
                  ))}
                </div>
              )}
              <div className="pokemon-sprite flipped">
                <Image src={poke.sprite} alt={poke.name} width={68} height={68} unoptimized />
              </div>
              <div className="pokemon-name-tag">{poke.name}</div>
              <div className="hp-text-overlay">{poke.hp}/{poke.maxHp}</div>
              <div className="hp-bar-overlay">
                <div className="hp-bar-inner">
                  <div className={`hp-fill ${getHpClass(poke.hp, poke.maxHp)}`} style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }} />
                </div>
              </div>
              {(poke.weakness || poke.resistance) && (
                <div className="wr-badges">
                  {poke.weakness && (
                    <span className="wr-badge weakness" title={`Weak to ${poke.weakness} (+20 dmg)`}>
                      {ENERGY_ICONS[TYPE_TO_ENERGY[poke.weakness]]} ×2
                    </span>
                  )}
                  {poke.resistance && (
                    <span className="wr-badge resistance" title={`Resists ${poke.resistance} (-20 dmg)`}>
                      {ENERGY_ICONS[TYPE_TO_ENERGY[poke.resistance]]} -20
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="skills-panel">
              {poke.moves.slice(0, 4).map(move => {
                const colors = TYPE_COLORS[move.type] || TYPE_COLORS.normal;
                const abbrev = MOVE_ABBREV[move.name] || move.name.substring(0, 3).toUpperCase();
                return (
                  <div
                    key={move.id}
                    className={`skill-slot ${!canUseMove(move, idx) ? 'disabled' : ''} ${hasAction && selectedMove?.id === move.id ? 'selected' : ''} ${move.currentCooldown > 0 ? 'on-cooldown' : ''}`}
                    data-cd={move.currentCooldown > 0 ? move.currentCooldown : undefined}
                    style={{ background: colors.bg, borderColor: colors.border }}
                    onClick={(e) => { e.stopPropagation(); if (poke.hp > 0) { if (hasAction) { onRemoveAction(idx); } else { onSkillClick(idx, move); } } }}
                    onMouseEnter={() => onHoverSkill(move, poke.name)}
                    onMouseLeave={onLeaveSkill}
                  >
                    <span className="skill-abbrev" style={{ color: colors.text }}>{abbrev}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
