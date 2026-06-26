'use client';

import { useState, useMemo } from 'react';
import { type Energy } from '@/lib/game-socket';
import { ENERGY_ICONS } from '../data';

const ENERGY_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', lightning: '#F8D030',
  psychic: '#F85888', fighting: '#C03028', darkness: '#705848', metal: '#B8B8D0',
  colorless: '#A8A878', fairy: '#EE99AC',
};

const ENERGY_LABELS: Record<string, string> = {
  fire: 'Fire', water: 'Water', grass: 'Grass', lightning: 'Electric',
  psychic: 'Psychic', fighting: 'Fighting', darkness: 'Dark', metal: 'Steel',
  colorless: 'Colorless', fairy: 'Fairy',
};

interface EnergyPickerProps {
  needed: number;
  available: Energy;
  skillName: string;
  onConfirm: (spend: Partial<Energy>) => void;
  onCancel: () => void;
}

export default function EnergyPicker({ needed, available, skillName, onConfirm, onCancel }: EnergyPickerProps) {
  const [chosen, setChosen] = useState<Record<string, number>>({});

  const totalChosen = useMemo(() => {
    return Object.values(chosen).reduce((sum, v) => sum + v, 0);
  }, [chosen]);

  const isComplete = totalChosen === needed;

  const availableTypes = useMemo(() => {
    const types: Array<{ type: string; count: number }> = [];
    for (const [type, amount] of Object.entries(available)) {
      if (amount > 0) {
        types.push({ type, count: amount });
      }
    }
    return types;
  }, [available]);

  const addEnergy = (type: string) => {
    const currentlyChosen = chosen[type] || 0;
    const maxAvailable = (available as unknown as Record<string, number>)[type] || 0;
    if (currentlyChosen >= maxAvailable) return;
    if (totalChosen >= needed) return;
    setChosen(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
  };

  const removeEnergy = (type: string) => {
    const currentlyChosen = chosen[type] || 0;
    if (currentlyChosen <= 0) return;
    setChosen(prev => {
      const next = { ...prev, [type]: prev[type] - 1 };
      if (next[type] <= 0) delete next[type];
      return next;
    });
  };

  return (
    <div className="energy-picker-overlay" onClick={onCancel}>
      <div className="energy-picker-modal" onClick={e => e.stopPropagation()}>
        <h3 className="energy-picker-title">Choose Energy</h3>
        <p className="energy-picker-desc">
          <strong>{skillName}</strong> needs <span className="energy-picker-count">{needed}</span> energy of any type
        </p>

        <div className="energy-picker-grid">
          {availableTypes.map(({ type, count }) => {
            const selected = chosen[type] || 0;
            const remaining = count - selected;
            return (
              <div key={type} className="energy-picker-row">
                <div
                  className="energy-picker-square"
                  style={{ backgroundColor: ENERGY_COLORS[type] || '#666' }}
                >
                  {ENERGY_ICONS[type] || type[0].toUpperCase()}
                </div>
                <span className="energy-picker-label">{ENERGY_LABELS[type] || type}</span>
                <span className="energy-picker-avail">({remaining})</span>
                <div className="energy-picker-controls">
                  <button
                    className="energy-picker-btn"
                    onClick={() => removeEnergy(type)}
                    disabled={selected <= 0}
                  >-</button>
                  <span className="energy-picker-val">{selected}</span>
                  <button
                    className="energy-picker-btn"
                    onClick={() => addEnergy(type)}
                    disabled={remaining <= 0 || totalChosen >= needed}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="energy-picker-status">
          Selected: {totalChosen} / {needed}
        </div>

        <div className="energy-picker-actions">
          <button className="energy-picker-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="energy-picker-confirm"
            onClick={() => onConfirm(chosen)}
            disabled={!isComplete}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
