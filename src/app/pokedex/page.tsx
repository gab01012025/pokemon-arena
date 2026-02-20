'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
        console.error('Error fetching Pokemon:', error);
      }
      setLoading(false);
    };

    fetchPokemon();
  }, [page]);

  // Fetch Pokemon details
  const fetchDetails = async (id: number) => {
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
      console.error('Error fetching Pokemon details:', error);
    }
    setLoadingDetails(false);
  };

  const filteredPokemon = pokemon.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toString().includes(search);
    const matchesType = selectedType === 'all' || p.types.includes(selectedType);
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="pokedex-container">
      <style jsx>{`
        .pokedex-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 20px;
        }

        .pokedex-header {
          text-align: center;
          padding: 30px 0;
        }

        .pokedex-title {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #E3350D 0%, #FFCB05 50%, #3B5CA8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }

        .pokedex-subtitle {
          color: #888;
          font-size: 1.1rem;
        }

        .controls {
          display: flex;
          gap: 15px;
          max-width: 800px;
          margin: 0 auto 30px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
          padding: 15px 20px;
          border-radius: 50px;
          border: 2px solid #333;
          background: #1a1a2e;
          color: #fff;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
        }

        .search-input:focus {
          border-color: #FFCB05;
          box-shadow: 0 0 15px rgba(255, 203, 5, 0.2);
        }

        .type-select {
          padding: 15px 25px;
          border-radius: 50px;
          border: 2px solid #333;
          background: #1a1a2e;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          text-transform: capitalize;
        }

        .pokemon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .pokemon-card {
          background: linear-gradient(145deg, #2a2a4a 0%, #1a1a2e 100%);
          border-radius: 20px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          border: 3px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .pokemon-card:hover {
          transform: translateY(-10px);
          border-color: #FFCB05;
          box-shadow: 0 15px 40px rgba(255, 203, 5, 0.2);
        }

        .pokemon-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: var(--type-bg);
          opacity: 0.1;
          border-radius: 20px 20px 50% 50%;
        }

        .pokemon-id {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 0.9rem;
          color: #666;
          font-weight: 700;
        }

        .pokemon-image {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          display: block;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
        }

        .pokemon-name {
          text-align: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          text-transform: capitalize;
          margin: 15px 0 10px;
        }

        .pokemon-types {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .type-badge {
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 40px;
          padding-bottom: 40px;
        }

        .page-btn {
          padding: 12px 30px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #E3350D 0%, #b02000 100%);
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(227, 53, 13, 0.4);
        }

        .page-info {
          color: #888;
          font-size: 1rem;
        }

        .loading {
          text-align: center;
          padding: 100px 0;
          color: #FFCB05;
          font-size: 1.5rem;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E3350D 50%, #fff 50%);
          border: 4px solid #fff;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(145deg, #2a2a4a 0%, #1a1a2e 100%);
          border-radius: 30px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border: 4px solid var(--type-color, #FFCB05);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #333;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #E3350D;
          transform: rotate(90deg);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .modal-image {
          width: 200px;
          height: 200px;
          margin: 0 auto;
          display: block;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
        }

        .modal-name {
          font-size: 2.5rem;
          font-weight: 900;
          color: #fff;
          text-transform: capitalize;
          margin: 20px 0 5px;
        }

        .modal-genus {
          color: #888;
          font-size: 1rem;
          margin-bottom: 15px;
        }

        .modal-description {
          color: #aaa;
          font-size: 1rem;
          line-height: 1.6;
          padding: 15px;
          background: rgba(0,0,0,0.2);
          border-radius: 15px;
          margin: 20px 0;
          border-left: 4px solid #FFCB05;
        }

        .modal-section {
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #FFCB05;
          text-transform: uppercase;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .info-item {
          background: rgba(0,0,0,0.2);
          padding: 12px 15px;
          border-radius: 10px;
        }

        .info-label {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 1.1rem;
          color: #fff;
          font-weight: 600;
        }

        .stat-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .stat-name {
          width: 80px;
          font-size: 0.85rem;
          color: #888;
          text-transform: uppercase;
        }

        .stat-bar-bg {
          flex: 1;
          height: 12px;
          background: #1a1a2e;
          border-radius: 6px;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s ease;
        }

        .stat-value {
          width: 40px;
          font-size: 0.9rem;
          color: #fff;
          font-weight: 700;
          text-align: right;
        }

        .abilities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .ability-tag {
          padding: 8px 16px;
          background: rgba(255, 203, 5, 0.1);
          border: 1px solid #FFCB05;
          border-radius: 20px;
          color: #FFCB05;
          font-size: 0.9rem;
          text-transform: capitalize;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 20px;
          color: #FFCB05;
          text-decoration: none;
          font-weight: 600;
        }

        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="pokedex-header">
        <Link href="/" className="back-link">← Voltar ao Início</Link>
        <h1 className="pokedex-title">POKÉDEX</h1>
        <p className="pokedex-subtitle">Dados em tempo real da PokeAPI</p>
      </div>

      <div className="controls">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar por nome ou número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="type-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">Todos os Tipos</option>
          {Object.keys(TYPE_COLORS).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
          <p>Carregando Pokémon...</p>
        </div>
      ) : (
        <>
          <div className="pokemon-grid">
            {filteredPokemon.map((p) => (
              <div
                key={p.id}
                className="pokemon-card"
                onClick={() => fetchDetails(p.id)}
                style={{ '--type-bg': TYPE_COLORS[p.types[0]] } as React.CSSProperties}
              >
                <span className="pokemon-id">#{p.id.toString().padStart(3, '0')}</span>
                <Image
                  src={p.artwork || p.sprite}
                  alt={p.name}
                  width={120}
                  height={120}
                  className="pokemon-image"
                  unoptimized
                />
                <h3 className="pokemon-name">{p.name}</h3>
                <div className="pokemon-types">
                  {p.types.map((type) => (
                    <span
                      key={type}
                      className="type-badge"
                      style={{ background: TYPE_COLORS[type] }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Anterior
            </button>
            <span className="page-info">
              Página {page + 1} de {totalPages}
            </span>
            <button
              className="page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Próximo →
            </button>
          </div>
        </>
      )}

      {/* Pokemon Details Modal */}
      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ '--type-color': TYPE_COLORS[selectedPokemon.types[0]] } as React.CSSProperties}
          >
            <button className="modal-close" onClick={() => setSelectedPokemon(null)}>×</button>
            
            {loadingDetails ? (
              <div className="loading">
                <div className="loading-spinner" />
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <Image
                    src={selectedPokemon.artwork}
                    alt={selectedPokemon.name}
                    width={200}
                    height={200}
                    className="modal-image"
                    unoptimized
                  />
                  <h2 className="modal-name">
                    #{selectedPokemon.id.toString().padStart(3, '0')} {selectedPokemon.name}
                  </h2>
                  <p className="modal-genus">{selectedPokemon.genus}</p>
                  <div className="pokemon-types">
                    {selectedPokemon.types.map((type) => (
                      <span
                        key={type}
                        className="type-badge"
                        style={{ background: TYPE_COLORS[type] }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="modal-description">{selectedPokemon.description}</p>

                <div className="modal-section">
                  <h3 className="section-title">Informações</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Altura</div>
                      <div className="info-value">{selectedPokemon.height} m</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Peso</div>
                      <div className="info-value">{selectedPokemon.weight} kg</div>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3 className="section-title">Base Stats</h3>
                  {[
                    { name: 'HP', value: selectedPokemon.stats.hp, color: '#ff5555' },
                    { name: 'Attack', value: selectedPokemon.stats.attack, color: '#f08030' },
                    { name: 'Defense', value: selectedPokemon.stats.defense, color: '#f8d030' },
                    { name: 'Sp. Atk', value: selectedPokemon.stats.spAtk, color: '#6890f0' },
                    { name: 'Sp. Def', value: selectedPokemon.stats.spDef, color: '#78c850' },
                    { name: 'Speed', value: selectedPokemon.stats.speed, color: '#f85888' },
                  ].map((stat) => (
                    <div key={stat.name} className="stat-bar">
                      <span className="stat-name">{stat.name}</span>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill"
                          style={{
                            width: `${(stat.value / 255) * 100}%`,
                            background: stat.color,
                          }}
                        />
                      </div>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="modal-section">
                  <h3 className="section-title">Habilidades</h3>
                  <div className="abilities-list">
                    {selectedPokemon.abilities.map((ability) => (
                      <span key={ability} className="ability-tag">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
