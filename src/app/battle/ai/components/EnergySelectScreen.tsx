'use client';

import Image from 'next/image';
import { EnergyType, BattlePokemon } from '../types';
import { ALL_SELECTABLE_ENERGY_TYPES, ENERGY_ICONS, ENERGY_NAMES, TYPE_TO_ENERGY } from '../data';

interface EnergySelectScreenProps {
  playerTeam: BattlePokemon[];
  selectedEnergyTypes: EnergyType[];
  toggleEnergyType: (type: EnergyType) => void;
  onConfirm: () => void;
}

/** Compute which selectable energy types the team needs (deduped, no colorless) */
function getTeamNeededEnergies(team: BattlePokemon[]): EnergyType[] {
  const set = new Set<EnergyType>();
  for (const p of team) {
    for (const t of p.types) {
      const mapped = TYPE_TO_ENERGY[t];
      if (mapped && mapped !== 'colorless') set.add(mapped);
    }
  }
  return Array.from(set);
}

export default function EnergySelectScreen({
  playerTeam,
  selectedEnergyTypes,
  toggleEnergyType,
  onConfirm,
}: EnergySelectScreenProps) {
  const neededEnergies = getTeamNeededEnergies(playerTeam);

  return (
    <div className="energy-select-screen">
      <div>
        <div className="energy-select-title">SELECT YOUR ENERGY TYPES</div>
        <div className="energy-select-subtitle">Choose exactly 4 energy types for your deck (you can pick duplicates)</div>
      </div>

      {/* Team overview with energy needs per pokemon */}
      <div className="energy-select-team">
        {playerTeam.map(p => {
          const pokemonEnergies = p.types
            .map(t => TYPE_TO_ENERGY[t])
            .filter((v, i, a) => a.indexOf(v) === i);
          return (
            <div key={p.id} className="energy-select-pokemon">
              <Image src={p.sprite} alt={p.name} width={64} height={64} unoptimized />
              <span>{p.name}</span>
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                {pokemonEnergies.map(e => (
                  <span
                    key={e}
                    title={ENERGY_NAMES[e]}
                    style={{
                      fontSize: 16,
                      filter: selectedEnergyTypes.includes(e) || e === 'colorless' ? 'none' : 'grayscale(1) opacity(0.5)',
                    }}
                  >
                    {ENERGY_ICONS[e]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended energies hint */}
      {neededEnergies.length > 0 && (
        <div className="energy-select-hint">
          Your team needs:&nbsp;
          {neededEnergies.map(e => (
            <span key={e} style={{ marginRight: 4 }} title={ENERGY_NAMES[e]}>
              {ENERGY_ICONS[e]} {ENERGY_NAMES[e]}
            </span>
          ))}
        </div>
      )}

      <div className="energy-select-grid">
        {ALL_SELECTABLE_ENERGY_TYPES.map(type => {
          const isNeeded = neededEnergies.includes(type);
          return (
            <div
              key={type}
              className={`energy-select-card ${type} ${selectedEnergyTypes.includes(type) ? 'selected' : ''} ${selectedEnergyTypes.length >= 4 && !selectedEnergyTypes.includes(type) ? 'disabled' : ''}`}
              onClick={() => toggleEnergyType(type)}
            >
              {selectedEnergyTypes.includes(type) && <span className="checkmark">✓</span>}
              {isNeeded && !selectedEnergyTypes.includes(type) && <span className="recommended-badge">★</span>}
              <div className={`energy-icon-big ${type}`}>{ENERGY_ICONS[type]}</div>
              <span className="energy-label">{ENERGY_NAMES[type]}</span>
            </div>
          );
        })}
      </div>
      <button
        className="energy-confirm-btn"
        onClick={onConfirm}
        disabled={selectedEnergyTypes.length !== 4}
      >
        {selectedEnergyTypes.length === 0
          ? 'SELECT 4 ENERGY TYPES'
          : selectedEnergyTypes.length < 4
          ? `SELECT ${4 - selectedEnergyTypes.length} MORE`
          : 'START BATTLE'}
      </button>
    </div>
  );
}
