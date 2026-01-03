/**
 * Pokemon Arena - Battle Manager
 * Gerencia todas as batalhas ativas e matchmaking
 */

import { BattleEngine, BattlePlayer, BattleState, createBattlePlayer, createBattlePokemon, BattleMove, TargetType } from './BattleEngine';
import { prisma } from '../prisma';

// ==================== TYPES ====================

interface QueueEntry {
  playerId: string;
  playerName: string;
  teamPokemonIds: string[];
  rating: number;
  joinedAt: Date;
  queueType: 'quick' | 'ranked';
}

interface ActiveBattle {
  engine: BattleEngine;
  player1SocketId: string | null;
  player2SocketId: string | null;
  lastActivity: Date;
}

// ==================== BATTLE MANAGER ====================

class BattleManager {
  private static instance: BattleManager;
  private activeBattles: Map<string, ActiveBattle> = new Map();
  private matchmakingQueue: Map<string, QueueEntry> = new Map();
  private playerToBattle: Map<string, string> = new Map(); // playerId -> battleId

  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000);
  }

  static getInstance(): BattleManager {
    if (!BattleManager.instance) {
      BattleManager.instance = new BattleManager();
    }
    return BattleManager.instance;
  }

  // ==================== MATCHMAKING ====================

  async joinQueue(
    playerId: string,
    playerName: string,
    teamPokemonIds: string[],
    queueType: 'quick' | 'ranked' = 'quick'
  ): Promise<{ success: boolean; message: string; battleId?: string }> {
    // Check if player is already in a battle
    if (this.playerToBattle.has(playerId)) {
      return { success: false, message: 'You are already in a battle!' };
    }

    // Check if player is already in queue
    if (this.matchmakingQueue.has(playerId)) {
      return { success: false, message: 'You are already in queue!' };
    }

    // Validate team (must have exactly 3 Pokemon)
    if (teamPokemonIds.length !== 3) {
      return { success: false, message: 'You must select exactly 3 Pokemon!' };
    }

    // Get player rating (for ranked matching)
    const trainer = await prisma.trainer.findUnique({
      where: { id: playerId },
      select: { ladderPoints: true }
    });

    const entry: QueueEntry = {
      playerId,
      playerName,
      teamPokemonIds,
      rating: trainer?.ladderPoints || 1000,
      joinedAt: new Date(),
      queueType,
    };

    this.matchmakingQueue.set(playerId, entry);

    // Try to find a match
    const match = this.findMatch(entry);
    if (match) {
      const battleId = await this.createBattle(entry, match);
      return { success: true, message: 'Match found!', battleId };
    }

    return { success: true, message: 'Added to queue. Waiting for opponent...' };
  }

  leaveQueue(playerId: string): boolean {
    return this.matchmakingQueue.delete(playerId);
  }

  private findMatch(entry: QueueEntry): QueueEntry | null {
    const maxRatingDiff = 200; // For ranked
    // TODO: Implement time-based rating range expansion
    // const maxWaitTime = 30000; // 30 seconds before widening search

    for (const [playerId, candidate] of this.matchmakingQueue) {
      if (playerId === entry.playerId) continue;
      if (candidate.queueType !== entry.queueType) continue;

      // For ranked, check rating difference
      if (entry.queueType === 'ranked') {
        const waitTime = Date.now() - entry.joinedAt.getTime();
        const adjustedMaxDiff = maxRatingDiff + Math.floor(waitTime / 10000) * 50;
        
        if (Math.abs(entry.rating - candidate.rating) > adjustedMaxDiff) {
          continue;
        }
      }

      // Found a match!
      return candidate;
    }

    return null;
  }

  // ==================== BATTLE CREATION ====================

  private async createBattle(player1Entry: QueueEntry, player2Entry: QueueEntry): Promise<string> {
    // Remove both from queue
    this.matchmakingQueue.delete(player1Entry.playerId);
    this.matchmakingQueue.delete(player2Entry.playerId);

    // Generate battle ID
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Load Pokemon data for both players
    const player1 = await this.createBattlePlayerFromEntry(player1Entry);
    const player2 = await this.createBattlePlayerFromEntry(player2Entry);

    // Create battle engine
    const engine = new BattleEngine(battleId, player1, player2);
    engine.startBattle();

    // Store active battle
    this.activeBattles.set(battleId, {
      engine,
      player1SocketId: null,
      player2SocketId: null,
      lastActivity: new Date(),
    });

    // Map players to battle
    this.playerToBattle.set(player1Entry.playerId, battleId);
    this.playerToBattle.set(player2Entry.playerId, battleId);

    // Save battle to database
    await this.saveBattleToDb(battleId, engine.getState());

    return battleId;
  }

  private async createBattlePlayerFromEntry(entry: QueueEntry): Promise<BattlePlayer> {
    // Load Pokemon with their moves
    const pokemon = await prisma.pokemon.findMany({
      where: { id: { in: entry.teamPokemonIds } },
      include: { moves: { orderBy: { slot: 'asc' } } }
    });

    // Convert to battle Pokemon
    const team = pokemon.map((p, index) => {
      const moves: BattleMove[] = p.moves.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        classes: JSON.parse(m.classes),
        cost: JSON.parse(m.cost),
        cooldown: m.cooldown,
        damage: m.damage,
        healing: m.healing,
        effects: JSON.parse(m.effects),
        target: m.target as TargetType,
        slot: m.slot,
      }));

      return createBattlePokemon(
        p.id,
        p.name,
        JSON.parse(p.types),
        p.health,
        moves,
        JSON.parse(p.traits),
        index
      );
    });

    return createBattlePlayer(
      entry.playerId,
      entry.playerName,
      team
    );
  }

  // ==================== BATTLE ACTIONS ====================

  getBattle(battleId: string): ActiveBattle | undefined {
    return this.activeBattles.get(battleId);
  }

  getBattleByPlayerId(playerId: string): ActiveBattle | undefined {
    const battleId = this.playerToBattle.get(playerId);
    if (!battleId) return undefined;
    return this.activeBattles.get(battleId);
  }

  getBattleIdByPlayerId(playerId: string): string | undefined {
    return this.playerToBattle.get(playerId);
  }

  async submitAction(
    battleId: string,
    playerId: string,
    pokemonId: string,
    moveId: string,
    targetIds: string[]
  ): Promise<{ success: boolean; message: string; state?: BattleState }> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      return { success: false, message: 'Battle not found' };
    }

    const success = battle.engine.submitAction({
      playerId,
      pokemonId,
      moveId,
      targetIds,
    });

    if (!success) {
      return { success: false, message: 'Invalid action' };
    }

    battle.lastActivity = new Date();

    // Save state
    await this.saveBattleToDb(battleId, battle.engine.getState());

    return { success: true, message: 'Action submitted', state: battle.engine.getState() };
  }

  async skipTurn(battleId: string, playerId: string): Promise<{ success: boolean; message: string; state?: BattleState }> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      return { success: false, message: 'Battle not found' };
    }

    const success = battle.engine.submitAction({
      playerId,
      pokemonId: '',
      moveId: '',
      targetIds: [],
      skipTurn: true,
    });

    if (!success) {
      return { success: false, message: 'Cannot skip turn' };
    }

    battle.lastActivity = new Date();
    await this.saveBattleToDb(battleId, battle.engine.getState());

    return { success: true, message: 'Turn skipped', state: battle.engine.getState() };
  }

  async surrender(battleId: string, playerId: string): Promise<{ success: boolean; message: string }> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      return { success: false, message: 'Battle not found' };
    }

    battle.engine.surrender(playerId);
    await this.finishBattle(battleId);

    return { success: true, message: 'You surrendered' };
  }

  // ==================== BATTLE COMPLETION ====================

  private async finishBattle(battleId: string): Promise<void> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) return;

    const state = battle.engine.getState();
    
    // Update database
    await this.saveBattleToDb(battleId, state);

    // Update player stats
    if (state.winner) {
      const winnerId = state.winner;
      const loserId = winnerId === state.player1.playerId ? state.player2.playerId : state.player1.playerId;

      // Update winner
      await prisma.trainer.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          streak: { increment: 1 },
          experience: { increment: 50 },
          ladderPoints: { increment: 25 },
        }
      });

      // Check and update max streak
      const winner = await prisma.trainer.findUnique({ where: { id: winnerId } });
      if (winner && winner.streak > winner.maxStreak) {
        await prisma.trainer.update({
          where: { id: winnerId },
          data: { maxStreak: winner.streak }
        });
      }

      // Update loser
      await prisma.trainer.update({
        where: { id: loserId },
        data: {
          losses: { increment: 1 },
          streak: 0,
          experience: { increment: 10 },
          ladderPoints: { decrement: 15 },
        }
      });
    }

    // Clean up
    this.playerToBattle.delete(state.player1.playerId);
    this.playerToBattle.delete(state.player2.playerId);
    this.activeBattles.delete(battleId);
  }

  // ==================== DATABASE ====================

  private async saveBattleToDb(battleId: string, state: BattleState): Promise<void> {
    try {
      // For now, just log - we can implement full persistence later
      console.log(`Battle ${battleId} state saved (turn ${state.turn})`);
    } catch (error) {
      console.error('Error saving battle:', error);
    }
  }

  // ==================== CLEANUP ====================

  private cleanup(): void {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes inactivity

    for (const [battleId, battle] of this.activeBattles) {
      if (now - battle.lastActivity.getTime() > timeout) {
        console.log(`Cleaning up inactive battle: ${battleId}`);
        const state = battle.engine.getState();
        this.playerToBattle.delete(state.player1.playerId);
        this.playerToBattle.delete(state.player2.playerId);
        this.activeBattles.delete(battleId);
      }
    }
  }

  // ==================== STATS ====================

  getStats() {
    return {
      activeBattles: this.activeBattles.size,
      playersInQueue: this.matchmakingQueue.size,
      playersInBattle: this.playerToBattle.size,
    };
  }

  getQueueStatus(playerId: string): { inQueue: boolean; inBattle: boolean; battleId?: string } {
    return {
      inQueue: this.matchmakingQueue.has(playerId),
      inBattle: this.playerToBattle.has(playerId),
      battleId: this.playerToBattle.get(playerId),
    };
  }
}

export const battleManager = BattleManager.getInstance();
