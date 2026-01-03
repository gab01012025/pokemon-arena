/**
 * Pokemon Arena - React Hook for Game Socket
 * Manages WebSocket connection state in React components
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  gameSocket, 
  BattleStartData, 
  TurnUpdateData, 
  BattleEndData,
  TeamSelection,
  Energy,
  BattleLogEntry,
  BattlePokemonState
} from '@/lib/game-socket';

export interface UseMultiplayerState {
  // Connection
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  onlineCount: number;
  
  // Queue
  inQueue: boolean;
  queuePosition: number;
  queueType: 'quick' | 'ranked' | null;
  estimatedWait: number;
  
  // Battle
  inBattle: boolean;
  oderId: string | null;
  opponent: {
    username: string;
    level: number;
    team: Array<{ name: string; types: string[]; currentHP: number; maxHP: number; status: any }>;
  } | null;
  yourTeam: BattlePokemonState[];
  energy: Energy;
  currentTurn: number;
  turnTimer: number;
  isReady: boolean;
  battleLog: BattleLogEntry[];
  
  // Result
  battleResult: BattleEndData | null;
  
  // Chat
  chatMessages: Array<{ username: string; message: string; timestamp: number }>;
}

export interface UseMultiplayerActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  authenticate: (oderId: string, username: string, level: number, ladderPoints: number) => void;
  joinQueue: (team: TeamSelection, queueType?: 'quick' | 'ranked') => void;
  leaveQueue: () => void;
  submitMoves: (moves: Record<number, number | null>, targets: Record<number, number | null>) => void;
  exchangeEnergy: (fromType: string) => void;
  surrender: () => void;
  sendChat: (message: string) => void;
  resetBattle: () => void;
}

const initialState: UseMultiplayerState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  onlineCount: 0,
  inQueue: false,
  queuePosition: 0,
  queueType: null,
  estimatedWait: 0,
  inBattle: false,
  oderId: null,
  opponent: null,
  yourTeam: [],
  energy: { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 },
  currentTurn: 1,
  turnTimer: 90,
  isReady: false,
  battleLog: [],
  battleResult: null,
  chatMessages: []
};

export function useMultiplayer(): [UseMultiplayerState, UseMultiplayerActions] {
  const [state, setState] = useState<UseMultiplayerState>(initialState);
  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Setup event listeners
  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    // Connection change
    unsubscribes.push(
      gameSocket.on('connectionChange', (data: { connected: boolean; reason?: string }) => {
        setState(prev => ({
          ...prev,
          isConnected: data.connected,
          isConnecting: false,
          connectionError: data.connected ? null : data.reason || 'Disconnected'
        }));
      })
    );

    // Authenticated
    unsubscribes.push(
      gameSocket.on('authenticated', (data: { success: boolean }) => {
        if (data.success) {
          console.log('✅ Authenticated with game server');
        }
      })
    );

    // Online count
    unsubscribes.push(
      gameSocket.on('onlineCount', (data: { count: number }) => {
        setState(prev => ({ ...prev, onlineCount: data.count }));
      })
    );

    // Queue events
    unsubscribes.push(
      gameSocket.on('queueJoined', (data: { position: number; queueType: string; estimatedWait: number }) => {
        setState(prev => ({
          ...prev,
          inQueue: true,
          queuePosition: data.position,
          queueType: data.queueType as 'quick' | 'ranked',
          estimatedWait: data.estimatedWait
        }));
      })
    );

    unsubscribes.push(
      gameSocket.on('queueLeft', () => {
        setState(prev => ({
          ...prev,
          inQueue: false,
          queuePosition: 0,
          queueType: null,
          estimatedWait: 0
        }));
      })
    );

    // Battle start
    unsubscribes.push(
      gameSocket.on('battleStart', (data: BattleStartData) => {
        setState(prev => ({
          ...prev,
          inQueue: false,
          inBattle: true,
          oderId: data.oderId,
          opponent: {
            username: data.opponent.username,
            level: data.opponent.level,
            team: data.opponent.team.map(p => ({ ...p, status: null }))
          },
          yourTeam: data.yourTeam,
          energy: data.energy,
          currentTurn: data.turn,
          turnTimer: data.turnTimeRemaining,
          isReady: false,
          battleLog: [],
          battleResult: null
        }));
      })
    );

    // Turn update
    unsubscribes.push(
      gameSocket.on('turnUpdate', (data: TurnUpdateData) => {
        setState(prev => ({
          ...prev,
          yourTeam: data.yourTeam,
          opponent: prev.opponent ? {
            ...prev.opponent,
            team: data.opponentTeam.map(p => ({ 
              ...p, 
              types: prev.opponent?.team.find(t => t.name === p.name)?.types || [] 
            }))
          } : null,
          energy: data.energy,
          currentTurn: data.turn,
          turnTimer: 90,
          isReady: false,
          battleLog: data.battleLog
        }));
      })
    );

    // Turn timer
    unsubscribes.push(
      gameSocket.on('turnTimer', (data: { remaining: number }) => {
        setState(prev => ({ ...prev, turnTimer: data.remaining }));
      })
    );

    // Ready confirmed
    unsubscribes.push(
      gameSocket.on('readyConfirmed', () => {
        setState(prev => ({ ...prev, isReady: true }));
      })
    );

    // Energy updated
    unsubscribes.push(
      gameSocket.on('energyUpdated', (data: { energy: Energy }) => {
        setState(prev => ({ ...prev, energy: data.energy }));
      })
    );

    // Battle end
    unsubscribes.push(
      gameSocket.on('battleEnd', (data: BattleEndData) => {
        setState(prev => ({
          ...prev,
          inBattle: false,
          battleResult: data
        }));
      })
    );

    // Chat message
    unsubscribes.push(
      gameSocket.on('chatMessage', (data: { username: string; message: string; timestamp: number }) => {
        setState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages.slice(-50), data]
        }));
      })
    );

    // Error
    unsubscribes.push(
      gameSocket.on('error', (data: { message: string }) => {
        console.error('🔥 Game server error:', data.message);
      })
    );

    unsubscribesRef.current = unsubscribes;

    // Cleanup
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Actions
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));
    try {
      await gameSocket.connect();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : 'Connection failed'
      }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    gameSocket.disconnect();
    setState(initialState);
  }, []);

  const authenticate = useCallback((oderId: string, username: string, level: number, ladderPoints: number) => {
    gameSocket.authenticate({ oderId, username, level, ladderPoints });
  }, []);

  const joinQueue = useCallback((team: TeamSelection, queueType: 'quick' | 'ranked' = 'quick') => {
    gameSocket.joinQueue(team, queueType);
  }, []);

  const leaveQueue = useCallback(() => {
    gameSocket.leaveQueue();
  }, []);

  const submitMoves = useCallback((moves: Record<number, number | null>, targets: Record<number, number | null>) => {
    gameSocket.submitMoves(moves, targets);
  }, []);

  const exchangeEnergy = useCallback((fromType: string) => {
    gameSocket.exchangeEnergy(fromType);
  }, []);

  const surrender = useCallback(() => {
    gameSocket.surrender();
  }, []);

  const sendChat = useCallback((message: string) => {
    gameSocket.sendChat(message);
  }, []);

  const resetBattle = useCallback(() => {
    setState(prev => ({
      ...prev,
      inBattle: false,
      oderId: null,
      opponent: null,
      yourTeam: [],
      energy: { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 },
      currentTurn: 1,
      turnTimer: 90,
      isReady: false,
      battleLog: [],
      battleResult: null,
      chatMessages: []
    }));
  }, []);

  const actions: UseMultiplayerActions = {
    connect,
    disconnect,
    authenticate,
    joinQueue,
    leaveQueue,
    submitMoves,
    exchangeEnergy,
    surrender,
    sendChat,
    resetBattle
  };

  return [state, actions];
}
