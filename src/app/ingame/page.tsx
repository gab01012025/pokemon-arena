'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { allPokemon } from '@/data/pokemon';
import { Pokemon } from '@/types/game';
import { calculateDamage, TYPE_ICONS, TYPE_COLORS } from '@/lib/type-effectiveness';
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

// Battle Log Message
interface BattleMessage {
  id: number;
  text: string;
  type: 'damage' | 'heal' | 'status' | 'critical' | 'effective' | 'ineffective' | 'immune';
}

// Status Effects
interface StatusEffect {
  type: 'burn' | 'poison' | 'paralysis' | 'freeze' | 'sleep';
  turnsRemaining: number;
}

interface BattlePokemonState {
  pokemon: Pokemon;
  currentHP: number;
  maxHP: number;
  status: StatusEffect | null;
  statChanges: {
    attack: number;
    defense: number;
    speed: number;
  };
}

function BattleScreen({ team, user, onExit }: BattleScreenProps) {
  // Initialize with real HP from Pokemon data
  const initPlayerTeam = (): BattlePokemonState[] => {
    return [team.slot1, team.slot2, team.slot3].filter(Boolean).map((p) => ({
      pokemon: p!,
      currentHP: p!.hp,
      maxHP: p!.hp,
      status: null,
      statChanges: { attack: 0, defense: 0, speed: 0 },
    }));
  };

  const initEnemyTeam = (): BattlePokemonState[] => {
    // Pick 3 random Pokemon different from player
    const playerIds = [team.slot1?.id, team.slot2?.id, team.slot3?.id];
    const available = allPokemon.filter(p => !playerIds.includes(p.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((p) => ({
      pokemon: p,
      currentHP: p.hp,
      maxHP: p.hp,
      status: null,
      statChanges: { attack: 0, defense: 0, speed: 0 },
    }));
  };

  const [playerTeamState, setPlayerTeamState] = useState<BattlePokemonState[]>(initPlayerTeam);
  const [enemyTeamState, setEnemyTeamState] = useState<BattlePokemonState[]>(initEnemyTeam);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [energy, setEnergy] = useState<Energy>({ fire: 1, water: 1, grass: 0, electric: 1, colorless: 1 });
  const [selectedMoves, setSelectedMoves] = useState<{[key: number]: number | null}>({0: null, 1: null, 2: null});
  const [selectedTargets, setSelectedTargets] = useState<{[key: number]: number | null}>({0: null, 1: null, 2: null});
  const [battleLog, setBattleLog] = useState<BattleMessage[]>([]);
  const [messageId, setMessageId] = useState(0);

  // Used for display purposes
  const _playerTeam = [team.slot1, team.slot2, team.slot3];
  const _enemyTeam = enemyTeamState.map(s => s.pokemon);
  void _playerTeam; // Suppress unused warning
  void _enemyTeam; // Suppress unused warning
  
  const enemyName = "TRAINER RED";
  const enemyRank = "POKEMON MASTER";

  // Add message to battle log
  const addBattleMessage = (text: string, type: BattleMessage['type']) => {
    setMessageId(prev => prev + 1);
    setBattleLog(prev => [...prev.slice(-4), { id: messageId + 1, text, type }]);
  };

  // Calculate total energy cost of selected moves
  const getUsedEnergy = (): Energy => {
    const used: Energy = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
    Object.entries(selectedMoves).forEach(([idx, moveIdx]) => {
      if (moveIdx !== null) {
        const pokemonState = playerTeamState[parseInt(idx)];
        if (pokemonState) {
          const move = pokemonState.pokemon.moves[moveIdx];
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
    if ((move.cost.fire || 0) > remaining.fire + remaining.colorless) return false;
    if ((move.cost.water || 0) > remaining.water + remaining.colorless) return false;
    if ((move.cost.grass || 0) > remaining.grass + remaining.colorless) return false;
    if ((move.cost.electric || 0) > remaining.electric + remaining.colorless) return false;
    return true;
  };

  // Process status effects at end of turn
  const processStatusEffects = (teamState: BattlePokemonState[]): BattlePokemonState[] => {
    return teamState.map(state => {
      if (!state.status || state.currentHP <= 0) return state;

      let newHP = state.currentHP;
      let newStatus: StatusEffect | null = state.status;
      const statusDamage = Math.floor(state.maxHP * 0.0625); // 1/16 max HP

      switch (state.status.type) {
        case 'burn':
          newHP = Math.max(0, newHP - statusDamage);
          addBattleMessage(`${state.pokemon.name} is hurt by its burn!`, 'status');
          break;
        case 'poison':
          newHP = Math.max(0, newHP - statusDamage);
          addBattleMessage(`${state.pokemon.name} is hurt by poison!`, 'status');
          break;
        case 'freeze':
          // 20% chance to thaw each turn
          if (Math.random() < 0.2) {
            newStatus = null;
            addBattleMessage(`${state.pokemon.name} thawed out!`, 'status');
          }
          break;
        case 'sleep':
          // Decrement turns
          break;
        case 'paralysis':
          // 25% chance to be fully paralyzed (handled in action phase)
          break;
      }

      // Decrement status duration
      if (newStatus) {
        newStatus = {
          ...newStatus,
          turnsRemaining: newStatus.turnsRemaining - 1
        };
        if (newStatus.turnsRemaining <= 0) {
          addBattleMessage(`${state.pokemon.name} recovered from ${newStatus.type}!`, 'status');
          newStatus = null;
        }
      }

      return { ...state, currentHP: newHP, status: newStatus };
    });
  };

  const handleSelectMove = (pokemonIndex: number, moveIndex: number) => {
    const state = playerTeamState[pokemonIndex];
    if (!state || state.currentHP <= 0) return;
    
    // Check if paralyzed or frozen (can't select moves)
    if (state.status?.type === 'freeze' || state.status?.type === 'sleep') {
      addBattleMessage(`${state.pokemon.name} can't move!`, 'status');
      return;
    }

    // Toggle off if already selected
    if (selectedMoves[pokemonIndex] === moveIndex) {
      setSelectedMoves(prev => ({ ...prev, [pokemonIndex]: null }));
      setSelectedTargets(prev => ({ ...prev, [pokemonIndex]: null }));
      return;
    }

    // Check if can afford
    const tempMoves = { ...selectedMoves, [pokemonIndex]: null };
    const tempUsed: Energy = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
    Object.entries(tempMoves).forEach(([idx, mIdx]) => {
      if (mIdx !== null) {
        const p = playerTeamState[parseInt(idx)];
        if (p) {
          const m = p.pokemon.moves[mIdx];
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
    
    const move = state.pokemon.moves[moveIndex];
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
      const firstAliveEnemy = enemyTeamState.findIndex(s => s.currentHP > 0);
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
        let newPlayerState = [...playerTeamState];
        let newEnemyState = [...enemyTeamState];
        
        // Process player moves with type effectiveness
        Object.entries(selectedMoves).forEach(([idx, moveIdx]) => {
          if (moveIdx !== null) {
            const pokemonIdx = parseInt(idx);
            const attackerState = newPlayerState[pokemonIdx];
            const targetIdx = selectedTargets[pokemonIdx];
            
            if (attackerState && attackerState.currentHP > 0) {
              // Check paralysis (25% chance to skip)
              if (attackerState.status?.type === 'paralysis' && Math.random() < 0.25) {
                addBattleMessage(`${attackerState.pokemon.name} is paralyzed! It can't move!`, 'status');
                return;
              }

              const move = attackerState.pokemon.moves[moveIdx];
              const baseDamage = move.damage || 0;
              
              if (move.target === 'OneEnemy' && targetIdx !== null && targetIdx >= 0) {
                const defenderState = newEnemyState[targetIdx];
                if (defenderState && defenderState.currentHP > 0) {
                  // Calculate damage with type effectiveness and STAB
                  const damageResult = calculateDamage(
                    baseDamage,
                    move.type,
                    attackerState.pokemon.types,
                    defenderState.pokemon.types
                  );
                  
                  newEnemyState[targetIdx] = {
                    ...defenderState,
                    currentHP: Math.max(0, defenderState.currentHP - damageResult.finalDamage)
                  };
                  
                  // Add battle messages
                  addBattleMessage(
                    `${attackerState.pokemon.name} used ${move.name}!`,
                    'damage'
                  );
                  
                  if (damageResult.isCritical) {
                    addBattleMessage('A critical hit!', 'critical');
                  }
                  
                  if (damageResult.effectivenessMessage) {
                    const msgType = damageResult.typeMultiplier > 1 ? 'effective' : 
                                    damageResult.typeMultiplier < 1 ? 'ineffective' : 'immune';
                    addBattleMessage(damageResult.effectivenessMessage, msgType);
                  }
                  
                  // Apply status effects from move
                  move.effects.forEach(effect => {
                    if (['burn', 'poison', 'paralyze', 'freeze', 'sleep'].includes(effect.type)) {
                      const statusType = effect.type === 'paralyze' ? 'paralysis' : effect.type as StatusEffect['type'];
                      if (!newEnemyState[targetIdx].status) {
                        newEnemyState[targetIdx] = {
                          ...newEnemyState[targetIdx],
                          status: { type: statusType, turnsRemaining: effect.duration || 3 }
                        };
                        addBattleMessage(`${defenderState.pokemon.name} was ${statusType}ed!`, 'status');
                      }
                    }
                  });
                }
              } else if (move.target === 'AllEnemies') {
                newEnemyState.forEach((defenderState, i) => {
                  if (defenderState.currentHP > 0) {
                    const damageResult = calculateDamage(
                      baseDamage,
                      move.type,
                      attackerState.pokemon.types,
                      defenderState.pokemon.types
                    );
                    
                    newEnemyState[i] = {
                      ...defenderState,
                      currentHP: Math.max(0, defenderState.currentHP - damageResult.finalDamage)
                    };
                  }
                });
                addBattleMessage(`${attackerState.pokemon.name} used ${move.name} on all enemies!`, 'damage');
              } else if (move.target === 'Self' && move.healing) {
                const healed = Math.min(move.healing, attackerState.maxHP - attackerState.currentHP);
                newPlayerState[pokemonIdx] = {
                  ...attackerState,
                  currentHP: attackerState.currentHP + healed
                };
                addBattleMessage(`${attackerState.pokemon.name} restored ${healed} HP!`, 'heal');
              }
            }
          }
        });

        // Enemy AI attacks with type effectiveness
        newEnemyState.forEach((attackerState) => {
          if (attackerState.currentHP > 0) {
            const alivePlayerIndices = newPlayerState
              .map((s, i) => s.currentHP > 0 ? i : -1)
              .filter(i => i >= 0);
            
            if (alivePlayerIndices.length > 0) {
              // AI picks best target (type advantage)
              let bestTarget = alivePlayerIndices[0];
              let bestMultiplier = 0;
              
              alivePlayerIndices.forEach(targetIdx => {
                const defenderState = newPlayerState[targetIdx];
                const moveType = attackerState.pokemon.moves[0]?.type || 'Normal';
                const result = calculateDamage(20, moveType, attackerState.pokemon.types, defenderState.pokemon.types);
                if (result.typeMultiplier > bestMultiplier) {
                  bestMultiplier = result.typeMultiplier;
                  bestTarget = targetIdx;
                }
              });
              
              const defenderState = newPlayerState[bestTarget];
              const move = attackerState.pokemon.moves[Math.floor(Math.random() * attackerState.pokemon.moves.length)];
              const baseDamage = move?.damage || 20;
              
              const damageResult = calculateDamage(
                baseDamage,
                move?.type || 'Normal',
                attackerState.pokemon.types,
                defenderState.pokemon.types
              );
              
              newPlayerState[bestTarget] = {
                ...defenderState,
                currentHP: Math.max(0, defenderState.currentHP - damageResult.finalDamage)
              };
              
              addBattleMessage(`${attackerState.pokemon.name} used ${move?.name || 'Tackle'}!`, 'damage');
              
              if (damageResult.isCritical) {
                addBattleMessage('A critical hit!', 'critical');
              }
              if (damageResult.effectivenessMessage) {
                const msgType = damageResult.typeMultiplier > 1 ? 'effective' : 'ineffective';
                addBattleMessage(damageResult.effectivenessMessage, msgType);
              }
            }
          }
        });

        // Process status effects at end of turn
        newPlayerState = processStatusEffects(newPlayerState);
        newEnemyState = processStatusEffects(newEnemyState);

        setPlayerTeamState(newPlayerState);
        setEnemyTeamState(newEnemyState);
        setCurrentTurn(prev => prev + 1);
        setIsReady(false);
        setSelectedMoves({0: null, 1: null, 2: null});
        setSelectedTargets({0: null, 1: null, 2: null});
        
        // Generate new energy based on alive Pokemon types
        const aliveTypes: string[] = [];
        newPlayerState.forEach(s => {
          if (s.currentHP > 0) {
            s.pokemon.types.forEach(t => aliveTypes.push(t.toLowerCase()));
          }
        });
        
        setEnergy({
          fire: aliveTypes.includes('fire') ? 1 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2),
          water: aliveTypes.includes('water') ? 1 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2),
          grass: aliveTypes.includes('grass') ? 1 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2),
          electric: aliveTypes.includes('electric') ? 1 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2),
          colorless: 1 + Math.floor(Math.random() * 2),
        });
      }, 1500);
    }
  };

  const isGameOver = playerTeamState.every(s => s.currentHP <= 0) || enemyTeamState.every(s => s.currentHP <= 0);
  const playerWon = enemyTeamState.every(s => s.currentHP <= 0);

  if (isGameOver) {
    return (
      <div className="battle-wrapper">
        <div className="game-over-screen">
          <h1>{playerWon ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
          <p>{playerWon ? 'You defeated your opponent!' : 'Your team was defeated...'}</p>
          <div className="game-over-stats">
            <p>Turns: {currentTurn}</p>
            <p>Your Team: {playerTeamState.filter(s => s.currentHP > 0).length} remaining</p>
          </div>
          <button className="exit-btn" onClick={onExit}>RETURN TO LOBBY</button>
        </div>
      </div>
    );
  }

  // Get HP percentage for display
  const getHPPercent = (current: number, max: number) => Math.round((current / max) * 100);
  const getHPColor = (percent: number) => percent > 50 ? '#4CAF50' : percent > 25 ? '#FFC107' : '#F44336';

  return (
    <div className="battle-wrapper">
      {/* Battle Log */}
      <div className="battle-log">
        {battleLog.map(msg => (
          <div key={msg.id} className={`battle-message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>

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
          {playerTeamState.map((state, idx) => (
            <div key={idx} className={`battle-row ${state.currentHP <= 0 ? 'fainted' : ''}`}>
              {/* Pokemon Portrait with Status */}
              <div className="pokemon-box">
                <div className="mystery-icon">?</div>
                <img 
                  src={getPokemonImage(state.pokemon.id)} 
                  alt={state.pokemon.name}
                  className="pokemon-portrait-img"
                />
                {state.status && (
                  <div className={`status-badge ${state.status.type}`}>
                    {state.status.type.toUpperCase().slice(0, 3)}
                  </div>
                )}
                <div className="type-badges">
                  {state.pokemon.types.map((t, i) => (
                    <span key={i} className="type-badge" style={{ backgroundColor: TYPE_COLORS[t] }}>
                      {TYPE_ICONS[t]}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Skills with Type Icons */}
              <div className="skills-row">
                {state.pokemon.moves.map((move, moveIdx) => {
                  const isSelected = selectedMoves[idx] === moveIdx;
                  const canAfford = canAffordMove(state.pokemon, moveIdx);
                  return (
                    <div 
                      key={moveIdx}
                      className={`skill-box ${isSelected ? 'selected' : ''} ${!canAfford && !isSelected ? 'disabled' : ''}`}
                      onClick={() => canAfford && handleSelectMove(idx, moveIdx)}
                      title={`${move.name}: ${move.description} (${move.type})`}
                      style={{ borderColor: TYPE_COLORS[move.type] }}
                    >
                      <span className="skill-type-icon">{TYPE_ICONS[move.type]}</span>
                      <span className="skill-damage">{move.damage > 0 ? move.damage : '⚡'}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* HP Bar with Real Values */}
              <div className="hp-container">
                <div className="hp-bar">
                  <div 
                    className="hp-fill" 
                    style={{ 
                      width: `${getHPPercent(state.currentHP, state.maxHP)}%`,
                      backgroundColor: getHPColor(getHPPercent(state.currentHP, state.maxHP))
                    }} 
                  />
                </div>
                <span className="hp-text">{state.currentHP}/{state.maxHP}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center - Turn Info */}
        <div className="battle-center">
          <div className="turn-display">
            <span>TURN {currentTurn}</span>
          </div>
        </div>

        {/* Enemy Side (Right) */}
        <div className="battle-side enemy-side">
          {enemyTeamState.map((state, idx) => (
            <div 
              key={idx} 
              className={`battle-row enemy-row ${state.currentHP <= 0 ? 'fainted' : ''} ${Object.values(selectedMoves).some(m => m !== null) && state.currentHP > 0 ? 'targetable' : ''} ${Object.values(selectedTargets).includes(idx) ? 'targeted' : ''}`}
              onClick={() => {
                const activePlayerIdx = Object.entries(selectedMoves).find(([, m]) => m !== null)?.[0];
                if (activePlayerIdx !== undefined && state.currentHP > 0) {
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
                      width: `${getHPPercent(state.currentHP, state.maxHP)}%`,
                      backgroundColor: getHPColor(getHPPercent(state.currentHP, state.maxHP))
                    }} 
                  />
                </div>
                <span className="hp-text">{state.currentHP}/{state.maxHP}</span>
              </div>
              
              {/* Pokemon Portrait with Type */}
              <div className="pokemon-box">
                <img 
                  src={getPokemonImage(state.pokemon.id)} 
                  alt={state.pokemon.name}
                  className="pokemon-portrait-img"
                />
                {state.status && (
                  <div className={`status-badge ${state.status.type}`}>
                    {state.status.type.toUpperCase().slice(0, 3)}
                  </div>
                )}
                <div className="type-badges enemy-types">
                  {state.pokemon.types.map((t, i) => (
                    <span key={i} className="type-badge" style={{ backgroundColor: TYPE_COLORS[t] }}>
                      {TYPE_ICONS[t]}
                    </span>
                  ))}
                </div>
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
              <p>CLAN: ELITE FOUR</p>
              <p>LEVEL: 50</p>
              <p>LADDERRANK: 100</p>
              <p>RATIO: 150 - 23 (+5)</p>
            </div>
          </div>
          
          {/* Small enemy team portraits */}
          <div className="enemy-team-small">
            {enemyTeamState.map((state, idx) => (
              <div key={idx} className={`enemy-small-portrait ${state.currentHP <= 0 ? 'fainted' : ''}`}>
                <img src={getPokemonImage(state.pokemon.id)} alt={state.pokemon.name} />
                <div className="mini-hp" style={{ width: `${getHPPercent(state.currentHP, state.maxHP)}%` }} />
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
