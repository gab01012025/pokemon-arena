/**
 * Pokemon Arena - Battle Engine
 * Sistema de batalha completo baseado no Naruto Arena
 */

// ==================== TYPES ====================

export interface EnergyPool {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  psychic: number;
  fighting: number;
  dark: number;
  dragon: number;
  normal: number;
  ghost: number;
  poison: number;
  ground: number;
  flying: number;
  ice: number;
  rock: number;
  steel: number;
  fairy: number;
  bug: number;
  random: number; // Can be used as any type
}

export interface BattlePokemon {
  id: string;
  name: string;
  types: string[];
  maxHealth: number;
  currentHealth: number;
  moves: BattleMove[];
  traits: string[];
  position: number; // 0, 1, 2
  
  // Status effects
  effects: StatusEffect[];
  cooldowns: Record<string, number>; // moveId -> turns remaining
  
  // Modifiers
  damageBoost: number;
  damageReduction: number;
  isStunned: boolean;
  isInvulnerable: boolean;
}

export interface BattleMove {
  id: string;
  name: string;
  description: string;
  classes: string[];
  cost: Partial<EnergyPool>;
  cooldown: number;
  damage: number;
  healing: number;
  effects: MoveEffect[];
  target: TargetType;
  slot: number;
}

export type TargetType = 
  | 'Self'
  | 'OneAlly'
  | 'AllAllies'
  | 'OneEnemy'
  | 'AllEnemies'
  | 'All';

export interface MoveEffect {
  type: string;
  value?: number;
  duration?: number;
  chance?: number;
  damage?: number;
  target?: string;
}

export interface StatusEffect {
  id: string;
  type: string;
  name: string;
  duration: number;
  value?: number;
  damage?: number;
  sourceId: string;
}

export interface BattlePlayer {
  playerId: string;
  playerName: string;
  team: BattlePokemon[];
  energy: EnergyPool;
  isReady: boolean;
  hasSubmittedActions: boolean;
}

export interface BattleAction {
  playerId: string;
  pokemonId: string;
  moveId: string;
  targetIds: string[];
  skipTurn?: boolean;
}

export interface BattleState {
  id: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  turn: number;
  phase: BattlePhase;
  actions: BattleAction[];
  log: BattleLogEntry[];
  winner: string | null;
  startedAt: Date;
  turnDeadline: Date | null;
}

export type BattlePhase = 
  | 'waiting'      // Waiting for players
  | 'selection'    // Players selecting actions
  | 'execution'    // Executing actions
  | 'resolution'   // Resolving end of turn
  | 'finished';    // Battle over

export interface BattleLogEntry {
  turn: number;
  timestamp: Date;
  type: 'action' | 'damage' | 'heal' | 'effect' | 'ko' | 'energy' | 'system';
  message: string;
  details?: Record<string, unknown>;
}

// ==================== CONSTANTS ====================

const ENERGY_TYPES: (keyof EnergyPool)[] = [
  'fire', 'water', 'grass', 'electric', 'psychic', 'fighting',
  'dark', 'dragon', 'normal', 'ghost', 'poison', 'ground',
  'flying', 'ice', 'rock', 'steel', 'fairy', 'bug', 'random'
];

const TURN_TIME_LIMIT = 60000; // 60 seconds per turn

// ==================== BATTLE ENGINE ====================

export class BattleEngine {
  private state: BattleState;

  constructor(battleId: string, player1: BattlePlayer, player2: BattlePlayer) {
    this.state = {
      id: battleId,
      player1,
      player2,
      turn: 0,
      phase: 'waiting',
      actions: [],
      log: [],
      winner: null,
      startedAt: new Date(),
      turnDeadline: null,
    };
  }

  // ==================== GETTERS ====================

  getState(): BattleState {
    return { ...this.state };
  }

  getPlayerState(playerId: string): BattlePlayer | null {
    if (this.state.player1.playerId === playerId) return this.state.player1;
    if (this.state.player2.playerId === playerId) return this.state.player2;
    return null;
  }

  getOpponentState(playerId: string): BattlePlayer | null {
    if (this.state.player1.playerId === playerId) return this.state.player2;
    if (this.state.player2.playerId === playerId) return this.state.player1;
    return null;
  }

  // ==================== GAME FLOW ====================

  startBattle(): void {
    this.state.phase = 'selection';
    this.state.turn = 1;
    
    // Generate initial energy for both players
    this.generateEnergy(this.state.player1);
    this.generateEnergy(this.state.player2);
    
    this.state.turnDeadline = new Date(Date.now() + TURN_TIME_LIMIT);
    
    this.addLog('system', `Battle started! Turn ${this.state.turn}`);
    this.addLog('energy', `${this.state.player1.playerName} received energy`, {
      energy: this.state.player1.energy
    });
    this.addLog('energy', `${this.state.player2.playerName} received energy`, {
      energy: this.state.player2.energy
    });
  }

  submitAction(action: BattleAction): boolean {
    if (this.state.phase !== 'selection') return false;
    
    const player = this.getPlayerState(action.playerId);
    if (!player) return false;
    if (player.hasSubmittedActions) return false;
    
    // Validate action
    if (!this.validateAction(action, player)) return false;
    
    this.state.actions.push(action);
    player.hasSubmittedActions = true;
    
    // Check if both players submitted
    if (this.state.player1.hasSubmittedActions && this.state.player2.hasSubmittedActions) {
      this.executeTurn();
    }
    
    return true;
  }

  // ==================== ENERGY SYSTEM ====================

  private generateEnergy(player: BattlePlayer): void {
    // Generate energy based on team types (like Naruto Arena chakra system)
    const typeCount: Record<string, number> = {};
    
    for (const pokemon of player.team) {
      if (pokemon.currentHealth > 0) {
        for (const type of pokemon.types) {
          const typeLower = type.toLowerCase() as keyof EnergyPool;
          typeCount[typeLower] = (typeCount[typeLower] || 0) + 1;
        }
      }
    }
    
    // Each alive Pokemon generates 1 energy of its type(s)
    // Plus 1 random energy
    for (const [type, count] of Object.entries(typeCount)) {
      player.energy[type as keyof EnergyPool] += count;
    }
    player.energy.random += 1;
  }

  private canAffordMove(player: BattlePlayer, move: BattleMove): boolean {
    const cost = move.cost;
    const energy = { ...player.energy };
    
    for (const [type, amount] of Object.entries(cost)) {
      if (amount && amount > 0) {
        const available = energy[type as keyof EnergyPool] || 0;
        if (available < amount) {
          // Try to use random energy
          const deficit = amount - available;
          if (energy.random >= deficit) {
            energy.random -= deficit;
          } else {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  private spendEnergy(player: BattlePlayer, move: BattleMove): void {
    const cost = move.cost;
    
    for (const [type, amount] of Object.entries(cost)) {
      if (amount && amount > 0) {
        const typeKey = type as keyof EnergyPool;
        const available = player.energy[typeKey] || 0;
        
        if (available >= amount) {
          player.energy[typeKey] -= amount;
        } else {
          // Use random energy for deficit
          const deficit = amount - available;
          player.energy[typeKey] = 0;
          player.energy.random -= deficit;
        }
      }
    }
  }

  // ==================== ACTION VALIDATION ====================

  private validateAction(action: BattleAction, player: BattlePlayer): boolean {
    if (action.skipTurn) return true;
    
    // Find the Pokemon using the move
    const pokemon = player.team.find(p => p.id === action.playerId);
    if (!pokemon) return false;
    if (pokemon.currentHealth <= 0) return false;
    if (pokemon.isStunned) return false;
    
    // Find the move
    const move = pokemon.moves.find(m => m.id === action.moveId);
    if (!move) return false;
    
    // Check cooldown
    if (pokemon.cooldowns[move.id] && pokemon.cooldowns[move.id] > 0) return false;
    
    // Check energy cost
    if (!this.canAffordMove(player, move)) return false;
    
    // Validate targets
    if (!this.validateTargets(action.targetIds, move.target, player)) return false;
    
    return true;
  }

  private validateTargets(targetIds: string[], targetType: TargetType, player: BattlePlayer): boolean {
    const opponent = this.getOpponentState(player.playerId);
    if (!opponent) return false;
    
    switch (targetType) {
      case 'Self':
        return targetIds.length === 1 && player.team.some(p => p.id === targetIds[0]);
      case 'OneAlly':
        return targetIds.length === 1 && player.team.some(p => p.id === targetIds[0] && p.currentHealth > 0);
      case 'AllAllies':
        return true; // Will target all allies automatically
      case 'OneEnemy':
        return targetIds.length === 1 && opponent.team.some(p => p.id === targetIds[0] && p.currentHealth > 0);
      case 'AllEnemies':
        return true; // Will target all enemies automatically
      case 'All':
        return true;
      default:
        return false;
    }
  }

  // ==================== TURN EXECUTION ====================

  private executeTurn(): void {
    this.state.phase = 'execution';
    
    // Sort actions by priority (speed, move priority, etc.)
    const sortedActions = this.sortActions(this.state.actions);
    
    // Execute each action
    for (const action of sortedActions) {
      if (!action.skipTurn) {
        this.executeAction(action);
      }
    }
    
    // Resolution phase
    this.resolveTurn();
  }

  private sortActions(actions: BattleAction[]): BattleAction[] {
    // For now, simple random order (can add speed stats later)
    return actions.sort(() => Math.random() - 0.5);
  }

  private executeAction(action: BattleAction): void {
    const player = this.getPlayerState(action.playerId);
    const opponent = this.getOpponentState(action.playerId);
    if (!player || !opponent) return;
    
    const pokemon = player.team.find(p => p.id === action.playerId);
    if (!pokemon || pokemon.currentHealth <= 0) return;
    
    const move = pokemon.moves.find(m => m.id === action.moveId);
    if (!move) return;
    
    // Spend energy
    this.spendEnergy(player, move);
    
    // Set cooldown
    if (move.cooldown > 0) {
      pokemon.cooldowns[move.id] = move.cooldown;
    }
    
    // Get targets
    const targets = this.getTargets(action.targetIds, move.target, player, opponent);
    
    // Apply move effects
    this.addLog('action', `${pokemon.name} used ${move.name}!`);
    
    for (const target of targets) {
      // Calculate and apply damage
      if (move.damage > 0) {
        const damage = this.calculateDamage(pokemon, target, move);
        this.applyDamage(target, damage, pokemon.name, move.name);
      }
      
      // Apply healing
      if (move.healing > 0) {
        this.applyHealing(target, move.healing, pokemon.name, move.name);
      }
      
      // Apply effects
      for (const effect of move.effects) {
        this.applyEffect(pokemon, target, effect, move.name);
      }
    }
  }

  private getTargets(
    targetIds: string[],
    targetType: TargetType,
    player: BattlePlayer,
    opponent: BattlePlayer
  ): BattlePokemon[] {
    switch (targetType) {
      case 'Self':
        return player.team.filter(p => targetIds.includes(p.id));
      case 'OneAlly':
        return player.team.filter(p => targetIds.includes(p.id) && p.currentHealth > 0);
      case 'AllAllies':
        return player.team.filter(p => p.currentHealth > 0);
      case 'OneEnemy':
        return opponent.team.filter(p => targetIds.includes(p.id) && p.currentHealth > 0);
      case 'AllEnemies':
        return opponent.team.filter(p => p.currentHealth > 0);
      case 'All':
        return [...player.team, ...opponent.team].filter(p => p.currentHealth > 0);
      default:
        return [];
    }
  }

  // ==================== DAMAGE & HEALING ====================

  private calculateDamage(attacker: BattlePokemon, defender: BattlePokemon, move: BattleMove): number {
    let damage = move.damage;
    
    // Apply attacker's damage boost
    damage = Math.floor(damage * (1 + attacker.damageBoost / 100));
    
    // Apply defender's damage reduction
    damage = Math.floor(damage * (1 - defender.damageReduction / 100));
    
    // Check invulnerability
    if (defender.isInvulnerable) {
      damage = 0;
    }
    
    // Minimum damage
    damage = Math.max(0, damage);
    
    return damage;
  }

  private applyDamage(target: BattlePokemon, damage: number, attackerName: string, moveName: string): void {
    if (damage <= 0) return;
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    this.addLog('damage', `${target.name} took ${damage} damage from ${moveName}!`, {
      targetId: target.id,
      damage,
      remainingHealth: target.currentHealth
    });
    
    if (target.currentHealth <= 0) {
      this.addLog('ko', `${target.name} was knocked out!`, { targetId: target.id });
    }
  }

  private applyHealing(target: BattlePokemon, amount: number, healerName: string, moveName: string): void {
    const actualHealing = Math.min(amount, target.maxHealth - target.currentHealth);
    target.currentHealth += actualHealing;
    
    this.addLog('heal', `${target.name} recovered ${actualHealing} HP from ${moveName}!`, {
      targetId: target.id,
      healing: actualHealing,
      currentHealth: target.currentHealth
    });
  }

  // ==================== STATUS EFFECTS ====================

  private applyEffect(source: BattlePokemon, target: BattlePokemon, effect: MoveEffect, moveName: string): void {
    // Check chance
    if (effect.chance && Math.random() * 100 > effect.chance) {
      return;
    }
    
    const statusEffect: StatusEffect = {
      id: `${source.id}-${effect.type}-${Date.now()}`,
      type: effect.type,
      name: effect.type,
      duration: effect.duration || 1,
      value: effect.value,
      damage: effect.damage,
      sourceId: source.id,
    };
    
    switch (effect.type) {
      case 'stun':
        target.isStunned = true;
        target.effects.push(statusEffect);
        this.addLog('effect', `${target.name} is stunned!`);
        break;
        
      case 'burn':
      case 'poison':
        target.effects.push(statusEffect);
        this.addLog('effect', `${target.name} is ${effect.type}ed!`);
        break;
        
      case 'defense':
        target.damageReduction += effect.value || 0;
        target.effects.push(statusEffect);
        this.addLog('effect', `${target.name}'s defense increased!`);
        break;
        
      case 'attackBoost':
        target.damageBoost += effect.value || 0;
        target.effects.push(statusEffect);
        this.addLog('effect', `${target.name}'s attack increased!`);
        break;
        
      case 'drain':
        if (effect.damage) {
          this.applyDamage(target, effect.damage, source.name, moveName);
          this.applyHealing(source, effect.damage, source.name, moveName);
        }
        target.effects.push(statusEffect);
        break;
        
      case 'invulnerable':
        target.isInvulnerable = true;
        target.effects.push(statusEffect);
        this.addLog('effect', `${target.name} became invulnerable!`);
        break;
        
      case 'recoil':
        if (effect.value) {
          this.applyDamage(source, effect.value, source.name, 'recoil');
        }
        break;
    }
  }

  private processStatusEffects(): void {
    const allPokemon = [...this.state.player1.team, ...this.state.player2.team];
    
    for (const pokemon of allPokemon) {
      if (pokemon.currentHealth <= 0) continue;
      
      // Process each effect
      for (const effect of pokemon.effects) {
        // Apply damage over time effects
        if ((effect.type === 'burn' || effect.type === 'poison') && effect.damage) {
          this.applyDamage(pokemon, effect.damage, 'status', effect.type);
        }
        
        // Decrease duration
        effect.duration--;
      }
      
      // Remove expired effects
      const expiredEffects = pokemon.effects.filter(e => e.duration <= 0);
      for (const effect of expiredEffects) {
        this.removeEffect(pokemon, effect);
      }
      pokemon.effects = pokemon.effects.filter(e => e.duration > 0);
      
      // Decrease cooldowns
      for (const moveId of Object.keys(pokemon.cooldowns)) {
        if (pokemon.cooldowns[moveId] > 0) {
          pokemon.cooldowns[moveId]--;
        }
      }
    }
  }

  private removeEffect(pokemon: BattlePokemon, effect: StatusEffect): void {
    switch (effect.type) {
      case 'stun':
        pokemon.isStunned = false;
        break;
      case 'defense':
        pokemon.damageReduction -= effect.value || 0;
        break;
      case 'attackBoost':
        pokemon.damageBoost -= effect.value || 0;
        break;
      case 'invulnerable':
        pokemon.isInvulnerable = false;
        break;
    }
  }

  // ==================== TURN RESOLUTION ====================

  private resolveTurn(): void {
    this.state.phase = 'resolution';
    
    // Process status effects
    this.processStatusEffects();
    
    // Check for winner
    const winner = this.checkWinner();
    if (winner) {
      this.state.winner = winner;
      this.state.phase = 'finished';
      this.addLog('system', `${winner === this.state.player1.playerId ? this.state.player1.playerName : this.state.player2.playerName} wins!`);
      return;
    }
    
    // Start new turn
    this.state.turn++;
    this.state.actions = [];
    this.state.player1.hasSubmittedActions = false;
    this.state.player2.hasSubmittedActions = false;
    
    // Generate new energy
    this.generateEnergy(this.state.player1);
    this.generateEnergy(this.state.player2);
    
    this.state.phase = 'selection';
    this.state.turnDeadline = new Date(Date.now() + TURN_TIME_LIMIT);
    
    this.addLog('system', `Turn ${this.state.turn} begins!`);
  }

  private checkWinner(): string | null {
    const p1Alive = this.state.player1.team.some(p => p.currentHealth > 0);
    const p2Alive = this.state.player2.team.some(p => p.currentHealth > 0);
    
    if (!p1Alive && !p2Alive) {
      // Draw - player 2 wins (defender advantage)
      return this.state.player2.playerId;
    }
    
    if (!p1Alive) return this.state.player2.playerId;
    if (!p2Alive) return this.state.player1.playerId;
    
    return null;
  }

  // ==================== SURRENDER ====================

  surrender(playerId: string): void {
    const winner = playerId === this.state.player1.playerId 
      ? this.state.player2.playerId 
      : this.state.player1.playerId;
    
    this.state.winner = winner;
    this.state.phase = 'finished';
    
    const loserName = playerId === this.state.player1.playerId 
      ? this.state.player1.playerName 
      : this.state.player2.playerName;
    
    this.addLog('system', `${loserName} surrendered!`);
  }

  // ==================== LOGGING ====================

  private addLog(type: BattleLogEntry['type'], message: string, details?: Record<string, unknown>): void {
    this.state.log.push({
      turn: this.state.turn,
      timestamp: new Date(),
      type,
      message,
      details,
    });
  }

  // ==================== SERIALIZATION ====================

  toJSON(): string {
    return JSON.stringify(this.state);
  }

  static fromJSON(json: string): BattleEngine {
    const state = JSON.parse(json) as BattleState;
    const engine = new BattleEngine(
      state.id,
      state.player1,
      state.player2
    );
    engine.state = state;
    return engine;
  }
}

// ==================== HELPER FUNCTIONS ====================

export function createEmptyEnergy(): EnergyPool {
  return {
    fire: 0,
    water: 0,
    grass: 0,
    electric: 0,
    psychic: 0,
    fighting: 0,
    dark: 0,
    dragon: 0,
    normal: 0,
    ghost: 0,
    poison: 0,
    ground: 0,
    flying: 0,
    ice: 0,
    rock: 0,
    steel: 0,
    fairy: 0,
    bug: 0,
    random: 0,
  };
}

export function createBattlePokemon(
  id: string,
  name: string,
  types: string[],
  health: number,
  moves: BattleMove[],
  traits: string[],
  position: number
): BattlePokemon {
  return {
    id,
    name,
    types,
    maxHealth: health,
    currentHealth: health,
    moves,
    traits,
    position,
    effects: [],
    cooldowns: {},
    damageBoost: 0,
    damageReduction: 0,
    isStunned: false,
    isInvulnerable: false,
  };
}

export function createBattlePlayer(
  playerId: string,
  playerName: string,
  team: BattlePokemon[]
): BattlePlayer {
  return {
    playerId,
    playerName,
    team,
    energy: createEmptyEnergy(),
    isReady: true,
    hasSubmittedActions: false,
  };
}
