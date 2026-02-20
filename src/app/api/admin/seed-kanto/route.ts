import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const ADMIN_USERS = ['admin', 'gab01012025', 'gabriel', 'gab1234'];

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

// All 28 Kanto Pokemon data
const kantoPokemon = [
  { name: 'Bulbasaur', types: [TYPES.GRASS, TYPES.POISON], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Overgrow'],
    moves: [
      { name: 'Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Vine Whip', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { grass: 1 }, damage: 20, slot: 1 },
      { name: 'Leech Seed', classes: [CLASSES.STATUS], cost: { grass: 1 }, damage: 0, effects: [{ type: 'drain', value: 10, duration: 3 }], slot: 2 },
      { name: 'Razor Leaf', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { grass: 2 }, damage: 30, cooldown: 1, slot: 3 },
    ]},
  { name: 'Ivysaur', types: [TYPES.GRASS, TYPES.POISON], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Overgrow'],
    moves: [
      { name: 'Vine Whip', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { grass: 1 }, damage: 20, slot: 0 },
      { name: 'Poison Powder', classes: [CLASSES.STATUS, CLASSES.AFFLICTION], cost: { poison: 1 }, damage: 0, effects: [{ type: 'poison', value: 10, duration: 3 }], slot: 1 },
      { name: 'Razor Leaf', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { grass: 2 }, damage: 30, slot: 2 },
      { name: 'Solar Beam', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { grass: 3 }, damage: 45, cooldown: 2, slot: 3 },
    ]},
  { name: 'Venusaur', types: [TYPES.GRASS, TYPES.POISON], category: 'Final', isStarter: false, unlockCost: 1000, traits: ['Overgrow', 'Thick Fat'],
    moves: [
      { name: 'Razor Leaf', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { grass: 1 }, damage: 25, slot: 0 },
      { name: 'Sludge Bomb', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { poison: 2 }, damage: 35, effects: [{ type: 'poison', chance: 30 }], slot: 1 },
      { name: 'Solar Beam', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { grass: 3 }, damage: 50, cooldown: 1, slot: 2 },
      { name: 'Frenzy Plant', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { grass: 3, normal: 1 }, damage: 60, cooldown: 2, slot: 3 },
    ]},
  { name: 'Charmander', types: [TYPES.FIRE], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Blaze'],
    moves: [
      { name: 'Scratch', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Ember', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 1 }, damage: 20, effects: [{ type: 'burn', chance: 10 }], slot: 1 },
      { name: 'Dragon Rage', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 1, normal: 1 }, damage: 25, slot: 2 },
      { name: 'Flamethrower', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 2 }, damage: 35, cooldown: 1, slot: 3 },
    ]},
  { name: 'Charmeleon', types: [TYPES.FIRE], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Blaze'],
    moves: [
      { name: 'Slash', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 20, slot: 0 },
      { name: 'Flamethrower', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 2 }, damage: 35, slot: 1 },
      { name: 'Fire Fang', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { fire: 1, normal: 1 }, damage: 30, slot: 2 },
      { name: 'Fire Spin', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 2 }, damage: 25, effects: [{ type: 'trap', duration: 2, damage: 10 }], slot: 3 },
    ]},
  { name: 'Charizard', types: [TYPES.FIRE, TYPES.FLYING], category: 'Final', isStarter: false, unlockCost: 1000, traits: ['Blaze', 'Solar Power'],
    moves: [
      { name: 'Wing Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 1 }, damage: 25, slot: 0 },
      { name: 'Flamethrower', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 2 }, damage: 40, slot: 1 },
      { name: 'Fire Blast', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 3 }, damage: 55, cooldown: 1, slot: 2 },
      { name: 'Blast Burn', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { fire: 3, normal: 1 }, damage: 65, cooldown: 2, slot: 3 },
    ]},
  { name: 'Squirtle', types: [TYPES.WATER], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Torrent'],
    moves: [
      { name: 'Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Water Gun', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { water: 1 }, damage: 20, slot: 1 },
      { name: 'Withdraw', classes: [CLASSES.STATUS], cost: { normal: 1 }, damage: 0, effects: [{ type: 'defense', value: 25, duration: 2 }], slot: 2 },
      { name: 'Bubble Beam', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { water: 2 }, damage: 30, cooldown: 1, slot: 3 },
    ]},
  { name: 'Wartortle', types: [TYPES.WATER], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Torrent'],
    moves: [
      { name: 'Water Gun', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { water: 1 }, damage: 20, slot: 0 },
      { name: 'Bite', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 25, slot: 1 },
      { name: 'Aqua Tail', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { water: 2 }, damage: 35, slot: 2 },
      { name: 'Skull Bash', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 2 }, damage: 40, cooldown: 1, slot: 3 },
    ]},
  { name: 'Blastoise', types: [TYPES.WATER], category: 'Final', isStarter: false, unlockCost: 1000, traits: ['Torrent', 'Rain Dish'],
    moves: [
      { name: 'Water Pulse', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { water: 1 }, damage: 25, slot: 0 },
      { name: 'Aqua Tail', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { water: 2 }, damage: 35, slot: 1 },
      { name: 'Hydro Pump', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { water: 3 }, damage: 55, cooldown: 1, slot: 2 },
      { name: 'Hydro Cannon', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { water: 3, normal: 1 }, damage: 65, cooldown: 2, slot: 3 },
    ]},
  { name: 'Caterpie', types: [TYPES.BUG], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Shield Dust'],
    moves: [
      { name: 'Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'String Shot', classes: [CLASSES.STATUS], cost: { bug: 1 }, damage: 0, effects: [{ type: 'slow', value: 20, duration: 2 }], slot: 1 },
      { name: 'Bug Bite', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { bug: 1 }, damage: 20, slot: 2 },
      { name: 'Electroweb', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { bug: 2 }, damage: 25, slot: 3 },
    ]},
  { name: 'Metapod', types: [TYPES.BUG], category: 'Evolution', isStarter: false, unlockCost: 200, traits: ['Shed Skin'],
    moves: [
      { name: 'Harden', classes: [CLASSES.STATUS], cost: { normal: 1 }, damage: 0, effects: [{ type: 'defense', value: 30, duration: 3 }], slot: 0 },
      { name: 'Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 1 },
      { name: 'Iron Defense', classes: [CLASSES.STATUS], cost: { normal: 2 }, damage: 0, effects: [{ type: 'defense', value: 50, duration: 2 }], slot: 2 },
      { name: 'Bug Bite', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { bug: 1 }, damage: 20, slot: 3 },
    ]},
  { name: 'Butterfree', types: [TYPES.BUG, TYPES.FLYING], category: 'Final', isStarter: false, unlockCost: 500, traits: ['Compound Eyes'],
    moves: [
      { name: 'Gust', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { flying: 1 }, damage: 20, slot: 0 },
      { name: 'Sleep Powder', classes: [CLASSES.STATUS, CLASSES.AFFLICTION], cost: { bug: 1 }, damage: 0, effects: [{ type: 'sleep', duration: 2 }], slot: 1 },
      { name: 'Psybeam', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { psychic: 2 }, damage: 30, slot: 2 },
      { name: 'Bug Buzz', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { bug: 2 }, damage: 40, cooldown: 1, slot: 3 },
    ]},
  { name: 'Weedle', types: [TYPES.BUG, TYPES.POISON], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Shield Dust'],
    moves: [
      { name: 'Poison Sting', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { poison: 1 }, damage: 15, effects: [{ type: 'poison', chance: 30 }], slot: 0 },
      { name: 'String Shot', classes: [CLASSES.STATUS], cost: { bug: 1 }, damage: 0, effects: [{ type: 'slow', value: 20, duration: 2 }], slot: 1 },
      { name: 'Bug Bite', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { bug: 1 }, damage: 20, slot: 2 },
      { name: 'Electroweb', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { bug: 2 }, damage: 25, slot: 3 },
    ]},
  { name: 'Kakuna', types: [TYPES.BUG, TYPES.POISON], category: 'Evolution', isStarter: false, unlockCost: 200, traits: ['Shed Skin'],
    moves: [
      { name: 'Harden', classes: [CLASSES.STATUS], cost: { normal: 1 }, damage: 0, effects: [{ type: 'defense', value: 30, duration: 3 }], slot: 0 },
      { name: 'Poison Sting', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { poison: 1 }, damage: 15, slot: 1 },
      { name: 'Iron Defense', classes: [CLASSES.STATUS], cost: { normal: 2 }, damage: 0, effects: [{ type: 'defense', value: 50, duration: 2 }], slot: 2 },
      { name: 'Bug Bite', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { bug: 1 }, damage: 20, slot: 3 },
    ]},
  { name: 'Beedrill', types: [TYPES.BUG, TYPES.POISON], category: 'Final', isStarter: false, unlockCost: 500, traits: ['Swarm', 'Sniper'],
    moves: [
      { name: 'Fury Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 20, slot: 0 },
      { name: 'Poison Jab', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { poison: 2 }, damage: 35, effects: [{ type: 'poison', chance: 30 }], slot: 1 },
      { name: 'Pin Missile', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { bug: 2 }, damage: 30, slot: 2 },
      { name: 'Twineedle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { bug: 1, poison: 1 }, damage: 40, cooldown: 1, slot: 3 },
    ]},
  { name: 'Pidgey', types: [TYPES.NORMAL, TYPES.FLYING], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Keen Eye'],
    moves: [
      { name: 'Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Gust', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { flying: 1 }, damage: 20, slot: 1 },
      { name: 'Sand Attack', classes: [CLASSES.STATUS], cost: { ground: 1 }, damage: 0, effects: [{ type: 'accuracy', value: -20 }], slot: 2 },
      { name: 'Quick Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT], cost: { normal: 1 }, damage: 18, effects: ['priority'], slot: 3 },
    ]},
  { name: 'Pidgeotto', types: [TYPES.NORMAL, TYPES.FLYING], category: 'Evolution', isStarter: false, unlockCost: 300, traits: ['Keen Eye'],
    moves: [
      { name: 'Wing Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 1 }, damage: 25, slot: 0 },
      { name: 'Twister', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { flying: 1, dragon: 1 }, damage: 30, slot: 1 },
      { name: 'Feather Dance', classes: [CLASSES.STATUS], cost: { flying: 1 }, damage: 0, effects: [{ type: 'attackDown', value: 30 }], slot: 2 },
      { name: 'Aerial Ace', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 2 }, damage: 35, slot: 3 },
    ]},
  { name: 'Pidgeot', types: [TYPES.NORMAL, TYPES.FLYING], category: 'Final', isStarter: false, unlockCost: 700, traits: ['Keen Eye', 'Big Pecks'],
    moves: [
      { name: 'Wing Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 1 }, damage: 25, slot: 0 },
      { name: 'Air Slash', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { flying: 2 }, damage: 35, slot: 1 },
      { name: 'Hurricane', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { flying: 3 }, damage: 50, cooldown: 1, slot: 2 },
      { name: 'Brave Bird', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 2, normal: 1 }, damage: 55, cooldown: 1, effects: [{ type: 'recoil', value: 15 }], slot: 3 },
    ]},
  { name: 'Rattata', types: [TYPES.NORMAL], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Run Away', 'Guts'],
    moves: [
      { name: 'Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Quick Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT], cost: { normal: 1 }, damage: 18, effects: ['priority'], slot: 1 },
      { name: 'Bite', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { dark: 1 }, damage: 25, slot: 2 },
      { name: 'Hyper Fang', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 2 }, damage: 35, cooldown: 1, slot: 3 },
    ]},
  { name: 'Raticate', types: [TYPES.NORMAL], category: 'Evolution', isStarter: false, unlockCost: 300, traits: ['Run Away', 'Guts'],
    moves: [
      { name: 'Quick Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT], cost: { normal: 1 }, damage: 18, effects: ['priority'], slot: 0 },
      { name: 'Hyper Fang', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 2 }, damage: 40, slot: 1 },
      { name: 'Crunch', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { dark: 2 }, damage: 35, slot: 2 },
      { name: 'Super Fang', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 2 }, damage: 0, cooldown: 2, effects: [{ type: 'percentDamage', value: 50 }], slot: 3 },
    ]},
  { name: 'Spearow', types: [TYPES.NORMAL, TYPES.FLYING], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Keen Eye', 'Sniper'],
    moves: [
      { name: 'Peck', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 1 }, damage: 18, slot: 0 },
      { name: 'Fury Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 20, slot: 1 },
      { name: 'Aerial Ace', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 2 }, damage: 30, slot: 2 },
      { name: 'Mirror Move', classes: [CLASSES.STATUS], cost: { flying: 1 }, damage: 0, effects: [{ type: 'copyLastMove' }], slot: 3 },
    ]},
  { name: 'Fearow', types: [TYPES.NORMAL, TYPES.FLYING], category: 'Evolution', isStarter: false, unlockCost: 400, traits: ['Keen Eye', 'Sniper'],
    moves: [
      { name: 'Fury Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 20, slot: 0 },
      { name: 'Aerial Ace', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 2 }, damage: 35, slot: 1 },
      { name: 'Drill Peck', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { flying: 2 }, damage: 40, slot: 2 },
      { name: 'Drill Run', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { ground: 2, flying: 1 }, damage: 45, cooldown: 1, slot: 3 },
    ]},
  { name: 'Ekans', types: [TYPES.POISON], category: 'Basic', isStarter: false, unlockCost: 150, traits: ['Intimidate', 'Shed Skin'],
    moves: [
      { name: 'Wrap', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, effects: [{ type: 'trap', duration: 2 }], slot: 0 },
      { name: 'Poison Sting', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { poison: 1 }, damage: 18, effects: [{ type: 'poison', chance: 30 }], slot: 1 },
      { name: 'Glare', classes: [CLASSES.STATUS, CLASSES.AFFLICTION], cost: { normal: 1 }, damage: 0, effects: [{ type: 'paralyze', duration: 2 }], slot: 2 },
      { name: 'Acid', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { poison: 2 }, damage: 30, slot: 3 },
    ]},
  { name: 'Arbok', types: [TYPES.POISON], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Intimidate', 'Shed Skin'],
    moves: [
      { name: 'Crunch', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { dark: 2 }, damage: 35, slot: 0 },
      { name: 'Poison Jab', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { poison: 2 }, damage: 40, effects: [{ type: 'poison', chance: 30 }], slot: 1 },
      { name: 'Glare', classes: [CLASSES.STATUS, CLASSES.AFFLICTION], cost: { normal: 1 }, damage: 0, effects: [{ type: 'paralyze', duration: 2 }], slot: 2 },
      { name: 'Gunk Shot', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { poison: 3 }, damage: 55, cooldown: 1, slot: 3 },
    ]},
  { name: 'Pikachu', types: [TYPES.ELECTRIC], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Static', 'Lightning Rod'],
    moves: [
      { name: 'Thunder Shock', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { electric: 1 }, damage: 20, effects: [{ type: 'paralyze', chance: 10 }], slot: 0 },
      { name: 'Quick Attack', classes: [CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT], cost: { normal: 1 }, damage: 18, effects: ['priority'], slot: 1 },
      { name: 'Thunderbolt', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { electric: 2 }, damage: 40, cooldown: 1, effects: [{ type: 'paralyze', chance: 20 }], slot: 2 },
      { name: 'Volt Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { electric: 3 }, damage: 55, cooldown: 1, effects: [{ type: 'recoil', value: 15 }], slot: 3 },
    ]},
  { name: 'Raichu', types: [TYPES.ELECTRIC], category: 'Evolution', isStarter: false, unlockCost: 600, traits: ['Static', 'Lightning Rod'],
    moves: [
      { name: 'Thunderbolt', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { electric: 2 }, damage: 40, effects: [{ type: 'paralyze', chance: 20 }], slot: 0 },
      { name: 'Thunder Punch', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { electric: 2 }, damage: 35, slot: 1 },
      { name: 'Thunder', classes: [CLASSES.SPECIAL, CLASSES.RANGED], cost: { electric: 3 }, damage: 55, cooldown: 1, effects: [{ type: 'paralyze', chance: 30 }], slot: 2 },
      { name: 'Volt Tackle', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { electric: 3, normal: 1 }, damage: 60, cooldown: 2, effects: [{ type: 'recoil', value: 20 }], slot: 3 },
    ]},
  { name: 'Sandshrew', types: [TYPES.GROUND], category: 'Basic', isStarter: false, unlockCost: 150, traits: ['Sand Veil'],
    moves: [
      { name: 'Scratch', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Sand Attack', classes: [CLASSES.STATUS], cost: { ground: 1 }, damage: 0, effects: [{ type: 'accuracy', value: -20 }], slot: 1 },
      { name: 'Dig', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { ground: 2 }, damage: 35, slot: 2 },
      { name: 'Rollout', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { rock: 2 }, damage: 30, slot: 3 },
    ]},
  { name: 'Sandslash', types: [TYPES.GROUND], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Sand Veil', 'Sand Rush'],
    moves: [
      { name: 'Slash', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { normal: 1 }, damage: 25, slot: 0 },
      { name: 'Earthquake', classes: [CLASSES.PHYSICAL, CLASSES.RANGED], cost: { ground: 3 }, damage: 50, cooldown: 1, slot: 1 },
      { name: 'Dig', classes: [CLASSES.PHYSICAL, CLASSES.MELEE], cost: { ground: 2 }, damage: 40, slot: 2 },
      { name: 'Sandstorm', classes: [CLASSES.STATUS], cost: { ground: 2, rock: 1 }, damage: 0, cooldown: 2, effects: [{ type: 'weather', weather: 'sandstorm' }], slot: 3 },
    ]},
];

export async function POST() {
  try {
    const session = await getSession();
    
    if (!session || !ADMIN_USERS.includes(session.user?.username?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Delete all existing data
    await prisma.move.deleteMany();
    await prisma.battleSlot.deleteMany();
    await prisma.battle.deleteMany();
    await prisma.trainerPokemon.deleteMany();
    await prisma.pokemon.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.season.deleteMany();

    // Create all Pokemon
    const created: string[] = [];
    for (const poke of kantoPokemon) {
      const pokemon = await prisma.pokemon.create({
        data: {
          name: poke.name,
          description: `The ${poke.name} Pokémon from Kanto region.`,
          types: JSON.stringify(poke.types),
          category: poke.category,
          health: 100,
          traits: JSON.stringify(poke.traits),
          isStarter: poke.isStarter,
          unlockCost: poke.unlockCost,
        }
      });

      for (const move of poke.moves) {
        const moveData = move as { name: string; classes: string[]; cost: Record<string, number>; damage: number; slot: number; cooldown?: number; effects?: unknown[] };
        await prisma.move.create({
          data: {
            name: moveData.name,
            description: `${moveData.name} attack.`,
            classes: JSON.stringify(moveData.classes),
            cost: JSON.stringify(moveData.cost),
            damage: moveData.damage,
            cooldown: moveData.cooldown || 0,
            duration: 0,
            healing: 0,
            effects: JSON.stringify(moveData.effects || []),
            target: 'OneEnemy',
            slot: moveData.slot,
            pokemonId: pokemon.id,
          }
        });
      }
      created.push(poke.name);
    }

    // Create season
    await prisma.season.create({
      data: {
        name: 'Season 1 - Kanto',
        number: 1,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-04-01'),
        isActive: true,
        rewards: JSON.stringify({ top1: { title: 'Pokemon Master', exp: 10000 } }),
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Criados ${created.length} Pokémon de Kanto!`,
      pokemon: created 
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erro ao popular banco: ' + (error as Error).message }, { status: 500 });
  }
}
