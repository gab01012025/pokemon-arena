'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { useGameSocket } from '@/hooks/useGameSocket';

interface Pokemon {
  id: string;
  name: string;
  type: string;
  secondaryType: string | null;
  health: number;
  imageUrl: string | null;
  isStarter: boolean;
  isUnlockable: boolean;
  moves: { id: string; name: string }[];
}

interface UserData {
  id: string;
  username: string;
}

type GameMode = 'selection' | 'queue' | 'battle';

export default function PlayPage() {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Pokemon[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('selection');
  const [queueTime, setQueueTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Get user data for WebSocket
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserData({ id: data.user.id, username: data.user.username });
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
    battleId,
    queuePosition,
    onlineCount,
    error: socketError,
    connect,
    disconnect,
    joinQueue: wsJoinQueue,
    leaveQueue: wsLeaveQueue,
  } = useGameSocket(userData?.id || null, userData?.username || null);

  // Connect to socket when user is loaded
  useEffect(() => {
    if (userData && socketState === 'disconnected') {
      connect();
    }
  }, [userData, socketState, connect]);

  // Handle battle found
  useEffect(() => {
    if (battleId && socketState === 'inBattle') {
      setGameMode('battle');
      // Redirect to battle page
      router.push(`/battle/${battleId}`);
    }
  }, [battleId, socketState, router]);

  // Handle queue state
  useEffect(() => {
    if (socketState === 'inQueue') {
      setGameMode('queue');
    }
  }, [socketState]);

  // Handle socket errors
  useEffect(() => {
    if (socketError) {
      setError(socketError);
    }
  }, [socketError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameMode === 'queue') {
        wsLeaveQueue();
      }
    };
  }, [gameMode, wsLeaveQueue]);

  // Fetch available Pokemon
  useEffect(() => {
    async function fetchPokemon() {
      try {
        const res = await fetch('/api/pokemon');
        if (res.ok) {
          const data = await res.json();
          setPokemon(data);
        }
      } catch {
        console.error('Failed to fetch Pokemon');
      } finally {
        setLoading(false);
      }
    }
    fetchPokemon();
  }, []);

  // Queue timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameMode === 'queue') {
      interval = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameMode]);

  const selectPokemon = (poke: Pokemon) => {
    if (selectedTeam.find(p => p.id === poke.id)) {
      setSelectedTeam(selectedTeam.filter(p => p.id !== poke.id));
    } else if (selectedTeam.length < 3) {
      setSelectedTeam([...selectedTeam, poke]);
    }
  };

  // Join queue with WebSocket
  const joinQueue = useCallback(async () => {
    if (selectedTeam.length !== 3) {
      setError('Select 3 Pokémon to battle!');
      return;
    }

    setError(null);
    setQueueTime(0);

    // Use WebSocket if connected
    if (socketState === 'authenticated') {
      wsJoinQueue({
        slot1: selectedTeam[0],
        slot2: selectedTeam[1],
        slot3: selectedTeam[2],
      }, 'quick');
      setGameMode('queue');
    } else {
      // Fallback to REST API
      try {
        const res = await fetch('/api/battle/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamPokemonIds: selectedTeam.map(p => p.id)
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.battleId) {
            router.push(`/battle/${data.battleId}`);
          } else {
            setGameMode('queue');
          }
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to join queue');
        }
      } catch {
        setError('Connection error');
      }
    }
  }, [selectedTeam, socketState, wsJoinQueue, router]);

  // Leave queue
  const leaveQueue = useCallback(async () => {
    if (socketState === 'inQueue') {
      wsLeaveQueue();
    } else {
      try {
        await fetch('/api/battle/queue', { method: 'DELETE' });
      } catch {
        // Ignore
      }
    }
    setGameMode('selection');
    setQueueTime(0);
  }, [socketState, wsLeaveQueue]);

  // Start AI battle
  const startAiBattle = useCallback(async () => {
    if (selectedTeam.length !== 3) {
      setError('Select 3 Pokémon to battle!');
      return;
    }

    setError(null);
    
    try {
      const res = await fetch('/api/battle/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamPokemonIds: selectedTeam.map(p => p.id),
          difficulty: 'normal'
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/battle/${data.battleId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start AI battle');
      }
    } catch {
      setError('Connection error - AI battle not available yet');
    }
  }, [selectedTeam, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top active">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">🎮 DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>⚡ POKEMON ARENA ⚡</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">⚔️ Battle Arena ⚔️</h1>

          {error && (
            <div className="error-banner">{error}</div>
          )}

          {/* Queue Mode */}
          {gameMode === 'queue' && (
            <div className="content-section queue-section">
              <div className="section-title">🔍 Searching for Opponent...</div>
              <div className="section-content">
                <div className="queue-display">
                  <div className="queue-spinner"></div>
                  <div className="queue-time">Time in queue: {formatTime(queueTime)}</div>
                  {queuePosition && (
                    <div className="queue-position">Queue position: #{queuePosition}</div>
                  )}
                  <div className="queue-team">
                    <span>Your Team:</span>
                    <div className="queue-team-icons">
                      {selectedTeam.map(p => (
                        <div key={p.id} className="queue-team-pokemon" style={{ borderColor: getTypeColor(p.type) }}>
                          <img 
                            src={p.imageUrl || '/images/pokemon/default.png'} 
                            alt={p.name}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="btn-cancel-queue" onClick={leaveQueue}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Battle Mode - Redirecting */}
          {gameMode === 'battle' && battleId && (
            <div className="content-section battle-section">
              <div className="section-title">⚔️ Battle Found!</div>
              <div className="section-content">
                <div className="battle-found">
                  <p>Battle ID: {battleId}</p>
                  <p>Redirecting to battle...</p>
                  <Link href={`/battle/${battleId}`} className="btn-enter-battle">
                    ENTER BATTLE
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Selection Mode */}
          {gameMode === 'selection' && (
            <>
              {/* Selected Team */}
              <div className="content-section team-section">
                <div className="section-title">Your Team ({selectedTeam.length}/3)</div>
                <div className="section-content">
                  <div className="selected-team">
                    {[0, 1, 2].map(index => (
                      <div 
                        key={index} 
                        className={`team-slot-new ${selectedTeam[index] ? 'filled' : 'empty'}`}
                        style={selectedTeam[index] ? { borderColor: getTypeColor(selectedTeam[index].type) } : {}}
                        onClick={() => selectedTeam[index] && selectPokemon(selectedTeam[index])}
                      >
                        {selectedTeam[index] ? (
                          <>
                            <img 
                              src={selectedTeam[index].imageUrl || '/images/pokemon/default.png'} 
                              alt={selectedTeam[index].name}
                            />
                            <span className="slot-name">{selectedTeam[index].name}</span>
                            <span className="slot-remove">✕</span>
                          </>
                        ) : (
                          <>
                            <div className="slot-number">{index + 1}</div>
                            <span className="slot-label">Select Pokémon</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="battle-buttons">
                    <button 
                      className={`btn-queue ${selectedTeam.length === 3 ? 'ready' : 'disabled'}`}
                      onClick={joinQueue}
                      disabled={selectedTeam.length !== 3}
                    >
                      🎮 FIND MATCH
                    </button>
                    <button 
                      className={`btn-queue-ai ${selectedTeam.length === 3 ? 'ready' : 'disabled'}`}
                      onClick={startAiBattle}
                      disabled={selectedTeam.length !== 3}
                    >
                      🤖 BATTLE AI
                    </button>
                  </div>
                  
                  {/* Connection Status */}
                  <div className="connection-status">
                    <span className={`status-indicator ${socketState === 'authenticated' ? 'online' : socketState === 'connecting' ? 'connecting' : 'offline'}`}></span>
                    <span className="status-text">
                      {socketState === 'authenticated' ? 'Online' : socketState === 'connecting' ? 'Connecting...' : 'Offline'}
                    </span>
                    {onlineCount > 0 && (
                      <span className="online-count">({onlineCount} players online)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Pokemon */}
              <div className="content-section pokemon-selection-section">
                <div className="section-title">Select Your Pokémon</div>
                <div className="section-content">
                  {loading ? (
                    <div className="loading-pokemon">Loading Pokémon...</div>
                  ) : (
                    <div className="pokemon-selection-grid">
                      {pokemon.map(poke => (
                        <div 
                          key={poke.id}
                          className={`pokemon-select-card ${selectedTeam.find(p => p.id === poke.id) ? 'selected' : ''}`}
                          style={{ borderColor: getTypeColor(poke.type) }}
                          onClick={() => selectPokemon(poke)}
                        >
                          <div className="pokemon-select-image" style={{ backgroundColor: `${getTypeColor(poke.type)}22` }}>
                            <img 
                              src={poke.imageUrl || '/images/pokemon/default.png'} 
                              alt={poke.name}
                            />
                            {selectedTeam.find(p => p.id === poke.id) && (
                              <div className="selected-overlay">✓</div>
                            )}
                          </div>
                          <div className="pokemon-select-info">
                            <span className="pokemon-select-name">{poke.name}</span>
                            <span className="pokemon-select-type" style={{ backgroundColor: getTypeColor(poke.type) }}>
                              {poke.type}
                            </span>
                          </div>
                          <div className="pokemon-select-stats">
                            <span>❤️ {poke.health} HP</span>
                            <span>⚔️ {poke.moves.length} Moves</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="content-section">
                <div className="section-title">How to Play</div>
                <div className="section-content">
                  <ol className="play-instructions">
                    <li>Select 3 Pokémon to form your battle team</li>
                    <li>Click &quot;Find Match&quot; to search for an opponent</li>
                    <li>Use your Pokémon&apos;s moves strategically each turn</li>
                    <li>Manage your energy pool to use powerful attacks</li>
                    <li>Defeat all enemy Pokémon to win!</li>
                  </ol>
                </div>
              </div>
            </>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
