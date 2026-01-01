import { Pokemon, EnergyCost, Move, PokemonType } from '@/types/game';

// Helper para criar custo de energia
const cost = (fire = 0, water = 0, grass = 0, electric = 0, colorless = 0): EnergyCost => ({
  fire, water, grass, electric, colorless
});

// Helper para criar move
const createMove = (
  slot: number,
  name: string,
  description: string,
  type: PokemonType,
  options: Partial<Move>
): Move => ({
  id: `${name.toLowerCase().replace(/\s+/g, '-')}-${slot}`,
  name,
  description,
  type,
  classes: options.classes || [],
  cost: options.cost || cost(0, 0, 0, 0, 1),
  cooldown: options.cooldown || 0,
  duration: options.duration || 0,
  damage: options.damage || 0,
  healing: options.healing || 0,
  effects: options.effects || [],
  target: options.target || 'OneEnemy',
  slot,
  require: options.require,
});

// Helper para move de proteção (slot 3 - equivalente ao invuln)
const protect = (name: string, pokemonName: string, classes: Move['classes']): Move => ({
  id: `${name.toLowerCase().replace(/\s+/g, '-')}-3`,
  name,
  description: `${pokemonName} protects itself and becomes invulnerable for 1 turn.`,
  type: 'Normal',
  classes,
  cost: cost(0, 0, 0, 0, 1),
  cooldown: 4,
  duration: 1,
  damage: 0,
  healing: 0,
  effects: [{ type: 'invulnerable', duration: 1 }],
  target: 'Self',
  slot: 3,
});

// ==================== STARTERS - GEN 1 ====================

export const pikachu: Pokemon = {
  id: 'pikachu',
  name: 'Pikachu',
  description: 'The iconic Electric Mouse Pokémon. When several of these Pokémon gather, their electricity can cause lightning storms.',
  types: ['Electric'],
  generation: 'Gen1',
  category: 'Starter',
  hp: 100,
  traits: ['Kanto', 'Starter', 'ElectricType'],
  isStarter: true,
  unlockCost: 0,
  moves: [
    createMove(0, 'Thunder Shock', 'Pikachu zaps the target with an electric bolt, dealing 20 damage.', 'Electric', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Thunderbolt', 'A powerful electric attack dealing 45 damage. Requires Agility active.', 'Electric', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 2),
      cooldown: 1,
      damage: 45,
      target: 'OneEnemy',
      require: 'Agility',
      effects: [
        { type: 'damage', value: 45 },
        { type: 'stun', duration: 1 },
      ],
    }),
    createMove(2, 'Agility', 'Pikachu relaxes and lightens its body to move faster, gaining 15 points of damage reduction for 4 turns.', 'Psychic', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 4,
      target: 'Self',
      effects: [{ type: 'reduce', value: 15, duration: 4 }],
    }),
    protect('Detect', 'Pikachu', ['Status']),
  ],
};

export const charizard: Pokemon = {
  id: 'charizard',
  name: 'Charizard',
  description: 'A powerful Fire/Flying type that breathes intense flames. When angry, the flame at the tip of its tail burns fiercely.',
  types: ['Fire', 'Flying'],
  generation: 'Gen1',
  category: 'Starter',
  hp: 100,
  traits: ['Kanto', 'Starter', 'FireType'],
  isStarter: true,
  unlockCost: 0,
  moves: [
    createMove(0, 'Flamethrower', 'Charizard scorches the target with a stream of fire, dealing 25 damage.', 'Fire', {
      classes: ['Special', 'Ranged'],
      cost: cost(1),
      damage: 25,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 25 }],
    }),
    createMove(1, 'Fire Blast', 'A devastating fire attack that deals 50 damage. Has a 10% chance to burn. Requires Dragon Dance.', 'Fire', {
      classes: ['Special', 'Ranged'],
      cost: cost(2, 0, 0, 0, 1),
      cooldown: 1,
      damage: 50,
      target: 'OneEnemy',
      require: 'Dragon Dance',
      effects: [
        { type: 'damage', value: 50 },
        { type: 'afflict', value: 10, duration: 3 },
      ],
    }),
    createMove(2, 'Dragon Dance', 'Charizard mystically boosts itself, gaining 20% damage boost for 3 turns.', 'Dragon', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'strengthen', value: 20, duration: 3 }],
    }),
    protect('Fly', 'Charizard', ['Physical']),
  ],
};

export const blastoise: Pokemon = {
  id: 'blastoise',
  name: 'Blastoise',
  description: 'A powerful Water type with cannons on its shell. It can shoot water bullets with enough accuracy to strike empty cans from 160 feet.',
  types: ['Water'],
  generation: 'Gen1',
  category: 'Starter',
  hp: 110,
  traits: ['Kanto', 'Starter', 'WaterType'],
  isStarter: true,
  unlockCost: 0,
  moves: [
    createMove(0, 'Water Gun', 'Blastoise sprays water at the target, dealing 20 damage.', 'Water', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Hydro Pump', 'Blastoise blasts the target with a huge volume of water, dealing 55 damage.', 'Water', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 2, 0, 0, 1),
      cooldown: 2,
      damage: 55,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 55 }],
    }),
    createMove(2, 'Iron Defense', 'Blastoise hardens its body, gaining 25 damage reduction for 3 turns.', 'Steel', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'reduce', value: 25, duration: 3 }],
    }),
    protect('Withdraw', 'Blastoise', ['Status']),
  ],
};

export const venusaur: Pokemon = {
  id: 'venusaur',
  name: 'Venusaur',
  description: 'A Grass/Poison type with a flower on its back. The flower releases a soothing scent that calms battling Pokémon.',
  types: ['Grass', 'Poison'],
  generation: 'Gen1',
  category: 'Starter',
  hp: 100,
  traits: ['Kanto', 'Starter', 'GrassType'],
  isStarter: true,
  unlockCost: 0,
  moves: [
    createMove(0, 'Razor Leaf', 'Venusaur cuts the enemy with razor-sharp leaves, dealing 20 damage.', 'Grass', {
      classes: ['Physical', 'Ranged'],
      cost: cost(0, 0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Solar Beam', 'Venusaur gathers light and fires a beam, dealing 60 damage. Requires Growth.', 'Grass', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 2, 0, 1),
      cooldown: 2,
      damage: 60,
      target: 'OneEnemy',
      require: 'Growth',
      effects: [{ type: 'damage', value: 60 }],
    }),
    createMove(2, 'Growth', 'Venusaur raises its special attack, gaining 25% damage boost for 3 turns.', 'Normal', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'strengthen', value: 25, duration: 3 }],
    }),
    protect('Synthesis', 'Venusaur', ['Status']),
  ],
};

// ==================== POPULAR POKEMON ====================

export const gengar: Pokemon = {
  id: 'gengar',
  name: 'Gengar',
  description: 'A mischievous Ghost/Poison type. It hides in shadows. It is said to steal the lives of those who feel its presence.',
  types: ['Ghost', 'Poison'],
  generation: 'Gen1',
  category: 'Common',
  hp: 90,
  traits: ['Kanto', 'GhostType'],
  isStarter: false,
  unlockCost: 500,
  moves: [
    createMove(0, 'Shadow Ball', 'Gengar hurls a shadowy blob at the target, dealing 25 damage and lowering their Special Defense.', 'Ghost', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 0, 2),
      damage: 25,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 25 },
        { type: 'weaken', value: 10, duration: 2 },
      ],
    }),
    createMove(1, 'Dream Eater', 'Gengar eats the dreams of a sleeping target, dealing 40 damage and healing for half.', 'Psychic', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 0, 2),
      cooldown: 1,
      damage: 40,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 40 },
        { type: 'heal', value: 20 },
      ],
    }),
    createMove(2, 'Hypnosis', 'Gengar puts the target to sleep, stunning them for 1 turn.', 'Psychic', {
      classes: ['Status', 'Ranged'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 2,
      target: 'OneEnemy',
      effects: [{ type: 'stun', duration: 1 }],
    }),
    protect('Shadow Sneak', 'Gengar', ['Physical']),
  ],
};

export const alakazam: Pokemon = {
  id: 'alakazam',
  name: 'Alakazam',
  description: 'A Psychic type with an IQ of 5000. Its brain can outperform a supercomputer.',
  types: ['Psychic'],
  generation: 'Gen1',
  category: 'Common',
  hp: 85,
  traits: ['Kanto', 'PsychicType'],
  isStarter: false,
  unlockCost: 500,
  moves: [
    createMove(0, 'Psybeam', 'Alakazam fires a peculiar ray, dealing 20 damage with a 10% chance to confuse.', 'Psychic', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Psychic', 'Alakazam attacks with a powerful telekinetic force, dealing 45 damage.', 'Psychic', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 0, 2),
      cooldown: 1,
      damage: 45,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 45 },
        { type: 'weaken', value: 15, duration: 1 },
      ],
    }),
    createMove(2, 'Calm Mind', 'Alakazam calms its mind, gaining Special Attack and Special Defense boost for 4 turns.', 'Psychic', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 4,
      target: 'Self',
      effects: [
        { type: 'strengthen', value: 20, duration: 4 },
        { type: 'reduce', value: 15, duration: 4 },
      ],
    }),
    protect('Teleport', 'Alakazam', ['Status']),
  ],
};

export const machamp: Pokemon = {
  id: 'machamp',
  name: 'Machamp',
  description: 'A Fighting type with four arms that can throw 1000 punches in two seconds.',
  types: ['Fighting'],
  generation: 'Gen1',
  category: 'Common',
  hp: 110,
  traits: ['Kanto', 'FightingType'],
  isStarter: false,
  unlockCost: 500,
  moves: [
    createMove(0, 'Karate Chop', 'Machamp chops the enemy with its hand, dealing 20 damage with high critical ratio.', 'Fighting', {
      classes: ['Physical', 'Contact'],
      cost: cost(0, 0, 0, 0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Cross Chop', 'Machamp delivers a double chop with its arms, dealing 45 damage.', 'Fighting', {
      classes: ['Physical', 'Contact'],
      cost: cost(0, 0, 0, 0, 2),
      cooldown: 1,
      damage: 45,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 45 }],
    }),
    createMove(2, 'Bulk Up', 'Machamp tenses its muscles, gaining 20% damage and 15 damage reduction for 3 turns.', 'Fighting', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [
        { type: 'strengthen', value: 20, duration: 3 },
        { type: 'reduce', value: 15, duration: 3 },
      ],
    }),
    protect('Detect', 'Machamp', ['Status']),
  ],
};

export const dragonite: Pokemon = {
  id: 'dragonite',
  name: 'Dragonite',
  description: 'A Dragon/Flying pseudo-legendary. It can circle the globe in just 16 hours.',
  types: ['Dragon', 'Flying'],
  generation: 'Gen1',
  category: 'PseudoLegendary',
  hp: 120,
  traits: ['Kanto', 'PseudoLegendary', 'DragonType'],
  isStarter: false,
  unlockCost: 2000,
  moves: [
    createMove(0, 'Dragon Claw', 'Dragonite slashes the enemy with huge claws, dealing 25 damage.', 'Dragon', {
      classes: ['Physical', 'Contact'],
      cost: cost(1, 0, 0, 0, 1),
      damage: 25,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 25 }],
    }),
    createMove(1, 'Outrage', 'Dragonite goes on a rampage, dealing 40 damage to all enemies for 2 turns.', 'Dragon', {
      classes: ['Physical', 'Contact'],
      cost: cost(2, 0, 0, 0, 1),
      cooldown: 2,
      duration: 2,
      damage: 40,
      target: 'AllEnemies',
      effects: [{ type: 'damage', value: 40, duration: 2 }],
    }),
    createMove(2, 'Dragon Dance', 'Dragonite mystically boosts Attack and Speed for 3 turns.', 'Dragon', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'strengthen', value: 25, duration: 3 }],
    }),
    protect('Extreme Speed', 'Dragonite', ['Physical', 'Priority']),
  ],
};

// ==================== LEGENDARY POKEMON ====================

export const mewtwo: Pokemon = {
  id: 'mewtwo',
  name: 'Mewtwo',
  description: "A legendary Psychic type created from Mew's DNA. It was engineered to be the ultimate Pokémon.",
  types: ['Psychic'],
  generation: 'Gen1',
  category: 'Legendary',
  hp: 130,
  traits: ['Kanto', 'Legendary', 'PsychicType'],
  isStarter: false,
  unlockCost: 5000,
  moves: [
    createMove(0, 'Psystrike', "Mewtwo creates a massive psychic blast, dealing 30 piercing damage based on target's Defense.", 'Psychic', {
      classes: ['Special', 'Ranged', 'Bypassing'],
      cost: cost(0, 0, 0, 0, 2),
      damage: 30,
      target: 'OneEnemy',
      effects: [{ type: 'pierce', value: 30 }],
    }),
    createMove(1, 'Psychic', 'Mewtwo attacks with overwhelming telekinetic force, dealing 50 damage.', 'Psychic', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 0, 3),
      cooldown: 1,
      damage: 50,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 50 },
        { type: 'weaken', value: 20, duration: 2 },
      ],
    }),
    createMove(2, 'Barrier', 'Mewtwo creates a psychic barrier, becoming invulnerable to Physical attacks for 2 turns.', 'Psychic', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 2,
      target: 'Self',
      effects: [{ type: 'invulnerable', duration: 2, classes: ['Physical'] }],
    }),
    protect('Recover', 'Mewtwo', ['Status']),
  ],
};

export const mew: Pokemon = {
  id: 'mew',
  name: 'Mew',
  description: 'A mythical Psychic type said to contain the genetic code of all Pokémon.',
  types: ['Psychic'],
  generation: 'Gen1',
  category: 'Mythical',
  hp: 100,
  traits: ['Kanto', 'Mythical', 'PsychicType'],
  isStarter: false,
  unlockCost: 5000,
  moves: [
    createMove(0, 'Psychic', 'Mew attacks with a powerful telekinetic force, dealing 25 damage.', 'Psychic', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 0, 1),
      damage: 25,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 25 }],
    }),
    createMove(1, 'Aura Sphere', 'Mew fires a sphere of fighting energy, dealing 40 damage. Never misses.', 'Fighting', {
      classes: ['Special', 'Ranged', 'Bypassing'],
      cost: cost(0, 0, 0, 0, 2),
      cooldown: 1,
      damage: 40,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 40 }],
    }),
    createMove(2, 'Transform', "Mew copies the target's last used move. Lasts for 3 turns.", 'Normal', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 4,
      duration: 3,
      target: 'OneEnemy',
      effects: [{ type: 'tag', duration: 3 }],
    }),
    protect('Teleport', 'Mew', ['Status']),
  ],
};

// ==================== GEN 2 STARTERS ====================

export const typhlosion: Pokemon = {
  id: 'typhlosion',
  name: 'Typhlosion',
  description: 'A Fire type with a blazing fur collar. When it attacks, it creates tremendously hot flames.',
  types: ['Fire'],
  generation: 'Gen2',
  category: 'Starter',
  hp: 100,
  traits: ['Johto', 'Starter', 'FireType'],
  isStarter: false,
  unlockCost: 300,
  moves: [
    createMove(0, 'Flame Wheel', 'Typhlosion cloaks itself in fire and charges, dealing 20 damage and may cause burn.', 'Fire', {
      classes: ['Physical', 'Contact'],
      cost: cost(1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Eruption', 'Typhlosion attacks with explosive force, dealing up to 60 damage based on remaining HP.', 'Fire', {
      classes: ['Special', 'Ranged'],
      cost: cost(2, 0, 0, 0, 1),
      cooldown: 2,
      damage: 60,
      target: 'AllEnemies',
      effects: [{ type: 'damage', value: 60 }],
    }),
    createMove(2, 'Smokescreen', 'Typhlosion creates a smokescreen, enemies have -30% accuracy for 2 turns.', 'Normal', {
      classes: ['Status', 'Ranged'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 2,
      target: 'AllEnemies',
      effects: [{ type: 'weaken', value: 30, duration: 2 }],
    }),
    protect('Swift', 'Typhlosion', ['Special']),
  ],
};

export const feraligatr: Pokemon = {
  id: 'feraligatr',
  name: 'Feraligatr',
  description: 'A Water type with powerful jaws. It opens its huge mouth to intimidate enemies.',
  types: ['Water'],
  generation: 'Gen2',
  category: 'Starter',
  hp: 110,
  traits: ['Johto', 'Starter', 'WaterType'],
  isStarter: false,
  unlockCost: 300,
  moves: [
    createMove(0, 'Waterfall', 'Feraligatr charges at the target with a wall of water, dealing 25 damage.', 'Water', {
      classes: ['Physical', 'Contact'],
      cost: cost(0, 1),
      damage: 25,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 25 }],
    }),
    createMove(1, 'Crunch', 'Feraligatr bites down with its massive jaws, dealing 35 damage and lowering Defense.', 'Dark', {
      classes: ['Physical', 'Contact'],
      cost: cost(0, 1, 0, 0, 1),
      cooldown: 1,
      damage: 35,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 35 },
        { type: 'expose', value: 15, duration: 2 },
      ],
    }),
    createMove(2, 'Dragon Dance', 'Feraligatr mystically boosts itself for 3 turns.', 'Dragon', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'strengthen', value: 25, duration: 3 }],
    }),
    protect('Protect', 'Feraligatr', ['Status']),
  ],
};

export const meganium: Pokemon = {
  id: 'meganium',
  name: 'Meganium',
  description: 'A Grass type with healing powers. Its breath has the ability to revive dead plants.',
  types: ['Grass'],
  generation: 'Gen2',
  category: 'Starter',
  hp: 100,
  traits: ['Johto', 'Starter', 'GrassType'],
  isStarter: false,
  unlockCost: 300,
  moves: [
    createMove(0, 'Petal Blizzard', 'Meganium stirs up a violent storm of petals, dealing 20 damage to all enemies.', 'Grass', {
      classes: ['Physical', 'Ranged'],
      cost: cost(0, 0, 1),
      damage: 20,
      target: 'AllEnemies',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Synthesis', 'Meganium restores HP. Heals 25 HP to self.', 'Grass', {
      classes: ['Status'],
      cost: cost(0, 0, 1),
      cooldown: 2,
      target: 'Self',
      effects: [{ type: 'heal', value: 25 }],
    }),
    createMove(2, 'Aromatherapy', 'Meganium releases a soothing scent, healing all allies for 15 HP and removing status conditions.', 'Grass', {
      classes: ['Status'],
      cost: cost(0, 0, 2),
      cooldown: 4,
      target: 'AllAllies',
      effects: [{ type: 'heal', value: 15 }],
    }),
    protect('Light Screen', 'Meganium', ['Status']),
  ],
};

// ==================== MORE POPULAR POKEMON ====================

export const lucario: Pokemon = {
  id: 'lucario',
  name: 'Lucario',
  description: 'A Fighting/Steel type that can read and manipulate aura.',
  types: ['Fighting', 'Steel'],
  generation: 'Gen4',
  category: 'Common',
  hp: 100,
  traits: ['Sinnoh', 'FightingType', 'SteelType'],
  isStarter: false,
  unlockCost: 750,
  moves: [
    createMove(0, 'Force Palm', 'Lucario attacks with a shock wave, dealing 20 damage with chance to paralyze.', 'Fighting', {
      classes: ['Physical', 'Contact'],
      cost: cost(0, 0, 0, 0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Aura Sphere', 'Lucario fires a sphere of aura energy, dealing 40 damage. Never misses.', 'Fighting', {
      classes: ['Special', 'Ranged', 'Bypassing'],
      cost: cost(0, 0, 0, 0, 2),
      cooldown: 1,
      damage: 40,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 40 }],
    }),
    createMove(2, 'Swords Dance', 'Lucario sharply raises its Attack, gaining 50% damage boost for 3 turns.', 'Normal', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'strengthen', value: 50, duration: 3 }],
    }),
    protect('Extreme Speed', 'Lucario', ['Physical', 'Priority']),
  ],
};

export const garchomp: Pokemon = {
  id: 'garchomp',
  name: 'Garchomp',
  description: 'A Dragon/Ground pseudo-legendary. It can fly at sonic speeds.',
  types: ['Dragon', 'Ground'],
  generation: 'Gen4',
  category: 'PseudoLegendary',
  hp: 120,
  traits: ['Sinnoh', 'PseudoLegendary', 'DragonType'],
  isStarter: false,
  unlockCost: 2000,
  moves: [
    createMove(0, 'Dragon Claw', 'Garchomp slashes with its sharp claws, dealing 25 damage.', 'Dragon', {
      classes: ['Physical', 'Contact'],
      cost: cost(0, 0, 0, 0, 2),
      damage: 25,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 25 }],
    }),
    createMove(1, 'Earthquake', 'Garchomp causes an earthquake, dealing 40 damage to all enemies.', 'Ground', {
      classes: ['Physical', 'Ranged'],
      cost: cost(0, 0, 0, 0, 3),
      cooldown: 2,
      damage: 40,
      target: 'AllEnemies',
      effects: [{ type: 'damage', value: 40 }],
    }),
    createMove(2, 'Swords Dance', 'Garchomp raises its Attack sharply for 3 turns.', 'Normal', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'strengthen', value: 50, duration: 3 }],
    }),
    protect('Dig', 'Garchomp', ['Physical']),
  ],
};

export const eevee: Pokemon = {
  id: 'eevee',
  name: 'Eevee',
  description: 'A Normal type with an unstable genetic makeup. It has the potential to evolve into many different forms.',
  types: ['Normal'],
  generation: 'Gen1',
  category: 'Common',
  hp: 85,
  traits: ['Kanto', 'Eeveelution'],
  isStarter: true,
  unlockCost: 0,
  moves: [
    createMove(0, 'Quick Attack', 'Eevee lunges at the target at speeds that make it almost invisible, dealing 15 damage. Always goes first.', 'Normal', {
      classes: ['Physical', 'Contact', 'Priority'],
      cost: cost(0, 0, 0, 0, 1),
      damage: 15,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 15 }],
    }),
    createMove(1, 'Swift', 'Eevee fires star-shaped rays at enemies, dealing 25 damage to all enemies. Never misses.', 'Normal', {
      classes: ['Special', 'Ranged', 'Bypassing'],
      cost: cost(0, 0, 0, 0, 2),
      cooldown: 1,
      damage: 25,
      target: 'AllEnemies',
      effects: [{ type: 'damage', value: 25 }],
    }),
    createMove(2, 'Baton Pass', 'Eevee switches out, passing any stat changes to the next Pokémon.', 'Normal', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      target: 'Self',
      effects: [{ type: 'tag', duration: 1 }],
    }),
    protect('Detect', 'Eevee', ['Status']),
  ],
};

// ==================== EEVEELUTIONS ====================

export const vaporeon: Pokemon = {
  id: 'vaporeon',
  name: 'Vaporeon',
  description: 'A Water type Eeveelution. It can melt invisibly into water.',
  types: ['Water'],
  generation: 'Gen1',
  category: 'Common',
  hp: 130,
  traits: ['Kanto', 'Eeveelution', 'WaterType'],
  isStarter: false,
  unlockCost: 750,
  moves: [
    createMove(0, 'Water Pulse', 'Vaporeon attacks with pulsing water, dealing 20 damage with a chance to confuse.', 'Water', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Hydro Pump', 'Vaporeon blasts the target with a huge volume of water, dealing 50 damage.', 'Water', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 2, 0, 0, 1),
      cooldown: 2,
      damage: 50,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 50 }],
    }),
    createMove(2, 'Wish', 'Vaporeon makes a wish. Heals 30 HP next turn.', 'Normal', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 1,
      target: 'Self',
      effects: [{ type: 'heal', value: 30, duration: 1 }],
    }),
    protect('Acid Armor', 'Vaporeon', ['Status']),
  ],
};

export const jolteon: Pokemon = {
  id: 'jolteon',
  name: 'Jolteon',
  description: 'An Electric type Eeveelution. Its cells generate a low level of electricity.',
  types: ['Electric'],
  generation: 'Gen1',
  category: 'Common',
  hp: 95,
  traits: ['Kanto', 'Eeveelution', 'ElectricType'],
  isStarter: false,
  unlockCost: 750,
  moves: [
    createMove(0, 'Thunder Shock', 'Jolteon zaps the target with electricity, dealing 20 damage.', 'Electric', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Thunder', 'Jolteon drops a powerful lightning bolt, dealing 55 damage with low accuracy.', 'Electric', {
      classes: ['Special', 'Ranged'],
      cost: cost(0, 0, 0, 2, 1),
      cooldown: 2,
      damage: 55,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 55 },
        { type: 'stun', duration: 1 },
      ],
    }),
    createMove(2, 'Agility', 'Jolteon relaxes and lightens its body, gaining evasion for 3 turns.', 'Psychic', {
      classes: ['Status'],
      cost: cost(0, 0, 0, 0, 1),
      cooldown: 3,
      duration: 3,
      target: 'Self',
      effects: [{ type: 'reduce', value: 20, duration: 3 }],
    }),
    protect('Volt Switch', 'Jolteon', ['Special']),
  ],
};

export const flareon: Pokemon = {
  id: 'flareon',
  name: 'Flareon',
  description: 'A Fire type Eeveelution. It stores thermal energy in its body.',
  types: ['Fire'],
  generation: 'Gen1',
  category: 'Common',
  hp: 95,
  traits: ['Kanto', 'Eeveelution', 'FireType'],
  isStarter: false,
  unlockCost: 750,
  moves: [
    createMove(0, 'Fire Fang', 'Flareon bites with flaming fangs, dealing 20 damage with a chance to burn.', 'Fire', {
      classes: ['Physical', 'Contact'],
      cost: cost(1),
      damage: 20,
      target: 'OneEnemy',
      effects: [{ type: 'damage', value: 20 }],
    }),
    createMove(1, 'Flare Blitz', 'Flareon cloaks itself in fire and charges, dealing 50 damage. Causes recoil.', 'Fire', {
      classes: ['Physical', 'Contact', 'Recoil'],
      cost: cost(2, 0, 0, 0, 1),
      cooldown: 2,
      damage: 50,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 50 },
        { type: 'afflict', value: 15, target: 'Self' },
      ],
    }),
    createMove(2, 'Flame Charge', 'Flareon cloaks itself in flames and charges, dealing 15 damage and boosting Speed.', 'Fire', {
      classes: ['Physical', 'Contact'],
      cost: cost(1),
      cooldown: 2,
      damage: 15,
      target: 'OneEnemy',
      effects: [
        { type: 'damage', value: 15 },
        { type: 'strengthen', value: 15, duration: 3 },
      ],
    }),
    protect('Lava Plume', 'Flareon', ['Special']),
  ],
};

// ==================== COLLECTION ====================

export const allPokemon: Pokemon[] = [
  pikachu,
  charizard,
  blastoise,
  venusaur,
  gengar,
  alakazam,
  machamp,
  dragonite,
  mewtwo,
  mew,
  typhlosion,
  feraligatr,
  meganium,
  lucario,
  garchomp,
  eevee,
  vaporeon,
  jolteon,
  flareon,
];

export const starterPokemon: Pokemon[] = allPokemon.filter(p => p.isStarter);

export const pokemonById = (id: string): Pokemon | undefined => 
  allPokemon.find(p => p.id === id);

export const pokemonByGeneration = (gen: Pokemon['generation']): Pokemon[] =>
  allPokemon.filter(p => p.generation === gen);

export const pokemonByType = (type: PokemonType): Pokemon[] =>
  allPokemon.filter(p => p.types.includes(type));

// Backward compatibility alias
export const characters = allPokemon;
export const characterById = pokemonById;
