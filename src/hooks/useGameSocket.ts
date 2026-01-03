/**
 * Pokemon Arena - WebSocket Hook
 * Hook para conectar ao game server e gerenciar batalhas em tempo real
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const GAME_SERVER_URL = process.env.NEXT_PUBLIC_GAME_SERVER_URL || 'http://localhost:3010';

// ==================== TYPES ====================

export interface PokemonState {
  name: string;
  types: string[];
  currentHP: number;
  maxHP: number;
  status: { type: string; turnsRemaining: number } | null;
  cooldowns: number[];
}

export interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  colorless: number;
}

export interface BattleStartData {
  battleId: string;
  opponent: {
    username: string;
    level: number;
    team: PokemonState[];
  };
  yourTeam: Array<{
    pokemon: { name: string; types: string[]; hp: number; moves: MoveData[] };
    currentHP: number;
    maxHP: number;
    status: { type: string; turnsRemaining: number } | null;
    cooldowns: number[];
  }>;
  energy: Energy;
  turn: number;
  turnTimeRemaining: number;
}

export interface MoveData {
  name: string;
  type: string;
  damage: number;
  healing: number;
  target: string;
  cost: Record<string, number>;
  effects: Array<{ type: string; duration?: number; value?: number }>;
  classes: string[];
  cooldown: number;
}

export interface TurnUpdateData {
  turn: number;
  yourTeam: PokemonState[];
  opponentTeam: PokemonState[];
  energy: Energy;
  battleLog: Array<{ id: string; text: string; type: string; timestamp: number }>;
}

export interface BattleEndData {
  winnerId: string;
  reason: 'knockout' | 'surrender' | 'disconnect';
  battleLog: Array<{ id: string; text: string; type: string; timestamp: number }>;
}

export type GameSocketState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticated'
  | 'inQueue'
  | 'inBattle';

// ==================== HOOK ====================

export function useGameSocket(playerId: string | null, username: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<GameSocketState>('disconnected');
  const [battleId, setBattleId] = useState<string | null>(null);
  const [battleData, setBattleData] = useState<BattleStartData | null>(null);
  const [turnData, setTurnData] = useState<TurnUpdateData | null>(null);
  const [turnTimer, setTurnTimer] = useState<number>(90);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleEndData | null>(null);

  // Connect to server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    if (!playerId || !username) return;

    setState('connecting');
    setError(null);

    const socket = io(GAME_SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to game server');
      setState('connected');
      
      // Authenticate
      socket.emit('authenticate', {
        playerId,
        username,
        level: 1, // TODO: Get from user data
        ladderPoints: 1000, // TODO: Get from user data
      });
    });

    socket.on('authenticated', (data: { success: boolean; playerId: string }) => {
      if (data.success) {
        console.log('✅ Authenticated:', data.playerId);
        setState('authenticated');
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from game server');
      setState('disconnected');
      setBattleId(null);
      setBattleData(null);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('❌ Socket error:', data.message);
      setError(data.message);
    });

    // Queue events
    socket.on('queueJoined', (data: { position: number; queueType: string; estimatedWait: number }) => {
      console.log('🔍 Joined queue:', data);
      setState('inQueue');
      setQueuePosition(data.position);
    });

    socket.on('queueLeft', () => {
      console.log('❌ Left queue');
      setState('authenticated');
      setQueuePosition(null);
    });

    // Battle events
    socket.on('battleStart', (data: BattleStartData) => {
      console.log('⚔️ Battle started:', data);
      setState('inBattle');
      setBattleId(data.battleId);
      setBattleData(data);
      setTurnTimer(data.turnTimeRemaining);
      setQueuePosition(null);
    });

    socket.on('turnUpdate', (data: TurnUpdateData) => {
      console.log('🔄 Turn update:', data);
      setTurnData(data);
      setTurnTimer(90); // Reset timer
    });

    socket.on('turnTimer', (data: { remaining: number }) => {
      setTurnTimer(data.remaining);
    });

    socket.on('readyConfirmed', () => {
      console.log('✅ Ready confirmed');
    });

    socket.on('battleEnd', (data: BattleEndData) => {
      console.log('🏆 Battle ended:', data);
      setBattleResult(data);
      setState('authenticated');
    });

    socket.on('energyUpdated', (data: { energy: Energy }) => {
      if (battleData) {
        setBattleData({ ...battleData, energy: data.energy });
      }
    });

    socket.on('onlineCount', (data: { count: number }) => {
      setOnlineCount(data.count);
    });

    return () => {
      socket.disconnect();
    };
  }, [playerId, username]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setState('disconnected');
  }, []);

  // Join queue
  const joinQueue = useCallback((team: { slot1: unknown; slot2: unknown; slot3: unknown }, queueType: 'quick' | 'ranked' = 'quick') => {
    if (!socketRef.current) return;
    socketRef.current.emit('joinQueue', { team, queueType });
  }, []);

  // Leave queue
  const leaveQueue = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('leaveQueue');
  }, []);

  // Submit moves
  const submitMoves = useCallback((moves: Record<number, number | null>, targets: Record<number, number | null>) => {
    if (!socketRef.current) return;
    socketRef.current.emit('playerReady', { moves, targets });
  }, []);

  // Exchange energy
  const exchangeEnergy = useCallback((fromType: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('exchangeEnergy', { fromType });
  }, []);

  // Surrender
  const surrender = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('surrender');
  }, []);

  // Send chat message
  const sendChat = useCallback((message: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('chatMessage', { message });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    state,
    battleId,
    battleData,
    turnData,
    turnTimer,
    queuePosition,
    onlineCount,
    error,
    battleResult,
    
    // Actions
    connect,
    disconnect,
    joinQueue,
    leaveQueue,
    submitMoves,
    exchangeEnergy,
    surrender,
    sendChat,
  };
}
