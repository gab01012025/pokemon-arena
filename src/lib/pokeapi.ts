/**
 * PokeAPI Integration Service
 * Fetches real Pokemon data from the official PokeAPI
 * Based on research from: https://github.com/PokeAPI/pokeapi
 * 
 * Features:
 * - Complete Pokemon data (stats, types, abilities, moves)
 * - Animated sprites from Pokemon Showdown
 * - Move data with power, accuracy, PP, effects
 * - Type effectiveness from API
 * - Evolution chains
 * - Caching for performance
 */

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Sprite URL bases
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const SHOWDOWN_SPRITE_BASE = 'https://play.pokemonshowdown.com/sprites';

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const MOVE_CACHE = new Map<string, PokemonMove>();

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokeAPI Error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// ==================== TYPES ====================
export interface PokemonBasic {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  artwork: string;
  animatedSprite?: string;
}

export interface PokemonFull extends PokemonBasic {
  height: number;
  weight: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  abilities: string[];
  moves: PokemonMove[];
  description?: string;
  genus?: string;
  evolutionChain?: EvolutionStage[];
}

export interface PokemonMove {
  id: number;
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damageClass: 'physical' | 'special' | 'status';
  priority: number;
  description?: string;
  shortEffect?: string;
  effectChance?: number;
  // Meta info from PokeAPI
  meta?: {
    minHits?: number;
    maxHits?: number;
    drain?: number;
    healing?: number;
    critRate?: number;
    ailmentChance?: number;
    flinchChance?: number;
    statChance?: number;
  };
}

export interface PokemonAbility {
  id: number;
  name: string;
  isHidden: boolean;
  description?: string;
  shortEffect?: string;
}

export interface EvolutionStage {
  id: number;
  name: string;
  sprite: string;
  minLevel?: number;
  trigger?: string;
}

export interface PokemonType {
  name: string;
  damageRelations: {
    doubleDamageTo: string[];
    halfDamageTo: string[];
    noDamageTo: string[];
    doubleDamageFrom: string[];
    halfDamageFrom: string[];
    noDamageFrom: string[];
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Get basic Pokemon data by ID or name
 */
export async function getPokemon(idOrName: number | string): Promise<PokemonBasic> {
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/pokemon/${idOrName}`);
  
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t: any) => t.type.name),
    sprite: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
    artwork: data.sprites.other?.['official-artwork']?.front_default || 
             `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
    animatedSprite: data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default,
  };
}

/**
 * Get full Pokemon data including stats, abilities, and moves
 */
export async function getPokemonFull(idOrName: number | string): Promise<PokemonFull> {
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/pokemon/${idOrName}`);
  
  // Get species data for description
  let description = '';
  let genus = '';
  try {
    const speciesData = await fetchWithCache<any>(data.species.url);
    const flavorEntry = speciesData.flavor_text_entries.find(
      (e: any) => e.language.name === 'en'
    );
    description = flavorEntry?.flavor_text?.replace(/\f|\n/g, ' ') || '';
    
    const genusEntry = speciesData.genera.find(
      (g: any) => g.language.name === 'en'
    );
    genus = genusEntry?.genus || '';
  } catch (e) {
    // Species data optional
  }

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t: any) => t.type.name),
    sprite: data.sprites.front_default,
    artwork: data.sprites.other?.['official-artwork']?.front_default,
    animatedSprite: data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default,
    height: data.height / 10, // Convert to meters
    weight: data.weight / 10, // Convert to kg
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      spAtk: data.stats[3].base_stat,
      spDef: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    abilities: data.abilities.map((a: any) => a.ability.name.replace('-', ' ')),
    moves: data.moves.slice(0, 20).map((m: any) => ({
      name: m.move.name.replace('-', ' '),
      type: '',
      power: null,
      accuracy: null,
      pp: 0,
      damageClass: 'physical' as const,
    })),
    description,
    genus,
  };
}

/**
 * Get move details with full metadata
 * Based on PokeAPI move structure
 */
export async function getMove(idOrName: number | string): Promise<PokemonMove> {
  const cacheKey = String(idOrName).toLowerCase();
  const cached = MOVE_CACHE.get(cacheKey);
  if (cached) return cached;
  
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/move/${idOrName}`);
  
  const effectEntry = data.effect_entries?.find(
    (e: any) => e.language.name === 'en'
  );
  
  const flavorEntry = data.flavor_text_entries?.find(
    (e: any) => e.language.name === 'en'
  );
  
  const move: PokemonMove = {
    id: data.id,
    name: data.name.replace(/-/g, ' '),
    type: data.type.name,
    power: data.power,
    accuracy: data.accuracy,
    pp: data.pp,
    damageClass: data.damage_class.name,
    priority: data.priority || 0,
    description: flavorEntry?.flavor_text?.replace(/\n/g, ' ') || '',
    shortEffect: effectEntry?.short_effect || '',
    effectChance: data.effect_chance,
    meta: data.meta ? {
      minHits: data.meta.min_hits,
      maxHits: data.meta.max_hits,
      drain: data.meta.drain,
      healing: data.meta.healing,
      critRate: data.meta.crit_rate,
      ailmentChance: data.meta.ailment_chance,
      flinchChance: data.meta.flinch_chance,
      statChance: data.meta.stat_chance,
    } : undefined,
  };
  
  MOVE_CACHE.set(cacheKey, move);
  return move;
}

/**
 * Get multiple moves at once (optimized)
 */
export async function getMoves(moveNames: string[]): Promise<PokemonMove[]> {
  const promises = moveNames.map(name => getMove(name));
  return Promise.all(promises);
}

/**
 * Get ability details
 */
export async function getAbility(idOrName: number | string): Promise<PokemonAbility> {
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/ability/${idOrName}`);
  
  const effectEntry = data.effect_entries?.find(
    (e: any) => e.language.name === 'en'
  );
  
  const flavorEntry = data.flavor_text_entries?.find(
    (e: any) => e.language.name === 'en'
  );
  
  return {
    id: data.id,
    name: data.name.replace(/-/g, ' '),
    isHidden: false, // Determined by Pokemon data, not ability data
    description: flavorEntry?.flavor_text?.replace(/\n/g, ' ') || '',
    shortEffect: effectEntry?.short_effect || '',
  };
}

/**
 * Get type effectiveness data
 */
export async function getType(typeName: string): Promise<PokemonType> {
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/type/${typeName}`);
  
  return {
    name: data.name,
    damageRelations: {
      doubleDamageTo: data.damage_relations.double_damage_to.map((t: any) => t.name),
      halfDamageTo: data.damage_relations.half_damage_to.map((t: any) => t.name),
      noDamageTo: data.damage_relations.no_damage_to.map((t: any) => t.name),
      doubleDamageFrom: data.damage_relations.double_damage_from.map((t: any) => t.name),
      halfDamageFrom: data.damage_relations.half_damage_from.map((t: any) => t.name),
      noDamageFrom: data.damage_relations.no_damage_from.map((t: any) => t.name),
    },
  };
}

/**
 * Get list of Pokemon (paginated)
 */
export async function getPokemonList(limit = 20, offset = 0): Promise<{ results: PokemonBasic[]; total: number }> {
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  
  // Fetch basic data for each Pokemon in parallel
  const pokemonPromises = data.results.map(async (p: any) => {
    const id = parseInt(p.url.split('/').filter(Boolean).pop());
    return getPokemon(id);
  });
  
  const results = await Promise.all(pokemonPromises);
  
  return {
    results,
    total: data.count,
  };
}

/**
 * Search Pokemon by name
 */
export async function searchPokemon(query: string): Promise<PokemonBasic[]> {
  // Get all Pokemon names first (cached)
  const allData = await fetchWithCache<any>(`${POKEAPI_BASE}/pokemon?limit=1500`);
  
  const matches = allData.results
    .filter((p: any) => p.name.includes(query.toLowerCase()))
    .slice(0, 20);
  
  const pokemonPromises = matches.map(async (p: any) => {
    const id = parseInt(p.url.split('/').filter(Boolean).pop());
    return getPokemon(id);
  });
  
  return Promise.all(pokemonPromises);
}

/**
 * Get evolution chain for a Pokemon
 */
export async function getEvolutionChain(pokemonId: number): Promise<EvolutionStage[]> {
  try {
    // First get species to find evolution chain URL
    const speciesData = await fetchWithCache<any>(`${POKEAPI_BASE}/pokemon-species/${pokemonId}`);
    const chainData = await fetchWithCache<any>(speciesData.evolution_chain.url);
    
    const stages: EvolutionStage[] = [];
    
    function parseChain(chain: any) {
      const id = parseInt(chain.species.url.split('/').filter(Boolean).pop());
      stages.push({
        id,
        name: chain.species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        minLevel: chain.evolution_details[0]?.min_level,
        trigger: chain.evolution_details[0]?.trigger?.name,
      });
      
      if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach(parseChain);
      }
    }
    
    parseChain(chainData.chain);
    return stages;
  } catch (e) {
    return [];
  }
}

/**
 * Get sprite URL for a Pokemon
 */
export function getSpriteUrl(
  pokemonIdOrName: number | string, 
  type: 'default' | 'artwork' | 'animated' | 'shiny' | 'showdown' | 'showdown-back' | 'home' = 'default'
): string {
  // Convert name to lowercase for Showdown sprites
  const name = typeof pokemonIdOrName === 'string' 
    ? pokemonIdOrName.toLowerCase().replace(/[^a-z0-9]/g, '') 
    : null;
  const id = typeof pokemonIdOrName === 'number' ? pokemonIdOrName : null;
  
  switch (type) {
    case 'artwork':
      return `${SPRITE_BASE}/other/official-artwork/${id}.png`;
    case 'animated':
      return `${SPRITE_BASE}/versions/generation-v/black-white/animated/${id}.gif`;
    case 'shiny':
      return `${SPRITE_BASE}/shiny/${id}.png`;
    case 'showdown':
      // Pokemon Showdown animated sprites (best quality)
      return `${SHOWDOWN_SPRITE_BASE}/ani/${name || id}.gif`;
    case 'showdown-back':
      // Pokemon Showdown back sprites (for battles)
      return `${SHOWDOWN_SPRITE_BASE}/ani-back/${name || id}.gif`;
    case 'home':
      // Pokemon HOME 3D renders
      return `${SPRITE_BASE}/other/home/${id}.png`;
    default:
      return `${SPRITE_BASE}/${id}.png`;
  }
}

/**
 * Get all sprite variants for a Pokemon
 */
export function getAllSprites(pokemonId: number, pokemonName: string): Record<string, string> {
  const name = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return {
    default: `${SPRITE_BASE}/${pokemonId}.png`,
    back: `${SPRITE_BASE}/back/${pokemonId}.png`,
    shiny: `${SPRITE_BASE}/shiny/${pokemonId}.png`,
    shinyBack: `${SPRITE_BASE}/back/shiny/${pokemonId}.png`,
    artwork: `${SPRITE_BASE}/other/official-artwork/${pokemonId}.png`,
    artworkShiny: `${SPRITE_BASE}/other/official-artwork/shiny/${pokemonId}.png`,
    home: `${SPRITE_BASE}/other/home/${pokemonId}.png`,
    homeShiny: `${SPRITE_BASE}/other/home/shiny/${pokemonId}.png`,
    animated: `${SPRITE_BASE}/versions/generation-v/black-white/animated/${pokemonId}.gif`,
    animatedBack: `${SPRITE_BASE}/versions/generation-v/black-white/animated/back/${pokemonId}.gif`,
    showdown: `${SHOWDOWN_SPRITE_BASE}/ani/${name}.gif`,
    showdownBack: `${SHOWDOWN_SPRITE_BASE}/ani-back/${name}.gif`,
    showdownShiny: `${SHOWDOWN_SPRITE_BASE}/ani-shiny/${name}.gif`,
  };
}

/**
 * Get all Pokemon types
 */
export async function getAllTypes(): Promise<string[]> {
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/type`);
  return data.results
    .map((t: any) => t.name)
    .filter((t: string) => !['unknown', 'shadow'].includes(t));
}

/**
 * Get Pokemon by type
 */
export async function getPokemonByType(typeName: string, limit = 20): Promise<PokemonBasic[]> {
  const data = await fetchWithCache<any>(`${POKEAPI_BASE}/type/${typeName}`);
  
  const pokemonIds = data.pokemon
    .slice(0, limit)
    .map((p: any) => parseInt(p.pokemon.url.split('/').filter(Boolean).pop()))
    .filter((id: number) => id <= 1010); // Limit to main series
  
  const pokemonPromises = pokemonIds.map((id: number) => getPokemon(id));
  return Promise.all(pokemonPromises);
}

export default {
  getPokemon,
  getPokemonFull,
  getMove,
  getType,
  getPokemonList,
  searchPokemon,
  getEvolutionChain,
  getSpriteUrl,
  getAllTypes,
  getPokemonByType,
};
