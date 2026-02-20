import { PrismaClient } from '@prisma/client';
import { kantoPokemon } from './seed-kanto';
import { kantoPokemon2 } from './seed-kanto2';
import { kantoPokemon3 } from './seed-kanto3';
import { kantoPokemon4 } from './seed-kanto4';

const prisma = new PrismaClient();

// Combine all 28 Kanto Pokemon
const allKantoPokemon = [
  ...kantoPokemon,   // #001-007: Bulbasaur to Squirtle
  ...kantoPokemon2,  // #008-014: Wartortle to Kakuna
  ...kantoPokemon3,  // #015-021: Beedrill to Spearow
  ...kantoPokemon4,  // #022-028: Fearow to Sandslash
];

// Missions
const missions = [
  {
    name: 'Starter Journey',
    description: 'Win your first battle with a starter Pokemon',
    category: 'Story',
    difficulty: 'Easy',
    requirements: JSON.stringify({ wins: 1, withStarter: true }),
    objectives: JSON.stringify({ wins: 1 }),
    rewardExp: 100,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Kanto Explorer',
    description: 'Win 10 battles using Kanto Pokemon',
    category: 'Story',
    difficulty: 'Normal',
    requirements: JSON.stringify({ wins: 10 }),
    objectives: JSON.stringify({ wins: 10 }),
    rewardExp: 500,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Bug Catcher',
    description: 'Win 5 battles using Bug-type Pokemon',
    category: 'Story',
    difficulty: 'Normal',
    requirements: JSON.stringify({ wins: 5, withType: 'Bug' }),
    objectives: JSON.stringify({ wins: 5 }),
    rewardExp: 300,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Electric Champion',
    description: 'Win 10 battles using Electric-type Pokemon',
    category: 'Story',
    difficulty: 'Hard',
    requirements: JSON.stringify({ wins: 10, withType: 'Electric' }),
    objectives: JSON.stringify({ wins: 10 }),
    rewardExp: 500,
    isActive: true,
    sortOrder: 4,
  },
];

// Initial Season
const season = {
  name: 'Season 1 - Kanto',
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
  console.log('🌱 Starting seed with 28 Kanto Pokemon...');

  // Create all Pokemon
  console.log('📦 Creating 28 Kanto Pokemon...');
  for (const pokemon of allKantoPokemon) {
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

  console.log('');
  console.log(`✨ Seed completed! Created ${allKantoPokemon.length} Pokemon.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
