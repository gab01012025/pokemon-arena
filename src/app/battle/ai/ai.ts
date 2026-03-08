import {
  PokemonType,
  Move, BattlePokemon, KantoPokemonData,
} from './types';
import {
  AI_POKEMON_POOL, getDefaultMoves, getPokemonMoves, getSpriteById, toGlobalType, toGlobalTypes,
  getWeaknessResistance,
} from './data';
import { getTypeEffectiveness } from '@/lib/type-effectiveness';

/** Create opponent team from AI pool with varied types */
export const createOpponentTeam = (): BattlePokemon[] => {
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
  return selected.map(p => {
    const aiMoves = getAIMoves(p.id, p.types[0]);
    const wr = getWeaknessResistance(p.types);
    return {
      id: p.id,
      name: p.name,
      types: p.types,
      hp: p.hp,
      maxHp: p.hp,
      attack: 80 + Math.floor(Math.random() * 20),
      defense: 70 + Math.floor(Math.random() * 20),
      spAtk: 85 + Math.floor(Math.random() * 20),
      spDef: 75 + Math.floor(Math.random() * 20),
      speed: 60 + Math.floor(Math.random() * 30),
      sprite: getSpriteById(p.id),
      moves: aiMoves,
      statusEffects: [],
      canEvolve: false,
      weakness: wr.weakness,
      resistance: wr.resistance,
    };
  });
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
  const wrFire = getWeaknessResistance(['fire']);
  const wrWater = getWeaknessResistance(['water']);
  const wrGrass = getWeaknessResistance(['grass', 'poison']);
  return [
    {
      id: 4, name: 'Charmander', types: ['fire'], hp: 190, maxHp: 190,
      attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65,
      sprite: getSpriteById(4), moves: getDefaultMoves('fire'), statusEffects: [],
      canEvolve: true, evolvesTo: { id: 5, name: 'Charmeleon', hpBonus: 38, statBonus: 10 },
      evolutionEnergyCost: [{ type: 'fire', amount: 2 }],
      weakness: wrFire.weakness, resistance: wrFire.resistance,
    },
    {
      id: 7, name: 'Squirtle', types: ['water'], hp: 198, maxHp: 198,
      attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43,
      sprite: getSpriteById(7), moves: getDefaultMoves('water'), statusEffects: [],
      canEvolve: true, evolvesTo: { id: 8, name: 'Wartortle', hpBonus: 31, statBonus: 10 },
      evolutionEnergyCost: [{ type: 'water', amount: 2 }],
      weakness: wrWater.weakness, resistance: wrWater.resistance,
    },
    {
      id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], hp: 195, maxHp: 195,
      attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45,
      sprite: getSpriteById(1), moves: getDefaultMoves('grass'), statusEffects: [],
      canEvolve: true, evolvesTo: { id: 2, name: 'Ivysaur', hpBonus: 35, statBonus: 10 },
      evolutionEnergyCost: [{ type: 'grass', amount: 2 }],
      weakness: wrGrass.weakness, resistance: wrGrass.resistance,
    },
  ];
};

/** Get type effectiveness (wrapper) */
export const getTypeEff = (atkType: PokemonType, defTypes: PokemonType[]): number => {
  return getTypeEffectiveness(toGlobalType(atkType), toGlobalTypes(defTypes));
};
