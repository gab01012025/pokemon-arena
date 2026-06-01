'use client';

import Image from 'next/image';
import { BattlePokemon, GamePhase } from '../types';
import { STATUS_ICONS, TYPE_TO_ENERGY } from '../data';
import { getHpClass } from '../engine';
import EnergyIcon from './EnergyIcon';

interface EnemyColumnProps {
  opponentTeam: BattlePokemon[];
  phase: GamePhase;
  onTargetSelect: (tIdx: number) => void;
  anims?: string[];
}

export default function EnemyColumn({
  opponentTeam,
  phase,
  onTargetSelect,
  anims = [],
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
            className={`character-card enemy enemy-only ${poke.hp <= 0 ? 'fainted' : ''} ${phase === 'targeting' && poke.hp > 0 ? 'targetable' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''} ${anims[idx] || ''}`}
            onClick={() => phase === 'targeting' && poke.hp > 0 && onTargetSelect(idx)}
          >
            <div className="portrait-container enemy-portrait">
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
                <Image src={poke.sprite} alt={poke.name} width={96} height={96} unoptimized />
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
