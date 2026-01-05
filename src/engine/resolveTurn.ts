/**
 * Pokémon Arena - Battle Engine Turn Resolution
 * 
 * Main turn processing logic.
 * Based on naruto-unison's Game.Engine module.
 * 
 * Turn phases:
 * 1. START_TURN     - Apply onTurnStart effects, generate energy
 * 2. COLLECT_ACTIONS - Wait for player/AI to submit actions
 * 3. BUILD_QUEUE    - Order actions by priority
 * 4. EXECUTE_QUEUE  - Process actions one by one
 * 5. END_TURN       - Decrement durations, apply DoT/HoT, check deaths
 */

import type { 
  BattleState, 
  Fighter,
  ActionIntent,
  ActionExecution,
  TurnResult,
  TurnPhase,
  Player,
  Effect
} from './types';
import { getOpponent, isPlayerSlot } from './types';
import * as Effects from './effects';
import * as Cooldown from './cooldown';
import * as Utils from './utils';
import * as Action from './action';

// =============================================================================
// MAIN TURN RESOLUTION
// =============================================================================

/**
 * Process a complete turn with both players' actions
 * This is the main entry point for the battle engine.
 * 
 * @param state - Current battle state
 * @param playerIntents - Actions chosen by player
 * @param opponentIntents - Actions chosen by opponent/AI
 * @returns New state and battle log
 */
export function resolveTurn(
  state: BattleState,
  playerIntents: ActionIntent[],
  opponentIntents: ActionIntent[]
): TurnResult {
  const rng = new Utils.DeterministicRandom(state.seed);
  let newState = Utils.cloneState(state);
  
  // Phase 1: START_TURN
  newState = startTurn(newState, rng);
  
  // Phase 2: BUILD_QUEUE (combine and order actions)
  newState = buildActionQueue(newState, playerIntents, opponentIntents, rng);
  
  // Phase 3: EXECUTE_QUEUE
  newState = executeActionQueue(newState, rng);
  
  // Phase 4: END_TURN
  newState = endTurn(newState, rng);
  
  // Check victory
  newState = Utils.checkVictory(newState);
  
  // Update seed for next turn
  newState = { ...newState, seed: rng.getState() };
  
  return {
    state: newState,
    log: newState.log.filter(e => e.turn === state.turnNumber),
  };
}

// =============================================================================
// PHASE 1: START_TURN
// =============================================================================

/**
 * Start of turn processing
 */
function startTurn(state: BattleState, rng: Utils.DeterministicRandom): BattleState {
  let newState = { ...state, phase: 'START_TURN' as TurnPhase };
  
  // Log turn start
  newState = Utils.addLog(newState, Utils.createLogEvent(
    newState,
    'turn_start',
    `Turn ${newState.turnNumber} begins`,
  ));
  
  // Generate energy for both players
  const playerEnergy = Utils.addEnergy(newState.playerEnergy, Utils.generateTurnEnergy(rng));
  const opponentEnergy = Utils.addEnergy(newState.opponentEnergy, Utils.generateTurnEnergy(rng));
  
  newState = {
    ...newState,
    playerEnergy,
    opponentEnergy,
  };
  
  // Log energy gain
  newState = Utils.addLog(newState, Utils.createLogEvent(
    newState,
    'energy_gain',
    'Both teams gain energy',
  ));
  
  // Apply onTurnStart effects for all fighters
  newState = applyTriggerEffects(newState, 'onTurnStart', rng);
  
  // Reset acted flags
  newState = Utils.resetActedFlags(newState);
  
  return newState;
}

// =============================================================================
// PHASE 2: BUILD ACTION QUEUE
// =============================================================================

/**
 * Build and order the action queue
 */
function buildActionQueue(
  state: BattleState,
  playerIntents: ActionIntent[],
  opponentIntents: ActionIntent[],
  rng: Utils.DeterministicRandom
): BattleState {
  let newState = { ...state, phase: 'BUILD_QUEUE' as TurnPhase };
  
  // Combine all intents
  const allIntents = [...playerIntents, ...opponentIntents];
  
  // Filter valid intents
  const validIntents = allIntents.filter(intent => {
    const validation = Action.validateAction(newState, intent);
    return validation.valid;
  });
  
  // Sort by priority (deterministic)
  const sortedIntents = sortActionsByPriority(newState, validIntents, rng);
  
  newState = { ...newState, actionQueue: sortedIntents };
  
  return newState;
}

/**
 * Sort actions by priority
 * Priority rules (from Naruto Arena):
 * 1. Skills marked as "instant" or high priority
 * 2. Counter/Reflect skills
 * 3. Invulnerability skills
 * 4. Normal skills (random order for same priority)
 */
function sortActionsByPriority(
  state: BattleState,
  intents: ActionIntent[],
  rng: Utils.DeterministicRandom
): ActionIntent[] {
  // Assign priority scores
  const scored = intents.map(intent => {
    const user = Utils.getFighter(state, intent.userSlot);
    const skill = user ? Utils.getSkill(user, intent.skillIndex) : undefined;
    
    let priority = 0;
    
    if (skill) {
      // Counter/Reflect skills go first
      if (skill.start.some(e => e.target === 'self')) {
        const effects = skill.effects.map(e => e.target);
        if (skill.name.toLowerCase().includes('counter') || 
            skill.name.toLowerCase().includes('reflect') ||
            skill.name.toLowerCase().includes('block')) {
          priority = 100;
        }
      }
      
      // Invulnerability skills are high priority
      if (skill.name.toLowerCase().includes('invul') ||
          skill.name.toLowerCase().includes('dodge') ||
          skill.name.toLowerCase().includes('protect')) {
        priority = Math.max(priority, 90);
      }
      
      // Instant channel type
      if (skill.channelType === 'instant' && skill.duration === 0) {
        priority = Math.max(priority, 50);
      }
    }
    
    // Add small random factor for deterministic tie-breaking
    priority += rng.next() * 0.01;
    
    return { intent, priority };
  });
  
  // Sort descending by priority
  scored.sort((a, b) => b.priority - a.priority);
  
  return scored.map(s => s.intent);
}

// =============================================================================
// PHASE 3: EXECUTE ACTION QUEUE
// =============================================================================

/**
 * Execute all queued actions
 */
function executeActionQueue(
  state: BattleState,
  rng: Utils.DeterministicRandom
): BattleState {
  let newState = { ...state, phase: 'EXECUTE_QUEUE' as TurnPhase };
  const executions: ActionExecution[] = [];
  
  // Process each action in order
  for (const intent of newState.actionQueue) {
    // Re-validate action (state may have changed)
    const validation = Action.validateAction(newState, intent);
    
    if (!validation.valid) {
      executions.push({
        intent,
        success: false,
        reason: validation.reason,
        effects: [],
      });
      continue;
    }
    
    // Execute the action
    const result = Action.executeAction(newState, intent, rng);
    newState = result.state;
    executions.push(result.execution);
  }
  
  // Clear action queue
  newState = { ...newState, actionQueue: [] };
  
  return newState;
}

// =============================================================================
// PHASE 4: END_TURN
// =============================================================================

/**
 * End of turn processing
 */
function endTurn(state: BattleState, rng: Utils.DeterministicRandom): BattleState {
  let newState = { ...state, phase: 'END_TURN' as TurnPhase };
  
  // Process channels
  newState = processChannels(newState, rng);
  
  // Apply onTurnEnd effects
  newState = applyTriggerEffects(newState, 'onTurnEnd', rng);
  
  // Apply HP over time (afflict/heal)
  newState = applyHpOverTime(newState);
  
  // Decrement cooldowns
  newState = decrementAllCooldowns(newState);
  
  // Decrement status durations
  newState = decrementAllStatuses(newState);
  
  // Check for deaths
  newState = processDeaths(newState, rng);
  
  // Log turn end
  newState = Utils.addLog(newState, Utils.createLogEvent(
    newState,
    'turn_end',
    `Turn ${newState.turnNumber} ends`,
  ));
  
  // Increment turn number and swap current player
  newState = {
    ...newState,
    turnNumber: newState.turnNumber + 1,
    currentPlayer: getOpponent(newState.currentPlayer),
  };
  
  return newState;
}

// =============================================================================
// EFFECT TRIGGERS
// =============================================================================

/**
 * Apply effects with a specific trigger to all fighters
 */
function applyTriggerEffects(
  state: BattleState,
  trigger: 'onTurnStart' | 'onTurnEnd' | 'onBeforeAction' | 'onAfterAction',
  rng: Utils.DeterministicRandom
): BattleState {
  let newState = state;
  
  for (const fighter of newState.fighters) {
    if (!fighter.alive) continue;
    
    // Get effects with this trigger
    const effects = fighter.effects.filter(e => e.trigger === trigger);
    
    for (const effect of effects) {
      newState = applyTriggeredEffect(newState, fighter.slot, effect, rng);
    }
  }
  
  return newState;
}

/**
 * Apply a single triggered effect
 */
function applyTriggeredEffect(
  state: BattleState,
  fighterSlot: number,
  effect: Effect,
  rng: Utils.DeterministicRandom
): BattleState {
  let newState = state;
  const fighter = Utils.getFighter(newState, fighterSlot);
  if (!fighter) return newState;
  
  switch (effect.type) {
    case 'afflict':
      // Deal damage
      const damage = effect.value;
      const newHealth = Effects.adjustHealth(fighter, -damage);
      newState = Utils.updateFighter(newState, fighterSlot, f => ({
        ...f,
        health: newHealth,
        alive: newHealth > 0,
      }));
      newState = Utils.addLog(newState, Utils.createLogEvent(
        newState,
        'damage',
        `${fighter.name} takes ${damage} affliction damage from ${effect.name}`,
        { target: fighterSlot, effectName: effect.name, value: damage }
      ));
      break;
      
    case 'heal':
      if (!Effects.canBeHealed(fighter)) break;
      const healing = Math.min(effect.value, fighter.maxHealth - fighter.health);
      newState = Utils.updateFighter(newState, fighterSlot, f => ({
        ...f,
        health: f.health + healing,
      }));
      if (healing > 0) {
        newState = Utils.addLog(newState, Utils.createLogEvent(
          newState,
          'heal',
          `${fighter.name} recovers ${healing} health from ${effect.name}`,
          { target: fighterSlot, effectName: effect.name, value: healing }
        ));
      }
      break;
      
    // Other triggered effects can be added here
  }
  
  return newState;
}

// =============================================================================
// HP OVER TIME
// =============================================================================

/**
 * Apply afflict and heal effects at end of turn
 */
function applyHpOverTime(state: BattleState): BattleState {
  let newState = state;
  
  for (const fighter of newState.fighters) {
    if (!fighter.alive) continue;
    
    const hpChange = Effects.getHpOverTime(fighter);
    
    if (hpChange !== 0) {
      const newHealth = Effects.adjustHealth(fighter, -hpChange);
      newState = Utils.updateFighter(newState, fighter.slot, f => ({
        ...f,
        health: newHealth,
        alive: newHealth > 0,
      }));
    }
  }
  
  return newState;
}

// =============================================================================
// COOLDOWN PROCESSING
// =============================================================================

/**
 * Decrement cooldowns for all fighters
 */
function decrementAllCooldowns(state: BattleState): BattleState {
  return Utils.updateAllFighters(state, fighter => 
    Cooldown.decrementCooldowns(fighter)
  );
}

// =============================================================================
// STATUS PROCESSING
// =============================================================================

/**
 * Decrement status durations for all fighters
 */
function decrementAllStatuses(state: BattleState): BattleState {
  return Utils.updateAllFighters(state, fighter => {
    const newStatuses = Effects.decrementEffects(fighter.statuses);
    return {
      ...fighter,
      statuses: newStatuses,
      effects: Effects.compileEffects(newStatuses),
    };
  });
}

// =============================================================================
// CHANNEL PROCESSING
// =============================================================================

/**
 * Process ongoing channels
 */
function processChannels(state: BattleState, rng: Utils.DeterministicRandom): BattleState {
  let newState = state;
  
  for (const fighter of newState.fighters) {
    if (!fighter.alive) continue;
    
    const newChannels: typeof fighter.channels = [];
    
    for (const channel of fighter.channels) {
      // Check if channel should continue
      const target = Utils.getFighter(newState, channel.target);
      
      // Control channels break if target becomes invalid
      if (channel.skill.channelType === 'control') {
        if (!target || !target.alive) {
          // Channel interrupted - run interrupt effects
          continue;
        }
        
        // Check if target became invulnerable
        if (Effects.isInvulnerable(target, channel.skill.classes)) {
          continue;
        }
      }
      
      // Action channels break if user is stunned
      if (channel.skill.channelType === 'action') {
        if (!Effects.canUseSkillClass(fighter, channel.skill.classes)) {
          continue;
        }
      }
      
      // Apply channel effects
      const context = {
        state: newState,
        user: fighter.slot,
        target: channel.target,
        skill: channel.skill,
        isNew: false,
        continues: true,
      };
      
      for (const effect of channel.skill.effects) {
        effect.apply(context);
      }
      newState = context.state;
      
      // Decrement duration
      if (channel.duration > 1) {
        newChannels.push({
          ...channel,
          duration: channel.duration - 1,
        });
      }
    }
    
    newState = Utils.updateFighter(newState, fighter.slot, f => ({
      ...f,
      channels: newChannels,
    }));
  }
  
  return newState;
}

// =============================================================================
// DEATH PROCESSING
// =============================================================================

/**
 * Process fighter deaths
 */
function processDeaths(state: BattleState, rng: Utils.DeterministicRandom): BattleState {
  let newState = state;
  
  for (const fighter of newState.fighters) {
    if (fighter.health <= 0 && fighter.alive) {
      // Check for resurrection effects
      if (Effects.hasEffect(fighter, 'endure')) {
        // Already handled by adjustHealth
        continue;
      }
      
      // Check for onRes triggers
      const resEffects = fighter.traps.filter(t => t.trigger === 'onRes' as any);
      
      if (resEffects.length > 0) {
        // Apply resurrection
        newState = Utils.updateFighter(newState, fighter.slot, f => ({
          ...f,
          health: 1,
          alive: true,
          traps: f.traps.filter(t => t.trigger !== 'onRes' as any),
        }));
        
        newState = Utils.addLog(newState, Utils.createLogEvent(
          newState,
          'resurrection',
          `${fighter.name} is resurrected!`,
          { target: fighter.slot }
        ));
        
        continue;
      }
      
      // Mark as dead
      newState = Utils.updateFighter(newState, fighter.slot, f => ({
        ...f,
        alive: false,
        channels: [], // Clear channels
      }));
      
      // Log death
      newState = Utils.addLog(newState, Utils.createLogEvent(
        newState,
        'death',
        `${fighter.name} is defeated!`,
        { target: fighter.slot }
      ));
      
      // Apply onDeath triggers
      for (const trap of fighter.traps.filter(t => t.trigger === 'onDeath' as any)) {
        // Execute death trap
      }
      
      // Remove soulbound effects from this fighter on others
      newState = clearSoulboundEffects(newState, fighter.slot);
    }
  }
  
  return newState;
}

/**
 * Remove effects from a dead fighter on other fighters
 */
function clearSoulboundEffects(state: BattleState, deadSlot: number): BattleState {
  return Utils.updateAllFighters(state, fighter => {
    if (fighter.slot === deadSlot) return fighter;
    
    return {
      ...fighter,
      statuses: Effects.clearFromSource(fighter.statuses, deadSlot),
      effects: Effects.compileEffects(
        Effects.clearFromSource(fighter.statuses, deadSlot)
      ),
    };
  });
}

// =============================================================================
// FORFEIT
// =============================================================================

/**
 * Handle player forfeit
 */
export function forfeit(state: BattleState, player: Player): BattleState {
  let newState = Utils.cloneState(state);
  
  // Kill all of forfeiting player's fighters
  const playerSlots = player === 'player' ? [0, 1, 2] : [3, 4, 5];
  
  for (const slot of playerSlots) {
    newState = Utils.updateFighter(newState, slot, f => ({
      ...f,
      health: 0,
      alive: false,
    }));
  }
  
  newState = {
    ...newState,
    victor: getOpponent(player),
    forfeit: true,
  };
  
  return newState;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { resolveTurn as default };
