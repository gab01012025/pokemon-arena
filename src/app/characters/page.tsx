/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';
import { getPokemonImageUrl } from '@/lib/pokemon-images';

// Force dynamic rendering (no prerender at build time)
export const dynamic = 'force-dynamic';

interface PokemonMove {
  id: string;
  name: string;
  damage: number;
  description: string;
}

interface Pokemon {
  id: string;
  name: string;
  types: string;
  category: string;
  isStarter: boolean;
  health: number;
  moves: PokemonMove[];
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
  dark: '#705746',
  fairy: '#D685AD',
  normal: '#A8A77A',
  fighting: '#C22E28',
};

// TCG energy card image mapping (type → image file) — all 11 TCG types
const TCG_ENERGY: Record<string, string> = {
  fire: 'fire', water: 'water', grass: 'grass',
  electric: 'lightning', psychic: 'psychic', fighting: 'fighting',
  dark: 'darkness', steel: 'metal', fairy: 'fairy',
  dragon: 'colorless', normal: 'colorless',
};

export default async function CharactersPage() {
  // Fetch all pokemon from database
  const allPokemon = await prisma.pokemon.findMany({
    orderBy: [
      { isStarter: 'desc' },
      { category: 'asc' },
      { name: 'asc' },
    ],
    include: {
      moves: {
        select: { id: true, name: true, damage: true, description: true },
        orderBy: { slot: 'asc' },
      },
    },
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
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px',
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
                              gap: '10px',
                              padding: '10px',
                              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                              borderRadius: '10px',
                              border: `2px solid ${typeColor}40`,
                              textDecoration: 'none',
                              transition: 'all 0.3s',
                              alignItems: 'flex-start',
                            }}
                          >
                            <div style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: `${typeColor}20`,
                            }}>
                              <img
                                src={getPokemonImageUrl(pokemon.name, 'default')}
                                alt={pokemon.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: 'center top',
                                  background: typeColor,
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                marginBottom: '2px',
                              }}>
                                {pokemon.name}
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                              }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: '#fff',
                                  background: typeColor,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  textTransform: 'capitalize',
                                  fontWeight: 600,
                                }}>
                                  {primaryType}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#888' }}>
                                  {pokemon.health} HP
                                </span>
                              </div>
                              {pokemon.moves && pokemon.moves.length > 0 && (
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '1px',
                                }}>
                                  {pokemon.moves.slice(0, 4).map((move, mi) => (
                                    <div key={move.id} style={{
                                      fontSize: '0.65rem',
                                      color: '#aaa',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      gap: '4px',
                                    }}>
                                      <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}>
                                        <span style={{ color: typeColor, fontWeight: 600 }}>{mi + 1}.</span> {move.name}
                                      </span>
                                      {move.damage > 0 && (
                                        <span style={{ color: '#F44336', flexShrink: 0, fontWeight: 600 }}>
                                          {move.damage}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
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
                  {Object.entries(TCG_ENERGY).map(([type, tcgFile]) => {
                    const color = ENERGY_COLORS[type] || '#A8A77A';
                    return (
                      <div key={type} className="class-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 15px',
                        background: `${color}20`,
                        borderRadius: '8px',
                        border: `1px solid ${color}40`,
                      }}>
                        <img
                          src={`/energy/${tcgFile}.png`}
                          alt={type}
                          style={{
                            width: '28px',
                            height: '40px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                            borderRadius: '3px',
                          }}
                        />
                        <div className="class-info">
                          <strong style={{ color: color, textTransform: 'capitalize' }}>{type}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
