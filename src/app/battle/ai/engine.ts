import {
  PokemonType, EnergyType, StatusType,
  EnergyState, Move, BattlePokemon, SelectedAction, LogEntry, StatusEffect,
} from './types';
import { ALL_ENERGY_TYPES, EMPTY_ENERGY } from './data';
import {
  rollCriticalHit,
  STAB_MULTIPLIER as _STAB, CRITICAL_HIT_MULTIPLIER,
} from '@/lib/type-effectiveness';

// Re-export for consumers
export const STAB_MULTIPLIER = _STAB;

// ==================== ENERGY HELPERS ====================
export const getTotalEnergy = (e: EnergyState): number =>
  Object.values(e).reduce((sum: number, v: number) => sum + v, 0);

export const getHpClass = (current: number, max: number): string => {
  const pct = (current / max) * 100;
  return pct > 50 ? 'high' : pct > 25 ? 'medium' : 'low';
};

/**
 * Generate energy based on selected types + alive Pokemon
 * CRITICAL: Energy ACCUMULATES, doesn't reset!
 */
export const generateTurnEnergy = (
  team: BattlePokemon[],
  selectedEnergyTypes: EnergyType[],
  turn: number
): EnergyState => {
  const energy = { ...EMPTY_ENERGY };
  const aliveCount = team.filter(p => p.hp > 0).length;

  // Turn 1: ONLY 1 energy (first player advantage)
  // Turn 2+: energy = number of alive Pokemon
  const energyCount = turn === 1 ? 1 : aliveCount;

  for (let i = 0; i < energyCount; i++) {
    const availableTypes = [...selectedEnergyTypes, 'colorless'] as EnergyType[];
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    energy[type]++;
  }
  return energy;
};

/** Add energy (accumulate) */
export const addEnergy = (current: EnergyState, toAdd: EnergyState): EnergyState => {
  const result = { ...current };
  for (const key of ALL_ENERGY_TYPES) {
    result[key] += toAdd[key];
  }
  return result;
};

/** Spend energy for a move */
export const spendEnergyForMove = (currentEnergy: EnergyState, move: Move): EnergyState => {
  const e = { ...currentEnergy };
  for (const cost of move.cost) {
    if (cost.type === 'colorless') {
      let remaining = cost.amount;
      if (e.colorless >= remaining) {
        e.colorless -= remaining;
        continue;
      }
      remaining -= e.colorless;
      e.colorless = 0;
      for (const t of ALL_ENERGY_TYPES) {
        if (t === 'colorless') continue;
        const spend = Math.min(e[t], remaining);
        e[t] -= spend;
        remaining -= spend;
        if (remaining <= 0) break;
      }
    } else {
      const spend = Math.min(e[cost.type], cost.amount);
      e[cost.type] -= spend;
      const stillNeeded = cost.amount - spend;
      if (stillNeeded > 0) {
        e.colorless = Math.max(0, e.colorless - stillNeeded);
      }
    }
  }
  return e;
};

/** Check if player can afford a move (accounting for already-selected actions) */
export const canAffordMove = (energy: EnergyState, alreadySpent: SelectedAction[], move: Move): boolean => {
  let temp = { ...energy };
  for (const a of alreadySpent) {
    temp = spendEnergyForMove(temp, a.move);
  }
  for (const cost of move.cost) {
    if (cost.type === 'colorless') {
      if (getTotalEnergy(temp) < cost.amount) return false;
      let remaining = cost.amount;
      for (const t of ALL_ENERGY_TYPES) {
        const spend = Math.min(temp[t], remaining);
        temp[t] -= spend;
        remaining -= spend;
        if (remaining <= 0) break;
      }
    } else {
      const available = temp[cost.type] + temp.colorless;
      if (available < cost.amount) return false;
      const spend = Math.min(temp[cost.type], cost.amount);
      temp[cost.type] -= spend;
      const stillNeeded = cost.amount - spend;
      if (stillNeeded > 0) temp.colorless -= stillNeeded;
    }
  }
  return true;
};

/** Apply status effect damage/restriction at start of turn */
export const processStatusEffects = (
  team: BattlePokemon[],
  addLog: (text: string, type: LogEntry['type']) => void
): BattlePokemon[] => {
  return team.map(p => {
    if (p.hp <= 0 || p.statusEffects.length === 0) return p;
    let newHp = p.hp;
    const remainingEffects: StatusEffect[] = [];

    // Check cannot-be-healed ONCE before processing
    const cannotBeHealed = p.statusEffects.some(e => e.type === 'cannot-be-healed');
    // Check expose: removes ALL defensive effects and blocks new ones
    const isExposed = p.statusEffects.some(e => e.type === 'expose');

    for (const effect of p.statusEffects) {
      // If exposed, skip defensive effects entirely (they get removed)
      if (isExposed && ['invulnerable', 'reduce-damage', 'reflect', 'counter', 'endure'].includes(effect.type)) {
        addLog(`${p.name}'s ${effect.type} was removed by Expose!`, 'status');
        continue; // don't add to remainingEffects
      }

      switch (effect.type) {
        // === DAMAGE EFFECTS ===
        case 'burn': {
          const burnDmg = Math.max(1, Math.floor(p.maxHp * 0.06));
          newHp = Math.max(0, newHp - burnDmg);
          addLog(`${p.name} is hurt by burn! (-${burnDmg} HP)`, 'status');
          break;
        }
        case 'poison': {
          const poisonDmg = Math.max(1, Math.floor(p.maxHp * 0.08));
          newHp = Math.max(0, newHp - poisonDmg);
          addLog(`${p.name} is hurt by poison! (-${poisonDmg} HP)`, 'status');
          break;
        }
        case 'drain-hp': {
          const drainDmg = effect.value || Math.floor(p.maxHp * 0.05);
          newHp = Math.max(0, newHp - drainDmg);
          addLog(`${p.name} loses ${drainDmg} HP from drain!`, 'status');
          break;
        }
        case 'bleed': {
          // bleed increases damage taken (processed in calculateBattleDamage)
          // but also deals minor tick damage
          const bleedDmg = Math.max(1, Math.floor(p.maxHp * 0.03));
          newHp = Math.max(0, newHp - bleedDmg);
          addLog(`${p.name} is bleeding! (-${bleedDmg} HP)`, 'status');
          break;
        }

        // === CONTROL EFFECTS (log only, canAct handles prevention) ===
        case 'stun':
          addLog(`${p.name} is stunned!`, 'status');
          break;
        case 'sleep': {
          // 20% chance to wake up each turn
          if (Math.random() < 0.20) {
            addLog(`${p.name} woke up!`, 'info');
            continue; // remove the effect by not adding to remaining
          }
          addLog(`${p.name} is fast asleep!`, 'status');
          break;
        }
        case 'freeze': {
          // 20% chance to thaw each turn
          if (Math.random() < 0.20) {
            addLog(`${p.name} thawed out!`, 'info');
            continue; // remove the effect
          }
          addLog(`${p.name} is frozen solid!`, 'status');
          break;
        }
        case 'paralyze':
          addLog(`${p.name} is paralyzed!`, 'status');
          break;
        case 'confuse': {
          // 33% chance to hurt itself
          if (Math.random() < 0.33) {
            const selfDmg = Math.max(1, Math.floor(p.maxHp * 0.05));
            newHp = Math.max(0, newHp - selfDmg);
            addLog(`${p.name} hurt itself in confusion! (-${selfDmg} HP)`, 'status');
          }
          break;
        }

        // === HEALING ===
        case 'heal-over-time': {
          if (cannotBeHealed) {
            addLog(`${p.name} cannot heal! (cursed)`, 'status');
          } else {
            const healAmt = effect.value || Math.floor(p.maxHp * 0.05);
            const oldHp = newHp;
            newHp = Math.min(p.maxHp, newHp + healAmt);
            if (newHp > oldHp) {
              addLog(`${p.name} recovers ${newHp - oldHp} HP!`, 'heal');
            }
          }
          break;
        }

        // === PASSIVE EFFECTS (no per-turn action, handled elsewhere) ===
        case 'invulnerable':
        case 'reduce-damage':
        case 'reflect':
        case 'counter':
        case 'endure':
        case 'strengthen':
        case 'weaken':
        case 'increase-damage':
        case 'silence':
        case 'taunt':
        case 'cannot-be-healed':
        case 'expose':
          break;

        // === INSTANT EFFECTS (handled in executeAction, just tick down) ===
        case 'remove-energy':
        case 'steal-energy':
        case 'cooldown-increase':
        case 'cooldown-reduce':
          break;
      }

      // Decrement duration and keep if still active
      if (effect.duration > 1) {
        remainingEffects.push({ ...effect, duration: effect.duration - 1 });
      } else {
        addLog(`${p.name} recovered from ${effect.type}!`, 'info');
      }
    }

    // Endure: ensure HP doesn't drop below 1
    const hasEndure = remainingEffects.some(e => e.type === 'endure');
    if (hasEndure && newHp <= 0) {
      newHp = 1;
      addLog(`${p.name} endured the hit! (1 HP)`, 'effect');
    }

    return { ...p, hp: newHp, statusEffects: remainingEffects };
  });
};

/** Check if Pokemon can act (blocked by stun/freeze/sleep/paralyze) */
export const canAct = (poke: BattlePokemon): boolean => {
  for (const effect of poke.statusEffects) {
    // Stun: always prevents action
    if (effect.type === 'stun') return false;
    // Sleep: always prevents action (wake-up is handled in processStatusEffects)
    if (effect.type === 'sleep') return false;
    // Freeze: always prevents action (thaw is handled in processStatusEffects)
    if (effect.type === 'freeze') return false;
    // Paralyze: 25% chance of not acting
    if (effect.type === 'paralyze') {
      if (Math.random() < 0.25) return false;
    }
  }
  return true;
};

// ==================== BATTLE DAMAGE CALCULATOR ====================
/**
 * TCG Pocket style damage:
 *   damage = basePower × STAB × crit
 *   + 20 if moveType matches defender's weakness
 *   - 20 if moveType matches defender's resistance (min 0)
 *
 * Status modifiers applied AFTER:
 *   - strengthen (attacker): +value% damage
 *   - weaken    (attacker): -value% damage
 *   - reduce-damage (defender): flat reduction
 *   - increase-damage (defender): flat increase
 *   - reflect (defender): -value% damage
 *
 * No complex type chart multipliers. Simple and predictable.
 */
export const TCG_WEAKNESS_BONUS = 20;
export const TCG_RESISTANCE_REDUCTION = 20;

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isWeak: boolean;             // move hit a weakness (+20)
  isResisted: boolean;         // move hit a resistance (-20)
  effectivenessText: string;   // "Weakness! (+20)" etc.
}

export const calculateBattleDamage = (
  basePower: number,
  moveType: PokemonType,
  attackerTypes: PokemonType[],
  defenderWeakness: PokemonType | undefined,
  defenderResistance: PokemonType | undefined,
  attackerEffects: StatusEffect[],
  defenderEffects: StatusEffect[],
): DamageResult => {
  // 1. STAB
  const stab = attackerTypes.includes(moveType) ? STAB_MULTIPLIER : 1;

  // 2. Critical hit
  const isCrit = rollCriticalHit();
  const critMul = isCrit ? CRITICAL_HIT_MULTIPLIER : 1;

  // 3. Base damage (predictable)
  let damage = Math.floor(basePower * stab * critMul);

  // 4. TCG Pocket weakness / resistance (flat ±20)
  const isWeak = !!defenderWeakness && moveType === defenderWeakness;
  const isResisted = !!defenderResistance && moveType === defenderResistance;

  if (isWeak) damage += TCG_WEAKNESS_BONUS;
  if (isResisted) damage = Math.max(0, damage - TCG_RESISTANCE_REDUCTION);

  // 5. Attacker status modifiers (% based)
  const strengthen = attackerEffects.find(e => e.type === 'strengthen');
  if (strengthen) {
    damage = Math.floor(damage * (1 + (strengthen.value || 30) / 100));
  }
  const weaken = attackerEffects.find(e => e.type === 'weaken');
  if (weaken) {
    damage = Math.floor(damage * (1 - (weaken.value || 30) / 100));
  }

  // 6. Defender status modifiers
  // 6c. Expose removes all defensive modifiers — if exposed, ignore reduce-damage, reflect, counter
  const isExposed = defenderEffects.some(e => e.type === 'expose');

  const reduceDmg = defenderEffects.find(e => e.type === 'reduce-damage');
  if (reduceDmg && !isExposed) {
    damage = Math.max(1, damage - (reduceDmg.value || 20));
  }
  const increaseDmg = defenderEffects.find(e => e.type === 'increase-damage');
  if (increaseDmg) {
    damage = damage + (increaseDmg.value || 20);
  }

  // 6b. Bleed (increases damage taken, similar to increase-damage)
  const bleed = defenderEffects.find(e => e.type === 'bleed');
  if (bleed) {
    damage = damage + (bleed.value || 10);
  }

  // 7. Reflect (% reduction on defender) — skipped if exposed
  const reflect = defenderEffects.find(e => e.type === 'reflect');
  if (reflect && !isExposed) {
    damage = Math.max(1, Math.floor(damage * (1 - (reflect.value || 25) / 100)));
  }

  // Build effectiveness text
  let effectivenessText = '';
  if (isWeak) effectivenessText = `Weakness! (+${TCG_WEAKNESS_BONUS})`;
  if (isResisted) effectivenessText = `Resistance! (-${TCG_RESISTANCE_REDUCTION})`;

  return { damage, isCrit, isWeak, isResisted, effectivenessText };
};
