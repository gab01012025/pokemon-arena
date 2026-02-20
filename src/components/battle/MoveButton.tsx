'use client';

import { Move, EnergyPool, EnergyType, TargetType } from '@/types/game';
import { EnergyCost } from './EnergyDisplay';

interface MoveButtonProps {
  move: Move;
  energy: EnergyPool;
  isOnCooldown: boolean;
  cooldownRemaining: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const classIcons: Record<string, string> = {
  'Physical': 'PHY',
  'Special': 'SPC',
  'Status': 'STS',
  'Affliction': 'AFF',
  'Mental': 'MNT',
  'Ranged': 'RNG',
  'Instant': 'INS',
  'Unique': 'UNQ',
};

const targetLabels: Record<TargetType, string> = {
  Self: 'Self',
  OneEnemy: '1 Enemy',
  AllEnemies: 'All Enemies',
  OneAlly: '1 Ally',
  AllAllies: 'All Allies',
  AllCharacters: 'Everyone',
};

function canAffordMove(energy: EnergyPool, cost: Move['cost']): boolean {
  const totalAvailable = Object.values(energy).reduce((a, b) => a + b, 0);
  let totalNeeded = 0;
  let colorlessNeeded = 0;

  for (const [type, amount] of Object.entries(cost)) {
    if (!amount) continue;
    if (type === 'colorless') {
      colorlessNeeded = amount;
    } else {
      if (energy[type as EnergyType] < amount) {
        return false;
      }
      totalNeeded += amount;
    }
  }

  return totalAvailable >= totalNeeded + colorlessNeeded;
}

export function MoveButton({
  move,
  energy,
  isOnCooldown,
  cooldownRemaining,
  isSelected = false,
  onClick,
}: MoveButtonProps) {
  const affordable = canAffordMove(energy, move.cost);
  const isDisabled = isOnCooldown || !affordable;
  const primaryClass = move.classes[0];

  return (
    <button
      onClick={!isDisabled && onClick ? onClick : undefined}
      disabled={isDisabled}
      style={{
        background: isDisabled
          ? 'linear-gradient(180deg, #444 0%, #222 100%)'
          : isSelected
            ? 'linear-gradient(180deg, #FFCB05 0%, #B69E31 100%)'
            : 'linear-gradient(180deg, #3B5BA7 0%, #2A4073 100%)',
        border: `2px solid ${isSelected ? '#FFCB05' : isDisabled ? '#555' : '#6890F0'}`,
        borderRadius: '8px',
        padding: '10px 12px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Move Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 'bold',
          color: isSelected ? '#1D1D1D' : 'white',
        }}>
          {classIcons[primaryClass] || '⭐'} {move.name}
        </span>
        <EnergyCost cost={move.cost} canAfford={affordable} />
      </div>

      {/* Description */}
      <p style={{
        fontSize: '10px',
        color: isSelected ? '#333' : '#AAA',
        margin: '0 0 6px 0',
        lineHeight: 1.4,
      }}>
        {move.description}
      </p>

      {/* Move Info */}
      <div style={{
        display: 'flex',
        gap: '8px',
        fontSize: '9px',
        flexWrap: 'wrap',
      }}>
        {/* Target */}
        <span style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '2px 6px',
          borderRadius: '4px',
          color: isSelected ? '#444' : '#888',
        }}>
          Target: {targetLabels[move.target]}
        </span>

        {/* Damage */}
        {move.damage > 0 && (
          <span style={{
            background: 'rgba(244,67,54,0.3)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#F44336',
          }}>
            {move.damage} DMG
          </span>
        )}

        {/* Healing */}
        {move.healing > 0 && (
          <span style={{
            background: 'rgba(76,175,80,0.3)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#4CAF50',
          }}>
            💚 {move.healing} HEAL
          </span>
        )}

        {/* Cooldown */}
        {move.cooldown > 0 && (
          <span style={{
            background: 'rgba(156,39,176,0.3)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#9C27B0',
          }}>
            CD: {move.cooldown}
          </span>
        )}

        {/* Classes */}
        {move.classes.map((cls) => (
          <span
            key={cls}
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              color: isSelected ? '#555' : '#666',
            }}
          >
            {cls}
          </span>
        ))}
      </div>

      {/* Cooldown Overlay */}
      {isOnCooldown && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}>
          <span style={{
            color: '#F44336',
            fontWeight: 'bold',
            fontSize: '16px',
          }}>
            {cooldownRemaining} turns
          </span>
        </div>
      )}
    </button>
  );
}
