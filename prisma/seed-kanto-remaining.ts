/**
 * Seed remaining Kanto Pokemon (#029-#149) - Base forms + Evolutions
 * These Pokemon exist in battle data but were missing from the database.
 * Execute: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-kanto-remaining.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TYPES = {
  FIRE: 'Fire', WATER: 'Water', GRASS: 'Grass', ELECTRIC: 'Electric',
  PSYCHIC: 'Psychic', FIGHTING: 'Fighting', DARK: 'Dark', DRAGON: 'Dragon',
  NORMAL: 'Normal', GHOST: 'Ghost', POISON: 'Poison', GROUND: 'Ground',
  FLYING: 'Flying', ICE: 'Ice', ROCK: 'Rock', STEEL: 'Steel', FAIRY: 'Fairy', BUG: 'Bug',
};

const CLS = {
  PHYSICAL: 'Physical', SPECIAL: 'Special', STATUS: 'Status',
  MELEE: 'Melee', RANGED: 'Ranged', CONTACT: 'Contact', AFFLICTION: 'Affliction',
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

const remainingKanto: PokemonSeed[] = [
  // ========== NIDORAN LINES ==========
  // #029 NidoranF
  {
    name: 'NidoranF',
    description: 'Although small, its venomous barbs render this Pokémon dangerous. The female has smaller horns.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Poison Point', 'Rivalry']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Scratch', description: 'Scratches with claws.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Poison Sting', description: 'A toxic attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ poison: 1 }), damage: 18, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Bite', description: 'Bites with sharp fangs.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dark: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Double Kick', description: 'Kicks twice in a row.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #030 Nidorina
  {
    name: 'Nidorina',
    description: 'When resting deep in its burrow, its barbs always retract. This is proof that it is relaxed.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Poison Point', 'Rivalry']),
    isStarter: false,
    unlockCost: 400,
    moves: [
      { name: 'Poison Sting', description: 'A toxic attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ poison: 1 }), damage: 20, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Bite', description: 'Bites with sharp fangs.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dark: 1 }), damage: 28, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Double Kick', description: 'Kicks twice in a row.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Toxic', description: 'Badly poisons the target.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ poison: 2 }), damage: 0, effects: JSON.stringify([{ type: 'poison', duration: 4, value: 12 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #031 Nidoqueen
  {
    name: 'Nidoqueen',
    description: 'Its body is encased in extremely hard scales. It uses its hefty bulk to execute powerful moves.',
    types: JSON.stringify([TYPES.POISON, TYPES.GROUND]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Poison Point', 'Sheer Force']),
    isStarter: false,
    unlockCost: 800,
    moves: [
      { name: 'Poison Jab', description: 'Stabs with a poisonous arm.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ poison: 2 }), damage: 35, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Earth Power', description: 'Erupts ground beneath foe.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Superpower', description: 'Mighty physical attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2, normal: 1 }), damage: 50, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Toxic Spikes', description: 'Lays poison traps.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ poison: 1 }), damage: 0, effects: JSON.stringify([{ type: 'poison', duration: 3, value: 10 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #032 NidoranM
  {
    name: 'NidoranM',
    description: 'It scans its surroundings by raising its ears out of the grass. Its toxic horn is for protection.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Poison Point', 'Rivalry']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Peck', description: 'Jabs with its horn.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Poison Sting', description: 'A toxic attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ poison: 1 }), damage: 18, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Horn Attack', description: 'Attacks with its horn.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 28, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Double Kick', description: 'Kicks twice in a row.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #033 Nidorino
  {
    name: 'Nidorino',
    description: 'An aggressive Pokémon that is quick to attack. The horn on its head secretes a powerful venom.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Poison Point', 'Rivalry']),
    isStarter: false,
    unlockCost: 400,
    moves: [
      { name: 'Horn Attack', description: 'Attacks with its horn.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Poison Jab', description: 'A poisonous stab.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ poison: 2 }), damage: 35, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Double Kick', description: 'Kicks twice.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Toxic', description: 'Badly poisons the target.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ poison: 2 }), damage: 0, effects: JSON.stringify([{ type: 'poison', duration: 4, value: 12 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #034 Nidoking
  {
    name: 'Nidoking',
    description: 'Its thick tail packs enormously destructive power. With one swing, it can topple a metal transmission tower.',
    types: JSON.stringify([TYPES.POISON, TYPES.GROUND]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Poison Point', 'Sheer Force']),
    isStarter: false,
    unlockCost: 800,
    moves: [
      { name: 'Poison Jab', description: 'Stabs with a toxic arm.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ poison: 2 }), damage: 40, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Earthquake', description: 'Shakes the ground violently.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2, normal: 1 }), damage: 50, cooldown: 1, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Megahorn', description: 'Rams with a huge horn.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Thrash', description: 'A rampaging attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== FAIRY LINES ==========
  // #035 Clefairy
  {
    name: 'Clefairy',
    description: 'Its adorable behavior and cry make it popular. However, it is rare and found only in certain areas.',
    types: JSON.stringify([TYPES.FAIRY]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Cute Charm', 'Magic Guard']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Pound', description: 'Pounds with stubby arms.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Disarming Voice', description: 'Charms with its voice.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fairy: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Sing', description: 'Puts the enemy to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Moonblast', description: 'Powerful fairy attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fairy: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #036 Clefable
  {
    name: 'Clefable',
    description: 'A timid fairy Pokémon that is rarely seen. It will run and hide the moment it senses people.',
    types: JSON.stringify([TYPES.FAIRY]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Cute Charm', 'Magic Guard']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Moonblast', description: 'Powerful fairy blast.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fairy: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Dazzling Gleam', description: 'Emits a powerful flash.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fairy: 2 }), damage: 35, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Cosmic Power', description: 'Boosts defense greatly.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'defenseUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Metronome', description: 'A random powerful move.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 50, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== FIRE LINES ==========
  // #037 Vulpix
  {
    name: 'Vulpix',
    description: 'At the time of its birth, it has just one tail. As it grows, its tail splits to form six beautiful tails.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Flash Fire', 'Drought']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Ember', description: 'Small flame attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 1 }), damage: 18, effects: JSON.stringify([{ type: 'burn', chance: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Quick Attack', description: 'Fast tackle.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Confuse Ray', description: 'Confuses the enemy.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ ghost: 1 }), damage: 0, effects: JSON.stringify([{ type: 'confuse', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Flamethrower', description: 'Powerful fire breath.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #038 Ninetales
  {
    name: 'Ninetales',
    description: 'Very smart and vengeful. Grabbing one of its tails could result in a thousand-year curse.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Flash Fire', 'Drought']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Flamethrower', description: 'Powerful fire breath.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 40, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Hex', description: 'Attacks with a curse.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ghost: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Confuse Ray', description: 'Confuses the enemy.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ ghost: 1 }), damage: 0, effects: JSON.stringify([{ type: 'confuse', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Fire Blast', description: 'Devastating fire attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([{ type: 'burn', chance: 30 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #039 Jigglypuff
  {
    name: 'Jigglypuff',
    description: 'When its huge eyes waver, it sings a mysteriously soothing melody that lulls its enemies to sleep.',
    types: JSON.stringify([TYPES.NORMAL, TYPES.FAIRY]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Cute Charm', 'Friend Guard']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Pound', description: 'Smacks with body.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Disarming Voice', description: 'Charming fairy cry.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fairy: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Sing', description: 'Puts enemy to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Double Slap', description: 'Slaps multiple times.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 28, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #040 Wigglytuff
  {
    name: 'Wigglytuff',
    description: 'Its fur is extremely fine, dense, and elastic. The exquisitely pleasant fur conveys an image of luxury.',
    types: JSON.stringify([TYPES.NORMAL, TYPES.FAIRY]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Cute Charm', 'Competitive']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Dazzling Gleam', description: 'Powerful fairy flash.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fairy: 2 }), damage: 35, effects: JSON.stringify([]), target: 'AllEnemies', slot: 0 },
      { name: 'Hyper Voice', description: 'Attacks with sound waves.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ normal: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Sing', description: 'Puts enemy to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Play Rough', description: 'Plays rough with the foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fairy: 3 }), damage: 45, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== GRASS/POISON ==========
  // #043 Oddish
  {
    name: 'Oddish',
    description: 'During the day, it keeps its face buried in the ground. At night, it wanders around sowing its seeds.',
    types: JSON.stringify([TYPES.GRASS, TYPES.POISON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Chlorophyll']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Absorb', description: 'Drains HP from the foe.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 15, effects: JSON.stringify([{ type: 'drain', value: 8 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Acid', description: 'Sprays corrosive acid.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ poison: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Sleep Powder', description: 'Scatters sleep powder.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ grass: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Mega Drain', description: 'Drains more HP.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ grass: 2 }), damage: 28, cooldown: 1, effects: JSON.stringify([{ type: 'drain', value: 12 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #044 Gloom
  {
    name: 'Gloom',
    description: 'The fluid that oozes from its mouth is actually sweet honey. It is sticky and clings stubbornly.',
    types: JSON.stringify([TYPES.GRASS, TYPES.POISON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Chlorophyll']),
    isStarter: false,
    unlockCost: 400,
    moves: [
      { name: 'Mega Drain', description: 'Drains HP from foe.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ grass: 1 }), damage: 25, effects: JSON.stringify([{ type: 'drain', value: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Acid', description: 'Sprays corrosive acid.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ poison: 2 }), damage: 30, effects: JSON.stringify([{ type: 'defenseDown', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Sleep Powder', description: 'Scatters sleep powder.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ grass: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Petal Dance', description: 'Scatters petals.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ grass: 3 }), damage: 40, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #045 Vileplume
  {
    name: 'Vileplume',
    description: 'The larger its petals, the more toxic pollen it contains. Its big head is heavy and hard to hold up.',
    types: JSON.stringify([TYPES.GRASS, TYPES.POISON]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Chlorophyll', 'Effect Spore']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Petal Dance', description: 'Scatters sharp petals.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ grass: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sludge Bomb', description: 'Hurls toxic sludge.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ poison: 2 }), damage: 40, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Sleep Powder', description: 'Scatters sleep powder.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ grass: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Solar Beam', description: 'Absorbs light, then blasts.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ grass: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== MEOWTH LINE ==========
  // #052 Meowth (already in game as base)
  {
    name: 'Meowth',
    description: 'It is nocturnal in nature. If it spots something shiny, its eyes glitter brightly.',
    types: JSON.stringify([TYPES.NORMAL]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Pickup', 'Technician']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Scratch', description: 'Scratches with claws.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Bite', description: 'Bites with sharp fangs.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dark: 1 }), damage: 22, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Pay Day', description: 'Throws coins at the foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Slash', description: 'A critical-hit heavy slash.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #053 Persian
  {
    name: 'Persian',
    description: 'Although its fur has many admirers, it is tough to raise as a pet because of its fickle meanness.',
    types: JSON.stringify([TYPES.NORMAL]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Limber', 'Technician']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Slash', description: 'A critical-hit heavy slash.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 30, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Power Gem', description: 'Fires gem energy.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ rock: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Nasty Plot', description: 'Schemes to boost power.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ dark: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 25, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Hyper Beam', description: 'Devastating energy beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== FIRE ==========
  // #058 Growlithe
  {
    name: 'Growlithe',
    description: 'Extremely loyal, it will fearlessly bark at any opponent to protect its own Trainer from harm.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Intimidate', 'Flash Fire']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Ember', description: 'Small flame attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 1 }), damage: 18, effects: JSON.stringify([{ type: 'burn', chance: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Bite', description: 'Bites the foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dark: 1 }), damage: 22, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Flame Wheel', description: 'Charges cloaked in fire.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fire: 2 }), damage: 30, effects: JSON.stringify([{ type: 'burn', chance: 10 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Flamethrower', description: 'Powerful fire breath.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #059 Arcanine
  {
    name: 'Arcanine',
    description: 'A Pokémon that has been admired since the past for its beauty. It runs agilely as if on wings.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Intimidate', 'Flash Fire']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Flamethrower', description: 'Powerful fire breath.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 40, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Extreme Speed', description: 'Blindingly fast tackle.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Crunch', description: 'Bites down hard.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dark: 2 }), damage: 35, effects: JSON.stringify([{ type: 'defenseDown', chance: 20 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Flare Blitz', description: 'Charges with full fire.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fire: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 20 }, { type: 'recoil', value: 15 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== WATER ==========
  // #060 Poliwag
  {
    name: 'Poliwag',
    description: 'Its newly grown legs prevent it from running. It appears to prefer swimming than trying to stand.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Water Absorb', 'Swift Swim']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Water Gun', description: 'Squirts water.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Bubble Beam', description: 'Fires bubbles.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Hypnosis', description: 'Puts the foe to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Body Slam', description: 'Full-body tackle.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #061 Poliwhirl
  {
    name: 'Poliwhirl',
    description: 'Its two legs are well-developed. Even though it can live on the land, it prefers living in water.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Water Absorb', 'Swift Swim']),
    isStarter: false,
    unlockCost: 400,
    moves: [
      { name: 'Water Pulse', description: 'Sonic water attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 25, effects: JSON.stringify([{ type: 'confuse', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Bubble Beam', description: 'Fires powerful bubbles.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 30, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Hypnosis', description: 'Puts the foe to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Surf', description: 'Crashes a huge wave.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 3 }), damage: 40, cooldown: 1, effects: JSON.stringify([]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #062 Poliwrath
  {
    name: 'Poliwrath',
    description: 'An adept swimmer at both the front crawl and breaststroke. It is far faster than the most athletic swimmer.',
    types: JSON.stringify([TYPES.WATER, TYPES.FIGHTING]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Water Absorb', 'Swift Swim']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Waterfall', description: 'Charges up a waterfall.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ water: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Close Combat', description: 'All-out fighting attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 45, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Hypnosis', description: 'Puts the foe to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Hydro Pump', description: 'Blasts pressurized water.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== PSYCHIC ==========
  // #063 Abra
  {
    name: 'Abra',
    description: 'Using its ability to read minds, it will identify impending danger and teleport to safety.',
    types: JSON.stringify([TYPES.PSYCHIC]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Synchronize', 'Inner Focus']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Confusion', description: 'Psychic wave.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 1 }), damage: 18, effects: JSON.stringify([{ type: 'confuse', chance: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Teleport', description: 'Evades an attack.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'evade', duration: 1 }]), target: 'Self', slot: 1 },
      { name: 'Hidden Power', description: 'Mysterious energy.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ normal: 1 }), damage: 22, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Psybeam', description: 'Fires a psychic beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([{ type: 'confuse', chance: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #064 Kadabra
  {
    name: 'Kadabra',
    description: 'It emits special alpha waves from its body that induce headaches just by being close by.',
    types: JSON.stringify([TYPES.PSYCHIC]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Synchronize', 'Inner Focus']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Psybeam', description: 'Fires a psychic beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 1 }), damage: 28, effects: JSON.stringify([{ type: 'confuse', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Psychic', description: 'Powerful telekinesis.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Recover', description: 'Restores HP.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ normal: 2 }), damage: 0, healing: 40, effects: JSON.stringify([]), target: 'Self', slot: 2 },
      { name: 'Shadow Ball', description: 'Shadowy energy blast.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ghost: 2 }), damage: 35, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #065 Alakazam
  {
    name: 'Alakazam',
    description: 'Its brain can outperform a supercomputer. Its IQ is said to be around 5,000.',
    types: JSON.stringify([TYPES.PSYCHIC]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Synchronize', 'Magic Guard']),
    isStarter: false,
    unlockCost: 800,
    moves: [
      { name: 'Psychic', description: 'Powerful telekinesis.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 2 }), damage: 45, effects: JSON.stringify([{ type: 'confuse', chance: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Shadow Ball', description: 'Shadowy energy blast.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ghost: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Calm Mind', description: 'Focuses and boosts power.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Future Sight', description: 'Delayed psychic strike.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== FIGHTING ==========
  // #066 Machop
  {
    name: 'Machop',
    description: 'Loves to build its muscles. It trains in all styles of martial arts to become even stronger.',
    types: JSON.stringify([TYPES.FIGHTING]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Guts', 'No Guard']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Karate Chop', description: 'A sharp chop.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Low Kick', description: 'A sweeping kick.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Bulk Up', description: 'Tenses muscles.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ fighting: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Seismic Toss', description: 'Throws the enemy.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #067 Machoke
  {
    name: 'Machoke',
    description: 'Its muscular body is so powerful, it must wear a power-save belt to control its motions.',
    types: JSON.stringify([TYPES.FIGHTING]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Guts', 'No Guard']),
    isStarter: false,
    unlockCost: 400,
    moves: [
      { name: 'Karate Chop', description: 'A sharp chop.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Brick Break', description: 'Powerful punch.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Bulk Up', description: 'Tenses muscles.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ fighting: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Submission', description: 'A reckless tackle.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2, normal: 1 }), damage: 45, cooldown: 1, effects: JSON.stringify([{ type: 'recoil', value: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #068 Machamp
  {
    name: 'Machamp',
    description: 'It uses its four powerful arms to pin the limbs of its foe, then throws them far away.',
    types: JSON.stringify([TYPES.FIGHTING]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Guts', 'No Guard']),
    isStarter: false,
    unlockCost: 800,
    moves: [
      { name: 'Cross Chop', description: 'A powerful double chop.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Dynamic Punch', description: 'A devastating punch.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 2, normal: 1 }), damage: 50, effects: JSON.stringify([{ type: 'confuse', chance: 50 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Bulk Up', description: 'Tenses muscles.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ fighting: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Close Combat', description: 'An all-out brawl.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fighting: 3 }), damage: 60, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== ROCK/GROUND ==========
  // #074 Geodude
  {
    name: 'Geodude',
    description: 'Found in fields and mountains. Mistaking them for boulders, people often step or trip on them.',
    types: JSON.stringify([TYPES.ROCK, TYPES.GROUND]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Rock Head', 'Sturdy']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Rock Throw', description: 'Throws a rock.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ rock: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Tackle', description: 'A physical charge.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Defense Curl', description: 'Curls up for defense.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'defenseUp', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Magnitude', description: 'Ground shaking attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2 }), damage: 28, cooldown: 1, effects: JSON.stringify([]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #075 Graveler
  {
    name: 'Graveler',
    description: 'Rolls down slopes to move. It rolls over any obstacle without slowing or changing direction.',
    types: JSON.stringify([TYPES.ROCK, TYPES.GROUND]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Rock Head', 'Sturdy']),
    isStarter: false,
    unlockCost: 400,
    moves: [
      { name: 'Rock Slide', description: 'Drops rocks on foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ rock: 2 }), damage: 35, effects: JSON.stringify([{ type: 'stun', chance: 30 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Bulldoze', description: 'Stomps the ground.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2 }), damage: 30, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Rollout', description: 'Rolls into the foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ rock: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Self-Destruct', description: 'Explodes violently.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 60, cooldown: 2, effects: JSON.stringify([{ type: 'recoil', value: 30 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #076 Golem
  {
    name: 'Golem',
    description: 'Its boulder-like body is extremely hard. It can easily withstand dynamite blasts without damage.',
    types: JSON.stringify([TYPES.ROCK, TYPES.GROUND]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Rock Head', 'Sturdy']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Stone Edge', description: 'Sharp stones attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ rock: 2 }), damage: 45, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Earthquake', description: 'Shakes the ground.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2, normal: 1 }), damage: 50, cooldown: 1, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Stealth Rock', description: 'Lays rock traps.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ rock: 1 }), damage: 0, effects: JSON.stringify([{ type: 'trap', duration: 3, damage: 10 }]), target: 'AllEnemies', slot: 2 },
      { name: 'Explosion', description: 'Massive self-destruct.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 75, cooldown: 3, effects: JSON.stringify([{ type: 'recoil', value: 40 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // ========== FIRE ==========
  // #077 Ponyta
  {
    name: 'Ponyta',
    description: 'Its hooves are ten times harder than diamonds. It can trample anything completely flat in little time.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Run Away', 'Flash Fire']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Ember', description: 'Small flame attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 1 }), damage: 18, effects: JSON.stringify([{ type: 'burn', chance: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Stomp', description: 'Stomps hard on foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 22, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Flame Wheel', description: 'Charges cloaked in fire.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fire: 2 }), damage: 30, effects: JSON.stringify([{ type: 'burn', chance: 10 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Fire Spin', description: 'Traps foe in fire.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 25, cooldown: 1, effects: JSON.stringify([{ type: 'trap', duration: 3, damage: 8 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #078 Rapidash
  {
    name: 'Rapidash',
    description: 'Very competitive, this Pokémon will chase anything that moves fast in the hopes of racing it.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Run Away', 'Flash Fire']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Flamethrower', description: 'Powerful fire breath.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 40, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Horn Drill', description: 'A powerful horn attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 38, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Agility', description: 'Boosts speed sharply.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'speedUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Flare Blitz', description: 'Charges with full fire.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ fire: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([{ type: 'burn', chance: 20 }, { type: 'recoil', value: 15 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== WATER/PSYCHIC ==========
  // #079 Slowpoke
  {
    name: 'Slowpoke',
    description: 'Incredibly slow and dopey. It takes five seconds for it to feel pain when under attack.',
    types: JSON.stringify([TYPES.WATER, TYPES.PSYCHIC]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Oblivious', 'Regenerator']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Water Gun', description: 'Squirts water.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Confusion', description: 'Psychic wave.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 1 }), damage: 18, effects: JSON.stringify([{ type: 'confuse', chance: 10 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Yawn', description: 'Makes the foe drowsy.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Water Pulse', description: 'Sonic water attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 28, cooldown: 1, effects: JSON.stringify([{ type: 'confuse', chance: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #080 Slowbro
  {
    name: 'Slowbro',
    description: 'The Shellder that is latched onto Slowpoke\'s tail is said to feed on the host\'s leftover scraps.',
    types: JSON.stringify([TYPES.WATER, TYPES.PSYCHIC]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Oblivious', 'Regenerator']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Psychic', description: 'Powerful telekinesis.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Surf', description: 'Crashes a huge wave.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 40, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Slack Off', description: 'Lazily restores HP.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, healing: 50, effects: JSON.stringify([]), target: 'Self', slot: 2 },
      { name: 'Ice Beam', description: 'Freezing beam of ice.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ice: 2, water: 1 }), damage: 45, cooldown: 1, effects: JSON.stringify([{ type: 'freeze', chance: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== ELECTRIC/STEEL ==========
  // #081 Magnemite
  {
    name: 'Magnemite',
    description: 'Uses anti-gravity to stay suspended. It is attracted by electromagnetic waves emitted by electronics.',
    types: JSON.stringify([TYPES.ELECTRIC, TYPES.STEEL]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Magnet Pull', 'Sturdy']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Thunder Shock', description: 'Electric jolt.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ electric: 1 }), damage: 18, effects: JSON.stringify([{ type: 'paralyze', chance: 10 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Metal Sound', description: 'Screeching metal.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ steel: 1 }), damage: 0, effects: JSON.stringify([{ type: 'defenseDown', value: 15, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Spark', description: 'Electric charge tackle.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ electric: 2 }), damage: 28, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Flash Cannon', description: 'Steel energy beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ steel: 2 }), damage: 32, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #082 Magneton
  {
    name: 'Magneton',
    description: 'Formed by three linked Magnemite. It generates powerful radio waves that raise temperatures.',
    types: JSON.stringify([TYPES.ELECTRIC, TYPES.STEEL]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Magnet Pull', 'Sturdy']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Thunderbolt', description: 'Strong electric bolt.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ electric: 2 }), damage: 40, effects: JSON.stringify([{ type: 'paralyze', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Flash Cannon', description: 'Steel energy beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ steel: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Thunder Wave', description: 'Paralyzes the foe.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ electric: 1 }), damage: 0, effects: JSON.stringify([{ type: 'paralyze', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Discharge', description: 'Electric burst.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ electric: 3 }), damage: 45, cooldown: 1, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // ========== GHOST/POISON ==========
  // #092 Gastly
  {
    name: 'Gastly',
    description: 'Almost invisible, this gaseous Pokémon cloaks the target and puts it to sleep without notice.',
    types: JSON.stringify([TYPES.GHOST, TYPES.POISON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Levitate']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Lick', description: 'Licks with ghostly tongue.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ ghost: 1 }), damage: 15, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Shadow Ball', description: 'Shadowy energy blob.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ghost: 2 }), damage: 28, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Hypnosis', description: 'Puts the foe to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Night Shade', description: 'Ghostly dark attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ghost: 2 }), damage: 25, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #093 Haunter
  {
    name: 'Haunter',
    description: 'If you get the feeling of being watched in darkness when nobody is around, Haunter is there.',
    types: JSON.stringify([TYPES.GHOST, TYPES.POISON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Levitate']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Shadow Ball', description: 'Shadowy energy blob.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ghost: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sludge Bomb', description: 'Hurls toxic sludge.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ poison: 2 }), damage: 35, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Hypnosis', description: 'Puts the foe to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Dream Eater', description: 'Eats dreams for HP.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ psychic: 2 }), damage: 40, cooldown: 1, effects: JSON.stringify([{ type: 'drain', value: 20 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #094 Gengar
  {
    name: 'Gengar',
    description: 'To steal the life of its target, it slips into the prey\'s shadow and silently waits for an opportunity.',
    types: JSON.stringify([TYPES.GHOST, TYPES.POISON]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Cursed Body']),
    isStarter: false,
    unlockCost: 800,
    moves: [
      { name: 'Shadow Ball', description: 'Shadowy energy blob.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ghost: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sludge Bomb', description: 'Hurls toxic sludge.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ poison: 2 }), damage: 40, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Hypnosis', description: 'Puts the foe to sleep.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'sleep', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Shadow Punch', description: 'A ghostly punch.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ ghost: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== ELECTRIC ==========
  // #100 Voltorb
  {
    name: 'Voltorb',
    description: 'Usually found in power plants. It looks like a Poké Ball and can self-destruct without warning.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Soundproof', 'Static']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Spark', description: 'Electric charge.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ electric: 1 }), damage: 18, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Rollout', description: 'Rolls into the foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Thunder Wave', description: 'Paralyzes the foe.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ electric: 1 }), damage: 0, effects: JSON.stringify([{ type: 'paralyze', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Self-Destruct', description: 'Explodes violently.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 2 }), damage: 50, cooldown: 2, effects: JSON.stringify([{ type: 'recoil', value: 25 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #101 Electrode
  {
    name: 'Electrode',
    description: 'It stores electrical energy under very high pressure. It often explodes with little or no provocation.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Soundproof', 'Static']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Thunderbolt', description: 'Strong electric bolt.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ electric: 2 }), damage: 40, effects: JSON.stringify([{ type: 'paralyze', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Discharge', description: 'Electric burst.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ electric: 2 }), damage: 35, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'AllEnemies', slot: 1 },
      { name: 'Thunder Wave', description: 'Paralyzes the foe.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ electric: 1 }), damage: 0, effects: JSON.stringify([{ type: 'paralyze', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Explosion', description: 'Massive self-destruct.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 75, cooldown: 3, effects: JSON.stringify([{ type: 'recoil', value: 40 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // ========== GROUND ==========
  // #104 Cubone
  {
    name: 'Cubone',
    description: 'Because it never removes its skull helmet, no one has ever seen this Pokémon\'s real face.',
    types: JSON.stringify([TYPES.GROUND]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Rock Head', 'Lightning Rod']),
    isStarter: false,
    unlockCost: 200,
    moves: [
      { name: 'Bone Club', description: 'Clubs with a bone.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ ground: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Headbutt', description: 'Rams with its skull.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify([{ type: 'stun', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Focus Energy', description: 'Focuses its power.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 15, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Bonemerang', description: 'Throws bone like boomerang.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #105 Marowak
  {
    name: 'Marowak',
    description: 'The bone it holds is its key weapon. It throws the bone skillfully like a boomerang to KO targets.',
    types: JSON.stringify([TYPES.GROUND]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Rock Head', 'Lightning Rod']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Bonemerang', description: 'Throws bone boomerang.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Earthquake', description: 'Shakes the ground.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ ground: 2, normal: 1 }), damage: 50, cooldown: 1, effects: JSON.stringify([]), target: 'AllEnemies', slot: 1 },
      { name: 'Bone Rush', description: 'Strikes with bone.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ ground: 1 }), damage: 25, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Skull Bash', description: 'Devastating headbutt.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== POISON ==========
  // #109 Koffing
  {
    name: 'Koffing',
    description: 'Because it stores several kinds of toxic gases in its body, it is prone to exploding without warning.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Levitate']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Tackle', description: 'A physical charge.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Sludge', description: 'Toxic sludge attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ poison: 1 }), damage: 22, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Smokescreen', description: 'Reduces accuracy.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'weaken', value: 15, duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Self-Destruct', description: 'Explodes violently.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 2 }), damage: 50, cooldown: 2, effects: JSON.stringify([{ type: 'recoil', value: 25 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // #110 Weezing
  {
    name: 'Weezing',
    description: 'Where two kinds of poison gases meet, two Koffing can fuse into a Weezing over many years.',
    types: JSON.stringify([TYPES.POISON]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Levitate']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Sludge Bomb', description: 'Hurls toxic sludge.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ poison: 2 }), damage: 40, effects: JSON.stringify([{ type: 'poison', chance: 30, duration: 2 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Toxic', description: 'Badly poisons target.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ poison: 1 }), damage: 0, effects: JSON.stringify([{ type: 'poison', duration: 4, value: 12 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Will-O-Wisp', description: 'Burns the foe.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ fire: 1 }), damage: 0, effects: JSON.stringify([{ type: 'burn', duration: 3 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Explosion', description: 'Massive self-destruct.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 75, cooldown: 3, effects: JSON.stringify([{ type: 'recoil', value: 40 }]), target: 'AllEnemies', slot: 3 },
    ],
  },
  // ========== WATER ==========
  // #116 Horsea
  {
    name: 'Horsea',
    description: 'Known to shoot down flying bugs with precision blasts of ink from the surface of the water.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Swift Swim', 'Sniper']),
    isStarter: false,
    unlockCost: 150,
    moves: [
      { name: 'Water Gun', description: 'Squirts water.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Smokescreen', description: 'Reduces accuracy.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ normal: 1 }), damage: 0, effects: JSON.stringify([{ type: 'weaken', value: 15, duration: 2 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Bubble Beam', description: 'Fires powerful bubbles.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 28, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Dragon Pulse', description: 'Dragon energy pulse.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ dragon: 2 }), damage: 32, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #117 Seadra
  {
    name: 'Seadra',
    description: 'Capable of swimming backwards by rapidly flapping its wing-like pectoral fins and stout tail.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Poison Point', 'Sniper']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      { name: 'Hydro Pump', description: 'Blasts pressurized water.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 3 }), damage: 50, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Dragon Pulse', description: 'Dragon energy pulse.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ dragon: 2 }), damage: 38, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Agility', description: 'Boosts speed sharply.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ psychic: 1 }), damage: 0, effects: JSON.stringify([{ type: 'speedUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Ice Beam', description: 'Freezing beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ice: 2 }), damage: 40, cooldown: 1, effects: JSON.stringify([{ type: 'freeze', chance: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== WATER (Magikarp/Gyarados) ==========
  // #129 Magikarp
  {
    name: 'Magikarp',
    description: 'In the distant past, it was somewhat stronger than the horribly weak descendants that exist today.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Swift Swim']),
    isStarter: false,
    unlockCost: 50,
    moves: [
      { name: 'Splash', description: 'Splashes around. Nothing happens.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({}), damage: 0, effects: JSON.stringify([]), target: 'Self', slot: 0 },
      { name: 'Tackle', description: 'A weak tackle.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 10, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Flail', description: 'Flails desperately.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Bounce', description: 'Bounces high then attacks.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 2 }), damage: 25, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #130 Gyarados
  {
    name: 'Gyarados',
    description: 'Once it appears, its rage never settles until it has razed the fields and mountains around it.',
    types: JSON.stringify([TYPES.WATER, TYPES.FLYING]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Intimidate', 'Moxie']),
    isStarter: false,
    unlockCost: 800,
    moves: [
      { name: 'Waterfall', description: 'Charges up a waterfall.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ water: 2 }), damage: 40, effects: JSON.stringify([{ type: 'stun', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Crunch', description: 'Bites down hard.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dark: 2 }), damage: 38, effects: JSON.stringify([{ type: 'defenseDown', chance: 20 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Dragon Dance', description: 'Boosts attack and speed.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ dragon: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Hyper Beam', description: 'Devastating energy beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 60, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== EEVEE LINE ==========
  // #133 Eevee
  {
    name: 'Eevee',
    description: 'Its genetic code is irregular. It may mutate if it is exposed to radiation from elemental stones.',
    types: JSON.stringify([TYPES.NORMAL]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Adaptability', 'Run Away']),
    isStarter: false,
    unlockCost: 300,
    moves: [
      { name: 'Tackle', description: 'A physical charge.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Quick Attack', description: 'Fast strike.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 18, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Bite', description: 'Bites the foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dark: 1 }), damage: 22, effects: JSON.stringify([]), target: 'OneEnemy', slot: 2 },
      { name: 'Swift', description: 'Star-shaped rays hit.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ normal: 2 }), damage: 28, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #134 Vaporeon
  {
    name: 'Vaporeon',
    description: 'It prefers beautiful shores. With cells similar to water molecules, it could melt in water.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Water Absorb']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Water Pulse', description: 'Sonic water attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 2 }), damage: 35, effects: JSON.stringify([{ type: 'confuse', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Hydro Pump', description: 'Blasts pressurized water.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ water: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Acid Armor', description: 'Boosts defense.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ water: 1 }), damage: 0, effects: JSON.stringify([{ type: 'defenseUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Ice Beam', description: 'Freezing beam of ice.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ ice: 2 }), damage: 40, cooldown: 1, effects: JSON.stringify([{ type: 'freeze', chance: 10 }]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #135 Jolteon
  {
    name: 'Jolteon',
    description: 'It accumulates negative ions in the atmosphere to blast out 10,000-volt lightning bolts.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Volt Absorb']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Thunderbolt', description: 'Strong electric bolt.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ electric: 2 }), damage: 40, effects: JSON.stringify([{ type: 'paralyze', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Thunder', description: 'Massive lightning strike.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ electric: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([{ type: 'paralyze', chance: 30 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Thunder Wave', description: 'Paralyzes the foe.', classes: JSON.stringify([CLS.STATUS, CLS.AFFLICTION]), cost: JSON.stringify({ electric: 1 }), damage: 0, effects: JSON.stringify([{ type: 'paralyze', duration: 2 }]), target: 'OneEnemy', slot: 2 },
      { name: 'Pin Missile', description: 'Fires sharp needles.', classes: JSON.stringify([CLS.PHYSICAL, CLS.RANGED]), cost: JSON.stringify({ normal: 2 }), damage: 30, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #136 Flareon
  {
    name: 'Flareon',
    description: 'When storing thermal energy in its body, its temperature could soar to over 1,600 degrees.',
    types: JSON.stringify([TYPES.FIRE]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Flash Fire']),
    isStarter: false,
    unlockCost: 700,
    moves: [
      { name: 'Flamethrower', description: 'Powerful fire breath.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 40, effects: JSON.stringify([{ type: 'burn', chance: 20 }]), target: 'OneEnemy', slot: 0 },
      { name: 'Fire Blast', description: 'Devastating fire attack.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 3 }), damage: 55, cooldown: 2, effects: JSON.stringify([{ type: 'burn', chance: 30 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Lava Plume', description: 'Erupts with fire.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ fire: 2 }), damage: 35, effects: JSON.stringify([{ type: 'burn', chance: 30 }]), target: 'AllEnemies', slot: 2 },
      { name: 'Quick Attack', description: 'Fast strike.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // ========== DRAGON LINE ==========
  // #147 Dratini
  {
    name: 'Dratini',
    description: 'Long considered a mythical Pokémon until recently, when a small colony was found living underwater.',
    types: JSON.stringify([TYPES.DRAGON]),
    category: 'Basic',
    health: 100,
    traits: JSON.stringify(['Shed Skin', 'Marvel Scale']),
    isStarter: false,
    unlockCost: 300,
    moves: [
      { name: 'Dragon Rage', description: 'A blast of dragon energy.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ dragon: 1 }), damage: 20, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Wrap', description: 'Constricts the foe.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ normal: 1 }), damage: 15, effects: JSON.stringify([{ type: 'trap', duration: 2, damage: 5 }]), target: 'OneEnemy', slot: 1 },
      { name: 'Twister', description: 'Whips up a tornado.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ dragon: 1 }), damage: 20, effects: JSON.stringify([]), target: 'AllEnemies', slot: 2 },
      { name: 'Dragon Pulse', description: 'Dragon energy pulse.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ dragon: 2 }), damage: 32, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #148 Dragonair
  {
    name: 'Dragonair',
    description: 'A mystical Pokémon that exudes a gentle aura. It can change the weather near its vicinity.',
    types: JSON.stringify([TYPES.DRAGON]),
    category: 'Evolution',
    health: 100,
    traits: JSON.stringify(['Shed Skin', 'Marvel Scale']),
    isStarter: false,
    unlockCost: 600,
    moves: [
      { name: 'Dragon Pulse', description: 'Dragon energy pulse.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ dragon: 2 }), damage: 38, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Aqua Tail', description: 'Swings a watery tail.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ water: 2 }), damage: 35, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Dragon Dance', description: 'Boosts attack and speed.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ dragon: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Outrage', description: 'Rampaging attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dragon: 3 }), damage: 50, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
  // #149 Dragonite
  {
    name: 'Dragonite',
    description: 'It is said to make its home somewhere in the sea. It guides crews of shipwrecks to shore.',
    types: JSON.stringify([TYPES.DRAGON, TYPES.FLYING]),
    category: 'Final',
    health: 100,
    traits: JSON.stringify(['Inner Focus', 'Multiscale']),
    isStarter: false,
    unlockCost: 1000,
    moves: [
      { name: 'Dragon Claw', description: 'Slashes with claws.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dragon: 2 }), damage: 40, effects: JSON.stringify([]), target: 'OneEnemy', slot: 0 },
      { name: 'Outrage', description: 'Rampaging attack.', classes: JSON.stringify([CLS.PHYSICAL, CLS.MELEE]), cost: JSON.stringify({ dragon: 3 }), damage: 55, cooldown: 1, effects: JSON.stringify([]), target: 'OneEnemy', slot: 1 },
      { name: 'Dragon Dance', description: 'Boosts attack and speed.', classes: JSON.stringify([CLS.STATUS]), cost: JSON.stringify({ dragon: 1 }), damage: 0, effects: JSON.stringify([{ type: 'attackUp', value: 20, duration: 3 }]), target: 'Self', slot: 2 },
      { name: 'Hyper Beam', description: 'Devastating energy beam.', classes: JSON.stringify([CLS.SPECIAL, CLS.RANGED]), cost: JSON.stringify({ normal: 3 }), damage: 65, cooldown: 2, effects: JSON.stringify([]), target: 'OneEnemy', slot: 3 },
    ],
  },
];

async function main() {
  console.log(`Seeding ${remainingKanto.length} remaining Kanto Pokemon...`);

  let created = 0;
  let skipped = 0;

  for (const pokemon of remainingKanto) {
    const { moves, ...pokemonData } = pokemon;

    // Check if already exists
    const existing = await prisma.pokemon.findFirst({
      where: { name: { equals: pokemon.name, mode: 'insensitive' } },
    });

    if (existing) {
      console.log(`  - Skipped ${pokemon.name} (already exists)`);
      skipped++;
      continue;
    }

    const createdPokemon = await prisma.pokemon.create({
      data: pokemonData,
    });

    for (const move of moves) {
      await prisma.move.create({
        data: {
          ...move,
          pokemonId: createdPokemon.id,
        },
      });
    }

    console.log(`  + Created ${pokemon.name}`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
