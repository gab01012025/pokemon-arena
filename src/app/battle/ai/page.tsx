'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './naruto-arena.css';

// ==================== TYPES ====================
interface Pokemon {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  portrait: string;
  sprite: string;
  types: string[];
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  desc: string;
  power: number;
  type: string;
  cd: number;
  currentCd: number;
  cost: Record<string, number>;
  classes: string[];
  target: 'enemy' | 'self';
}

interface QueuedAction {
  oderId: string;
  skillId: string;
  skillType: string;
  targetId: string;
  targetName: string;
}

interface Popup {
  id: string;
  x: number;
  y: number;
  value: number;
  type: 'damage' | 'heal';
}

// ==================== POKEMON DATA ====================
const POKEDATA: Record<string, {
  name: string;
  types: string[];
  hp: number;
  skills: Omit<Skill, 'currentCd'>[];
}> = {
  pikachu: {
    name: 'Pikachu', types: ['electric'], hp: 100,
    skills: [
      { id: 'thunderbolt', name: 'Thunderbolt', desc: 'A strong electric blast that deals 35 damage to one enemy.', power: 35, type: 'electric', cd: 0, cost: { electric: 1 }, classes: ['Ranged', 'Instant'], target: 'enemy' },
      { id: 'quick-attack', name: 'Quick Attack', desc: 'A fast attack that deals 20 damage.', power: 20, type: 'normal', cd: 0, cost: { colorless: 1 }, classes: ['Melee', 'Instant'], target: 'enemy' },
      { id: 'thunder-wave', name: 'Thunder Wave', desc: 'Stuns one enemy for 1 turn.', power: 0, type: 'electric', cd: 2, cost: { electric: 1 }, classes: ['Ranged', 'Affliction'], target: 'enemy' },
      { id: 'volt-tackle', name: 'Volt Tackle', desc: 'A devastating charge that deals 50 damage.', power: 50, type: 'electric', cd: 3, cost: { electric: 2 }, classes: ['Melee', 'Instant'], target: 'enemy' }
    ]
  },
  charizard: {
    name: 'Charizard', types: ['fire'], hp: 120,
    skills: [
      { id: 'flamethrower', name: 'Flamethrower', desc: 'Breathes intense flames dealing 40 damage.', power: 40, type: 'fire', cd: 0, cost: { fire: 1 }, classes: ['Ranged', 'Instant'], target: 'enemy' },
      { id: 'dragon-claw', name: 'Dragon Claw', desc: 'Slashes with claws dealing 30 damage.', power: 30, type: 'normal', cd: 0, cost: { colorless: 1 }, classes: ['Melee', 'Instant'], target: 'enemy' },
      { id: 'fire-spin', name: 'Fire Spin', desc: 'Traps target in fire dealing 15 damage per turn.', power: 15, type: 'fire', cd: 3, cost: { fire: 1, colorless: 1 }, classes: ['Ranged', 'Affliction'], target: 'enemy' },
      { id: 'blast-burn', name: 'Blast Burn', desc: 'The ultimate fire attack dealing 65 damage.', power: 65, type: 'fire', cd: 4, cost: { fire: 2, colorless: 1 }, classes: ['Ranged', 'Instant'], target: 'enemy' }
    ]
  },
  blastoise: {
    name: 'Blastoise', types: ['water'], hp: 130,
    skills: [
      { id: 'hydro-pump', name: 'Hydro Pump', desc: 'Blasts water at high pressure dealing 45 damage.', power: 45, type: 'water', cd: 1, cost: { water: 2 }, classes: ['Ranged', 'Instant'], target: 'enemy' },
      { id: 'water-gun', name: 'Water Gun', desc: 'A basic water attack dealing 25 damage.', power: 25, type: 'water', cd: 0, cost: { water: 1 }, classes: ['Ranged', 'Instant'], target: 'enemy' },
      { id: 'shell-smash', name: 'Shell Smash', desc: 'Boosts attack power for 3 turns.', power: 0, type: 'normal', cd: 4, cost: { colorless: 1 }, classes: ['Strategic'], target: 'self' },
      { id: 'protect', name: 'Protect', desc: 'Becomes invulnerable for 1 turn.', power: 0, type: 'normal', cd: 4, cost: { colorless: 1 }, classes: ['Strategic', 'Invulnerable'], target: 'self' }
    ]
  },
  venusaur: {
    name: 'Venusaur', types: ['grass'], hp: 125,
    skills: [
      { id: 'solar-beam', name: 'Solar Beam', desc: 'A powerful beam dealing 55 damage.', power: 55, type: 'grass', cd: 2, cost: { grass: 2 }, classes: ['Ranged', 'Instant'], target: 'enemy' },
      { id: 'vine-whip', name: 'Vine Whip', desc: 'Strikes with vines dealing 25 damage.', power: 25, type: 'grass', cd: 0, cost: { grass: 1 }, classes: ['Melee', 'Instant'], target: 'enemy' },
      { id: 'poison-powder', name: 'Poison Powder', desc: 'Poisons target dealing 10 damage per turn.', power: 10, type: 'poison', cd: 2, cost: { colorless: 1 }, classes: ['Ranged', 'Affliction'], target: 'enemy' },
      { id: 'synthesis', name: 'Synthesis', desc: 'Restores 35 HP.', power: -35, type: 'grass', cd: 3, cost: { grass: 1 }, classes: ['Strategic'], target: 'self' }
    ]
  },
  gengar: {
    name: 'Gengar', types: ['ghost'], hp: 90,
    skills: [
      { id: 'shadow-ball', name: 'Shadow Ball', desc: 'Hurls a shadowy blob dealing 40 damage.', power: 40, type: 'ghost', cd: 0, cost: { colorless: 2 }, classes: ['Ranged', 'Instant'], target: 'enemy' },
      { id: 'hypnosis', name: 'Hypnosis', desc: 'Puts the target to sleep for 2 turns.', power: 0, type: 'psychic', cd: 3, cost: { colorless: 1 }, classes: ['Ranged', 'Mental'], target: 'enemy' },
      { id: 'dream-eater', name: 'Dream Eater', desc: 'Eats dreams dealing 50 damage.', power: 50, type: 'psychic', cd: 2, cost: { colorless: 2 }, classes: ['Ranged', 'Mental'], target: 'enemy' },
      { id: 'curse', name: 'Curse', desc: 'Curses target to lose HP each turn.', power: 0, type: 'ghost', cd: 4, cost: { colorless: 1 }, classes: ['Ranged', 'Affliction'], target: 'enemy' }
    ]
  },
  mewtwo: {
    name: 'Mewtwo', types: ['psychic'], hp: 110,
    skills: [
      { id: 'psychic', name: 'Psychic', desc: 'A powerful psychic attack dealing 45 damage.', power: 45, type: 'psychic', cd: 0, cost: { colorless: 2 }, classes: ['Ranged', 'Mental'], target: 'enemy' },
      { id: 'barrier', name: 'Barrier', desc: 'Reduces damage taken by 50% for 2 turns.', power: 0, type: 'psychic', cd: 3, cost: { colorless: 1 }, classes: ['Strategic'], target: 'self' },
      { id: 'psystrike', name: 'Psystrike', desc: 'A devastating psychic blow dealing 55 damage.', power: 55, type: 'psychic', cd: 2, cost: { colorless: 3 }, classes: ['Ranged', 'Mental'], target: 'enemy' },
      { id: 'recover', name: 'Recover', desc: 'Restores 40 HP.', power: -40, type: 'normal', cd: 3, cost: { colorless: 1 }, classes: ['Strategic'], target: 'self' }
    ]
  }
};

const ALL_POKEMON = Object.keys(POKEDATA);

// ==================== HELPERS ====================
function getPokeNum(id: string): number {
  const nums: Record<string, number> = {
    pikachu: 25, charizard: 6, blastoise: 9, venusaur: 3, gengar: 94, mewtwo: 150
  };
  return nums[id] || 25;
}

function getPortrait(id: string): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokeNum(id)}.png`;
}

function getSprite(id: string): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokeNum(id)}.png`;
}

function getSkillIcon(type: string): string {
  const icons: Record<string, string> = {
    fire: '🔥', water: '💧', grass: '🌿', electric: '⚡',
    psychic: '🔮', ghost: '👻', poison: '☠️', normal: '⭐'
  };
  return icons[type] || '⚔️';
}

function createPokemon(pokemonId: string, owner: string): Pokemon {
  const data = POKEDATA[pokemonId] || POKEDATA.pikachu;
  return {
    id: `${owner}-${pokemonId}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name,
    hp: data.hp,
    maxHp: data.hp,
    portrait: getPortrait(pokemonId),
    sprite: getSprite(pokemonId),
    types: data.types,
    skills: data.skills.map(s => ({ ...s, currentCd: 0 }))
  };
}

function canAfford(cost: Record<string, number>, energy: Record<string, number>): boolean {
  let colorlessNeeded = cost.colorless || 0;
  for (const type of ['fire', 'water', 'grass', 'electric']) {
    if ((cost[type] || 0) > (energy[type] || 0)) return false;
  }
  const extra = Object.entries(energy).reduce((sum, [type, val]) => {
    if (type === 'colorless') return sum + val;
    return sum + Math.max(0, val - (cost[type] || 0));
  }, 0);
  return extra >= colorlessNeeded;
}

// ==================== MAIN ====================
export default function AIBattlePage() {
  return (
    <Suspense fallback={
      <div className="loading-overlay">
        <div className="loading-text">Loading Battle...</div>
        <div className="loading-spinner" />
      </div>
    }>
      <BattleGame />
    </Suspense>
  );
}

function BattleGame() {
  const router = useRouter();
  const params = useSearchParams();
  
  const teamParam = params.get('team');
  const difficulty = params.get('difficulty') || 'normal';
  
  const [loading, setLoading] = useState(true);
  const [turn, setTurn] = useState(1);
  const [timer, setTimer] = useState(100);
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Pokemon[]>([]);
  const [energy, setEnergy] = useState({ fire: 1, water: 1, grass: 1, electric: 1, colorless: 2 });
  const [selectedPoke, setSelectedPoke] = useState<Pokemon | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [targetMode, setTargetMode] = useState(false);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null);
  const [centerPoke, setCenterPoke] = useState<Pokemon | null>(null);

  // Initialize
  useEffect(() => {
    const team = teamParam?.split(',').slice(0, 3) || ['pikachu', 'charizard', 'blastoise'];
    while (team.length < 3) {
      const r = ALL_POKEMON[Math.floor(Math.random() * ALL_POKEMON.length)];
      if (!team.includes(r)) team.push(r);
    }
    
    const pTeam = team.map(id => createPokemon(id, 'p'));
    setPlayerTeam(pTeam);
    setCenterPoke(pTeam[0]);
    
    const eTeam: string[] = [];
    while (eTeam.length < 3) {
      const r = ALL_POKEMON[Math.floor(Math.random() * ALL_POKEMON.length)];
      if (!eTeam.includes(r)) eTeam.push(r);
    }
    setEnemyTeam(eTeam.map(id => createPokemon(id, 'e')));
    
    setTimeout(() => setLoading(false), 500);
  }, [teamParam]);

  // Timer
  useEffect(() => {
    if (loading || gameOver) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 0) return 100;
        return t - 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [loading, gameOver]);

  // Win/Lose check
  useEffect(() => {
    if (playerTeam.length === 0 || enemyTeam.length === 0) return;
    if (playerTeam.every(p => p.hp <= 0)) setGameOver('lose');
    else if (enemyTeam.every(p => p.hp <= 0)) setGameOver('win');
  }, [playerTeam, enemyTeam]);

  const onSkillClick = useCallback((poke: Pokemon, skill: Skill) => {
    if (skill.currentCd > 0 || poke.hp <= 0 || !canAfford(skill.cost, energy)) return;
    
    setSelectedPoke(poke);
    setSelectedSkill(skill);
    setCenterPoke(poke);
    
    if (skill.target === 'self') {
      addToQueue(poke, skill, poke);
    } else {
      setTargetMode(true);
    }
  }, [energy]);

  const addToQueue = useCallback((user: Pokemon, skill: Skill, target: Pokemon) => {
    setQueue(prev => [
      ...prev.filter(q => q.oderId !== user.id),
      { oderId: user.id, skillId: skill.id, skillType: skill.type, targetId: target.id, targetName: target.name }
    ]);
    setSelectedSkill(null);
    setSelectedPoke(null);
    setTargetMode(false);
  }, []);

  const onTargetClick = useCallback((target: Pokemon) => {
    if (!targetMode || !selectedSkill || !selectedPoke) return;
    addToQueue(selectedPoke, selectedSkill, target);
  }, [targetMode, selectedSkill, selectedPoke, addToQueue]);

  const removeFromQueue = useCallback((oderId: string) => {
    setQueue(prev => prev.filter(q => q.oderId !== oderId));
  }, []);

  const showPopup = useCallback((x: number, y: number, value: number, type: 'damage' | 'heal') => {
    const id = Math.random().toString(36);
    setPopups(prev => [...prev, { id, x, y, value, type }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1000);
  }, []);

  const executeTurn = useCallback(() => {
    if (gameOver) return;
    
    queue.forEach(action => {
      const user = playerTeam.find(p => p.id === action.oderId);
      const skill = user?.skills.find(s => s.id === action.skillId);
      if (!user || !skill || user.hp <= 0) return;
      
      let target = skill.target === 'self' 
        ? user 
        : enemyTeam.find(p => p.id === action.targetId && p.hp > 0) || enemyTeam.find(p => p.hp > 0);
      
      if (!target) return;
      
      if (skill.power > 0) {
        const dmg = Math.floor(skill.power * (0.85 + Math.random() * 0.3));
        setEnemyTeam(prev => prev.map(p => 
          p.id === target!.id ? { ...p, hp: Math.max(0, p.hp - dmg) } : p
        ));
        showPopup(550 + Math.random() * 100, 150 + Math.random() * 80, dmg, 'damage');
      } else if (skill.power < 0) {
        const heal = Math.abs(skill.power);
        setPlayerTeam(prev => prev.map(p => 
          p.id === target!.id ? { ...p, hp: Math.min(p.maxHp, p.hp + heal) } : p
        ));
        showPopup(150 + Math.random() * 100, 150 + Math.random() * 80, heal, 'heal');
      }
      
      setPlayerTeam(prev => prev.map(p => 
        p.id === user.id ? {
          ...p,
          skills: p.skills.map(s => s.id === skill.id ? { ...s, currentCd: s.cd } : s)
        } : p
      ));
      
      const cost = skill.cost;
      setEnergy(prev => {
        const next = { ...prev };
        for (const [type, amount] of Object.entries(cost)) {
          if (type !== 'colorless' && next[type as keyof typeof next] !== undefined) {
            (next as any)[type] -= amount;
          }
        }
        let colorless = cost.colorless || 0;
        for (const type of ['colorless'] as const) {
          const used = Math.min(next[type], colorless);
          next[type] -= used;
          colorless -= used;
        }
        return next;
      });
    });

    setTimeout(() => {
      const aiMod = difficulty === 'easy' ? 0.6 : difficulty === 'hard' ? 1.3 : 1.0;
      
      enemyTeam.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const skills = enemy.skills.filter(s => s.currentCd === 0 && s.power > 0);
        if (skills.length === 0) return;
        
        const skill = skills[Math.floor(Math.random() * skills.length)];
        const targets = playerTeam.filter(p => p.hp > 0);
        if (targets.length === 0) return;
        
        const target = targets[Math.floor(Math.random() * targets.length)];
        const dmg = Math.floor(skill.power * aiMod * (0.85 + Math.random() * 0.3));
        
        setPlayerTeam(prev => prev.map(p => 
          p.id === target.id ? { ...p, hp: Math.max(0, p.hp - dmg) } : p
        ));
        showPopup(150 + Math.random() * 100, 150 + Math.random() * 80, dmg, 'damage');
        
        setEnemyTeam(prev => prev.map(p => 
          p.id === enemy.id ? {
            ...p,
            skills: p.skills.map(s => s.id === skill.id ? { ...s, currentCd: s.cd } : s)
          } : p
        ));
      });
      
      setPlayerTeam(prev => prev.map(p => ({
        ...p,
        skills: p.skills.map(s => ({ ...s, currentCd: Math.max(0, s.currentCd - 1) }))
      })));
      setEnemyTeam(prev => prev.map(p => ({
        ...p,
        skills: p.skills.map(s => ({ ...s, currentCd: Math.max(0, s.currentCd - 1) }))
      })));
      
      setEnergy(prev => ({
        fire: Math.min(9, prev.fire + 1),
        water: Math.min(9, prev.water + 1),
        grass: Math.min(9, prev.grass + 1),
        electric: Math.min(9, prev.electric + 1),
        colorless: Math.min(9, prev.colorless + 1)
      }));
      
      setQueue([]);
      setTurn(t => t + 1);
      setTimer(100);
    }, 400);
  }, [gameOver, queue, playerTeam, enemyTeam, difficulty, showPopup]);

  const hpClass = (hp: number, max: number) => {
    const pct = (hp / max) * 100;
    if (pct <= 25) return 'low';
    if (pct <= 50) return 'medium';
    return '';
  };

  const displaySkill = hoveredSkill || selectedSkill;

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-text">Loading Battle...</div>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="gameover-overlay">
        <div className={`gameover-text ${gameOver}`}>
          {gameOver === 'win' ? 'VICTORY!' : 'DEFEAT'}
        </div>
        <button className="gameover-btn" onClick={() => router.push('/play')}>
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="battle-page">
      <div className="battle-bg" />
      
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="player-info">
          <div className="player-avatar">
            <img src="https://i.pravatar.cc/100?u=player" alt="Player" />
          </div>
          <div className="player-details">
            <div className="player-name">TRAINER</div>
            <div className="player-rank">POKEMON MASTER</div>
          </div>
        </div>
        
        <div className="top-center">
          <div className="turn-status">
            {queue.length > 0 ? 'PRESS WHEN READY' : 'YOUR TURN...'}
          </div>
          <div className="timer-bar">
            <div className="timer-fill" style={{ width: `${timer}%` }} />
          </div>
          <div className="chakra-display">
            <div className="chakra-item">
              <div className="chakra-box fire" />
              <span className="chakra-count">x{energy.fire}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-box water" />
              <span className="chakra-count">x{energy.water}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-box grass" />
              <span className="chakra-count">x{energy.grass}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-box electric" />
              <span className="chakra-count">x{energy.electric}</span>
            </div>
            <div className="chakra-item">
              <div className="chakra-box colorless" />
              <span className="chakra-count">x{energy.colorless}</span>
            </div>
            <button className="exchange-btn">EXCHANGE CHAKRA</button>
          </div>
        </div>
        
        <div className="player-info right">
          <div className="player-avatar">
            <img src="https://i.pravatar.cc/100?u=ai" alt="AI" />
          </div>
          <div className="player-details">
            <div className="player-name">AI TRAINER</div>
            <div className="player-rank">{difficulty.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="main-area">
        {/* LEFT TEAM */}
        <div className="team-col">
          {playerTeam.map(poke => (
            <div 
              key={poke.id}
              className={`char-row ${poke.hp <= 0 ? 'dead' : ''} ${centerPoke?.id === poke.id ? 'active' : ''}`}
            >
              <div className="portrait-section">
                <div 
                  className="portrait"
                  onClick={() => setCenterPoke(poke)}
                >
                  <img src={poke.portrait} alt={poke.name} />
                </div>
                <div className="hp-bar-container">
                  <div className="hp-bar">
                    <div 
                      className={`hp-fill ${hpClass(poke.hp, poke.maxHp)}`}
                      style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }}
                    />
                    <span className="hp-text">{poke.hp}/{poke.maxHp}</span>
                  </div>
                </div>
              </div>
              
              <div className="skills-container">
                {poke.skills.map(skill => {
                  const usable = poke.hp > 0 && skill.currentCd === 0 && canAfford(skill.cost, energy);
                  const isQueued = queue.some(q => q.oderId === poke.id && q.skillId === skill.id);
                  
                  return (
                    <div
                      key={skill.id}
                      className={`skill-box ${!usable ? 'disabled' : ''} ${skill.currentCd > 0 ? 'cooldown' : ''} ${isQueued ? 'queued' : ''} ${selectedSkill?.id === skill.id && selectedPoke?.id === poke.id ? 'selected' : ''}`}
                      onClick={() => usable && onSkillClick(poke, skill)}
                      onMouseEnter={() => setHoveredSkill(skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      <span className="skill-icon">{getSkillIcon(skill.type)}</span>
                      {skill.currentCd > 0 && (
                        <div className="cooldown-num">{skill.currentCd}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div className="center-col">
          {centerPoke && (
            <div className="center-pokemon">
              <img src={centerPoke.sprite} alt={centerPoke.name} />
            </div>
          )}
          
          {queue.length > 0 && (
            <div className="action-queue">
              {queue.map(action => (
                <div 
                  key={action.oderId}
                  className="queue-item"
                  onClick={() => removeFromQueue(action.oderId)}
                  title="Click to cancel"
                >
                  <span className="queue-icon">{getSkillIcon(action.skillType)}</span>
                  <span className="queue-target">→ {action.targetName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT TEAM */}
        <div className="team-col right">
          {enemyTeam.map(poke => (
            <div 
              key={poke.id}
              className={`char-row right ${poke.hp <= 0 ? 'dead' : ''}`}
            >
              <div className="portrait-section">
                <div 
                  className={`portrait ${targetMode && poke.hp > 0 ? 'targetable' : ''}`}
                  onClick={() => targetMode && poke.hp > 0 && onTargetClick(poke)}
                >
                  <img src={poke.portrait} alt={poke.name} />
                </div>
                <div className="hp-bar-container">
                  <div className="hp-bar">
                    <div 
                      className={`hp-fill ${hpClass(poke.hp, poke.maxHp)}`}
                      style={{ width: `${(poke.hp / poke.maxHp) * 100}%` }}
                    />
                    <span className="hp-text">{poke.hp}/{poke.maxHp}</span>
                  </div>
                </div>
              </div>
              
              <div className="skills-container">
                {poke.skills.map(skill => (
                  <div key={skill.id} className="skill-box disabled">
                    <span className="unknown-mark">?</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bottom-bar">
        <div className="bottom-left">
          <button className="surrender-btn" onClick={() => router.push('/play')}>
            Surrender
          </button>
          <button className="chat-btn">
            OPEN CHAT <span className="chat-new">(NEW: 2)</span>
          </button>
          <div className="volume-section">
            <span>🔊</span>
            <input type="range" min="0" max="100" defaultValue="50" />
          </div>
        </div>
        
        <div className="skill-panel">
          {displaySkill ? (
            <>
              <div className="skill-panel-title">{displaySkill.name}</div>
              <div className="skill-panel-desc">{displaySkill.desc}</div>
              <div className="skill-panel-footer">
                <span className="skill-classes">CLASSES: {displaySkill.classes.join(', ')}</span>
                <span className="skill-energy">
                  ENERGY: 
                  {Object.entries(displaySkill.cost).map(([type, amt]) => (
                    <span key={type}>
                      {Array(amt).fill(0).map((_, i) => (
                        <span key={i} className={`chakra-box ${type}`} />
                      ))}
                    </span>
                  ))}
                </span>
                {displaySkill.cd > 0 && (
                  <span className="skill-cooldown">COOLDOWN: {displaySkill.cd}</span>
                )}
              </div>
            </>
          ) : (
            <div className="no-skill-msg">
              Here is a very nice description of the selected skill...
            </div>
          )}
        </div>
        
        <div className="ready-btn-container">
          <button 
            className={`ready-btn ${queue.length > 0 ? 'active' : ''}`}
            onClick={executeTurn}
          >
            {queue.length > 0 ? 'READY' : 'PASS'}
          </button>
        </div>
      </div>

      {/* Popups */}
      {popups.map(popup => (
        <div
          key={popup.id}
          className={`dmg-popup ${popup.type}`}
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.type === 'damage' ? '-' : '+'}{popup.value}
        </div>
      ))}
    </div>
  );
}
