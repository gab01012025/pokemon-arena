import { TYPES, CLASSES } from './seed-kanto';

// Kanto Pokemon #022-#028
const kantoPokemon4 = [
  // #022 Fearow
  {
    name: 'Fearow',
    description: 'A Pokémon that dates back many years. If it senses danger, it flies high and away, instantly.',
    types: JSON.stringify([TYPES.NORMAL, TYPES.FLYING]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Keen Eye', 'Sniper']),
    isStarter: false,
    unlockCost: 400,
    moves: [
      { name: 'Fury Attack', description: 'Multiple hits.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Aerial Ace', description: 'Never misses.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 2 }), damage: 35, effects: JSON.stringify(['neverMiss']), target: 'OneEnemy', slot: 1 },
      { name: 'Drill Peck', description: 'Spinning peck.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ flying: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Drill Run', description: 'Ground drill attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ ground: 2, flying: 1 }), damage: 45, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #023 Ekans
  {
    name: 'Ekans',
    description: 'The older it gets, the longer it grows. At night, it wraps its long body around tree branches to rest.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Intimidate', 'Shed Skin']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Wrap', description: 'Constricts enemy.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([{ type: 'trap', duration: 2, damage: 5 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Poison Sting', description: 'Poisonous stinger.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ poison: 1 }), damage: 18, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Glare', description: 'Paralyzes enemy.', classes: JSON.stringify([CLASSES.STATUS, CLASSES.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'paralyze', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Acid', description: 'Corrosive acid.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ poison: 2 }), damage: 30, effects: JSON.stringify([{ type: 'defenseDown', chance: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #024 Arbok
  {
    name: 'Arbok',
    description: 'The pattern on its belly is for intimidation. It constricts foes while they are frozen in fear.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Intimidate', 'Shed Skin']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Crunch', description: 'Crushing bite.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ dark: 2 }), damage: 35, effects: JSON.stringify([{ type: 'defenseDown', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Poison Jab', description: 'Poisonous stab.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ poison: 2 }), damage: 40, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Glare', description: 'Paralyzes enemy.', classes: JSON.stringify([CLASSES.STATUS, CLASSES.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'paralyze', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Gunk Shot', description: 'Filthy garbage attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ poison: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #025 Pikachu
  {
    name: 'Pikachu',
    description: 'It stores electricity in its cheeks. When it releases pent-up energy in a burst, the electric power is equal to a lightning bolt.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Static', 'Lightning Rod']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      { name: 'Thunder Shock', description: 'Electric jolt.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ electric: 1 }), damage: 20, effects: JSON.stringify([{ type: 'paralyze', chance: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Quick Attack', description: 'Fast strike.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify(['priority']), target: 'OneEnemy', slot: 1 },
      { name: 'Thunderbolt', description: 'Strong electric.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ electric: 2 }), damage: 40, cooldown: 1, effects: JSON.stringify([{ type: 'paralyze', chance: 20 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Volt Tackle', description: 'Electric charge.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ electric: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([{ type: 'recoil', value: 15 }, { type: 'paralyze', chance: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #026 Raichu
  {
    name: 'Raichu',
    description: 'When electricity builds up inside its body, it becomes feisty. It also glows in the dark.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Static', 'Lightning Rod']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Thunderbolt', description: 'Strong electric.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ electric: 2 }), damage: 40, effects: JSON.stringify([{ type: 'paralyze', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Thunder Punch', description: 'Electric punch.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ electric: 2 }), damage: 35, effects: JSON.stringify([{ type: 'paralyze', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Thunder', description: 'Massive thunder.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ electric: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Volt Tackle', description: 'Electric charge.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ electric: 3, normal: 1 }), damage: 60, cooldown: 2, effects: JSON.stringify([{ type: 'recoil', value: 20 }, { type: 'paralyze', chance: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #027 Sandshrew
  {
    name: 'Sandshrew',
    description: 'It burrows and lives underground. If threatened, it curls itself up into a ball for protection.',
    types: JSON.stringify([TYPES.GROUND]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Sand Veil', 'Sand Rush']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Scratch', description: 'Scratches with claws.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sand Attack', description: 'Lowers accuracy.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ ground: 1 }), damage: 0, effects: JSON.stringify([{ type: 'accuracy', value: -20, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Dig', description: 'Digs underground.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ ground: 2 }), damage: 35, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Rollout', description: 'Rolling attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ rock: 2 }), damage: 30, effects: JSON.stringify([{ type: 'consecutive', multiplier: 2 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #028 Sandslash
  {
    name: 'Sandslash',
    description: 'It curls up and rolls into foes with its back. Its sharp spines inflict severe damage.',
    types: JSON.stringify([TYPES.GROUND]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Sand Veil', 'Sand Rush']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Slash', description: 'Slashes with claws.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 25, effects: JSON.stringify([{ type: 'critBoost', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Earthquake', description: 'Massive ground shake.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ ground: 3 }), damage: 50, cooldown: 1, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Dig', description: 'Digs underground.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ ground: 2 }), damage: 40, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Sandstorm', description: 'Creates sandstorm.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ ground: 2, rock: 1 }), damage: 0, cooldown: 2, effects: JSON.stringify([{ type: 'weather', weather: 'sandstorm', duration: 3 }]), target: 'All', slot: 3 },
    ],
  },
];

export { kantoPokemon4 };
