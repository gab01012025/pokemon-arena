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
  image: string;
  sprite: string;
}

interface QueuedAction {
  userSlot: number;
  skillIdx: number;
  targetSlot: number;
  targetTeam: 'player' | 'ai';
  skill: Skill;
}

type Phase = 'loading' | 'player-turn' | 'opponent-turn' | 'executing' | 'victory' | 'defeat';

// ============ POKEMON DATA WITH SKILL IMAGES ============
const SKILL_IMAGES = {
  electric: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png',
  fire: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png',
  water: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png',
  grass: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png',
  colorless: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/normal-gem.png',
};

const createSkill = (
  id: string,
  name: string,
  description: string,
  type: EnergyType,
  cost: Partial<Energy>,
  damage: number,
  cooldown: number,
  classes: string[],
  effects?: string[]
): Skill => ({
  id,
  name,
  description,
  type,
  cost,
  damage,
  cooldown,
  currentCooldown: 0,
  classes,
  effects,
  image: SKILL_IMAGES[type],
});

// Player team - 3 Pokemon
const playerTeamData: Pokemon[] = [
  {
    id: 'pikachu',
    slot: 0,
    name: 'Pikachu',
    type: 'electric',
    health: 100,
    maxHealth: 100,
    alive: true,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    skills: [
      createSkill('thunder-shock', 'Thunder Shock', 'Zaps the target with electricity dealing 20 damage.', 'electric', { electric: 1 }, 20, 0, ['Ranged', 'Instant']),
      createSkill('thunderbolt', 'Thunderbolt', 'A powerful electric attack dealing 45 damage.', 'electric', { electric: 2 }, 45, 1, ['Ranged', 'Instant']),
      createSkill('agility', 'Agility', 'Pikachu becomes INVULNERABLE for 1 turn.', 'colorless', { colorless: 1 }, 0, 3, ['Mental', 'Buff'], ['invulnerable']),
      createSkill('volt-tackle', 'Volt Tackle', 'Charges with electricity for 60 damage. Recoil: 15 to self.', 'electric', { electric: 2, colorless: 1 }, 60, 2, ['Physical', 'Melee']),
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
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    skills: [
      createSkill('ember', 'Ember', 'A small flame attack dealing 15 damage.', 'fire', { fire: 1 }, 15, 0, ['Ranged', 'Instant']),
      createSkill('flamethrower', 'Flamethrower', 'Breathes intense flames dealing 50 damage.', 'fire', { fire: 2 }, 50, 1, ['Ranged', 'Instant']),
      createSkill('dragon-rage', 'Dragon Rage', 'Unleashes draconic fury for 40 fixed damage. PIERCING.', 'fire', { fire: 1, colorless: 1 }, 40, 2, ['Ranged', 'Piercing']),
      createSkill('fire-blast', 'Fire Blast', 'Massive fire attack dealing 65 damage to ONE enemy.', 'fire', { fire: 3 }, 65, 3, ['Ranged', 'Ultimate']),
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
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    skills: [
      createSkill('water-gun', 'Water Gun', 'Shoots water at the target for 20 damage.', 'water', { water: 1 }, 20, 0, ['Ranged', 'Instant']),
      createSkill('hydro-pump', 'Hydro Pump', 'Blasts with extreme pressure for 55 damage.', 'water', { water: 2, colorless: 1 }, 55, 2, ['Ranged', 'Instant']),
      createSkill('withdraw', 'Withdraw', 'Gains 25 DESTRUCTIBLE DEFENSE for 2 turns.', 'colorless', { colorless: 1 }, 0, 3, ['Defense', 'Buff'], ['defense']),
      createSkill('skull-bash', 'Skull Bash', 'Powerful headbutt dealing 50 damage.', 'water', { water: 1, colorless: 1 }, 50, 2, ['Physical', 'Melee']),
    ],
  },
];

// AI team - 3 Pokemon
const aiTeamData: Pokemon[] = [
  {
    id: 'mewtwo',
    slot: 0,
    name: 'Mewtwo',
    type: 'colorless',
    health: 150,
    maxHealth: 150,
    alive: true,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    skills: [
      createSkill('confusion', 'Confusion', 'Psychic attack dealing 25 damage.', 'colorless', { colorless: 1 }, 25, 0, ['Ranged', 'Mental']),
      createSkill('psychic', 'Psychic', 'Powerful psychic blast for 60 damage.', 'colorless', { colorless: 2 }, 60, 2, ['Ranged', 'Mental']),
      createSkill('barrier', 'Barrier', 'Creates a barrier, INVULNERABLE for 1 turn.', 'colorless', { colorless: 1 }, 0, 4, ['Defense', 'Invulnerable']),
      createSkill('recover', 'Recover', 'Restores 50 HP to self.', 'colorless', { colorless: 2 }, 0, 4, ['Healing']),
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
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    skills: [
      createSkill('shadow-ball', 'Shadow Ball', 'Hurls a shadowy blob for 30 damage.', 'colorless', { colorless: 1 }, 30, 0, ['Ranged', 'Affliction']),
      createSkill('dream-eater', 'Dream Eater', 'Deals 45 damage and heals Gengar 20 HP.', 'colorless', { colorless: 2 }, 45, 2, ['Ranged', 'Drain']),
      createSkill('hypnosis', 'Hypnosis', 'STUNS target for 1 turn.', 'colorless', { colorless: 1 }, 0, 3, ['Mental', 'Control'], ['stun']),
      createSkill('destiny-bond', 'Destiny Bond', 'If Gengar is KOd this turn, attacker also faints.', 'colorless', { colorless: 2 }, 0, 4, ['Unique']),
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
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    skills: [
      createSkill('dragon-breath', 'Dragon Breath', 'Exhales destructive breath for 25 damage.', 'fire', { fire: 1 }, 25, 0, ['Ranged', 'Instant']),
      createSkill('outrage', 'Outrage', 'Rampages dealing 65 damage.', 'fire', { fire: 2, colorless: 1 }, 65, 2, ['Physical', 'Melee']),
      createSkill('dragon-dance', 'Dragon Dance', 'Boosts damage by 15 for 3 turns.', 'colorless', { colorless: 1 }, 0, 3, ['Mental', 'Buff']),
      createSkill('hyper-beam', 'Hyper Beam', 'Devastating beam for 80 damage. Stuns self next turn.', 'colorless', { colorless: 3 }, 80, 4, ['Ranged', 'Ultimate']),
    ],
  },
];

// ============ HELPER FUNCTIONS ============
const getHealthClass = (health: number, max: number): string => {
  const pct = (health / max) * 100;
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

// ============ MAIN COMPONENT ============
export default function AIBattlePage() {
  const router = useRouter();
  
  // Game state
  const [phase, setPhase] = useState<Phase>('loading');
  const [turn, setTurn] = useState(1);
  
  // Teams
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [aiTeam, setAiTeam] = useState<Pokemon[]>([]);
  
  // Energy - starts with random energy each turn
  const [playerEnergy, setPlayerEnergy] = useState<Energy>({ fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 });
  
  // Actions
  const [selectedSkill, setSelectedSkill] = useState<{ slot: number; skillIdx: number } | null>(null);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  
  // UI state
  const [hoveredSkill, setHoveredSkill] = useState<{ skill: Skill; pokemon: Pokemon } | null>(null);
  const [centerPokemon, setCenterPokemon] = useState<Pokemon | null>(null);
  const [damagePopups, setDamagePopups] = useState<{ id: number; x: number; y: number; value: number; isHeal: boolean }[]>([]);
  
  // Calculate remaining energy after queued actions
  const remainingEnergy = useMemo((): Energy => {
    let energy = { ...playerEnergy };
    queuedActions.forEach(action => {
      energy = spendEnergy(action.skill.cost, energy);
    });
    return energy;
  }, [playerEnergy, queuedActions]);
  
  // Generate random energy for new turn
  const generateTurnEnergy = useCallback(() => {
    const types: EnergyType[] = ['fire', 'water', 'grass', 'electric', 'colorless'];
    const newEnergy: Energy = { fire: 0, water: 0, grass: 0, electric: 0, colorless: 0 };
    
    // Generate 4 random energy (like Naruto Arena gives 4 chakra per turn)
    for (let i = 0; i < 4; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      newEnergy[type]++;
    }
    
    return newEnergy;
  }, []);
  
  // Initialize game
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayerTeam(JSON.parse(JSON.stringify(playerTeamData)));
      setAiTeam(JSON.parse(JSON.stringify(aiTeamData)));
      setCenterPokemon(playerTeamData[0]);
      setPlayerEnergy(generateTurnEnergy());
      setPhase('player-turn');
    }, 1500);
    return () => clearTimeout(timer);
  }, [generateTurnEnergy]);
  
  // Handle skill click
  const handleSkillClick = useCallback((pokemon: Pokemon, skillIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (phase !== 'player-turn') return;
    if (!pokemon.alive) return;
    
    const skill = pokemon.skills[skillIdx];
    if (skill.currentCooldown > 0) return;
    if (!canAfford(skill.cost, remainingEnergy)) return;
    
    // If already queued, remove it
    const existingIdx = queuedActions.findIndex(a => a.userSlot === pokemon.slot && a.skillIdx === skillIdx);
    if (existingIdx >= 0) {
      setQueuedActions(prev => prev.filter((_, i) => i !== existingIdx));
      setSelectedSkill(null);
      return;
    }
    
    // Select for targeting
    setSelectedSkill({ slot: pokemon.slot, skillIdx });
    setCenterPokemon(pokemon);
  }, [phase, remainingEnergy, queuedActions]);
  
  // Handle target selection
  const handleTargetClick = useCallback((targetSlot: number, targetTeam: 'player' | 'ai') => {
    if (!selectedSkill) return;
    
    const user = playerTeam.find(p => p.slot === selectedSkill.slot);
    if (!user) return;
    
    const skill = user.skills[selectedSkill.skillIdx];
    
    // Add to queue
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
  
  // Show damage popup
  const showDamagePopup = useCallback((slot: number, team: 'player' | 'ai', value: number, isHeal: boolean) => {
    const id = Date.now() + Math.random();
    // Position based on slot
    const baseX = team === 'player' ? 200 : window.innerWidth - 200;
    const y = 150 + slot * 100;
    
    setDamagePopups(prev => [...prev, { id, x: baseX, y, value, isHeal }]);
    
    setTimeout(() => {
      setDamagePopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);
  
  // Execute player turn
  const executeTurn = useCallback(async () => {
    if (queuedActions.length === 0) return;
    setPhase('executing');
    
    // Execute player actions
    for (const action of queuedActions) {
      await new Promise(r => setTimeout(r, 600));
      
      const user = playerTeam.find(p => p.slot === action.userSlot);
      if (!user || !user.alive) continue;
      
      if (action.skill.damage > 0) {
        if (action.targetTeam === 'ai') {
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
      }
      
      // Set cooldown on used skill
      setPlayerTeam(prev => prev.map(p => {
        if (p.slot === action.userSlot) {
          const skills = [...p.skills];
          skills[action.skillIdx] = { 
            ...skills[action.skillIdx], 
            currentCooldown: action.skill.cooldown + 1 // +1 because we reduce at end of turn
          };
          return { ...p, skills };
        }
        return p;
      }));
    }
    
    // Clear queue
    setQueuedActions([]);
    setSelectedSkill(null);
    
    // Check if AI is defeated
    await new Promise(r => setTimeout(r, 400));
    const aiAlive = aiTeam.some(p => p.alive);
    if (!aiAlive) {
      setPhase('victory');
      return;
    }
    
    // AI Turn
    setPhase('opponent-turn');
    await new Promise(r => setTimeout(r, 1000));
    
    // AI attacks (simple: random alive AI attacks random alive player)
    const aliveAI = aiTeam.filter(p => p.alive);
    const alivePlayers = playerTeam.filter(p => p.alive);
    
    if (aliveAI.length > 0 && alivePlayers.length > 0) {
      const attacker = aliveAI[Math.floor(Math.random() * aliveAI.length)];
      const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      
      // AI uses random available skill
      const availableSkills = attacker.skills.filter(s => s.currentCooldown === 0);
      if (availableSkills.length > 0) {
        const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        const damage = skill.damage > 0 ? skill.damage : 20 + Math.floor(Math.random() * 15);
        
        showDamagePopup(target.slot, 'player', damage, false);
        
        setPlayerTeam(prev => prev.map(p => {
          if (p.slot === target.slot) {
            const newHp = Math.max(0, p.health - damage);
            return { ...p, health: newHp, alive: newHp > 0 };
          }
          return p;
        }));
        
        // Set AI cooldown
        setAiTeam(prev => prev.map(p => {
          if (p.slot === attacker.slot) {
            const skillIdx = p.skills.findIndex(s => s.id === skill.id);
            if (skillIdx >= 0) {
              const skills = [...p.skills];
              skills[skillIdx] = { ...skills[skillIdx], currentCooldown: skill.cooldown + 1 };
              return { ...p, skills };
            }
          }
          return p;
        }));
      }
    }
    
    await new Promise(r => setTimeout(r, 500));
    
    // Check if player is defeated
    const playerAlive = playerTeam.some(p => p.alive);
    if (!playerAlive) {
      setPhase('defeat');
      return;
    }
    
    // Reduce all cooldowns
    setPlayerTeam(prev => prev.map(p => ({
      ...p,
      skills: p.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) })),
    })));
    
    setAiTeam(prev => prev.map(p => ({
      ...p,
      skills: p.skills.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) })),
    })));
    
    // New turn
    setTurn(t => t + 1);
    setPlayerEnergy(generateTurnEnergy());
    setPhase('player-turn');
  }, [queuedActions, playerTeam, aiTeam, showDamagePopup, generateTurnEnergy]);
  
  // Render energy orbs for cost display
  const renderEnergyOrbs = (cost: Partial<Energy>, small = false) => {
    const orbs: React.ReactNode[] = [];
    const types: EnergyType[] = ['fire', 'water', 'grass', 'electric', 'colorless'];
    types.forEach(type => {
      for (let i = 0; i < (cost[type] || 0); i++) {
        orbs.push(<span key={`${type}-${i}`} className={`na-energy-orb ${type} ${small ? 'small' : ''}`} />);
      }
    });
    return orbs;
  };
  
  // ============ RENDER ============
  
  // Loading
  if (phase === 'loading') {
    return (
      <div className="na-loading">
        <div className="pokeball" />
        <div className="na-loading-text">Preparando Batalha...</div>
      </div>
    );
  }
  
  // Game Over
  if (phase === 'victory' || phase === 'defeat') {
    return (
      <div className="na-game-over">
        <h1 className={phase}>{phase === 'victory' ? 'VITÓRIA!' : 'DERROTA'}</h1>
        <p className="stats">Batalha concluída em {turn} turnos</p>
        <div className="buttons">
          <button className="btn" onClick={() => router.push('/')}>Menu</button>
          <button className="btn primary" onClick={() => window.location.reload()}>Jogar Novamente</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="na-battle-page">
      {/* TOP BAR */}
      <div className="na-top-bar">
        {/* Player info */}
        <div className="na-player-panel">
          <div className="na-player-avatar">
            <img src={playerTeam[0]?.image} alt="Player" />
          </div>
          <div className="na-player-info">
            <h3 className="na-player-name">TREINADOR</h3>
            <p className="na-player-rank">Mestre Pokémon</p>
          </div>
        </div>
        
        {/* Center - Turn indicator and energy */}
        <div className="na-center-header">
          <div className="na-turn-indicator">
            <div 
              className="na-turn-fill" 
              style={{ width: queuedActions.length > 0 ? '100%' : '0%' }}
            />
            <span className="na-turn-text">
              {phase === 'opponent-turn' ? 'TURNO DO OPONENTE...' : 
               queuedActions.length > 0 ? 'PRESSIONE QUANDO PRONTO' : 'SELECIONE SEUS MOVIMENTOS'}
            </span>
          </div>
          
          <div className="na-energy-row">
            <div className="na-energy-item">
              <div className="na-energy-icon grass" />
              <span className="na-energy-count">x{remainingEnergy.grass}</span>
            </div>
            <div className="na-energy-item">
              <div className="na-energy-icon fire" />
              <span className="na-energy-count">x{remainingEnergy.fire}</span>
            </div>
            <div className="na-energy-item">
              <div className="na-energy-icon water" />
              <span className="na-energy-count">x{remainingEnergy.water}</span>
            </div>
            <div className="na-energy-item">
              <div className="na-energy-icon electric" />
              <span className="na-energy-count">x{remainingEnergy.electric}</span>
            </div>
            <div className="na-energy-item">
              <div className="na-energy-icon colorless" />
              <span className="na-energy-count">x{remainingEnergy.colorless}</span>
            </div>
            <span className="na-exchange-text">TROCAR ENERGIA</span>
          </div>
        </div>
        
        {/* AI info */}
        <div className="na-player-panel right">
          <div className="na-player-avatar">
            <img src={aiTeam[0]?.image} alt="Rival" />
          </div>
          <div className="na-player-info">
            <h3 className="na-player-name">RIVAL</h3>
            <p className="na-player-rank">Treinador Elite</p>
          </div>
        </div>
      </div>
      
      {/* MAIN BATTLE AREA */}
      <div className="na-battle-area">
        {/* LEFT - Player Team */}
        <div className="na-team-column">
          {playerTeam.map(pokemon => {
            const isSelected = selectedSkill?.slot === pokemon.slot;
            
            return (
              <div 
                key={pokemon.id}
                className={`na-char-row ${!pokemon.alive ? 'fainted' : ''} ${isSelected ? 'selected' : ''}`}
              >
                <div className="na-char-portrait">
                  <img src={pokemon.image} alt={pokemon.name} />
                  <div className="na-health-container">
                    <div className="na-health-bar">
                      <div 
                        className={`na-health-fill ${getHealthClass(pokemon.health, pokemon.maxHealth)}`}
                        style={{ width: `${(pokemon.health / pokemon.maxHealth) * 100}%` }}
                      />
                      <span className="na-health-text">{pokemon.health}/{pokemon.maxHealth}</span>
                    </div>
                  </div>
                </div>
                
                <div className="na-skills-grid">
                  {pokemon.skills.map((skill, idx) => {
                    const isQueued = queuedActions.some(a => a.userSlot === pokemon.slot && a.skillIdx === idx);
                    const isSkillSelected = selectedSkill?.slot === pokemon.slot && selectedSkill?.skillIdx === idx;
                    const affordable = canAfford(skill.cost, remainingEnergy);
                    const onCd = skill.currentCooldown > 0;
                    
                    return (
                      <div
                        key={skill.id}
                        className={`na-skill-slot 
                          ${pokemon.alive && affordable && !onCd ? 'available' : ''} 
                          ${isSkillSelected ? 'selected' : ''} 
                          ${isQueued ? 'queued' : ''} 
                          ${onCd ? 'on-cooldown' : ''} 
                          ${!affordable && !onCd && pokemon.alive ? 'no-energy' : ''} 
                          ${!pokemon.alive ? 'disabled' : ''}`
                        }
                        data-cd={skill.currentCooldown || ''}
                        onClick={(e) => handleSkillClick(pokemon, idx, e)}
                        onMouseEnter={() => setHoveredSkill({ skill, pokemon })}
                        onMouseLeave={() => setHoveredSkill(null)}
                      >
                        <img src={skill.image} alt={skill.name} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* CENTER - Pokemon display and Ready button */}
        <div className="na-center-area">
          {centerPokemon && (
            <div className="na-center-pokemon">
              <img src={centerPokemon.sprite} alt={centerPokemon.name} />
            </div>
          )}
          
          {/* Queued actions display */}
          {queuedActions.length > 0 && (
            <div className="na-action-queue">
              {queuedActions.map((action, idx) => {
                const user = playerTeam.find(p => p.slot === action.userSlot);
                const target = action.targetTeam === 'ai'
                  ? aiTeam.find(p => p.slot === action.targetSlot)
                  : playerTeam.find(p => p.slot === action.targetSlot);
                
                return (
                  <div 
                    key={idx}
                    className="na-queued-action"
                    onClick={() => removeFromQueue(idx)}
                    title="Clique para remover"
                  >
                    <img src={user?.image} alt={user?.name} />
                    <span className="arrow">→</span>
                    <img src={action.skill.image} alt={action.skill.name} />
                    <span className="arrow">→</span>
                    <img src={target?.image} alt={target?.name} />
                    <span className="remove-hint">✕</span>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="na-ready-container">
            <button
              className={`na-ready-btn ${queuedActions.length > 0 && phase === 'player-turn' ? 'active' : ''}`}
              onClick={executeTurn}
              disabled={queuedActions.length === 0 || phase !== 'player-turn'}
            >
              {phase === 'executing' ? 'EXECUTANDO...' : 'PRONTO'}
            </button>
            <span className="na-turn-counter">TURNO {turn}</span>
          </div>
        </div>
        
        {/* RIGHT - AI Team */}
        <div className="na-team-column">
          {aiTeam.map(pokemon => (
            <div 
              key={pokemon.id}
              className={`na-char-row right ${!pokemon.alive ? 'fainted' : ''} ${selectedSkill && pokemon.alive ? 'targetable' : ''}`}
              onClick={() => selectedSkill && pokemon.alive && handleTargetClick(pokemon.slot, 'ai')}
            >
              <div className="na-char-portrait">
                <img src={pokemon.image} alt={pokemon.name} />
                <div className="na-health-container">
                  <div className="na-health-bar">
                    <div 
                      className={`na-health-fill ${getHealthClass(pokemon.health, pokemon.maxHealth)}`}
                      style={{ width: `${(pokemon.health / pokemon.maxHealth) * 100}%` }}
                    />
                    <span className="na-health-text">{pokemon.health}/{pokemon.maxHealth}</span>
                  </div>
                </div>
              </div>
              
              <div className="na-skills-grid">
                {pokemon.skills.map(skill => (
                  <div
                    key={skill.id}
                    className="na-skill-slot unknown"
                    onMouseEnter={() => setHoveredSkill({ skill, pokemon })}
                    onMouseLeave={() => setHoveredSkill(null)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* BOTTOM BAR - Skill description */}
      <div className="na-bottom-bar">
        <div className="na-bottom-left">
          <button className="na-surrender-btn" onClick={() => router.push('/')}>
            RENDER-SE
          </button>
          <button className="na-chat-btn">
            CHAT <span className="new-msg">(0)</span>
          </button>
        </div>
        
        <div className="na-bottom-center">
          {hoveredSkill && (
            <>
              <div className="na-preview-char">
                <img src={hoveredSkill.pokemon.image} alt={hoveredSkill.pokemon.name} />
              </div>
              <div className="na-skill-description">
                <h4 className="na-skill-title">{hoveredSkill.skill.name}</h4>
                <p className="na-skill-desc">
                  {hoveredSkill.skill.description.split(/(\d+ damage|\d+ HP|INVULNERABLE|STUNS|PIERCING)/gi).map((part, i) => {
                    if (/\d+ damage/i.test(part)) {
                      return <span key={i} className="damage-text">{part}</span>;
                    }
                    if (/\d+ HP|INVULNERABLE|STUNS|PIERCING/i.test(part)) {
                      return <span key={i} className="highlight">{part}</span>;
                    }
                    return part;
                  })}
                </p>
              </div>
            </>
          )}
          {!hoveredSkill && (
            <div className="na-skill-description">
              <p className="na-skill-desc" style={{ color: '#888' }}>
                Passe o mouse sobre uma skill para ver os detalhes
              </p>
            </div>
          )}
        </div>
        
        <div className="na-bottom-right">
          {hoveredSkill && (
            <>
              <div className="na-skill-energy">
                <span className="na-skill-energy-label">ENERGIA:</span>
                <div className="na-skill-energy-cost">
                  {renderEnergyOrbs(hoveredSkill.skill.cost)}
                  {Object.keys(hoveredSkill.skill.cost).length === 0 && <span style={{ color: '#888' }}>NENHUM</span>}
                </div>
              </div>
              <div className="na-skill-classes">
                <span>CLASSES: </span>
                {hoveredSkill.skill.classes.join(', ')}
              </div>
              {hoveredSkill.skill.cooldown > 0 && (
                <div className="na-skill-cooldown">
                  COOLDOWN: {hoveredSkill.skill.cooldown}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Opponent turn overlay */}
      {phase === 'opponent-turn' && (
        <div className="na-opponent-turn">
          <h2>TURNO DO OPONENTE...</h2>
        </div>
      )}
      
      {/* Damage popups */}
      {damagePopups.map(popup => (
        <div 
          key={popup.id}
          className={`na-damage-popup ${popup.isHeal ? 'heal' : ''}`}
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.isHeal ? '+' : '-'}{popup.value}
        </div>
      ))}
    </div>
  );
}
