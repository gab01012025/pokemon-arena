// ==================== BATTLE TYPE SYSTEM ====================

export type PokemonType = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' |
  'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' |
  'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type GlobalType = 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice' |
  'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug' | 'Rock' |
  'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy';

export type EnergyType = 'grass' | 'fire' | 'water' | 'lightning' | 'psychic' | 'fighting' | 'darkness' | 'metal' | 'colorless';

export type StatusType =
  | 'burn' | 'poison' | 'paralyze' | 'sleep' | 'freeze' | 'confuse'
  | 'stun' | 'invulnerable' | 'counter' | 'reflect' | 'taunt' | 'silence'
  | 'weaken' | 'strengthen' | 'reduce-damage' | 'increase-damage'
  | 'remove-energy' | 'steal-energy' | 'drain-hp' | 'heal-over-time'
  | 'cooldown-increase' | 'cooldown-reduce' | 'cannot-be-healed'
  | 'endure' | 'expose' | 'bleed';

export type GamePhase = 'loading' | 'trainer-select' | 'energy-select' | 'player1-turn' | 'player2-turn' | 'targeting' | 'executing' |
  'item-target' | 'victory' | 'defeat';

// ==================== INTERFACES ====================

export interface StatusEffect {
  type: StatusType;
  duration: number;
  source: string;
  value?: number;
}

export interface EnergyState {
  grass: number;
  fire: number;
  water: number;
  lightning: number;
  psychic: number;
  fighting: number;
  darkness: number;
  metal: number;
  colorless: number;
}

export interface EnergyCost { type: EnergyType; amount: number; }

export interface EvolutionOption {
  id: number;
  name: string;
  types: PokemonType[];
  hpBonus: number;
  statBonus: number;
  energyCost: EnergyCost[];
}

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  power: number;
  accuracy: number;
  cost: EnergyCost[];
  cooldown: number;
  currentCooldown: number;
  description: string;
  targetType: 'enemy' | 'all-enemies' | 'self';
  healing?: number;
  statusEffect?: { type: StatusType; chance: number; duration: number; value?: number };
}

export interface BattlePokemon {
  id: number;
  name: string;
  types: PokemonType[];
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  sprite: string;
  moves: Move[];
  statusEffects: StatusEffect[];
  canEvolve: boolean;
  evolvesTo?: { id: number; name: string; hpBonus: number; statBonus: number };
  evolutionEnergyCost?: EnergyCost[];
  evolutionOptions?: EvolutionOption[];  // Branching evolution (e.g. Eevee)
  weakness?: PokemonType;    // TCG Pocket: +20 flat damage from this type
  resistance?: PokemonType;  // TCG Pocket: -20 flat damage from this type
}

export interface SelectedAction {
  pokemonIndex: number;
  move: Move;
  targetIndex: number;
}

export interface LogEntry {
  id: number;
  text: string;
  type: 'info' | 'damage' | 'heal' | 'effect' | 'critical' | 'status';
}

export interface Trainer {
  name: string;
  passive: string;
  passiveDesc: string;
  passiveDesc2: string;
  applyPassive: (context: PassiveContext) => void;
  onBattleStart?: (context: PassiveContext) => void;
}

export interface PassiveContext {
  playerTeam: BattlePokemon[];
  opponentTeam: BattlePokemon[];
  energy: EnergyState;
  setEnergy: (e: EnergyState | ((prev: EnergyState) => EnergyState)) => void;
  setPlayerTeam: (fn: (prev: BattlePokemon[]) => BattlePokemon[]) => void;
  setAiEnergy: (fn: (prev: EnergyState) => EnergyState) => void;
  turn: number;
  addLog: (text: string, type: LogEntry['type']) => void;
}

export interface BattleItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  uses: number;
  maxUses: number;
  category: 'healing' | 'status' | 'revive' | 'boost' | 'energy' | 'special';
}

export interface KantoPokemonData {
  id: number;
  name: string;
  types: PokemonType[];
  hp: number;
  canEvolve: boolean;
  evolvesTo?: { id: number; name: string; hpBonus: number; statBonus: number };
  evolutionEnergyCost?: EnergyCost[];
  evolutionOptions?: EvolutionOption[];  // Branching evolution (e.g. Eevee)
  weakness?: PokemonType;
  resistance?: PokemonType;
}
