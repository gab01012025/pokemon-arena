import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pokemon Types for energy system
const TYPES = {
  FIRE: 'Fire',
  WATER: 'Water',
  GRASS: 'Grass',
  ELECTRIC: 'Electric',
  PSYCHIC: 'Psychic',
  FIGHTING: 'Fighting',
  DARK: 'Dark',
  DRAGON: 'Dragon',
  NORMAL: 'Normal',
  GHOST: 'Ghost',
  POISON: 'Poison',
  GROUND: 'Ground',
  FLYING: 'Flying',
  ICE: 'Ice',
  ROCK: 'Rock',
  STEEL: 'Steel',
  FAIRY: 'Fairy',
  BUG: 'Bug',
};

// Move classes (like Naruto Arena)
const CLASSES = {
  PHYSICAL: 'Physical',
  SPECIAL: 'Special',
  STATUS: 'Status',
  AFFLICTION: 'Affliction',
  MENTAL: 'Mental',
  INSTANT: 'Instant',
  ACTION: 'Action',
  MELEE: 'Melee',
  RANGED: 'Ranged',
};

// Starter Pokemon Data
const starterPokemon = [
  {
    name: 'Pikachu',
    description: 'The Electric Mouse Pokémon. It stores electricity in its cheeks and releases it in lightning-based attacks.',
    types: JSON.stringify([TYPES.ELECTRIC]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Electric Surge', 'Speed Boost']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      {
        name: 'Thunder Shock',
        description: 'Pikachu releases a jolt of electricity that deals 20 damage to one enemy.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED, CLASSES.INSTANT]),
        cost: JSON.stringify({ electric: 1 }),
        damage: 20,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Quick Attack',
        description: 'Pikachu strikes with incredible speed, dealing 15 damage. This skill always goes first.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT]),
        cost: JSON.stringify({ normal: 1 }),
        damage: 15,
        effects: JSON.stringify(['priority']),
        target: 'OneEnemy',
        slot: 1,
      },
      {
        name: 'Thunderbolt',
        description: 'A powerful electric attack that deals 35 damage and has a 20% chance to stun.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ electric: 2 }),
        cooldown: 1,
        damage: 35,
        effects: JSON.stringify([{ type: 'stun', chance: 20, duration: 1 }]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Volt Tackle',
        description: 'Pikachu charges with electricity, dealing 50 damage to one enemy. Pikachu takes 15 recoil damage.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]),
        cost: JSON.stringify({ electric: 2, normal: 1 }),
        cooldown: 2,
        damage: 50,
        effects: JSON.stringify([{ type: 'recoil', value: 15 }]),
        target: 'OneEnemy',
        slot: 3,
      },
    ],
  },
  {
    name: 'Charizard',
    description: 'The Flame Pokémon. It breathes fire of such great heat that it melts anything.',
    types: JSON.stringify([TYPES.FIRE, TYPES.FLYING]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Blaze', 'Solar Power']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      {
        name: 'Ember',
        description: 'Charizard shoots small flames that deal 20 damage to one enemy.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED, CLASSES.INSTANT]),
        cost: JSON.stringify({ fire: 1 }),
        damage: 20,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Wing Attack',
        description: 'Charizard strikes with its powerful wings, dealing 25 damage.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]),
        cost: JSON.stringify({ flying: 1 }),
        damage: 25,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 1,
      },
      {
        name: 'Flamethrower',
        description: 'Charizard breathes intense flames, dealing 35 damage with 20% burn chance.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ fire: 2 }),
        cooldown: 1,
        damage: 35,
        effects: JSON.stringify([{ type: 'burn', chance: 20, duration: 3, damage: 5 }]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Fire Blast',
        description: 'A devastating fire attack that deals 45 damage to all enemies.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ fire: 2, normal: 1 }),
        cooldown: 3,
        damage: 45,
        effects: JSON.stringify([]),
        target: 'AllEnemies',
        slot: 3,
      },
    ],
  },
  {
    name: 'Blastoise',
    description: 'The Shellfish Pokémon. It crushes its foe under its heavy body. Its water cannons are precise.',
    types: JSON.stringify([TYPES.WATER]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Torrent', 'Rain Dish']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      {
        name: 'Water Gun',
        description: 'Blastoise shoots water from its cannons, dealing 20 damage.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED, CLASSES.INSTANT]),
        cost: JSON.stringify({ water: 1 }),
        damage: 20,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Rapid Spin',
        description: 'Blastoise spins rapidly, dealing 15 damage and removing debuffs.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]),
        cost: JSON.stringify({ normal: 1 }),
        damage: 15,
        effects: JSON.stringify([{ type: 'cleanse', target: 'self' }]),
        target: 'OneEnemy',
        slot: 1,
      },
      {
        name: 'Hydro Pump',
        description: 'Blastoise fires a powerful jet of water, dealing 40 damage.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ water: 2 }),
        cooldown: 1,
        damage: 40,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Shell Smash',
        description: 'Blastoise retreats into its shell, reducing damage by 50% for 2 turns.',
        classes: JSON.stringify([CLASSES.STATUS]),
        cost: JSON.stringify({ water: 1, normal: 1 }),
        duration: 2,
        effects: JSON.stringify([{ type: 'defense', value: 50, target: 'self' }]),
        target: 'Self',
        slot: 3,
      },
    ],
  },
  {
    name: 'Venusaur',
    description: 'The Seed Pokémon. Its plant blooms when it absorbs solar energy.',
    types: JSON.stringify([TYPES.GRASS, TYPES.POISON]),
    category: 'Starter',
    health: 100,
    traits: JSON.stringify(['Overgrow', 'Chlorophyll']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      {
        name: 'Vine Whip',
        description: 'Venusaur strikes with vines, dealing 20 damage.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT]),
        cost: JSON.stringify({ grass: 1 }),
        damage: 20,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Poison Powder',
        description: 'Venusaur spreads toxic spores, poisoning one enemy for 3 turns.',
        classes: JSON.stringify([CLASSES.STATUS, CLASSES.AFFLICTION]),
        cost: JSON.stringify({ poison: 1 }),
        duration: 3,
        effects: JSON.stringify([{ type: 'poison', damage: 10, duration: 3 }]),
        target: 'OneEnemy',
        slot: 1,
      },
      {
        name: 'Solar Beam',
        description: 'Venusaur charges solar energy, then blasts 50 damage. Requires 1 turn charge.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ grass: 2, normal: 1 }),
        cooldown: 2,
        damage: 50,
        effects: JSON.stringify([{ type: 'charge', turns: 1 }]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Leech Seed',
        description: 'Venusaur plants seeds that drain 10 HP per turn for 3 turns.',
        classes: JSON.stringify([CLASSES.STATUS, CLASSES.AFFLICTION]),
        cost: JSON.stringify({ grass: 1 }),
        duration: 3,
        effects: JSON.stringify([{ type: 'drain', damage: 10, heal: 10, duration: 3 }]),
        target: 'OneEnemy',
        slot: 3,
      },
    ],
  },
  {
    name: 'Gengar',
    description: 'The Shadow Pokémon. It hides in shadows and drains the life force of those it traps.',
    types: JSON.stringify([TYPES.GHOST, TYPES.POISON]),
    category: 'Starter',
    health: 90,
    traits: JSON.stringify(['Cursed Body', 'Levitate']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      {
        name: 'Shadow Ball',
        description: 'Gengar hurls a shadowy blob that deals 25 damage.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ ghost: 1 }),
        damage: 25,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Hypnosis',
        description: 'Gengar uses hypnotic powers to put an enemy to sleep for 1 turn.',
        classes: JSON.stringify([CLASSES.STATUS, CLASSES.MENTAL]),
        cost: JSON.stringify({ psychic: 1 }),
        cooldown: 2,
        effects: JSON.stringify([{ type: 'stun', duration: 1 }]),
        target: 'OneEnemy',
        slot: 1,
      },
      {
        name: 'Dream Eater',
        description: 'Gengar eats the dreams of a sleeping enemy, dealing 40 damage and healing 20 HP.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.MENTAL]),
        cost: JSON.stringify({ ghost: 1, psychic: 1 }),
        damage: 40,
        healing: 20,
        effects: JSON.stringify([{ type: 'requireStatus', status: 'sleep' }]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Destiny Bond',
        description: 'If Gengar is knocked out this turn, the attacker is also knocked out.',
        classes: JSON.stringify([CLASSES.STATUS]),
        cost: JSON.stringify({ ghost: 2 }),
        cooldown: 4,
        duration: 1,
        effects: JSON.stringify([{ type: 'destinyBond' }]),
        target: 'Self',
        slot: 3,
      },
    ],
  },
  {
    name: 'Machamp',
    description: 'The Superpower Pokémon. Its four powerful arms throw devastating punches.',
    types: JSON.stringify([TYPES.FIGHTING]),
    category: 'Starter',
    health: 110,
    traits: JSON.stringify(['Guts', 'No Guard']),
    isStarter: true,
    unlockCost: 0,
    moves: [
      {
        name: 'Karate Chop',
        description: 'Machamp delivers a quick chop dealing 20 damage.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE, CLASSES.INSTANT]),
        cost: JSON.stringify({ fighting: 1 }),
        damage: 20,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Bulk Up',
        description: 'Machamp tenses its muscles, increasing damage dealt by 25% for 3 turns.',
        classes: JSON.stringify([CLASSES.STATUS]),
        cost: JSON.stringify({ fighting: 1 }),
        duration: 3,
        effects: JSON.stringify([{ type: 'attackBoost', value: 25, duration: 3 }]),
        target: 'Self',
        slot: 1,
      },
      {
        name: 'Cross Chop',
        description: 'Machamp delivers a double chop dealing 35 damage with high crit chance.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]),
        cost: JSON.stringify({ fighting: 2 }),
        cooldown: 1,
        damage: 35,
        effects: JSON.stringify([{ type: 'critBoost', value: 30 }]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Dynamic Punch',
        description: 'A powerful punch that deals 45 damage and confuses the target.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]),
        cost: JSON.stringify({ fighting: 2, normal: 1 }),
        cooldown: 2,
        damage: 45,
        effects: JSON.stringify([{ type: 'confuse', duration: 2 }]),
        target: 'OneEnemy',
        slot: 3,
      },
    ],
  },
];

// Unlockable Pokemon (via Missions)
const unlockablePokemon = [
  {
    name: 'Mewtwo',
    description: 'The Genetic Pokémon. Created by science, it is the most powerful Pokémon.',
    types: JSON.stringify([TYPES.PSYCHIC]),
    category: 'Legendary',
    health: 100,
    traits: JSON.stringify(['Pressure', 'Unnerve']),
    isStarter: false,
    unlockCost: 1000,
    moves: [
      {
        name: 'Psychic',
        description: 'A powerful telekinetic attack dealing 35 damage.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.MENTAL]),
        cost: JSON.stringify({ psychic: 2 }),
        damage: 35,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Barrier',
        description: 'Mewtwo creates a psychic barrier, reducing damage by 50% for 2 turns.',
        classes: JSON.stringify([CLASSES.STATUS]),
        cost: JSON.stringify({ psychic: 1 }),
        duration: 2,
        effects: JSON.stringify([{ type: 'defense', value: 50 }]),
        target: 'Self',
        slot: 1,
      },
      {
        name: 'Psystrike',
        description: 'Mewtwo creates a psychic wave dealing 45 damage to all enemies.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.MENTAL]),
        cost: JSON.stringify({ psychic: 2, normal: 1 }),
        cooldown: 2,
        damage: 45,
        effects: JSON.stringify([]),
        target: 'AllEnemies',
        slot: 2,
      },
      {
        name: 'Shadow Ball',
        description: 'Mewtwo hurls a shadowy blob dealing 30 damage.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ ghost: 1, normal: 1 }),
        damage: 30,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 3,
      },
    ],
  },
  {
    name: 'Dragonite',
    description: 'The Dragon Pokémon. It can circle the globe in just 16 hours.',
    types: JSON.stringify([TYPES.DRAGON, TYPES.FLYING]),
    category: 'Rare',
    health: 110,
    traits: JSON.stringify(['Inner Focus', 'Multiscale']),
    isStarter: false,
    unlockCost: 500,
    moves: [
      {
        name: 'Dragon Claw',
        description: 'Dragonite slashes with sharp claws, dealing 25 damage.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]),
        cost: JSON.stringify({ dragon: 1 }),
        damage: 25,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Dragon Dance',
        description: 'Dragonite performs a mystical dance, boosting attack and speed by 20%.',
        classes: JSON.stringify([CLASSES.STATUS]),
        cost: JSON.stringify({ dragon: 1 }),
        duration: 3,
        effects: JSON.stringify([{ type: 'attackBoost', value: 20 }, { type: 'speedBoost', value: 20 }]),
        target: 'Self',
        slot: 1,
      },
      {
        name: 'Outrage',
        description: 'Dragonite rampages dealing 40 damage for 2-3 turns, then becomes confused.',
        classes: JSON.stringify([CLASSES.PHYSICAL, CLASSES.MELEE]),
        cost: JSON.stringify({ dragon: 2 }),
        cooldown: 2,
        damage: 40,
        effects: JSON.stringify([{ type: 'multi', turns: 2 }, { type: 'confuse', duration: 1, afterEffect: true }]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Hyper Beam',
        description: 'Dragonite fires a powerful beam dealing 60 damage. Must recharge next turn.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.RANGED]),
        cost: JSON.stringify({ dragon: 2, normal: 2 }),
        cooldown: 3,
        damage: 60,
        effects: JSON.stringify([{ type: 'recharge', turns: 1 }]),
        target: 'OneEnemy',
        slot: 3,
      },
    ],
  },
  {
    name: 'Alakazam',
    description: 'The Psi Pokémon. Its brain continually grows, infinitely amplifying its psychic powers.',
    types: JSON.stringify([TYPES.PSYCHIC]),
    category: 'Rare',
    health: 85,
    traits: JSON.stringify(['Synchronize', 'Inner Focus']),
    isStarter: false,
    unlockCost: 300,
    moves: [
      {
        name: 'Confusion',
        description: 'Alakazam attacks with a telekinetic force, dealing 20 damage.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.MENTAL]),
        cost: JSON.stringify({ psychic: 1 }),
        damage: 20,
        effects: JSON.stringify([]),
        target: 'OneEnemy',
        slot: 0,
      },
      {
        name: 'Calm Mind',
        description: 'Alakazam focuses its mind, boosting special attack and defense by 25%.',
        classes: JSON.stringify([CLASSES.STATUS]),
        cost: JSON.stringify({ psychic: 1 }),
        duration: 3,
        effects: JSON.stringify([{ type: 'spAttackBoost', value: 25 }, { type: 'spDefenseBoost', value: 25 }]),
        target: 'Self',
        slot: 1,
      },
      {
        name: 'Psychic',
        description: 'A strong telekinetic attack dealing 35 damage with 20% chance to lower defense.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.MENTAL]),
        cost: JSON.stringify({ psychic: 2 }),
        cooldown: 1,
        damage: 35,
        effects: JSON.stringify([{ type: 'defenseDown', value: 20, chance: 20 }]),
        target: 'OneEnemy',
        slot: 2,
      },
      {
        name: 'Future Sight',
        description: 'Alakazam predicts an attack that will hit 2 turns later for 50 damage.',
        classes: JSON.stringify([CLASSES.SPECIAL, CLASSES.MENTAL]),
        cost: JSON.stringify({ psychic: 2, normal: 1 }),
        cooldown: 3,
        damage: 50,
        effects: JSON.stringify([{ type: 'delayed', turns: 2 }]),
        target: 'OneEnemy',
        slot: 3,
      },
    ],
  },
];

// Initial Missions
const missions = [
  {
    name: 'Starter Journey',
    description: 'Win 5 battles to prove yourself as a Pokemon Trainer.',
    category: 'Story',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1 }),
    objectives: JSON.stringify({ wins: 5 }),
    rewardExp: 100,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Electric Mastery',
    description: 'Win 10 battles using Pikachu to unlock Raichu.',
    category: 'Story',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 5, pokemon: ['pikachu'] }),
    objectives: JSON.stringify({ wins: 10, withPokemon: 'pikachu' }),
    rewardExp: 200,
    rewardPokemon: 'raichu',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Legendary Hunt: Mewtwo',
    description: 'Defeat 50 opponents and deal 5000 total damage to unlock Mewtwo.',
    category: 'Story',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 20, wins: 100 }),
    objectives: JSON.stringify({ wins: 50, totalDamage: 5000 }),
    rewardExp: 1000,
    rewardPokemon: 'mewtwo',
    isActive: true,
    sortOrder: 10,
  },
  {
    name: 'Dragon Tamer',
    description: 'Win 25 battles to unlock Dragonite.',
    category: 'Story',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 15 }),
    objectives: JSON.stringify({ wins: 25 }),
    rewardExp: 500,
    rewardPokemon: 'dragonite',
    isActive: true,
    sortOrder: 5,
  },
];

// Initial Season
const season = {
  name: 'Season 1 - Origin',
  number: 1,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-04-01'),
  isActive: true,
  rewards: JSON.stringify({
    top1: { title: 'Pokemon Master', exp: 10000 },
    top10: { title: 'Elite Four', exp: 5000 },
    top100: { title: 'Champion', exp: 2000 },
  }),
};

async function main() {
  console.log('🌱 Starting seed...');

  // Create Pokemon with moves
  console.log('📦 Creating Starter Pokemon...');
  for (const pokemon of starterPokemon) {
    const { moves, ...pokemonData } = pokemon;
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
    console.log(`  ✅ Created ${pokemon.name}`);
  }

  console.log('📦 Creating Unlockable Pokemon...');
  for (const pokemon of unlockablePokemon) {
    const { moves, ...pokemonData } = pokemon;
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
    console.log(`  ✅ Created ${pokemon.name}`);
  }

  // Create Missions
  console.log('📜 Creating Missions...');
  for (const mission of missions) {
    await prisma.mission.create({ data: mission });
    console.log(`  ✅ Created mission: ${mission.name}`);
  }

  // Create Season
  console.log('🏆 Creating Season...');
  await prisma.season.create({ data: season });
  console.log(`  ✅ Created ${season.name}`);

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
