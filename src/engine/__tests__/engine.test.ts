/**
 * Pokémon Arena - Battle Engine Unit Tests
 * 
 * Tests for the deterministic battle engine.
 * Run with: npx vitest
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Types
  type BattleState,
  type Fighter,
  type Skill,
  type ActionIntent,
  type SkillEffect,
  
  // Factories
  createFighter,
  createSkill,
  createBattleState,
  createEffect,
  ZERO_ENERGY,
  
  // Modules
  Effects,
  Cooldown,
  DeterministicRandom,
  
  // Actions
  validateAction,
  executeAction,
  damage,
  heal,
  stun,
  invulnerable,
  defense,
  applyStatus,
  
  // Turn Resolution
  resolveTurn,
  
  // Utilities
  getFighter,
  updateFighter,
  cloneState,
} from '../index';

// =============================================================================
// TEST HELPERS
// =============================================================================

/**
 * Create a simple test skill
 */
function createTestSkill(
  name: string,
  owner: number,
  effects: SkillEffect[] = []
): Skill {
  return createSkill({
    name,
    owner,
    description: `Test skill: ${name}`,
    cost: { fire: 1, water: 0, grass: 0, electric: 0, random: 0 },
    cooldown: 1,
    start: effects,
    effects: [],
  });
}

/**
 * Create a test fighter with basic skills
 */
function createTestFighter(slot: number, name: string): Fighter {
  const skills: Skill[] = [
    createTestSkill('Attack', slot, [
      { target: 'enemy', apply: damage(25) },
    ]),
    createTestSkill('Heal', slot, [
      { target: 'self', apply: heal(15) },
    ]),
    createTestSkill('Stun', slot, [
      { target: 'enemy', apply: stun(1) },
    ]),
    createTestSkill('Protect', slot, [
      { target: 'self', apply: invulnerable(1) },
    ]),
  ];
  
  return createFighter({
    slot,
    name,
    skills,
    health: 100,
    maxHealth: 100,
  });
}

/**
 * Create a test battle state
 */
function createTestBattle(): BattleState {
  const playerTeam = [
    createTestFighter(0, 'Pikachu'),
    createTestFighter(1, 'Charizard'),
    createTestFighter(2, 'Blastoise'),
  ];
  
  const opponentTeam = [
    createTestFighter(3, 'Mewtwo'),
    createTestFighter(4, 'Gengar'),
    createTestFighter(5, 'Alakazam'),
  ];
  
  const state = createBattleState(playerTeam, opponentTeam, 12345);
  
  // Give both teams some energy
  return {
    ...state,
    playerEnergy: { fire: 3, water: 2, grass: 2, electric: 1, random: 2 },
    opponentEnergy: { fire: 3, water: 2, grass: 2, electric: 1, random: 2 },
  };
}

// =============================================================================
// TEST 1: STUN VS ACTION
// =============================================================================

describe('Stun vs Action', () => {
  let state: BattleState;
  let rng: DeterministicRandom;
  
  beforeEach(() => {
    state = createTestBattle();
    rng = new DeterministicRandom(12345);
  });
  
  it('should prevent stunned fighter from using skills', () => {
    // Apply stun effect to Pikachu (slot 0)
    const stunEffect = createEffect({
      type: 'stun',
      source: 3,
      name: 'Stunned',
      classes: ['all'],
      duration: 2,
    });
    
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      statuses: [{
        name: 'Stunned',
        source: 3,
        duration: 2,
        effects: [stunEffect],
        classes: ['all'],
        stacks: 1,
        visible: true,
        removable: true,
      }],
      effects: [stunEffect],
    }));
    
    // Try to use a skill with stunned Pikachu
    const intent: ActionIntent = {
      userSlot: 0,
      skillIndex: 0, // Attack
      targetSlot: 3,
    };
    
    const validation = validateAction(state, intent);
    
    expect(validation.valid).toBe(false);
    expect(validation.reason).toBe('User is stunned');
  });
  
  it('should allow non-stunned fighter to use skills', () => {
    // No stun on Pikachu
    const intent: ActionIntent = {
      userSlot: 0,
      skillIndex: 0, // Attack
      targetSlot: 3,
    };
    
    const validation = validateAction(state, intent);
    
    expect(validation.valid).toBe(true);
  });
  
  it('should allow skill if stun type does not match skill class', () => {
    // Apply physical-only stun to Pikachu
    const stunEffect = createEffect({
      type: 'stun',
      source: 3,
      name: 'Physical Stun',
      classes: ['physical'],
      duration: 2,
    });
    
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      statuses: [{
        name: 'Physical Stun',
        source: 3,
        duration: 2,
        effects: [stunEffect],
        classes: ['physical'],
        stacks: 1,
        visible: true,
        removable: true,
      }],
      effects: [stunEffect],
    }));
    
    // Update skill to be 'special' class
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      skills: fighter.skills.map((s, i) => 
        i === 0 ? { ...s, classes: ['special'] as any } : s
      ),
    }));
    
    const intent: ActionIntent = {
      userSlot: 0,
      skillIndex: 0,
      targetSlot: 3,
    };
    
    const validation = validateAction(state, intent);
    
    expect(validation.valid).toBe(true);
  });
  
  it('should decrement stun duration at end of turn', () => {
    // Apply 2-turn stun
    const stunEffect = createEffect({
      type: 'stun',
      source: 3,
      name: 'Stunned',
      classes: ['all'],
      duration: 2,
    });
    
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      statuses: [{
        name: 'Stunned',
        source: 3,
        duration: 2,
        effects: [stunEffect],
        classes: ['all'],
        stacks: 1,
        visible: true,
        removable: true,
      }],
      effects: [stunEffect],
    }));
    
    // Process turn with no actions
    const { state: newState } = resolveTurn(state, [], []);
    
    // Check stun duration decreased
    const fighter = getFighter(newState, 0)!;
    expect(fighter.statuses.length).toBe(1);
    expect(fighter.statuses[0].duration).toBe(1);
    
    // Process another turn
    const { state: finalState } = resolveTurn(newState, [], []);
    
    // Stun should be removed
    const finalFighter = getFighter(finalState, 0)!;
    expect(finalFighter.statuses.length).toBe(0);
  });
});

// =============================================================================
// TEST 2: SHIELD (DEFENSE) VS DAMAGE
// =============================================================================

describe('Destructible Defense vs Damage', () => {
  let state: BattleState;
  let rng: DeterministicRandom;
  
  beforeEach(() => {
    state = createTestBattle();
    rng = new DeterministicRandom(12345);
  });
  
  it('should absorb damage with destructible defense', () => {
    // Give Pikachu 30 defense
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      defense: [{ name: 'Shield', amount: 30, source: 0 }],
    }));
    
    // Simulate 25 damage to Pikachu
    const fighter = getFighter(state, 0)!;
    const { remainingDamage, newDefenses } = Effects.applyDamageToDefense(fighter, 25);
    
    expect(remainingDamage).toBe(0);
    expect(newDefenses.length).toBe(1);
    expect(newDefenses[0].amount).toBe(5);
    expect(fighter.health).toBe(100); // Health unchanged
  });
  
  it('should pass through damage exceeding defense', () => {
    // Give Pikachu 15 defense
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      defense: [{ name: 'Shield', amount: 15, source: 0 }],
    }));
    
    // Simulate 25 damage
    const fighter = getFighter(state, 0)!;
    const { remainingDamage, newDefenses } = Effects.applyDamageToDefense(fighter, 25);
    
    expect(remainingDamage).toBe(10);
    expect(newDefenses.length).toBe(0); // Defense depleted
  });
  
  it('should apply defense skill and block damage', () => {
    // Create a defense skill
    const defenseSkill = createSkill({
      name: 'Barrier',
      owner: 0,
      cost: { fire: 1, water: 0, grass: 0, electric: 0, random: 0 },
      cooldown: 2,
      start: [
        { target: 'self', apply: defense('Barrier', 30) },
      ],
      effects: [],
    });
    
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      skills: [defenseSkill, ...fighter.skills.slice(1)],
    }));
    
    // Use defense skill
    const defenseIntent: ActionIntent = {
      userSlot: 0,
      skillIndex: 0,
      targetSlot: 0,
    };
    
    const { state: afterDefense } = executeAction(state, defenseIntent, rng);
    
    // Check defense was applied
    const defenderAfter = getFighter(afterDefense, 0)!;
    expect(defenderAfter.defense.length).toBe(1);
    expect(defenderAfter.defense[0].amount).toBe(30);
    
    // Now attack with Mewtwo
    const attackSkill = createSkill({
      name: 'Psychic',
      owner: 3,
      cost: { fire: 0, water: 0, grass: 0, electric: 0, random: 1 },
      cooldown: 0,
      start: [
        { target: 'enemy', apply: damage(25) },
      ],
      effects: [],
    });
    
    let newState = updateFighter(afterDefense, 3, fighter => ({
      ...fighter,
      skills: [attackSkill, ...fighter.skills.slice(1)],
    }));
    
    const attackIntent: ActionIntent = {
      userSlot: 3,
      skillIndex: 0,
      targetSlot: 0,
    };
    
    const { state: afterAttack } = executeAction(newState, attackIntent, rng);
    
    // Check defense absorbed damage
    const defenderFinal = getFighter(afterAttack, 0)!;
    expect(defenderFinal.health).toBe(100); // Health should be unchanged
    expect(defenderFinal.defense[0]?.amount || 0).toBe(5); // Defense reduced
  });
  
  it('should stack multiple defense sources', () => {
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      defense: [
        { name: 'Shield 1', amount: 20, source: 0 },
        { name: 'Shield 2', amount: 15, source: 1 },
      ],
    }));
    
    const fighter = getFighter(state, 0)!;
    const totalDefense = Effects.getTotalDefense(fighter);
    
    expect(totalDefense).toBe(35);
    
    // 40 damage should deplete both and deal 5 to health
    const { remainingDamage, newDefenses } = Effects.applyDamageToDefense(fighter, 40);
    
    expect(remainingDamage).toBe(5);
    expect(newDefenses.length).toBe(0);
  });
});

// =============================================================================
// TEST 3: COOLDOWN DECREMENT
// =============================================================================

describe('Cooldown Management', () => {
  let state: BattleState;
  let rng: DeterministicRandom;
  
  beforeEach(() => {
    state = createTestBattle();
    rng = new DeterministicRandom(12345);
  });
  
  it('should apply cooldown after skill use', () => {
    const intent: ActionIntent = {
      userSlot: 0,
      skillIndex: 0, // Attack with cooldown 1
      targetSlot: 3,
    };
    
    const { state: afterAction } = executeAction(state, intent, rng);
    
    const fighter = getFighter(afterAction, 0)!;
    const skill = fighter.skills[0];
    
    // Cooldown should be set (base cooldown + 2 for turn system)
    const cooldown = Cooldown.getCooldown(fighter, skill);
    expect(cooldown).toBeGreaterThan(0);
  });
  
  it('should prevent skill use while on cooldown', () => {
    // Use skill
    const intent: ActionIntent = {
      userSlot: 0,
      skillIndex: 0,
      targetSlot: 3,
    };
    
    const { state: afterAction } = executeAction(state, intent, rng);
    
    // Try to use same skill again
    const validation = validateAction(afterAction, intent);
    
    expect(validation.valid).toBe(false);
    expect(validation.reason).toBe('Skill is on cooldown');
  });
  
  it('should decrement cooldowns at end of turn', () => {
    // Set a cooldown manually
    state = updateFighter(state, 0, fighter => {
      const skill = fighter.skills[0];
      return Cooldown.updateCooldown(fighter, skill);
    });
    
    const fighterBefore = getFighter(state, 0)!;
    const cooldownBefore = Cooldown.getCooldown(fighterBefore, fighterBefore.skills[0]);
    
    // Process turn
    const { state: afterTurn } = resolveTurn(state, [], []);
    
    const fighterAfter = getFighter(afterTurn, 0)!;
    const cooldownAfter = Cooldown.getCooldown(fighterAfter, fighterAfter.skills[0]);
    
    expect(cooldownAfter).toBe(cooldownBefore - 1);
  });
  
  it('should remove cooldown when it reaches 0', () => {
    // Set a cooldown of 1
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      cooldowns: new Map([['Attack:0', 1]]),
    }));
    
    // Process turn
    const { state: afterTurn } = resolveTurn(state, [], []);
    
    const fighter = getFighter(afterTurn, 0)!;
    expect(fighter.cooldowns.size).toBe(0);
  });
  
  it('should increase cooldown with snare effect', () => {
    // Apply snare to Pikachu
    const snareEffect = createEffect({
      type: 'snare',
      source: 3,
      name: 'Snared',
      value: 2, // +2 turns to cooldowns
      duration: 3,
    });
    
    state = updateFighter(state, 0, fighter => ({
      ...fighter,
      statuses: [{
        name: 'Snared',
        source: 3,
        duration: 3,
        effects: [snareEffect],
        classes: ['all'],
        stacks: 1,
        visible: true,
        removable: true,
      }],
      effects: [snareEffect],
    }));
    
    // Check snare value
    const fighter = getFighter(state, 0)!;
    const snare = Effects.getSnare(fighter);
    expect(snare).toBe(2);
    
    // Use skill
    const intent: ActionIntent = {
      userSlot: 0,
      skillIndex: 0,
      targetSlot: 3,
    };
    
    const { state: afterAction } = executeAction(state, intent, rng);
    
    // Cooldown should be increased by snare
    const fighterAfter = getFighter(afterAction, 0)!;
    const skill = fighterAfter.skills[0];
    const cooldown = Cooldown.getCooldown(fighterAfter, skill);
    
    // Expected: base (1) + 2 (turn system) + 2*snare (4) = 7
    expect(cooldown).toBe(7);
  });
});

// =============================================================================
// ADDITIONAL TESTS
// =============================================================================

describe('Deterministic Random', () => {
  it('should produce same sequence with same seed', () => {
    const rng1 = new DeterministicRandom(12345);
    const rng2 = new DeterministicRandom(12345);
    
    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });
  
  it('should produce different sequences with different seeds', () => {
    const rng1 = new DeterministicRandom(12345);
    const rng2 = new DeterministicRandom(54321);
    
    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());
    
    expect(sequence1).not.toEqual(sequence2);
  });
});

describe('Battle Resolution', () => {
  it('should resolve a complete turn', () => {
    const state = createTestBattle();
    
    const playerIntents: ActionIntent[] = [
      { userSlot: 0, skillIndex: 0, targetSlot: 3 }, // Pikachu attacks Mewtwo
    ];
    
    const opponentIntents: ActionIntent[] = [
      { userSlot: 3, skillIndex: 0, targetSlot: 0 }, // Mewtwo attacks Pikachu
    ];
    
    const { state: afterTurn, log } = resolveTurn(state, playerIntents, opponentIntents);
    
    // Turn should have advanced
    expect(afterTurn.turnNumber).toBe(2);
    
    // Actions should have been logged
    expect(log.length).toBeGreaterThan(0);
    
    // Damage should have been dealt
    const pikachu = getFighter(afterTurn, 0)!;
    const mewtwo = getFighter(afterTurn, 3)!;
    
    expect(pikachu.health).toBeLessThan(100);
    expect(mewtwo.health).toBeLessThan(100);
  });
  
  it('should detect victory when all opponents are defeated', () => {
    let state = createTestBattle();
    
    // Set opponents to 1 HP
    for (let i = 3; i <= 5; i++) {
      state = updateFighter(state, i, f => ({ ...f, health: 1 }));
    }
    
    // Create powerful attack skill
    const powerfulSkill = createSkill({
      name: 'Hyper Beam',
      owner: 0,
      cost: ZERO_ENERGY,
      cooldown: 0,
      start: [
        { target: 'enemies', apply: damage(100) },
      ],
      effects: [],
    });
    
    state = updateFighter(state, 0, f => ({
      ...f,
      skills: [powerfulSkill, ...f.skills.slice(1)],
    }));
    
    const { state: afterTurn } = resolveTurn(
      state,
      [{ userSlot: 0, skillIndex: 0, targetSlot: 3 }],
      []
    );
    
    expect(afterTurn.victor).toBe('player');
  });
});
