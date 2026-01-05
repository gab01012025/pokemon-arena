/**
 * Pokémon Arena - Battle Engine
 * 
 * A deterministic, pure-function battle engine based on Naruto Arena mechanics.
 * 
 * @license BSD-3-Clause (original naruto-unison license)
 * 
 * ## Architecture
 * 
 * The engine is designed to be:
 * - **Deterministic**: Given the same inputs and seed, produces identical outputs
 * - **Pure**: All functions are side-effect free, returning new state objects
 * - **Independent**: Works without any UI framework dependencies
 * - **Testable**: Easy to unit test with predictable outputs
 * 
 * ## Usage
 * 
 * ```typescript
 * import { 
 *   createBattleState, 
 *   createFighter, 
 *   createSkill,
 *   resolveTurn 
 * } from '@/engine';
 * 
 * // Create fighters
 * const pikachu = createFighter({
 *   slot: 0,
 *   name: 'Pikachu',
 *   skills: [thunderboltSkill, quickAttackSkill, ...],
 * });
 * 
 * // Create battle state
 * const state = createBattleState(playerTeam, opponentTeam);
 * 
 * // Process a turn
 * const { state: newState, log } = resolveTurn(
 *   state,
 *   playerIntents,
 *   opponentIntents
 * );
 * ```
 * 
 * ## Turn Phases
 * 
 * 1. **START_TURN** - Generate energy, apply onTurnStart effects
 * 2. **COLLECT_ACTIONS** - Gather player/AI intents (external)
 * 3. **BUILD_QUEUE** - Order actions by priority
 * 4. **EXECUTE_QUEUE** - Process actions sequentially
 * 5. **END_TURN** - Apply DoT/HoT, decrement durations, check deaths
 * 
 * ## Effect System
 * 
 * Effects modify how fighters interact:
 * - **Stun**: Prevents using certain skill types
 * - **Invulnerable**: Blocks incoming skills of certain types
 * - **Strengthen/Weaken**: Modify damage dealt
 * - **Reduce/Bleed**: Modify damage received
 * - **Afflict/Heal**: Deal/restore HP over time
 * - **Counter/Reflect**: Block or return skills
 * 
 * ## Energy System
 * 
 * Four energy types plus random:
 * - Fire (Bloodline equivalent)
 * - Water (Genjutsu equivalent)
 * - Grass (Ninjutsu equivalent)
 * - Electric (Taijutsu equivalent)
 * - Random (can substitute any type)
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Energy
  EnergyType,
  Energy,
  
  // Effects
  AmountType,
  SkillClass,
  EffectTrigger,
  EffectType,
  Effect,
  Status,
  
  // Skills
  TargetType,
  ChannelType,
  SkillRequirement,
  SkillEffect,
  Skill,
  
  // Fighters
  Channel,
  Defense,
  Barrier,
  Trap,
  Fighter,
  
  // Actions
  ActionContext,
  ActionIntent,
  ActionExecution,
  AppliedEffect,
  
  // Battle State
  TurnPhase,
  Player,
  BattleState,
  BattleLogEventType,
  BattleLogEvent,
  TurnResult,
} from './types';

// =============================================================================
// FACTORY EXPORTS
// =============================================================================

export {
  // Constants
  ZERO_ENERGY,
  
  // Factories
  createEffect,
  createSkill,
  createFighter,
  createBattleState,
  
  // Helpers
  isHelpfulEffect,
  skillKey,
  isPlayerSlot,
  areAllies,
  getEnemySlots,
  getAllySlots,
  getOpponent,
} from './types';

// =============================================================================
// EFFECTS MODULE
// =============================================================================

export * as Effects from './effects';

// =============================================================================
// COOLDOWN MODULE
// =============================================================================

export * as Cooldown from './cooldown';

// =============================================================================
// UTILITIES MODULE
// =============================================================================

export {
  DeterministicRandom,
  cloneState,
  cloneFighter,
  cloneSkill,
  cloneStatus,
  addEnergy,
  subtractEnergy,
  canAfford,
  payEnergy,
  totalEnergy,
  generateTurnEnergy,
  createLogEvent,
  addLog,
  getFighter,
  updateFighter,
  updateAllFighters,
  getAliveFighters,
  getPlayerFighters,
  getOpponentFighters,
  getAllies,
  getEnemies,
  getSkill,
  checkVictory,
  updateAliveStatus,
  resetActedFlags,
} from './utils';

// =============================================================================
// ACTION MODULE
// =============================================================================

export {
  // Validation
  checkRequirement,
  validateAction,
  validateTarget,
  
  // Execution
  executeAction,
  
  // Effect builders
  damage,
  heal,
  applyStatus,
  stun,
  invulnerable,
  defense,
} from './action';

// =============================================================================
// TURN RESOLUTION
// =============================================================================

export { resolveTurn, forfeit } from './resolveTurn';

// =============================================================================
// CHARACTERS
// =============================================================================

export {
  // Generation 1 Pokemon creators
  createPikachu,
  createCharizard,
  createBlastoise,
  createVenusaur,
  createMewtwo,
  createGengar,
  createAlakazam,
  createDragonite,
  createSnorlax,
  createMachamp,
  createGyarados,
  
  // Generation 2+ Pokemon creators
  createTyranitar,
  createScizor,
  createGarchomp,
  createLucario,
  
  // Registry
  ALL_POKEMON,
  getPokemonById,
  createTeam,
} from './characters';
