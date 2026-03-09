'use client';

import Image from 'next/image';
import { BattleItem, Move, GamePhase, EvolutionOption } from '../types';
import { getSpriteById } from '../data';
import EnergyIcon from './EnergyIcon';

interface EvolveChoiceData {
  idx: number;
  name: string;
  sprite: string;
  options: (EvolutionOption & { affordable: boolean })[];
}

interface BattleOverlaysProps {
  phase: GamePhase;
  showItems: boolean;
  setShowItems: (show: boolean) => void;
  items: BattleItem[];
  onUseItem: (item: BattleItem) => void;
  usedItemThisTurn: boolean;
  selectingMove: Move | null;
  usingItem: BattleItem | null;
  onCancelTarget: () => void;
  evolvingPokemon: { idx: number; from: string; to: string; fromId: number; toId: number } | null;
  evolveChoice: EvolveChoiceData | null;
  onEvolveChoice: (option: EvolutionOption) => void;
  onCancelEvolveChoice: () => void;
  playerName: string;
  opponentLevel: number;
  battleStats: { wins: number; losses: number; totalXP: number };
  battleTracker: {
    totalDamageDealt: number;
    totalDamageReceived: number;
    movesUsed: number;
    statusApplied: number;
    pokemonFainted: number;
    turnsPlayed: number;
    criticalHits: number;
    superEffectiveHits: number;
    pokemonDamage: Record<string, number>;
  };
  winStreak: number;
  onRematch: () => void;
  onChangeTeam: () => void;
}

const ITEM_CATEGORIES: { key: BattleItem['category']; label: string }[] = [
  { key: 'healing', label: '💚 HEALING' },
  { key: 'status', label: '🟣 STATUS' },
  { key: 'revive', label: '✨ REVIVE' },
  { key: 'boost', label: '⬆️ BOOST' },
  { key: 'energy', label: '⚡ ENERGY' },
  { key: 'special', label: '⭐ SPECIAL' },
];

export default function BattleOverlays({
  phase,
  showItems,
  setShowItems,
  items,
  onUseItem,
  usedItemThisTurn,
  selectingMove,
  usingItem,
  onCancelTarget,
  evolvingPokemon,
  evolveChoice,
  onEvolveChoice,
  onCancelEvolveChoice,
  playerName,
  opponentLevel,
  battleStats,
  battleTracker,
  winStreak,
  onRematch,
  onChangeTeam,
}: BattleOverlaysProps) {
  // Calculate MVP pokemon
  const mvpEntry = Object.entries(battleTracker.pokemonDamage).sort((a, b) => b[1] - a[1])[0];
  const mvpName = mvpEntry ? mvpEntry[0] : '';
  const mvpDamage = mvpEntry ? mvpEntry[1] : 0;

  return (
    <>
      {/* Items Panel */}
      {showItems && (
        <div className="items-panel">
          <div className="items-panel-header">
            <div className="items-panel-title">ITEMS</div>
            {usedItemThisTurn && <div className="items-panel-limit">1 item per turn</div>}
            <button className="close-panel-btn" onClick={() => setShowItems(false)}>✕</button>
          </div>
          <div className="items-panel-scroll">
            {ITEM_CATEGORIES.map(cat => {
              const catItems = items.filter(i => i.category === cat.key);
              if (catItems.length === 0) return null;
              return (
                <div key={cat.key} className="item-category">
                  <div className="item-category-label">{cat.label}</div>
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      className={`item-row ${item.uses <= 0 || usedItemThisTurn ? 'disabled' : ''}`}
                      onClick={() => item.uses > 0 && !usedItemThisTurn && onUseItem(item)}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-desc">{item.description}</div>
                      </div>
                      <span className="item-uses">{item.uses}/{item.maxUses}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Targeting Indicator */}
      {phase === 'targeting' && selectingMove && (
        <div className="targeting-indicator">
          <div className="targeting-text">
            🎯 Click an enemy to target with <strong>{selectingMove.name}</strong>
            <button className="cancel-target-btn" onClick={onCancelTarget}>✕ Cancel</button>
          </div>
        </div>
      )}

      {/* Item Target Indicator */}
      {phase === 'item-target' && usingItem && (
        <div className="item-target-overlay">
          <div className="item-target-text">
            💊 Click a Pokemon to use <strong>{usingItem.name}</strong>
            <button className="cancel-target-btn" onClick={onCancelTarget}>✕ Cancel</button>
          </div>
        </div>
      )}

      {/* Evolution Choice Overlay (Eevee branching) */}
      {evolveChoice && (
        <div className="overlay">
          <div className="modal evolution-choice-modal">
            <h2 className="evolution-choice-title">Evolve {evolveChoice.name} into...</h2>
            <div className="evolution-choice-grid">
              {evolveChoice.options.map(opt => (
                <button
                  key={opt.id}
                  className={`evolution-choice-option ${opt.affordable ? '' : 'disabled'}`}
                  onClick={() => opt.affordable && onEvolveChoice(opt)}
                  disabled={!opt.affordable}
                >
                  <div className="evo-option-sprite">
                    <Image src={getSpriteById(opt.id)} alt={opt.name} width={72} height={72} unoptimized />
                  </div>
                  <div className="evo-option-name">{opt.name}</div>
                  <div className="evo-option-types">
                    {opt.types.map(t => (
                      <span key={t} className="evo-option-type">{t}</span>
                    ))}
                  </div>
                  <div className="evo-option-cost">
                    {opt.energyCost.map((c, ci) => (
                      <span key={ci} className="evo-cost-item" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <EnergyIcon type={c.type} size={16} /> ×{c.amount}
                      </span>
                    ))}
                  </div>
                  {!opt.affordable && <div className="evo-option-locked">Not enough energy</div>}
                </button>
              ))}
            </div>
            <button className="cancel-evolve-btn" onClick={onCancelEvolveChoice}>Cancel</button>
          </div>
        </div>
      )}

      {/* Evolution Animation Overlay */}
      {evolvingPokemon && (
        <div className="evolution-overlay">
          <div className="evolution-text">What? {evolvingPokemon.from} is evolving!</div>
          <div className="evolution-sprites">
            <div className="evolution-sprite">
              <Image src={getSpriteById(evolvingPokemon.fromId)} alt={evolvingPokemon.from} width={96} height={96} unoptimized />
            </div>
            <div className="evolution-arrow">→</div>
            <div className="evolution-sprite">
              <Image src={getSpriteById(evolvingPokemon.toId)} alt={evolvingPokemon.to} width={96} height={96} unoptimized />
            </div>
          </div>
          <div className="evolution-text">{evolvingPokemon.from} evolved into {evolvingPokemon.to}!</div>
        </div>
      )}

      {/* Victory */}
      {phase === 'victory' && (
        <div className="overlay">
          <div className="modal result-modal">
            <div className="result-content victory">
              <h1 className="result-title victory-title">VICTORY!</h1>
              <p className="result-message">{playerName} wins!</p>
              <p className="result-xp">+{battleStats.totalXP > 0 ? Math.floor(50 + opponentLevel * 5) : 0} XP</p>
              {winStreak > 1 && (
                <div className="streak-badge victory-streak">
                  🔥 {winStreak} Win Streak!
                  {winStreak % 3 === 0 && <span className="streak-bonus"> +25% XP!</span>}
                </div>
              )}

              {/* Battle Stats */}
              <div className="battle-stats-panel">
                <div className="stats-title">📊 Battle Stats</div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">⚔️ Damage Dealt</span>
                    <span className="stat-value">{battleTracker.totalDamageDealt}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🛡️ Damage Taken</span>
                    <span className="stat-value">{battleTracker.totalDamageReceived}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🎯 Moves Used</span>
                    <span className="stat-value">{battleTracker.movesUsed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">💫 Status Applied</span>
                    <span className="stat-value">{battleTracker.statusApplied}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">💥 Critical Hits</span>
                    <span className="stat-value">{battleTracker.criticalHits}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">✨ Super Effective</span>
                    <span className="stat-value">{battleTracker.superEffectiveHits}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">💀 KOs Scored</span>
                    <span className="stat-value">{battleTracker.pokemonFainted}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🔄 Turns</span>
                    <span className="stat-value">{battleTracker.turnsPlayed}</span>
                  </div>
                </div>
                {mvpName && (
                  <div className="mvp-banner">
                    <span className="mvp-label">🏆 MVP</span>
                    <span className="mvp-name">{mvpName}</span>
                    <span className="mvp-damage">{mvpDamage} total damage</span>
                  </div>
                )}
              </div>

              <div className="result-buttons">
                <button className="result-btn rematch-btn" onClick={onRematch}>⚔️ QUICK REMATCH</button>
                <button className="result-btn change-team-btn" onClick={onChangeTeam}>🔄 CHANGE TEAM</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Defeat */}
      {phase === 'defeat' && (
        <div className="overlay">
          <div className="modal result-modal">
            <div className="result-content defeat">
              <h1 className="result-title defeat-title">DEFEAT</h1>
              <p className="result-message">{playerName} is out of usable POKéMON!</p>
              {winStreak > 0 && (
                <div className="streak-badge defeat-streak">
                  💀 Lost {winStreak} win streak
                </div>
              )}

              {/* Battle Stats */}
              <div className="battle-stats-panel">
                <div className="stats-title">📊 Battle Stats</div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">⚔️ Damage Dealt</span>
                    <span className="stat-value">{battleTracker.totalDamageDealt}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🛡️ Damage Taken</span>
                    <span className="stat-value">{battleTracker.totalDamageReceived}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🎯 Moves Used</span>
                    <span className="stat-value">{battleTracker.movesUsed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">💀 KOs Scored</span>
                    <span className="stat-value">{battleTracker.pokemonFainted}</span>
                  </div>
                </div>
                {mvpName && (
                  <div className="mvp-banner">
                    <span className="mvp-label">🏆 MVP</span>
                    <span className="mvp-name">{mvpName}</span>
                    <span className="mvp-damage">{mvpDamage} total damage</span>
                  </div>
                )}
              </div>

              <div className="result-buttons">
                <button className="result-btn rematch-btn" onClick={onRematch}>⚔️ TRY AGAIN</button>
                <button className="result-btn change-team-btn" onClick={onChangeTeam}>🔄 CHANGE TEAM</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
