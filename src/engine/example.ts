/**
 * Pokémon Arena - Battle Engine Usage Example
 * 
 * This file demonstrates how to use the battle engine to:
 * 1. Create fighters with skills
 * 2. Initialize a battle
 * 3. Process turns
 * 4. Check victory conditions
 */

import {
  // Types
  type Fighter,
  type Skill,
  type ActionIntent,
  type BattleState,
  type SkillEffect,
  
  // Factories
  createFighter,
  createSkill,
  createBattleState,
  ZERO_ENERGY,
  
  // Turn Resolution
  resolveTurn,
  
  // Effect Builders
  damage,
  heal,
  stun,
  invulnerable,
  defense,
  applyStatus,
  
  // Utilities
  getFighter,
} from './index';

// =============================================================================
// STEP 1: DEFINE SKILLS
// =============================================================================

/**
 * Helper to create a skill with damage
 */
function createAttackSkill(
  name: string,
  owner: number,
  damageAmount: number,
  cost: { fire?: number; water?: number; grass?: number; electric?: number; random?: number },
  cooldown: number = 0
): Skill {
  return createSkill({
    name,
    owner,
    description: `Deals ${damageAmount} damage to one enemy.`,
    cost: { fire: 0, water: 0, grass: 0, electric: 0, random: 0, ...cost },
    cooldown,
    start: [
      { target: 'enemy', apply: damage(damageAmount) },
    ],
    effects: [],
  });
}

/**
 * Create Pikachu's skill set
 */
function createPikachuSkills(slot: number): Skill[] {
  return [
    // Skill 1: Thunderbolt - High damage, electric cost
    createSkill({
      name: 'Thunderbolt',
      owner: slot,
      description: 'A strong electric attack that deals 30 damage.',
      cost: { fire: 0, water: 0, grass: 0, electric: 2, random: 0 },
      cooldown: 1,
      classes: ['special'],
      start: [
        { target: 'enemy', apply: damage(30) },
      ],
      effects: [],
    }),
    
    // Skill 2: Quick Attack - Low cost, low damage
    createSkill({
      name: 'Quick Attack',
      owner: slot,
      description: 'A fast attack that deals 15 damage. Has priority.',
      cost: { fire: 0, water: 0, grass: 0, electric: 0, random: 1 },
      cooldown: 0,
      classes: ['physical'],
      start: [
        { target: 'enemy', apply: damage(15) },
      ],
      effects: [],
    }),
    
    // Skill 3: Thunder Wave - Stun enemy
    createSkill({
      name: 'Thunder Wave',
      owner: slot,
      description: 'Paralyzes the enemy, stunning them for 1 turn.',
      cost: { fire: 0, water: 0, grass: 0, electric: 1, random: 0 },
      cooldown: 2,
      classes: ['special'],
      start: [
        { target: 'enemy', apply: stun(1, ['physical']) },
      ],
      effects: [],
    }),
    
    // Skill 4: Agility - Become invulnerable
    createSkill({
      name: 'Agility',
      owner: slot,
      description: 'Becomes invulnerable for 1 turn.',
      cost: { fire: 0, water: 0, grass: 0, electric: 1, random: 0 },
      cooldown: 3,
      classes: ['mental'],
      start: [
        { target: 'self', apply: invulnerable(1, ['physical', 'special']) },
      ],
      effects: [],
    }),
  ];
}

/**
 * Create Mewtwo's skill set
 */
function createMewtwoSkills(slot: number): Skill[] {
  return [
    // Skill 1: Psystrike - High damage
    createSkill({
      name: 'Psystrike',
      owner: slot,
      description: 'A devastating psychic attack that deals 35 damage.',
      cost: { fire: 0, water: 0, grass: 0, electric: 0, random: 2 },
      cooldown: 1,
      classes: ['special'],
      start: [
        { target: 'enemy', apply: damage(35) },
      ],
      effects: [],
    }),
    
    // Skill 2: Confusion - Damage + Stun
    createSkill({
      name: 'Confusion',
      owner: slot,
      description: 'Deals 20 damage and may stun the target.',
      cost: { fire: 0, water: 0, grass: 0, electric: 0, random: 1 },
      cooldown: 0,
      classes: ['mental'],
      start: [
        { target: 'enemy', apply: damage(20) },
        { target: 'enemy', apply: stun(1, ['mental']) },
      ],
      effects: [],
    }),
    
    // Skill 3: Barrier - Create defense
    createSkill({
      name: 'Barrier',
      owner: slot,
      description: 'Creates 40 destructible defense.',
      cost: { fire: 0, water: 0, grass: 0, electric: 0, random: 1 },
      cooldown: 3,
      classes: ['mental'],
      start: [
        { target: 'self', apply: defense('Barrier', 40) },
      ],
      effects: [],
    }),
    
    // Skill 4: Recover - Heal self
    createSkill({
      name: 'Recover',
      owner: slot,
      description: 'Restores 30 health.',
      cost: { fire: 0, water: 0, grass: 0, electric: 0, random: 1 },
      cooldown: 3,
      classes: ['unique'],
      start: [
        { target: 'self', apply: heal(30) },
      ],
      effects: [],
    }),
  ];
}

// =============================================================================
// STEP 2: CREATE FIGHTERS
// =============================================================================

function createPikachu(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Pikachu',
    health: 100,
    maxHealth: 100,
    skills: createPikachuSkills(slot),
  });
}

function createMewtwo(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Mewtwo',
    health: 100,
    maxHealth: 100,
    skills: createMewtwoSkills(slot),
  });
}

// =============================================================================
// STEP 3: RUN A BATTLE SIMULATION
// =============================================================================

export function runExampleBattle(): void {
  console.log('=== POKÉMON ARENA - BATTLE SIMULATION ===\n');
  
  // Create teams
  const playerTeam = [
    createPikachu(0),
    createFighter({ slot: 1, name: 'Charizard', skills: createPikachuSkills(1) }),
    createFighter({ slot: 2, name: 'Blastoise', skills: createPikachuSkills(2) }),
  ];
  
  const opponentTeam = [
    createMewtwo(3),
    createFighter({ slot: 4, name: 'Gengar', skills: createMewtwoSkills(4) }),
    createFighter({ slot: 5, name: 'Alakazam', skills: createMewtwoSkills(5) }),
  ];
  
  // Initialize battle
  let state = createBattleState(playerTeam, opponentTeam, 42);
  
  // Give starting energy
  state = {
    ...state,
    playerEnergy: { fire: 2, water: 2, grass: 2, electric: 2, random: 2 },
    opponentEnergy: { fire: 2, water: 2, grass: 2, electric: 2, random: 2 },
  };
  
  console.log('Battle Started!');
  console.log('Player Team:', playerTeam.map(f => f.name).join(', '));
  console.log('Opponent Team:', opponentTeam.map(f => f.name).join(', '));
  console.log('');
  
  // Simulate a few turns
  for (let turn = 1; turn <= 5 && !state.victor; turn++) {
    console.log(`--- Turn ${turn} ---`);
    
    // Player actions
    const playerIntents: ActionIntent[] = [
      { userSlot: 0, skillIndex: 0, targetSlot: 3 }, // Pikachu uses Thunderbolt on Mewtwo
    ];
    
    // Opponent actions
    const opponentIntents: ActionIntent[] = [
      { userSlot: 3, skillIndex: 0, targetSlot: 0 }, // Mewtwo uses Psystrike on Pikachu
    ];
    
    // Resolve turn
    const { state: newState, log } = resolveTurn(state, playerIntents, opponentIntents);
    state = newState;
    
    // Print relevant log entries
    const relevantLogs = log.filter(e => 
      ['damage', 'heal', 'death', 'effect_applied', 'action_blocked'].includes(e.type)
    );
    
    for (const entry of relevantLogs) {
      console.log(`  ${entry.message}`);
    }
    
    // Print health status
    console.log('');
    console.log('  Health Status:');
    for (const fighter of state.fighters) {
      if (fighter.alive) {
        console.log(`    ${fighter.name}: ${fighter.health}/${fighter.maxHealth}`);
      } else {
        console.log(`    ${fighter.name}: DEFEATED`);
      }
    }
    console.log('');
  }
  
  // Check victory
  if (state.victor) {
    console.log(`=== BATTLE ENDED ===`);
    console.log(`Winner: ${state.victor.toUpperCase()} TEAM!`);
  } else {
    console.log(`=== BATTLE ONGOING ===`);
  }
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runExampleBattle();
}
