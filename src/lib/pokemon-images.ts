// Mapeamento de imagens dos Pokémon
// Usando sprites oficiais do PokeAPI

const POKEAPI_SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Mapeamento de nomes para IDs do Pokédex
export const pokemonNameToId: Record<string, number> = {
  // Starters - Geração 1
  'bulbasaur': 1,
  'ivysaur': 2,
  'venusaur': 3,
  'charmander': 4,
  'charmeleon': 5,
  'charizard': 6,
  'squirtle': 7,
  'wartortle': 8,
  'blastoise': 9,
  
  // Starters - Geração 2
  'chikorita': 152,
  'bayleef': 153,
  'meganium': 154,
  'cyndaquil': 155,
  'quilava': 156,
  'typhlosion': 157,
  'totodile': 158,
  'croconaw': 159,
  'feraligatr': 160,
  
  // Starters - Geração 3
  'treecko': 252,
  'grovyle': 253,
  'sceptile': 254,
  'torchic': 255,
  'combusken': 256,
  'blaziken': 257,
  'mudkip': 258,
  'marshtomp': 259,
  'swampert': 260,
  
  // Populares
  'pikachu': 25,
  'raichu': 26,
  'eevee': 133,
  'vaporeon': 134,
  'jolteon': 135,
  'flareon': 136,
  'espeon': 196,
  'umbreon': 197,
  'leafeon': 470,
  'glaceon': 471,
  'sylveon': 700,
  
  // Lendários - Geração 1
  'mewtwo': 150,
  'mew': 151,
  'articuno': 144,
  'zapdos': 145,
  'moltres': 146,
  
  // Lendários - Geração 2
  'lugia': 249,
  'ho-oh': 250,
  'celebi': 251,
  'raikou': 243,
  'entei': 244,
  'suicune': 245,
  
  // Outros populares
  'gengar': 94,
  'alakazam': 65,
  'machamp': 68,
  'gyarados': 130,
  'dragonite': 149,
  'tyranitar': 248,
  'lucario': 448,
  'garchomp': 445,
  'greninja': 658,
  'mimikyu': 778,
  
  // Geração 1 - Outros
  'pidgey': 16,
  'rattata': 19,
  'geodude': 74,
  'onix': 95,
  'snorlax': 143,
  'lapras': 131,
  'ditto': 132,
  'magikarp': 129,
  
  // Ghost types
  'gastly': 92,
  'haunter': 93,
  
  // Psychic types
  'abra': 63,
  'kadabra': 64,
  
  // Water types
  'psyduck': 54,
  'golduck': 55,
  'poliwag': 60,
  'tentacool': 72,
  'slowpoke': 79,
  'staryu': 120,
  
  // Fire types
  'vulpix': 37,
  'ninetales': 38,
  'growlithe': 58,
  'arcanine': 59,
  'ponyta': 77,
  'rapidash': 78,
  'magmar': 126,
  
  // Electric types
  'magnemite': 81,
  'voltorb': 100,
  'electabuzz': 125,
  
  // Grass types
  'oddish': 43,
  'bellsprout': 69,
  'exeggcute': 102,
  'tangela': 114,
  
  // Fighting types
  'mankey': 56,
  'machop': 66,
  'hitmonlee': 106,
  'hitmonchan': 107,
  
  // Rock/Ground types
  'sandshrew': 27,
  'diglett': 50,
  'cubone': 104,
  'rhyhorn': 111,
  
  // Normal types
  'jigglypuff': 39,
  'clefairy': 35,
  'chansey': 113,
  
  // Poison types
  'ekans': 23,
  'nidoran': 29,
  'zubat': 41,
  'grimer': 88,
  'koffing': 109,
};

// Tipo de sprite para exibir
export type SpriteType = 
  | 'default'           // Frente normal
  | 'back'              // Costas normal
  | 'shiny'             // Frente shiny
  | 'back-shiny'        // Costas shiny
  | 'animated'          // GIF animado (só alguns)
  | 'artwork'           // Arte oficial (maior qualidade)
  | 'icon';             // Ícone pequeno

/**
 * Retorna a URL da imagem de um Pokémon
 */
export function getPokemonImageUrl(
  nameOrId: string | number,
  spriteType: SpriteType = 'default'
): string {
  let pokemonId: number;
  
  if (typeof nameOrId === 'number') {
    pokemonId = nameOrId;
  } else {
    const normalizedName = nameOrId.toLowerCase().replace(/[^a-z-]/g, '');
    pokemonId = pokemonNameToId[normalizedName] || 1;
  }
  
  switch (spriteType) {
    case 'back':
      return `${POKEAPI_SPRITE_URL}/back/${pokemonId}.png`;
    case 'shiny':
      return `${POKEAPI_SPRITE_URL}/shiny/${pokemonId}.png`;
    case 'back-shiny':
      return `${POKEAPI_SPRITE_URL}/back/shiny/${pokemonId}.png`;
    case 'animated':
      return `${POKEAPI_SPRITE_URL}/versions/generation-v/black-white/animated/${pokemonId}.gif`;
    case 'artwork':
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
    case 'icon':
      return `${POKEAPI_SPRITE_URL}/versions/generation-viii/icons/${pokemonId}.png`;
    default:
      return `${POKEAPI_SPRITE_URL}/${pokemonId}.png`;
  }
}

/**
 * Retorna múltiplas URLs de imagens para um Pokémon (para pré-carregamento)
 */
export function getPokemonSprites(nameOrId: string | number): Record<SpriteType, string> {
  return {
    default: getPokemonImageUrl(nameOrId, 'default'),
    back: getPokemonImageUrl(nameOrId, 'back'),
    shiny: getPokemonImageUrl(nameOrId, 'shiny'),
    'back-shiny': getPokemonImageUrl(nameOrId, 'back-shiny'),
    animated: getPokemonImageUrl(nameOrId, 'animated'),
    artwork: getPokemonImageUrl(nameOrId, 'artwork'),
    icon: getPokemonImageUrl(nameOrId, 'icon'),
  };
}

/**
 * Cores por tipo de Pokémon para estilização
 */
export const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  normal: { bg: '#A8A878', text: '#fff', border: '#6D6D4E' },
  fire: { bg: '#F08030', text: '#fff', border: '#9C531F' },
  water: { bg: '#6890F0', text: '#fff', border: '#445E9C' },
  electric: { bg: '#F8D030', text: '#000', border: '#A1871F' },
  grass: { bg: '#78C850', text: '#fff', border: '#4E8234' },
  ice: { bg: '#98D8D8', text: '#000', border: '#638D8D' },
  fighting: { bg: '#C03028', text: '#fff', border: '#7D1F1A' },
  poison: { bg: '#A040A0', text: '#fff', border: '#682A68' },
  ground: { bg: '#E0C068', text: '#000', border: '#927D44' },
  flying: { bg: '#A890F0', text: '#fff', border: '#6D5E9C' },
  psychic: { bg: '#F85888', text: '#fff', border: '#A13959' },
  bug: { bg: '#A8B820', text: '#fff', border: '#6D7815' },
  rock: { bg: '#B8A038', text: '#fff', border: '#786824' },
  ghost: { bg: '#705898', text: '#fff', border: '#493963' },
  dragon: { bg: '#7038F8', text: '#fff', border: '#4924A1' },
  dark: { bg: '#705848', text: '#fff', border: '#49392F' },
  steel: { bg: '#B8B8D0', text: '#000', border: '#787887' },
  fairy: { bg: '#EE99AC', text: '#000', border: '#9B6470' },
};

/**
 * Retorna as cores de um tipo de Pokémon
 */
export function getTypeColor(type: string): { bg: string; text: string; border: string } {
  return typeColors[type.toLowerCase()] || typeColors.normal;
}
