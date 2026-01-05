'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './battle.css';

// Types
interface Energy {
  fire: number;
  water: number;
  grass: number;
  electric: number;
  random: number;
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
}

type Difficulty = 'easy' | 'normal' | 'hard';
type GamePhase = 'loading' | 'setup' | 'battle' | 'victory' | 'defeat';

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
  type?: string;
}

export default function BattlePage() {
  const router = useRouter();
  
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  
  const [playerTeam, setPlayerTeam] = useState<BattleCharacter[]>([]);
  const [playerEnergy, setPlayerEnergy] = useState<Energy>({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
  
  const [aiTeam, setAiTeam] = useState<BattleCharacter[]>([]);
  const [aiEnergy, setAiEnergy] = useState<Energy>({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
  
  const [selectedChar, setSelectedChar] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<{ charIndex: number; skillIndex: number } | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{ char: BattleCharacter; skill: Skill } | null>(null);
  const [queuedActions, setQueuedActions] = useState<Array<{ charIndex: number; skillIndex: number; targetIndex: number }>>([]);
  
  const [centerChar, setCenterChar] = useState<BattleCharacter | null>(null);
  const [animating, setAnimating] = useState(false);

  // Load player team
  useEffect(() => {
    loadPlayerTeam();
  }, []);

  const loadPlayerTeam = async () => {
    try {
      const savedTeam = localStorage.getItem('selectedTeam');
      if (savedTeam) {
        const parsed = JSON.parse(savedTeam);
        if (Array.isArray(parsed) && parsed.length === 3) {
          const team = parsed.map((p: Pokemon, idx: number) => createBattleCharacter(p, idx));
          setPlayerTeam(team);
          setCenterChar(team[0]);
          localStorage.removeItem('selectedTeam');
          setPhase('setup');
          return;
        }
      }
      
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
      setCenterChar(team[0]);
      setPhase('setup');
    } catch {
      router.push('/login');
    }
  };

  const createBattleCharacter = (pokemon: Pokemon, slot: number): BattleCharacter => {
    const health = pokemon.health || pokemon.hp || 100;
    let types: string[] = ['Normal'];
    
    if (pokemon.types) {
      if (Array.isArray(pokemon.types)) {
        types = pokemon.types;
      } else if (typeof pokemon.types === 'string') {
        try {
          types = JSON.parse(pokemon.types);
        } catch {
          types = pokemon.types.split(',').map(t => t.trim());
        }
      }
    } else if (pokemon.type) {
      types = [pokemon.type];
    }
    
    const primaryType = types[0] || 'Normal';
    
    return {
      id: pokemon.id,
      slot,
      name: pokemon.name,
      types,
      health,
      maxHealth: health,
      alive: true,
      skills: (pokemon.moves || []).slice(0, 4).map((m, idx) => createSkill(m, idx, primaryType)),
    };
  };

  const createSkill = (move: Move, index: number, pokemonType: string): Skill => {
    const damage = move.damage || move.power || 20;
    let cost: Partial<Energy> = {};
    
    if (move.energyCost) {
      try {
        cost = JSON.parse(move.energyCost);
      } catch {
        cost = { random: 1 };
      }
    } else {
      const typeKey = pokemonType.toLowerCase() as keyof Energy;
      if (['fire', 'water', 'grass', 'electric'].includes(typeKey)) {
        cost[typeKey] = index === 3 ? 2 : 1;
      } else {
        cost.random = index === 3 ? 2 : 1;
      }
    }
    
    return {
      id: move.id || `skill-${index}`,
      name: move.name,
      description: move.description || `Deals ${damage} damage.`,
      classes: ['Physical'],
      cost,
      cooldown: move.cooldown || 0,
      currentCooldown: 0,
      damage,
    };
  };

  const generateAITeam = async () => {
    try {
      const res = await fetch('/api/pokemon?starters=true');
      const allPokemon = await res.json();
      
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
    setPlayerEnergy({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
    setAiEnergy({ fire: 0, water: 0, grass: 0, electric: 0, random: 1 });
    generateEnergy();
  };

  const generateEnergy = () => {
    const types: (keyof Energy)[] = ['fire', 'water', 'grass', 'electric'];
    const pType = types[Math.floor(Math.random() * types.length)];
    setPlayerEnergy(prev => ({ ...prev, [pType]: prev[pType] + 1 }));
    const aType = types[Math.floor(Math.random() * types.length)];
    setAiEnergy(prev => ({ ...prev, [aType]: prev[aType] + 1 }));
  };

  const canAfford = useCallback((cost: Partial<Energy>, energy: Energy): boolean => {
    let remaining = { ...energy };
    for (const [type, amount] of Object.entries(cost)) {
      if (type === 'random') continue;
      const typeKey = type as keyof Energy;
      if ((remaining[typeKey] || 0) < (amount || 0)) return false;
      remaining[typeKey] -= amount || 0;
    }
    const randomNeeded = cost.random || 0;
    const randomAvailable = remaining.fire + remaining.water + remaining.grass + remaining.electric;
    return randomAvailable >= randomNeeded;
  }, []);

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
    
    // If already queued, remove it
    const existingIdx = queuedActions.findIndex(a => a.charIndex === charIndex && a.skillIndex === skillIndex);
    if (existingIdx >= 0) {
      setQueuedActions(prev => prev.filter((_, i) => i !== existingIdx));
      setSelectedSkill(null);
      return;
    }
    
    setSelectedSkill({ charIndex, skillIndex });
  };

  const selectTarget = (targetIndex: number) => {
    if (!selectedSkill) return;
    
    const { charIndex, skillIndex } = selectedSkill;
    const char = playerTeam[charIndex];
    const skill = char.skills[skillIndex];
    
    setPlayerEnergy(prev => spendEnergy(skill.cost, prev));
    setQueuedActions(prev => [...prev, { charIndex, skillIndex, targetIndex }]);
    setSelectedSkill(null);
  };

  const executeActions = async () => {
    if (animating) return;
    setAnimating(true);
    setIsPlayerTurn(false);
    
    // Execute player actions
    for (const action of queuedActions) {
      await executeAction(action, true);
      await delay(600);
    }
    
    // Check if AI lost
    if (!aiTeam.some(c => c.alive)) {
      setPhase('victory');
      setAnimating(false);
      return;
    }
    
    // AI turn
    await executeAITurn();
    
    // Check if player lost
    if (!playerTeam.some(c => c.alive)) {
      setPhase('defeat');
      setAnimating(false);
      return;
    }
    
    // Next turn
    endTurn();
    setAnimating(false);
    setIsPlayerTurn(true);
  };

  const executeAction = async (action: { charIndex: number; skillIndex: number; targetIndex: number }, isPlayer: boolean) => {
    const attacker = isPlayer ? playerTeam[action.charIndex] : aiTeam[action.charIndex - 3];
    const defender = action.targetIndex < 3 ? playerTeam[action.targetIndex] : aiTeam[action.targetIndex - 3];
    const skill = attacker.skills[action.skillIndex];
    
    if (!attacker.alive || !defender.alive) return;
    
    // Set center character to defender
    setCenterChar(defender);
    
    const damage = skill.damage || 20;
    defender.health = Math.max(0, defender.health - damage);
    
    if (defender.health <= 0) {
      defender.alive = false;
    }
    
    skill.currentCooldown = skill.cooldown;
    
    if (action.targetIndex < 3) {
      setPlayerTeam([...playerTeam]);
    } else {
      setAiTeam([...aiTeam]);
    }
  };

  const executeAITurn = async () => {
    for (const char of aiTeam) {
      if (!char.alive) continue;
      
      const affordableSkills = char.skills.filter(s => 
        s.currentCooldown === 0 && canAfford(s.cost, aiEnergy)
      );
      
      if (affordableSkills.length === 0) continue;
      
      const skillIdx = char.skills.indexOf(affordableSkills[Math.floor(Math.random() * affordableSkills.length)]);
      const skill = char.skills[skillIdx];
      
      const targets = playerTeam.filter(t => t.alive);
      if (targets.length === 0) continue;
      
      const target = targets[Math.floor(Math.random() * targets.length)];
      
      setAiEnergy(prev => spendEnergy(skill.cost, prev));
      
      await executeAction({ charIndex: char.slot, skillIndex: skillIdx, targetIndex: target.slot }, false);
      await delay(600);
    }
  };

  const endTurn = () => {
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
    generateEnergy();
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getAIName = () => {
    switch (difficulty) {
      case 'easy': return 'Youngster Joey';
      case 'normal': return 'Trainer Red';
      case 'hard': return 'Champion Blue';
    }
  };

  const getSkillEnergyCost = (cost: Partial<Energy>) => {
    const entries = Object.entries(cost).filter(([, v]) => v && v > 0);
    if (entries.length === 0) return 'NONE';
    return entries.map(([type, count]) => `${type.toUpperCase()}: ${count}`).join(', ');
  };

  // Render character card (Naruto Arena style)
  const renderCharacterCard = (char: BattleCharacter, isPlayer: boolean) => {
    const isQueued = (skillIdx: number) => queuedActions.some(a => a.charIndex === char.slot && a.skillIndex === skillIdx);
    const isSelected = selectedSkill?.charIndex === char.slot;
    
    return (
      <div 
        key={char.id}
        className={`character-card ${!char.alive ? 'dead' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          if (selectedSkill && !isPlayer && char.alive) {
            selectTarget(char.slot);
          } else if (isPlayer) {
            setCenterChar(char);
          }
        }}
      >
        {/* Portrait with HP bar */}
        <div className="char-portrait">
          <img 
            src={`/images/pokemon/${char.name.toLowerCase()}.png`}
            alt={char.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
            }}
          />
          <div className="char-hp-bar">
            <div 
              className="char-hp-fill" 
              style={{ width: `${(char.health / char.maxHealth) * 100}%` }}
            />
            <span className="char-hp-text">{char.health}/{char.maxHealth}</span>
          </div>
        </div>
        
        {/* Skills grid */}
        <div className="char-skills">
          {char.skills.map((skill, idx) => {
            const affordable = canAfford(skill.cost, isPlayer ? playerEnergy : aiEnergy);
            const onCooldown = skill.currentCooldown > 0;
            const queued = isQueued(idx);
            
            return (
              <div
                key={skill.id}
                className={`skill-icon ${!affordable ? 'disabled' : ''} ${onCooldown ? 'cooldown' : ''} ${queued ? 'queued' : ''} ${selectedSkill?.charIndex === char.slot && selectedSkill?.skillIndex === idx ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPlayer && char.alive) {
                    selectSkill(char.slot, idx);
                  }
                }}
                onMouseEnter={() => setHoveredSkill({ char, skill })}
                onMouseLeave={() => setHoveredSkill(null)}
                title={skill.name}
              >
                {onCooldown ? (
                  <span className="cooldown-number">{skill.currentCooldown}</span>
                ) : (
                  <img 
                    src={`/images/pokemon/${char.name.toLowerCase()}.png`}
                    alt={skill.name}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      objectFit: 'contain',
                      filter: queued ? 'brightness(1.2)' : 'none',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Loading screen
  if (phase === 'loading') {
    return <div className="loading-screen">Loading...</div>;
  }

  // Setup screen
  if (phase === 'setup') {
    return (
      <div className="setup-screen">
        <h1 className="setup-title">⚔️ Battle vs AI</h1>
        
        <div className="team-preview">
          {playerTeam.map(char => (
            <div key={char.id} className="preview-char">
              <img 
                src={`/images/pokemon/${char.name.toLowerCase()}.png`}
                alt={char.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
                }}
              />
              <div className="preview-char-name">{char.name}</div>
            </div>
          ))}
        </div>
        
        <div className="difficulty-section">
          <h2>Select Difficulty</h2>
          <div className="difficulty-options">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? 'selected' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                  {d === 'easy' ? '😊' : d === 'normal' ? '😐' : '😈'}
                </div>
                <div style={{ fontWeight: 'bold' }}>{d.charAt(0).toUpperCase() + d.slice(1)}</div>
              </button>
            ))}
          </div>
        </div>
        
        <button className="start-btn" onClick={startBattle}>
          ⚔️ Start Battle
        </button>
        
        <button className="back-btn" onClick={() => router.push('/play')}>
          ← Back
        </button>
      </div>
    );
  }

  // Victory/Defeat screen
  if (phase === 'victory' || phase === 'defeat') {
    return (
      <div className="result-screen">
        <div className={`result-modal ${phase}`}>
          <h1>{phase === 'victory' ? '🏆 VICTORY!' : '💔 DEFEAT'}</h1>
          <p>{phase === 'victory' ? 'Congratulations! You won!' : "Don't give up!"}</p>
          <div className="result-buttons">
            <button 
              className="start-btn"
              onClick={() => {
                setPhase('setup');
                setPlayerTeam(playerTeam.map(c => ({ 
                  ...c, 
                  health: c.maxHealth, 
                  alive: true, 
                  skills: c.skills.map(s => ({ ...s, currentCooldown: 0 })) 
                })));
              }}
            >
              Play Again
            </button>
            <button className="back-btn" onClick={() => router.push('/play')}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Battle screen - Naruto Arena layout
  return (
    <div className="battle-arena">
      {/* TOP BAR - Player info and chakra */}
      <div className="top-bar">
        {/* Player info */}
        <div className="player-info">
          <img 
            src="/images/trainer-avatar.png" 
            alt="Player"
            className="player-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
            }}
          />
          <div className="player-details">
            <div className="player-name">YOU</div>
            <div className="player-rank">TRAINER</div>
          </div>
        </div>
        
        {/* Center - Turn status and chakra */}
        <div className="turn-section">
          <div className="turn-status">
            {isPlayerTurn ? 'PRESS WHEN READY' : 'OPPONENT TURN...'}
          </div>
          <div className="health-bar-main">
            <div className="health-bar-fill" style={{ width: '100%' }} />
          </div>
          
          {/* Chakra display */}
          <div className="chakra-display">
            <div className="chakra-item">
              <div className="chakra-orb grass" />
              <span className="chakra-count">x{playerEnergy.grass}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-orb fire" />
              <span className="chakra-count">x{playerEnergy.fire}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-orb water" />
              <span className="chakra-count">x{playerEnergy.water}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-orb electric" />
              <span className="chakra-count">x{playerEnergy.electric}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-orb random" />
              <span className="chakra-count">x{playerEnergy.random}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px' }}>EXCHANGE CHAKRA</div>
        </div>
        
        {/* AI info */}
        <div className="player-info right">
          <img 
            src="/images/trainer-avatar.png" 
            alt="AI"
            className="player-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
            }}
          />
          <div className="player-details" style={{ textAlign: 'right' }}>
            <div className="player-name">{getAIName().toUpperCase()}</div>
            <div className="player-rank">{difficulty.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* MAIN BATTLE FIELD */}
      <div className="battle-field">
        {/* Player team - LEFT */}
        <div className="team-column">
          {playerTeam.map(char => renderCharacterCard(char, true))}
        </div>

        {/* Center character display */}
        <div className="center-display">
          {centerChar && (
            <img 
              src={`/images/pokemon/${centerChar.name.toLowerCase()}.png`}
              alt={centerChar.name}
              className="center-character"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
              }}
            />
          )}
        </div>

        {/* AI team - RIGHT */}
        <div className="team-column">
          {aiTeam.map(char => renderCharacterCard(char, false))}
        </div>
      </div>

      {/* BOTTOM BAR - Tooltip and actions */}
      <div className="bottom-bar">
        {/* Left - Surrender and chat */}
        <div className="bottom-left">
          <button className="surrender-btn">SURRENDER</button>
          <button className="chat-btn">OPEN CHAT</button>
        </div>

        {/* Skill tooltip */}
        <div className="skill-tooltip">
          {hoveredSkill ? (
            <>
              <div className="skill-tooltip-title">{hoveredSkill.skill.name}</div>
              <div className="skill-tooltip-desc">
                {hoveredSkill.skill.description}
              </div>
              <div className="skill-tooltip-meta">
                <span className="skill-tooltip-classes">
                  CLASSES: {hoveredSkill.skill.classes.join(', ')}
                </span>
                <span className="skill-tooltip-energy">
                  <span className="energy-label">ENERGY:</span>
                  <span>{getSkillEnergyCost(hoveredSkill.skill.cost)}</span>
                </span>
                <span className="skill-tooltip-cooldown">
                  COOLDOWN: {hoveredSkill.skill.cooldown}
                </span>
              </div>
            </>
          ) : (
            <div className="skill-tooltip-title">
              {selectedSkill ? 'SELECT A TARGET' : 'HOVER OVER A SKILL'}
            </div>
          )}
        </div>

        {/* Ready button */}
        <div className="ready-section">
          <button 
            className="ready-btn"
            onClick={executeActions}
            disabled={animating || queuedActions.length === 0}
          >
            {animating ? 'EXECUTING...' : `READY (${queuedActions.length})`}
          </button>
          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
            Turn {turn}
          </div>
        </div>
      </div>
    </div>
  );
}
