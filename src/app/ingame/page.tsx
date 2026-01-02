'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { allPokemon } from '@/data/pokemon';
import { Pokemon } from '@/types/game';
import './ingame.css';

// Mapeamento das extensões das imagens
const pokemonImages: Record<string, string> = {
  'pikachu': '/images/pokemon/pikachu.jpg',
  'charizard': '/images/pokemon/charizard.webp',
  'blastoise': '/images/pokemon/blastoise.jpg',
  'venusaur': '/images/pokemon/venusaur.webp',
  'gengar': '/images/pokemon/gengar.jpeg',
  'alakazam': '/images/pokemon/alakazam.webp',
  'machamp': '/images/pokemon/machamp.jpeg',
  'dragonite': '/images/pokemon/Dragonite.webp',
  'mewtwo': '/images/pokemon/mewtwo.png',
  'lucario': '/images/pokemon/lucario.webp',
  'garchomp': '/images/pokemon/garchomp.webp',
  'vaporeon': '/images/pokemon/vaporeon.webp',
  'jolteon': '/images/pokemon/jolteon.webp',
  'arcanine': '/images/pokemon/arcanine.webp',
  'exeggutor': '/images/pokemon/exeggutor.png',
  'golem': '/images/pokemon/golem.webp',
  'lapras': '/images/pokemon/lapras.jpeg',
  'nidoking': '/images/pokemon/nidoking.webp',
  'scizor': '/images/pokemon/scizor.jpeg',
  'snorlax': '/images/pokemon/snrolax.webp',
  'tyranitar': '/images/pokemon/tyranitar.webp',
};

const getPokemonImage = (pokemonId: string): string => {
  return pokemonImages[pokemonId] || '/images/pokemon/pikachu.jpg';
};

type GameMode = 'ladder' | 'quick' | 'private';
type GameState = 'selecting' | 'searching' | 'battle';

interface SelectedTeam {
  slot1: Pokemon | null;
  slot2: Pokemon | null;
  slot3: Pokemon | null;
}

export default function InGamePage() {
  const router = useRouter();
  const { user, isAuthenticated, checkSession } = useAuthStore();
  const [gameState, setGameState] = useState<GameState>('selecting');
  const [selectedTeam, setSelectedTeam] = useState<SelectedTeam>({
    slot1: null,
    slot2: null,
    slot3: null,
  });
  const [hoveredPokemon, setHoveredPokemon] = useState<Pokemon | null>(null);
  const [searchingMode, setSearchingMode] = useState<GameMode | null>(null);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSelectPokemon = (pokemon: Pokemon) => {
    // Check if pokemon is already selected
    if (selectedTeam.slot1?.id === pokemon.id || 
        selectedTeam.slot2?.id === pokemon.id || 
        selectedTeam.slot3?.id === pokemon.id) {
      // Deselect
      if (selectedTeam.slot1?.id === pokemon.id) {
        setSelectedTeam(prev => ({ ...prev, slot1: null }));
      } else if (selectedTeam.slot2?.id === pokemon.id) {
        setSelectedTeam(prev => ({ ...prev, slot2: null }));
      } else if (selectedTeam.slot3?.id === pokemon.id) {
        setSelectedTeam(prev => ({ ...prev, slot3: null }));
      }
      return;
    }

    // Add to first empty slot
    if (!selectedTeam.slot1) {
      setSelectedTeam(prev => ({ ...prev, slot1: pokemon }));
    } else if (!selectedTeam.slot2) {
      setSelectedTeam(prev => ({ ...prev, slot2: pokemon }));
    } else if (!selectedTeam.slot3) {
      setSelectedTeam(prev => ({ ...prev, slot3: pokemon }));
    }
  };

  const isTeamComplete = selectedTeam.slot1 && selectedTeam.slot2 && selectedTeam.slot3;

  const handleStartGame = (mode: GameMode) => {
    if (!isTeamComplete) {
      alert('You need to select 3 Pokémon first!');
      return;
    }
    setSearchingMode(mode);
    setGameState('searching');
    
    // Simulate matchmaking
    setTimeout(() => {
      setGameState('battle');
    }, 3000);
  };

  const handleCancelSearch = () => {
    setGameState('selecting');
    setSearchingMode(null);
  };

  const handleLogout = () => {
    router.push('/');
  };

  const isPokemonSelected = (pokemon: Pokemon) => {
    return selectedTeam.slot1?.id === pokemon.id || 
           selectedTeam.slot2?.id === pokemon.id || 
           selectedTeam.slot3?.id === pokemon.id;
  };

  if (gameState === 'battle') {
    return (
      <BattleScreen 
        team={selectedTeam} 
        user={user} 
        onExit={() => setGameState('selecting')} 
      />
    );
  }

  return (
    <div className="ingame-wrapper">
      {/* Top Bar */}
      <div className="ingame-topbar">
        <div className="topbar-left">
          <img src="/images/pokemon-poster.jpg" alt="flag" className="flag-icon" />
          <img src="/images/pokemon-group-1.jpg" alt="flag2" className="flag-icon" />
        </div>
        <div className="topbar-avatar">
          <img src="/images/ash-ketchum.webp" alt="Avatar" />
        </div>
      </div>

      {/* Pokemon Info Panel (on hover) */}
      {hoveredPokemon && (
        <div className="pokemon-info-panel">
          <div className="info-panel-header">
            <span className="info-name">{hoveredPokemon.name.toUpperCase()}</span>
            <span className="info-arrow">▶</span>
          </div>
          <div className="info-panel-skills">
            {hoveredPokemon.moves.map((move, i) => (
              <div key={i} className="skill-icon" title={move.name}>
                <img src={`/images/pokemon-pikachu.jpg`} alt={move.name} />
              </div>
            ))}
          </div>
          <div className="info-panel-desc">
            <h3>{hoveredPokemon.name.toUpperCase()}</h3>
            <p>{hoveredPokemon.description}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="ingame-actions">
        <button className="action-btn logout-btn" onClick={handleLogout}>
          LOGOUT
          <span className="pokeball-icon">◐</span>
        </button>
        <button 
          className="action-btn ladder-btn" 
          onClick={() => handleStartGame('ladder')}
          disabled={!isTeamComplete}
        >
          START LADDER GAME
          <span className="pokeball-icon">◐</span>
        </button>
        <button 
          className="action-btn quick-btn" 
          onClick={() => handleStartGame('quick')}
          disabled={!isTeamComplete}
        >
          START QUICK GAME
          <span className="pokeball-icon">◐</span>
        </button>
        <button 
          className="action-btn private-btn" 
          onClick={() => handleStartGame('private')}
          disabled={!isTeamComplete}
        >
          START PRIVATE GAME
          <span className="pokeball-icon">◐</span>
        </button>
      </div>

      {/* Main Selection Area */}
      <div className="ingame-main">
        {/* Left Arrow */}
        <div className="selection-arrow left-arrow">
          <span>❮</span>
        </div>

        {/* Pokemon Grid */}
        <div className="pokemon-grid">
          {allPokemon.map((pokemon) => (
            <div 
              key={pokemon.id}
              className={`pokemon-cell ${isPokemonSelected(pokemon) ? 'selected' : ''}`}
              onClick={() => handleSelectPokemon(pokemon)}
              onMouseEnter={() => setHoveredPokemon(pokemon)}
              onMouseLeave={() => setHoveredPokemon(null)}
            >
              <img 
                src={getPokemonImage(pokemon.id)} 
                alt={pokemon.name}
              />
            </div>
          ))}
        </div>

        {/* Player Info Panel */}
        <div className="player-panel">
          <div className="player-info">
            <p className="player-name">{user?.username?.toUpperCase() || 'GAB123'}</p>
            <p className="player-rank">POKEMON TRAINER</p>
            <p>CLAN: CLANLESS</p>
            <p>LEVEL: {user?.level || 1} (0 XP)</p>
            <p>LADDERRANK: 26573</p>
            <p>RATIO: {user?.wins || 0} - {user?.losses || 0} (+ 0)</p>
          </div>
          
          {/* Selected Team */}
          <div className="selected-team">
            <div className="team-slot">
              {selectedTeam.slot1 ? (
                <img src={getPokemonImage(selectedTeam.slot1.id)} alt={selectedTeam.slot1.name} />
              ) : <div className="empty-slot" />}
            </div>
            <div className="team-slot">
              {selectedTeam.slot2 ? (
                <img src={getPokemonImage(selectedTeam.slot2.id)} alt={selectedTeam.slot2.name} />
              ) : <div className="empty-slot" />}
            </div>
            <div className="team-slot">
              {selectedTeam.slot3 ? (
                <img src={getPokemonImage(selectedTeam.slot3.id)} alt={selectedTeam.slot3.name} />
              ) : <div className="empty-slot" />}
            </div>
          </div>

          <p className={`ready-status ${isTeamComplete ? 'ready' : ''}`}>
            {isTeamComplete ? 'YOU ARE READY TO START A GAME' : 'SELECT 3 POKEMON'}
          </p>
          
          <button className="team-manager-btn">TEAM MANAGER</button>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="ingame-bottom">
        <button className="bottom-btn">OPTIONS</button>
        <button className="bottom-btn missions-btn">CLICK HERE TO CHECK MISSIONS</button>
        <button className="bottom-btn">STYLES</button>
      </div>

      {/* Searching Modal */}
      {gameState === 'searching' && (
        <div className="searching-overlay">
          <div className="searching-modal">
            <h2>SEARCHING FOR {searchingMode?.toUpperCase()} GAME...</h2>
            <div className="searching-animation">
              <img src="/images/pokemon-poster.jpg" alt="Searching" />
            </div>
            <button className="cancel-btn" onClick={handleCancelSearch}>
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Battle Screen Component
interface BattleScreenProps {
  team: SelectedTeam;
  user: { username: string; level: number; wins: number; losses: number } | null;
  onExit: () => void;
}

interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  colorless: number;
}

function BattleScreen({ team, user, onExit }: BattleScreenProps) {
  const [playerHP, setPlayerHP] = useState([100, 100, 100]);
  const [enemyHP, setEnemyHP] = useState([100, 100, 100]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [energy, setEnergy] = useState<Energy>({ fire: 1, water: 0, grass: 0, electric: 0, colorless: 1 });
  const [selectedMoves, setSelectedMoves] = useState<{[key: number]: number | null}>({0: null, 1: null, 2: null});
  const [selectedTargets, setSelectedTargets] = useState<{[key: number]: number | null}>({0: null, 1: null, 2: null});

  const playerTeam = [team.slot1, team.slot2, team.slot3];

  // Simulated enemy team
  const enemyTeam = [
    allPokemon[3] || allPokemon[0],
    allPokemon[4] || allPokemon[1],
    allPokemon[5] || allPokemon[2],
  ];

  const enemyName = "TRAINER RED";
  const enemyRank = "POKEMON MASTER";

  // Calculate total energy cost of selected moves
  const getUsedEnergy = (): Energy => {
    const used: Energy = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
    Object.entries(selectedMoves).forEach(([idx, moveIdx]) => {
      if (moveIdx !== null) {
        const pokemon = playerTeam[parseInt(idx)];
        if (pokemon) {
          const move = pokemon.moves[moveIdx];
          if (move.cost) {
            used.fire += move.cost.fire || 0;
            used.water += move.cost.water || 0;
            used.grass += move.cost.grass || 0;
            used.electric += move.cost.electric || 0;
            used.colorless += move.cost.colorless || 0;
          }
        }
      }
    });
    return used;
  };

  const getRemainingEnergy = (): Energy => {
    const used = getUsedEnergy();
    return {
      fire: energy.fire - used.fire,
      water: energy.water - used.water,
      grass: energy.grass - used.grass,
      electric: energy.electric - used.electric,
      colorless: energy.colorless - used.colorless,
    };
  };

  const canAffordMove = (pokemon: Pokemon, moveIdx: number): boolean => {
    const move = pokemon.moves[moveIdx];
    if (!move.cost) return true;
    const remaining = getRemainingEnergy();
    // Check if we have enough of each specific energy
    if ((move.cost.fire || 0) > remaining.fire + remaining.colorless) return false;
    if ((move.cost.water || 0) > remaining.water + remaining.colorless) return false;
    if ((move.cost.grass || 0) > remaining.grass + remaining.colorless) return false;
    if ((move.cost.electric || 0) > remaining.electric + remaining.colorless) return false;
    return true;
  };

  const handleSelectMove = (pokemonIndex: number, moveIndex: number) => {
    if (playerHP[pokemonIndex] <= 0) return;
    
    const pokemon = playerTeam[pokemonIndex];
    if (!pokemon) return;

    // Toggle off if already selected
    if (selectedMoves[pokemonIndex] === moveIndex) {
      setSelectedMoves(prev => ({ ...prev, [pokemonIndex]: null }));
      setSelectedTargets(prev => ({ ...prev, [pokemonIndex]: null }));
      return;
    }

    // Check if can afford
    // First temporarily deselect current move to check cost
    const tempMoves = { ...selectedMoves, [pokemonIndex]: null };
    const tempUsed: Energy = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
    Object.entries(tempMoves).forEach(([idx, mIdx]) => {
      if (mIdx !== null) {
        const p = playerTeam[parseInt(idx)];
        if (p) {
          const m = p.moves[mIdx];
          if (m.cost) {
            tempUsed.fire += m.cost.fire || 0;
            tempUsed.water += m.cost.water || 0;
            tempUsed.grass += m.cost.grass || 0;
            tempUsed.electric += m.cost.electric || 0;
            tempUsed.colorless += m.cost.colorless || 0;
          }
        }
      }
    });
    
    const move = pokemon.moves[moveIndex];
    const newCost = move.cost || { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
    const totalNeeded = {
      fire: tempUsed.fire + (newCost.fire || 0),
      water: tempUsed.water + (newCost.water || 0),
      grass: tempUsed.grass + (newCost.grass || 0),
      electric: tempUsed.electric + (newCost.electric || 0),
      colorless: tempUsed.colorless + (newCost.colorless || 0),
    };

    // Check if affordable
    if (totalNeeded.fire > energy.fire || 
        totalNeeded.water > energy.water ||
        totalNeeded.grass > energy.grass ||
        totalNeeded.electric > energy.electric ||
        totalNeeded.colorless > energy.colorless + (energy.fire - totalNeeded.fire) + (energy.water - totalNeeded.water) + (energy.grass - totalNeeded.grass) + (energy.electric - totalNeeded.electric)) {
      return; // Can't afford
    }

    setSelectedMoves(prev => ({ ...prev, [pokemonIndex]: moveIndex }));
    
    // Auto-target first alive enemy for single target moves
    if (move.target === 'OneEnemy') {
      const firstAliveEnemy = enemyHP.findIndex(hp => hp > 0);
      setSelectedTargets(prev => ({ ...prev, [pokemonIndex]: firstAliveEnemy >= 0 ? firstAliveEnemy : 0 }));
    } else if (move.target === 'AllEnemies') {
      setSelectedTargets(prev => ({ ...prev, [pokemonIndex]: -1 })); // -1 = all
    } else {
      setSelectedTargets(prev => ({ ...prev, [pokemonIndex]: pokemonIndex })); // Self
    }
  };

  const handleSelectTarget = (pokemonIndex: number, targetIndex: number) => {
    if (selectedMoves[pokemonIndex] !== null) {
      setSelectedTargets(prev => ({ ...prev, [pokemonIndex]: targetIndex }));
    }
  };

  const handleReady = () => {
    if (!isReady) {
      setIsReady(true);
      
      setTimeout(() => {
        const newPlayerHP = [...playerHP];
        const newEnemyHP = [...enemyHP];
        
        // Process player moves
        Object.entries(selectedMoves).forEach(([idx, moveIdx]) => {
          if (moveIdx !== null) {
            const pokemonIdx = parseInt(idx);
            const pokemon = playerTeam[pokemonIdx];
            const targetIdx = selectedTargets[pokemonIdx];
            
            if (pokemon && playerHP[pokemonIdx] > 0) {
              const move = pokemon.moves[moveIdx];
              const damage = move.damage || 0;
              
              if (move.target === 'OneEnemy' && targetIdx !== null && targetIdx >= 0) {
                newEnemyHP[targetIdx] = Math.max(0, newEnemyHP[targetIdx] - damage);
              } else if (move.target === 'AllEnemies') {
                [0, 1, 2].forEach(i => {
                  if (enemyHP[i] > 0) {
                    newEnemyHP[i] = Math.max(0, newEnemyHP[i] - damage);
                  }
                });
              } else if (move.target === 'Self' && move.healing) {
                newPlayerHP[pokemonIdx] = Math.min(100, newPlayerHP[pokemonIdx] + move.healing);
              }
            }
          }
        });

        // Enemy attacks (simple AI)
        [0, 1, 2].forEach(idx => {
          if (enemyHP[idx] > 0) {
            const alivePlayerIndices = playerHP.map((hp, i) => hp > 0 ? i : -1).filter(i => i >= 0);
            if (alivePlayerIndices.length > 0) {
              const targetIdx = alivePlayerIndices[Math.floor(Math.random() * alivePlayerIndices.length)];
              const damage = 15 + Math.floor(Math.random() * 20);
              newPlayerHP[targetIdx] = Math.max(0, newPlayerHP[targetIdx] - damage);
            }
          }
        });

        setPlayerHP(newPlayerHP);
        setEnemyHP(newEnemyHP);
        setCurrentTurn(prev => prev + 1);
        setIsReady(false);
        setSelectedMoves({0: null, 1: null, 2: null});
        setSelectedTargets({0: null, 1: null, 2: null});
        
        // Generate new energy
        setEnergy({
          fire: Math.min(4, 1 + Math.floor(Math.random() * 2)),
          water: Math.floor(Math.random() * 2),
          grass: Math.floor(Math.random() * 2),
          electric: Math.floor(Math.random() * 2),
          colorless: 1 + Math.floor(Math.random() * 2),
        });
      }, 1500);
    }
  };

  const isGameOver = playerHP.every(hp => hp <= 0) || enemyHP.every(hp => hp <= 0);
  const playerWon = enemyHP.every(hp => hp <= 0);

  if (isGameOver) {
    return (
      <div className="battle-wrapper">
        <div className="game-over-screen">
          <h1>{playerWon ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
          <p>{playerWon ? 'You defeated your opponent!' : 'Your team was defeated...'}</p>
          <div className="game-over-stats">
            <p>Turn: {currentTurn}</p>
          </div>
          <button className="exit-btn" onClick={onExit}>RETURN TO LOBBY</button>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-wrapper">
      {/* Battle Header */}
      <div className="battle-header">
        <div className="player-header">
          <span className="player-battle-name">{user?.username?.toUpperCase() || 'GAB123'}</span>
          <span className="player-battle-rank">POKEMON TRAINER</span>
        </div>
        
        <div className="turn-indicator">
          <span className="turn-text">PRESS WHEN READY</span>
          <div className="timer-bar">
            <div className="timer-fill" />
          </div>
          <div className="energy-bar">
            {energy.fire > 0 && <span className="energy-icon fire" title="Fire">🔥 x{energy.fire}</span>}
            {energy.water > 0 && <span className="energy-icon water" title="Water">💧 x{energy.water}</span>}
            {energy.grass > 0 && <span className="energy-icon grass" title="Grass">🌿 x{energy.grass}</span>}
            {energy.electric > 0 && <span className="energy-icon electric" title="Electric">⚡ x{energy.electric}</span>}
            {energy.colorless > 0 && <span className="energy-icon colorless" title="Colorless">⬜ x{energy.colorless}</span>}
            <span className="exchange-label">EXCHANGE ENERGY</span>
          </div>
        </div>
        
        <div className="enemy-header">
          <span className="player-battle-name">{enemyName}</span>
          <span className="player-battle-rank">{enemyRank}</span>
        </div>
      </div>

      {/* Main Battle Area */}
      <div className="battle-arena">
        {/* Player Side (Left) */}
        <div className="battle-side player-side">
          {playerTeam.map((pokemon, idx) => pokemon && (
            <div key={idx} className={`battle-row ${playerHP[idx] <= 0 ? 'fainted' : ''}`}>
              {/* Pokemon Portrait with ? icon */}
              <div className="pokemon-box">
                <div className="mystery-icon">?</div>
                <img 
                  src={getPokemonImage(pokemon.id)} 
                  alt={pokemon.name}
                  className="pokemon-portrait-img"
                />
              </div>
              
              {/* Skills */}
              <div className="skills-row">
                {pokemon.moves.map((move, moveIdx) => {
                  const isSelected = selectedMoves[idx] === moveIdx;
                  const canAfford = canAffordMove(pokemon, moveIdx);
                  return (
                    <div 
                      key={moveIdx}
                      className={`skill-box ${isSelected ? 'selected' : ''} ${!canAfford && !isSelected ? 'disabled' : ''}`}
                      onClick={() => canAfford && handleSelectMove(idx, moveIdx)}
                      title={`${move.name}: ${move.description}`}
                    >
                      <img src={getPokemonImage(pokemon.id)} alt={move.name} />
                    </div>
                  );
                })}
              </div>
              
              {/* HP Bar */}
              <div className="hp-container">
                <div className="hp-bar">
                  <div 
                    className="hp-fill" 
                    style={{ 
                      width: `${playerHP[idx]}%`,
                      backgroundColor: playerHP[idx] > 50 ? '#4CAF50' : playerHP[idx] > 25 ? '#FFC107' : '#F44336'
                    }} 
                  />
                </div>
                <span className="hp-text">{playerHP[idx]}/100</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center - Background Animation */}
        <div className="battle-center">
          {/* This would have an animated character like in Naruto Arena */}
        </div>

        {/* Enemy Side (Right) */}
        <div className="battle-side enemy-side">
          {enemyTeam.map((pokemon, idx) => pokemon && (
            <div 
              key={idx} 
              className={`battle-row enemy-row ${enemyHP[idx] <= 0 ? 'fainted' : ''} ${Object.values(selectedMoves).some(m => m !== null) ? 'targetable' : ''}`}
              onClick={() => {
                // Allow targeting this enemy
                const activePlayerIdx = Object.entries(selectedMoves).find(([, m]) => m !== null)?.[0];
                if (activePlayerIdx !== undefined) {
                  handleSelectTarget(parseInt(activePlayerIdx), idx);
                }
              }}
            >
              {/* HP Bar */}
              <div className="hp-container">
                <div className="hp-bar">
                  <div 
                    className="hp-fill" 
                    style={{ 
                      width: `${enemyHP[idx]}%`,
                      backgroundColor: enemyHP[idx] > 50 ? '#4CAF50' : enemyHP[idx] > 25 ? '#FFC107' : '#F44336'
                    }} 
                  />
                </div>
                <span className="hp-text">{enemyHP[idx]}/100</span>
              </div>
              
              {/* Pokemon Portrait */}
              <div className="pokemon-box">
                <img 
                  src={getPokemonImage(pokemon.id)} 
                  alt={pokemon.name}
                  className="pokemon-portrait-img"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Battle Footer */}
      <div className="battle-footer">
        <div className="footer-left">
          <button className="footer-btn surrender-btn" onClick={onExit}>
            SURRENDER
          </button>
          <button className="footer-btn chat-btn">
            OPEN CHAT
          </button>
        </div>
        
        <div className="footer-center">
          <div className="opponent-info">
            <img src="/images/ash-ketchum.webp" alt="Opponent" className="opponent-avatar" />
            <div className="opponent-details">
              <p className="opponent-name">{enemyName}</p>
              <p>{enemyRank}</p>
              <p>CLAN: CLANLESS</p>
              <p>LEVEL: 7</p>
              <p>LADDERRANK: 16081</p>
              <p>RATIO: 5 - 13 (+1)</p>
            </div>
          </div>
          
          {/* Small enemy team portraits */}
          <div className="enemy-team-small">
            {enemyTeam.map((pokemon, idx) => pokemon && (
              <div key={idx} className={`enemy-small-portrait ${enemyHP[idx] <= 0 ? 'fainted' : ''}`}>
                <img src={getPokemonImage(pokemon.id)} alt={pokemon.name} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="footer-right">
          <button 
            className={`ready-btn ${isReady ? 'waiting' : ''}`}
            onClick={handleReady}
            disabled={isReady}
          >
            {isReady ? 'WAITING...' : 'READY'}
          </button>
        </div>
      </div>
    </div>
  );
}
