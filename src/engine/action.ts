/**
 * Pokémon Arena - Battle Engine Action Processing
 * 
 * Core action execution logic.
 * Based on naruto-unison's Game.Action module.
 */

import type { 
  BattleState, 
  Fighter, 
  Skill, 
  ActionIntent,
  ActionExecution,
  AppliedEffect,
  ActionContext,
  Status,
  Effect,
  TargetType,
  SkillRequirement
} from './types';
import { 
  skillKey, 
  isPlayerSlot, 
  areAllies, 
  getAllySlots, 
  getEnemySlots,
  createEffect 
} from './types';
import * as Effects from './effects';
import * as Cooldown from './cooldown';
import * as Utils from './utils';

// =============================================================================
// ACTION VALIDATION
// =============================================================================

/**
 * Check if a skill's requirement is met
 */
export function checkRequirement(fighter: Fighter, skill: Skill): boolean {
  const req = skill.require;
  
  if (req === 'usable') return true;
  if (req === 'unusable') return false;
  
  if (typeof req === 'object') {
    if ('hasStatus' in req) {
      return Effects.hasStatus(fighter, req.hasStatus);
    }
    if ('hasNotStatus' in req) {
      return !Effects.hasStatus(fighter, req.hasNotStatus);
    }
    if ('healthAbove' in req) {
      return fighter.health > req.healthAbove;
    }
    if ('healthBelow' in req) {
      return fighter.health < req.healthBelow;
    }
  }
  
  return true;
}

/**
 * Validate if an action can be performed
 */
export function validateAction(
  state: BattleState,
  intent: ActionIntent
): { valid: boolean; reason?: string } {
  const user = Utils.getFighter(state, intent.userSlot);
  if (!user) {
    return { valid: false, reason: 'User not found' };
  }
  
  if (!user.alive) {
    return { valid: false, reason: 'User is dead' };
  }
  
  const skill = Utils.getSkill(user, intent.skillIndex);
  if (!skill) {
    return { valid: false, reason: 'Skill not found' };
  }
  
  // Check cooldown
  if (Cooldown.isOnCooldown(user, skill)) {
    return { valid: false, reason: 'Skill is on cooldown' };
  }
  
  // Check charges
  if (!Cooldown.hasCharges(user, skill)) {
    return { valid: false, reason: 'No charges remaining' };
  }
  
  // Check requirement
  if (!checkRequirement(user, skill)) {
    return { valid: false, reason: 'Requirement not met' };
  }
  
  // Check stun
  if (!Effects.canUseSkillClass(user, skill.classes)) {
    return { valid: false, reason: 'User is stunned' };
  }
  
  // Check energy (get player's energy based on slot)
  const energy = isPlayerSlot(user.slot) ? state.playerEnergy : state.opponentEnergy;
  if (!Utils.canAfford(energy, skill.cost)) {
    return { valid: false, reason: 'Not enough energy' };
  }
  
  // Check target validity
  const target = Utils.getFighter(state, intent.targetSlot);
  if (!target) {
    return { valid: false, reason: 'Target not found' };
  }
  
  // Validate target based on skill's target type
  const targetValid = validateTarget(user, target, skill);
  if (!targetValid.valid) {
    return targetValid;
  }
  
  return { valid: true };
}

/**
 * Validate if a target is valid for a skill
 */
export function validateTarget(
  user: Fighter,
  target: Fighter,
  skill: Skill
): { valid: boolean; reason?: string } {
  // Get primary target type from skill effects
  const targetTypes = new Set<TargetType>();
  for (const effect of [...skill.start, ...skill.effects]) {
    targetTypes.add(effect.target);
  }
  
  // If skill only targets self, any click is fine
  if (targetTypes.size === 1 && targetTypes.has('self')) {
    return { valid: true };
  }
  
  // Check if target is valid based on what the skill can target
  const isAlly = areAllies(user.slot, target.slot);
  const isSelf = user.slot === target.slot;
  
  // Check for ally-only skills
  const allyTargets: TargetType[] = ['ally', 'allies', 'xAlly', 'xAllies', 'rAlly', 'rXAlly'];
  const onlyTargetsAllies = [...targetTypes].every(t => allyTargets.includes(t) || t === 'self');
  if (onlyTargetsAllies && !isAlly) {
    return { valid: false, reason: 'Skill only targets allies' };
  }
  
  // Check for enemy-only skills
  const enemyTargets: TargetType[] = ['enemy', 'enemies', 'xEnemies', 'rEnemy'];
  const onlyTargetsEnemies = [...targetTypes].every(t => enemyTargets.includes(t));
  if (onlyTargetsEnemies && isAlly) {
    return { valid: false, reason: 'Skill only targets enemies' };
  }
  
  // Check target is alive (unless skill has necromancy)
  if (!target.alive && !skill.classes.includes('all')) { // 'all' as placeholder for necromancy
    return { valid: false, reason: 'Target is dead' };
  }
  
  return { valid: true };
}

// =============================================================================
// ACTION EXECUTION
// =============================================================================

/**
 * Execute an action and return the new state
 */
export function executeAction(
  state: BattleState,
  intent: ActionIntent,
  rng: Utils.DeterministicRandom
): { state: BattleState; execution: ActionExecution } {
  // Validate the action
  const validation = validateAction(state, intent);
  if (!validation.valid) {
    return {
      state,
      execution: {
        intent,
        success: false,
        reason: validation.reason,
        effects: [],
      },
    };
  }
  
  let newState = Utils.cloneState(state);
  const user = Utils.getFighter(newState, intent.userSlot)!;
  const skill = Utils.getSkill(user, intent.skillIndex)!;
  const target = Utils.getFighter(newState, intent.targetSlot)!;
  const appliedEffects: AppliedEffect[] = [];
  
  // Log action start
  newState = Utils.addLog(newState, Utils.createLogEvent(
    newState,
    'action_start',
    `${user.name} uses ${skill.name} on ${target.name}`,
    { source: user.slot, target: target.slot, skillName: skill.name }
  ));
  
  // Pay energy cost
  const isPlayer = isPlayerSlot(user.slot);
  if (isPlayer) {
    newState = {
      ...newState,
      playerEnergy: Utils.payEnergy(newState.playerEnergy, skill.cost, rng),
    };
  } else {
    newState = {
      ...newState,
      opponentEnergy: Utils.payEnergy(newState.opponentEnergy, skill.cost, rng),
    };
  }
  
  // Log energy spend
  newState = Utils.addLog(newState, Utils.createLogEvent(
    newState,
    'energy_spend',
    `${user.name} spends energy`,
    { source: user.slot }
  ));
  
  // Check for counters/reflects on target
  const counterResult = checkCountersAndReflects(newState, user, target, skill, rng);
  if (counterResult.blocked) {
    newState = counterResult.state;
    return {
      state: newState,
      execution: {
        intent,
        success: false,
        reason: counterResult.reason,
        effects: [],
      },
    };
  }
  newState = counterResult.state;
  
  // Check invulnerability
  if (!skill.classes.includes('bypassing') && !Effects.hasEffect(user, 'bypass')) {
    if (Effects.isInvulnerable(target, skill.classes)) {
      newState = Utils.addLog(newState, Utils.createLogEvent(
        newState,
        'action_blocked',
        `${target.name} is invulnerable to ${skill.name}`,
        { source: user.slot, target: target.slot, skillName: skill.name }
      ));
      
      // Still update cooldowns/charges even if blocked
      newState = applyActionCosts(newState, user.slot, skill);
      
      return {
        state: newState,
        execution: {
          intent,
          success: false,
          reason: 'Target is invulnerable',
          effects: [],
        },
      };
    }
  }
  
  // Create action context
  const context: ActionContext = {
    state: newState,
    user: user.slot,
    target: target.slot,
    skill,
    isNew: true,
    continues: false,
  };
  
  // Apply skill effects
  const result = applySkillEffects(newState, context, rng);
  newState = result.state;
  appliedEffects.push(...result.effects);
  
  // Update cooldowns and charges
  newState = applyActionCosts(newState, user.slot, skill);
  
  // Mark user as having acted
  newState = Utils.updateFighter(newState, user.slot, f => ({ ...f, acted: true, lastSkill: skill }));
  
  return {
    state: newState,
    execution: {
      intent,
      success: true,
      effects: appliedEffects,
    },
  };
}

/**
 * Apply cooldown and charge costs for using a skill
 */
function applyActionCosts(state: BattleState, userSlot: number, skill: Skill): BattleState {
  return Utils.updateFighter(state, userSlot, user => {
    let updated = user;
    
    // Update cooldown
    if (skill.cooldown > 0) {
      updated = Cooldown.updateCooldown(updated, skill);
    }
    
    // Spend charge
    if (skill.charges > 0) {
      updated = Cooldown.spendCharge(updated, skill);
    }
    
    return updated;
  });
}

/**
 * Check for counter and reflect effects before action resolves
 */
function checkCountersAndReflects(
  state: BattleState,
  user: Fighter,
  target: Fighter,
  skill: Skill,
  rng: Utils.DeterministicRandom
): { state: BattleState; blocked: boolean; reason?: string } {
  let newState = state;
  
  // Check if user has anti-counter
  if (Effects.hasEffect(user, 'bypass')) { // Using bypass as anti-counter for simplicity
    return { state: newState, blocked: false };
  }
  
  // Check uncounterable
  if (skill.classes.includes('uncounterable')) {
    return { state: newState, blocked: false };
  }
  
  // Check target has counter
  if (Effects.hasCounter(target) && !areAllies(user.slot, target.slot)) {
    newState = Utils.addLog(newState, Utils.createLogEvent(
      newState,
      'action_countered',
      `${target.name} counters ${user.name}'s ${skill.name}`,
      { source: target.slot, target: user.slot, skillName: skill.name }
    ));
    
    // Remove counter effect
    newState = Utils.updateFighter(newState, target.slot, t => ({
      ...t,
      statuses: t.statuses.filter(s => !s.effects.some(e => e.type === 'counter')),
    }));
    
    return { state: newState, blocked: true, reason: 'Action was countered' };
  }
  
  // Check reflect
  if (!skill.classes.includes('unreflectable') && Effects.canReflect(target, skill.classes)) {
    newState = Utils.addLog(newState, Utils.createLogEvent(
      newState,
      'action_reflected',
      `${target.name} reflects ${user.name}'s ${skill.name}`,
      { source: target.slot, target: user.slot, skillName: skill.name }
    ));
    
    // Remove reflect effect
    newState = Utils.updateFighter(newState, target.slot, t => ({
      ...t,
      statuses: t.statuses.filter(s => !s.effects.some(e => e.type === 'reflect')),
    }));
    
    return { state: newState, blocked: true, reason: 'Action was reflected' };
  }
  
  return { state: newState, blocked: false };
}

// =============================================================================
// SKILL EFFECT APPLICATION
// =============================================================================

/**
 * Apply all effects from a skill
 */
function applySkillEffects(
  state: BattleState,
  context: ActionContext,
  rng: Utils.DeterministicRandom
): { state: BattleState; effects: AppliedEffect[] } {
  let newState = state;
  const appliedEffects: AppliedEffect[] = [];
  
  // Get skill effects to apply
  const effectsToApply = context.isNew ? context.skill.start : context.skill.effects;
  
  // Also apply ongoing effects for non-instant skills
  if (context.isNew && context.skill.channelType !== 'instant') {
    effectsToApply.push(...context.skill.effects);
  }
  
  // Resolve each effect
  for (const skillEffect of effectsToApply) {
    const targets = resolveTargets(newState, context, skillEffect.target, rng);
    
    for (const targetSlot of targets) {
      const effectContext: ActionContext = {
        ...context,
        state: newState,
        target: targetSlot,
      };
      
      // Check if target is valid (alive, not invulnerable, etc.)
      const targetFighter = Utils.getFighter(newState, targetSlot);
      if (!targetFighter || !targetFighter.alive) continue;
      
      // Apply the effect
      skillEffect.apply(effectContext);
      
      // Since effects modify state through context, we need to sync
      newState = effectContext.state;
    }
  }
  
  return { state: newState, effects: appliedEffects };
}

/**
 * Resolve target type to actual slot(s)
 */
function resolveTargets(
  state: BattleState,
  context: ActionContext,
  targetType: TargetType,
  rng: Utils.DeterministicRandom
): number[] {
  const user = context.user;
  const clickedTarget = context.target;
  
  switch (targetType) {
    case 'self':
      return [user];
      
    case 'ally':
      // If clicked target is an ally, use them
      if (areAllies(user, clickedTarget)) {
        return [clickedTarget];
      }
      return [];
      
    case 'xAlly':
      // Clicked ally, not self
      if (user !== clickedTarget && areAllies(user, clickedTarget)) {
        return [clickedTarget];
      }
      return [];
      
    case 'allies':
      return getAllySlots(user)
        .filter(s => Utils.getFighter(state, s)?.alive);
      
    case 'xAllies':
      return getAllySlots(user)
        .filter(s => s !== user && Utils.getFighter(state, s)?.alive);
      
    case 'rAlly':
      const allySlots = getAllySlots(user)
        .filter(s => Utils.getFighter(state, s)?.alive);
      const picked = rng.pick(allySlots);
      return picked !== undefined ? [picked] : [];
      
    case 'rXAlly':
      const xAllySlots = getAllySlots(user)
        .filter(s => s !== user && Utils.getFighter(state, s)?.alive);
      const xPicked = rng.pick(xAllySlots);
      return xPicked !== undefined ? [xPicked] : [];
      
    case 'enemy':
      // If clicked target is an enemy, use them
      if (!areAllies(user, clickedTarget)) {
        return [clickedTarget];
      }
      return [];
      
    case 'enemies':
      return getEnemySlots(user)
        .filter(s => Utils.getFighter(state, s)?.alive);
      
    case 'xEnemies':
      return getEnemySlots(user)
        .filter(s => s !== clickedTarget && Utils.getFighter(state, s)?.alive);
      
    case 'rEnemy':
      const enemySlots = getEnemySlots(user)
        .filter(s => Utils.getFighter(state, s)?.alive);
      const ePicked = rng.pick(enemySlots);
      return ePicked !== undefined ? [ePicked] : [];
      
    case 'everyone':
      return state.fighters.filter(f => f.alive).map(f => f.slot);
      
    default:
      return [];
  }
}

// =============================================================================
// EFFECT BUILDERS (for use in skill definitions)
// =============================================================================

/**
 * Create a damage effect function
 */
export function damage(amount: number, classes: string[] = ['all']): (ctx: ActionContext) => void {
  return (ctx: ActionContext) => {
    const user = Utils.getFighter(ctx.state, ctx.user)!;
    const target = Utils.getFighter(ctx.state, ctx.target)!;
    
    const isPiercing = ctx.skill.classes.includes('piercing') || Effects.hasEffect(user, 'pierce');
    const isAffliction = ctx.skill.classes.includes('affliction');
    
    const finalDamage = Effects.calculateDamage(
      user, target, amount, 
      ctx.skill.classes,
      isPiercing, isAffliction
    );
    
    // Apply to defense first
    const { remainingDamage, newDefenses } = Effects.applyDamageToDefense(target, finalDamage);
    
    // Apply remaining to health
    const newHealth = Effects.adjustHealth(
      { ...target, defense: newDefenses },
      -remainingDamage
    );
    
    // Update state
    ctx.state = Utils.updateFighter(ctx.state, ctx.target, t => ({
      ...t,
      health: newHealth,
      defense: newDefenses,
      alive: newHealth > 0,
    }));
    
    // Log damage
    ctx.state = Utils.addLog(ctx.state, Utils.createLogEvent(
      ctx.state,
      'damage',
      `${user.name}'s ${ctx.skill.name} deals ${finalDamage} damage to ${target.name}`,
      { source: ctx.user, target: ctx.target, skillName: ctx.skill.name, value: finalDamage }
    ));
  };
}

/**
 * Create a heal effect function
 */
export function heal(amount: number): (ctx: ActionContext) => void {
  return (ctx: ActionContext) => {
    const user = Utils.getFighter(ctx.state, ctx.user)!;
    const target = Utils.getFighter(ctx.state, ctx.target)!;
    
    const finalHeal = Effects.calculateHealing(user, target, amount);
    
    if (finalHeal > 0) {
      ctx.state = Utils.updateFighter(ctx.state, ctx.target, t => ({
        ...t,
        health: Math.min(t.maxHealth, t.health + finalHeal),
      }));
      
      ctx.state = Utils.addLog(ctx.state, Utils.createLogEvent(
        ctx.state,
        'heal',
        `${user.name}'s ${ctx.skill.name} heals ${target.name} for ${finalHeal}`,
        { source: ctx.user, target: ctx.target, skillName: ctx.skill.name, value: finalHeal }
      ));
    }
  };
}

/**
 * Create a status effect application function
 */
export function applyStatus(
  name: string,
  duration: number,
  effects: Partial<Effect>[]
): (ctx: ActionContext) => void {
  return (ctx: ActionContext) => {
    const user = Utils.getFighter(ctx.state, ctx.user)!;
    const target = Utils.getFighter(ctx.state, ctx.target)!;
    
    // Check silence (can't apply non-damage effects)
    if (Effects.isSilenced(user) && effects.some(e => e.type !== 'afflict')) {
      return;
    }
    
    const status: Status = {
      name,
      source: ctx.user,
      duration,
      effects: effects.map(e => createEffect({
        type: e.type || 'stun',
        source: ctx.user,
        name,
        ...e,
      })),
      classes: ctx.skill.classes,
      stacks: 1,
      visible: true,
      removable: true,
    };
    
    ctx.state = Utils.updateFighter(ctx.state, ctx.target, t => ({
      ...t,
      statuses: [...t.statuses, status],
      effects: Effects.compileEffects([...t.statuses, status]),
    }));
    
    ctx.state = Utils.addLog(ctx.state, Utils.createLogEvent(
      ctx.state,
      'effect_applied',
      `${user.name}'s ${ctx.skill.name} applies ${name} to ${target.name}`,
      { source: ctx.user, target: ctx.target, skillName: ctx.skill.name, effectName: name }
    ));
  };
}

/**
 * Create a stun effect function
 */
export function stun(duration: number, classes: string[] = ['all']): (ctx: ActionContext) => void {
  return applyStatus('Stunned', duration, [{
    type: 'stun',
    duration,
    classes: classes as any,
  }]);
}

/**
 * Create an invulnerability effect function
 */
export function invulnerable(duration: number, classes: string[] = ['all']): (ctx: ActionContext) => void {
  return applyStatus('Invulnerable', duration, [{
    type: 'invulnerable',
    duration,
    classes: classes as any,
  }]);
}

/**
 * Create a defense effect function  
 */
export function defense(name: string, amount: number): (ctx: ActionContext) => void {
  return (ctx: ActionContext) => {
    ctx.state = Utils.updateFighter(ctx.state, ctx.target, t => ({
      ...t,
      defense: [...t.defense, { name, amount, source: ctx.user }],
    }));
    
    ctx.state = Utils.addLog(ctx.state, Utils.createLogEvent(
      ctx.state,
      'effect_applied',
      `${ctx.skill.name} grants ${amount} defense`,
      { source: ctx.user, target: ctx.target, skillName: ctx.skill.name, effectName: name, value: amount }
    ));
  };
}
