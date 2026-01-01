'use client';

import { BattlePokemon, PokemonType } from '@/types/game';

interface PokemonCardProps {
  pokemon: BattlePokemon;
  isSelected?: boolean;
  isTargetable?: boolean;
  isEnemy?: boolean;
  onClick?: () => void;
}

const typeColors: Record<PokemonType, string> = {
  Normal: '#A8A878',
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Grass: '#78C850',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Psychic: '#F85888',
  Bug: '#A8B820',
  Rock: '#B8A038',
  Ghost: '#705898',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Fairy: '#EE99AC',
};

const pokemonEmojis: Record<string, string> = {
  'Pikachu': '⚡',
  'Charizard': '🔥',
  'Blastoise': '💧',
  'Venusaur': '🌿',
  'Mewtwo': '🔮',
  'Dragonite': '🐉',
  'Gengar': '👻',
  'Alakazam': '🧠',
  'Machamp': '💪',
  'Gyarados': '🌊',
  'Eevee': '🦊',
  'Snorlax': '😴',
};

export function PokemonCard({ 
  pokemon, 
  isSelected = false, 
  isTargetable = false,
  isEnemy = false,
  onClick 
}: PokemonCardProps) {
  const healthPercent = (pokemon.currentHealth / pokemon.maxHealth) * 100;
  const isAlive = pokemon.currentHealth > 0;
  const primaryType = pokemon.types[0];
  const typeColor = typeColors[primaryType] || '#A8A878';
  
  const getHealthBarColor = () => {
    if (healthPercent > 50) return '#4CAF50';
    if (healthPercent > 25) return '#FFC107';
    return '#F44336';
  };

  return (
    <div
      onClick={isAlive && onClick ? onClick : undefined}
      style={{
        background: isAlive 
          ? `linear-gradient(180deg, ${typeColor}30 0%, rgba(0,0,0,0.6) 100%)`
          : 'linear-gradient(180deg, #333 0%, #111 100%)',
        border: `3px solid ${isSelected ? '#FFCB05' : isTargetable ? '#FF4444' : typeColor}`,
        borderRadius: '12px',
        padding: '12px',
        width: '140px',
        cursor: isAlive && onClick ? 'pointer' : 'default',
        opacity: isAlive ? 1 : 0.5,
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease',
        boxShadow: isSelected 
          ? '0 0 20px rgba(255,203,5,0.5)' 
          : isTargetable 
            ? '0 0 15px rgba(255,68,68,0.4)'
            : '0 4px 10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Pokemon Name */}
      <div style={{
        fontSize: '13px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: '8px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      }}>
        {pokemon.name}
      </div>

      {/* Pokemon Sprite/Emoji */}
      <div style={{
        fontSize: '40px',
        textAlign: 'center',
        marginBottom: '8px',
        filter: isAlive ? 'none' : 'grayscale(1)',
      }}>
        {pokemonEmojis[pokemon.name] || '❓'}
      </div>

      {/* Health Bar */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '4px',
        height: '12px',
        overflow: 'hidden',
        marginBottom: '4px',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        <div
          style={{
            width: `${healthPercent}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getHealthBarColor()} 0%, ${getHealthBarColor()}80 100%)`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* HP Text */}
      <div style={{
        fontSize: '10px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '6px',
      }}>
        {pokemon.currentHealth}/{pokemon.maxHealth} HP
      </div>

      {/* Type Badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '4px',
        flexWrap: 'wrap',
      }}>
        {pokemon.types.map((type) => (
          <span
            key={type}
            style={{
              background: typeColors[type],
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '8px',
              fontWeight: 'bold',
              color: 'white',
              textTransform: 'uppercase',
            }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Status Effects */}
      {pokemon.effects.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px',
          marginTop: '6px',
          justifyContent: 'center',
        }}>
          {pokemon.effects.slice(0, 3).map((effect, i) => (
            <span
              key={i}
              style={{
                background: effect.type === 'damage' ? '#F44336' 
                  : effect.type === 'stun' ? '#9C27B0'
                  : effect.type === 'invulnerable' ? '#2196F3'
                  : '#FF9800',
                padding: '1px 4px',
                borderRadius: '4px',
                fontSize: '7px',
                color: 'white',
              }}
            >
              {effect.name.slice(0, 8)}
            </span>
          ))}
        </div>
      )}

      {/* Enemy Indicator */}
      {isEnemy && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: '#F44336',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          border: '2px solid white',
        }}>
          ⚔️
        </div>
      )}
    </div>
  );
}
