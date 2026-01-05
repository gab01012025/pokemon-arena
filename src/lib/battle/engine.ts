/**
 * Pokemon Arena Battle Engine
 * Based on Naruto Arena/Naruto Unison mechanics
 */

import {
  GameState,
  PlayerState,
  BattleCharacter,
  BattleAction,
  BattleLogEntry,
  Effect,
  Status,
  Skill,
  Energy,
  EMPTY_ENERGY,
  SkillClass,
  canAfford,
  spendEnergy,
  isHelpful,
} from './types';

// ============== TURN EXECUTION ==============

export function processTurn(state: GameState): GameState {
  let newState = { ...state };
  
  // Phase 1: Execute queued actions in order (alternating)
  const p1Actions = [...newState.queuedActions.player1];
  const p2Actions = [...newState.queuedActions.player2];
  
  // Interleave actions
  const maxActions = Math.max(p1Actions.length, p2Actions.length);
  
  for (let i = 0; i < maxActions; i++) {
    // Player 1 action
    if (p1Actions[i]) {
      newState = executeAction(newState, p1Actions[i], 1);
    }
    // Player 2 action
    if (p2Actions[i]) {
      newState = executeAction(newState, p2Actions[i], 2);
    }
  }
  
  // Phase 2: Process status effects (affliction, heal over time, etc.)
  newState = processStatusEffects(newState);
  
  // Phase 3: Check deaths
  newState = processDeaths(newState);
  
  // Phase 4: Decrement durations
  newState = decrementDurations(newState);
  
  // Phase 5: Generate energy for next turn
  newState = generateEnergy(newState);
  
  // Phase 6: Check victory
  newState = checkVictory(newState);
  
  // Phase 7: Advance turn
  if (newState.status === 'active') {
    newState.turn += 1;
    newState.queuedActions = { player1: [], player2: [] };
    newState.turnDeadline = Date.now() + 90000;
    
    // Reset acted flags
    newState.player1.team.forEach(c => c.acted = false);
    newState.player2.team.forEach(c => c.acted = false);
    newState.player1.exchangedThisTurn = false;
    newState.player2.exchangedThisTurn = false;
  }
  
  return newState;
}

// ============== ACTION EXECUTION ==============

function executeAction(state: GameState, action: BattleAction, player: 1 | 2): GameState {
  const newState = { ...state };
  const playerState = player === 1 ? newState.player1 : newState.player2;
  const opponentState = player === 1 ? newState.player2 : newState.player1;
  
  // Get acting character
  const character = getCharacterBySlot(newState, action.user);
  if (!character || !character.alive) return state;
  
  // Check if stunned
  const skill = character.skills[action.skillIndex];
  if (!skill) return state;
  
  for (const skillClass of skill.classes) {
    if (isCharacterStunned(character, skillClass)) {
      addLog(newState, {
        turn: state.turn,
        action: 'system',
        source: character.name,
        message: `${character.name} is stunned and cannot use ${skill.name}!`,
      });
      return state;
    }
  }
  
  // Check cooldown
  if (skill.currentCooldown > 0) return state;
  
  // Check cost
  if (!canAfford(playerState.energy, skill.cost)) return state;
  
  // Spend energy
  playerState.energy = spendEnergy(playerState.energy, skill.cost);
  
  // Set cooldown
  skill.currentCooldown = skill.cooldown;
  
  // Mark as acted
  character.acted = true;
  
  // Log the action
  addLog(newState, {
    turn: state.turn,
    action: 'skill',
    source: character.name,
    skill: skill.name,
    message: `${character.name} uses ${skill.name}!`,
  });
  
  // Execute effects on each target
  for (const targetSlot of action.targets) {
    const target = getCharacterBySlot(newState, targetSlot);
    if (!target) continue;
    
    // Check invulnerability
    let blocked = false;
    for (const skillClass of skill.classes) {
      if (isCharacterInvulnerable(target, skillClass)) {
        blocked = true;
        break;
      }
    }
    
    // Check reflect
    const reflectStatus = target.statuses.find(s => 
      s.effects.some(e => e.type === 'reflect')
    );
    
    if (reflectStatus && !isHelpfulSkill(skill)) {
      // Reflect the skill back
      const reflectTarget = character;
      removeStatus(target, reflectStatus.name);
      
      addLog(newState, {
        turn: state.turn,
        action: 'system',
        source: target.name,
        target: character.name,
        message: `${target.name} reflects ${skill.name} back to ${character.name}!`,
      });
      
      applySkillEffects(newState, skill, character, reflectTarget, player);
      continue;
    }
    
    // Check counter
    const counterStatus = target.statuses.find(s =>
      s.effects.some(e => e.type === 'counter')
    );
    
    if (counterStatus && !isHelpfulSkill(skill) && !blocked) {
      // Apply counter damage
      const counterEffect = counterStatus.effects.find(e => e.type === 'counter');
      if (counterEffect) {
        dealDamage(newState, target, character, counterEffect.value, 'counter');
      }
    }
    
    if (blocked) {
      addLog(newState, {
        turn: state.turn,
        action: 'system',
        target: target.name,
        message: `${target.name} is invulnerable to ${skill.name}!`,
      });
      continue;
    }
    
    // Apply effects
    applySkillEffects(newState, skill, character, target, player);
  }
  
  return newState;
}

// ============== EFFECT APPLICATION ==============

function applySkillEffects(
  state: GameState,
  skill: Skill,
  user: BattleCharacter,
  target: BattleCharacter,
  player: 1 | 2
): void {
  for (const effect of skill.effects) {
    // Check chance
    if (effect.chance && Math.random() * 100 > effect.chance) {
      continue;
    }
    
    applyEffect(state, effect, skill, user, target, player);
  }
}

function applyEffect(
  state: GameState,
  effect: Effect,
  skill: Skill,
  user: BattleCharacter,
  target: BattleCharacter,
  player: 1 | 2
): void {
  switch (effect.type) {
    case 'damage':
      dealDamage(state, user, target, effect.value, skill.name);
      break;
      
    case 'pierce':
      dealDamage(state, user, target, effect.value, skill.name, true);
      break;
      
    case 'afflict':
      // Affliction is added as a status that deals damage each turn
      addStatus(target, {
        name: `${skill.name} (Affliction)`,
        effects: [{ ...effect, type: 'afflict' }],
        duration: effect.duration,
        user: user.slot,
        classes: skill.classes,
        removable: true,
        visible: true,
        helpful: false,
      });
      break;
      
    case 'heal':
      healCharacter(state, target, effect.value);
      break;
      
    case 'healOverTime':
      addStatus(target, {
        name: `${skill.name} (Healing)`,
        effects: [{ ...effect }],
        duration: effect.duration,
        user: user.slot,
        classes: skill.classes,
        removable: true,
        visible: true,
        helpful: true,
      });
      break;
      
    case 'stun':
    case 'silence':
    case 'expose':
    case 'weaken':
    case 'strengthen':
    case 'reduce':
    case 'bleed':
    case 'invulnerable':
    case 'reflect':
    case 'counter':
    case 'endure':
    case 'enrage':
    case 'focus':
    case 'seal':
    case 'plague':
    case 'taunt':
    case 'snare':
      // These are status effects that persist
      addStatus(target, {
        name: skill.name,
        effects: [{ ...effect }],
        duration: effect.duration,
        user: user.slot,
        classes: skill.classes,
        removable: !['reflect'].includes(effect.type),
        visible: true,
        helpful: isHelpful(effect),
      });
      recalculateEffects(target);
      break;
      
    case 'recoil':
      // Damage to self
      dealDamage(state, user, user, effect.value, 'Recoil', false, true);
      break;
  }
}

// ============== DAMAGE CALCULATION ==============

function dealDamage(
  state: GameState,
  source: BattleCharacter,
  target: BattleCharacter,
  baseDamage: number,
  skillName: string,
  piercing: boolean = false,
  isRecoil: boolean = false
): void {
  let damage = baseDamage;
  
  // Apply source's damage bonus
  if (!isRecoil) {
    damage = Math.floor(damage * (1 + source.cachedEffects.damageBonus / 100));
  }
  
  // Apply target's damage reduction (unless piercing)
  if (!piercing) {
    damage = Math.max(1, damage - target.cachedEffects.damageReduction);
  }
  
  // Check barrier first
  if (target.barrier > 0 && !piercing) {
    const barrierDamage = Math.min(target.barrier, damage);
    target.barrier -= barrierDamage;
    damage -= barrierDamage;
    
    if (barrierDamage > 0) {
      addLog(state, {
        turn: state.turn,
        action: 'system',
        target: target.name,
        value: barrierDamage,
        message: `${target.name}'s barrier absorbs ${barrierDamage} damage!`,
      });
    }
  }
  
  // Check endure
  const hasEndure = target.statuses.some(s => 
    s.effects.some(e => e.type === 'endure')
  );
  
  if (hasEndure && target.health - damage <= 0) {
    damage = target.health - 1;
  }
  
  // Apply damage
  target.health = Math.max(0, target.health - damage);
  
  if (damage > 0) {
    addLog(state, {
      turn: state.turn,
      action: 'damage',
      source: skillName,
      target: target.name,
      value: damage,
      message: `${target.name} takes ${damage} damage!`,
    });
  }
  
  // Check death
  if (target.health <= 0) {
    target.alive = false;
  }
}

function healCharacter(state: GameState, target: BattleCharacter, amount: number): void {
  // Check plague (cannot be healed)
  const hasPlague = target.statuses.some(s =>
    s.effects.some(e => e.type === 'plague')
  );
  
  if (hasPlague) {
    addLog(state, {
      turn: state.turn,
      action: 'system',
      target: target.name,
      message: `${target.name} cannot be healed!`,
    });
    return;
  }
  
  const oldHealth = target.health;
  target.health = Math.min(target.maxHealth, target.health + amount);
  const healed = target.health - oldHealth;
  
  if (healed > 0) {
    addLog(state, {
      turn: state.turn,
      action: 'heal',
      target: target.name,
      value: healed,
      message: `${target.name} recovers ${healed} HP!`,
    });
  }
}

// ============== STATUS MANAGEMENT ==============

function addStatus(character: BattleCharacter, status: Status): void {
  // Check for existing status with same name
  const existing = character.statuses.findIndex(s => s.name === status.name);
  
  if (existing >= 0) {
    // Refresh duration if longer
    if (status.duration > character.statuses[existing].duration) {
      character.statuses[existing].duration = status.duration;
    }
  } else {
    character.statuses.push(status);
  }
  
  recalculateEffects(character);
}

function removeStatus(character: BattleCharacter, statusName: string): void {
  character.statuses = character.statuses.filter(s => s.name !== statusName);
  recalculateEffects(character);
}

function recalculateEffects(character: BattleCharacter): void {
  // Reset cached effects
  character.cachedEffects = {
    stunned: [],
    invulnerable: [],
    damageReduction: 0,
    damageBonus: 0,
    healingReduction: 0,
  };
  
  // Check for enrage (ignore harmful effects)
  const hasEnrage = character.statuses.some(s =>
    s.effects.some(e => e.type === 'enrage')
  );
  
  // Check for focus (ignore stuns)
  const hasFocus = character.statuses.some(s =>
    s.effects.some(e => e.type === 'focus')
  );
  
  for (const status of character.statuses) {
    for (const effect of status.effects) {
      // Skip harmful effects if has enrage
      if (hasEnrage && !isHelpful(effect)) continue;
      
      switch (effect.type) {
        case 'stun':
          if (!hasFocus) {
            character.cachedEffects.stunned.push(...(effect.classes || ['All']));
          }
          break;
          
        case 'invulnerable':
          character.cachedEffects.invulnerable.push(...(effect.classes || ['All']));
          break;
          
        case 'reduce':
          character.cachedEffects.damageReduction += effect.value;
          break;
          
        case 'strengthen':
          character.cachedEffects.damageBonus += effect.value;
          break;
          
        case 'weaken':
          character.cachedEffects.damageBonus -= effect.value;
          break;
          
        case 'bleed':
          character.cachedEffects.damageReduction -= effect.value;
          break;
      }
    }
  }
}

// ============== TURN PHASES ==============

function processStatusEffects(state: GameState): GameState {
  const allCharacters = [...state.player1.team, ...state.player2.team];
  
  for (const character of allCharacters) {
    if (!character.alive) continue;
    
    for (const status of character.statuses) {
      for (const effect of status.effects) {
        switch (effect.type) {
          case 'afflict':
            dealDamage(state, character, character, effect.value, status.name, false, true);
            break;
            
          case 'healOverTime':
            healCharacter(state, character, effect.value);
            break;
        }
      }
    }
  }
  
  return state;
}

function processDeaths(state: GameState): GameState {
  const allCharacters = [...state.player1.team, ...state.player2.team];
  
  for (const character of allCharacters) {
    if (character.health <= 0 && character.alive) {
      character.alive = false;
      
      addLog(state, {
        turn: state.turn,
        action: 'death',
        target: character.name,
        message: `${character.name} has been defeated!`,
      });
    }
  }
  
  return state;
}

function decrementDurations(state: GameState): GameState {
  const allCharacters = [...state.player1.team, ...state.player2.team];
  
  for (const character of allCharacters) {
    // Decrement status durations
    character.statuses = character.statuses.filter(status => {
      if (status.duration === -1) return true; // Permanent
      status.duration -= 1;
      return status.duration > 0;
    });
    
    // Recalculate effects after removing expired statuses
    recalculateEffects(character);
    
    // Decrement skill cooldowns
    for (const skill of character.skills) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown -= 1;
      }
    }
  }
  
  return state;
}

function generateEnergy(state: GameState): GameState {
  // Each turn, gain 1 random energy
  const energyTypes: (keyof Energy)[] = ['fire', 'water', 'grass', 'electric'];
  
  // Player 1
  const p1Type = energyTypes[Math.floor(Math.random() * energyTypes.length)];
  state.player1.energy[p1Type] += 1;
  
  // Player 2
  const p2Type = energyTypes[Math.floor(Math.random() * energyTypes.length)];
  state.player2.energy[p2Type] += 1;
  
  return state;
}

function checkVictory(state: GameState): GameState {
  const p1Alive = state.player1.team.some(c => c.alive);
  const p2Alive = state.player2.team.some(c => c.alive);
  
  if (!p1Alive && !p2Alive) {
    state.status = 'finished';
    state.victor = 'draw';
  } else if (!p1Alive) {
    state.status = 'finished';
    state.victor = 2;
  } else if (!p2Alive) {
    state.status = 'finished';
    state.victor = 1;
  }
  
  return state;
}

// ============== UTILITY FUNCTIONS ==============

function getCharacterBySlot(state: GameState, slot: number): BattleCharacter | null {
  if (slot < 3) {
    return state.player1.team[slot] || null;
  }
  return state.player2.team[slot - 3] || null;
}

function isCharacterStunned(character: BattleCharacter, skillClass: SkillClass): boolean {
  return character.cachedEffects.stunned.includes(skillClass) ||
         character.cachedEffects.stunned.includes('All');
}

function isCharacterInvulnerable(character: BattleCharacter, skillClass: SkillClass): boolean {
  return character.cachedEffects.invulnerable.includes(skillClass) ||
         character.cachedEffects.invulnerable.includes('All');
}

function isHelpfulSkill(skill: Skill): boolean {
  return skill.effects.every(e => isHelpful(e));
}

function addLog(state: GameState, entry: BattleLogEntry): void {
  state.log.push(entry);
  // Keep only last 100 entries
  if (state.log.length > 100) {
    state.log = state.log.slice(-100);
  }
}

// ============== ENERGY EXCHANGE ==============

export function exchangeEnergy(
  state: GameState,
  player: 1 | 2,
  from: keyof Energy,
  to: keyof Energy
): GameState {
  const playerState = player === 1 ? state.player1 : state.player2;
  
  if (playerState.exchangedThisTurn) {
    return state;
  }
  
  if (playerState.energy[from] <= 0) {
    return state;
  }
  
  playerState.energy[from] -= 1;
  playerState.energy.random += 1; // Becomes random
  playerState.exchangedThisTurn = true;
  
  return state;
}

// ============== FORFEIT ==============

export function forfeit(state: GameState, player: 1 | 2): GameState {
  const playerTeam = player === 1 ? state.player1.team : state.player2.team;
  
  for (const character of playerTeam) {
    character.health = 0;
    character.alive = false;
  }
  
  state.status = 'finished';
  state.victor = player === 1 ? 2 : 1;
  state.forfeit = true;
  
  return state;
}

// ============== EXPORT ==============

export {
  getCharacterBySlot,
  addStatus,
  removeStatus,
  recalculateEffects,
};
