'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Move {
  id: string;
  name: string;
  description: string;
  damage: number;
  energyCost: string;
  cooldown: number;
  effect: string | null;
}

interface Pokemon {
  id: string;
  name: string;
  types: string;
  health: number;
  description: string | null;
  moves?: Move[];
}

const TYPE_COLORS: Record<string, string> = {
  electric: '#F7D02C',
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  psychic: '#F95587',
  fighting: '#C22E28',
  ghost: '#735797',
  dragon: '#6F35FC',
  normal: '#A8A77A',
  poison: '#A33EA1',
  ice: '#96D9D6',
  dark: '#705746',
  fairy: '#D685AD',
  steel: '#B7B7CE',
  rock: '#B6A136',
  ground: '#E2BF65',
  flying: '#A98FF3',
  bug: '#A6B91A',
};

const TYPE_ICONS: Record<string, string> = {
  electric: '⚡',
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  psychic: '🔮',
  fighting: '👊',
  ghost: '👻',
  dragon: '🐉',
  normal: '⭐',
  poison: '☠️',
  ice: '❄️',
  dark: '🌙',
  fairy: '✨',
  steel: '⚙️',
  rock: '🪨',
  ground: '🌍',
  flying: '🦅',
  bug: '🐛',
  random: '🎲',
};

const IMAGE_MAP: Record<string, string> = {
  'pikachu': '/images/pokemon/pikachu.jpg',
  'charizard': '/images/pokemon/charizard.webp',
  'blastoise': '/images/pokemon/blastoise.jpg',
  'venusaur': '/images/pokemon/venusaur.webp',
  'gengar': '/images/pokemon/gengar.jpeg',
  'machamp': '/images/pokemon/machamp.jpeg',
  'mewtwo': '/images/pokemon/mewtwo.png',
  'dragonite': '/images/pokemon/Dragonite.webp',
  'alakazam': '/images/pokemon/alakazam.webp',
};

export default function SelectTeamPage() {
  const router = useRouter();
  const [starters, setStarters] = useState<Pokemon[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Pokemon[]>([]);
  const [hoveredPokemon, setHoveredPokemon] = useState<Pokemon | null>(null);
  const [previewPokemon, setPreviewPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStarters() {
      try {
        const res = await fetch('/api/pokemon?starters=true&includeMoves=true');
        if (res.ok) {
          const data = await res.json();
          setStarters(data);
        }
      } catch {
        setError('Falha ao carregar Pokémon');
      } finally {
        setLoading(false);
      }
    }
    fetchStarters();
  }, []);

  const togglePokemon = useCallback((pokemon: Pokemon) => {
    const existingIndex = selectedTeam.findIndex(p => p.id === pokemon.id);
    
    if (existingIndex !== -1) {
      // Remover
      setAnimatingSlot(existingIndex);
      setTimeout(() => {
        setSelectedTeam(prev => prev.filter(p => p.id !== pokemon.id));
        setAnimatingSlot(null);
      }, 200);
    } else if (selectedTeam.length < 3) {
      // Adicionar
      setAnimatingSlot(selectedTeam.length);
      setSelectedTeam(prev => [...prev, pokemon]);
      setTimeout(() => setAnimatingSlot(null), 300);
    }
  }, [selectedTeam]);

  const confirmTeam = async () => {
    if (selectedTeam.length !== 3) {
      setError('Selecione exatamente 3 Pokémon');
      return;
    }

    setShowConfirmation(true);
  };

  const finalConfirm = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/trainer/select-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemonIds: selectedTeam.map(p => p.id),
        }),
      });

      if (res.ok) {
        router.push('/play');
      } else {
        const data = await res.json();
        setError(data.error || 'Falha ao salvar time');
        setShowConfirmation(false);
      }
    } catch {
      setError('Erro de conexão');
      setShowConfirmation(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (types: string) => {
    const firstType = types.split(',')[0]?.toLowerCase() || 'normal';
    return TYPE_COLORS[firstType] || '#777';
  };

  const getImage = (name: string) => {
    return IMAGE_MAP[name.toLowerCase()] || '/images/pokemon/pikachu.jpg';
  };

  const parseEnergyCost = (costStr: string): Record<string, number> => {
    try {
      return JSON.parse(costStr);
    } catch {
      return {};
    }
  };

  const renderEnergyCost = (costStr: string) => {
    const costs = parseEnergyCost(costStr);
    return Object.entries(costs).map(([type, count]) => (
      <span key={type} className="energy-icon" title={`${type}: ${count}`}>
        {Array(count).fill(TYPE_ICONS[type.toLowerCase()] || '⭐').join('')}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="select-team-page-v2">
        <div className="loading-container">
          <div className="loading-pokeball">
            <div className="pokeball-top"></div>
            <div className="pokeball-center"></div>
            <div className="pokeball-bottom"></div>
          </div>
          <p className="loading-text">Carregando Pokémon...</p>
        </div>
      </div>
    );
  }

  const displayPokemon = hoveredPokemon || previewPokemon || (selectedTeam.length > 0 ? selectedTeam[selectedTeam.length - 1] : null);

  return (
    <div className="select-team-page-v2">
      {/* Background Effects */}
      <div className="arena-bg-effects">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="energy-wave"></div>
      </div>

      <div className="select-team-layout">
        {/* Left Panel - Team Slots */}
        <div className="team-panel">
          <div className="panel-header">
            <div className="header-decoration left"></div>
            <h2>SEU TIME</h2>
            <div className="header-decoration right"></div>
          </div>
          
          <div className="team-slots-v2">
            {[0, 1, 2].map(idx => {
              const pokemon = selectedTeam[idx];
              const isAnimating = animatingSlot === idx;
              
              return (
                <div 
                  key={idx}
                  className={`team-slot-v2 ${pokemon ? 'filled' : 'empty'} ${isAnimating ? 'animating' : ''}`}
                  style={pokemon ? { 
                    '--slot-color': getTypeColor(pokemon.types),
                    '--slot-glow': `${getTypeColor(pokemon.types)}66`
                  } as React.CSSProperties : {}}
                  onClick={() => pokemon && togglePokemon(pokemon)}
                  onMouseEnter={() => pokemon && setHoveredPokemon(pokemon)}
                  onMouseLeave={() => setHoveredPokemon(null)}
                >
                  <div className="slot-number">{idx + 1}</div>
                  {pokemon ? (
                    <>
                      <div className="slot-portrait">
                        <img src={getImage(pokemon.name)} alt={pokemon.name} />
                        <div className="slot-glow"></div>
                      </div>
                      <div className="slot-info">
                        <span className="slot-name">{pokemon.name}</span>
                        <div className="slot-types">
                          {pokemon.types.split(',').map((type, i) => (
                            <span key={i} className="mini-type" style={{ backgroundColor: TYPE_COLORS[type.toLowerCase()] }}>
                              {TYPE_ICONS[type.toLowerCase()]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="remove-btn" title="Remover">✕</button>
                    </>
                  ) : (
                    <div className="empty-slot-content">
                      <div className="empty-slot-icon">?</div>
                      <span>Vazio</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="selection-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(selectedTeam.length / 3) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {selectedTeam.length}/3 Selecionados
            </span>
          </div>

          {/* Confirm Button */}
          <button
            className={`confirm-btn-v2 ${selectedTeam.length === 3 ? 'ready pulse' : ''}`}
            onClick={confirmTeam}
            disabled={selectedTeam.length !== 3 || submitting}
          >
            <span className="btn-icon">⚔️</span>
            <span className="btn-text">
              {selectedTeam.length === 3 ? 'CONFIRMAR TIME!' : `Faltam ${3 - selectedTeam.length}`}
            </span>
            <span className="btn-shine"></span>
          </button>

          <Link href="/" className="back-link">
            ← Voltar ao Menu
          </Link>
        </div>

        {/* Center Panel - Pokemon Grid */}
        <div className="pokemon-selection-panel">
          <div className="panel-header">
            <h1>⚡ SELECIONE SEU TIME ⚡</h1>
            <p>Escolha 3 Pokémon para batalhar na Arena!</p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="pokemon-grid-v2">
            {starters.map((pokemon, index) => {
              const isSelected = selectedTeam.find(p => p.id === pokemon.id);
              const typeColor = getTypeColor(pokemon.types);
              const isDisabled = !isSelected && selectedTeam.length >= 3;
              
              return (
                <div
                  key={pokemon.id}
                  className={`pokemon-card-v2 ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  style={{ 
                    '--card-color': typeColor,
                    '--animation-delay': `${index * 0.1}s`
                  } as React.CSSProperties}
                  onClick={() => !isDisabled && togglePokemon(pokemon)}
                  onMouseEnter={() => setPreviewPokemon(pokemon)}
                  onMouseLeave={() => setPreviewPokemon(null)}
                >
                  <div className="card-bg-glow"></div>
                  
                  {/* Selection Order Badge */}
                  {isSelected && (
                    <div className="selection-order">
                      {selectedTeam.findIndex(p => p.id === pokemon.id) + 1}
                    </div>
                  )}

                  <div className="card-portrait">
                    <img src={getImage(pokemon.name)} alt={pokemon.name} />
                    <div className="portrait-overlay"></div>
                  </div>

                  <div className="card-content">
                    <h3 className="pokemon-name">{pokemon.name}</h3>
                    
                    <div className="type-badges">
                      {pokemon.types.split(',').map((type, i) => (
                        <span 
                          key={i} 
                          className="type-badge-v2"
                          style={{ backgroundColor: TYPE_COLORS[type.toLowerCase()] }}
                        >
                          <span className="type-icon">{TYPE_ICONS[type.toLowerCase()]}</span>
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="stat-bar">
                      <span className="stat-label">❤️ HP</span>
                      <div className="stat-fill-container">
                        <div className="stat-fill" style={{ width: `${(pokemon.health / 150) * 100}%` }}></div>
                      </div>
                      <span className="stat-value">{pokemon.health}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="preview-btn" onClick={(e) => {
                      e.stopPropagation();
                      setPreviewPokemon(pokemon);
                    }}>
                      👁️ Ver Skills
                    </button>
                  </div>

                  {isSelected && <div className="selected-overlay">✓ SELECIONADO</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Pokemon Details */}
        <div className="details-panel">
          <div className="panel-header">
            <div className="header-decoration left"></div>
            <h2>DETALHES</h2>
            <div className="header-decoration right"></div>
          </div>

          {displayPokemon ? (
            <div className="pokemon-details-v2" style={{ '--detail-color': getTypeColor(displayPokemon.types) } as React.CSSProperties}>
              <div className="detail-portrait">
                <img src={getImage(displayPokemon.name)} alt={displayPokemon.name} />
                <div className="portrait-ring"></div>
              </div>

              <h3 className="detail-name">{displayPokemon.name}</h3>
              
              <div className="detail-types">
                {displayPokemon.types.split(',').map((type, i) => (
                  <span 
                    key={i} 
                    className="detail-type-badge"
                    style={{ backgroundColor: TYPE_COLORS[type.toLowerCase()] }}
                  >
                    {TYPE_ICONS[type.toLowerCase()]} {type}
                  </span>
                ))}
              </div>

              <div className="detail-stats">
                <div className="detail-stat">
                  <span className="stat-icon">❤️</span>
                  <span className="stat-name">Vida</span>
                  <span className="stat-val">{displayPokemon.health}</span>
                </div>
              </div>

              {displayPokemon.description && (
                <p className="detail-description">{displayPokemon.description}</p>
              )}

              {/* Skills Preview */}
              <div className="skills-preview">
                <h4>⚔️ Habilidades</h4>
                <div className="skills-list">
                  {displayPokemon.moves && displayPokemon.moves.length > 0 ? (
                    displayPokemon.moves.map((move, idx) => (
                      <div key={move.id} className="skill-item">
                        <div className="skill-header">
                          <span className="skill-number">{idx + 1}</span>
                          <span className="skill-name">{move.name}</span>
                        </div>
                        <div className="skill-cost">
                          {renderEnergyCost(move.energyCost)}
                        </div>
                        <p className="skill-desc">{move.description}</p>
                        <div className="skill-stats">
                          {move.damage > 0 && (
                            <span className="skill-damage">💥 {move.damage} dano</span>
                          )}
                          {move.cooldown > 0 && (
                            <span className="skill-cooldown">⏱️ {move.cooldown} turnos</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-skills">
                      <span>Clique em &quot;Ver Skills&quot; para detalhes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">🎮</div>
              <p>Passe o mouse sobre um Pokémon para ver seus detalhes e habilidades</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚔️ CONFIRMAR TIME ⚔️</h2>
            </div>
            
            <div className="modal-team-preview">
              {selectedTeam.map((pokemon, idx) => (
                <div key={pokemon.id} className="modal-team-member">
                  <div className="member-portrait" style={{ borderColor: getTypeColor(pokemon.types) }}>
                    <img src={getImage(pokemon.name)} alt={pokemon.name} />
                  </div>
                  <span className="member-number">{idx + 1}</span>
                  <span className="member-name">{pokemon.name}</span>
                </div>
              ))}
            </div>

            <p className="modal-text">
              Você está pronto para começar sua jornada com este time?
            </p>

            <div className="modal-actions">
              <button 
                className="modal-btn cancel" 
                onClick={() => setShowConfirmation(false)}
                disabled={submitting}
              >
                Voltar
              </button>
              <button 
                className="modal-btn confirm" 
                onClick={finalConfirm}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading-dots"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    🎮 COMEÇAR!
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
