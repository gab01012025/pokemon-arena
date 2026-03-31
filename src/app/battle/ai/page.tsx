'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import './battle.css';
import './mobile.css';
import { getRankByLevel, RankInfo } from '@/lib/ranks';

// Import extracted modules
import {
  PokemonType, EnergyType, StatusType, GamePhase,
  EnergyState, Move, BattlePokemon, SelectedAction, LogEntry, Trainer, BattleItem,
  EvolutionOption, EnergyCost,
} from './types';
import {
  getSprite, getSpriteById,
  ALL_SELECTABLE_ENERGY_TYPES, ALL_ENERGY_TYPES, EMPTY_ENERGY,
  ENERGY_ICONS, ENERGY_NAMES, TYPE_TO_ENERGY, STATUS_ICONS,
  TYPE_COLORS, MOVE_ABBREV, BATTLE_BACKGROUNDS,
  getDefaultMoves, getPokemonMoves, KANTO_POKEMON, EVOLUTION_DATA,
  TRAINERS, AI_TRAINER_NAMES, DEFAULT_ITEMS,
  getWeaknessResistance,
} from './data';
import {
  getTotalEnergy, getHpClass, generateTurnEnergy, addEnergy,
  spendEnergyForMove, canAffordMove, processStatusEffects, canAct,
  calculateBattleDamage, STAB_MULTIPLIER,
} from './engine';
import { createOpponentTeam, createFallbackPlayerTeam } from './ai';
import {
  LoadingScreen,
  TrainerSelectScreen,
  EnergySelectScreen,
  BattleTopBar,
  PlayerColumn,
  EnemyColumn,
  BattleCenter,
  BattleBottomBar,
  BattleOverlays,
} from './components';

// ==================== AI ENERGY HELPER ====================
/** Pick up to 4 selectable energy types based on ALL types from alive pokemon, deduped */
function getAiEnergyTypes(team: BattlePokemon[]): EnergyType[] {
  const energySet = new Set<EnergyType>();
  for (const p of team) {
    if (p.hp <= 0) continue;
    for (const t of p.types) {
      const mapped = TYPE_TO_ENERGY[t];
      if (mapped && mapped !== 'colorless') energySet.add(mapped);
    }
  }
  const unique = Array.from(energySet);
  // If fewer than 4, return what we have; if more, pick the first 4
  return unique.slice(0, 4);
}

// ==================== MAIN COMPONENT ====================
export default function AIBattlePage() {
  // Core battle state
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<BattlePokemon[]>([]);
  const [energy, setEnergy] = useState<EnergyState>({ ...EMPTY_ENERGY });
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [selectedActions, setSelectedActions] = useState<SelectedAction[]>([]);
  const [selectingPokemon, setSelectingPokemon] = useState<number | null>(null);
  const [selectingMove, setSelectingMove] = useState<Move | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{ move: Move; pokemonName: string; pokemonTypes?: PokemonType[] } | null>(null);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);
  const [timer, setTimer] = useState(100);
  const [battleBackground, setBattleBackground] = useState('');

  // Energy selection (pre-battle)
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<EnergyType[]>([]);

  // Player info
  const [playerName, setPlayerName] = useState('Trainer');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [playerRank, setPlayerRank] = useState<RankInfo>(getRankByLevel(1));
  const [playerTrainer, setPlayerTrainer] = useState<Trainer | null>(null);
  const [battleStats, setBattleStats] = useState({ wins: 0, losses: 0, totalXP: 0 });

  // Items
  const [items, setItems] = useState<BattleItem[]>(DEFAULT_ITEMS.map(i => ({ ...i })));
  const [showItems, setShowItems] = useState(false);
  const [usingItem, setUsingItem] = useState<BattleItem | null>(null);
  const [usedItemThisTurn, setUsedItemThisTurn] = useState(false);

  // Evolution
  const [evolvingPokemon, setEvolvingPokemon] = useState<{ idx: number; from: string; to: string; fromId: number; toId: number } | null>(null);
  const [evolveChoiceIdx, setEvolveChoiceIdx] = useState<number | null>(null);

  // Opponent
  const [opponentName, setOpponentName] = useState('Opponent');
  const [opponentLevel, setOpponentLevel] = useState(20);
  const opponentRank = getRankByLevel(opponentLevel);

  // AI energy tracking
  const [aiEnergy, setAiEnergy] = useState<EnergyState>({ ...EMPTY_ENERGY });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Win Streak & Daily Challenge
  const [winStreak, setWinStreak] = useState(0);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);

  // Combat animations (applied briefly to character cards)
  const [playerAnims, setPlayerAnims] = useState<string[]>(['', '', '']);
  const [enemyAnims, setEnemyAnims] = useState<string[]>(['', '', '']);

  // Battle Stats Tracking
  const [battleTracker, setBattleTracker] = useState({
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    movesUsed: 0,
    statusApplied: 0,
    pokemonFainted: 0,
    turnsPlayed: 0,
    criticalHits: 0,
    superEffectiveHits: 0,
    pokemonDamage: {} as Record<string, number>,
  });

  // Refs to always have fresh team state in async callbacks
  const playerTeamRef = useRef<BattlePokemon[]>(playerTeam);
  const opponentTeamRef = useRef<BattlePokemon[]>(opponentTeam);
  playerTeamRef.current = playerTeam;
  opponentTeamRef.current = opponentTeam;

  // Ref to always call the latest handleEndTurn from timer (avoids stale closure)
  const handleEndTurnRef = useRef<() => void>(() => {});
  // Guard against timer + manual end-turn firing concurrently
  const isExecutingRef = useRef(false);

  // ==================== DATA LOADING ====================
  useEffect(() => {
    // Set random opponent data client-side only (avoids hydration mismatch)
    setOpponentName(AI_TRAINER_NAMES[Math.floor(Math.random() * AI_TRAINER_NAMES.length)]);
    setOpponentLevel(Math.floor(Math.random() * 30) + 15);

    const fetchPlayerData = async () => {
      let teamLoaded = false;

      try {
        const savedPlayerData = localStorage.getItem('playerData');
        if (savedPlayerData) {
          const data = JSON.parse(savedPlayerData);
          setPlayerName(data.username || 'Trainer');
          setPlayerLevel(data.level || 1);
          setPlayerXP(data.xp || 0);
          setPlayerRank(getRankByLevel(data.level || 1));
        }
        const savedStats = localStorage.getItem('battleStats');
        if (savedStats) setBattleStats(JSON.parse(savedStats));
        // Load win streak
        const savedStreak = localStorage.getItem('winStreak');
        if (savedStreak) setWinStreak(parseInt(savedStreak, 10) || 0);
        // Daily challenge check
        const lastDaily = localStorage.getItem('lastDailyChallenge');
        const today = new Date().toDateString();
        if (lastDaily !== today) {
          setIsDailyChallenge(true);
          setDailyChallengeCompleted(false);
        } else {
          setDailyChallengeCompleted(true);
        }
      } catch { /* ignore */ }

      try {
        const savedTeam = localStorage.getItem('battleTeam');
        if (savedTeam) {
          const parsedTeam = JSON.parse(savedTeam);
          if (Array.isArray(parsedTeam) && parsedTeam.length === 3) {
            const battleTeam = parsedTeam.map((p: { id: number; name: string; type: string; skills: { name: string; description: string }[] }) => {
              const primaryType = (p.type || 'normal') as PokemonType;
              const kantoData = KANTO_POKEMON.find(k => k.name === p.name || k.id === p.id);
              const moves: Move[] = getPokemonMoves(p.id, primaryType);
              const wr = getWeaknessResistance(kantoData?.types || [primaryType]);
              return {
                id: p.id,
                name: p.name,
                types: kantoData?.types || [primaryType] as PokemonType[],
                hp: kantoData?.hp || 200,
                maxHp: kantoData?.hp || 200,
                attack: 80, defense: 70, spAtk: 85, spDef: 75, speed: 60,
                sprite: getSprite(p.name),
                moves,
                statusEffects: [],
                canEvolve: kantoData?.canEvolve || false,
                evolvesTo: kantoData?.evolvesTo,
                evolutionEnergyCost: kantoData?.evolutionEnergyCost,
                evolutionOptions: kantoData?.evolutionOptions,
                weakness: wr.weakness,
                resistance: wr.resistance,
              };
            });
            setPlayerTeam(battleTeam);
            teamLoaded = true;
          }
        }
      } catch { /* ignore */ }

      try {
        const response = await fetch('/api/trainer/profile');
        if (response.ok) {
          const data = await response.json();
          setPlayerName(data.username || 'Trainer');
          setPlayerLevel(data.level || 1);
          setPlayerXP(data.xp || 0);
          setPlayerRank(getRankByLevel(data.level || 1));
          setIsAuthenticated(true);
          localStorage.setItem('playerData', JSON.stringify({ username: data.username, level: data.level, xp: data.xp, lastUpdated: Date.now() }));
        }
      } catch { /* ignore */ }

      if (!teamLoaded) {
        setPlayerTeam(createFallbackPlayerTeam());
      }

      setOpponentTeam(createOpponentTeam());
      setBattleBackground(BATTLE_BACKGROUNDS[Math.floor(Math.random() * BATTLE_BACKGROUNDS.length)]);
      setPhase('trainer-select');
    };
    fetchPlayerData();
  }, []);

  // Timer only runs during player1's turn (human player)
  useEffect(() => {
    if (phase !== 'player1-turn') return;
    const int = setInterval(() => setTimer(t => {
      if (t <= 0) {
        handleEndTurnRef.current();
        return 100;
      }
      return t - 1;
    }), 600);
    return () => clearInterval(int);
  }, [phase]);

  // ==================== LOG ====================
  const addLog = useCallback((text: string, type: LogEntry['type']) => {
    setBattleLog(prev => [{ id: Date.now() + Math.random(), text, type }, ...prev].slice(0, 30));
  }, []);

  // ==================== ENERGY SELECTION ====================
  const toggleEnergyType = (type: EnergyType) => {
    setSelectedEnergyTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      if (prev.length >= 4) return prev;
      return [...prev, type];
    });
  };

  const confirmEnergySelection = () => {
    if (selectedEnergyTypes.length !== 4) return;
    const initialEnergy = generateTurnEnergy(playerTeam, selectedEnergyTypes, 1);
    console.log('[ENERGY] Battle start — player initial energy:', JSON.stringify(initialEnergy));
    setEnergy(prev => {
      const result = addEnergy(prev, initialEnergy);
      console.log('[ENERGY] Player energy after init:', JSON.stringify(result));
      return result;
    });
    // Initialize AI energy based on ALL opponent team types (dedup, max 4)
    const aiTypes = getAiEnergyTypes(opponentTeam);
    const initialAiEnergy = generateTurnEnergy(opponentTeam, aiTypes, 1);
    console.log('[ENERGY] Battle start — AI initial energy:', JSON.stringify(initialAiEnergy));
    setAiEnergy(prev => {
      const result = addEnergy(prev, initialAiEnergy);
      console.log('[ENERGY] AI energy after init:', JSON.stringify(result));
      return result;
    });
    // Apply onBattleStart passives (Oak +5HP, Red +1 each selected energy)
    if (playerTrainer?.onBattleStart) {
      playerTrainer.onBattleStart({
        playerTeam,
        opponentTeam,
        energy,
        setEnergy,
        setPlayerTeam,
        setAiEnergy,
        turn: 1,
        addLog,
      });
    }

    setPhase('player1-turn');
    addLog('Battle Start! Player 1 turn!', 'info');
    addLog('Turn 1 - Gained 1 energy!', 'info');
  };

  // ==================== MOVE SELECTION ====================
  const canUseMove = (move: Move, pIdx: number): boolean => {
    if (phase !== 'player1-turn') return false;
    if (move.currentCooldown > 0) return false;
    if (playerTeam[pIdx]?.hp <= 0) return false;
    if (selectedActions.some(a => a.pokemonIndex === pIdx)) return false;
    if (!canAct(playerTeam[pIdx])) return false;
    const isSilenced = playerTeam[pIdx].statusEffects.some(e => e.type === 'silence');
    if (isSilenced && move.power === 0) return false;
    const isTaunted = playerTeam[pIdx].statusEffects.some(e => e.type === 'taunt');
    if (isTaunted && move.power === 0) return false;
    return canAffordMove(energy, selectedActions, move);
  };

  const handleSkillClick = (pIdx: number, move: Move) => {
    if (!canUseMove(move, pIdx)) return;
    if (move.targetType === 'self' || move.targetType === 'all-enemies') {
      const targetIndex = move.targetType === 'self' ? pIdx : 0;
      setSelectedActions(prev => [...prev, { pokemonIndex: pIdx, move, targetIndex }]);
      addLog(`${playerTeam[pIdx].name} will use ${move.name}!`, 'info');
    } else {
      setSelectingPokemon(pIdx);
      setSelectingMove(move);
      setPhase('targeting');
    }
  };

  const handleTargetSelect = (tIdx: number) => {
    if (selectingPokemon === null || !selectingMove) return;
    setSelectedActions(prev => [...prev, { pokemonIndex: selectingPokemon, move: selectingMove, targetIndex: tIdx }]);
    addLog(`${playerTeam[selectingPokemon].name} targets ${opponentTeam[tIdx].name} with ${selectingMove.name}!`, 'info');
    setSelectingPokemon(null);
    setSelectingMove(null);
    setPhase('player1-turn');
  };

  const cancelTarget = () => {
    setSelectingPokemon(null);
    setSelectingMove(null);
    if (usingItem) { setUsingItem(null); }
    setPhase('player1-turn');
  };

  const removeAction = (pIdx: number) => {
    setSelectedActions(prev => prev.filter(a => a.pokemonIndex !== pIdx));
  };

  // ==================== ITEMS ====================
  const NEGATIVE_STATUSES: StatusType[] = ['burn', 'poison', 'paralyze', 'freeze', 'sleep', 'confuse', 'stun', 'silence', 'weaken', 'taunt', 'increase-damage', 'cannot-be-healed', 'cooldown-increase', 'bleed', 'expose'];

  const useItem = (item: BattleItem) => {
    if (item.uses <= 0 || usedItemThisTurn) return;
    // Non-targeted items
    if (item.id === 'energy-boost') {
      setEnergy(prev => ({ ...prev, colorless: prev.colorless + 1 }));
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, uses: i.uses - 1 } : i));
      addLog(`Used ${item.name}! +1 Colorless energy!`, 'heal');
      setShowItems(false);
      setUsedItemThisTurn(true);
      return;
    }
    if (item.id === 'rare-candy') {
      // Find first evolvable Pokemon and trigger free evolution
      const evolvable = playerTeam.findIndex(p => p.hp > 0 && p.canEvolve && (p.evolvesTo || p.evolutionOptions?.length));
      if (evolvable === -1) {
        addLog('No Pokemon can evolve!', 'info');
        setShowItems(false);
        return;
      }
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, uses: i.uses - 1 } : i));
      setShowItems(false);
      setUsedItemThisTurn(true);
      const poke = playerTeam[evolvable];
      if (poke.evolutionOptions?.length) {
        // For branching evos, trigger choice overlay
        setEvolveChoiceIdx(evolvable);
        addLog(`Used Rare Candy! Choose an evolution for ${poke.name}!`, 'effect');
      } else if (poke.evolvesTo) {
        // Direct evolve without energy cost
        addLog(`Used Rare Candy on ${poke.name}!`, 'effect');
        const evo = poke.evolvesTo;
        setEvolvingPokemon({ idx: evolvable, from: poke.name, to: evo.name, fromId: poke.id, toId: evo.id });
        setTimeout(() => {
          applyEvolution(evolvable, evo.id, evo.name, evo.hpBonus, evo.statBonus);
          addLog(`${poke.name} evolved into ${evo.name}!`, 'effect');
          setEvolvingPokemon(null);
        }, 2500);
      }
      return;
    }
    // Targeted items
    setUsingItem(item);
    setShowItems(false);
    setPhase('item-target');
  };

  const applyItemToTarget = (pIdx: number) => {
    if (!usingItem) return;
    const poke = playerTeam[pIdx];

    // === REVIVE ITEMS (require fainted target) ===
    if (usingItem.id === 'revive' || usingItem.id === 'max-revive') {
      if (poke.hp > 0) {
        addLog(`${poke.name} is not fainted!`, 'info');
        setUsingItem(null);
        setPhase('player1-turn');
        return;
      }
      const reviveHp = usingItem.id === 'max-revive' ? poke.maxHp : Math.floor(poke.maxHp * 0.5);
      setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: reviveHp } : p));
      addLog(`Used ${usingItem.name} on ${poke.name}! Restored to ${reviveHp} HP!`, 'heal');
      setItems(prev => prev.map(i => i.id === usingItem.id ? { ...i, uses: i.uses - 1 } : i));
      setUsingItem(null);
      setUsedItemThisTurn(true);
      setPhase('player1-turn');
      return;
    }

    // All other items require alive target
    if (!poke || poke.hp <= 0) return;

    // Nurse Joy: healing items heal 50% more
    const healMultiplier = playerTrainer?.name === 'Nurse Joy' ? 1.5 : 1;
    const joyBonus = playerTrainer?.name === 'Nurse Joy' ? ' (Healing Touch bonus!)' : '';

    switch (usingItem.id) {
      // === HEALING ===
      case 'potion': {
        const baseHeal = Math.floor(30 * healMultiplier);
        const heal = Math.min(baseHeal, poke.maxHp - poke.hp);
        if (heal > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.hp + heal } : p));
          addLog(`Used Potion on ${poke.name}! Healed ${heal} HP!${joyBonus}`, 'heal');
        } else { addLog(`${poke.name}'s HP is already full!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'super-potion': {
        const baseHeal = Math.floor(60 * healMultiplier);
        const heal = Math.min(baseHeal, poke.maxHp - poke.hp);
        if (heal > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.hp + heal } : p));
          addLog(`Used Super Potion on ${poke.name}! Healed ${heal} HP!${joyBonus}`, 'heal');
        } else { addLog(`${poke.name}'s HP is already full!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'hyper-potion': {
        const baseHeal = Math.floor(120 * healMultiplier);
        const heal = Math.min(baseHeal, poke.maxHp - poke.hp);
        if (heal > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.hp + heal } : p));
          addLog(`Used Hyper Potion on ${poke.name}! Healed ${heal} HP!${joyBonus}`, 'heal');
        } else { addLog(`${poke.name}'s HP is already full!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'max-potion': {
        const heal = poke.maxHp - poke.hp;
        if (heal > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.maxHp } : p));
          addLog(`Used Max Potion on ${poke.name}! Fully healed!${joyBonus}`, 'heal');
        } else { addLog(`${poke.name}'s HP is already full!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'full-restore': {
        const heal = poke.maxHp - poke.hp;
        const hadStatus = poke.statusEffects.length > 0;
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, hp: p.maxHp, statusEffects: [] } : p));
        if (heal > 0 || hadStatus) {
          addLog(`Used Full Restore on ${poke.name}! Fully healed${hadStatus ? ' + status cleared' : ''}!`, 'heal');
        } else { addLog(`${poke.name} is already at full HP with no status!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      // === STATUS ===
      case 'full-heal': {
        if (poke.statusEffects.length > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, statusEffects: [] } : p));
          addLog(`Used Full Heal on ${poke.name}! Status effects cleared!`, 'heal');
        } else { addLog(`${poke.name} has no status effects!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'antidote': {
        if (poke.statusEffects.some(e => e.type === 'poison')) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, statusEffects: p.statusEffects.filter(e => e.type !== 'poison') } : p));
          addLog(`Used Antidote on ${poke.name}! Poison cured!`, 'heal');
        } else { addLog(`${poke.name} is not poisoned!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'burn-heal': {
        if (poke.statusEffects.some(e => e.type === 'burn')) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, statusEffects: p.statusEffects.filter(e => e.type !== 'burn') } : p));
          addLog(`Used Burn Heal on ${poke.name}! Burn cured!`, 'heal');
        } else { addLog(`${poke.name} is not burned!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'paralyze-heal': {
        if (poke.statusEffects.some(e => e.type === 'paralyze')) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, statusEffects: p.statusEffects.filter(e => e.type !== 'paralyze') } : p));
          addLog(`Used Paralyze Heal on ${poke.name}! Paralysis cured!`, 'heal');
        } else { addLog(`${poke.name} is not paralyzed!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'awakening': {
        if (poke.statusEffects.some(e => e.type === 'sleep')) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, statusEffects: p.statusEffects.filter(e => e.type !== 'sleep') } : p));
          addLog(`Used Awakening on ${poke.name}! Woke up!`, 'heal');
        } else { addLog(`${poke.name} is not asleep!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      case 'ice-heal': {
        if (poke.statusEffects.some(e => e.type === 'freeze')) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? { ...p, statusEffects: p.statusEffects.filter(e => e.type !== 'freeze') } : p));
          addLog(`Used Ice Heal on ${poke.name}! Thawed out!`, 'heal');
        } else { addLog(`${poke.name} is not frozen!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
      // === BOOST ===
      case 'x-attack': {
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
          ...p,
          statusEffects: [...p.statusEffects, { type: 'strengthen' as StatusType, duration: 3, source: 'X Attack', value: 30 }]
        } : p));
        addLog(`Used X Attack on ${poke.name}! Attack boosted!`, 'effect');
        break;
      }
      case 'x-defense': {
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
          ...p,
          statusEffects: [...p.statusEffects, { type: 'reduce-damage' as StatusType, duration: 3, source: 'X Defense', value: 20 }]
        } : p));
        addLog(`Used X Defense on ${poke.name}! Defense boosted!`, 'effect');
        break;
      }
      case 'x-speed': {
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
          ...p,
          statusEffects: [...p.statusEffects, { type: 'cooldown-reduce' as StatusType, duration: 3, source: 'X Speed', value: 1 }]
        } : p));
        addLog(`Used X Speed on ${poke.name}! Speed boosted!`, 'effect');
        break;
      }
      case 'x-special': {
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
          ...p,
          statusEffects: [...p.statusEffects, { type: 'strengthen' as StatusType, duration: 3, source: 'X Special', value: 30 }]
        } : p));
        addLog(`Used X Special on ${poke.name}! Special Attack boosted!`, 'effect');
        break;
      }
      // === SPECIAL ===
      case 'poke-doll': {
        setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
          ...p,
          statusEffects: [...p.statusEffects, { type: 'invulnerable' as StatusType, duration: 1, source: 'Poké Doll', value: 0 }]
        } : p));
        addLog(`Used Poké Doll on ${poke.name}! Protected for 1 turn!`, 'effect');
        break;
      }
      case 'switch': {
        const negatives = poke.statusEffects.filter(e => NEGATIVE_STATUSES.includes(e.type));
        if (negatives.length > 0) {
          setPlayerTeam(prev => prev.map((p, i) => i === pIdx ? {
            ...p,
            statusEffects: p.statusEffects.filter(e => !NEGATIVE_STATUSES.includes(e.type)),
          } : p));
          addLog(`Used Switch on ${poke.name}! Negative status cleared!`, 'heal');
        } else { addLog(`${poke.name} has no negative status!`, 'info'); setUsingItem(null); setPhase('player1-turn'); return; }
        break;
      }
    }

    setItems(prev => prev.map(i => i.id === usingItem.id ? { ...i, uses: i.uses - 1 } : i));
    setUsingItem(null);
    setUsedItemThisTurn(true);
    setPhase('player1-turn');
  };

  // ==================== EVOLUTION ====================
  const canAffordEvolutionCost = (cost: EnergyCost[]): boolean => {
    let temp = { ...energy };
    for (const a of selectedActions) {
      temp = spendEnergyForMove(temp, a.move);
    }
    for (const c of cost) {
      if (c.type === 'colorless') {
        if (getTotalEnergy(temp) < c.amount) return false;
      } else {
        if (temp[c.type] + temp.colorless < c.amount) return false;
      }
    }
    return true;
  };

  const canEvolvePokemon = (pIdx: number): boolean => {
    const poke = playerTeam[pIdx];
    if (!poke || poke.hp <= 0 || !poke.canEvolve) return false;
    if (phase !== 'player1-turn') return false;
    // Standard single evolution
    if (poke.evolvesTo && poke.evolutionEnergyCost) {
      return canAffordEvolutionCost(poke.evolutionEnergyCost);
    }
    // Branching evolution (Eevee)
    if (poke.evolutionOptions?.length) {
      return poke.evolutionOptions.some(opt => canAffordEvolutionCost(opt.energyCost));
    }
    return false;
  };

  const getEvolvableList = (): { idx: number; name: string }[] => {
    return playerTeam
      .map((p, i) => ({ idx: i, name: p.name }))
      .filter(({ idx }) => canEvolvePokemon(idx));
  };

  const handleEvolveClick = (pIdx: number) => {
    const poke = playerTeam[pIdx];
    if (!poke.canEvolve || phase !== 'player1-turn') return;
    // Branching evolution — show choice overlay
    if (poke.evolutionOptions?.length) {
      setEvolveChoiceIdx(pIdx);
      return;
    }
    // Standard single evolution
    evolvePokemon(pIdx);
  };

  const getEvolveChoiceData = () => {
    if (evolveChoiceIdx === null) return null;
    const poke = playerTeam[evolveChoiceIdx];
    if (!poke?.evolutionOptions?.length) return null;
    return {
      idx: evolveChoiceIdx,
      name: poke.name,
      sprite: poke.sprite,
      options: poke.evolutionOptions.map(opt => ({
        ...opt,
        affordable: canAffordEvolutionCost(opt.energyCost),
      })),
    };
  };

  const spendEvolutionEnergy = (cost: EnergyCost[]) => {
    setEnergy(prev => {
      const e = { ...prev };
      for (const c of cost) {
        if (c.type === 'colorless') {
          let remaining = c.amount;
          for (const t of ALL_ENERGY_TYPES) {
            const spend = Math.min(e[t], remaining);
            e[t] -= spend;
            remaining -= spend;
            if (remaining <= 0) break;
          }
        } else {
          const spend = Math.min(e[c.type], c.amount);
          e[c.type] -= spend;
          const stillNeeded = c.amount - spend;
          if (stillNeeded > 0) e.colorless = Math.max(0, e.colorless - stillNeeded);
        }
      }
      return e;
    });
  };

  const applyEvolution = (pIdx: number, evoId: number, evoName: string, hpBonus: number, statBonus: number, evoTypes?: PokemonType[]) => {
    const kantoData = EVOLUTION_DATA[evoId] || KANTO_POKEMON.find(k => k.id === evoId);
    const resolvedTypes = evoTypes || kantoData?.types || playerTeam[pIdx].types;
    const evoWr = getWeaknessResistance(resolvedTypes);
    setPlayerTeam(prev => prev.map((p, i) => {
      if (i !== pIdx) return p;
      return {
        ...p,
        id: evoId,
        name: evoName,
        hp: Math.min(p.hp + hpBonus, (kantoData?.hp || p.maxHp + hpBonus)),
        maxHp: kantoData?.hp || p.maxHp + hpBonus,
        attack: p.attack + statBonus,
        defense: p.defense + statBonus,
        spAtk: p.spAtk + statBonus,
        spDef: p.spDef + statBonus,
        speed: p.speed + Math.floor(statBonus / 2),
        sprite: getSpriteById(evoId),
        types: resolvedTypes,
        canEvolve: kantoData?.canEvolve || false,
        evolvesTo: kantoData?.evolvesTo,
        evolutionEnergyCost: kantoData?.evolutionEnergyCost,
        evolutionOptions: kantoData?.evolutionOptions,
        moves: getPokemonMoves(evoId, resolvedTypes[0] || p.types[0]),
        weakness: evoWr.weakness,
        resistance: evoWr.resistance,
      };
    }));
  };

  const evolvePokemon = async (pIdx: number, chosenOption?: EvolutionOption) => {
    const poke = playerTeam[pIdx];
    if (!poke.canEvolve || phase !== 'player1-turn') return;

    let evoId: number, evoName: string, hpBonus: number, statBonus: number;
    let energyCost: EnergyCost[];
    let evoTypes: PokemonType[] | undefined;

    if (chosenOption) {
      evoId = chosenOption.id;
      evoName = chosenOption.name;
      hpBonus = chosenOption.hpBonus;
      statBonus = chosenOption.statBonus;
      energyCost = chosenOption.energyCost;
      evoTypes = chosenOption.types;
    } else if (poke.evolvesTo && poke.evolutionEnergyCost) {
      evoId = poke.evolvesTo.id;
      evoName = poke.evolvesTo.name;
      hpBonus = poke.evolvesTo.hpBonus;
      statBonus = poke.evolvesTo.statBonus;
      energyCost = poke.evolutionEnergyCost;
    } else {
      return;
    }

    if (!canAffordEvolutionCost(energyCost)) return;

    // Spend energy
    spendEvolutionEnergy(energyCost);

    // Show animation
    setEvolvingPokemon({ idx: pIdx, from: poke.name, to: evoName, fromId: poke.id, toId: evoId });
    await new Promise(r => setTimeout(r, 2500));

    // Apply evolution
    applyEvolution(pIdx, evoId, evoName, hpBonus, statBonus, evoTypes);

    addLog(`${poke.name} evolved into ${evoName}!`, 'effect');
    setEvolvingPokemon(null);
  };

  // ==================== BATTLE PERSISTENCE ====================
  const saveBattleResult = useCallback(async (won: boolean) => {
    if (!isAuthenticated) return;
    try {
      await fetch('/api/battle/ai/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ won, difficulty: 'normal' }),
      });
    } catch { /* ignore - local stats already saved */ }
  }, [isAuthenticated]);

  // ==================== BATTLE XP ====================
  const getXPForLevel = (level: number): number => Math.floor(100 * Math.pow(1.5, level - 1));

  const handleBattleVictory = useCallback(() => {
    const baseXP = 50;
    let xpGained = baseXP + opponentLevel * 5 + Math.floor(Math.random() * 20);

    // Win streak tracking
    const newStreak = winStreak + 1;
    setWinStreak(newStreak);
    localStorage.setItem('winStreak', String(newStreak));

    // Streak bonus: +25% XP every 3 wins
    if (newStreak % 3 === 0) {
      const streakBonus = Math.floor(xpGained * 0.25);
      xpGained += streakBonus;
      addLog(`🔥 ${newStreak} Win Streak! +${streakBonus} bonus XP!`, 'heal');
    }

    // Daily challenge: 2x XP on first win of the day
    if (isDailyChallenge && !dailyChallengeCompleted) {
      xpGained = Math.floor(xpGained * 2);
      setDailyChallengeCompleted(true);
      setIsDailyChallenge(false);
      localStorage.setItem('lastDailyChallenge', new Date().toDateString());
      addLog('⭐ Daily Challenge Complete! Double XP!', 'heal');
    }

    const newStats = { wins: battleStats.wins + 1, losses: battleStats.losses, totalXP: battleStats.totalXP + xpGained };
    setBattleStats(newStats);
    localStorage.setItem('battleStats', JSON.stringify(newStats));

    let newXP = playerXP + xpGained;
    let newLevel = playerLevel;
    while (newXP >= getXPForLevel(newLevel)) {
      newXP -= getXPForLevel(newLevel);
      newLevel++;
    }
    setPlayerXP(newXP);
    setPlayerLevel(newLevel);
    setPlayerRank(getRankByLevel(newLevel));
    localStorage.setItem('playerData', JSON.stringify({ username: playerName, level: newLevel, xp: newXP, lastUpdated: Date.now() }));

    addLog(`Victory! You earned ${xpGained} XP!`, 'heal');
    if (newLevel > playerLevel) addLog(`Level Up! Now level ${newLevel}!`, 'heal');

    // Sound effect placeholder
    // playSound('victory');

    // Persist to DB
    saveBattleResult(true);

    return xpGained;
  }, [battleStats, playerXP, playerLevel, playerName, opponentLevel, addLog, saveBattleResult, winStreak, isDailyChallenge, dailyChallengeCompleted]);

  const handleBattleDefeat = useCallback(() => {
    const newStats = { wins: battleStats.wins, losses: battleStats.losses + 1, totalXP: battleStats.totalXP };
    setBattleStats(newStats);
    localStorage.setItem('battleStats', JSON.stringify(newStats));

    // Reset win streak
    if (winStreak > 0) {
      addLog(`💀 ${winStreak} win streak lost!`, 'damage');
    }
    setWinStreak(0);
    localStorage.setItem('winStreak', '0');

    addLog('Defeat! Try again!', 'damage');

    // Sound effect placeholder
    // playSound('defeat');

    // Persist to DB
    saveBattleResult(false);
  }, [battleStats, addLog, saveBattleResult, winStreak]);

  // ==================== EXECUTE ACTION ====================
  /** Trigger a brief CSS animation class on a Pokemon card */
  const triggerAnim = (isPlayerSide: boolean, idx: number, anim: string, duration = 600) => {
    const setter = isPlayerSide ? setPlayerAnims : setEnemyAnims;
    setter(prev => prev.map((a, i) => i === idx ? anim : a));
    setTimeout(() => setter(prev => prev.map((a, i) => i === idx ? '' : a)), duration);
  };

  const executeAction = async (action: SelectedAction, isPlayer: boolean) => {
    const atkTeam = isPlayer ? playerTeamRef.current : opponentTeamRef.current;
    const defTeam = isPlayer ? opponentTeamRef.current : playerTeamRef.current;
    const setDefTeam = isPlayer ? setOpponentTeam : setPlayerTeam;
    const setAtkTeam = isPlayer ? setPlayerTeam : setOpponentTeam;
    const atk = atkTeam[action.pokemonIndex];
    const move = action.move;
    if (!atk || atk.hp <= 0) return;

    if (!canAct(atk)) {
      const blockStatus = atk.statusEffects.find(e => ['stun', 'freeze', 'sleep', 'paralyze'].includes(e.type));
      if (blockStatus) {
        addLog(`${atk.name} can't move due to ${blockStatus.type}!`, 'status');
        return;
      }
    }

    let accuracy = move.accuracy;
    if (isPlayer && playerTrainer?.name === 'Sabrina' && move.type === 'psychic') {
      accuracy = Math.min(100, accuracy + 10);
    }
    // accuracy >= 100 → never miss
    if (accuracy < 100 && Math.random() * 100 > accuracy) {
      addLog(`${atk.name}'s ${move.name} missed!`, 'info');
      return;
    }

    if (move.targetType === 'self') {
      if (move.healing && move.healing > 0) {
        const cannotHeal = atk.statusEffects.some(e => e.type === 'cannot-be-healed');
        if (cannotHeal) {
          addLog(`${atk.name} cannot be healed!`, 'status');
        } else {
          const healAmount = move.healing;
          const newHp = Math.min(atk.maxHp, atk.hp + healAmount);
          const healed = newHp - atk.hp;
          setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? { ...p, hp: newHp } : p));
          triggerAnim(isPlayer, action.pokemonIndex, 'healed', 800);
          if (healed > 0) addLog(`${atk.name} used ${move.name}! Healed ${healed} HP!`, 'heal');
          else addLog(`${atk.name} used ${move.name}! HP is already full!`, 'info');
        }
      } else {
        addLog(`${atk.name} used ${move.name}!`, 'effect');
      }
      if (move.statusEffect) {
        const alreadyHas = atk.statusEffects.some(e => e.type === move.statusEffect!.type);
        // chance >= 100 → always apply; otherwise roll
        const chanceOk = move.statusEffect.chance >= 100 || Math.random() * 100 < move.statusEffect.chance;
        if (!alreadyHas && chanceOk) {
          setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? {
            ...p,
            statusEffects: [...p.statusEffects, { type: move.statusEffect!.type, duration: move.statusEffect!.duration, source: atk.name, value: move.statusEffect!.value }],
          } : p));
          const effectNames: Record<string, string> = {
            'reduce-damage': 'defense boosted', 'strengthen': 'attack boosted', 'invulnerable': 'protected',
            'reflect': 'reflecting', 'counter': 'countering', 'heal-over-time': 'regenerating',
            'cooldown-reduce': 'hastened', 'endure': 'enduring',
          };
          const effectName = effectNames[move.statusEffect.type] || move.statusEffect.type;
          addLog(`${atk.name} is ${effectName}!`, 'effect');
        }
      }
    } else if (move.power > 0) {
      const targets = move.targetType === 'all-enemies'
        ? defTeam.map((_, i) => i).filter(i => defTeam[i].hp > 0)
        : [action.targetIndex];

      for (const tIdx of targets) {
        const def = defTeam[tIdx];
        if (!def || def.hp <= 0) continue;

        // Expose: ignore invulnerability
        const isExposed = def.statusEffects.some(e => e.type === 'expose');
        const isInvulnerable = !isExposed && def.statusEffects.some(e => e.type === 'invulnerable');
        if (isInvulnerable) {
          addLog(`${def.name} is invulnerable! ${move.name} was blocked!`, 'effect');
          continue;
        }

        // Fire moves thaw frozen targets
        if (move.type === 'fire') {
          const isFrozen = def.statusEffects.some(e => e.type === 'freeze');
          if (isFrozen) {
            setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
              ...p,
              statusEffects: p.statusEffects.filter(e => e.type !== 'freeze'),
            } : p));
            addLog(`${def.name} was thawed by the fire attack!`, 'info');
          }
        }

        // TCG Pocket damage: power × STAB × crit ± weakness/resistance
        const damageResult = calculateBattleDamage(
          move.power,
          move.type as PokemonType,
          atk.types,
          def.weakness,
          def.resistance,
          atk.statusEffects,
          def.statusEffects,
        );

        let finalDamage = damageResult.damage;

        // ===== TRAINER CONDITIONAL PASSIVES (damage phase) =====
        // Giovanni: enemies deal 10% less damage
        if (!isPlayer && playerTrainer?.name === 'Giovanni') {
          finalDamage = Math.floor(finalDamage * 0.9);
        }
        // Brock: Rock/Ground defenders take -15 damage
        if (!isPlayer && playerTrainer?.name === 'Brock') {
          const defPoke = playerTeam[tIdx];
          if (defPoke && (defPoke.types.includes('rock') || defPoke.types.includes('ground'))) {
            finalDamage = Math.max(1, finalDamage - 15);
          }
        }
        // Misty: Water attackers deal +10% on Water moves
        if (isPlayer && playerTrainer?.name === 'Misty' && move.type === 'water' && atk.types.includes('water')) {
          finalDamage = Math.floor(finalDamage * 1.1);
        }
        // Sabrina: Psychic attackers deal +5 on Psychic moves
        if (isPlayer && playerTrainer?.name === 'Sabrina' && move.type === 'psychic' && atk.types.includes('psychic')) {
          finalDamage += 5;
        }
        // Lance: Dragon attackers deal +20% damage
        if (isPlayer && playerTrainer?.name === 'Lance' && atk.types.includes('dragon')) {
          finalDamage = Math.floor(finalDamage * 1.2);
        }
        // Lance: Dragonite gets +1 base power (already applied via finalDamage)
        if (isPlayer && playerTrainer?.name === 'Lance' && atk.name === 'Dragonite') {
          finalDamage += 1;
        }
        // Blaine: Fire defenders take -25% from Fire moves
        if (!isPlayer && playerTrainer?.name === 'Blaine' && move.type === 'fire') {
          const defPoke = playerTeam[tIdx];
          if (defPoke && defPoke.types.includes('fire')) {
            finalDamage = Math.floor(finalDamage * 0.75);
          }
        }

        // Hex doubles vs statused targets
        if (move.name === 'Hex' && def.statusEffects.length > 0) {
          finalDamage = Math.floor(finalDamage * 2);
        }

        let newHp = Math.max(0, def.hp - finalDamage);

        // Endure: cannot die, stays at 1 HP minimum
        const hasEndure = def.statusEffects.some(e => e.type === 'endure');
        if (hasEndure && newHp <= 0 && def.hp > 0) {
          newHp = 1;
          addLog(`${def.name} endured the hit! (1 HP)`, 'effect');
        }

        setDefTeam(prev => prev.map((p, i) => i === tIdx ? { ...p, hp: newHp } : p));

        // Trigger visual feedback animations
        triggerAnim(isPlayer, action.pokemonIndex, 'attacking', 500);
        triggerAnim(!isPlayer, tIdx, damageResult.isCrit ? 'critical' : 'damaged', 600);

        let logMsg = `${atk.name}'s ${move.name} dealt ${finalDamage} damage to ${def.name}!`;
        if (damageResult.isCrit) logMsg += ' Critical hit!';
        if (damageResult.effectivenessText) logMsg += ` ${damageResult.effectivenessText}`;
        addLog(logMsg, damageResult.isCrit ? 'critical' : 'damage');

        // Sound effect placeholders
        // if (damageResult.isCrit) playSound('critical');
        // else playSound('hit');
        // if (damageResult.effectivenessText?.includes('super')) playSound('super-effective');

        // Track battle stats
        setBattleTracker(prev => {
          const newTracker = { ...prev };
          if (isPlayer) {
            newTracker.totalDamageDealt += finalDamage;
            newTracker.movesUsed++;
            // Track per-pokemon damage for MVP
            const pokeDmg = { ...prev.pokemonDamage };
            pokeDmg[atk.name] = (pokeDmg[atk.name] || 0) + finalDamage;
            newTracker.pokemonDamage = pokeDmg;
          } else {
            newTracker.totalDamageReceived += finalDamage;
          }
          if (damageResult.isCrit && isPlayer) newTracker.criticalHits++;
          if (damageResult.effectivenessText?.includes('super') && isPlayer) newTracker.superEffectiveHits++;
          if (newHp <= 0 && isPlayer) newTracker.pokemonFainted++;
          return newTracker;
        });

        // Counter: reflect damage back (skipped if exposed)
        const counterEffect = def.statusEffects.find(e => e.type === 'counter');
        if (counterEffect && finalDamage > 0 && !isExposed) {
          const counterDmg = Math.floor(finalDamage * ((counterEffect.value || 30) / 100));
          setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? { ...p, hp: Math.max(0, p.hp - counterDmg) } : p));
          addLog(`${def.name}'s Counter reflects ${counterDmg} damage back to ${atk.name}!`, 'damage');
        }

        // Reflect: return damage to attacker (skipped if exposed)
        const reflectEffect = def.statusEffects.find(e => e.type === 'reflect');
        if (reflectEffect && finalDamage > 0 && !isExposed) {
          const reflectDmg = Math.floor(finalDamage * ((reflectEffect.value || 25) / 100));
          setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? { ...p, hp: Math.max(0, p.hp - reflectDmg) } : p));
          addLog(`${def.name}'s Reflect returns ${reflectDmg} damage to ${atk.name}!`, 'damage');
        }

        if (newHp <= 0) {
          addLog(`${def.name} fainted!`, 'damage');
          // Red's Champion's Spirit: when an ally faints, others gain +10% damage (strengthen)
          if (!isPlayer && playerTrainer?.name === 'Red') {
            // A player Pokemon fainted — boost the other alive ones
            setPlayerTeam(prev => prev.map((p, i) => {
              if (i === tIdx || p.hp <= 0) return p;
              const hasRedBuff = p.statusEffects.some(e => e.source === 'Champion Spirit');
              if (hasRedBuff) return p; // stack only once
              return {
                ...p,
                statusEffects: [...p.statusEffects, { type: 'strengthen' as StatusType, duration: 999, source: 'Champion Spirit', value: 10 }],
              };
            }));
            addLog('Red\'s Champion\'s Spirit: Allies gain +10% damage!', 'effect');
          }
        }

        if (move.statusEffect && newHp > 0) {
          let chance = move.statusEffect.chance;
          // Blaine: +20% burn chance on fire moves
          if (isPlayer && playerTrainer?.name === 'Blaine' && move.type === 'fire' && move.statusEffect.type === 'burn') {
            chance += 20;
          }
          // Koga: +20% poison chance on poison moves
          if (isPlayer && playerTrainer?.name === 'Koga' && move.statusEffect.type === 'poison') {
            chance += 20;
          }

          // Lt. Surge: Electric Pokemon immune to paralyze
          if (move.statusEffect.type === 'paralyze' && !isPlayer && playerTrainer?.name === 'Lt. Surge') {
            const defPoke = playerTeam[tIdx];
            if (defPoke && defPoke.types.includes('electric')) {
              addLog(`Lt. Surge's Lightning Rod: ${defPoke.name} is immune to Paralyze!`, 'effect');
              continue;
            }
          }
          // Erika: Grass Pokemon immune to poison
          if (move.statusEffect.type === 'poison' && !isPlayer && playerTrainer?.name === 'Erika') {
            const defPoke = playerTeam[tIdx];
            if (defPoke && defPoke.types.includes('grass')) {
              addLog(`Erika's Natural Cure: ${defPoke.name} is immune to Poison!`, 'effect');
              continue;
            }
          }

          // chance >= 100 → always apply
          const chanceHit = chance >= 100 || Math.random() * 100 < chance;
          if (chanceHit) {
            const alreadyHas = def.statusEffects.some(e => e.type === move.statusEffect!.type);
            if (!alreadyHas) {
              let duration = move.statusEffect.duration;
              if (isPlayer && playerTrainer?.name === 'Koga' && move.statusEffect.type === 'poison') {
                duration += 1;
              }

              // Expose: on application, remove all existing defensive effects from target
              if (move.statusEffect.type === 'expose') {
                const defensiveTypes: StatusType[] = ['invulnerable', 'reduce-damage', 'reflect', 'counter', 'endure'];
                setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                  ...p,
                  statusEffects: p.statusEffects.filter(e => !defensiveTypes.includes(e.type)),
                } : p));
                addLog(`${def.name}'s defenses were stripped!`, 'status');
              }

              setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                ...p,
                statusEffects: [...p.statusEffects, { type: move.statusEffect!.type, duration, source: atk.name, value: move.statusEffect!.value }],
              } : p));
              const statusText: Record<StatusType, string> = {
                'burn': 'burned', 'poison': 'poisoned', 'paralyze': 'paralyzed',
                'freeze': 'frozen', 'sleep': 'put to sleep', 'confuse': 'confused',
                'stun': 'stunned', 'silence': 'silenced', 'weaken': 'weakened',
                'strengthen': 'strengthened', 'invulnerable': 'protected', 'taunt': 'taunted',
                'reflect': 'reflecting', 'counter': 'countering', 'reduce-damage': 'shielded',
                'increase-damage': 'vulnerable', 'drain-hp': 'draining', 'heal-over-time': 'regenerating',
                'cannot-be-healed': 'cursed', 'cooldown-increase': 'slowed', 'cooldown-reduce': 'hastened',
                'remove-energy': 'energy drained', 'steal-energy': 'energy stolen',
                'endure': 'enduring', 'expose': 'exposed', 'bleed': 'bleeding',
              };
              const statusMsg = statusText[move.statusEffect.type] || 'affected';
              addLog(`${def.name} was ${statusMsg}!`, 'status');

              // Track status applied
              if (isPlayer) setBattleTracker(prev => ({ ...prev, statusApplied: prev.statusApplied + 1 }));

              if (move.statusEffect.type === 'remove-energy') {
                const energyToRemove = move.statusEffect.value || 1;
                if (isPlayer) {
                  // Player attacking: remove from AI energy
                  setAiEnergy(prev => {
                    const e = { ...prev };
                    let removed = 0;
                    for (const t of ALL_ENERGY_TYPES) {
                      if (removed >= energyToRemove) break;
                      if (e[t] > 0) { e[t]--; removed++; }
                    }
                    if (removed > 0) addLog(`Removed ${removed} energy from opponent!`, 'status');
                    return e;
                  });
                } else {
                  // AI attacking: remove from player energy
                  setEnergy(prev => {
                    const e = { ...prev };
                    let removed = 0;
                    for (const t of ALL_ENERGY_TYPES) {
                      if (removed >= energyToRemove) break;
                      if (e[t] > 0) { e[t]--; removed++; }
                    }
                    if (removed > 0) addLog(`Lost ${removed} energy!`, 'status');
                    return e;
                  });
                }
              }

              if (move.statusEffect.type === 'steal-energy') {
                const energyToSteal = move.statusEffect.value || 1;
                let lastStolen = 0;
                if (isPlayer) {
                  // Player attacking: steal from AI, give to player
                  setAiEnergy(prev => {
                    const e = { ...prev };
                    let stolen = 0;
                    for (const t of ALL_ENERGY_TYPES) {
                      if (stolen >= energyToSteal) break;
                      if (e[t] > 0) { e[t]--; stolen++; }
                    }
                    lastStolen = stolen;
                    if (stolen > 0) addLog(`${atk.name} stole ${stolen} energy!`, 'status');
                    return e;
                  });
                  setEnergy(prev => ({ ...prev, colorless: prev.colorless + lastStolen }));
                } else {
                  // AI attacking: steal from player, give to AI
                  setEnergy(prev => {
                    const e = { ...prev };
                    let stolen = 0;
                    for (const t of ALL_ENERGY_TYPES) {
                      if (stolen >= energyToSteal) break;
                      if (e[t] > 0) { e[t]--; stolen++; }
                    }
                    lastStolen = stolen;
                    if (stolen > 0) addLog(`${atk.name} stole ${stolen} energy!`, 'status');
                    return e;
                  });
                  setAiEnergy(prev => ({ ...prev, colorless: prev.colorless + lastStolen }));
                }
              }

              // Cooldown-increase: immediately increase all target's move cooldowns
              if (move.statusEffect.type === 'cooldown-increase') {
                const cdInc = move.statusEffect.value || 1;
                setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                  ...p,
                  moves: p.moves.map(m => ({ ...m, currentCooldown: m.currentCooldown + cdInc })),
                } : p));
                addLog(`${def.name}'s cooldowns increased by ${cdInc}!`, 'status');
              }
            }
          }
        }

        // Draining Kiss: heal attacker (respect cannot-be-healed)
        if (move.name === 'Draining Kiss') {
          const cannotHeal = atk.statusEffects.some(e => e.type === 'cannot-be-healed');
          if (cannotHeal) {
            addLog(`${atk.name} cannot heal! (cursed)`, 'status');
          } else {
            const healAmt = 15;
            setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ?
              { ...p, hp: Math.min(p.maxHp, p.hp + healAmt) } : p));
            addLog(`${atk.name} drained ${healAmt} HP!`, 'heal');
          }
        }
      }

      // Self-Destruct: faints the user after dealing damage
      if (move.name === 'Self-Destruct') {
        setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? { ...p, hp: 0 } : p));
        addLog(`${atk.name} fainted from the explosion!`, 'damage');
      }

      // Outrage: confuses the user after dealing damage
      if (move.name === 'Outrage') {
        const hasConfuse = atk.statusEffects.some(e => e.type === 'confuse');
        if (!hasConfuse) {
          setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? {
            ...p,
            statusEffects: [...p.statusEffects, { type: 'confuse' as StatusType, duration: 2, source: 'self' }],
          } : p));
          addLog(`${atk.name} became confused from its rampage!`, 'status');
        }
      }
    } else {
      if (move.statusEffect) {
        const tIdx = action.targetIndex;
        const targetType = move.targetType as 'enemy' | 'all-enemies' | 'self';

        if (targetType === 'self') {
          const chance = move.statusEffect.chance;
          const selfChanceOk = chance >= 100 || Math.random() * 100 < chance;
          if (selfChanceOk) {
            const alreadyHas = atk.statusEffects.some(e => e.type === move.statusEffect!.type);
            if (!alreadyHas) {
              setAtkTeam(prev => prev.map((p, i) => i === action.pokemonIndex ? {
                ...p,
                statusEffects: [...p.statusEffects, { type: move.statusEffect!.type, duration: move.statusEffect!.duration, source: atk.name, value: move.statusEffect!.value }],
              } : p));
              addLog(`${atk.name} used ${move.name}!`, 'effect');
            }
          }
        } else {
          const def = defTeam[tIdx];
          if (def && def.hp > 0) {
            const chance = move.statusEffect.chance;
            const enemyChanceOk = chance >= 100 || Math.random() * 100 < chance;
            if (enemyChanceOk) {
              const alreadyHas = def.statusEffects.some(e => e.type === move.statusEffect!.type);
              if (!alreadyHas) {
                // Expose: on application, strip existing defenses
                if (move.statusEffect!.type === 'expose') {
                  const defensiveTypes: StatusType[] = ['invulnerable', 'reduce-damage', 'reflect', 'counter', 'endure'];
                  setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                    ...p,
                    statusEffects: p.statusEffects.filter(e => !defensiveTypes.includes(e.type)),
                  } : p));
                  addLog(`${def.name}'s defenses were stripped!`, 'status');
                }

                setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                  ...p,
                  statusEffects: [...p.statusEffects, { type: move.statusEffect!.type, duration: move.statusEffect!.duration, source: atk.name, value: move.statusEffect!.value }],
                } : p));
                addLog(`${atk.name} used ${move.name}! ${def.name} was affected!`, 'status');

                // Immediate effects for power=0 moves
                if (move.statusEffect!.type === 'remove-energy') {
                  const energyToRemove = move.statusEffect!.value || 1;
                  if (isPlayer) {
                    setAiEnergy(prev => {
                      const e = { ...prev };
                      let removed = 0;
                      for (const t of ALL_ENERGY_TYPES) {
                        if (removed >= energyToRemove) break;
                        if (e[t] > 0) { e[t]--; removed++; }
                      }
                      if (removed > 0) addLog(`Removed ${removed} energy from opponent!`, 'status');
                      return e;
                    });
                  } else {
                    setEnergy(prev => {
                      const e = { ...prev };
                      let removed = 0;
                      for (const t of ALL_ENERGY_TYPES) {
                        if (removed >= energyToRemove) break;
                        if (e[t] > 0) { e[t]--; removed++; }
                      }
                      if (removed > 0) addLog(`Lost ${removed} energy!`, 'status');
                      return e;
                    });
                  }
                }

                if (move.statusEffect!.type === 'steal-energy') {
                  const energyToSteal = move.statusEffect!.value || 1;
                  let lastStolen = 0;
                  if (isPlayer) {
                    setAiEnergy(prev => {
                      const e = { ...prev };
                      let stolen = 0;
                      for (const t of ALL_ENERGY_TYPES) {
                        if (stolen >= energyToSteal) break;
                        if (e[t] > 0) { e[t]--; stolen++; }
                      }
                      lastStolen = stolen;
                      if (stolen > 0) addLog(`${atk.name} stole ${stolen} energy!`, 'status');
                      return e;
                    });
                    setEnergy(prev => ({ ...prev, colorless: prev.colorless + lastStolen }));
                  } else {
                    setEnergy(prev => {
                      const e = { ...prev };
                      let stolen = 0;
                      for (const t of ALL_ENERGY_TYPES) {
                        if (stolen >= energyToSteal) break;
                        if (e[t] > 0) { e[t]--; stolen++; }
                      }
                      lastStolen = stolen;
                      if (stolen > 0) addLog(`${atk.name} stole ${stolen} energy!`, 'status');
                      return e;
                    });
                    setAiEnergy(prev => ({ ...prev, colorless: prev.colorless + lastStolen }));
                  }
                }

                if (move.statusEffect!.type === 'cooldown-increase') {
                  const cdInc = move.statusEffect!.value || 1;
                  setDefTeam(prev => prev.map((p, i) => i === tIdx ? {
                    ...p,
                    moves: p.moves.map(m => ({ ...m, currentCooldown: m.currentCooldown + cdInc })),
                  } : p));
                  addLog(`${def.name}'s cooldowns increased by ${cdInc}!`, 'status');
                }
              }
            } else {
              addLog(`${atk.name}'s ${move.name} failed!`, 'info');
            }
          }
        }
      } else {
        addLog(`${atk.name} used ${move.name}!`, 'effect');
      }
    }

    let cooldownToSet = move.cooldown;
    const cooldownIncEffect = atk.statusEffects.find(e => e.type === 'cooldown-increase');
    if (cooldownIncEffect) {
      cooldownToSet += (cooldownIncEffect.value || 1);
    }
    const cooldownRedEffect = atk.statusEffects.find(e => e.type === 'cooldown-reduce');
    if (cooldownRedEffect) {
      cooldownToSet = Math.max(0, cooldownToSet - (cooldownRedEffect.value || 1));
    }

    setAtkTeam(prev => prev.map((p, i) =>
      i === action.pokemonIndex ? { ...p, moves: p.moves.map(m => m.id === move.id ? { ...m, currentCooldown: cooldownToSet } : m) } : p
    ));
  };

  // ==================== AI TURN ====================
  const executeAITurn = async () => {
    const aliveOpp = opponentTeamRef.current.filter(p => p.hp > 0);
    const alivePly = playerTeamRef.current.filter(p => p.hp > 0);
    if (!aliveOpp.length || !alivePly.length) return;

    // AI gets energy like the player
    const startingAiEnergy = { ...aiEnergy };
    let currentAiEnergy = { ...aiEnergy };

    for (let i = 0; i < opponentTeamRef.current.length; i++) {
      const poke = opponentTeamRef.current[i];
      if (poke.hp <= 0) continue;
      if (!canAct(poke)) {
        addLog(`${poke.name} can't move!`, 'status');
        continue;
      }

      const availableMoves = poke.moves.filter(m => {
        if (m.currentCooldown > 0) return false;
        const isSilenced = poke.statusEffects.some(e => e.type === 'silence');
        if (isSilenced && m.power === 0) return false;
        const isTaunted = poke.statusEffects.some(e => e.type === 'taunt');
        if (isTaunted && m.power === 0) return false;
        // AI must be able to afford the move
        return canAffordMove(currentAiEnergy, [], m);
      });
      if (!availableMoves.length) continue;
      const targets = playerTeamRef.current.map((p, idx) => ({ p, idx })).filter(x => x.p.hp > 0);
      if (!targets.length) continue;

      let bestMove = availableMoves[0];
      let bestTarget = targets[0].idx;
      let bestScore = -Infinity;

      for (const move of availableMoves) {
        if (move.targetType === 'self') {
          if (poke.hp < poke.maxHp * 0.5) {
            const healScore = (poke.maxHp - poke.hp) * 2;
            if (healScore > bestScore) { bestScore = healScore; bestMove = move; bestTarget = i; }
          }
          continue;
        }
        for (const target of targets) {
          const isWeak = target.p.weakness === (move.type as PokemonType);
          const isResisted = target.p.resistance === (move.type as PokemonType);
          const stab = poke.types.includes(move.type as PokemonType) ? STAB_MULTIPLIER : 1;
          let baseDmg = Math.floor(move.power * stab);
          if (isWeak) baseDmg += 20;
          if (isResisted) baseDmg = Math.max(0, baseDmg - 20);
          const finishBonus = target.p.hp <= baseDmg ? 50 : 0;
          const effectBonus = isWeak ? 30 : isResisted ? -20 : 0;
          const score = baseDmg + finishBonus + effectBonus;
          if (score > bestScore) { bestScore = score; bestMove = move; bestTarget = target.idx; }
        }
      }

      // Spend AI energy for the chosen move
      currentAiEnergy = spendEnergyForMove(currentAiEnergy, bestMove);

      await executeAction({ pokemonIndex: i, move: bestMove, targetIndex: bestTarget }, false);
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('[ENERGY] AI spend (end AI turn) — final aiEnergy:', JSON.stringify(currentAiEnergy));
    // Apply spending as a diff to preserve any steal-energy state updates from executeAction
    setAiEnergy(prev => {
      const result = { ...prev };
      for (const t of ALL_ENERGY_TYPES) {
        const spent = startingAiEnergy[t] - currentAiEnergy[t];
        if (spent > 0) result[t] = Math.max(0, result[t] - spent);
      }
      return result;
    });
  };

  // ==================== TURN MANAGEMENT ====================
  // Flow: player1-turn → executing → player2-turn → executing → player1-turn
  const handleEndTurn = async () => {
    if (phase !== 'player1-turn') return;
    if (isExecutingRef.current) return; // Prevent double-fire (timer + manual click)
    isExecutingRef.current = true;

    // === Phase 1: Execute player actions ===
    setPhase('executing');
    setTimer(100);

    // Spend energy for all selected actions atomically using functional updater
    const actionsToExecute = [...selectedActions];
    setEnergy(prev => {
      let result = { ...prev };
      for (const action of actionsToExecute) {
        result = spendEnergyForMove(result, action.move);
      }
      console.log('[ENERGY] Player spend (end turn) — before:', JSON.stringify(prev), 'after:', JSON.stringify(result));
      return result;
    });

    addLog('--- Player executing actions ---', 'info');

    for (const action of selectedActions) {
      await executeAction(action, true);
      await new Promise(r => setTimeout(r, 700));
    }

    // Check win after player actions
    if (opponentTeamRef.current.filter(p => p.hp > 0).length === 0) {
      handleBattleVictory();
      setPhase('victory');
      isExecutingRef.current = false;
      return;
    }

    // === Phase 2: AI turn ===
    setSelectedActions([]);
    setPhase('player2-turn');
    addLog('--- Opponent\'s turn ---', 'info');
    await new Promise(r => setTimeout(r, 800));

    setPhase('executing');
    await executeAITurn();

    // Check loss after AI actions
    if (playerTeamRef.current.filter(p => p.hp > 0).length === 0) {
      handleBattleDefeat();
      setPhase('defeat');
      isExecutingRef.current = false;
      return;
    }

    // === Phase 3: New turn ===
    isExecutingRef.current = false;
    startNewTurn();
  };
  // Keep ref updated so timer always calls latest handleEndTurn
  handleEndTurnRef.current = handleEndTurn;

  const startNewTurn = () => {
    const newTurn = turn + 1;

    // Track turns
    setBattleTracker(prev => ({ ...prev, turnsPlayed: prev.turnsPlayed + 1 }));

    setPlayerTeam(prev => prev.map(p => ({ ...p, moves: p.moves.map(m => ({ ...m, currentCooldown: Math.max(0, m.currentCooldown - 1) })) })));
    setOpponentTeam(prev => prev.map(p => ({ ...p, moves: p.moves.map(m => ({ ...m, currentCooldown: Math.max(0, m.currentCooldown - 1) })) })));

    // Process status effects (burn, poison, etc.) and check for deaths
    const newPlayerState = processStatusEffects(playerTeamRef.current, addLog);
    const newOpponentState = processStatusEffects(opponentTeamRef.current, addLog);
    setPlayerTeam(newPlayerState);
    setOpponentTeam(newOpponentState);

    // Check if status effects killed all pokemon on either side
    if (newOpponentState.filter(p => p.hp > 0).length === 0) {
      handleBattleVictory();
      setPhase('victory');
      return;
    }
    if (newPlayerState.filter(p => p.hp > 0).length === 0) {
      handleBattleDefeat();
      setPhase('defeat');
      return;
    }

    if (playerTrainer) {
      playerTrainer.applyPassive({
        playerTeam: playerTeamRef.current,
        opponentTeam: opponentTeamRef.current,
        energy,
        setEnergy,
        setPlayerTeam,
        setAiEnergy,
        turn: newTurn,
        addLog,
      });
    }

    const newEnergy = generateTurnEnergy(playerTeamRef.current, selectedEnergyTypes, newTurn);
    console.log('[ENERGY] Turn', newTurn, '— player generated:', JSON.stringify(newEnergy));
    setEnergy(prev => {
      const result = addEnergy(prev, newEnergy);
      console.log('[ENERGY] Turn', newTurn, '— player BEFORE:', JSON.stringify(prev), 'AFTER:', JSON.stringify(result));
      return result;
    });

    // AI gets energy based on ALL alive Pokemon types
    const aiTypes = getAiEnergyTypes(opponentTeamRef.current);
    const aiNewEnergy = generateTurnEnergy(opponentTeamRef.current, aiTypes, newTurn);
    console.log('[ENERGY] Turn', newTurn, '— AI generated:', JSON.stringify(aiNewEnergy));
    setAiEnergy(prev => {
      const result = addEnergy(prev, aiNewEnergy);
      console.log('[ENERGY] Turn', newTurn, '— AI BEFORE:', JSON.stringify(prev), 'AFTER:', JSON.stringify(result));
      return result;
    });

    const aliveCount = playerTeamRef.current.filter(p => p.hp > 0).length;
    const energyGained = newTurn === 1 ? 1 : aliveCount;
    addLog(`Turn ${newTurn}! Gained ${energyGained} energy!`, 'info');

    setSelectedActions([]);
    setUsedItemThisTurn(false);
    setTurn(newTurn);
    setPhase('player1-turn');
  };

  // ==================== REMATCH / CHANGE TEAM ====================
  const handleRematch = () => {
    // Keep team, get new opponent
    setOpponentTeam(createOpponentTeam());
    setOpponentName(AI_TRAINER_NAMES[Math.floor(Math.random() * AI_TRAINER_NAMES.length)]);
    // Harder opponents every 5 wins (streak scaling)
    const streakBonus = Math.floor(winStreak / 5) * 5;
    setOpponentLevel(Math.floor(Math.random() * 30) + 15 + streakBonus);
    setBattleBackground(BATTLE_BACKGROUNDS[Math.floor(Math.random() * BATTLE_BACKGROUNDS.length)]);
    // Reset player team HP/status but keep evolutions
    setPlayerTeam(prev => prev.map(p => ({
      ...p,
      hp: p.maxHp,
      statusEffects: [],
      moves: p.moves.map(m => ({ ...m, currentCooldown: 0 })),
    })));
    setEnergy({ ...EMPTY_ENERGY });
    setAiEnergy({ ...EMPTY_ENERGY });
    setTurn(1);
    setTimer(100);
    setSelectedActions([]);
    setUsedItemThisTurn(false);
    setBattleLog([]);
    setItems(DEFAULT_ITEMS.map(i => ({ ...i })));
    setShowItems(false);
    setUsingItem(null);
    setEvolvingPokemon(null);
    setEvolveChoiceIdx(null);
    setBattleTracker({
      totalDamageDealt: 0, totalDamageReceived: 0, movesUsed: 0,
      statusApplied: 0, pokemonFainted: 0, turnsPlayed: 0,
      criticalHits: 0, superEffectiveHits: 0, pokemonDamage: {},
    });
    setPhase('energy-select');
  };

  const handleChangeTeam = () => {
    window.location.reload();
  };

  // ==================== RENDER: LOADING ====================
  if (phase === 'loading' || !playerTeam.length) {
    return <LoadingScreen />;
  }

  // ==================== RENDER: TRAINER SELECTION ====================
  if (phase === 'trainer-select') {
    return (
      <TrainerSelectScreen
        trainers={TRAINERS}
        playerTrainer={playerTrainer}
        setPlayerTrainer={setPlayerTrainer}
        onConfirm={() => { if (playerTrainer) setPhase('energy-select'); }}
      />
    );
  }

  // ==================== RENDER: ENERGY SELECTION ====================
  if (phase === 'energy-select') {
    return (
      <EnergySelectScreen
        playerTeam={playerTeam}
        selectedEnergyTypes={selectedEnergyTypes}
        toggleEnergyType={toggleEnergyType}
        onConfirm={confirmEnergySelection}
      />
    );
  }

  // ==================== RENDER: BATTLE ====================
  return (
    <div className="battle-container">
      <div className="battle-background" style={{ backgroundImage: `url(${battleBackground})` }} />
      <div className="battle-content">

        <BattleTopBar
          playerName={playerName}
          playerLevel={playerLevel}
          playerRank={playerRank}
          playerTrainer={playerTrainer}
          opponentName={opponentName}
          opponentLevel={opponentLevel}
          opponentRank={opponentRank}
          turn={turn}
          timer={timer}
          phase={phase}
          energy={energy}
          selectedEnergyTypes={selectedEnergyTypes}
          onEndTurn={handleEndTurn}
          winStreak={winStreak}
          isDailyChallenge={isDailyChallenge}
          dailyChallengeCompleted={dailyChallengeCompleted}
        />

        {/* BATTLE AREA */}
        <div className="battle-area">
          <PlayerColumn
            playerTeam={playerTeam}
            selectedActions={selectedActions}
            phase={phase}
            canUseMove={canUseMove}
            onSkillClick={handleSkillClick}
            onRemoveAction={removeAction}
            onItemTarget={applyItemToTarget}
            onHoverSkill={(move, name) => {
              const poke = playerTeam.find(p => p.name === name);
              setHoveredSkill({ move, pokemonName: name, pokemonTypes: poke?.types });
            }}
            onLeaveSkill={() => setHoveredSkill(null)}
            anims={playerAnims}
          />

          <BattleCenter
            selectedActions={selectedActions}
            hoveredSkill={hoveredSkill}
          />

          <EnemyColumn
            opponentTeam={opponentTeam}
            phase={phase}
            onTargetSelect={handleTargetSelect}
            anims={enemyAnims}
          />
        </div>

        <BattleBottomBar
          phase={phase}
          items={items}
          showItems={showItems}
          setShowItems={setShowItems}
          battleLog={battleLog}
          evolvableList={getEvolvableList()}
          onEvolve={handleEvolveClick}
          onSurrender={() => { handleBattleDefeat(); setPhase('defeat'); }}
          usedItemThisTurn={usedItemThisTurn}
        />
      </div>

      <BattleOverlays
        phase={phase}
        showItems={showItems}
        setShowItems={setShowItems}
        items={items}
        onUseItem={useItem}
        usedItemThisTurn={usedItemThisTurn}
        selectingMove={selectingMove}
        usingItem={usingItem}
        onCancelTarget={cancelTarget}
        evolvingPokemon={evolvingPokemon}
        evolveChoice={getEvolveChoiceData()}
        onEvolveChoice={(opt: EvolutionOption) => {
          if (evolveChoiceIdx !== null) {
            setEvolveChoiceIdx(null);
            evolvePokemon(evolveChoiceIdx, opt);
          }
        }}
        onCancelEvolveChoice={() => setEvolveChoiceIdx(null)}
        playerName={playerName}
        opponentLevel={opponentLevel}
        battleStats={battleStats}
        battleTracker={battleTracker}
        winStreak={winStreak}
        onRematch={handleRematch}
        onChangeTeam={handleChangeTeam}
      />
    </div>
  );
}
