import { TYPES, CLASSES } from './seed-kanto';

// Kanto Pokemon #015-#021
const kantoPokemon3 = [
  // #015 Beedrill
  {
    name: 'Beedrill',
    description: 'It has 3 poisonous stingers on its forelegs and its tail. They are used to jab its enemy repeatedly.',
    types: JSON.stringify([TYPES.BUG, TYPES.POISON]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Swarm', 'Sniper']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Fury Attack', description: 'Multiple stabs.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Poison Jab', description: 'Poisonous stab.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ poison: 2 }), damage: 35, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Pin Missile', description: 'Sharp needles.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ bug: 2 }), damage: 30, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Twineedle', description: 'Double poison hit.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ bug: 1, poison: 1 }), damage: 40, cooldown: 1, effects: JSON.stringify([{ type: 'poison', chance: 40, duration: 2 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #016 Pidgey
  {
    name: 'Pidgey',
    description: 'Very docile. If attacked, it will often kick up sand to protect itself rather than fight back.',
    types: JSON.stringify([TYPES.NORMAL, TYPES.FLYING]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Keen Eye', 'Tangled Feet']),
    isStarter: false,
    unlockCost: 100,
    moves: [
      { name: 'Tackle', description: 'A physical attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Gust', description: 'Wind attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ flying: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Sand Attack', description: 'Lowers accuracy.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ ground: 1 }), damage: 0, effects: JSON.stringify([{ type: 'accuracy', value: -20, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Quick Attack', description: 'Fast strike.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify(['priority']), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #017 Pidgeotto
  {
    name: 'Pidgeotto',
    description: 'This Pokémon is full of vitality. It constantly flies around its large territory in search of prey.',
    types: JSON.stringify([TYPES.NORMAL, TYPES.FLYING]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Keen Eye', 'Tangled Feet']),
    isStarter: false,
    unlockCost: 300,
    moves: [
      { name: 'Wing Attack', description: 'Strikes with wings.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Twister', description: 'Tornado attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ flying: 1, dragon: 1 }), damage: 30, effects: JSON.stringify([{ type: 'flinch', chance: 20 }]), target: 'AllEnemies', slot: 1 },
      { name: 'Feather Dance', description: 'Lowers attack.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ flying: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackDown', value: 30, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Aerial Ace', description: 'Never misses.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 2 }), damage: 35, effects: JSON.stringify(['neverMiss']), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #018 Pidgeot
  {
    name: 'Pidgeot',
    description: 'This Pokémon flies at Mach 2 speed, seeking prey. Its large talons are feared as wicked weapons.',
    types: JSON.stringify([TYPES.NORMAL, TYPES.FLYING]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Keen Eye', 'Big Pecks']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Wing Attack', description: 'Strikes with wings.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Air Slash', description: 'Sharp air blade.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ flying: 2 }), damage: 35, effects: JSON.stringify([{ type: 'flinch', chance: 30 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Hurricane', description: 'Massive storm.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ flying: 3 }), damage: 50, cooldown: 1, effects: JSON.stringify([{ type: 'confuse', chance: 30 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Brave Bird', description: 'Reckless charge.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 2, normal: 1 }), damage: 55, cooldown: 1, effects: JSON.stringify([{ type: 'recoil', value: 15 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #019 Rattata
  {
    name: 'Rattata',
    description: 'Will chew on anything with its fangs. If you see one, you can be certain that 40 more live in the area.',
    types: JSON.stringify([TYPES.NORMAL]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Run Away', 'Guts']),
    isStarter: false,
    unlockCost: 100,
    moves: [
      { name: 'Tackle', description: 'A physical attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Quick Attack', description: 'Fast strike.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify(['priority']), target: 'OneEnemy', slot: 1 },
      { name: 'Bite', description: 'Bites with fangs.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ dark: 1 }), damage: 25, effects: JSON.stringify([{ type: 'flinch', chance: 20 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Hyper Fang', description: 'Sharp fang attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([{ type: 'flinch', chance: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #020 Raticate
  {
    name: 'Raticate',
    description: 'Its hind feet are webbed. They act as flippers, so it can swim in rivers and hunt for prey.',
    types: JSON.stringify([TYPES.NORMAL]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Run Away', 'Guts', 'Hustle']),
    isStarter: false,
    unlockCost: 300,
    moves: [
      { name: 'Quick Attack', description: 'Fast strike.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify(['priority']), target: 'OneEnemy', slot: 0 },
      { name: 'Hyper Fang', description: 'Sharp fang attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 40, effects: JSON.stringify([{ type: 'flinch', chance: 10 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Crunch', description: 'Crushing bite.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ dark: 2 }), damage: 35, effects: JSON.stringify([{ type: 'defenseDown', chance: 20 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Super Fang', description: 'Halves enemy HP.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 0, cooldown: 2, effects: JSON.stringify([{ type: 'percentDamage', value: 50 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #021 Spearow
  {
    name: 'Spearow',
    description: 'Eats bugs in grassy areas. It has to flap its short wings at high speed to stay airborne.',
    types: JSON.stringify([TYPES.NORMAL, TYPES.FLYING]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Keen Eye', 'Sniper']),
    isStarter: false,
    unlockCost: 100,
    moves: [
      { name: 'Peck', description: 'Pecks the enemy.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Fury Attack', description: 'Multiple hits.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Aerial Ace', description: 'Never misses.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 2 }), damage: 30, effects: JSON.stringify(['neverMiss']), target: 'OneEnemy', slot: 2 },
      { name: 'Mirror Move', description: 'Copies last move.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ flying: 1 }), damage: 0, effects: JSON.stringify([{ type: 'copyLastMove' }]), target: 'Self', slot: 3 },
    ],
  },
];

export { kantoPokemon3 };
