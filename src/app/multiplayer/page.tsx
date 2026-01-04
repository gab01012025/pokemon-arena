'use client';

/**
 * Pokemon Arena - Multiplayer Battle Screen
 * Real-time PvP battles using WebSocket
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { allPokemon } from '@/data/pokemon';
import { Pokemon, Move } from '@/types/game';
import { TYPE_ICONS, TYPE_COLORS } from '@/lib/type-effectiveness';
import '../ingame/ingame.css';
import './multiplayer.css';

// Pokemon image mapping
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
  return pokemonImages[pokemonId?.toLowerCase() || 'pikachu'] || '/images/pokemon/pikachu.jpg';
};

type GamePhase = 'connecting' | 'lobby' | 'queue' | 'battle' | 'result';

interface TeamSelection {
  slot1: Pokemon | null;
  slot2: Pokemon | null;
  slot3: Pokemon | null;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkSession } = useAuthStore();
  const [multiplayerState, multiplayerActions] = useMultiplayer();
  
  const [phase, setPhase] = useState<GamePhase>('connecting');
  const [selectedTeam, setSelectedTeam] = useState<TeamSelection>({
    slot1: null,
    slot2: null,
    slot3: null
  });
  const [queueType, setQueueType] = useState<'quick' | 'ranked'>('quick');
  
  // Battle state
  const [selectedMoves, setSelectedMoves] = useState<Record<number, number | null>>({0: null, 1: null, 2: null});
  const [selectedTargets, setSelectedTargets] = useState<Record<number, number | null>>({0: null, 1: null, 2: null});
  const [selectingTargetFor, setSelectingTargetFor] = useState<number | null>(null);
  const [hoveredMove, setHoveredMove] = useState<{pokemon: Pokemon, move: Move, idx: number} | null>(null);
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Check auth
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Connect to game server
  useEffect(() => {
    const actions = multiplayerActions;
    const connectToServer = async () => {
      try {
        await actions.connect();
        if (user) {
          actions.authenticate(
            user.id,
            user.username,
            user.level || 1,
            user.ladderPoints || 0
          );
        }
        setPhase('lobby');
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    };

    if (isAuthenticated && user) {
      connectToServer();
    }

    return () => {
      actions.disconnect();
    };
  }, [isAuthenticated, user, multiplayerActions]);

  // Derive phase from multiplayer state
  const derivedPhase = useMemo(() => {
    if (multiplayerState.inBattle) return 'battle';
    if (multiplayerState.battleResult) return 'result';
    if (multiplayerState.inQueue) return 'queue';
    if (multiplayerState.isConnected) return 'lobby';
    return 'connecting';
  }, [multiplayerState.inBattle, multiplayerState.battleResult, multiplayerState.inQueue, multiplayerState.isConnected]);

  // Update phase only when derived phase changes
  useEffect(() => {
    setPhase(derivedPhase);
  }, [derivedPhase]);

  // Team selection
  const handleSelectPokemon = (pokemon: Pokemon) => {
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

    if (!selectedTeam.slot1) {
      setSelectedTeam(prev => ({ ...prev, slot1: pokemon }));
    } else if (!selectedTeam.slot2) {
      setSelectedTeam(prev => ({ ...prev, slot2: pokemon }));
    } else if (!selectedTeam.slot3) {
      setSelectedTeam(prev => ({ ...prev, slot3: pokemon }));
    }
  };

  const isTeamComplete = selectedTeam.slot1 && selectedTeam.slot2 && selectedTeam.slot3;

  // Join queue
  const handleJoinQueue = () => {
    if (!isTeamComplete) return;
    
    const team = {
      slot1: selectedTeam.slot1 ? {
        id: selectedTeam.slot1.id,
        name: selectedTeam.slot1.name,
        types: selectedTeam.slot1.types,
        hp: selectedTeam.slot1.hp,
        moves: selectedTeam.slot1.moves.map(m => ({
          name: m.name,
          type: m.type,
          damage: m.damage,
          healing: m.healing || 0,
          target: m.target,
          cost: m.cost || {},
          effects: m.effects || [],
          classes: m.classes || [],
          cooldown: m.cooldown || 0
        }))
      } : null,
      slot2: selectedTeam.slot2 ? {
        id: selectedTeam.slot2.id,
        name: selectedTeam.slot2.name,
        types: selectedTeam.slot2.types,
        hp: selectedTeam.slot2.hp,
        moves: selectedTeam.slot2.moves.map(m => ({
          name: m.name,
          type: m.type,
          damage: m.damage,
          healing: m.healing || 0,
          target: m.target,
          cost: m.cost || {},
          effects: m.effects || [],
          classes: m.classes || [],
          cooldown: m.cooldown || 0
        }))
      } : null,
      slot3: selectedTeam.slot3 ? {
        id: selectedTeam.slot3.id,
        name: selectedTeam.slot3.name,
        types: selectedTeam.slot3.types,
        hp: selectedTeam.slot3.hp,
        moves: selectedTeam.slot3.moves.map(m => ({
          name: m.name,
          type: m.type,
          damage: m.damage,
          healing: m.healing || 0,
          target: m.target,
          cost: m.cost || {},
          effects: m.effects || [],
          classes: m.classes || [],
          cooldown: m.cooldown || 0
        }))
      } : null
    };

    multiplayerActions.joinQueue(team, queueType);
  };

  // Move selection
  const handleSelectMove = (pokemonIndex: number, moveIndex: number) => {
    const state = multiplayerState.yourTeam[pokemonIndex];
    if (!state || state.currentHP <= 0) return;

    // Toggle off if already selected
    if (selectedMoves[pokemonIndex] === moveIndex) {
      setSelectedMoves(prev => ({ ...prev, [pokemonIndex]: null }));
      setSelectedTargets(prev => ({ ...prev, [pokemonIndex]: null }));
      return;
    }

    const move = state.pokemon.moves[moveIndex];
    
    // Check if move needs target
    if (move.target === 'OneEnemy') {
      setSelectingTargetFor(pokemonIndex);
    }

    setSelectedMoves(prev => ({ ...prev, [pokemonIndex]: moveIndex }));
  };

  const handleSelectTarget = (targetIndex: number) => {
    if (selectingTargetFor === null) return;
    setSelectedTargets(prev => ({ ...prev, [selectingTargetFor]: targetIndex }));
    setSelectingTargetFor(null);
  };

  // Submit moves
  const handleReady = () => {
    multiplayerActions.submitMoves(selectedMoves, selectedTargets);
    setSelectedMoves({ 0: null, 1: null, 2: null });
    setSelectedTargets({ 0: null, 1: null, 2: null });
  };

  // Energy exchange
  const handleEnergyExchange = (fromType: string) => {
    multiplayerActions.exchangeEnergy(fromType);
  };

  // Chat
  const handleSendChat = () => {
    if (chatInput.trim()) {
      multiplayerActions.sendChat(chatInput.trim());
      setChatInput('');
    }
  };

  // Surrender
  const handleSurrender = () => {
    setShowSurrenderModal(false);
    multiplayerActions.surrender();
  };

  // Return to lobby
  const handleReturnToLobby = () => {
    multiplayerActions.resetBattle();
    setPhase('lobby');
    setSelectedMoves({ 0: null, 1: null, 2: null });
    setSelectedTargets({ 0: null, 1: null, 2: null });
  };

  const getTimerColor = () => {
    if (multiplayerState.turnTimer > 30) return '#4CAF50';
    if (multiplayerState.turnTimer > 10) return '#FFC107';
    return '#F44336';
  };

  // ==================== RENDER ====================

  // Connecting phase
  if (phase === 'connecting' || multiplayerState.isConnecting) {
    return (
      <div className="multiplayer-wrapper">
        <div className="connecting-screen">
          <div className="pokeball-spinner"></div>
          <h2>Connecting to Game Server...</h2>
          <p>Please wait</p>
          {multiplayerState.connectionError && (
            <div className="connection-error">
              <p>❌ {multiplayerState.connectionError}</p>
              <button onClick={() => multiplayerActions.connect()}>Retry</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lobby phase
  if (phase === 'lobby') {
    return (
      <div className="multiplayer-wrapper">
        <div className="lobby-header">
          <h1>⚡ POKEMON ARENA - MULTIPLAYER ⚡</h1>
          <div className="online-status">
            <span className="online-dot"></span>
            <span>{multiplayerState.onlineCount} Players Online</span>
          </div>
        </div>

        <div className="lobby-content">
          {/* Team Selection */}
          <div className="team-selection-panel">
            <h2>Select Your Team (3 Pokemon)</h2>
            
            <div className="selected-team-slots">
              <div className={`team-slot ${selectedTeam.slot1 ? 'filled' : ''}`}>
                {selectedTeam.slot1 ? (
                  <>
                    <img src={getPokemonImage(selectedTeam.slot1.id)} alt={selectedTeam.slot1.name} />
                    <span>{selectedTeam.slot1.name}</span>
                  </>
                ) : <span className="empty">Slot 1</span>}
              </div>
              <div className={`team-slot ${selectedTeam.slot2 ? 'filled' : ''}`}>
                {selectedTeam.slot2 ? (
                  <>
                    <img src={getPokemonImage(selectedTeam.slot2.id)} alt={selectedTeam.slot2.name} />
                    <span>{selectedTeam.slot2.name}</span>
                  </>
                ) : <span className="empty">Slot 2</span>}
              </div>
              <div className={`team-slot ${selectedTeam.slot3 ? 'filled' : ''}`}>
                {selectedTeam.slot3 ? (
                  <>
                    <img src={getPokemonImage(selectedTeam.slot3.id)} alt={selectedTeam.slot3.name} />
                    <span>{selectedTeam.slot3.name}</span>
                  </>
                ) : <span className="empty">Slot 3</span>}
              </div>
            </div>

            <div className="pokemon-roster">
              {allPokemon.map(pokemon => (
                <div 
                  key={pokemon.id}
                  className={`pokemon-card ${
                    selectedTeam.slot1?.id === pokemon.id || 
                    selectedTeam.slot2?.id === pokemon.id || 
                    selectedTeam.slot3?.id === pokemon.id ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectPokemon(pokemon)}
                >
                  <img src={getPokemonImage(pokemon.id)} alt={pokemon.name} />
                  <span className="pokemon-name">{pokemon.name}</span>
                  <div className="pokemon-types">
                    {pokemon.types.filter(t => t).map(type => (
                      <span key={type} className={`type-badge ${type?.toLowerCase() || 'normal'}`}>
                        {TYPE_ICONS[type as keyof typeof TYPE_ICONS]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queue Options */}
          <div className="queue-panel">
            <h2>Find Match</h2>
            
            <div className="queue-type-selector">
              <button 
                className={`queue-type-btn ${queueType === 'quick' ? 'active' : ''}`}
                onClick={() => setQueueType('quick')}
              >
                ⚡ Quick Match
                <span className="queue-desc">Casual play, no rating change</span>
              </button>
              <button 
                className={`queue-type-btn ${queueType === 'ranked' ? 'active' : ''}`}
                onClick={() => setQueueType('ranked')}
              >
                🏆 Ranked Match
                <span className="queue-desc">Competitive, affects ladder rank</span>
              </button>
            </div>

            <button 
              className="find-match-btn"
              onClick={handleJoinQueue}
              disabled={!isTeamComplete}
            >
              {isTeamComplete ? '🎮 FIND MATCH' : 'Select 3 Pokemon First'}
            </button>

            <button className="back-btn" onClick={() => router.push('/play')}>
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Queue phase
  if (phase === 'queue') {
    return (
      <div className="multiplayer-wrapper">
        <div className="queue-screen">
          <div className="pokeball-spinner"></div>
          <h2>Finding Opponent...</h2>
          <div className="queue-info">
            <p>Queue Type: <strong>{multiplayerState.queueType?.toUpperCase()}</strong></p>
            <p>Position: <strong>#{multiplayerState.queuePosition}</strong></p>
            <p>Est. Wait: <strong>~{multiplayerState.estimatedWait}s</strong></p>
          </div>
          <div className="selected-team-preview">
            {[selectedTeam.slot1, selectedTeam.slot2, selectedTeam.slot3].map((pokemon, idx) => pokemon && (
              <div key={idx} className="team-preview-slot">
                <img src={getPokemonImage(pokemon.id)} alt={pokemon.name} />
              </div>
            ))}
          </div>
          <button className="cancel-queue-btn" onClick={() => multiplayerActions.leaveQueue()}>
            ✕ Cancel Search
          </button>
        </div>
      </div>
    );
  }

  // Result phase
  if (phase === 'result' && multiplayerState.battleResult) {
    const won = multiplayerState.battleResult.winnerId === user?.id;
    
    return (
      <div className="multiplayer-wrapper">
        <div className={`result-screen ${won ? 'victory' : 'defeat'}`}>
          <h1>{won ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
          <p className="result-reason">
            {multiplayerState.battleResult.reason === 'knockout' && (won ? 'You knocked out all enemy Pokemon!' : 'All your Pokemon were knocked out!')}
            {multiplayerState.battleResult.reason === 'surrender' && (won ? 'Your opponent surrendered!' : 'You surrendered!')}
            {multiplayerState.battleResult.reason === 'disconnect' && (won ? 'Your opponent disconnected!' : 'You disconnected!')}
          </p>
          
          <div className="result-stats">
            <div className="stat-item">
              <span className="stat-label">Turns Played</span>
              <span className="stat-value">{multiplayerState.currentTurn}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Match Type</span>
              <span className="stat-value">{queueType.toUpperCase()}</span>
            </div>
          </div>

          <button className="return-lobby-btn" onClick={handleReturnToLobby}>
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Battle phase
  if (phase === 'battle') {
    return (
      <div className="battle-wrapper">
        {/* Surrender Modal */}
        {showSurrenderModal && (
          <div className="surrender-modal-overlay">
            <div className="surrender-modal">
              <h2>⚠️ SURRENDER?</h2>
              <p>Are you sure you want to surrender?</p>
              <p className="surrender-warning">This will count as a loss.</p>
              <div className="surrender-buttons">
                <button className="surrender-confirm" onClick={handleSurrender}>YES, SURRENDER</button>
                <button className="surrender-cancel" onClick={() => setShowSurrenderModal(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        )}

        {/* Skill Tooltip */}
        {hoveredMove && (
          <div className="skill-tooltip">
            <div className="tooltip-header" style={{ backgroundColor: TYPE_COLORS[hoveredMove.move.type as keyof typeof TYPE_COLORS] }}>
              <span className="tooltip-name">{hoveredMove.move.name}</span>
              <span className="tooltip-type">{TYPE_ICONS[hoveredMove.move.type as keyof typeof TYPE_ICONS]} {hoveredMove.move.type}</span>
            </div>
            <div className="tooltip-body">
              <p className="tooltip-desc">{hoveredMove.move.description}</p>
              <div className="tooltip-stats">
                {hoveredMove.move.damage > 0 && <span className="stat damage">⚔️ Damage: {hoveredMove.move.damage}</span>}
                {hoveredMove.move.healing && hoveredMove.move.healing > 0 && <span className="stat healing">💚 Healing: {hoveredMove.move.healing}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Battle Header */}
        <div className="battle-header">
          <div className="player-header">
            <span className="player-battle-name">{user?.username?.toUpperCase()}</span>
            <span className="player-battle-rank">LEVEL {user?.level || 1}</span>
          </div>
          
          <div className="turn-indicator">
            <div className="turn-number">Turn {multiplayerState.currentTurn}</div>
            <div className="turn-timer" style={{ color: getTimerColor() }}>
              <span className="timer-seconds">{multiplayerState.turnTimer}</span>
              <span className="timer-label">seconds</span>
            </div>
            <div className="timer-bar">
              <div className="timer-fill" style={{ 
                width: `${(multiplayerState.turnTimer / 90) * 100}%`, 
                backgroundColor: getTimerColor() 
              }} />
            </div>
            <div className="energy-bar">
              {multiplayerState.energy.fire > 0 && (
                <span className="energy-icon fire" onClick={() => handleEnergyExchange('fire')}>
                  🔥 x{multiplayerState.energy.fire}
                </span>
              )}
              {multiplayerState.energy.water > 0 && (
                <span className="energy-icon water" onClick={() => handleEnergyExchange('water')}>
                  💧 x{multiplayerState.energy.water}
                </span>
              )}
              {multiplayerState.energy.grass > 0 && (
                <span className="energy-icon grass" onClick={() => handleEnergyExchange('grass')}>
                  🌿 x{multiplayerState.energy.grass}
                </span>
              )}
              {multiplayerState.energy.electric > 0 && (
                <span className="energy-icon electric" onClick={() => handleEnergyExchange('electric')}>
                  ⚡ x{multiplayerState.energy.electric}
                </span>
              )}
              {multiplayerState.energy.colorless > 0 && (
                <span className="energy-icon colorless">
                  ⬜ x{multiplayerState.energy.colorless}
                </span>
              )}
            </div>
          </div>
          
          <div className="enemy-header">
            <span className="player-battle-name">{multiplayerState.opponent?.username.toUpperCase()}</span>
            <span className="player-battle-rank">LEVEL {multiplayerState.opponent?.level}</span>
          </div>
        </div>

        {/* Main Battle Area */}
        <div className="battle-arena">
          {/* Player Side (Left) */}
          <div className="battle-side player-side">
            {multiplayerState.yourTeam.map((state, idx) => (
              <div 
                key={idx} 
                className={`pokemon-battle-card ${state.currentHP <= 0 ? 'fainted' : ''} ${selectedMoves[idx] !== null ? 'has-action' : ''}`}
              >
                <div className="pokemon-portrait">
                  <img 
                    src={getPokemonImage(state.pokemon.id)} 
                    alt={state.pokemon.name}
                    className="pokemon-portrait-img"
                  />
                  {state.status && (
                    <span className={`status-badge ${state.status.type}`}>
                      {state.status.type.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="pokemon-info">
                  <span className="pokemon-name">{state.pokemon.name}</span>
                  <div className="hp-bar">
                    <div 
                      className="hp-fill" 
                      style={{ 
                        width: `${(state.currentHP / state.maxHP) * 100}%`,
                        backgroundColor: state.currentHP / state.maxHP > 0.5 ? '#4CAF50' : 
                                        state.currentHP / state.maxHP > 0.25 ? '#FFC107' : '#F44336'
                      }}
                    />
                    <span className="hp-text">{state.currentHP}/{state.maxHP}</span>
                  </div>
                </div>
                
                {/* Move Buttons */}
                {state.currentHP > 0 && (
                  <div className="move-buttons">
                    {state.pokemon.moves.slice(0, 4).map((move, moveIdx) => (
                      <button
                        key={moveIdx}
                        className={`move-btn ${selectedMoves[idx] === moveIdx ? 'selected' : ''}`}
                        onClick={() => handleSelectMove(idx, moveIdx)}
                        onMouseEnter={() => setHoveredMove({ pokemon: state.pokemon as unknown as Pokemon, move: move as unknown as Move, idx: moveIdx })}
                        onMouseLeave={() => setHoveredMove(null)}
                        disabled={multiplayerState.isReady || state.cooldowns[moveIdx] > 0}
                        style={{ borderColor: TYPE_COLORS[move.type as keyof typeof TYPE_COLORS] }}
                      >
                        <span className="move-icon">{TYPE_ICONS[move.type as keyof typeof TYPE_ICONS]}</span>
                        <span className="move-name">{move.name}</span>
                        {state.cooldowns[moveIdx] > 0 && (
                          <span className="cooldown-badge">{state.cooldowns[moveIdx]}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Center - Battle Log & Actions */}
          <div className="battle-center">
            <div className="battle-log">
              {multiplayerState.battleLog.slice(-5).map((entry, idx) => (
                <div key={idx} className={`log-entry ${entry.type}`}>
                  {entry.text}
                </div>
              ))}
            </div>

            {/* Target Selection */}
            {selectingTargetFor !== null && (
              <div className="target-selection">
                <h3>Select Target</h3>
                <div className="target-options">
                  {multiplayerState.opponent?.team.map((pokemon, idx) => (
                    pokemon.currentHP > 0 && (
                      <button 
                        key={idx} 
                        className="target-btn"
                        onClick={() => handleSelectTarget(idx)}
                      >
                        {pokemon.name}
                      </button>
                    )
                  ))}
                </div>
                <button className="cancel-target" onClick={() => setSelectingTargetFor(null)}>
                  Cancel
                </button>
              </div>
            )}

            <div className="action-buttons">
              <button 
                className={`ready-btn ${multiplayerState.isReady ? 'waiting' : ''}`}
                onClick={handleReady}
                disabled={multiplayerState.isReady}
              >
                {multiplayerState.isReady ? '⏳ Waiting for Opponent...' : '✓ READY'}
              </button>
              <button className="surrender-btn" onClick={() => setShowSurrenderModal(true)}>
                🏳️ Surrender
              </button>
            </div>

            {/* Chat */}
            <div className="battle-chat">
              <div className="chat-messages">
                {multiplayerState.chatMessages.slice(-5).map((msg, idx) => (
                  <div key={idx} className="chat-message">
                    <strong>{msg.username}:</strong> {msg.message}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type a message..."
                  maxLength={100}
                />
                <button onClick={handleSendChat}>Send</button>
              </div>
            </div>
          </div>

          {/* Enemy Side (Right) */}
          <div className="battle-side enemy-side">
            {multiplayerState.opponent?.team.map((pokemon, idx) => (
              <div 
                key={idx} 
                className={`pokemon-battle-card enemy ${pokemon.currentHP <= 0 ? 'fainted' : ''} ${selectingTargetFor !== null ? 'targetable' : ''}`}
                onClick={() => selectingTargetFor !== null && pokemon.currentHP > 0 && handleSelectTarget(idx)}
              >
                <div className="pokemon-info">
                  <span className="pokemon-name">{pokemon.name}</span>
                  <div className="hp-bar">
                    <div 
                      className="hp-fill" 
                      style={{ 
                        width: `${(pokemon.currentHP / pokemon.maxHP) * 100}%`,
                        backgroundColor: pokemon.currentHP / pokemon.maxHP > 0.5 ? '#4CAF50' : 
                                        pokemon.currentHP / pokemon.maxHP > 0.25 ? '#FFC107' : '#F44336'
                      }}
                    />
                    <span className="hp-text">{pokemon.currentHP}/{pokemon.maxHP}</span>
                  </div>
                </div>
                <div className="pokemon-types">
                  {pokemon.types.filter(t => t).map(type => (
                    <span key={type} className={`type-badge ${type?.toLowerCase() || 'normal'}`}>
                      {TYPE_ICONS[type as keyof typeof TYPE_ICONS]}
                    </span>
                  ))}
                </div>
                {pokemon.status && (
                  <span className={`status-badge ${pokemon.status.type}`}>
                    {pokemon.status.type.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="multiplayer-wrapper">
      <div className="connecting-screen">
        <div className="pokeball-spinner"></div>
        <h2>Loading...</h2>
      </div>
    </div>
  );
}
