'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { logger } from '@/lib/logger';

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  artwork: string;
}

interface PokemonDetails {
  id: number;
  name: string;
  types: string[];
  artwork: string;
  height: number;
  weight: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  abilities: string[];
  description: string;
  genus: string;
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

const ALL_TYPES = Object.keys(TYPE_COLORS);

export default function PokedexPage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 24;

  // Fetch Pokemon list
  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${page * limit}`);
        const data = await res.json();
        setTotal(data.count);

        const pokemonDetails = await Promise.all(
          data.results.map(async (p: { name: string; url: string }) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
            const detailRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const detail = await detailRes.json();
            return {
              id: detail.id,
              name: detail.name,
              types: detail.types.map((t: any) => t.type.name),
              sprite: detail.sprites.front_default,
              artwork: detail.sprites.other?.['official-artwork']?.front_default,
            };
          })
        );

        setPokemon(pokemonDetails);
      } catch (error) {
        logger.error('Error fetching Pokemon:', error instanceof Error ? error : undefined);
      }
      setLoading(false);
    };

    fetchPokemon();
  }, [page]);

  // Fetch Pokemon details
  const fetchDetails = useCallback(async (id: number) => {
    setLoadingDetails(true);
    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
      ]);

      const pokemonData = await pokemonRes.json();
      const speciesData = await speciesRes.json();

      const flavorEntry = speciesData.flavor_text_entries.find(
        (e: any) => e.language.name === 'en'
      );
      const genusEntry = speciesData.genera.find(
        (g: any) => g.language.name === 'en'
      );

      setSelectedPokemon({
        id: pokemonData.id,
        name: pokemonData.name,
        types: pokemonData.types.map((t: any) => t.type.name),
        artwork: pokemonData.sprites.other?.['official-artwork']?.front_default,
        height: pokemonData.height / 10,
        weight: pokemonData.weight / 10,
        stats: {
          hp: pokemonData.stats[0].base_stat,
          attack: pokemonData.stats[1].base_stat,
          defense: pokemonData.stats[2].base_stat,
          spAtk: pokemonData.stats[3].base_stat,
          spDef: pokemonData.stats[4].base_stat,
          speed: pokemonData.stats[5].base_stat,
        },
        abilities: pokemonData.abilities.map((a: any) => a.ability.name.replace(/-/g, ' ')),
        description: flavorEntry?.flavor_text?.replace(/\f|\n/g, ' ') || '',
        genus: genusEntry?.genus || '',
      });
    } catch (error) {
      logger.error('Error fetching Pokemon details:', error instanceof Error ? error : undefined);
    }
    setLoadingDetails(false);
  }, []);

  const filteredPokemon = pokemon.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toString().includes(search);
    const matchesType = selectedType === 'all' || p.types.includes(selectedType);
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(total / limit);

  const getStatColor = (value: number) => {
    if (value >= 150) return '#ff5555';
    if (value >= 100) return '#f8d030';
    if (value >= 70) return '#78c850';
    return '#6890f0';
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
          <h1 className="page-title">Pokedex</h1>
          <div className="breadcrumb">
            <Link href="/">Home</Link> &gt; <span>Pokedex</span>
          </div>

          {/* Search & Type Filter */}
          <div className="content-box" style={{ marginBottom: 16 }}>
            <div className="content-box-header" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.15))' }}>
              Search Pokemon
            </div>
            <div className="content-box-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by name or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                <option value="all">All Types</option>
                {ALL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                Page {page + 1}/{totalPages} ({total} Pokemon)
              </span>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="content-box">
              <div className="content-box-body" style={{ textAlign: 'center', padding: 60 }}>
                <div style={{
                  width: 48, height: 48, margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, #ff1a1a 50%, #fff 50%)',
                  border: '3px solid #444',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#f59e0b', fontSize: 14, fontWeight: 600 }}>Loading Pokemon...</p>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 10,
              marginBottom: 16,
            }}>
              {filteredPokemon.map((p) => (
                <div
                  key={p.id}
                  onClick={() => fetchDetails(p.id)}
                  style={{
                    background: 'rgba(15, 20, 40, 0.85)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '14px 10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    textAlign: 'center',
                    overflow: 'hidden',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = TYPE_COLORS[p.types[0]] || '#f59e0b';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${TYPE_COLORS[p.types[0]]}33`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 6, right: 8,
                    fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700,
                  }}>#{p.id.toString().padStart(3, '0')}</span>
                  <Image
                    src={p.artwork || p.sprite}
                    alt={p.name}
                    width={80}
                    height={80}
                    style={{ margin: '0 auto', display: 'block', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}
                    unoptimized
                  />
                  <p style={{
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    textTransform: 'capitalize', margin: '8px 0 6px',
                  }}>{p.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                    {p.types.map((type) => (
                      <span
                        key={type}
                        style={{
                          padding: '2px 8px', borderRadius: 10,
                          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                          color: '#fff', background: TYPE_COLORS[type],
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}
                      >{type}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: page === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #ef4444, #b02000)',
                  color: '#fff', fontWeight: 700, cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.4 : 1, fontSize: 12,
                }}
              >Previous</button>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: page >= totalPages - 1 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #ef4444, #b02000)',
                  color: '#fff', fontWeight: 700,
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages - 1 ? 0.4 : 1, fontSize: 12,
                }}
              >Next</button>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <div
          onClick={() => setSelectedPokemon(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(160deg, rgba(18, 24, 48, 0.98) 0%, rgba(10, 14, 32, 0.98) 100%)',
              border: `2px solid ${TYPE_COLORS[selectedPokemon.types[0]] || '#f59e0b'}`,
              borderRadius: 20, padding: '30px 28px', maxWidth: 480,
              width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative',
              boxShadow: `0 0 60px ${TYPE_COLORS[selectedPokemon.types[0]]}44, 0 20px 60px rgba(0,0,0,0.6)`,
            }}
          >
            <button
              onClick={() => setSelectedPokemon(null)}
              style={{
                position: 'absolute', top: 12, right: 16,
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >x</button>

            {loadingDetails ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#f59e0b' }}>Loading...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <Image
                    src={selectedPokemon.artwork}
                    alt={selectedPokemon.name}
                    width={160}
                    height={160}
                    style={{ margin: '0 auto', display: 'block', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' }}
                    unoptimized
                  />
                  <h2 style={{
                    fontSize: 24, fontWeight: 900, color: '#fff',
                    textTransform: 'capitalize', margin: '14px 0 4px',
                  }}>
                    #{selectedPokemon.id.toString().padStart(3, '0')} {selectedPokemon.name}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>
                    {selectedPokemon.genus}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {selectedPokemon.types.map((type) => (
                      <span key={type} style={{
                        padding: '4px 14px', borderRadius: 14, fontSize: 11,
                        fontWeight: 700, textTransform: 'uppercase', color: '#fff',
                        background: TYPE_COLORS[type],
                      }}>{type}</span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.6,
                  padding: 14, background: 'rgba(0,0,0,0.25)', borderRadius: 10,
                  borderLeft: `3px solid ${TYPE_COLORS[selectedPokemon.types[0]]}`,
                  marginBottom: 18,
                }}>{selectedPokemon.description}</p>

                {/* Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 2 }}>Height</div>
                    <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{selectedPokemon.height} m</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 2 }}>Weight</div>
                    <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{selectedPokemon.weight} kg</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLORS[selectedPokemon.types[0]], textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1.5 }}>
                    Base Stats
                  </h3>
                  {[
                    { name: 'HP', value: selectedPokemon.stats.hp },
                    { name: 'ATK', value: selectedPokemon.stats.attack },
                    { name: 'DEF', value: selectedPokemon.stats.defense },
                    { name: 'SP.A', value: selectedPokemon.stats.spAtk },
                    { name: 'SP.D', value: selectedPokemon.stats.spDef },
                    { name: 'SPD', value: selectedPokemon.stats.speed },
                  ].map((stat) => (
                    <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 36, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.name}</span>
                      <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(stat.value / 255) * 100}%`,
                          height: '100%', borderRadius: 4,
                          background: getStatColor(stat.value),
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ width: 28, fontSize: 12, color: '#fff', fontWeight: 700, textAlign: 'right' }}>{stat.value}</span>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                    Total: {selectedPokemon.stats.hp + selectedPokemon.stats.attack + selectedPokemon.stats.defense + selectedPokemon.stats.spAtk + selectedPokemon.stats.spDef + selectedPokemon.stats.speed}
                  </div>
                </div>

                {/* Abilities */}
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLORS[selectedPokemon.types[0]], textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1.5 }}>
                    Abilities
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedPokemon.abilities.map((ability) => (
                      <span key={ability} style={{
                        padding: '6px 14px',
                        background: `${TYPE_COLORS[selectedPokemon.types[0]]}1A`,
                        border: `1px solid ${TYPE_COLORS[selectedPokemon.types[0]]}55`,
                        borderRadius: 14, color: TYPE_COLORS[selectedPokemon.types[0]],
                        fontSize: 12, textTransform: 'capitalize', fontWeight: 600,
                      }}>{ability}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
