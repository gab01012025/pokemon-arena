import {
  PokemonType,
  Move, BattlePokemon, KantoPokemonData,
} from './types';
import {
  AI_POKEMON_POOL, KANTO_POKEMON, EVOLUTION_DATA, getDefaultMoves, getPokemonMoves, getSpriteById, toGlobalType, toGlobalTypes,
  getWeaknessResistance,
} from './data';
import { getTypeEffectiveness } from '@/lib/type-effectiveness';

/** Pre-evolve an AI Pokemon to its next stage (applies stat/hp bonuses) */
const preEvolveAI = (poke: BattlePokemon): BattlePokemon => {
  if (!poke.canEvolve || !poke.evolvesTo) return poke;
  const evoData = EVOLUTION_DATA[poke.evolvesTo.id];
  if (!evoData) return poke;
  const bonus = poke.evolvesTo.statBonus || 0;
  const newMaxHp = evoData.hp || (poke.maxHp + (poke.evolvesTo.hpBonus || 0));
  const wr = getWeaknessResistance(evoData.types);
  const newMoves = getAIMoves(evoData.id, evoData.types[0]);
  return {
    ...poke,
    id: evoData.id,
    name: evoData.name,
    types: evoData.types,
    sprite: getSpriteById(evoData.id),
    maxHp: newMaxHp,
    hp: newMaxHp,
    attack: poke.attack + bonus,
    defense: poke.defense + bonus,
    spAtk: poke.spAtk + bonus,
    spDef: poke.spDef + bonus,
    speed: poke.speed + bonus,
    moves: newMoves.length > 0 ? newMoves : poke.moves,
    canEvolve: evoData.canEvolve,
    evolvesTo: evoData.evolvesTo,
    evolutionEnergyCost: evoData.evolutionEnergyCost,
    evolutionOptions: evoData.evolutionOptions,
    weakness: wr.weakness,
    resistance: wr.resistance,
    evoBar: 0,
    maxEvoBar: poke.maxEvoBar + 30,
  };
};

/** Create opponent team from AI pool with varied types.
 *  Difficulty scales with win streak:
 *  - Streak 0-2: base forms, normal evo speed
 *  - Streak 3-5: 1 Pokemon starts at Stage 2
 *  - Streak 6-9: all start at Stage 2
 *  - Streak 10+: 1 final form + 2 Stage 2
 */
export const createOpponentTeam = (winStreak = 0): BattlePokemon[] => {
  const shuffled = [...AI_POKEMON_POOL].sort(() => Math.random() - 0.5);
  const selected: KantoPokemonData[] = [];
  const usedTypes = new Set<PokemonType>();
  for (const p of shuffled) {
    if (selected.length >= 3) break;
    const hasOverlap = p.types.some(t => usedTypes.has(t));
    if (!hasOverlap || selected.length >= 2) {
      selected.push(p);
      p.types.forEach(t => usedTypes.add(t));
    }
  }
  while (selected.length < 3) {
    const remaining = shuffled.find(p => !selected.includes(p));
    if (remaining) selected.push(remaining);
    else break;
  }
  let team: BattlePokemon[] = selected.map(p => {
    const aiMoves = getAIMoves(p.id, p.types[0]);
    const wr = getWeaknessResistance(p.types);
    return {
      id: p.id,
      name: p.name,
      types: p.types,
      hp: p.hp,
      maxHp: p.hp,
      attack: p.baseStats?.attack ?? 50,
      defense: p.baseStats?.defense ?? 50,
      spAtk: p.baseStats?.spAtk ?? 50,
      spDef: p.baseStats?.spDef ?? 50,
      speed: p.baseStats?.speed ?? 50,
      sprite: getSpriteById(p.id),
      moves: aiMoves,
      statusEffects: [],
      canEvolve: p.canEvolve,
      evolvesTo: p.evolvesTo,
      evolutionEnergyCost: p.evolutionEnergyCost,
      evolutionOptions: p.evolutionOptions,
      weakness: wr.weakness,
      resistance: wr.resistance,
      evoBar: 0,
      maxEvoBar: 90, // AI evo bar slightly slower than player (80)
    };
  });

  // Apply difficulty based on win streak
  if (winStreak >= 10) {
    // 1 final form + 2 stage 2
    team = team.map((p, i) => {
      if (!p.canEvolve) return p;
      const stage2 = preEvolveAI(p);
      if (i === 0 && stage2.canEvolve) return preEvolveAI(stage2);
      return stage2;
    });
  } else if (winStreak >= 6) {
    // All start at stage 2
    team = team.map(p => p.canEvolve ? preEvolveAI(p) : p);
  } else if (winStreak >= 3) {
    // 1 Pokemon starts at stage 2
    const evolvableIdx = team.findIndex(p => p.canEvolve);
    if (evolvableIdx >= 0) {
      team[evolvableIdx] = preEvolveAI(team[evolvableIdx]);
    }
  }

  return team;
};

/** AI-specific moves that exercise ALL status effects */
export const getAIMoves = (pokemonId: number, primaryType: PokemonType): Move[] => {
  const baseMoves = getPokemonMoves(pokemonId, primaryType);
  const specialMoves: Move[] = [
    { id: 'ai-silence', name: 'Throat Chop', type: 'dark', power: 35, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'A vicious chop. Silences target for 2 turns.', targetType: 'enemy', statusEffect: { type: 'silence', chance: 80, duration: 2 } },
    { id: 'ai-taunt', name: 'Taunt', type: 'dark', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Taunts the target for 2 turns, forcing attacks.', targetType: 'enemy', statusEffect: { type: 'taunt', chance: 100, duration: 2 } },
    { id: 'ai-reflect', name: 'Reflect', type: 'psychic', power: 0, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }], cooldown: 3, currentCooldown: 0, description: 'Sets up a reflect barrier for 3 turns.', targetType: 'self', healing: 0, statusEffect: { type: 'reflect', chance: 100, duration: 3, value: 25 } },
    { id: 'ai-counter', name: 'Counter', type: 'fighting', power: 0, accuracy: 100, cost: [{ type: 'fighting', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Braces for a counter-attack for 2 turns.', targetType: 'self', healing: 0, statusEffect: { type: 'counter', chance: 100, duration: 2, value: 30 } },
    { id: 'ai-invuln', name: 'Protect', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 3, currentCooldown: 0, description: 'Becomes invulnerable for 1 turn.', targetType: 'self', healing: 0, statusEffect: { type: 'invulnerable', chance: 100, duration: 1 } },
    { id: 'ai-weaken', name: 'Leer', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Weakens enemy, reducing damage by 30% for 2 turns.', targetType: 'enemy', statusEffect: { type: 'weaken', chance: 100, duration: 2, value: 30 } },
    { id: 'ai-incdmg', name: 'Screech', type: 'normal', power: 0, accuracy: 85, cost: [{ type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Screeches, making target take 20 more damage for 2 turns.', targetType: 'enemy', statusEffect: { type: 'increase-damage', chance: 100, duration: 2, value: 20 } },
    { id: 'ai-rmvnrg', name: 'Knock Off', type: 'dark', power: 30, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Knocks away energy. Removes 1 energy from target.', targetType: 'enemy', statusEffect: { type: 'remove-energy', chance: 100, duration: 1, value: 1 } },
    { id: 'ai-steal', name: 'Thief', type: 'dark', power: 25, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Steals energy from target.', targetType: 'enemy', statusEffect: { type: 'steal-energy', chance: 80, duration: 1, value: 1 } },
    { id: 'ai-drain', name: 'Leech Seed', type: 'grass', power: 0, accuracy: 90, cost: [{ type: 'grass', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Plants a seed that drains 15 HP each turn for 3 turns.', targetType: 'enemy', statusEffect: { type: 'drain-hp', chance: 100, duration: 3, value: 15 } },
    { id: 'ai-hot', name: 'Aqua Ring', type: 'water', power: 0, accuracy: 100, cost: [{ type: 'water', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Creates a healing ring. Heals 15 HP each turn for 3 turns.', targetType: 'self', healing: 0, statusEffect: { type: 'heal-over-time', chance: 100, duration: 3, value: 15 } },
    { id: 'ai-cdinc', name: 'Disable', type: 'psychic', power: 0, accuracy: 80, cost: [{ type: 'psychic', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Increases enemy cooldowns by 1 for 2 turns.', targetType: 'enemy', statusEffect: { type: 'cooldown-increase', chance: 100, duration: 2, value: 1 } },
    { id: 'ai-cdred', name: 'Agility', type: 'psychic', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Reduces own cooldowns by 1 for 2 turns.', targetType: 'self', healing: 0, statusEffect: { type: 'cooldown-reduce', chance: 100, duration: 2, value: 1 } },
    { id: 'ai-noheal', name: 'Heal Block', type: 'psychic', power: 0, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Prevents target from healing for 3 turns.', targetType: 'enemy', statusEffect: { type: 'cannot-be-healed', chance: 100, duration: 3 } },
  ];
  const special = specialMoves[Math.floor(Math.random() * specialMoves.length)];
  return [...baseMoves.slice(0, 3), special];
};

/** Fallback player team */
export const createFallbackPlayerTeam = (): BattlePokemon[] => {
  const starterIds = [4, 7, 1];
  return starterIds.map(id => {
    const kanto = KANTO_POKEMON.find(k => k.id === id)!;
    const wr = getWeaknessResistance(kanto.types);
    return {
      id: kanto.id,
      name: kanto.name,
      types: kanto.types,
      hp: kanto.hp,
      maxHp: kanto.hp,
      attack: kanto.baseStats?.attack ?? 50,
      defense: kanto.baseStats?.defense ?? 50,
      spAtk: kanto.baseStats?.spAtk ?? 50,
      spDef: kanto.baseStats?.spDef ?? 50,
      speed: kanto.baseStats?.speed ?? 50,
      sprite: getSpriteById(kanto.id),
      moves: getDefaultMoves(kanto.types[0]),
      statusEffects: [],
      canEvolve: kanto.canEvolve,
      evolvesTo: kanto.evolvesTo,
      evolutionEnergyCost: kanto.evolutionEnergyCost,
      evolutionOptions: kanto.evolutionOptions,
      weakness: wr.weakness,
      resistance: wr.resistance,
      evoBar: 0,
      maxEvoBar: 80,
    };
  });
};

/** Get type effectiveness (wrapper) */
export const getTypeEff = (atkType: PokemonType, defTypes: PokemonType[]): number => {
  return getTypeEffectiveness(toGlobalType(atkType), toGlobalTypes(defTypes));
};
