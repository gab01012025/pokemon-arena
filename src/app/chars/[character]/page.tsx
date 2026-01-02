/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface CharacterPageProps {
  params: Promise<{
    character: string;
  }>;
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { character } = await params;
  const charName = decodeURIComponent(character).replace(/-/g, ' ');

  // Mock character data
  const charData = {
    name: charName,
    image: '/images/ash-ketchum.webp',
    description: 'A powerful Pokemon with exceptional abilities.',
    stats: {
      health: 100,
      wins: 3744,
      winRate: '59.90%',
      matchesPlayed: 6250,
      pickRate: '4.20%',
    },
    skills: [
      {
        name: 'Thunder Shock',
        description: 'Creates electric sparks that deal 15 damage to one enemy and provide 10 destructible defense to the user.',
        cost: [{ type: 'special', amount: 1 }, { type: 'random', amount: 1 }],
        cooldown: 0,
        classes: ['Energy', 'Ranged', 'Instant'],
      },
      {
        name: 'Thunderbolt',
        description: 'Deals 35 piercing damage to one enemy. This skill ignores invulnerability.',
        cost: [{ type: 'special', amount: 2 }, { type: 'physical', amount: 1 }],
        cooldown: 1,
        classes: ['Energy', 'Melee', 'Instant'],
      },
      {
        name: 'Quick Attack',
        description: 'Deals 25 damage to one enemy and stuns their physical and mental skills for 1 turn.',
        cost: [{ type: 'physical', amount: 2 }],
        cooldown: 1,
        classes: ['Physical', 'Melee', 'Instant'],
      },
      {
        name: 'Agility',
        description: 'This character becomes invulnerable for 1 turn.',
        cost: [{ type: 'random', amount: 1 }],
        cooldown: 4,
        classes: ['Status', 'Instant'],
      },
    ],
  };

  const getEnergyColor = (type: string) => {
    const colors: Record<string, string> = {
      physical: '#cc0000',
      special: '#0066cc',
      status: '#9900cc',
      bloodline: '#00cc00',
      random: '#ffffff',
    };
    return colors[type] || '#888888';
  };

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">🎮 DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>⚡ POKEMON ARENA ⚡</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">{charData.name}</h1>

          {/* Character Header */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>{charData.name}</h2>
            </div>
            <div className="content-box-body">
              <div className="character-header">
                <div className="character-image">
                  <img src={charData.image} alt={charData.name} />
                </div>
                <div className="character-info">
                  <p className="character-description">{charData.description}</p>
                  <div className="character-stats">
                    <div className="char-stat">
                      <span className="char-stat-label">Health:</span>
                      <span className="char-stat-value">{charData.stats.health}</span>
                    </div>
                    <div className="char-stat">
                      <span className="char-stat-label">Wins:</span>
                      <span className="char-stat-value">{charData.stats.wins} ({charData.stats.winRate})</span>
                    </div>
                    <div className="char-stat">
                      <span className="char-stat-label">Matches Played:</span>
                      <span className="char-stat-value">{charData.stats.matchesPlayed} ({charData.stats.pickRate})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Skills</h2>
            </div>
            <div className="content-box-body">
              <div className="skills-list">
                {charData.skills.map((skill, index) => (
                  <div key={index} className="skill-card">
                    <div className="skill-header">
                      <h3 className="skill-title">{skill.name}</h3>
                      <div className="skill-cost">
                        {skill.cost.map((c, i) => (
                          <span
                            key={i}
                            className="energy-cost"
                            style={{ backgroundColor: getEnergyColor(c.type) }}
                            title={c.type}
                          >
                            {c.amount}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="skill-description">{skill.description}</p>
                    <div className="skill-meta">
                      <span className="skill-cooldown">
                        Cooldown: {skill.cooldown === 0 ? 'None' : `${skill.cooldown} turn(s)`}
                      </span>
                      <span className="skill-classes">
                        Classes: {skill.classes.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="content-box">
            <div className="content-box-body" style={{ textAlign: 'center' }}>
              <Link href="/game-manual" className="btn-secondary">← Back to Game Manual</Link>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
