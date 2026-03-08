/**
 * Pokemon Arena - Multiplayer React Hook v2
 * Manages WebSocket connection, authentication, queue, battle, and result state.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import {
  gameSocket,
  type BattleStartData,
  type TurnUpdateData,
  type BattleEndData,
  type BattleReconnectData,
  type ClientFighter,
  type ClientLogEntry,
  type Energy,
  type ActionIntent,
  type TeamData,
  type PlayerResultData,
} from '@/lib/game-socket';

// =============================================================================
// STATE TYPES
// =============================================================================

export interface UseMultiplayerState {
  // Connection
  isConnected: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  connectionError: string | null;
  onlineCount: number;
  trainerId: string | null;
  username: string | null;

  // Queue
  inQueue: boolean;
  queuePosition: number;
  queueType: 'quick' | 'ranked' | null;
  estimatedWait: number;

  // Battle
  inBattle: boolean;
  battleId: string | null;
  opponent: { username: string; level: number } | null;
  yourFighters: ClientFighter[];
  opponentFighters: ClientFighter[];
  yourEnergy: Energy;
  currentTurn: number;
  turnTimer: number;
  isReady: boolean;
  battleLog: ClientLogEntry[];
  opponentReady: boolean;

  // Result
  battleResult: BattleEndData | null;

  // Chat
  chatMessages: Array<{ username: string; message: string; timestamp: number }>;

  // Private rooms
  privateRoomId: string | null;

  // Opponent status
  opponentDisconnected: boolean;
  opponentGracePeriod: number;
}

export interface UseMultiplayerActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  joinQueue: (team: TeamData, queueType?: 'quick' | 'ranked') => void;
  leaveQueue: () => void;
  submitMoves: (intents: ActionIntent[]) => void;
  surrender: () => void;
  sendChat: (message: string) => void;
  sendEmote?: (emote: string) => void;
  requestRematch?: () => void;
  createPrivateRoom: (team: TeamData) => void;
  joinPrivateRoom: (roomId: string, team: TeamData) => void;
  resetBattle: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: UseMultiplayerState = {
  isConnected: false,
  isConnecting: false,
  isAuthenticated: false,
  connectionError: null,
  onlineCount: 0,
  trainerId: null,
  username: null,
  inQueue: false,
  queuePosition: 0,
  queueType: null,
  estimatedWait: 0,
  inBattle: false,
  battleId: null,
  opponent: null,
  yourFighters: [],
  opponentFighters: [],
  yourEnergy: { fire: 0, water: 0, grass: 0, lightning: 0, colorless: 0 },
  currentTurn: 1,
  turnTimer: 90,
  isReady: false,
  battleLog: [],
  opponentReady: false,
  battleResult: null,
  chatMessages: [],
  privateRoomId: null,
  opponentDisconnected: false,
  opponentGracePeriod: 0,
};

// =============================================================================
// HOOK
// =============================================================================

export function useMultiplayer(): [UseMultiplayerState, UseMultiplayerActions] {
  const [state, setState] = useState<UseMultiplayerState>(initialState);
  const tokenRef = useRef<string | null>(null);

  // ==================== Event Handlers ====================
  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    // Connection
    unsubscribes.push(
      gameSocket.on('connectionChange', (data: { connected: boolean; reason?: string }) => {
        setState(prev => ({
          ...prev,
          isConnected: data.connected,
          isConnecting: false,
          connectionError: data.connected ? null : data.reason || 'Disconnected',
          isAuthenticated: data.connected ? prev.isAuthenticated : false,
        }));

        // Auto-authenticate on reconnect
        if (data.connected && tokenRef.current) {
          gameSocket.authenticate(tokenRef.current);
        }
      })
    );

    // Auth success
    unsubscribes.push(
      gameSocket.on('authenticated', (data: { success: boolean; trainerId: string; username: string; level: number; ladderPoints: number }) => {
        if (data.success) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            trainerId: data.trainerId,
            username: data.username,
          }));
          logger.debug('Authenticated with game server');
        }
      })
    );

    // Auth error
    unsubscribes.push(
      gameSocket.on('authError', (data: { message: string }) => {
        setState(prev => ({
          ...prev,
          connectionError: `Auth failed: ${data.message}`,
          isAuthenticated: false,
        }));
      })
    );

    // Force disconnect
    unsubscribes.push(
      gameSocket.on('forceDisconnect', (data: { reason: string }) => {
        setState(prev => ({
          ...prev,
          connectionError: data.reason,
          isAuthenticated: false,
        }));
      })
    );

    // Online count
    unsubscribes.push(
      gameSocket.on('onlineCount', (data: { count: number }) => {
        setState(prev => ({ ...prev, onlineCount: data.count }));
      })
    );

    // Queue
    unsubscribes.push(
      gameSocket.on('queueJoined', (data: { position: number; queueType: string; estimatedWait: number }) => {
        setState(prev => ({
          ...prev,
          inQueue: true,
          queuePosition: data.position,
          queueType: data.queueType as 'quick' | 'ranked',
          estimatedWait: data.estimatedWait,
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
          estimatedWait: 0,
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
          battleId: data.battleId,
          opponent: data.opponent,
          yourFighters: data.yourFighters,
          opponentFighters: data.opponentFighters,
          yourEnergy: data.yourEnergy,
          currentTurn: data.turn,
          turnTimer: data.turnTimeRemaining,
          isReady: false,
          battleLog: [],
          opponentReady: false,
          battleResult: null,
          opponentDisconnected: false,
        }));
      })
    );

    // Turn update
    unsubscribes.push(
      gameSocket.on('turnUpdate', (data: TurnUpdateData) => {
        setState(prev => ({
          ...prev,
          yourFighters: data.yourFighters,
          opponentFighters: data.opponentFighters,
          yourEnergy: data.yourEnergy,
          currentTurn: data.turn,
          turnTimer: data.turnTimeRemaining,
          isReady: false,
          opponentReady: false,
          battleLog: data.log || [],
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

    // Opponent ready status
    unsubscribes.push(
      gameSocket.on('opponentReady', (data: { ready: boolean }) => {
        setState(prev => ({ ...prev, opponentReady: data.ready }));
      })
    );

    // Battle end
    unsubscribes.push(
      gameSocket.on('battleEnd', (data: BattleEndData) => {
        setState(prev => ({
          ...prev,
          inBattle: false,
          battleResult: data,
        }));
      })
    );

    // Battle reconnect
    unsubscribes.push(
      gameSocket.on('battleReconnect', (data: BattleReconnectData) => {
        setState(prev => ({
          ...prev,
          inBattle: true,
          battleId: data.battleId,
          opponent: data.opponent,
          yourFighters: data.yourFighters,
          opponentFighters: data.opponentFighters,
          yourEnergy: data.yourEnergy,
          currentTurn: data.turn,
          turnTimer: data.turnTimeRemaining,
          isReady: false,
          battleLog: [],
          battleResult: null,
          opponentDisconnected: false,
        }));
      })
    );

    // Opponent disconnect/reconnect
    unsubscribes.push(
      gameSocket.on('opponentDisconnected', (data: { gracePeriod: number }) => {
        setState(prev => ({
          ...prev,
          opponentDisconnected: true,
          opponentGracePeriod: data.gracePeriod,
        }));
      })
    );

    unsubscribes.push(
      gameSocket.on('opponentReconnected', () => {
        setState(prev => ({
          ...prev,
          opponentDisconnected: false,
          opponentGracePeriod: 0,
        }));
      })
    );

    // Private rooms
    unsubscribes.push(
      gameSocket.on('privateRoomCreated', (data: { roomId: string }) => {
        setState(prev => ({ ...prev, privateRoomId: data.roomId }));
      })
    );

    unsubscribes.push(
      gameSocket.on('privateRoomExpired', () => {
        setState(prev => ({ ...prev, privateRoomId: null }));
      })
    );

    // Chat
    unsubscribes.push(
      gameSocket.on('chatMessage', (data: { username: string; message: string; timestamp: number }) => {
        setState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages.slice(-50), data],
        }));
      })
    );

    // Error
    unsubscribes.push(
      gameSocket.on('error', (data: { message: string }) => {
        logger.error(`Game server error: ${data.message}`);
      })
    );

    return () => { unsubscribes.forEach(u => u()); };
  }, []);

  // ==================== Actions ====================

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));
    try {
      await gameSocket.connect();

      // Get JWT token from API
      const res = await fetch('/api/auth/socket-token');
      if (!res.ok) {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          connectionError: 'Not logged in. Please log in first.',
        }));
        return;
      }
      const tokenData = await res.json();
      tokenRef.current = tokenData.token;
      gameSocket.authenticate(tokenData.token);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : 'Connection failed',
      }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    gameSocket.disconnect();
    tokenRef.current = null;
    setState(initialState);
  }, []);

  const joinQueue = useCallback((team: TeamData, queueType: 'quick' | 'ranked' = 'quick') => {
    gameSocket.joinQueue(team, queueType);
  }, []);

  const leaveQueue = useCallback(() => {
    gameSocket.leaveQueue();
  }, []);

  const submitMoves = useCallback((intents: ActionIntent[]) => {
    gameSocket.submitMoves(intents);
  }, []);

  const surrender = useCallback(() => {
    gameSocket.surrender();
  }, []);

  const sendChat = useCallback((message: string) => {
    gameSocket.sendChat(message);
  }, []);

  const createPrivateRoom = useCallback((team: TeamData) => {
    gameSocket.createPrivateRoom(team);
  }, []);

  const joinPrivateRoom = useCallback((roomId: string, team: TeamData) => {
    gameSocket.joinPrivateRoom(roomId, team);
  }, []);

  const sendEmote = useCallback((emote: string) => {
    gameSocket.sendEmote(emote);
  }, []);

  const requestRematch = useCallback(() => {
    gameSocket.requestRematch();
  }, []);

  const resetBattle = useCallback(() => {
    setState(prev => ({
      ...prev,
      inBattle: false,
      battleId: null,
      opponent: null,
      yourFighters: [],
      opponentFighters: [],
      yourEnergy: { fire: 0, water: 0, grass: 0, lightning: 0, colorless: 0 },
      currentTurn: 1,
      turnTimer: 90,
      isReady: false,
      battleLog: [],
      opponentReady: false,
      battleResult: null,
      chatMessages: [],
      privateRoomId: null,
      opponentDisconnected: false,
      opponentGracePeriod: 0,
    }));
  }, []);

  return [state, {
    connect,
    disconnect,
    joinQueue,
    leaveQueue,
    submitMoves,
    surrender,
    sendChat,
    sendEmote,
    requestRematch,
    createPrivateRoom,
    joinPrivateRoom,
    resetBattle,
  }];
}
