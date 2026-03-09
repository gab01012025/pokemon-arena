/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
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

// ============ BASE-STAGE KANTO POKEMON (evolve during battle) ============
const ALL_POKEMON: Pokemon[] = [
  // === STARTERS ===
  { id: 1, name: 'Bulbasaur', type: 'grass', description: 'A strange seed was planted on its back at birth.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Vine Whip', description: '20 damage' },
    { id: 's3', name: 'Leech Seed', description: 'Drain 10/turn' },
    { id: 's4', name: 'Razor Leaf', description: '30 damage' },
  ]},
  { id: 4, name: 'Charmander', type: 'fire', description: 'The flame on its tail shows its life force.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Ember', description: '20 damage, burn' },
    { id: 's3', name: 'Dragon Rage', description: '25 damage' },
    { id: 's4', name: 'Flamethrower', description: '35 damage' },
  ]},
  { id: 7, name: 'Squirtle', type: 'water', description: 'It shelters in its shell and sprays water.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Water Gun', description: '20 damage' },
    { id: 's3', name: 'Withdraw', description: '+30 defense' },
    { id: 's4', name: 'Bubble Beam', description: '30 damage' },
  ]},
  // === ICONIC ===
  { id: 25, name: 'Pikachu', type: 'electric', description: 'It stores electricity in its cheeks.', skills: [
    { id: 's1', name: 'Thunder Shock', description: '20 damage' },
    { id: 's2', name: 'Quick Attack', description: '25 priority' },
    { id: 's3', name: 'Thunderbolt', description: '35 damage' },
    { id: 's4', name: 'Thunder', description: '50 damage' },
  ]},
  { id: 133, name: 'Eevee', type: 'normal', description: 'Its genetic code is irregular. It may mutate if exposed to radiation from elemental stones.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Quick Attack', description: '20 priority' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Swift', description: '30 never miss' },
  ]},
  { id: 52, name: 'Meowth', type: 'normal', description: 'It loves coins. It searches for shiny objects at night.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Bite', description: '20 damage' },
    { id: 's3', name: 'Pay Day', description: '25 damage' },
    { id: 's4', name: 'Slash', description: '35 damage' },
  ]},
  // === EARLY ROUTES ===
  { id: 10, name: 'Caterpie', type: 'bug', description: 'For protection, it releases a stench from antennae.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'String Shot', description: 'Slow enemy' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Struggle', description: '25 damage' },
  ]},
  { id: 13, name: 'Weedle', type: 'bug', description: 'It eats its weight in leaves every day.', skills: [
    { id: 's1', name: 'Poison Sting', description: '15 poison' },
    { id: 's2', name: 'String Shot', description: 'Slow enemy' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Struggle', description: '25 damage' },
  ]},
  { id: 16, name: 'Pidgey', type: 'flying', description: 'A common sight in forests and woods.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Gust', description: '20 damage' },
    { id: 's3', name: 'Quick Attack', description: '25 priority' },
    { id: 's4', name: 'Wing Attack', description: '30 damage' },
  ]},
  { id: 19, name: 'Rattata', type: 'normal', description: 'Its fangs are long and sharp.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Quick Attack', description: '20 priority' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Hyper Fang', description: '35 damage' },
  ]},
  { id: 21, name: 'Spearow', type: 'flying', description: 'It flaps its short wings to flush out insects.', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Fury Attack', description: '25 damage' },
    { id: 's3', name: 'Aerial Ace', description: '30 damage' },
    { id: 's4', name: 'Mirror Move', description: 'Copy last attack' },
  ]},
  // === POISON/GROUND ===
  { id: 23, name: 'Ekans', type: 'poison', description: 'It sneaks through grass without making a sound.', skills: [
    { id: 's1', name: 'Wrap', description: '15 trap damage' },
    { id: 's2', name: 'Poison Sting', description: '20 poison' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Acid', description: '30 damage' },
  ]},
  { id: 27, name: 'Sandshrew', type: 'ground', description: 'It burrows and lives underground.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Sand Attack', description: 'Lower accuracy' },
    { id: 's3', name: 'Swift', description: '25 never miss' },
    { id: 's4', name: 'Dig', description: '35 damage' },
  ]},
  // === NIDORAN ===
  { id: 29, name: 'Nidoran♀', type: 'poison', description: 'A docile Pokémon that prefers to avoid fighting.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Poison Sting', description: '20 poison' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Double Kick', description: '30 damage' },
  ]},
  { id: 32, name: 'Nidoran♂', type: 'poison', description: 'It stiffens its ears to sense danger.', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Poison Sting', description: '20 poison' },
    { id: 's3', name: 'Horn Attack', description: '25 damage' },
    { id: 's4', name: 'Double Kick', description: '30 damage' },
  ]},
  // === FIRE ===
  { id: 37, name: 'Vulpix', type: 'fire', description: 'At birth, it has just one tail that splits as it grows.', skills: [
    { id: 's1', name: 'Ember', description: '15 damage' },
    { id: 's2', name: 'Quick Attack', description: '20 priority' },
    { id: 's3', name: 'Fire Spin', description: '25 trap' },
    { id: 's4', name: 'Flamethrower', description: '35 damage' },
  ]},
  { id: 58, name: 'Growlithe', type: 'fire', description: 'Extremely loyal. It will fearlessly bark at any foe.', skills: [
    { id: 's1', name: 'Bite', description: '15 damage' },
    { id: 's2', name: 'Ember', description: '20 damage' },
    { id: 's3', name: 'Flame Wheel', description: '25 damage' },
    { id: 's4', name: 'Flamethrower', description: '35 damage' },
  ]},
  { id: 77, name: 'Ponyta', type: 'fire', description: 'Its hooves are 10 times harder than diamonds.', skills: [
    { id: 's1', name: 'Ember', description: '15 damage' },
    { id: 's2', name: 'Stomp', description: '20 damage' },
    { id: 's3', name: 'Fire Spin', description: '25 trap' },
    { id: 's4', name: 'Flame Charge', description: '30 damage' },
  ]},
  // === WATER ===
  { id: 60, name: 'Poliwag', type: 'water', description: 'The spiral pattern on its belly is its internal organs showing through.', skills: [
    { id: 's1', name: 'Water Gun', description: '15 damage' },
    { id: 's2', name: 'Bubble Beam', description: '20 damage' },
    { id: 's3', name: 'Hypnosis', description: 'Sleep enemy' },
    { id: 's4', name: 'Body Slam', description: '30 damage' },
  ]},
  { id: 116, name: 'Horsea', type: 'water', description: 'Known to shoot down flying bugs with precision blasts of ink.', skills: [
    { id: 's1', name: 'Water Gun', description: '15 damage' },
    { id: 's2', name: 'Smokescreen', description: 'Lower accuracy' },
    { id: 's3', name: 'Bubble Beam', description: '25 damage' },
    { id: 's4', name: 'Dragon Rage', description: '30 damage' },
  ]},
  { id: 129, name: 'Magikarp', type: 'water', description: 'Virtually useless in battle, but evolves into the fearsome Gyarados.', skills: [
    { id: 's1', name: 'Splash', description: 'Nothing happens' },
    { id: 's2', name: 'Tackle', description: '10 damage' },
    { id: 's3', name: 'Flail', description: '20 damage' },
    { id: 's4', name: 'Bounce', description: '25 damage' },
  ]},
  // === PSYCHIC/GHOST ===
  { id: 63, name: 'Abra', type: 'psychic', description: 'It sleeps 18 hours a day. It uses a variety of psychic moves.', skills: [
    { id: 's1', name: 'Teleport', description: 'Dodge attack' },
    { id: 's2', name: 'Confusion', description: '20 damage' },
    { id: 's3', name: 'Psybeam', description: '25 damage' },
    { id: 's4', name: 'Hidden Power', description: '30 damage' },
  ]},
  { id: 92, name: 'Gastly', type: 'ghost', description: 'Almost invisible, this gaseous Pokémon cloaks the target to put it to sleep.', skills: [
    { id: 's1', name: 'Lick', description: '15 damage' },
    { id: 's2', name: 'Hypnosis', description: 'Sleep enemy' },
    { id: 's3', name: 'Night Shade', description: '25 damage' },
    { id: 's4', name: 'Shadow Ball', description: '30 damage' },
  ]},
  // === FIGHTING/ROCK ===
  { id: 66, name: 'Machop', type: 'fighting', description: 'It trains by lifting rocks in the mountains.', skills: [
    { id: 's1', name: 'Karate Chop', description: '15 damage' },
    { id: 's2', name: 'Low Kick', description: '20 damage' },
    { id: 's3', name: 'Seismic Toss', description: '25 damage' },
    { id: 's4', name: 'Cross Chop', description: '35 damage' },
  ]},
  { id: 74, name: 'Geodude', type: 'rock', description: 'Found in fields and mountains. Mistaken for boulders.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Rock Throw', description: '20 damage' },
    { id: 's3', name: 'Rock Slide', description: '30 damage' },
    { id: 's4', name: 'Self-Destruct', description: '50 recoil' },
  ]},
  // === ELECTRIC/STEEL ===
  { id: 81, name: 'Magnemite', type: 'electric', description: 'Uses anti-gravity to stay suspended. Emits electromagnetic waves.', skills: [
    { id: 's1', name: 'Thunder Shock', description: '15 damage' },
    { id: 's2', name: 'Spark', description: '20 damage' },
    { id: 's3', name: 'Thunder Wave', description: 'Paralyze' },
    { id: 's4', name: 'Thunderbolt', description: '30 damage' },
  ]},
  // === DRAGON ===
  { id: 147, name: 'Dratini', type: 'dragon', description: 'Long considered a mythical Pokémon until recently, when a colony was found living underwater.', skills: [
    { id: 's1', name: 'Wrap', description: '15 damage' },
    { id: 's2', name: 'Dragon Rage', description: '25 damage' },
    { id: 's3', name: 'Twister', description: '30 damage' },
    { id: 's4', name: 'Slam', description: '35 damage' },
  ]},
  // === GRASS/POISON ===
  { id: 43, name: 'Oddish', type: 'grass', description: 'During the day, it buries itself in soil. At night, it wanders around sowing seeds.', skills: [
    { id: 's1', name: 'Absorb', description: '15 drain' },
    { id: 's2', name: 'Acid', description: '20 damage' },
    { id: 's3', name: 'Sleep Powder', description: 'Sleep enemy' },
    { id: 's4', name: 'Razor Leaf', description: '30 damage' },
  ]},
  // === MISC ===
  { id: 35, name: 'Clefairy', type: 'fairy', description: 'Its adorable appearance makes it popular as a pet. It is rare and found only in certain areas.', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' },
    { id: 's2', name: 'Double Slap', description: '20 damage' },
    { id: 's3', name: 'Sing', description: 'Sleep enemy' },
    { id: 's4', name: 'Metronome', description: 'Random move' },
  ]},
  { id: 39, name: 'Jigglypuff', type: 'fairy', description: 'When its huge eyes waver, it sings a mysteriously soothing melody that lulls its enemies to sleep.', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' },
    { id: 's2', name: 'Sing', description: 'Sleep enemy' },
    { id: 's3', name: 'Body Slam', description: '25 damage' },
    { id: 's4', name: 'Double Slap', description: '30 damage' },
  ]},
  { id: 104, name: 'Cubone', type: 'ground', description: 'It always wears the skull of its dead mother as a helmet.', skills: [
    { id: 's1', name: 'Bone Club', description: '15 damage' },
    { id: 's2', name: 'Headbutt', description: '20 damage' },
    { id: 's3', name: 'Bonemerang', description: '30 damage' },
    { id: 's4', name: 'Bone Rush', description: '35 damage' },
  ]},
  { id: 109, name: 'Koffing', type: 'poison', description: 'Because it stores several kinds of toxic gases in its body, it is prone to exploding without warning.', skills: [
    { id: 's1', name: 'Poison Gas', description: 'Poison enemy' },
    { id: 's2', name: 'Tackle', description: '15 damage' },
    { id: 's3', name: 'Sludge', description: '25 damage' },
    { id: 's4', name: 'Self-Destruct', description: '50 recoil' },
  ]},
  { id: 100, name: 'Voltorb', type: 'electric', description: 'Usually found in power plants. It resembles a Poké Ball.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Spark', description: '20 damage' },
    { id: 's3', name: 'Rollout', description: '25 damage' },
    { id: 's4', name: 'Self-Destruct', description: '50 recoil' },
  ]},
  { id: 79, name: 'Slowpoke', type: 'water', description: 'Incredibly slow and sluggish. It is quite content to laze about.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Water Gun', description: '20 damage' },
    { id: 's3', name: 'Confusion', description: '25 damage' },
    { id: 's4', name: 'Headbutt', description: '30 damage' },
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
      logger.info('Could not save to API, using localStorage');
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
