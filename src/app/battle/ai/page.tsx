/**
 * Pokemon Arena Battle Page - Naruto Arena Style
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './battle.css';

// Types based on our battle engine
interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  random: number;
}

interface Effect {
  type: string;
  value: number;
  duration: number;
  classes?: string[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
  classes: string[];
  cost: Partial<Energy>;
  cooldown: number;
  currentCooldown: number;
  damage?: number;
  effects: Effect[];
}

interface Status {
  name: string;
  duration: number;
  helpful: boolean;
  effects: Effect[];
}

interface BattleCharacter {
  id: string;
  slot: number;
  name: string;
  types: string[];
  health: number;
  maxHealth: number;
  alive: boolean;
  skills: Skill[];
  statuses: Status[];
  barrier: number;
}

interface LogEntry {
  turn: number;
  message: string;
  type: 'skill' | 'damage' | 'heal' | 'status' | 'death' | 'system';
}

type Difficulty = 'easy' | 'normal' | 'hard';
type GamePhase = 'loading' | 'setup' | 'battle' | 'victory' | 'defeat';

const ENERGY_COLORS = {
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  electric: '#F7D02C',
  random: '#A8A77A',
};

const ENERGY_ICONS = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  random: '❓',
};

export default function BattlePage() {
  const router = useRouter();
  
  // Game state
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState<LogEntry[]>([]);
  
  // Player state
  const [playerTeam, setPlayerTeam] = useState<BattleCharacter[]>([]);
  const [playerEnergy, setPlayerEnergy] = useState<Energy>({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
  const [selectedSkill, setSelectedSkill] = useState<{ charIndex: number; skillIndex: number } | null>(null);
  const [queuedActions, setQueuedActions] = useState<Array<{ charIndex: number; skillIndex: number; targetIndex: number }>>([]);
  
  // AI state
  const [aiTeam, setAiTeam] = useState<BattleCharacter[]>([]);
  const [aiEnergy, setAiEnergy] = useState<Energy>({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
  
  // UI state
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [animating, setAnimating] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  
  // Load player team
  useEffect(() => {
    loadPlayerTeam();
  }, []);
  
  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);
  
  const loadPlayerTeam = async () => {
    try {
      // Try localStorage first (from /play page)
      const savedTeam = localStorage.getItem('selectedTeam');
      if (savedTeam) {
        const parsed = JSON.parse(savedTeam);
        if (Array.isArray(parsed) && parsed.length === 3) {
          const team = parsed.map((p, idx) => createBattleCharacter(p, idx));
          setPlayerTeam(team);
          localStorage.removeItem('selectedTeam');
          setPhase('setup');
          return;
        }
      }
      
      // Fallback to API
      const res = await fetch('/api/trainer/profile');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      
      const profile = await res.json();
      if (!profile.team || profile.team.pokemon.length < 3) {
        router.push('/select-team');
        return;
      }
      
      const team = profile.team.pokemon.map((tp: { pokemon: Pokemon }, idx: number) => 
        createBattleCharacter(tp.pokemon, idx)
      );
      setPlayerTeam(team);
      setPhase('setup');
    } catch {
      router.push('/login');
    }
  };
  
  interface Pokemon {
    id: string;
    name: string;
    type?: string;
    types?: string | string[];
    health?: number;
    hp?: number;
    moves?: Move[];
  }
  
  interface Move {
    id: string;
    name: string;
    description?: string;
    damage?: number;
    power?: number;
    cooldown?: number;
    energyCost?: string;
    effect?: string;
    type?: string;
  }
  
  const createBattleCharacter = (pokemon: Pokemon, slot: number): BattleCharacter => {
    const health = pokemon.health || pokemon.hp || 100;
    const types = parseTypes(pokemon.types || pokemon.type || 'Normal');
    
    return {
      id: pokemon.id,
      slot,
      name: pokemon.name,
      types,
      health,
      maxHealth: health,
      alive: true,
      skills: (pokemon.moves || []).slice(0, 4).map((m, idx) => createSkill(m, idx, types[0])),
      statuses: [],
      barrier: 0,
    };
  };
  
  const parseTypes = (types: string | string[]): string[] => {
    if (Array.isArray(types)) return types;
    if (typeof types === 'string') {
      try {
        const parsed = JSON.parse(types);
        return Array.isArray(parsed) ? parsed : [types];
      } catch {
        return types.split(',').map(t => t.trim());
      }
    }
    return ['Normal'];
  };
  
  const createSkill = (move: Move, index: number, pokemonType: string): Skill => {
    const damage = move.damage || move.power || 20;
    let cost: Partial<Energy> = {};
    
    // Parse energy cost
    if (move.energyCost) {
      try {
        cost = JSON.parse(move.energyCost);
      } catch {
        cost = { random: 1 };
      }
    } else {
      // Default cost based on index
      const typeKey = pokemonType.toLowerCase() as keyof Energy;
      if (['fire', 'water', 'grass', 'electric'].includes(typeKey)) {
        cost[typeKey] = index === 3 ? 2 : 1;
      } else {
        cost.random = index === 3 ? 2 : 1;
      }
    }
    
    // Parse effects
    let effects: Effect[] = [];
    if (move.effect) {
      try {
        const parsed = JSON.parse(move.effect);
        effects = Array.isArray(parsed) ? parsed : [];
      } catch {
        // Ignore
      }
    }
    
    // Add base damage effect
    effects.unshift({
      type: 'damage',
      value: damage,
      duration: 0,
    });
    
    return {
      id: move.id || `skill-${index}`,
      name: move.name,
      description: move.description || `Deals ${damage} damage.`,
      classes: ['Physical'],
      cost,
      cooldown: move.cooldown || 0,
      currentCooldown: 0,
      damage,
      effects,
    };
  };
  
  const generateAITeam = async () => {
    try {
      const res = await fetch('/api/pokemon?starters=true');
      const allPokemon = await res.json();
      
      // Select different pokemon than player
      const playerNames = playerTeam.map(p => p.name);
      const available = allPokemon.filter((p: Pokemon) => !playerNames.includes(p.name));
      const shuffled = available.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      
      const team = selected.map((p: Pokemon, idx: number) => createBattleCharacter(p, idx + 3));
      setAiTeam(team);
    } catch {
      console.error('Failed to generate AI team');
    }
  };
  
  const startBattle = async () => {
    await generateAITeam();
    setPhase('battle');
    setTurn(1);
    setLog([{ turn: 0, message: `Battle started! Difficulty: ${difficulty.toUpperCase()}`, type: 'system' }]);
    
    // Initial energy
    setPlayerEnergy({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
    setAiEnergy({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
    
    // Generate first turn energy
    generateEnergy();
  };
  
  const generateEnergy = () => {
    const types: (keyof Energy)[] = ['fire', 'water', 'grass', 'electric'];
    
    // Player gets random energy
    const pType = types[Math.floor(Math.random() * types.length)];
    setPlayerEnergy(prev => ({ ...prev, [pType]: prev[pType] + 1 }));
    
    // AI gets random energy
    const aType = types[Math.floor(Math.random() * types.length)];
    setAiEnergy(prev => ({ ...prev, [aType]: prev[aType] + 1 }));
  };
  
  const canAfford = (cost: Partial<Energy>, energy: Energy): boolean => {
    let remaining = { ...energy };
    
    for (const [type, amount] of Object.entries(cost)) {
      if (type === 'random') continue;
      const typeKey = type as keyof Energy;
      if ((remaining[typeKey] || 0) < (amount || 0)) {
        return false;
      }
      remaining[typeKey] -= amount || 0;
    }
    
    const randomNeeded = cost.random || 0;
    const randomAvailable = Object.values(remaining).reduce((a, b) => a + b, 0) - remaining.random;
    
    return randomAvailable >= randomNeeded;
  };
  
  const spendEnergy = (cost: Partial<Energy>, energy: Energy): Energy => {
    const result = { ...energy };
    
    for (const [type, amount] of Object.entries(cost)) {
      if (type === 'random') continue;
      const typeKey = type as keyof Energy;
      result[typeKey] = Math.max(0, (result[typeKey] || 0) - (amount || 0));
    }
    
    let randomNeeded = cost.random || 0;
    const types: (keyof Energy)[] = ['fire', 'water', 'grass', 'electric'];
    
    for (const type of types) {
      if (randomNeeded <= 0) break;
      const spend = Math.min(result[type], randomNeeded);
      result[type] -= spend;
      randomNeeded -= spend;
    }
    
    return result;
  };
  
  const selectSkill = (charIndex: number, skillIndex: number) => {
    const char = playerTeam[charIndex];
    if (!char.alive) return;
    
    const skill = char.skills[skillIndex];
    if (!skill || skill.currentCooldown > 0) return;
    if (!canAfford(skill.cost, playerEnergy)) return;
    
    setSelectedSkill({ charIndex, skillIndex });
  };
  
  const selectTarget = (targetIndex: number) => {
    if (!selectedSkill) return;
    
    const { charIndex, skillIndex } = selectedSkill;
    const char = playerTeam[charIndex];
    const skill = char.skills[skillIndex];
    
    // Spend energy
    setPlayerEnergy(prev => spendEnergy(skill.cost, prev));
    
    // Queue action
    setQueuedActions(prev => [...prev, { charIndex, skillIndex, targetIndex }]);
    
    setSelectedSkill(null);
  };
  
  const executeActions = async () => {
    if (animating) return;
    setAnimating(true);
    
    // Execute player actions
    for (const action of queuedActions) {
      await executePlayerAction(action);
      await delay(500);
    }
    
    // Execute AI actions
    await executeAITurn();
    
    // Check victory/defeat
    const playerAlive = playerTeam.some(c => c.alive);
    const aiAlive = aiTeam.some(c => c.alive);
    
    if (!playerAlive) {
      setPhase('defeat');
      setAnimating(false);
      return;
    }
    
    if (!aiAlive) {
      setPhase('victory');
      setAnimating(false);
      return;
    }
    
    // Next turn
    endTurn();
    setAnimating(false);
  };
  
  const executePlayerAction = async (action: { charIndex: number; skillIndex: number; targetIndex: number }) => {
    const char = playerTeam[action.charIndex];
    const skill = char.skills[action.skillIndex];
    const target = action.targetIndex < 3 ? playerTeam[action.targetIndex] : aiTeam[action.targetIndex - 3];
    
    if (!char.alive || !target.alive) return;
    
    // Log
    addLog(`${char.name} uses ${skill.name}!`, 'skill');
    
    // Apply damage
    const damage = skill.damage || skill.effects.find(e => e.type === 'damage')?.value || 0;
    if (damage > 0) {
      target.health = Math.max(0, target.health - damage);
      addLog(`${target.name} takes ${damage} damage!`, 'damage');
      
      if (target.health <= 0) {
        target.alive = false;
        addLog(`${target.name} fainted!`, 'death');
      }
    }
    
    // Set cooldown
    skill.currentCooldown = skill.cooldown;
    
    // Update state
    if (action.targetIndex < 3) {
      setPlayerTeam([...playerTeam]);
    } else {
      setAiTeam([...aiTeam]);
    }
  };
  
  const executeAITurn = async () => {
    for (const char of aiTeam) {
      if (!char.alive) continue;
      
      // Find affordable skill
      const affordableSkills = char.skills.filter(s => 
        s.currentCooldown === 0 && canAfford(s.cost, aiEnergy)
      );
      
      if (affordableSkills.length === 0) continue;
      
      // Pick random skill (can be smarter based on difficulty)
      const skill = affordableSkills[Math.floor(Math.random() * affordableSkills.length)];
      
      // Pick random alive target
      const targets = playerTeam.filter(t => t.alive);
      if (targets.length === 0) continue;
      
      const target = targets[Math.floor(Math.random() * targets.length)];
      
      // Spend energy
      setAiEnergy(prev => spendEnergy(skill.cost, prev));
      
      // Log
      addLog(`${char.name} uses ${skill.name}!`, 'skill');
      
      await delay(300);
      
      // Apply damage
      const damage = skill.damage || skill.effects.find(e => e.type === 'damage')?.value || 0;
      if (damage > 0) {
        target.health = Math.max(0, target.health - damage);
        addLog(`${target.name} takes ${damage} damage!`, 'damage');
        
        if (target.health <= 0) {
          target.alive = false;
          addLog(`${target.name} fainted!`, 'death');
        }
        
        setPlayerTeam([...playerTeam]);
      }
      
      // Set cooldown
      skill.currentCooldown = skill.cooldown;
      
      await delay(300);
    }
  };
  
  const endTurn = () => {
    // Decrement cooldowns
    playerTeam.forEach(char => {
      char.skills.forEach(skill => {
        if (skill.currentCooldown > 0) skill.currentCooldown--;
      });
    });
    
    aiTeam.forEach(char => {
      char.skills.forEach(skill => {
        if (skill.currentCooldown > 0) skill.currentCooldown--;
      });
    });
    
    setPlayerTeam([...playerTeam]);
    setAiTeam([...aiTeam]);
    setQueuedActions([]);
    setTurn(prev => prev + 1);
    
    // Generate new energy
    generateEnergy();
  };
  
  const addLog = (message: string, type: LogEntry['type']) => {
    setLog(prev => [...prev, { turn, message, type }]);
  };
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const getAIName = () => {
    switch (difficulty) {
      case 'easy': return 'Youngster Joey';
      case 'normal': return 'Trainer Red';
      case 'hard': return 'Champion Blue';
    }
  };
  
  // Render functions
  const renderEnergyPool = (energy: Energy, isPlayer: boolean) => (
    <div className={`energy-pool ${isPlayer ? 'player' : 'enemy'}`}>
      {Object.entries(energy).map(([type, count]) => (
        <div key={type} className="energy-row">
          {Array.from({ length: count }).map((_, i) => (
            <div 
              key={i} 
              className="energy-orb"
              style={{ backgroundColor: ENERGY_COLORS[type as keyof typeof ENERGY_COLORS] }}
              title={type}
            >
              {ENERGY_ICONS[type as keyof typeof ENERGY_ICONS]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
  
  const renderCharacter = (char: BattleCharacter, isPlayer: boolean) => (
    <div 
      key={char.id}
      className={`battle-character ${!char.alive ? 'dead' : ''} ${isPlayer ? 'player' : 'enemy'}`}
      onClick={() => selectedSkill && !isPlayer && char.alive && selectTarget(char.slot)}
    >
      <div className="char-portrait">
        <Image
          src={`/images/pokemon/${char.name.toLowerCase()}.png`}
          alt={char.name}
          width={80}
          height={80}
          className="char-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
          }}
        />
        {!char.alive && <div className="death-overlay">✕</div>}
      </div>
      
      <div className="char-info">
        <div className="char-name">{char.name}</div>
        <div className="health-bar-container">
          <div 
            className="health-bar"
            style={{ 
              width: `${(char.health / char.maxHealth) * 100}%`,
              backgroundColor: char.health > char.maxHealth * 0.5 ? '#4CAF50' : 
                               char.health > char.maxHealth * 0.25 ? '#FFC107' : '#F44336'
            }}
          />
        </div>
        <div className="health-text">{char.health} / {char.maxHealth}</div>
      </div>
      
      {/* Status effects */}
      <div className="status-icons">
        {char.statuses.map((status, i) => (
          <div 
            key={i}
            className={`status-icon ${status.helpful ? 'buff' : 'debuff'}`}
            title={`${status.name} (${status.duration} turns)`}
          >
            {status.helpful ? '↑' : '↓'}
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderSkills = (char: BattleCharacter, charIndex: number) => (
    <div className="skills-row">
      {char.skills.map((skill, skillIndex) => {
        const affordable = canAfford(skill.cost, playerEnergy);
        const onCooldown = skill.currentCooldown > 0;
        const isSelected = selectedSkill?.charIndex === charIndex && selectedSkill?.skillIndex === skillIndex;
        const isQueued = queuedActions.some(a => a.charIndex === charIndex && a.skillIndex === skillIndex);
        
        return (
          <div
            key={skill.id}
            className={`skill-button ${!affordable ? 'unaffordable' : ''} ${onCooldown ? 'cooldown' : ''} ${isSelected ? 'selected' : ''} ${isQueued ? 'queued' : ''} ${!char.alive ? 'disabled' : ''}`}
            onClick={() => char.alive && !onCooldown && affordable && !isQueued && selectSkill(charIndex, skillIndex)}
            onMouseEnter={() => setHoveredSkill(skill)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <div className="skill-name">{skill.name}</div>
            {onCooldown && <div className="cooldown-overlay">{skill.currentCooldown}</div>}
            <div className="skill-cost">
              {Object.entries(skill.cost).map(([type, count]) => (
                count ? (
                  <span key={type} className="cost-item" style={{ color: ENERGY_COLORS[type as keyof typeof ENERGY_COLORS] }}>
                    {ENERGY_ICONS[type as keyof typeof ENERGY_ICONS]}{count}
                  </span>
                ) : null
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="battle-container setup">
        <h1>⚔️ Battle vs AI</h1>
        
        <div className="team-preview">
          <h2>Your Team</h2>
          <div className="team-row">
            {playerTeam.map(char => (
              <div key={char.id} className="preview-char">
                <Image
                  src={`/images/pokemon/${char.name.toLowerCase()}.png`}
                  alt={char.name}
                  width={100}
                  height={100}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
                  }}
                />
                <div className="preview-name">{char.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="difficulty-select">
          <h2>Select Difficulty</h2>
          <div className="difficulty-options">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                className={`difficulty-btn ${difficulty === d ? 'selected' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                <div className="diff-icon">
                  {d === 'easy' ? '😊' : d === 'normal' ? '😐' : '😈'}
                </div>
                <div className="diff-name">{d.charAt(0).toUpperCase() + d.slice(1)}</div>
                <div className="diff-desc">
                  {d === 'easy' ? 'AI makes random choices' : 
                   d === 'normal' ? 'AI plays balanced' : 
                   'AI plays optimally'}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <button className="start-battle-btn" onClick={startBattle}>
          ⚔️ Start Battle
        </button>
        
        <button className="back-btn" onClick={() => router.push('/play')}>
          ← Back
        </button>
      </div>
    );
  }
  
  // Victory/Defeat
  if (phase === 'victory' || phase === 'defeat') {
    return (
      <div className={`battle-container result ${phase}`}>
        <div className="result-modal">
          <h1>{phase === 'victory' ? '🏆 Victory!' : '💔 Defeat'}</h1>
          <p>{phase === 'victory' ? 'Congratulations! You won the battle!' : "Don't give up! Try again!"}</p>
          
          <div className="result-buttons">
            <button onClick={() => {
              setPhase('setup');
              setPlayerTeam(playerTeam.map(c => ({ ...c, health: c.maxHealth, alive: true, skills: c.skills.map(s => ({ ...s, currentCooldown: 0 })) })));
            }}>
              Play Again
            </button>
            <button onClick={() => router.push('/play')}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading
  if (phase === 'loading') {
    return (
      <div className="battle-container loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  // Battle phase
  return (
    <div className="battle-container">
      {/* Header */}
      <div className="battle-header">
        <div className="turn-info">Turn {turn}</div>
        <div className="vs-badge">VS</div>
        <div className="opponent-name">{getAIName()}</div>
      </div>
      
      {/* Main battle area */}
      <div className="battle-arena">
        {/* Player side */}
        <div className="team-side player-side">
          <div className="team-label">Your Team</div>
          {renderEnergyPool(playerEnergy, true)}
          <div className="characters-column">
            {playerTeam.map(char => renderCharacter(char, true))}
          </div>
        </div>
        
        {/* Enemy side */}
        <div className="team-side enemy-side">
          <div className="team-label">{getAIName()}</div>
          {renderEnergyPool(aiEnergy, false)}
          <div className="characters-column">
            {aiTeam.map(char => renderCharacter(char, false))}
          </div>
        </div>
      </div>
      
      {/* Skills panel */}
      <div className="skills-panel">
        <div className="skills-header">
          {selectedSkill ? 'Select Target' : 'Select a Skill'}
        </div>
        {playerTeam.map((char, idx) => (
          <div key={char.id} className="char-skills">
            <div className="char-skills-label">{char.name}</div>
            {renderSkills(char, idx)}
          </div>
        ))}
        
        <div className="action-buttons">
          <button 
            className="execute-btn"
            onClick={executeActions}
            disabled={animating || queuedActions.length === 0}
          >
            {animating ? 'Executing...' : `Execute Turn (${queuedActions.length} actions)`}
          </button>
          
          <button 
            className="skip-btn"
            onClick={endTurn}
            disabled={animating}
          >
            Skip Turn
          </button>
        </div>
      </div>
      
      {/* Skill tooltip */}
      {hoveredSkill && (
        <div className="skill-tooltip">
          <div className="tooltip-name">{hoveredSkill.name}</div>
          <div className="tooltip-desc">{hoveredSkill.description}</div>
          {hoveredSkill.cooldown > 0 && (
            <div className="tooltip-cd">Cooldown: {hoveredSkill.cooldown} turns</div>
          )}
        </div>
      )}
      
      {/* Battle log */}
      <div className="battle-log" ref={logRef}>
        <div className="log-header">📜 Battle Log</div>
        <div className="log-entries">
          {log.map((entry, i) => (
            <div key={i} className={`log-entry ${entry.type}`}>
              <span className="log-turn">[T{entry.turn}]</span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
