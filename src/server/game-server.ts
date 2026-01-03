/**
 * Pokemon Arena - WebSocket Game Server
 * Real-time multiplayer battle system
 */

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// ==================== TYPES ====================

interface Player {
  socketId: string;
  playerId: string;
  username: string;
  level: number;
  ladderPoints: number;
  joinedAt: Date;
  team: TeamSelection;
}

interface TeamSelection {
  slot1: PokemonData | null;
  slot2: PokemonData | null;
  slot3: PokemonData | null;
}

interface PokemonData {
  id: string;
  name: string;
  types: string[];
  hp: number;
  moves: MoveData[];
}

interface MoveData {
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

interface BattleState {
  battleId: string;
  status: 'waiting' | 'selecting' | 'battle' | 'finished';
  currentTurn: number;
  turnStartTime: number;
  player1: BattlePlayer;
  player2: BattlePlayer;
  battleLog: BattleLogEntry[];
  winnerId: string | null;
}

interface BattlePlayer {
  socketId: string;
  playerId: string;
  username: string;
  isReady: boolean;
  team: BattlePokemonState[];
  selectedMoves: Record<number, number | null>;
  selectedTargets: Record<number, number | null>;
  energy: Energy;
}

interface BattlePokemonState {
  pokemon: PokemonData;
  currentHP: number;
  maxHP: number;
  status: StatusEffect | null;
  effects: StatusEffect[];
  cooldowns: number[];
  statChanges: { attack: number; defense: number; speed: number };
}

interface StatusEffect {
  type: string;
  turnsRemaining: number;
  value?: number;
}

interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  colorless: number;
}

interface BattleLogEntry {
  id: string;
  text: string;
  type: string;
  timestamp: number;
}

interface QueueEntry {
  socketId: string;
  playerId: string;
  player: Player;
  queueType: 'quick' | 'ranked';
  joinedAt: number;
}

// ==================== SERVER STATE ====================

const PORT = 3010;
const TURN_TIME = 90;

const connectedPlayers = new Map<string, Player>();
const matchmakingQueue: QueueEntry[] = [];
const activeBattles = new Map<string, BattleState>();
const playerToBattle = new Map<string, string>();

// ==================== SERVER SETUP ====================

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST']
  }
});

console.log('🎮 Pokemon Arena Game Server starting...');

// ==================== CONNECTION HANDLER ====================

io.on('connection', (socket: Socket) => {
  console.log(`✅ Player connected: ${socket.id}`);

  // Authenticate
  socket.on('authenticate', (data: { playerId: string; username: string; level: number; ladderPoints: number }) => {
    const player: Player = {
      socketId: socket.id,
      playerId: data.playerId,
      username: data.username,
      level: data.level,
      ladderPoints: data.ladderPoints,
      joinedAt: new Date(),
      team: { slot1: null, slot2: null, slot3: null }
    };
    
    connectedPlayers.set(socket.id, player);
    socket.emit('authenticated', { success: true, playerId: socket.id });
    
    // Broadcast online count
    io.emit('onlineCount', { count: connectedPlayers.size });
    console.log(`👤 ${data.username} authenticated (Level ${data.level})`);
  });

  // Join Queue
  socket.on('joinQueue', (data: { team: TeamSelection; queueType: 'quick' | 'ranked' }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Check if already in queue
    if (matchmakingQueue.some(q => q.socketId === socket.id)) {
      socket.emit('error', { message: 'Already in queue' });
      return;
    }

    player.team = data.team;
    
    const queueEntry: QueueEntry = {
      socketId: socket.id,
      playerId: player.playerId,
      player,
      queueType: data.queueType,
      joinedAt: Date.now()
    };

    matchmakingQueue.push(queueEntry);
    
    socket.emit('queueJoined', {
      position: matchmakingQueue.length,
      queueType: data.queueType,
      estimatedWait: Math.max(10, matchmakingQueue.length * 5)
    });

    console.log(`🔍 ${player.username} joined ${data.queueType} queue (Position: ${matchmakingQueue.length})`);
    
    // Try to find a match
    tryMatchmaking();
  });

  // Leave Queue
  socket.on('leaveQueue', () => {
    const idx = matchmakingQueue.findIndex(q => q.socketId === socket.id);
    if (idx !== -1) {
      matchmakingQueue.splice(idx, 1);
      socket.emit('queueLeft', { success: true });
      console.log(`❌ Player left queue: ${socket.id}`);
    }
  });

  // Player Ready (submit moves)
  socket.on('playerReady', (data: { moves: Record<number, number | null>; targets: Record<number, number | null> }) => {
    const battleId = playerToBattle.get(socket.id);
    if (!battleId) return;

    const battle = activeBattles.get(battleId);
    if (!battle) return;

    const isPlayer1 = battle.player1.socketId === socket.id;
    const battlePlayer = isPlayer1 ? battle.player1 : battle.player2;

    battlePlayer.selectedMoves = data.moves;
    battlePlayer.selectedTargets = data.targets;
    battlePlayer.isReady = true;

    socket.emit('readyConfirmed', { success: true });

    // Check if both players ready
    if (battle.player1.isReady && battle.player2.isReady) {
      processTurn(battleId);
    }
  });

  // Exchange Energy
  socket.on('exchangeEnergy', (data: { fromType: string }) => {
    const battleId = playerToBattle.get(socket.id);
    if (!battleId) return;

    const battle = activeBattles.get(battleId);
    if (!battle) return;

    const isPlayer1 = battle.player1.socketId === socket.id;
    const battlePlayer = isPlayer1 ? battle.player1 : battle.player2;

    const fromType = data.fromType.toLowerCase() as keyof Energy;
    if (battlePlayer.energy[fromType] > 0) {
      battlePlayer.energy[fromType]--;
      battlePlayer.energy.colorless++;
      socket.emit('energyUpdated', { energy: battlePlayer.energy });
    }
  });

  // Surrender
  socket.on('surrender', () => {
    const battleId = playerToBattle.get(socket.id);
    if (!battleId) return;

    const battle = activeBattles.get(battleId);
    if (!battle) return;

    const isPlayer1 = battle.player1.socketId === socket.id;
    const winnerId = isPlayer1 ? battle.player2.socketId : battle.player1.socketId;

    endBattle(battleId, winnerId, 'surrender');
  });

  // Chat
  socket.on('chatMessage', (data: { message: string }) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const battleId = playerToBattle.get(socket.id);
    if (!battleId) return;

    const battle = activeBattles.get(battleId);
    if (!battle) return;

    const chatData = {
      username: player.username,
      message: data.message.slice(0, 100),
      timestamp: Date.now()
    };

    // Send to both players
    io.to(battle.player1.socketId).emit('chatMessage', chatData);
    io.to(battle.player2.socketId).emit('chatMessage', chatData);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    
    // Remove from queue
    const queueIdx = matchmakingQueue.findIndex(q => q.socketId === socket.id);
    if (queueIdx !== -1) {
      matchmakingQueue.splice(queueIdx, 1);
    }

    // Handle active battle
    const battleId = playerToBattle.get(socket.id);
    if (battleId) {
      const battle = activeBattles.get(battleId);
      if (battle) {
        const winnerId = battle.player1.socketId === socket.id 
          ? battle.player2.socketId 
          : battle.player1.socketId;
        endBattle(battleId, winnerId, 'disconnect');
      }
    }

    connectedPlayers.delete(socket.id);
    io.emit('onlineCount', { count: connectedPlayers.size });
  });
});

// ==================== MATCHMAKING ====================

function tryMatchmaking() {
  if (matchmakingQueue.length < 2) return;

  // Simple FIFO matchmaking for now
  const player1Entry = matchmakingQueue.shift()!;
  const player2Entry = matchmakingQueue.shift()!;

  createBattle(player1Entry, player2Entry);
}

function createBattle(p1: QueueEntry, p2: QueueEntry) {
  const battleId = uuidv4();

  const battle: BattleState = {
    battleId: battleId,
    status: 'battle',
    currentTurn: 1,
    turnStartTime: Date.now(),
    player1: createBattlePlayer(p1),
    player2: createBattlePlayer(p2),
    battleLog: [],
    winnerId: null
  };

  activeBattles.set(battleId, battle);
  playerToBattle.set(p1.socketId, battleId);
  playerToBattle.set(p2.socketId, battleId);

  // Generate initial energy
  battle.player1.energy = generateEnergy(battle.player1.team);
  battle.player2.energy = generateEnergy(battle.player2.team);

  // Notify players
  const p1Socket = io.sockets.sockets.get(p1.socketId);
  const p2Socket = io.sockets.sockets.get(p2.socketId);

  if (p1Socket) {
    p1Socket.emit('battleStart', {
      battleId: battleId,
      opponent: {
        username: p2.player.username,
        level: p2.player.level,
        team: battle.player2.team.map(p => ({
          name: p.pokemon.name,
          types: p.pokemon.types,
          currentHP: p.currentHP,
          maxHP: p.maxHP
        }))
      },
      yourTeam: battle.player1.team,
      energy: battle.player1.energy,
      turn: 1,
      turnTimeRemaining: TURN_TIME
    });
  }

  if (p2Socket) {
    p2Socket.emit('battleStart', {
      battleId: battleId,
      opponent: {
        username: p1.player.username,
        level: p1.player.level,
        team: battle.player1.team.map(p => ({
          name: p.pokemon.name,
          types: p.pokemon.types,
          currentHP: p.currentHP,
          maxHP: p.maxHP
        }))
      },
      yourTeam: battle.player2.team,
      energy: battle.player2.energy,
      turn: 1,
      turnTimeRemaining: TURN_TIME
    });
  }

  console.log(`⚔️ Battle started: ${p1.player.username} vs ${p2.player.username}`);

  // Start turn timer
  startTurnTimer(battleId);
}

function createBattlePlayer(entry: QueueEntry): BattlePlayer {
  const team: BattlePokemonState[] = [];
  
  [entry.player.team.slot1, entry.player.team.slot2, entry.player.team.slot3].forEach(pokemon => {
    if (pokemon) {
      team.push({
        pokemon,
        currentHP: pokemon.hp,
        maxHP: pokemon.hp,
        status: null,
        effects: [],
        cooldowns: [0, 0, 0, 0],
        statChanges: { attack: 0, defense: 0, speed: 0 }
      });
    }
  });

  return {
    socketId: entry.socketId,
    playerId: entry.player.playerId,
    username: entry.player.username,
    isReady: false,
    team,
    selectedMoves: { 0: null, 1: null, 2: null },
    selectedTargets: { 0: null, 1: null, 2: null },
    energy: { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 }
  };
}

function generateEnergy(team: BattlePokemonState[]): Energy {
  const energy: Energy = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 1 };
  
  team.forEach(state => {
    if (state.currentHP > 0) {
      state.pokemon.types.forEach(type => {
        const t = type.toLowerCase();
        if (t === 'fire') energy.fire++;
        else if (t === 'water') energy.water++;
        else if (t === 'grass') energy.grass++;
        else if (t === 'electric') energy.electric++;
        else energy.colorless++;
      });
    }
  });

  return energy;
}

// ==================== TURN PROCESSING ====================

const turnTimers = new Map<string, NodeJS.Timeout>();

function startTurnTimer(battleId: string) {
  // Clear existing timer
  if (turnTimers.has(battleId)) {
    clearInterval(turnTimers.get(battleId)!);
  }

  const battle = activeBattles.get(battleId);
  if (!battle) return;

  let remaining = TURN_TIME;

  const timer = setInterval(() => {
    remaining--;

    // Send timer update
    io.to(battle.player1.socketId).emit('turnTimer', { remaining });
    io.to(battle.player2.socketId).emit('turnTimer', { remaining });

    if (remaining <= 0) {
      clearInterval(timer);
      turnTimers.delete(battleId);
      
      // Force process turn
      processTurn(battleId);
    }
  }, 1000);

  turnTimers.set(battleId, timer);
}

function processTurn(battleId: string) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;

  // Clear timer
  if (turnTimers.has(battleId)) {
    clearInterval(turnTimers.get(battleId)!);
    turnTimers.delete(battleId);
  }

  const log: BattleLogEntry[] = [];

  // Process moves for both players
  processPlayerMoves(battle.player1, battle.player2, log);
  processPlayerMoves(battle.player2, battle.player1, log);

  // Update cooldowns
  updateCooldowns(battle.player1);
  updateCooldowns(battle.player2);

  // Process status effects
  processStatusEffects(battle.player1, log);
  processStatusEffects(battle.player2, log);

  // Check for battle end
  const p1Alive = battle.player1.team.some(p => p.currentHP > 0);
  const p2Alive = battle.player2.team.some(p => p.currentHP > 0);

  if (!p1Alive || !p2Alive) {
    const winnerId = p1Alive ? battle.player1.socketId : battle.player2.socketId;
    endBattle(battleId, winnerId, 'knockout');
    return;
  }

  // Next turn
  battle.currentTurn++;
  battle.player1.isReady = false;
  battle.player2.isReady = false;
  battle.player1.selectedMoves = { 0: null, 1: null, 2: null };
  battle.player2.selectedMoves = { 0: null, 1: null, 2: null };
  battle.battleLog.push(...log);

  // Regenerate energy
  battle.player1.energy = generateEnergy(battle.player1.team);
  battle.player2.energy = generateEnergy(battle.player2.team);

  // Send turn update
  io.to(battle.player1.socketId).emit('turnUpdate', {
    turn: battle.currentTurn,
    yourTeam: battle.player1.team,
    opponentTeam: battle.player2.team.map(p => ({
      name: p.pokemon.name,
      currentHP: p.currentHP,
      maxHP: p.maxHP,
      status: p.status
    })),
    energy: battle.player1.energy,
    battleLog: log
  });

  io.to(battle.player2.socketId).emit('turnUpdate', {
    turn: battle.currentTurn,
    yourTeam: battle.player2.team,
    opponentTeam: battle.player1.team.map(p => ({
      name: p.pokemon.name,
      currentHP: p.currentHP,
      maxHP: p.maxHP,
      status: p.status
    })),
    energy: battle.player2.energy,
    battleLog: log
  });

  // Start new turn timer
  startTurnTimer(battleId);
}

function processPlayerMoves(attacker: BattlePlayer, defender: BattlePlayer, log: BattleLogEntry[]) {
  for (let i = 0; i < attacker.team.length; i++) {
    const pokemon = attacker.team[i];
    const moveIdx = attacker.selectedMoves[i];
    
    if (pokemon.currentHP <= 0 || moveIdx === null) continue;

    const move = pokemon.pokemon.moves[moveIdx];
    if (!move) continue;

    // Set cooldown
    if (move.cooldown > 0) {
      pokemon.cooldowns[moveIdx] = move.cooldown;
    }

    // Calculate damage/healing
    if (move.damage > 0) {
      const targetIdx = attacker.selectedTargets[i] ?? 0;
      const target = defender.team[targetIdx];
      
      if (target && target.currentHP > 0) {
        const damage = calculateDamage(move.damage, pokemon, target);
        target.currentHP = Math.max(0, target.currentHP - damage);

        log.push({
          id: uuidv4(),
          text: `${pokemon.pokemon.name} used ${move.name} on ${target.pokemon.name} for ${damage} damage!`,
          type: 'damage',
          timestamp: Date.now()
        });

        if (target.currentHP <= 0) {
          log.push({
            id: uuidv4(),
            text: `${target.pokemon.name} fainted!`,
            type: 'info',
            timestamp: Date.now()
          });
        }
      }
    }

    if (move.healing > 0) {
      const healAmount = Math.min(move.healing, pokemon.maxHP - pokemon.currentHP);
      pokemon.currentHP += healAmount;

      log.push({
        id: uuidv4(),
        text: `${pokemon.pokemon.name} healed for ${healAmount} HP!`,
        type: 'heal',
        timestamp: Date.now()
      });
    }

    // Apply effects
    move.effects?.forEach(effect => {
      if (effect.type === 'burn' || effect.type === 'poison' || effect.type === 'paralysis') {
        const targetIdx = attacker.selectedTargets[i] ?? 0;
        const target = defender.team[targetIdx];
        
        if (target && target.currentHP > 0 && !target.status) {
          target.status = {
            type: effect.type,
            turnsRemaining: effect.duration || 3,
            value: effect.value
          };

          log.push({
            id: uuidv4(),
            text: `${target.pokemon.name} is now ${effect.type}ed!`,
            type: 'status',
            timestamp: Date.now()
          });
        }
      }
    });
  }
}

function calculateDamage(baseDamage: number, attacker: BattlePokemonState, defender: BattlePokemonState): number {
  let damage = baseDamage;

  // Stat modifiers
  damage *= (1 + attacker.statChanges.attack * 0.1);
  damage *= (1 - defender.statChanges.defense * 0.1);

  // Random variance
  damage *= (0.9 + Math.random() * 0.2);

  return Math.round(damage);
}

function updateCooldowns(player: BattlePlayer) {
  player.team.forEach(pokemon => {
    pokemon.cooldowns = pokemon.cooldowns.map(cd => Math.max(0, cd - 1));
  });
}

function processStatusEffects(player: BattlePlayer, log: BattleLogEntry[]) {
  player.team.forEach(pokemon => {
    if (pokemon.status && pokemon.currentHP > 0) {
      if (pokemon.status.type === 'burn' || pokemon.status.type === 'poison') {
        const damage = Math.round(pokemon.maxHP * 0.1);
        pokemon.currentHP = Math.max(0, pokemon.currentHP - damage);

        log.push({
          id: uuidv4(),
          text: `${pokemon.pokemon.name} took ${damage} damage from ${pokemon.status.type}!`,
          type: 'damage',
          timestamp: Date.now()
        });
      }

      pokemon.status.turnsRemaining--;
      if (pokemon.status.turnsRemaining <= 0) {
        log.push({
          id: uuidv4(),
          text: `${pokemon.pokemon.name} is no longer ${pokemon.status.type}ed!`,
          type: 'info',
          timestamp: Date.now()
        });
        pokemon.status = null;
      }
    }
  });
}

// ==================== BATTLE END ====================

function endBattle(battleId: string, winnerId: string, reason: 'knockout' | 'surrender' | 'disconnect') {
  const battle = activeBattles.get(battleId);
  if (!battle) return;

  battle.status = 'finished';
  battle.winnerId = winnerId;

  // Clear timer
  if (turnTimers.has(battleId)) {
    clearInterval(turnTimers.get(battleId)!);
    turnTimers.delete(battleId);
  }

  // Notify players
  const endData = {
    winnerId,
    reason,
    battleLog: battle.battleLog
  };

  io.to(battle.player1.socketId).emit('battleEnd', endData);
  io.to(battle.player2.socketId).emit('battleEnd', endData);

  console.log(`🏆 Battle ended: Winner ${winnerId} (${reason})`);

  // Cleanup
  playerToBattle.delete(battle.player1.socketId);
  playerToBattle.delete(battle.player2.socketId);
  activeBattles.delete(battleId);
}

// ==================== START SERVER ====================

httpServer.listen(PORT, () => {
  console.log(`🎮 Pokemon Arena Game Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready for connections`);
});
