import {
  PokemonType, GlobalType, EnergyType, StatusType,
  EnergyState, Move, BattlePokemon, Trainer, BattleItem,
  KantoPokemonData, EnergyCost, EvolutionOption,
} from './types';

// ==================== TYPE CONVERSIONS ====================
export const toGlobalType = (t: PokemonType): GlobalType =>
  (t.charAt(0).toUpperCase() + t.slice(1)) as GlobalType;
export const toGlobalTypes = (ts: PokemonType[]): GlobalType[] => ts.map(toGlobalType);

// ==================== TCG POCKET ENERGY ====================
export const ALL_SELECTABLE_ENERGY_TYPES: EnergyType[] = ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal', 'fairy'];
export const ALL_ENERGY_TYPES: EnergyType[] = ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal', 'fairy', 'colorless'];

export const ENERGY_ICONS: Record<EnergyType, string> = {
  grass: '🌿', fire: '🔥', water: '💧', lightning: '⚡',
  psychic: '🔮', fighting: '👊', darkness: '🌑', metal: '⚙️',
  fairy: '🧚', colorless: '⭐',
};

export const ENERGY_NAMES: Record<EnergyType, string> = {
  grass: 'Grass', fire: 'Fire', water: 'Water', lightning: 'Lightning',
  psychic: 'Psychic', fighting: 'Fighting', darkness: 'Darkness', metal: 'Metal',
  fairy: 'Fairy', colorless: 'Colorless',
};

export const TYPE_TO_ENERGY: Record<PokemonType, EnergyType> = {
  fire: 'fire', water: 'water', grass: 'grass', electric: 'lightning',
  psychic: 'psychic', fighting: 'fighting', dark: 'darkness', steel: 'metal',
  ghost: 'psychic', rock: 'fighting', ground: 'fighting', poison: 'psychic',
  bug: 'grass', ice: 'water', normal: 'colorless', flying: 'colorless',
  dragon: 'colorless', fairy: 'fairy',
};

export const EMPTY_ENERGY: EnergyState = {
  grass: 0, fire: 0, water: 0, lightning: 0,
  psychic: 0, fighting: 0, darkness: 0, metal: 0,
  fairy: 0, colorless: 0,
};

// ==================== TCG POCKET WEAKNESS / RESISTANCE ====================
// Each primary type has ONE weakness (+20 flat dmg) and optionally ONE resistance (-20 flat dmg).
// Based on Pokémon TCG Pocket rules.
export const TCG_WEAKNESS_RESISTANCE: Record<PokemonType, { weakness: PokemonType; resistance?: PokemonType }> = {
  fire:     { weakness: 'water'    },
  water:    { weakness: 'electric' },
  grass:    { weakness: 'fire'     },
  electric: { weakness: 'fighting' },
  psychic:  { weakness: 'dark'     },
  fighting: { weakness: 'psychic'  },
  dark:     { weakness: 'fighting' },
  steel:    { weakness: 'fire',     resistance: 'grass'   },
  dragon:   { weakness: 'dragon',   resistance: 'fire'    },
  normal:   { weakness: 'fighting' },
  flying:   { weakness: 'electric', resistance: 'fighting'},
  rock:     { weakness: 'water',    resistance: 'fire'    },
  ground:   { weakness: 'water',    resistance: 'electric'},
  ice:      { weakness: 'fire',     resistance: 'ice'     },
  poison:   { weakness: 'psychic',  resistance: 'fighting'},
  bug:      { weakness: 'fire',     resistance: 'fighting'},
  ghost:    { weakness: 'dark',     resistance: 'normal'  },
  fairy:    { weakness: 'steel',    resistance: 'dark'    },
};

/** Get weakness & resistance for a Pokémon based on its primary type */
export const getWeaknessResistance = (types: PokemonType[]): { weakness?: PokemonType; resistance?: PokemonType } => {
  const primary = types[0];
  const entry = TCG_WEAKNESS_RESISTANCE[primary];
  if (!entry) return {};
  return { weakness: entry.weakness, resistance: entry.resistance };
};

// ==================== STATUS EFFECT ICONS ====================
export const STATUS_ICONS: Record<StatusType, string> = {
  burn: 'BRN', poison: 'PSN', paralyze: 'PAR', sleep: 'SLP',
  freeze: 'FRZ', confuse: 'CNF', stun: 'STN', invulnerable: 'INV',
  counter: 'CTR', reflect: 'RFL', taunt: 'TNT', silence: 'SIL',
  weaken: 'WKN', strengthen: 'STR', 'reduce-damage': 'DEF', 'increase-damage': 'DMG',
  'remove-energy': 'RMV', 'steal-energy': 'STL', 'drain-hp': 'DRN', 'heal-over-time': 'HOT',
  'cooldown-increase': 'CDI', 'cooldown-reduce': 'CDR', 'cannot-be-healed': 'NBH',
  endure: 'END', expose: 'EXP', bleed: 'BLD',
};

// ==================== TYPE COLORS & ABBREVIATIONS ====================
export const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  normal: { bg: 'linear-gradient(135deg, #A8A878 0%, #8a8a58 100%)', border: '#6d6d36', text: '#fff' },
  fire: { bg: 'linear-gradient(135deg, #F08030 0%, #dd6610 100%)', border: '#c44d00', text: '#fff' },
  water: { bg: 'linear-gradient(135deg, #6890F0 0%, #4a6fd0 100%)', border: '#3a5eb5', text: '#fff' },
  grass: { bg: 'linear-gradient(135deg, #78C850 0%, #5aa830 100%)', border: '#4a8828', text: '#fff' },
  electric: { bg: 'linear-gradient(135deg, #F8D030 0%, #e0b020 100%)', border: '#c09810', text: '#333' },
  ice: { bg: 'linear-gradient(135deg, #98D8D8 0%, #78b8b8 100%)', border: '#58a0a0', text: '#333' },
  fighting: { bg: 'linear-gradient(135deg, #C03028 0%, #a01810 100%)', border: '#800800', text: '#fff' },
  poison: { bg: 'linear-gradient(135deg, #A040A0 0%, #802080 100%)', border: '#601060', text: '#fff' },
  ground: { bg: 'linear-gradient(135deg, #E0C068 0%, #c0a048 100%)', border: '#a08838', text: '#333' },
  flying: { bg: 'linear-gradient(135deg, #A890F0 0%, #8870d0 100%)', border: '#7060b0', text: '#fff' },
  psychic: { bg: 'linear-gradient(135deg, #F85888 0%, #e03868 100%)', border: '#c02858', text: '#fff' },
  bug: { bg: 'linear-gradient(135deg, #A8B820 0%, #889800 100%)', border: '#708000', text: '#fff' },
  rock: { bg: 'linear-gradient(135deg, #B8A038 0%, #988018 100%)', border: '#786810', text: '#fff' },
  ghost: { bg: 'linear-gradient(135deg, #705898 0%, #504078 100%)', border: '#403060', text: '#fff' },
  dragon: { bg: 'linear-gradient(135deg, #7038F8 0%, #5018d8 100%)', border: '#4010c0', text: '#fff' },
  dark: { bg: 'linear-gradient(135deg, #705848 0%, #504030 100%)', border: '#382820', text: '#fff' },
  steel: { bg: 'linear-gradient(135deg, #B8B8D0 0%, #9898b0 100%)', border: '#808098', text: '#333' },
  fairy: { bg: 'linear-gradient(135deg, #EE99AC 0%, #d07090 100%)', border: '#b86080', text: '#fff' },
};

export const MOVE_ABBREV: Record<string, string> = {
  'Flamethrower': 'FLM', 'Ember': 'EMB', 'Fire Fang': 'FFG', 'Recover': 'REC',
  'Hydro Pump': 'HYP', 'Water Gun': 'WGN', 'Aqua Tail': 'AQT', 'Surf': 'SRF',
  'Razor Leaf': 'RZL', 'Vine Whip': 'VNW', 'Solar Beam': 'SLB', 'Synthesis': 'SYN',
  'Thunderbolt': 'TBT', 'Thunder Shock': 'TSK', 'Thunder': 'THD', 'Charge': 'CHG',
  'Psychic': 'PSY', 'Psybeam': 'PSB', 'Hypnosis': 'HYP', 'Calm Mind': 'CLM',
  'Close Combat': 'CCB', 'Karate Chop': 'KRC', 'Brick Break': 'BRK', 'Bulk Up': 'BUP',
  'Shadow Ball': 'SHB', 'Shadow Claw': 'SHC', 'Hex': 'HEX', 'Curse': 'CRS',
  'Dark Pulse': 'DKP', 'Bite': 'BTE', 'Crunch': 'CRN', 'Nasty Plot': 'NSP',
  'Flash Cannon': 'FLC', 'Iron Tail': 'IRT', 'Metal Claw': 'MTC', 'Iron Defense': 'IRD',
  'Tackle': 'TCK', 'Body Slam': 'BSM', 'Hyper Beam': 'HPB', 'Quick Attack': 'QKA',
  'Earthquake': 'EQK', 'Dig': 'DIG', 'Rock Slide': 'RKS', 'Stealth Rock': 'STR',
  'Ice Beam': 'ICB', 'Blizzard': 'BLZ', 'Aurora Beam': 'ARB', 'Hail': 'HAL',
  'Aerial Ace': 'ARA', 'Air Slash': 'ARS', 'Brave Bird': 'BRB', 'Roost': 'RST',
  'Poison Jab': 'PJB', 'Sludge Bomb': 'SLG', 'Toxic': 'TXC', 'Acid': 'ACD',
  'Bug Buzz': 'BGZ', 'X-Scissor': 'XSC', 'Signal Beam': 'SGB', 'String Shot': 'SST',
  'Moonblast': 'MNB', 'Dazzling Gleam': 'DZG', 'Draining Kiss': 'DKS', 'Charm': 'CHM',
  'Dragon Claw': 'DGC', 'Dragon Pulse': 'DGP', 'Outrage': 'OTR', 'Dragon Dance': 'DGD',
  'Power Gem': 'PWG', 'Rock Throw': 'RKT', 'Ancient Power': 'ACP',
  'Splash': 'SPL', 'Flail': 'FLA', 'Dragon Rage': 'DGR', 'Twister': 'TWS', 'Wrap': 'WRP',
  'Fire Blast': 'FBL', 'Sheer Cold': 'SRC', 'Drill Peck': 'DPK', 'Aura Sphere': 'ASP',
  'Transform': 'TFM', 'Bone Club': 'BNC', 'Bonemerang': 'BMR', 'Self-Destruct': 'SLD',
  'Sing': 'SNG', 'Double Slap': 'DSL', 'Metronome': 'MTR', 'Pound': 'PND',
  'Rollout': 'RLT', 'Defense Curl': 'DFC', 'Fury Attack': 'FRA', 'Horn Attack': 'HRA',
};

// ==================== BATTLE BACKGROUNDS ====================
export const BATTLE_BACKGROUNDS = [
  '/images/cenarios/or_as_vs_flannery_battle_background_by_phoenixoflight92_d88efs2-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_battle_background_4_by_phoenixoflight92_d83ohf3-414w-2x.jpg',
  '/images/cenarios/or_as_battle_background_1b_by_phoenixoflight92_d874gjl-414w-2x.jpg',
  '/images/cenarios/or_as_vs_elite_four_sydney_battle_background_by_phoenixoflight92_d891h6b-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_battle_background_10_by_phoenixoflight92_d843fov-414w-2x.jpg',
  '/images/cenarios/or_as_battle_background_6__evening__by_phoenixoflight92_d88ajms-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_battle_background_5_by_phoenixoflight92_d83pwna-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_forest_battle_background_by_phoenixoflight92_d85ijvr-414w-2x.jpg',
];

// ==================== SPRITE HELPERS ====================
export const POKEMON_POKEDEX: Record<string, number> = {
  Bulbasaur: 1, Ivysaur: 2, Venusaur: 3, Charmander: 4, Charmeleon: 5, Charizard: 6,
  Squirtle: 7, Wartortle: 8, Blastoise: 9, Caterpie: 10, Metapod: 11, Butterfree: 12,
  Weedle: 13, Kakuna: 14, Beedrill: 15, Pidgey: 16, Pidgeotto: 17, Pidgeot: 18,
  Rattata: 19, Raticate: 20, Spearow: 21, Fearow: 22, Ekans: 23, Arbok: 24,
  Pikachu: 25, Raichu: 26, Sandshrew: 27, Sandslash: 28, NidoranF: 29, Nidorina: 30,
  Nidoqueen: 31, NidoranM: 32, Nidorino: 33, Nidoking: 34, Clefairy: 35, Clefable: 36,
  Vulpix: 37, Ninetales: 38, Jigglypuff: 39, Wigglytuff: 40, Zubat: 41, Golbat: 42,
  Oddish: 43, Gloom: 44, Vileplume: 45, Paras: 46, Parasect: 47, Venonat: 48,
  Venomoth: 49, Diglett: 50, Dugtrio: 51, Meowth: 52, Persian: 53, Psyduck: 54,
  Golduck: 55, Mankey: 56, Primeape: 57, Growlithe: 58, Arcanine: 59, Poliwag: 60,
  Poliwhirl: 61, Poliwrath: 62, Abra: 63, Kadabra: 64, Alakazam: 65, Machop: 66,
  Machoke: 67, Machamp: 68, Bellsprout: 69, Weepinbell: 70, Victreebel: 71,
  Tentacool: 72, Tentacruel: 73, Geodude: 74, Graveler: 75, Golem: 76,
  Ponyta: 77, Rapidash: 78, Slowpoke: 79, Slowbro: 80, Magnemite: 81, Magneton: 82,
  Farfetchd: 83, Doduo: 84, Dodrio: 85, Seel: 86, Dewgong: 87,
  Grimer: 88, Muk: 89, Shellder: 90, Cloyster: 91,
  Gastly: 92, Haunter: 93, Gengar: 94, Onix: 95, Drowzee: 96, Hypno: 97,
  Krabby: 98, Kingler: 99,
  Voltorb: 100, Electrode: 101, Exeggcute: 102, Exeggutor: 103, Cubone: 104, Marowak: 105,
  Hitmonlee: 106, Hitmonchan: 107, Lickitung: 108,
  Koffing: 109, Weezing: 110, Rhyhorn: 111, Rhydon: 112, Chansey: 113, Tangela: 114,
  Kangaskhan: 115, Horsea: 116, Seadra: 117, Goldeen: 118, Seaking: 119,
  Staryu: 120, Starmie: 121, MrMime: 122, Scyther: 123, Jynx: 124,
  Electabuzz: 125, Magmar: 126, Pinsir: 127, Tauros: 128, Magikarp: 129,
  Gyarados: 130, Lapras: 131, Ditto: 132, Eevee: 133, Vaporeon: 134,
  Jolteon: 135, Flareon: 136, Porygon: 137, Omanyte: 138, Omastar: 139,
  Kabuto: 140, Kabutops: 141, Aerodactyl: 142, Snorlax: 143, Articuno: 144,
  Zapdos: 145, Moltres: 146, Dratini: 147, Dragonair: 148, Dragonite: 149,
  Mewtwo: 150, Mew: 151,
};

export const getSprite = (name: string): string => {
  const num = POKEMON_POKEDEX[name] || 25;
  return `/pokemon-anime/${num}.png`;
};

export const getSpriteById = (id: number): string =>
  `/pokemon-anime/${id}.png`;

// ==================== DEFAULT MOVES PER TYPE ====================
export const getDefaultMoves = (type: PokemonType): Move[] => {
  const moveSets: Record<string, Move[]> = {
    fire: [
      { id: 'f1', name: 'Flamethrower', type: 'fire', power: 45, accuracy: 100, cost: [{ type: 'fire', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful stream of fire dealing 45 damage.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 30, duration: 3 } },
      { id: 'f2', name: 'Ember', type: 'fire', power: 25, accuracy: 100, cost: [{ type: 'fire', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A small flame dealing 25 damage. May burn.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 20, duration: 2 } },
      { id: 'f3', name: 'Fire Fang', type: 'fire', power: 35, accuracy: 95, cost: [{ type: 'fire', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Bites with fire fangs for 35 damage.', targetType: 'enemy' },
      { id: 'f4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    water: [
      { id: 'w1', name: 'Hydro Pump', type: 'water', power: 55, accuracy: 85, cost: [{ type: 'water', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A high-pressure blast of water dealing 55 damage.', targetType: 'enemy' },
      { id: 'w2', name: 'Water Gun', type: 'water', power: 25, accuracy: 100, cost: [{ type: 'water', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Squirts water dealing 25 damage.', targetType: 'enemy' },
      { id: 'w3', name: 'Aqua Tail', type: 'water', power: 40, accuracy: 95, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Swings a watery tail for 40 damage.', targetType: 'enemy' },
      { id: 'w4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    grass: [
      { id: 'g1', name: 'Solar Beam', type: 'grass', power: 55, accuracy: 90, cost: [{ type: 'grass', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'Absorbs light then blasts for 55 damage.', targetType: 'enemy' },
      { id: 'g2', name: 'Razor Leaf', type: 'grass', power: 30, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Launches sharp leaves for 30 damage. High crit rate.', targetType: 'enemy' },
      { id: 'g3', name: 'Vine Whip', type: 'grass', power: 25, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Strikes with vines for 25 damage.', targetType: 'enemy' },
      { id: 'g4', name: 'Synthesis', type: 'grass', power: 0, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Absorbs sunlight to heal 60 HP.', targetType: 'self', healing: 60 },
    ],
    electric: [
      { id: 'e1', name: 'Thunderbolt', type: 'electric', power: 45, accuracy: 100, cost: [{ type: 'lightning', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A strong jolt of electricity for 45 damage. May paralyze.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 30, duration: 2 } },
      { id: 'e2', name: 'Thunder Shock', type: 'electric', power: 20, accuracy: 100, cost: [{ type: 'lightning', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A shock of electricity for 20 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 20, duration: 1 } },
      { id: 'e3', name: 'Thunder', type: 'electric', power: 60, accuracy: 70, cost: [{ type: 'lightning', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive lightning strike for 60 damage. Low accuracy.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 50, duration: 2 } },
      { id: 'e4', name: 'Charge', type: 'electric', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Charges power. Heals 30 HP.', targetType: 'self', healing: 30 },
    ],
    psychic: [
      { id: 'ps1', name: 'Psychic', type: 'psychic', power: 45, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A telekinetic blast for 45 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 20, duration: 2 } },
      { id: 'ps2', name: 'Psybeam', type: 'psychic', power: 30, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A beam of psychic energy for 30 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 25, duration: 2 } },
      { id: 'ps3', name: 'Hypnosis', type: 'psychic', power: 0, accuracy: 75, cost: [{ type: 'psychic', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Puts the target to sleep for 2 turns.', targetType: 'enemy', statusEffect: { type: 'sleep', chance: 100, duration: 2 } },
      { id: 'ps4', name: 'Barrier', type: 'psychic', power: 0, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Creates a barrier. Reduces damage by 25 for 2 turns.', targetType: 'self', statusEffect: { type: 'reduce-damage', chance: 100, duration: 2, value: 25 } },
    ],
    fighting: [
      { id: 'fg1', name: 'Close Combat', type: 'fighting', power: 55, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'An all-out attack for 55 damage.', targetType: 'enemy' },
      { id: 'fg2', name: 'Karate Chop', type: 'fighting', power: 30, accuracy: 100, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A sharp chop for 30 damage.', targetType: 'enemy' },
      { id: 'fg3', name: 'Brick Break', type: 'fighting', power: 40, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful punch for 40 damage.', targetType: 'enemy' },
      { id: 'fg4', name: 'Bulk Up', type: 'fighting', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Tenses muscles. Heals 40 HP.', targetType: 'self', healing: 40 },
    ],
    ghost: [
      { id: 'gh1', name: 'Shadow Ball', type: 'ghost', power: 45, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Hurls a shadowy blob for 45 damage.', targetType: 'enemy' },
      { id: 'gh2', name: 'Shadow Claw', type: 'ghost', power: 35, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slashes with shadow for 35 damage.', targetType: 'enemy' },
      { id: 'gh3', name: 'Hex', type: 'ghost', power: 35, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Attacks with a curse for 35 damage. Double if target has status.', targetType: 'enemy' },
      { id: 'gh4', name: 'Curse', type: 'ghost', power: 0, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Curses the target. Poisons for 3 turns.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 100, duration: 3 } },
    ],
    dark: [
      { id: 'dk1', name: 'Dark Pulse', type: 'dark', power: 45, accuracy: 100, cost: [{ type: 'darkness', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A wave of dark thoughts for 45 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 20, duration: 1 } },
      { id: 'dk2', name: 'Bite', type: 'dark', power: 30, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Bites the target for 30 damage.', targetType: 'enemy' },
      { id: 'dk3', name: 'Crunch', type: 'dark', power: 40, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Crunches hard for 40 damage.', targetType: 'enemy' },
      { id: 'dk4', name: 'Nasty Plot', type: 'dark', power: 0, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Schemes. Boosts attack by 40% for 3 turns.', targetType: 'self', statusEffect: { type: 'strengthen', chance: 100, duration: 3, value: 40 } },
    ],
    poison: [
      { id: 'po1', name: 'Sludge Bomb', type: 'poison', power: 45, accuracy: 100, cost: [{ type: 'darkness', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Hurls sludge for 45 damage. May poison.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 40, duration: 3 } },
      { id: 'po2', name: 'Poison Jab', type: 'poison', power: 35, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Jabs with poison for 35 damage.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 30, duration: 2 } },
      { id: 'po3', name: 'Toxic', type: 'poison', power: 0, accuracy: 90, cost: [{ type: 'darkness', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Badly poisons the target for 4 turns.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 100, duration: 4 } },
      { id: 'po4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    ground: [
      { id: 'gd1', name: 'Earthquake', type: 'ground', power: 50, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Shakes the ground for 50 damage to all enemies.', targetType: 'all-enemies' },
      { id: 'gd2', name: 'Dig', type: 'ground', power: 40, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Digs underground then strikes for 40 damage.', targetType: 'enemy' },
      { id: 'gd3', name: 'Rock Slide', type: 'rock', power: 35, accuracy: 90, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 35 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 30, duration: 1 } },
      { id: 'gd4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    flying: [
      { id: 'fl1', name: 'Brave Bird', type: 'flying', power: 55, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A reckless dive for 55 damage.', targetType: 'enemy' },
      { id: 'fl2', name: 'Air Slash', type: 'flying', power: 35, accuracy: 95, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Slashes with air for 35 damage.', targetType: 'enemy' },
      { id: 'fl3', name: 'Aerial Ace', type: 'flying', power: 30, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A swift strike for 30 damage. Never misses.', targetType: 'enemy' },
      { id: 'fl4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Lands and rests. Heals 50 HP.', targetType: 'self', healing: 50 },
    ],
    rock: [
      { id: 'rk1', name: 'Rock Slide', type: 'rock', power: 40, accuracy: 90, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 40 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 30, duration: 1 } },
      { id: 'rk2', name: 'Rock Throw', type: 'rock', power: 25, accuracy: 100, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Throws a rock for 25 damage.', targetType: 'enemy' },
      { id: 'rk3', name: 'Ancient Power', type: 'rock', power: 30, accuracy: 100, cost: [{ type: 'fighting', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Attacks with ancient power for 30 damage.', targetType: 'enemy' },
      { id: 'rk4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    bug: [
      { id: 'bg1', name: 'Bug Buzz', type: 'bug', power: 45, accuracy: 100, cost: [{ type: 'grass', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A vibrating buzz for 45 damage.', targetType: 'enemy' },
      { id: 'bg2', name: 'X-Scissor', type: 'bug', power: 35, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slashes in an X for 35 damage.', targetType: 'enemy' },
      { id: 'bg3', name: 'Signal Beam', type: 'bug', power: 30, accuracy: 100, cost: [{ type: 'grass', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A peculiar beam for 30 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 20, duration: 2 } },
      { id: 'bg4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    ice: [
      { id: 'ic1', name: 'Ice Beam', type: 'ice', power: 45, accuracy: 100, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A freezing beam for 45 damage. May freeze.', targetType: 'enemy', statusEffect: { type: 'freeze', chance: 20, duration: 2 } },
      { id: 'ic2', name: 'Aurora Beam', type: 'ice', power: 30, accuracy: 100, cost: [{ type: 'water', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A rainbow beam for 30 damage.', targetType: 'enemy' },
      { id: 'ic3', name: 'Blizzard', type: 'ice', power: 55, accuracy: 70, cost: [{ type: 'water', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A howling blizzard for 55 damage. May freeze.', targetType: 'all-enemies', statusEffect: { type: 'freeze', chance: 30, duration: 2 } },
      { id: 'ic4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    steel: [
      { id: 'st1', name: 'Flash Cannon', type: 'steel', power: 45, accuracy: 100, cost: [{ type: 'metal', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A focused light cannon for 45 damage.', targetType: 'enemy' },
      { id: 'st2', name: 'Metal Claw', type: 'steel', power: 30, accuracy: 95, cost: [{ type: 'metal', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Rakes with metal claws for 30 damage.', targetType: 'enemy' },
      { id: 'st3', name: 'Iron Tail', type: 'steel', power: 40, accuracy: 85, cost: [{ type: 'metal', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slams with a hard tail for 40 damage.', targetType: 'enemy' },
      { id: 'st4', name: 'Iron Defense', type: 'steel', power: 0, accuracy: 100, cost: [{ type: 'metal', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Hardens body. Heals 50 HP.', targetType: 'self', healing: 50 },
    ],
    dragon: [
      { id: 'dr1', name: 'Dragon Pulse', type: 'dragon', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A shockwave from the mouth for 45 damage.', targetType: 'enemy' },
      { id: 'dr2', name: 'Dragon Claw', type: 'dragon', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slashes with claws for 35 damage.', targetType: 'enemy' },
      { id: 'dr3', name: 'Outrage', type: 'dragon', power: 60, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 2, currentCooldown: 0, description: 'A rampage for 60 damage. Confuses self.', targetType: 'enemy' },
      { id: 'dr4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
    fairy: [
      { id: 'fa1', name: 'Moonblast', type: 'fairy', power: 45, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A moonlight blast for 45 damage.', targetType: 'enemy' },
      { id: 'fa2', name: 'Dazzling Gleam', type: 'fairy', power: 40, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Dazzles all enemies for 40 damage.', targetType: 'all-enemies' },
      { id: 'fa3', name: 'Draining Kiss', type: 'fairy', power: 25, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Drains HP for 25 damage. Heals user 15 HP.', targetType: 'enemy' },
      { id: 'fa4', name: 'Charm', type: 'fairy', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Charms the target. Heals 40 HP.', targetType: 'self', healing: 40 },
    ],
    normal: [
      { id: 'n1', name: 'Body Slam', type: 'normal', power: 40, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A full-body slam for 40 damage. May paralyze.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 30, duration: 2 } },
      { id: 'n2', name: 'Tackle', type: 'normal', power: 20, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Tackles the target for 20 damage.', targetType: 'enemy' },
      { id: 'n3', name: 'Quick Attack', type: 'normal', power: 25, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A swift attack for 25 damage. High priority.', targetType: 'enemy' },
      { id: 'n4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
    ],
  };
  return moveSets[type] || moveSets.normal;
};

// ==================== CUSTOM POKEMON MOVES ====================
// Skills defined by client via arena-game.app Character Maker
export const POKEMON_CUSTOM_MOVES: Record<number, Move[]> = {

  // ==================== ARENA-GAME.APP DEFINITIONS ====================

  // Bulbasaur — Grass/Poison starter (arena-game.app)
  1: [
    { id: 'blb1', name: 'Razor Leaf', type: 'grass', power: 10, accuracy: 100,
      cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0,
      description: 'Bulbasaur directs all attacks at the enemy, dealing 10 damage. During "Sun\'s Charge", deals 5 additional damage per charge.',
      targetType: 'enemy' },
    { id: 'blb2', name: 'Solar Beam', type: 'grass', power: 50, accuracy: 100,
      cost: [{ type: 'grass', amount: 3 }], cooldown: 1, currentCooldown: 0,
      description: 'Expends all energy dealing 50 piercing damage. Bulbasaur becomes invulnerable for 1 turn. Cannot be countered.',
      targetType: 'enemy',
      statusEffect: { type: 'invulnerable', chance: 100, duration: 1 } },
    { id: 'blb3', name: "Sun's Charge", type: 'grass', power: 0, accuracy: 100,
      cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0,
      description: 'Charges power with the sun, healing 5 HP. "Razor Leaf" permanently deals 5 additional damage. Boosts damage 15% for 3 turns.',
      targetType: 'self', healing: 5,
      statusEffect: { type: 'strengthen', chance: 100, duration: 3, value: 15 } },
    { id: 'blb4', name: 'Dodge', type: 'normal', power: 0, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 4, currentCooldown: 0,
      description: 'Bulbasaur becomes invulnerable for 1 turn.',
      targetType: 'self',
      statusEffect: { type: 'invulnerable', chance: 100, duration: 1 } },
  ],

  // Charmander — Fire starter (arena-game.app)
  4: [
    { id: 'chm1', name: 'Firetail', type: 'fire', power: 10, accuracy: 100,
      cost: [{ type: 'fire', amount: 1 }], cooldown: 0, currentCooldown: 0,
      description: 'Deals 10 damage to one enemy. During "Tail In Fire", deals 5 additional damage.',
      targetType: 'enemy' },
    { id: 'chm2', name: 'Flamethrower', type: 'fire', power: 25, accuracy: 100,
      cost: [{ type: 'fire', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0,
      description: 'Deals 25 affliction damage. The following 2 turns, the enemy takes 25% more damage from fire skills.',
      targetType: 'enemy',
      statusEffect: { type: 'increase-damage', chance: 100, duration: 2, value: 25 } },
    { id: 'chm3', name: 'Tail In Fire', type: 'fire', power: 0, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 3, currentCooldown: 0,
      description: 'Creates fire in its tail. Gains 5 damage reduction for 3 turns. "Firetail" deals 10 additional damage and "Flamethrower" is enabled.',
      targetType: 'self',
      statusEffect: { type: 'reduce-damage', chance: 100, duration: 3, value: 5 } },
    { id: 'chm4', name: 'Dodge Jump', type: 'normal', power: 0, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 4, currentCooldown: 0,
      description: 'Charmander becomes invulnerable for 1 turn.',
      targetType: 'self',
      statusEffect: { type: 'invulnerable', chance: 100, duration: 1 } },
  ],

  // Squirtle — Water starter (arena-game.app)
  7: [
    { id: 'sqt1', name: 'Bubble', type: 'water', power: 10, accuracy: 100,
      cost: [{ type: 'water', amount: 1 }], cooldown: 1, currentCooldown: 0,
      description: 'Deals 10 damage for 1 turn, and 5 damage the following turn. If the enemy uses a non-energy skill, they lose 1 fire energy.',
      targetType: 'enemy',
      statusEffect: { type: 'drain-hp', chance: 100, duration: 1, value: 5 } },
    { id: 'sqt2', name: 'Rotating Shell', type: 'water', power: 10, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0,
      description: 'Spins at one enemy dealing 10 damage, and 5 the following turn. If the enemy uses a non-physical skill, they are stunned for 1 turn.',
      targetType: 'enemy',
      statusEffect: { type: 'stun', chance: 50, duration: 1 } },
    { id: 'sqt3', name: 'Hydro Pump', type: 'water', power: 20, accuracy: 100,
      cost: [{ type: 'water', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0,
      description: 'Deals 20 damage to one enemy. The enemy also takes 5 affliction damage the following turn.',
      targetType: 'enemy',
      statusEffect: { type: 'drain-hp', chance: 100, duration: 1, value: 5 } },
    { id: 'sqt4', name: 'Jump', type: 'normal', power: 0, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 4, currentCooldown: 0,
      description: 'Squirtle becomes invulnerable for 1 turn.',
      targetType: 'self',
      statusEffect: { type: 'invulnerable', chance: 100, duration: 1 } },
  ],

  // Chansey — Normal healer (arena-game.app)
  113: [
    { id: 'chn1', name: 'Dynamic Punch', type: 'fighting', power: 10, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0,
      description: 'Punches one enemy dealing 10 piercing damage. For 1 turn, if that enemy uses a physical skill, they take 5 piercing damage. Ignores invulnerability.',
      targetType: 'enemy',
      statusEffect: { type: 'counter', chance: 100, duration: 1, value: 5 } },
    { id: 'chn2', name: 'Attract', type: 'normal', power: 0, accuracy: 100,
      cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0,
      description: 'Reduces all enemy physical and energy non-affliction damage by 15 for 1 turn. Cannot be countered or reflected.',
      targetType: 'enemy',
      statusEffect: { type: 'weaken', chance: 100, duration: 1, value: 15 } },
    { id: 'chn3', name: 'Heal Bell', type: 'normal', power: 0, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0,
      description: 'Heals herself or an ally for 15 HP and removes all harmful affliction effects.',
      targetType: 'self', healing: 15 },
    { id: 'chn4', name: 'Sing', type: 'normal', power: 0, accuracy: 100,
      cost: [{ type: 'colorless', amount: 1 }], cooldown: 4, currentCooldown: 0,
      description: 'Chansey becomes invulnerable for 1 turn.',
      targetType: 'self',
      statusEffect: { type: 'invulnerable', chance: 100, duration: 1 } },
  ],

  // Magikarp — almost useless until evolution
  129: [
    { id: 'mk1', name: 'Splash', type: 'normal', power: 0, accuracy: 100, cost: [], cooldown: 0, currentCooldown: 0, description: 'Magikarp splashes... but nothing happened!', targetType: 'self' },
    { id: 'mk2', name: 'Tackle', type: 'normal', power: 10, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A weak tackle for 10 damage.', targetType: 'enemy' },
    { id: 'mk3', name: 'Flail', type: 'normal', power: 15, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Flails desperately for 15 damage.', targetType: 'enemy' },
    { id: 'mk4', name: 'Splash', type: 'normal', power: 0, accuracy: 100, cost: [], cooldown: 0, currentCooldown: 0, description: '...but nothing happened!', targetType: 'self' },
  ],
  // Dratini — baby dragon
  147: [
    { id: 'dra1', name: 'Dragon Rage', type: 'dragon', power: 30, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A fixed blast of dragon rage for 30 damage.', targetType: 'enemy' },
    { id: 'dra2', name: 'Twister', type: 'dragon', power: 20, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A violent twister for 20 damage.', targetType: 'enemy' },
    { id: 'dra3', name: 'Wrap', type: 'normal', power: 25, accuracy: 90, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Wraps the enemy for 25 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 20, duration: 1 } },
    { id: 'dra4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
  ],
  // Caterpie — weak bug
  10: [
    { id: 'cat1', name: 'Tackle', type: 'normal', power: 15, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A basic tackle for 15 damage.', targetType: 'enemy' },
    { id: 'cat2', name: 'String Shot', type: 'bug', power: 0, accuracy: 95, cost: [{ type: 'grass', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Slows the enemy. May stun for 1 turn.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 60, duration: 1 } },
    { id: 'cat3', name: 'Bug Bite', type: 'bug', power: 20, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Bites with tiny jaws for 20 damage.', targetType: 'enemy' },
    { id: 'cat4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 40 HP.', targetType: 'self', healing: 40 },
  ],
  // Weedle — weak bug/poison
  13: [
    { id: 'wdl1', name: 'Poison Sting', type: 'poison', power: 15, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Stings with poison for 15 damage.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 30, duration: 2 } },
    { id: 'wdl2', name: 'String Shot', type: 'bug', power: 0, accuracy: 95, cost: [{ type: 'grass', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Slows the enemy. May stun for 1 turn.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 60, duration: 1 } },
    { id: 'wdl3', name: 'Bug Bite', type: 'bug', power: 20, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Bites for 20 damage.', targetType: 'enemy' },
    { id: 'wdl4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 40 HP.', targetType: 'self', healing: 40 },
  ],
  // Cubone — ground specialist
  104: [
    { id: 'cub1', name: 'Bone Club', type: 'ground', power: 35, accuracy: 90, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Clubs with a bone for 35 damage.', targetType: 'enemy' },
    { id: 'cub2', name: 'Bonemerang', type: 'ground', power: 45, accuracy: 85, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Throws a bone boomerang for 45 damage.', targetType: 'enemy' },
    { id: 'cub3', name: 'Headbutt', type: 'normal', power: 25, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A headbutt for 25 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 20, duration: 1 } },
    { id: 'cub4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
  ],
  // Jigglypuff — singer
  39: [
    { id: 'jig1', name: 'Pound', type: 'normal', power: 25, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Pounds the target for 25 damage.', targetType: 'enemy' },
    { id: 'jig2', name: 'Sing', type: 'normal', power: 0, accuracy: 60, cost: [{ type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Sings a lullaby. Puts the target to sleep.', targetType: 'enemy', statusEffect: { type: 'sleep', chance: 100, duration: 2 } },
    { id: 'jig3', name: 'Double Slap', type: 'normal', power: 30, accuracy: 85, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slaps the target repeatedly for 30 damage.', targetType: 'enemy' },
    { id: 'jig4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
  ],
  // Clefairy — fairy magic
  35: [
    { id: 'clf1', name: 'Pound', type: 'normal', power: 25, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Pounds the target for 25 damage.', targetType: 'enemy' },
    { id: 'clf2', name: 'Metronome', type: 'normal', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Waggles a finger for a random 35 power attack.', targetType: 'enemy' },
    { id: 'clf3', name: 'Moonblast', type: 'fairy', power: 40, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A moonlight blast for 40 damage.', targetType: 'enemy' },
    { id: 'clf4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
  ],
  // Voltorb — electric ball
  100: [
    { id: 'vol1', name: 'Thunder Shock', type: 'electric', power: 20, accuracy: 100, cost: [{ type: 'lightning', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A quick shock for 20 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 20, duration: 1 } },
    { id: 'vol2', name: 'Thunderbolt', type: 'electric', power: 45, accuracy: 100, cost: [{ type: 'lightning', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful bolt for 45 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 30, duration: 2 } },
    { id: 'vol3', name: 'Self-Destruct', type: 'normal', power: 80, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 99, currentCooldown: 0, description: 'Explodes for massive 80 damage. Faints the user.', targetType: 'enemy' },
    { id: 'vol4', name: 'Charge', type: 'electric', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Charges power. Heals 30 HP.', targetType: 'self', healing: 30 },
  ],
  // Magnemite — electric/steel
  81: [
    { id: 'mag1', name: 'Thunder Shock', type: 'electric', power: 20, accuracy: 100, cost: [{ type: 'lightning', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A quick shock for 20 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 20, duration: 1 } },
    { id: 'mag2', name: 'Flash Cannon', type: 'steel', power: 40, accuracy: 100, cost: [{ type: 'metal', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A focused cannon for 40 damage.', targetType: 'enemy' },
    { id: 'mag3', name: 'Thunderbolt', type: 'electric', power: 45, accuracy: 100, cost: [{ type: 'lightning', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful bolt for 45 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 30, duration: 2 } },
    { id: 'mag4', name: 'Iron Defense', type: 'steel', power: 0, accuracy: 100, cost: [{ type: 'metal', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Hardens body. Heals 50 HP.', targetType: 'self', healing: 50 },
  ],
  // --- AI LEGENDARY CUSTOM MOVES ---
  // Articuno
  144: [
    { id: 'art1', name: 'Blizzard', type: 'ice', power: 65, accuracy: 80, cost: [{ type: 'water', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A devastating blizzard for 65 damage. May freeze all.', targetType: 'all-enemies', statusEffect: { type: 'freeze', chance: 35, duration: 2 } },
    { id: 'art2', name: 'Ice Beam', type: 'ice', power: 50, accuracy: 100, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A piercing ice beam for 50 damage.', targetType: 'enemy', statusEffect: { type: 'freeze', chance: 20, duration: 2 } },
    { id: 'art3', name: 'Sheer Cold', type: 'ice', power: 80, accuracy: 50, cost: [{ type: 'water', amount: 4 }], cooldown: 3, currentCooldown: 0, description: 'Absolute zero. 80 damage, low accuracy.', targetType: 'enemy' },
    { id: 'art4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0, description: 'Rests to heal 70 HP.', targetType: 'self', healing: 70 },
  ],
  // Zapdos
  145: [
    { id: 'zap1', name: 'Thunder', type: 'electric', power: 65, accuracy: 75, cost: [{ type: 'lightning', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive thunderstorm for 65 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 50, duration: 2 } },
    { id: 'zap2', name: 'Thunderbolt', type: 'electric', power: 50, accuracy: 100, cost: [{ type: 'lightning', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful thunderbolt for 50 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 30, duration: 2 } },
    { id: 'zap3', name: 'Drill Peck', type: 'flying', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A spinning aerial attack for 45 damage.', targetType: 'enemy' },
    { id: 'zap4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0, description: 'Rests to heal 70 HP.', targetType: 'self', healing: 70 },
  ],
  // Moltres
  146: [
    { id: 'mol1', name: 'Fire Blast', type: 'fire', power: 65, accuracy: 80, cost: [{ type: 'fire', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A devastating fire blast for 65 damage.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 40, duration: 3 } },
    { id: 'mol2', name: 'Flamethrower', type: 'fire', power: 50, accuracy: 100, cost: [{ type: 'fire', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful flame for 50 damage.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 25, duration: 2 } },
    { id: 'mol3', name: 'Air Slash', type: 'flying', power: 40, accuracy: 95, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Slashing wind for 40 damage.', targetType: 'enemy' },
    { id: 'mol4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0, description: 'Rests to heal 70 HP.', targetType: 'self', healing: 70 },
  ],
  // Mew — versatile
  151: [
    { id: 'mew1', name: 'Psychic', type: 'psychic', power: 55, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'An overwhelming psychic blast for 55 damage.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 25, duration: 2 } },
    { id: 'mew2', name: 'Aura Sphere', type: 'fighting', power: 45, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A sphere of aura for 45 damage. Never misses.', targetType: 'enemy' },
    { id: 'mew3', name: 'Ancient Power', type: 'rock', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Channels ancient power for 35 damage.', targetType: 'enemy' },
    { id: 'mew4', name: 'Transform', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 3, currentCooldown: 0, description: 'Transforms to heal 80 HP.', targetType: 'self', healing: 80 },
  ],
  // Aerodactyl — rock/flying predator
  142: [
    { id: 'aer1', name: 'Rock Slide', type: 'rock', power: 45, accuracy: 90, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 45 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 30, duration: 1 } },
    { id: 'aer2', name: 'Aerial Ace', type: 'flying', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A swift aerial strike for 35 damage.', targetType: 'enemy' },
    { id: 'aer3', name: 'Ancient Power', type: 'rock', power: 55, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Channels ancient power for 55 damage.', targetType: 'enemy' },
    { id: 'aer4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0, description: 'Rests to heal 60 HP.', targetType: 'self', healing: 60 },
  ],
  // Kangaskhan — powerful normal
  115: [
    { id: 'kan1', name: 'Mega Punch', type: 'normal', power: 45, accuracy: 90, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful mega punch for 45 damage.', targetType: 'enemy' },
    { id: 'kan2', name: 'Dizzy Punch', type: 'normal', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A punch for 35 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 25, duration: 2 } },
    { id: 'kan3', name: 'Outrage', type: 'dragon', power: 55, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 2, currentCooldown: 0, description: 'Goes on a rampage for 55 damage.', targetType: 'enemy' },
    { id: 'kan4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 60 HP.', targetType: 'self', healing: 60 },
  ],

  // ==================== EVOLVED FORM MOVESETS ====================

  // === STAGE 2 INTERMEDIARIES ===
  // Ivysaur
  2: [
    { id: 'ivy1', name: 'Razor Leaf', type: 'grass', power: 45, accuracy: 95, cost: [{ type: 'grass', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Sharp leaves slash for 45 damage.', targetType: 'enemy' },
    { id: 'ivy2', name: 'Vine Whip', type: 'grass', power: 30, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Whips with vines for 30 damage.', targetType: 'enemy' },
    { id: 'ivy3', name: 'Poison Powder', type: 'poison', power: 0, accuracy: 80, cost: [{ type: 'darkness', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Scatters toxic pollen. Poisons the target.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 100, duration: 3 } },
    { id: 'ivy4', name: 'Synthesis', type: 'grass', power: 0, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Absorbs sunlight to heal 50 HP.', targetType: 'self', healing: 50 },
  ],
  // Charmeleon
  5: [
    { id: 'cml1', name: 'Flamethrower', type: 'fire', power: 50, accuracy: 100, cost: [{ type: 'fire', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A stream of fire for 50 damage.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 20, duration: 2 } },
    { id: 'cml2', name: 'Slash', type: 'normal', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A sharp slash for 35 damage.', targetType: 'enemy' },
    { id: 'cml3', name: 'Dragon Rage', type: 'dragon', power: 40, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A burst of draconic fury for 40 damage.', targetType: 'enemy' },
    { id: 'cml4', name: 'Fire Spin', type: 'fire', power: 0, accuracy: 100, cost: [{ type: 'fire', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Traps the enemy. Burns for 2 turns.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 100, duration: 2 } },
  ],
  // Wartortle
  8: [
    { id: 'wrt1', name: 'Water Pulse', type: 'water', power: 45, accuracy: 100, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A pulse of water for 45 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 20, duration: 2 } },
    { id: 'wrt2', name: 'Bite', type: 'dark', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Bites hard for 35 damage.', targetType: 'enemy' },
    { id: 'wrt3', name: 'Protect', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 3, currentCooldown: 0, description: 'Protects from all damage for 1 turn.', targetType: 'self', statusEffect: { type: 'invulnerable', chance: 100, duration: 1 } },
    { id: 'wrt4', name: 'Aqua Ring', type: 'water', power: 0, accuracy: 100, cost: [{ type: 'water', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Heals 50 HP with a water ring.', targetType: 'self', healing: 50 },
  ],
  // Kadabra
  64: [
    { id: 'kad1', name: 'Psybeam', type: 'psychic', power: 50, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A peculiar beam for 50 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 20, duration: 2 } },
    { id: 'kad2', name: 'Shadow Ball', type: 'ghost', power: 40, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A dark orb for 40 damage.', targetType: 'enemy' },
    { id: 'kad3', name: 'Disable', type: 'psychic', power: 0, accuracy: 85, cost: [{ type: 'psychic', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Disables the enemy. Increases cooldowns by 1.', targetType: 'enemy', statusEffect: { type: 'cooldown-increase', chance: 100, duration: 2, value: 1 } },
    { id: 'kad4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 55 HP.', targetType: 'self', healing: 55 },
  ],
  // Haunter
  93: [
    { id: 'hnt1', name: 'Shadow Ball', type: 'ghost', power: 50, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A shadowy orb for 50 damage.', targetType: 'enemy' },
    { id: 'hnt2', name: 'Sludge Bomb', type: 'poison', power: 40, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Toxic sludge for 40 damage. May poison.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 30, duration: 3 } },
    { id: 'hnt3', name: 'Hypnosis', type: 'psychic', power: 0, accuracy: 65, cost: [{ type: 'psychic', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Puts the enemy to sleep.', targetType: 'enemy', statusEffect: { type: 'sleep', chance: 100, duration: 2 } },
    { id: 'hnt4', name: 'Dream Eater', type: 'psychic', power: 45, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 1, currentCooldown: 0, description: 'Eats dreams for 45 damage. Heals 25 HP.', targetType: 'enemy', healing: 25 },
  ],
  // Machoke
  67: [
    { id: 'mck1', name: 'Karate Chop', type: 'fighting', power: 45, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A sharp chop for 45 damage.', targetType: 'enemy' },
    { id: 'mck2', name: 'Low Kick', type: 'fighting', power: 30, accuracy: 100, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A swift kick for 30 damage.', targetType: 'enemy' },
    { id: 'mck3', name: 'Seismic Toss', type: 'fighting', power: 50, accuracy: 90, cost: [{ type: 'fighting', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Hurls the enemy for 50 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 25, duration: 1 } },
    { id: 'mck4', name: 'Bulk Up', type: 'fighting', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Powers up. Heals 40 HP and boosts damage.', targetType: 'self', healing: 40, statusEffect: { type: 'strengthen', chance: 100, duration: 2, value: 20 } },
  ],
  // Graveler
  75: [
    { id: 'grv1', name: 'Rock Slide', type: 'rock', power: 45, accuracy: 90, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 45 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 20, duration: 1 } },
    { id: 'grv2', name: 'Earthquake', type: 'ground', power: 40, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Shakes the ground for 40 damage to all.', targetType: 'all-enemies' },
    { id: 'grv3', name: 'Self-Destruct', type: 'normal', power: 80, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 99, currentCooldown: 0, description: 'Explodes for massive 80 damage. Faints the user.', targetType: 'enemy' },
    { id: 'grv4', name: 'Rock Polish', type: 'rock', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Polishes body. Heals 45 HP.', targetType: 'self', healing: 45 },
  ],
  // Dragonair
  148: [
    { id: 'dnr1', name: 'Dragon Pulse', type: 'dragon', power: 50, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A shock wave of draconic energy for 50 damage.', targetType: 'enemy' },
    { id: 'dnr2', name: 'Aqua Tail', type: 'water', power: 40, accuracy: 90, cost: [{ type: 'water', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A sweeping water tail for 40 damage.', targetType: 'enemy' },
    { id: 'dnr3', name: 'Thunder Wave', type: 'electric', power: 0, accuracy: 90, cost: [{ type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'A wave that paralyzes the target.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 100, duration: 2 } },
    { id: 'dnr4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 55 HP.', targetType: 'self', healing: 55 },
  ],

  // === FINAL FORMS ===
  // Venusaur
  3: [
    { id: 'ven1', name: 'Solar Beam', type: 'grass', power: 65, accuracy: 100, cost: [{ type: 'grass', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A devastating solar beam for 65 damage.', targetType: 'enemy' },
    { id: 'ven2', name: 'Sludge Bomb', type: 'poison', power: 50, accuracy: 100, cost: [{ type: 'darkness', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Toxic sludge for 50 damage. May poison.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 35, duration: 3 } },
    { id: 'ven3', name: 'Leech Seed', type: 'grass', power: 0, accuracy: 90, cost: [{ type: 'grass', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Drains 15 HP per turn for 3 turns.', targetType: 'enemy', statusEffect: { type: 'drain-hp', chance: 100, duration: 3, value: 15 } },
    { id: 'ven4', name: 'Synthesis', type: 'grass', power: 0, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Absorbs sunlight to heal 65 HP.', targetType: 'self', healing: 65 },
  ],
  // Charizard
  6: [
    { id: 'czd1', name: 'Fire Blast', type: 'fire', power: 65, accuracy: 85, cost: [{ type: 'fire', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive fire blast for 65 damage. May burn.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 35, duration: 3 } },
    { id: 'czd2', name: 'Air Slash', type: 'flying', power: 45, accuracy: 95, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Slices with air for 45 damage.', targetType: 'enemy' },
    { id: 'czd3', name: 'Dragon Claw', type: 'dragon', power: 50, accuracy: 100, cost: [{ type: 'fire', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Rakes with draconic claws for 50 damage.', targetType: 'enemy' },
    { id: 'czd4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0, description: 'Rests to heal 65 HP.', targetType: 'self', healing: 65 },
  ],
  // Blastoise
  9: [
    { id: 'bls1', name: 'Hydro Pump', type: 'water', power: 65, accuracy: 85, cost: [{ type: 'water', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'Blasts water for 65 damage.', targetType: 'enemy' },
    { id: 'bls2', name: 'Ice Beam', type: 'ice', power: 50, accuracy: 100, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A freezing beam for 50 damage. May freeze.', targetType: 'enemy', statusEffect: { type: 'freeze', chance: 15, duration: 2 } },
    { id: 'bls3', name: 'Flash Cannon', type: 'steel', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A focused cannon for 45 damage.', targetType: 'enemy' },
    { id: 'bls4', name: 'Iron Defense', type: 'steel', power: 0, accuracy: 100, cost: [{ type: 'water', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Hardens shell. Heals 60 HP and reduces damage.', targetType: 'self', healing: 60, statusEffect: { type: 'reduce-damage', chance: 100, duration: 2, value: 15 } },
  ],
  // Alakazam
  65: [
    { id: 'alz1', name: 'Psychic', type: 'psychic', power: 60, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'An overwhelming psychic blast for 60 damage.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 15, duration: 2 } },
    { id: 'alz2', name: 'Shadow Ball', type: 'ghost', power: 50, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A shadowy sphere for 50 damage.', targetType: 'enemy' },
    { id: 'alz3', name: 'Calm Mind', type: 'psychic', power: 0, accuracy: 100, cost: [{ type: 'psychic', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Focuses mind. Boosts damage 30% for 2 turns.', targetType: 'self', statusEffect: { type: 'strengthen', chance: 100, duration: 2, value: 30 } },
    { id: 'alz4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 65 HP.', targetType: 'self', healing: 65 },
  ],
  // Gengar
  94: [
    { id: 'gen1', name: 'Shadow Ball', type: 'ghost', power: 60, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A massive shadow orb for 60 damage.', targetType: 'enemy' },
    { id: 'gen2', name: 'Sludge Wave', type: 'poison', power: 50, accuracy: 100, cost: [{ type: 'darkness', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A toxic wave for 50 damage. May poison.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 30, duration: 3 } },
    { id: 'gen3', name: 'Hypnosis', type: 'psychic', power: 0, accuracy: 65, cost: [{ type: 'psychic', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Puts the target to sleep.', targetType: 'enemy', statusEffect: { type: 'sleep', chance: 100, duration: 2 } },
    { id: 'gen4', name: 'Dream Eater', type: 'psychic', power: 55, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 1, currentCooldown: 0, description: 'Devours dreams for 55 damage. Heals 30 HP.', targetType: 'enemy', healing: 30 },
  ],
  // Machamp
  68: [
    { id: 'mcp1', name: 'Cross Chop', type: 'fighting', power: 60, accuracy: 90, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A devastating cross chop for 60 damage.', targetType: 'enemy' },
    { id: 'mcp2', name: 'Dynamic Punch', type: 'fighting', power: 55, accuracy: 75, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A power punch for 55 damage. Confuses on hit.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 100, duration: 2 } },
    { id: 'mcp3', name: 'Rock Slide', type: 'rock', power: 45, accuracy: 90, cost: [{ type: 'fighting', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 45 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 20, duration: 1 } },
    { id: 'mcp4', name: 'Bulk Up', type: 'fighting', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Powers up. Heals 50 HP and boosts damage 25%.', targetType: 'self', healing: 50, statusEffect: { type: 'strengthen', chance: 100, duration: 2, value: 25 } },
  ],
  // Gyarados
  130: [
    { id: 'gya1', name: 'Hydro Pump', type: 'water', power: 65, accuracy: 85, cost: [{ type: 'water', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'Blasts a torrent of water for 65 damage.', targetType: 'enemy' },
    { id: 'gya2', name: 'Dragon Dance', type: 'dragon', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'A mystical dance. Boosts damage 30% for 2 turns.', targetType: 'self', statusEffect: { type: 'strengthen', chance: 100, duration: 2, value: 30 } },
    { id: 'gya3', name: 'Crunch', type: 'dark', power: 50, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Crunches the enemy for 50 damage.', targetType: 'enemy' },
    { id: 'gya4', name: 'Hurricane', type: 'flying', power: 55, accuracy: 80, cost: [{ type: 'water', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Summons a hurricane for 55 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 30, duration: 2 } },
  ],
  // Dragonite
  149: [
    { id: 'dnt1', name: 'Outrage', type: 'dragon', power: 65, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'Goes on a furious rampage for 65 damage.', targetType: 'enemy' },
    { id: 'dnt2', name: 'Hurricane', type: 'flying', power: 55, accuracy: 80, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Summons a hurricane for 55 damage.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 25, duration: 2 } },
    { id: 'dnt3', name: 'Thunder Punch', type: 'electric', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'An electric punch for 45 damage. May paralyze.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 20, duration: 2 } },
    { id: 'dnt4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0, description: 'Rests to heal 70 HP.', targetType: 'self', healing: 70 },
  ],
  // Nidoking
  34: [
    { id: 'ndk1', name: 'Earth Power', type: 'ground', power: 55, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Erupts the ground for 55 damage.', targetType: 'enemy' },
    { id: 'ndk2', name: 'Sludge Wave', type: 'poison', power: 50, accuracy: 100, cost: [{ type: 'darkness', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A toxic wave for 50 damage. May poison.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 30, duration: 3 } },
    { id: 'ndk3', name: 'Megahorn', type: 'bug', power: 60, accuracy: 85, cost: [{ type: 'fighting', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Charges with a massive horn for 60 damage.', targetType: 'enemy' },
    { id: 'ndk4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 60 HP.', targetType: 'self', healing: 60 },
  ],
  // Nidoqueen
  31: [
    { id: 'ndq1', name: 'Earth Power', type: 'ground', power: 50, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Erupts the ground for 50 damage.', targetType: 'enemy' },
    { id: 'ndq2', name: 'Poison Jab', type: 'poison', power: 45, accuracy: 100, cost: [{ type: 'darkness', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A toxic jab for 45 damage. May poison.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 30, duration: 3 } },
    { id: 'ndq3', name: 'Superpower', type: 'fighting', power: 55, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'A mighty blow for 55 damage.', targetType: 'enemy' },
    { id: 'ndq4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 65 HP.', targetType: 'self', healing: 65 },
  ],
  // Golem
  76: [
    { id: 'glm1', name: 'Stone Edge', type: 'rock', power: 60, accuracy: 85, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Pierces with stone for 60 damage.', targetType: 'enemy' },
    { id: 'glm2', name: 'Earthquake', type: 'ground', power: 50, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Shakes the ground for 50 damage to all.', targetType: 'all-enemies' },
    { id: 'glm3', name: 'Explosion', type: 'normal', power: 100, accuracy: 100, cost: [{ type: 'colorless', amount: 4 }], cooldown: 99, currentCooldown: 0, description: 'A massive explosion for 100 damage. Faints the user.', targetType: 'enemy' },
    { id: 'glm4', name: 'Rock Polish', type: 'rock', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Polishes body. Heals 50 HP.', targetType: 'self', healing: 50 },
  ],
  // Marowak
  105: [
    { id: 'mrw1', name: 'Bone Rush', type: 'ground', power: 55, accuracy: 95, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A relentless bone rush for 55 damage.', targetType: 'enemy' },
    { id: 'mrw2', name: 'Bonemerang', type: 'ground', power: 45, accuracy: 90, cost: [{ type: 'fighting', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A bone boomerang for 45 damage.', targetType: 'enemy' },
    { id: 'mrw3', name: 'Rock Slide', type: 'rock', power: 40, accuracy: 90, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 40 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 25, duration: 1 } },
    { id: 'mrw4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 55 HP.', targetType: 'self', healing: 55 },
  ],
  // Butterfree
  12: [
    { id: 'btf1', name: 'Bug Buzz', type: 'bug', power: 50, accuracy: 100, cost: [{ type: 'grass', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Vibrates wings for 50 damage.', targetType: 'enemy' },
    { id: 'btf2', name: 'Psychic', type: 'psychic', power: 45, accuracy: 100, cost: [{ type: 'psychic', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A psychic blast for 45 damage.', targetType: 'enemy' },
    { id: 'btf3', name: 'Sleep Powder', type: 'grass', power: 0, accuracy: 70, cost: [{ type: 'grass', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Scatters sleep powder. Puts the target to sleep.', targetType: 'enemy', statusEffect: { type: 'sleep', chance: 100, duration: 2 } },
    { id: 'btf4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 55 HP.', targetType: 'self', healing: 55 },
  ],
  // Beedrill
  15: [
    { id: 'bdr1', name: 'Poison Jab', type: 'poison', power: 50, accuracy: 100, cost: [{ type: 'darkness', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Jabs with toxic stingers for 50 damage. May poison.', targetType: 'enemy', statusEffect: { type: 'poison', chance: 30, duration: 3 } },
    { id: 'bdr2', name: 'X-Scissor', type: 'bug', power: 45, accuracy: 100, cost: [{ type: 'grass', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Slashes in an X for 45 damage.', targetType: 'enemy' },
    { id: 'bdr3', name: 'Agility', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Boosts speed. Reduces cooldowns by 1.', targetType: 'self', statusEffect: { type: 'cooldown-reduce', chance: 100, duration: 2, value: 1 } },
    { id: 'bdr4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self', healing: 50 },
  ],
  // Pidgeot
  18: [
    { id: 'pdg1', name: 'Hurricane', type: 'flying', power: 55, accuracy: 80, cost: [{ type: 'colorless', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'Summons a hurricane for 55 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 30, duration: 2 } },
    { id: 'pdg2', name: 'Aerial Ace', type: 'flying', power: 40, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A swift aerial strike for 40 damage.', targetType: 'enemy' },
    { id: 'pdg3', name: 'Quick Attack', type: 'normal', power: 30, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A quick strike for 30 damage.', targetType: 'enemy' },
    { id: 'pdg4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 2, currentCooldown: 0, description: 'Rests to heal 60 HP.', targetType: 'self', healing: 60 },
  ],
  // Arcanine
  59: [
    { id: 'arc1', name: 'Flare Blitz', type: 'fire', power: 65, accuracy: 100, cost: [{ type: 'fire', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A blazing charge for 65 damage.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 25, duration: 2 } },
    { id: 'arc2', name: 'Extreme Speed', type: 'normal', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A blindingly fast strike for 45 damage.', targetType: 'enemy' },
    { id: 'arc3', name: 'Crunch', type: 'dark', power: 40, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Crunches with fangs for 40 damage.', targetType: 'enemy' },
    { id: 'arc4', name: 'Morning Sun', type: 'fire', power: 0, accuracy: 100, cost: [{ type: 'fire', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Absorbs morning light. Heals 65 HP.', targetType: 'self', healing: 65 },
  ],
  // Ninetales
  38: [
    { id: 'ntl1', name: 'Fire Blast', type: 'fire', power: 60, accuracy: 85, cost: [{ type: 'fire', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive fire blast for 60 damage. May burn.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 35, duration: 3 } },
    { id: 'ntl2', name: 'Hex', type: 'ghost', power: 45, accuracy: 100, cost: [{ type: 'fire', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Curses the target for 45 damage.', targetType: 'enemy' },
    { id: 'ntl3', name: 'Will-O-Wisp', type: 'fire', power: 0, accuracy: 80, cost: [{ type: 'fire', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'A ghostly flame. Burns the target.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 100, duration: 3 } },
    { id: 'ntl4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 60 HP.', targetType: 'self', healing: 60 },
  ],
  // Poliwrath
  62: [
    { id: 'plw1', name: 'Hydro Pump', type: 'water', power: 55, accuracy: 85, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A torrent of water for 55 damage.', targetType: 'enemy' },
    { id: 'plw2', name: 'Submission', type: 'fighting', power: 50, accuracy: 90, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A grappling attack for 50 damage.', targetType: 'enemy' },
    { id: 'plw3', name: 'Hypnosis', type: 'psychic', power: 0, accuracy: 65, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Puts the target to sleep.', targetType: 'enemy', statusEffect: { type: 'sleep', chance: 100, duration: 2 } },
    { id: 'plw4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 60 HP.', targetType: 'self', healing: 60 },
  ],
  // Raichu
  26: [
    { id: 'rai1', name: 'Thunder', type: 'electric', power: 60, accuracy: 75, cost: [{ type: 'lightning', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive thunderbolt for 60 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 40, duration: 2 } },
    { id: 'rai2', name: 'Thunderbolt', type: 'electric', power: 50, accuracy: 100, cost: [{ type: 'lightning', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful bolt for 50 damage. May paralyze.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 25, duration: 2 } },
    { id: 'rai3', name: 'Iron Tail', type: 'steel', power: 45, accuracy: 85, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Slams with iron tail for 45 damage.', targetType: 'enemy' },
    { id: 'rai4', name: 'Agility', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Boosts speed. Heals 40 HP and reduces cooldowns.', targetType: 'self', healing: 40, statusEffect: { type: 'cooldown-reduce', chance: 100, duration: 2, value: 1 } },
  ],
  // Magneton
  82: [
    { id: 'mgt1', name: 'Thunder', type: 'electric', power: 60, accuracy: 75, cost: [{ type: 'lightning', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive thunderstorm for 60 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 40, duration: 2 } },
    { id: 'mgt2', name: 'Flash Cannon', type: 'steel', power: 50, accuracy: 100, cost: [{ type: 'metal', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A focused cannon for 50 damage.', targetType: 'enemy' },
    { id: 'mgt3', name: 'Tri Attack', type: 'normal', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A triple beam for 45 damage. May burn/freeze/paralyze.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 20, duration: 2 } },
    { id: 'mgt4', name: 'Iron Defense', type: 'steel', power: 0, accuracy: 100, cost: [{ type: 'metal', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Hardens body. Heals 55 HP.', targetType: 'self', healing: 55 },
  ],
  // Electrode
  101: [
    { id: 'elc1', name: 'Thunder', type: 'electric', power: 60, accuracy: 75, cost: [{ type: 'lightning', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive thunderbolt for 60 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 40, duration: 2 } },
    { id: 'elc2', name: 'Thunderbolt', type: 'electric', power: 50, accuracy: 100, cost: [{ type: 'lightning', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful bolt for 50 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 25, duration: 2 } },
    { id: 'elc3', name: 'Explosion', type: 'normal', power: 100, accuracy: 100, cost: [{ type: 'colorless', amount: 4 }], cooldown: 99, currentCooldown: 0, description: 'A massive explosion for 100 damage. Faints the user.', targetType: 'enemy' },
    { id: 'elc4', name: 'Charge', type: 'electric', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Charges power. Heals 40 HP.', targetType: 'self', healing: 40 },
  ],
};

/** Get moves for a specific Pokemon — custom if available, else default by type */
export const getPokemonMoves = (pokemonId: number, primaryType: PokemonType): Move[] => {
  return POKEMON_CUSTOM_MOVES[pokemonId] || getDefaultMoves(primaryType);
};

// ==================== KANTO POKEMON ====================
// All Pokemon have 100 HP as per game design. Evolution bar (evoBarMax) controls evolution speed.
export const KANTO_POKEMON: KantoPokemonData[] = [
  // === STARTERS === (balanced, good growth potential)
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], hp: 100, baseStats: { attack: 45, defense: 45, spAtk: 55, spDef: 55, speed: 40 }, canEvolve: true, evolvesTo: { id: 2, name: 'Ivysaur', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  { id: 4, name: 'Charmander', types: ['fire'], hp: 100, baseStats: { attack: 48, defense: 38, spAtk: 55, spDef: 42, speed: 55 }, canEvolve: true, evolvesTo: { id: 5, name: 'Charmeleon', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'fire', amount: 2 }] },
  { id: 7, name: 'Squirtle', types: ['water'], hp: 100, baseStats: { attack: 42, defense: 55, spAtk: 45, spDef: 55, speed: 38 }, canEvolve: true, evolvesTo: { id: 8, name: 'Wartortle', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  // === ICONIC ===
  { id: 25, name: 'Pikachu', types: ['electric'], hp: 100, baseStats: { attack: 50, defense: 35, spAtk: 50, spDef: 40, speed: 65 }, canEvolve: true, evolvesTo: { id: 26, name: 'Raichu', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'lightning', amount: 2 }] },
  { id: 133, name: 'Eevee', types: ['normal'], hp: 100, baseStats: { attack: 50, defense: 45, spAtk: 50, spDef: 50, speed: 50 }, canEvolve: true, evolutionOptions: [
    { id: 134, name: 'Vaporeon', types: ['water'], hpBonus: 20, statBonus: 20, energyCost: [{ type: 'water', amount: 2 }] },
    { id: 135, name: 'Jolteon', types: ['electric'], hpBonus: 10, statBonus: 20, energyCost: [{ type: 'lightning', amount: 2 }] },
    { id: 136, name: 'Flareon', types: ['fire'], hpBonus: 10, statBonus: 20, energyCost: [{ type: 'fire', amount: 2 }] },
  ] },
  { id: 52, name: 'Meowth', types: ['normal'], hp: 100, baseStats: { attack: 40, defense: 35, spAtk: 40, spDef: 35, speed: 60 }, canEvolve: true, evolvesTo: { id: 53, name: 'Persian', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'colorless', amount: 2 }] },
  // === EARLY ROUTES === (weak base, evolve to be useful)
  { id: 10, name: 'Caterpie', types: ['bug'], hp: 100, baseStats: { attack: 25, defense: 30, spAtk: 25, spDef: 25, speed: 35 }, canEvolve: true, evolvesTo: { id: 11, name: 'Metapod', hpBonus: 10, statBonus: 10 }, evolutionEnergyCost: [{ type: 'grass', amount: 1 }] },
  { id: 13, name: 'Weedle', types: ['bug', 'poison'], hp: 100, baseStats: { attack: 30, defense: 25, spAtk: 25, spDef: 25, speed: 35 }, canEvolve: true, evolvesTo: { id: 14, name: 'Kakuna', hpBonus: 10, statBonus: 10 }, evolutionEnergyCost: [{ type: 'grass', amount: 1 }] },
  { id: 16, name: 'Pidgey', types: ['normal', 'flying'], hp: 100, baseStats: { attack: 40, defense: 35, spAtk: 35, spDef: 30, speed: 50 }, canEvolve: true, evolvesTo: { id: 17, name: 'Pidgeotto', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'colorless', amount: 2 }] },
  { id: 19, name: 'Rattata', types: ['normal'], hp: 100, baseStats: { attack: 50, defense: 30, spAtk: 30, spDef: 30, speed: 60 }, canEvolve: true, evolvesTo: { id: 20, name: 'Raticate', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'colorless', amount: 2 }] },
  { id: 21, name: 'Spearow', types: ['normal', 'flying'], hp: 100, baseStats: { attack: 55, defense: 30, spAtk: 30, spDef: 30, speed: 55 }, canEvolve: true, evolvesTo: { id: 22, name: 'Fearow', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'colorless', amount: 2 }] },
  // === NIDORAN LINES ===
  { id: 29, name: 'NidoranF', types: ['poison'], hp: 100, baseStats: { attack: 42, defense: 42, spAtk: 38, spDef: 38, speed: 38 }, canEvolve: true, evolvesTo: { id: 30, name: 'Nidorina', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'darkness', amount: 2 }] },
  { id: 32, name: 'NidoranM', types: ['poison'], hp: 100, baseStats: { attack: 50, defense: 35, spAtk: 38, spDef: 35, speed: 42 }, canEvolve: true, evolvesTo: { id: 33, name: 'Nidorino', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'darkness', amount: 2 }] },
  // === FAIRY ===
  { id: 35, name: 'Clefairy', types: ['fairy'], hp: 100, baseStats: { attack: 40, defense: 45, spAtk: 55, spDef: 55, speed: 30 }, canEvolve: true, evolvesTo: { id: 36, name: 'Clefable', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'psychic', amount: 2 }] },
  { id: 39, name: 'Jigglypuff', types: ['normal', 'fairy'], hp: 100, baseStats: { attack: 40, defense: 30, spAtk: 40, spDef: 30, speed: 25 }, canEvolve: true, evolvesTo: { id: 40, name: 'Wigglytuff', hpBonus: 25, statBonus: 20 }, evolutionEnergyCost: [{ type: 'colorless', amount: 2 }] },
  // === FIRE ===
  { id: 37, name: 'Vulpix', types: ['fire'], hp: 100, baseStats: { attack: 38, defense: 35, spAtk: 55, spDef: 55, speed: 55 }, canEvolve: true, evolvesTo: { id: 38, name: 'Ninetales', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fire', amount: 2 }] },
  { id: 58, name: 'Growlithe', types: ['fire'], hp: 100, baseStats: { attack: 55, defense: 40, spAtk: 55, spDef: 42, speed: 50 }, canEvolve: true, evolvesTo: { id: 59, name: 'Arcanine', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fire', amount: 2 }] },
  { id: 77, name: 'Ponyta', types: ['fire'], hp: 100, baseStats: { attack: 50, defense: 40, spAtk: 50, spDef: 55, speed: 60 }, canEvolve: true, evolvesTo: { id: 78, name: 'Rapidash', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fire', amount: 2 }] },
  // === GRASS/POISON ===
  { id: 43, name: 'Oddish', types: ['grass', 'poison'], hp: 100, baseStats: { attack: 40, defense: 45, spAtk: 55, spDef: 50, speed: 25 }, canEvolve: true, evolvesTo: { id: 44, name: 'Gloom', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  // === WATER ===
  { id: 60, name: 'Poliwag', types: ['water'], hp: 100, baseStats: { attack: 40, defense: 35, spAtk: 38, spDef: 35, speed: 55 }, canEvolve: true, evolvesTo: { id: 61, name: 'Poliwhirl', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 79, name: 'Slowpoke', types: ['water', 'psychic'], hp: 100, baseStats: { attack: 55, defense: 55, spAtk: 35, spDef: 35, speed: 15 }, canEvolve: true, evolvesTo: { id: 80, name: 'Slowbro', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'psychic', amount: 2 }] },
  { id: 116, name: 'Horsea', types: ['water'], hp: 100, baseStats: { attack: 35, defense: 45, spAtk: 55, spDef: 30, speed: 50 }, canEvolve: true, evolvesTo: { id: 117, name: 'Seadra', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 129, name: 'Magikarp', types: ['water'], hp: 100, baseStats: { attack: 20, defense: 45, spAtk: 15, spDef: 25, speed: 55 }, canEvolve: true, evolvesTo: { id: 130, name: 'Gyarados', hpBonus: 25, statBonus: 30 }, evolutionEnergyCost: [{ type: 'water', amount: 3 }] },
  // === PSYCHIC/GHOST ===
  { id: 63, name: 'Abra', types: ['psychic'], hp: 100, baseStats: { attack: 25, defense: 20, spAtk: 65, spDef: 45, speed: 60 }, canEvolve: true, evolvesTo: { id: 64, name: 'Kadabra', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'psychic', amount: 2 }] },
  { id: 92, name: 'Gastly', types: ['ghost', 'poison'], hp: 100, baseStats: { attack: 30, defense: 25, spAtk: 65, spDef: 30, speed: 55 }, canEvolve: true, evolvesTo: { id: 93, name: 'Haunter', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'psychic', amount: 2 }] },
  // === FIGHTING/ROCK/GROUND ===
  { id: 66, name: 'Machop', types: ['fighting'], hp: 100, baseStats: { attack: 60, defense: 40, spAtk: 30, spDef: 30, speed: 30 }, canEvolve: true, evolvesTo: { id: 67, name: 'Machoke', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'fighting', amount: 2 }] },
  { id: 74, name: 'Geodude', types: ['rock', 'ground'], hp: 100, baseStats: { attack: 55, defense: 65, spAtk: 25, spDef: 25, speed: 20 }, canEvolve: true, evolvesTo: { id: 75, name: 'Graveler', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'fighting', amount: 2 }] },
  { id: 104, name: 'Cubone', types: ['ground'], hp: 100, baseStats: { attack: 45, defense: 60, spAtk: 35, spDef: 42, speed: 30 }, canEvolve: true, evolvesTo: { id: 105, name: 'Marowak', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fighting', amount: 2 }] },
  // === ELECTRIC/STEEL ===
  { id: 81, name: 'Magnemite', types: ['electric', 'steel'], hp: 100, baseStats: { attack: 30, defense: 55, spAtk: 60, spDef: 45, speed: 35 }, canEvolve: true, evolvesTo: { id: 82, name: 'Magneton', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'lightning', amount: 2 }] },
  { id: 100, name: 'Voltorb', types: ['electric'], hp: 100, baseStats: { attack: 30, defense: 40, spAtk: 45, spDef: 45, speed: 65 }, canEvolve: true, evolvesTo: { id: 101, name: 'Electrode', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'lightning', amount: 2 }] },
  // === POISON ===
  { id: 23, name: 'Ekans', types: ['poison'], hp: 100, baseStats: { attack: 50, defense: 38, spAtk: 35, spDef: 42, speed: 45 }, canEvolve: true, evolvesTo: { id: 24, name: 'Arbok', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'darkness', amount: 2 }] },
  { id: 109, name: 'Koffing', types: ['poison'], hp: 100, baseStats: { attack: 55, defense: 60, spAtk: 50, spDef: 38, speed: 30 }, canEvolve: true, evolvesTo: { id: 110, name: 'Weezing', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'darkness', amount: 2 }] },
  // === DRAGON ===
  { id: 147, name: 'Dratini', types: ['dragon'], hp: 100, baseStats: { attack: 50, defense: 40, spAtk: 45, spDef: 42, speed: 42 }, canEvolve: true, evolvesTo: { id: 148, name: 'Dragonair', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'colorless', amount: 2 }] },

  // === STANDALONE GEN 1 (no evolution in Gen 1) ===
  { id: 83, name: 'Farfetchd', types: ['normal', 'flying'], hp: 100, baseStats: { attack: 55, defense: 50, spAtk: 48, spDef: 50, speed: 50 }, canEvolve: false },
  { id: 84, name: 'Doduo', types: ['normal', 'flying'], hp: 100, baseStats: { attack: 55, defense: 35, spAtk: 30, spDef: 30, speed: 55 }, canEvolve: true, evolvesTo: { id: 85, name: 'Dodrio', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'colorless', amount: 2 }] },
  { id: 86, name: 'Seel', types: ['water'], hp: 100, baseStats: { attack: 40, defense: 45, spAtk: 40, spDef: 55, speed: 35 }, canEvolve: true, evolvesTo: { id: 87, name: 'Dewgong', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 88, name: 'Grimer', types: ['poison'], hp: 100, baseStats: { attack: 55, defense: 45, spAtk: 35, spDef: 40, speed: 20 }, canEvolve: true, evolvesTo: { id: 89, name: 'Muk', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'darkness', amount: 2 }] },
  { id: 90, name: 'Shellder', types: ['water'], hp: 100, baseStats: { attack: 55, defense: 80, spAtk: 35, spDef: 20, speed: 35 }, canEvolve: true, evolvesTo: { id: 91, name: 'Cloyster', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 98, name: 'Krabby', types: ['water'], hp: 100, baseStats: { attack: 65, defense: 55, spAtk: 25, spDef: 25, speed: 40 }, canEvolve: true, evolvesTo: { id: 99, name: 'Kingler', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 114, name: 'Tangela', types: ['grass'], hp: 100, baseStats: { attack: 45, defense: 65, spAtk: 65, spDef: 35, speed: 50 }, canEvolve: false },

  // === MISSING GEN 1 — GROUND ===
  { id: 27, name: 'Sandshrew', types: ['ground'], hp: 100, baseStats: { attack: 55, defense: 65, spAtk: 25, spDef: 30, speed: 35 }, canEvolve: true, evolvesTo: { id: 28, name: 'Sandslash', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fighting', amount: 2 }] },
  { id: 50, name: 'Diglett', types: ['ground'], hp: 100, baseStats: { attack: 45, defense: 20, spAtk: 30, spDef: 35, speed: 70 }, canEvolve: true, evolvesTo: { id: 51, name: 'Dugtrio', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fighting', amount: 2 }] },
  { id: 111, name: 'Rhyhorn', types: ['ground', 'rock'], hp: 100, baseStats: { attack: 60, defense: 70, spAtk: 25, spDef: 25, speed: 20 }, canEvolve: true, evolvesTo: { id: 112, name: 'Rhydon', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fighting', amount: 2 }] },
  // === POISON/FLYING ===
  { id: 41, name: 'Zubat', types: ['poison', 'flying'], hp: 100, baseStats: { attack: 40, defense: 30, spAtk: 25, spDef: 35, speed: 50 }, canEvolve: true, evolvesTo: { id: 42, name: 'Golbat', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'darkness', amount: 2 }] },
  // === BUG ===
  { id: 46, name: 'Paras', types: ['bug', 'grass'], hp: 100, baseStats: { attack: 55, defense: 45, spAtk: 40, spDef: 45, speed: 20 }, canEvolve: true, evolvesTo: { id: 47, name: 'Parasect', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  { id: 48, name: 'Venonat', types: ['bug', 'poison'], hp: 100, baseStats: { attack: 45, defense: 40, spAtk: 35, spDef: 45, speed: 40 }, canEvolve: true, evolvesTo: { id: 49, name: 'Venomoth', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  { id: 123, name: 'Scyther', types: ['bug', 'flying'], hp: 100, baseStats: { attack: 65, defense: 50, spAtk: 40, spDef: 50, speed: 65 }, canEvolve: false },
  { id: 127, name: 'Pinsir', types: ['bug'], hp: 100, baseStats: { attack: 70, defense: 60, spAtk: 40, spDef: 45, speed: 55 }, canEvolve: false },
  // === WATER ===
  { id: 54, name: 'Psyduck', types: ['water'], hp: 100, baseStats: { attack: 42, defense: 38, spAtk: 55, spDef: 40, speed: 45 }, canEvolve: true, evolvesTo: { id: 55, name: 'Golduck', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 72, name: 'Tentacool', types: ['water', 'poison'], hp: 100, baseStats: { attack: 35, defense: 30, spAtk: 40, spDef: 65, speed: 55 }, canEvolve: true, evolvesTo: { id: 73, name: 'Tentacruel', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 118, name: 'Goldeen', types: ['water'], hp: 100, baseStats: { attack: 55, defense: 45, spAtk: 35, spDef: 40, speed: 50 }, canEvolve: true, evolvesTo: { id: 119, name: 'Seaking', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 120, name: 'Staryu', types: ['water'], hp: 100, baseStats: { attack: 40, defense: 45, spAtk: 55, spDef: 45, speed: 60 }, canEvolve: true, evolvesTo: { id: 121, name: 'Starmie', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 131, name: 'Lapras', types: ['water', 'ice'], hp: 100, baseStats: { attack: 50, defense: 55, spAtk: 60, spDef: 60, speed: 40 }, canEvolve: false },
  // === FIGHTING ===
  { id: 56, name: 'Mankey', types: ['fighting'], hp: 100, baseStats: { attack: 55, defense: 30, spAtk: 30, spDef: 35, speed: 55 }, canEvolve: true, evolvesTo: { id: 57, name: 'Primeape', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fighting', amount: 2 }] },
  { id: 106, name: 'Hitmonlee', types: ['fighting'], hp: 100, baseStats: { attack: 65, defense: 40, spAtk: 30, spDef: 60, speed: 60 }, canEvolve: false },
  { id: 107, name: 'Hitmonchan', types: ['fighting'], hp: 100, baseStats: { attack: 65, defense: 55, spAtk: 30, spDef: 60, speed: 50 }, canEvolve: false },
  // === GRASS/POISON ===
  { id: 69, name: 'Bellsprout', types: ['grass', 'poison'], hp: 100, baseStats: { attack: 55, defense: 30, spAtk: 55, spDef: 25, speed: 35 }, canEvolve: true, evolvesTo: { id: 70, name: 'Weepinbell', hpBonus: 15, statBonus: 15 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  // === PSYCHIC ===
  { id: 96, name: 'Drowzee', types: ['psychic'], hp: 100, baseStats: { attack: 38, defense: 40, spAtk: 38, spDef: 60, speed: 38 }, canEvolve: true, evolvesTo: { id: 97, name: 'Hypno', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'psychic', amount: 2 }] },
  { id: 122, name: 'MrMime', types: ['psychic', 'fairy'], hp: 100, baseStats: { attack: 35, defense: 55, spAtk: 65, spDef: 65, speed: 55 }, canEvolve: false },
  { id: 124, name: 'Jynx', types: ['ice', 'psychic'], hp: 100, baseStats: { attack: 40, defense: 30, spAtk: 65, spDef: 60, speed: 60 }, canEvolve: false },
  // === GRASS/PSYCHIC ===
  { id: 102, name: 'Exeggcute', types: ['grass', 'psychic'], hp: 100, baseStats: { attack: 35, defense: 55, spAtk: 50, spDef: 35, speed: 35 }, canEvolve: true, evolvesTo: { id: 103, name: 'Exeggutor', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  // === ROCK ===
  { id: 95, name: 'Onix', types: ['rock', 'ground'], hp: 100, baseStats: { attack: 40, defense: 80, spAtk: 25, spDef: 35, speed: 50 }, canEvolve: false },
  { id: 138, name: 'Omanyte', types: ['rock', 'water'], hp: 100, baseStats: { attack: 35, defense: 65, spAtk: 60, spDef: 45, speed: 25 }, canEvolve: true, evolvesTo: { id: 139, name: 'Omastar', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 140, name: 'Kabuto', types: ['rock', 'water'], hp: 100, baseStats: { attack: 55, defense: 65, spAtk: 35, spDef: 30, speed: 40 }, canEvolve: true, evolvesTo: { id: 141, name: 'Kabutops', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  { id: 142, name: 'Aerodactyl', types: ['rock', 'flying'], hp: 100, baseStats: { attack: 65, defense: 55, spAtk: 45, spDef: 50, speed: 70 }, canEvolve: false },
  // === NORMAL ===
  { id: 108, name: 'Lickitung', types: ['normal'], hp: 100, baseStats: { attack: 45, defense: 55, spAtk: 50, spDef: 55, speed: 25 }, canEvolve: false },
  { id: 113, name: 'Chansey', types: ['normal'], hp: 100, baseStats: { attack: 15, defense: 15, spAtk: 30, spDef: 65, speed: 45 }, canEvolve: false },
  { id: 115, name: 'Kangaskhan', types: ['normal'], hp: 100, baseStats: { attack: 60, defense: 55, spAtk: 35, spDef: 55, speed: 55 }, canEvolve: false },
  { id: 128, name: 'Tauros', types: ['normal'], hp: 100, baseStats: { attack: 65, defense: 60, spAtk: 35, spDef: 50, speed: 65 }, canEvolve: false },
  { id: 132, name: 'Ditto', types: ['normal'], hp: 100, baseStats: { attack: 45, defense: 45, spAtk: 45, spDef: 45, speed: 45 }, canEvolve: false },
  { id: 137, name: 'Porygon', types: ['normal'], hp: 100, baseStats: { attack: 50, defense: 55, spAtk: 60, spDef: 55, speed: 35 }, canEvolve: false },
  { id: 143, name: 'Snorlax', types: ['normal'], hp: 100, baseStats: { attack: 65, defense: 55, spAtk: 55, spDef: 65, speed: 15 }, canEvolve: false },
  // === ELECTRIC ===
  { id: 125, name: 'Electabuzz', types: ['electric'], hp: 100, baseStats: { attack: 58, defense: 48, spAtk: 60, spDef: 55, speed: 65 }, canEvolve: false },
  // === FIRE ===
  { id: 126, name: 'Magmar', types: ['fire'], hp: 100, baseStats: { attack: 60, defense: 48, spAtk: 65, spDef: 55, speed: 58 }, canEvolve: false },
];

export const AI_POKEMON_POOL: KantoPokemonData[] = KANTO_POKEMON;

export const EVOLUTION_DATA: Record<number, KantoPokemonData> = {
  // Evolved forms: hp field = maxHp of that form (base 100 + accumulated hpBonus)
  // === Bulbasaur line ===
  2: { id: 2, name: 'Ivysaur', types: ['grass', 'poison'], hp: 115, canEvolve: true, evolvesTo: { id: 3, name: 'Venusaur', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 3 }] },
  3: { id: 3, name: 'Venusaur', types: ['grass', 'poison'], hp: 135, canEvolve: false },
  // === Charmander line ===
  5: { id: 5, name: 'Charmeleon', types: ['fire'], hp: 115, canEvolve: true, evolvesTo: { id: 6, name: 'Charizard', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fire', amount: 3 }] },
  6: { id: 6, name: 'Charizard', types: ['fire', 'flying'], hp: 135, canEvolve: false },
  // === Squirtle line ===
  8: { id: 8, name: 'Wartortle', types: ['water'], hp: 115, canEvolve: true, evolvesTo: { id: 9, name: 'Blastoise', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 3 }] },
  9: { id: 9, name: 'Blastoise', types: ['water'], hp: 135, canEvolve: false },
  // === Caterpie line ===
  11: { id: 11, name: 'Metapod', types: ['bug'], hp: 110, canEvolve: true, evolvesTo: { id: 12, name: 'Butterfree', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  12: { id: 12, name: 'Butterfree', types: ['bug', 'flying'], hp: 125, canEvolve: false },
  // === Weedle line ===
  14: { id: 14, name: 'Kakuna', types: ['bug', 'poison'], hp: 110, canEvolve: true, evolvesTo: { id: 15, name: 'Beedrill', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  15: { id: 15, name: 'Beedrill', types: ['bug', 'poison'], hp: 125, canEvolve: false },
  // === Pidgey line ===
  17: { id: 17, name: 'Pidgeotto', types: ['normal', 'flying'], hp: 115, canEvolve: true, evolvesTo: { id: 18, name: 'Pidgeot', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'colorless', amount: 3 }] },
  18: { id: 18, name: 'Pidgeot', types: ['normal', 'flying'], hp: 135, canEvolve: false },
  // === Rattata line ===
  20: { id: 20, name: 'Raticate', types: ['normal'], hp: 115, canEvolve: false },
  // === Spearow line ===
  22: { id: 22, name: 'Fearow', types: ['normal', 'flying'], hp: 115, canEvolve: false },
  // === Ekans line ===
  24: { id: 24, name: 'Arbok', types: ['poison'], hp: 115, canEvolve: false },
  // === Pikachu line ===
  26: { id: 26, name: 'Raichu', types: ['electric'], hp: 115, canEvolve: false },
  // === Sandshrew line ===
  28: { id: 28, name: 'Sandslash', types: ['ground'], hp: 115, canEvolve: false },
  // === NidoranF line ===
  30: { id: 30, name: 'Nidorina', types: ['poison'], hp: 115, canEvolve: true, evolvesTo: { id: 31, name: 'Nidoqueen', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'darkness', amount: 3 }] },
  31: { id: 31, name: 'Nidoqueen', types: ['poison', 'ground'], hp: 135, canEvolve: false },
  // === NidoranM line ===
  33: { id: 33, name: 'Nidorino', types: ['poison'], hp: 115, canEvolve: true, evolvesTo: { id: 34, name: 'Nidoking', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'darkness', amount: 3 }] },
  34: { id: 34, name: 'Nidoking', types: ['poison', 'ground'], hp: 135, canEvolve: false },
  // === Clefairy line ===
  36: { id: 36, name: 'Clefable', types: ['fairy'], hp: 120, canEvolve: false },
  // === Vulpix line ===
  38: { id: 38, name: 'Ninetales', types: ['fire'], hp: 115, canEvolve: false },
  // === Jigglypuff line ===
  40: { id: 40, name: 'Wigglytuff', types: ['normal', 'fairy'], hp: 125, canEvolve: false },
  // === Oddish line ===
  44: { id: 44, name: 'Gloom', types: ['grass', 'poison'], hp: 115, canEvolve: true, evolvesTo: { id: 45, name: 'Vileplume', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 3 }] },
  45: { id: 45, name: 'Vileplume', types: ['grass', 'poison'], hp: 135, canEvolve: false },
  // === Meowth line ===
  53: { id: 53, name: 'Persian', types: ['normal'], hp: 115, canEvolve: false },
  // === Growlithe line ===
  59: { id: 59, name: 'Arcanine', types: ['fire'], hp: 120, canEvolve: false },
  // === Poliwag line ===
  61: { id: 61, name: 'Poliwhirl', types: ['water'], hp: 115, canEvolve: true, evolvesTo: { id: 62, name: 'Poliwrath', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'water', amount: 3 }] },
  62: { id: 62, name: 'Poliwrath', types: ['water', 'fighting'], hp: 135, canEvolve: false },
  // === Abra line ===
  64: { id: 64, name: 'Kadabra', types: ['psychic'], hp: 115, canEvolve: true, evolvesTo: { id: 65, name: 'Alakazam', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'psychic', amount: 3 }] },
  65: { id: 65, name: 'Alakazam', types: ['psychic'], hp: 130, canEvolve: false },
  // === Machop line ===
  67: { id: 67, name: 'Machoke', types: ['fighting'], hp: 115, canEvolve: true, evolvesTo: { id: 68, name: 'Machamp', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fighting', amount: 3 }] },
  68: { id: 68, name: 'Machamp', types: ['fighting'], hp: 135, canEvolve: false },
  // === Geodude line ===
  75: { id: 75, name: 'Graveler', types: ['rock', 'ground'], hp: 115, canEvolve: true, evolvesTo: { id: 76, name: 'Golem', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'fighting', amount: 3 }] },
  76: { id: 76, name: 'Golem', types: ['rock', 'ground'], hp: 135, canEvolve: false },
  // === Ponyta line ===
  78: { id: 78, name: 'Rapidash', types: ['fire'], hp: 115, canEvolve: false },
  // === Slowpoke line ===
  80: { id: 80, name: 'Slowbro', types: ['water', 'psychic'], hp: 120, canEvolve: false },
  // === Magnemite line ===
  82: { id: 82, name: 'Magneton', types: ['electric', 'steel'], hp: 115, canEvolve: false },
  // === Doduo line ===
  85: { id: 85, name: 'Dodrio', types: ['normal', 'flying'], hp: 115, canEvolve: false },
  // === Seel line ===
  87: { id: 87, name: 'Dewgong', types: ['water', 'ice'], hp: 120, canEvolve: false },
  // === Grimer line ===
  89: { id: 89, name: 'Muk', types: ['poison'], hp: 115, canEvolve: false },
  // === Shellder line ===
  91: { id: 91, name: 'Cloyster', types: ['water', 'ice'], hp: 115, canEvolve: false },
  // === Gastly line ===
  93: { id: 93, name: 'Haunter', types: ['ghost', 'poison'], hp: 115, canEvolve: true, evolvesTo: { id: 94, name: 'Gengar', hpBonus: 15, statBonus: 20 }, evolutionEnergyCost: [{ type: 'psychic', amount: 3 }] },
  94: { id: 94, name: 'Gengar', types: ['ghost', 'poison'], hp: 130, canEvolve: false },
  // === Krabby line ===
  99: { id: 99, name: 'Kingler', types: ['water'], hp: 115, canEvolve: false },
  // === Voltorb line ===
  101: { id: 101, name: 'Electrode', types: ['electric'], hp: 115, canEvolve: false },
  // === Cubone line ===
  105: { id: 105, name: 'Marowak', types: ['ground'], hp: 115, canEvolve: false },
  // === Koffing line ===
  110: { id: 110, name: 'Weezing', types: ['poison'], hp: 115, canEvolve: false },
  // === Horsea line ===
  117: { id: 117, name: 'Seadra', types: ['water'], hp: 115, canEvolve: false },
  // === Magikarp line ===
  130: { id: 130, name: 'Gyarados', types: ['water', 'flying'], hp: 125, canEvolve: false },
  // === Eevee evolutions ===
  134: { id: 134, name: 'Vaporeon', types: ['water'], hp: 120, canEvolve: false },
  135: { id: 135, name: 'Jolteon', types: ['electric'], hp: 110, canEvolve: false },
  136: { id: 136, name: 'Flareon', types: ['fire'], hp: 110, canEvolve: false },
  // === Zubat line ===
  42: { id: 42, name: 'Golbat', types: ['poison', 'flying'], hp: 115, canEvolve: false },
  // === Paras line ===
  47: { id: 47, name: 'Parasect', types: ['bug', 'grass'], hp: 115, canEvolve: false },
  // === Venonat line ===
  49: { id: 49, name: 'Venomoth', types: ['bug', 'poison'], hp: 115, canEvolve: false },
  // === Diglett line ===
  51: { id: 51, name: 'Dugtrio', types: ['ground'], hp: 115, canEvolve: false },
  // === Psyduck line ===
  55: { id: 55, name: 'Golduck', types: ['water'], hp: 115, canEvolve: false },
  // === Mankey line ===
  57: { id: 57, name: 'Primeape', types: ['fighting'], hp: 115, canEvolve: false },
  // === Bellsprout line ===
  70: { id: 70, name: 'Weepinbell', types: ['grass', 'poison'], hp: 115, canEvolve: true, evolvesTo: { id: 71, name: 'Victreebel', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'grass', amount: 3 }] },
  71: { id: 71, name: 'Victreebel', types: ['grass', 'poison'], hp: 135, canEvolve: false },
  // === Tentacool line ===
  73: { id: 73, name: 'Tentacruel', types: ['water', 'poison'], hp: 115, canEvolve: false },
  // === Drowzee line ===
  97: { id: 97, name: 'Hypno', types: ['psychic'], hp: 115, canEvolve: false },
  // === Exeggcute line ===
  103: { id: 103, name: 'Exeggutor', types: ['grass', 'psychic'], hp: 120, canEvolve: false },
  // === Rhyhorn line ===
  112: { id: 112, name: 'Rhydon', types: ['ground', 'rock'], hp: 120, canEvolve: false },
  // === Goldeen line ===
  119: { id: 119, name: 'Seaking', types: ['water'], hp: 115, canEvolve: false },
  // === Staryu line ===
  121: { id: 121, name: 'Starmie', types: ['water', 'psychic'], hp: 115, canEvolve: false },
  // === Omanyte line ===
  139: { id: 139, name: 'Omastar', types: ['rock', 'water'], hp: 115, canEvolve: false },
  // === Kabuto line ===
  141: { id: 141, name: 'Kabutops', types: ['rock', 'water'], hp: 115, canEvolve: false },
  // === Dratini line ===
  148: { id: 148, name: 'Dragonair', types: ['dragon'], hp: 115, canEvolve: true, evolvesTo: { id: 149, name: 'Dragonite', hpBonus: 20, statBonus: 20 }, evolutionEnergyCost: [{ type: 'colorless', amount: 3 }] },
  149: { id: 149, name: 'Dragonite', types: ['dragon', 'flying'], hp: 135, canEvolve: false },
};

// ==================== TRAINERS ====================
export const TRAINERS: Trainer[] = [
  {
    name: 'Brock',
    passive: 'Sturdy Defense',
    passiveDesc: 'Rock/Ground Pokemon take 15 less damage',
    passiveDesc2: 'Applied automatically when Rock/Ground Pokemon are attacked',
    applyPassive: ({ addLog }) => { addLog('Brock\'s Sturdy Defense is active!', 'effect'); },
  },
  {
    name: 'Misty',
    passive: 'Tidal Surge',
    passiveDesc: '+1 Water energy every 2 turns',
    passiveDesc2: 'Water Pokemon deal +10% damage on Water moves',
    applyPassive: ({ setEnergy, turn, addLog }) => {
      if (turn > 1 && turn % 2 === 0) {
        setEnergy((prev: EnergyState) => ({ ...prev, water: prev.water + 1 }));
        addLog('Misty\'s Tidal Surge: +1 Water energy!', 'effect');
      }
    },
  },
  {
    name: 'Lt. Surge',
    passive: 'Lightning Rod',
    passiveDesc: '+1 Electric energy every 2 turns',
    passiveDesc2: 'Electric Pokemon are immune to Paralyze',
    applyPassive: ({ setEnergy, turn, addLog }) => {
      if (turn > 1 && turn % 2 === 0) {
        setEnergy((prev: EnergyState) => ({ ...prev, lightning: prev.lightning + 1 }));
        addLog('Lt. Surge\'s Lightning Rod: +1 Lightning energy!', 'effect');
      }
    },
  },
  {
    name: 'Erika',
    passive: 'Natural Cure',
    passiveDesc: 'Grass Pokemon heal 10 HP each turn',
    passiveDesc2: 'Grass Pokemon are immune to Poison',
    applyPassive: ({ playerTeam, setPlayerTeam, addLog }) => {
      const heals: { idx: number; heal: number; name: string }[] = [];
      playerTeam.forEach((p, i) => {
        if (p.hp > 0 && p.types.includes('grass')) {
          const heal = Math.min(10, p.maxHp - p.hp);
          if (heal > 0) heals.push({ idx: i, heal, name: p.name });
        }
      });
      if (heals.length > 0) {
        setPlayerTeam(prev => prev.map((p, i) => {
          const h = heals.find(x => x.idx === i);
          return h ? { ...p, hp: p.hp + h.heal } : p;
        }));
        heals.forEach(h => addLog(`Erika's Natural Cure: ${h.name} healed ${h.heal} HP!`, 'heal'));
      }
    },
  },
  {
    name: 'Sabrina',
    passive: 'Mind Reader',
    passiveDesc: 'Psychic moves have +10% accuracy',
    passiveDesc2: 'Psychic Pokemon deal +5 extra damage on Psychic moves',
    applyPassive: ({ addLog }) => { addLog('Sabrina\'s Mind Reader is active!', 'effect'); },
  },
  {
    name: 'Koga',
    passive: 'Toxic Master',
    passiveDesc: 'Poison status lasts 1 extra turn',
    passiveDesc2: 'Poison moves have +20% chance to poison',
    applyPassive: ({ addLog }) => { addLog('Koga\'s Toxic Master is active!', 'effect'); },
  },
  {
    name: 'Blaine',
    passive: 'Flame Body',
    passiveDesc: 'Fire moves have +20% burn chance',
    passiveDesc2: 'Fire Pokemon take 25% less damage from Fire moves',
    applyPassive: ({ addLog }) => { addLog('Blaine\'s Flame Body is active!', 'effect'); },
  },
  {
    name: 'Giovanni',
    passive: 'Intimidate',
    passiveDesc: 'Enemy Pokemon deal 10% less damage',
    passiveDesc2: 'On turn 1, removes 1 random energy from opponent',
    applyPassive: ({ addLog }) => { addLog('Giovanni\'s Intimidate is active!', 'effect'); },
    onBattleStart: ({ setAiEnergy, addLog }) => {
      setAiEnergy((prev: EnergyState) => {
        const e = { ...prev };
        const types: EnergyType[] = ALL_ENERGY_TYPES.filter(t => e[t] > 0);
        if (types.length > 0) {
          const picked = types[Math.floor(Math.random() * types.length)];
          e[picked]--;
          addLog(`Giovanni's Intimidate: Removed 1 ${picked} energy from opponent!`, 'effect');
        }
        return e;
      });
    },
  },
  {
    name: 'Professor Oak',
    passive: 'Pokemon Research',
    passiveDesc: '+1 Colorless energy every turn',
    passiveDesc2: 'All Pokemon start with +5 max HP',
    applyPassive: ({ setEnergy, addLog }) => {
      setEnergy((prev: EnergyState) => ({ ...prev, colorless: prev.colorless + 1 }));
      addLog('Prof. Oak\'s Research: +1 Colorless energy!', 'effect');
    },
    onBattleStart: ({ playerTeam, setPlayerTeam, addLog }) => {
      setPlayerTeam(prev => prev.map(p => ({ ...p, hp: p.hp + 5, maxHp: p.maxHp + 5 })));
      addLog('Prof. Oak\'s Research: All Pokemon gained +5 max HP!', 'effect');
    },
  },
  {
    name: 'Nurse Joy',
    passive: 'Healing Touch',
    passiveDesc: 'Every 3 turns, heals 20 HP to weakest ally',
    passiveDesc2: 'Healing items (Potions) heal 50% more',
    applyPassive: ({ playerTeam, setPlayerTeam, turn, addLog }) => {
      if (turn > 1 && turn % 3 === 0) {
        const alive = playerTeam.filter(p => p.hp > 0 && p.hp < p.maxHp);
        if (alive.length > 0) {
          const weakest = alive.reduce((a, b) => (a.hp / a.maxHp) < (b.hp / b.maxHp) ? a : b);
          const idx = playerTeam.indexOf(weakest);
          const heal = Math.min(20, weakest.maxHp - weakest.hp);
          if (heal > 0) {
            setPlayerTeam(prev => prev.map((p, i) => i === idx ? { ...p, hp: p.hp + heal } : p));
            addLog(`Nurse Joy's Healing Touch: ${weakest.name} healed ${heal} HP!`, 'heal');
          }
        }
      }
    },
  },
  {
    name: 'Lance',
    passive: 'Dragon Master',
    passiveDesc: 'Dragon Pokemon deal +20% damage',
    passiveDesc2: 'If Dragonite is on the team, its moves gain +1 base power',
    applyPassive: ({ addLog }) => { addLog('Lance\'s Dragon Master is active!', 'effect'); },
  },
  {
    name: 'Red',
    passive: 'Champion\'s Spirit',
    passiveDesc: 'When an ally faints, others gain +10% damage permanently',
    passiveDesc2: 'Start with +1 energy of each selected type',
    applyPassive: ({ addLog }) => { addLog('Red\'s Champion\'s Spirit burns bright!', 'effect'); },
    onBattleStart: ({ setEnergy, addLog }) => {
      setEnergy((prev: EnergyState) => {
        const e = { ...prev };
        for (const t of ALL_ENERGY_TYPES) {
          if (e[t] > 0) e[t] += 1;
        }
        return e;
      });
      addLog('Red\'s Champion\'s Spirit: +1 energy of each selected type!', 'effect');
    },
  },
];

export const AI_TRAINER_NAMES = [
  'Youngster Joey', 'Bug Catcher Wade', 'Lass Dana', 'Hiker Clark',
  'Ace Trainer Kate', 'Cooltrainer Gaven', 'Psychic Tyron', 'Blackbelt Kiyo',
  'Bird Keeper Abe', 'Ranger Beth', 'Veteran Lucas',
];

// ==================== ITEMS ====================
const ITEM_SPRITE = (name: string) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;

export const DEFAULT_ITEMS: BattleItem[] = [
  { id: 'potion', name: 'Potion', description: 'Heals 30 HP', icon: ITEM_SPRITE('potion'), uses: 2, maxUses: 2, category: 'healing' },
  { id: 'super-potion', name: 'Super Potion', description: 'Heals 60 HP', icon: ITEM_SPRITE('super-potion'), uses: 1, maxUses: 1, category: 'healing' },
  { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: ITEM_SPRITE('full-heal'), uses: 1, maxUses: 1, category: 'status' },
  { id: 'revive', name: 'Revive', description: 'Revives with 50% HP', icon: ITEM_SPRITE('revive'), uses: 1, maxUses: 1, category: 'revive' },
  { id: 'x-attack', name: 'X Attack', description: '+30% damage for 3 turns', icon: ITEM_SPRITE('x-attack'), uses: 1, maxUses: 1, category: 'boost' },
];

// Trainer-specific item loadouts — balanced per trainer specialty
export const TRAINER_ITEMS: Record<string, BattleItem[]> = {
  'Brock': [
    { id: 'potion', name: 'Potion', description: 'Heals 30 HP', icon: ITEM_SPRITE('potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'x-defense', name: 'X Defense', description: '-20 damage taken for 3 turns', icon: ITEM_SPRITE('x-defense'), uses: 2, maxUses: 2, category: 'boost' },
    { id: 'revive', name: 'Revive', description: 'Revives with 50% HP', icon: ITEM_SPRITE('revive'), uses: 1, maxUses: 1, category: 'revive' },
    { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: ITEM_SPRITE('full-heal'), uses: 1, maxUses: 1, category: 'status' },
  ],
  'Misty': [
    { id: 'hyper-potion', name: 'Hyper Potion', description: 'Heals 120 HP', icon: ITEM_SPRITE('hyper-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: ITEM_SPRITE('full-heal'), uses: 2, maxUses: 2, category: 'status' },
    { id: 'revive', name: 'Revive', description: 'Revives with 50% HP', icon: ITEM_SPRITE('revive'), uses: 1, maxUses: 1, category: 'revive' },
  ],
  'Lt. Surge': [
    { id: 'super-potion', name: 'Super Potion', description: 'Heals 60 HP', icon: ITEM_SPRITE('super-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'x-attack', name: 'X Attack', description: '+30% damage for 3 turns', icon: ITEM_SPRITE('x-attack'), uses: 2, maxUses: 2, category: 'boost' },
    { id: 'paralyze-heal', name: 'Paralyze Heal', description: 'Removes Paralyze', icon: ITEM_SPRITE('paralyze-heal'), uses: 2, maxUses: 2, category: 'status' },
  ],
  'Erika': [
    { id: 'super-potion', name: 'Super Potion', description: 'Heals 60 HP', icon: ITEM_SPRITE('super-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'antidote', name: 'Antidote', description: 'Removes Poison', icon: ITEM_SPRITE('antidote'), uses: 3, maxUses: 3, category: 'status' },
    { id: 'revive', name: 'Revive', description: 'Revives with 50% HP', icon: ITEM_SPRITE('revive'), uses: 1, maxUses: 1, category: 'revive' },
    { id: 'energy-boost', name: 'Energy Boost', description: '+1 Colorless energy', icon: ITEM_SPRITE('pp-up'), uses: 1, maxUses: 1, category: 'energy' },
  ],
  'Sabrina': [
    { id: 'hyper-potion', name: 'Hyper Potion', description: 'Heals 120 HP', icon: ITEM_SPRITE('hyper-potion'), uses: 1, maxUses: 1, category: 'healing' },
    { id: 'x-special', name: 'X Special', description: '+30% special damage for 3 turns', icon: ITEM_SPRITE('x-sp-atk'), uses: 2, maxUses: 2, category: 'boost' },
    { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: ITEM_SPRITE('full-heal'), uses: 2, maxUses: 2, category: 'status' },
  ],
  'Koga': [
    { id: 'super-potion', name: 'Super Potion', description: 'Heals 60 HP', icon: ITEM_SPRITE('super-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'antidote', name: 'Antidote', description: 'Removes Poison', icon: ITEM_SPRITE('antidote'), uses: 3, maxUses: 3, category: 'status' },
    { id: 'poke-doll', name: 'Poke Doll', description: 'Invulnerable for 1 turn', icon: ITEM_SPRITE('poke-doll'), uses: 1, maxUses: 1, category: 'special' },
    { id: 'x-speed', name: 'X Speed', description: '+1 action priority for 3 turns', icon: ITEM_SPRITE('x-speed'), uses: 1, maxUses: 1, category: 'boost' },
  ],
  'Blaine': [
    { id: 'super-potion', name: 'Super Potion', description: 'Heals 60 HP', icon: ITEM_SPRITE('super-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'burn-heal', name: 'Burn Heal', description: 'Removes Burn', icon: ITEM_SPRITE('burn-heal'), uses: 3, maxUses: 3, category: 'status' },
    { id: 'x-attack', name: 'X Attack', description: '+30% damage for 3 turns', icon: ITEM_SPRITE('x-attack'), uses: 2, maxUses: 2, category: 'boost' },
  ],
  'Giovanni': [
    { id: 'hyper-potion', name: 'Hyper Potion', description: 'Heals 120 HP', icon: ITEM_SPRITE('hyper-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'x-attack', name: 'X Attack', description: '+30% damage for 3 turns', icon: ITEM_SPRITE('x-attack'), uses: 1, maxUses: 1, category: 'boost' },
    { id: 'x-defense', name: 'X Defense', description: '-20 damage taken for 3 turns', icon: ITEM_SPRITE('x-defense'), uses: 1, maxUses: 1, category: 'boost' },
    { id: 'revive', name: 'Revive', description: 'Revives with 50% HP', icon: ITEM_SPRITE('revive'), uses: 1, maxUses: 1, category: 'revive' },
  ],
  'Professor Oak': [
    { id: 'max-potion', name: 'Max Potion', description: 'Fully heals HP', icon: ITEM_SPRITE('max-potion'), uses: 1, maxUses: 1, category: 'healing' },
    { id: 'rare-candy', name: 'Rare Candy', description: 'Evolve without energy cost', icon: ITEM_SPRITE('rare-candy'), uses: 2, maxUses: 2, category: 'energy' },
    { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: ITEM_SPRITE('full-heal'), uses: 1, maxUses: 1, category: 'status' },
    { id: 'energy-boost', name: 'Energy Boost', description: '+1 Colorless energy', icon: ITEM_SPRITE('pp-up'), uses: 2, maxUses: 2, category: 'energy' },
  ],
  'Nurse Joy': [
    { id: 'hyper-potion', name: 'Hyper Potion', description: 'Heals 120 HP', icon: ITEM_SPRITE('hyper-potion'), uses: 3, maxUses: 3, category: 'healing' },
    { id: 'full-restore', name: 'Full Restore', description: 'Fully heals HP + removes status', icon: ITEM_SPRITE('full-restore'), uses: 1, maxUses: 1, category: 'healing' },
    { id: 'max-revive', name: 'Max Revive', description: 'Revives with 100% HP', icon: ITEM_SPRITE('max-revive'), uses: 1, maxUses: 1, category: 'revive' },
    { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: ITEM_SPRITE('full-heal'), uses: 2, maxUses: 2, category: 'status' },
  ],
  'Lance': [
    { id: 'hyper-potion', name: 'Hyper Potion', description: 'Heals 120 HP', icon: ITEM_SPRITE('hyper-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'x-attack', name: 'X Attack', description: '+30% damage for 3 turns', icon: ITEM_SPRITE('x-attack'), uses: 2, maxUses: 2, category: 'boost' },
    { id: 'revive', name: 'Revive', description: 'Revives with 50% HP', icon: ITEM_SPRITE('revive'), uses: 1, maxUses: 1, category: 'revive' },
  ],
  'Red': [
    { id: 'max-potion', name: 'Max Potion', description: 'Fully heals HP', icon: ITEM_SPRITE('max-potion'), uses: 2, maxUses: 2, category: 'healing' },
    { id: 'max-revive', name: 'Max Revive', description: 'Revives with 100% HP', icon: ITEM_SPRITE('max-revive'), uses: 1, maxUses: 1, category: 'revive' },
    { id: 'x-attack', name: 'X Attack', description: '+30% damage for 3 turns', icon: ITEM_SPRITE('x-attack'), uses: 1, maxUses: 1, category: 'boost' },
    { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: ITEM_SPRITE('full-heal'), uses: 1, maxUses: 1, category: 'status' },
  ],
};
