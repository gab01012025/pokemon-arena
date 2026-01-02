// ==================== ENERGY TYPES (Pokemon Style) ====================
export type EnergyType = 'fire' | 'water' | 'grass' | 'electric' | 'colorless';

export interface EnergyCost {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  colorless: number;
}

export interface EnergyPool {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  colorless: number;
}

// ==================== POKEMON TYPE ====================
export type PokemonType = 
  | 'Normal'
  | 'Fire'
  | 'Water'
  | 'Electric'
  | 'Grass'
  | 'Ice'
  | 'Fighting'
  | 'Poison'
  | 'Ground'
  | 'Flying'
  | 'Psychic'
  | 'Bug'
  | 'Rock'
  | 'Ghost'
  | 'Dragon'
  | 'Dark'
  | 'Steel'
  | 'Fairy';

// ==================== SKILL TYPES ====================
export type SkillClass = 
  | 'Physical' 
  | 'Special' 
  | 'Status' 
  | 'Contact' 
  | 'Ranged' 
  | 'Bypassing' 
  | 'Invisible' 
  | 'Unreflectable' 
  | 'Unremovable' 
  | 'Priority'
  | 'Recoil'
  | 'Harmful'
  | 'Burn'
  | 'Poison';

export type TargetType = 
  | 'Self' 
  | 'OneAlly' 
  | 'AllAllies'
  | 'OneEnemy' 
  | 'AllEnemies' 
  | 'AllCharacters';

export type EffectType =
  | 'damage'
  | 'heal'
  | 'stun'
  | 'invulnerable'
  | 'counter'
  | 'reflect'
  | 'reduce'
  | 'weaken'
  | 'strengthen'
  | 'afflict'
  | 'pierce'
  | 'absorb'
  | 'reveal'
  | 'tag'
  | 'enrage'
  | 'expose'
  | 'burn'
  | 'poison'
  | 'paralyze'
  | 'freeze'
  | 'sleep'
  | 'confuse';

export interface MoveEffect {
  type: EffectType;
  value?: number;
  duration?: number;
  target?: TargetType;
  condition?: string;
  classes?: SkillClass[];
}

// Alias for compatibility
export type SkillEffect = MoveEffect;

export interface Move {
  id: string;
  name: string;
  description: string;
  type: PokemonType;
  classes: SkillClass[];
  cost: Partial<Record<EnergyType, number>>;
  cooldown: number;
  currentCooldown?: number;
  duration: number;
  damage: number;
  healing: number;
  effects: MoveEffect[];
  target: TargetType;
  require?: string;
  slot: number;
}

// Alias for compatibility
export type Skill = Move;

// ==================== POKEMON TRAITS ====================
export type PokemonTrait =
  | 'Kanto'
  | 'Johto'
  | 'Hoenn'
  | 'Sinnoh'
  | 'Unova'
  | 'Kalos'
  | 'Alola'
  | 'Galar'
  | 'Paldea'
  | 'Legendary'
  | 'Mythical'
  | 'Starter'
  | 'Eeveelution'
  | 'PseudoLegendary'
  | 'MegaEvolution'
  | 'GigantamaxForm'
  | 'FireType'
  | 'WaterType'
  | 'GrassType'
  | 'ElectricType'
  | 'PsychicType'
  | 'FightingType'
  | 'DragonType'
  | 'DarkType'
  | 'SteelType'
  | 'FairyType'
  | 'GhostType'
  | 'RockType'
  | 'GroundType'
  | 'PoisonType'
  | 'IceType'
  | 'BugType'
  | 'NormalType'
  | 'FlyingType';

// Alias for compatibility
export type CharacterTrait = PokemonTrait;

export interface Pokemon {
  id: string;
  name: string;
  description: string;
  types: PokemonType[];
  generation: 'Gen1' | 'Gen2' | 'Gen3' | 'Gen4' | 'Gen5' | 'Gen6' | 'Gen7' | 'Gen8' | 'Gen9';
  category: 'Starter' | 'Common' | 'Rare' | 'Legendary' | 'Mythical' | 'PseudoLegendary';
  hp: number;
  traits: PokemonTrait[];
  moves: Move[];
  isStarter: boolean;
  unlockCost: number;
  sprite?: string;
}

// Alias for compatibility
export interface Character extends Pokemon {
  health: number;
  skills: Skill[];
  group: string;
}

// ==================== BATTLE TYPES ====================
export interface StatusEffect {
  id: string;
  name: string;
  type: EffectType;
  value: number;
  duration: number;
  source: string; // Character ID that applied it
  classes: SkillClass[];
}

export interface BattlePokemon {
  id: string;
  pokemonId: string;
  name: string;
  types: PokemonType[];
  currentHealth: number;
  maxHealth: number;
  position: number; // 0, 1, 2
  moves: Move[];
  effects: StatusEffect[];
  cooldowns: number[]; // index corresponds to move slot
  traits: PokemonTrait[];
}

// Alias for compatibility
export type BattleCharacter = BattlePokemon;

export interface PlayerState {
  oderId: string;
  username: string;
  team: BattlePokemon[];
  energy: EnergyPool;
  selectedActions: SelectedAction[];
}

// Type alias for backward compatibility
export type ChakraPool = EnergyPool;
export type ChakraCost = EnergyCost;

export interface SelectedAction {
  characterPosition: number;
  skillSlot: number;
  targetPositions: number[]; // Can target multiple
  targetPlayerId: string; // Which player (self or enemy)
}

// Simplified Action for UI
export interface Action {
  pokemonId: string;
  moveIndex: number;
  targetIds: string[];
}

export interface BattleState {
  id: string;
  turn: number;
  phase: 'selection' | 'resolution' | 'finished';
  currentPlayer: 1 | 2;
  player1: PlayerState;
  player2: PlayerState;
  turnHistory: TurnAction[];
  winner?: string;
}

export interface TurnAction {
  turn: number;
  playerId: string;
  actions: ResolvedAction[];
}

export interface ResolvedAction {
  characterId: string;
  skillId: string;
  targets: string[];
  effects: AppliedEffect[];
}

export interface AppliedEffect {
  targetId: string;
  type: EffectType;
  value: number;
  message: string;
}

// ==================== USER/RANKING TYPES ====================
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  streak: number;
  maxStreak: number;
  ladderPoints: number;
  clan?: Clan;
  unlockedCharacters: string[];
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description?: string;
  leaderId: string;
  points: number;
  memberCount: number;
}

export interface RankingEntry {
  position: number;
  userId: string;
  username: string;
  avatar: string;
  value: number; // Points, wins, streak, etc.
}

// ==================== QUEUE TYPES ====================
export interface QueueEntry {
  oderId: string;
  username: string;
  team: string[]; // Character IDs
  queueType: 'quick' | 'ladder' | 'private';
  rating: number;
  joinedAt: Date;
}
