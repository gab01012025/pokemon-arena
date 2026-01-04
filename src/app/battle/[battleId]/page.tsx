'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGameSocket, Energy } from '@/hooks/useGameSocket';
import { useBattleAnimations, BattleAnimationManager, TurnTransition, AnimationType } from '@/components/battle/BattleAnimations';

interface Move {
  id: string;
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  currentCooldown?: number;
  cost: Record<string, number>;
  classes: string[];
}

interface BattlePokemon {
  id: string;
  name: string;
  type: string;
  imageUrl: string | null;
  currentHealth: number;
  maxHealth: number;
  moves: Move[];
  effects: string[];
  isStunned: boolean;
}

interface EnergyPool {
  electric: number;
  fire: number;
  water: number;
  grass: number;
  psychic: number;
  fighting: number;
  random: number;
}

interface BattlePlayer {
  id: string;
  name: string;
  team: BattlePokemon[];
  energy: EnergyPool;
}

interface BattleState {
  id: string;
  status: 'waiting' | 'active' | 'finished';
  turn: number;
  currentPhase: 'selection' | 'execution';
  player1: BattlePlayer;
  player2: BattlePlayer;
  winner: string | null;
  log: string[];
}

interface UserData {
  id: string;
  username: string;
}

export default function BattlePage() {
  const params = useParams();
  const battleIdParam = params.battleId as string;
  
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMoves, setSelectedMoves] = useState<Record<number, number | null>>({});
  const [selectedTargets, setSelectedTargets] = useState<Record<number, number | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Battle Animations
  const { animations, addAnimation, removeAnimation } = useBattleAnimations();
  const prevBattleRef = useRef<BattleState | null>(null);
  const [showTurnTransition, setShowTurnTransition] = useState(false);

  // Get user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserData({ id: data.user.id, username: data.user.username });
          setPlayerId(data.user.id);
        }
      } catch {
        console.error('Failed to fetch user');
      }
    }
    fetchUser();
  }, []);

  // WebSocket connection
  const {
    state: socketState,
    battleId: wsBattleId,
    battleData,
    turnData,
    turnTimer,
    error: socketError,
    battleResult,
    connect,
    submitMoves: wsSubmitMoves,
    exchangeEnergy,
    surrender: wsSurrender,
    sendChat,
  } = useGameSocket(userData?.id || null, userData?.username || null);

  // Connect to WebSocket when user is loaded
  useEffect(() => {
    if (userData && socketState === 'disconnected') {
      connect();
    }
  }, [userData, socketState, connect]);

  // Sync WebSocket battle data with local state
  useEffect(() => {
    if (battleData && wsBattleId === battleIdParam) {
      // Convert WebSocket data to local BattleState format
      const convertedBattle: BattleState = {
        id: battleData.battleId,
        status: 'active',
        turn: battleData.turn,
        currentPhase: 'selection',
        player1: {
          id: userData?.id || '',
          name: userData?.username || 'You',
          team: battleData.yourTeam.map((p, idx) => ({
            id: `your-${idx}`,
            name: p.pokemon.name,
            type: p.pokemon.types[0] || 'normal',
            imageUrl: `/images/pokemon/${p.pokemon.name.toLowerCase()}.png`,
            currentHealth: p.currentHP,
            maxHealth: p.maxHP,
            moves: p.pokemon.moves.map((m, mIdx) => ({
              id: `move-${mIdx}`,
              name: m.name,
              description: '',
              damage: m.damage,
              cooldown: m.cooldown,
              currentCooldown: p.cooldowns[mIdx] || 0,
              cost: m.cost,
              classes: m.classes,
            })),
            effects: p.status ? [p.status.type] : [],
            isStunned: p.status?.type === 'stun',
          })),
          energy: convertEnergy(battleData.energy),
        },
        player2: {
          id: 'opponent',
          name: battleData.opponent.username,
          team: battleData.opponent.team.map((p, idx) => ({
            id: `opp-${idx}`,
            name: p.name,
            type: p.types[0] || 'normal',
            imageUrl: `/images/pokemon/${p.name.toLowerCase()}.png`,
            currentHealth: p.currentHP,
            maxHealth: p.maxHP,
            moves: [],
            effects: p.status ? [p.status.type] : [],
            isStunned: p.status?.type === 'stun',
          })),
          energy: { electric: 0, fire: 0, water: 0, grass: 0, psychic: 0, fighting: 0, random: 0 },
        },
        winner: null,
        log: [],
      };
      setBattle(convertedBattle);
      setLoading(false);
    }
  }, [battleData, wsBattleId, battleIdParam, userData]);

  // Update on turn changes
  useEffect(() => {
    if (turnData && battle) {
      setBattle(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          turn: turnData.turn,
          player1: {
            ...prev.player1,
            team: prev.player1.team.map((p, idx) => {
              const updated = turnData.yourTeam[idx];
              if (updated) {
                return {
                  ...p,
                  currentHealth: updated.currentHP,
                  effects: updated.status ? [updated.status.type] : [],
                  isStunned: updated.status?.type === 'stun',
                  moves: p.moves.map((m, mIdx) => ({
                    ...m,
                    currentCooldown: updated.cooldowns[mIdx] || 0,
                  })),
                };
              }
              return p;
            }),
            energy: convertEnergy(turnData.energy),
          },
          player2: {
            ...prev.player2,
            team: prev.player2.team.map((p, idx) => {
              const updated = turnData.opponentTeam[idx];
              if (updated) {
                return {
                  ...p,
                  currentHealth: updated.currentHP,
                  effects: updated.status ? [updated.status.type] : [],
                  isStunned: updated.status?.type === 'stun',
                };
              }
              return p;
            }),
          },
          log: turnData.battleLog.map(l => l.text),
        };
      });
      // Reset moves for new turn
      setSelectedMoves({});
      setSelectedTargets({});
      setSubmitting(false);
      
      // Show turn transition animation
      setShowTurnTransition(true);
      setTimeout(() => setShowTurnTransition(false), 1500);
    }
  }, [turnData, battle]);

  // Detect HP changes and trigger animations
  useEffect(() => {
    if (!battle || !prevBattleRef.current) {
      prevBattleRef.current = battle;
      return;
    }
    
    const prev = prevBattleRef.current;
    
    // Check player team HP changes
    battle.player1.team.forEach((poke, idx) => {
      const prevPoke = prev.player1.team[idx];
      if (prevPoke) {
        const hpDiff = prevPoke.currentHealth - poke.currentHealth;
        if (hpDiff > 0) {
          // Took damage
          addAnimation({
            type: hpDiff > 30 ? 'critical' : 'damage',
            value: hpDiff,
            targetId: `my-pokemon-${idx}`,
            duration: 1000,
          });
        } else if (hpDiff < 0) {
          // Healed
          addAnimation({
            type: 'heal',
            value: Math.abs(hpDiff),
            targetId: `my-pokemon-${idx}`,
            duration: 1000,
          });
        }
        
        // Check for death
        if (prevPoke.currentHealth > 0 && poke.currentHealth <= 0) {
          addAnimation({
            type: 'death',
            targetId: `my-pokemon-${idx}`,
            text: poke.name,
            duration: 1500,
          });
        }
        
        // Check for status changes
        if (poke.isStunned && !prevPoke.isStunned) {
          addAnimation({
            type: 'stun',
            targetId: `my-pokemon-${idx}`,
            text: 'Stunned!',
            duration: 1200,
          });
        }
      }
    });
    
    // Check opponent team HP changes
    battle.player2.team.forEach((poke, idx) => {
      const prevPoke = prev.player2.team[idx];
      if (prevPoke) {
        const hpDiff = prevPoke.currentHealth - poke.currentHealth;
        if (hpDiff > 0) {
          addAnimation({
            type: hpDiff > 30 ? 'critical' : 'damage',
            value: hpDiff,
            targetId: `opp-pokemon-${idx}`,
            duration: 1000,
          });
        } else if (hpDiff < 0) {
          addAnimation({
            type: 'heal',
            value: Math.abs(hpDiff),
            targetId: `opp-pokemon-${idx}`,
            duration: 1000,
          });
        }
        
        if (prevPoke.currentHealth > 0 && poke.currentHealth <= 0) {
          addAnimation({
            type: 'death',
            targetId: `opp-pokemon-${idx}`,
            text: poke.name,
            duration: 1500,
          });
        }
        
        if (poke.isStunned && !prevPoke.isStunned) {
          addAnimation({
            type: 'stun',
            targetId: `opp-pokemon-${idx}`,
            text: 'Stunned!',
            duration: 1200,
          });
        }
      }
    });
    
    // Check energy changes
    const prevEnergy = prev.player1.energy;
    const newEnergy = battle.player1.energy;
    for (const type of Object.keys(newEnergy) as (keyof EnergyPool)[]) {
      if (newEnergy[type] > prevEnergy[type]) {
        addAnimation({
          type: 'energyGain',
          targetId: 'energy-pool',
          value: newEnergy[type] - prevEnergy[type],
          text: type,
          duration: 800,
        });
      }
    }
    
    prevBattleRef.current = battle;
  }, [battle, addAnimation]);

  // Handle battle result
  useEffect(() => {
    if (battleResult) {
      setBattle(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'finished',
          winner: battleResult.winnerId === userData?.id ? userData.id : 'opponent',
          log: battleResult.battleLog.map(l => l.text),
        };
      });
    }
  }, [battleResult, userData]);

  // Fallback: Fetch battle state from REST API
  const fetchBattle = useCallback(async () => {
    if (socketState === 'inBattle') return; // Use WebSocket data instead
    
    try {
      const res = await fetch(`/api/battle/${battleIdParam}`);
      if (res.ok) {
        const data = await res.json();
        // Convert API response to local format
        setBattle({
          id: data.battleId,
          status: data.winner ? 'finished' : 'active',
          turn: data.turn,
          currentPhase: data.phase || 'selection',
          player1: data.you,
          player2: data.opponent,
          winner: data.winner,
          log: data.log || [],
        });
        if (!playerId) {
          setPlayerId(data.you?.id);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to load battle');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }, [battleIdParam, playerId, socketState]);

  // Initial fetch (fallback)
  useEffect(() => {
    if (socketState !== 'inBattle') {
      fetchBattle();
      const interval = setInterval(fetchBattle, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchBattle, socketState]);

  function convertEnergy(e: Energy): EnergyPool {
    return {
      electric: e.electric || 0,
      fire: e.fire || 0,
      water: e.water || 0,
      grass: e.grass || 0,
      psychic: 0,
      fighting: 0,
      random: e.colorless || 0,
    };
  }

  const selectMove = (pokemonIndex: number, moveIndex: number | null) => {
    setSelectedMoves(prev => ({
      ...prev,
      [pokemonIndex]: prev[pokemonIndex] === moveIndex ? null : moveIndex,
    }));
  };

  const selectTarget = (pokemonIndex: number, targetIndex: number | null) => {
    setSelectedTargets(prev => ({
      ...prev,
      [pokemonIndex]: targetIndex,
    }));
  };

  const submitActions = async () => {
    if (!battle) return;
    
    setSubmitting(true);
    
    if (socketState === 'inBattle') {
      // Submit via WebSocket
      wsSubmitMoves(selectedMoves, selectedTargets);
    } else {
      // Submit via REST API
      try {
        for (const [pokemonIdx, moveIdx] of Object.entries(selectedMoves)) {
          if (moveIdx !== null) {
            const pokemon = battle.player1.team[parseInt(pokemonIdx)];
            const move = pokemon?.moves[moveIdx];
            if (pokemon && move) {
              await fetch(`/api/battle/${battleIdParam}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pokemonId: pokemon.id,
                  moveId: move.id,
                })
              });
            }
          }
        }
        setSelectedMoves({});
        setSelectedTargets({});
        await fetchBattle();
      } catch {
        setError('Failed to submit actions');
      }
    }
    
    setSubmitting(false);
  };

  const surrender = async () => {
    if (!confirm('Are you sure you want to surrender?')) return;
    
    if (socketState === 'inBattle') {
      wsSurrender();
    } else {
      try {
        await fetch(`/api/battle/${battleIdParam}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'surrender' })
        });
        await fetchBattle();
      } catch {
        setError('Failed to surrender');
      }
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChat(chatInput);
      setChatMessages(prev => [...prev, { text: chatInput, sender: 'you' }]);
      setChatInput('');
    }
  };

  const handleExchangeEnergy = (fromType: string) => {
    exchangeEnergy(fromType);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      electric: '#F7D02C',
      fire: '#EE8130',
      water: '#6390F0',
      grass: '#7AC74C',
      psychic: '#F95587',
      fighting: '#C22E28',
      ghost: '#735797',
      dragon: '#6F35FC',
      normal: '#A8A77A',
    };
    return colors[type.toLowerCase()] || '#777';
  };

  const getEnergyIcon = (type: string) => {
    const icons: Record<string, string> = {
      electric: '⚡',
      fire: '🔥',
      water: '💧',
      grass: '🌿',
      psychic: '🔮',
      fighting: '👊',
      random: '❓',
    };
    return icons[type] || '?';
  };

  const getHealthPercent = (current: number, max: number) => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  const getHealthColor = (percent: number) => {
    if (percent > 50) return '#4CAF50';
    if (percent > 25) return '#FF9800';
    return '#DC0A2D';
  };

  const canAffordMove = (move: Move, energy: EnergyPool) => {
    for (const [type, cost] of Object.entries(move.cost)) {
      const available = energy[type as keyof EnergyPool] || 0;
      if (available < cost) return false;
    }
    return true;
  };

  const isMoveOnCooldown = (move: Move) => {
    return (move.currentCooldown || 0) > 0;
  };

  if (loading) {
    return (
      <div className="battle-loading">
        <div className="loading-spinner"></div>
        <p>Loading battle...</p>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="battle-error">
        <h2>Error</h2>
        <p>{error || socketError || 'Battle not found'}</p>
        <Link href="/play" className="btn-back">Back to Play</Link>
      </div>
    );
  }

  const myPlayer = battle.player1;
  const opponent = battle.player2;
  const isMyTurn = battle.currentPhase === 'selection' && battle.status === 'active';

  return (
    <div className="battle-page">
      {/* Battle Header */}
      <div className="battle-header">
        <div className="battle-info">
          <span className="turn-counter">Turn {battle.turn}</span>
          <span className="turn-timer">⏱️ {turnTimer}s</span>
          <span className="battle-status">
            {battle.status === 'finished' 
              ? `Winner: ${battle.winner === playerId ? 'YOU!' : 'Opponent'}`
              : isMyTurn 
                ? 'Select your moves' 
                : 'Waiting for opponent...'}
          </span>
        </div>
        <div className="battle-actions-header">
          <button className="btn-surrender" onClick={surrender}>Surrender</button>
        </div>
      </div>

      {/* Victory/Defeat Overlay */}
      {battle.status === 'finished' && (
        <div className="battle-result-overlay">
          <div className={`result-card ${battle.winner === playerId ? 'victory' : 'defeat'}`}>
            <h1>{battle.winner === playerId ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
            <p>{battle.winner === playerId ? 'Congratulations, Trainer!' : 'Better luck next time!'}</p>
            <Link href="/play" className="btn-play-again">Play Again</Link>
          </div>
        </div>
      )}

      {/* Battle Field */}
      <div className="battle-field">
        {/* Animation Overlay */}
        <BattleAnimationManager 
          animations={animations} 
          onAnimationComplete={removeAnimation}
        />
        
        {/* Turn Transition */}
        {showTurnTransition && (
          <TurnTransition 
            turn={battle.turn} 
            onComplete={() => setShowTurnTransition(false)}
          />
        )}
        
        {/* Opponent Side */}
        <div className="opponent-side">
          <div className="player-info opponent">
            <span className="player-name">🎮 {opponent?.name || 'Opponent'}</span>
          </div>
          <div className="pokemon-row">
            {opponent?.team.map((poke, idx) => {
              const healthPercent = getHealthPercent(poke.currentHealth, poke.maxHealth);
              const isDead = poke.currentHealth <= 0;
              const isTargeted = Object.values(selectedTargets).includes(idx);
              
              return (
                <div 
                  key={poke.id}
                  id={`opp-pokemon-${idx}`}
                  className={`battle-pokemon opponent ${isDead ? 'dead' : ''} ${isTargeted ? 'targeted' : ''}`}
                  onClick={() => !isDead && selectTarget(0, isTargeted ? null : idx)}
                >
                  <div className="pokemon-sprite" style={{ borderColor: getTypeColor(poke.type) }}>
                    <img 
                      src={poke.imageUrl || '/images/pokemon/default.png'} 
                      alt={poke.name}
                      style={{ filter: isDead ? 'grayscale(100%)' : 'none' }}
                    />
                    {poke.isStunned && <div className="status-stunned">💫</div>}
                    {isTargeted && <div className="target-indicator">🎯</div>}
                  </div>
                  <div className="pokemon-name">{poke.name}</div>
                  <div className="health-bar">
                    <div 
                      className="health-fill" 
                      style={{ 
                        width: `${healthPercent}%`,
                        backgroundColor: getHealthColor(healthPercent)
                      }}
                    />
                  </div>
                  <div className="health-text">{poke.currentHealth}/{poke.maxHealth}</div>
                  {poke.effects.length > 0 && (
                    <div className="effects-list">
                      {poke.effects.map((eff, i) => (
                        <span key={i} className="effect-badge">{eff}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* VS Divider */}
        <div className="vs-divider">
          <span>VS</span>
        </div>

        {/* My Side */}
        <div className="my-side">
          <div className="player-info me">
            <span className="player-name">⭐ {myPlayer?.name || 'You'}</span>
          </div>
          <div className="pokemon-row">
            {myPlayer?.team.map((poke, pokemonIdx) => {
              const healthPercent = getHealthPercent(poke.currentHealth, poke.maxHealth);
              const isDead = poke.currentHealth <= 0;
              const selectedMoveIdx = selectedMoves[pokemonIdx];
              
              return (
                <div 
                  key={poke.id}
                  id={`my-pokemon-${pokemonIdx}`}
                  className={`battle-pokemon mine ${isDead ? 'dead' : ''} ${selectedMoveIdx !== undefined && selectedMoveIdx !== null ? 'has-action' : ''}`}
                >
                  <div className="pokemon-sprite" style={{ borderColor: getTypeColor(poke.type) }}>
                    <img 
                      src={poke.imageUrl || '/images/pokemon/default.png'} 
                      alt={poke.name}
                      style={{ filter: isDead ? 'grayscale(100%)' : 'none' }}
                    />
                    {poke.isStunned && <div className="status-stunned">💫</div>}
                    {selectedMoveIdx !== undefined && selectedMoveIdx !== null && <div className="action-selected">✓</div>}
                  </div>
                  <div className="pokemon-name">{poke.name}</div>
                  <div className="health-bar">
                    <div 
                      className="health-fill" 
                      style={{ 
                        width: `${healthPercent}%`,
                        backgroundColor: getHealthColor(healthPercent)
                      }}
                    />
                  </div>
                  <div className="health-text">{poke.currentHealth}/{poke.maxHealth}</div>
                  
                  {/* Move Selection */}
                  {isMyTurn && !isDead && !poke.isStunned && (
                    <div className="move-selection">
                      {poke.moves.map((move, moveIdx) => {
                        const canAfford = canAffordMove(move, myPlayer.energy);
                        const onCooldown = isMoveOnCooldown(move);
                        const isSelected = selectedMoveIdx === moveIdx;
                        const isDisabled = !canAfford || onCooldown;
                        
                        return (
                          <button
                            key={move.id}
                            className={`move-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && selectMove(pokemonIdx, moveIdx)}
                            disabled={isDisabled}
                            title={`${move.description || move.name}${onCooldown ? ` (Cooldown: ${move.currentCooldown} turns)` : ''}`}
                          >
                            <span className="move-name-btn">{move.name}</span>
                            <span className="move-damage-btn">
                              {move.damage > 0 ? `${move.damage} DMG` : 'Effect'}
                            </span>
                            <span className="move-cost">
                              {Object.entries(move.cost).map(([type, cost]) => (
                                <span key={type} className="cost-item">
                                  {getEnergyIcon(type)}{cost}
                                </span>
                              ))}
                            </span>
                            {onCooldown && (
                              <span className="cooldown-badge">CD: {move.currentCooldown}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Energy Pool */}
      {myPlayer && (
        <div className="energy-pool">
          <h3>Your Energy</h3>
          <div className="energy-items">
            {Object.entries(myPlayer.energy).map(([type, amount]) => (
              <div 
                key={type} 
                className={`energy-item ${amount > 0 ? 'clickable' : ''}`}
                onClick={() => amount > 0 && handleExchangeEnergy(type)}
                title={amount > 0 ? `Click to exchange 1 ${type} energy for 1 random energy` : ''}
              >
                <span className="energy-icon">{getEnergyIcon(type)}</span>
                <span className="energy-amount">{amount}</span>
                <span className="energy-type">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      {isMyTurn && (
        <div className="action-bar">
          <div className="selected-count">
            {Object.values(selectedMoves).filter(m => m !== null && m !== undefined).length} move(s) selected
          </div>
          <button 
            className="btn-submit-actions"
            onClick={submitActions}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'End Turn'}
          </button>
        </div>
      )}

      {/* Battle Log */}
      <div className="battle-log">
        <h3>Battle Log</h3>
        <div className="log-entries">
          {battle.log.slice(-10).reverse().map((entry, i) => (
            <div key={i} className="log-entry">{entry}</div>
          ))}
        </div>
      </div>

      {/* Chat */}
      {socketState === 'inBattle' && (
        <div className="battle-chat">
          <h3>Chat</h3>
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender === 'you' ? 'mine' : 'opponent'}`}>
                {msg.text}
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
            />
            <button onClick={handleSendChat}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
