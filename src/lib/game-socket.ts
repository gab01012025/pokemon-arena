/**
 * Pokemon Arena - Socket.io Client v2
 * Real-time connection to game server with JWT auth
 */

import { io, Socket } from 'socket.io-client';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES — match server protocol
// =============================================================================

export interface Energy {
  fire: number;
  water: number;
  grass: number;
  lightning: number;
  colorless: number;
}

/** Action intent sent to server */
export interface ActionIntent {
  userSlot: number;
  skillIndex: number;
  targetSlot: number;
}

/** Fighter as seen by client */
export interface ClientFighter {
  slot: number;
  name: string;
  health: number;
  maxHealth: number;
  alive: boolean;
  skills: ClientSkill[];
  statuses: Array<{ name: string; duration: number; visible: boolean; helpful: boolean }>;
  cooldowns: number[];
}

export interface ClientSkill {
  name: string;
  description: string;
  cost: Energy;
  cooldown: number;
  currentCooldown: number;
  classes: string[];
  target: string;
}

export interface ClientLogEntry {
  type: string;
  message: string;
  source?: number;
  target?: number;
  value?: number;
}

/** Server → Client: battle state (for battleStart, turnUpdate, battleReconnect) */
export interface ClientBattleState {
  battleId: string;
  turn: number;
  turnTimeRemaining: number;
  yourFighters: ClientFighter[];
  opponentFighters: ClientFighter[];
  yourEnergy: Energy;
  log: ClientLogEntry[];
}

export interface BattleStartData extends ClientBattleState {
  opponent: { username: string; level: number };
}

export interface TurnUpdateData extends ClientBattleState {
  log: ClientLogEntry[];
}

export interface BattleReconnectData extends ClientBattleState {
  opponent: { username: string; level: number };
}

export interface PlayerResultData {
  won: boolean;
  expGained: number;
  ladderChange: number;
  newLevel: number;
  newLP: number;
  newStreak: number;
  leveledUp: boolean;
  // Competitive rank info
  oldRankLabel: string;
  newRankLabel: string;
  oldRankTier: string;
  newRankTier: string;
  oldRankDivision: string;
  newRankDivision: string;
  oldRankIcon: string;
  newRankIcon: string;
  rankUp: boolean;
  rankDown: boolean;
  tierChanged: boolean;
}

export interface BattleEndData {
  winnerId: string;
  reason: 'knockout' | 'surrender' | 'disconnect' | 'timeout';
  turns: number;
  result: PlayerResultData;
}

/** Team data sent to server */
export interface TeamData {
  pokemon: PokemonSelection[];
}

export interface PokemonSelection {
  dbId: string;
  name: string;
  types: string[];
  health: number;
  skills: SkillData[];
}

export interface SkillData {
  name: string;
  description: string;
  damage: number;
  healing: number;
  target: string;
  cost: Record<string, number>;
  effects: Array<{ type: string; duration?: number; value?: number }>;
  classes: string[];
  cooldown: number;
}

// =============================================================================
// SOCKET CLIENT
// =============================================================================

class GameSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  public isConnected = false;
  public trainerId: string | null = null;

  connect(serverUrl?: string): Promise<void> {
    const defaultUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3010'
      : 'https://game-server-production-3440.up.railway.app';
    const url = (serverUrl || process.env.NEXT_PUBLIC_GAME_SERVER_URL || defaultUrl).trim();

    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // Clean up any existing disconnected socket
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }
      this.reconnectAttempts = 0;

      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        logger.debug('Connected to game server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emitLocal('connectionChange', { connected: true });
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        logger.debug(`Disconnected: ${reason}`);
        this.isConnected = false;
        this.emitLocal('connectionChange', { connected: false, reason });
      });

      this.socket.on('connect_error', (error) => {
        logger.error(`Connection error: ${error.message}`);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emitLocal('connectionChange', { connected: false, reason: 'Server unreachable' });
          reject(new Error('Failed to connect to game server. Please try again later.'));
        }
      });

      this.setupEventListeners();
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    const events = [
      'authenticated',
      'authError',
      'forceDisconnect',
      'onlineCount',
      'queueJoined',
      'queueLeft',
      'battleStart',
      'turnUpdate',
      'turnTimer',
      'readyConfirmed',
      'opponentReady',
      'battleEnd',
      'battleReconnect',
      'opponentDisconnected',
      'opponentReconnected',
      'privateRoomCreated',
      'privateRoomExpired',
      'chatMessage',
      'emote',
      'rematchAccepted',
      'error',
    ];

    events.forEach(event => {
      this.socket?.on(event, (data: unknown) => {
        this.emitLocal(event, data);
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
    this.trainerId = null;
  }

  // ==================== Event Emitter ====================

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => { this.listeners.get(event)?.delete(callback); };
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emitLocal(event: string, data: unknown) {
    this.listeners.get(event)?.forEach(cb => {
      try { cb(data); } catch (error) {
        logger.error(`Error in ${event} listener:`, error instanceof Error ? error : undefined);
      }
    });
  }

  // ==================== ACTIONS ====================

  /** Authenticate with JWT token */
  authenticate(token: string) {
    this.socket?.emit('authenticate', { token });
  }

  /** Join matchmaking queue */
  joinQueue(team: TeamData, queueType: 'quick' | 'ranked' = 'quick') {
    this.socket?.emit('joinQueue', { team, queueType });
  }

  leaveQueue() {
    this.socket?.emit('leaveQueue');
  }

  /** Submit move intents for this turn */
  submitMoves(intents: ActionIntent[]) {
    this.socket?.emit('submitMoves', { intents });
  }

  surrender() {
    this.socket?.emit('surrender');
  }

  sendChat(message: string) {
    this.socket?.emit('chatMessage', { message });
  }

  /** Create a private battle room */
  createPrivateRoom(team: TeamData) {
    this.socket?.emit('createPrivateRoom', { team });
  }

  /** Join a private battle room by code */
  joinPrivateRoom(roomId: string, team: TeamData) {
    this.socket?.emit('joinPrivateRoom', { roomId, team });
  }

  /** Send an emote during battle */
  sendEmote(emote: string) {
    this.socket?.emit('sendEmote', { emote });
  }

  /** Request a rematch after battle ends */
  requestRematch() {
    this.socket?.emit('requestRematch');
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton
export const gameSocket = new GameSocketClient();
