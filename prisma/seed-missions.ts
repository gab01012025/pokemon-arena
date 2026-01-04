/**
 * Seed Missions - Missões de exemplo para o Pokemon Arena
 * Execute: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-missions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missions = [
  // ==================== DAILY MISSIONS ====================
  {
    name: 'Treinamento Diário',
    description: 'Complete 3 batalhas contra a IA para ganhar XP e ficar mais forte!',
    category: 'Daily',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1 }),
    objectives: JSON.stringify({ battles: 3 }),
    rewardExp: 100,
    rewardPokemon: null,
    rewardItems: JSON.stringify({ pokeballs: 5 }),
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Vitórias Diárias',
    description: 'Vença 2 batalhas hoje para provar sua habilidade!',
    category: 'Daily',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 1 }),
    objectives: JSON.stringify({ wins: 2 }),
    rewardExp: 150,
    rewardPokemon: null,
    rewardItems: JSON.stringify({ potions: 3 }),
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Mestre do Dano',
    description: 'Cause 500 pontos de dano total em batalhas.',
    category: 'Daily',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 3 }),
    objectives: JSON.stringify({ damage: 500 }),
    rewardExp: 200,
    rewardPokemon: null,
    rewardItems: JSON.stringify({ revives: 2 }),
    isActive: true,
    sortOrder: 3,
  },

  // ==================== WEEKLY MISSIONS ====================
  {
    name: 'Guerreiro Semanal',
    description: 'Vença 10 batalhas esta semana para receber grandes recompensas!',
    category: 'Weekly',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 5 }),
    objectives: JSON.stringify({ wins: 10 }),
    rewardExp: 500,
    rewardPokemon: null,
    rewardItems: JSON.stringify({ pokeballs: 10, potions: 5, revives: 3 }),
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Sequência de Vitórias',
    description: 'Ganhe 5 batalhas seguidas sem perder!',
    category: 'Weekly',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 10, wins: 20 }),
    objectives: JSON.stringify({ winStreak: 5 }),
    rewardExp: 1000,
    rewardPokemon: 'Dragonite',
    rewardItems: null,
    isActive: true,
    sortOrder: 2,
  },

  // ==================== STORY MISSIONS ====================
  {
    name: 'Primeiros Passos',
    description: 'Bem-vindo ao Pokemon Arena! Selecione seu time inicial e complete sua primeira batalha.',
    category: 'Story',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1 }),
    objectives: JSON.stringify({ battles: 1 }),
    rewardExp: 50,
    rewardPokemon: null,
    rewardItems: JSON.stringify({ pokeballs: 10 }),
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Provando Seu Valor',
    description: 'Vença sua primeira batalha e prove que você tem o que é preciso para ser um treinador!',
    category: 'Story',
    difficulty: 'Easy',
    requirements: JSON.stringify({ level: 1 }),
    objectives: JSON.stringify({ wins: 1 }),
    rewardExp: 100,
    rewardPokemon: null,
    rewardItems: JSON.stringify({ potions: 5 }),
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Ascensão',
    description: 'Alcance o nível 5 e desbloqueie novos desafios!',
    category: 'Story',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 1 }),
    objectives: JSON.stringify({ level: 5 }),
    rewardExp: 300,
    rewardPokemon: 'Arcanine',
    rewardItems: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Campeão em Ascensão',
    description: 'Vença 25 batalhas e mostre que você está no caminho para se tornar um campeão!',
    category: 'Story',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 8 }),
    objectives: JSON.stringify({ wins: 25 }),
    rewardExp: 750,
    rewardPokemon: 'Mewtwo',
    rewardItems: JSON.stringify({ masterball: 1 }),
    isActive: true,
    sortOrder: 4,
  },

  // ==================== EVENT MISSIONS ====================
  {
    name: 'Lenda Elétrica',
    description: 'Use Pikachu para vencer 5 batalhas e dominar o poder elétrico!',
    category: 'Event',
    difficulty: 'Normal',
    requirements: JSON.stringify({ level: 5, pokemon: ['Pikachu'] }),
    objectives: JSON.stringify({ wins: 5, useSkill: 'Thunderbolt' }),
    rewardExp: 400,
    rewardPokemon: 'Jolteon',
    rewardItems: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Mestre do Fogo',
    description: 'Queime seus oponentes! Vença 7 batalhas usando Charizard.',
    category: 'Event',
    difficulty: 'Hard',
    requirements: JSON.stringify({ level: 10, pokemon: ['Charizard'] }),
    objectives: JSON.stringify({ wins: 7, damage: 1000 }),
    rewardExp: 600,
    rewardPokemon: 'Garchomp',
    rewardItems: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Festival de Lutadores',
    description: 'Evento especial! Use Machamp para vencer 10 batalhas.',
    category: 'Event',
    difficulty: 'Expert',
    requirements: JSON.stringify({ level: 15, wins: 50, pokemon: ['Machamp'] }),
    objectives: JSON.stringify({ wins: 10, damage: 2000 }),
    rewardExp: 1500,
    rewardPokemon: 'Lucario',
    rewardItems: JSON.stringify({ masterball: 2, potions: 10 }),
    isActive: true,
    sortOrder: 3,
  },
];

async function seedMissions() {
  console.log('🌱 Criando missões...');
  
  for (const mission of missions) {
    try {
      await prisma.mission.upsert({
        where: { name: mission.name },
        update: mission,
        create: mission,
      });
      console.log(`✅ Missão criada: ${mission.name}`);
    } catch (error) {
      console.error(`❌ Erro ao criar missão ${mission.name}:`, error);
    }
  }

  console.log('✨ Seed de missões concluído!');
}

seedMissions()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
