'use client';

import React from 'react';

export type EnergyType = 'grass' | 'fire' | 'water' | 'lightning' | 'psychic' | 'fighting' | 'darkness' | 'metal' | 'colorless';

interface EnergyIconProps {
  type: EnergyType;
  size?: number;
  className?: string;
}

const ENERGY_SYMBOLS: Record<EnergyType, string> = {
  grass: '🌿',
  fire: '🔥',
  water: '💧',
  lightning: '⚡',
  psychic: '🔮',
  fighting: '👊',
  darkness: '🌑',
  metal: '⚙️',
  colorless: '⭐',
};

const ENERGY_COLORS: Record<EnergyType, string> = {
  grass: '#78C850',
  fire: '#F08030',
  water: '#6890F0',
  lightning: '#F8D030',
  psychic: '#F85888',
  fighting: '#C03028',
  darkness: '#705848',
  metal: '#B8B8D0',
  colorless: '#A8A878',
};

export function EnergyIcon({ type, size = 24, className = '' }: EnergyIconProps) {
  const color = ENERGY_COLORS[type];
  const symbol = ENERGY_SYMBOLS[type];

  return (
    <div
      className={`energy-icon ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.6,
        boxShadow: `0 0 ${size * 0.4}px ${color}40`,
        border: '2px solid rgba(255,255,255,0.3)',
      }}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      {symbol}
    </div>
  );
}

// SVG-based energy icons for better quality
export function EnergyIconSVG({ type, size = 24, className = '' }: EnergyIconProps) {
  const color = ENERGY_COLORS[type];

  const renderPath = () => {
    switch (type) {
      case 'grass':
        return (
          <path d="M12 2C12 2 8 6 8 10C8 14 10 16 12 16C14 16 16 14 16 10C16 6 12 2 12 2ZM12 16C12 16 10 18 10 20C10 22 11 23 12 23C13 23 14 22 14 20C14 18 12 16 12 16Z" fill="currentColor" />
        );
      case 'fire':
        return (
          <path d="M12 2C10 6 9 9 9 12C9 15.31 10.69 18 13 18C15.31 18 17 15.31 17 12C17 10 16 8 15 6C14.5 7 14 8 13 8C13 6 12 4 12 2Z" fill="currentColor" />
        );
      case 'water':
        return (
          <path d="M12 2C10 4 8 7 8 10C8 13.31 9.69 16 12 16C14.31 16 16 13.31 16 10C16 7 14 4 12 2Z" fill="currentColor" />
        );
      case 'lightning':
        return (
          <path d="M13 2L3 14H11L10 22L20 10H12L13 2Z" fill="currentColor" />
        );
      case 'psychic':
        return (
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18C9.79 18 8 16.21 8 14C8 11.79 9.79 10 12 10C14.21 10 16 11.79 16 14C16 16.21 14.21 18 12 18Z" fill="currentColor" />
        );
      case 'fighting':
        return (
          <path d="M12 2L8 6L10 8L8 10L10 12L8 14L12 18L16 14L14 12L16 10L14 8L16 6L12 2Z" fill="currentColor" />
        );
      case 'darkness':
        return (
          <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 12.9 16.5 12.9C13.46 12.9 11 10.44 11 7.4C11 5.58 11.89 3.98 13.26 3C12.85 3 12.43 3 12 3Z" fill="currentColor" />
        );
      case 'metal':
        return (
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.18L19.5 8L12 11.82L4.5 8L12 4.18ZM4 10.18L11 13.82V19.82L4 16.18V10.18ZM13 19.82V13.82L20 10.18V16.18L13 19.82Z" fill="currentColor" />
        );
      case 'colorless':
        return (
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`energy-icon-svg ${className}`}
      style={{ color }}
    >
      {renderPath()}
    </svg>
  );
}
