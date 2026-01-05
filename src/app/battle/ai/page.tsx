/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import './battle.css';

// ============ TYPES ============
type EnergyType = 'fire' | 'water' | 'grass' | 'electric' | 'colorless';

interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  colorless: number;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  type: EnergyType;
  cost: Partial<Energy>;
  cooldown: number;
  currentCooldown: number;
  damage: number;
  healing?: number;
  effects?: string[];
  classes: string[];
  image: string;
}

interface Pokemon {
  id: string;
  slot: number;
  name: string;
  type: EnergyType;
  health: number;
  maxHealth: number;
  alive: boolean;
  skills: Skill[];
  portrait: string;
  sprite: string;
}

interface QueuedAction {
  userSlot: number;
  skillIdx: number;
  targetSlot: number;
  targetTeam: 'player' | 'ai';
  skill: Skill;
}

type Phase = 'loading' | 'player-turn' | 'executing' | 'ai-turn' | 'victory' | 'defeat';

// ============ SKILL IMAGES ============
const getSkillImage = (type: EnergyType, idx: number): string => {
  const images: Record<EnergyType, string[]> = {
    electric: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magnet.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/light-ball.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/zap-plate.png',
    ],
    fire: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charcoal.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-orb.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-plate.png',
    ],
    water: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mystic-water.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/splash-plate.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/wave-incense.png',
    ],
    grass: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/miracle-seed.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/meadow-plate.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rose-incense.png',
    ],
    colorless: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/normal-gem.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/silk-scarf.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eviolite.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png',
    ],
  };
  return images[type][idx % 4];
};

// ============ CREATE SKILL HELPER ============
const createSkill = (
  id: string,
  name: string,
  description: string,
  type: EnergyType,
  cost: Partial<Energy>,
  damage: number,
  cooldown: number,
  classes: string[],
  idx: number,
  effects?: string[],
  healing?: number
): Skill => ({
  id,
  name,
  description,
  type,
  cost,
  damage,
  healing,
  cooldown,
  currentCooldown: 0,
  classes,
  effects,
  image: getSkillImage(type, idx),
});

// ============ POKEMON DATA ============
const createPlayerTeam = (): Pokemon[] => [
  {
    id: 'pikachu',
    slot: 0,
    name: 'Pikachu',
    type: 'electric',
    health: 100,
    maxHealth: 100,
    alive: true,
    portrait: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    skills: [
      createSkill('thunder-shock', 'Thunder Shock', 'Zaps the target with electricity dealing 20 damage.', 'electric', { electric: 1 }, 20, 0, ['Ranged', 'Instant'], 0),
      createSkill('thunderbolt', 'Thunderbolt', 'A powerful electric attack dealing 45 damage.', 'electric', { electric: 2 }, 45, 1, ['Ranged', 'Instant'], 1),
      createSkill('agility', 'Agility', 'Pikachu becomes INVULNERABLE for 1 turn.', 'colorless', { colorless: 1 }, 0, 3, ['Mental', 'Buff', 'Instant'], 2, ['invulnerable']),
      createSkill('volt-tackle', 'Volt Tackle', 'Charges with electricity for 60 damage. Recoil: 15 to self.', 'electric', { electric: 2, colorless: 1 }, 60, 2, ['Physical', 'Melee'], 3),
    ],
  },
  {
    id: 'charizard',
    slot: 1,
    name: 'Charizard',
    type: 'fire',
    health: 120,
    maxHealth: 120,
    alive: true,
    portrait: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    skills: [
      createSkill('ember', 'Ember', 'A small flame attack dealing 15 damage.', 'fire', { fire: 1 }, 15, 0, ['Ranged', 'Instant'], 0),
      createSkill('flamethrower', 'Flamethrower', 'Breathes intense flames dealing 50 damage.', 'fire', { fire: 2 }, 50, 1, ['Ranged', 'Instant'], 1),
      createSkill('dragon-rage', 'Dragon Rage', 'Unleashes draconic fury for 40 fixed damage. PIERCING.', 'fire', { fire: 1, colorless: 1 }, 40, 2, ['Ranged', 'Piercing'], 2),
      createSkill('fire-blast', 'Fire Blast', 'Massive fire attack dealing 65 damage to ONE enemy.', 'fire', { fire: 3 }, 65, 3, ['Ranged', 'Ultimate'], 3),
    ],
  },
  {
    id: 'blastoise',
    slot: 2,
    name: 'Blastoise',
    type: 'water',
    health: 130,
    maxHealth: 130,
    alive: true,
    portrait: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    skills: [
      createSkill('water-gun', 'Water Gun', 'Shoots water at the target for 20 damage.', 'water', { water: 1 }, 20, 0, ['Ranged', 'Instant'], 0),
      createSkill('hydro-pump', 'Hydro Pump', 'Blasts with extreme pressure for 55 damage.', 'water', { water: 2, colorless: 1 }, 55, 2, ['Ranged', 'Instant'], 1),
      createSkill('withdraw', 'Withdraw', 'Gains 25 DESTRUCTIBLE DEFENSE for 2 turns.', 'colorless', { colorless: 1 }, 0, 3, ['Defense', 'Buff', 'Instant'], 2, ['defense']),
      createSkill('skull-bash', 'Skull Bash', 'Powerful headbutt dealing 50 damage.', 'water', { water: 1, colorless: 1 }, 50, 2, ['Physical', 'Melee'], 3),
    ],
  },
];

const createAITeam = (): Pokemon[] => [
  {
    id: 'mewtwo',
    slot: 0,
    name: 'Mewtwo',
    type: 'colorless',
    health: 150,
    maxHealth: 150,
    alive: true,
    portrait: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    skills: [
      createSkill('confusion', 'Confusion', 'Psychic attack dealing 25 damage.', 'colorless', { colorless: 1 }, 25, 0, ['Ranged', 'Mental'], 0),
      createSkill('psychic', 'Psychic', 'Powerful psychic blast for 60 damage.', 'colorless', { colorless: 2 }, 60, 2, ['Ranged', 'Mental'], 1),
      createSkill('barrier', 'Barrier', 'Creates a barrier, INVULNERABLE for 1 turn.', 'colorless', { colorless: 1 }, 0, 4, ['Defense', 'Invulnerable'], 2, ['invulnerable']),
      createSkill('recover', 'Recover', 'Restores 50 HP to self.', 'colorless', { colorless: 2 }, 0, 4, ['Healing'], 3, [], 50),
    ],
  },
  {
    id: 'gengar',
    slot: 1,
    name: 'Gengar',
    type: 'colorless',
    health: 100,
    maxHealth: 100,
    alive: true,
    portrait: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    skills: [
      createSkill('shadow-ball', 'Shadow Ball', 'Hurls a shadowy blob for 30 damage.', 'colorless', { colorless: 1 }, 30, 0, ['Ranged', 'Affliction'], 0),
      createSkill('dream-eater', 'Dream Eater', 'Deals 45 damage and heals Gengar 20 HP.', 'colorless', { colorless: 2 }, 45, 2, ['Ranged', 'Drain'], 1, [], 20),
      createSkill('hypnosis', 'Hypnosis', 'STUNS target for 1 turn.', 'colorless', { colorless: 1 }, 0, 3, ['Mental', 'Control'], 2, ['stun']),
      createSkill('destiny-bond', 'Destiny Bond', 'If Gengar is KOd this turn, attacker also faints.', 'colorless', { colorless: 2 }, 0, 4, ['Unique'], 3),
    ],
  },
  {
    id: 'dragonite',
    slot: 2,
    name: 'Dragonite',
    type: 'fire',
    health: 140,
    maxHealth: 140,
    alive: true,
    portrait: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    skills: [
      createSkill('dragon-breath', 'Dragon Breath', 'Exhales destructive breath for 25 damage.', 'fire', { fire: 1 }, 25, 0, ['Ranged', 'Instant'], 0),
      createSkill('outrage', 'Outrage', 'Rampages dealing 65 damage.', 'fire', { fire: 2, colorless: 1 }, 65, 2, ['Physical', 'Melee'], 1),
      createSkill('dragon-dance', 'Dragon Dance', 'Boosts damage by 15 for 3 turns.', 'colorless', { colorless: 1 }, 0, 3, ['Mental', 'Buff'], 2),
      createSkill('hyper-beam', 'Hyper Beam', 'Devastating beam for 80 damage. Stuns self next turn.', 'colorless', { colorless: 3 }, 80, 4, ['Ranged', 'Ultimate'], 3),
    ],
  },
];

// ============ HELPER FUNCTIONS ============
const getHpClass = (hp: number, max: number): string => {
  const pct = (hp / max) * 100;
  if (pct <= 25) return 'low';
  if (pct <= 50) return 'medium';
  return '';
};

const canAfford = (cost: Partial<Energy>, energy: Energy): boolean => {
  if ((cost.fire || 0) > energy.fire) return false;
  if ((cost.water || 0) > energy.water) return false;
  if ((cost.grass || 0) > energy.grass) return false;
  if ((cost.electric || 0) > energy.electric) return false;
  
  const specificCost = (cost.fire || 0) + (cost.water || 0) + (cost.grass || 0) + (cost.electric || 0);
  const colorlessNeeded = cost.colorless || 0;
  const totalAvailable = energy.fire + energy.water + energy.grass + energy.electric + energy.colorless - specificCost;
  
  return totalAvailable >= colorlessNeeded;
};

const spendEnergy = (cost: Partial<Energy>, energy: Energy): Energy => {
  const newEnergy = { ...energy };
  newEnergy.fire -= cost.fire || 0;
  newEnergy.water -= cost.water || 0;
  newEnergy.grass -= cost.grass || 0;
  newEnergy.electric -= cost.electric || 0;
  
  let colorlessNeeded = cost.colorless || 0;
  const types: EnergyType[] = ['colorless', 'fire', 'water', 'grass', 'electric'];
  for (const type of types) {
    while (colorlessNeeded > 0 && newEnergy[type] > 0) {
      newEnergy[type]--;
      colorlessNeeded--;
    }
  }
  
  return newEnergy;
};

const getTotalEnergyCost = (cost: Partial<Energy>): number => {
  return (cost.fire || 0) + (cost.water || 0) + (cost.grass || 0) + (cost.electric || 0) + (cost.colorless || 0);
};

// ============ MAIN COMPONENT ============
export default function AIBattlePage() {
  const router = useRouter();
  
  // Game state
  const [phase, setPhase] = useState<Phase>('loading');
  const [turn, setTurn] = useState(1);
  const [timer, setTimer] = useState(90);
  
  // Teams
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [aiTeam, setAiTeam] = useState<Pokemon[]>([]);
  
  // Energy
  const [playerEnergy, setPlayerEnergy] = useState<Energy>({ fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 });
  
  // Actions
  const [selectedSkill, setSelectedSkill] = useState<{ slot: number; skillIdx: number } | null>(null);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  
  // UI state
  const [hoveredSkill, setHoveredSkill] = useState<{ skill: Skill; pokemon: Pokemon } | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [damagePopups, setDamagePopups] = useState<{ id: number; x: number; y: number; value: number; isHeal: boolean }[]>([]);
  
  // Remaining energy after queued actions
  const remainingEnergy = useMemo((): Energy => {
    let energy = { ...playerEnergy };
    queuedActions.forEach(action => {
      energy = spendEnergy(action.skill.cost, energy);
    });
    return energy;
  }, [playerEnergy, queuedActions]);
  
  // Generate random energy
  const generateTurnEnergy = useCallback((): Energy => {
    const types: EnergyType[] = ['fire', 'water', 'grass', 'electric', 'colorless'];
    const newEnergy: Energy = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
    for (let i = 0; i < 4; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      newEnergy[type]++;
    }
    return newEnergy;
  }, []);
  
  // Initialize game
  useEffect(() => {
    const initTimer = setTimeout(() => {
      const pTeam = createPlayerTeam();
      const aTeam = createAITeam();
      setPlayerTeam(pTeam);
      setAiTeam(aTeam);
      setSelectedPokemon(pTeam[0]);
      setPlayerEnergy(generateTurnEnergy());
      setPhase('player-turn');
    }, 1500);
    return () => clearTimeout(initTimer);
  }, [generateTurnEnergy]);
  
  // Timer countdown
  useEffect(() => {
    if (phase !== 'player-turn') return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Auto-execute turn when timer runs out
          executeTurn();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  
  // Show damage popup
  const showDamagePopup = useCallback((slot: number, team: 'player' | 'ai', value: number, isHeal: boolean) => {
    const id = Date.now() + Math.random();
    const baseX = team === 'player' ? 180 : window.innerWidth - 180;
    const y = 180 + slot * 120;
    
    setDamagePopups(prev => [...prev, { id, x: baseX, y, value, isHeal }]);
    setTimeout(() => {
      setDamagePopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);
  
  // Handle skill click
  const handleSkillClick = useCallback((pokemon: Pokemon, skillIdx: number) => {
    if (phase !== 'player-turn') return;
    if (!pokemon.alive) return;
    
    const skill = pokemon.skills[skillIdx];
    if (skill.currentCooldown > 0) return;
    if (!canAfford(skill.cost, remainingEnergy)) return;
    
    // Toggle off if already selected
    if (selectedSkill?.slot === pokemon.slot && selectedSkill?.skillIdx === skillIdx) {
      setSelectedSkill(null);
      return;
    }
    
    // If already queued, remove it
    const existingIdx = queuedActions.findIndex(a => a.userSlot === pokemon.slot && a.skillIdx === skillIdx);
    if (existingIdx >= 0) {
      setQueuedActions(prev => prev.filter((_, i) => i !== existingIdx));
      return;
    }
    
    setSelectedSkill({ slot: pokemon.slot, skillIdx });
    setSelectedPokemon(pokemon);
    setHoveredSkill({ skill, pokemon });
  }, [phase, remainingEnergy, selectedSkill, queuedActions]);
  
  // Handle target selection
  const handleTargetClick = useCallback((targetSlot: number, targetTeam: 'player' | 'ai') => {
    if (!selectedSkill) return;
    
    const user = playerTeam.find(p => p.slot === selectedSkill.slot);
    if (!user) return;
    
    const skill = user.skills[selectedSkill.skillIdx];
    
    setQueuedActions(prev => [...prev, {
      userSlot: selectedSkill.slot,
      skillIdx: selectedSkill.skillIdx,
      targetSlot,
      targetTeam,
      skill,
    }]);
    
    setSelectedSkill(null);
  }, [selectedSkill, playerTeam]);
  
  // Remove action from queue
  const removeFromQueue = useCallback((idx: number) => {
    setQueuedActions(prev => prev.filter((_, i) => i !== idx));
  }, []);
  
  // Execute player turn
  const executeTurn = useCallback(async () => {
    if (phase !== 'player-turn') return;
    setPhase('executing');
    
    // Execute player actions
    for (const action of queuedActions) {
      await new Promise(r => setTimeout(r, 600));
      
      const user = playerTeam.find(p => p.slot === action.userSlot);
      if (!user || !user.alive) continue;
      
      // Apply damage
      if (action.skill.damage > 0 && action.targetTeam === 'ai') {
        const targetIdx = aiTeam.findIndex(p => p.slot === action.targetSlot);
        if (targetIdx >= 0 && aiTeam[targetIdx].alive) {
          const damage = action.skill.damage;
          showDamagePopup(action.targetSlot, 'ai', damage, false);
          
          setAiTeam(prev => prev.map(p => {
            if (p.slot === action.targetSlot) {
              const newHp = Math.max(0, p.health - damage);
              return { ...p, health: newHp, alive: newHp > 0 };
            }
            return p;
          }));
        }
      }
      
      // Apply healing
      if (action.skill.healing && action.skill.healing > 0) {
        showDamagePopup(action.userSlot, 'player', action.skill.healing, true);
        setPlayerTeam(prev => prev.map(p => {
          if (p.slot === action.userSlot) {
            const newHp = Math.min(p.maxHealth, p.health + (action.skill.healing || 0));
            return { ...p, health: newHp };
          }
          return p;
        }));
      }
      
      // Set cooldown
      setPlayerTeam(prev => prev.map(p => {
        if (p.slot === action.userSlot) {
          const skills = [...p.skills];
          skills[action.skillIdx] = { 
            ...skills[action.skillIdx], 
            currentCooldown: action.skill.cooldown + 1
          };
          return { ...p, skills };
        }
        return p;
      }));
    }
    
    // Check win condition
    await new Promise(r => setTimeout(r, 400));
    const aiAlive = aiTeam.some(p => p.health > 0);
    if (!aiAlive) {
      setPhase('victory');
      return;
    }
    
    // AI Turn
    setPhase('ai-turn');
    await new Promise(r => setTimeout(r, 1000));
    
    // Simple AI: Each alive AI Pokemon uses a random available skill on random player
    const aiActions: { user: Pokemon; skill: Skill; targetSlot: number }[] = [];
    const aiEnergy = generateTurnEnergy();
    let availableEnergy = { ...aiEnergy };
    
    for (const aiPoke of aiTeam) {
      if (!aiPoke.alive || aiPoke.health <= 0) continue;
      
      const availableSkills = aiPoke.skills.filter(s => 
        s.currentCooldown === 0 && canAfford(s.cost, availableEnergy)
      );
      
      if (availableSkills.length > 0) {
        const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        const alivePlayerTargets = playerTeam.filter(p => p.alive && p.health > 0);
        if (alivePlayerTargets.length > 0) {
          const target = alivePlayerTargets[Math.floor(Math.random() * alivePlayerTargets.length)];
          aiActions.push({ user: aiPoke, skill, targetSlot: target.slot });
          availableEnergy = spendEnergy(skill.cost, availableEnergy);
        }
      }
    }
    
    // Execute AI actions
    for (const action of aiActions) {
      await new Promise(r => setTimeout(r, 600));
      
      if (action.skill.damage > 0) {
        showDamagePopup(action.targetSlot, 'player', action.skill.damage, false);
        
        setPlayerTeam(prev => prev.map(p => {
          if (p.slot === action.targetSlot) {
            const newHp = Math.max(0, p.health - action.skill.damage);
            return { ...p, health: newHp, alive: newHp > 0 };
          }
          return p;
        }));
      }
      
      // Set AI cooldowns
      setAiTeam(prev => prev.map(p => {
        if (p.slot === action.user.slot) {
          const skills = p.skills.map(s => 
            s.id === action.skill.id ? { ...s, currentCooldown: action.skill.cooldown + 1 } : s
          );
          return { ...p, skills };
        }
        return p;
      }));
    }
    
    // Check lose condition
    await new Promise(r => setTimeout(r, 400));
    const playerAlive = playerTeam.some(p => p.health > 0);
    if (!playerAlive) {
      setPhase('defeat');
      return;
    }
    
    // Reduce all cooldowns
    setPlayerTeam(prev => prev.map(p => ({
      ...p,
      skills: p.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) }))
    })));
    setAiTeam(prev => prev.map(p => ({
      ...p,
      skills: p.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) }))
    })));
    
    // New turn
    setQueuedActions([]);
    setTurn(prev => prev + 1);
    setPlayerEnergy(generateTurnEnergy());
    setTimer(90);
    setPhase('player-turn');
    
  }, [phase, queuedActions, playerTeam, aiTeam, generateTurnEnergy, showDamagePopup]);
  
  // Render loading screen
  if (phase === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-text">Preparando Batalha...</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Render game over
  if (phase === 'victory' || phase === 'defeat') {
    return (
      <div className="game-over-overlay">
        <div className={`game-over-text ${phase}`}>
          {phase === 'victory' ? '🏆 VITÓRIA!' : '💀 DERROTA'}
        </div>
        <button className="game-over-btn" onClick={() => router.push('/play')}>
          Voltar ao Menu
        </button>
      </div>
    );
  }
  
  const isSelectingTarget = selectedSkill !== null;
  
  return (
    <div className="battle-container">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="player-info">
          <div className="player-avatar">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" alt="Player" />
          </div>
          <div className="player-details">
            <div className="player-name">TREINADOR</div>
            <div className="player-title">Mestre Pokémon</div>
          </div>
        </div>
        
        <div className="center-info">
          <div className="turn-text">
            {phase === 'player-turn' ? 'SELECIONE SEUS MOVIMENTOS' : 
             phase === 'executing' ? 'EXECUTANDO...' : 
             phase === 'ai-turn' ? 'TURNO DO OPONENTE...' : ''}
          </div>
          <div className="timer-bar">
            <div className="timer-fill" style={{ width: `${(timer / 90) * 100}%` }}></div>
          </div>
          <div className="energy-display">
            <div className="energy-item">
              <div className="energy-icon fire">🔥</div>
              <span>x{remainingEnergy.fire}</span>
            </div>
            <div className="energy-item">
              <div className="energy-icon water">💧</div>
              <span>x{remainingEnergy.water}</span>
            </div>
            <div className="energy-item">
              <div className="energy-icon grass">🌿</div>
              <span>x{remainingEnergy.grass}</span>
            </div>
            <div className="energy-item">
              <div className="energy-icon electric">⚡</div>
              <span>x{remainingEnergy.electric}</span>
            </div>
            <div className="energy-item">
              <div className="energy-icon colorless">⭐</div>
              <span>x{remainingEnergy.colorless}</span>
            </div>
            <button className="exchange-btn">TROCAR ENERGIA</button>
          </div>
        </div>
        
        <div className="player-info right">
          <div className="player-avatar">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png" alt="Rival" />
          </div>
          <div className="player-details right">
            <div className="player-name">RIVAL</div>
            <div className="player-title">Treinador Elite</div>
          </div>
        </div>
      </div>
      
      {/* BATTLE AREA */}
      <div className="battle-area">
        {/* Player Team - Left */}
        <div className="team-column">
          {playerTeam.map(pokemon => (
            <div key={pokemon.id} className="char-row">
              <div className="portrait-box">
                <div 
                  className={`portrait ${!pokemon.alive ? 'dead' : ''} ${selectedPokemon?.id === pokemon.id ? 'selected' : ''}`}
                  onClick={() => pokemon.alive && setSelectedPokemon(pokemon)}
                >
                  <img src={pokemon.portrait} alt={pokemon.name} />
                </div>
                <div className="hp-bar-container">
                  <div className="hp-bar">
                    <div 
                      className={`hp-fill ${getHpClass(pokemon.health, pokemon.maxHealth)}`}
                      style={{ width: `${(pokemon.health / pokemon.maxHealth) * 100}%` }}
                    ></div>
                    <div className="hp-text">{pokemon.health}/{pokemon.maxHealth}</div>
                  </div>
                </div>
              </div>
              
              <div className="skills-grid">
                {pokemon.skills.map((skill, idx) => {
                  const isQueued = queuedActions.some(a => a.userSlot === pokemon.slot && a.skillIdx === idx);
                  const isSelected = selectedSkill?.slot === pokemon.slot && selectedSkill?.skillIdx === idx;
                  const canUse = pokemon.alive && skill.currentCooldown === 0 && canAfford(skill.cost, remainingEnergy);
                  
                  return (
                    <div
                      key={skill.id}
                      className={`skill-box ${isQueued ? 'queued' : ''} ${isSelected ? 'selected' : ''} ${!canUse ? 'disabled' : ''} ${skill.currentCooldown > 0 ? 'on-cooldown' : ''}`}
                      onClick={() => handleSkillClick(pokemon, idx)}
                      onMouseEnter={() => setHoveredSkill({ skill, pokemon })}
                      onMouseLeave={() => !selectedSkill && setHoveredSkill(null)}
                    >
                      <img src={skill.image} alt={skill.name} />
                      {skill.currentCooldown > 0 && (
                        <div className="skill-cooldown">{skill.currentCooldown}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Center - Selected Pokemon */}
        <div className="center-display">
          {selectedPokemon && (
            <div className="center-pokemon">
              <img src={selectedPokemon.sprite} alt={selectedPokemon.name} />
            </div>
          )}
          
          <button 
            className={`ready-btn ${queuedActions.length > 0 ? 'active' : ''}`}
            onClick={executeTurn}
            disabled={phase !== 'player-turn'}
          >
            PRONTO
          </button>
          <div className="turn-indicator">TURNO {turn}</div>
        </div>
        
        {/* AI Team - Right */}
        <div className="team-column right">
          {aiTeam.map(pokemon => (
            <div key={pokemon.id} className="char-row right">
              <div className="portrait-box">
                <div 
                  className={`portrait ${!pokemon.alive ? 'dead' : ''} ${isSelectingTarget && pokemon.alive ? 'targetable' : ''}`}
                  onClick={() => isSelectingTarget && pokemon.alive && handleTargetClick(pokemon.slot, 'ai')}
                >
                  <img src={pokemon.portrait} alt={pokemon.name} />
                </div>
                <div className="hp-bar-container">
                  <div className="hp-bar">
                    <div 
                      className={`hp-fill ${getHpClass(pokemon.health, pokemon.maxHealth)}`}
                      style={{ width: `${(pokemon.health / pokemon.maxHealth) * 100}%` }}
                    ></div>
                    <div className="hp-text">{pokemon.health}/{pokemon.maxHealth}</div>
                  </div>
                </div>
              </div>
              
              <div className="skills-grid">
                {pokemon.skills.map((skill) => (
                  <div key={skill.id} className="skill-box disabled">
                    <span className="skill-question">?</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Queue */}
      {queuedActions.length > 0 && (
        <div className="action-queue">
          {queuedActions.map((action, idx) => {
            const user = playerTeam.find(p => p.slot === action.userSlot);
            const target = action.targetTeam === 'ai' 
              ? aiTeam.find(p => p.slot === action.targetSlot)
              : playerTeam.find(p => p.slot === action.targetSlot);
            
            return (
              <div key={idx} className="queued-action" onClick={() => removeFromQueue(idx)}>
                <img src={action.skill.image} alt={action.skill.name} />
                <span className="arrow">→</span>
                <span className="target-name">{target?.name}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* BOTTOM BAR - Skill Info */}
      <div className="bottom-bar">
        <div className="surrender-section">
          <button className="surrender-btn" onClick={() => router.push('/play')}>RENDER-SE</button>
          <button className="chat-btn">CHAT (0)</button>
        </div>
        
        {hoveredSkill ? (
          <div className="skill-info-panel">
            <div className="skill-info-header">
              <span className="skill-name">{hoveredSkill.skill.name}</span>
              <div className="skill-energy-cost">
                <span className="label">ENERGY:</span>
                {Object.entries(hoveredSkill.skill.cost).map(([type, amount]) => (
                  amount > 0 && (
                    <div key={type} className={`energy-icon ${type}`}>
                      {type === 'fire' ? '🔥' : type === 'water' ? '💧' : type === 'grass' ? '🌿' : type === 'electric' ? '⚡' : '⭐'}
                    </div>
                  )
                )).filter(Boolean)}
                {getTotalEnergyCost(hoveredSkill.skill.cost) === 0 && <span>NONE</span>}
              </div>
            </div>
            <div className="skill-description">
              {hoveredSkill.skill.description}
            </div>
            <div className="skill-meta">
              <div className="skill-classes">
                <span>CLASSES: </span>
                {hoveredSkill.skill.classes.map((c, i) => (
                  <span key={i} className="skill-class">{c}{i < hoveredSkill.skill.classes.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
              <span className="skill-cooldown-text">COOLDOWN: {hoveredSkill.skill.cooldown}</span>
            </div>
          </div>
        ) : (
          <div className="no-skill-selected">
            Passe o mouse sobre uma skill para ver os detalhes
          </div>
        )}
      </div>
      
      {/* Damage Popups */}
      {damagePopups.map(popup => (
        <div
          key={popup.id}
          className={`damage-popup ${popup.isHeal ? 'heal' : ''}`}
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.isHeal ? '+' : '-'}{popup.value}
        </div>
      ))}
    </div>
  );
}
