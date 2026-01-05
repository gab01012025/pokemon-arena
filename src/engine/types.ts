/**
 * Pokémon Arena - Battle Engine Types
 * 
 * Based on Naruto Arena / naruto-unison game mechanics.
 * This is a deterministic, pure-function battle engine.
 * 
 * @license BSD-3-Clause (original naruto-unison license)
 */

// =============================================================================
// CHAKRA / ENERGY SYSTEM
// =============================================================================

/**
 * Energy types (equivalent to Naruto Arena's chakra types)
 * - blood -> fire (bloodline -> fire type)
 * - gen   -> water (genjutsu -> water type)  
 * - nin   -> grass (ninjutsu -> grass type)
 * - tai   -> electric (taijutsu -> electric type)
 * - rand  -> random (any type)
 */
export type EnergyType = 'fire' | 'water' | 'grass' | 'electric' | 'random';

export interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  random: number;
}

export const ZERO_ENERGY: Energy = {
  fire: 0,
  water: 0,
  grass: 0,
  electric: 0,
  random: 0,
};

// =============================================================================
// EFFECTS SYSTEM
// =============================================================================

/**
 * Amount type for damage/reduction calculations
 */
export type AmountType = 'flat' | 'percent';

/**
 * Skill class types - determines what type of skill it is
 */
export type SkillClass = 
  | 'physical'    // Taijutsu - bypassed by physical invuln
  | 'special'     // Ninjutsu - bypassed by special invuln
  | 'mental'      // Genjutsu - bypassed by mental invuln
  | 'unique'      // Bloodline - bypassed by unique invuln
  | 'all'         // Affects all types
  | 'bypassing'   // Bypasses invulnerability
  | 'unreflectable' // Cannot be reflected
  | 'uncounterable' // Cannot be countered
  | 'affliction'  // Damage that ignores reduction
  | 'piercing';   // Ignores defense but not invulnerability

/**
 * Effect trigger types - when effects activate
 */
export type EffectTrigger = 
  | 'onTurnStart'      // Start of each turn
  | 'onTurnEnd'        // End of each turn
  | 'onBeforeAction'   // Before user's action executes
  | 'onAfterAction'    // After user's action executes
  | 'onDamageTaken'    // When receiving damage
  | 'onDamageDealt'    // When dealing damage
  | 'onHarmed'         // When targeted by harmful skill
  | 'onHelped'         // When targeted by helpful skill
  | 'onDeath'          // When health reaches 0
  | 'onRes'            // When would die but has resurrection effect
  | 'passive';         // Always active while status exists

/**
 * Effect types - based on naruto-unison Effect.hs
 */
export type EffectType =
  // Damage/Healing over time
  | 'afflict'          // Deals damage every turn
  | 'heal'             // Heals every turn
  
  // Damage modifiers
  | 'strengthen'       // Adds to damage dealt
  | 'weaken'           // Reduces damage dealt
  | 'bleed'            // Increases damage received
  | 'reduce'           // Reduces damage received
  | 'pierce'           // Damage becomes piercing
  
  // Invulnerability
  | 'invulnerable'     // Invulnerable to skill classes
  | 'bypass'           // Skills bypass invulnerability
  
  // Disables
  | 'stun'             // Disables skill classes
  | 'silence'          // Disables non-damage effects
  | 'snare'            // Increases cooldowns
  
  // Special
  | 'counter'          // Counter attack on next harmful action
  | 'reflect'          // Reflect next harmful skill
  | 'redirect'         // Redirect skills to another target
  | 'absorb'           // Gain energy when targeted
  | 'endure'           // Cannot go below 1 HP
  | 'expose'           // Cannot reduce damage or be invulnerable
  | 'plague'           // Cannot be healed or cured
  | 'reveal'           // Reveals invisible effects to enemy
  | 'taunt'            // Forces target to attack user
  | 'threshold'        // Nullifies damage below a value
  | 'limit'            // Limits maximum damage received
  
  // Defense
  | 'destructibleDefense' // Absorbs damage before HP
  | 'barrier';            // Blocks damage from specific slots

/**
 * Full effect definition
 */
export interface Effect {
  type: EffectType;
  value: number;                     // Amount (damage, heal, etc)
  amountType: AmountType;            // Flat or percent
  classes: SkillClass[];             // Affected skill classes
  duration: number;                  // Turns remaining (-1 = permanent)
  trigger: EffectTrigger;            // When effect activates
  source: number;                    // Fighter slot that applied this
  name: string;                      // Effect/Status name
  stacks: number;                    // Number of stacks
  removable: boolean;                // Can be cured/removed
  visible: boolean;                  // Visible to enemy
  helpful: boolean;                  // Is a beneficial effect
}

/**
 * Creates a default effect
 */
export function createEffect(partial: Partial<Effect> & { type: EffectType; source: number; name: string }): Effect {
  return {
    value: 0,
    amountType: 'flat',
    classes: ['all'],
    duration: 1,
    trigger: 'passive',
    stacks: 1,
    removable: true,
    visible: true,
    helpful: isHelpfulEffect(partial.type),
    ...partial,
  };
}

/**
 * Determines if an effect type is helpful (beneficial)
 */
export function isHelpfulEffect(type: EffectType): boolean {
  const helpfulTypes: EffectType[] = [
    'heal', 'strengthen', 'reduce', 'invulnerable', 'bypass', 
    'counter', 'reflect', 'absorb', 'endure', 'destructibleDefense', 
    'barrier', 'threshold', 'limit'
  ];
  return helpfulTypes.includes(type);
}

// =============================================================================
// STATUS SYSTEM
// =============================================================================

/**
 * Status - a collection of effects applied by a skill
 */
export interface Status {
  name: string;              // Status name (usually skill name)
  source: number;            // Fighter slot that applied this
  duration: number;          // Turns remaining (-1 = permanent)
  effects: Effect[];         // Effects this status grants
  classes: SkillClass[];     // Status classes
  stacks: number;            // Stack count
  visible: boolean;          // Visible to enemy team
  removable: boolean;        // Can be cured
}

// =============================================================================
// SKILL SYSTEM
// =============================================================================

/**
 * Skill target types
 */
export type TargetType =
  | 'self'               // User only
  | 'ally'               // Clicked ally
  | 'xAlly'              // Clicked ally (not self)
  | 'allies'             // All allies
  | 'xAllies'            // All allies except self
  | 'enemy'              // Clicked enemy
  | 'enemies'            // All enemies
  | 'xEnemies'           // All enemies except clicked
  | 'rAlly'              // Random ally
  | 'rXAlly'             // Random ally (not self)
  | 'rEnemy'             // Random enemy
  | 'everyone';          // All fighters

/**
 * Channel type - how skills persist over multiple turns
 */
export type ChannelType = 
  | 'instant'            // Single turn, immediate effect
  | 'action'             // Channeled, can be interrupted by stun
  | 'control'            // Channeled, can be interrupted by target becoming invalid
  | 'ongoing';           // Persistent effect

/**
 * Skill requirement - when a skill can be used
 */
export type SkillRequirement =
  | 'usable'             // Always usable
  | 'unusable'           // Never usable (transformed skill)
  | { hasStatus: string }         // Requires status on self
  | { hasNotStatus: string }      // Requires no status on self
  | { healthAbove: number }       // Requires health > value
  | { healthBelow: number };      // Requires health < value

/**
 * Skill effect application - what happens when skill is used
 */
export interface SkillEffect {
  target: TargetType;
  apply: (ctx: ActionContext) => void;  // Effect function
}

/**
 * Skill definition
 */
export interface Skill {
  name: string;
  description: string;
  cost: Energy;
  cooldown: number;              // Turns to wait after use (0 = no cooldown)
  currentCooldown: number;       // Current cooldown remaining
  charges: number;               // Max charges (0 = unlimited uses, >0 = limited)
  currentCharges: number;        // Current charges remaining
  duration: number;              // Channel duration (0 = instant)
  channelType: ChannelType;
  classes: SkillClass[];         // Skill classes
  require: SkillRequirement;     // Usage requirement
  start: SkillEffect[];          // Effects on first turn
  effects: SkillEffect[];        // Effects on subsequent turns (channels)
  interrupt: SkillEffect[];      // Effects when interrupted
  owner: number;                 // Fighter slot that owns this skill
  variationIndex: number;        // Current variation (for skills with alternates)
  variations?: Skill[];          // Alternate versions of this skill
}

/**
 * Creates a default skill
 */
export function createSkill(partial: Partial<Skill> & { name: string; owner: number }): Skill {
  return {
    description: '',
    cost: { ...ZERO_ENERGY },
    cooldown: 0,
    currentCooldown: 0,
    charges: 0,
    currentCharges: 0,
    duration: 0,
    channelType: 'instant',
    classes: ['all'],
    require: 'usable',
    start: [],
    effects: [],
    interrupt: [],
    variationIndex: 0,
    ...partial,
  };
}

// =============================================================================
// FIGHTER SYSTEM
// =============================================================================

/**
 * Active channel - a channeled skill in progress
 */
export interface Channel {
  skill: Skill;
  target: number;         // Target slot
  duration: number;       // Turns remaining
}

/**
 * Destructible defense entry
 */
export interface Defense {
  name: string;
  amount: number;
  source: number;         // Fighter that applied this
}

/**
 * Barrier entry - blocks damage from specific sources
 */
export interface Barrier {
  name: string;
  amount: number;
  source: number;
}

/**
 * Trap - triggered effect
 */
export interface Trap {
  trigger: EffectTrigger;
  name: string;
  skill: Skill;
  duration: number;
  source: number;
  classes: SkillClass[];
  onTrigger: (ctx: ActionContext) => void;
}

/**
 * Fighter (equivalent to Ninja in naruto-unison)
 */
export interface Fighter {
  slot: number;                    // Position index (0-5, 0-2 player, 3-5 enemy)
  name: string;
  health: number;
  maxHealth: number;
  skills: Skill[];                 // Available skills (usually 4)
  cooldowns: Map<string, number>;  // skill key -> turns remaining
  charges: Map<string, number>;    // skill key -> charges used
  statuses: Status[];              // Active status effects
  defense: Defense[];              // Destructible defense
  barrier: Barrier[];              // Barrier effects
  channels: Channel[];             // Active channels
  traps: Trap[];                   // Triggered effects
  effects: Effect[];               // Computed active effects (from statuses)
  lastSkill: Skill | null;         // Last skill used
  acted: boolean;                  // Has acted this turn
  alive: boolean;                  // Health > 0
}

/**
 * Creates a new fighter
 */
export function createFighter(partial: Partial<Fighter> & { slot: number; name: string; skills: Skill[] }): Fighter {
  return {
    health: 100,
    maxHealth: 100,
    cooldowns: new Map(),
    charges: new Map(),
    statuses: [],
    defense: [],
    barrier: [],
    channels: [],
    traps: [],
    effects: [],
    lastSkill: null,
    acted: false,
    alive: true,
    ...partial,
  };
}

// =============================================================================
// ACTION SYSTEM
// =============================================================================

/**
 * Action context - passed to effect functions
 */
export interface ActionContext {
  state: BattleState;
  user: number;           // User slot
  target: number;         // Target slot
  skill: Skill;
  isNew: boolean;         // First turn of action (vs channeled)
  continues: boolean;     // Continuing a channel
}

/**
 * Player intent - what action a player wants to take
 */
export interface ActionIntent {
  userSlot: number;       // Which fighter is acting
  skillIndex: number;     // Which skill (0-3)
  targetSlot: number;     // Target fighter slot
}

/**
 * Executed action result
 */
export interface ActionExecution {
  intent: ActionIntent;
  success: boolean;
  reason?: string;        // Reason for failure
  effects: AppliedEffect[];
}

/**
 * Applied effect record
 */
export interface AppliedEffect {
  source: number;
  target: number;
  type: EffectType;
  value: number;
  effectName: string;
}

// =============================================================================
// BATTLE STATE
// =============================================================================

/**
 * Turn phase - current phase of turn resolution
 */
export type TurnPhase =
  | 'START_TURN'          // Beginning of turn, apply onTurnStart effects
  | 'COLLECT_ACTIONS'     // Waiting for player input
  | 'BUILD_QUEUE'         // Ordering actions by priority
  | 'EXECUTE_QUEUE'       // Processing actions one by one
  | 'END_TURN';           // End of turn, decrement durations, check deaths

/**
 * Player identifier
 */
export type Player = 'player' | 'opponent';

/**
 * Main battle state
 */
export interface BattleState {
  // Core state
  fighters: Fighter[];           // All fighters (0-2 player, 3-5 opponent)
  turnNumber: number;
  phase: TurnPhase;
  currentPlayer: Player;         // Whose turn it is
  
  // Energy
  playerEnergy: Energy;
  opponentEnergy: Energy;
  
  // Victory condition
  victor: Player | null;
  forfeit: boolean;
  
  // Random seed (for deterministic randomness)
  seed: number;
  
  // Action queue for current turn
  actionQueue: ActionIntent[];
  
  // Log of events
  log: BattleLogEvent[];
}

/**
 * Battle log event types
 */
export type BattleLogEventType =
  | 'turn_start'
  | 'turn_end'
  | 'action_start'
  | 'action_blocked'
  | 'action_reflected'
  | 'action_countered'
  | 'damage'
  | 'heal'
  | 'effect_applied'
  | 'effect_removed'
  | 'death'
  | 'resurrection'
  | 'victory'
  | 'cooldown_update'
  | 'energy_gain'
  | 'energy_spend';

/**
 * Battle log event
 */
export interface BattleLogEvent {
  turn: number;
  phase: TurnPhase;
  type: BattleLogEventType;
  source?: number;
  target?: number;
  skillName?: string;
  effectName?: string;
  value?: number;
  message: string;
}

/**
 * Creates initial battle state
 */
export function createBattleState(
  playerTeam: Fighter[],
  opponentTeam: Fighter[],
  seed: number = Date.now()
): BattleState {
  // Assign slots
  const fighters = [
    ...playerTeam.map((f, i) => ({ ...f, slot: i })),
    ...opponentTeam.map((f, i) => ({ ...f, slot: i + 3 })),
  ];

  return {
    fighters,
    turnNumber: 1,
    phase: 'START_TURN',
    currentPlayer: 'player',
    playerEnergy: { fire: 0, water: 0, grass: 0, electric: 0, random: 1 },
    opponentEnergy: { fire: 0, water: 0, grass: 0, electric: 0, random: 1 },
    victor: null,
    forfeit: false,
    seed,
    actionQueue: [],
    log: [],
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Turn resolution result
 */
export interface TurnResult {
  state: BattleState;
  log: BattleLogEvent[];
}

/**
 * Skill key for cooldown/charge maps
 */
export function skillKey(skill: Skill): string {
  return `${skill.name}:${skill.owner}`;
}

/**
 * Check if slot belongs to player team
 */
export function isPlayerSlot(slot: number): boolean {
  return slot >= 0 && slot <= 2;
}

/**
 * Check if two slots are allies
 */
export function areAllies(slot1: number, slot2: number): boolean {
  return isPlayerSlot(slot1) === isPlayerSlot(slot2);
}

/**
 * Get enemy slots for a fighter
 */
export function getEnemySlots(slot: number): number[] {
  return isPlayerSlot(slot) ? [3, 4, 5] : [0, 1, 2];
}

/**
 * Get ally slots for a fighter (including self)
 */
export function getAllySlots(slot: number): number[] {
  return isPlayerSlot(slot) ? [0, 1, 2] : [3, 4, 5];
}

/**
 * Get opponent player
 */
export function getOpponent(player: Player): Player {
  return player === 'player' ? 'opponent' : 'player';
}
