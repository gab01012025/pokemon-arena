/**
 * Pokemon Arena - Socket.io Client
 * Real-time connection to game server
 */

import { io, Socket } from 'socket.io-client';

// Types
export interface GameSocketEvents {
  // Server -> Client
  authenticated: { success: boolean; oderId: string };
  onlineCount: { count: number };
  queueJoined: { position: number; queueType: string; estimatedWait: number };
  queueLeft: { success: boolean };
  battleStart: BattleStartData;
  turnUpdate: TurnUpdateData;
  turnTimer: { remaining: number };
  readyConfirmed: { success: boolean };
  energyUpdated: { energy: Energy };
  battleEnd: BattleEndData;
  chatMessage: { username: string; message: string; timestamp: number };
  error: { message: string };
}

export interface BattleStartData {
  oderId: string;
  opponent: {
    username: string;
    level: number;
    team: Array<{
      name: string;
      types: string[];
      currentHP: number;
      maxHP: number;
    }>;
  };
  yourTeam: BattlePokemonState[];
  energy: Energy;
  turn: number;
  turnTimeRemaining: number;
}

export interface TurnUpdateData {
  turn: number;
  yourTeam: BattlePokemonState[];
  opponentTeam: Array<{
    name: string;
    currentHP: number;
    maxHP: number;
    status: StatusEffect | null;
  }>;
  energy: Energy;
  battleLog: BattleLogEntry[];
}

export interface BattleEndData {
  winnerId: string;
  reason: 'knockout' | 'surrender' | 'disconnect';
  battleLog: BattleLogEntry[];
  player1Team?: BattlePokemonState[];
  player2Team?: BattlePokemonState[];
}

export interface BattlePokemonState {
  pokemon: {
    id: string;
    name: string;
    types: string[];
    hp: number;
    moves: MoveData[];
  };
  currentHP: number;
  maxHP: number;
  status: StatusEffect | null;
  effects: StatusEffect[];
  cooldowns: number[];
  statChanges: {
    attack: number;
    defense: number;
    speed: number;
  };
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

export interface StatusEffect {
  type: string;
  turnsRemaining: number;
  value?: number;
}

export interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  colorless: number;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type: string;
  timestamp: number;
}

export interface TeamSelection {
  slot1: PokemonData | null;
  slot2: PokemonData | null;
  slot3: PokemonData | null;
}

export interface PokemonData {
  id: string;
  name: string;
  types: string[];
  hp: number;
  moves: MoveData[];
}

// Socket Client Class
class GameSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Connection state
  public isConnected = false;
  public oderId: string | null = null;

  constructor() {
    // Will be initialized on connect
  }

  connect(serverUrl: string = 'http://localhost:3010'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('🎮 Connected to game server');
        this.isConnected = true;
        this.oderId = this.socket?.id || null;
        this.reconnectAttempts = 0;
        this.emit('connectionChange', { connected: true });
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from game server:', reason);
        this.isConnected = false;
        this.emit('connectionChange', { connected: false, reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔥 Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to game server'));
        }
      });

      // Setup event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    const events = [
      'authenticated',
      'onlineCount',
      'queueJoined',
      'queueLeft',
      'battleStart',
      'turnUpdate',
      'turnTimer',
      'readyConfirmed',
      'energyUpdated',
      'battleEnd',
      'chatMessage',
      'error'
    ];

    events.forEach(event => {
      this.socket?.on(event, (data: unknown) => {
        this.emit(event, data);
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
    this.oderId = null;
  }

  // Event emitter pattern
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  // ==================== GAME ACTIONS ====================

  authenticate(data: { oderId: string; username: string; level: number; ladderPoints: number }) {
    this.socket?.emit('authenticate', data);
    this.oderId = data.oderId;
  }

  joinQueue(team: TeamSelection, queueType: 'quick' | 'ranked' = 'quick') {
    this.socket?.emit('joinQueue', { team, queueType });
  }

  leaveQueue() {
    this.socket?.emit('leaveQueue');
  }

  submitMoves(moves: Record<number, number | null>, targets: Record<number, number | null>) {
    this.socket?.emit('playerReady', { moves, targets });
  }

  exchangeEnergy(fromType: string) {
    this.socket?.emit('exchangeEnergy', { fromType });
  }

  surrender() {
    this.socket?.emit('surrender');
  }

  sendChat(message: string) {
    this.socket?.emit('chatMessage', { message });
  }

  // ==================== GETTERS ====================

  getSocket(): Socket | null {
    return this.socket;
  }

  getConnectionState(): { connected: boolean; oderId: string | null } {
    return {
      connected: this.isConnected,
      oderId: this.oderId
    };
  }
}

// Singleton instance
export const gameSocket = new GameSocketClient();

// React hook for socket
export function useGameSocket() {
  return gameSocket;
}
