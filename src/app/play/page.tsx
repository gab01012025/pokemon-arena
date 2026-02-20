/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './play.css';

// ============ TYPES ============
interface Skill {
  id: string;
  name: string;
  description: string;
}

interface Pokemon {
  id: number;
  name: string;
  description: string;
  type: string;
  skills: Skill[];
}

// ============ ALL 28 KANTO POKEMON ============
const ALL_POKEMON: Pokemon[] = [
  // #001-003 Bulbasaur line
  { id: 1, name: 'Bulbasaur', type: 'grass', description: 'A strange seed was planted on its back at birth.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Vine Whip', description: '20 damage' },
    { id: 's3', name: 'Leech Seed', description: 'Drain 10/turn' },
    { id: 's4', name: 'Razor Leaf', description: '30 damage' },
  ]},
  { id: 2, name: 'Ivysaur', type: 'grass', description: 'The bulb on its back grows as it absorbs nutrients.', skills: [
    { id: 's1', name: 'Razor Leaf', description: '25 damage' },
    { id: 's2', name: 'Poison Powder', description: 'Poison 12/turn' },
    { id: 's3', name: 'Sleep Powder', description: 'Stun 2 turns' },
    { id: 's4', name: 'Solar Beam', description: '50 damage' },
  ]},
  { id: 3, name: 'Venusaur', type: 'grass', description: 'The flower blooms when absorbing solar energy.', skills: [
    { id: 's1', name: 'Petal Dance', description: '40 damage' },
    { id: 's2', name: 'Sludge Bomb', description: '35 damage' },
    { id: 's3', name: 'Solar Beam', description: '55 damage' },
    { id: 's4', name: 'Frenzy Plant', description: '70 damage' },
  ]},
  // #004-006 Charmander line
  { id: 4, name: 'Charmander', type: 'fire', description: 'The flame on its tail shows its life force.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Ember', description: '20 damage, burn' },
    { id: 's3', name: 'Dragon Rage', description: '25 damage' },
    { id: 's4', name: 'Flamethrower', description: '35 damage' },
  ]},
  { id: 5, name: 'Charmeleon', type: 'fire', description: 'It has a barbaric nature in battle.', skills: [
    { id: 's1', name: 'Slash', description: '25 damage' },
    { id: 's2', name: 'Flamethrower', description: '40 damage' },
    { id: 's3', name: 'Fire Fang', description: '30 damage' },
    { id: 's4', name: 'Fire Spin', description: '25 trap damage' },
  ]},
  { id: 6, name: 'Charizard', type: 'fire', description: 'It spits fire hot enough to melt boulders.', skills: [
    { id: 's1', name: 'Wing Attack', description: '25 damage' },
    { id: 's2', name: 'Flamethrower', description: '45 damage' },
    { id: 's3', name: 'Fire Blast', description: '55 damage' },
    { id: 's4', name: 'Blast Burn', description: '70 damage' },
  ]},
  // #007-009 Squirtle line
  { id: 7, name: 'Squirtle', type: 'water', description: 'It shelters in its shell and sprays water.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Water Gun', description: '20 damage' },
    { id: 's3', name: 'Withdraw', description: '+30 defense' },
    { id: 's4', name: 'Bubble Beam', description: '30 damage' },
  ]},
  { id: 8, name: 'Wartortle', type: 'water', description: 'Its fluffy tail is a symbol of longevity.', skills: [
    { id: 's1', name: 'Bite', description: '25 damage' },
    { id: 's2', name: 'Water Pulse', description: '35 damage' },
    { id: 's3', name: 'Protect', description: 'Invulnerable 1 turn' },
    { id: 's4', name: 'Aqua Tail', description: '45 damage' },
  ]},
  { id: 9, name: 'Blastoise', type: 'water', description: 'The cannons on its shell can blast water.', skills: [
    { id: 's1', name: 'Skull Bash', description: '35 damage' },
    { id: 's2', name: 'Hydro Pump', description: '55 damage' },
    { id: 's3', name: 'Rain Dance', description: '+Water damage' },
    { id: 's4', name: 'Hydro Cannon', description: '70 damage' },
  ]},
  // #010-012 Caterpie line
  { id: 10, name: 'Caterpie', type: 'bug', description: 'For protection, it releases a stench from antennae.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'String Shot', description: 'Slow enemy' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Struggle', description: '25 damage' },
  ]},
  { id: 11, name: 'Metapod', type: 'bug', description: 'A steel-hard shell protects its tender body.', skills: [
    { id: 's1', name: 'Harden', description: '+20 defense' },
    { id: 's2', name: 'Tackle', description: '15 damage' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Iron Defense', description: '+40 defense' },
  ]},
  { id: 12, name: 'Butterfree', type: 'bug', description: 'It loves honey and can find flowers miles away.', skills: [
    { id: 's1', name: 'Gust', description: '25 damage' },
    { id: 's2', name: 'Psybeam', description: '35 damage' },
    { id: 's3', name: 'Sleep Powder', description: 'Stun 2 turns' },
    { id: 's4', name: 'Bug Buzz', description: '45 damage' },
  ]},
  // #013-015 Weedle line
  { id: 13, name: 'Weedle', type: 'bug', description: 'It eats its weight in leaves every day.', skills: [
    { id: 's1', name: 'Poison Sting', description: '15 poison' },
    { id: 's2', name: 'String Shot', description: 'Slow enemy' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Struggle', description: '25 damage' },
  ]},
  { id: 14, name: 'Kakuna', type: 'bug', description: 'Almost incapable of moving, it can only harden.', skills: [
    { id: 's1', name: 'Harden', description: '+20 defense' },
    { id: 's2', name: 'Poison Sting', description: '15 poison' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Iron Defense', description: '+40 defense' },
  ]},
  { id: 15, name: 'Beedrill', type: 'bug', description: 'It has 3 poisonous stingers on its body.', skills: [
    { id: 's1', name: 'Fury Attack', description: '25 damage' },
    { id: 's2', name: 'Twineedle', description: '30 damage' },
    { id: 's3', name: 'Poison Jab', description: '40 damage' },
    { id: 's4', name: 'Pin Missile', description: '50 damage' },
  ]},
  // #016-018 Pidgey line
  { id: 16, name: 'Pidgey', type: 'flying', description: 'A common sight in forests and woods.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Gust', description: '20 damage' },
    { id: 's3', name: 'Quick Attack', description: '25 priority' },
    { id: 's4', name: 'Wing Attack', description: '30 damage' },
  ]},
  { id: 17, name: 'Pidgeotto', type: 'flying', description: 'Very protective of its territory.', skills: [
    { id: 's1', name: 'Wing Attack', description: '30 damage' },
    { id: 's2', name: 'Aerial Ace', description: '35 damage' },
    { id: 's3', name: 'Agility', description: 'Speed boost' },
    { id: 's4', name: 'Air Slash', description: '45 damage' },
  ]},
  { id: 18, name: 'Pidgeot', type: 'flying', description: 'It can fly at Mach 2 speed.', skills: [
    { id: 's1', name: 'Quick Attack', description: '30 priority' },
    { id: 's2', name: 'Air Slash', description: '45 damage' },
    { id: 's3', name: 'Roost', description: 'Heal 40 HP' },
    { id: 's4', name: 'Hurricane', description: '55 damage' },
  ]},
  // #019-020 Rattata line
  { id: 19, name: 'Rattata', type: 'normal', description: 'Its fangs are long and sharp.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Quick Attack', description: '20 priority' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Hyper Fang', description: '35 damage' },
  ]},
  { id: 20, name: 'Raticate', type: 'normal', description: 'Its whiskers help it balance.', skills: [
    { id: 's1', name: 'Quick Attack', description: '25 priority' },
    { id: 's2', name: 'Hyper Fang', description: '40 damage' },
    { id: 's3', name: 'Crunch', description: '45 damage' },
    { id: 's4', name: 'Super Fang', description: '50% HP damage' },
  ]},
  // #021-022 Spearow line
  { id: 21, name: 'Spearow', type: 'flying', description: 'It flaps its short wings to flush out insects.', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Fury Attack', description: '25 damage' },
    { id: 's3', name: 'Aerial Ace', description: '30 damage' },
    { id: 's4', name: 'Mirror Move', description: 'Copy last attack' },
  ]},
  { id: 22, name: 'Fearow', type: 'flying', description: 'It has the stamina to fly all day.', skills: [
    { id: 's1', name: 'Fury Attack', description: '30 damage' },
    { id: 's2', name: 'Aerial Ace', description: '35 damage' },
    { id: 's3', name: 'Drill Peck', description: '45 damage' },
    { id: 's4', name: 'Drill Run', description: '50 damage' },
  ]},
  // #023-024 Ekans line
  { id: 23, name: 'Ekans', type: 'poison', description: 'It sneaks through grass without making a sound.', skills: [
    { id: 's1', name: 'Wrap', description: '15 trap damage' },
    { id: 's2', name: 'Poison Sting', description: '20 poison' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Acid', description: '30 damage' },
  ]},
  { id: 24, name: 'Arbok', type: 'poison', description: 'The pattern on its belly scares enemies.', skills: [
    { id: 's1', name: 'Bite', description: '25 damage' },
    { id: 's2', name: 'Poison Fang', description: '35 poison' },
    { id: 's3', name: 'Glare', description: 'Paralyze enemy' },
    { id: 's4', name: 'Gunk Shot', description: '50 damage' },
  ]},
  // #025-026 Pikachu line
  { id: 25, name: 'Pikachu', type: 'electric', description: 'It stores electricity in its cheeks.', skills: [
    { id: 's1', name: 'Thunder Shock', description: '20 damage' },
    { id: 's2', name: 'Quick Attack', description: '25 priority' },
    { id: 's3', name: 'Thunderbolt', description: '35 damage' },
    { id: 's4', name: 'Thunder', description: '50 damage' },
  ]},
  { id: 26, name: 'Raichu', type: 'electric', description: 'Its long tail serves as ground protection.', skills: [
    { id: 's1', name: 'Thunder Punch', description: '30 damage' },
    { id: 's2', name: 'Thunderbolt', description: '45 damage' },
    { id: 's3', name: 'Thunder', description: '55 damage' },
    { id: 's4', name: 'Volt Tackle', description: '60 recoil' },
  ]},
  // #027-028 Sandshrew line
  { id: 27, name: 'Sandshrew', type: 'ground', description: 'It burrows and lives underground.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Sand Attack', description: 'Lower accuracy' },
    { id: 's3', name: 'Swift', description: '25 never miss' },
    { id: 's4', name: 'Dig', description: '35 damage' },
  ]},
  { id: 28, name: 'Sandslash', type: 'ground', description: 'It curls up to protect itself.', skills: [
    { id: 's1', name: 'Slash', description: '30 damage' },
    { id: 's2', name: 'Dig', description: '40 damage' },
    { id: 's3', name: 'Sandstorm', description: '10/turn AoE' },
    { id: 's4', name: 'Earthquake', description: '55 AoE damage' },
  ]},
];

// ============ TYPE COLORS ============
const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
  psychic: '#F85888', ghost: '#705898', dragon: '#7038F8', fighting: '#C03028',
  normal: '#A8A878', rock: '#B8A038', steel: '#B8B8D0', ice: '#98D8D8',
  dark: '#705848', fairy: '#EE99AC', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', bug: '#A8B820',
};

const getSprite = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// ============ MAIN COMPONENT ============
export default function PlayPage() {
  const router = useRouter();
  const [hoveredPokemon, setHoveredPokemon] = useState<Pokemon | null>(null);
  const [team, setTeam] = useState<(Pokemon | null)[]>([null, null, null]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState({ name: 'TRAINER', clan: 'CLANLESS', level: 1, wins: 0, losses: 0 });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser({
        name: d.user.username?.toUpperCase() || 'TRAINER',
        clan: d.user.clan?.name?.toUpperCase() || 'CLANLESS',
        level: d.user.level || 1,
        wins: d.user.wins || 0,
        losses: d.user.losses || 0,
      });
    }).catch(() => {});
  }, []);

  const toggleTeam = useCallback((pokemon: Pokemon) => {
    const existingIdx = team.findIndex(p => p?.id === pokemon.id);
    if (existingIdx !== -1) {
      const newTeam = [...team];
      newTeam[existingIdx] = null;
      setTeam(newTeam);
    } else {
      const emptyIdx = team.findIndex(p => p === null);
      if (emptyIdx !== -1) {
        const newTeam = [...team];
        newTeam[emptyIdx] = pokemon;
        setTeam(newTeam);
      }
    }
  }, [team]);

  const removeFromTeam = useCallback((index: number) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  }, []);

  const teamComplete = team.every(p => p !== null);
  const teamCount = team.filter(p => p !== null).length;

  const startBattle = useCallback(async (mode: string) => {
    if (!teamComplete) return;
    
    // Get team Pokemon data for battle
    const selectedPokemon = team.filter(p => p !== null).map(p => ({
      id: p!.id,
      name: p!.name,
      type: p!.type,
      description: p!.description,
      skills: p!.skills,
    }));
    
    // Save to localStorage for battle page to use
    localStorage.setItem('battleTeam', JSON.stringify(selectedPokemon));
    
    // Also try to save to API (for logged in users)
    try {
      const pokemonIds = selectedPokemon.map(p => p.name);
      await fetch('/api/trainer/battle-team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonNames: pokemonIds }),
      });
    } catch (e) {
      console.log('Could not save to API, using localStorage');
    }
    
    if (mode === 'ladder') {
      setIsSearching(true);
      setTimeout(() => router.push('/battle/ai'), 2500);
    } else {
      router.push('/battle/ai');
    }
  }, [teamComplete, team, router]);

  const displayPokemon = hoveredPokemon || team.find(p => p !== null) || null;

  return (
    <div className="pokedex-page">
      <div className="pokedex-device">
        {/* Search Overlay */}
        {isSearching && (
          <div className="search-overlay">
            <div className="search-content">
              <div className="pokeball-spinner"></div>
              <h2>SEARCHING FOR OPPONENT...</h2>
              <p>Finding a worthy challenger</p>
              <button onClick={() => setIsSearching(false)}>CANCEL</button>
            </div>
          </div>
        )}

        {/* Pokedex Top LEDs */}
        <div className="pokedex-top">
          <div className="led-big blue"></div>
          <div className="led-small red"></div>
          <div className="led-small yellow"></div>
          <div className="led-small green"></div>
        </div>

        {/* Main Body */}
        <div className="pokedex-body">
          {/* Left Side - Screen + Grid */}
          <div className="pokedex-left">
            {/* Header Info */}
            <div className="screen-header">
              <div className="trainer-info">
                <span className="trainer-name">{user.name}</span>
                <span className="trainer-clan">{user.clan}</span>
              </div>
              <div className="game-title">POKÉARENA</div>
              <div className="trainer-stats">
                <div className="stat">
                  <span className="stat-label">LVL</span>
                  <span className="stat-value">{user.level}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">W/L</span>
                  <span className="stat-value">{user.wins}/{user.losses}</span>
                </div>
              </div>
            </div>

            {/* Pokemon Grid Screen */}
            <div className="screen-main">
              <div className="pokemon-grid">
                {ALL_POKEMON.map((pokemon) => {
                  const inTeam = team.some(p => p?.id === pokemon.id);
                  return (
                    <div
                      key={pokemon.id}
                      className={`pokemon-cell ${inTeam ? 'in-team' : ''}`}
                      onClick={() => toggleTeam(pokemon)}
                      onMouseEnter={() => setHoveredPokemon(pokemon)}
                      onMouseLeave={() => setHoveredPokemon(null)}
                    >
                      <img src={getSprite(pokemon.id)} alt={pokemon.name} />
                      {inTeam && <div className="check-mark">✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pokedex-controls">
              <div className="dpad">
                <div className="dpad-up"></div>
                <div className="dpad-center"></div>
                <div className="dpad-down"></div>
                <div className="dpad-left"></div>
                <div className="dpad-right"></div>
              </div>
              <div className="team-display">
                <span className="team-label">TEAM ({teamCount}/3)</span>
                <div className="team-slots">
                  {team.map((pokemon, idx) => (
                    <div 
                      key={idx} 
                      className={`team-slot ${pokemon ? 'filled' : ''}`}
                      onClick={() => pokemon && removeFromTeam(idx)}
                    >
                      {pokemon ? (
                        <>
                          <img src={getSprite(pokemon.id)} alt={pokemon.name} />
                          <div className="slot-remove">✕</div>
                        </>
                      ) : (
                        <span className="slot-num">{idx + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Info Panel */}
          <div className="pokedex-right">
            {/* Info Screen */}
            <div className="info-screen">
              {displayPokemon ? (
                <>
                  <div className="info-header">
                    <span className="poke-name">{displayPokemon.name.toUpperCase()}</span>
                    <span 
                      className="poke-type"
                      style={{ background: TYPE_COLORS[displayPokemon.type] }}
                    >
                      {displayPokemon.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="sprite-container">
                    <img src={getSprite(displayPokemon.id)} alt={displayPokemon.name} />
                  </div>
                  <p className="poke-desc">{displayPokemon.description}</p>
                </>
              ) : (
                <div className="no-pokemon">
                  <div className="pokeball-icon"></div>
                  <p>Select a Pokémon</p>
                </div>
              )}
            </div>

            {/* Skills List */}
            <div className="skills-list">
              {displayPokemon ? (
                displayPokemon.skills.map((skill, i) => (
                  <div key={i} className="skill-item">
                    <span className="skill-num">{i + 1}</span>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="skill-item empty"><span className="skill-num">1</span><span className="skill-name">-</span></div>
                  <div className="skill-item empty"><span className="skill-num">2</span><span className="skill-name">-</span></div>
                  <div className="skill-item empty"><span className="skill-num">3</span><span className="skill-name">-</span></div>
                  <div className="skill-item empty"><span className="skill-num">4</span><span className="skill-name">-</span></div>
                </>
              )}
            </div>

            {/* Pokedex Style Buttons */}
            <div className="pokedex-buttons">
              <button className="poke-btn battle" onClick={() => startBattle('ai')} disabled={!teamComplete}>
                <span className="btn-light"></span>
                BATTLE
              </button>
              <button className="poke-btn quick" onClick={() => startBattle('quick')} disabled={!teamComplete}>
                <span className="btn-light"></span>
                QUICK
              </button>
              <button className="poke-btn ladder" onClick={() => startBattle('ladder')} disabled={!teamComplete}>
                <span className="btn-light"></span>
                LADDER
              </button>
              <button className="poke-btn logout" onClick={() => router.push('/')}>
                <span className="btn-light"></span>
                EXIT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
