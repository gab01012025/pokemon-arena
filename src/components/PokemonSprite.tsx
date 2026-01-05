'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getPokemonImageUrl, getTypeColor, SpriteType } from '@/lib/pokemon-images';

interface PokemonSpriteProps {
  name: string;
  pokemonId?: string | number;
  spriteType?: SpriteType;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showType?: boolean;
  type?: string;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  small: 48,
  medium: 96,
  large: 150,
  xlarge: 250,
};

export function PokemonSprite({
  name,
  pokemonId,
  spriteType = 'default',
  size = 'medium',
  showType = false,
  type,
  className = '',
  animated = false,
  onClick,
}: PokemonSpriteProps) {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const finalSpriteType = animated ? 'animated' : spriteType;
  const imageUrl = getPokemonImageUrl(pokemonId || name, finalSpriteType);
  const fallbackUrl = getPokemonImageUrl(pokemonId || name, 'default');
  
  const pixelSize = sizeMap[size];
  const typeColor = type ? getTypeColor(type) : null;
  
  return (
    <div
      className={`pokemon-sprite-container ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{
        width: pixelSize,
        height: pixelSize,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {!isLoaded && (
        <div className="pokemon-sprite-loading">
          <div className="pokeball-loader" />
        </div>
      )}
      
      <Image
        src={imgError ? fallbackUrl : imageUrl}
        alt={name}
        width={pixelSize}
        height={pixelSize}
        className={`pokemon-sprite ${isLoaded ? 'loaded' : 'loading'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!imgError) setImgError(true);
        }}
        unoptimized={finalSpriteType === 'animated'}
        priority={size === 'xlarge'}
        style={{
          imageRendering: size === 'small' ? 'pixelated' : 'auto',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
      
      {showType && typeColor && (
        <span
          className="pokemon-type-badge"
          style={{
            backgroundColor: typeColor.bg,
            color: typeColor.text,
            borderColor: typeColor.border,
          }}
        >
          {type}
        </span>
      )}
    </div>
  );
}

// Componente para Card de Pokémon completo
interface PokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    type: string;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    isStarter?: boolean;
    isLegendary?: boolean;
  };
  selected?: boolean;
  disabled?: boolean;
  showStats?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export function PokemonCard({
  pokemon,
  selected = false,
  disabled = false,
  showStats = true,
  size = 'medium',
  onClick,
}: PokemonCardProps) {
  const typeColor = getTypeColor(pokemon.type);
  
  return (
    <div
      className={`pokemon-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{
        borderColor: selected ? '#FFD700' : typeColor.border,
        '--type-color': typeColor.bg,
        '--type-text': typeColor.text,
      } as React.CSSProperties}
    >
      <div className="pokemon-card-header" style={{ backgroundColor: typeColor.bg }}>
        <span className="pokemon-name">{pokemon.name}</span>
        {pokemon.isLegendary && <span className="legendary-badge">★</span>}
      </div>
      
      <div className="pokemon-card-image">
        <PokemonSprite
          name={pokemon.name}
          pokemonId={pokemon.id}
          spriteType="artwork"
          size={size}
          animated={false}
        />
      </div>
      
      <div className="pokemon-card-type">
        <span
          className="type-pill"
          style={{
            backgroundColor: typeColor.bg,
            color: typeColor.text,
          }}
        >
          {pokemon.type}
        </span>
      </div>
      
      {showStats && (
        <div className="pokemon-card-stats">
          <div className="stat">
            <span className="stat-label">HP</span>
            <div className="stat-bar">
              <div 
                className="stat-fill hp" 
                style={{ width: `${Math.min(100, (pokemon.hp / 200) * 100)}%` }}
              />
            </div>
            <span className="stat-value">{pokemon.hp}</span>
          </div>
          <div className="stat">
            <span className="stat-label">ATK</span>
            <div className="stat-bar">
              <div 
                className="stat-fill atk" 
                style={{ width: `${Math.min(100, (pokemon.attack / 150) * 100)}%` }}
              />
            </div>
            <span className="stat-value">{pokemon.attack}</span>
          </div>
          <div className="stat">
            <span className="stat-label">DEF</span>
            <div className="stat-bar">
              <div 
                className="stat-fill def" 
                style={{ width: `${Math.min(100, (pokemon.defense / 150) * 100)}%` }}
              />
            </div>
            <span className="stat-value">{pokemon.defense}</span>
          </div>
          <div className="stat">
            <span className="stat-label">SPD</span>
            <div className="stat-bar">
              <div 
                className="stat-fill spd" 
                style={{ width: `${Math.min(100, (pokemon.speed / 150) * 100)}%` }}
              />
            </div>
            <span className="stat-value">{pokemon.speed}</span>
          </div>
        </div>
      )}
      
      {selected && (
        <div className="selected-indicator">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// Componente para exibir time de 3 Pokémon
interface TeamDisplayProps {
  team: Array<{
    id: number;
    name: string;
    type: string;
    hp: number;
    currentHp?: number;
  }>;
  showHp?: boolean;
  size?: 'small' | 'medium';
  onPokemonClick?: (index: number) => void;
  activePokemon?: number;
}

export function TeamDisplay({
  team,
  showHp = false,
  size = 'medium',
  onPokemonClick,
  activePokemon,
}: TeamDisplayProps) {
  return (
    <div className="team-display">
      {team.map((pokemon, index) => {
        const typeColor = getTypeColor(pokemon.type);
        const hpPercent = showHp && pokemon.currentHp !== undefined 
          ? (pokemon.currentHp / pokemon.hp) * 100 
          : 100;
        const isDead = hpPercent <= 0;
        
        return (
          <div
            key={pokemon.id}
            className={`team-pokemon ${isDead ? 'dead' : ''} ${activePokemon === index ? 'active' : ''}`}
            onClick={() => onPokemonClick?.(index)}
            style={{
              borderColor: typeColor.border,
              cursor: onPokemonClick ? 'pointer' : 'default',
            }}
          >
            <PokemonSprite
              name={pokemon.name}
              pokemonId={pokemon.id}
              size={size}
              spriteType={isDead ? 'default' : 'default'}
              className={isDead ? 'grayscale' : ''}
            />
            
            {showHp && (
              <div className="mini-hp-bar">
                <div 
                  className="mini-hp-fill"
                  style={{
                    width: `${hpPercent}%`,
                    backgroundColor: hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FFC107' : '#F44336',
                  }}
                />
              </div>
            )}
            
            <span className="team-pokemon-name">{pokemon.name}</span>
          </div>
        );
      })}
    </div>
  );
}
