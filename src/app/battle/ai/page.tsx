'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PokemonSprite } from '@/components/PokemonSprite';
import { getTypeColor } from '@/lib/pokemon-images';
import { useBattleAnimations, BattleAnimationManager, TurnTransition } from '@/components/battle/BattleAnimations';

interface Pokemon {
  id: string | number;
  name: string;
  type: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Move[];
}

interface Move {
  id: string | number;
  name: string;
  type: string;
  power: number;
  description: string;
  cooldown: number;
}

interface BattlePokemon extends Pokemon {
  currentHp: number;
  cooldowns: Record<string | number, number>;
}

interface BattleLog {
  turn: number;
  attacker: string;
  move: string;
  damage: number;
  message: string;
}

type Difficulty = 'easy' | 'normal' | 'hard';

export default function AIBattlePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'battle' | 'finished'>('loading');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  
  // Random seed ref for deterministic damage calculation
  // Initialize with a static value, will be set on mount
  const seedRef = useRef(0);
  const seedInitialized = useRef(false);
  
  // Initialize seed on mount (client-side only)
  useEffect(() => {
    if (!seedInitialized.current) {
      seedRef.current = Date.now();
      seedInitialized.current = true;
    }
  }, []);
  
  // Player state
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [activePokemonIndex, setActivePokemonIndex] = useState(0);
  
  // AI state
  const [aiTeam, setAiTeam] = useState<BattlePokemon[]>([]);
  const [aiActivePokemonIndex, setAiActivePokemonIndex] = useState(0);
  
  // Battle state
  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [animatingAttack, setAnimatingAttack] = useState(false);
  const [lastDamage, setLastDamage] = useState<{ target: 'player' | 'ai'; amount: number } | null>(null);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  
  // Battle Animations
  const { animations, addAnimation, removeAnimation } = useBattleAnimations();

  // Carregar time do jogador
  const fetchPlayerTeam = useCallback(async () => {
    try {
      // First check localStorage for team from /play page
      const savedTeam = localStorage.getItem('selectedTeam');
      if (savedTeam) {
        try {
          const parsed = JSON.parse(savedTeam);
          if (Array.isArray(parsed) && parsed.length === 3) {
            const team: BattlePokemon[] = parsed.map((p: Pokemon) => ({
              ...p,
              hp: p.hp || 100,
              attack: p.attack || 80,
              defense: p.defense || 70,
              speed: p.speed || 60,
              moves: p.moves || [],
              currentHp: p.hp || 100,
              cooldowns: {},
            }));
            setPlayerTeam(team);
            setGameState('ready');
            localStorage.removeItem('selectedTeam'); // Clear after use
            return;
          }
        } catch {
          console.log('Failed to parse saved team');
        }
      }

      // Fallback: fetch from profile API
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

      // Preparar time do jogador
      const team: BattlePokemon[] = profile.team.pokemon.map((tp: { pokemon: Pokemon }) => ({
        ...tp.pokemon,
        moves: tp.pokemon.moves || [], // Garantir que moves existe
        currentHp: tp.pokemon.hp,
        cooldowns: {},
      }));
      
      setPlayerTeam(team);
      setGameState('ready');
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    fetchPlayerTeam();
  }, [fetchPlayerTeam]);

  // Gerar time da AI
  const generateAITeam = useCallback(async () => {
    try {
      const res = await fetch('/api/pokemon?starters=true');
      const allPokemon = await res.json();
      
      // Selecionar 3 Pokémon aleatórios para a AI
      const shuffled = [...allPokemon].sort(() => Math.random() - 0.5);
      const aiPokemon = shuffled.slice(0, 3).map((p: Pokemon) => ({
        ...p,
        moves: p.moves || [], // Garantir que moves existe
        currentHp: p.hp,
        cooldowns: {},
      }));
      
      setAiTeam(aiPokemon);
    } catch (err) {
      console.error('Failed to generate AI team:', err);
    }
  }, []);

  // Iniciar batalha
  const startBattle = async () => {
    await generateAITeam();
    setGameState('battle');
    setTurn(1);
    setIsPlayerTurn(true);
    setBattleLog([]);
    setWinner(null);
    
    addLog({
      turn: 0,
      attacker: 'Sistema',
      move: '',
      damage: 0,
      message: `Batalha iniciada! Modo: ${difficulty.toUpperCase()}`,
    });
  };

  // Adicionar log
  const addLog = (log: BattleLog) => {
    setBattleLog(prev => [...prev, log]);
  };

  // Vantagem de tipo simplificada
  const getTypeAdvantage = useCallback((attackType: string, defenderType: string): number => {
    const advantages: Record<string, string[]> = {
      fire: ['grass', 'ice', 'bug', 'steel'],
      water: ['fire', 'ground', 'rock'],
      grass: ['water', 'ground', 'rock'],
      electric: ['water', 'flying'],
      psychic: ['fighting', 'poison'],
      ice: ['grass', 'ground', 'flying', 'dragon'],
      dragon: ['dragon'],
      dark: ['psychic', 'ghost'],
      fairy: ['fighting', 'dragon', 'dark'],
      fighting: ['normal', 'ice', 'rock', 'dark', 'steel'],
      poison: ['grass', 'fairy'],
      ground: ['fire', 'electric', 'poison', 'rock', 'steel'],
      flying: ['grass', 'fighting', 'bug'],
      bug: ['grass', 'psychic', 'dark'],
      rock: ['fire', 'ice', 'flying', 'bug'],
      ghost: ['psychic', 'ghost'],
      steel: ['ice', 'rock', 'fairy'],
    };

    if (advantages[attackType]?.includes(defenderType)) {
      return 1.5; // Super efetivo
    }
    
    // Verificar se é resistido
    const resistances: Record<string, string[]> = {
      fire: ['fire', 'water', 'rock', 'dragon'],
      water: ['water', 'grass', 'dragon'],
      grass: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
      electric: ['electric', 'grass', 'dragon'],
      normal: ['rock', 'steel'],
    };
    
    if (resistances[attackType]?.includes(defenderType)) {
      return 0.5; // Não muito efetivo
    }
    
    return 1;
  }, []);

  // Calcular dano
  const calculateDamage = useCallback((attacker: BattlePokemon, defender: BattlePokemon, move: Move, seed: number): number => {
    const baseDamage = move.power;
    const attackStat = attacker.attack;
    const defenseStat = defender.defense;
    
    // Fórmula de dano com seed determinístico
    const seededRandom = ((seed * 9301 + 49297) % 233280) / 233280;
    const randomFactor = 0.85 + seededRandom * 0.15;
    let damage = Math.floor((baseDamage * (attackStat / defenseStat)) * randomFactor);
    
    // Bonus de tipo
    const typeAdvantageValue = getTypeAdvantage(move.type, defender.type);
    damage = Math.floor(damage * typeAdvantageValue);
    
    return Math.max(1, damage);
  }, [getTypeAdvantage]);

  // Executar movimento do jogador
  const executePlayerMove = (move: Move) => {
    if (!isPlayerTurn || animatingAttack || gameState !== 'battle') return;
    
    const attacker = playerTeam[activePokemonIndex];
    const defender = aiTeam[aiActivePokemonIndex];
    
    // Verificar cooldown
    if (attacker.cooldowns[move.id] && attacker.cooldowns[move.id] > 0) {
      return;
    }
    
    setAnimatingAttack(true);
    
    // Incrementar seed e calcular dano
    seedRef.current += 1;
    const damage = calculateDamage(attacker, defender, move, seedRef.current);
    
    setTimeout(() => {
      // Atualizar HP da AI
      const newAiTeam = [...aiTeam];
      newAiTeam[aiActivePokemonIndex] = {
        ...newAiTeam[aiActivePokemonIndex],
        currentHp: Math.max(0, newAiTeam[aiActivePokemonIndex].currentHp - damage),
      };
      setAiTeam(newAiTeam);
      
      // Disparar animação de dano
      addAnimation({
        type: damage > 25 ? 'critical' : 'damage',
        targetId: 'ai-pokemon',
        value: damage,
        duration: 1000,
      });
      
      // Atualizar cooldown
      const newPlayerTeam = [...playerTeam];
      newPlayerTeam[activePokemonIndex] = {
        ...newPlayerTeam[activePokemonIndex],
        cooldowns: {
          ...newPlayerTeam[activePokemonIndex].cooldowns,
          [move.id]: move.cooldown,
        },
      };
      setPlayerTeam(newPlayerTeam);
      
      setLastDamage({ target: 'ai', amount: damage });
      
      addLog({
        turn,
        attacker: attacker.name,
        move: move.name,
        damage,
        message: `${attacker.name} usou ${move.name} e causou ${damage} de dano!`,
      });
      
      // Verificar se o Pokémon da AI foi derrotado
      if (newAiTeam[aiActivePokemonIndex].currentHp <= 0) {
        // Animação de morte
        addAnimation({
          type: 'death',
          targetId: 'ai-pokemon',
          text: newAiTeam[aiActivePokemonIndex].name,
          duration: 1500,
        });
        
        addLog({
          turn,
          attacker: '',
          move: '',
          damage: 0,
          message: `${defender.name} foi derrotado!`,
        });
        
        // Procurar próximo Pokémon vivo da AI
        const nextAlive = newAiTeam.findIndex((p, i) => i !== aiActivePokemonIndex && p.currentHp > 0);
        
        if (nextAlive === -1) {
          // Jogador venceu!
          endBattle('player');
        } else {
          setAiActivePokemonIndex(nextAlive);
          addLog({
            turn,
            attacker: 'AI',
            move: '',
            damage: 0,
            message: `AI enviou ${newAiTeam[nextAlive].name}!`,
          });
        }
      }
      
      setTimeout(() => {
        setLastDamage(null);
        setAnimatingAttack(false);
        
        if (winner === null) {
          setIsPlayerTurn(false);
          // Turno da AI
          setTimeout(() => executeAITurn(), 1000);
        }
      }, 500);
    }, 300);
  };

  // Turno da AI
  const executeAITurn = () => {
    if (gameState !== 'battle' || winner !== null) return;
    
    const aiPokemon = aiTeam[aiActivePokemonIndex];
    const playerPokemon = playerTeam[activePokemonIndex];
    
    if (!aiPokemon || aiPokemon.currentHp <= 0) return;
    
    // Incrementar seed para randomização
    seedRef.current += 1;
    const randomSeed = seedRef.current % 100;
    
    // Selecionar movimento baseado na dificuldade
    let selectedMove: Move;
    
    if (difficulty === 'easy') {
      // Easy: movimento aleatório
      const availableMoves = aiPokemon.moves.filter(m => 
        !aiPokemon.cooldowns[m.id] || aiPokemon.cooldowns[m.id] <= 0
      );
      selectedMove = availableMoves[randomSeed % availableMoves.length] || aiPokemon.moves[0];
    } else if (difficulty === 'hard') {
      // Hard: melhor movimento
      const availableMoves = aiPokemon.moves.filter(m => 
        !aiPokemon.cooldowns[m.id] || aiPokemon.cooldowns[m.id] <= 0
      );
      seedRef.current += 1;
      selectedMove = availableMoves.sort((a, b) => {
        const damageA = calculateDamage(aiPokemon, playerPokemon, a, seedRef.current);
        const damageB = calculateDamage(aiPokemon, playerPokemon, b, seedRef.current + 1);
        return damageB - damageA;
      })[0] || aiPokemon.moves[0];
    } else {
      // Normal: 70% melhor, 30% aleatório
      const availableMoves = aiPokemon.moves.filter(m => 
        !aiPokemon.cooldowns[m.id] || aiPokemon.cooldowns[m.id] <= 0
      );
      if (randomSeed < 70) {
        seedRef.current += 1;
        selectedMove = availableMoves.sort((a, b) => {
          const damageA = calculateDamage(aiPokemon, playerPokemon, a, seedRef.current);
          const damageB = calculateDamage(aiPokemon, playerPokemon, b, seedRef.current + 1);
          return damageB - damageA;
        })[0] || aiPokemon.moves[0];
      } else {
        selectedMove = availableMoves[randomSeed % availableMoves.length] || aiPokemon.moves[0];
      }
    }
    
    if (!selectedMove) return;
    
    setAnimatingAttack(true);
    
    seedRef.current += 1;
    const damage = calculateDamage(aiPokemon, playerPokemon, selectedMove, seedRef.current);
    
    setTimeout(() => {
      // Atualizar HP do jogador
      const newPlayerTeam = [...playerTeam];
      newPlayerTeam[activePokemonIndex] = {
        ...newPlayerTeam[activePokemonIndex],
        currentHp: Math.max(0, newPlayerTeam[activePokemonIndex].currentHp - damage),
      };
      
      // Disparar animação de dano no jogador
      addAnimation({
        type: damage > 25 ? 'critical' : 'damage',
        targetId: 'player-pokemon',
        value: damage,
        duration: 1000,
      });
      
      // Atualizar cooldown da AI
      const newAiTeam = [...aiTeam];
      newAiTeam[aiActivePokemonIndex] = {
        ...newAiTeam[aiActivePokemonIndex],
        cooldowns: {
          ...newAiTeam[aiActivePokemonIndex].cooldowns,
          [selectedMove.id]: selectedMove.cooldown,
        },
      };
      setAiTeam(newAiTeam);
      setPlayerTeam(newPlayerTeam);
      
      setLastDamage({ target: 'player', amount: damage });
      
      addLog({
        turn,
        attacker: aiPokemon.name,
        move: selectedMove.name,
        damage,
        message: `${aiPokemon.name} usou ${selectedMove.name} e causou ${damage} de dano!`,
      });
      
      // Verificar se o Pokémon do jogador foi derrotado
      if (newPlayerTeam[activePokemonIndex].currentHp <= 0) {
        // Animação de morte
        addAnimation({
          type: 'death',
          targetId: 'player-pokemon',
          text: playerPokemon.name,
          duration: 1500,
        });
        
        addLog({
          turn,
          attacker: '',
          move: '',
          damage: 0,
          message: `${playerPokemon.name} foi derrotado!`,
        });
        
        // Procurar próximo Pokémon vivo do jogador
        const nextAlive = newPlayerTeam.findIndex((p, i) => i !== activePokemonIndex && p.currentHp > 0);
        
        if (nextAlive === -1) {
          // AI venceu!
          endBattle('ai');
        } else {
          setActivePokemonIndex(nextAlive);
          addLog({
            turn,
            attacker: 'Você',
            move: '',
            damage: 0,
            message: `Você enviou ${newPlayerTeam[nextAlive].name}!`,
          });
        }
      }
      
      setTimeout(() => {
        setLastDamage(null);
        setAnimatingAttack(false);
        
        if (winner === null) {
          // Reduzir cooldowns
          reduceCooldowns();
          setTurn(t => t + 1);
          setIsPlayerTurn(true);
        }
      }, 500);
    }, 300);
  };

  // Reduzir cooldowns
  const reduceCooldowns = () => {
    setPlayerTeam(team => team.map(p => ({
      ...p,
      cooldowns: Object.fromEntries(
        Object.entries(p.cooldowns).map(([id, cd]) => [id, Math.max(0, (cd as number) - 1)])
      ),
    })));
    
    setAiTeam(team => team.map(p => ({
      ...p,
      cooldowns: Object.fromEntries(
        Object.entries(p.cooldowns).map(([id, cd]) => [id, Math.max(0, (cd as number) - 1)])
      ),
    })));
  };

  // Finalizar batalha
  const endBattle = async (result: 'player' | 'ai') => {
    setWinner(result);
    setGameState('finished');
    
    // Salvar resultado no servidor
    try {
      await fetch('/api/battle/ai/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          won: result === 'player',
          difficulty,
        }),
      });
    } catch (err) {
      console.error('Failed to save battle result:', err);
    }
  };

  // Trocar Pokémon
  const switchPokemon = (index: number) => {
    if (!isPlayerTurn || animatingAttack || gameState !== 'battle') return;
    if (playerTeam[index].currentHp <= 0) return;
    if (index === activePokemonIndex) return;
    
    setActivePokemonIndex(index);
    addLog({
      turn,
      attacker: 'Você',
      move: '',
      damage: 0,
      message: `Você trocou para ${playerTeam[index].name}!`,
    });
    
    setIsPlayerTurn(false);
    setTimeout(() => executeAITurn(), 1000);
  };

  // Render loading
  if (gameState === 'loading') {
    return (
      <div className="ai-battle-page">
        <div className="loading-container">
          <div className="pokeball-loader large" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Render seleção de dificuldade
  if (gameState === 'ready') {
    return (
      <div className="ai-battle-page">
        <div className="difficulty-select">
          <h1>🎮 Batalha contra AI</h1>
          
          <div className="team-preview">
            <h3>Seu Time</h3>
            <div className="team-pokemon-list">
              {playerTeam.map((pokemon) => (
                <div key={pokemon.id} className="preview-pokemon">
                  <PokemonSprite
                    name={pokemon.name}
                    pokemonId={pokemon.id}
                    size="medium"
                    spriteType="artwork"
                  />
                  <span>{pokemon.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="difficulty-options">
            <h3>Selecione a Dificuldade</h3>
            <div className="difficulty-buttons">
              <button 
                className={`difficulty-btn easy ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                <span className="diff-icon">😊</span>
                <span className="diff-name">Fácil</span>
                <span className="diff-desc">AI faz escolhas aleatórias</span>
              </button>
              <button 
                className={`difficulty-btn normal ${difficulty === 'normal' ? 'active' : ''}`}
                onClick={() => setDifficulty('normal')}
              >
                <span className="diff-icon">🤔</span>
                <span className="diff-name">Normal</span>
                <span className="diff-desc">AI joga de forma equilibrada</span>
              </button>
              <button 
                className={`difficulty-btn hard ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                <span className="diff-icon">😈</span>
                <span className="diff-name">Difícil</span>
                <span className="diff-desc">AI joga otimizando cada turno</span>
              </button>
            </div>
          </div>
          
          <div className="start-actions">
            <button className="btn btn-primary btn-large" onClick={startBattle}>
              ⚔️ Iniciar Batalha
            </button>
            <Link href="/play" className="btn btn-secondary">
              Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render batalha ou resultado
  const activePokemon = playerTeam[activePokemonIndex];
  const aiActivePokemon = aiTeam[aiActivePokemonIndex];

  return (
    <div className="ai-battle-page">
      <div className="battle-container">
        {/* Header da batalha */}
        <div className="battle-header">
          <span className="turn-indicator">Turno {turn}</span>
          <span className={`turn-status ${isPlayerTurn ? 'your-turn' : 'enemy-turn'}`}>
            {isPlayerTurn ? '🎯 Seu turno!' : '⏳ Turno do oponente...'}
          </span>
          <span className="difficulty-badge">{difficulty.toUpperCase()}</span>
        </div>

        {/* Arena de batalha */}
        <div className="battle-arena">
          {/* Overlay de Animações */}
          <BattleAnimationManager 
            animations={animations} 
            onAnimationComplete={removeAnimation}
          />
          
          {/* Transição de Turno */}
          {showTurnTransition && (
            <TurnTransition 
              turn={turn} 
              onComplete={() => setShowTurnTransition(false)}
            />
          )}
          
          {/* Lado do Jogador */}
          <div id="player-pokemon" className={`battle-side player ${lastDamage?.target === 'player' ? 'pokemon-damaged' : ''}`}>
            <div className="pokemon-display">
              <PokemonSprite
                name={activePokemon?.name || ''}
                pokemonId={activePokemon?.id}
                size="xlarge"
                spriteType="artwork"
                className={animatingAttack && isPlayerTurn ? 'pokemon-attacking' : ''}
              />
              {lastDamage?.target === 'player' && (
                <div className="damage-number">-{lastDamage.amount}</div>
              )}
            </div>
            
            <div className="pokemon-info">
              <h3>{activePokemon?.name}</h3>
              <div className="hp-bar-container">
                <div className="hp-bar">
                  <div 
                    className="hp-fill"
                    style={{ 
                      width: `${(activePokemon?.currentHp / activePokemon?.hp) * 100}%`,
                      backgroundColor: (activePokemon?.currentHp / activePokemon?.hp) > 0.5 
                        ? '#4CAF50' 
                        : (activePokemon?.currentHp / activePokemon?.hp) > 0.25 
                          ? '#FFC107' 
                          : '#F44336'
                    }}
                  />
                </div>
                <span className="hp-text">
                  {activePokemon?.currentHp} / {activePokemon?.hp}
                </span>
              </div>
            </div>

            {/* Mini team display */}
            <div className="mini-team">
              {playerTeam.map((p, i) => (
                <div 
                  key={p.id}
                  className={`mini-pokemon ${i === activePokemonIndex ? 'active' : ''} ${p.currentHp <= 0 ? 'fainted' : ''}`}
                  onClick={() => switchPokemon(i)}
                >
                  <PokemonSprite
                    name={p.name}
                    pokemonId={p.id}
                    size="small"
                    className={p.currentHp <= 0 ? 'grayscale' : ''}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* VS */}
          <div className="vs-divider">
            <span>VS</span>
          </div>

          {/* Lado da AI */}
          <div id="ai-pokemon" className={`battle-side ai ${lastDamage?.target === 'ai' ? 'pokemon-damaged' : ''}`}>
            <div className="pokemon-display">
              <PokemonSprite
                name={aiActivePokemon?.name || ''}
                pokemonId={aiActivePokemon?.id}
                size="xlarge"
                spriteType="artwork"
                className={animatingAttack && !isPlayerTurn ? 'pokemon-attacking' : ''}
              />
              {lastDamage?.target === 'ai' && (
                <div className="damage-number">-{lastDamage.amount}</div>
              )}
            </div>
            
            <div className="pokemon-info">
              <h3>{aiActivePokemon?.name} <span className="ai-tag">AI</span></h3>
              <div className="hp-bar-container">
                <div className="hp-bar">
                  <div 
                    className="hp-fill"
                    style={{ 
                      width: `${(aiActivePokemon?.currentHp / aiActivePokemon?.hp) * 100}%`,
                      backgroundColor: (aiActivePokemon?.currentHp / aiActivePokemon?.hp) > 0.5 
                        ? '#4CAF50' 
                        : (aiActivePokemon?.currentHp / aiActivePokemon?.hp) > 0.25 
                          ? '#FFC107' 
                          : '#F44336'
                    }}
                  />
                </div>
                <span className="hp-text">
                  {aiActivePokemon?.currentHp} / {aiActivePokemon?.hp}
                </span>
              </div>
            </div>

            {/* Mini AI team display */}
            <div className="mini-team">
              {aiTeam.map((p, i) => (
                <div 
                  key={p.id}
                  className={`mini-pokemon ${i === aiActivePokemonIndex ? 'active' : ''} ${p.currentHp <= 0 ? 'fainted' : ''}`}
                >
                  <PokemonSprite
                    name={p.name}
                    pokemonId={p.id}
                    size="small"
                    className={p.currentHp <= 0 ? 'grayscale' : ''}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controles de batalha */}
        {gameState === 'battle' && !winner && (
          <div className="battle-controls">
            <h4>Escolha um ataque:</h4>
            <div className="move-buttons">
              {(!activePokemon?.moves || activePokemon.moves.length === 0) ? (
                <div className="no-moves-warning">
                  <p>⚠️ Este Pokémon não tem movimentos configurados.</p>
                  <p>Por favor, selecione outro time.</p>
                </div>
              ) : (
                activePokemon.moves.map((move) => {
                  const cooldownValue = activePokemon.cooldowns[move.id] || 0;
                  const isOnCooldown = cooldownValue > 0;
                  const typeColor = getTypeColor(move.type || 'normal');
                  
                  return (
                    <button
                      key={move.id}
                      className={`move-button ${move.type || 'normal'}`}
                      onClick={() => executePlayerMove(move)}
                      disabled={!isPlayerTurn || animatingAttack || isOnCooldown}
                      style={{ 
                        opacity: isOnCooldown ? 0.5 : 1,
                        borderColor: typeColor.border,
                      }}
                    >
                      <span className="move-name">{move.name}</span>
                      <span className="move-info">
                        <span className="move-power">PWR: {move.power || 0}</span>
                        {isOnCooldown && (
                          <span className="move-cooldown">CD: {activePokemon.cooldowns[move.id]}</span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Resultado da batalha */}
        {gameState === 'finished' && winner && (
          <div className="battle-result">
            <div className={`result-card ${winner === 'player' ? 'victory' : 'defeat'}`}>
              <h2>{winner === 'player' ? '🏆 Vitória!' : '💔 Derrota'}</h2>
              <p>
                {winner === 'player' 
                  ? 'Parabéns! Você derrotou a AI!' 
                  : 'Não desista! Tente novamente!'}
              </p>
              <div className="result-actions">
                <button className="btn btn-primary" onClick={() => {
                  setGameState('ready');
                  setPlayerTeam(team => team.map(p => ({ ...p, currentHp: p.hp, cooldowns: {} })));
                  setBattleLog([]);
                  setWinner(null);
                  setTurn(1);
                }}>
                  Jogar Novamente
                </button>
                <Link href="/play" className="btn btn-secondary">
                  Voltar ao Menu
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Log de batalha */}
        <div className="battle-log">
          <h4>📜 Log da Batalha</h4>
          <div className="log-entries">
            {battleLog.slice(-5).map((log, i) => (
              <div key={i} className="log-entry">
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
