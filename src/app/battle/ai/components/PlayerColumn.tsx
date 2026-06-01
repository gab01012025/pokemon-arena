'use client';

import Image from 'next/image';
import { BattlePokemon, Move, SelectedAction, GamePhase } from '../types';
import { STATUS_ICONS, TYPE_TO_ENERGY } from '../data';
import { getHpClass } from '../engine';
import EnergyIcon from './EnergyIcon';

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
  anims?: string[];
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
  anims = [],
}: PlayerColumnProps) {
  return (
    <div className="arena-column player-column">
      {playerTeam.map((poke, idx) => {
        const hasAction = selectedActions.some(a => a.pokemonIndex === idx);
        const selectedMove = selectedActions.find(a => a.pokemonIndex === idx)?.move;
        const hasBurn = poke.statusEffects.some(e => e.type === 'burn');
        const hasPoison = poke.statusEffects.some(e => e.type === 'poison');
        const hasFrozen = poke.statusEffects.some(e => e.type === 'freeze');
        return (
          <div
            key={`p-${poke.id}-${idx}`}
            className={`arena-slot player ${poke.hp <= 0 ? 'fainted' : ''} ${hasAction ? 'action-ready' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''} ${phase === 'item-target' && poke.hp > 0 ? 'targetable' : ''} ${anims[idx] || ''}`}
            onClick={() => phase === 'item-target' && poke.hp > 0 && onItemTarget(idx)}
          >
            {/* Portrait side */}
            <div className="slot-portrait">
              {/* Status effects */}
              {poke.statusEffects.length > 0 && (
                <div className="slot-status-icons">
                  {poke.statusEffects.map((se, si) => (
                    <div key={si} className={`status-badge ${se.type}`} title={`${se.type} (${se.duration}t)`}>
                      {STATUS_ICONS[se.type]}
                    </div>
                  ))}
                </div>
              )}
              <Image src={poke.sprite} alt={poke.name} width={96} height={96} unoptimized className="char-sprite flipped" />
              {/* W/R badges */}
              {(poke.weakness || poke.resistance) && (
                <div className="char-wr-badges">
                  {poke.weakness && (
                    <span className="wr-badge weakness" title={`Weak to ${poke.weakness} (+20 dmg)`}>
                      <EnergyIcon type={TYPE_TO_ENERGY[poke.weakness]} size={10} /> x2
                    </span>
                  )}
                  {poke.resistance && (
                    <span className="wr-badge resistance" title={`Resists ${poke.resistance} (-20 dmg)`}>
                      <EnergyIcon type={TYPE_TO_ENERGY[poke.resistance]} size={10} /> -20
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Skills side */}
            <div className="slot-skills">
              {poke.moves.slice(0, 4).map(move => {
                const energyType = move.cost.length > 0 ? move.cost[0].type : 'colorless';
                return (
                  <div
                    key={move.id}
                    className={`skill-square ${!canUseMove(move, idx) ? 'disabled' : ''} ${hasAction && selectedMove?.id === move.id ? 'selected' : ''} ${move.currentCooldown > 0 ? 'on-cooldown' : ''}`}
                    data-cd={move.currentCooldown > 0 ? move.currentCooldown : undefined}
                    onClick={(e) => { e.stopPropagation(); if (poke.hp > 0) { if (hasAction) { onRemoveAction(idx); } else { onSkillClick(idx, move); } } }}
                    onMouseEnter={() => onHoverSkill(move, poke.name)}
                    onMouseLeave={onLeaveSkill}
                    title={move.name}
                  >
                    <EnergyIcon type={energyType} size={28} />
                  </div>
                );
              })}
            </div>

            {/* Bottom: name + HP */}
            <div className="slot-bottom">
              <div className="char-nameplate">{poke.name}</div>
              <div className="char-hp-section">
                <div className="char-hp-bar">
                  <div className={`hp-fill ${getHpClass(poke.hp, poke.maxHp)}`} style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }} />
                </div>
                <span className="char-hp-text">{poke.hp}/{poke.maxHp}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
