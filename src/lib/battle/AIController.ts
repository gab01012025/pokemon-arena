/**
 * Pokemon Arena - AI Battle Logic
 * AI controller for single-player battles
 */

interface BattlePokemon {
  id: string;
  name: string;
  currentHp: number;
  maxHp: number;
  moves: AIMove[];
  status: string | null;
  cooldowns: Record<string, number>;
}

interface AIMove {
  id: string;
  name: string;
  damage: number;
  healing: number;
  cost: Record<string, number>;
  cooldown: number;
  effects: string;
  target: string;
  classes: string;
}

interface AIEnergy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  psychic: number;
  fighting: number;
  colorless: number;
}

interface AIDecision {
  pokemonIndex: number;
  moveIndex: number | null;
  targetIndex: number;
}

type AIDifficulty = 'easy' | 'normal' | 'hard';

export class AIController {
  private difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty = 'normal') {
    this.difficulty = difficulty;
  }

  /**
   * Make decisions for all AI Pokemon
   */
  makeDecisions(
    aiTeam: BattlePokemon[],
    playerTeam: BattlePokemon[],
    aiEnergy: AIEnergy
  ): AIDecision[] {
    const decisions: AIDecision[] = [];

    for (let i = 0; i < aiTeam.length; i++) {
      const pokemon = aiTeam[i];
      
      // Skip dead or stunned Pokemon
      if (pokemon.currentHp <= 0 || pokemon.status === 'stun') {
        decisions.push({ pokemonIndex: i, moveIndex: null, targetIndex: 0 });
        continue;
      }

      const decision = this.decideMoveForPokemon(pokemon, i, playerTeam, aiEnergy);
      decisions.push(decision);

      // Deduct energy if move was selected
      if (decision.moveIndex !== null) {
        const move = pokemon.moves[decision.moveIndex];
        if (move) {
          this.deductEnergy(aiEnergy, move.cost);
        }
      }
    }

    return decisions;
  }

  /**
   * Decide move for a single Pokemon
   */
  private decideMoveForPokemon(
    pokemon: BattlePokemon,
    pokemonIndex: number,
    playerTeam: BattlePokemon[],
    energy: AIEnergy
  ): AIDecision {
    const availableMoves = this.getAvailableMoves(pokemon, energy);
    
    if (availableMoves.length === 0) {
      return { pokemonIndex, moveIndex: null, targetIndex: 0 };
    }

    // Get alive enemy targets
    const aliveEnemies = playerTeam
      .map((p, idx) => ({ pokemon: p, index: idx }))
      .filter(e => e.pokemon.currentHp > 0);

    if (aliveEnemies.length === 0) {
      return { pokemonIndex, moveIndex: null, targetIndex: 0 };
    }

    let selectedMove: { move: AIMove; index: number };
    let targetIndex: number;

    switch (this.difficulty) {
      case 'easy':
        // Easy: Random move, random target
        selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        targetIndex = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].index;
        break;

      case 'hard':
        // Hard: Strategic move selection
        const strategicChoice = this.selectStrategicMove(pokemon, availableMoves, aliveEnemies);
        selectedMove = strategicChoice.move;
        targetIndex = strategicChoice.targetIndex;
        break;

      case 'normal':
      default:
        // Normal: Semi-random with preference for damage
        selectedMove = this.selectNormalMove(availableMoves);
        targetIndex = this.selectNormalTarget(aliveEnemies);
        break;
    }

    return {
      pokemonIndex,
      moveIndex: selectedMove.index,
      targetIndex,
    };
  }

  /**
   * Get moves that can be used (enough energy, not on cooldown)
   */
  private getAvailableMoves(pokemon: BattlePokemon, energy: AIEnergy): { move: AIMove; index: number }[] {
    return pokemon.moves
      .map((move, index) => ({ move, index }))
      .filter(({ move }) => {
        // Check cooldown
        if (pokemon.cooldowns[move.id] && pokemon.cooldowns[move.id] > 0) {
          return false;
        }
        // Check energy
        return this.canAfford(move.cost, energy);
      });
  }

  /**
   * Check if can afford move cost
   */
  private canAfford(cost: Record<string, number>, energy: AIEnergy): boolean {
    let colorlessNeeded = 0;
    
    for (const [type, amount] of Object.entries(cost)) {
      if (type === 'colorless') {
        colorlessNeeded += amount;
        continue;
      }
      
      const available = energy[type as keyof AIEnergy] || 0;
      if (available < amount) {
        // Try to use colorless for typed energy shortage
        const shortage = amount - available;
        colorlessNeeded += shortage;
      }
    }

    // Check if we have enough total energy for colorless requirements
    const totalEnergy = Object.values(energy).reduce((a, b) => a + b, 0);
    const typedCost = Object.entries(cost)
      .filter(([t]) => t !== 'colorless')
      .reduce((sum, [, v]) => sum + v, 0);
    
    return totalEnergy >= typedCost + colorlessNeeded;
  }

  /**
   * Deduct energy cost
   */
  private deductEnergy(energy: AIEnergy, cost: Record<string, number>): void {
    for (const [type, amount] of Object.entries(cost)) {
      if (type === 'colorless') {
        // Deduct from any available energy
        let remaining = amount;
        for (const energyType of Object.keys(energy) as (keyof AIEnergy)[]) {
          if (remaining <= 0) break;
          const deduct = Math.min(energy[energyType], remaining);
          energy[energyType] -= deduct;
          remaining -= deduct;
        }
      } else {
        const key = type as keyof AIEnergy;
        energy[key] = Math.max(0, (energy[key] || 0) - amount);
      }
    }
  }

  /**
   * Normal difficulty: Prefer higher damage moves
   */
  private selectNormalMove(moves: { move: AIMove; index: number }[]): { move: AIMove; index: number } {
    // Sort by damage, pick from top 2 randomly
    const sorted = [...moves].sort((a, b) => b.move.damage - a.move.damage);
    const topMoves = sorted.slice(0, Math.min(2, sorted.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)];
  }

  /**
   * Normal difficulty: Target lowest HP enemy
   */
  private selectNormalTarget(enemies: { pokemon: BattlePokemon; index: number }[]): number {
    // 70% chance to target lowest HP
    if (Math.random() < 0.7) {
      const sorted = [...enemies].sort((a, b) => a.pokemon.currentHp - b.pokemon.currentHp);
      return sorted[0].index;
    }
    // 30% random
    return enemies[Math.floor(Math.random() * enemies.length)].index;
  }

  /**
   * Hard difficulty: Strategic move selection
   */
  private selectStrategicMove(
    pokemon: BattlePokemon,
    moves: { move: AIMove; index: number }[],
    enemies: { pokemon: BattlePokemon; index: number }[]
  ): { move: { move: AIMove; index: number }; targetIndex: number } {
    // Find enemy that can be killed this turn
    for (const enemy of enemies) {
      for (const moveData of moves) {
        if (moveData.move.damage >= enemy.pokemon.currentHp) {
          return { move: moveData, targetIndex: enemy.index };
        }
      }
    }

    // If pokemon is low HP, prioritize healing moves
    if (pokemon.currentHp < pokemon.maxHp * 0.3) {
      const healingMove = moves.find(m => m.move.healing > 0);
      if (healingMove) {
        return { move: healingMove, targetIndex: enemies[0].index };
      }
    }

    // Target lowest HP enemy with highest damage move
    const sortedEnemies = [...enemies].sort((a, b) => a.pokemon.currentHp - b.pokemon.currentHp);
    const sortedMoves = [...moves].sort((a, b) => b.move.damage - a.move.damage);
    
    return {
      move: sortedMoves[0],
      targetIndex: sortedEnemies[0].index,
    };
  }

  /**
   * Generate random energy for AI each turn
   */
  static generateTurnEnergy(existingEnergy: AIEnergy): AIEnergy {
    const types: (keyof AIEnergy)[] = ['fire', 'water', 'grass', 'electric', 'psychic', 'fighting', 'colorless'];
    const newEnergy = { ...existingEnergy };
    
    // Add 1-2 random energy each turn
    const energyGain = Math.random() < 0.3 ? 2 : 1;
    
    for (let i = 0; i < energyGain; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      newEnergy[randomType]++;
    }
    
    return newEnergy;
  }
}

export default AIController;
