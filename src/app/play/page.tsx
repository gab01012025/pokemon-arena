/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { useSounds } from '@/components/SoundManager';
import './play.css';

// ============ TYPES ============
interface Skill {
  id: string;
  name: string;
  description: string;
}

interface Pokemon {
  id: number;
  name: string;
  description: string;
  type: string;
  skills: Skill[];
}

// ============ BASE-STAGE KANTO POKEMON (evolve during battle) ============
const ALL_POKEMON: Pokemon[] = [
  // === STARTERS (arena-game.app definitions) ===
  { id: 1, name: 'Bulbasaur', type: 'grass', description: 'A strange seed was planted on its back at birth.', skills: [
    { id: 's1', name: 'Razor Leaf', description: '10 damage. During Sun\'s Charge, deals +5 per charge.' },
    { id: 's2', name: 'Solar Beam', description: '50 piercing damage. Becomes invulnerable 1 turn. Needs 3 charges.' },
    { id: 's3', name: "Sun's Charge", description: 'Heals 5 HP. Razor Leaf permanently deals +5 damage.' },
    { id: 's4', name: 'Dodge', description: 'Invulnerable for 1 turn. CD: 4' },
  ]},
  { id: 4, name: 'Charmander', type: 'fire', description: 'The flame on its tail shows its life force.', skills: [
    { id: 's1', name: 'Firetail', description: '10 damage. During Tail In Fire, deals +5 damage.' },
    { id: 's2', name: 'Flamethrower', description: '25 affliction damage. Enemy takes 25% more fire damage 2 turns.' },
    { id: 's3', name: 'Tail In Fire', description: '5 damage reduction 3 turns. Firetail deals +10, enables Flamethrower.' },
    { id: 's4', name: 'Dodge Jump', description: 'Invulnerable for 1 turn. CD: 4' },
  ]},
  { id: 7, name: 'Squirtle', type: 'water', description: 'It shelters in its shell and sprays water.', skills: [
    { id: 's1', name: 'Bubble', description: '10 damage + 5 next turn. Enemy loses 1 fire energy.' },
    { id: 's2', name: 'Rotating Shell', description: '10 damage + 5 next turn. Stuns if enemy uses non-physical.' },
    { id: 's3', name: 'Hydro Pump', description: '20 damage + 5 affliction next turn.' },
    { id: 's4', name: 'Jump', description: 'Invulnerable for 1 turn. CD: 4' },
  ]},
  // === ICONIC ===
  { id: 25, name: 'Pikachu', type: 'electric', description: 'It stores electricity in its cheeks.', skills: [
    { id: 's1', name: 'Thunder Shock', description: '20 damage' },
    { id: 's2', name: 'Quick Attack', description: '25 priority' },
    { id: 's3', name: 'Thunderbolt', description: '35 damage' },
    { id: 's4', name: 'Thunder', description: '50 damage' },
  ]},
  { id: 133, name: 'Eevee', type: 'normal', description: 'Its genetic code is irregular. It may mutate if exposed to radiation from elemental stones.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Quick Attack', description: '20 priority' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Swift', description: '30 never miss' },
  ]},
  { id: 52, name: 'Meowth', type: 'normal', description: 'It loves coins. It searches for shiny objects at night.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Bite', description: '20 damage' },
    { id: 's3', name: 'Pay Day', description: '25 damage' },
    { id: 's4', name: 'Slash', description: '35 damage' },
  ]},
  // === EARLY ROUTES ===
  { id: 10, name: 'Caterpie', type: 'bug', description: 'For protection, it releases a stench from antennae.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'String Shot', description: 'Slow enemy' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Struggle', description: '25 damage' },
  ]},
  { id: 13, name: 'Weedle', type: 'bug', description: 'It eats its weight in leaves every day.', skills: [
    { id: 's1', name: 'Poison Sting', description: '15 poison' },
    { id: 's2', name: 'String Shot', description: 'Slow enemy' },
    { id: 's3', name: 'Bug Bite', description: '20 damage' },
    { id: 's4', name: 'Struggle', description: '25 damage' },
  ]},
  { id: 16, name: 'Pidgey', type: 'flying', description: 'A common sight in forests and woods.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Gust', description: '20 damage' },
    { id: 's3', name: 'Quick Attack', description: '25 priority' },
    { id: 's4', name: 'Wing Attack', description: '30 damage' },
  ]},
  { id: 19, name: 'Rattata', type: 'normal', description: 'Its fangs are long and sharp.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Quick Attack', description: '20 priority' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Hyper Fang', description: '35 damage' },
  ]},
  { id: 21, name: 'Spearow', type: 'flying', description: 'It flaps its short wings to flush out insects.', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Fury Attack', description: '25 damage' },
    { id: 's3', name: 'Aerial Ace', description: '30 damage' },
    { id: 's4', name: 'Mirror Move', description: 'Copy last attack' },
  ]},
  // === POISON/GROUND ===
  { id: 23, name: 'Ekans', type: 'poison', description: 'It sneaks through grass without making a sound.', skills: [
    { id: 's1', name: 'Wrap', description: '15 trap damage' },
    { id: 's2', name: 'Poison Sting', description: '20 poison' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Acid', description: '30 damage' },
  ]},
  { id: 27, name: 'Sandshrew', type: 'ground', description: 'It burrows and lives underground.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Sand Attack', description: 'Lower accuracy' },
    { id: 's3', name: 'Swift', description: '25 never miss' },
    { id: 's4', name: 'Dig', description: '35 damage' },
  ]},
  // === NIDORAN ===
  { id: 29, name: 'Nidoran\u2640', type: 'poison', description: 'A docile Pok\u00e9mon that prefers to avoid fighting.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Poison Sting', description: '20 poison' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Double Kick', description: '30 damage' },
  ]},
  { id: 32, name: 'Nidoran\u2642', type: 'poison', description: 'It stiffens its ears to sense danger.', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Poison Sting', description: '20 poison' },
    { id: 's3', name: 'Horn Attack', description: '25 damage' },
    { id: 's4', name: 'Double Kick', description: '30 damage' },
  ]},
  // === FIRE ===
  { id: 37, name: 'Vulpix', type: 'fire', description: 'At birth, it has just one tail that splits as it grows.', skills: [
    { id: 's1', name: 'Ember', description: '15 damage' },
    { id: 's2', name: 'Quick Attack', description: '20 priority' },
    { id: 's3', name: 'Fire Spin', description: '25 trap' },
    { id: 's4', name: 'Flamethrower', description: '35 damage' },
  ]},
  { id: 58, name: 'Growlithe', type: 'fire', description: 'Extremely loyal. It will fearlessly bark at any foe.', skills: [
    { id: 's1', name: 'Bite', description: '15 damage' },
    { id: 's2', name: 'Ember', description: '20 damage' },
    { id: 's3', name: 'Flame Wheel', description: '25 damage' },
    { id: 's4', name: 'Flamethrower', description: '35 damage' },
  ]},
  { id: 77, name: 'Ponyta', type: 'fire', description: 'Its hooves are 10 times harder than diamonds.', skills: [
    { id: 's1', name: 'Ember', description: '15 damage' },
    { id: 's2', name: 'Stomp', description: '20 damage' },
    { id: 's3', name: 'Fire Spin', description: '25 trap' },
    { id: 's4', name: 'Flame Charge', description: '30 damage' },
  ]},
  // === WATER ===
  { id: 60, name: 'Poliwag', type: 'water', description: 'The spiral pattern on its belly is its internal organs showing through.', skills: [
    { id: 's1', name: 'Water Gun', description: '15 damage' },
    { id: 's2', name: 'Bubble Beam', description: '20 damage' },
    { id: 's3', name: 'Hypnosis', description: 'Sleep enemy' },
    { id: 's4', name: 'Body Slam', description: '30 damage' },
  ]},
  { id: 116, name: 'Horsea', type: 'water', description: 'Known to shoot down flying bugs with precision blasts of ink.', skills: [
    { id: 's1', name: 'Water Gun', description: '15 damage' },
    { id: 's2', name: 'Smokescreen', description: 'Lower accuracy' },
    { id: 's3', name: 'Bubble Beam', description: '25 damage' },
    { id: 's4', name: 'Dragon Rage', description: '30 damage' },
  ]},
  { id: 129, name: 'Magikarp', type: 'water', description: 'Virtually useless in battle, but evolves into the fearsome Gyarados.', skills: [
    { id: 's1', name: 'Splash', description: 'Nothing happens' },
    { id: 's2', name: 'Tackle', description: '10 damage' },
    { id: 's3', name: 'Flail', description: '20 damage' },
    { id: 's4', name: 'Bounce', description: '25 damage' },
  ]},
  // === PSYCHIC/GHOST ===
  { id: 63, name: 'Abra', type: 'psychic', description: 'It sleeps 18 hours a day. It uses a variety of psychic moves.', skills: [
    { id: 's1', name: 'Teleport', description: 'Dodge attack' },
    { id: 's2', name: 'Confusion', description: '20 damage' },
    { id: 's3', name: 'Psybeam', description: '25 damage' },
    { id: 's4', name: 'Hidden Power', description: '30 damage' },
  ]},
  { id: 92, name: 'Gastly', type: 'ghost', description: 'Almost invisible, this gaseous Pok\u00e9mon cloaks the target to put it to sleep.', skills: [
    { id: 's1', name: 'Lick', description: '15 damage' },
    { id: 's2', name: 'Hypnosis', description: 'Sleep enemy' },
    { id: 's3', name: 'Night Shade', description: '25 damage' },
    { id: 's4', name: 'Shadow Ball', description: '30 damage' },
  ]},
  // === FIGHTING/ROCK ===
  { id: 66, name: 'Machop', type: 'fighting', description: 'It trains by lifting rocks in the mountains.', skills: [
    { id: 's1', name: 'Karate Chop', description: '15 damage' },
    { id: 's2', name: 'Low Kick', description: '20 damage' },
    { id: 's3', name: 'Seismic Toss', description: '25 damage' },
    { id: 's4', name: 'Cross Chop', description: '35 damage' },
  ]},
  { id: 74, name: 'Geodude', type: 'rock', description: 'Found in fields and mountains. Mistaken for boulders.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Rock Throw', description: '20 damage' },
    { id: 's3', name: 'Rock Slide', description: '30 damage' },
    { id: 's4', name: 'Self-Destruct', description: '50 recoil' },
  ]},
  // === ELECTRIC/STEEL ===
  { id: 81, name: 'Magnemite', type: 'electric', description: 'Uses anti-gravity to stay suspended. Emits electromagnetic waves.', skills: [
    { id: 's1', name: 'Thunder Shock', description: '15 damage' },
    { id: 's2', name: 'Spark', description: '20 damage' },
    { id: 's3', name: 'Thunder Wave', description: 'Paralyze' },
    { id: 's4', name: 'Thunderbolt', description: '30 damage' },
  ]},
  // === DRAGON ===
  { id: 147, name: 'Dratini', type: 'dragon', description: 'Long considered a mythical Pok\u00e9mon until recently, when a colony was found living underwater.', skills: [
    { id: 's1', name: 'Wrap', description: '15 damage' },
    { id: 's2', name: 'Dragon Rage', description: '25 damage' },
    { id: 's3', name: 'Twister', description: '30 damage' },
    { id: 's4', name: 'Slam', description: '35 damage' },
  ]},
  // === GRASS/POISON ===
  { id: 43, name: 'Oddish', type: 'grass', description: 'During the day, it buries itself in soil. At night, it wanders around sowing seeds.', skills: [
    { id: 's1', name: 'Absorb', description: '15 drain' },
    { id: 's2', name: 'Acid', description: '20 damage' },
    { id: 's3', name: 'Sleep Powder', description: 'Sleep enemy' },
    { id: 's4', name: 'Razor Leaf', description: '30 damage' },
  ]},
  // === MISC ===
  { id: 35, name: 'Clefairy', type: 'fairy', description: 'Its adorable appearance makes it popular as a pet. It is rare and found only in certain areas.', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' },
    { id: 's2', name: 'Double Slap', description: '20 damage' },
    { id: 's3', name: 'Sing', description: 'Sleep enemy' },
    { id: 's4', name: 'Metronome', description: 'Random move' },
  ]},
  { id: 39, name: 'Jigglypuff', type: 'fairy', description: 'When its huge eyes waver, it sings a mysteriously soothing melody that lulls its enemies to sleep.', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' },
    { id: 's2', name: 'Sing', description: 'Sleep enemy' },
    { id: 's3', name: 'Body Slam', description: '25 damage' },
    { id: 's4', name: 'Double Slap', description: '30 damage' },
  ]},
  { id: 104, name: 'Cubone', type: 'ground', description: 'It always wears the skull of its dead mother as a helmet.', skills: [
    { id: 's1', name: 'Bone Club', description: '15 damage' },
    { id: 's2', name: 'Headbutt', description: '20 damage' },
    { id: 's3', name: 'Bonemerang', description: '30 damage' },
    { id: 's4', name: 'Bone Rush', description: '35 damage' },
  ]},
  { id: 109, name: 'Koffing', type: 'poison', description: 'Because it stores several kinds of toxic gases in its body, it is prone to exploding without warning.', skills: [
    { id: 's1', name: 'Poison Gas', description: 'Poison enemy' },
    { id: 's2', name: 'Tackle', description: '15 damage' },
    { id: 's3', name: 'Sludge', description: '25 damage' },
    { id: 's4', name: 'Self-Destruct', description: '50 recoil' },
  ]},
  { id: 100, name: 'Voltorb', type: 'electric', description: 'Usually found in power plants. It resembles a Pok\u00e9 Ball.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Spark', description: '20 damage' },
    { id: 's3', name: 'Rollout', description: '25 damage' },
    { id: 's4', name: 'Self-Destruct', description: '50 recoil' },
  ]},
  { id: 79, name: 'Slowpoke', type: 'water', description: 'Incredibly slow and sluggish. It is quite content to laze about.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Water Gun', description: '20 damage' },
    { id: 's3', name: 'Confusion', description: '25 damage' },
    { id: 's4', name: 'Headbutt', description: '30 damage' },
  ]},
  // === MISSING KANTO POKEMON ===
  { id: 41, name: 'Zubat', type: 'poison', description: 'It has no eyes. It relies on ultrasonic waves to detect obstacles.', skills: [
    { id: 's1', name: 'Leech Life', description: '15 drain' },
    { id: 's2', name: 'Supersonic', description: 'Confuse enemy' },
    { id: 's3', name: 'Bite', description: '25 damage' },
    { id: 's4', name: 'Air Cutter', description: '30 damage' },
  ]},
  { id: 46, name: 'Paras', type: 'bug', description: 'Mushrooms called tochukaso grow on its back. They grow by drawing nutrients from the host.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Stun Spore', description: 'Paralyze enemy' },
    { id: 's3', name: 'Leech Life', description: '20 drain' },
    { id: 's4', name: 'Slash', description: '30 damage' },
  ]},
  { id: 48, name: 'Venonat', type: 'bug', description: 'Its large eyes act as radar. It uses them to catch prey in the dark.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Poison Powder', description: 'Poison enemy' },
    { id: 's3', name: 'Confusion', description: '25 damage' },
    { id: 's4', name: 'Psybeam', description: '30 damage' },
  ]},
  { id: 50, name: 'Diglett', type: 'ground', description: 'It lives about one yard underground. It eats plant roots.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Mud-Slap', description: '20 damage' },
    { id: 's3', name: 'Dig', description: '30 damage' },
    { id: 's4', name: 'Earthquake', description: '40 damage' },
  ]},
  { id: 54, name: 'Psyduck', type: 'water', description: 'Always tormented by headaches. It uses psychic powers when they become too intense.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Water Gun', description: '20 damage' },
    { id: 's3', name: 'Confusion', description: '25 damage' },
    { id: 's4', name: 'Zen Headbutt', description: '35 damage' },
  ]},
  { id: 56, name: 'Mankey', type: 'fighting', description: 'Extremely quick to anger. It could be docile one moment then thrashing away the next.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Karate Chop', description: '20 damage' },
    { id: 's3', name: 'Low Kick', description: '25 damage' },
    { id: 's4', name: 'Cross Chop', description: '35 damage' },
  ]},
  { id: 69, name: 'Bellsprout', type: 'grass', description: 'A carnivorous Pok\u00e9mon that traps and eats bugs.', skills: [
    { id: 's1', name: 'Vine Whip', description: '15 damage' },
    { id: 's2', name: 'Wrap', description: '20 trap' },
    { id: 's3', name: 'Acid', description: '25 damage' },
    { id: 's4', name: 'Razor Leaf', description: '30 damage' },
  ]},
  { id: 72, name: 'Tentacool', type: 'water', description: 'Drifts in shallow seas. Anglers who hook them by accident are often punished by its stinging acid.', skills: [
    { id: 's1', name: 'Poison Sting', description: '15 poison' },
    { id: 's2', name: 'Water Pulse', description: '20 damage' },
    { id: 's3', name: 'Acid', description: '25 damage' },
    { id: 's4', name: 'Bubble Beam', description: '30 damage' },
  ]},
  { id: 83, name: "Farfetch'd", type: 'normal', description: 'The plant stalk it holds is its weapon. It is used much like a metal sword.', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Slash', description: '25 damage' },
    { id: 's3', name: 'Swords Dance', description: '+Attack' },
    { id: 's4', name: 'Brave Bird', description: '35 recoil' },
  ]},
  { id: 84, name: 'Doduo', type: 'normal', description: 'A bird that makes up for its poor flying with its fast foot speed.', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Fury Attack', description: '20 damage' },
    { id: 's3', name: 'Drill Peck', description: '30 damage' },
    { id: 's4', name: 'Tri Attack', description: '35 damage' },
  ]},
  { id: 86, name: 'Seel', type: 'water', description: 'The protruding horn on its head is very hard. It is used for bashing through thick ice.', skills: [
    { id: 's1', name: 'Headbutt', description: '15 damage' },
    { id: 's2', name: 'Aurora Beam', description: '25 damage' },
    { id: 's3', name: 'Aqua Jet', description: '20 priority' },
    { id: 's4', name: 'Ice Beam', description: '35 damage' },
  ]},
  { id: 88, name: 'Grimer', type: 'poison', description: 'Appears in filthy areas. Thrives by sucking up polluted sludge.', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' },
    { id: 's2', name: 'Sludge', description: '25 poison' },
    { id: 's3', name: 'Disable', description: 'Block move' },
    { id: 's4', name: 'Sludge Bomb', description: '35 damage' },
  ]},
  { id: 90, name: 'Shellder', type: 'water', description: 'Its hard shell repels any kind of attack. It is vulnerable only when its shell is open.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Icicle Spear', description: '25 damage' },
    { id: 's3', name: 'Withdraw', description: '+Defense' },
    { id: 's4', name: 'Ice Beam', description: '35 damage' },
  ]},
  { id: 95, name: 'Onix', type: 'rock', description: 'As it grows, the stone portions of its body harden to become similar to a diamond.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Rock Throw', description: '20 damage' },
    { id: 's3', name: 'Bind', description: '25 trap' },
    { id: 's4', name: 'Rock Slide', description: '35 damage' },
  ]},
  { id: 96, name: 'Drowzee', type: 'psychic', description: 'Puts enemies to sleep then eats their dreams. Occasionally gets sick from eating bad dreams.', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' },
    { id: 's2', name: 'Hypnosis', description: 'Sleep enemy' },
    { id: 's3', name: 'Confusion', description: '25 damage' },
    { id: 's4', name: 'Psychic', description: '35 damage' },
  ]},
  { id: 98, name: 'Krabby', type: 'water', description: 'Its pincers are not only powerful weapons, they are used for balance when walking sideways.', skills: [
    { id: 's1', name: 'Bubble', description: '15 damage' },
    { id: 's2', name: 'Vice Grip', description: '20 damage' },
    { id: 's3', name: 'Stomp', description: '25 damage' },
    { id: 's4', name: 'Crabhammer', description: '35 damage' },
  ]},
  { id: 102, name: 'Exeggcute', type: 'grass', description: 'Often mistaken for eggs. When disturbed, they quickly gather and attack in swarms.', skills: [
    { id: 's1', name: 'Barrage', description: '15 damage' },
    { id: 's2', name: 'Hypnosis', description: 'Sleep enemy' },
    { id: 's3', name: 'Confusion', description: '25 damage' },
    { id: 's4', name: 'Solar Beam', description: '40 damage' },
  ]},
  { id: 106, name: 'Hitmonlee', type: 'fighting', description: 'When in a hurry, its legs lengthen progressively. It runs smoothly with extra long strides.', skills: [
    { id: 's1', name: 'Double Kick', description: '20 damage' },
    { id: 's2', name: 'Rolling Kick', description: '25 damage' },
    { id: 's3', name: 'High Jump Kick', description: '35 recoil' },
    { id: 's4', name: 'Mega Kick', description: '40 damage' },
  ]},
  { id: 107, name: 'Hitmonchan', type: 'fighting', description: 'While apparently resting, it fires punches in lightning fast volleys that are impossible to see.', skills: [
    { id: 's1', name: 'Comet Punch', description: '20 damage' },
    { id: 's2', name: 'Mach Punch', description: '20 priority' },
    { id: 's3', name: 'Fire Punch', description: '30 damage' },
    { id: 's4', name: 'Close Combat', description: '40 damage' },
  ]},
  { id: 108, name: 'Lickitung', type: 'normal', description: 'Its tongue can be extended like a chameleon. It leaves a tingling sensation when it licks.', skills: [
    { id: 's1', name: 'Lick', description: '15 damage' },
    { id: 's2', name: 'Stomp', description: '20 damage' },
    { id: 's3', name: 'Slam', description: '30 damage' },
    { id: 's4', name: 'Body Slam', description: '35 damage' },
  ]},
  { id: 111, name: 'Rhyhorn', type: 'ground', description: 'Its massive bones are 1000 times harder than human bones. It can easily knock a trailer flying.', skills: [
    { id: 's1', name: 'Horn Attack', description: '20 damage' },
    { id: 's2', name: 'Stomp', description: '25 damage' },
    { id: 's3', name: 'Rock Blast', description: '30 damage' },
    { id: 's4', name: 'Earthquake', description: '40 damage' },
  ]},
  { id: 113, name: 'Chansey', type: 'normal', description: 'A rare and elusive Pok\u00e9mon that brings happiness to those who manage to catch it.', skills: [
    { id: 's1', name: 'Pound', description: '10 damage' },
    { id: 's2', name: 'Sing', description: 'Sleep enemy' },
    { id: 's3', name: 'Soft-Boiled', description: 'Heal 40 HP' },
    { id: 's4', name: 'Egg Bomb', description: '35 damage' },
  ]},
  { id: 114, name: 'Tangela', type: 'grass', description: 'The whole body is swathed with wide vines that are similar to seaweed.', skills: [
    { id: 's1', name: 'Vine Whip', description: '15 damage' },
    { id: 's2', name: 'Stun Spore', description: 'Paralyze enemy' },
    { id: 's3', name: 'Mega Drain', description: '25 drain' },
    { id: 's4', name: 'Power Whip', description: '35 damage' },
  ]},
  { id: 115, name: 'Kangaskhan', type: 'normal', description: 'The infant rarely ventures out of its mother\'s protective pouch until it is three years old.', skills: [
    { id: 's1', name: 'Comet Punch', description: '20 damage' },
    { id: 's2', name: 'Bite', description: '25 damage' },
    { id: 's3', name: 'Dizzy Punch', description: '30 damage' },
    { id: 's4', name: 'Mega Punch', description: '40 damage' },
  ]},
  { id: 118, name: 'Goldeen', type: 'water', description: 'Its tail fin billows like an elegant ballroom dress, earning it the name "Water Queen."', skills: [
    { id: 's1', name: 'Peck', description: '15 damage' },
    { id: 's2', name: 'Water Pulse', description: '25 damage' },
    { id: 's3', name: 'Horn Attack', description: '25 damage' },
    { id: 's4', name: 'Waterfall', description: '35 damage' },
  ]},
  { id: 120, name: 'Staryu', type: 'water', description: 'An enigmatic Pok\u00e9mon. Its red core glows at midnight.', skills: [
    { id: 's1', name: 'Water Gun', description: '15 damage' },
    { id: 's2', name: 'Rapid Spin', description: '20 damage' },
    { id: 's3', name: 'Swift', description: '25 never miss' },
    { id: 's4', name: 'Power Gem', description: '35 damage' },
  ]},
  { id: 122, name: 'Mr. Mime', type: 'psychic', description: 'It shapes an invisible wall in midair by miming. The wall repels all attacks.', skills: [
    { id: 's1', name: 'Confusion', description: '20 damage' },
    { id: 's2', name: 'Barrier', description: '+Defense' },
    { id: 's3', name: 'Psybeam', description: '30 damage' },
    { id: 's4', name: 'Psychic', description: '40 damage' },
  ]},
  { id: 123, name: 'Scyther', type: 'bug', description: 'With ninja-like agility and speed, it can create the illusion that there is more than one.', skills: [
    { id: 's1', name: 'Quick Attack', description: '15 priority' },
    { id: 's2', name: 'Fury Cutter', description: '20 damage' },
    { id: 's3', name: 'Slash', description: '30 damage' },
    { id: 's4', name: 'X-Scissor', description: '40 damage' },
  ]},
  { id: 124, name: 'Jynx', type: 'ice', description: 'It seductively wiggles its hips as it walks, causing people to dance along without noticing.', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' },
    { id: 's2', name: 'Lovely Kiss', description: 'Sleep enemy' },
    { id: 's3', name: 'Ice Punch', description: '30 damage' },
    { id: 's4', name: 'Blizzard', description: '40 damage' },
  ]},
  { id: 125, name: 'Electabuzz', type: 'electric', description: 'Normally found near power plants, it can wander away and cause major blackouts in cities.', skills: [
    { id: 's1', name: 'Thunder Shock', description: '15 damage' },
    { id: 's2', name: 'Thunder Punch', description: '25 damage' },
    { id: 's3', name: 'Thunderbolt', description: '35 damage' },
    { id: 's4', name: 'Thunder', description: '45 damage' },
  ]},
  { id: 126, name: 'Magmar', type: 'fire', description: 'Its body always burns with an orange glow that enables it to hide perfectly among flames.', skills: [
    { id: 's1', name: 'Ember', description: '15 damage' },
    { id: 's2', name: 'Fire Punch', description: '25 damage' },
    { id: 's3', name: 'Flamethrower', description: '35 damage' },
    { id: 's4', name: 'Fire Blast', description: '45 damage' },
  ]},
  { id: 127, name: 'Pinsir', type: 'bug', description: 'If it fails to crush the victim with its pincers, it will swing it around and toss it hard.', skills: [
    { id: 's1', name: 'Vice Grip', description: '20 damage' },
    { id: 's2', name: 'Seismic Toss', description: '25 damage' },
    { id: 's3', name: 'X-Scissor', description: '35 damage' },
    { id: 's4', name: 'Guillotine', description: '50 damage' },
  ]},
  { id: 128, name: 'Tauros', type: 'normal', description: 'When it targets an enemy, it charges furiously while whipping its body with its long tails.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Stomp', description: '25 damage' },
    { id: 's3', name: 'Take Down', description: '35 recoil' },
    { id: 's4', name: 'Thrash', description: '40 damage' },
  ]},
  { id: 131, name: 'Lapras', type: 'water', description: 'A gentle soul that can read the minds of people. It can ferry people across the sea.', skills: [
    { id: 's1', name: 'Water Gun', description: '15 damage' },
    { id: 's2', name: 'Ice Beam', description: '30 damage' },
    { id: 's3', name: 'Body Slam', description: '25 damage' },
    { id: 's4', name: 'Hydro Pump', description: '40 damage' },
  ]},
  { id: 132, name: 'Ditto', type: 'normal', description: 'It can freely recombine its own cellular structure to transform into other life-forms.', skills: [
    { id: 's1', name: 'Transform', description: 'Copy enemy' },
    { id: 's2', name: 'Tackle', description: '15 damage' },
    { id: 's3', name: 'Struggle', description: '25 damage' },
    { id: 's4', name: 'Body Slam', description: '30 damage' },
  ]},
  { id: 137, name: 'Porygon', type: 'normal', description: 'A Pok\u00e9mon that consists entirely of programming code. It can move freely in cyberspace.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Psybeam', description: '25 damage' },
    { id: 's3', name: 'Tri Attack', description: '35 damage' },
    { id: 's4', name: 'Hyper Beam', description: '45 damage' },
  ]},
  { id: 138, name: 'Omanyte', type: 'rock', description: 'A prehistoric Pok\u00e9mon that was resurrected from a fossil.', skills: [
    { id: 's1', name: 'Water Gun', description: '15 damage' },
    { id: 's2', name: 'Bite', description: '20 damage' },
    { id: 's3', name: 'Ancient Power', description: '30 damage' },
    { id: 's4', name: 'Hydro Pump', description: '40 damage' },
  ]},
  { id: 140, name: 'Kabuto', type: 'rock', description: 'A Pok\u00e9mon that was resurrected from a fossil found in what was once the ocean floor eons ago.', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' },
    { id: 's2', name: 'Aqua Jet', description: '20 priority' },
    { id: 's3', name: 'Ancient Power', description: '30 damage' },
    { id: 's4', name: 'Rock Slide', description: '35 damage' },
  ]},
  { id: 142, name: 'Aerodactyl', type: 'rock', description: 'A ferocious prehistoric Pok\u00e9mon that goes for the enemy\'s throat with its saw-like fangs.', skills: [
    { id: 's1', name: 'Wing Attack', description: '20 damage' },
    { id: 's2', name: 'Bite', description: '25 damage' },
    { id: 's3', name: 'Ancient Power', description: '30 damage' },
    { id: 's4', name: 'Rock Slide', description: '40 damage' },
  ]},
  { id: 143, name: 'Snorlax', type: 'normal', description: 'Very lazy. Just eats and sleeps. As its rotund bulk builds, it becomes steadily more slothful.', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' },
    { id: 's2', name: 'Rest', description: 'Sleep + heal' },
    { id: 's3', name: 'Body Slam', description: '30 damage' },
    { id: 's4', name: 'Hyper Beam', description: '45 damage' },
  ]},
];

// ============ MISSION POKEMON (locked until mission completed) ============
interface MissionPokemon extends Pokemon {
  missionName: string;
  rank: string;
}

const MISSION_POKEMON: MissionPokemon[] = [
  // D Rank
  { id: 155, name: 'Cyndaquil', type: 'fire', description: 'The fire mouse Pok\u00e9mon. Flames on its back flare up when angry.', missionName: 'Chama Inicial', rank: 'D', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Ember', description: '25 damage' }, { id: 's3', name: 'Smokescreen', description: 'Lower accuracy' }, { id: 's4', name: 'Flame Wheel', description: '35 damage' },
  ]},
  { id: 158, name: 'Totodile', type: 'water', description: 'Despite its small body, its jaws are very powerful.', missionName: 'Primeira Vit\u00f3ria', rank: 'D', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' }, { id: 's2', name: 'Water Gun', description: '25 damage' }, { id: 's3', name: 'Bite', description: '25 damage' }, { id: 's4', name: 'Aqua Tail', description: '35 damage' },
  ]},
  { id: 152, name: 'Chikorita', type: 'grass', description: 'A sweet aroma gently wafts from the leaf on its head.', missionName: 'Dano Acumulado', rank: 'D', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Razor Leaf', description: '25 damage' }, { id: 's3', name: 'Synthesis', description: 'Heal 30 HP' }, { id: 's4', name: 'Body Slam', description: '30 damage' },
  ]},
  { id: 179, name: 'Mareep', type: 'electric', description: 'Its fluffy coat swells to generate static electricity.', missionName: 'Trio de Vit\u00f3rias', rank: 'D', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Thunder Shock', description: '25 damage' }, { id: 's3', name: 'Cotton Spore', description: 'Slow enemy' }, { id: 's4', name: 'Discharge', description: '35 damage' },
  ]},
  { id: 403, name: 'Shinx', type: 'electric', description: 'All of its fur dazzles if danger is sensed.', missionName: 'Veterano de Batalhas', rank: 'D', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Spark', description: '25 damage' }, { id: 's3', name: 'Bite', description: '20 damage' }, { id: 's4', name: 'Thunder Fang', description: '35 damage' },
  ]},
  // C Rank
  { id: 255, name: 'Torchic', type: 'fire', description: 'A fire burns inside, so it feels warm to hug.', missionName: 'Aspirante C', rank: 'C', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' }, { id: 's2', name: 'Ember', description: '25 damage' }, { id: 's3', name: 'Sand Attack', description: 'Lower accuracy' }, { id: 's4', name: 'Flame Charge', description: '35 damage' },
  ]},
  { id: 258, name: 'Mudkip', type: 'water', description: 'The fin on its head acts as a radar to sense danger.', missionName: 'Poder Crescente', rank: 'C', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Water Gun', description: '25 damage' }, { id: 's3', name: 'Mud-Slap', description: '20 damage' }, { id: 's4', name: 'Muddy Water', description: '35 damage' },
  ]},
  { id: 252, name: 'Treecko', type: 'grass', description: 'It quickly scales even vertical walls with its hooked claws.', missionName: 'Caminho da Vit\u00f3ria', rank: 'C', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' }, { id: 's2', name: 'Absorb', description: '20 drain' }, { id: 's3', name: 'Quick Attack', description: '20 priority' }, { id: 's4', name: 'Leaf Blade', description: '35 damage' },
  ]},
  { id: 447, name: 'Riolu', type: 'fighting', description: 'It can discern the auras of all things through waves it emits.', missionName: 'Guerreiro Experiente', rank: 'C', skills: [
    { id: 's1', name: 'Quick Attack', description: '15 priority' }, { id: 's2', name: 'Force Palm', description: '25 damage' }, { id: 's3', name: 'Counter', description: 'Reflect damage' }, { id: 's4', name: 'Aura Sphere', description: '40 damage' },
  ]},
  { id: 570, name: 'Zorua', type: 'dark', description: 'It disguises itself to protect itself from danger.', missionName: 'Dominador C', rank: 'C', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' }, { id: 's2', name: 'Pursuit', description: '20 damage' }, { id: 's3', name: 'Foul Play', description: '30 damage' }, { id: 's4', name: 'Night Daze', description: '40 damage' },
  ]},
  // B Rank
  { id: 280, name: 'Ralts', type: 'psychic', description: 'It senses the emotions of people using the horns on its head.', missionName: 'Mente Afiada', rank: 'B', skills: [
    { id: 's1', name: 'Confusion', description: '20 damage' }, { id: 's2', name: 'Disarming Voice', description: '25 damage' }, { id: 's3', name: 'Calm Mind', description: '+Sp.Atk' }, { id: 's4', name: 'Psychic', description: '40 damage' },
  ]},
  { id: 371, name: 'Bagon', type: 'dragon', description: 'Dreaming of one day flying, it hurls itself off cliffs.', missionName: 'Ca\u00e7ador de Drag\u00f5es', rank: 'B', skills: [
    { id: 's1', name: 'Bite', description: '20 damage' }, { id: 's2', name: 'Dragon Breath', description: '30 damage' }, { id: 's3', name: 'Headbutt', description: '25 damage' }, { id: 's4', name: 'Dragon Claw', description: '40 damage' },
  ]},
  { id: 359, name: 'Absol', type: 'dark', description: 'It senses coming disasters with its horn.', missionName: 'Destrui\u00e7\u00e3o Total', rank: 'B', skills: [
    { id: 's1', name: 'Quick Attack', description: '15 priority' }, { id: 's2', name: 'Night Slash', description: '35 damage' }, { id: 's3', name: 'Swords Dance', description: '+Attack' }, { id: 's4', name: 'Sucker Punch', description: '40 priority' },
  ]},
  { id: 656, name: 'Froakie', type: 'water', description: 'It secretes bubbles from its chest and back to protect itself.', missionName: 'Mestre B', rank: 'B', skills: [
    { id: 's1', name: 'Pound', description: '15 damage' }, { id: 's2', name: 'Water Pulse', description: '30 damage' }, { id: 's3', name: 'Quick Attack', description: '20 priority' }, { id: 's4', name: 'Hydro Pump', description: '45 damage' },
  ]},
  // A Rank
  { id: 610, name: 'Axew', type: 'dragon', description: 'They mark their territory by leaving gashes in trees with their tusks.', missionName: 'F\u00faria Draconiana', rank: 'A', skills: [
    { id: 's1', name: 'Scratch', description: '15 damage' }, { id: 's2', name: 'Dragon Rage', description: '25 damage' }, { id: 's3', name: 'Slash', description: '30 damage' }, { id: 's4', name: 'Dragon Claw', description: '45 damage' },
  ]},
  { id: 633, name: 'Deino', type: 'dark', description: 'It tends to bite everything. It is not possible to approach without caution.', missionName: 'Sombra e Chamas', rank: 'A', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Bite', description: '25 damage' }, { id: 's3', name: 'Dragon Breath', description: '30 damage' }, { id: 's4', name: 'Dragon Pulse', description: '45 damage' },
  ]},
  { id: 636, name: 'Larvesta', type: 'bug', description: 'This Pok\u00e9mon was believed to have been born from the sun.', missionName: 'Chama do Sol', rank: 'A', skills: [
    { id: 's1', name: 'Ember', description: '15 damage' }, { id: 's2', name: 'Bug Bite', description: '25 damage' }, { id: 's3', name: 'Flame Charge', description: '30 damage' }, { id: 's4', name: 'Flare Blitz', description: '45 recoil' },
  ]},
  { id: 679, name: 'Honedge', type: 'steel', description: 'Born from a departed spirit inhabiting a sword.', missionName: 'L\u00e2mina Fantasma', rank: 'A', skills: [
    { id: 's1', name: 'Fury Cutter', description: '15 damage' }, { id: 's2', name: 'Shadow Sneak', description: '25 priority' }, { id: 's3', name: 'Iron Head', description: '30 damage' }, { id: 's4', name: 'Sacred Sword', description: '45 damage' },
  ]},
  // S Rank
  { id: 374, name: 'Beldum', type: 'steel', description: 'It converses with others by using magnetic pulses.', missionName: 'Mente de A\u00e7o', rank: 'S', skills: [
    { id: 's1', name: 'Take Down', description: '25 recoil' }, { id: 's2', name: 'Zen Headbutt', description: '35 damage' }, { id: 's3', name: 'Iron Head', description: '35 damage' }, { id: 's4', name: 'Meteor Mash', description: '50 damage' },
  ]},
  { id: 778, name: 'Mimikyu', type: 'ghost', description: 'A lonely Pok\u00e9mon that hides under an old rag to look like Pikachu.', missionName: 'Fantasma Disfarçado', rank: 'S', skills: [
    { id: 's1', name: 'Astonish', description: '20 damage' }, { id: 's2', name: 'Shadow Sneak', description: '25 priority' }, { id: 's3', name: 'Play Rough', description: '40 damage' }, { id: 's4', name: 'Shadow Claw', description: '45 damage' },
  ]},
  { id: 885, name: 'Dreepy', type: 'dragon', description: 'After being reborn as a ghost, it wanders the areas it once inhabited.', missionName: 'Lenda Suprema', rank: 'S', skills: [
    { id: 's1', name: 'Astonish', description: '20 damage' }, { id: 's2', name: 'Quick Attack', description: '20 priority' }, { id: 's3', name: 'Dragon Breath', description: '35 damage' }, { id: 's4', name: 'Phantom Force', description: '50 damage' },
  ]},
  // Event
  { id: 443, name: 'Gible', type: 'dragon', description: 'It nests in horizontal holes in cave walls. It pounces on prey.', missionName: 'Guardi\u00e3o da Terra', rank: 'Event', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Sand Attack', description: 'Lower accuracy' }, { id: 's3', name: 'Dragon Rage', description: '30 damage' }, { id: 's4', name: 'Dig', description: '40 damage' },
  ]},
  { id: 722, name: 'Rowlet', type: 'grass', description: 'This wary Pok\u00e9mon uses photosynthesis and flies silently through the sky.', missionName: 'Arqueiro da Floresta', rank: 'Event', skills: [
    { id: 's1', name: 'Tackle', description: '15 damage' }, { id: 's2', name: 'Leafage', description: '25 damage' }, { id: 's3', name: 'Peck', description: '20 damage' }, { id: 's4', name: 'Razor Leaf', description: '35 damage' },
  ]},
  { id: 246, name: 'Larvitar', type: 'rock', description: 'Born deep underground. It must eat its way through the soil to the surface.', missionName: 'Montanha de Poder', rank: 'Event', skills: [
    { id: 's1', name: 'Bite', description: '15 damage' }, { id: 's2', name: 'Rock Slide', description: '25 damage' }, { id: 's3', name: 'Sandstorm', description: 'Damage all' }, { id: 's4', name: 'Earthquake', description: '40 damage' },
  ]},
];

const RANK_COLORS: Record<string, string> = {
  'D': '#78909C', 'C': '#66BB6A', 'B': '#42A5F5',
  'A': '#AB47BC', 'S': '#FFD700', 'Event': '#FF7043',
};

// ============ TYPE COLORS ============
const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
  psychic: '#F85888', ghost: '#705898', dragon: '#7038F8', fighting: '#C03028',
  normal: '#A8A878', rock: '#B8A038', steel: '#B8B8D0', ice: '#98D8D8',
  dark: '#705848', fairy: '#EE99AC', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', bug: '#A8B820',
};

const getSprite = (id: number) => `/pokemon-anime/${id}.png`;
const getPortrait = (id: number) => `/pokemon-portraits/${id}.png?v=4`;
const getFallbackSprite = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, id: number) => {
  const img = e.target as HTMLImageElement;
  if (!img.src.includes('githubusercontent')) {
    img.src = getFallbackSprite(id);
  }
};

// ============ MAIN COMPONENT ============
const CHARS_PER_PAGE = 24; // 8 columns x 3 rows like NA

export default function PlayPage() {
  const router = useRouter();
  const { playBgm } = useSounds();
  const [hoveredPokemon, setHoveredPokemon] = useState<Pokemon | null>(null);
  const [hoveredMission, setHoveredMission] = useState<string | null>(null);
  const [selectedSkillIdx, setSelectedSkillIdx] = useState<number>(0);
  const [team, setTeam] = useState<(Pokemon | null)[]>([null, null, null]);
  const [user, setUser] = useState({ name: 'TRAINER', clan: 'CLANLESS', level: 1, wins: 0, losses: 0 });
  const [unlockedMissionPokemon, setUnlockedMissionPokemon] = useState<Set<string>>(new Set());
  const [gridPage, setGridPage] = useState(0);

  // Play team-select music on mount
  useEffect(() => { playBgm('menu'); }, [playBgm]);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser({
        name: d.user.username?.toUpperCase() || 'TRAINER',
        clan: d.user.clan?.name?.toUpperCase() || 'CLANLESS',
        level: d.user.level || 1,
        wins: d.user.wins || 0,
        losses: d.user.losses || 0,
      });
    }).catch(() => {});

    // Fetch completed missions to know which Pokemon are unlocked
    fetch('/api/missions?myProgress=true').then(r => r.json()).then(d => {
      if (d.data) {
        const completed = new Set<string>();
        for (const m of d.data) {
          if (m.userStatus === 'completed' && m.rewardPokemon) {
            completed.add(m.rewardPokemon.toLowerCase());
          }
        }
        setUnlockedMissionPokemon(completed);
      }
    }).catch(() => {});
  }, []);

  const toggleTeam = useCallback((pokemon: Pokemon) => {
    const existingIdx = team.findIndex(p => p?.id === pokemon.id);
    if (existingIdx !== -1) {
      const newTeam = [...team];
      newTeam[existingIdx] = null;
      setTeam(newTeam);
    } else {
      const emptyIdx = team.findIndex(p => p === null);
      if (emptyIdx !== -1) {
        const newTeam = [...team];
        newTeam[emptyIdx] = pokemon;
        setTeam(newTeam);
      }
    }
  }, [team]);

  const removeFromTeam = useCallback((index: number) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  }, []);

  const teamComplete = team.every(p => p !== null);
  const teamCount = team.filter(p => p !== null).length;

  const startBattle = useCallback(async (mode: string) => {
    if (!teamComplete) return;

    const selectedPokemon = team.filter(p => p !== null).map(p => ({
      id: p!.id, name: p!.name, type: p!.type, description: p!.description, skills: p!.skills,
    }));

    localStorage.setItem('battleTeam', JSON.stringify(selectedPokemon));

    try {
      const pokemonIds = selectedPokemon.map(p => p.name);
      await fetch('/api/trainer/battle-team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonNames: pokemonIds }),
      });
    } catch (e) {
      logger.info('Could not save to API, using localStorage');
    }

    if (mode === 'pvp' || mode === 'quick' || mode === 'ladder') {
      const queueType = mode === 'ladder' ? 'ranked' : 'quick';
      window.location.href = `/multiplayer?queue=${queueType}`;
    } else {
      window.location.href = '/battle/ai';
    }
  }, [teamComplete, team, router]);

  // Combine all Pokemon for pagination
  const allChars: (Pokemon | MissionPokemon)[] = [...ALL_POKEMON, ...MISSION_POKEMON];
  const totalPages = Math.ceil(allChars.length / CHARS_PER_PAGE);
  const pageChars = allChars.slice(gridPage * CHARS_PER_PAGE, (gridPage + 1) * CHARS_PER_PAGE);

  const displayPokemon = hoveredPokemon || team.find(p => p !== null) || ALL_POKEMON[0];

  return (
    <div className="na-page">
      <div className="na-device">
        {/* === TITLE: POKEMON ARENA (like mockup) === */}
        <div className="na-title-header">
          <span className="na-title-text">
            <span className="na-title-pokeball" />
            {' POKÉMON ARENA '}
            <span className="na-title-pokeball" />
          </span>
        </div>

        {/* === TOP: Character Info Panel === */}
        <div className="na-info-panel">
          <div className="na-info-layout">
            {/* Left: BIG portrait */}
            <div className="na-info-portrait-big">
              <img
                src={getSprite(displayPokemon.id)}
                alt={displayPokemon.name}
                onError={(e) => { (e.target as HTMLImageElement).src = getPortrait(displayPokemon.id); }}
              />
            </div>
            {/* Right: Name + Skills with labels + Description */}
            <div className="na-info-right">
              <div className="na-info-name">
                {displayPokemon.name.toUpperCase()}
                <span
                  className="na-type-badge"
                  style={{ backgroundColor: TYPE_COLORS[displayPokemon.type] || '#888' }}
                  title={displayPokemon.type}
                />
              </div>
              <div className="na-info-skills-row">
                {displayPokemon.skills.map((skill, i) => (
                  <div
                    key={i}
                    className={`na-info-skill ${selectedSkillIdx === i ? 'active' : ''}`}
                    onClick={() => setSelectedSkillIdx(i)}
                    onMouseEnter={() => setSelectedSkillIdx(i)}
                  >
                    <div className="na-info-skill-img">
                      <img
                        src={`/skills/${displayPokemon.id}/${i}.png`}
                        alt={skill.name}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = getSprite(displayPokemon.id);
                        }}
                      />
                    </div>
                    <div className="na-skill-label">
                      {skill.name}
                      {selectedSkillIdx === i && (
                        <span
                          className="na-skill-type-badge"
                          style={{ backgroundColor: TYPE_COLORS[displayPokemon.type] || '#888' }}
                        >
                          {displayPokemon.type.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="na-info-desc-area">
                {selectedSkillIdx !== null && displayPokemon.skills[selectedSkillIdx] ? (() => {
                  const sk = displayPokemon.skills[selectedSkillIdx];
                  const desc = sk.description;
                  const cdMatch = desc.match(/CD:\s*(\d+)/i);
                  const cooldown = cdMatch ? cdMatch[1] : null;
                  const isOffensive = /\d+\s*(damage|piercing|dano)/i.test(desc);
                  const isHealing = /heal|recover|cur[ae]/i.test(desc);
                  const isDefensive = /reduction|invulnerable|invuln|block|protect|shield/i.test(desc);
                  const isStun = /stun/i.test(desc);
                  const isBurn = /burn/i.test(desc);
                  const isDrain = /drain/i.test(desc);
                  const classes: string[] = [];
                  if (isOffensive) classes.push('OFFENSIVE');
                  if (isHealing) classes.push('HEALING');
                  if (isDefensive) classes.push('DEFENSIVE');
                  if (isStun) classes.push('STUN');
                  if (isBurn) classes.push('BURN');
                  if (isDrain) classes.push('DRAIN-HP');
                  if (!isOffensive && !isHealing && !isDefensive) classes.push('STATUS');
                  const colorized = desc.replace(/(\d+)\s*(damage|piercing damage|dano|HP|turns?|charges?)/gi, '<em>$1 $2</em>');
                  return (
                    <>
                      <div className="na-skill-detail-name">{sk.name.toUpperCase()}</div>
                      <p className="na-info-desc-text" dangerouslySetInnerHTML={{ __html: colorized }} />
                      <div className="na-skill-detail-meta">
                        <div className="na-skill-meta-line">
                          <span className="na-meta-label">ENERGY:</span>
                          <span className="na-energy-square" style={{ background: TYPE_COLORS[displayPokemon.type] || '#888' }} />
                        </div>
                        <div className="na-skill-meta-line">
                          <span className="na-meta-label">CLASSES:</span>
                          <span className="na-meta-value">{classes.join(', ')}</span>
                        </div>
                        <div className="na-skill-meta-line">
                          <span className="na-meta-label">COOLDOWN:</span>
                          <span className="na-meta-value">{cooldown || 'NONE'}</span>
                        </div>
                      </div>
                    </>
                  );
                })() : (
                  <p className="na-info-desc-text">{displayPokemon.description}</p>
                )}
              </div>
              {hoveredMission && (
                <div className="na-info-mission">
                  <span>&#128274; MISSION: {hoveredMission}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === MIDDLE: Action Buttons with pokeball dividers === */}
        <div className="na-buttons-row">
          <button className="na-btn logout" onClick={() => router.push('/')}>LOGOUT</button>
          <span className="na-btn-pokeball" />
          <button className="na-btn battle" onClick={() => startBattle('ai')} disabled={!teamComplete}>START AI GAME</button>
          <span className="na-btn-pokeball" />
          <button className="na-btn quick" onClick={() => startBattle('quick')} disabled={!teamComplete}>START QUICK GAME</button>
          <span className="na-btn-pokeball" />
          <button className="na-btn ladder" onClick={() => startBattle('ladder')} disabled={!teamComplete}>START RANKED</button>
        </div>

        {/* === BOTTOM: Grid + Player in one panel === */}
        <div className="na-bottom-panel">
          {/* Left: Character Grid */}
          <div className="na-grid-section">
            {/* Section label */}
            <div className="na-section-label">
              <span className="na-label-pokeball" />
              {'SELECT A POKÉMON'}
              <span className="na-label-pokeball" />
            </div>
            <div className="na-grid-row">
              <button
                className="grid-arrow grid-arrow-left"
                onClick={() => setGridPage(p => Math.max(0, p - 1))}
                disabled={gridPage === 0}
              >&#9664;</button>
              <div className="pokemon-grid">
                {pageChars.map((pokemon) => {
                  const isMission = 'missionName' in pokemon;
                  const isUnlocked = isMission ? unlockedMissionPokemon.has(pokemon.name.toLowerCase()) : true;
                  const inTeam = team.some(p => p?.id === pokemon.id);
                  return (
                    <div
                      key={pokemon.id}
                      className={`pokemon-cell ${isUnlocked ? (inTeam ? 'in-team' : '') : 'locked'}`}
                      onClick={() => isUnlocked && toggleTeam(pokemon)}
                      onMouseEnter={() => { setHoveredPokemon(pokemon); setSelectedSkillIdx(0); setHoveredMission(!isUnlocked && isMission ? (pokemon as MissionPokemon).missionName : null); }}
                      onMouseLeave={() => { setHoveredPokemon(null); setHoveredMission(null); }}
                    >
                      <img src={getSprite(pokemon.id)} alt={pokemon.name} onError={(e) => { (e.target as HTMLImageElement).src = getPortrait(pokemon.id); }} />
                      {!isUnlocked && isMission && (
                        <>
                          <div className="lock-overlay"><span className="lock-icon">&#128274;</span></div>
                          <div className="rank-badge-cell" style={{ background: RANK_COLORS[(pokemon as MissionPokemon).rank] || '#666' }}>{(pokemon as MissionPokemon).rank}</div>
                        </>
                      )}
                      {isUnlocked && inTeam && <div className="check-mark">&#10003;</div>}
                    </div>
                  );
                })}
                {/* Fill empty cells */}
                {pageChars.length < CHARS_PER_PAGE && Array.from({ length: CHARS_PER_PAGE - pageChars.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="pokemon-cell empty" />
                ))}
              </div>
              <button
                className="grid-arrow grid-arrow-right"
                onClick={() => setGridPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={gridPage >= totalPages - 1}
              >&#9654;</button>
            </div>
          </div>

          {/* Right: Player Info + Team Slots */}
          <div className="na-player-section">
            {/* Trainer label */}
            <div className="na-section-label">
              <span className="na-label-pokeball" />
              TRAINER
              <span className="na-label-pokeball" />
            </div>
            <div className="na-player-avatar">
              <img src="/pokemon-anime/25.png" alt="avatar" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div className="na-player-stats-block">
              <div className="na-pstat-line"><strong>{user.name.toUpperCase()}</strong></div>
              <div className="na-pstat-line"><span className="na-stat-icon">&#11088;</span> LEVEL: {user.level}</div>
              <div className="na-pstat-line"><span className="na-stat-icon">&#127942;</span> RANK: {user.clan || 'ACE'}</div>
              <div className="na-pstat-line"><span className="na-stat-icon">&#9876;</span> RECORD: {user.wins}-{user.losses}</div>
            </div>
            <div className="na-team-bottom">
              {/* Your Team label */}
              <div className="na-section-label">
                <span className="na-label-pokeball" />
                YOUR TEAM
                <span className="na-label-pokeball" />
              </div>
              <div className="na-team-slots">
                {team.map((pokemon, idx) => (
                  <div key={idx} className={`na-team-slot ${pokemon ? 'filled' : ''}`} onClick={() => pokemon && removeFromTeam(idx)}>
                    {pokemon ? (
                      <>
                        <img src={getSprite(pokemon.id)} alt={pokemon.name} />
                        <div className="na-slot-remove">&#10005;</div>
                      </>
                    ) : (
                      <span className="na-slot-empty">{idx + 1}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="na-team-hint">
                {teamCount < 3 ? `SELECT ${3 - teamCount} MORE POKÉMON TO BUILD YOUR TEAM` : 'YOU ARE READY TO START A GAME'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
