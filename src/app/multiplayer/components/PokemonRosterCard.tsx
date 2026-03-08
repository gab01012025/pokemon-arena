'use client';

import { type RosterPokemon, getSpriteUrlStatic } from '../data';

interface PokemonRosterCardProps {
  pokemon: RosterPokemon;
  isSelected: boolean;
  onClick: () => void;
}

export default function PokemonRosterCard({ pokemon, isSelected, onClick }: PokemonRosterCardProps) {
  const isLocked = pokemon.isOwned === false;
  
  return (
    <div
      className={`pokemon-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
      onClick={isLocked ? undefined : onClick}
      title={isLocked ? `🔒 ${pokemon.unlockDescription || 'Locked'}` : pokemon.name}
      style={isLocked ? { opacity: 0.4, filter: 'grayscale(0.8)', cursor: 'not-allowed', position: 'relative' } : { position: 'relative' }}
    >
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '4px',
          padding: '1px 5px',
          fontSize: '10px',
          zIndex: 2,
        }}>
          🔒
        </div>
      )}
      <img
        src={getSpriteUrlStatic(pokemon.name)}
        alt={isLocked ? '???' : pokemon.name}
        style={isLocked ? { filter: 'brightness(0.2)' } : undefined}
      />
      <span className="pokemon-name">{isLocked ? '???' : pokemon.name}</span>
      <div className="pokemon-types">
        {!isLocked && pokemon.types.map((t) => (
          <span key={t} className={`type-badge ${t}`}>{t}</span>
        ))}
        {isLocked && (
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
            {pokemon.unlockDescription || 'Locked'}
          </span>
        )}
      </div>
    </div>
  );
}
