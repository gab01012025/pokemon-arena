'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

type Section = 'battle' | 'energy' | 'types' | 'status' | 'evolution' | 'items' | 'trainers';

const SECTIONS: { id: Section; title: string }[] = [
  { id: 'battle', title: 'Battle System' },
  { id: 'energy', title: 'Energy System' },
  { id: 'types', title: 'Type Chart' },
  { id: 'status', title: 'Status Effects' },
  { id: 'evolution', title: 'Evolution' },
  { id: 'items', title: 'Battle Items' },
  { id: 'trainers', title: 'Trainers' },
];

const ENERGY_TYPES = [
  { name: 'Grass', color: '#78C850' },
  { name: 'Fire', color: '#F08030' },
  { name: 'Water', color: '#6890F0' },
  { name: 'Lightning', color: '#F8D030' },
  { name: 'Psychic', color: '#F85888' },
  { name: 'Fighting', color: '#C03028' },
  { name: 'Darkness', color: '#705848' },
  { name: 'Metal', color: '#B8B8D0' },
  { name: 'Colorless', color: '#C0C0B8' },
];

const TYPE_CHART: { type: string; weakness: string; resistance: string }[] = [
  { type: 'Fire', weakness: 'Water', resistance: '-' },
  { type: 'Water', weakness: 'Electric', resistance: '-' },
  { type: 'Grass', weakness: 'Fire', resistance: '-' },
  { type: 'Electric', weakness: 'Fighting', resistance: '-' },
  { type: 'Psychic', weakness: 'Dark', resistance: '-' },
  { type: 'Fighting', weakness: 'Psychic', resistance: '-' },
  { type: 'Dark', weakness: 'Fighting', resistance: '-' },
  { type: 'Steel', weakness: 'Fire', resistance: 'Grass' },
  { type: 'Dragon', weakness: 'Dragon', resistance: 'Fire' },
  { type: 'Normal', weakness: 'Fighting', resistance: '-' },
  { type: 'Flying', weakness: 'Electric', resistance: 'Fighting' },
  { type: 'Rock', weakness: 'Water', resistance: 'Fire' },
  { type: 'Ground', weakness: 'Water', resistance: 'Electric' },
  { type: 'Ice', weakness: 'Fire', resistance: 'Ice' },
  { type: 'Poison', weakness: 'Psychic', resistance: 'Fighting' },
  { type: 'Bug', weakness: 'Fire', resistance: 'Fighting' },
  { type: 'Ghost', weakness: 'Dark', resistance: 'Normal' },
  { type: 'Fairy', weakness: 'Steel', resistance: 'Dark' },
];

const STATUS_EFFECTS: { name: string; desc: string; color: string }[] = [
  { name: 'Burn', desc: 'Deals fire damage each turn. Reduces attack power.', color: '#F08030' },
  { name: 'Poison', desc: 'Deals poison damage each turn. Stacks with burn.', color: '#A040A0' },
  { name: 'Paralyze', desc: 'May prevent the Pokemon from acting this turn.', color: '#F8D030' },
  { name: 'Sleep', desc: 'Pokemon cannot act. Wears off after a few turns.', color: '#9090FF' },
  { name: 'Freeze', desc: 'Pokemon is frozen and cannot act. May thaw.', color: '#98D8D8' },
  { name: 'Confuse', desc: 'Pokemon may hurt itself instead of attacking.', color: '#F85888' },
  { name: 'Stun', desc: 'Pokemon skips its next turn.', color: '#FFD700' },
  { name: 'Silence', desc: 'Pokemon cannot use moves for the duration.', color: '#888888' },
  { name: 'Taunt', desc: 'Forced to use attack moves only.', color: '#C03028' },
  { name: 'Reflect', desc: 'Reduces incoming damage by a percentage.', color: '#6890F0' },
  { name: 'Counter', desc: 'Reflects a portion of damage back to the attacker.', color: '#C03028' },
  { name: 'Invulnerable', desc: 'Cannot be damaged or targeted for the duration.', color: '#FFD700' },
  { name: 'Weaken', desc: 'Reduces the target\'s damage output.', color: '#705848' },
  { name: 'Drain HP', desc: 'Drains HP from the target each turn.', color: '#78C850' },
  { name: 'Heal Over Time', desc: 'Restores HP each turn for the duration.', color: '#4CAF50' },
  { name: 'Remove Energy', desc: 'Removes energy from the target player.', color: '#e53935' },
  { name: 'Steal Energy', desc: 'Steals energy from the opponent.', color: '#FF9800' },
  { name: 'Cooldown Increase', desc: 'Increases the target\'s move cooldowns.', color: '#888' },
  { name: 'Cooldown Reduce', desc: 'Reduces your own move cooldowns.', color: '#4CAF50' },
  { name: 'Cannot Be Healed', desc: 'Prevents all healing for the duration.', color: '#e53935' },
];

const TRAINERS = [
  { name: 'Brock', passive: 'Sturdy Defense', desc: 'Rock/Ground Pokemon take 15 less damage.' },
  { name: 'Misty', passive: 'Tidal Surge', desc: '+1 Water energy every 2 turns. Water moves deal +10% damage.' },
  { name: 'Lt. Surge', passive: 'Lightning Rod', desc: '+1 Electric energy every 2 turns. Electric Pokemon immune to Paralyze.' },
  { name: 'Erika', passive: 'Natural Cure', desc: 'Grass Pokemon heal 10 HP each turn. Grass Pokemon immune to Poison.' },
  { name: 'Sabrina', passive: 'Mind Reader', desc: '+1 Psychic energy every 2 turns. See enemy moves on hover.' },
  { name: 'Koga', passive: 'Toxic Trap', desc: '15% chance to poison attacker. Poison Pokemon deal +10% damage.' },
  { name: 'Blaine', passive: 'Eruption', desc: '+1 Fire energy every 2 turns. Fire moves have +10% crit chance.' },
  { name: 'Giovanni', passive: 'Intimidate', desc: 'All enemies take +5 damage. Ground Pokemon take 10 less damage.' },
];

const ITEMS = [
  { name: 'Potion', desc: 'Restores 30 HP to one Pokemon.' },
  { name: 'Super Potion', desc: 'Restores 60 HP to one Pokemon.' },
  { name: 'Hyper Potion', desc: 'Restores 120 HP to one Pokemon.' },
  { name: 'Max Potion', desc: 'Fully restores HP of one Pokemon.' },
  { name: 'Full Restore', desc: 'Fully restores HP and cures all status conditions.' },
  { name: 'Full Heal', desc: 'Cures all status conditions of one Pokemon.' },
  { name: 'Revive', desc: 'Revives a fainted Pokemon with 50% HP.' },
  { name: 'Max Revive', desc: 'Revives a fainted Pokemon with full HP.' },
  { name: 'X Attack', desc: 'Boosts attack stat for the next turn.' },
  { name: 'X Defense', desc: 'Boosts defense stat for the next turn.' },
  { name: 'X Speed', desc: 'Boosts speed stat for the next turn.' },
  { name: 'Rare Candy', desc: 'Boosts all stats slightly.' },
  { name: 'Poke Doll', desc: 'Protects one Pokemon from the next attack.' },
];

export default function GameManual() {
  const [activeSection, setActiveSection] = useState<Section>('battle');

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">Game Manual</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; <span className="current">Game Manual</span>
          </div>

          <div className="section-content">
            <p>Everything you need to know about Pokemon Arena. Select a topic below to learn about game mechanics, strategies, and systems.</p>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '20px' }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeSection === s.id ? '#FFD700' : '#1e2340',
                  background: activeSection === s.id ? '#1e1808' : '#0f1223',
                  color: activeSection === s.id ? '#FFD700' : '#aaa',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* ===== BATTLE SYSTEM ===== */}
          {activeSection === 'battle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
                <h3 style={{ color: '#FFD700', marginBottom: '12px', fontSize: '16px', fontWeight: 800 }}>3v3 Turn-Based Battles</h3>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6, marginBottom: '8px' }}>
                  Pokemon Arena features 3v3 turn-based battles. Each player selects a team of 3 Pokemon and battles against an AI opponent or another player.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #4CAF50' }}>
                    <strong style={{ color: '#4CAF50', fontSize: '12px' }}>1. Energy Selection</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>Choose your energy type at the start. This determines which energy you generate each turn.</p>
                  </div>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #FF9800' }}>
                    <strong style={{ color: '#FF9800', fontSize: '12px' }}>2. Trainer Selection</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>Choose a Gym Leader as your trainer. Each provides a unique passive ability.</p>
                  </div>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #6890F0' }}>
                    <strong style={{ color: '#6890F0', fontSize: '12px' }}>3. Battle Phase</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>Each turn, assign 3 actions across your Pokemon. Select a move for each, then execute. The opponent does the same.</p>
                  </div>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #e53935' }}>
                    <strong style={{ color: '#e53935', fontSize: '12px' }}>4. Victory Condition</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>The first player to knock out all 3 of the opponent&apos;s Pokemon wins the battle.</p>
                  </div>
                </div>
              </div>

              <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
                <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '14px', fontWeight: 800 }}>Actions Per Turn</h3>
                <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6 }}>
                  You must assign exactly 3 actions each turn. Each living Pokemon can be assigned one action. Click a skill icon on your Pokemon to assign it, or use items from the bottom bar. Actions execute simultaneously - both players&apos; actions resolve at the same time.
                </p>
              </div>

              <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
                <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '14px', fontWeight: 800 }}>Damage Formula</h3>
                <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6 }}>
                  Damage is calculated based on the move&apos;s base power, the attacker&apos;s stats, and the defender&apos;s stats. STAB (Same Type Attack Bonus) provides a 1.2x multiplier when a Pokemon uses a move of its own type. Weakness adds +20 flat damage, and resistance reduces damage by 20.
                </p>
              </div>
            </div>
          )}

          {/* ===== ENERGY SYSTEM ===== */}
          {activeSection === 'energy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
                <h3 style={{ color: '#FFD700', marginBottom: '12px', fontSize: '16px', fontWeight: 800 }}>TCG Energy System</h3>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>
                  Pokemon Arena uses a TCG (Trading Card Game) energy system. Each move costs energy to use. You generate energy of your chosen type each turn, plus colorless energy.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                  {ENERGY_TYPES.map(e => (
                    <div key={e.name} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', background: '#0a0d1c', borderRadius: '6px',
                      borderLeft: `3px solid ${e.color}`,
                    }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                      <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{e.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
                <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '14px', fontWeight: 800 }}>Energy Generation</h3>
                <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6 }}>
                  Each turn you receive energy of your selected type. Colorless energy is universal and can substitute for any type when paying move costs. Some trainer passives grant additional energy of specific types.
                </p>
              </div>

              <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
                <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '14px', fontWeight: 800 }}>Type Mapping</h3>
                <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6, marginBottom: '8px' }}>
                  Pokemon types map to energy types for move costs:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
                  {[
                    ['Fire → Fire', 'Water → Water'],
                    ['Grass → Grass', 'Electric → Lightning'],
                    ['Psychic/Fairy → Psychic', 'Fighting/Rock/Ground → Fighting'],
                    ['Dark/Poison → Darkness', 'Steel → Metal'],
                    ['Normal/Flying/Dragon → Colorless', 'Ghost → Psychic'],
                    ['Bug → Grass', 'Ice → Water'],
                  ].map((row, i) => row.map((item, j) => (
                    <div key={`${i}-${j}`} style={{ padding: '4px 8px', background: '#0a0d1c', borderRadius: '4px', color: '#aaa' }}>
                      {item}
                    </div>
                  )))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TYPE CHART ===== */}
          {activeSection === 'types' && (
            <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
              <h3 style={{ color: '#FFD700', marginBottom: '12px', fontSize: '16px', fontWeight: 800 }}>Type Weakness / Resistance Chart</h3>
              <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                Based on Pokemon TCG Pocket rules. Weakness adds +20 flat damage, resistance reduces damage by 20. Each Pokemon uses its primary type for weakness/resistance.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '100px 100px 100px',
                  fontSize: '10px', fontWeight: 700, color: '#888', padding: '6px 10px',
                  borderBottom: '1px solid #1e2340', letterSpacing: '0.5px',
                }}>
                  <span>TYPE</span>
                  <span style={{ color: '#e53935' }}>WEAKNESS (+20)</span>
                  <span style={{ color: '#6890F0' }}>RESISTANCE (-20)</span>
                </div>
                {TYPE_CHART.map(row => (
                  <div key={row.type} style={{
                    display: 'grid', gridTemplateColumns: '100px 100px 100px',
                    padding: '6px 10px', borderBottom: '1px solid #0a0d1c',
                    fontSize: '12px', alignItems: 'center',
                  }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{row.type}</span>
                    <span style={{ color: '#e53935' }}>{row.weakness}</span>
                    <span style={{ color: row.resistance !== '-' ? '#6890F0' : '#444' }}>{row.resistance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== STATUS EFFECTS ===== */}
          {activeSection === 'status' && (
            <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
              <h3 style={{ color: '#FFD700', marginBottom: '12px', fontSize: '16px', fontWeight: 800 }}>Status Effects</h3>
              <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                Moves can apply status effects to Pokemon. Effects have a duration and may stack. Some trainer passives grant immunity to certain statuses.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {STATUS_EFFECTS.map(s => (
                  <div key={s.name} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', background: '#0a0d1c', borderRadius: '4px',
                    borderLeft: `3px solid ${s.color}`,
                  }}>
                    <span style={{ color: s.color, fontWeight: 700, fontSize: '12px', minWidth: '120px' }}>{s.name}</span>
                    <span style={{ color: '#aaa', fontSize: '11px' }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== EVOLUTION ===== */}
          {activeSection === 'evolution' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
                <h3 style={{ color: '#FFD700', marginBottom: '12px', fontSize: '16px', fontWeight: 800 }}>Evolution System</h3>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>
                  Some Pokemon can evolve during battle. Evolution permanently increases HP and stats for the remainder of the battle.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #FFD700' }}>
                    <strong style={{ color: '#FFD700', fontSize: '12px' }}>Energy Cost</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>Evolution requires spending energy. The cost varies by Pokemon (usually 2-3 energy of the Pokemon&apos;s type).</p>
                  </div>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #4CAF50' }}>
                    <strong style={{ color: '#4CAF50', fontSize: '12px' }}>HP Bonus</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>Evolved Pokemon gain bonus HP (30-110 depending on the evolution line). This increases both current and max HP.</p>
                  </div>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #6890F0' }}>
                    <strong style={{ color: '#6890F0', fontSize: '12px' }}>Stat Boost</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>All stats (Attack, Defense, Sp. Atk, Sp. Def, Speed) increase by the evolution&apos;s stat bonus (10-25 points).</p>
                  </div>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #F85888' }}>
                    <strong style={{ color: '#F85888', fontSize: '12px' }}>Multi-Stage Evolution</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>Some Pokemon can evolve twice (e.g., Charmander → Charmeleon → Charizard). Each stage requires additional energy.</p>
                  </div>
                  <div style={{ padding: '10px', background: '#0a0d1c', borderRadius: '6px', borderLeft: '3px solid #FF9800' }}>
                    <strong style={{ color: '#FF9800', fontSize: '12px' }}>Branch Evolution</strong>
                    <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>Eevee has branch evolution - choose between Vaporeon (Water), Jolteon (Electric), or Flareon (Fire).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== ITEMS ===== */}
          {activeSection === 'items' && (
            <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
              <h3 style={{ color: '#FFD700', marginBottom: '12px', fontSize: '16px', fontWeight: 800 }}>Battle Items</h3>
              <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                Items can be used during battle from the bottom bar. Each item has limited uses. Items use one of your 3 actions per turn.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {ITEMS.map(item => (
                  <div key={item.name} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', background: '#0a0d1c', borderRadius: '4px',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name.toLowerCase().replace(/ /g, '-')}.png`}
                      alt={item.name}
                      width={24}
                      height={24}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '12px', minWidth: '100px' }}>{item.name}</span>
                    <span style={{ color: '#aaa', fontSize: '11px' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TRAINERS ===== */}
          {activeSection === 'trainers' && (
            <div style={{ background: '#0f1223', padding: '16px', borderRadius: '8px', border: '1px solid #1e2340' }}>
              <h3 style={{ color: '#FFD700', marginBottom: '12px', fontSize: '16px', fontWeight: 800 }}>Gym Leader Trainers</h3>
              <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                Choose a Kanto Gym Leader as your trainer before each battle. Each trainer provides a unique passive ability that lasts the entire battle.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {TRAINERS.map(t => (
                  <div key={t.name} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', background: '#0a0d1c', borderRadius: '6px',
                    borderLeft: '3px solid #FFD700',
                  }}>
                    <div style={{ minWidth: '80px' }}>
                      <div style={{ color: '#FFD700', fontWeight: 700, fontSize: '13px' }}>{t.name}</div>
                      <div style={{ color: '#6890F0', fontSize: '10px', fontWeight: 600 }}>{t.passive}</div>
                    </div>
                    <div style={{ color: '#aaa', fontSize: '11px', lineHeight: 1.4 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
