import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TYPES = {
  FIRE: 'Fire', WATER: 'Water', GRASS: 'Grass', ELECTRIC: 'Electric',
  PSYCHIC: 'Psychic', FIGHTING: 'Fighting', DARK: 'Dark', DRAGON: 'Dragon',
  NORMAL: 'Normal', GHOST: 'Ghost', POISON: 'Poison', GROUND: 'Ground',
  FLYING: 'Flying', ICE: 'Ice', ROCK: 'Rock', STEEL: 'Steel', FAIRY: 'Fairy', BUG: 'Bug',
};

const CLASSES = {
  PHYSICAL: 'Physical', SPECIAL: 'Special', STATUS: 'Status',
  AFFLICTION: 'Affliction', INSTANT: 'Instant', MELEE: 'Melee', RANGED: 'Ranged',
};

// 28 Kanto Pokemon (#001-#028)
const kantoPokemon = [
  // #001 Bulbasaur
  {
    name: 'Bulbasaur',
    description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    types: JSON.stringify([TYPES.GRASS, TYPES.POISON]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Overgrow']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      { name: 'Tackle', description: 'A physical attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Vine Whip', description: 'Strikes with vines.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Leech Seed', description: 'Plants a seed that drains HP each turn.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ grass: 1 }), damage: 0, effects: JSON.stringify([{ type: 'drain', value: 10, duration: 3 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Razor Leaf', description: 'Sharp leaves attack the enemy.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #002 Ivysaur
  {
    name: 'Ivysaur',
    description: 'When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.',
    types: JSON.stringify([TYPES.GRASS, TYPES.POISON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Overgrow']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Vine Whip', description: 'Strikes with vines.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Poison Powder', description: 'Poisons the enemy.', classes: JSON.stringify([CLASSES.STATUS, CLASSES.AFFLICTION]), cost: JSON.stringify({ poison: 1 }), damage: 0, effects: JSON.stringify([{ type: 'poison', value: 10, duration: 3 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Razor Leaf', description: 'Sharp leaves attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 2 }), damage: 30, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Solar Beam', description: 'Powerful grass attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 3 }), damage: 45, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #003 Venusaur
  {
    name: 'Venusaur',
    description: 'The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.',
    types: JSON.stringify([TYPES.GRASS, TYPES.POISON]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Overgrow', 'Thick Fat']),
    isStarter: false,
    unlockCost: 1000,
    moves: [
      { name: 'Razor Leaf', description: 'Sharp leaves attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sludge Bomb', description: 'Toxic sludge attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ poison: 2 }), damage: 35, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Solar Beam', description: 'Powerful solar attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 3 }), damage: 50, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Frenzy Plant', description: 'Ultimate grass attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 3, normal: 1 }), damage: 60, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #004 Charmander
  {
    name: 'Charmander',
    description: 'The flame on its tail indicates its life force. If it is healthy, the flame burns brightly.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Blaze']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      { name: 'Scratch', description: 'Scratches with claws.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Ember', description: 'Small flame attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 1 }), damage: 20, effects: JSON.stringify([{ type: 'burn', chance: 10 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Dragon Rage', description: 'Fixed 25 damage.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 1, normal: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Flamethrower', description: 'Powerful fire stream.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #005 Charmeleon
  {
    name: 'Charmeleon',
    description: 'It has a barbaric nature. In battle, it whips its fiery tail around and slashes away with sharp claws.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Blaze']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Slash', description: 'Slashes with claws.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Flamethrower', description: 'Fire stream attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 35, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Fire Fang', description: 'Fiery bite attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ fire: 1, normal: 1 }), damage: 30, effects: JSON.stringify([{ type: 'burn', chance: 15 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Fire Spin', description: 'Traps in fire vortex.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 25, effects: JSON.stringify([{ type: 'trap', duration: 2, damage: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #006 Charizard
  {
    name: 'Charizard',
    description: 'It breathes fire of such great heat that it melts anything. However, it never turns its fiery breath on any opponent weaker than itself.',
    types: JSON.stringify([TYPES.FIRE, TYPES.FLYING]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Blaze', 'Solar Power']),
    isStarter: false,
    unlockCost: 1000,
    moves: [
      { name: 'Wing Attack', description: 'Strikes with wings.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Flamethrower', description: 'Powerful fire stream.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 40, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Fire Blast', description: 'Intense fire attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 30 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Blast Burn', description: 'Ultimate fire attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 3, normal: 1 }), damage: 65, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #007 Squirtle
  {
    name: 'Squirtle',
    description: 'When it retracts its long neck into its shell, it squirts out water with vigorous force.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Torrent']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      { name: 'Tackle', description: 'A physical attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Water Gun', description: 'Shoots water.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Withdraw', description: 'Increases defense.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'defense', value: 25, duration: 2 }]), target: 'Self', slot: 2 },
      { name: 'Bubble Beam', description: 'Bubbles that slow.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([{ type: 'slow', chance: 30 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
];

export { kantoPokemon, TYPES, CLASSES };
