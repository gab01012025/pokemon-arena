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

  // Gen 2-8 Mission Rewards
  'mareep': 179,
  'flaaffy': 180,
  'ampharos': 181,
  'larvitar': 246,
  'pupitar': 247,
  'ralts': 280,
  'kirlia': 281,
  'gardevoir': 282,
  'absol': 359,
  'bagon': 371,
  'shelgon': 372,
  'salamence': 373,
  'beldum': 374,
  'metang': 375,
  'metagross': 376,
  'shinx': 403,
  'luxio': 404,
  'luxray': 405,
  'gible': 443,
  'gabite': 444,
  'riolu': 447,
  'zorua': 570,
  'zoroark': 571,
  'axew': 610,
  'fraxure': 611,
  'haxorus': 612,
  'deino': 633,
  'zweilous': 634,
  'hydreigon': 635,
  'larvesta': 636,
  'volcarona': 637,
  'froakie': 656,
  'frogadier': 657,
  'honedge': 679,
  'doublade': 680,
  'aegislash': 681,
  'rowlet': 722,
  'dartrix': 723,
  'decidueye': 724,
  'dreepy': 885,
  'drakloak': 886,
  'dragapult': 887,
  
  // Geração 1 - Base forms
  'pidgey': 16,
  'rattata': 19,
  'spearow': 21,
  'meowth': 52,
  'caterpie': 10,
  'weedle': 13,
  'geodude': 74,
  'onix': 95,
  'exeggcute': 102,
  'exeggutor': 103,
  'horsea': 116,
  'scizor': 212,
  'snorlax': 143,
  'lapras': 131,
  'ditto': 132,
  'magikarp': 129,
  'dratini': 147,

  // Geração 1 - Missing standalone/evolution lines
  'farfetchd': 83,
  "farfetch'd": 83,
  'doduo': 84,
  'dodrio': 85,
  'seel': 86,
  'dewgong': 87,
  'shellder': 90,
  'cloyster': 91,
  'krabby': 98,
  'kingler': 99,

  // Geração 1 - Evoluções (mid-stage)
  'metapod': 11,
  'kakuna': 14,
  'pidgeotto': 17,
  'raticate': 20,
  'fearow': 22,
  'arbok': 24,
  'sandslash': 28,
  'clefable': 36,
  'wigglytuff': 40,
  'gloom': 44,
  'persian': 53,
  'poliwhirl': 61,
  'machoke': 67,
  'graveler': 75,
  'slowbro': 80,
  'magneton': 82,
  'electrode': 101,
  'marowak': 105,
  'weezing': 110,
  'seadra': 117,
  'dragonair': 148,

  // Geração 1 - Evoluções finais
  'butterfree': 12,
  'beedrill': 15,
  'pidgeot': 18,
  'vileplume': 45,
  'poliwrath': 62,

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
  'nidoranf': 29,
  'nidoranm': 32,
  'nidoran♀': 29,
  'nidoran♂': 32,
  'nidorina': 30,
  'nidorino': 33,
  'nidoking': 34,
  'nidoqueen': 31,
  'zubat': 41,
  'grimer': 88,
  'koffing': 109,

  // Missing Gen 1 Pokemon
  'golbat': 42,
  'paras': 46,
  'parasect': 47,
  'venonat': 48,
  'venomoth': 49,
  'dugtrio': 51,
  'primeape': 57,
  'golem': 76,
  'weepinbell': 70,
  'victreebel': 71,
  'tentacruel': 73,
  'drowzee': 96,
  'hypno': 97,
  'lickitung': 108,
  'rhydon': 112,
  'kangaskhan': 115,
  'goldeen': 118,
  'seaking': 119,
  'starmie': 121,
  'mrmime': 122,
  'mr.mime': 122,
  'scyther': 123,
  'jynx': 124,
  'pinsir': 127,
  'tauros': 128,
  'porygon': 137,
  'omanyte': 138,
  'omastar': 139,
  'kabuto': 140,
  'kabutops': 141,
  'aerodactyl': 142,
};

// Tipo de sprite para exibir
export type SpriteType =
  | 'default'           // Anime-style artwork local (padrão)
  | 'back'              // Costas normal
  | 'shiny'             // Frente shiny
  | 'back-shiny'        // Costas shiny
  | 'animated'          // GIF animado (só alguns)
  | 'artwork'           // Arte oficial Ken Sugimori
  | 'home'              // Pokemon HOME 3D render
  | 'anime'             // Anime-style artwork local
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
    case 'home':
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png`;
    case 'icon':
      return `${POKEAPI_SPRITE_URL}/versions/generation-viii/icons/${pokemonId}.png`;
    case 'anime':
      return `/pokemon-anime/${pokemonId}.png`;
    default:
      // Anime-style artwork (local) — fallback to pokemon.com CDN if local missing
      return `/pokemon-anime/${pokemonId}.png`;
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
    home: getPokemonImageUrl(nameOrId, 'home'),
    anime: getPokemonImageUrl(nameOrId, 'anime'),
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
export function getTypeColor(type: string | null | undefined): { bg: string; text: string; border: string } {
  if (!type) return typeColors.normal;
  return typeColors[type.toLowerCase()] || typeColors.normal;
}
