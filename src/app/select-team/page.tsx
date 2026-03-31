'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

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
  electric: '#F7D02C', fire: '#EE8130', water: '#6390F0', grass: '#7AC74C',
  psychic: '#F95587', fighting: '#C22E28', ghost: '#735797', dragon: '#6F35FC',
  normal: '#A8A77A', poison: '#A33EA1', ice: '#96D9D6', dark: '#705746',
  fairy: '#D685AD', steel: '#B7B7CE', rock: '#B6A136', ground: '#E2BF65',
  flying: '#A98FF3', bug: '#A6B91A',
};

const POKEAPI_SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const POKEMON_IDS: Record<string, number> = {
  bulbasaur:1,ivysaur:2,venusaur:3,charmander:4,charmeleon:5,charizard:6,squirtle:7,wartortle:8,blastoise:9,
  caterpie:10,metapod:11,butterfree:12,weedle:13,kakuna:14,beedrill:15,pidgey:16,pidgeotto:17,pidgeot:18,
  rattata:19,raticate:20,spearow:21,fearow:22,ekans:23,arbok:24,pikachu:25,raichu:26,sandshrew:27,sandslash:28,
  nidoranf:29,nidorina:30,nidoqueen:31,nidoranm:32,nidorino:33,nidoking:34,clefairy:35,clefable:36,
  vulpix:37,ninetales:38,jigglypuff:39,wigglytuff:40,zubat:41,golbat:42,oddish:43,gloom:44,vileplume:45,
  paras:46,parasect:47,venonat:48,venomoth:49,diglett:50,dugtrio:51,meowth:52,persian:53,psyduck:54,golduck:55,
  mankey:56,primeape:57,growlithe:58,arcanine:59,poliwag:60,poliwhirl:61,poliwrath:62,abra:63,kadabra:64,
  alakazam:65,machop:66,machoke:67,machamp:68,bellsprout:69,weepinbell:70,victreebel:71,tentacool:72,tentacruel:73,
  geodude:74,graveler:75,golem:76,ponyta:77,rapidash:78,slowpoke:79,slowbro:80,magnemite:81,magneton:82,
  farfetchd:83,doduo:84,dodrio:85,seel:86,dewgong:87,grimer:88,muk:89,shellder:90,cloyster:91,
  gastly:92,haunter:93,gengar:94,onix:95,drowzee:96,hypno:97,krabby:98,kingler:99,voltorb:100,electrode:101,
  exeggcute:102,exeggutor:103,cubone:104,marowak:105,hitmonlee:106,hitmonchan:107,lickitung:108,koffing:109,
  weezing:110,rhyhorn:111,rhydon:112,chansey:113,tangela:114,kangaskhan:115,horsea:116,seadra:117,
  goldeen:118,seaking:119,staryu:120,starmie:121,mrmime:122,scyther:123,jynx:124,electabuzz:125,magmar:126,
  pinsir:127,tauros:128,magikarp:129,gyarados:130,lapras:131,ditto:132,eevee:133,vaporeon:134,jolteon:135,
  flareon:136,porygon:137,omanyte:138,omastar:139,kabuto:140,kabutops:141,aerodactyl:142,snorlax:143,
  articuno:144,zapdos:145,moltres:146,dratini:147,dragonair:148,dragonite:149,mewtwo:150,mew:151,
  scizor:212,lucario:448,garchomp:445,tyranitar:248,
};

const normalizeTypes = (pokemon: Record<string, unknown>): string => {
  if (typeof pokemon.types === 'string') {
    if (pokemon.types.startsWith('[')) {
      try {
        const parsed = JSON.parse(pokemon.types);
        if (Array.isArray(parsed)) return parsed.join(',');
      } catch { /* use as is */ }
    }
    return pokemon.types;
  }
  if (Array.isArray(pokemon.types)) return pokemon.types.join(',');
  return 'Normal';
};

export default function SelectTeamPage() {
  const router = useRouter();
  const [starters, setStarters] = useState<Pokemon[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Pokemon[]>([]);
  const [previewPokemon, setPreviewPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    async function fetchStarters() {
      try {
        const res = await fetch('/api/pokemon?starters=true&includeMoves=true');
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map((p: Record<string, unknown>) => ({
            ...p,
            types: normalizeTypes(p),
          }));
          setStarters(normalized);
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
    const exists = selectedTeam.findIndex(p => p.id === pokemon.id);
    if (exists !== -1) {
      setSelectedTeam(prev => prev.filter(p => p.id !== pokemon.id));
    } else if (selectedTeam.length < 3) {
      setSelectedTeam(prev => [...prev, pokemon]);
    }
  }, [selectedTeam]);

  const confirmTeam = () => {
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
        body: JSON.stringify({ pokemonIds: selectedTeam.map(p => p.id) }),
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
    const firstType = types?.split(',')[0]?.toLowerCase() || 'normal';
    return TYPE_COLORS[firstType] || '#777';
  };

  const getImage = (name: string) => {
    const id = POKEMON_IDS[name?.toLowerCase() || 'pikachu'] || 25;
    return `${POKEAPI_SPRITE}/${id}.png`;
  };

  const parseEnergyCost = (costStr: string): Record<string, number> => {
    try { return JSON.parse(costStr); } catch { return {}; }
  };

  const displayPokemon = previewPokemon || (selectedTeam.length > 0 ? selectedTeam[selectedTeam.length - 1] : null);

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
              <h2>Selecionar Time</h2>
            </div>
            <div className="content-box-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  Carregando Pokémon...
                </div>
              ) : (
                <>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                    Escolha 3 Pokémon para batalhar na Arena.
                  </p>

                  {error && (
                    <div style={{
                      padding: '8px 12px', borderRadius: '6px', marginBottom: '12px',
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171', fontSize: '12px',
                    }}>
                      {error}
                    </div>
                  )}

                  {/* Selected Team Slots */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {[0, 1, 2].map(idx => {
                      const pokemon = selectedTeam[idx];
                      return (
                        <div key={idx} style={{
                          background: pokemon ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                          border: pokemon ? `1px solid ${getTypeColor(pokemon.types)}40` : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px', padding: '10px', textAlign: 'center', minHeight: '80px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: pokemon ? 'pointer' : 'default',
                        }}
                          onClick={() => pokemon && togglePokemon(pokemon)}
                        >
                          {pokemon ? (
                            <>
                              <img src={getImage(pokemon.name)} alt={pokemon.name}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', marginBottom: '4px' }} />
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>{pokemon.name}</span>
                              <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
                                {pokemon.types.split(',').filter(t => t).map((type, i) => (
                                  <span key={i} style={{
                                    fontSize: '8px', fontWeight: 600, padding: '1px 5px', borderRadius: '3px',
                                    background: TYPE_COLORS[type?.toLowerCase() || 'normal'] || '#777', color: '#fff',
                                  }}>
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#334155' }}>Slot {idx + 1}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress + Confirm */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(selectedTeam.length / 3) * 100}%`, height: '100%',
                          background: selectedTeam.length === 3 ? '#22c55e' : 'linear-gradient(90deg, #ef4444, #f59e0b)',
                          borderRadius: '2px', transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        {selectedTeam.length}/3 Selecionados
                      </span>
                    </div>
                    <button onClick={confirmTeam} disabled={selectedTeam.length !== 3 || submitting} style={{
                      padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      background: selectedTeam.length === 3 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                      border: selectedTeam.length === 3 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      color: selectedTeam.length === 3 ? '#f87171' : '#334155',
                      cursor: selectedTeam.length === 3 ? 'pointer' : 'not-allowed',
                    }}>
                      {selectedTeam.length === 3 ? 'Confirmar Time' : `Faltam ${3 - selectedTeam.length}`}
                    </button>
                  </div>

                  {/* Pokemon Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '20px' }}>
                    {starters.map(pokemon => {
                      const isSelected = selectedTeam.find(p => p.id === pokemon.id);
                      const isDisabled = !isSelected && selectedTeam.length >= 3;

                      return (
                        <div
                          key={pokemon.id}
                          style={{
                            background: isSelected ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px', padding: '10px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1, textAlign: 'center', transition: 'all 0.2s',
                          }}
                          onClick={() => !isDisabled && togglePokemon(pokemon)}
                          onMouseEnter={() => setPreviewPokemon(pokemon)}
                          onMouseLeave={() => setPreviewPokemon(null)}
                        >
                          {isSelected && (
                            <div style={{
                              fontSize: '10px', fontWeight: 700, color: '#f87171', marginBottom: '4px',
                            }}>
                              #{selectedTeam.findIndex(p => p.id === pokemon.id) + 1}
                            </div>
                          )}
                          <img src={getImage(pokemon.name)} alt={pokemon.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }} />
                          <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                            {pokemon.name}
                          </h4>
                          <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '4px' }}>
                            {pokemon.types.split(',').filter(t => t).map((type, i) => (
                              <span key={i} style={{
                                fontSize: '9px', fontWeight: 600, padding: '1px 6px', borderRadius: '3px',
                                background: TYPE_COLORS[type?.toLowerCase() || 'normal'] || '#777', color: '#fff',
                              }}>
                                {type}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            HP {pokemon.health}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Details Preview */}
                  {displayPokemon && (
                    <div style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '16px',
                    }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
                        {displayPokemon.name} — Habilidades
                      </h4>
                      {displayPokemon.description && (
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>{displayPokemon.description}</p>
                      )}
                      {displayPokemon.moves && displayPokemon.moves.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {displayPokemon.moves.map((move, idx) => {
                            const costs = parseEnergyCost(move.energyCost);
                            return (
                              <div key={move.id} style={{
                                background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '8px',
                                border: '1px solid rgba(255,255,255,0.04)',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>
                                    {idx + 1}. {move.name}
                                  </span>
                                  <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
                                    {move.damage > 0 && (
                                      <span style={{ color: '#f87171', fontWeight: 600 }}>{move.damage} DMG</span>
                                    )}
                                    {move.cooldown > 0 && (
                                      <span style={{ color: '#64748b' }}>CD {move.cooldown}</span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                                  {Object.entries(costs).map(([type, count]) => (
                                    <span key={type} style={{
                                      fontSize: '9px', fontWeight: 600, padding: '1px 5px', borderRadius: '3px',
                                      background: TYPE_COLORS[type?.toLowerCase() || 'normal'] || '#777', color: '#fff',
                                    }}>
                                      {count} {type}
                                    </span>
                                  ))}
                                </div>
                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                                  {move.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ fontSize: '10px', color: '#64748b' }}>
                          Passe o mouse sobre um Pokémon para ver detalhes.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={overlayStyle} onClick={() => setShowConfirmation(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0f1428', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '24px', maxWidth: '420px', width: '90%',
          }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
              Confirmar Time
            </h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
              {selectedTeam.map((pokemon, idx) => (
                <div key={pokemon.id} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden',
                    border: `2px solid ${getTypeColor(pokemon.types)}`, marginBottom: '4px',
                  }}>
                    <img src={getImage(pokemon.name)} alt={pokemon.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>#{idx + 1}</span>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>{pokemon.name}</div>
                </div>
              ))}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
              Pronto para começar sua jornada com este time?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => setShowConfirmation(false)} disabled={submitting} style={{
                padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', cursor: 'pointer',
              }}>
                Voltar
              </button>
              <button onClick={finalConfirm} disabled={submitting} style={{
                padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171', cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1,
              }}>
                {submitting ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
