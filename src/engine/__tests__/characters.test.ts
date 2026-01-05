/**
 * Pokémon Arena - Character Tests
 * 
 * Tests for the Pokémon character system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBattleState,
  createTeam,
  ALL_POKEMON,
  getPokemonById,
  createPikachu,
  createCharizard,
  DeterministicRandom,
  resolveTurn,
  type ActionIntent,
  type BattleState,
} from '../index';

describe('Character System', () => {
  describe('Pokemon Registry', () => {
    it('should have all 15 Pokemon', () => {
      expect(ALL_POKEMON.length).toBe(15);
    });

    it('should create Pokemon by ID', () => {
      const creator = getPokemonById('pikachu');
      expect(creator).toBeDefined();
      
      const pikachu = creator!(0);
      expect(pikachu.name).toBe('Pikachu');
      expect(pikachu.slot).toBe(0);
      expect(pikachu.skills.length).toBe(4);
    });

    it('should create a team from Pokemon IDs', () => {
      const team = createTeam(['pikachu', 'charizard', 'blastoise'], 0);
      expect(team.length).toBe(3);
      expect(team[0].name).toBe('Pikachu');
      expect(team[1].name).toBe('Charizard');
      expect(team[2].name).toBe('Blastoise');
      expect(team[0].slot).toBe(0);
      expect(team[1].slot).toBe(1);
      expect(team[2].slot).toBe(2);
    });
  });

  describe('Pokemon Skills', () => {
    let pikachu: ReturnType<typeof createPikachu>;
    let charizard: ReturnType<typeof createCharizard>;

    beforeEach(() => {
      pikachu = createPikachu(0);
      charizard = createCharizard(3);
    });

    it('Pikachu should have correct skills', () => {
      expect(pikachu.skills[0].name).toBe('Thunderbolt');
      expect(pikachu.skills[1].name).toBe('Thunder');
      expect(pikachu.skills[2].name).toBe('Thunder Wave');
      expect(pikachu.skills[3].name).toBe('Agility');
    });

    it('Charizard should have correct skills', () => {
      expect(charizard.skills[0].name).toBe('Flamethrower');
      expect(charizard.skills[1].name).toBe('Fire Blast');
      expect(charizard.skills[2].name).toBe('Dragon Dance');
      expect(charizard.skills[3].name).toBe('Fly');
    });

    it('Skill costs should be correctly defined', () => {
      // Thunderbolt costs 1 electric
      expect(pikachu.skills[0].cost.electric).toBe(1);
      expect(pikachu.skills[0].cost.fire).toBe(0);
      
      // Flamethrower costs 1 fire + 1 random
      expect(charizard.skills[0].cost.fire).toBe(1);
      expect(charizard.skills[0].cost.random).toBe(1);
    });

    it('Skill cooldowns should be correctly defined', () => {
      // Thunderbolt has no cooldown
      expect(pikachu.skills[0].cooldown).toBe(0);
      
      // Thunder has 2 turn cooldown
      expect(pikachu.skills[1].cooldown).toBe(2);
      
      // Agility (invuln) has 4 turn cooldown
      expect(pikachu.skills[3].cooldown).toBe(4);
    });
  });

  describe('Battle Integration', () => {
    let state: BattleState;
    let rng: DeterministicRandom;

    beforeEach(() => {
      const playerTeam = createTeam(['pikachu', 'charizard', 'blastoise'], 0);
      const opponentTeam = createTeam(['mewtwo', 'gengar', 'alakazam'], 3);
      state = createBattleState(playerTeam, opponentTeam);
      state = {
        ...state,
        playerEnergy: { fire: 5, water: 5, grass: 5, electric: 5, random: 5 },
        opponentEnergy: { fire: 5, water: 5, grass: 5, electric: 5, random: 5 },
      };
      rng = new DeterministicRandom(42);
    });

    it('should create valid battle state with Pokemon teams', () => {
      expect(state.fighters.length).toBe(6);
      expect(state.fighters[0].name).toBe('Pikachu');
      expect(state.fighters[3].name).toBe('Mewtwo');
    });

    it('should execute Thunderbolt on enemy', () => {
      const playerActions: ActionIntent[] = [
        { userSlot: 0, skillIndex: 0, targetSlot: 3 }, // Pikachu uses Thunderbolt on Mewtwo
      ];

      const result = resolveTurn(state, playerActions, [], rng);
      
      // Mewtwo should have taken damage
      const mewtwo = result.state.fighters.find(f => f.name === 'Mewtwo')!;
      expect(mewtwo.health).toBeLessThan(100);
    });

    it('should execute Thunder and deal damage', () => {
      const playerActions: ActionIntent[] = [
        { userSlot: 0, skillIndex: 1, targetSlot: 3 }, // Pikachu uses Thunder on Mewtwo
      ];

      const result = resolveTurn(state, playerActions, [], rng);
      
      const mewtwo = result.state.fighters.find(f => f.name === 'Mewtwo')!;
      // Mewtwo should have taken 40 damage
      // 40 damage = 60 health remaining
      expect(mewtwo.health).toBeLessThanOrEqual(60);
    });

    it('should apply Fly invulnerability (visible in log)', () => {
      const playerActions: ActionIntent[] = [
        { userSlot: 1, skillIndex: 3, targetSlot: 1 }, // Charizard uses Fly (self)
      ];

      const result = resolveTurn(state, playerActions, [], rng);
      
      // Check log for invulnerability application
      const hasInvulnLog = result.log.some(l => 
        l.type === 'effect_applied' && l.message.includes('Invulnerable')
      );
      expect(hasInvulnLog).toBe(true);
    });

    it('should apply defense with Iron Defense', () => {
      // Create state with Blastoise
      const playerActions: ActionIntent[] = [
        { userSlot: 2, skillIndex: 2, targetSlot: 2 }, // Blastoise uses Iron Defense
      ];

      const result = resolveTurn(state, playerActions, [], rng);
      
      const blastoise = result.state.fighters.find(f => f.name === 'Blastoise')!;
      expect(blastoise.defense.length).toBe(1);
      expect(blastoise.defense[0].amount).toBe(40);
    });
  });

  describe('All Pokemon Have Valid Skills', () => {
    it.each(ALL_POKEMON)('$name should have 4 valid skills', ({ create }) => {
      const pokemon = create(0);
      
      expect(pokemon.skills.length).toBe(4);
      
      for (const skill of pokemon.skills) {
        expect(skill.name).toBeTruthy();
        expect(skill.description).toBeTruthy();
        expect(skill.start.length).toBeGreaterThan(0);
      }
    });

    it.each(ALL_POKEMON)('$name should have an invulnerability or defensive skill', ({ create, name }) => {
      const pokemon = create(0);
      
      // Check if at least one skill provides invuln, defense, heal, or sustain
      const hasDefensiveSkill = pokemon.skills.some(skill => 
        // Invulnerability skills
        skill.name.includes('Fly') ||
        skill.name.includes('Agility') ||
        skill.name.includes('Teleport') ||
        skill.name.includes('Withdraw') ||
        skill.name.includes('Shadow Sneak') ||
        skill.name.includes('Protect') ||
        skill.name.includes('Dig') ||
        skill.name.includes('Bounce') ||
        skill.name.includes('Extreme Speed') ||
        // Defense skills
        skill.name.includes('Barrier') ||
        skill.name.includes('Iron Defense') ||
        skill.name.includes('Block') ||
        skill.name.includes('No Guard') ||
        // Heal skills
        skill.name.includes('Recover') ||
        skill.name.includes('Rest') ||
        skill.name.includes('Roost') ||
        // Sustain skills
        skill.name.includes('Sunny Day') ||
        skill.name.includes('Leech Seed') ||
        skill.name.includes('Dragon Dance') ||
        skill.name.includes('Bulk Up') ||
        // Counter skills
        skill.name.includes('Counter')
      );
      
      expect(hasDefensiveSkill).toBe(true);
    });
  });
});
