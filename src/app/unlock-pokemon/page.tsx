'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { logger } from '@/lib/logger';
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
        if (res.status === 401) { router.push('/login'); return; }
        throw new Error('Falha ao carregar Pokémon');
      }
      const json = await res.json();
      const data = json.data ?? json;
      setPokemonData(data);
      if (data.categories?.length > 0 && !selectedCategory) {
        setSelectedCategory(data.categories[0]);
      }
    } catch (err) {
      setError('Erro ao carregar Pokémon');
      logger.error('Pokemon fetch error', err instanceof Error ? err : undefined);
    } finally {
      setLoading(false);
    }
  }, [router, selectedCategory]);

  useEffect(() => { fetchPokemon(); }, [fetchPokemon]);

  const unlockPokemon = async (pokemonId: string) => {
    setUnlocking(pokemonId);
    try {
      const res = await fetch('/api/pokemon/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Erro ao desbloquear Pokémon'); return; }
      alert(`${data.pokemon.name} desbloqueado! XP restante: ${data.xpRemaining}`);
      fetchPokemon();
      setSelectedPokemon(null);
    } catch (err) {
      alert('Erro ao desbloquear Pokémon');
      logger.error('Pokemon unlock error', err instanceof Error ? err : undefined);
    } finally {
      setUnlocking(null);
    }
  };

  const currentPokemon = pokemonData?.grouped[selectedCategory] || [];
  const unlockPercent = pokemonData ? Math.round((pokemonData.unlockedCount / pokemonData.totalCount) * 100) : 0;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/tutorial" className="nav-btn-top">Tutorial</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/missions" className="nav-btn-top">Missões</Link>
              <Link href="/unlock-pokemon" className="nav-btn-top">Desbloquear</Link>
              <Link href="/my-clan" className="nav-btn-top">Meu Clã</Link>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <div className="content-box">
            <div className="content-box-header">
              <h2>Desbloquear Pokémon</h2>
            </div>
            <div className="content-box-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  Carregando Pokémon...
                </div>
              ) : error || !pokemonData ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: '#ef4444', marginBottom: '12px' }}>{error || 'Erro ao carregar'}</p>
                  <Link href="/" style={{ color: '#60a5fa' }}>Voltar ao Início</Link>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Desbloqueados: <strong style={{ color: '#e2e8f0' }}>{pokemonData.unlockedCount}/{pokemonData.totalCount}</strong>
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Progresso: <strong style={{ color: '#f59e0b' }}>{unlockPercent}%</strong>
                    </span>
                  </div>

                  {/* Category Tabs */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {pokemonData.categories.map(category => {
                      const catPokemon = pokemonData.grouped[category] || [];
                      const unlocked = catPokemon.filter(p => p.isUnlocked).length;
                      const isActive = selectedCategory === category;

                      return (
                        <button key={category} onClick={() => setSelectedCategory(category)} style={{
                          padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          border: isActive ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          background: isActive ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                          color: isActive ? '#f87171' : '#94a3b8',
                        }}>
                          {category}
                          <span style={{ marginLeft: '6px', opacity: 0.6, fontSize: '11px' }}>{unlocked}/{catPokemon.length}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pokemon Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    {currentPokemon.map(pokemon => (
                      <div
                        key={pokemon.id}
                        onClick={() => setSelectedPokemon(pokemon)}
                        style={{
                          background: pokemon.isUnlocked ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                          border: pokemon.isUnlocked ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px', padding: '12px', cursor: 'pointer',
                          opacity: pokemon.isUnlocked ? 1 : 0.7, textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <PokemonSprite name={pokemon.name} pokemonId={parseInt(pokemon.id.slice(-3))} size="large" spriteType="artwork" />
                        </div>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                          {pokemon.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '6px' }}>
                          {pokemon.types.map(type => (
                            <span key={type} style={{
                              fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '3px',
                              backgroundColor: getTypeColor(type).bg, borderColor: getTypeColor(type).border,
                              border: '1px solid', color: '#fff',
                            }}>
                              {type}
                            </span>
                          ))}
                        </div>
                        {pokemon.isUnlocked ? (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#22c55e' }}>Desbloqueado</span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#f59e0b' }}>{pokemon.unlockCost} XP</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      {/* Detail Modal */}
      {selectedPokemon && (
        <div style={overlayStyle} onClick={() => setSelectedPokemon(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0f1428', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '24px', maxWidth: '480px', width: '90%',
            maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                  {selectedPokemon.name}
                </h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {selectedPokemon.types.map(type => (
                    <span key={type} style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      backgroundColor: getTypeColor(type).bg, color: '#fff',
                    }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setSelectedPokemon(null)} style={{
                background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer',
              }}>
                ×
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <PokemonSprite name={selectedPokemon.name} pokemonId={parseInt(selectedPokemon.id.slice(-3))} size="large" spriteType="artwork" />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px', lineHeight: 1.6 }}>
              {selectedPokemon.description}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>HP</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{selectedPokemon.health}</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Categoria</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{selectedPokemon.category}</div>
              </div>
            </div>

            {selectedPokemon.traits.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Habilidades</h4>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {selectedPokemon.traits.map((trait, i) => (
                    <span key={i} style={{
                      fontSize: '10px', padding: '3px 8px', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                    }}>
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Movimentos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPokemon.moves.map(move => (
                  <div key={move.id} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px', padding: '10px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{move.name}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {move.damage > 0 && (
                          <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600 }}>{move.damage} DMG</span>
                        )}
                        {move.cooldown > 0 && (
                          <span style={{ fontSize: '10px', color: '#64748b' }}>CD {move.cooldown}</span>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>{move.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', textAlign: 'center' }}>
              {selectedPokemon.isUnlocked ? (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>Você já possui este Pokémon</span>
              ) : (
                <button
                  onClick={() => unlockPokemon(selectedPokemon.id)}
                  disabled={unlocking === selectedPokemon.id}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                    color: '#f87171', cursor: unlocking ? 'not-allowed' : 'pointer',
                    opacity: unlocking ? 0.5 : 1,
                  }}
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
