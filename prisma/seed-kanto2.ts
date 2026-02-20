import { TYPES, CLASSES } from './seed-kanto';

// Kanto Pokemon #008-#014
const kantoPokemon2 = [
  // #008 Wartortle
  {
    name: 'Wartortle',
    description: 'It is recognized as a symbol of longevity. If its shell has algae on it, that Wartortle is very old.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Torrent']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Water Gun', description: 'Shoots water.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Bite', description: 'Bites with fangs.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 25, effects: JSON.stringify([{ type: 'flinch', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Aqua Tail', description: 'Water tail attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ water: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Skull Bash', description: 'Charges then hits.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 40, cooldown: 1, effects: JSON.stringify([{ type: 'defense', value: 15, duration: 1 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #009 Blastoise
  {
    name: 'Blastoise',
    description: 'It crushes its foe under its heavy body to cause fainting. In a pinch, it will withdraw inside its shell.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Torrent', 'Rain Dish']),
    isStarter: false,
    unlockCost: 1000,
    moves: [
      { name: 'Water Pulse', description: 'Pulsing water.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 25, effects: JSON.stringify([{ type: 'confuse', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Aqua Tail', description: 'Water tail attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ water: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Hydro Pump', description: 'Massive water blast.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Hydro Cannon', description: 'Ultimate water attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 3, normal: 1 }), damage: 65, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #010 Caterpie
  {
    name: 'Caterpie',
    description: 'For protection, it releases a horrible stench from the antenna on its head to drive away enemies.',
    types: JSON.stringify([TYPES.BUG]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Shield Dust']),
    isStarter: false,
    unlockCost: 100,
    moves: [
      { name: 'Tackle', description: 'A physical attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'String Shot', description: 'Lowers speed.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ bug: 1 }), damage: 0, effects: JSON.stringify([{ type: 'slow', value: 20, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Bug Bite', description: 'Bites with bug power.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ bug: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Electroweb', description: 'Electric web trap.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ bug: 1, electric: 1 }), damage: 25, effects: JSON.stringify([{ type: 'slow', duration: 1 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #011 Metapod
  {
    name: 'Metapod',
    description: 'Its shell is as hard as an iron slab. A Metapod does not move, staying still so it can evolve inside.',
    types: JSON.stringify([TYPES.BUG]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Shed Skin']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Harden', description: 'Raises defense.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'defense', value: 30, duration: 3 }]), target: 'Self', slot: 0 },
      { name: 'Tackle', description: 'A physical attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Iron Defense', description: 'Greatly raises defense.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 2 }), damage: 0, effects: JSON.stringify([{ type: 'defense', value: 50, duration: 2 }]), target: 'Self', slot: 2 },
      { name: 'Bug Bite', description: 'Bites with bug power.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ bug: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #012 Butterfree
  {
    name: 'Butterfree',
    description: 'It has a superior ability to search for delicious honey from flowers. It can seek, extract, and carry honey.',
    types: JSON.stringify([TYPES.BUG, TYPES.FLYING]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Compound Eyes', 'Tinted Lens']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Gust', description: 'Wind attack.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ flying: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sleep Powder', description: 'Puts enemy to sleep.', classes: JSON.stringify([CLASSES.STATUS, CLASSES.AFFLICTION]), cost: JSON.stringify({ bug: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2, chance: 75 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Psybeam', description: 'Psychic beam.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ psychic: 2 }), damage: 30, effects: JSON.stringify([{ type: 'confuse', chance: 20 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Bug Buzz', description: 'Loud bug sound wave.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ bug: 2 }), damage: 40, cooldown: 1, effects: JSON.stringify([{ type: 'spDefDown', chance: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #013 Weedle
  {
    name: 'Weedle',
    description: 'Beware of the sharp stinger on its head. It hides in grass and bushes where it eats leaves.',
    types: JSON.stringify([TYPES.BUG, TYPES.POISON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Shield Dust']),
    isStarter: false,
    unlockCost: 100,
    moves: [
      { name: 'Poison Sting', description: 'Poisonous stinger.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ poison: 1 }), damage: 15, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 0 },
      { name: 'String Shot', description: 'Lowers speed.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ bug: 1 }), damage: 0, effects: JSON.stringify([{ type: 'slow', value: 20, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Bug Bite', description: 'Bites with bug power.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ bug: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Electroweb', description: 'Electric web trap.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ bug: 1, electric: 1 }), damage: 25, effects: JSON.stringify([{ type: 'slow', duration: 1 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #014 Kakuna
  {
    name: 'Kakuna',
    description: 'Almost incapable of moving, this Pokémon can only harden its shell to protect itself when in danger.',
    types: JSON.stringify([TYPES.BUG, TYPES.POISON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Shed Skin']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Harden', description: 'Raises defense.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'defense', value: 30, duration: 3 }]), target: 'Self', slot: 0 },
      { name: 'Poison Sting', description: 'Poisonous stinger.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ poison: 1 }), damage: 15, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Iron Defense', description: 'Greatly raises defense.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 2 }), damage: 0, effects: JSON.stringify([{ type: 'defense', value: 50, duration: 2 }]), target: 'Self', slot: 2 },
      { name: 'Bug Bite', description: 'Bites with bug power.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ bug: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
];

export { kantoPokemon2 };
