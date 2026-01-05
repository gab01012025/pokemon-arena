'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  defense: number;
  isSelf: boolean;
  isArea: boolean;
  cd: number;
  currentCd: number;
  cost: { tai: number; blood: number; nin: number; gen: number };
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
      { id: 'skill1', name: 'Thunderbolt', desc: 'A powerful electric attack that strikes the opponent with lightning.', damage: 35, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 0, blood: 0, nin: 1, gen: 0 } },
      { id: 'skill2', name: 'Quick Attack', desc: 'A fast strike that hits before the enemy can react.', damage: 20, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 1, blood: 0, nin: 0, gen: 0 } },
      { id: 'skill3', name: 'Thunder Wave', desc: 'Paralyzes the target, reducing their speed.', damage: 0, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 2, cost: { tai: 0, blood: 0, nin: 1, gen: 0 } },
    ]
  },
  charizard: {
    name: 'Charizard',
    hp: 120,
    skills: [
      { id: 'skill1', name: 'Flamethrower', desc: 'Breathes intense flames that burn the opponent.', damage: 40, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 0, blood: 1, nin: 0, gen: 0 } },
      { id: 'skill2', name: 'Dragon Claw', desc: 'Slashes the enemy with sharp claws.', damage: 30, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 1, blood: 0, nin: 0, gen: 0 } },
      { id: 'skill3', name: 'Fire Blast', desc: 'A devastating fire attack that hits all enemies.', damage: 25, heal: 0, defense: 0, isSelf: false, isArea: true, cd: 3, cost: { tai: 0, blood: 2, nin: 0, gen: 0 } },
    ]
  },
  blastoise: {
    name: 'Blastoise',
    hp: 130,
    skills: [
      { id: 'skill1', name: 'Hydro Pump', desc: 'Blasts the enemy with high-pressure water.', damage: 45, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 1, cost: { tai: 0, blood: 0, nin: 2, gen: 0 } },
      { id: 'skill2', name: 'Water Gun', desc: 'A basic water attack.', damage: 25, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 0, blood: 0, nin: 1, gen: 0 } },
      { id: 'skill3', name: 'Protect', desc: 'Becomes invulnerable for one turn.', damage: 0, heal: 0, defense: 100, isSelf: true, isArea: false, cd: 4, cost: { tai: 0, blood: 0, nin: 0, gen: 1 } },
    ]
  },
  venusaur: {
    name: 'Venusaur',
    hp: 125,
    skills: [
      { id: 'skill1', name: 'Solar Beam', desc: 'Fires a powerful beam of solar energy.', damage: 55, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 2, cost: { tai: 0, blood: 0, nin: 2, gen: 0 } },
      { id: 'skill2', name: 'Vine Whip', desc: 'Strikes with sharp vines.', damage: 25, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 1, blood: 0, nin: 0, gen: 0 } },
      { id: 'skill3', name: 'Synthesis', desc: 'Restores HP by absorbing sunlight.', damage: 0, heal: 35, defense: 0, isSelf: true, isArea: false, cd: 3, cost: { tai: 0, blood: 0, nin: 1, gen: 0 } },
    ]
  },
  gengar: {
    name: 'Gengar',
    hp: 90,
    skills: [
      { id: 'skill1', name: 'Shadow Ball', desc: 'Hurls a shadowy blob at the enemy.', damage: 40, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 0, blood: 0, nin: 0, gen: 2 } },
      { id: 'skill2', name: 'Hypnosis', desc: 'Puts the enemy to sleep.', damage: 0, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 3, cost: { tai: 0, blood: 0, nin: 0, gen: 1 } },
      { id: 'skill3', name: 'Dream Eater', desc: 'Eats the dreams of a sleeping enemy.', damage: 50, heal: 25, defense: 0, isSelf: false, isArea: false, cd: 2, cost: { tai: 0, blood: 0, nin: 0, gen: 2 } },
    ]
  },
  mewtwo: {
    name: 'Mewtwo',
    hp: 110,
    skills: [
      { id: 'skill1', name: 'Psychic', desc: 'A powerful psychic attack.', damage: 45, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 0, cost: { tai: 0, blood: 0, nin: 0, gen: 2 } },
      { id: 'skill2', name: 'Barrier', desc: 'Creates a defensive barrier.', damage: 0, heal: 0, defense: 50, isSelf: true, isArea: false, cd: 3, cost: { tai: 0, blood: 0, nin: 0, gen: 1 } },
      { id: 'skill3', name: 'Psystrike', desc: 'The ultimate psychic attack.', damage: 65, heal: 0, defense: 0, isSelf: false, isArea: false, cd: 3, cost: { tai: 0, blood: 0, nin: 0, gen: 3 } },
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
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${num}.png`;
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
    <Suspense fallback={<LoadingScreen />}>
      <BattleGame />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a1a',
      color: '#fff',
      fontSize: '24px'
    }}>
      Loading Battle...
    </div>
  );
}

function BattleGame() {
  const router = useRouter();
  const params = useSearchParams();
  const teamParam = params.get('team');

  // State
  const [loading, setLoading] = useState(true);
  const [turn, setTurn] = useState(1);
  const [timer, setTimer] = useState(30);
  const [redTeam, setRedTeam] = useState<Pokemon[]>([]);
  const [blueTeam, setBlueTeam] = useState<Pokemon[]>([]);
  const [chakra, setChakra] = useState({ tai: 1, blood: 1, nin: 1, gen: 1 });
  const [selectedSkill, setSelectedSkill] = useState<{char: Pokemon, skill: Skill, charId: string} | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{char: Pokemon, skill: Skill, charId: string} | null>(null);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null);
  const [volume, setVolume] = useState(50);
  const [targetMode, setTargetMode] = useState(false);

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
      setTimer(t => t > 0 ? t - 1 : 30);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, gameOver]);

  // Win/lose check
  useEffect(() => {
    if (redTeam.length === 0 || blueTeam.length === 0) return;
    if (redTeam.every(p => p.hp <= 0)) setGameOver('lose');
    else if (blueTeam.every(p => p.hp <= 0)) setGameOver('win');
  }, [redTeam, blueTeam]);

  // Skill click handler
  const onSkillClick = (char: Pokemon, skill: Skill, charId: string) => {
    if (skill.currentCd > 0 || char.hp <= 0) return;
    if (skill.cost.tai > chakra.tai || skill.cost.blood > chakra.blood || 
        skill.cost.nin > chakra.nin || skill.cost.gen > chakra.gen) return;

    setSelectedSkill({ char, skill, charId });
    setHoveredSkill({ char, skill, charId });

    if (skill.isSelf) {
      addToQueue(char, skill, char);
    } else {
      setTargetMode(true);
    }
  };

  // Target click handler
  const onTargetClick = (target: Pokemon) => {
    if (!targetMode || !selectedSkill) return;
    addToQueue(selectedSkill.char, selectedSkill.skill, target);
  };

  // Add action to queue
  const addToQueue = (user: Pokemon, skill: Skill, target: Pokemon) => {
    setChakra(prev => ({
      tai: prev.tai - skill.cost.tai,
      blood: prev.blood - skill.cost.blood,
      nin: prev.nin - skill.cost.nin,
      gen: prev.gen - skill.cost.gen,
    }));

    setQueue(prev => [...prev, {
      oderId: user.id,
      skillId: skill.id,
      targetId: target.id
    }]);

    setSelectedSkill(null);
    setTargetMode(false);
  };

  // Pass turn / Execute actions
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
          target.hp = Math.min(target.maxHp, target.hp + skill.heal);
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
          const target = skill.isSelf ? enemy : aliveRed[Math.floor(Math.random() * aliveRed.length)];
          if (skill.damage > 0) {
            target.hp = Math.max(0, target.hp - skill.damage);
          }
          if (skill.heal > 0) {
            target.hp = Math.min(target.maxHp, target.hp + skill.heal);
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

    // Add chakra
    setChakra(prev => ({
      tai: Math.min(9, prev.tai + 1),
      blood: Math.min(9, prev.blood + 1),
      nin: Math.min(9, prev.nin + 1),
      gen: Math.min(9, prev.gen + 1),
    }));

    setQueue([]);
    setTurn(t => t + 1);
    setTimer(30);
    setRedTeam([...redTeam]);
    setBlueTeam([...blueTeam]);
  };

  // Cancel skill selection
  const onRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedSkill(null);
    setTargetMode(false);
  };

  // Surrender
  const onSurrender = () => {
    setGameOver('lose');
  };

  const displaySkill = hoveredSkill || selectedSkill;

  if (loading) return <LoadingScreen />;

  const getHpColor = (hp: number, max: number) => {
    const pct = hp / max;
    if (pct > 0.5) return '#22B822';
    if (pct > 0.25) return '#FFD700';
    return '#CF1515';
  };

  return (
    <div 
      style={{
        width: '923px',
        height: '657px',
        margin: '0 auto',
        position: 'relative',
        fontFamily: 'Verdana, sans-serif',
        overflow: 'hidden',
        cursor: 'default',
      }}
      onContextMenu={onRightClick}
    >
      {/* Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/images/battle/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* ========== RED TEAM (LEFT SIDE) ========== */}
      {redTeam.map((char, idx) => {
        const charId = redCharIds[idx];
        const topMargin = 51 + (idx * 141);
        const isTargetable = targetMode && selectedSkill && !selectedSkill.skill.isSelf && char.hp > 0;

        return (
          <div key={char.id}>
            {/* Scroll Background */}
            <img
              src="/images/battle/ScrollExtended2.png"
              alt=""
              style={{
                position: 'absolute',
                left: '28px',
                top: `${topMargin}px`,
                width: '348px',
                height: '107px',
              }}
            />

            {/* Character Portrait */}
            <img
              src={getCharImage(charId)}
              alt={char.name}
              onClick={() => isTargetable && onTargetClick(char)}
              style={{
                position: 'absolute',
                left: '10px',
                top: `${topMargin}px`,
                width: '107px',
                height: '107px',
                objectFit: 'contain',
                background: '#1a1a1a',
                cursor: isTargetable ? 'pointer' : 'default',
                filter: char.hp <= 0 ? 'grayscale(100%)' : 'none',
                opacity: char.hp <= 0 ? 0.5 : 1,
                border: isTargetable ? '3px solid #22B822' : 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* HP Bar */}
            <div
              style={{
                position: 'absolute',
                left: '10px',
                top: `${topMargin + 112}px`,
                width: '107px',
                height: '24px',
                background: getHpColor(char.hp, char.maxHp),
                border: '1px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
            >
              {char.hp}
            </div>

            {/* Skills */}
            {char.skills.map((skill, sIdx) => {
              const skillLeft = 122 + (sIdx * 82);
              const skillTop = topMargin + 15;
              const isSelected = selectedSkill?.skill.id === skill.id && selectedSkill?.char.id === char.id;
              const isInQueue = queue.some(q => q.oderId === char.id && q.skillId === skill.id);
              const canUse = skill.currentCd === 0 && char.hp > 0 &&
                skill.cost.tai <= chakra.tai && skill.cost.blood <= chakra.blood &&
                skill.cost.nin <= chakra.nin && skill.cost.gen <= chakra.gen;

              return (
                <img
                  key={skill.id}
                  src={getSkillImage(charId, sIdx + 1)}
                  alt={skill.name}
                  onClick={() => canUse && onSkillClick(char, skill, charId)}
                  onMouseEnter={() => setHoveredSkill({ char, skill, charId })}
                  onMouseLeave={() => setHoveredSkill(null)}
                  style={{
                    position: 'absolute',
                    left: `${skillLeft}px`,
                    top: `${skillTop}px`,
                    width: '77px',
                    height: '77px',
                    objectFit: 'contain',
                    background: '#2a2a2a',
                    border: isSelected ? '3px solid #FFD700' : isInQueue ? '3px solid #22B822' : '2px solid #555',
                    cursor: canUse ? 'pointer' : 'not-allowed',
                    opacity: canUse ? 1 : 0.5,
                    boxSizing: 'border-box',
                  }}
                />
              );
            })}

            {/* Cooldown overlay */}
            {char.skills.map((skill, sIdx) => skill.currentCd > 0 && (
              <div
                key={`cd-${skill.id}`}
                style={{
                  position: 'absolute',
                  left: `${122 + (sIdx * 82)}px`,
                  top: `${topMargin + 15}px`,
                  width: '77px',
                  height: '77px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                }}
              >
                {skill.currentCd}
              </div>
            ))}
          </div>
        );
      })}

      {/* ========== BLUE TEAM (RIGHT SIDE) ========== */}
      {blueTeam.map((char, idx) => {
        const charId = blueCharIds[idx];
        const topMargin = 51 + (idx * 141);
        const isTargetable = targetMode && selectedSkill && !selectedSkill.skill.isSelf && char.hp > 0;

        return (
          <div key={char.id}>
            {/* Scroll Background - mirrored */}
            <img
              src="/images/battle/ScrollExtended2.png"
              alt=""
              style={{
                position: 'absolute',
                right: '28px',
                top: `${topMargin}px`,
                width: '348px',
                height: '107px',
                transform: 'scaleX(-1)',
              }}
            />

            {/* Character Portrait */}
            <img
              src={getCharImage(charId)}
              alt={char.name}
              onClick={() => isTargetable && onTargetClick(char)}
              style={{
                position: 'absolute',
                right: '10px',
                top: `${topMargin}px`,
                width: '107px',
                height: '107px',
                objectFit: 'contain',
                background: '#1a1a1a',
                cursor: isTargetable ? 'pointer' : 'default',
                filter: char.hp <= 0 ? 'grayscale(100%)' : 'none',
                opacity: char.hp <= 0 ? 0.5 : 1,
                border: isTargetable ? '3px solid #22B822' : 'none',
                boxSizing: 'border-box',
                transform: 'scaleX(-1)',
              }}
            />

            {/* HP Bar */}
            <div
              style={{
                position: 'absolute',
                right: '10px',
                top: `${topMargin + 112}px`,
                width: '107px',
                height: '24px',
                background: getHpColor(char.hp, char.maxHp),
                border: '1px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
            >
              {char.hp}
            </div>

            {/* Skills */}
            {char.skills.map((skill, sIdx) => {
              const skillRight = 122 + (sIdx * 82);
              const skillTop = topMargin + 15;

              return (
                <img
                  key={skill.id}
                  src={getSkillImage(charId, sIdx + 1)}
                  alt={skill.name}
                  style={{
                    position: 'absolute',
                    right: `${skillRight}px`,
                    top: `${skillTop}px`,
                    width: '77px',
                    height: '77px',
                    objectFit: 'contain',
                    background: '#2a2a2a',
                    border: '2px solid #555',
                    opacity: skill.currentCd > 0 || char.hp <= 0 ? 0.5 : 1,
                    boxSizing: 'border-box',
                    transform: 'scaleX(-1)',
                  }}
                />
              );
            })}

            {/* Cooldown overlay */}
            {char.skills.map((skill, sIdx) => skill.currentCd > 0 && (
              <div
                key={`cd-${skill.id}`}
                style={{
                  position: 'absolute',
                  right: `${122 + (sIdx * 82)}px`,
                  top: `${topMargin + 15}px`,
                  width: '77px',
                  height: '77px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                }}
              >
                {skill.currentCd}
              </div>
            ))}
          </div>
        );
      })}

      {/* ========== TOP BAR - CHAKRA & TIMER ========== */}
      {/* Timer Progress Bar */}
      <div style={{
        position: 'absolute',
        left: '410px',
        top: '10px',
        width: '364px',
        height: '19px',
        background: '#E2E1E0',
        border: '1px solid black',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${(timer / 30) * 100}%`,
          height: '100%',
          background: '#CF1515',
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Chakra Display */}
      <div style={{ position: 'absolute', left: '410px', top: '36px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ width: '14px', height: '14px', background: '#25B825', border: '1px solid black' }} />
        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Taijutsu</span>
        <span style={{ fontWeight: 'bold', width: '20px' }}>{chakra.tai}</span>

        <div style={{ width: '14px', height: '14px', background: '#CF1515', border: '1px solid black' }} />
        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Bloodline</span>
        <span style={{ fontWeight: 'bold', width: '20px' }}>{chakra.blood}</span>

        <div style={{ width: '14px', height: '14px', background: '#345AC1', border: '1px solid black' }} />
        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Ninjutsu</span>
        <span style={{ fontWeight: 'bold', width: '20px' }}>{chakra.nin}</span>

        <div style={{ width: '14px', height: '14px', background: '#FFFFFF', border: '1px solid black' }} />
        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Genjutsu</span>
        <span style={{ fontWeight: 'bold', width: '20px' }}>{chakra.gen}</span>
      </div>

      {/* Turn Counter */}
      <div style={{
        position: 'absolute',
        right: '240px',
        top: '4px',
        backgroundImage: 'url(/images/battle/ScrollExtended2.png)',
        backgroundSize: 'cover',
        padding: '8px 16px',
        fontWeight: 'bold',
        fontSize: '20px',
      }}>
        Turn: {turn}
      </div>

      {/* Pass Turn Button */}
      <div 
        onClick={onPassTurn}
        style={{
          position: 'absolute',
          right: '10px',
          top: '10px',
          width: '201px',
          height: '37px',
          backgroundImage: 'url(/images/battle/ScrollExtended2.png)',
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '20px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Pass Turn
      </div>

      {/* ========== BOTTOM PANEL ========== */}
      <img
        src="/images/battle/ScrollExtended.png"
        alt=""
        style={{
          position: 'absolute',
          left: '259px',
          top: '455px',
          width: '646px',
          height: '162px',
        }}
      />

      <img
        src="/images/battle/sasuke.png"
        alt=""
        style={{
          position: 'absolute',
          left: '165px',
          top: '451px',
          width: '171px',
          height: '175px',
          objectFit: 'contain',
        }}
      />

      {/* Volume Control */}
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '491px',
        width: '150px',
        height: '65px',
        backgroundImage: 'url(/images/battle/ScrollMedium.png)',
        backgroundSize: 'cover',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Volume</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            style={{ fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setVolume(v => Math.max(0, v - 10))}
          >-</span>
          <span style={{ fontWeight: 'bold', fontSize: '14px', width: '30px', textAlign: 'center' }}>{volume}</span>
          <span 
            style={{ fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setVolume(v => Math.min(100, v + 10))}
          >+</span>
        </div>
      </div>

      {/* Surrender Button */}
      <div 
        onClick={onSurrender}
        style={{
          position: 'absolute',
          left: '10px',
          top: '553px',
          width: '150px',
          height: '65px',
          backgroundImage: 'url(/images/battle/ScrollMedium.png)',
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Surrender
      </div>

      {/* Skill Panel */}
      {displaySkill && (
        <>
          <img
            src={getSkillImage(displaySkill.charId, displaySkill.char.skills.indexOf(displaySkill.skill) + 1)}
            alt=""
            style={{
              position: 'absolute',
              left: '304px',
              top: '493px',
              width: '77px',
              height: '77px',
              objectFit: 'contain',
            }}
          />

          <div style={{ position: 'absolute', left: '388px', top: '496px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <div style={{ width: '14px', height: '14px', background: '#25B825', border: '1px solid black' }} />
              <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{displaySkill.skill.cost.tai}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <div style={{ width: '14px', height: '14px', background: '#CF1515', border: '1px solid black' }} />
              <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{displaySkill.skill.cost.blood}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <div style={{ width: '14px', height: '14px', background: '#345AC1', border: '1px solid black' }} />
              <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{displaySkill.skill.cost.nin}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '14px', height: '14px', background: '#FFFFFF', border: '1px solid black' }} />
              <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{displaySkill.skill.cost.gen}</span>
            </div>
          </div>

          <div style={{
            position: 'absolute',
            left: '441px',
            top: '493px',
            width: '429px',
            height: '57px',
            background: '#C5A8A8',
            padding: '4px 8px',
            fontWeight: 'bold',
            fontSize: '12px',
            overflow: 'hidden',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{displaySkill.skill.name}</div>
            {displaySkill.skill.desc}
          </div>

          <div style={{
            position: 'absolute',
            left: '441px',
            top: '553px',
            display: 'flex',
            gap: '16px',
            fontSize: '11px',
            fontWeight: 'bold',
          }}>
            <span>Damage: {displaySkill.skill.damage}</span>
            <span>Heal: {displaySkill.skill.heal}</span>
            <span>Defense: {displaySkill.skill.defense}</span>
            <span>Self: {displaySkill.skill.isSelf ? 'Yes' : 'No'}</span>
            <span>Area: {displaySkill.skill.isArea ? 'Yes' : 'No'}</span>
          </div>
        </>
      )}

      {!displaySkill && (
        <div style={{
          position: 'absolute',
          left: '441px',
          top: '493px',
          width: '429px',
          height: '57px',
          background: '#C5A8A8',
          padding: '4px 8px',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
        }}>
          Hover over a skill to see its description...
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <h1 style={{
            fontSize: '64px',
            color: gameOver === 'win' ? '#22B822' : '#CF1515',
            textShadow: '2px 2px 4px black',
            marginBottom: '32px',
          }}>
            {gameOver === 'win' ? 'VICTORY!' : 'DEFEAT'}
          </h1>
          <button
            onClick={() => router.push('/play')}
            style={{
              padding: '16px 48px',
              fontSize: '20px',
              fontWeight: 'bold',
              background: '#345AC1',
              color: '#fff',
              border: '3px solid #1a3a8a',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Return to Menu
          </button>
        </div>
      )}

      {/* Target mode indicator */}
      {targetMode && (
        <div style={{
          position: 'absolute',
          top: '240px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#22B822',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
        }}>
          Click on a target to attack! (Right-click to cancel)
        </div>
      )}
    </div>
  );
}
