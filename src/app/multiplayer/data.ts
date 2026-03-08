/**
 * Multiplayer - Types, constants, and helper functions
 */

// ==================== TYPES ====================

export interface RosterPokemon {
  id: string;
  name: string;
  types: string[];
  health: number;
  category: string;
  isStarter: boolean;
  skills: RosterSkill[];
  // Progression lock status
  isOwned?: boolean;
  isUnlocked?: boolean;
  unlockMethod?: string | null;
  unlockDescription?: string | null;
}

export interface RosterSkill {
  name: string;
  description: string;
  damage: number;
  healing: number;
  target: string;
  cost: Record<string, number>;
  effects: Array<{ type: string; duration?: number; value?: number }>;
  classes: string[];
  cooldown: number;
}

// ==================== CONSTANTS ====================

export const ENERGY_ICONS: Record<string, string> = {
  fire: '🔥', water: '💧', grass: '🌿', lightning: '⚡',
  psychic: '🔮', fighting: '👊', darkness: '🌑', metal: '⚙️', colorless: '⭐',
};

// Mapping Pokemon names to PokéAPI IDs for sprites
const POKEMON_SPRITE_IDS: Record<string, number> = {
  'Pikachu': 25, 'Charizard': 6, 'Blastoise': 9, 'Venusaur': 3,
  'Mewtwo': 150, 'Gengar': 94, 'Alakazam': 65, 'Dragonite': 149,
  'Snorlax': 143, 'Machamp': 68, 'Gyarados': 130, 'Tyranitar': 248,
  'Scizor': 212, 'Garchomp': 445, 'Lucario': 448,
  'Bulbasaur': 1, 'Charmander': 4, 'Squirtle': 7, 'Eevee': 133,
  'Meowth': 52, 'Arcanine': 59, 'Vileplume': 45, 'Lapras': 131,
  'Ninetales': 38, 'Jolteon': 135, 'Vaporeon': 134,
};

// ==================== HELPERS ====================

export function getSpriteId(name: string): number {
  return POKEMON_SPRITE_IDS[name] || 25; // Fallback to Pikachu
}

export const getSpriteUrl = (name: string) => {
  const id = getSpriteId(name);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
};

export const getSpriteUrlStatic = (name: string) => {
  const id = getSpriteId(name);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
};

/** Fetch Pokemon roster from API */
export async function fetchRoster(): Promise<RosterPokemon[]> {
  try {
    const res = await fetch('/api/pokemon/roster');
    if (!res.ok) throw new Error('Failed to fetch roster');
    const data = await res.json();
    return data.roster || [];
  } catch (error) {
    console.error('Failed to fetch roster:', error);
    return [];
  }
}
