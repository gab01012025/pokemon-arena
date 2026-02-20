import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Secret key para proteger o endpoint
const SEED_SECRET = process.env.SEED_SECRET || 'kanto-seed-2026';

const TYPES = {
  FIRE: 'Fire', WATER: 'Water', GRASS: 'Grass', ELECTRIC: 'Electric',
  PSYCHIC: 'Psychic', FIGHTING: 'Fighting', DARK: 'Dark', DRAGON: 'Dragon',
  NORMAL: 'Normal', GHOST: 'Ghost', POISON: 'Poison', GROUND: 'Ground',
  FLYING: 'Flying', ICE: 'Ice', ROCK: 'Rock', STEEL: 'Steel', FAIRY: 'Fairy', BUG: 'Bug',
};

const CL = { PHY: 'Physical', SPE: 'Special', STA: 'Status', AFF: 'Affliction', MEL: 'Melee', RAN: 'Ranged', INS: 'Instant' };

interface PokemonMove {
  name: string;
  desc: string;
  classes: string[];
  cost: Record<string, number>;
  damage: number;
  cooldown?: number;
  effects?: unknown[];
  slot: number;
}

interface PokemonData {
  name: string;
  desc: string;
  types: string[];
  category: string;
  isStarter: boolean;
  unlockCost: number;
  traits: string[];
  moves: PokemonMove[];
}

// 28 Kanto Pokemon com ataques oficiais
const kantoPokemon: PokemonData[] = [
  // #001 Bulbasaur
  {
    name: 'Bulbasaur', desc: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    types: [TYPES.GRASS, TYPES.POISON], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Overgrow'],
    moves: [
      { name: 'Tackle', desc: 'A physical attack in which the user charges and slams into the target.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Vine Whip', desc: 'The target is struck with slender, whiplike vines to inflict damage.', classes: [CL.PHY, CL.RAN], cost: { grass: 1 }, damage: 20, slot: 1 },
      { name: 'Leech Seed', desc: 'A seed is planted on the target that steals HP every turn.', classes: [CL.STA], cost: { grass: 1 }, damage: 0, effects: [{ type: 'drain', value: 10, duration: 3 }], slot: 2 },
      { name: 'Razor Leaf', desc: 'Sharp-edged leaves are launched to slash at opposing Pokémon.', classes: [CL.PHY, CL.RAN], cost: { grass: 2 }, damage: 30, cooldown: 1, slot: 3 },
    ]
  },
  // #002 Ivysaur
  {
    name: 'Ivysaur', desc: 'When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.',
    types: [TYPES.GRASS, TYPES.POISON], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Overgrow'],
    moves: [
      { name: 'Razor Leaf', desc: 'Sharp-edged leaves are launched to slash at opposing Pokémon.', classes: [CL.PHY, CL.RAN], cost: { grass: 1 }, damage: 25, slot: 0 },
      { name: 'Poison Powder', desc: 'The user scatters a cloud of poisonous dust that poisons the target.', classes: [CL.STA, CL.AFF], cost: { poison: 1 }, damage: 0, effects: [{ type: 'poison', value: 12, duration: 3 }], slot: 1 },
      { name: 'Sleep Powder', desc: 'The user scatters a big cloud of sleep-inducing dust around the target.', classes: [CL.STA, CL.AFF], cost: { grass: 1 }, damage: 0, effects: [{ type: 'sleep', duration: 2, chance: 75 }], slot: 2 },
      { name: 'Solar Beam', desc: 'A two-turn attack that absorbs light, then blasts a bundled beam.', classes: [CL.SPE, CL.RAN], cost: { grass: 3 }, damage: 50, cooldown: 2, slot: 3 },
    ]
  },
  // #003 Venusaur
  {
    name: 'Venusaur', desc: 'The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.',
    types: [TYPES.GRASS, TYPES.POISON], category: 'Final', isStarter: false, unlockCost: 1000, traits: ['Overgrow', 'Chlorophyll'],
    moves: [
      { name: 'Petal Dance', desc: 'The user attacks by scattering petals for two to three turns.', classes: [CL.SPE, CL.RAN], cost: { grass: 2 }, damage: 40, slot: 0 },
      { name: 'Sludge Bomb', desc: 'Unsanitary sludge is hurled at the target. This may poison the target.', classes: [CL.SPE, CL.RAN], cost: { poison: 2 }, damage: 35, effects: [{ type: 'poison', chance: 30, duration: 2 }], slot: 1 },
      { name: 'Solar Beam', desc: 'A two-turn attack that absorbs light, then blasts a bundled beam.', classes: [CL.SPE, CL.RAN], cost: { grass: 3 }, damage: 55, cooldown: 1, slot: 2 },
      { name: 'Frenzy Plant', desc: 'The user slams the target with an enormous tree. The user must rest next turn.', classes: [CL.SPE, CL.RAN], cost: { grass: 4 }, damage: 70, cooldown: 2, slot: 3 },
    ]
  },
  // #004 Charmander
  {
    name: 'Charmander', desc: 'The flame on its tail shows the strength of its life force. If weak, the flame also burns weakly.',
    types: [TYPES.FIRE], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Blaze'],
    moves: [
      { name: 'Scratch', desc: 'Hard, pointed, sharp claws rake the target to inflict damage.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Ember', desc: 'The target is attacked with small flames. This may leave the target burned.', classes: [CL.SPE, CL.RAN], cost: { fire: 1 }, damage: 20, effects: [{ type: 'burn', chance: 10, duration: 2 }], slot: 1 },
      { name: 'Dragon Rage', desc: 'This attack hits the target with a shock wave of pure rage.', classes: [CL.SPE, CL.RAN], cost: { dragon: 1 }, damage: 25, slot: 2 },
      { name: 'Flamethrower', desc: 'The target is scorched with an intense blast of fire.', classes: [CL.SPE, CL.RAN], cost: { fire: 2 }, damage: 35, cooldown: 1, effects: [{ type: 'burn', chance: 10, duration: 2 }], slot: 3 },
    ]
  },
  // #005 Charmeleon
  {
    name: 'Charmeleon', desc: 'It has a barbaric nature. In battle, it whips its fiery tail around and slashes away with sharp claws.',
    types: [TYPES.FIRE], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Blaze'],
    moves: [
      { name: 'Slash', desc: 'The target is attacked with a slash of claws. Critical hits land more easily.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 25, slot: 0 },
      { name: 'Flamethrower', desc: 'The target is scorched with an intense blast of fire.', classes: [CL.SPE, CL.RAN], cost: { fire: 2 }, damage: 40, effects: [{ type: 'burn', chance: 10, duration: 2 }], slot: 1 },
      { name: 'Fire Fang', desc: 'The user bites with flame-cloaked fangs. This may burn or flinch.', classes: [CL.PHY, CL.MEL], cost: { fire: 1 }, damage: 30, effects: [{ type: 'burn', chance: 20, duration: 2 }], slot: 2 },
      { name: 'Fire Spin', desc: 'The target becomes trapped within a fierce vortex of fire for four to five turns.', classes: [CL.SPE, CL.RAN], cost: { fire: 2 }, damage: 25, effects: [{ type: 'trap', duration: 3, damage: 8 }], slot: 3 },
    ]
  },
  // #006 Charizard
  {
    name: 'Charizard', desc: 'It spits fire that is hot enough to melt boulders. It may cause forest fires by blowing flames.',
    types: [TYPES.FIRE, TYPES.FLYING], category: 'Final', isStarter: false, unlockCost: 1000, traits: ['Blaze', 'Solar Power'],
    moves: [
      { name: 'Wing Attack', desc: 'The target is struck with large, imposing wings spread wide.', classes: [CL.PHY, CL.MEL], cost: { flying: 1 }, damage: 25, slot: 0 },
      { name: 'Flamethrower', desc: 'The target is scorched with an intense blast of fire.', classes: [CL.SPE, CL.RAN], cost: { fire: 2 }, damage: 45, effects: [{ type: 'burn', chance: 10, duration: 2 }], slot: 1 },
      { name: 'Fire Blast', desc: 'The target is attacked with an intense blast of all-consuming fire.', classes: [CL.SPE, CL.RAN], cost: { fire: 3 }, damage: 55, cooldown: 1, effects: [{ type: 'burn', chance: 30, duration: 2 }], slot: 2 },
      { name: 'Blast Burn', desc: 'The target is razed by a fiery explosion. The user must rest next turn.', classes: [CL.SPE, CL.RAN], cost: { fire: 4 }, damage: 75, cooldown: 2, slot: 3 },
    ]
  },
  // #007 Squirtle
  {
    name: 'Squirtle', desc: 'When it retracts its long neck into its shell, it squirts out water with vigorous force.',
    types: [TYPES.WATER], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Torrent'],
    moves: [
      { name: 'Tackle', desc: 'A physical attack in which the user charges and slams into the target.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Water Gun', desc: 'The target is blasted with a forceful shot of water.', classes: [CL.SPE, CL.RAN], cost: { water: 1 }, damage: 20, slot: 1 },
      { name: 'Withdraw', desc: 'The user withdraws into its shell, raising its Defense stat.', classes: [CL.STA], cost: { normal: 1 }, damage: 0, effects: [{ type: 'defense', value: 25, duration: 3 }], slot: 2 },
      { name: 'Bubble Beam', desc: 'A spray of bubbles is forcefully ejected at the target. May lower Speed.', classes: [CL.SPE, CL.RAN], cost: { water: 2 }, damage: 30, cooldown: 1, effects: [{ type: 'slow', chance: 30, duration: 2 }], slot: 3 },
    ]
  },
  // #008 Wartortle
  {
    name: 'Wartortle', desc: 'It is recognized as a symbol of longevity. If its shell has algae on it, that Wartortle is very old.',
    types: [TYPES.WATER], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Torrent'],
    moves: [
      { name: 'Water Pulse', desc: 'The user attacks with a pulsing blast of water. May cause confusion.', classes: [CL.SPE, CL.RAN], cost: { water: 1 }, damage: 25, effects: [{ type: 'confuse', chance: 20, duration: 2 }], slot: 0 },
      { name: 'Bite', desc: 'The target is bitten with sharp fangs. This may make the target flinch.', classes: [CL.PHY, CL.MEL], cost: { dark: 1 }, damage: 25, effects: [{ type: 'flinch', chance: 30 }], slot: 1 },
      { name: 'Aqua Tail', desc: 'The user attacks by swinging its tail as if it were a vicious wave.', classes: [CL.PHY, CL.MEL], cost: { water: 2 }, damage: 35, slot: 2 },
      { name: 'Skull Bash', desc: 'The user tucks in its head to raise Defense, then rams on the next turn.', classes: [CL.PHY, CL.MEL], cost: { normal: 2 }, damage: 45, cooldown: 1, effects: [{ type: 'defense', value: 20, duration: 1 }], slot: 3 },
    ]
  },
  // #009 Blastoise
  {
    name: 'Blastoise', desc: 'It crushes its foe under its heavy body to cause fainting. In a pinch, it will withdraw inside its shell.',
    types: [TYPES.WATER], category: 'Final', isStarter: false, unlockCost: 1000, traits: ['Torrent', 'Rain Dish'],
    moves: [
      { name: 'Water Pulse', desc: 'The user attacks with a pulsing blast of water. May cause confusion.', classes: [CL.SPE, CL.RAN], cost: { water: 1 }, damage: 30, effects: [{ type: 'confuse', chance: 20, duration: 2 }], slot: 0 },
      { name: 'Aqua Tail', desc: 'The user attacks by swinging its tail as if it were a vicious wave.', classes: [CL.PHY, CL.MEL], cost: { water: 2 }, damage: 40, slot: 1 },
      { name: 'Hydro Pump', desc: 'The target is blasted by a huge volume of water launched under great pressure.', classes: [CL.SPE, CL.RAN], cost: { water: 3 }, damage: 55, cooldown: 1, slot: 2 },
      { name: 'Hydro Cannon', desc: 'The target is hit with a watery blast. The user must rest next turn.', classes: [CL.SPE, CL.RAN], cost: { water: 4 }, damage: 75, cooldown: 2, slot: 3 },
    ]
  },
  // #010 Caterpie
  {
    name: 'Caterpie', desc: 'For protection, it releases a horrible stench from the antenna on its head to drive away enemies.',
    types: [TYPES.BUG], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Shield Dust', 'Run Away'],
    moves: [
      { name: 'Tackle', desc: 'A physical attack in which the user charges and slams into the target.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'String Shot', desc: 'Opposing Pokémon are bound with silk blown from the mouth, lowering Speed.', classes: [CL.STA], cost: { bug: 1 }, damage: 0, effects: [{ type: 'slow', value: 25, duration: 2 }], slot: 1 },
      { name: 'Bug Bite', desc: 'The user bites the target. If the target is holding a Berry, the user eats it.', classes: [CL.PHY, CL.MEL], cost: { bug: 1 }, damage: 20, slot: 2 },
      { name: 'Electroweb', desc: 'The user attacks by capturing opposing Pokémon in an electric net.', classes: [CL.SPE, CL.RAN], cost: { electric: 1, bug: 1 }, damage: 25, effects: [{ type: 'slow', duration: 1 }], slot: 3 },
    ]
  },
  // #011 Metapod
  {
    name: 'Metapod', desc: 'Its shell is as hard as an iron slab. A Metapod does not move, staying still so it can evolve.',
    types: [TYPES.BUG], category: 'Evolution', isStarter: false, unlockCost: 200, traits: ['Shed Skin'],
    moves: [
      { name: 'Harden', desc: 'The user stiffens all the muscles in its body to raise its Defense stat.', classes: [CL.STA], cost: { normal: 1 }, damage: 0, effects: [{ type: 'defense', value: 35, duration: 3 }], slot: 0 },
      { name: 'Tackle', desc: 'A physical attack in which the user charges and slams into the target.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 1 },
      { name: 'Iron Defense', desc: 'The user hardens its body like iron, sharply raising its Defense stat.', classes: [CL.STA], cost: { steel: 1 }, damage: 0, effects: [{ type: 'defense', value: 50, duration: 2 }], slot: 2 },
      { name: 'Bug Bite', desc: 'The user bites the target.', classes: [CL.PHY, CL.MEL], cost: { bug: 1 }, damage: 20, slot: 3 },
    ]
  },
  // #012 Butterfree
  {
    name: 'Butterfree', desc: 'It has a superior ability to search for delicious honey from flowers. It can seek, extract, and carry honey.',
    types: [TYPES.BUG, TYPES.FLYING], category: 'Final', isStarter: false, unlockCost: 500, traits: ['Compound Eyes', 'Tinted Lens'],
    moves: [
      { name: 'Gust', desc: 'A gust of wind is whipped up by wings and launched at the target.', classes: [CL.SPE, CL.RAN], cost: { flying: 1 }, damage: 20, slot: 0 },
      { name: 'Sleep Powder', desc: 'The user scatters a big cloud of sleep-inducing dust around the target.', classes: [CL.STA, CL.AFF], cost: { grass: 1 }, damage: 0, effects: [{ type: 'sleep', duration: 2, chance: 75 }], slot: 1 },
      { name: 'Psybeam', desc: 'The target is attacked with a peculiar ray. This may leave the target confused.', classes: [CL.SPE, CL.RAN], cost: { psychic: 2 }, damage: 30, effects: [{ type: 'confuse', chance: 10, duration: 2 }], slot: 2 },
      { name: 'Bug Buzz', desc: 'The user generates a damaging sound wave by vibration. May lower Sp. Def.', classes: [CL.SPE, CL.RAN], cost: { bug: 2 }, damage: 45, cooldown: 1, effects: [{ type: 'spDefDown', chance: 10 }], slot: 3 },
    ]
  },
  // #013 Weedle
  {
    name: 'Weedle', desc: 'Beware of the sharp stinger on its head. It hides in grass and bushes where it eats leaves.',
    types: [TYPES.BUG, TYPES.POISON], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Shield Dust', 'Run Away'],
    moves: [
      { name: 'Poison Sting', desc: 'The user stabs the target with a poisonous stinger. This may poison the target.', classes: [CL.PHY, CL.MEL], cost: { poison: 1 }, damage: 15, effects: [{ type: 'poison', chance: 30, duration: 3 }], slot: 0 },
      { name: 'String Shot', desc: 'Opposing Pokémon are bound with silk blown from the mouth, lowering Speed.', classes: [CL.STA], cost: { bug: 1 }, damage: 0, effects: [{ type: 'slow', value: 25, duration: 2 }], slot: 1 },
      { name: 'Bug Bite', desc: 'The user bites the target.', classes: [CL.PHY, CL.MEL], cost: { bug: 1 }, damage: 20, slot: 2 },
      { name: 'Electroweb', desc: 'The user attacks by capturing opposing Pokémon in an electric net.', classes: [CL.SPE, CL.RAN], cost: { electric: 1, bug: 1 }, damage: 25, effects: [{ type: 'slow', duration: 1 }], slot: 3 },
    ]
  },
  // #014 Kakuna
  {
    name: 'Kakuna', desc: 'Almost incapable of moving, this Pokémon can only harden its shell to protect itself.',
    types: [TYPES.BUG, TYPES.POISON], category: 'Evolution', isStarter: false, unlockCost: 200, traits: ['Shed Skin'],
    moves: [
      { name: 'Harden', desc: 'The user stiffens all the muscles in its body to raise its Defense stat.', classes: [CL.STA], cost: { normal: 1 }, damage: 0, effects: [{ type: 'defense', value: 35, duration: 3 }], slot: 0 },
      { name: 'Poison Sting', desc: 'The user stabs the target with a poisonous stinger.', classes: [CL.PHY, CL.MEL], cost: { poison: 1 }, damage: 15, effects: [{ type: 'poison', chance: 30, duration: 3 }], slot: 1 },
      { name: 'Iron Defense', desc: 'The user hardens its body like iron, sharply raising its Defense stat.', classes: [CL.STA], cost: { steel: 1 }, damage: 0, effects: [{ type: 'defense', value: 50, duration: 2 }], slot: 2 },
      { name: 'Bug Bite', desc: 'The user bites the target.', classes: [CL.PHY, CL.MEL], cost: { bug: 1 }, damage: 20, slot: 3 },
    ]
  },
  // #015 Beedrill
  {
    name: 'Beedrill', desc: 'It has 3 poisonous stingers on its forelegs and tail. They are used to jab its enemy repeatedly.',
    types: [TYPES.BUG, TYPES.POISON], category: 'Final', isStarter: false, unlockCost: 500, traits: ['Swarm', 'Sniper'],
    moves: [
      { name: 'Fury Attack', desc: 'The target is jabbed repeatedly with a horn or beak two to five times.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 20, slot: 0 },
      { name: 'Twineedle', desc: 'The user damages the target twice in succession with appendages. May poison.', classes: [CL.PHY, CL.MEL], cost: { bug: 1 }, damage: 25, effects: [{ type: 'poison', chance: 20, duration: 2 }], slot: 1 },
      { name: 'Poison Jab', desc: 'The target is stabbed with a tentacle or arm steeped in poison.', classes: [CL.PHY, CL.MEL], cost: { poison: 2 }, damage: 40, effects: [{ type: 'poison', chance: 30, duration: 2 }], slot: 2 },
      { name: 'Pin Missile', desc: 'Sharp spikes are shot at the target in rapid succession.', classes: [CL.PHY, CL.RAN], cost: { bug: 2 }, damage: 35, cooldown: 1, slot: 3 },
    ]
  },
  // #016 Pidgey
  {
    name: 'Pidgey', desc: 'Very docile. If attacked, it will often kick up sand to protect itself rather than fight back.',
    types: [TYPES.NORMAL, TYPES.FLYING], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Keen Eye', 'Tangled Feet'],
    moves: [
      { name: 'Tackle', desc: 'A physical attack in which the user charges and slams into the target.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Gust', desc: 'A gust of wind is whipped up by wings and launched at the target.', classes: [CL.SPE, CL.RAN], cost: { flying: 1 }, damage: 20, slot: 1 },
      { name: 'Sand Attack', desc: 'Sand is hurled in the target face, reducing accuracy.', classes: [CL.STA], cost: { ground: 1 }, damage: 0, effects: [{ type: 'accuracy', value: -20, duration: 2 }], slot: 2 },
      { name: 'Quick Attack', desc: 'The user lunges at the target at a speed that makes it almost invisible.', classes: [CL.PHY, CL.MEL, CL.INS], cost: { normal: 1 }, damage: 18, effects: [{ type: 'priority' }], slot: 3 },
    ]
  },
  // #017 Pidgeotto
  {
    name: 'Pidgeotto', desc: 'This Pokémon is full of vitality. It constantly flies around its large territory in search of prey.',
    types: [TYPES.NORMAL, TYPES.FLYING], category: 'Evolution', isStarter: false, unlockCost: 300, traits: ['Keen Eye', 'Tangled Feet'],
    moves: [
      { name: 'Wing Attack', desc: 'The target is struck with large, imposing wings spread wide.', classes: [CL.PHY, CL.MEL], cost: { flying: 1 }, damage: 25, slot: 0 },
      { name: 'Twister', desc: 'The user whips up a vicious tornado to tear at opposing Pokémon.', classes: [CL.SPE, CL.RAN], cost: { dragon: 1 }, damage: 20, effects: [{ type: 'flinch', chance: 20 }], slot: 1 },
      { name: 'Feather Dance', desc: 'The user covers the target body with a mass of down that lowers Attack.', classes: [CL.STA], cost: { flying: 1 }, damage: 0, effects: [{ type: 'attackDown', value: 30, duration: 2 }], slot: 2 },
      { name: 'Aerial Ace', desc: 'The user confounds the target with speed, then slashes. Never misses.', classes: [CL.PHY, CL.MEL], cost: { flying: 2 }, damage: 35, effects: [{ type: 'neverMiss' }], slot: 3 },
    ]
  },
  // #018 Pidgeot
  {
    name: 'Pidgeot', desc: 'This Pokémon flies at Mach 2 speed, seeking prey. Its large talons are feared as wicked weapons.',
    types: [TYPES.NORMAL, TYPES.FLYING], category: 'Final', isStarter: false, unlockCost: 700, traits: ['Keen Eye', 'Big Pecks'],
    moves: [
      { name: 'Wing Attack', desc: 'The target is struck with large, imposing wings spread wide.', classes: [CL.PHY, CL.MEL], cost: { flying: 1 }, damage: 30, slot: 0 },
      { name: 'Air Slash', desc: 'The user attacks with a blade of air that slices even the sky. May flinch.', classes: [CL.SPE, CL.RAN], cost: { flying: 2 }, damage: 40, effects: [{ type: 'flinch', chance: 30 }], slot: 1 },
      { name: 'Hurricane', desc: 'The user attacks by wrapping the opponent in a fierce wind. May confuse.', classes: [CL.SPE, CL.RAN], cost: { flying: 3 }, damage: 55, cooldown: 1, effects: [{ type: 'confuse', chance: 30, duration: 2 }], slot: 2 },
      { name: 'Brave Bird', desc: 'The user tucks in its wings and charges. The user also takes serious damage.', classes: [CL.PHY, CL.MEL], cost: { flying: 3 }, damage: 60, cooldown: 1, effects: [{ type: 'recoil', value: 20 }], slot: 3 },
    ]
  },
  // #019 Rattata
  {
    name: 'Rattata', desc: 'Will chew on anything with its fangs. If you see one, you can be certain that 40 more live in the area.',
    types: [TYPES.NORMAL], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Run Away', 'Guts'],
    moves: [
      { name: 'Tackle', desc: 'A physical attack in which the user charges and slams into the target.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Quick Attack', desc: 'The user lunges at the target at a speed that makes it almost invisible.', classes: [CL.PHY, CL.MEL, CL.INS], cost: { normal: 1 }, damage: 18, effects: [{ type: 'priority' }], slot: 1 },
      { name: 'Bite', desc: 'The target is bitten with sharp fangs. This may make the target flinch.', classes: [CL.PHY, CL.MEL], cost: { dark: 1 }, damage: 25, effects: [{ type: 'flinch', chance: 30 }], slot: 2 },
      { name: 'Hyper Fang', desc: 'The user bites hard on the target with sharp fangs. May make target flinch.', classes: [CL.PHY, CL.MEL], cost: { normal: 2 }, damage: 40, cooldown: 1, effects: [{ type: 'flinch', chance: 10 }], slot: 3 },
    ]
  },
  // #020 Raticate
  {
    name: 'Raticate', desc: 'Its hind feet are webbed. They act as flippers, so it can swim in rivers and hunt for prey.',
    types: [TYPES.NORMAL], category: 'Evolution', isStarter: false, unlockCost: 300, traits: ['Run Away', 'Guts', 'Hustle'],
    moves: [
      { name: 'Quick Attack', desc: 'The user lunges at the target at a speed that makes it almost invisible.', classes: [CL.PHY, CL.MEL, CL.INS], cost: { normal: 1 }, damage: 20, effects: [{ type: 'priority' }], slot: 0 },
      { name: 'Hyper Fang', desc: 'The user bites hard on the target with sharp fangs.', classes: [CL.PHY, CL.MEL], cost: { normal: 2 }, damage: 45, effects: [{ type: 'flinch', chance: 10 }], slot: 1 },
      { name: 'Crunch', desc: 'The user crunches with sharp fangs. May lower target Defense.', classes: [CL.PHY, CL.MEL], cost: { dark: 2 }, damage: 40, effects: [{ type: 'defenseDown', chance: 20, duration: 2 }], slot: 2 },
      { name: 'Super Fang', desc: 'The user chomps hard on the target with sharp fangs. Halves the target HP.', classes: [CL.PHY, CL.MEL], cost: { normal: 2 }, damage: 0, cooldown: 2, effects: [{ type: 'percentDamage', value: 50 }], slot: 3 },
    ]
  },
  // #021 Spearow
  {
    name: 'Spearow', desc: 'Eats bugs in grassy areas. It has to flap its short wings at high speed to stay airborne.',
    types: [TYPES.NORMAL, TYPES.FLYING], category: 'Basic', isStarter: false, unlockCost: 100, traits: ['Keen Eye', 'Sniper'],
    moves: [
      { name: 'Peck', desc: 'The target is jabbed with a sharply pointed beak.', classes: [CL.PHY, CL.MEL], cost: { flying: 1 }, damage: 18, slot: 0 },
      { name: 'Fury Attack', desc: 'The target is jabbed repeatedly with a horn or beak.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 20, slot: 1 },
      { name: 'Aerial Ace', desc: 'The user confounds the target with speed, then slashes. Never misses.', classes: [CL.PHY, CL.MEL], cost: { flying: 2 }, damage: 30, effects: [{ type: 'neverMiss' }], slot: 2 },
      { name: 'Mirror Move', desc: 'The user counters the target by mimicking the last move used.', classes: [CL.STA], cost: { flying: 1 }, damage: 0, effects: [{ type: 'copyLastMove' }], slot: 3 },
    ]
  },
  // #022 Fearow
  {
    name: 'Fearow', desc: 'A Pokémon that dates back many years. If it senses danger, it flies high and away, instantly.',
    types: [TYPES.NORMAL, TYPES.FLYING], category: 'Evolution', isStarter: false, unlockCost: 400, traits: ['Keen Eye', 'Sniper'],
    moves: [
      { name: 'Fury Attack', desc: 'The target is jabbed repeatedly with a horn or beak.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 22, slot: 0 },
      { name: 'Aerial Ace', desc: 'The user confounds the target with speed, then slashes. Never misses.', classes: [CL.PHY, CL.MEL], cost: { flying: 2 }, damage: 35, effects: [{ type: 'neverMiss' }], slot: 1 },
      { name: 'Drill Peck', desc: 'A corkscrewing attack that strikes with a sharp beak.', classes: [CL.PHY, CL.MEL], cost: { flying: 2 }, damage: 45, slot: 2 },
      { name: 'Drill Run', desc: 'The user crashes into the target while rotating its body like a drill.', classes: [CL.PHY, CL.MEL], cost: { ground: 2 }, damage: 45, cooldown: 1, slot: 3 },
    ]
  },
  // #023 Ekans
  {
    name: 'Ekans', desc: 'The older it gets, the longer it grows. At night, it wraps its long body around tree branches to rest.',
    types: [TYPES.POISON], category: 'Basic', isStarter: false, unlockCost: 150, traits: ['Intimidate', 'Shed Skin'],
    moves: [
      { name: 'Wrap', desc: 'A long body, vines, or the like are used to wrap and squeeze the target.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, effects: [{ type: 'trap', duration: 2, damage: 8 }], slot: 0 },
      { name: 'Poison Sting', desc: 'The user stabs the target with a poisonous stinger.', classes: [CL.PHY, CL.MEL], cost: { poison: 1 }, damage: 18, effects: [{ type: 'poison', chance: 30, duration: 3 }], slot: 1 },
      { name: 'Glare', desc: 'The user intimidates the target with the pattern on its belly to paralyze.', classes: [CL.STA, CL.AFF], cost: { normal: 1 }, damage: 0, effects: [{ type: 'paralyze', duration: 2, chance: 100 }], slot: 2 },
      { name: 'Acid', desc: 'Opposing Pokémon are attacked with a spray of harsh acid. May lower Sp. Def.', classes: [CL.SPE, CL.RAN], cost: { poison: 2 }, damage: 30, effects: [{ type: 'spDefDown', chance: 10 }], slot: 3 },
    ]
  },
  // #024 Arbok
  {
    name: 'Arbok', desc: 'The pattern on its belly is for intimidation. It constricts foes while they are frozen in fear.',
    types: [TYPES.POISON], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Intimidate', 'Shed Skin'],
    moves: [
      { name: 'Crunch', desc: 'The user crunches with sharp fangs. May lower target Defense.', classes: [CL.PHY, CL.MEL], cost: { dark: 2 }, damage: 40, effects: [{ type: 'defenseDown', chance: 20, duration: 2 }], slot: 0 },
      { name: 'Poison Jab', desc: 'The target is stabbed with a tentacle steeped in poison.', classes: [CL.PHY, CL.MEL], cost: { poison: 2 }, damage: 45, effects: [{ type: 'poison', chance: 30, duration: 2 }], slot: 1 },
      { name: 'Glare', desc: 'The user intimidates the target with the pattern on its belly to paralyze.', classes: [CL.STA, CL.AFF], cost: { normal: 1 }, damage: 0, effects: [{ type: 'paralyze', duration: 2, chance: 100 }], slot: 2 },
      { name: 'Gunk Shot', desc: 'The user shoots filthy garbage at the target. May poison.', classes: [CL.PHY, CL.RAN], cost: { poison: 3 }, damage: 60, cooldown: 1, effects: [{ type: 'poison', chance: 30, duration: 2 }], slot: 3 },
    ]
  },
  // #025 Pikachu
  {
    name: 'Pikachu', desc: 'When it is angered, it immediately discharges the energy stored in the pouches in its cheeks.',
    types: [TYPES.ELECTRIC], category: 'Starter', isStarter: true, unlockCost: 0, traits: ['Static', 'Lightning Rod'],
    moves: [
      { name: 'Thunder Shock', desc: 'A jolt of electricity crashes down on the target. May cause paralysis.', classes: [CL.SPE, CL.RAN], cost: { electric: 1 }, damage: 20, effects: [{ type: 'paralyze', chance: 10, duration: 1 }], slot: 0 },
      { name: 'Quick Attack', desc: 'The user lunges at the target at a speed that makes it almost invisible.', classes: [CL.PHY, CL.MEL, CL.INS], cost: { normal: 1 }, damage: 18, effects: [{ type: 'priority' }], slot: 1 },
      { name: 'Thunderbolt', desc: 'A strong electric blast crashes down on the target. May cause paralysis.', classes: [CL.SPE, CL.RAN], cost: { electric: 2 }, damage: 45, cooldown: 1, effects: [{ type: 'paralyze', chance: 10, duration: 1 }], slot: 2 },
      { name: 'Volt Tackle', desc: 'The user electrifies itself and charges the target. Causes recoil damage.', classes: [CL.PHY, CL.MEL], cost: { electric: 3 }, damage: 60, cooldown: 1, effects: [{ type: 'recoil', value: 20 }, { type: 'paralyze', chance: 10 }], slot: 3 },
    ]
  },
  // #026 Raichu
  {
    name: 'Raichu', desc: 'If it stores too much electricity, its behavior turns aggressive. To avoid this, it discharges energy.',
    types: [TYPES.ELECTRIC], category: 'Evolution', isStarter: false, unlockCost: 600, traits: ['Static', 'Lightning Rod'],
    moves: [
      { name: 'Thunderbolt', desc: 'A strong electric blast crashes down on the target. May cause paralysis.', classes: [CL.SPE, CL.RAN], cost: { electric: 2 }, damage: 45, effects: [{ type: 'paralyze', chance: 10, duration: 1 }], slot: 0 },
      { name: 'Thunder Punch', desc: 'The target is punched with an electrified fist. May cause paralysis.', classes: [CL.PHY, CL.MEL], cost: { electric: 2 }, damage: 40, effects: [{ type: 'paralyze', chance: 10, duration: 1 }], slot: 1 },
      { name: 'Thunder', desc: 'A wicked thunderbolt is dropped on the target. May cause paralysis.', classes: [CL.SPE, CL.RAN], cost: { electric: 3 }, damage: 60, cooldown: 1, effects: [{ type: 'paralyze', chance: 30, duration: 1 }], slot: 2 },
      { name: 'Volt Tackle', desc: 'The user electrifies itself and charges the target. Causes recoil damage.', classes: [CL.PHY, CL.MEL], cost: { electric: 4 }, damage: 70, cooldown: 2, effects: [{ type: 'recoil', value: 25 }, { type: 'paralyze', chance: 10 }], slot: 3 },
    ]
  },
  // #027 Sandshrew
  {
    name: 'Sandshrew', desc: 'It burrows and lives underground. If threatened, it curls itself up into a ball for protection.',
    types: [TYPES.GROUND], category: 'Basic', isStarter: false, unlockCost: 150, traits: ['Sand Veil', 'Sand Rush'],
    moves: [
      { name: 'Scratch', desc: 'Hard, pointed, sharp claws rake the target to inflict damage.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 15, slot: 0 },
      { name: 'Sand Attack', desc: 'Sand is hurled in the target face, reducing accuracy.', classes: [CL.STA], cost: { ground: 1 }, damage: 0, effects: [{ type: 'accuracy', value: -20, duration: 2 }], slot: 1 },
      { name: 'Dig', desc: 'The user burrows into the ground then attacks on the next turn.', classes: [CL.PHY, CL.MEL], cost: { ground: 2 }, damage: 40, effects: [{ type: 'invulnerable', duration: 1 }], slot: 2 },
      { name: 'Rollout', desc: 'The user continually rolls into the target over five turns.', classes: [CL.PHY, CL.MEL], cost: { rock: 2 }, damage: 30, effects: [{ type: 'consecutive', multiplier: 1.5 }], slot: 3 },
    ]
  },
  // #028 Sandslash
  {
    name: 'Sandslash', desc: 'It curls up and rolls into foes with its back. Its sharp spines inflict severe damage.',
    types: [TYPES.GROUND], category: 'Evolution', isStarter: false, unlockCost: 500, traits: ['Sand Veil', 'Sand Rush'],
    moves: [
      { name: 'Slash', desc: 'The target is attacked with a slash of claws. Critical hits land more easily.', classes: [CL.PHY, CL.MEL], cost: { normal: 1 }, damage: 30, effects: [{ type: 'critBoost', value: 20 }], slot: 0 },
      { name: 'Earthquake', desc: 'The user sets off an earthquake that strikes every Pokémon around it.', classes: [CL.PHY, CL.RAN], cost: { ground: 3 }, damage: 55, cooldown: 1, slot: 1 },
      { name: 'Dig', desc: 'The user burrows into the ground then attacks on the next turn.', classes: [CL.PHY, CL.MEL], cost: { ground: 2 }, damage: 45, effects: [{ type: 'invulnerable', duration: 1 }], slot: 2 },
      { name: 'Sandstorm', desc: 'A five-turn sandstorm is summoned to hurt all types except Rock, Ground, Steel.', classes: [CL.STA], cost: { rock: 2 }, damage: 0, cooldown: 2, effects: [{ type: 'weather', weather: 'sandstorm', duration: 5 }], slot: 3 },
    ]
  },
];

export async function POST(request: NextRequest) {
  try {
    // Verificar secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== SEED_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    // Delete all existing pokemon data
    console.log('Deleting existing data...');
    await prisma.move.deleteMany();
    await prisma.battleSlot.deleteMany();
    await prisma.trainerPokemon.deleteMany();
    await prisma.pokemon.deleteMany();

    // Create all Pokemon
    const created: string[] = [];
    for (const poke of kantoPokemon) {
      const pokemon = await prisma.pokemon.create({
        data: {
          name: poke.name,
          description: poke.desc,
          types: JSON.stringify(poke.types),
          category: poke.category,
          health: 100,
          traits: JSON.stringify(poke.traits),
          isStarter: poke.isStarter,
          unlockCost: poke.unlockCost,
        }
      });

      for (const move of poke.moves) {
        await prisma.move.create({
          data: {
            name: move.name,
            description: move.desc,
            classes: JSON.stringify(move.classes),
            cost: JSON.stringify(move.cost),
            damage: move.damage,
            cooldown: move.cooldown || 0,
            duration: 0,
            healing: 0,
            effects: JSON.stringify(move.effects || []),
            target: 'OneEnemy',
            slot: move.slot,
            pokemonId: pokemon.id,
          }
        });
      }
      created.push(poke.name);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Criados ${created.length} Pokémon de Kanto com ataques oficiais!`,
      pokemon: created 
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erro: ' + (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST com ?secret=kanto-seed-2026 para popular o banco com 28 Pokemon de Kanto' 
  });
}
