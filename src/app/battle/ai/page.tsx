'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './battle.css';

interface Energy {
  green: number;
  red: number;
  blue: number;
  yellow: number;
  white: number;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  cost: Partial<Energy>;
  cooldown: number;
  currentCooldown: number;
  damage: number;
}

interface Character {
  id: string;
  slot: number;
  name: string;
  health: number;
  maxHealth: number;
  alive: boolean;
  skills: Skill[];
}

type Difficulty = 'easy' | 'normal' | 'hard';
type Phase = 'loading' | 'setup' | 'battle' | 'victory' | 'defeat';

interface Pokemon {
  id: string;
  name: string;
  types?: string | string[];
  health?: number;
  hp?: number;
  moves?: any[];
}

export default function BattlePage() {
  const router = useRouter();
  
  const [phase, setPhase] = useState<Phase>('loading');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [turn, setTurn] = useState(1);
  
  const [playerTeam, setPlayerTeam] = useState<Character[]>([]);
  const [playerEnergy, setPlayerEnergy] = useState<Energy>({ green: 0, red: 0, blue: 0, yellow: 0, white: 1 });
  
  const [aiTeam, setAiTeam] = useState<Character[]>([]);
  const [aiEnergy, setAiEnergy] = useState<Energy>({ green: 0, red: 0, blue: 0, yellow: 0, white: 1 });
  
  const [selectedChar, setSelectedChar] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<{ charIdx: number; skillIdx: number } | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{ char: Character; skill: Skill } | null>(null);
  const [queuedActions, setQueuedActions] = useState<Array<{ charIdx: number; skillIdx: number; targetIdx: number }>>([]);
  
  const [centerChar, setCenterChar] = useState<Character | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadPlayerTeam();
  }, []);

  const loadPlayerTeam = async () => {
    try {
      const savedTeam = localStorage.getItem('selectedTeam');
      if (savedTeam) {
        const parsed = JSON.parse(savedTeam);
        if (Array.isArray(parsed) && parsed.length === 3) {
          const team = parsed.map((p: Pokemon, idx: number) => createCharacter(p, idx));
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
        createCharacter(tp.pokemon, idx)
      );
      setPlayerTeam(team);
      setCenterChar(team[0]);
      setPhase('setup');
    } catch {
      router.push('/login');
    }
  };

  const createCharacter = (pokemon: Pokemon, slot: number): Character => {
    const health = pokemon.health || pokemon.hp || 100;
    
    return {
      id: pokemon.id,
      slot,
      name: pokemon.name,
      health,
      maxHealth: health,
      alive: true,
      skills: (pokemon.moves || []).slice(0, 4).map((m: any, idx: number) => createSkill(m, idx)),
    };
  };

  const createSkill = (move: any, index: number): Skill => {
    const damage = move.damage || move.power || 20;
    let cost: Partial<Energy> = {};
    
    if (move.energyCost) {
      try {
        const parsed = JSON.parse(move.energyCost);
        // Map pokemon types to naruto chakra
        if (parsed.grass) cost.green = parsed.grass;
        if (parsed.fire) cost.red = parsed.fire;
        if (parsed.water) cost.blue = parsed.water;
        if (parsed.electric) cost.yellow = parsed.electric;
        if (parsed.normal || parsed.colorless) cost.white = (parsed.normal || parsed.colorless);
      } catch {
        cost = { white: 1 };
      }
    } else {
      cost = { white: index === 3 ? 2 : 1 };
    }
    
    return {
      id: move.id || `skill-${index}`,
      name: move.name,
      description: move.description || `Deals ${damage} damage.`,
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
      
      const team = selected.map((p: Pokemon, idx: number) => createCharacter(p, idx + 3));
      setAiTeam(team);
    } catch {
      console.error('Failed to generate AI team');
    }
  };

  const startBattle = async () => {
    await generateAITeam();
    setPhase('battle');
    setTurn(1);
    setPlayerEnergy({ green: 0, red: 0, blue: 0, yellow: 0, white: 1 });
    setAiEnergy({ green: 0, red: 0, blue: 0, yellow: 0, white: 1 });
    generateEnergy();
  };

  const generateEnergy = () => {
    const types: (keyof Energy)[] = ['green', 'red', 'blue', 'yellow'];
    const pType = types[Math.floor(Math.random() * types.length)];
    setPlayerEnergy(prev => ({ ...prev, [pType]: prev[pType] + 1 }));
    const aType = types[Math.floor(Math.random() * types.length)];
    setAiEnergy(prev => ({ ...prev, [aType]: prev[aType] + 1 }));
  };

  const canAfford = useCallback((cost: Partial<Energy>, energy: Energy): boolean => {
    let remaining = { ...energy };
    for (const [type, amount] of Object.entries(cost)) {
      const typeKey = type as keyof Energy;
      if ((remaining[typeKey] || 0) < (amount || 0)) return false;
      remaining[typeKey] -= amount || 0;
    }
    return true;
  }, []);

  const spendEnergy = (cost: Partial<Energy>, energy: Energy): Energy => {
    const result = { ...energy };
    for (const [type, amount] of Object.entries(cost)) {
      const typeKey = type as keyof Energy;
      result[typeKey] = Math.max(0, (result[typeKey] || 0) - (amount || 0));
    }
    return result;
  };

  const selectSkill = (charIdx: number, skillIdx: number) => {
    const char = playerTeam[charIdx];
    if (!char.alive) return;
    
    const skill = char.skills[skillIdx];
    if (!skill || skill.currentCooldown > 0) return;
    if (!canAfford(skill.cost, playerEnergy)) return;
    
    const existingIdx = queuedActions.findIndex(a => a.charIdx === charIdx && a.skillIdx === skillIdx);
    if (existingIdx >= 0) {
      setQueuedActions(prev => prev.filter((_, i) => i !== existingIdx));
      setSelectedSkill(null);
      return;
    }
    
    setSelectedSkill({ charIdx, skillIdx });
    setSelectedChar(charIdx);
  };

  const selectTarget = (targetIdx: number) => {
    if (!selectedSkill) return;
    
    const { charIdx, skillIdx } = selectedSkill;
    const char = playerTeam[charIdx];
    const skill = char.skills[skillIdx];
    
    setPlayerEnergy(prev => spendEnergy(skill.cost, prev));
    setQueuedActions(prev => [...prev, { charIdx, skillIdx, targetIdx }]);
    setSelectedSkill(null);
  };

  const executeActions = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    
    for (const action of queuedActions) {
      await executeAction(action, true);
      await delay(700);
    }
    
    if (!aiTeam.some(c => c.alive)) {
      setPhase('victory');
      setIsExecuting(false);
      return;
    }
    
    await executeAITurn();
    
    if (!playerTeam.some(c => c.alive)) {
      setPhase('defeat');
      setIsExecuting(false);
      return;
    }
    
    endTurn();
    setIsExecuting(false);
  };

  const executeAction = async (action: { charIdx: number; skillIdx: number; targetIdx: number }, isPlayer: boolean) => {
    const attacker = isPlayer ? playerTeam[action.charIdx] : aiTeam[action.charIdx - 3];
    const defender = action.targetIdx < 3 ? playerTeam[action.targetIdx] : aiTeam[action.targetIdx - 3];
    const skill = attacker.skills[action.skillIdx];
    
    if (!attacker.alive || !defender.alive) return;
    
    setCenterChar(defender);
    
    defender.health = Math.max(0, defender.health - skill.damage);
    if (defender.health <= 0) defender.alive = false;
    
    skill.currentCooldown = skill.cooldown;
    
    if (action.targetIdx < 3) {
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
      
      await executeAction({ charIdx: char.slot, skillIdx, targetIdx: target.slot }, false);
      await delay(700);
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

  const renderCharCard = (char: Character, isPlayer: boolean) => {
    const isQueued = (skillIdx: number) => queuedActions.some(a => a.charIdx === char.slot && a.skillIdx === skillIdx);
    const isSelected = selectedChar === char.slot;
    
    return (
      <div 
        key={char.id}
        className={`char-card ${!char.alive ? 'dead' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          if (selectedSkill && !isPlayer && char.alive) {
            selectTarget(char.slot);
          } else if (isPlayer) {
            setCenterChar(char);
            setSelectedChar(char.slot);
          }
        }}
      >
        <div className="char-portrait">
          <img 
            src={`/images/pokemon/${char.name.toLowerCase()}.png`}
            alt={char.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
            }}
          />
          <div className="char-hp">
            <div 
              className="char-hp-fill" 
              style={{ width: `${(char.health / char.maxHealth) * 100}%` }}
            />
            <span className="char-hp-text">{char.health}/{char.maxHealth}</span>
          </div>
        </div>
        
        <div className="char-skills">
          {char.skills.map((skill, idx) => {
            const affordable = canAfford(skill.cost, isPlayer ? playerEnergy : aiEnergy);
            const onCooldown = skill.currentCooldown > 0;
            const queued = isQueued(idx);
            const skillSelected = selectedSkill?.charIdx === char.slot && selectedSkill?.skillIdx === idx;
            
            return (
              <div
                key={skill.id}
                className={`skill-btn ${!affordable ? 'disabled' : ''} ${onCooldown ? 'on-cooldown' : ''} ${queued ? 'queued' : ''} ${skillSelected ? 'selected' : ''}`}
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
                  <span className="skill-cooldown">{skill.currentCooldown}</span>
                ) : (
                  <img 
                    src={`/images/pokemon/${char.name.toLowerCase()}.png`}
                    alt={skill.name}
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

  if (phase === 'loading') {
    return <div className="loading-screen">Loading...</div>;
  }

  if (phase === 'setup') {
    return (
      <div className="setup-screen">
        <h1 className="setup-title">⚔️ Battle vs AI</h1>
        
        <div className="team-preview">
          {playerTeam.map(char => (
            <div key={char.id} className="preview-card">
              <img 
                src={`/images/pokemon/${char.name.toLowerCase()}.png`}
                alt={char.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
                }}
              />
              <div className="preview-name">{char.name}</div>
            </div>
          ))}
        </div>
        
        <div className="difficulty-section">
          <h2>Select Difficulty</h2>
          <div className="difficulty-btns">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? 'selected' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                <div className="diff-icon">
                  {d === 'easy' ? '😊' : d === 'normal' ? '😐' : '😈'}
                </div>
                <div className="diff-label">{d.charAt(0).toUpperCase() + d.slice(1)}</div>
              </button>
            ))}
          </div>
        </div>
        
        <button className="start-btn" onClick={startBattle}>Start Battle</button>
        <button className="back-btn" onClick={() => router.push('/play')}>← Back</button>
      </div>
    );
  }

  if (phase === 'victory' || phase === 'defeat') {
    return (
      <div className="result-screen">
        <div className={`result-modal ${phase}`}>
          <h1>{phase === 'victory' ? '🏆 VICTORY!' : '💔 DEFEAT'}</h1>
          <p>{phase === 'victory' ? 'You won!' : "Try again!"}</p>
          <div className="result-btns">
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
            <button className="back-btn" onClick={() => router.push('/play')}>Menu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="naruto-battle">
      <div className="battle-background" />
      
      {/* TOP HEADER */}
      <div className="battle-header">
        <div className="player-info">
          <img 
            src="/images/trainer-avatar.png" 
            alt="You"
            className="player-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
            }}
          />
          <div className="player-name">YOU</div>
        </div>
        
        <div className="turn-indicator">
          <div className="turn-status">
            {isExecuting ? 'OPPONENT TURN...' : 'PRESS WHEN READY'}
          </div>
          
          <div className="chakra-bar">
            <div className="chakra-item">
              <span className="chakra-square green" />
              <span className="chakra-count">x{playerEnergy.green}</span>
            </div>
            <div className="chakra-item">
              <span className="chakra-square red" />
              <span className="chakra-count">x{playerEnergy.red}</span>
            </div>
            <div className="chakra-item">
              <span className="chakra-square blue" />
              <span className="chakra-count">x{playerEnergy.blue}</span>
            </div>
            <div className="chakra-item">
              <span className="chakra-square yellow" />
              <span className="chakra-count">x{playerEnergy.yellow}</span>
            </div>
            <div className="chakra-item">
              <span className="chakra-square white" />
              <span className="chakra-count">x{playerEnergy.white}</span>
            </div>
          </div>
        </div>
        
        <div className="player-info">
          <div className="ai-name">{getAIName().toUpperCase()}</div>
          <img 
            src="/images/trainer-avatar.png" 
            alt="AI"
            className="player-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
            }}
          />
        </div>
      </div>

      {/* MAIN BATTLE AREA */}
      <div className="battle-main">
        <div className="team-column left">
          {playerTeam.map(char => renderCharCard(char, true))}
        </div>

        <div className="battle-center">
          {centerChar && (
            <img 
              src={`/images/pokemon/${centerChar.name.toLowerCase()}.png`}
              alt={centerChar.name}
              className="center-char"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/pokemon/pikachu.png';
              }}
            />
          )}
        </div>

        <div className="team-column right">
          {aiTeam.map(char => renderCharCard(char, false))}
        </div>
      </div>

      {/* BOTTOM CONTROL PANEL */}
      <div className="battle-footer">
        <div className="footer-left">
          <button className="control-btn">SURRENDER</button>
          <button className="control-btn chat">OPEN CHAT</button>
        </div>

        <div className="skill-tooltip">
          {hoveredSkill ? (
            <>
              <div className="tooltip-title">{hoveredSkill.skill.name}</div>
              <div className="tooltip-desc">{hoveredSkill.skill.description}</div>
              <div className="tooltip-meta">
                <span className="tooltip-energy">
                  ENERGY: {Object.entries(hoveredSkill.skill.cost)
                    .filter(([, v]) => v && v > 0)
                    .map(([k, v]) => `${k.toUpperCase()}:${v}`)
                    .join(', ') || 'NONE'}
                </span>
                <span className="tooltip-cooldown">
                  COOLDOWN: {hoveredSkill.skill.cooldown}
                </span>
              </div>
            </>
          ) : (
            <div className="tooltip-title">
              {selectedSkill ? 'SELECT A TARGET' : 'HOVER OVER A SKILL'}
            </div>
          )}
        </div>

        <div className="footer-right">
          <button 
            className="ready-btn"
            onClick={executeActions}
            disabled={isExecuting || queuedActions.length === 0}
          >
            {isExecuting ? 'EXECUTING...' : `READY (${queuedActions.length})`}
          </button>
          <div className="turn-display">Turn {turn}</div>
        </div>
      </div>
    </div>
  );
}
