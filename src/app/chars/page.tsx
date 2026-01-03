import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PokemonImage } from '@/components/PokemonImage';

// Função para obter cor baseada no tipo
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Fire: '#F08030',
    Water: '#6890F0',
    Grass: '#78C850',
    Electric: '#F8D030',
    Psychic: '#F85888',
    Fighting: '#C03028',
    Dark: '#705848',
    Dragon: '#7038F8',
    Normal: '#A8A878',
    Ghost: '#705898',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Ice: '#98D8D8',
    Rock: '#B8A038',
    Steel: '#B8B8D0',
    Fairy: '#EE99AC',
    Bug: '#A8B820',
  };
  return colors[type] || '#888888';
}

// Mapeamento de imagens de Pokemon (extensões corretas)
function getPokemonImage(name: string): string {
  const imageMap: Record<string, string> = {
    'pikachu': '/images/pokemon/pikachu.jpg',
    'charizard': '/images/pokemon/charizard.webp',
    'blastoise': '/images/pokemon/blastoise.jpg',
    'venusaur': '/images/pokemon/venusaur.webp',
    'gengar': '/images/pokemon/gengar.jpeg',
    'machamp': '/images/pokemon/machamp.jpeg',
    'mewtwo': '/images/pokemon/mewtwo.png',
    'dragonite': '/images/pokemon/Dragonite.webp',
    'alakazam': '/images/pokemon/alakazam.webp',
    'arcanine': '/images/pokemon/arcanine.webp',
    'garchomp': '/images/pokemon/garchomp.webp',
    'lucario': '/images/pokemon/lucario.webp',
    'tyranitar': '/images/pokemon/tyranitar.webp',
    'lapras': '/images/pokemon/lapras.jpeg',
    'scizor': '/images/pokemon/scizor.jpeg',
    'jolteon': '/images/pokemon/jolteon.webp',
    'vaporeon': '/images/pokemon/vaporeon.webp',
    'nidoking': '/images/pokemon/nidoking.webp',
    'golem': '/images/pokemon/golem.webp',
    'exeggutor': '/images/pokemon/exeggutor.png',
    'snorlax': '/images/pokemon/snrolax.webp',
  };
  return imageMap[name.toLowerCase()] || '/images/pokemon-pikachu.jpg';
}

async function getPokemon() {
  const pokemon = await prisma.pokemon.findMany({
    include: {
      moves: {
        orderBy: { slot: 'asc' }
      }
    },
    orderBy: [
      { isStarter: 'desc' },
      { category: 'asc' },
      { name: 'asc' }
    ]
  });
  return pokemon;
}

export default async function CharsPage() {
  const pokemon = await getPokemon();

  // Agrupar por categoria
  const starters = pokemon.filter(p => p.isStarter);
  const legendaries = pokemon.filter(p => p.category === 'Legendary');
  const rare = pokemon.filter(p => p.category === 'Rare');

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <Link href="/chars" className="nav-btn-top" style={{background: '#DC0A2D', color: 'white'}}>Characters</Link>
            </div>
          </div>
          <div className="header-banner">
            <h1>⚡ POKEMON ARENA ⚡</h1>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <main className="center-content" style={{ gridColumn: '1 / -1' }}>
          <h1 className="page-title">Pokemon Characters</h1>
          <p className="page-subtitle">Choose your fighters! Build a team of 3 Pokemon.</p>

          {/* Starter Pokemon */}
          <section className="chars-section">
            <h2 className="section-header">
              <span>⭐ Starter Pokemon</span>
              <span className="section-count">{starters.length} available</span>
            </h2>
            <div className="chars-grid">
              {starters.map((p) => {
                const types = JSON.parse(p.types) as string[];
                const traits = JSON.parse(p.traits) as string[];
                
                return (
                  <div key={p.id} className="char-card">
                    <div className="char-header" style={{ background: getTypeColor(types[0]) }}>
                      <h3 className="char-name">{p.name}</h3>
                      <div className="char-types">
                        {types.map((type: string) => (
                          <span key={type} className="type-badge" style={{ background: getTypeColor(type) }}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="char-body">
                      <div className="char-avatar">
                        <PokemonImage 
                          src={getPokemonImage(p.name)} 
                          alt={p.name} 
                        />
                      </div>
                      <p className="char-desc">{p.description}</p>
                      <div className="char-stats">
                        <div className="stat">
                          <span className="stat-label">HP</span>
                          <span className="stat-value">{p.health}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Category</span>
                          <span className="stat-value">{p.category}</span>
                        </div>
                      </div>
                      <div className="char-traits">
                        {traits.map((trait: string) => (
                          <span key={trait} className="trait-badge">{trait}</span>
                        ))}
                      </div>
                      <div className="char-moves">
                        <h4>Moves:</h4>
                        {p.moves.map((move) => {
                          const moveClasses = JSON.parse(move.classes) as string[];
                          return (
                            <div key={move.id} className="move-item">
                              <span className="move-name">{move.name}</span>
                              <span className="move-damage">{move.damage > 0 ? `${move.damage} DMG` : ''}</span>
                              <div className="move-classes">
                                {moveClasses.slice(0, 2).map((cls: string) => (
                                  <span key={cls} className="class-badge">{cls}</span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="char-footer">
                      <span className="unlock-status unlocked">✓ Available</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Legendary Pokemon */}
          {legendaries.length > 0 && (
            <section className="chars-section">
              <h2 className="section-header legendary">
                <span>🌟 Legendary Pokemon</span>
                <span className="section-count">{legendaries.length} available</span>
              </h2>
              <div className="chars-grid">
                {legendaries.map((p) => {
                  const types = JSON.parse(p.types) as string[];
                  const traits = JSON.parse(p.traits) as string[];
                  
                  return (
                    <div key={p.id} className="char-card legendary-card">
                      <div className="char-header" style={{ background: `linear-gradient(135deg, ${getTypeColor(types[0])} 0%, #7038F8 100%)` }}>
                        <h3 className="char-name">{p.name}</h3>
                        <div className="char-types">
                          {types.map((type: string) => (
                            <span key={type} className="type-badge" style={{ background: getTypeColor(type) }}>
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="char-body">
                        <div className="char-avatar">
                          <PokemonImage 
                            src={getPokemonImage(p.name)}
                            alt={p.name}
                            fallback="/images/pokemon-poster.jpg"
                          />
                        </div>
                        <p className="char-desc">{p.description}</p>
                        <div className="char-stats">
                          <div className="stat">
                            <span className="stat-label">HP</span>
                            <span className="stat-value">{p.health}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Unlock Cost</span>
                            <span className="stat-value">{p.unlockCost} EXP</span>
                          </div>
                        </div>
                        <div className="char-traits">
                          {traits.map((trait: string) => (
                            <span key={trait} className="trait-badge">{trait}</span>
                          ))}
                        </div>
                        <div className="char-moves">
                          <h4>Moves:</h4>
                          {p.moves.map((move) => {
                            const moveClasses = JSON.parse(move.classes) as string[];
                            return (
                              <div key={move.id} className="move-item">
                                <span className="move-name">{move.name}</span>
                                <span className="move-damage">{move.damage > 0 ? `${move.damage} DMG` : ''}</span>
                                <div className="move-classes">
                                  {moveClasses.slice(0, 2).map((cls: string) => (
                                    <span key={cls} className="class-badge">{cls}</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="char-footer">
                        <span className="unlock-status locked">🔒 Complete mission to unlock</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Rare Pokemon */}
          {rare.length > 0 && (
            <section className="chars-section">
              <h2 className="section-header rare">
                <span>💎 Rare Pokemon</span>
                <span className="section-count">{rare.length} available</span>
              </h2>
              <div className="chars-grid">
                {rare.map((p) => {
                  const types = JSON.parse(p.types) as string[];
                  const traits = JSON.parse(p.traits) as string[];
                  
                  return (
                    <div key={p.id} className="char-card rare-card">
                      <div className="char-header" style={{ background: getTypeColor(types[0]) }}>
                        <h3 className="char-name">{p.name}</h3>
                        <div className="char-types">
                          {types.map((type: string) => (
                            <span key={type} className="type-badge" style={{ background: getTypeColor(type) }}>
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="char-body">
                        <div className="char-avatar">
                          <PokemonImage 
                            src={getPokemonImage(p.name)} 
                            alt={p.name}
                            fallback="/images/pokemon-group-1.jpg"
                          />
                        </div>
                        <p className="char-desc">{p.description}</p>
                        <div className="char-stats">
                          <div className="stat">
                            <span className="stat-label">HP</span>
                            <span className="stat-value">{p.health}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Unlock Cost</span>
                            <span className="stat-value">{p.unlockCost} EXP</span>
                          </div>
                        </div>
                        <div className="char-traits">
                          {traits.map((trait: string) => (
                            <span key={trait} className="trait-badge">{trait}</span>
                          ))}
                        </div>
                        <div className="char-moves">
                          <h4>Moves:</h4>
                          {p.moves.map((move) => {
                            const moveClasses = JSON.parse(move.classes) as string[];
                            return (
                              <div key={move.id} className="move-item">
                                <span className="move-name">{move.name}</span>
                                <span className="move-damage">{move.damage > 0 ? `${move.damage} DMG` : ''}</span>
                                <div className="move-classes">
                                  {moveClasses.slice(0, 2).map((cls: string) => (
                                    <span key={cls} className="class-badge">{cls}</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="char-footer">
                        <span className="unlock-status locked">🔒 Complete mission to unlock</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
