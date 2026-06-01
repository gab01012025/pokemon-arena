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
  onViewSkills: (poke: BattlePokemon) => void;
  anims?: string[];
}

export default function EnemyColumn({
  opponentTeam,
  phase,
  onTargetSelect,
  onViewSkills,
  anims = [],
}: EnemyColumnProps) {
  return (
    <div className="arena-column enemy-column">
      {opponentTeam.map((poke, idx) => {
        const hasBurn = poke.statusEffects.some(e => e.type === 'burn');
        const hasPoison = poke.statusEffects.some(e => e.type === 'poison');
        const hasFrozen = poke.statusEffects.some(e => e.type === 'freeze');
        const evoPercent = poke.maxEvoBar > 0 ? Math.min((poke.evoBar / poke.maxEvoBar) * 100, 100) : 0;
        return (
          <div
            key={`e-${poke.id}-${idx}`}
            className={`arena-slot enemy ${poke.hp <= 0 ? 'fainted' : ''} ${phase === 'targeting' && poke.hp > 0 ? 'targetable' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''} ${anims[idx] || ''}`}
            onClick={() => {
              if (phase === 'targeting' && poke.hp > 0) {
                onTargetSelect(idx);
              } else if (poke.hp > 0) {
                onViewSkills(poke);
              }
            }}
            style={{ cursor: poke.hp > 0 ? 'pointer' : 'default' }}
          >
            {/* Portrait */}
            <div className="slot-portrait">
              {poke.statusEffects.length > 0 && (
                <div className="slot-status-icons">
                  {poke.statusEffects.map((se, si) => (
                    <div key={si} className={`status-badge ${se.type}`} title={`${se.type} (${se.duration}t)`}>
                      {STATUS_ICONS[se.type]}
                    </div>
                  ))}
                </div>
              )}
              <Image src={poke.sprite} alt={poke.name} width={96} height={96} unoptimized className="char-sprite" />
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

            {/* Bottom: name + HP + Evo bar */}
            <div className="slot-bottom">
              <div className="char-nameplate">{poke.name}</div>
              <div className="char-hp-section">
                <div className="char-hp-bar">
                  <div className={`hp-fill ${getHpClass(poke.hp, poke.maxHp)}`} style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }} />
                </div>
                <span className="char-hp-text">{poke.hp}/{poke.maxHp}</span>
              </div>
              {poke.hp > 0 && (
                <div className="char-evo-section">
                  <div className="char-evo-bar">
                    <div className={`evo-fill ${evoPercent >= 100 ? 'full' : ''}`} style={{ width: `${evoPercent}%` }} />
                  </div>
                  <span className="char-evo-label">EVO</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
