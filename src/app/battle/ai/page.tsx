'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import './battle.css';
import './mobile.css';
import { getRankByLevel, RankInfo } from '@/lib/ranks';
import { calculateArenaDamage } from '@/lib/damage-calculator';
import { getTypeEffectiveness, STAB_MULTIPLIER } from '@/lib/type-effectiveness';

// ==================== TYPE SYSTEM ====================
type PokemonType = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' |
  'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' |
  'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

type GlobalType = 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice' |
  'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug' | 'Rock' |
  'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy';

const toGlobalType = (t: PokemonType): GlobalType =>
  (t.charAt(0).toUpperCase() + t.slice(1)) as GlobalType;
const toGlobalTypes = (ts: PokemonType[]): GlobalType[] => ts.map(toGlobalType);

// ==================== TCG POCKET ENERGY TYPES (OFFICIAL) ====================
// Pokemon TCG Pocket has 8 official energy types + Colorless
// Source: https://www.pokemon.com/us/strategy/learn-how-to-build-a-deck-in-pokemon-tcg-pocket
type EnergyType = 'grass' | 'fire' | 'water' | 'lightning' | 'psychic' | 'fighting' | 'darkness' | 'metal' | 'colorless';

const ALL_SELECTABLE_ENERGY_TYPES: EnergyType[] = ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal'];
const ALL_ENERGY_TYPES: EnergyType[] = ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal', 'colorless'];

// Official TCG Pocket energy icons (using emojis as placeholders)
const ENERGY_ICONS: Record<EnergyType, string> = {
  grass: '🌿',
  fire: '🔥',
  water: '💧',
  lightning: '⚡',
  psychic: '🔮',
  fighting: '👊',
  darkness: '🌑',
  metal: '⚙️',
  colorless: '⭐',
};

// Official TCG Pocket energy names
const ENERGY_NAMES: Record<EnergyType, string> = {
  grass: 'Grass',
  fire: 'Fire',
  water: 'Water',
  lightning: 'Lightning',
  psychic: 'Psychic',
  fighting: 'Fighting',
  darkness: 'Darkness',
  metal: 'Metal',
  colorless: 'Colorless',
};

// Map Pokemon types to TCG Pocket energy types (OFFICIAL)
const TYPE_TO_ENERGY: Record<PokemonType, EnergyType> = {
  // Direct mappings (8 main types)
  fire: 'fire',
  water: 'water',
  grass: 'grass',
  electric: 'lightning',
  psychic: 'psychic',
  fighting: 'fighting',
  dark: 'darkness',
  steel: 'metal',
  
  // Types that use existing energies
  ghost: 'psychic',      // Ghost uses Psychic energy
  rock: 'fighting',      // Rock uses Fighting energy
  ground: 'fighting',    // Ground uses Fighting energy
  poison: 'darkness',    // Poison uses Darkness energy
  bug: 'grass',          // Bug uses Grass energy
  ice: 'water',          // Ice uses Water energy
  
  // Colorless types (can use any energy)
  normal: 'colorless',
  flying: 'colorless',
  dragon: 'colorless',
  fairy: 'colorless',
};

// ==================== STATUS EFFECTS ====================
// All Naruto Arena effects + Pokemon effects
type StatusType = 
  // Pokemon effects
  | 'burn' | 'poison' | 'paralyze' | 'sleep' | 'freeze' | 'confuse' 
  // Naruto Arena effects
  | 'stun' | 'invulnerable' | 'counter' | 'reflect' | 'taunt' | 'silence'
  | 'weaken' | 'strengthen' | 'reduce-damage' | 'increase-damage'
  | 'remove-energy' | 'steal-energy' | 'drain-hp' | 'heal-over-time'
  | 'cooldown-increase' | 'cooldown-reduce' | 'cannot-be-healed';

const STATUS_ICONS: Record<StatusType, string> = {
  burn: '🔥', poison: '☠️', paralyze: '⚡', sleep: '💤',
  freeze: '❄️', confuse: '💫', stun: '✨', invulnerable: '🛡️',
  counter: '⚔️', reflect: '🪞', taunt: '🎯', silence: '🔇',
  weaken: '⬇️', strengthen: '⬆️', 'reduce-damage': '🛡️', 'increase-damage': '💥',
  'remove-energy': '🔻', 'steal-energy': '💰', 'drain-hp': '🩸', 'heal-over-time': '💚',
  'cooldown-increase': '⏳', 'cooldown-reduce': '⚡', 'cannot-be-healed': '🚫',
};

interface StatusEffect {
  type: StatusType;
  duration: number;
  source: string;
  value?: number; // For effects that have a numeric value (damage, heal, energy amount, etc)
}

// ==================== INTERFACES ====================
// TURN-BASED: Player 1 selects -> Player 2 selects -> Execute both -> Repeat
type GamePhase = 'loading' | 'energy-select' | 'player1-turn' | 'player2-turn' | 'targeting' | 'executing' |
  'item-target' | 'victory' | 'defeat';

interface EnergyState {
  grass: number;
  fire: number;
  water: number;
  lightning: number;
  psychic: number;
  fighting: number;
  darkness: number;
  metal: number;
  colorless: number;
}

const EMPTY_ENERGY: EnergyState = {
  grass: 0,
  fire: 0,
  water: 0,
  lightning: 0,
  psychic: 0,
  fighting: 0,
  darkness: 0,
  metal: 0,
  colorless: 0,
};

interface EnergyCost { type: EnergyType; amount: number; }

interface Move {
  id: string;
  name: string;
  type: PokemonType;
  power: number;
  accuracy: number;
  cost: EnergyCost[];
  cooldown: number;
  currentCooldown: number;
  description: string;
  targetType: 'enemy' | 'all-enemies' | 'self';
  statusEffect?: { type: StatusType; chance: number; duration: number; value?: number };
}

interface BattlePokemon {
  id: number;
  name: string;
  types: PokemonType[];
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  sprite: string;
  moves: Move[];
  statusEffects: StatusEffect[];
  canEvolve: boolean;
  evolvesTo?: { id: number; name: string; hpBonus: number; statBonus: number };
  evolutionEnergyCost?: EnergyCost[];
}

interface SelectedAction {
  pokemonIndex: number;
  move: Move;
  targetIndex: number;
}

interface LogEntry {
  id: number;
  text: string;
  type: 'info' | 'damage' | 'heal' | 'effect' | 'critical' | 'status';
}

interface Trainer {
  name: string;
  passive: string;
  passiveDesc: string;
  applyPassive: (context: PassiveContext) => void;
}

interface PassiveContext {
  playerTeam: BattlePokemon[];
  opponentTeam: BattlePokemon[];
  energy: EnergyState;
  setEnergy: (e: EnergyState) => void;
  turn: number;
  addLog: (text: string, type: LogEntry['type']) => void;
}

interface BattleItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  uses: number;
  maxUses: number;
}

// ==================== BATTLE BACKGROUNDS ====================
// Anime-style battle backgrounds
const BATTLE_BACKGROUNDS = [
  '/images/cenarios/or_as_vs_flannery_battle_background_by_phoenixoflight92_d88efs2-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_battle_background_4_by_phoenixoflight92_d83ohf3-414w-2x.jpg',
  '/images/cenarios/or_as_battle_background_1b_by_phoenixoflight92_d874gjl-414w-2x.jpg',
  '/images/cenarios/or_as_vs_elite_four_sydney_battle_background_by_phoenixoflight92_d891h6b-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_battle_background_10_by_phoenixoflight92_d843fov-414w-2x.jpg',
  '/images/cenarios/or_as_battle_background_6__evening__by_phoenixoflight92_d88ajms-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_battle_background_5_by_phoenixoflight92_d83pwna-414w-2x.jpg',
  '/images/cenarios/pokemon_x_and_y_forest_battle_background_by_phoenixoflight92_d85ijvr-414w-2x.jpg',
  // Fallback to solid gradient if images don't load
  'linear-gradient(135deg, #1a4d2e 0%, #2d5a3d 50%, #1a3d2e 100%)',
];

// ==================== SKILL COLORS & ABBREVIATIONS ====================
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  normal: { bg: 'linear-gradient(135deg, #A8A878 0%, #8a8a58 100%)', border: '#6d6d36', text: '#fff' },
  fire: { bg: 'linear-gradient(135deg, #F08030 0%, #dd6610 100%)', border: '#c44d00', text: '#fff' },
  water: { bg: 'linear-gradient(135deg, #6890F0 0%, #4a6fd0 100%)', border: '#3a5eb5', text: '#fff' },
  grass: { bg: 'linear-gradient(135deg, #78C850 0%, #5aa830 100%)', border: '#4a8828', text: '#fff' },
  electric: { bg: 'linear-gradient(135deg, #F8D030 0%, #e0b020 100%)', border: '#c09810', text: '#333' }, // Maps to Lightning energy
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

const MOVE_ABBREV: Record<string, string> = {
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
};

// ==================== SPRITE HELPER ====================
const POKEMON_POKEDEX: Record<string, number> = {
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
  Gastly: 92, Haunter: 93, Gengar: 94, Onix: 95, Drowzee: 96, Hypno: 97,
  Voltorb: 100, Electrode: 101, Hitmonlee: 106, Hitmonchan: 107, Lickitung: 108,
  Koffing: 109, Weezing: 110, Rhyhorn: 111, Rhydon: 112, Chansey: 113,
  Kangaskhan: 115, Horsea: 116, Seadra: 117, Goldeen: 118, Seaking: 119,
  Staryu: 120, Starmie: 121, MrMime: 122, Scyther: 123, Jynx: 124,
  Electabuzz: 125, Magmar: 126, Pinsir: 127, Tauros: 128, Magikarp: 129,
  Gyarados: 130, Lapras: 131, Ditto: 132, Eevee: 133, Vaporeon: 134,
  Jolteon: 135, Flareon: 136, Porygon: 137, Omanyte: 138, Omastar: 139,
  Kabuto: 140, Kabutops: 141, Aerodactyl: 142, Snorlax: 143, Articuno: 144,
  Zapdos: 145, Moltres: 146, Dratini: 147, Dragonair: 148, Dragonite: 149,
  Mewtwo: 150, Mew: 151,
};

const getSprite = (name: string): string => {
  const num = POKEMON_POKEDEX[name] || 25;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${num}.gif`;
};
const getSpriteById = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

// ==================== DEFAULT MOVES PER TYPE ====================
const getDefaultMoves = (type: PokemonType): Move[] => {
  const moveSets: Record<string, Move[]> = {
    fire: [
      { id: 'f1', name: 'Flamethrower', type: 'fire', power: 45, accuracy: 100, cost: [{ type: 'fire', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A powerful stream of fire dealing 45 damage.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 30, duration: 3 } },
      { id: 'f2', name: 'Ember', type: 'fire', power: 25, accuracy: 100, cost: [{ type: 'fire', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A small flame dealing 25 damage. May burn.', targetType: 'enemy', statusEffect: { type: 'burn', chance: 20, duration: 2 } },
      { id: 'f3', name: 'Fire Fang', type: 'fire', power: 35, accuracy: 95, cost: [{ type: 'fire', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Bites with fire fangs for 35 damage.', targetType: 'enemy' },
      { id: 'f4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    water: [
      { id: 'w1', name: 'Hydro Pump', type: 'water', power: 55, accuracy: 85, cost: [{ type: 'water', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A high-pressure blast of water dealing 55 damage.', targetType: 'enemy' },
      { id: 'w2', name: 'Water Gun', type: 'water', power: 25, accuracy: 100, cost: [{ type: 'water', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Squirts water dealing 25 damage.', targetType: 'enemy' },
      { id: 'w3', name: 'Aqua Tail', type: 'water', power: 40, accuracy: 95, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Swings a watery tail for 40 damage.', targetType: 'enemy' },
      { id: 'w4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    grass: [
      { id: 'g1', name: 'Solar Beam', type: 'grass', power: 55, accuracy: 90, cost: [{ type: 'grass', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'Absorbs light then blasts for 55 damage.', targetType: 'enemy' },
      { id: 'g2', name: 'Razor Leaf', type: 'grass', power: 30, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Launches sharp leaves for 30 damage. High crit rate.', targetType: 'enemy' },
      { id: 'g3', name: 'Vine Whip', type: 'grass', power: 25, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Strikes with vines for 25 damage.', targetType: 'enemy' },
      { id: 'g4', name: 'Synthesis', type: 'grass', power: 0, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Absorbs sunlight to heal 60 HP.', targetType: 'self' },
    ],
    electric: [
      { id: 'e1', name: 'Thunderbolt', type: 'electric', power: 45, accuracy: 100, cost: [{ type: 'lightning', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A strong jolt of electricity for 45 damage. May paralyze.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 30, duration: 2 } },
      { id: 'e2', name: 'Thunder Shock', type: 'electric', power: 20, accuracy: 100, cost: [{ type: 'lightning', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A shock of electricity for 20 damage.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 20, duration: 1 } },
      { id: 'e3', name: 'Thunder', type: 'electric', power: 60, accuracy: 70, cost: [{ type: 'lightning', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A massive lightning strike for 60 damage. Low accuracy.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 50, duration: 2 } },
      { id: 'e4', name: 'Charge', type: 'electric', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Charges power. Heals 30 HP.', targetType: 'self' },
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
      { id: 'fg4', name: 'Bulk Up', type: 'fighting', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Tenses muscles. Heals 40 HP.', targetType: 'self' },
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
      { id: 'po4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    ground: [
      { id: 'gd1', name: 'Earthquake', type: 'ground', power: 50, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }, { type: 'colorless', amount: 1 }], cooldown: 1, currentCooldown: 0, description: 'Shakes the ground for 50 damage to all enemies.', targetType: 'all-enemies' },
      { id: 'gd2', name: 'Dig', type: 'ground', power: 40, accuracy: 100, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Digs underground then strikes for 40 damage.', targetType: 'enemy' },
      { id: 'gd3', name: 'Rock Slide', type: 'rock', power: 35, accuracy: 90, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 35 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 30, duration: 1 } },
      { id: 'gd4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    flying: [
      { id: 'fl1', name: 'Brave Bird', type: 'flying', power: 55, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A reckless dive for 55 damage.', targetType: 'enemy' },
      { id: 'fl2', name: 'Air Slash', type: 'flying', power: 35, accuracy: 95, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Slashes with air for 35 damage.', targetType: 'enemy' },
      { id: 'fl3', name: 'Aerial Ace', type: 'flying', power: 30, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A swift strike for 30 damage. Never misses.', targetType: 'enemy' },
      { id: 'fl4', name: 'Roost', type: 'flying', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Lands and rests. Heals 50 HP.', targetType: 'self' },
    ],
    rock: [
      { id: 'rk1', name: 'Rock Slide', type: 'rock', power: 40, accuracy: 90, cost: [{ type: 'fighting', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Drops rocks for 40 damage. May stun.', targetType: 'enemy', statusEffect: { type: 'stun', chance: 30, duration: 1 } },
      { id: 'rk2', name: 'Rock Throw', type: 'rock', power: 25, accuracy: 100, cost: [{ type: 'fighting', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Throws a rock for 25 damage.', targetType: 'enemy' },
      { id: 'rk3', name: 'Ancient Power', type: 'rock', power: 30, accuracy: 100, cost: [{ type: 'fighting', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Attacks with ancient power for 30 damage.', targetType: 'enemy' },
      { id: 'rk4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    bug: [
      { id: 'bg1', name: 'Bug Buzz', type: 'bug', power: 45, accuracy: 100, cost: [{ type: 'grass', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A vibrating buzz for 45 damage.', targetType: 'enemy' },
      { id: 'bg2', name: 'X-Scissor', type: 'bug', power: 35, accuracy: 100, cost: [{ type: 'grass', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slashes in an X for 35 damage.', targetType: 'enemy' },
      { id: 'bg3', name: 'Signal Beam', type: 'bug', power: 30, accuracy: 100, cost: [{ type: 'grass', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A peculiar beam for 30 damage. May confuse.', targetType: 'enemy', statusEffect: { type: 'confuse', chance: 20, duration: 2 } },
      { id: 'bg4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    ice: [
      { id: 'ic1', name: 'Ice Beam', type: 'ice', power: 45, accuracy: 100, cost: [{ type: 'water', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A freezing beam for 45 damage. May freeze.', targetType: 'enemy', statusEffect: { type: 'freeze', chance: 20, duration: 2 } },
      { id: 'ic2', name: 'Aurora Beam', type: 'ice', power: 30, accuracy: 100, cost: [{ type: 'water', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A rainbow beam for 30 damage.', targetType: 'enemy' },
      { id: 'ic3', name: 'Blizzard', type: 'ice', power: 55, accuracy: 70, cost: [{ type: 'water', amount: 3 }], cooldown: 1, currentCooldown: 0, description: 'A howling blizzard for 55 damage. May freeze.', targetType: 'all-enemies', statusEffect: { type: 'freeze', chance: 30, duration: 2 } },
      { id: 'ic4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    steel: [
      { id: 'st1', name: 'Flash Cannon', type: 'steel', power: 45, accuracy: 100, cost: [{ type: 'metal', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A focused light cannon for 45 damage.', targetType: 'enemy' },
      { id: 'st2', name: 'Metal Claw', type: 'steel', power: 30, accuracy: 95, cost: [{ type: 'metal', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Rakes with metal claws for 30 damage.', targetType: 'enemy' },
      { id: 'st3', name: 'Iron Tail', type: 'steel', power: 40, accuracy: 85, cost: [{ type: 'metal', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slams with a hard tail for 40 damage.', targetType: 'enemy' },
      { id: 'st4', name: 'Iron Defense', type: 'steel', power: 0, accuracy: 100, cost: [{ type: 'metal', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Hardens body. Heals 50 HP.', targetType: 'self' },
    ],
    dragon: [
      { id: 'dr1', name: 'Dragon Pulse', type: 'dragon', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A shockwave from the mouth for 45 damage.', targetType: 'enemy' },
      { id: 'dr2', name: 'Dragon Claw', type: 'dragon', power: 35, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }, { type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Slashes with claws for 35 damage.', targetType: 'enemy' },
      { id: 'dr3', name: 'Outrage', type: 'dragon', power: 60, accuracy: 100, cost: [{ type: 'colorless', amount: 3 }], cooldown: 2, currentCooldown: 0, description: 'A rampage for 60 damage. Confuses self.', targetType: 'enemy' },
      { id: 'dr4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
    fairy: [
      { id: 'fa1', name: 'Moonblast', type: 'fairy', power: 45, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A moonlight blast for 45 damage.', targetType: 'enemy' },
      { id: 'fa2', name: 'Dazzling Gleam', type: 'fairy', power: 40, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'Dazzles all enemies for 40 damage.', targetType: 'all-enemies' },
      { id: 'fa3', name: 'Draining Kiss', type: 'fairy', power: 25, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Drains HP for 25 damage. Heals user 15 HP.', targetType: 'enemy' },
      { id: 'fa4', name: 'Charm', type: 'fairy', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Charms the target. Heals 40 HP.', targetType: 'self' },
    ],
    normal: [
      { id: 'n1', name: 'Body Slam', type: 'normal', power: 40, accuracy: 100, cost: [{ type: 'colorless', amount: 2 }], cooldown: 0, currentCooldown: 0, description: 'A full-body slam for 40 damage. May paralyze.', targetType: 'enemy', statusEffect: { type: 'paralyze', chance: 30, duration: 2 } },
      { id: 'n2', name: 'Tackle', type: 'normal', power: 20, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'Tackles the target for 20 damage.', targetType: 'enemy' },
      { id: 'n3', name: 'Quick Attack', type: 'normal', power: 25, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 0, currentCooldown: 0, description: 'A swift attack for 25 damage. High priority.', targetType: 'enemy' },
      { id: 'n4', name: 'Recover', type: 'normal', power: 0, accuracy: 100, cost: [{ type: 'colorless', amount: 1 }], cooldown: 2, currentCooldown: 0, description: 'Recovers 50 HP.', targetType: 'self' },
    ],
  };
  return moveSets[type] || moveSets.normal;
};

// ==================== KANTO POKEMON WITH EVOLUTION ====================
interface KantoPokemonData {
  id: number; name: string; types: PokemonType[]; hp: number;
  canEvolve: boolean; evolvesTo?: { id: number; name: string; hpBonus: number; statBonus: number };
  evolutionEnergyCost?: EnergyCost[];
}

// KANTO STARTER POKEMON ONLY (Client requested: only starters, no evolutions in selection)
// Evolution system still works during battle, but initial selection is starters only
const KANTO_POKEMON: KantoPokemonData[] = [
  // Classic Kanto Starters (can evolve during battle)
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], hp: 195, canEvolve: true, evolvesTo: { id: 2, name: 'Ivysaur', hpBonus: 35, statBonus: 10 }, evolutionEnergyCost: [{ type: 'grass', amount: 2 }] },
  { id: 4, name: 'Charmander', types: ['fire'], hp: 190, canEvolve: true, evolvesTo: { id: 5, name: 'Charmeleon', hpBonus: 38, statBonus: 10 }, evolutionEnergyCost: [{ type: 'fire', amount: 2 }] },
  { id: 7, name: 'Squirtle', types: ['water'], hp: 198, canEvolve: true, evolvesTo: { id: 8, name: 'Wartortle', hpBonus: 31, statBonus: 10 }, evolutionEnergyCost: [{ type: 'water', amount: 2 }] },
  
  // Pikachu (Mascot/Special starter - can evolve)
  { id: 25, name: 'Pikachu', types: ['electric'], hp: 165, canEvolve: true, evolvesTo: { id: 26, name: 'Raichu', hpBonus: 65, statBonus: 15 }, evolutionEnergyCost: [{ type: 'lightning', amount: 2 }] },
  
  // Additional starter options
  { id: 133, name: 'Eevee', types: ['normal'], hp: 180, canEvolve: false },
  { id: 52, name: 'Meowth', types: ['normal'], hp: 175, canEvolve: false },
];

// Evolution data (for when Pokemon evolve during battle)
const EVOLUTION_DATA: Record<number, KantoPokemonData> = {
  2: { id: 2, name: 'Ivysaur', types: ['grass', 'poison'], hp: 230, canEvolve: true, evolvesTo: { id: 3, name: 'Venusaur', hpBonus: 40, statBonus: 15 }, evolutionEnergyCost: [{ type: 'grass', amount: 3 }] },
  3: { id: 3, name: 'Venusaur', types: ['grass', 'poison'], hp: 270, canEvolve: false },
  5: { id: 5, name: 'Charmeleon', types: ['fire'], hp: 228, canEvolve: true, evolvesTo: { id: 6, name: 'Charizard', hpBonus: 38, statBonus: 15 }, evolutionEnergyCost: [{ type: 'fire', amount: 3 }] },
  6: { id: 6, name: 'Charizard', types: ['fire', 'flying'], hp: 266, canEvolve: false },
  8: { id: 8, name: 'Wartortle', types: ['water'], hp: 229, canEvolve: true, evolvesTo: { id: 9, name: 'Blastoise', hpBonus: 39, statBonus: 15 }, evolutionEnergyCost: [{ type: 'water', amount: 3 }] },
  9: { id: 9, name: 'Blastoise', types: ['water'], hp: 268, canEvolve: false },
  26: { id: 26, name: 'Raichu', types: ['electric'], hp: 230, canEvolve: false },
};

// ==================== TRAINERS WITH PASSIVES ====================
const TRAINERS: Trainer[] = [
  {
    name: 'Brock',
    passive: 'Sturdy Defense',
    passiveDesc: 'Rock/Ground Pokemon take 15 less damage',
    applyPassive: ({ playerTeam, addLog }) => {
      // Applied during damage calculation
      addLog('Brock\'s Sturdy Defense is active!', 'effect');
    },
  },
  {
    name: 'Misty',
    passive: 'Tidal Surge',
    passiveDesc: '+1 Water energy every 2 turns',
    applyPassive: ({ energy, setEnergy, turn, addLog }) => {
      if (turn > 1 && turn % 2 === 0) {
        setEnergy({ ...energy, water: energy.water + 1 });
        addLog('Misty\'s Tidal Surge: +1 Water energy!', 'effect');
      }
    },
  },
  {
    name: 'Lt. Surge',
    passive: 'Lightning Rod',
    passiveDesc: '+1 Electric energy every 2 turns',
    applyPassive: ({ energy, setEnergy, turn, addLog }) => {
      if (turn > 1 && turn % 2 === 0) {
        setEnergy({ ...energy, lightning: energy.lightning + 1 });
        addLog('Lt. Surge\'s Lightning Rod: +1 Lightning energy!', 'effect');
      }
    },
  },
  {
    name: 'Erika',
    passive: 'Natural Cure',
    passiveDesc: 'Grass Pokemon heal 10 HP each turn',
    applyPassive: ({ playerTeam, addLog }) => {
      playerTeam.forEach(p => {
        if (p.hp > 0 && p.types.includes('grass')) {
          const heal = Math.min(10, p.maxHp - p.hp);
          if (heal > 0) {
            p.hp += heal;
            addLog(`Erika's Natural Cure: ${p.name} healed ${heal} HP!`, 'heal');
          }
        }
      });
    },
  },
  {
    name: 'Sabrina',
    passive: 'Mind Reader',
    passiveDesc: 'Psychic moves have +10% accuracy',
    applyPassive: ({ addLog }) => {
      addLog('Sabrina\'s Mind Reader is active!', 'effect');
    },
  },
  {
    name: 'Koga',
    passive: 'Toxic Spikes',
    passiveDesc: 'Poison status lasts 1 extra turn',
    applyPassive: ({ addLog }) => {
      addLog('Koga\'s Toxic Spikes is active!', 'effect');
    },
  },
  {
    name: 'Blaine',
    passive: 'Flame Body',
    passiveDesc: 'Fire moves have +20% burn chance',
    applyPassive: ({ addLog }) => {
      addLog('Blaine\'s Flame Body is active!', 'effect');
    },
  },
  {
    name: 'Giovanni',
    passive: 'Intimidate',
    passiveDesc: 'Enemy Pokemon deal 10% less damage',
    applyPassive: ({ addLog }) => {
      addLog('Giovanni\'s Intimidate is active!', 'effect');
    },
  },
];

// ==================== AI TRAINERS ====================
const AI_TRAINER_NAMES = [
  'Youngster Joey', 'Bug Catcher Wade', 'Lass Dana', 'Hiker Clark',
  'Ace Trainer Kate', 'Cooltrainer Gaven', 'Psychic Tyron', 'Blackbelt Kiyo',
  'Bird Keeper Abe', 'Ranger Beth', 'Veteran Lucas',
];

// ==================== ITEMS (Pokemon Franchise) ====================
const DEFAULT_ITEMS: BattleItem[] = [
  { id: 'potion', name: 'Potion', description: 'Heals 30 HP to one Pokemon', icon: '🧪', uses: 2, maxUses: 2 },
  { id: 'super-potion', name: 'Super Potion', description: 'Heals 60 HP to one Pokemon', icon: '💊', uses: 1, maxUses: 1 },
  { id: 'hyper-potion', name: 'Hyper Potion', description: 'Heals 120 HP to one Pokemon', icon: '💉', uses: 1, maxUses: 1 },
  { id: 'full-heal', name: 'Full Heal', description: 'Removes all status effects', icon: '🩹', uses: 2, maxUses: 2 },
  { id: 'revive', name: 'Revive', description: 'Revives a fainted Pokemon with 50% HP', icon: '✨', uses: 1, maxUses: 1 },
  { id: 'x-attack', name: 'X Attack', description: 'Boosts attack power for 3 turns', icon: '⚔️', uses: 1, maxUses: 1 },
  { id: 'x-defense', name: 'X Defense', description: 'Boosts defense for 3 turns', icon: '🛡️', uses: 1, maxUses: 1 },
  { id: 'energy-boost', name: 'Energy Boost', description: 'Adds 1 random energy', icon: '⭐', uses: 1, maxUses: 1 },
];

// ==================== HELPER FUNCTIONS ====================
const getTotalEnergy = (e: EnergyState): number =>
  Object.values(e).reduce((sum: number, v: number) => sum + v, 0);

const getHpClass = (current: number, max: number): string => {
  const pct = (current / max) * 100;
  return pct > 50 ? 'high' : pct > 25 ? 'medium' : 'low';
};

// Generate energy based on selected types + alive Pokemon
// CRITICAL: Energy ACCUMULATES, doesn't reset!
const generateTurnEnergy = (
  team: BattlePokemon[],
  selectedEnergyTypes: EnergyType[],
  turn: number
): EnergyState => {
  const energy = { ...EMPTY_ENERGY };
  const aliveCount = team.filter(p => p.hp > 0).length;

  // Turn 1: ONLY 1 energy (first player advantage)
  // Turn 2+: energy = number of alive Pokemon
  const energyCount = turn === 1 ? 1 : aliveCount;

  for (let i = 0; i < energyCount; i++) {
    // Each energy comes from a random one of the 4 selected types OR random
    const availableTypes = [...selectedEnergyTypes, 'random'] as EnergyType[];
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    energy[type]++;
  }
  return energy;
};

// Add energy (accumulate)
const addEnergy = (current: EnergyState, toAdd: EnergyState): EnergyState => {
  const result = { ...current };
  for (const key of ALL_ENERGY_TYPES) {
    result[key] += toAdd[key];
  }
  return result;
};

// Spend energy for a move
const spendEnergyForMove = (currentEnergy: EnergyState, move: Move): EnergyState => {
  const e = { ...currentEnergy };
  for (const cost of move.cost) {
    if (cost.type === 'colorless') {
      // Colorless: use any energy type, prefer dedicated colorless first
      let remaining = cost.amount;
      if (e.colorless >= remaining) {
        e.colorless -= remaining;
        continue;
      }
      remaining -= e.colorless;
      e.colorless = 0;
      for (const t of ALL_ENERGY_TYPES) {
        if (t === 'colorless') continue;
        const spend = Math.min(e[t], remaining);
        e[t] -= spend;
        remaining -= spend;
        if (remaining <= 0) break;
      }
    } else {
      // Specific type: use that type first, then colorless
      const spend = Math.min(e[cost.type], cost.amount);
      e[cost.type] -= spend;
      const stillNeeded = cost.amount - spend;
      if (stillNeeded > 0) {
        e.colorless = Math.max(0, e.colorless - stillNeeded);
      }
    }
  }
  return e;
};

// Check if player can afford a move
const canAffordMove = (energy: EnergyState, alreadySpent: SelectedAction[], move: Move): boolean => {
  let temp = { ...energy };
  // Subtract energy already committed to selected actions
  for (const a of alreadySpent) {
    temp = spendEnergyForMove(temp, a.move);
  }
  // Check if remaining energy can cover this move
  for (const cost of move.cost) {
    if (cost.type === 'colorless') {
      if (getTotalEnergy(temp) < cost.amount) return false;
      // Deduct for next check
      let remaining = cost.amount;
      for (const t of ALL_ENERGY_TYPES) {
        const spend = Math.min(temp[t], remaining);
        temp[t] -= spend;
        remaining -= spend;
        if (remaining <= 0) break;
      }
    } else {
      const available = temp[cost.type] + temp.colorless;
      if (available < cost.amount) return false;
      const spend = Math.min(temp[cost.type], cost.amount);
      temp[cost.type] -= spend;
      const stillNeeded = cost.amount - spend;
      if (stillNeeded > 0) temp.colorless -= stillNeeded;
    }
  }
  return true;
};

// Apply status effect damage/restriction at start of turn
const processStatusEffects = (team: BattlePokemon[], addLog: (text: string, type: LogEntry['type']) => void): BattlePokemon[] => {
  return team.map(p => {
    if (p.hp <= 0 || p.statusEffects.length === 0) return p;
    let newHp = p.hp;
    const remainingEffects: StatusEffect[] = [];

    for (const effect of p.statusEffects) {
      switch (effect.type) {
        case 'burn':
          const burnDmg = Math.max(1, Math.floor(p.maxHp * 0.06));
          newHp = Math.max(0, newHp - burnDmg);
          addLog(`${p.name} is hurt by burn! (-${burnDmg} HP)`, 'status');
          break;
        case 'poison':
          const poisonDmg = Math.max(1, Math.floor(p.maxHp * 0.08));
          newHp = Math.max(0, newHp - poisonDmg);
          addLog(`${p.name} is hurt by poison! (-${poisonDmg} HP)`, 'status');
          break;
        case 'freeze':
          addLog(`${p.name} is frozen solid!`, 'status');
          break;
        case 'sleep':
          addLog(`${p.name} is fast asleep!`, 'status');
          break;
        case 'paralyze':
          addLog(`${p.name} is paralyzed!`, 'status');
          break;
        case 'confuse':
          // 33% chance to hit self
          if (Math.random() < 0.33) {
            const selfDmg = Math.floor(p.maxHp * 0.05);
            newHp = Math.max(0, newHp - selfDmg);
            addLog(`${p.name} hurt itself in confusion! (-${selfDmg} HP)`, 'status');
          }
          break;
        case 'stun':
          addLog(`${p.name} is stunned!`, 'status');
          break;
        case 'drain-hp':
          const drainDmg = effect.value || Math.floor(p.maxHp * 0.05);
          newHp = Math.max(0, newHp - drainDmg);
          addLog(`${p.name} loses ${drainDmg} HP from drain!`, 'status');
          break;
        case 'heal-over-time':
          const healAmt = effect.value || Math.floor(p.maxHp * 0.05);
          const oldHp = newHp;
          newHp = Math.min(p.maxHp, newHp + healAmt);
          if (newHp > oldHp) {
            addLog(`${p.name} recovers ${newHp - oldHp} HP!`, 'heal');
          }
          break;
        // Other effects are checked during action execution
      }

      // Decrease duration
      if (effect.duration > 1) {
        remainingEffects.push({ ...effect, duration: effect.duration - 1 });
      } else {
        addLog(`${p.name} recovered from ${effect.type}!`, 'info');
      }
    }

    return { ...p, hp: newHp, statusEffects: remainingEffects };
  });
};

// Check if Pokemon can act (blocked by stun/freeze/sleep)
const canAct = (poke: BattlePokemon): boolean => {
  for (const effect of poke.statusEffects) {
    // Complete disable effects
    if (effect.type === 'stun') return false;
    if (effect.type === 'sleep') return false;
    
    // Freeze: 20% chance to thaw each turn
    if (effect.type === 'freeze') {
      if (Math.random() > 0.2) return false;
    }
    
    // Paralyze: 25% chance to be fully paralyzed
    if (effect.type === 'paralyze') {
      if (Math.random() < 0.25) return false;
    }
  }
  return true;
};

// Create opponent team
const createOpponentTeam = (): BattlePokemon[] => {
  const evolved = KANTO_POKEMON.filter(p => !p.canEvolve && p.hp >= 230);
  const shuffled = [...evolved].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  return selected.map(p => ({
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
    moves: getDefaultMoves(p.types[0]),
    statusEffects: [],
    canEvolve: false,
  }));
};

// Fallback player team
const createFallbackPlayerTeam = (): BattlePokemon[] => [
  {
    id: 4, name: 'Charmander', types: ['fire'], hp: 190, maxHp: 190,
    attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65,
    sprite: getSpriteById(4), moves: getDefaultMoves('fire'), statusEffects: [],
    canEvolve: true, evolvesTo: { id: 5, name: 'Charmeleon', hpBonus: 38, statBonus: 10 },
    evolutionEnergyCost: [{ type: 'fire', amount: 2 }],
  },
  {
    id: 7, name: 'Squirtle', types: ['water'], hp: 198, maxHp: 198,
    attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43,
    sprite: getSpriteById(7), moves: getDefaultMoves('water'), statusEffects: [],
    canEvolve: true, evolvesTo: { id: 8, name: 'Wartortle', hpBonus: 31, statBonus: 10 },
    evolutionEnergyCost: [{ type: 'water', amount: 2 }],
  },
  {
    id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], hp: 195, maxHp: 195,
    attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45,
    sprite: getSpriteById(1), moves: getDefaultMoves('grass'), statusEffects: [],
    canEvolve: true, evolvesTo: { id: 2, name: 'Ivysaur', hpBonus: 35, statBonus: 10 },
    evolutionEnergyCost: [{ type: 'grass', amount: 2 }],
  },
];

// Get type effectiveness (wrapper)
const getTypeEff = (atkType: PokemonType, defTypes: PokemonType[]): number => {
  return getTypeEffectiveness(toGlobalType(atkType), toGlobalTypes(defTypes));
};

// ==================== MAIN COMPONENT ====================
export default function AIBattlePage() {
  // Core battle state
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<BattlePokemon[]>([]);
  const [energy, setEnergy] = useState<EnergyState>({ ...EMPTY_ENERGY });
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [selectedActions, setSelectedActions] = useState<SelectedAction[]>([]);
  const [selectingPokemon, setSelectingPokemon] = useState<number | null>(null);
  const [selectingMove, setSelectingMove] = useState<Move | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{ move: Move; pokemonName: string } | null>(null);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);
  const [logId, setLogId] = useState(0);
  const [timer, setTimer] = useState(100);
  const [battleBackground, setBattleBackground] = useState('');

  // Energy selection (pre-battle)
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<EnergyType[]>([]);

  // Player info
  const [playerName, setPlayerName] = useState('Trainer');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [playerRank, setPlayerRank] = useState<RankInfo>(getRankByLevel(1));
  const [playerTrainer, setPlayerTrainer] = useState<Trainer | null>(null);
  const [battleStats, setBattleStats] = useState({ wins: 0, losses: 0, totalXP: 0 });

  // Items
  const [items, setItems] = useState<BattleItem[]>(DEFAULT_ITEMS.map(i => ({ ...i })));
  const [showItems, setShowItems] = useState(false);
  const [usingItem, setUsingItem] = useState<BattleItem | null>(null);

  // Evolution
  const [evolvingPokemon, setEvolvingPokemon] = useState<{ idx: number; from: string; to: string; fromId: number; toId: number } | null>(null);

  // Opponent
  const [opponentName] = useState(() => AI_TRAINER_NAMES[Math.floor(Math.random() * AI_TRAINER_NAMES.length)]);
  const [opponentLevel] = useState(() => Math.floor(Math.random() * 30) + 15);
  const opponentRank = getRankByLevel(opponentLevel);

  // ==================== DATA LOADING ====================
  useEffect(() => {
    const fetchPlayerData = async () => {
      let teamLoaded = false;

      // Load stats from localStorage
      try {
        const savedPlayerData = localStorage.getItem('playerData');
        if (savedPlayerData) {
          const data = JSON.parse(savedPlayerData);
          setPlayerName(data.username || 'Trainer');
          setPlayerLevel(data.level || 1);
          setPlayerXP(data.xp || 0);
          setPlayerRank(getRankByLevel(data.level || 1));
        }
        const savedStats = localStorage.getItem('battleStats');
        if (savedStats) setBattleStats(JSON.parse(savedStats));
      } catch { /* ignore */ }

      // Load team from localStorage (from /play page)
      try {
        const savedTeam = localStorage.getItem('battleTeam');
        if (savedTeam) {
          const parsedTeam = JSON.parse(savedTeam);
          if (Array.isArray(parsedTeam) && parsedTeam.length === 3) {
            const battleTeam = parsedTeam.map((p: { id: number; name: string; type: string; skills: { name: string; description: string }[] }) => {
              const primaryType = (p.type || 'normal') as PokemonType;
              const kantoData = KANTO_POKEMON.find(k => k.name === p.name || k.id === p.id);
              const moves: Move[] = (p.skills || []).slice(0, 4).map((skill: { name: string; description: string }, idx: number) => {
                const damageMatch = skill.description.match(/(\d+)/);
                const damage = damageMatch ? parseInt(damageMatch[1]) : 20;
                const energyType = TYPE_TO_ENERGY[primaryType] || 'random';
                return {
                  id: `move-${idx}`,
                  name: skill.name,
                  type: primaryType,
                  power: damage,
                  accuracy: 100,
                  cost: [{ type: energyType, amount: idx >= 2 ? 2 : 1 }],
                  cooldown: idx >= 3 ? 1 : 0,
                  currentCooldown: 0,
                  description: skill.description,
                  targetType: 'enemy' as const,
                };
              });
              while (moves.length < 4) {
                const defaults = getDefaultMoves(primaryType);
                if (defaults[moves.length]) moves.push(defaults[moves.length]);
                else break;
              }
              return {
                id: p.id,
                name: p.name,
                types: kantoData?.types || [primaryType] as PokemonType[],
                hp: kantoData?.hp || 200,
                maxHp: kantoData?.hp || 200,
                attack: 80, defense: 70, spAtk: 85, spDef: 75, speed: 60,
                sprite: getSprite(p.name),
                moves,
                statusEffects: [],
                canEvolve: kantoData?.canEvolve || false,
                evolvesTo: kantoData?.evolvesTo,
                evolutionEnergyCost: kantoData?.evolutionEnergyCost,
              };
            });
            setPlayerTeam(battleTeam);
            teamLoaded = true;
          }
        }
      } catch { /* ignore */ }

      // Try API
      try {
        const response = await fetch('/api/trainer/profile');
        if (response.ok) {
          const data = await response.json();
          setPlayerName(data.username || 'Trainer');
          setPlayerLevel(data.level || 1);
          setPlayerXP(data.xp || 0);
          setPlayerRank(getRankByLevel(data.level || 1));
          localStorage.setItem('playerData', JSON.stringify({ username: data.username, level: data.level, xp: data.xp, lastUpdated: Date.now() }));
        }
      } catch { /* ignore */ }

      if (!teamLoaded) {
        setPlayerTeam(createFallbackPlayerTeam());
      }

      setOpponentTeam(createOpponentTeam());
      setBattleBackground(BATTLE_BACKGROUNDS[Math.floor(Math.random() * BATTLE_BACKGROUNDS.length)]);

      // Pick random trainer for player
      setPlayerTrainer(TRAINERS[Math.floor(Math.random() * TRAINERS.length)]);

      // Go to energy selection phase
      setPhase('energy-select');
    };
    fetchPlayerData();
  }, []);

  // Timer for selecting phase
  useEffect(() => {
    if (phase !== 'player1-turn' && phase !== 'player2-turn') return;
    const int = setInterval(() => setTimer(t => {
      if (t <= 0) {
        handleEndTurn();
        return 100;
      }
      return t - 1;
    }), 600);
    return () => clearInterval(int);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ==================== LOG ====================
  const addLog = useCallback((text: string, type: LogEntry['type']) => {
    setLogId(id => id + 1);
    setBattleLog(prev => [{ id: Date.now() + Math.random(), text, type }, ...prev].slice(0, 30));
  }, []);

  // ==================== ENERGY SELECTION ====================
  const toggleEnergyType = (type: EnergyType) => {
    setSelectedEnergyTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      if (prev.length >= 4) return prev; // MAX 4 energies
      return [...prev, type];
    });
  };

  const confirmEnergySelection = () => {
    // TCG Pocket: Must select 1-3 energy types (recommended: 1 for consistency)
    if (selectedEnergyTypes.length < 1 || selectedEnergyTypes.length > 3) return;
    // Generate initial energy (turn 1 = 1 energy only)
    const initialEnergy = generateTurnEnergy(playerTeam, selectedEnergyTypes, 1);
    setEnergy(initialEnergy);
    setPhase('player1-turn'); // Player 1 goes first
    addLog('Battle Start! Player 1 turn!', 'info');
    addLog(`Turn 1 - Gained 1 energy!`, 'info');
  };

  // ==================== MOVE SELECTION ====================
  const canUseMove = (move: Move, pIdx: number): boolean => {
    if (phase !== 'player1-turn') return false; // Only during player's turn
    if (move.currentCooldown > 0) return false;
    if (playerTeam[pIdx]?.hp <= 0) return false;
    if (selectedActions.some(a => a.pokemonIndex === pIdx)) return false;
    // Check if Pokemon can act (status effects)
    if (!canAct(playerTeam[pIdx])) return false;
    return canAffordMove(energy, selectedActions, move);
  };

  const handleSkillClick = (pIdx: number, move: Move) => {
    if (!canUseMove(move, pIdx)) return;
    if (move.targetType === 'self' || move.targetType === 'all-enemies') {
      const targetIndex = move.targetType === 'self' ? pIdx : 0;
      setSelectedActions(prev => [...prev, { pokemonIndex: pIdx, move, targetIndex }]);
      addLog(`${playerTeam[pIdx].name} will use ${move.name}!`, 'info');
    } else {
      setSelectingPokemon(pIdx);
      setSelectingMove(move);
      setPhase('targeting');
    }
  };

  const handleTargetSelect = (tIdx: number) => {
    if (selectingPokemon === null || !selectingMove) return;
    setSelectedActions(prev => [...prev, { pokemonIndex: selectingPokemon, move: selectingMove, targetIndex: tIdx }]);
    addLog(`${playerTeam[selectingPokemon].name} targets ${opponentTeam[tIdx].name} with ${selectingMove.name}!`, 'info');
    setSelectingPokemon(null);
    setSelectingMove(null);
    setPhase('player1-turn');
  };

  const cancelTarget = () => {
    setSelectingPokemon(null);
    setSelectingMove(null);
    if (usingItem) { setUsingItem(null); }
    setPhase('player1-turn');
  };

  const removeAction = (pIdx: number) => {
    setSelectedActions(prev => prev.filter(a => a.pokemonIndex !== pIdx));
  };

  // ==================== ITEMS ====================
  const useItem = (item: BattleItem) => {
    if (item.uses <= 0) return;
    
    // Instant effects (no target needed)
    if (item.id === 'energy-boost') {
      setEnergy(prev => ({ ...prev, colorless: prev.colorless + 1 }));
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, uses: i.uses - 1 } : i));
      addLog(`Used ${item.name}! +1 Colorless energy!`, 'heal');
      setShowItems(false);
      return;
    }
    
    // Items that target a Pokemon
    setUsingItem(item);
    setShowItems(false);
    setPhase('item-target');
  };

  const applyItemToTarget = (pIdx: number) => {
    if (!usingItem) return;
    const poke = playerTeam[pIdx];
    
    // Revive can target fainted Pokemon
    if (usingItem.id === 'revive') {
      if (poke.hp > 0) {
        addLog(`${poke.name} is not fainted!`, 'info');
        setUsingItem(null);
        setPhase('player1-turn');
        return;
      }
      const reviveHp = Math.floor(poke.maxHp * 0.5);
      setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: reviveHp } : p));
      addLog(`Used Revive on ${poke.name}! Restored to ${reviveHp} HP!`, 'heal');
      setItems(prev => prev.map(i => i.id === usingItem.id ? { ...i, uses: i.uses - 1 } : i));
      setUsingItem(null);
      setPhase('player1-turn');
      return;
    }
    
    // Other items require alive Pokemon
    if (!poke || poke.hp <= 0) return;

    switch (usingItem.id) {
      case 'potion': {
        const heal = Math.min(30, poke.maxHp - poke.hp);
        if (heal > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.hp + heal } : p));
          addLog(`Used Potion on ${poke.name}! Healed ${heal} HP!`, 'heal');
        }
        break;
      }
      case 'super-potion': {
        const heal = Math.min(60, poke.maxHp - poke.hp);
        if (heal > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.hp + heal } : p));
          addLog(`Used Super Potion on ${poke.name}! Healed ${heal} HP!`, 'heal');
        }
        break;
      }
      case 'hyper-potion': {
        const heal = Math.min(120, poke.maxHp - poke.hp);
        if (heal > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.hp + heal } : p));
          addLog(`Used Hyper Potion on ${poke.name}! Healed ${heal} HP!`, 'heal');
        }
        break;
      }
      case 'full-heal': {
        if (poke.statusEffects.length > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, statusEffects: [] } : p));
          addLog(`Used Full Heal on ${poke.name}! Status effects cleared!`, 'heal');
        } else {
          addLog(`${poke.name} has no status effects!`, 'info');
          setUsingItem(null);
          setPhase('player1-turn');
          return; // Don't consume item
        }
        break;
      }
      case 'x-attack': {
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
          ...p,
          statusEffects: [...p.statusEffects, { type: 'strengthen', duration: 3, source: 'X Attack', value: 30 }]
        } : p));
        addLog(`Used X Attack on ${poke.name}! Attack boosted!`, 'effect');
        break;
      }
      case 'x-defense': {
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
          ...p,
          statusEffects: [...p.statusEffects, { type: 'reduce-damage', duration: 3, source: 'X Defense', value: 20 }]
        } : p));
        addLog(`Used X Defense on ${poke.name}! Defense boosted!`, 'effect');
        break;
      }
    }

    setItems(prev => prev.map(i => i.id === usingItem.id ? { ...i, uses: i.uses - 1 } : i));
    setUsingItem(null);
    setPhase('player1-turn');
  };

  // ==================== EVOLUTION ====================
  const canEvolvePokemon = (pIdx: number): boolean => {
    const poke = playerTeam[pIdx];
    if (!poke || poke.hp <= 0 || !poke.canEvolve || !poke.evolvesTo || !poke.evolutionEnergyCost) return false;
    // Check if player has enough energy
    let temp = { ...energy };
    for (const a of selectedActions) {
      temp = spendEnergyForMove(temp, a.move);
    }
    for (const cost of poke.evolutionEnergyCost) {
      if (cost.type === 'colorless') {
        if (getTotalEnergy(temp) < cost.amount) return false;
      } else {
        if (temp[cost.type] + temp.colorless < cost.amount) return false;
      }
    }
    return true;
  };

  const evolvePokemon = async (pIdx: number) => {
    const poke = playerTeam[pIdx];
    if (!canEvolvePokemon(pIdx) || !poke.evolvesTo || !poke.evolutionEnergyCost) return;

    // Spend energy
    let newEnergy = { ...energy };
    for (const cost of poke.evolutionEnergyCost) {
      if (cost.type === 'colorless') {
        let remaining = cost.amount;
        for (const t of ALL_ENERGY_TYPES) {
          const spend = Math.min(newEnergy[t], remaining);
          newEnergy[t] -= spend;
          remaining -= spend;
          if (remaining <= 0) break;
        }
      } else {
        const spend = Math.min(newEnergy[cost.type], cost.amount);
        newEnergy[cost.type] -= spend;
        const stillNeeded = cost.amount - spend;
        if (stillNeeded > 0) newEnergy.colorless = Math.max(0, newEnergy.colorless - stillNeeded);
      }
    }
    setEnergy(newEnergy);

    // Show evolution animation
    setEvolvingPokemon({
      idx: pIdx,
      from: poke.name,
      to: poke.evolvesTo.name,
      fromId: poke.id,
      toId: poke.evolvesTo.id,
    });

    await new Promise(r => setTimeout(r, 2500));

    // Apply evolution
    const evo = poke.evolvesTo;
    const kantoData = EVOLUTION_DATA[evo.id] || KANTO_POKEMON.find(k => k.id === evo.id);
    setPlayerTeam(prev => prev.map((p, i) => {
      if (i !== pIdx) return p;
      return {
        ...p,
        id: evo.id,
        name: evo.name,
        hp: Math.min(p.hp + evo.hpBonus, (kantoData?.hp || p.maxHp + evo.hpBonus)),
        maxHp: kantoData?.hp || p.maxHp + evo.hpBonus,
        attack: p.attack + evo.statBonus,
        defense: p.defense + evo.statBonus,
        spAtk: p.spAtk + evo.statBonus,
        spDef: p.spDef + evo.statBonus,
        speed: p.speed + Math.floor(evo.statBonus / 2),
        sprite: getSpriteById(evo.id),
        types: kantoData?.types || p.types,
        canEvolve: kantoData?.canEvolve || false,
        evolvesTo: kantoData?.evolvesTo,
        evolutionEnergyCost: kantoData?.evolutionEnergyCost,
        moves: getDefaultMoves(kantoData?.types[0] || p.types[0]),
      };
    }));

    addLog(`${poke.name} evolved into ${evo.name}!`, 'effect');
    setEvolvingPokemon(null);
  };

  // ==================== BATTLE XP ====================
  const getXPForLevel = (level: number): number => Math.floor(100 * Math.pow(1.5, level - 1));

  const handleBattleVictory = useCallback(() => {
    const baseXP = 50;
    const xpGained = baseXP + opponentLevel * 5 + Math.floor(Math.random() * 20);
    const newStats = { wins: battleStats.wins + 1, losses: battleStats.losses, totalXP: battleStats.totalXP + xpGained };
    setBattleStats(newStats);
    localStorage.setItem('battleStats', JSON.stringify(newStats));

    let newXP = playerXP + xpGained;
    let newLevel = playerLevel;
    while (newXP >= getXPForLevel(newLevel)) {
      newXP -= getXPForLevel(newLevel);
      newLevel++;
    }
    setPlayerXP(newXP);
    setPlayerLevel(newLevel);
    setPlayerRank(getRankByLevel(newLevel));
    localStorage.setItem('playerData', JSON.stringify({ username: playerName, level: newLevel, xp: newXP, lastUpdated: Date.now() }));

    addLog(`Victory! You earned ${xpGained} XP!`, 'heal');
    if (newLevel > playerLevel) addLog(`Level Up! Now level ${newLevel}!`, 'heal');
    return xpGained;
  }, [battleStats, playerXP, playerLevel, playerName, opponentLevel, addLog]);

  const handleBattleDefeat = useCallback(() => {
    const newStats = { wins: battleStats.wins, losses: battleStats.losses + 1, totalXP: battleStats.totalXP };
    setBattleStats(newStats);
    localStorage.setItem('battleStats', JSON.stringify(newStats));
    addLog('Defeat! Try again!', 'damage');
  }, [battleStats, addLog]);

  // ==================== EXECUTE ACTION ====================
  const executeAction = async (action: SelectedAction, isPlayer: boolean) => {
    const atkTeam = isPlayer ? playerTeam : opponentTeam;
    const defTeam = isPlayer ? opponentTeam : playerTeam;
    const setDefTeam = isPlayer ? setOpponentTeam : setPlayerTeam;
    const setAtkTeam = isPlayer ? setPlayerTeam : setOpponentTeam;
    const atk = atkTeam[action.pokemonIndex];
    const move = action.move;
    if (!atk || atk.hp <= 0) return;

    // Check status blocking
    if (!canAct(atk)) {
      const blockStatus = atk.statusEffects.find(e => ['stun', 'freeze', 'sleep', 'paralyze'].includes(e.type));
      if (blockStatus) {
        addLog(`${atk.name} can't move due to ${blockStatus.type}!`, 'status');
        return;
      }
    }

    // Accuracy check
    let accuracy = move.accuracy;
    // Sabrina passive: +10% accuracy for psychic moves
    if (isPlayer && playerTrainer?.name === 'Sabrina' && move.type === 'psychic') {
      accuracy = Math.min(100, accuracy + 10);
    }
    if (Math.random() * 100 > accuracy) {
      addLog(`${atk.name}'s ${move.name} missed!`, 'info');
      return;
    }

    // Self-targeting moves (heals)
    if (move.targetType === 'self') {
      // Check if can be healed
      const cannotHeal = atk.statusEffects.some(e => e.type === 'cannot-be-healed');
      if (cannotHeal) {
        addLog(`${atk.name} cannot be healed!`, 'status');
      } else {
        // Parse heal from description
        const healMatch = move.description.match(/(\d+)\s*HP/i);
        const healAmount = healMatch ? parseInt(healMatch[1]) : 50;
        const newHp = Math.min(atk.maxHp, atk.hp + healAmount);
        const healed = newHp - atk.hp;
        setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? { ...p, hp: newHp } : p));
        if (healed > 0) addLog(`${atk.name} used ${move.name}! Healed ${healed} HP!`, 'heal');
        else addLog(`${atk.name} used ${move.name}!`, 'effect');
      }
    } else if (move.power > 0) {
      // Damage dealing
      const targets = move.targetType === 'all-enemies'
        ? defTeam.map((_, i) => i).filter(i => defTeam[i].hp > 0)
        : [action.targetIndex];

      for (const tIdx of targets) {
        const def = defTeam[tIdx];
        if (!def || def.hp <= 0) continue;

        // Use the damage calculator
        const damageResult = calculateArenaDamage(
          move.power,
          toGlobalType(move.type),
          toGlobalTypes(atk.types),
          toGlobalTypes(def.types),
          {}
        );

        if (damageResult.typeMultiplier === 0) {
          addLog(`${atk.name} used ${move.name}! It doesn't affect ${def.name}...`, 'info');
          continue;
        }

        const defenseRatio = Math.max(0.5, Math.min(2, atk.spAtk / def.spDef));
        let finalDamage = Math.floor(damageResult.damage * defenseRatio);

        // Apply attacker's status effects (strengthen/weaken)
        const strengthenEffect = atk.statusEffects.find(e => e.type === 'strengthen');
        if (strengthenEffect) {
          const boost = strengthenEffect.value || 30;
          finalDamage = Math.floor(finalDamage * (1 + boost / 100));
          addLog(`${atk.name}'s attack is boosted!`, 'effect');
        }
        const weakenEffect = atk.statusEffects.find(e => e.type === 'weaken');
        if (weakenEffect) {
          const reduction = weakenEffect.value || 30;
          finalDamage = Math.floor(finalDamage * (1 - reduction / 100));
          addLog(`${atk.name}'s attack is weakened!`, 'status');
        }

        // Apply defender's status effects (reduce-damage/increase-damage)
        const reduceDmgEffect = def.statusEffects.find(e => e.type === 'reduce-damage');
        if (reduceDmgEffect) {
          const reduction = reduceDmgEffect.value || 20;
          finalDamage = Math.max(1, finalDamage - reduction);
          addLog(`${def.name}'s defense reduces damage!`, 'effect');
        }
        const increaseDmgEffect = def.statusEffects.find(e => e.type === 'increase-damage');
        if (increaseDmgEffect) {
          const increase = increaseDmgEffect.value || 20;
          finalDamage = finalDamage + increase;
          addLog(`${def.name} takes extra damage!`, 'damage');
        }

        // Trainer passives affecting damage
        if (!isPlayer && playerTrainer?.name === 'Giovanni') {
          finalDamage = Math.floor(finalDamage * 0.9); // 10% reduction
        }
        if (!isPlayer && playerTrainer?.name === 'Brock') {
          const defPoke = playerTeam[tIdx];
          if (defPoke && (defPoke.types.includes('rock') || defPoke.types.includes('ground'))) {
            finalDamage = Math.max(1, finalDamage - 15);
          }
        }

        // Hex bonus damage if target has status
        if (move.name === 'Hex' && def.statusEffects.length > 0) {
          finalDamage = Math.floor(finalDamage * 2);
        }

        const newHp = Math.max(0, def.hp - finalDamage);
        setDefTeam(prev => prev.map((p, i) => i === tIdx ? { ...p, hp: newHp } : p));

        let logMsg = `${atk.name}'s ${move.name} dealt ${finalDamage} damage to ${def.name}!`;
        if (damageResult.isCrit) logMsg += ' Critical hit!';
        if (damageResult.effectivenessText) logMsg += ` ${damageResult.effectivenessText}`;
        addLog(logMsg, damageResult.isCrit ? 'critical' : 'damage');

        if (newHp <= 0) addLog(`${def.name} fainted!`, 'damage');

        // Apply status effect
        if (move.statusEffect && newHp > 0) {
          let chance = move.statusEffect.chance;
          // Blaine: +20% burn chance for fire moves
          if (isPlayer && playerTrainer?.name === 'Blaine' && move.type === 'fire' && move.statusEffect.type === 'burn') {
            chance += 20;
          }

          if (Math.random() * 100 < chance) {
            const alreadyHas = def.statusEffects.some(e => e.type === move.statusEffect!.type);
            if (!alreadyHas) {
              let duration = move.statusEffect.duration;
              // Koga: poison lasts 1 extra turn
              if (isPlayer && playerTrainer?.name === 'Koga' && move.statusEffect.type === 'poison') {
                duration += 1;
              }
              setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                ...p,
                statusEffects: [...p.statusEffects, { type: move.statusEffect!.type, duration, source: atk.name }],
              } : p));
              const statusText: Record<StatusType, string> = {
                'burn': 'burned', 'poison': 'poisoned', 'paralyze': 'paralyzed',
                'freeze': 'frozen', 'sleep': 'put to sleep', 'confuse': 'confused',
                'stun': 'stunned', 'silence': 'silenced', 'weaken': 'weakened',
                'strengthen': 'strengthened', 'invulnerable': 'protected', 'taunt': 'taunted',
                'reflect': 'reflecting', 'counter': 'countering', 'reduce-damage': 'shielded',
                'increase-damage': 'empowered', 'drain-hp': 'draining', 'heal-over-time': 'regenerating',
                'cannot-be-healed': 'cursed', 'cooldown-increase': 'slowed', 'cooldown-reduce': 'hastened',
                'remove-energy': 'energy drained', 'steal-energy': 'energy stolen',
              };
              const statusMsg = statusText[move.statusEffect.type] || 'affected';
              addLog(`${def.name} was ${statusMsg}!`, 'status');
            }
          }
        }

        // Draining Kiss: heal user
        if (move.name === 'Draining Kiss') {
          const healAmt = 15;
          setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ?
            { ...p, hp: Math.min(p.maxHp, p.hp + healAmt) } : p));
          addLog(`${atk.name} drained ${healAmt} HP!`, 'heal');
        }
      }
    } else {
      // Status-only moves (no damage)
      if (move.statusEffect) {
        const tIdx = action.targetIndex;
        const targetType = move.targetType as 'enemy' | 'all-enemies' | 'self';
        
        // Check if targeting self or enemy
        if (targetType === 'self') {
          // Apply to self
          let chance = move.statusEffect.chance;
          if (Math.random() * 100 < chance) {
            const alreadyHas = atk.statusEffects.some(e => e.type === move.statusEffect!.type);
            if (!alreadyHas) {
              setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? {
                ...p,
                statusEffects: [...p.statusEffects, { type: move.statusEffect!.type, duration: move.statusEffect!.duration, source: atk.name, value: move.statusEffect!.value }],
              } : p));
              addLog(`${atk.name} used ${move.name}!`, 'effect');
            }
          }
        } else {
          // Apply to enemy
          const def = defTeam[tIdx];
          if (def && def.hp > 0) {
            let chance = move.statusEffect.chance;
            if (Math.random() * 100 < chance) {
              const alreadyHas = def.statusEffects.some(e => e.type === move.statusEffect!.type);
              if (!alreadyHas) {
                setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                  ...p,
                  statusEffects: [...p.statusEffects, { type: move.statusEffect!.type, duration: move.statusEffect!.duration, source: atk.name, value: move.statusEffect!.value }],
                } : p));
                addLog(`${atk.name} used ${move.name}! ${def.name} was affected!`, 'status');
              }
            } else {
              addLog(`${atk.name}'s ${move.name} failed!`, 'info');
            }
          }
        }
      } else {
        addLog(`${atk.name} used ${move.name}!`, 'effect');
      }
    }

    // Set cooldown (affected by cooldown-increase/reduce)
    let cooldownToSet = move.cooldown;
    const cooldownIncEffect = atk.statusEffects.find(e => e.type === 'cooldown-increase');
    if (cooldownIncEffect) {
      cooldownToSet += (cooldownIncEffect.value || 1);
    }
    const cooldownRedEffect = atk.statusEffects.find(e => e.type === 'cooldown-reduce');
    if (cooldownRedEffect) {
      cooldownToSet = Math.max(0, cooldownToSet - (cooldownRedEffect.value || 1));
    }
    
    setAtkTeam(prev => prev.map((p, i) =>
      i === action.pokemonIndex ? { ...p, moves: p.moves.map(m => m.id === move.id ? { ...m, currentCooldown: cooldownToSet } : m) } : p
    ));
  };

  // ==================== AI TURN ====================
  const executeAITurn = async () => {
    const aliveOpp = opponentTeam.filter(p => p.hp > 0);
    const alivePly = playerTeam.filter(p => p.hp > 0);
    if (!aliveOpp.length || !alivePly.length) return;

    for (let i = 0; i < opponentTeam.length; i++) {
      const poke = opponentTeam[i];
      if (poke.hp <= 0) continue;
      if (!canAct(poke)) {
        addLog(`${poke.name} can't move!`, 'status');
        continue;
      }

      const availableMoves = poke.moves.filter(m => m.currentCooldown === 0);
      if (!availableMoves.length) continue;
      const targets = playerTeam.map((p, idx) => ({ p, idx })).filter(x => x.p.hp > 0);
      if (!targets.length) continue;

      // Smart AI
      let bestMove = availableMoves[0];
      let bestTarget = targets[0].idx;
      let bestScore = -Infinity;

      for (const move of availableMoves) {
        if (move.targetType === 'self') {
          if (poke.hp < poke.maxHp * 0.5) {
            const healScore = (poke.maxHp - poke.hp) * 2;
            if (healScore > bestScore) { bestScore = healScore; bestMove = move; bestTarget = i; }
          }
          continue;
        }
        for (const target of targets) {
          const typeMult = getTypeEff(move.type, target.p.types);
          if (typeMult === 0) continue;
          const stab = poke.types.includes(move.type) ? STAB_MULTIPLIER : 1;
          const baseDmg = move.power * typeMult * stab;
          const finishBonus = target.p.hp <= baseDmg * 0.5 ? 50 : 0;
          const effectBonus = typeMult >= 2 ? 30 : typeMult < 1 ? -20 : 0;
          const score = baseDmg + finishBonus + effectBonus;
          if (score > bestScore) { bestScore = score; bestMove = move; bestTarget = target.idx; }
        }
      }

      await executeAction({ pokemonIndex: i, move: bestMove, targetIndex: bestTarget }, false);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  // ==================== TURN MANAGEMENT (TURN-BASED) ====================
  const handleEndTurn = async () => {
    if (phase !== 'player1-turn' && phase !== 'player2-turn') return;
    
    const isPlayer1 = phase === 'player1-turn';
    setPhase('executing');
    setTimer(100);

    // Execute current player's actions
    let currentEnergy = { ...energy };
    for (const action of selectedActions) {
      currentEnergy = spendEnergyForMove(currentEnergy, action.move);
    }
    setEnergy(currentEnergy);

    addLog(`--- ${isPlayer1 ? 'Player' : 'Opponent'} executing actions ---`, 'info');
    
    // Execute actions
    for (const action of selectedActions) {
      await executeAction(action, isPlayer1);
      await new Promise(r => setTimeout(r, 700));
    }

    // Check victory after player actions
    if (opponentTeam.filter(p => p.hp > 0).length === 0) {
      handleBattleVictory();
      setPhase('victory');
      return;
    }

    // If player 1 just finished, it's player 2's turn (AI)
    if (isPlayer1) {
      setPhase('player2-turn');
      setSelectedActions([]);
      addLog('--- Opponent\'s turn ---', 'info');
      await new Promise(r => setTimeout(r, 800));
      
      // AI makes decisions
      await executeAITurn();
      
      // Check defeat after AI
      if (playerTeam.filter(p => p.hp > 0).length === 0) {
        handleBattleDefeat();
        setPhase('defeat');
        return;
      }
      
      // Start new turn (back to player 1)
      startNewTurn();
    }
  };

  const startNewTurn = () => {
    const newTurn = turn + 1;

    // Decrease cooldowns
    setPlayerTeam(prev => prev.map(p => ({ ...p, moves: p.moves.map(m => ({ ...m, currentCooldown: Math.max(0, m.currentCooldown - 1) })) })));
    setOpponentTeam(prev => prev.map(p => ({ ...p, moves: p.moves.map(m => ({ ...m, currentCooldown: Math.max(0, m.currentCooldown - 1) })) })));

    // Process player status effects at start of turn
    setPlayerTeam(prev => processStatusEffects(prev, addLog));
    setOpponentTeam(prev => processStatusEffects(prev, addLog));

    // Apply trainer passive
    if (playerTrainer) {
      playerTrainer.applyPassive({
        playerTeam,
        opponentTeam,
        energy,
        setEnergy,
        turn: newTurn,
        addLog,
      });
    }

    // ACCUMULATE energy (CRITICAL: don't reset, ADD to existing!)
    const newEnergy = generateTurnEnergy(playerTeam, selectedEnergyTypes, newTurn);
    setEnergy(prev => addEnergy(prev, newEnergy));

    const aliveCount = playerTeam.filter(p => p.hp > 0).length;
    const energyGained = newTurn === 1 ? 1 : aliveCount;
    addLog(`Turn ${newTurn}! Gained ${energyGained} energy!`, 'info');

    setSelectedActions([]);
    setTurn(newTurn);
    setPhase('player1-turn'); // Back to player 1
  };

  const restart = () => window.location.reload();

  // ==================== RENDER: LOADING ====================
  if (phase === 'loading' || !playerTeam.length) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="pokeball-loader" />
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER: ENERGY SELECTION ====================
  if (phase === 'energy-select') {
    return (
      <div className="energy-select-screen">
        <div>
          <div className="energy-select-title">SELECT YOUR ENERGY TYPES</div>
          <div className="energy-select-subtitle">Choose 1-3 energy types for your deck (Tip: Use 1 type for consistency)</div>
        </div>

        <div className="energy-select-team">
          {playerTeam.map(p => (
            <div key={p.id} className="energy-select-pokemon">
              <Image src={p.sprite} alt={p.name} width={64} height={64} unoptimized />
              <span>{p.name}</span>
              <span style={{ fontSize: 10, opacity: 0.5 }}>{p.types.map(t => TYPE_TO_ENERGY[t]).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span>
            </div>
          ))}
        </div>

        <div className="energy-select-grid">
          {ALL_SELECTABLE_ENERGY_TYPES.map(type => (
            <div
              key={type}
              className={`energy-select-card ${type} ${selectedEnergyTypes.includes(type) ? 'selected' : ''} ${selectedEnergyTypes.length >= 4 && !selectedEnergyTypes.includes(type) ? 'disabled' : ''}`}
              onClick={() => toggleEnergyType(type)}
            >
              {selectedEnergyTypes.includes(type) && <span className="checkmark">✓</span>}
              <div className={`energy-icon-big ${type}`}>{ENERGY_ICONS[type]}</div>
              <span className="energy-label">{ENERGY_NAMES[type]}</span>
            </div>
          ))}
        </div>

        <button
          className="energy-confirm-btn"
          onClick={confirmEnergySelection}
          disabled={selectedEnergyTypes.length < 1 || selectedEnergyTypes.length > 3}
        >
          {selectedEnergyTypes.length === 0
            ? 'SELECT 1-3 ENERGY TYPES'
            : selectedEnergyTypes.length > 3
            ? 'TOO MANY! (Max 3)'
            : 'START BATTLE'}
        </button>
      </div>
    );
  }

  // ==================== RENDER: BATTLE ====================
  return (
    <div className="battle-container">
      <div className="battle-background" style={{ backgroundImage: `url(${battleBackground})` }} />
      <div className="battle-content">

        {/* TOP BAR */}
        <div className="top-bar">
          <div className="player-info">
            <div className="player-avatar">
              <div className="rank-badge-mini" style={{ background: playerRank.gradient }} title={playerRank.name}>
                <span>Lv{playerLevel}</span>
              </div>
            </div>
            <div className="player-details">
              <div className="player-name">{playerName}</div>
              <div className="player-rank" style={{ color: playerRank.color }}>{playerRank.name}</div>
              {playerTrainer && <div className="trainer-passive" title={playerTrainer.passiveDesc}>🎖️ {playerTrainer.name}: {playerTrainer.passive}</div>}
            </div>
          </div>

          <div className="center-controls">
            <div className="turn-info">TURN {turn}</div>
            <button className="ready-btn" onClick={handleEndTurn} disabled={phase !== 'player1-turn'}>
              {phase === 'player1-turn' ? 'END TURN' : phase === 'executing' ? 'EXECUTING...' : phase === 'player2-turn' ? 'OPPONENT TURN' : 'WAIT...'}
            </button>
            <div className="timer-container">
              <div className="timer-bar">
                <div className="timer-fill" style={{ width: `${timer}%` }} />
              </div>
            </div>
            <div className="energy-pool">
              {[...selectedEnergyTypes, 'random' as EnergyType].map(type => (
                energy[type] > 0 ? (
                  <div key={type} className="energy-item">
                    <div className={`energy-orb ${type}`} title={ENERGY_NAMES[type]}>{ENERGY_ICONS[type]}</div>
                    <span className="energy-count">×{energy[type]}</span>
                  </div>
                ) : null
              ))}
              <div className="energy-total">
                <span className="total-label">T</span>
                <span className="energy-count">×{getTotalEnergy(energy)}</span>
              </div>
            </div>
          </div>

          <div className="player-info right">
            <div className="player-details" style={{ textAlign: 'right' }}>
              <div className="player-name" style={{ color: opponentRank.color }}>{opponentName}</div>
              <div className="player-rank" style={{ color: opponentRank.color }}>{opponentRank.name}</div>
            </div>
            <div className="player-avatar">
              <div className="rank-badge-mini" style={{ background: opponentRank.gradient }} title={opponentRank.name}>
                <span>Lv{opponentLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BATTLE AREA */}
        <div className="battle-area">
          {/* Player Characters */}
          <div className="character-column">
            {playerTeam.map((poke, idx) => {
              const hasAction = selectedActions.some(a => a.pokemonIndex === idx);
              const selectedMove = selectedActions.find(a => a.pokemonIndex === idx)?.move;
              const hasBurn = poke.statusEffects.some(e => e.type === 'burn');
              const hasPoison = poke.statusEffects.some(e => e.type === 'poison');
              const hasFrozen = poke.statusEffects.some(e => e.type === 'freeze');
              return (
                <div
                  key={`p-${poke.id}-${idx}`}
                  className={`character-card player ${poke.hp <= 0 ? 'fainted' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''} ${phase === 'item-target' && poke.hp > 0 ? 'targetable' : ''}`}
                  onClick={() => phase === 'item-target' && poke.hp > 0 && applyItemToTarget(idx)}
                >
                  <div className="portrait-container">
                    {poke.statusEffects.length > 0 && (
                      <div className="status-icons">
                        {poke.statusEffects.map((se, si) => (
                          <div key={si} className={`status-badge ${se.type}`} title={`${se.type} (${se.duration}t)`}>
                            {STATUS_ICONS[se.type]}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pokemon-sprite flipped">
                      <Image src={poke.sprite} alt={poke.name} width={68} height={68} unoptimized />
                    </div>
                    <div className="pokemon-name-tag">{poke.name}</div>
                    <div className="hp-text-overlay">{poke.hp}/{poke.maxHp}</div>
                    <div className="hp-bar-overlay">
                      <div className="hp-bar-inner">
                        <div className={`hp-fill ${getHpClass(poke.hp, poke.maxHp)}`} style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="skills-panel">
                    {poke.moves.slice(0, 4).map(move => {
                      const colors = TYPE_COLORS[move.type] || TYPE_COLORS.normal;
                      const abbrev = MOVE_ABBREV[move.name] || move.name.substring(0, 3).toUpperCase();
                      return (
                        <div
                          key={move.id}
                          className={`skill-slot ${!canUseMove(move, idx) ? 'disabled' : ''} ${hasAction && selectedMove?.id === move.id ? 'selected' : ''} ${move.currentCooldown > 0 ? 'on-cooldown' : ''}`}
                          data-cd={move.currentCooldown > 0 ? move.currentCooldown : undefined}
                          style={{ background: colors.bg, borderColor: colors.border }}
                          onClick={(e) => { e.stopPropagation(); poke.hp > 0 && (hasAction ? removeAction(idx) : handleSkillClick(idx, move)); }}
                          onMouseEnter={() => setHoveredSkill({ move, pokemonName: poke.name })}
                          onMouseLeave={() => setHoveredSkill(null)}
                        >
                          <span className="skill-abbrev" style={{ color: colors.text }}>{abbrev}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center */}
          <div className="center-area">
            <div className="vs-display">VS</div>
            <div className="action-queue">
              {[0, 1, 2].map(i => (
                <div key={i} className={`queue-slot ${selectedActions[i] ? 'filled' : ''}`}>
                  {selectedActions[i] ? '✓' : '?'}
                </div>
              ))}
            </div>
            {hoveredSkill && (
              <div className="skill-info-panel">
                <div className="skill-info-header">
                  <span className="skill-info-name">{hoveredSkill.move.name}</span>
                  <div className="skill-info-cost">
                    {hoveredSkill.move.cost.map((c, i) => (
                      <div key={i} className={`energy-orb ${c.type}`} title={`${c.amount}× ${c.type}`}>
                        {c.amount > 1 ? c.amount : ENERGY_ICONS[c.type]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="skill-info-desc">{hoveredSkill.move.description}</div>
                <div className="skill-info-footer">
                  <span>PWR: {hoveredSkill.move.power || '-'}</span>
                  <span>ACC: {hoveredSkill.move.accuracy}%</span>
                  <span>CD: {hoveredSkill.move.cooldown}</span>
                </div>
                {hoveredSkill.move.statusEffect && (
                  <div className="skill-info-status">
                    {STATUS_ICONS[hoveredSkill.move.statusEffect.type]} {hoveredSkill.move.statusEffect.chance}% {hoveredSkill.move.statusEffect.type} ({hoveredSkill.move.statusEffect.duration}t)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enemy Characters */}
          <div className="character-column">
            {opponentTeam.map((poke, idx) => {
              const hasBurn = poke.statusEffects.some(e => e.type === 'burn');
              const hasPoison = poke.statusEffects.some(e => e.type === 'poison');
              const hasFrozen = poke.statusEffects.some(e => e.type === 'freeze');
              return (
                <div
                  key={`e-${poke.id}-${idx}`}
                  className={`character-card enemy ${poke.hp <= 0 ? 'fainted' : ''} ${phase === 'targeting' && poke.hp > 0 ? 'targetable' : ''} ${hasBurn ? 'burning' : ''} ${hasPoison ? 'poisoned' : ''} ${hasFrozen ? 'frozen' : ''}`}
                  onClick={() => phase === 'targeting' && poke.hp > 0 && handleTargetSelect(idx)}
                >
                  <div className="skills-panel">
                    {poke.moves.slice(0, 4).map(move => {
                      const colors = TYPE_COLORS[move.type] || TYPE_COLORS.normal;
                      const abbrev = MOVE_ABBREV[move.name] || move.name.substring(0, 3).toUpperCase();
                      return (
                        <div key={move.id} className="skill-slot disabled" style={{ background: colors.bg, borderColor: colors.border }}>
                          <span className="skill-abbrev" style={{ color: colors.text }}>{abbrev}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="portrait-container">
                    {poke.statusEffects.length > 0 && (
                      <div className="status-icons">
                        {poke.statusEffects.map((se, si) => (
                          <div key={si} className={`status-badge ${se.type}`} title={`${se.type} (${se.duration}t)`}>
                            {STATUS_ICONS[se.type]}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pokemon-sprite">
                      <Image src={poke.sprite} alt={poke.name} width={68} height={68} unoptimized />
                    </div>
                    <div className="pokemon-name-tag">{poke.name}</div>
                    <div className="hp-text-overlay">{poke.hp}/{poke.maxHp}</div>
                    <div className="hp-bar-overlay">
                      <div className="hp-bar-inner">
                        <div className={`hp-fill ${getHpClass(poke.hp, poke.maxHp)}`} style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="bottom-bar">
          <div className="bottom-left">
            <div className="action-buttons">
              <button className="action-btn danger" onClick={() => setPhase('defeat')}>SURRENDER</button>
              <button className="action-btn item" onClick={() => setShowItems(!showItems)} disabled={phase !== 'player1-turn'}>
                ITEMS ({items.reduce((s, i) => s + i.uses, 0)})
              </button>
              {playerTeam.some((_, i) => canEvolvePokemon(i)) && (
                <button
                  className="action-btn evolve"
                  onClick={() => {
                    const idx = playerTeam.findIndex((_, i) => canEvolvePokemon(i));
                    if (idx >= 0) evolvePokemon(idx);
                  }}
                  disabled={phase !== 'player1-turn'}
                >
                  EVOLVE ✨
                </button>
              )}
            </div>
          </div>
          <div className="battle-log">
            {battleLog.map(entry => (
              <div key={entry.id} className={`log-entry ${entry.type}`}>{entry.text}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Items Panel */}
      {showItems && (
        <div className="items-panel">
          <div className="items-panel-title">ITEMS</div>
          <button className="close-panel-btn" onClick={() => setShowItems(false)}>✕</button>
          {items.map(item => (
            <div
              key={item.id}
              className={`item-row ${item.uses <= 0 ? 'disabled' : ''}`}
              onClick={() => item.uses > 0 && useItem(item)}
            >
              <span className="item-icon">{item.icon}</span>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-desc">{item.description}</div>
              </div>
              <span className="item-uses">{item.uses}/{item.maxUses}</span>
            </div>
          ))}
        </div>
      )}

      {/* Targeting Indicator */}
      {phase === 'targeting' && selectingMove && (
        <div className="targeting-indicator">
          <div className="targeting-text">
            🎯 Click an enemy to target with <strong>{selectingMove.name}</strong>
            <button className="cancel-target-btn" onClick={cancelTarget}>✕ Cancel</button>
          </div>
        </div>
      )}

      {/* Item Target Indicator */}
      {phase === 'item-target' && usingItem && (
        <div className="item-target-overlay">
          <div className="item-target-text">
            💊 Click a Pokemon to use <strong>{usingItem.name}</strong>
            <button className="cancel-target-btn" onClick={cancelTarget}>✕ Cancel</button>
          </div>
        </div>
      )}

      {/* Evolution Overlay */}
      {evolvingPokemon && (
        <div className="evolution-overlay">
          <div className="evolution-text">What? {evolvingPokemon.from} is evolving!</div>
          <div className="evolution-sprites">
            <div className="evolution-sprite">
              <Image src={getSpriteById(evolvingPokemon.fromId)} alt={evolvingPokemon.from} width={96} height={96} unoptimized />
            </div>
            <div className="evolution-arrow">→</div>
            <div className="evolution-sprite">
              <Image src={getSpriteById(evolvingPokemon.toId)} alt={evolvingPokemon.to} width={96} height={96} unoptimized />
            </div>
          </div>
          <div className="evolution-text">{evolvingPokemon.from} evolved into {evolvingPokemon.to}!</div>
        </div>
      )}

      {/* Victory */}
      {phase === 'victory' && (
        <div className="overlay">
          <div className="modal">
            <div className="result-content victory">
              <h1 className="result-title">VICTORY!</h1>
              <p className="result-message">{playerName} wins!</p>
              <p className="result-xp">+{battleStats.totalXP > 0 ? Math.floor(50 + opponentLevel * 5) : 0} XP</p>
              <button className="result-btn" onClick={restart}>PLAY AGAIN</button>
            </div>
          </div>
        </div>
      )}

      {/* Defeat */}
      {phase === 'defeat' && (
        <div className="overlay">
          <div className="modal">
            <div className="result-content defeat">
              <h1 className="result-title">DEFEAT</h1>
              <p className="result-message">{playerName} is out of usable POKéMON!</p>
              <button className="result-btn" onClick={restart}>TRY AGAIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
