'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface Pokemon {
  id: string;
  name: string;
  type?: string;
  secondaryType?: string | null;
  health?: number;
  imageUrl?: string | null;
  isStarter?: boolean;
  isUnlockable?: boolean;
  moves?: { id: string; name: string }[];
}

export default function PlayPage() {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  // Helper function to extract type from various formats
  const extractType = (pokemon: Record<string, unknown>): string => {
    if (typeof pokemon.type === 'string' && pokemon.type) {
      return pokemon.type;
    }
    if (typeof pokemon.types === 'string') {
      try {
        const parsed = JSON.parse(pokemon.types);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
        return pokemon.types;
      } catch {
        const first = pokemon.types.split(',')[0];
        return first || 'Normal';
      }
    }
    if (Array.isArray(pokemon.types) && pokemon.types.length > 0) {
      return pokemon.types[0];
    }
    return 'Normal';
  };

  // Fetch available Pokemon
  useEffect(() => {
    async function fetchPokemon() {
      try {
        const res = await fetch('/api/pokemon');
        if (res.ok) {
          const data = await res.json();
          const transformed = data.map((p: Record<string, unknown>) => ({
            ...p,
            type: extractType(p),
            health: p.health || 100,
            moves: p.moves || [],
          }));
          setPokemon(transformed);
        } else {
          // Use default Pokemon if API fails
          setPokemon([
            { id: '1', name: 'Pikachu', type: 'Electric', health: 100, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', moves: [] },
            { id: '2', name: 'Charizard', type: 'Fire', health: 120, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', moves: [] },
            { id: '3', name: 'Blastoise', type: 'Water', health: 130, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', moves: [] },
            { id: '4', name: 'Venusaur', type: 'Grass', health: 125, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', moves: [] },
            { id: '5', name: 'Gengar', type: 'Ghost', health: 100, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', moves: [] },
            { id: '6', name: 'Alakazam', type: 'Psychic', health: 90, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png', moves: [] },
            { id: '7', name: 'Machamp', type: 'Fighting', health: 130, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png', moves: [] },
            { id: '8', name: 'Dragonite', type: 'Dragon', health: 140, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png', moves: [] },
            { id: '9', name: 'Mewtwo', type: 'Psychic', health: 150, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', moves: [] },
          ]);
        }
      } catch {
        // Use default Pokemon on error
        setPokemon([
          { id: '1', name: 'Pikachu', type: 'Electric', health: 100, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', moves: [] },
          { id: '2', name: 'Charizard', type: 'Fire', health: 120, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', moves: [] },
          { id: '3', name: 'Blastoise', type: 'Water', health: 130, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', moves: [] },
          { id: '4', name: 'Venusaur', type: 'Grass', health: 125, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', moves: [] },
          { id: '5', name: 'Gengar', type: 'Ghost', health: 100, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', moves: [] },
          { id: '6', name: 'Alakazam', type: 'Psychic', health: 90, imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png', moves: [] },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchPokemon();
  }, []);

  const selectPokemon = (poke: Pokemon) => {
    if (selectedTeam.find(p => p.id === poke.id)) {
      setSelectedTeam(selectedTeam.filter(p => p.id !== poke.id));
    } else if (selectedTeam.length < 3) {
      setSelectedTeam([...selectedTeam, poke]);
    }
  };

  // Start AI battle
  const startAiBattle = useCallback(() => {
    if (selectedTeam.length !== 3) {
      setError('Selecione 3 Pokémon para batalhar!');
      return;
    }
    setError(null);
    localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
    localStorage.setItem('difficulty', difficulty);
    router.push('/battle/ai');
  }, [selectedTeam, difficulty, router]);

  const getTypeColor = (type: string | undefined | null) => {
    const colors: Record<string, string> = {
      electric: '#F7D02C',
      fire: '#EE8130',
      water: '#6390F0',
      grass: '#7AC74C',
      psychic: '#F95587',
      fighting: '#C22E28',
      ghost: '#735797',
      dragon: '#6F35FC',
      normal: '#A8A77A',
      ice: '#96D9D6',
      dark: '#705746',
      fairy: '#D685AD',
      steel: '#B7B7CE',
      rock: '#B6A136',
      ground: '#E2BF65',
      flying: '#A98FF3',
      bug: '#A6B91A',
      poison: '#A33EA1',
    };
    if (!type) return '#777';
    return colors[type.toLowerCase()] || '#777';
  };

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top active">Start Playing</Link>
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
          <h1 className="page-title">⚔️ Battle Arena ⚔️</h1>

          {error && (
            <div className="error-banner">{error}</div>
          )}

          {/* Selected Team */}
          <div className="content-section team-section">
            <div className="section-title">Seu Time ({selectedTeam.length}/3)</div>
            <div className="section-content">
              <div className="selected-team">
                {[0, 1, 2].map(index => (
                  <div 
                    key={index} 
                    className={`team-slot-new ${selectedTeam[index] ? 'filled' : 'empty'}`}
                    style={selectedTeam[index] ? { borderColor: getTypeColor(selectedTeam[index].type) } : {}}
                    onClick={() => selectedTeam[index] && selectPokemon(selectedTeam[index])}
                  >
                    {selectedTeam[index] ? (
                      <>
                        <img 
                          src={selectedTeam[index].imageUrl || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'} 
                          alt={selectedTeam[index].name}
                        />
                        <span className="slot-name">{selectedTeam[index].name}</span>
                        <span className="slot-remove">✕</span>
                      </>
                    ) : (
                      <>
                        <div className="slot-number">{index + 1}</div>
                        <span className="slot-label">Selecione um Pokémon</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Difficulty Selection */}
              <div className="difficulty-selection" style={{ margin: '20px 0', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                  style={{
                    padding: '10px 25px',
                    border: '2px solid',
                    borderColor: difficulty === 'easy' ? '#4CAF50' : '#555',
                    background: difficulty === 'easy' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : '#333',
                    color: '#fff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  🌱 Fácil
                </button>
                <button 
                  className={`difficulty-btn ${difficulty === 'normal' ? 'active' : ''}`}
                  onClick={() => setDifficulty('normal')}
                  style={{
                    padding: '10px 25px',
                    border: '2px solid',
                    borderColor: difficulty === 'normal' ? '#FF9800' : '#555',
                    background: difficulty === 'normal' ? 'linear-gradient(135deg, #FF9800, #F57C00)' : '#333',
                    color: '#fff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  ⚔️ Normal
                </button>
                <button 
                  className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setDifficulty('hard')}
                  style={{
                    padding: '10px 25px',
                    border: '2px solid',
                    borderColor: difficulty === 'hard' ? '#f44336' : '#555',
                    background: difficulty === 'hard' ? 'linear-gradient(135deg, #f44336, #d32f2f)' : '#333',
                    color: '#fff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  💀 Difícil
                </button>
              </div>

              <div className="battle-buttons">
                <button 
                  className={`btn-queue-ai ${selectedTeam.length === 3 ? 'ready' : 'disabled'}`}
                  onClick={startAiBattle}
                  disabled={selectedTeam.length !== 3}
                  style={{
                    padding: '15px 40px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: selectedTeam.length === 3 ? 'pointer' : 'not-allowed',
                    background: selectedTeam.length === 3 
                      ? 'linear-gradient(135deg, #e91e63, #c2185b)' 
                      : '#555',
                    color: '#fff',
                    boxShadow: selectedTeam.length === 3 
                      ? '0 4px 15px rgba(233, 30, 99, 0.4)' 
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  🤖 BATALHAR CONTRA IA
                </button>
              </div>
              
              {/* PvP Coming Soon */}
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px dashed #555'
              }}>
                <p style={{ color: '#888', margin: 0 }}>
                  🎮 <strong>Multiplayer PvP</strong> em breve!
                </p>
              </div>
            </div>
          </div>

          {/* Available Pokemon */}
          <div className="content-section pokemon-selection-section">
            <div className="section-title">Selecione Seus Pokémon</div>
            <div className="section-content">
              {loading ? (
                <div className="loading-pokemon">Carregando Pokémon...</div>
              ) : (
                <div className="pokemon-selection-grid">
                  {pokemon.map(poke => (
                    <div 
                      key={poke.id}
                      className={`pokemon-select-card ${selectedTeam.find(p => p.id === poke.id) ? 'selected' : ''}`}
                      style={{ borderColor: getTypeColor(poke.type) }}
                      onClick={() => selectPokemon(poke)}
                    >
                      <div className="pokemon-select-image" style={{ backgroundColor: `${getTypeColor(poke.type)}22` }}>
                        <img 
                          src={poke.imageUrl || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'} 
                          alt={poke.name}
                        />
                        {selectedTeam.find(p => p.id === poke.id) && (
                          <div className="selected-overlay">✓</div>
                        )}
                      </div>
                      <div className="pokemon-select-info">
                        <span className="pokemon-select-name">{poke.name}</span>
                        <span className="pokemon-select-type" style={{ backgroundColor: getTypeColor(poke.type) }}>
                          {poke.type || 'Normal'}
                        </span>
                      </div>
                      <div className="pokemon-select-stats">
                        <span>❤️ {poke.health || 100} HP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="content-section">
            <div className="section-title">Como Jogar</div>
            <div className="section-content">
              <ol className="play-instructions">
                <li>Selecione 3 Pokémon para formar seu time de batalha</li>
                <li>Escolha a dificuldade da IA (Fácil, Normal ou Difícil)</li>
                <li>Clique em &quot;Batalhar contra IA&quot; para começar</li>
                <li>Use as habilidades dos seus Pokémon estrategicamente</li>
                <li>Gerencie sua energia para usar ataques poderosos</li>
                <li>Derrote todos os Pokémon inimigos para vencer!</li>
              </ol>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
