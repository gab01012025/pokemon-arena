/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface CharacterPageProps {
  params: Promise<{
    character: string;
  }>;
}

interface Move {
  id: string;
  name: string;
  description: string;
  classes: string;
  cost: string;
  cooldown: number;
  damage: number;
  effects: string;
  target: string;
}

const ENERGY_COLORS: Record<string, string> = {
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  electric: '#F7D02C',
  flying: '#A98FF3',
  poison: '#A33EA1',
  ground: '#E2BF65',
  rock: '#B6A136',
  bug: '#A6B91A',
  ghost: '#735797',
  steel: '#B7B7CE',
  psychic: '#F95587',
  ice: '#96D9D6',
  dragon: '#6F35FC',
  dark: '#705746',
  fairy: '#D685AD',
  normal: '#A8A77A',
  fighting: '#C22E28',
  random: '#A8A77A',
  colorless: '#A8A77A',
};

const ENERGY_ICONS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  flying: '🪽',
  poison: '☠️',
  ground: '🌍',
  rock: '🪨',
  bug: '🐛',
  ghost: '👻',
  steel: '⚙️',
  psychic: '🔮',
  ice: '❄️',
  dragon: '🐲',
  dark: '🌑',
  fairy: '✨',
  normal: '⭐',
  fighting: '👊',
  random: '❓',
  colorless: '⚪',
};

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { character } = await params;
  const charName = decodeURIComponent(character).replace(/-/g, ' ');

  // Fetch real character data from database
  const pokemon = await prisma.pokemon.findFirst({
    where: {
      OR: [
        { id: character },
        { name: { equals: charName, mode: 'insensitive' } },
      ],
    },
    include: {
      moves: true,
    },
  });

  if (!pokemon) {
    notFound();
  }

  // Parse types
  let types: string[] = ['Normal'];
  try {
    const parsed = JSON.parse(pokemon.types);
    types = Array.isArray(parsed) ? parsed : [pokemon.types];
  } catch {
    types = pokemon.types ? pokemon.types.split(',') : ['Normal'];
  }

  // Parse cost helper
  const parseCost = (costStr: string): { type: string; amount: number }[] => {
    try {
      const cost = JSON.parse(costStr);
      return Object.entries(cost)
        .filter(([, amount]) => (amount as number) > 0)
        .map(([type, amount]) => ({ type, amount: amount as number }));
    } catch {
      return [{ type: 'random', amount: 1 }];
    }
  };

  // Parse classes helper
  const parseClasses = (classesStr: string): string[] => {
    try {
      const parsed = JSON.parse(classesStr);
      return Array.isArray(parsed) ? parsed : [classesStr];
    } catch {
      return classesStr ? classesStr.split(',') : [];
    }
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
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">{pokemon.name}</h1>

          {/* Character Header */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>{pokemon.name}</h2>
            </div>
            <div className="content-box-body">
              <div className="character-header">
                <div className="character-image">
                  <img 
                    src={`/images/pokemon/${pokemon.name.toLowerCase()}.png`} 
                    alt={pokemon.name}
                  />
                </div>
                <div className="character-info">
                  <p className="character-description">{pokemon.description}</p>
                  
                  <div className="character-types" style={{ marginBottom: '15px' }}>
                    {types.map((type, idx) => (
                      <span 
                        key={idx} 
                        className="type-badge"
                        style={{ 
                          backgroundColor: ENERGY_COLORS[type.toLowerCase()] || '#A8A77A',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          marginRight: '8px',
                          fontWeight: 'bold',
                        }}
                      >
                        {ENERGY_ICONS[type.toLowerCase()] || '⭐'} {type}
                      </span>
                    ))}
                  </div>
                  
                  <div className="character-stats">
                    <div className="char-stat">
                      <span className="char-stat-label">Health:</span>
                      <span className="char-stat-value">{pokemon.health}</span>
                    </div>
                    <div className="char-stat">
                      <span className="char-stat-label">Category:</span>
                      <span className="char-stat-value">{pokemon.category}</span>
                    </div>
                    {pokemon.isStarter && (
                      <div className="char-stat">
                        <span className="char-stat-label">Status:</span>
                        <span className="char-stat-value" style={{ color: '#4CAF50' }}>
                          ✅ Starter (Free)
                        </span>
                      </div>
                    )}
                    {!pokemon.isStarter && pokemon.unlockCost > 0 && (
                      <div className="char-stat">
                        <span className="char-stat-label">Unlock Cost:</span>
                        <span className="char-stat-value" style={{ color: '#ffd700' }}>
                          🪙 {pokemon.unlockCost}
                        </span>
                      </div>
                    )}
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
                {pokemon.moves.map((move: Move, index: number) => {
                  const cost = parseCost(move.cost);
                  const classes = parseClasses(move.classes);
                  
                  return (
                    <div key={move.id} className="skill-card" style={{
                      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                      border: '1px solid #333',
                      borderRadius: '10px',
                      padding: '15px',
                      marginBottom: '15px',
                    }}>
                      <div className="skill-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                      }}>
                        <h3 className="skill-title" style={{ 
                          color: '#ffd700', 
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <span style={{ 
                            background: '#333',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}>
                            {index + 1}
                          </span>
                          {move.name}
                        </h3>
                        <div className="skill-cost" style={{ display: 'flex', gap: '5px' }}>
                          {cost.map((c, i) => (
                            <span
                              key={i}
                              className="energy-cost"
                              style={{ 
                                backgroundColor: ENERGY_COLORS[c.type.toLowerCase()] || '#A8A77A',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                              }}
                              title={`${c.type}: ${c.amount}`}
                            >
                              {ENERGY_ICONS[c.type.toLowerCase()] || '⭐'}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <p className="skill-description" style={{ 
                        color: '#ccc', 
                        marginBottom: '10px',
                        lineHeight: '1.5',
                      }}>
                        {move.description}
                      </p>
                      
                      <div className="skill-meta" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '15px',
                        fontSize: '0.9rem',
                        color: '#888',
                      }}>
                        {move.damage > 0 && (
                          <span style={{ color: '#F44336' }}>
                            💥 Damage: {move.damage}
                          </span>
                        )}
                        <span className="skill-cooldown" style={{ color: move.cooldown > 0 ? '#F44336' : '#4CAF50' }}>
                          ⏱️ Cooldown: {move.cooldown === 0 ? 'None' : `${move.cooldown} turn(s)`}
                        </span>
                        {classes.length > 0 && (
                          <span className="skill-classes">
                            📋 Classes: {classes.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="content-box">
            <div className="content-box-body" style={{ textAlign: 'center' }}>
              <Link href="/characters" className="btn-secondary">← Back to Characters</Link>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
