'use client';

import { type RosterPokemon, getSpriteUrlStatic } from '../data';

interface TeamSlotProps {
  pokemon: RosterPokemon | null;
  onRemove?: () => void;
}

export default function TeamSlot({ pokemon, onRemove }: TeamSlotProps) {
  if (!pokemon) {
    return (
      <div className="team-slot">
        <span className="empty">Empty</span>
      </div>
    );
  }

  return (
    <div className="team-slot filled" onClick={onRemove} title="Click to remove">
      <img src={getSpriteUrlStatic(pokemon.name)} alt={pokemon.name} />
      <span>{pokemon.name}</span>
    </div>
  );
}
