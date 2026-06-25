/**
 * Seed Missions - Missões progressivas para o Pokemon Arena
 * Execute: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-missions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missions = [
  // ==================== D RANK (5 missões - nível 1-2) ====================
  {
    name: 'Chama Inicial',
    description: 'Complete 3 batalhas para provar que está pronto para a jornada!',
    category: 'D Rank',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1 }),
    objectives: JSON.stringify({ battles: 3 }),
    rewardExp: 100,
    rewardPokemon: 'Cyndaquil',
    rewardItems: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Primeira Vitória',
    description: 'Vença sua primeira batalha e ganhe um novo companheiro!',
    category: 'D Rank',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1, completedMissions: ['Chama Inicial'] }),
    objectives: JSON.stringify({ wins: 1 }),
    rewardExp: 120,
    rewardPokemon: 'Totodile',
    rewardItems: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Dano Acumulado',
    description: 'Cause 300 pontos de dano total em batalhas.',
    category: 'D Rank',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1, completedMissions: ['Primeira Vitória'] }),
    objectives: JSON.stringify({ damage: 300 }),
    rewardExp: 150,
    rewardPokemon: 'Chikorita',
    rewardItems: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Trio de Vitórias',
    description: 'Vença 3 batalhas para desbloquear um Pokémon elétrico!',
    category: 'D Rank',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1, completedMissions: ['Dano Acumulado'] }),
    objectives: JSON.stringify({ wins: 3 }),
    rewardExp: 180,
    rewardPokemon: 'Mareep',
    rewardItems: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Veterano de Batalhas',
    description: 'Complete 10 batalhas para mostrar sua dedicação!',
    category: 'D Rank',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 2, completedMissions: ['Trio de Vitórias'] }),
    objectives: JSON.stringify({ battles: 10 }),
    rewardExp: 200,
    rewardPokemon: 'Shinx',
    rewardItems: null,
    isActive: true,
    sortOrder: 5,
  },

  // ==================== C RANK (5 missões - nível 3-5) ====================
  {
    name: 'Aspirante C',
    description: 'Vença 5 batalhas para alcançar o rank C!',
    category: 'C Rank',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 3, completedMissions: ['Veterano de Batalhas'] }),
    objectives: JSON.stringify({ wins: 5 }),
    rewardExp: 250,
    rewardPokemon: 'Torchic',
    rewardItems: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Poder Crescente',
    description: 'Cause 750 pontos de dano total em batalhas.',
    category: 'C Rank',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 3, completedMissions: ['Aspirante C'] }),
    objectives: JSON.stringify({ damage: 750 }),
    rewardExp: 300,
    rewardPokemon: 'Mudkip',
    rewardItems: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Caminho da Vitória',
    description: 'Vença 8 batalhas para provar sua força!',
    category: 'C Rank',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 4, completedMissions: ['Poder Crescente'] }),
    objectives: JSON.stringify({ wins: 8 }),
    rewardExp: 350,
    rewardPokemon: 'Treecko',
    rewardItems: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Guerreiro Experiente',
    description: 'Complete 20 batalhas no total.',
    category: 'C Rank',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 4, completedMissions: ['Caminho da Vitória'] }),
    objectives: JSON.stringify({ battles: 20 }),
    rewardExp: 400,
    rewardPokemon: 'Riolu',
    rewardItems: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Dominador C',
    description: 'Vença 12 batalhas para dominar o rank C!',
    category: 'C Rank',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 5, completedMissions: ['Guerreiro Experiente'] }),
    objectives: JSON.stringify({ wins: 12 }),
    rewardExp: 450,
    rewardPokemon: 'Zorua',
    rewardItems: null,
    isActive: true,
    sortOrder: 5,
  },

  // ==================== B RANK (4 missões - nível 5-8) ====================
  {
    name: 'Mente Afiada',
    description: 'Cause 1500 pontos de dano total. Precisão é a chave!',
    category: 'B Rank',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 5, completedMissions: ['Dominador C'] }),
    objectives: JSON.stringify({ damage: 1500 }),
    rewardExp: 500,
    rewardPokemon: 'Ralts',
    rewardItems: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Caçador de Dragões',
    description: 'Vença 15 batalhas para ganhar um filhote de dragão!',
    category: 'B Rank',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 6, completedMissions: ['Mente Afiada'] }),
    objectives: JSON.stringify({ wins: 15 }),
    rewardExp: 600,
    rewardPokemon: 'Bagon',
    rewardItems: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Destruição Total',
    description: 'Cause 2000 de dano e vença 10 batalhas. O desastre se aproxima!',
    category: 'B Rank',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 7, completedMissions: ['Caçador de Dragões'] }),
    objectives: JSON.stringify({ damage: 2000, wins: 10 }),
    rewardExp: 700,
    rewardPokemon: 'Absol',
    rewardItems: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Mestre B',
    description: 'Vença 20 batalhas para completar o rank B!',
    category: 'B Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 8, completedMissions: ['Destruição Total'] }),
    objectives: JSON.stringify({ wins: 20 }),
    rewardExp: 800,
    rewardPokemon: 'Froakie',
    rewardItems: null,
    isActive: true,
    sortOrder: 4,
  },

  // ==================== A RANK (4 missões - nível 8-12) ====================
  {
    name: 'Fúria Draconiana',
    description: 'Cause 3000 pontos de dano. Liberte o poder dos dragões!',
    category: 'A Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 8, completedMissions: ['Mestre B'] }),
    objectives: JSON.stringify({ damage: 3000 }),
    rewardExp: 1000,
    rewardPokemon: 'Axew',
    rewardItems: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Sombra e Chamas',
    description: 'Vença 25 batalhas. A escuridão é sua aliada!',
    category: 'A Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 10, completedMissions: ['Fúria Draconiana'] }),
    objectives: JSON.stringify({ wins: 25 }),
    rewardExp: 1200,
    rewardPokemon: 'Deino',
    rewardItems: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Chama do Sol',
    description: 'Cause 4000 de dano e complete 40 batalhas. O sol nasce para os fortes!',
    category: 'A Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 11, completedMissions: ['Sombra e Chamas'] }),
    objectives: JSON.stringify({ damage: 4000, battles: 40 }),
    rewardExp: 1500,
    rewardPokemon: 'Larvesta',
    rewardItems: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Lâmina Fantasma',
    description: 'Vença 30 batalhas para conquistar uma espada espectral!',
    category: 'A Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 12, completedMissions: ['Chama do Sol'] }),
    objectives: JSON.stringify({ wins: 30 }),
    rewardExp: 1800,
    rewardPokemon: 'Honedge',
    rewardItems: null,
    isActive: true,
    sortOrder: 4,
  },

  // ==================== S RANK (3 missões - nível 12-18) ====================
  {
    name: 'Mente de Aço',
    description: 'Cause 5000 de dano e vença 20 batalhas. Corpo e mente de aço!',
    category: 'S Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 12, completedMissions: ['Lâmina Fantasma'] }),
    objectives: JSON.stringify({ damage: 5000, wins: 20 }),
    rewardExp: 2000,
    rewardPokemon: 'Beldum',
    rewardItems: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Fantasma Disfarçado',
    description: 'Vença 40 batalhas. Nem tudo é o que parece!',
    category: 'S Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 15, completedMissions: ['Mente de Aço'] }),
    objectives: JSON.stringify({ wins: 40 }),
    rewardExp: 2500,
    rewardPokemon: 'Mimikyu',
    rewardItems: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Lenda Suprema',
    description: 'Cause 8000 de dano e vença 50 batalhas. Apenas lendas chegam aqui!',
    category: 'S Rank',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 18, completedMissions: ['Fantasma Disfarçado'] }),
    objectives: JSON.stringify({ damage: 8000, wins: 50 }),
    rewardExp: 3000,
    rewardPokemon: 'Dreepy',
    rewardItems: null,
    isActive: true,
    sortOrder: 3,
  },

  // ==================== EVENT (bonus, sem cadeia) ====================
  {
    name: 'Guardião da Terra',
    description: 'Vença 8 batalhas para ganhar um filhote de Garchomp!',
    category: 'Event',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 8 }),
    objectives: JSON.stringify({ wins: 8 }),
    rewardExp: 600,
    rewardPokemon: 'Gible',
    rewardItems: null,
    isActive: true,
    sortOrder: 10,
  },
  {
    name: 'Arqueiro da Floresta',
    description: 'Complete 15 batalhas para ganhar um arqueiro alado!',
    category: 'Event',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 5 }),
    objectives: JSON.stringify({ battles: 15 }),
    rewardExp: 400,
    rewardPokemon: 'Rowlet',
    rewardItems: null,
    isActive: true,
    sortOrder: 11,
  },
  {
    name: 'Montanha de Poder',
    description: 'Alcance uma sequência de 5 vitórias seguidas para ganhar Larvitar!',
    category: 'Event',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 6 }),
    objectives: JSON.stringify({ winStreak: 5 }),
    rewardExp: 800,
    rewardPokemon: 'Larvitar',
    rewardItems: null,
    isActive: true,
    sortOrder: 12,
  },

];

async function seedMissions() {
  console.log('Cleaning old missions...');

  // Get names of missions we want to keep
  const keepNames = missions.map(m => m.name);

  // Delete TrainerMission records for missions being removed
  const oldMissions = await prisma.mission.findMany({
    where: { name: { notIn: keepNames } },
    select: { id: true, name: true },
  });

  for (const old of oldMissions) {
    await prisma.trainerMission.deleteMany({ where: { missionId: old.id } });
    await prisma.mission.delete({ where: { id: old.id } });
    console.log(`  Removed old mission: ${old.name}`);
  }

  console.log('Creating missions...');

  for (const mission of missions) {
    try {
      await prisma.mission.upsert({
        where: { name: mission.name },
        update: mission,
        create: mission,
      });
      console.log(`  Mission: ${mission.name}`);
    } catch (error) {
      console.error(`  Error with ${mission.name}:`, error);
    }
  }

  console.log('Seed complete!');
}

seedMissions()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
