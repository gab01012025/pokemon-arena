'use client';

import Image from 'next/image';
import { EnergyType, BattlePokemon } from '../types';
import { ALL_SELECTABLE_ENERGY_TYPES, ENERGY_NAMES, TYPE_TO_ENERGY } from '../data';
import EnergyIcon from './EnergyIcon';

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
      <div className="energy-select-header">
        <div className="energy-select-title">SELECT YOUR ENERGY TYPES</div>
        <div className="energy-select-subtitle">Choose exactly 4 energy types for your deck</div>
      </div>

      {/* Team overview with energy needs per pokemon */}
      <div className="energy-select-team">
        {playerTeam.map(p => {
          const pokemonEnergies = p.types
            .map(t => TYPE_TO_ENERGY[t])
            .filter((v, i, a) => a.indexOf(v) === i);
          return (
            <div key={p.id} className="energy-select-pokemon">
              <Image src={p.sprite} alt={p.name} width={56} height={56} unoptimized />
              <span>{p.name}</span>
              <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                {pokemonEnergies.map(e => (
                  <span
                    key={e}
                    title={ENERGY_NAMES[e]}
                    style={{
                      display: 'inline-flex',
                      filter: selectedEnergyTypes.includes(e) || e === 'colorless' ? 'none' : 'grayscale(1) opacity(0.5)',
                    }}
                  >
                    <EnergyIcon type={e} size={16} />
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
            <span key={e} style={{ marginRight: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }} title={ENERGY_NAMES[e]}>
              <EnergyIcon type={e} size={16} /> {ENERGY_NAMES[e]}
            </span>
          ))}
        </div>
      )}

      {/* TCG Energy Card Grid */}
      <div className="energy-tcg-grid">
        {ALL_SELECTABLE_ENERGY_TYPES.map(type => {
          const isSelected = selectedEnergyTypes.includes(type);
          const isNeeded = neededEnergies.includes(type);
          const isDisabled = selectedEnergyTypes.length >= 4 && !isSelected;
          return (
            <div
              key={type}
              className={`energy-tcg-card ${type} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => toggleEnergyType(type)}
            >
              <div className="energy-tcg-card-inner">
                {isSelected && <span className="energy-tcg-check">&#10003;</span>}
                {isNeeded && !isSelected && <span className="energy-tcg-rec">REC</span>}
                <div className="energy-tcg-symbol">
                  <EnergyIcon type={type} size={56} />
                </div>
                <span className="energy-tcg-name">{ENERGY_NAMES[type]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      <div className="energy-select-summary">
        <span>Selected:</span>
        {selectedEnergyTypes.length === 0 ? (
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>None</span>
        ) : (
          selectedEnergyTypes.map((e, i) => (
            <EnergyIcon key={`${e}-${i}`} type={e} size={24} />
          ))
        )}
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          ({selectedEnergyTypes.length}/4)
        </span>
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
