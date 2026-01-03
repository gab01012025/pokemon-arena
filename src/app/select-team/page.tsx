'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Pokemon {
  id: string;
  name: string;
  types: string;
  health: number;
  description: string | null;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStarters() {
      try {
        const res = await fetch('/api/pokemon?starters=true');
        if (res.ok) {
          const data = await res.json();
          setStarters(data);
        }
      } catch {
        setError('Failed to load Pokemon');
      } finally {
        setLoading(false);
      }
    }
    fetchStarters();
  }, []);

  const togglePokemon = (pokemon: Pokemon) => {
    if (selectedTeam.find(p => p.id === pokemon.id)) {
      setSelectedTeam(selectedTeam.filter(p => p.id !== pokemon.id));
    } else if (selectedTeam.length < 3) {
      setSelectedTeam([...selectedTeam, pokemon]);
    }
  };

  const confirmTeam = async () => {
    if (selectedTeam.length !== 3) {
      setError('Please select exactly 3 Pokémon');
      return;
    }

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
        setError(data.error || 'Failed to save team');
      }
    } catch {
      setError('Connection error');
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

  if (loading) {
    return (
      <div className="select-team-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Pokémon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="select-team-page">
      <div className="select-team-container">
        <div className="select-team-header">
          <h1>⚡ Choose Your Starter Team ⚡</h1>
          <p>Select 3 Pokémon to begin your journey as a Pokémon Arena trainer!</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Selected Team Preview */}
        <div className="selected-team-preview">
          <h2>Your Team ({selectedTeam.length}/3)</h2>
          <div className="team-slots">
            {[0, 1, 2].map(idx => (
              <div 
                key={idx} 
                className={`team-slot ${selectedTeam[idx] ? 'filled' : 'empty'}`}
                style={selectedTeam[idx] ? { borderColor: getTypeColor(selectedTeam[idx].types) } : {}}
                onClick={() => selectedTeam[idx] && togglePokemon(selectedTeam[idx])}
              >
                {selectedTeam[idx] ? (
                  <>
                    <img src={getImage(selectedTeam[idx].name)} alt={selectedTeam[idx].name} />
                    <span className="slot-name">{selectedTeam[idx].name}</span>
                    <span className="slot-remove">✕</span>
                  </>
                ) : (
                  <span className="slot-empty">Slot {idx + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Starters */}
        <div className="starters-grid">
          {starters.map(pokemon => {
            const isSelected = selectedTeam.find(p => p.id === pokemon.id);
            const typeColor = getTypeColor(pokemon.types);
            
            return (
              <div
                key={pokemon.id}
                className={`starter-card ${isSelected ? 'selected' : ''}`}
                style={{ borderColor: typeColor }}
                onClick={() => togglePokemon(pokemon)}
              >
                <div className="starter-image" style={{ backgroundColor: `${typeColor}22` }}>
                  <img src={getImage(pokemon.name)} alt={pokemon.name} />
                  {isSelected && <div className="selected-badge">✓</div>}
                </div>
                <div className="starter-info">
                  <h3>{pokemon.name}</h3>
                  <div className="starter-types">
                    {pokemon.types.split(',').map((type, i) => (
                      <span 
                        key={i} 
                        className="type-badge"
                        style={{ backgroundColor: TYPE_COLORS[type.toLowerCase()] || '#777' }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <div className="starter-stats">
                    <span>❤️ {pokemon.health} HP</span>
                  </div>
                  {pokemon.description && (
                    <p className="starter-desc">{pokemon.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="confirm-section">
          <button
            className={`btn-confirm ${selectedTeam.length === 3 ? 'ready' : 'disabled'}`}
            onClick={confirmTeam}
            disabled={selectedTeam.length !== 3 || submitting}
          >
            {submitting ? 'Saving...' : selectedTeam.length === 3 ? '🎮 START YOUR JOURNEY!' : `Select ${3 - selectedTeam.length} more Pokémon`}
          </button>
          <Link href="/" className="btn-back">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
