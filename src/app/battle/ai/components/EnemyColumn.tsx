'use client';

import Image from 'next/image';
import { BattlePokemon, GamePhase } from '../types';
import { TYPE_COLORS, MOVE_ABBREV, STATUS_ICONS, TYPE_TO_ENERGY } from '../data';
import { getHpClass } from '../engine';
import EnergyIcon from './EnergyIcon';

interface EnemyColumnProps {
  opponentTeam: BattlePokemon[];
  phase: GamePhase;
  onTargetSelect: (tIdx: number) => void;
}

export default function EnemyColumn({
  opponentTeam,
  phase,
  onTargetSelect,
}: EnemyColumnProps) {
  return (
    <div className="character-column">
      {opponentTeam.map((poke, idx) => {
        const hasBurn = poke.statusEffects.some(e => e.type === 'burn');
        const hasPoison = poke.statusEffects.some(e => e.type === 'poison');
        const hasFrozen = poke.statusEffects.some(e => e.type === 'freeze');
        return (
          <div
            key={`e-${poke.id}-${idx}`}
            className={`character-card enemy ${poke.hp <= 0 ? 'fainted' : ''} ${phase === 'targeting' && poke.hp > 0 ? 'targetable' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''}`}
            onClick={() => phase === 'targeting' && poke.hp > 0 && onTargetSelect(idx)}
          >
            <div className="skills-panel">
              {poke.moves.slice(0, 4).map(move => {
                const colors = TYPE_COLORS[move.type] || TYPE_COLORS.normal;
                const displayName = move.name.length > 10 ? (MOVE_ABBREV[move.name] || move.name.substring(0, 8)) : move.name;
                return (
                  <div key={move.id} className="skill-slot disabled" style={{ background: colors.bg, borderColor: colors.border }}>
                    <span className="skill-abbrev" style={{ color: colors.text }}>{displayName}</span>
                  </div>
                );
              })}
            </div>
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
              <div className="pokemon-sprite">
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
                      <EnergyIcon type={TYPE_TO_ENERGY[poke.weakness]} size={12} /> ×2
                    </span>
                  )}
                  {poke.resistance && (
                    <span className="wr-badge resistance" title={`Resists ${poke.resistance} (-20 dmg)`}>
                      <EnergyIcon type={TYPE_TO_ENERGY[poke.resistance]} size={12} /> -20
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
