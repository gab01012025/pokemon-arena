'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PokemonSprite } from '@/components/PokemonSprite';
import { getTypeColor } from '@/lib/pokemon-images';

interface Pokemon {
  id: string;
  name: string;
  description: string;
  types: string[];
  category: string;
  health: number;
  traits: string[];
  isStarter: boolean;
  unlockCost: number;
  isUnlocked: boolean;
  moves: Array<{
    id: string;
    name: string;
    description: string;
    damage: number;
    cooldown: number;
  }>;
}

interface PokemonData {
  pokemon: Pokemon[];
  grouped: Record<string, Pokemon[]>;
  categories: string[];
  unlockedCount: number;
  totalCount: number;
}

export default function UnlockPokemonPage() {
  const router = useRouter();
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Starter');
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const fetchPokemon = useCallback(async () => {
    try {
      const res = await fetch('/api/pokemon/unlock');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Falha ao carregar Pokémon');
      }
      const data = await res.json();
      setPokemonData(data);
      
      // Definir categoria inicial
      if (data.categories.length > 0 && !selectedCategory) {
        setSelectedCategory(data.categories[0]);
      }
    } catch (err) {
      setError('Erro ao carregar Pokémon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router, selectedCategory]);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  const unlockPokemon = async (pokemonId: string) => {
    setUnlocking(pokemonId);
    try {
      const res = await fetch('/api/pokemon/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao desbloquear Pokémon');
        return;
      }

      alert(`${data.pokemon.name} desbloqueado! XP restante: ${data.xpRemaining}`);
      fetchPokemon();
      setSelectedPokemon(null);
    } catch (err) {
      alert('Erro ao desbloquear Pokémon');
      console.error(err);
    } finally {
      setUnlocking(null);
    }
  };

  if (loading) {
    return (
      <div className="unlock-pokemon-page">
        <div className="loading-container">
          <div className="pokeball-loader large" />
          <p>Carregando Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemonData) {
    return (
      <div className="unlock-pokemon-page">
        <div className="error-container">
          <h2>❌ Erro</h2>
          <p>{error || 'Erro ao carregar Pokémon'}</p>
          <button onClick={() => router.push('/')}>Voltar ao Início</button>
        </div>
      </div>
    );
  }

  const currentPokemon = pokemonData.grouped[selectedCategory] || [];

  return (
    <div className="unlock-pokemon-page">
      <div className="unlock-header">
        <div className="header-content">
          <Link href="/" className="back-button">← Voltar</Link>
          <h1>Desbloquear Pokémon</h1>
          <div className="progress-stats">
            <span className="stat-item">
              Desbloqueados: <strong>{pokemonData.unlockedCount}/{pokemonData.totalCount}</strong>
            </span>
            <span className="stat-item">
              Progresso: <strong>{Math.round((pokemonData.unlockedCount / pokemonData.totalCount) * 100)}%</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="unlock-container">
        {/* Category Tabs */}
        <div className="category-tabs">
          {pokemonData.categories.map(category => {
            const categoryPokemon = pokemonData.grouped[category] || [];
            const unlocked = categoryPokemon.filter(p => p.isUnlocked).length;
            const total = categoryPokemon.length;

            return (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="category-name">{category}</span>
                <span className="category-count">{unlocked}/{total}</span>
              </button>
            );
          })}
        </div>

        {/* Pokemon Grid */}
        <div className="pokemon-grid">
          {currentPokemon.map(pokemon => (
            <div 
              key={pokemon.id} 
              className={`pokemon-card ${pokemon.isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => setSelectedPokemon(pokemon)}
            >
              <div className="pokemon-image">
                <PokemonSprite
                  name={pokemon.name}
                  pokemonId={parseInt(pokemon.id.slice(-3))}
                  size="large"
                  spriteType="artwork"
                />
                {pokemon.isUnlocked && (
                  <div className="unlocked-badge">✅ Desbloqueado</div>
                )}
                {!pokemon.isUnlocked && pokemon.unlockCost > 0 && (
                  <div className="cost-badge">{pokemon.unlockCost} XP</div>
                )}
              </div>

              <div className="pokemon-info">
                <h3>{pokemon.name}</h3>
                <div className="pokemon-types">
                  {pokemon.types.map(type => (
                    <span 
                      key={type} 
                      className="type-badge"
                      style={{ 
                        backgroundColor: getTypeColor(type).bg,
                        borderColor: getTypeColor(type).border 
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <p className="pokemon-category">{pokemon.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="pokemon-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedPokemon(null)}>×</button>
            
            <div className="modal-header">
              <PokemonSprite
                name={selectedPokemon.name}
                pokemonId={parseInt(selectedPokemon.id.slice(-3))}
                size="large"
                spriteType="artwork"
              />
              <div className="modal-title">
                <h2>{selectedPokemon.name}</h2>
                <div className="pokemon-types">
                  {selectedPokemon.types.map(type => (
                    <span 
                      key={type} 
                      className="type-badge large"
                      style={{ 
                        backgroundColor: getTypeColor(type).bg,
                        borderColor: getTypeColor(type).border 
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-body">
              <p className="pokemon-description">{selectedPokemon.description}</p>
              
              <div className="pokemon-stats">
                <div className="stat">
                  <span className="stat-label">HP:</span>
                  <span className="stat-value">{selectedPokemon.health}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Categoria:</span>
                  <span className="stat-value">{selectedPokemon.category}</span>
                </div>
              </div>

              <div className="pokemon-traits">
                <h4>✨ Habilidades:</h4>
                <div className="traits-list">
                  {selectedPokemon.traits.map((trait, i) => (
                    <span key={i} className="trait-badge">{trait}</span>
                  ))}
                </div>
              </div>

              <div className="pokemon-moves">
                <h4>⚔️ Movimentos:</h4>
                <div className="moves-list">
                  {selectedPokemon.moves.map(move => (
                    <div key={move.id} className="move-item">
                      <div className="move-header">
                        <span className="move-name">{move.name}</span>
                        <span className="move-stats">
                          {move.damage > 0 && <span className="move-damage">⚡ {move.damage}</span>}
                          {move.cooldown > 0 && <span className="move-cooldown">🕐 {move.cooldown}</span>}
                        </span>
                      </div>
                      <p className="move-description">{move.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedPokemon.isUnlocked ? (
                <div className="already-unlocked">
                  ✅ Você já possui este Pokémon!
                </div>
              ) : (
                <button
                  className="unlock-btn"
                  onClick={() => unlockPokemon(selectedPokemon.id)}
                  disabled={unlocking === selectedPokemon.id}
                >
                  {unlocking === selectedPokemon.id ? 'Desbloqueando...' : `Desbloquear por ${selectedPokemon.unlockCost} XP`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
