/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering (no prerender at build time)
export const dynamic = 'force-dynamic';

interface Pokemon {
  id: string;
  name: string;
  types: string;
  category: string;
  isStarter: boolean;
  health: number;
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
};

export default async function CharactersPage() {
  // Fetch all pokemon from database
  const allPokemon = await prisma.pokemon.findMany({
    orderBy: [
      { isStarter: 'desc' },
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  // Group by category
  const categories: Record<string, Pokemon[]> = {};
  
  for (const pokemon of allPokemon) {
    const cat = pokemon.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(pokemon);
  }

  // Sort categories - Starters first
  const sortedCategories = Object.entries(categories).sort(([a], [b]) => {
    if (a === 'Starter') return -1;
    if (b === 'Starter') return 1;
    return a.localeCompare(b);
  });

  const parseType = (types: string): string => {
    try {
      const parsed = JSON.parse(types);
      return Array.isArray(parsed) ? parsed[0] : types;
    } catch {
      return types.split(',')[0] || 'Normal';
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
          <h1 className="page-title">Characters</h1>
            
            <div className="content-section">
              <div className="section-title">All Characters ({allPokemon.length})</div>
              <div className="section-content">
                <p className="characters-intro">
                  Browse all available characters in Pokemon Arena. Click on a character to view their skills and abilities.
                </p>
                
                {sortedCategories.map(([category, pokemonList]) => (
                  <div key={category} className="character-category-section">
                    <h3 className="category-header" style={{
                      color: '#ffd700',
                      borderBottom: '2px solid #ffd700',
                      paddingBottom: '10px',
                      marginBottom: '20px',
                      marginTop: '30px',
                    }}>
                      {category === 'Starter' ? '⭐ Starters (Free)' : category} 
                      <span style={{ color: '#888', fontSize: '0.9rem', marginLeft: '10px' }}>
                        ({pokemonList.length})
                      </span>
                    </h3>
                    <div className="characters-list" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '15px',
                    }}>
                      {pokemonList.map((pokemon) => {
                        const primaryType = parseType(pokemon.types);
                        const typeColor = ENERGY_COLORS[primaryType.toLowerCase()] || '#A8A77A';
                        
                        return (
                          <Link 
                            key={pokemon.id} 
                            href={`/chars/${pokemon.name.toLowerCase()}`} 
                            className="character-list-item"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '15px',
                              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                              borderRadius: '10px',
                              border: `2px solid ${typeColor}40`,
                              textDecoration: 'none',
                              transition: 'all 0.3s',
                            }}
                          >
                            <div className="character-avatar" style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              marginBottom: '10px',
                              background: `${typeColor}20`,
                            }}>
                              <img 
                                src={`/images/pokemon/${pokemon.name.toLowerCase()}.png`} 
                                alt={pokemon.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </div>
                            <div className="character-name" style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              marginBottom: '5px',
                            }}>
                              {pokemon.name}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: typeColor,
                              textTransform: 'capitalize',
                            }}>
                              {primaryType}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#888',
                            }}>
                              ❤️ {pokemon.health} HP
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Energy Types */}
            <div className="content-section">
              <div className="section-title">Energy Types</div>
              <div className="section-content">
                <div className="classes-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '15px',
                }}>
                  {Object.entries(ENERGY_COLORS).map(([type, color]) => (
                    <div key={type} className="class-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 15px',
                      background: `${color}20`,
                      borderRadius: '8px',
                      border: `1px solid ${color}40`,
                    }}>
                      <div className="class-icon" style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {type === 'fire' ? '🔥' : 
                         type === 'water' ? '💧' :
                         type === 'grass' ? '🌿' :
                         type === 'electric' ? '⚡' :
                         type === 'psychic' ? '🔮' :
                         type === 'ghost' ? '👻' :
                         type === 'dragon' ? '🐲' :
                         type === 'dark' ? '🌑' :
                         type === 'fairy' ? '✨' :
                         type === 'fighting' ? '👊' :
                         type === 'flying' ? '🪽' :
                         type === 'ice' ? '❄️' :
                         type === 'poison' ? '☠️' : '⭐'}
                      </div>
                      <div className="class-info">
                        <strong style={{ color: color, textTransform: 'capitalize' }}>{type}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
