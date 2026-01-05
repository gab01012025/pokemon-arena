/**
 * Pokémon Arena - Character Data
 * 
 * Based on Naruto Arena character structure.
 * Each Pokémon has 4 skills with the following pattern:
 * 1. Main Attack (damage skill)
 * 2. Special Attack (stronger attack with condition/cooldown)
 * 3. Support/Buff Skill (status effects, defense, etc.)
 * 4. Invulnerability Skill (defensive, usually 4-turn cooldown)
 * 
 * Energy types:
 * - fire: Fire/Fighting types
 * - water: Water/Ice types
 * - grass: Grass/Bug types
 * - electric: Electric/Psychic types
 * - random: Any type (neutral)
 */

import { 
  type Skill, 
  type Fighter,
  createSkill, 
  createFighter,
  ZERO_ENERGY
} from './types';
import { damage, heal, stun, invulnerable, defense, applyStatus } from './action';

// =============================================================================
// SKILL HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standard invulnerability skill
 */
function invulnSkill(name: string, owner: number, desc: string): Skill {
  return createSkill({
    name,
    owner,
    description: desc,
    cost: { ...ZERO_ENERGY, random: 1 },
    cooldown: 4,
    classes: ['mental'],
    start: [
      { target: 'self', apply: invulnerable(1, ['all']) },
    ],
    effects: [],
  });
}

// =============================================================================
// GENERATION 1 POKÉMON
// =============================================================================

export function createPikachu(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Pikachu',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Thunderbolt - Main attack
      createSkill({
        name: 'Thunderbolt',
        owner: slot,
        description: 'Pikachu unleashes a powerful electric attack, dealing 25 damage to an enemy. Deals 10 additional damage if the target is affected by [Thunder Wave].',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 0,
        classes: ['special'],
        start: [
          { 
            target: 'enemy', 
            apply: (ctx) => {
              // Check for Thunder Wave bonus
              const target = ctx.state.fighters.find(f => f.slot === ctx.target);
              const hasThunderWave = target?.statuses.some(s => s.name === 'Thunder Wave');
              const bonusDamage = hasThunderWave ? 10 : 0;
              damage(25 + bonusDamage)(ctx);
            }
          },
        ],
        effects: [],
      }),
      
      // Skill 2: Thunder - High damage with stun
      createSkill({
        name: 'Thunder',
        owner: slot,
        description: 'Pikachu calls down a devastating lightning bolt, dealing 40 damage to an enemy and stunning them for 1 turn.',
        cost: { ...ZERO_ENERGY, electric: 2, random: 1 },
        cooldown: 2,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(40) },
          { target: 'enemy', apply: stun(1, ['all']) },
        ],
        effects: [],
      }),
      
      // Skill 3: Thunder Wave - Debuff
      createSkill({
        name: 'Thunder Wave',
        owner: slot,
        description: 'Pikachu paralyzes an enemy with electricity. For 3 turns, the target cannot reduce damage or become invulnerable.',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 3,
        classes: ['special'],
        start: [
          { 
            target: 'enemy', 
            apply: applyStatus('Thunder Wave', 3, [
              { type: 'expose', duration: 3 }
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Agility - Invulnerability
      invulnSkill('Agility', slot, 'Pikachu becomes too fast to hit, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createCharizard(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Charizard',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Flamethrower
      createSkill({
        name: 'Flamethrower',
        owner: slot,
        description: 'Charizard breathes intense flames, dealing 30 damage to an enemy.',
        cost: { ...ZERO_ENERGY, fire: 1, random: 1 },
        cooldown: 0,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(30) },
        ],
        effects: [],
      }),
      
      // Skill 2: Fire Blast - AOE
      createSkill({
        name: 'Fire Blast',
        owner: slot,
        description: 'Charizard unleashes a massive fire attack, dealing 20 damage to all enemies.',
        cost: { ...ZERO_ENERGY, fire: 2, random: 1 },
        cooldown: 2,
        classes: ['special'],
        start: [
          { target: 'enemies', apply: damage(20) },
        ],
        effects: [],
      }),
      
      // Skill 3: Dragon Dance - Buff
      createSkill({
        name: 'Dragon Dance',
        owner: slot,
        description: 'Charizard performs a mystical dance. For 4 turns, Charizard gains 15 points of damage reduction and deals 10 additional damage.',
        cost: { ...ZERO_ENERGY, fire: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Dragon Dance', 4, [
              { type: 'reduce', value: 15, duration: 4 },
              { type: 'strengthen', value: 10, duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Fly
      invulnSkill('Fly', slot, 'Charizard takes to the skies, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createBlastoise(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Blastoise',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Hydro Pump
      createSkill({
        name: 'Hydro Pump',
        owner: slot,
        description: 'Blastoise fires powerful water cannons, dealing 35 damage to an enemy.',
        cost: { ...ZERO_ENERGY, water: 2 },
        cooldown: 1,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(35) },
        ],
        effects: [],
      }),
      
      // Skill 2: Rapid Spin - Removes effects
      createSkill({
        name: 'Rapid Spin',
        owner: slot,
        description: 'Blastoise spins rapidly, dealing 15 damage to an enemy and removing all harmful effects from itself.',
        cost: { ...ZERO_ENERGY, water: 1 },
        cooldown: 2,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(15) },
          { 
            target: 'self', 
            apply: (ctx) => {
              // Cure all harmful effects
              const fighter = ctx.state.fighters.find(f => f.slot === ctx.user);
              if (fighter) {
                const newStatuses = fighter.statuses.filter(s => 
                  s.effects.every(e => e.helpful)
                );
                ctx.state = {
                  ...ctx.state,
                  fighters: ctx.state.fighters.map(f => 
                    f.slot === ctx.user 
                      ? { ...f, statuses: newStatuses, effects: [] }
                      : f
                  ),
                };
              }
            }
          },
        ],
        effects: [],
      }),
      
      // Skill 3: Iron Defense
      createSkill({
        name: 'Iron Defense',
        owner: slot,
        description: 'Blastoise hardens its shell, creating 40 destructible defense.',
        cost: { ...ZERO_ENERGY, water: 1 },
        cooldown: 3,
        classes: ['physical'],
        start: [
          { target: 'self', apply: defense('Iron Defense', 40) },
        ],
        effects: [],
      }),
      
      // Skill 4: Withdraw
      invulnSkill('Withdraw', slot, 'Blastoise retreats into its shell, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createVenusaur(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Venusaur',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Razor Leaf
      createSkill({
        name: 'Razor Leaf',
        owner: slot,
        description: 'Venusaur launches sharp leaves, dealing 25 damage to an enemy.',
        cost: { ...ZERO_ENERGY, grass: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(25) },
        ],
        effects: [],
      }),
      
      // Skill 2: Solar Beam - High damage
      createSkill({
        name: 'Solar Beam',
        owner: slot,
        description: 'Venusaur fires a beam of solar energy, dealing 50 damage to an enemy. Requires [Sunny Day].',
        require: { hasStatus: 'Sunny Day' },
        cost: { ...ZERO_ENERGY, grass: 2 },
        cooldown: 1,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(50) },
        ],
        effects: [],
      }),
      
      // Skill 3: Sunny Day + Synthesis
      createSkill({
        name: 'Sunny Day',
        owner: slot,
        description: 'Venusaur basks in sunlight. For 4 turns, Venusaur heals 10 health per turn and gains access to Solar Beam.',
        cost: { ...ZERO_ENERGY, grass: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Sunny Day', 4, [
              { type: 'heal', value: 10, trigger: 'onTurnEnd', duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Leech Seed (special defensive)
      createSkill({
        name: 'Leech Seed',
        owner: slot,
        description: 'Venusaur plants seeds on an enemy. For 3 turns, they take 10 damage per turn and Venusaur heals 10 health.',
        cost: { ...ZERO_ENERGY, grass: 1 },
        cooldown: 3,
        classes: ['special'],
        start: [
          { 
            target: 'enemy', 
            apply: applyStatus('Leech Seed', 3, [
              { type: 'afflict', value: 10, trigger: 'onTurnEnd', duration: 3 },
            ])
          },
          { 
            target: 'self', 
            apply: applyStatus('Leech Seed Drain', 3, [
              { type: 'heal', value: 10, trigger: 'onTurnEnd', duration: 3 },
            ])
          },
        ],
        effects: [],
      }),
    ],
  });
}

export function createMewtwo(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Mewtwo',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Psystrike
      createSkill({
        name: 'Psystrike',
        owner: slot,
        description: 'Mewtwo attacks with psychic waves, dealing 35 piercing damage to an enemy.',
        cost: { ...ZERO_ENERGY, electric: 2 },
        cooldown: 1,
        classes: ['special', 'piercing'],
        start: [
          { target: 'enemy', apply: damage(35) },
        ],
        effects: [],
      }),
      
      // Skill 2: Psychic - Damage + Weaken
      createSkill({
        name: 'Psychic',
        owner: slot,
        description: 'Mewtwo assaults the mind of an enemy, dealing 25 damage and weakening their damage by 15 for 2 turns.',
        cost: { ...ZERO_ENERGY, electric: 1, random: 1 },
        cooldown: 0,
        classes: ['mental'],
        start: [
          { target: 'enemy', apply: damage(25) },
          { 
            target: 'enemy', 
            apply: applyStatus('Mind Crush', 2, [
              { type: 'weaken', value: 15, duration: 2 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 3: Recover
      createSkill({
        name: 'Recover',
        owner: slot,
        description: 'Mewtwo regenerates its cells, restoring 35 health.',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 3,
        classes: ['unique'],
        start: [
          { target: 'self', apply: heal(35) },
        ],
        effects: [],
      }),
      
      // Skill 4: Barrier
      createSkill({
        name: 'Barrier',
        owner: slot,
        description: 'Mewtwo creates a powerful psychic barrier. For 2 turns, Mewtwo is invulnerable to physical and special attacks.',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { target: 'self', apply: invulnerable(2, ['physical', 'special']) },
        ],
        effects: [],
      }),
    ],
  });
}

export function createGengar(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Gengar',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Shadow Ball
      createSkill({
        name: 'Shadow Ball',
        owner: slot,
        description: 'Gengar hurls a shadowy blob, dealing 30 damage to an enemy.',
        cost: { ...ZERO_ENERGY, random: 2 },
        cooldown: 0,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(30) },
        ],
        effects: [],
      }),
      
      // Skill 2: Hypnosis - Stun
      createSkill({
        name: 'Hypnosis',
        owner: slot,
        description: 'Gengar puts an enemy to sleep, stunning them for 2 turns. Cannot be used on an enemy already affected.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 3,
        classes: ['mental'],
        start: [
          { target: 'enemy', apply: stun(2, ['all']) },
        ],
        effects: [],
      }),
      
      // Skill 3: Curse
      createSkill({
        name: 'Curse',
        owner: slot,
        description: 'Gengar sacrifices 15 health to curse an enemy. For 4 turns, they take 15 affliction damage per turn.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 3,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: (ctx) => {
              // Sacrifice health
              ctx.state = {
                ...ctx.state,
                fighters: ctx.state.fighters.map(f => 
                  f.slot === ctx.user 
                    ? { ...f, health: Math.max(1, f.health - 15) }
                    : f
                ),
              };
            }
          },
          { 
            target: 'enemy', 
            apply: applyStatus('Curse', 4, [
              { type: 'afflict', value: 15, trigger: 'onTurnEnd', duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Shadow Sneak
      invulnSkill('Shadow Sneak', slot, 'Gengar phases through dimensions, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createAlakazam(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Alakazam',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Psybeam
      createSkill({
        name: 'Psybeam',
        owner: slot,
        description: 'Alakazam fires a peculiar ray, dealing 25 damage to an enemy.',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 0,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(25) },
        ],
        effects: [],
      }),
      
      // Skill 2: Focus Blast
      createSkill({
        name: 'Focus Blast',
        owner: slot,
        description: 'Alakazam releases fighting spirit, dealing 40 damage to an enemy.',
        cost: { ...ZERO_ENERGY, electric: 2, random: 1 },
        cooldown: 2,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(40) },
        ],
        effects: [],
      }),
      
      // Skill 3: Calm Mind
      createSkill({
        name: 'Calm Mind',
        owner: slot,
        description: 'Alakazam calms its mind. For 3 turns, Alakazam deals 15 additional damage and takes 15 less damage.',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Calm Mind', 3, [
              { type: 'strengthen', value: 15, duration: 3 },
              { type: 'reduce', value: 15, duration: 3 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Teleport
      invulnSkill('Teleport', slot, 'Alakazam teleports away, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createDragonite(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Dragonite',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Dragon Claw
      createSkill({
        name: 'Dragon Claw',
        owner: slot,
        description: 'Dragonite slashes with sharp claws, dealing 25 damage to an enemy.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(25) },
        ],
        effects: [],
      }),
      
      // Skill 2: Outrage - High damage, stuns self
      createSkill({
        name: 'Outrage',
        owner: slot,
        description: 'Dragonite goes on a rampage, dealing 45 damage to an enemy. Dragonite becomes confused and is stunned for 1 turn afterward.',
        cost: { ...ZERO_ENERGY, fire: 1, random: 2 },
        cooldown: 2,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(45) },
          { target: 'self', apply: stun(1, ['all']) },
        ],
        effects: [],
      }),
      
      // Skill 3: Dragon Dance
      createSkill({
        name: 'Dragon Dance',
        owner: slot,
        description: 'Dragonite performs a mystical dance. For 4 turns, Dragonite gains 10 points of damage reduction and deals 10 additional damage.',
        cost: { ...ZERO_ENERGY, fire: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Dragon Dance', 4, [
              { type: 'reduce', value: 10, duration: 4 },
              { type: 'strengthen', value: 10, duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Roost
      createSkill({
        name: 'Roost',
        owner: slot,
        description: 'Dragonite lands and rests, restoring 30 health but becoming vulnerable to ground attacks for 1 turn.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 3,
        classes: ['unique'],
        start: [
          { target: 'self', apply: heal(30) },
        ],
        effects: [],
      }),
    ],
  });
}

export function createSnorlax(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Snorlax',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Body Slam
      createSkill({
        name: 'Body Slam',
        owner: slot,
        description: 'Snorlax throws its weight around, dealing 25 damage to an enemy and stunning their physical skills for 1 turn.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(25) },
          { target: 'enemy', apply: stun(1, ['physical']) },
        ],
        effects: [],
      }),
      
      // Skill 2: Hyper Beam
      createSkill({
        name: 'Hyper Beam',
        owner: slot,
        description: 'Snorlax fires a devastating beam, dealing 55 damage to an enemy. Snorlax must rest and is stunned for 1 turn.',
        cost: { ...ZERO_ENERGY, random: 3 },
        cooldown: 2,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(55) },
          { target: 'self', apply: stun(1, ['all']) },
        ],
        effects: [],
      }),
      
      // Skill 3: Rest
      createSkill({
        name: 'Rest',
        owner: slot,
        description: 'Snorlax goes to sleep, restoring all health but becoming stunned for 2 turns.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 5,
        classes: ['unique'],
        start: [
          { 
            target: 'self', 
            apply: (ctx) => {
              // Full heal
              ctx.state = {
                ...ctx.state,
                fighters: ctx.state.fighters.map(f => 
                  f.slot === ctx.user 
                    ? { ...f, health: f.maxHealth }
                    : f
                ),
              };
            }
          },
          { target: 'self', apply: stun(2, ['all']) },
        ],
        effects: [],
      }),
      
      // Skill 4: Block
      createSkill({
        name: 'Block',
        owner: slot,
        description: 'Snorlax braces itself, creating 50 destructible defense.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 4,
        classes: ['physical'],
        start: [
          { target: 'self', apply: defense('Block', 50) },
        ],
        effects: [],
      }),
    ],
  });
}

// =============================================================================
// GENERATION 2+ POKÉMON
// =============================================================================

export function createTyranitar(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Tyranitar',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Crunch
      createSkill({
        name: 'Crunch',
        owner: slot,
        description: 'Tyranitar bites with vicious fangs, dealing 25 damage and reducing enemy defense by 10 for 2 turns.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(25) },
          { 
            target: 'enemy', 
            apply: applyStatus('Defense Lowered', 2, [
              { type: 'bleed', value: 10, duration: 2 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 2: Stone Edge
      createSkill({
        name: 'Stone Edge',
        owner: slot,
        description: 'Tyranitar strikes with sharp stones, dealing 35 piercing damage to an enemy.',
        cost: { ...ZERO_ENERGY, fire: 1, random: 1 },
        cooldown: 1,
        classes: ['physical', 'piercing'],
        start: [
          { target: 'enemy', apply: damage(35) },
        ],
        effects: [],
      }),
      
      // Skill 3: Sandstorm
      createSkill({
        name: 'Sandstorm',
        owner: slot,
        description: 'Tyranitar summons a sandstorm. For 3 turns, all enemies take 10 affliction damage per turn.',
        cost: { ...ZERO_ENERGY, fire: 1, random: 1 },
        cooldown: 4,
        classes: ['special'],
        start: [
          { 
            target: 'enemies', 
            apply: applyStatus('Sandstorm', 3, [
              { type: 'afflict', value: 10, trigger: 'onTurnEnd', duration: 3 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Protect
      invulnSkill('Protect', slot, 'Tyranitar protects itself, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createGarchomp(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Garchomp',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Dragon Rush
      createSkill({
        name: 'Dragon Rush',
        owner: slot,
        description: 'Garchomp charges at blinding speed, dealing 30 damage to an enemy.',
        cost: { ...ZERO_ENERGY, fire: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(30) },
        ],
        effects: [],
      }),
      
      // Skill 2: Earthquake
      createSkill({
        name: 'Earthquake',
        owner: slot,
        description: 'Garchomp shakes the ground, dealing 20 damage to all enemies.',
        cost: { ...ZERO_ENERGY, fire: 1, random: 1 },
        cooldown: 2,
        classes: ['physical'],
        start: [
          { target: 'enemies', apply: damage(20) },
        ],
        effects: [],
      }),
      
      // Skill 3: Swords Dance
      createSkill({
        name: 'Swords Dance',
        owner: slot,
        description: 'Garchomp sharpens its claws. For 4 turns, Garchomp deals 20 additional damage.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Swords Dance', 4, [
              { type: 'strengthen', value: 20, duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Dig
      invulnSkill('Dig', slot, 'Garchomp burrows underground, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createLucario(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Lucario',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Aura Sphere
      createSkill({
        name: 'Aura Sphere',
        owner: slot,
        description: 'Lucario fires a sphere of aura energy, dealing 25 damage to an enemy. This attack never misses.',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 0,
        classes: ['special', 'bypassing'],
        start: [
          { target: 'enemy', apply: damage(25) },
        ],
        effects: [],
      }),
      
      // Skill 2: Close Combat
      createSkill({
        name: 'Close Combat',
        owner: slot,
        description: 'Lucario unleashes a flurry of attacks, dealing 45 damage but reducing its own defense by 15 for 2 turns.',
        cost: { ...ZERO_ENERGY, electric: 2, random: 1 },
        cooldown: 2,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(45) },
          { 
            target: 'self', 
            apply: applyStatus('Lowered Guard', 2, [
              { type: 'bleed', value: 15, duration: 2 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 3: Counter
      createSkill({
        name: 'Counter',
        owner: slot,
        description: 'Lucario prepares to counter. If attacked this turn, the attacker takes 25 damage.',
        cost: { ...ZERO_ENERGY, electric: 1 },
        cooldown: 3,
        classes: ['physical'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Counter', 1, [
              { type: 'counter', duration: 1 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Extreme Speed
      invulnSkill('Extreme Speed', slot, 'Lucario moves too fast to hit, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createGyarados(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Gyarados',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Waterfall
      createSkill({
        name: 'Waterfall',
        owner: slot,
        description: 'Gyarados charges with crashing waves, dealing 25 damage to an enemy.',
        cost: { ...ZERO_ENERGY, water: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(25) },
        ],
        effects: [],
      }),
      
      // Skill 2: Hydro Pump
      createSkill({
        name: 'Hydro Pump',
        owner: slot,
        description: 'Gyarados blasts water with extreme force, dealing 40 damage to an enemy.',
        cost: { ...ZERO_ENERGY, water: 2, random: 1 },
        cooldown: 2,
        classes: ['special'],
        start: [
          { target: 'enemy', apply: damage(40) },
        ],
        effects: [],
      }),
      
      // Skill 3: Dragon Dance
      createSkill({
        name: 'Dragon Dance',
        owner: slot,
        description: 'Gyarados performs a mystical dance. For 4 turns, deals 15 additional damage and takes 10 less damage.',
        cost: { ...ZERO_ENERGY, water: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Dragon Dance', 4, [
              { type: 'strengthen', value: 15, duration: 4 },
              { type: 'reduce', value: 10, duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Bounce
      invulnSkill('Bounce', slot, 'Gyarados leaps into the air, becoming invulnerable for 1 turn.'),
    ],
  });
}

export function createMachamp(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Machamp',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Dynamic Punch
      createSkill({
        name: 'Dynamic Punch',
        owner: slot,
        description: 'Machamp delivers a powerful punch, dealing 30 damage and stunning physical skills for 1 turn.',
        cost: { ...ZERO_ENERGY, fire: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(30) },
          { target: 'enemy', apply: stun(1, ['physical']) },
        ],
        effects: [],
      }),
      
      // Skill 2: Cross Chop
      createSkill({
        name: 'Cross Chop',
        owner: slot,
        description: 'Machamp slashes with both arms, dealing 35 piercing damage to an enemy.',
        cost: { ...ZERO_ENERGY, fire: 2, random: 1 },
        cooldown: 2,
        classes: ['physical', 'piercing'],
        start: [
          { target: 'enemy', apply: damage(35) },
        ],
        effects: [],
      }),
      
      // Skill 3: Bulk Up
      createSkill({
        name: 'Bulk Up',
        owner: slot,
        description: 'Machamp flexes its muscles. For 4 turns, deals 10 additional damage and takes 15 less damage.',
        cost: { ...ZERO_ENERGY, fire: 1 },
        cooldown: 4,
        classes: ['physical'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Bulk Up', 4, [
              { type: 'strengthen', value: 10, duration: 4 },
              { type: 'reduce', value: 15, duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: No Guard
      createSkill({
        name: 'No Guard',
        owner: slot,
        description: 'Machamp braces for impact, creating 35 destructible defense.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 4,
        classes: ['physical'],
        start: [
          { target: 'self', apply: defense('No Guard', 35) },
        ],
        effects: [],
      }),
    ],
  });
}

export function createScizor(slot: number): Fighter {
  return createFighter({
    slot,
    name: 'Scizor',
    health: 100,
    maxHealth: 100,
    skills: [
      // Skill 1: Bullet Punch
      createSkill({
        name: 'Bullet Punch',
        owner: slot,
        description: 'Scizor strikes with blinding speed, dealing 20 damage to an enemy.',
        cost: { ...ZERO_ENERGY, grass: 1 },
        cooldown: 0,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(20) },
        ],
        effects: [],
      }),
      
      // Skill 2: X-Scissor
      createSkill({
        name: 'X-Scissor',
        owner: slot,
        description: 'Scizor slashes in an X pattern, dealing 35 damage to an enemy.',
        cost: { ...ZERO_ENERGY, grass: 2 },
        cooldown: 1,
        classes: ['physical'],
        start: [
          { target: 'enemy', apply: damage(35) },
        ],
        effects: [],
      }),
      
      // Skill 3: Swords Dance
      createSkill({
        name: 'Swords Dance',
        owner: slot,
        description: 'Scizor sharpens its pincers. For 4 turns, deals 20 additional damage.',
        cost: { ...ZERO_ENERGY, grass: 1 },
        cooldown: 4,
        classes: ['mental'],
        start: [
          { 
            target: 'self', 
            apply: applyStatus('Swords Dance', 4, [
              { type: 'strengthen', value: 20, duration: 4 },
            ])
          },
        ],
        effects: [],
      }),
      
      // Skill 4: Roost
      createSkill({
        name: 'Roost',
        owner: slot,
        description: 'Scizor lands and rests, restoring 25 health.',
        cost: { ...ZERO_ENERGY, random: 1 },
        cooldown: 3,
        classes: ['unique'],
        start: [
          { target: 'self', apply: heal(25) },
        ],
        effects: [],
      }),
    ],
  });
}

// =============================================================================
// ALL POKEMON REGISTRY
// =============================================================================

export const ALL_POKEMON = [
  // Generation 1
  { id: 'pikachu', name: 'Pikachu', create: createPikachu },
  { id: 'charizard', name: 'Charizard', create: createCharizard },
  { id: 'blastoise', name: 'Blastoise', create: createBlastoise },
  { id: 'venusaur', name: 'Venusaur', create: createVenusaur },
  { id: 'mewtwo', name: 'Mewtwo', create: createMewtwo },
  { id: 'gengar', name: 'Gengar', create: createGengar },
  { id: 'alakazam', name: 'Alakazam', create: createAlakazam },
  { id: 'dragonite', name: 'Dragonite', create: createDragonite },
  { id: 'snorlax', name: 'Snorlax', create: createSnorlax },
  { id: 'machamp', name: 'Machamp', create: createMachamp },
  { id: 'gyarados', name: 'Gyarados', create: createGyarados },
  
  // Generation 2+
  { id: 'tyranitar', name: 'Tyranitar', create: createTyranitar },
  { id: 'scizor', name: 'Scizor', create: createScizor },
  
  // Generation 4+
  { id: 'garchomp', name: 'Garchomp', create: createGarchomp },
  { id: 'lucario', name: 'Lucario', create: createLucario },
];

/**
 * Get a Pokemon by ID
 */
export function getPokemonById(id: string): ((slot: number) => Fighter) | undefined {
  return ALL_POKEMON.find(p => p.id === id)?.create;
}

/**
 * Create a team from Pokemon IDs
 */
export function createTeam(pokemonIds: string[], startSlot: number = 0): Fighter[] {
  return pokemonIds.map((id, index) => {
    const creator = getPokemonById(id);
    if (!creator) {
      throw new Error(`Unknown Pokemon: ${id}`);
    }
    return creator(startSlot + index);
  });
}
