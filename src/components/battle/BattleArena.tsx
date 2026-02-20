'use client';

import { BattleState, Action } from '@/types/game';
import { PokemonCard } from './PokemonCard';
import { MoveButton } from './MoveButton';
import { EnergyDisplay } from './EnergyDisplay';
import { useState } from 'react';

interface BattleArenaProps {
  battleState: BattleState;
  playerId: 'player1' | 'player2';
  onAction: (action: Action) => void;
  onEndTurn: () => void;
  isMyTurn: boolean;
}

export function BattleArena({
  battleState,
  playerId,
  onAction,
  onEndTurn,
  isMyTurn,
}: BattleArenaProps) {
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
  const [targetingMode, setTargetingMode] = useState(false);

  const myState = playerId === 'player1' ? battleState.player1 : battleState.player2;
  const enemyState = playerId === 'player1' ? battleState.player2 : battleState.player1;
  const myTeam = myState.team;
  const enemyTeam = enemyState.team;
  const myEnergy = myState.energy;
  const myActions: Action[] = [];

  const selectedPokemon = selectedPokemonIndex !== null ? myTeam[selectedPokemonIndex] : null;
  const selectedMove = selectedPokemon && selectedMoveIndex !== null 
    ? selectedPokemon.moves[selectedMoveIndex] 
    : null;

  const handlePokemonSelect = (index: number) => {
    if (!isMyTurn) return;
    
    if (targetingMode && selectedMove) {
      // If in targeting mode, this is selecting a target
      const target = myTeam[index];
      if (target.currentHealth > 0) {
        // Create action for ally target
        handleCreateAction([target.id]);
      }
    } else {
      // Select this Pokemon to see its moves
      setSelectedPokemonIndex(index);
      setSelectedMoveIndex(null);
      setTargetingMode(false);
    }
  };

  const handleEnemySelect = (index: number) => {
    if (!isMyTurn || !targetingMode || !selectedMove) return;
    
    const target = enemyTeam[index];
    if (target.currentHealth <= 0) return;

    if (selectedMove.target === 'AllEnemies') {
      const aliveEnemies = enemyTeam.filter(p => p.currentHealth > 0).map(p => p.id);
      handleCreateAction(aliveEnemies);
    } else {
      handleCreateAction([target.id]);
    }
  };

  const handleMoveSelect = (moveIndex: number) => {
    if (!isMyTurn || !selectedPokemon) return;
    
    const move = selectedPokemon.moves[moveIndex];
    const cooldown = selectedPokemon.cooldowns[moveIndex] || 0;
    
    if (cooldown > 0) return;
    
    setSelectedMoveIndex(moveIndex);

    // Check if move needs targeting
    if (move.target === 'Self') {
      handleCreateAction([selectedPokemon.id]);
    } else if (move.target === 'AllAllies') {
      const aliveAllies = myTeam.filter(p => p.currentHealth > 0).map(p => p.id);
      handleCreateAction(aliveAllies);
    } else if (move.target === 'AllEnemies') {
      const aliveEnemies = enemyTeam.filter(p => p.currentHealth > 0).map(p => p.id);
      handleCreateAction(aliveEnemies);
    } else if (move.target === 'AllCharacters') {
      const allAlive = [...myTeam, ...enemyTeam]
        .filter(p => p.currentHealth > 0)
        .map(p => p.id);
      handleCreateAction(allAlive);
    } else {
      // Need to select a target
      setTargetingMode(true);
    }
  };

  const handleCreateAction = (targetIds: string[]) => {
    if (!selectedPokemon || selectedMoveIndex === null) return;

    const action: Action = {
      pokemonId: selectedPokemon.id,
      moveIndex: selectedMoveIndex,
      targetIds,
    };

    onAction(action);
    
    // Reset selection state
    setSelectedPokemonIndex(null);
    setSelectedMoveIndex(null);
    setTargetingMode(false);
  };

  const cancelTargeting = () => {
    setTargetingMode(false);
    setSelectedMoveIndex(null);
  };

  // Check if Pokemon already has an action this turn
  const hasActionFor = (pokemonId: string) => {
    return myActions.some(a => a.pokemonId === pokemonId);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      borderRadius: '16px',
      border: '2px solid rgba(255,203,5,0.3)',
    }}>
      {/* Turn Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: isMyTurn 
          ? 'linear-gradient(90deg, #4CAF50 0%, #388E3C 100%)' 
          : 'linear-gradient(90deg, #F44336 0%, #D32F2F 100%)',
        borderRadius: '8px',
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
          Turn {battleState.turn}
        </span>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
          {isMyTurn ? 'YOUR TURN' : 'OPPONENT\'S TURN'}
        </span>
        <span style={{ color: 'white', fontSize: '12px' }}>
          Actions: {myActions.length}/3
        </span>
      </div>

      {/* Enemy Team */}
      <div style={{
        background: 'rgba(244,67,54,0.1)',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid rgba(244,67,54,0.3)',
      }}>
        <h3 style={{ 
          color: '#F44336', 
          margin: '0 0 10px 0',
          fontSize: '14px',
          textTransform: 'uppercase',
        }}>
          Opponent&apos;s Team
        </h3>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {enemyTeam.map((pokemon, index) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              isEnemy
              isTargetable={targetingMode && selectedMove?.target !== 'OneAlly' && selectedMove?.target !== 'AllAllies' && selectedMove?.target !== 'Self'}
              onClick={() => handleEnemySelect(index)}
            />
          ))}
        </div>
      </div>

      {/* My Energy */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
      }}>
        <div>
          <span style={{ 
            color: '#FFCB05', 
            fontSize: '12px', 
            marginRight: '15px',
            fontWeight: 'bold',
          }}>
            Your Energy:
          </span>
          <EnergyDisplay energy={myEnergy} size="md" />
        </div>
      </div>

      {/* My Team */}
      <div style={{
        background: 'rgba(76,175,80,0.1)',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid rgba(76,175,80,0.3)',
      }}>
        <h3 style={{ 
          color: '#4CAF50', 
          margin: '0 0 10px 0',
          fontSize: '14px',
          textTransform: 'uppercase',
        }}>
          Your Team
        </h3>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {myTeam.map((pokemon, index) => (
            <div key={pokemon.id} style={{ position: 'relative' }}>
              <PokemonCard
                pokemon={pokemon}
                isSelected={selectedPokemonIndex === index}
                isTargetable={targetingMode && (selectedMove?.target === 'OneAlly' || selectedMove?.target === 'AllAllies')}
                onClick={() => handlePokemonSelect(index)}
              />
              {hasActionFor(pokemon.id) && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#4CAF50',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  color: 'white',
                  fontWeight: 'bold',
                }}>
                  ✓ Ready
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Move Selection */}
      {selectedPokemon && !targetingMode && (
        <div style={{
          background: 'rgba(59,91,167,0.2)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid rgba(104,144,240,0.3)',
        }}>
          <h3 style={{ 
            color: '#6890F0', 
            margin: '0 0 10px 0',
            fontSize: '14px',
          }}>
            {selectedPokemon.name}&apos;s Moves
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}>
            {selectedPokemon.moves.map((move, index) => (
              <MoveButton
                key={index}
                move={move}
                energy={myEnergy}
                isOnCooldown={(selectedPokemon.cooldowns[index] || 0) > 0}
                cooldownRemaining={selectedPokemon.cooldowns[index] || 0}
                isSelected={selectedMoveIndex === index}
                onClick={() => handleMoveSelect(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Targeting Mode */}
      {targetingMode && selectedMove && (
        <div style={{
          background: 'rgba(255,193,7,0.2)',
          padding: '15px',
          borderRadius: '12px',
          border: '2px solid #FFC107',
          textAlign: 'center',
        }}>
          <p style={{ color: '#FFCB05', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            Select a target for {selectedMove.name}
          </p>
          <button
            onClick={cancelTargeting}
            style={{
              background: '#F44336',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* End Turn Button */}
      {isMyTurn && myActions.length > 0 && (
        <button
          onClick={onEndTurn}
          style={{
            background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
            color: 'white',
            border: '2px solid #8BC34A',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            alignSelf: 'center',
          }}
        >
          END TURN ({myActions.length} actions)
        </button>
      )}

      {/* Pending Actions */}
      {myActions.length > 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '10px',
          borderRadius: '8px',
        }}>
          <h4 style={{ color: '#888', margin: '0 0 8px 0', fontSize: '12px' }}>
            Queued Actions:
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {myActions.map((action, index) => {
              const pokemon = myTeam.find(p => p.id === action.pokemonId);
              const move = pokemon?.moves[action.moveIndex];
              return (
                <span
                  key={index}
                  style={{
                    background: 'rgba(76,175,80,0.3)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#4CAF50',
                  }}
                >
                  {pokemon?.name}: {move?.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
