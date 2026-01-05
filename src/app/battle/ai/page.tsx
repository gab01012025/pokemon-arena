'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './battle.css';

// ==================== TYPES ====================
interface Pokemon {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  desc: string;
  damage: number;
  heal: number;
  classes: string[];
  cd: number;
  currentCd: number;
  cost: { tai: number; blood: number; nin: number; gen: number; rand: number };
}

interface QueuedAction {
  oderId: string;
  skillId: string;
  targetId: string;
}

// ==================== CHARACTER DATA ====================
const CHARACTERS: Record<string, {
  name: string;
  hp: number;
  skills: Omit<Skill, 'currentCd'>[];
}> = {
  pikachu: {
    name: 'Pikachu',
    hp: 100,
    skills: [
      { id: 'skill1', name: 'Thunderbolt', desc: 'Pikachu releases a powerful electric shock that deals 35 DAMAGE to one enemy.', damage: 35, heal: 0, classes: ['Chakra', 'Ranged', 'Instant'], cd: 0, cost: { tai: 0, blood: 0, nin: 1, gen: 0, rand: 0 } },
      { id: 'skill2', name: 'Quick Attack', desc: 'Pikachu strikes with incredible speed, dealing 20 DAMAGE. This skill is ALWAYS FIRST.', damage: 20, heal: 0, classes: ['Physical', 'Melee', 'Instant'], cd: 0, cost: { tai: 1, blood: 0, nin: 0, gen: 0, rand: 0 } },
      { id: 'skill3', name: 'Thunder Wave', desc: 'Pikachu paralyzes the target for 1 turn, STUNNING them.', damage: 0, heal: 0, classes: ['Chakra', 'Ranged', 'Affliction'], cd: 2, cost: { tai: 0, blood: 0, nin: 1, gen: 0, rand: 0 } },
      { id: 'skill4', name: 'Volt Tackle', desc: 'Pikachu charges with electricity dealing 50 DAMAGE but takes 15 recoil damage.', damage: 50, heal: 0, classes: ['Physical', 'Melee', 'Instant'], cd: 3, cost: { tai: 0, blood: 0, nin: 2, gen: 0, rand: 0 } },
    ]
  },
  charizard: {
    name: 'Charizard',
    hp: 100,
    skills: [
      { id: 'skill1', name: 'Flamethrower', desc: 'Charizard breathes intense flames dealing 40 DAMAGE to one enemy.', damage: 40, heal: 0, classes: ['Chakra', 'Ranged', 'Instant'], cd: 0, cost: { tai: 0, blood: 1, nin: 0, gen: 0, rand: 0 } },
      { id: 'skill2', name: 'Dragon Claw', desc: 'Charizard slashes with sharp claws dealing 30 DAMAGE.', damage: 30, heal: 0, classes: ['Physical', 'Melee', 'Instant'], cd: 0, cost: { tai: 1, blood: 0, nin: 0, gen: 0, rand: 0 } },
      { id: 'skill3', name: 'Fire Spin', desc: 'Charizard traps the enemy in fire, dealing 15 DAMAGE for 3 turns.', damage: 15, heal: 0, classes: ['Chakra', 'Ranged', 'Affliction'], cd: 3, cost: { tai: 0, blood: 1, nin: 0, gen: 0, rand: 1 } },
      { id: 'skill4', name: 'Blast Burn', desc: 'Charizard unleashes ultimate flames dealing 65 DAMAGE to all enemies.', damage: 65, heal: 0, classes: ['Chakra', 'Ranged', 'Instant', 'AOE'], cd: 4, cost: { tai: 0, blood: 2, nin: 0, gen: 0, rand: 0 } },
    ]
  },
  blastoise: {
    name: 'Blastoise',
    hp: 100,
    skills: [
      { id: 'skill1', name: 'Hydro Pump', desc: 'Blastoise blasts high-pressure water dealing 45 DAMAGE.', damage: 45, heal: 0, classes: ['Chakra', 'Ranged', 'Instant'], cd: 1, cost: { tai: 0, blood: 0, nin: 2, gen: 0, rand: 0 } },
      { id: 'skill2', name: 'Water Gun', desc: 'A basic water attack dealing 25 DAMAGE.', damage: 25, heal: 0, classes: ['Chakra', 'Ranged', 'Instant'], cd: 0, cost: { tai: 0, blood: 0, nin: 1, gen: 0, rand: 0 } },
      { id: 'skill3', name: 'Withdraw', desc: 'Blastoise retreats into shell, gaining 25 DESTRUCTIBLE DEFENSE for 2 turns.', damage: 0, heal: 0, classes: ['Chakra', 'Instant', 'Defense'], cd: 3, cost: { tai: 0, blood: 0, nin: 0, gen: 1, rand: 0 } },
      { id: 'skill4', name: 'Hydro Cannon', desc: 'Ultimate water blast dealing 60 DAMAGE. Blastoise cannot act next turn.', damage: 60, heal: 0, classes: ['Chakra', 'Ranged', 'Instant'], cd: 4, cost: { tai: 0, blood: 0, nin: 2, gen: 0, rand: 1 } },
    ]
  },
  venusaur: {
    name: 'Venusaur',
    hp: 100,
    skills: [
      { id: 'skill1', name: 'Solar Beam', desc: 'Venusaur fires a powerful beam dealing 55 DAMAGE.', damage: 55, heal: 0, classes: ['Chakra', 'Ranged', 'Instant'], cd: 2, cost: { tai: 0, blood: 0, nin: 2, gen: 0, rand: 0 } },
      { id: 'skill2', name: 'Vine Whip', desc: 'Strikes with vines dealing 25 DAMAGE.', damage: 25, heal: 0, classes: ['Physical', 'Melee', 'Instant'], cd: 0, cost: { tai: 1, blood: 0, nin: 0, gen: 0, rand: 0 } },
      { id: 'skill3', name: 'Leech Seed', desc: 'Plants a seed that DRAINS 10 HP per turn for 3 turns.', damage: 10, heal: 10, classes: ['Chakra', 'Ranged', 'Affliction'], cd: 3, cost: { tai: 0, blood: 0, nin: 1, gen: 0, rand: 0 } },
      { id: 'skill4', name: 'Synthesis', desc: 'Venusaur heals 35 HP by absorbing sunlight.', damage: 0, heal: 35, classes: ['Chakra', 'Instant'], cd: 3, cost: { tai: 0, blood: 0, nin: 1, gen: 0, rand: 0 } },
    ]
  },
  gengar: {
    name: 'Gengar',
    hp: 100,
    skills: [
      { id: 'skill1', name: 'Shadow Ball', desc: 'Gengar hurls a shadowy blob dealing 40 DAMAGE.', damage: 40, heal: 0, classes: ['Chakra', 'Ranged', 'Instant'], cd: 0, cost: { tai: 0, blood: 0, nin: 0, gen: 2, rand: 0 } },
      { id: 'skill2', name: 'Hypnosis', desc: 'Gengar puts the enemy to SLEEP for 2 turns.', damage: 0, heal: 0, classes: ['Mental', 'Ranged', 'Affliction'], cd: 3, cost: { tai: 0, blood: 0, nin: 0, gen: 1, rand: 0 } },
      { id: 'skill3', name: 'Dream Eater', desc: 'Eats the dreams of a sleeping enemy, dealing 50 DAMAGE and healing 25 HP.', damage: 50, heal: 25, classes: ['Mental', 'Ranged', 'Instant'], cd: 2, cost: { tai: 0, blood: 0, nin: 0, gen: 2, rand: 0 } },
      { id: 'skill4', name: 'Curse', desc: 'Gengar curses the target, both lose 25% HP per turn for 4 turns.', damage: 0, heal: 0, classes: ['Affliction', 'Unique'], cd: 4, cost: { tai: 0, blood: 1, nin: 0, gen: 0, rand: 0 } },
    ]
  },
  mewtwo: {
    name: 'Mewtwo',
    hp: 100,
    skills: [
      { id: 'skill1', name: 'Psychic', desc: 'Mewtwo attacks with psychic power dealing 45 DAMAGE.', damage: 45, heal: 0, classes: ['Mental', 'Ranged', 'Instant'], cd: 0, cost: { tai: 0, blood: 0, nin: 0, gen: 2, rand: 0 } },
      { id: 'skill2', name: 'Barrier', desc: 'Mewtwo creates a barrier, becoming INVULNERABLE for 1 turn.', damage: 0, heal: 0, classes: ['Mental', 'Instant', 'Invulnerable'], cd: 4, cost: { tai: 0, blood: 0, nin: 0, gen: 1, rand: 0 } },
      { id: 'skill3', name: 'Psystrike', desc: 'A devastating psychic blow dealing 55 DAMAGE that ignores defense.', damage: 55, heal: 0, classes: ['Mental', 'Ranged', 'Instant', 'Piercing'], cd: 2, cost: { tai: 0, blood: 0, nin: 0, gen: 2, rand: 1 } },
      { id: 'skill4', name: 'Recover', desc: 'Mewtwo restores 40 HP.', damage: 0, heal: 40, classes: ['Mental', 'Instant'], cd: 3, cost: { tai: 0, blood: 0, nin: 0, gen: 1, rand: 0 } },
    ]
  }
};

const ALL_CHARS = Object.keys(CHARACTERS);

function getPokeNum(id: string): number {
  const nums: Record<string, number> = {
    pikachu: 25, charizard: 6, blastoise: 9, venusaur: 3, gengar: 94, mewtwo: 150
  };
  return nums[id] || 25;
}

function getCharImage(charId: string): string {
  const num = getPokeNum(charId);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${num}.png`;
}

function getSkillImage(charId: string, skillNum: number): string {
  const num = getPokeNum(charId);
  if (skillNum === 1) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`;
  if (skillNum === 2) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${num}.png`;
  if (skillNum === 3) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${num}.png`;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${num}.png`;
}

function createChar(charId: string, owner: string): Pokemon {
  const data = CHARACTERS[charId] || CHARACTERS.pikachu;
  return {
    id: `${owner}-${charId}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name,
    hp: data.hp,
    maxHp: data.hp,
    skills: data.skills.map(s => ({ ...s, currentCd: 0 }))
  };
}

// ==================== MAIN COMPONENT ====================
export default function BattlePage() {
  return (
    <Suspense fallback={<div className="na-loading">Loading Battle...</div>}>
      <BattleGame />
    </Suspense>
  );
}

function BattleGame() {
  const router = useRouter();
  const params = useSearchParams();
  const teamParam = params.get('team');

  const [loading, setLoading] = useState(true);
  const [turn, setTurn] = useState(1);
  const [timer, setTimer] = useState(30);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [redTeam, setRedTeam] = useState<Pokemon[]>([]);
  const [blueTeam, setBlueTeam] = useState<Pokemon[]>([]);
  const [chakra, setChakra] = useState({ tai: 0, blood: 1, nin: 0, gen: 0, rand: 1 });
  const [selectedSkill, setSelectedSkill] = useState<{char: Pokemon, skill: Skill, charId: string, charIdx: number} | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{char: Pokemon, skill: Skill, charId: string} | null>(null);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null);
  const [targetMode, setTargetMode] = useState(false);
  const [centerChar, setCenterChar] = useState<{charId: string, team: 'red' | 'blue'} | null>(null);
  const [hoveredChar, setHoveredChar] = useState<{name: string, rank: string, clan: string, level: number, ladderRank: number, ratio: string} | null>(null);

  const [redCharIds, setRedCharIds] = useState<string[]>([]);
  const [blueCharIds, setBlueCharIds] = useState<string[]>([]);

  // Initialize teams
  useEffect(() => {
    const team = teamParam?.split(',').slice(0, 3) || ['pikachu', 'charizard', 'blastoise'];
    while (team.length < 3) {
      const r = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
      if (!team.includes(r)) team.push(r);
    }
    
    setRedCharIds(team);
    setRedTeam(team.map(id => createChar(id, 'red')));
    
    const enemyIds: string[] = [];
    while (enemyIds.length < 3) {
      const r = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
      if (!enemyIds.includes(r)) enemyIds.push(r);
    }
    setBlueCharIds(enemyIds);
    setBlueTeam(enemyIds.map(id => createChar(id, 'blue')));
    
    setTimeout(() => setLoading(false), 500);
  }, [teamParam]);

  // Timer countdown
  useEffect(() => {
    if (loading || gameOver) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 0) {
          onPassTurn();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, gameOver, isPlayerTurn]);

  // Win/lose check
  useEffect(() => {
    if (redTeam.length === 0 || blueTeam.length === 0) return;
    if (redTeam.every(p => p.hp <= 0)) setGameOver('lose');
    else if (blueTeam.every(p => p.hp <= 0)) setGameOver('win');
  }, [redTeam, blueTeam]);

  const canAfford = (skill: Skill) => {
    const totalChakra = chakra.tai + chakra.blood + chakra.nin + chakra.gen + chakra.rand;
    const needed = skill.cost.tai + skill.cost.blood + skill.cost.nin + skill.cost.gen + skill.cost.rand;
    
    if (skill.cost.tai > chakra.tai + chakra.rand) return false;
    if (skill.cost.blood > chakra.blood + chakra.rand) return false;
    if (skill.cost.nin > chakra.nin + chakra.rand) return false;
    if (skill.cost.gen > chakra.gen + chakra.rand) return false;
    
    return totalChakra >= needed;
  };

  const onSkillClick = (char: Pokemon, skill: Skill, charId: string, charIdx: number) => {
    if (skill.currentCd > 0 || char.hp <= 0 || !canAfford(skill)) return;

    setSelectedSkill({ char, skill, charId, charIdx });
    setHoveredSkill({ char, skill, charId });
    setCenterChar({ charId, team: 'red' });
    setTargetMode(true);
  };

  const onTargetClick = (target: Pokemon, targetCharId: string, team: 'red' | 'blue') => {
    if (!targetMode || !selectedSkill) return;
    
    // Show center character when clicking
    setCenterChar({ charId: targetCharId, team });
    
    // Add to queue
    addToQueue(selectedSkill.char, selectedSkill.skill, target);
  };

  const addToQueue = (user: Pokemon, skill: Skill, target: Pokemon) => {
    // Deduct chakra
    let newChakra = { ...chakra };
    newChakra.tai -= skill.cost.tai;
    newChakra.blood -= skill.cost.blood;
    newChakra.nin -= skill.cost.nin;
    newChakra.gen -= skill.cost.gen;
    // Use rand chakra for any deficit
    const deficit = -Math.min(0, newChakra.tai) - Math.min(0, newChakra.blood) - Math.min(0, newChakra.nin) - Math.min(0, newChakra.gen);
    newChakra.rand -= skill.cost.rand + deficit;
    newChakra.tai = Math.max(0, newChakra.tai);
    newChakra.blood = Math.max(0, newChakra.blood);
    newChakra.nin = Math.max(0, newChakra.nin);
    newChakra.gen = Math.max(0, newChakra.gen);
    
    setChakra(newChakra);

    setQueue(prev => [...prev, {
      oderId: user.id,
      skillId: skill.id,
      targetId: target.id
    }]);

    setSelectedSkill(null);
    setTargetMode(false);
  };

  const onPassTurn = () => {
    // Execute player actions
    queue.forEach(action => {
      const user = [...redTeam, ...blueTeam].find(c => c.id === action.oderId);
      const skill = user?.skills.find(s => s.id === action.skillId);
      const target = [...redTeam, ...blueTeam].find(c => c.id === action.targetId);

      if (user && skill && target) {
        if (skill.damage > 0) {
          target.hp = Math.max(0, target.hp - skill.damage);
        }
        if (skill.heal > 0) {
          const healTarget = skill.classes.includes('Affliction') ? user : target;
          healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + skill.heal);
        }
        skill.currentCd = skill.cd;
      }
    });

    // AI turn
    blueTeam.filter(e => e.hp > 0).forEach(enemy => {
      const availableSkills = enemy.skills.filter(s => s.currentCd === 0);
      if (availableSkills.length > 0) {
        const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        const aliveRed = redTeam.filter(r => r.hp > 0);
        if (aliveRed.length > 0) {
          const target = aliveRed[Math.floor(Math.random() * aliveRed.length)];
          if (skill.damage > 0) {
            target.hp = Math.max(0, target.hp - skill.damage);
          }
          skill.currentCd = skill.cd;
        }
      }
    });

    // Reduce cooldowns
    [...redTeam, ...blueTeam].forEach(char => {
      char.skills.forEach(skill => {
        if (skill.currentCd > 0) skill.currentCd--;
      });
    });

    // Add random chakra
    const types = ['tai', 'blood', 'nin', 'gen'] as const;
    const newType = types[Math.floor(Math.random() * types.length)];
    setChakra(prev => ({
      ...prev,
      [newType]: Math.min(9, prev[newType] + 1)
    }));

    setQueue([]);
    setTurn(t => t + 1);
    setTimer(30);
    setRedTeam([...redTeam]);
    setBlueTeam([...blueTeam]);
    setIsPlayerTurn(true);
  };

  const onRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedSkill(null);
    setTargetMode(false);
  };

  const onSurrender = () => {
    setGameOver('lose');
  };

  const displaySkill = hoveredSkill || selectedSkill;

  if (loading) return <div className="na-loading">⚔️ Loading Battle... ⚔️</div>;

  // Calculate total chakra cost for display
  const getTotalCost = (skill: Skill) => {
    return skill.cost.tai + skill.cost.blood + skill.cost.nin + skill.cost.gen + skill.cost.rand;
  };

  return (
    <div className="na-battle" onContextMenu={onRightClick}>
      {/* Background - forest */}
      <div className="na-bg" />

      {/* Top bar */}
      <div className="na-topbar">
        {/* Player info left */}
        <div className="na-player-info left">
          <img src="/images/ui/avatar-default.png" alt="" className="na-avatar" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50'; }} />
          <div className="na-player-details">
            <div className="na-player-name">TRAINER</div>
            <div className="na-player-rank">POKEMON MASTER</div>
          </div>
        </div>

        {/* Center - turn info */}
        <div className="na-turn-info">
          <div className="na-turn-text">{isPlayerTurn ? 'PRESS WHEN READY' : 'OPPONENT TURN...'}</div>
          <div className="na-timer-bar">
            <div className="na-timer-fill" style={{ width: `${(timer / 30) * 100}%` }} />
          </div>
          {/* Chakra display */}
          <div className="na-chakra-display">
            <div className="na-chakra-item">
              <span className="na-chakra-box tai" />
              <span className="na-chakra-count">x{chakra.tai}</span>
            </div>
            <div className="na-chakra-item">
              <span className="na-chakra-box blood" />
              <span className="na-chakra-count">x{chakra.blood}</span>
            </div>
            <div className="na-chakra-item">
              <span className="na-chakra-box nin" />
              <span className="na-chakra-count">x{chakra.nin}</span>
            </div>
            <div className="na-chakra-item">
              <span className="na-chakra-box gen" />
              <span className="na-chakra-count">x{chakra.gen}</span>
            </div>
            <div className="na-chakra-item">
              <span className="na-chakra-box rand" />
              <span className="na-chakra-count">x{chakra.rand}</span>
            </div>
            <button className="na-exchange-btn">EXCHANGE CHAKRA</button>
          </div>
        </div>

        {/* Enemy info right */}
        <div className="na-player-info right">
          <div className="na-player-details">
            <div className="na-player-name">AI TRAINER</div>
            <div className="na-player-rank">NORMAL</div>
          </div>
          <img src="/images/ui/avatar-default.png" alt="" className="na-avatar" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50'; }} />
        </div>
      </div>

      {/* Main battle area */}
      <div className="na-main">
        {/* Left team (Player - Red) */}
        <div className="na-team left">
          {redTeam.map((char, idx) => {
            const charId = redCharIds[idx];
            const isTargetable = targetMode && selectedSkill?.skill.heal && selectedSkill.skill.heal > 0 && char.hp > 0;
            const isDead = char.hp <= 0;

            return (
              <div 
                key={char.id} 
                className={`na-char-row ${isDead ? 'dead' : ''} ${isTargetable ? 'targetable' : ''}`}
                onClick={() => isTargetable && onTargetClick(char, charId, 'red')}
              >
                {/* Portrait */}
                <div className="na-portrait-wrap">
                  <img 
                    src={getCharImage(charId)} 
                    alt={char.name}
                    className="na-portrait"
                    onMouseEnter={() => setCenterChar({ charId, team: 'red' })}
                  />
                  <div className="na-hp-bar">
                    <div 
                      className="na-hp-fill" 
                      style={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                    />
                    <span className="na-hp-text">{char.hp}/{char.maxHp}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="na-skills">
                  {char.skills.map((skill, sIdx) => {
                    const isSelected = selectedSkill?.skill.id === skill.id && selectedSkill?.char.id === char.id;
                    const isQueued = queue.some(q => q.oderId === char.id && q.skillId === skill.id);
                    const canUse = skill.currentCd === 0 && char.hp > 0 && canAfford(skill);
                    const onCooldown = skill.currentCd > 0;

                    return (
                      <div 
                        key={skill.id}
                        className={`na-skill ${isSelected ? 'selected' : ''} ${isQueued ? 'queued' : ''} ${!canUse ? 'disabled' : ''} ${onCooldown ? 'cooldown' : ''}`}
                        onClick={(e) => { e.stopPropagation(); canUse && onSkillClick(char, skill, charId, idx); }}
                        onMouseEnter={() => setHoveredSkill({ char, skill, charId })}
                        onMouseLeave={() => !selectedSkill && setHoveredSkill(null)}
                      >
                        <img src={getSkillImage(charId, sIdx + 1)} alt={skill.name} />
                        {onCooldown && <div className="na-cd-overlay">{skill.currentCd}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center character display */}
        <div className="na-center">
          {centerChar && (
            <img 
              src={getCharImage(centerChar.charId)} 
              alt=""
              className="na-center-char"
            />
          )}
        </div>

        {/* Right team (Enemy - Blue) */}
        <div className="na-team right">
          {blueTeam.map((char, idx) => {
            const charId = blueCharIds[idx];
            const isTargetable = targetMode && selectedSkill && (!selectedSkill.skill.heal || selectedSkill.skill.damage > 0) && char.hp > 0;
            const isDead = char.hp <= 0;

            return (
              <div 
                key={char.id} 
                className={`na-char-row right ${isDead ? 'dead' : ''} ${isTargetable ? 'targetable' : ''}`}
                onClick={() => isTargetable && onTargetClick(char, charId, 'blue')}
                onMouseEnter={() => setHoveredChar({
                  name: 'AI TRAINER',
                  rank: 'CHUUNIN',
                  clan: 'CLANLESS',
                  level: 11,
                  ladderRank: 12049,
                  ratio: '13 - 27 (-1)'
                })}
                onMouseLeave={() => setHoveredChar(null)}
              >
                {/* Skills */}
                <div className="na-skills right">
                  {char.skills.map((skill, sIdx) => {
                    const onCooldown = skill.currentCd > 0;
                    return (
                      <div 
                        key={skill.id}
                        className={`na-skill enemy ${onCooldown ? 'cooldown' : ''}`}
                      >
                        <img src={getSkillImage(charId, sIdx + 1)} alt={skill.name} />
                        {onCooldown && <div className="na-cd-overlay">{skill.currentCd}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Portrait */}
                <div className="na-portrait-wrap">
                  <img 
                    src={getCharImage(charId)} 
                    alt={char.name}
                    className="na-portrait right"
                    onMouseEnter={() => setCenterChar({ charId, team: 'blue' })}
                  />
                  <div className="na-hp-bar">
                    <div 
                      className="na-hp-fill" 
                      style={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                    />
                    <span className="na-hp-text">{char.hp}/{char.maxHp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom panel */}
      <div className="na-bottom">
        {/* Left side - surrender & chat */}
        <div className="na-bottom-left">
          <button className="na-surrender-btn" onClick={onSurrender}>SURRENDER</button>
          <button className="na-chat-btn">OPEN CHAT <span className="na-new">(NEW: 2)</span></button>
          <div className="na-volume">
            <span>🔊</span>
            <input type="range" min="0" max="100" defaultValue="50" />
          </div>
        </div>

        {/* Naruto decoration */}
        <div className="na-naruto-deco">
          <img src="/images/battle/sasuke.png" alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>

        {/* Skill panel */}
        <div className="na-skill-panel">
          {displaySkill ? (
            <>
              <div className="na-skill-header">
                <span className="na-skill-name">{displaySkill.skill.name.toUpperCase()}</span>
                <div className="na-skill-energy">
                  <span>ENERGY:</span>
                  {displaySkill.skill.cost.tai > 0 && <span className="na-chakra-box tai" />}
                  {displaySkill.skill.cost.blood > 0 && <span className="na-chakra-box blood" />}
                  {displaySkill.skill.cost.nin > 0 && <span className="na-chakra-box nin" />}
                  {displaySkill.skill.cost.gen > 0 && <span className="na-chakra-box gen" />}
                  {displaySkill.skill.cost.rand > 0 && <span className="na-chakra-box rand" />}
                  {getTotalCost(displaySkill.skill) === 0 && <span>NONE</span>}
                </div>
              </div>
              <div className="na-skill-desc">
                {displaySkill.skill.desc}
              </div>
              <div className="na-skill-footer">
                <span className="na-skill-classes">CLASSES: {displaySkill.skill.classes.join(', ').toUpperCase()}</span>
                <span className="na-skill-cd">COOLDOWN: {displaySkill.skill.cd}</span>
              </div>
            </>
          ) : (
            <div className="na-skill-empty">Here is a very nice description of the selected skill...</div>
          )}
        </div>

        {/* Pass button */}
        <button className="na-pass-btn" onClick={onPassTurn}>PASS</button>
      </div>

      {/* Hovered enemy info popup */}
      {hoveredChar && (
        <div className="na-char-popup">
          <div className="na-popup-name">{hoveredChar.name}</div>
          <div className="na-popup-rank">{hoveredChar.rank}</div>
          <div className="na-popup-info">CLAN: {hoveredChar.clan}</div>
          <div className="na-popup-info">LEVEL: {hoveredChar.level}</div>
          <div className="na-popup-info">LADDERRANK: {hoveredChar.ladderRank}</div>
          <div className="na-popup-info">RATIO: {hoveredChar.ratio}</div>
        </div>
      )}

      {/* Game Over overlay */}
      {gameOver && (
        <div className="na-gameover">
          <h1 className={gameOver === 'win' ? 'win' : 'lose'}>
            {gameOver === 'win' ? 'VICTORY!' : 'DEFEAT'}
          </h1>
          <button onClick={() => router.push('/play')}>Return to Menu</button>
        </div>
      )}

      {/* Target mode indicator */}
      {targetMode && (
        <div className="na-target-hint">
          Click on an enemy to attack! (Right-click to cancel)
        </div>
      )}
    </div>
  );
}
