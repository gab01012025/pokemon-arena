/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

const TCG_ENERGIES = [
  { name: 'Grass', file: 'grass', color: '#78C850' },
  { name: 'Fire', file: 'fire', color: '#F08030' },
  { name: 'Water', file: 'water', color: '#6890F0' },
  { name: 'Lightning', file: 'lightning', color: '#F8D030' },
  { name: 'Psychic', file: 'psychic', color: '#F85888' },
  { name: 'Fighting', file: 'fighting', color: '#C03028' },
  { name: 'Darkness', file: 'darkness', color: '#705848' },
  { name: 'Metal', file: 'metal', color: '#B8B8D0' },
  { name: 'Fairy', file: 'fairy', color: '#EE99AC' },
  { name: 'Colorless', file: 'colorless', color: '#A8A878' },
];

const BATTLE_STEPS = [
  {
    num: '1',
    title: 'Choose Your Team',
    desc: 'Select 3 Pokemon for your team. Each Pokemon has 4 unique moves with energy costs, damage, and special effects.',
    color: '#4CAF50',
    icon: '🎯',
  },
  {
    num: '2',
    title: 'Pick Your Energy',
    desc: 'Choose a TCG energy type. This determines what energy you generate each turn to power your moves.',
    color: '#F8D030',
    icon: '⚡',
  },
  {
    num: '3',
    title: 'Select a Trainer',
    desc: 'Pick a Gym Leader as your trainer. Each one gives a unique passive ability that lasts the entire battle.',
    color: '#FF9800',
    icon: '🏆',
  },
  {
    num: '4',
    title: 'Battle!',
    desc: 'Assign 3 actions per turn — one for each living Pokemon. Both players act simultaneously. Reduce all enemy HP to 0 to win!',
    color: '#e53935',
    icon: '⚔️',
  },
];

export default function TheBasics() {
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
          <div className="breadcrumb" style={{ marginBottom: '12px' }}>
            <Link href="/">Pokemon Arena</Link> &gt; <Link href="/game-manual">Game manual</Link> &gt; <span className="current">The basics</span>
          </div>

          {/* Hero intro */}
          <div style={{
            background: 'linear-gradient(135deg, #0f1428 0%, #1a1040 50%, #0f1428 100%)',
            border: '1px solid #2d2060',
            borderRadius: '12px',
            padding: '24px 20px',
            marginBottom: '16px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, #FFD700, #FF9800, #e53935, #F85888, #7038F8)',
            }} />
            <h1 style={{
              color: '#FFD700',
              fontSize: '22px',
              fontWeight: 800,
              margin: '0 0 8px',
              letterSpacing: '1px',
            }}>
              THE BASICS
            </h1>
            <p style={{
              color: '#a0aec0',
              fontSize: '13px',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Pokemon Arena is a 3v3 turn-based strategy game inspired by the Pokemon TCG energy system.
              Build your team, manage energy, and outsmart your opponent!
            </p>
          </div>

          {/* How to Play - Steps */}
          <div style={{
            background: '#0f1223',
            border: '1px solid #1e2340',
            borderRadius: '12px',
            padding: '18px 16px',
            marginBottom: '16px',
          }}>
            <h2 style={{
              color: '#FFD700',
              fontSize: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 14px',
            }}>
              How to Play
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {BATTLE_STEPS.map(step => (
                <div key={step.num} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  background: '#0a0d1c',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${step.color}`,
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${step.color}18`,
                    border: `1px solid ${step.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: step.color,
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '3px',
                    }}>
                      {step.num}. {step.title}
                    </div>
                    <div style={{
                      color: '#8892b0',
                      fontSize: '11px',
                      lineHeight: 1.5,
                    }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TCG Energy System */}
          <div style={{
            background: '#0f1223',
            border: '1px solid #1e2340',
            borderRadius: '12px',
            padding: '18px 16px',
            marginBottom: '16px',
          }}>
            <h2 style={{
              color: '#FFD700',
              fontSize: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 6px',
            }}>
              Energy Types
            </h2>
            <p style={{
              color: '#8892b0',
              fontSize: '11px',
              lineHeight: 1.5,
              margin: '0 0 14px',
            }}>
              Every move costs energy. The 11 TCG energy types power all Pokemon moves in the game.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '8px',
            }}>
              {TCG_ENERGIES.map(e => (
                <div key={e.name} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 6px',
                  background: '#0a0d1c',
                  borderRadius: '8px',
                  border: `1px solid ${e.color}25`,
                  transition: 'transform 0.15s ease',
                }}>
                  <img
                    src={`/energy/${e.file}.png`}
                    alt={e.name}
                    style={{
                      width: '36px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '3px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                    }}
                  />
                  <span style={{
                    color: e.color,
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {e.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Mechanics */}
          <div style={{
            background: '#0f1223',
            border: '1px solid #1e2340',
            borderRadius: '12px',
            padding: '18px 16px',
            marginBottom: '16px',
          }}>
            <h2 style={{
              color: '#FFD700',
              fontSize: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 14px',
            }}>
              Key Mechanics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                {
                  title: 'STAB Bonus',
                  desc: '1.2x damage when a Pokemon uses a move matching its type.',
                  color: '#4CAF50',
                },
                {
                  title: 'Weakness',
                  desc: '+20 flat damage when hitting a Pokemon weak to your type.',
                  color: '#e53935',
                },
                {
                  title: 'Resistance',
                  desc: '-20 damage when hit by a type you resist.',
                  color: '#6890F0',
                },
                {
                  title: 'Evolution',
                  desc: 'Spend energy mid-battle to evolve and gain HP + stat boosts.',
                  color: '#FF9800',
                },
                {
                  title: 'Status Effects',
                  desc: 'Burn, Poison, Paralyze, Sleep, Freeze and more affect battle.',
                  color: '#F85888',
                },
                {
                  title: 'Battle Items',
                  desc: 'Use Potions, Revives, and boosters from the item bar.',
                  color: '#B8B8D0',
                },
              ].map(m => (
                <div key={m.title} style={{
                  padding: '10px 12px',
                  background: '#0a0d1c',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${m.color}`,
                }}>
                  <div style={{ color: m.color, fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>
                    {m.title}
                  </div>
                  <div style={{ color: '#8892b0', fontSize: '10px', lineHeight: 1.4 }}>
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Type Mapping quick reference */}
          <div style={{
            background: '#0f1223',
            border: '1px solid #1e2340',
            borderRadius: '12px',
            padding: '18px 16px',
            marginBottom: '16px',
          }}>
            <h2 style={{
              color: '#FFD700',
              fontSize: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 6px',
            }}>
              Type → Energy Mapping
            </h2>
            <p style={{
              color: '#8892b0',
              fontSize: '11px',
              lineHeight: 1.5,
              margin: '0 0 12px',
            }}>
              Pokemon types map to TCG energy types for move costs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
              {[
                { from: 'Fire', to: 'Fire', color: '#F08030' },
                { from: 'Water / Ice', to: 'Water', color: '#6890F0' },
                { from: 'Grass / Bug', to: 'Grass', color: '#78C850' },
                { from: 'Electric', to: 'Lightning', color: '#F8D030' },
                { from: 'Psychic / Ghost / Poison', to: 'Psychic', color: '#F85888' },
                { from: 'Fighting / Ground / Rock', to: 'Fighting', color: '#C03028' },
                { from: 'Dark', to: 'Darkness', color: '#705848' },
                { from: 'Steel', to: 'Metal', color: '#B8B8D0' },
                { from: 'Fairy', to: 'Fairy', color: '#EE99AC' },
                { from: 'Normal / Flying / Dragon', to: 'Colorless', color: '#A8A878' },
              ].map(m => (
                <div key={m.from} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 8px',
                  background: '#0a0d1c',
                  borderRadius: '4px',
                }}>
                  <span style={{ color: '#aaa', flex: 1 }}>{m.from}</span>
                  <span style={{ color: '#555' }}>→</span>
                  <span style={{ color: m.color, fontWeight: 700 }}>{m.to}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <Link href="/game-manual" style={{
              flex: 1,
              display: 'block',
              padding: '12px 14px',
              background: '#0f1223',
              border: '1px solid #FFD70040',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
            }}>
              Full Game Manual →
            </Link>
            <Link href="/play" style={{
              flex: 1,
              display: 'block',
              padding: '12px 14px',
              background: 'linear-gradient(135deg, #1a3a1a, #0f1223)',
              border: '1px solid #4CAF5040',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#4CAF50',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
            }}>
              Start Playing →
            </Link>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
