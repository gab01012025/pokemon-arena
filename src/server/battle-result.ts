/**
 * Game Server - Battle Result Persistence
 * Saves PvP battle outcomes to the database
 */

import { db } from './db';
import { calculateCompetitiveLP, detectRankChange, formatRank, getRankIcon, type CompetitiveTier, type Division } from '@/lib/ranking';
import { checkBattleAchievements, type BattleAchievementContext } from '@/lib/achievements';
import {
  calculateBattleXP,
  isFirstBattleOfDay,
  levelFromTotalXP,
  xpForLevel,
  checkPackEarned,
  checkPokemonUnlocks,
} from '@/lib/progression';

// Legacy EXP table kept for backwards compat reference only
const EXP_TABLE: Record<number, number> = {
  1: 100, 2: 200, 3: 350, 4: 550, 5: 800,
  6: 1100, 7: 1450, 8: 1850, 9: 2300, 10: 2800,
  11: 3350, 12: 3950, 13: 4600, 14: 5300, 15: 6050,
  16: 6850, 17: 7700, 18: 8600, 19: 9550, 20: 10550,
};

function getExpForLevel(level: number): number {
  return xpForLevel(level);
}

function calculateExpReward(won: boolean, playerLevel: number, opponentLevel: number, surrendered: boolean, streak: number, isFirstOfDay: boolean): { baseXP: number; streakBonus: number; firstDayBonus: number; totalXP: number } {
  return calculateBattleXP({
    won,
    isPvP: true,
    streak,
    isFirstBattleOfDay: isFirstOfDay,
    playerLevel,
    opponentLevel,
    surrendered,
  });
}

function calculateLadderPoints(won: boolean, playerLP: number, opponentLP: number, surrendered: boolean, streak: number): number {
  return calculateCompetitiveLP({ won, playerLP, opponentLP, surrendered, streak });
}

export interface BattleResultData {
  battleId: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  loserId: string;
  reason: 'knockout' | 'surrender' | 'disconnect' | 'timeout';
  battleType: 'quick' | 'ranked';
  turns: number;
  team1PokemonIds: string[];
  team2PokemonIds: string[];
}

export interface PlayerResultData {
  trainerId: string;
  won: boolean;
  expGained: number;
  ladderChange: number;
  newLevel: number;
  newExp: number;
  newLP: number;
  newStreak: number;
  leveledUp: boolean;
  // Competitive rank info
  oldRankLabel: string;
  newRankLabel: string;
  oldRankTier: CompetitiveTier;
  newRankTier: CompetitiveTier;
  oldRankDivision: Division;
  newRankDivision: Division;
  oldRankIcon: string;
  newRankIcon: string;
  rankUp: boolean;
  rankDown: boolean;
  tierChanged: boolean;
  // Progression info
  packEarned: boolean;
  pendingPacks: number;
  newUnlocks: string[];
  xpBreakdown: { baseXP: number; streakBonus: number; firstDayBonus: number };
}

export async function saveBattleResult(data: BattleResultData): Promise<{
  player1Result: PlayerResultData;
  player2Result: PlayerResultData;
}> {
  // Get both trainers
  const [trainer1, trainer2] = await Promise.all([
    db.trainer.findUnique({
      where: { id: data.player1Id },
      select: {
        id: true, level: true, experience: true, totalXP: true,
        wins: true, losses: true, streak: true, maxStreak: true,
        ladderPoints: true, pendingPacks: true, packWinCounter: true,
        lastBattleDate: true,
        unlockedPokemon: { select: { pokemon: { select: { name: true } } } },
        achievements: { select: { code: true } },
      },
    }),
    db.trainer.findUnique({
      where: { id: data.player2Id },
      select: {
        id: true, level: true, experience: true, totalXP: true,
        wins: true, losses: true, streak: true, maxStreak: true,
        ladderPoints: true, pendingPacks: true, packWinCounter: true,
        lastBattleDate: true,
        unlockedPokemon: { select: { pokemon: { select: { name: true } } } },
        achievements: { select: { code: true } },
      },
    }),
  ]);

  if (!trainer1 || !trainer2) {
    throw new Error('Trainer not found');
  }

  const p1Won = data.winnerId === data.player1Id;
  const p2Won = data.winnerId === data.player2Id;
  const p1Surrendered = !p1Won && data.reason === 'surrender';
  const p2Surrendered = !p2Won && data.reason === 'surrender';

  // Calculate rewards for player 1
  const p1IsFirstOfDay = isFirstBattleOfDay(trainer1.lastBattleDate);
  const p1Streak = p1Won ? trainer1.streak + 1 : 0;
  const p1XPResult = calculateExpReward(p1Won, trainer1.level, trainer2.level, p1Surrendered, p1Won ? p1Streak : 0, p1IsFirstOfDay);
  const p1Exp = p1XPResult.totalXP;
  const p1LP = calculateLadderPoints(p1Won, trainer1.ladderPoints, trainer2.ladderPoints, p1Surrendered, p1Won ? trainer1.streak : 0);
  const p1NewTotalXP = trainer1.totalXP + p1Exp;
  const p1LevelInfo = levelFromTotalXP(p1NewTotalXP);
  const p1LeveledUp = p1LevelInfo.level > trainer1.level;
  const p1NewExp = p1LevelInfo.currentLevelXP;
  const p1NewLevel = p1LevelInfo.level;

  // Card pack check
  const p1PackCheck = checkPackEarned(trainer1.packWinCounter, p1Won, trainer1.pendingPacks);
  const p1NewMaxStreak = Math.max(trainer1.maxStreak, p1Streak);

  // Check for new Pokemon unlocks
  const p1OwnedNames = trainer1.unlockedPokemon.map(up => up.pokemon.name);
  const p1AchievementCodes = trainer1.achievements.map(a => a.code);
  const p1NewUnlocks = checkPokemonUnlocks(p1NewLevel, p1NewMaxStreak, p1AchievementCodes, p1OwnedNames);

  // Calculate rewards for player 2
  const p2IsFirstOfDay = isFirstBattleOfDay(trainer2.lastBattleDate);
  const p2Streak = p2Won ? trainer2.streak + 1 : 0;
  const p2XPResult = calculateExpReward(p2Won, trainer2.level, trainer1.level, p2Surrendered, p2Won ? p2Streak : 0, p2IsFirstOfDay);
  const p2Exp = p2XPResult.totalXP;
  const p2LP = calculateLadderPoints(p2Won, trainer2.ladderPoints, trainer1.ladderPoints, p2Surrendered, p2Won ? trainer2.streak : 0);
  const p2NewTotalXP = trainer2.totalXP + p2Exp;
  const p2LevelInfo = levelFromTotalXP(p2NewTotalXP);
  const p2LeveledUp = p2LevelInfo.level > trainer2.level;
  const p2NewExp = p2LevelInfo.currentLevelXP;
  const p2NewLevel = p2LevelInfo.level;

  const p2PackCheck = checkPackEarned(trainer2.packWinCounter, p2Won, trainer2.pendingPacks);
  const p2NewMaxStreak = Math.max(trainer2.maxStreak, p2Streak);

  const p2OwnedNames = trainer2.unlockedPokemon.map(up => up.pokemon.name);
  const p2AchievementCodes = trainer2.achievements.map(a => a.code);
  const p2NewUnlocks = checkPokemonUnlocks(p2NewLevel, p2NewMaxStreak, p2AchievementCodes, p2OwnedNames);

  // Create battle teams and save everything in a transaction
  await db.$transaction(async (tx) => {
    // Create battle teams
    const team1 = await tx.battleTeam.create({ data: { name: `Battle ${data.battleId} - P1` } });
    const team2 = await tx.battleTeam.create({ data: { name: `Battle ${data.battleId} - P2` } });

    // Create battle slots (only if Pokemon IDs are actual DB IDs)
    for (let i = 0; i < data.team1PokemonIds.length; i++) {
      try {
        await tx.battleSlot.create({
          data: { teamId: team1.id, pokemonId: data.team1PokemonIds[i], position: i },
        });
      } catch {
        // Pokemon ID might not exist in DB — skip slot creation
      }
    }
    for (let i = 0; i < data.team2PokemonIds.length; i++) {
      try {
        await tx.battleSlot.create({
          data: { teamId: team2.id, pokemonId: data.team2PokemonIds[i], position: i },
        });
      } catch {
        // Pokemon ID might not exist in DB — skip slot creation
      }
    }

    // Create Battle record
    await tx.battle.create({
      data: {
        id: data.battleId,
        player1Id: data.player1Id,
        player2Id: data.player2Id,
        team1Id: team1.id,
        team2Id: team2.id,
        winnerId: data.winnerId,
        status: 'finished',
        turn: data.turns,
        battleType: data.battleType,
        gameState: JSON.stringify({ reason: data.reason }),
        finishedAt: new Date(),
      },
    });

    // Update trainer 1
    await tx.trainer.update({
      where: { id: data.player1Id },
      data: {
        experience: p1NewExp,
        level: p1NewLevel,
        totalXP: p1NewTotalXP,
        wins: p1Won ? trainer1.wins + 1 : trainer1.wins,
        losses: p1Won ? trainer1.losses : trainer1.losses + 1,
        streak: p1Streak,
        maxStreak: p1NewMaxStreak,
        ladderPoints: Math.max(0, trainer1.ladderPoints + p1LP),
        pendingPacks: trainer1.pendingPacks + (p1PackCheck.earnedPack ? 1 : 0),
        packWinCounter: p1PackCheck.newCounter,
        lastBattleDate: new Date(),
      },
    });

    // Update trainer 2
    await tx.trainer.update({
      where: { id: data.player2Id },
      data: {
        experience: p2NewExp,
        level: p2NewLevel,
        totalXP: p2NewTotalXP,
        wins: p2Won ? trainer2.wins + 1 : trainer2.wins,
        losses: p2Won ? trainer2.losses : trainer2.losses + 1,
        streak: p2Streak,
        maxStreak: p2NewMaxStreak,
        ladderPoints: Math.max(0, trainer2.ladderPoints + p2LP),
        pendingPacks: trainer2.pendingPacks + (p2PackCheck.earnedPack ? 1 : 0),
        packWinCounter: p2PackCheck.newCounter,
        lastBattleDate: new Date(),
      },
    });

    // Grant Pokemon unlocks for player 1
    for (const unlock of p1NewUnlocks) {
      const pokemon = await tx.pokemon.findFirst({
        where: { name: { equals: unlock.pokemonName, mode: 'insensitive' } },
      });
      if (pokemon) {
        try {
          await tx.trainerPokemon.create({
            data: { trainerId: data.player1Id, pokemonId: pokemon.id, obtainedMethod: unlock.method, isNew: true },
          });
        } catch { /* Already owned */ }
      }
    }

    // Grant Pokemon unlocks for player 2
    for (const unlock of p2NewUnlocks) {
      const pokemon = await tx.pokemon.findFirst({
        where: { name: { equals: unlock.pokemonName, mode: 'insensitive' } },
      });
      if (pokemon) {
        try {
          await tx.trainerPokemon.create({
            data: { trainerId: data.player2Id, pokemonId: pokemon.id, obtainedMethod: unlock.method, isNew: true },
          });
        } catch { /* Already owned */ }
      }
    }
  });

  // Detect rank changes
  const p1NewLPFinal = Math.max(0, trainer1.ladderPoints + p1LP);
  const p2NewLPFinal = Math.max(0, trainer2.ladderPoints + p2LP);
  const p1RankChange = detectRankChange(trainer1.ladderPoints, p1NewLPFinal);
  const p2RankChange = detectRankChange(trainer2.ladderPoints, p2NewLPFinal);

  return {
    player1Result: {
      trainerId: data.player1Id,
      won: p1Won,
      expGained: p1Exp,
      ladderChange: p1LP,
      newLevel: p1NewLevel,
      newExp: p1NewExp,
      newLP: p1NewLPFinal,
      newStreak: p1Streak,
      leveledUp: p1LeveledUp,
      oldRankLabel: p1RankChange.oldRank.label,
      newRankLabel: p1RankChange.newRank.label,
      oldRankTier: p1RankChange.oldRank.tier,
      newRankTier: p1RankChange.newRank.tier,
      oldRankDivision: p1RankChange.oldRank.division,
      newRankDivision: p1RankChange.newRank.division,
      oldRankIcon: getRankIcon(trainer1.ladderPoints),
      newRankIcon: getRankIcon(p1NewLPFinal),
      rankUp: p1RankChange.rankUp,
      rankDown: p1RankChange.rankDown,
      tierChanged: p1RankChange.tierChanged,
      packEarned: p1PackCheck.earnedPack,
      pendingPacks: trainer1.pendingPacks + (p1PackCheck.earnedPack ? 1 : 0),
      newUnlocks: p1NewUnlocks.map(u => u.pokemonName),
      xpBreakdown: { baseXP: p1XPResult.baseXP, streakBonus: p1XPResult.streakBonus, firstDayBonus: p1XPResult.firstDayBonus },
    },
    player2Result: {
      trainerId: data.player2Id,
      won: p2Won,
      expGained: p2Exp,
      ladderChange: p2LP,
      newLevel: p2NewLevel,
      newExp: p2NewExp,
      newLP: p2NewLPFinal,
      newStreak: p2Streak,
      leveledUp: p2LeveledUp,
      oldRankLabel: p2RankChange.oldRank.label,
      newRankLabel: p2RankChange.newRank.label,
      oldRankTier: p2RankChange.oldRank.tier,
      newRankTier: p2RankChange.newRank.tier,
      oldRankDivision: p2RankChange.oldRank.division,
      newRankDivision: p2RankChange.newRank.division,
      oldRankIcon: getRankIcon(trainer2.ladderPoints),
      newRankIcon: getRankIcon(p2NewLPFinal),
      rankUp: p2RankChange.rankUp,
      rankDown: p2RankChange.rankDown,
      tierChanged: p2RankChange.tierChanged,
      packEarned: p2PackCheck.earnedPack,
      pendingPacks: trainer2.pendingPacks + (p2PackCheck.earnedPack ? 1 : 0),
      newUnlocks: p2NewUnlocks.map(u => u.pokemonName),
      xpBreakdown: { baseXP: p2XPResult.baseXP, streakBonus: p2XPResult.streakBonus, firstDayBonus: p2XPResult.firstDayBonus },
    },
  };
}

/**
 * Update mission progress after a PvP battle
 */
export async function updateMissionProgress(
  trainerId: string,
  won: boolean,
  opponentLevel: number,
  pokemonUsed: string[],
  totalDamage: number,
): Promise<void> {
  try {
    const activeMissions = await db.trainerMission.findMany({
      where: { trainerId, status: 'in_progress' },
      include: { mission: true },
    });

    for (const tm of activeMissions) {
      const objectives = JSON.parse(tm.mission.objectives) as Record<string, number>;
      const progress = JSON.parse(tm.progress) as Record<string, number>;

      let updated = false;

      // Track wins
      if (objectives.wins && won) {
        progress.wins = (progress.wins || 0) + 1;
        updated = true;
      }

      // Track battles played
      if (objectives.battles) {
        progress.battles = (progress.battles || 0) + 1;
        updated = true;
      }

      // Track total damage
      if (objectives.damage) {
        progress.damage = (progress.damage || 0) + totalDamage;
        updated = true;
      }

      // Track wins against higher level
      if (objectives.winsVsHigher && won && opponentLevel > 0) {
        progress.winsVsHigher = (progress.winsVsHigher || 0) + 1;
        updated = true;
      }

      if (!updated) continue;

      // Check completion
      let completed = true;
      for (const [key, required] of Object.entries(objectives)) {
        if (typeof required === 'number' && (progress[key] || 0) < required) {
          completed = false;
          break;
        }
      }

      await db.trainerMission.update({
        where: { id: tm.id },
        data: {
          progress: JSON.stringify(progress),
          status: completed ? 'completed' : 'in_progress',
          completedAt: completed ? new Date() : undefined,
        },
      });

      // Grant mission rewards on completion
      if (completed && tm.mission.rewardExp > 0) {
        await db.trainer.update({
          where: { id: trainerId },
          data: { experience: { increment: tm.mission.rewardExp } },
        });
      }

      if (completed && tm.mission.rewardPokemon) {
        // Unlock reward Pokemon
        try {
          await db.trainerPokemon.create({
            data: { trainerId, pokemonId: tm.mission.rewardPokemon },
          });
        } catch {
          // Already unlocked
        }
      }
    }
  } catch {
    // Mission update is non-critical — don't crash the server
  }
}

/**
 * Update daily/weekly quest progress after a battle
 */
export async function updateQuestProgress(
  trainerId: string,
  won: boolean,
  isPvP: boolean,
  streak: number,
  allTeamAlive: boolean,
  pokemonUsed: string[],
): Promise<void> {
  try {
    const now = new Date();

    // Update daily quests
    const dailyQuests = await db.dailyQuest.findMany({
      where: { trainerId, expiresAt: { gt: now }, completed: false },
    });

    for (const quest of dailyQuests) {
      let newValue = quest.currentValue;

      switch (quest.questType) {
        case 'win_battle':
        case 'win_battles_3':
          if (won) newValue++;
          break;
        case 'play_battles':
          newValue++;
          break;
        case 'win_full_team':
          if (won && allTeamAlive) newValue++;
          break;
        case 'play_pvp':
          if (isPvP) newValue++;
          break;
        case 'win_streak_3':
          if (won) newValue = Math.max(newValue, streak);
          break;
      }

      if (newValue !== quest.currentValue) {
        const completed = newValue >= quest.targetValue;
        await db.dailyQuest.update({
          where: { id: quest.id },
          data: { currentValue: newValue, completed },
        });
      }
    }

    // Update weekly quests
    const weeklyQuests = await db.weeklyQuest.findMany({
      where: { trainerId, expiresAt: { gt: now }, completed: false },
    });

    for (const quest of weeklyQuests) {
      let newValue = quest.currentValue;

      switch (quest.questType) {
        case 'win_10_battles':
          if (won) newValue++;
          break;
        case 'play_20_battles':
          newValue++;
          break;
        case 'win_5_pvp':
          if (won && isPvP) newValue++;
          break;
        case 'use_5_different':
          // Track unique Pokemon used (stored as current count)
          newValue = Math.max(newValue, pokemonUsed.length);
          break;
        case 'streak_5':
          if (won) newValue = Math.max(newValue, streak);
          break;
      }

      if (newValue !== quest.currentValue) {
        const completed = newValue >= quest.targetValue;
        await db.weeklyQuest.update({
          where: { id: quest.id },
          data: { currentValue: newValue, completed },
        });
      }
    }
  } catch {
    // Non-critical
  }
}
