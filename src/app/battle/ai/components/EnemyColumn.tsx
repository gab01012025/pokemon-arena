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
    <div className="arena-column enemy-column">
      {opponentTeam.map((poke, idx) => {
        const hasBurn = poke.statusEffects.some(e => e.type === 'burn');
        const hasPoison = poke.statusEffects.some(e => e.type === 'poison');
        const hasFrozen = poke.statusEffects.some(e => e.type === 'freeze');
        return (
          <div
            key={`e-${poke.id}-${idx}`}
            className={`arena-slot enemy ${poke.hp <= 0 ? 'fainted' : ''} ${phase === 'targeting' && poke.hp > 0 ? 'targetable' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''} ${anims[idx] || ''}`}
            onClick={() => phase === 'targeting' && poke.hp > 0 && onTargetSelect(idx)}
          >
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

            {/* Sprite area */}
            <div className="char-sprite-area">
              <Image src={poke.sprite} alt={poke.name} width={96} height={96} unoptimized className="char-sprite" />
            </div>

            {/* Nameplate */}
            <div className="char-nameplate">{poke.name}</div>

            {/* HP Bar */}
            <div className="char-hp-section">
              <div className="char-hp-bar">
                <div className={`hp-fill ${getHpClass(poke.hp, poke.maxHp)}`} style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }} />
              </div>
              <span className="char-hp-text">{poke.hp}/{poke.maxHp}</span>
            </div>

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
        );
      })}
    </div>
  );
}
