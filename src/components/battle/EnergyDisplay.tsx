'use client';

import { EnergyPool, EnergyType } from '@/types/game';

interface EnergyDisplayProps {
  energy: EnergyPool;
  size?: 'sm' | 'md' | 'lg';
}

const energyEmoji: Record<EnergyType, string> = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  colorless: '⭐',
};

const energyColors: Record<EnergyType, string> = {
  fire: 'var(--type-fire)',
  water: 'var(--type-water)',
  grass: 'var(--type-grass)',
  electric: 'var(--type-electric)',
  colorless: '#A8A878',
};

export function EnergyDisplay({ energy, size = 'md' }: EnergyDisplayProps) {
  const sizes = {
    sm: { icon: '16px', badge: '20px' },
    md: { icon: '24px', badge: '28px' },
    lg: { icon: '32px', badge: '36px' },
  };

  const currentSize = sizes[size];

  return (
    <div className="energy-display" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {(Object.keys(energy) as EnergyType[]).map((type) => (
        <div
          key={type}
          className="energy-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: `linear-gradient(180deg, ${energyColors[type]}40 0%, ${energyColors[type]}20 100%)`,
            border: `2px solid ${energyColors[type]}`,
            borderRadius: '8px',
          }}
        >
          <span style={{ fontSize: currentSize.icon }}>{energyEmoji[type]}</span>
          <span
            style={{
              fontSize: currentSize.badge,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {energy[type]}
          </span>
        </div>
      ))}
    </div>
  );
}

interface EnergyCostProps {
  cost: Partial<Record<EnergyType, number>>;
  canAfford?: boolean;
}

export function EnergyCost({ cost, canAfford = true }: EnergyCostProps) {
  const entries = Object.entries(cost).filter(([, value]) => value && value > 0);
  
  if (entries.length === 0) {
    return <span style={{ color: '#888', fontSize: '12px' }}>Free</span>;
  }

  return (
    <div style={{ display: 'flex', gap: '2px', opacity: canAfford ? 1 : 0.5 }}>
      {entries.map(([type, amount]) => (
        <div key={type} style={{ display: 'flex', alignItems: 'center' }}>
          {Array.from({ length: amount! }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: '14px',
                filter: canAfford ? 'none' : 'grayscale(1)',
              }}
            >
              {energyEmoji[type as EnergyType]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
