/**
 * Pokemon Arena - WebSocket Game Server v2
 * 
 * Full PvP battle server with:
 * - Real engine integration (src/engine)
 * - JWT authentication
 * - Database persistence (battle results, stats, missions)
 * - MMR-based matchmaking
 * - Reconnection support
 * - Private battle rooms
 */

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, type TokenPayload } from './auth';
import { saveBattleResult, updateMissionProgress, updateQuestProgress, type PlayerResultData } from './battle-result';
import { db } from './db';
import { checkBattleAchievements, type BattleAchievementContext } from '@/lib/achievements';

// =============================================================================
// ENGINE IMPORTS (real battle engine)
// =============================================================================

import {
  createBattleState as engineCreateState,
  createFighter,
  createSkill,
  resolveTurn,
  ZERO_ENERGY,
  type BattleState as EngineBattleState,
  type ActionIntent,
  type Fighter,
  type Skill,
  type Energy,
  type TurnResult,
  type BattleLogEvent,
} from '../engine';
import { damage, heal, applyStatus, stun } from '../engine/action';

// =============================================================================
// CONFIGURATION
// =============================================================================

const PORT = parseInt(process.env.PORT || process.env.GAME_SERVER_PORT || '3010', 10);
const TURN_TIME = 90; // seconds
const MMR_RANGE_START = 100;
const MMR_RANGE_GROWTH = 50;
const MMR_EXPAND_INTERVAL = 5;
const DISCONNECT_GRACE_PERIOD = 30_000; // 30s to reconnect

const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
  (process.env.NEXT_PUBLIC_APP_URL || 'https://naruto-arena-delta.vercel.app').trim(),
].filter(Boolean);

// =============================================================================
// TYPES
// =============================================================================

interface AuthenticatedPlayer {
  socketId: string;
  trainerId: string;
  username: string;
  level: number;
  ladderPoints: number;
  joinedAt: Date;
}

interface QueueEntry {
  player: AuthenticatedPlayer;
  queueType: 'quick' | 'ranked';
  team: TeamData;
  joinedAt: number;
  mmrRange: number;
}

interface TeamData {
  pokemon: PokemonSelection[];
}

interface PokemonSelection {
  dbId: string;
  name: string;
  types: string[];
  health: number;
  skills: SkillData[];
}

interface SkillData {
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

interface ServerBattle {
  battleId: string;
  battleType: 'quick' | 'ranked' | 'private';
  status: 'active' | 'finished';
  player1: BattleParticipant;
  player2: BattleParticipant;
  engineState: EngineBattleState;
  currentTurn: number;
  turnStartTime: number;
  p1Intents: ActionIntent[] | null;
  p2Intents: ActionIntent[] | null;
  team1Ids: string[];
  team2Ids: string[];
  p1TotalDamage: number;
  p2TotalDamage: number;
  chatLog: Array<{ username: string; message: string; timestamp: number }>;
}

interface BattleParticipant {
  trainerId: string;
  username: string;
  level: number;
  ladderPoints: number;
  socketId: string | null;
  isReady: boolean;
  disconnectedAt: number | null;
}

interface PrivateRoom {
  roomId: string;
  hostId: string;
  hostUsername: string;
  team: TeamData;
  createdAt: number;
}

interface ClientBattleState {
  battleId: string;
  turn: number;
  turnTimeRemaining: number;
  yourFighters: ClientFighter[];
  opponentFighters: ClientFighter[];
  yourEnergy: Energy;
  log: ClientLogEntry[];
}

interface ClientFighter {
  slot: number;
  name: string;
  health: number;
  maxHealth: number;
  alive: boolean;
  skills: ClientSkill[];
  statuses: Array<{ name: string; duration: number; visible: boolean; helpful: boolean }>;
  cooldowns: number[];
}

interface ClientSkill {
  name: string;
  description: string;
  cost: Energy;
  cooldown: number;
  currentCooldown: number;
  classes: string[];
  target: string;
}

interface ClientLogEntry {
  type: string;
  message: string;
  source?: number;
  target?: number;
  value?: number;
}

// =============================================================================
// SERVER STATE
// =============================================================================

// --- Achievement checking helper ---
async function checkAndGrantBattleAchievements(
  trainerId: string,
  result: PlayerResultData,
  battle: ServerBattle,
) {
  try {
    // Get trainer's unlocked achievements
    const existing = await db.achievement.findMany({
      where: { trainerId },
      select: { code: true },
    });
    const alreadyUnlocked = new Set(existing.map(a => a.code));

    // Get trainer's updated stats
    const trainer = await db.trainer.findUnique({
      where: { id: trainerId },
      select: { wins: true, losses: true },
    });
    if (!trainer) return;

    // Count surviving pokemon for this player
    const isP1 = trainerId === battle.player1.trainerId;
    const playerSlots = isP1 ? [0, 1, 2] : [3, 4, 5];
    const pokemonSurvived = battle.engineState.fighters
      .filter(f => playerSlots.includes(f.slot) && f.health > 0)
      .length;

    const ctx: BattleAchievementContext = {
      trainerId,
      won: result.won,
      turns: battle.currentTurn,
      pokemonSurvived,
      newStreak: result.newStreak,
      totalWins: trainer.wins,
      totalBattles: trainer.wins + trainer.losses,
      currentLP: result.newLP,
    };

    const newAchievements = checkBattleAchievements(ctx, alreadyUnlocked);

    if (newAchievements.length > 0) {
      await db.achievement.createMany({
        data: newAchievements.map(code => ({ trainerId, code })),
        skipDuplicates: true,
      });
    }
  } catch {
    // Non-critical — don't crash
  }
}

const connectedPlayers = new Map<string, AuthenticatedPlayer>();
const trainerToSocket = new Map<string, string>();
const matchmakingQueue: QueueEntry[] = [];
const activeBattles = new Map<string, ServerBattle>();
const playerToBattle = new Map<string, string>();
const privateRooms = new Map<string, PrivateRoom>();
const turnTimers = new Map<string, NodeJS.Timeout>();
const disconnectTimers = new Map<string, NodeJS.Timeout>();

// =============================================================================
// SERVER SETUP
// =============================================================================

const httpServer = createServer((req, res) => {
  // Health check endpoint for Railway/monitoring
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', players: connectedPlayers.size, battles: activeBattles.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

console.log('🎮 Pokemon Arena Game Server v2 starting...');

// =============================================================================
// CONNECTION HANDLER
// =============================================================================

io.on('connection', (socket: Socket) => {
  console.log(`[connect] ${socket.id}`);

  // ==================== AUTHENTICATE ====================
  socket.on('authenticate', async (data: { token: string }) => {
    try {
      const payload = await verifyToken(data.token);
      if (!payload) {
        socket.emit('authError', { message: 'Invalid or expired token' });
        return;
      }

      const trainer = await db.trainer.findUnique({
        where: { id: payload.trainerId },
        select: { id: true, username: true, level: true, ladderPoints: true },
      });

      if (!trainer) {
        socket.emit('authError', { message: 'Trainer not found' });
        return;
      }

      // Kick existing connection for this trainer
      const existingSocketId = trainerToSocket.get(trainer.id);
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.emit('forceDisconnect', { reason: 'Connected from another location' });
          existingSocket.disconnect(true);
        }
        connectedPlayers.delete(existingSocketId);
      }

      const player: AuthenticatedPlayer = {
        socketId: socket.id,
        trainerId: trainer.id,
        username: trainer.username,
        level: trainer.level,
        ladderPoints: trainer.ladderPoints,
        joinedAt: new Date(),
      };

      connectedPlayers.set(socket.id, player);
      trainerToSocket.set(trainer.id, socket.id);

      socket.emit('authenticated', {
        success: true,
        trainerId: trainer.id,
        username: trainer.username,
        level: trainer.level,
        ladderPoints: trainer.ladderPoints,
      });

      io.emit('onlineCount', { count: connectedPlayers.size });
      console.log(`[auth] ${trainer.username} (Lv${trainer.level}, ${trainer.ladderPoints}LP)`);

      // Check for active battle -> reconnection
      const activeBattleId = playerToBattle.get(trainer.id);
      if (activeBattleId) {
        handleReconnection(socket, trainer.id, activeBattleId);
      }
    } catch (err) {
      console.error('[auth error]', err);
      socket.emit('authError', { message: 'Authentication failed' });
    }
  });

  // ==================== MATCHMAKING ====================
  socket.on('joinQueue', (data: { team: TeamData; queueType: 'quick' | 'ranked' }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    if (!data.team?.pokemon || data.team.pokemon.length !== 3) {
      socket.emit('error', { message: 'Team must have exactly 3 Pokemon' });
      return;
    }

    if (matchmakingQueue.some(q => q.player.trainerId === player.trainerId)) {
      socket.emit('error', { message: 'Already in queue' });
      return;
    }

    if (playerToBattle.has(player.trainerId)) {
      socket.emit('error', { message: 'Already in a battle' });
      return;
    }

    const entry: QueueEntry = {
      player,
      queueType: data.queueType,
      team: data.team,
      joinedAt: Date.now(),
      mmrRange: MMR_RANGE_START,
    };

    matchmakingQueue.push(entry);

    socket.emit('queueJoined', {
      position: matchmakingQueue.length,
      queueType: data.queueType,
      estimatedWait: Math.max(10, matchmakingQueue.length * 5),
    });

    console.log(`[queue] ${player.username} joined ${data.queueType} (${player.ladderPoints}LP, queue: ${matchmakingQueue.length})`);
    tryMatchmaking();
  });

  socket.on('leaveQueue', () => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const idx = matchmakingQueue.findIndex(q => q.player.trainerId === player.trainerId);
    if (idx !== -1) {
      matchmakingQueue.splice(idx, 1);
      socket.emit('queueLeft', { success: true });
      console.log(`[queue] ${player.username} left queue`);
    }
  });

  // ==================== BATTLE ACTIONS ====================
  socket.on('submitMoves', (data: { intents: ActionIntent[] }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const battleId = playerToBattle.get(player.trainerId);
    if (!battleId) return;

    const battle = activeBattles.get(battleId);
    if (!battle || battle.status !== 'active') return;

    const isP1 = battle.player1.trainerId === player.trainerId;

    if (isP1) {
      battle.p1Intents = data.intents;
      battle.player1.isReady = true;
    } else {
      battle.p2Intents = data.intents;
      battle.player2.isReady = true;
    }

    socket.emit('readyConfirmed', { success: true });

    if (battle.p1Intents !== null && battle.p2Intents !== null) {
      processTurn(battleId);
    }
  });

  socket.on('surrender', () => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const battleId = playerToBattle.get(player.trainerId);
    if (!battleId) return;

    const battle = activeBattles.get(battleId);
    if (!battle || battle.status !== 'active') return;

    const isP1 = battle.player1.trainerId === player.trainerId;
    const winnerId = isP1 ? battle.player2.trainerId : battle.player1.trainerId;
    endBattle(battleId, winnerId, 'surrender');
  });

  socket.on('chatMessage', (data: { message: string }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const battleId = playerToBattle.get(player.trainerId);
    if (!battleId) return;

    const battle = activeBattles.get(battleId);
    if (!battle) return;

    const chatMsg = {
      username: player.username,
      message: (data.message || '').slice(0, 100),
      timestamp: Date.now(),
    };

    battle.chatLog.push(chatMsg);
    emitToParticipant(battle.player1, 'chatMessage', chatMsg);
    emitToParticipant(battle.player2, 'chatMessage', chatMsg);
  });

  // ==================== PRIVATE ROOMS ====================
  socket.on('createPrivateRoom', (data: { team: TeamData }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    if (playerToBattle.has(player.trainerId)) {
      socket.emit('error', { message: 'Already in a battle' });
      return;
    }

    const roomId = uuidv4().slice(0, 8).toUpperCase();

    const room: PrivateRoom = {
      roomId,
      hostId: player.trainerId,
      hostUsername: player.username,
      team: data.team,
      createdAt: Date.now(),
    };

    privateRooms.set(roomId, room);
    socket.emit('privateRoomCreated', { roomId });
    console.log(`[private] ${player.username} created room ${roomId}`);

    // Auto-expire after 5 minutes
    setTimeout(() => {
      if (privateRooms.has(roomId)) {
        privateRooms.delete(roomId);
        socket.emit('privateRoomExpired', { roomId });
      }
    }, 5 * 60 * 1000);
  });

  socket.on('joinPrivateRoom', (data: { roomId: string; team: TeamData }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const room = privateRooms.get(data.roomId.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Room not found or expired' });
      return;
    }

    if (room.hostId === player.trainerId) {
      socket.emit('error', { message: 'Cannot join your own room' });
      return;
    }

    const hostSocketId = trainerToSocket.get(room.hostId);
    const hostPlayer = hostSocketId ? connectedPlayers.get(hostSocketId) : null;

    if (!hostPlayer) {
      privateRooms.delete(data.roomId.toUpperCase());
      socket.emit('error', { message: 'Host is no longer connected' });
      return;
    }

    privateRooms.delete(data.roomId.toUpperCase());

    const hostEntry: QueueEntry = {
      player: hostPlayer,
      queueType: 'quick',
      team: room.team,
      joinedAt: room.createdAt,
      mmrRange: 0,
    };

    const challengerEntry: QueueEntry = {
      player,
      queueType: 'quick',
      team: data.team,
      joinedAt: Date.now(),
      mmrRange: 0,
    };

    createBattle(hostEntry, challengerEntry, 'private');
    console.log(`[private] ${player.username} joined room ${data.roomId} vs ${hostPlayer.username}`);
  });

  // ==================== DISCONNECT ====================
  socket.on('disconnect', () => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    console.log(`[disconnect] ${player.username}`);

    // Remove from queue
    const queueIdx = matchmakingQueue.findIndex(q => q.player.trainerId === player.trainerId);
    if (queueIdx !== -1) {
      matchmakingQueue.splice(queueIdx, 1);
    }

    // Handle active battle – grace period
    const battleId = playerToBattle.get(player.trainerId);
    if (battleId) {
      const battle = activeBattles.get(battleId);
      if (battle && battle.status === 'active') {
        const isP1 = battle.player1.trainerId === player.trainerId;
        const participant = isP1 ? battle.player1 : battle.player2;
        const opponent = isP1 ? battle.player2 : battle.player1;

        participant.socketId = null;
        participant.disconnectedAt = Date.now();

        emitToParticipant(opponent, 'opponentDisconnected', {
          gracePeriod: DISCONNECT_GRACE_PERIOD / 1000,
        });

        const timer = setTimeout(() => {
          const b = activeBattles.get(battleId);
          if (b && b.status === 'active') {
            const winnerId = isP1 ? b.player2.trainerId : b.player1.trainerId;
            endBattle(battleId, winnerId, 'disconnect');
          }
          disconnectTimers.delete(player.trainerId);
        }, DISCONNECT_GRACE_PERIOD);

        disconnectTimers.set(player.trainerId, timer);
      }
    }

    connectedPlayers.delete(socket.id);
    trainerToSocket.delete(player.trainerId);
    io.emit('onlineCount', { count: connectedPlayers.size });
  });
});

// =============================================================================
// RECONNECTION
// =============================================================================

function handleReconnection(socket: Socket, trainerId: string, battleId: string) {
  const battle = activeBattles.get(battleId);
  if (!battle || battle.status !== 'active') return;

  const isP1 = battle.player1.trainerId === trainerId;
  const participant = isP1 ? battle.player1 : battle.player2;
  const opponent = isP1 ? battle.player2 : battle.player1;

  // Clear disconnect timer
  if (disconnectTimers.has(trainerId)) {
    clearTimeout(disconnectTimers.get(trainerId)!);
    disconnectTimers.delete(trainerId);
  }

  participant.socketId = socket.id;
  participant.disconnectedAt = null;

  const clientState = buildClientState(battle, isP1);
  socket.emit('battleReconnect', {
    ...clientState,
    opponent: { username: opponent.username, level: opponent.level },
  });

  emitToParticipant(opponent, 'opponentReconnected', {});
  console.log(`[reconnect] ${participant.username} reconnected to battle ${battleId.slice(0, 8)}`);
}

// =============================================================================
// MMR MATCHMAKING
// =============================================================================

setInterval(() => {
  for (const entry of matchmakingQueue) {
    entry.mmrRange += MMR_RANGE_GROWTH;
  }
  tryMatchmaking();
}, MMR_EXPAND_INTERVAL * 1000);

function tryMatchmaking() {
  if (matchmakingQueue.length < 2) return;

  const matched = new Set<number>();

  for (let i = 0; i < matchmakingQueue.length; i++) {
    if (matched.has(i)) continue;

    const p1 = matchmakingQueue[i];
    let bestMatch: number | null = null;
    let bestDiff = Infinity;

    for (let j = i + 1; j < matchmakingQueue.length; j++) {
      if (matched.has(j)) continue;

      const p2 = matchmakingQueue[j];
      if (p1.queueType !== p2.queueType) continue;

      const lpDiff = Math.abs(p1.player.ladderPoints - p2.player.ladderPoints);

      if (lpDiff <= p1.mmrRange && lpDiff <= p2.mmrRange) {
        if (lpDiff < bestDiff) {
          bestDiff = lpDiff;
          bestMatch = j;
        }
      }
    }

    if (bestMatch !== null) {
      matched.add(i);
      matched.add(bestMatch);
    }
  }

  // Create matches
  const matchedArr = [...matched].sort((a, b) => a - b);
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < matchedArr.length; i += 2) {
    pairs.push([matchedArr[i], matchedArr[i + 1]]);
  }

  for (const [i, j] of pairs.reverse()) {
    const p2 = matchmakingQueue.splice(j, 1)[0];
    const p1 = matchmakingQueue.splice(i, 1)[0];
    createBattle(p1, p2, p1.queueType);
  }
}

// =============================================================================
// BATTLE CREATION
// =============================================================================

function createBattle(p1: QueueEntry, p2: QueueEntry, battleType: 'quick' | 'ranked' | 'private') {
  const battleId = uuidv4();

  const p1Fighters = p1.team.pokemon.map((p, i) => pokemonToFighter(p, i));
  const p2Fighters = p2.team.pokemon.map((p, i) => pokemonToFighter(p, i + 3));

  const engineState = engineCreateState(p1Fighters, p2Fighters, Date.now());

  const battle: ServerBattle = {
    battleId,
    battleType,
    status: 'active',
    player1: {
      trainerId: p1.player.trainerId,
      username: p1.player.username,
      level: p1.player.level,
      ladderPoints: p1.player.ladderPoints,
      socketId: trainerToSocket.get(p1.player.trainerId) || null,
      isReady: false,
      disconnectedAt: null,
    },
    player2: {
      trainerId: p2.player.trainerId,
      username: p2.player.username,
      level: p2.player.level,
      ladderPoints: p2.player.ladderPoints,
      socketId: trainerToSocket.get(p2.player.trainerId) || null,
      isReady: false,
      disconnectedAt: null,
    },
    engineState,
    currentTurn: 1,
    turnStartTime: Date.now(),
    p1Intents: null,
    p2Intents: null,
    team1Ids: p1.team.pokemon.map(p => p.dbId),
    team2Ids: p2.team.pokemon.map(p => p.dbId),
    p1TotalDamage: 0,
    p2TotalDamage: 0,
    chatLog: [],
  };

  activeBattles.set(battleId, battle);
  playerToBattle.set(p1.player.trainerId, battleId);
  playerToBattle.set(p2.player.trainerId, battleId);

  // Generate initial energy via engine
  // (engineCreateState sets initial energy to {0,0,0,0,1} - we'll trigger start phase)

  const p1State = buildClientState(battle, true);
  const p2State = buildClientState(battle, false);

  emitToParticipant(battle.player1, 'battleStart', {
    ...p1State,
    opponent: { username: p2.player.username, level: p2.player.level },
  });

  emitToParticipant(battle.player2, 'battleStart', {
    ...p2State,
    opponent: { username: p1.player.username, level: p1.player.level },
  });

  console.log(`[battle] ${p1.player.username} vs ${p2.player.username} (${battleType}, ${battleId.slice(0, 8)})`);
  startTurnTimer(battleId);
}

function pokemonToFighter(pokemon: PokemonSelection, slot: number): Fighter {
  const skills: Skill[] = pokemon.skills.map((s, _i) => {
    const cost: Energy = { ...ZERO_ENERGY };
    for (const [type, amount] of Object.entries(s.cost)) {
      if (type in cost) {
        (cost as unknown as Record<string, number>)[type] = amount;
      } else {
        cost.colorless += amount;
      }
    }

    const classes = s.classes.map(c => {
      if (c === 'melee' || c === 'physical') return 'physical' as const;
      if (c === 'ranged' || c === 'special') return 'special' as const;
      if (c === 'strategic' || c === 'status') return 'mental' as const;
      return 'all' as const;
    });

    return createSkill({
      name: s.name,
      owner: slot,
      description: s.description || s.name,
      cost,
      cooldown: s.cooldown,
      classes: classes.length > 0 ? classes : ['all'],
      start: buildSkillEffects(s, slot),
    });
  });

  while (skills.length < 4) {
    skills.push(createSkill({
      name: 'Struggle',
      owner: slot,
      description: 'A desperate attack.',
      cost: { ...ZERO_ENERGY },
      cooldown: 0,
      classes: ['physical'],
      start: [{ target: 'enemy', apply: damage(10) }],
    }));
  }

  return createFighter({
    slot,
    name: pokemon.name,
    health: pokemon.health,
    maxHealth: pokemon.health,
    skills: skills.slice(0, 4),
  });
}

function buildSkillEffects(skill: SkillData, ownerSlot: number) {
  type TargetType = 'self' | 'enemy' | 'enemies' | 'ally' | 'allies';
  const effects: Array<{ target: TargetType; apply: (ctx: import('../engine/types').ActionContext) => void }> = [];

  const targetType: TargetType = skill.target === 'self' ? 'self'
    : skill.target === 'all-enemies' ? 'enemies'
    : 'enemy';

  if (skill.damage > 0) {
    effects.push({ target: targetType, apply: damage(skill.damage) });
  }

  if (skill.healing > 0) {
    effects.push({ target: 'self', apply: heal(skill.healing) });
  }

  if (skill.effects) {
    for (const eff of skill.effects) {
      if (eff.type === 'burn' || eff.type === 'poison') {
        effects.push({
          target: targetType === 'self' ? 'enemy' : targetType,
          apply: applyStatus(eff.type, eff.duration || 2, [{ type: 'afflict' as const, value: eff.value || 10 }]),
        });
      } else if (['paralysis', 'stun', 'freeze', 'sleep'].includes(eff.type)) {
        effects.push({
          target: targetType === 'self' ? 'enemy' : targetType,
          apply: stun(eff.duration || 1, ['physical']),
        });
      }
    }
  }

  if (effects.length === 0) {
    effects.push({ target: targetType, apply: damage(15) });
  }

  return effects;
}

// =============================================================================
// TURN PROCESSING
// =============================================================================

function startTurnTimer(battleId: string) {
  if (turnTimers.has(battleId)) {
    clearInterval(turnTimers.get(battleId)!);
  }

  const battle = activeBattles.get(battleId);
  if (!battle) return;

  let remaining = TURN_TIME;
  battle.turnStartTime = Date.now();

  const timer = setInterval(() => {
    remaining--;
    emitToParticipant(battle.player1, 'turnTimer', { remaining });
    emitToParticipant(battle.player2, 'turnTimer', { remaining });

    if (remaining <= 0) {
      clearInterval(timer);
      turnTimers.delete(battleId);
      if (battle.p1Intents === null) battle.p1Intents = [];
      if (battle.p2Intents === null) battle.p2Intents = [];
      processTurn(battleId);
    }
  }, 1000);

  turnTimers.set(battleId, timer);
}

function processTurn(battleId: string) {
  const battle = activeBattles.get(battleId);
  if (!battle || battle.status !== 'active') return;

  if (turnTimers.has(battleId)) {
    clearInterval(turnTimers.get(battleId)!);
    turnTimers.delete(battleId);
  }

  const p1Intents = battle.p1Intents || [];
  const p2Intents = battle.p2Intents || [];

  let result: TurnResult;
  try {
    result = resolveTurn(battle.engineState, p1Intents, p2Intents);
  } catch (err) {
    console.error(`[engine error] Battle ${battleId.slice(0, 8)}:`, err);
    result = {
      state: { ...battle.engineState, turnNumber: battle.engineState.turnNumber + 1 },
      log: [],
    };
  }

  // Track damage for missions
  for (const entry of result.log) {
    if (entry.type === 'damage' && typeof entry.value === 'number') {
      if (entry.source !== undefined && entry.source <= 2) {
        battle.p1TotalDamage += entry.value;
      } else if (entry.source !== undefined) {
        battle.p2TotalDamage += entry.value;
      }
    }
  }

  battle.engineState = result.state;
  battle.currentTurn++;
  battle.p1Intents = null;
  battle.p2Intents = null;
  battle.player1.isReady = false;
  battle.player2.isReady = false;

  // Check victory
  if (result.state.victor) {
    const winnerId = result.state.victor === 'player'
      ? battle.player1.trainerId
      : battle.player2.trainerId;
    endBattle(battleId, winnerId, 'knockout');
    return;
  }

  const p1State = buildClientState(battle, true);
  const p2State = buildClientState(battle, false);
  const clientLog = result.log.map(engineLogToClient);

  emitToParticipant(battle.player1, 'turnUpdate', { ...p1State, log: clientLog });
  emitToParticipant(battle.player2, 'turnUpdate', { ...p2State, log: clientLog });

  startTurnTimer(battleId);
}

// =============================================================================
// BATTLE END & PERSISTENCE
// =============================================================================

async function endBattle(
  battleId: string,
  winnerId: string,
  reason: 'knockout' | 'surrender' | 'disconnect' | 'timeout'
) {
  const battle = activeBattles.get(battleId);
  if (!battle || battle.status === 'finished') return;

  battle.status = 'finished';

  if (turnTimers.has(battleId)) {
    clearInterval(turnTimers.get(battleId)!);
    turnTimers.delete(battleId);
  }

  const loserId = winnerId === battle.player1.trainerId
    ? battle.player2.trainerId
    : battle.player1.trainerId;

  // Save to database
  let p1Result: PlayerResultData | null = null;
  let p2Result: PlayerResultData | null = null;

  try {
    const results = await saveBattleResult({
      battleId,
      player1Id: battle.player1.trainerId,
      player2Id: battle.player2.trainerId,
      winnerId,
      loserId,
      reason,
      battleType: battle.battleType === 'private' ? 'quick' : battle.battleType,
      turns: battle.currentTurn,
      team1PokemonIds: battle.team1Ids,
      team2PokemonIds: battle.team2Ids,
    });

    p1Result = results.player1Result;
    p2Result = results.player2Result;

    console.log(`[result] ${battle.player1.username} ${p1Result.won ? 'WON' : 'LOST'} (${p1Result.ladderChange > 0 ? '+' : ''}${p1Result.ladderChange}LP), ${battle.player2.username} ${p2Result.won ? 'WON' : 'LOST'} (${p2Result.ladderChange > 0 ? '+' : ''}${p2Result.ladderChange}LP)`);
  } catch (err) {
    console.error(`[result error] Failed to save battle ${battleId.slice(0, 8)}:`, err);
  }

  // Update missions (non-blocking)
  try {
    const p1Names = battle.engineState.fighters.filter(f => f.slot <= 2).map(f => f.name);
    const p2Names = battle.engineState.fighters.filter(f => f.slot >= 3).map(f => f.name);

    await Promise.all([
      updateMissionProgress(battle.player1.trainerId, winnerId === battle.player1.trainerId, battle.player2.level, p1Names, battle.p1TotalDamage),
      updateMissionProgress(battle.player2.trainerId, winnerId === battle.player2.trainerId, battle.player1.level, p2Names, battle.p2TotalDamage),
    ]);

    // Update daily/weekly quest progress
    const p1AllAlive = battle.engineState.fighters.filter(f => f.slot <= 2).every(f => f.health > 0);
    const p2AllAlive = battle.engineState.fighters.filter(f => f.slot >= 3).every(f => f.health > 0);

    await Promise.all([
      updateQuestProgress(battle.player1.trainerId, winnerId === battle.player1.trainerId, true, p1Result?.newStreak ?? 0, p1AllAlive, p1Names),
      updateQuestProgress(battle.player2.trainerId, winnerId === battle.player2.trainerId, true, p2Result?.newStreak ?? 0, p2AllAlive, p2Names),
    ]);
  } catch {
    // non-critical
  }

  // Check achievements (non-blocking)
  try {
    if (p1Result && p2Result) {
      await Promise.all([
        checkAndGrantBattleAchievements(battle.player1.trainerId, p1Result, battle),
        checkAndGrantBattleAchievements(battle.player2.trainerId, p2Result, battle),
      ]);
    }
  } catch {
    // non-critical
  }

  // Notify players
  const endData = { winnerId, reason, turns: battle.currentTurn };

  emitToParticipant(battle.player1, 'battleEnd', {
    ...endData,
    result: p1Result || { won: winnerId === battle.player1.trainerId, expGained: 0, ladderChange: 0, newLevel: battle.player1.level, newLP: battle.player1.ladderPoints, newStreak: 0, leveledUp: false },
  });

  emitToParticipant(battle.player2, 'battleEnd', {
    ...endData,
    result: p2Result || { won: winnerId === battle.player2.trainerId, expGained: 0, ladderChange: 0, newLevel: battle.player2.level, newLP: battle.player2.ladderPoints, newStreak: 0, leveledUp: false },
  });

  console.log(`[battle end] ${battle.player1.username} vs ${battle.player2.username}: ${reason}`);

  // Cleanup
  playerToBattle.delete(battle.player1.trainerId);
  playerToBattle.delete(battle.player2.trainerId);

  setTimeout(() => { activeBattles.delete(battleId); }, 60_000);
}

// =============================================================================
// CLIENT STATE BUILDER
// =============================================================================

function buildClientState(battle: ServerBattle, isPlayer1: boolean): ClientBattleState {
  const state = battle.engineState;
  const yourSlots = isPlayer1 ? [0, 1, 2] : [3, 4, 5];
  const oppSlots = isPlayer1 ? [3, 4, 5] : [0, 1, 2];

  return {
    battleId: battle.battleId,
    turn: battle.currentTurn,
    turnTimeRemaining: Math.max(0, TURN_TIME - Math.floor((Date.now() - battle.turnStartTime) / 1000)),
    yourFighters: yourSlots.map(slot => {
      const f = state.fighters.find(fi => fi.slot === slot);
      return f ? fighterToClient(f, true) : emptyFighter(slot);
    }),
    opponentFighters: oppSlots.map(slot => {
      const f = state.fighters.find(fi => fi.slot === slot);
      return f ? fighterToClient(f, false) : emptyFighter(slot);
    }),
    yourEnergy: isPlayer1 ? { ...state.playerEnergy } : { ...state.opponentEnergy },
    log: [],
  };
}

function fighterToClient(f: Fighter, isOwn: boolean): ClientFighter {
  return {
    slot: f.slot,
    name: f.name,
    health: f.health,
    maxHealth: f.maxHealth,
    alive: f.alive,
    skills: isOwn ? f.skills.map(skillToClient) : f.skills.map(_s => ({
      name: '???',
      description: '',
      cost: { ...ZERO_ENERGY },
      cooldown: 0,
      currentCooldown: 0,
      classes: [] as string[],
      target: 'enemy',
    })),
    statuses: f.statuses
      .filter(s => isOwn || s.visible)
      .map(s => ({ name: s.name, duration: s.duration, visible: s.visible, helpful: s.effects.some(e => e.helpful) })),
    cooldowns: f.skills.map(s => s.currentCooldown),
  };
}

function skillToClient(s: Skill): ClientSkill {
  let target = 'enemy';
  if (s.start.length > 0) {
    const t = s.start[0].target;
    if (t === 'self') target = 'self';
    else if (t === 'enemies') target = 'all-enemies';
    else if (t === 'ally') target = 'ally';
    else if (t === 'allies') target = 'all-allies';
  }

  return {
    name: s.name,
    description: s.description,
    cost: { ...s.cost },
    cooldown: s.cooldown,
    currentCooldown: s.currentCooldown,
    classes: [...s.classes],
    target,
  };
}

function emptyFighter(slot: number): ClientFighter {
  return {
    slot,
    name: 'Unknown',
    health: 0,
    maxHealth: 100,
    alive: false,
    skills: [],
    statuses: [],
    cooldowns: [],
  };
}

function engineLogToClient(entry: BattleLogEvent): ClientLogEntry {
  return {
    type: entry.type,
    message: entry.message,
    source: entry.source,
    target: entry.target,
    value: entry.value,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function emitToParticipant(participant: BattleParticipant, event: string, data: unknown) {
  if (participant.socketId) {
    const socket = io.sockets.sockets.get(participant.socketId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}

// =============================================================================
// START SERVER
// =============================================================================

httpServer.listen(PORT, () => {
  console.log(`🎮 Pokemon Arena Game Server v2 running on port ${PORT}`);
  console.log(`📡 WebSocket ready — CORS: ${CORS_ORIGINS.join(', ')}`);
  console.log(`⚔️ Turn: ${TURN_TIME}s | MMR: ${MMR_RANGE_START} (+${MMR_RANGE_GROWTH}/${MMR_EXPAND_INTERVAL}s) | Reconnect: ${DISCONNECT_GRACE_PERIOD / 1000}s`);
});
