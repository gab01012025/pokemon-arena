'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { type ActionIntent, type TeamData } from '@/lib/game-socket';
import { getPokemonImageUrl } from '@/lib/pokemon-images';
import './multiplayer.css';

import { RosterPokemon, fetchRoster } from './data';
import {
  ConnectingScreen,
  QueueScreen,
  BattleResultModal,
  TeamSelectScreen,
  BattleTopBar,
  PlayerPanel,
  OpponentPanel,
  BattleLog,
  SurrenderModal,
} from './components';

// Battle background images - random selection per battle
const BATTLE_BACKGROUNDS = [
  '/images/cenarios/forest.png',
  '/images/cenarios/volcano.png',
  '/images/cenarios/ocean.png',
  '/images/cenarios/mountain.png',
  '/images/cenarios/city.png',
];

export default function MultiplayerPage() {
  return (
    <Suspense fallback={<div className="multiplayer-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><p>Loading...</p></div>}>
      <MultiplayerPageContent />
    </Suspense>
  );
}

function MultiplayerPageContent() {
  const searchParams = useSearchParams();
  const [state, actions] = useMultiplayer();
  const [roster, setRoster] = useState<RosterPokemon[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<RosterPokemon[]>([]);
  const [queueType, setQueueType] = useState<'quick' | 'ranked'>('quick');
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);

  // Battle state - intents per fighter slot (0, 1, 2)
  const [intents, setIntents] = useState<Record<number, ActionIntent | null>>({});
  const [targetingSlot, setTargetingSlot] = useState<{ fighterIdx: number; skillIdx: number } | null>(null);

  // Private room
  const [privateRoomCode, setPrivateRoomCode] = useState('');

  // VS screen
  const [showVsScreen, setShowVsScreen] = useState(false);

  // Emote popup
  const [emotePopup, setEmotePopup] = useState<string | null>(null);

  // Battle background (random per battle)
  const [battleBg, setBattleBg] = useState('');

  // Auto-fill room code from URL params
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setPrivateRoomCode(roomParam.toUpperCase());
    }
  }, [searchParams]);

  // Load roster from API
  useEffect(() => {
    fetchRoster().then(r => {
      setRoster(r);
      setLoadingRoster(false);
    });
  }, []);

  // Reset intents when turn changes or battle ends
  useEffect(() => {
    setIntents({});
    setTargetingSlot(null);
  }, [state.currentTurn, state.inBattle]);

  // Show VS screen on battle start + set random background
  useEffect(() => {
    if (state.inBattle && state.currentTurn === 1) {
      setBattleBg(BATTLE_BACKGROUNDS[Math.floor(Math.random() * BATTLE_BACKGROUNDS.length)]);
      setShowVsScreen(true);
      const timer = setTimeout(() => setShowVsScreen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.inBattle, state.currentTurn]);

  // Team selection handlers
  const togglePokemon = useCallback((pokemon: RosterPokemon) => {
    // Block locked Pokemon
    if (pokemon.isOwned === false) return;
    
    setSelectedTeam(prev => {
      const isSelected = prev.some(p => p.id === pokemon.id);
      if (isSelected) return prev.filter(p => p.id !== pokemon.id);
      if (prev.length >= 3) return prev;
      return [...prev, pokemon];
    });
  }, []);

  const removePokemon = useCallback((index: number) => {
    setSelectedTeam(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Build TeamData from selected roster Pokemon
  const buildTeamData = useCallback((): TeamData => ({
    pokemon: selectedTeam.map(p => ({
      dbId: p.id,
      name: p.name,
      types: p.types,
      health: p.health,
      skills: p.skills,
    })),
  }), [selectedTeam]);

  // Connect handler
  const handleConnect = useCallback(async () => {
    try {
      await actions.connect();
    } catch {
      // Error handled by hook
    }
  }, [actions]);

  // Auto-connect on page load
  useEffect(() => {
    if (!state.isConnected && !state.isConnecting && !state.connectionError) {
      handleConnect();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Join queue handler
  const handleJoinQueue = useCallback(() => {
    if (selectedTeam.length !== 3) return;
    actions.joinQueue(buildTeamData(), queueType);
  }, [selectedTeam, queueType, actions, buildTeamData]);

  // Move selection (skill click on your fighter)
  const handleSkillSelect = useCallback((fighterIdx: number, skillIdx: number) => {
    const fighter = state.yourFighters[fighterIdx];
    if (!fighter) return;

    const skill = fighter.skills[skillIdx];
    if (!skill) return;

    // If already selected same skill, deselect
    const existing = intents[fighterIdx];
    if (existing && existing.skillIndex === skillIdx) {
      setIntents(prev => ({ ...prev, [fighterIdx]: null }));
      setTargetingSlot(null);
      return;
    }

    if (skill.target === 'self') {
      setIntents(prev => ({
        ...prev,
        [fighterIdx]: { userSlot: fighter.slot, skillIndex: skillIdx, targetSlot: fighter.slot },
      }));
      setTargetingSlot(null);
    } else if (skill.target === 'all-enemies' || skill.target === 'enemies') {
      const firstEnemy = state.opponentFighters.find(f => f.alive);
      setIntents(prev => ({
        ...prev,
        [fighterIdx]: { userSlot: fighter.slot, skillIndex: skillIdx, targetSlot: firstEnemy?.slot ?? 3 },
      }));
      setTargetingSlot(null);
    } else {
      setTargetingSlot({ fighterIdx, skillIdx });
    }
  }, [state.yourFighters, state.opponentFighters, intents]);

  // Target selection (click an enemy)
  const handleTargetSelect = useCallback((enemyIdx: number) => {
    if (!targetingSlot) return;
    const fighter = state.yourFighters[targetingSlot.fighterIdx];
    const enemy = state.opponentFighters[enemyIdx];
    if (!fighter || !enemy) return;

    setIntents(prev => ({
      ...prev,
      [targetingSlot.fighterIdx]: {
        userSlot: fighter.slot,
        skillIndex: targetingSlot.skillIdx,
        targetSlot: enemy.slot,
      },
    }));
    setTargetingSlot(null);
  }, [targetingSlot, state.yourFighters, state.opponentFighters]);

  // Submit turn
  const handleSubmitMoves = useCallback(() => {
    const actionIntents: ActionIntent[] = Object.values(intents).filter((i): i is ActionIntent => i !== null);
    actions.submitMoves(actionIntents);
  }, [intents, actions]);

  // Surrender
  const handleSurrender = useCallback(() => {
    actions.surrender();
    setShowSurrenderModal(false);
  }, [actions]);

  // Return to lobby
  const handleReturnToLobby = useCallback(() => {
    actions.resetBattle();
    setSelectedTeam([]);
    setIntents({});
    setTargetingSlot(null);
  }, [actions]);

  // Emotes
  const handleSendEmote = useCallback((emote: string) => {
    actions.sendEmote?.(emote);
    setEmotePopup(emote);
    setTimeout(() => setEmotePopup(null), 2000);
  }, [actions]);

  // New match (go back to queue)
  const handleNewMatch = useCallback(() => {
    actions.resetBattle();
    setIntents({});
    setTargetingSlot(null);
    // Only reset battle, not team, to quickly re-queue
  }, [actions]);

  // Rematch
  const handleRematch = useCallback(() => {
    actions.requestRematch?.();
  }, [actions]);

  // Private room handlers
  const handleCreatePrivateRoom = useCallback(() => {
    if (selectedTeam.length !== 3) return;
    actions.createPrivateRoom(buildTeamData());
  }, [selectedTeam, actions, buildTeamData]);

  const handleJoinPrivateRoom = useCallback(() => {
    if (selectedTeam.length !== 3 || !privateRoomCode.trim()) return;
    actions.joinPrivateRoom(privateRoomCode.trim(), buildTeamData());
  }, [selectedTeam, privateRoomCode, actions, buildTeamData]);

  // Ready state
  const readyCount = useMemo(() => {
    let count = 0;
    state.yourFighters.forEach((f, idx) => {
      if (f.alive && intents[idx]) count++;
    });
    return count;
  }, [intents, state.yourFighters]);

  const aliveFighterCount = useMemo(() => {
    return state.yourFighters.filter(f => f.alive).length;
  }, [state.yourFighters]);

  const allReady = readyCount > 0 && readyCount === aliveFighterCount;

  // Selected skills per fighter (for highlighting)
  const selectedSkills = useMemo(() => {
    const map: Record<number, number | null> = {};
    state.yourFighters.forEach((_, idx) => {
      map[idx] = intents[idx]?.skillIndex ?? null;
    });
    return map;
  }, [intents, state.yourFighters]);

  // ==================== RENDER ====================

  // 1. Show result
  if (state.battleResult) {
    return (
      <div className="multiplayer-wrapper">
        <BattleResultModal
          result={state.battleResult}
          trainerId={state.trainerId}
          username={state.username || undefined}
          onReturn={handleReturnToLobby}
          onRematch={handleRematch}
          onNewMatch={handleNewMatch}
        />
      </div>
    );
  }

  // 2. In battle
  if (state.inBattle) {
    return (
      <div className="multiplayer-wrapper">
        <div className="battle-wrapper">
          {/* Battle background */}
          {battleBg && (
            <div
              className="battle-background-mp"
              style={{ backgroundImage: `url(${battleBg})` }}
            />
          )}

          {/* VS Screen overlay */}
          {showVsScreen && (
            <div className="vs-screen-overlay">
              <div className="vs-screen-content">
                <div className="vs-screen-player">
                  <div className="vs-screen-name">{state.username || 'You'}</div>
                  <div className="vs-screen-team">
                    {state.yourFighters.map((f, i) => (
                      <img key={i} src={getPokemonImageUrl(f.name, 'default')} alt={f.name} />
                    ))}
                  </div>
                </div>
                <div className="vs-text">VS</div>
                <div className="vs-screen-opponent">
                  <div className="vs-screen-name">{state.opponent?.username || 'Opponent'}</div>
                  <div className="vs-screen-team">
                    {state.opponentFighters.map((f, i) => (
                      <img key={i} src={getPokemonImageUrl(f.name, 'default')} alt={f.name} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emote popup */}
          {emotePopup && <div className="emote-popup">{emotePopup}</div>}

          <div className="battle-content-mp">
            <BattleTopBar
              username={state.username || 'You'}
              opponent={state.opponent}
              currentTurn={state.currentTurn}
              turnTimer={state.turnTimer}
              energy={state.yourEnergy}
              opponentDisconnected={state.opponentDisconnected}
              opponentReady={state.opponentReady}
              isReady={state.isReady}
            />

            <div className="battle-arena">
              <PlayerPanel
                fighters={state.yourFighters}
                selectedSkills={selectedSkills}
                energy={state.yourEnergy}
                onSkillSelect={handleSkillSelect}
              />

              <BattleLog
                battleLog={state.battleLog}
                targetingSlot={targetingSlot}
                allReady={allReady}
                isReady={state.isReady}
                readyCount={readyCount}
                aliveFighterCount={aliveFighterCount}
                onSubmitMoves={handleSubmitMoves}
                onSurrenderClick={() => setShowSurrenderModal(true)}
                onCancelTarget={() => setTargetingSlot(null)}
                chatMessages={state.chatMessages}
                onSendChat={actions.sendChat}
                onSendEmote={handleSendEmote}
              />

              <OpponentPanel
                fighters={state.opponentFighters}
                isTargeting={targetingSlot !== null}
                onTargetSelect={handleTargetSelect}
              />
            </div>

            {showSurrenderModal && (
              <SurrenderModal
                onConfirm={handleSurrender}
                onCancel={() => setShowSurrenderModal(false)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. In queue
  if (state.inQueue) {
    return (
      <div className="multiplayer-wrapper">
        <QueueScreen state={state} selectedTeam={selectedTeam} onCancel={actions.leaveQueue} />
      </div>
    );
  }

  // 4. Connected + Authenticated → Lobby
  if (state.isConnected && state.isAuthenticated) {
    return (
      <div className="multiplayer-wrapper">
        <TeamSelectScreen
          state={state}
          roster={roster}
          loadingRoster={loadingRoster}
          selectedTeam={selectedTeam}
          queueType={queueType}
          privateRoomCode={privateRoomCode}
          onTogglePokemon={togglePokemon}
          onRemovePokemon={removePokemon}
          onSetQueueType={setQueueType}
          onJoinQueue={handleJoinQueue}
          onDisconnect={actions.disconnect}
          onCreatePrivateRoom={handleCreatePrivateRoom}
          onJoinPrivateRoom={handleJoinPrivateRoom}
          onSetPrivateRoomCode={setPrivateRoomCode}
        />
      </div>
    );
  }

  // 5. Not connected
  return (
    <div className="multiplayer-wrapper">
      <ConnectingScreen state={state} onConnect={handleConnect} />
    </div>
  );
}
