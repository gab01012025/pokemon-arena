/**
 * Seed Gen 2-8 Pokemon - Mission reward Pokemon for Pokemon Arena
 * Execute: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-gen2-8.ts
 */

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
  MELEE: 'Melee', RANGED: 'Ranged', CONTACT: 'Contact',
};

interface PokemonSeed {
  name: string;
  description: string;
  types: string;
  category: string;
  health: number;
  traits: string;
  isStarter: boolean;
  unlockCost: number;
  moves: {
    name: string;
    description: string;
    classes: string;
    cost: string;
    damage: number;
    healing?: number;
    cooldown?: number;
    duration?: number;
    effects: string;
    target: string;
    slot: number;
  }[];
}

const gen2to8Pokemon: PokemonSeed[] = [
  // D Rank rewards
  {
    name: 'Cyndaquil',
    description: 'It is timid, and always curls itself up in a ball. If attacked, it flares up its back for protection.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Common',
    health: 90,
    traits: JSON.stringify(['Blaze']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Ember', description: 'Shoots small flames.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Flame Wheel', description: 'Charges cloaked in fire.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ fire: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Smokescreen', description: 'Reduces enemy accuracy.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'weaken', value: 15, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Quick Attack', description: 'Strikes with speed.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Totodile',
    description: 'Its well-developed jaws are powerful and capable of crushing anything.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Common',
    health: 90,
    traits: JSON.stringify(['Torrent']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Water Gun', description: 'Shoots water.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Bite', description: 'Bites with sharp fangs.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ water: 1, normal: 1 }), damage: 30, cooldown: 1, effects: JSON.stringify([{ type: 'stun', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Scary Face', description: 'Intimidates the target.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'weaken', value: 15, duration: 3 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Aqua Jet', description: 'Quick water dash.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Chikorita',
    description: 'A sweet aroma gently wafts from the leaf on its head. It is docile and loves to soak up sun.',
    types: JSON.stringify([TYPES.GRASS]),
    category: 'Common',
    health: 90,
    traits: JSON.stringify(['Overgrow']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Razor Leaf', description: 'Launches sharp leaves.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Magical Leaf', description: 'Fires mystical leaves.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Synthesis', description: 'Absorbs sunlight to heal.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ grass: 1 }), damage: 0, healing: 25, effects: JSON.stringify([{ type: 'heal', value: 25 }]), target: 'Self', slot: 2 },
      { name: 'Reflect', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Mareep',
    description: 'Its fluffy coat swells to double when static electricity builds up.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Common',
    health: 85,
    traits: JSON.stringify(['Static']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Thunder Shock', description: 'Zaps with electricity.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ lightning: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Electro Ball', description: 'Hurls an electric orb.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ lightning: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([{ type: 'stun', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Cotton Guard', description: 'Fluffs up for protection.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Light Screen', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Shinx',
    description: 'All of its fur dazzles if danger is sensed. It flees while the foe is momentarily blinded.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Common',
    health: 85,
    traits: JSON.stringify(['Intimidate']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Spark', description: 'Charges with electricity.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ lightning: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Thunder Fang', description: 'Bites with electrified fangs.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ lightning: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([{ type: 'stun', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Intimidate', description: 'Weakens the target.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'weaken', value: 20, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Quick Attack', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },

  // C Rank rewards
  {
    name: 'Torchic',
    description: 'A fire burns inside, so it feels very warm to hug. It launches fireballs of 1800 degrees F.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Common',
    health: 85,
    traits: JSON.stringify(['Blaze']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Ember', description: 'Launches a ball of fire.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Fire Spin', description: 'Traps in fire vortex.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 1, normal: 1 }), damage: 15, cooldown: 2, duration: 3, effects: JSON.stringify([{ type: 'trap', damage: 10, duration: 3 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Peck', description: 'Jabs with beak.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Detect', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Mudkip',
    description: 'The fin on its head acts as a radar. It can swim in stormy seas.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Common',
    health: 90,
    traits: JSON.stringify(['Torrent']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Water Gun', description: 'Squirts water.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Mud Shot', description: 'Hurls mud.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 1, normal: 1 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Growl', description: 'Weakens the target.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'weaken', value: 15, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Protect', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Treecko',
    description: 'It quickly scales even vertical walls. It senses humidity with its tail.',
    types: JSON.stringify([TYPES.GRASS]),
    category: 'Common',
    health: 85,
    traits: JSON.stringify(['Overgrow']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Absorb', description: 'Drains energy.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 15, healing: 10, effects: JSON.stringify([{ type: 'drain', value: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Leaf Blade', description: 'Slashes with a sharp leaf.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ grass: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Agility', description: 'Gains damage reduction.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Detect', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Riolu',
    description: 'It has the peculiar power of being able to see emotions as waves.',
    types: JSON.stringify([TYPES.FIGHTING]),
    category: 'Common',
    health: 85,
    traits: JSON.stringify(['Steadfast']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Force Palm', description: 'Strikes with a shockwave.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ fighting: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Vacuum Wave', description: 'Fires fighting aura.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fighting: 1, normal: 1 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Copycat', description: 'Gains damage reduction.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Endure', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Zorua',
    description: 'It disguises itself as other Pokemon to surprise opponents.',
    types: JSON.stringify([TYPES.DARK]),
    category: 'Common',
    health: 85,
    traits: JSON.stringify(['Illusion']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Pursuit', description: 'Chases with dark energy.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ dark: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Night Daze', description: 'Dark shockwave.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ dark: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Scary Face', description: 'Frightens target.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'weaken', value: 20, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Feint Attack', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },

  // B Rank rewards
  {
    name: 'Ralts',
    description: 'It is highly attuned to the emotions of people.',
    types: JSON.stringify([TYPES.PSYCHIC, TYPES.FAIRY]),
    category: 'Common',
    health: 80,
    traits: JSON.stringify(['Synchronize']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Confusion', description: 'Telekinetic wave.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ psychic: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Disarming Voice', description: 'Charming fairy cry.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ psychic: 1, normal: 1 }), damage: 25, cooldown: 1, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Calm Mind', description: 'Focuses mind.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Teleport', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Bagon',
    description: 'Dreaming of one day flying, it practices by leaping off cliffs every day.',
    types: JSON.stringify([TYPES.DRAGON]),
    category: 'Common',
    health: 90,
    traits: JSON.stringify(['Rock Head']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Dragon Breath', description: 'Draconic energy.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Headbutt', description: 'Charges headfirst.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ normal: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([{ type: 'stun', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Dragon Dance', description: 'Boosts power.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Protect', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Absol',
    description: 'It senses coming disasters and appears before people only to warn them.',
    types: JSON.stringify([TYPES.DARK]),
    category: 'Rare',
    health: 95,
    traits: JSON.stringify(['Super Luck']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Night Slash', description: 'Slashes with dark energy.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ dark: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Psycho Cut', description: 'Psychic blades.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ dark: 1, normal: 1 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Swords Dance', description: 'Sharpens its blade.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'boost', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Detect', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Froakie',
    description: 'It secretes flexible bubbles from its chest and back.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Common',
    health: 85,
    traits: JSON.stringify(['Protean']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Water Pulse', description: 'Pulsing water blast.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Bubble Beam', description: 'Rapid bubbles.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Quick Attack', description: 'Strikes with speed.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Smokescreen', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },

  // A Rank rewards
  {
    name: 'Axew',
    description: 'They use their tusks to crush the berries they eat.',
    types: JSON.stringify([TYPES.DRAGON]),
    category: 'Rare',
    health: 90,
    traits: JSON.stringify(['Mold Breaker']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Dragon Claw', description: 'Draconic claw slash.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ normal: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Dragon Pulse', description: 'Draconic shockwave.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ normal: 2 }), damage: 40, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Dragon Dance', description: 'War dance.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Endure', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Deino',
    description: 'Lacking sight, it bumps into things and eats anything that moves.',
    types: JSON.stringify([TYPES.DARK, TYPES.DRAGON]),
    category: 'Rare',
    health: 90,
    traits: JSON.stringify(['Hustle']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Bite', description: 'Bites with dark fangs.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ dark: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Dragon Breath', description: 'Draconic energy.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ dark: 1, normal: 1 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Scary Face', description: 'Intimidates target.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'weaken', value: 20, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Headbutt', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Larvesta',
    description: 'This Pokemon was believed to have been born from the sun.',
    types: JSON.stringify([TYPES.BUG, TYPES.FIRE]),
    category: 'Rare',
    health: 85,
    traits: JSON.stringify(['Flame Body']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Ember', description: 'Launches small flames.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ fire: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Flame Charge', description: 'Charges cloaked in fire.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ fire: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'String Shot', description: 'Weakens the target.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'weaken', value: 15, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Protect', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Honedge',
    description: 'If anyone dares to grab its hilt, it wraps a blue cloth around that person\'s arm and drains their life energy.',
    types: JSON.stringify([TYPES.STEEL, TYPES.GHOST]),
    category: 'Rare',
    health: 90,
    traits: JSON.stringify(['No Guard']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Shadow Sneak', description: 'Strikes from shadows.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ metal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Iron Head', description: 'Steel blade strike.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ metal: 1, normal: 1 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Swords Dance', description: 'Sharpens edge.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'boost', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: "King's Shield", description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },

  // S Rank rewards
  {
    name: 'Beldum',
    description: 'Instead of blood, a powerful magnetic force courses throughout its body.',
    types: JSON.stringify([TYPES.STEEL, TYPES.PSYCHIC]),
    category: 'Rare',
    health: 85,
    traits: JSON.stringify(['Clear Body']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Metal Claw', description: 'Steel claw strike.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ metal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Zen Headbutt', description: 'Psychic charge.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ metal: 1, normal: 1 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Iron Defense', description: 'Hardens body.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 25, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Magnet Rise', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Mimikyu',
    description: 'Its actual appearance is unknown. A scholar who saw what was under its rag died of terror.',
    types: JSON.stringify([TYPES.GHOST, TYPES.FAIRY]),
    category: 'Rare',
    health: 85,
    traits: JSON.stringify(['Disguise']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Shadow Claw', description: 'Ghostly claw slash.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ psychic: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Play Rough', description: 'Playful fairy attack.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ psychic: 1, normal: 1 }), damage: 35, cooldown: 1, effects: JSON.stringify([{ type: 'weaken', value: 10, duration: 1 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Disguise', description: 'Hides under disguise.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'defense', value: 20, duration: 2 }]), target: 'Self', slot: 2 },
      { name: 'Phantom Force', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Dreepy',
    description: 'After being reborn as a ghost Pokemon, Dreepy wanders the areas it used to inhabit.',
    types: JSON.stringify([TYPES.DRAGON, TYPES.GHOST]),
    category: 'Rare',
    health: 80,
    traits: JSON.stringify(['Infiltrator']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Dragon Breath', description: 'Draconic energy.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Shadow Ball', description: 'Shadowy blob.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ psychic: 1, normal: 1 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Infestation', description: 'Drains HP over time.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'drain', value: 10, duration: 3 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Phantom Force', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },

  // Event rewards
  {
    name: 'Gible',
    description: 'It nests in small, horizontal holes in cave walls.',
    types: JSON.stringify([TYPES.DRAGON, TYPES.GROUND]),
    category: 'Rare',
    health: 90,
    traits: JSON.stringify(['Sand Veil']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Dragon Rage', description: 'Draconic fury.', classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]), cost: JSON.stringify({ normal: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sand Tomb', description: 'Traps in sand.', classes: JSON.stringify([CLASSES.PHYSICAL]), cost: JSON.stringify({ normal: 2 }), damage: 15, cooldown: 2, duration: 3, effects: JSON.stringify([{ type: 'trap', damage: 10, duration: 3 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Dragon Dance', description: 'Mystical dance.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 3, effects: JSON.stringify([{ type: 'defense', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Dig', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Rowlet',
    description: 'It sends its feathers, which are as sharp as blades, flying in attack.',
    types: JSON.stringify([TYPES.GRASS, TYPES.FLYING]),
    category: 'Common',
    health: 90,
    traits: JSON.stringify(['Overgrow']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Leafage', description: 'Pelts with leaves.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Razor Leaf', description: 'Razor-sharp leaves.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ grass: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Peck', description: 'Jabs with beak.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Feather Dance', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
  {
    name: 'Larvitar',
    description: 'Born deep underground, it comes aboveground and becomes a pupa once it has finished eating the surrounding soil.',
    types: JSON.stringify([TYPES.ROCK, TYPES.GROUND]),
    category: 'Rare',
    health: 95,
    traits: JSON.stringify(['Guts']),
    isStarter: false,
    unlockCost: 0,
    moves: [
      { name: 'Rock Throw', description: 'Hurls a rock.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.RANGED]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Bite', description: 'Bites with dark energy.', classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.CONTACT]), cost: JSON.stringify({ normal: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Sandstorm', description: 'Whips up a sandstorm.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, duration: 2, effects: JSON.stringify([{ type: 'afflict', value: 10, duration: 2 }]), target: 'AllEnemies', slot: 2 },
      { name: 'Harden', description: 'Becomes invulnerable.', classes: JSON.stringify([CLASSES.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'invulnerable', duration: 1 }]), target: 'Self', slot: 3 },
    ],
  },
];

async function seedGen2to8() {
  console.log('Seeding Gen 2-8 Pokemon (24 total)...');

  for (const pokemon of gen2to8Pokemon) {
    const { moves, ...pokemonData } = pokemon;

    try {
      // Upsert: create if not exists, update if exists
      const existing = await prisma.pokemon.findUnique({
        where: { name: pokemonData.name },
      });

      let createdPokemon;
      if (existing) {
        createdPokemon = await prisma.pokemon.update({
          where: { name: pokemonData.name },
          data: pokemonData,
        });
        // Delete old moves and recreate
        await prisma.move.deleteMany({
          where: { pokemonId: createdPokemon.id },
        });
      } else {
        createdPokemon = await prisma.pokemon.create({
          data: pokemonData,
        });
      }

      for (const move of moves) {
        await prisma.move.create({
          data: {
            ...move,
            pokemonId: createdPokemon.id,
          },
        });
      }
      console.log(`  ${existing ? 'Updated' : 'Created'}: ${pokemon.name}`);
    } catch (error) {
      console.error(`  Error with ${pokemon.name}:`, error);
    }
  }

  console.log('Gen 2-8 seed completed!');
}

seedGen2to8()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
