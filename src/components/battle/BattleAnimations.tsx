'use client';

import { useState, useEffect, useCallback } from 'react';

// Tipos de animação
export type AnimationType = 
  | 'damage'        // Dano recebido
  | 'heal'          // Cura
  | 'buff'          // Buff aplicado
  | 'debuff'        // Debuff aplicado
  | 'stun'          // Stunned
  | 'invulnerable'  // Invulnerável
  | 'reflect'       // Refletir dano
  | 'counter'       // Contra-ataque
  | 'dodge'         // Esquiva
  | 'critical'      // Crítico
  | 'death'         // Morte
  | 'revive'        // Reviver
  | 'energyGain'    // Ganhar energia
  | 'energyLoss'    // Perder energia
  | 'skillUsed';    // Habilidade usada

export interface BattleAnimation {
  id: string;
  type: AnimationType;
  targetId: string;
  value?: number;
  text?: string;
  duration: number;
  color?: string;
  icon?: string;
}

interface BattleAnimationManagerProps {
  animations: BattleAnimation[];
  onAnimationComplete: (id: string) => void;
}

// Floating damage/heal numbers
export function FloatingNumber({ 
  value, 
  type, 
  onComplete 
}: { 
  value: number; 
  type: 'damage' | 'heal' | 'critical'; 
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getColor = () => {
    switch (type) {
      case 'damage': return '#ff4444';
      case 'critical': return '#ff0000';
      case 'heal': return '#44ff44';
      default: return '#ffffff';
    }
  };

  return (
    <div 
      className={`floating-number ${type}`}
      style={{ color: getColor() }}
    >
      {type === 'damage' || type === 'critical' ? '-' : '+'}
      {value}
      {type === 'critical' && <span className="critical-text">CRÍTICO!</span>}
    </div>
  );
}

// Status effect indicator
export function StatusEffect({ 
  type, 
  duration,
  onComplete 
}: { 
  type: string; 
  duration: number;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const getStatusInfo = () => {
    switch (type) {
      case 'stun':
        return { icon: '💫', text: 'STUNNED', color: '#ffd700' };
      case 'buff':
        return { icon: '⬆️', text: 'BUFF', color: '#44ff44' };
      case 'debuff':
        return { icon: '⬇️', text: 'DEBUFF', color: '#ff4444' };
      case 'invulnerable':
        return { icon: '🛡️', text: 'INVULNERABLE', color: '#00d9ff' };
      case 'reflect':
        return { icon: '🔄', text: 'REFLECT', color: '#9c27b0' };
      case 'dodge':
        return { icon: '💨', text: 'DODGE', color: '#ffffff' };
      case 'counter':
        return { icon: '⚔️', text: 'COUNTER', color: '#ff6b00' };
      default:
        return { icon: '❓', text: type.toUpperCase(), color: '#ffffff' };
    }
  };

  const info = getStatusInfo();

  return (
    <div className="status-effect-popup" style={{ color: info.color }}>
      <span className="status-icon">{info.icon}</span>
      <span className="status-text">{info.text}</span>
    </div>
  );
}

// Skill usage animation
export function SkillAnimation({ 
  skillName, 
  skillType,
  onComplete 
}: { 
  skillName: string; 
  skillType?: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getTypeColor = () => {
    switch (skillType?.toLowerCase()) {
      case 'fire': return '#ff6b00';
      case 'water': return '#3498db';
      case 'grass': return '#27ae60';
      case 'electric': return '#f1c40f';
      case 'psychic': return '#9b59b6';
      case 'fighting': return '#e74c3c';
      case 'dark': return '#2c3e50';
      case 'steel': return '#95a5a6';
      case 'fairy': return '#ff69b4';
      case 'dragon': return '#7b68ee';
      case 'ice': return '#00bcd4';
      case 'rock': return '#a0522d';
      case 'ground': return '#d2691e';
      case 'poison': return '#8b008b';
      case 'ghost': return '#483d8b';
      case 'bug': return '#9acd32';
      case 'flying': return '#87ceeb';
      case 'normal': return '#a8a878';
      default: return '#667eea';
    }
  };

  return (
    <div className="skill-animation" style={{ '--skill-color': getTypeColor() } as React.CSSProperties}>
      <div className="skill-name">{skillName}</div>
      <div className="skill-effect"></div>
    </div>
  );
}

// Death animation
export function DeathAnimation({ 
  pokemonName,
  onComplete 
}: { 
  pokemonName: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="death-animation">
      <div className="death-icon">💀</div>
      <div className="death-text">{pokemonName} foi derrotado!</div>
    </div>
  );
}

// Battle log entry with animation
export function BattleLogEntry({ 
  text, 
  type,
  isNew 
}: { 
  text: string; 
  type?: 'damage' | 'heal' | 'status' | 'system';
  isNew?: boolean;
}) {
  const getColor = () => {
    switch (type) {
      case 'damage': return 'var(--color-damage)';
      case 'heal': return 'var(--color-heal)';
      case 'status': return 'var(--color-status)';
      default: return 'var(--color-text)';
    }
  };

  return (
    <div 
      className={`battle-log-entry ${isNew ? 'new' : ''}`}
      style={{ color: getColor() }}
    >
      {text}
    </div>
  );
}

// Turn transition animation
export function TurnTransition({ 
  turn, 
  onComplete 
}: { 
  turn: number; 
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="turn-transition">
      <div className="turn-number">TURNO {turn}</div>
      <div className="turn-line"></div>
    </div>
  );
}

// Energy gain animation
export function EnergyGainAnimation({ 
  energyType, 
  amount,
  onComplete 
}: { 
  energyType: string; 
  amount: number;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getEnergyIcon = () => {
    switch (energyType) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'grass': return '🌿';
      case 'electric': return '⚡';
      case 'psychic': return '🔮';
      case 'fighting': return '👊';
      case 'random': return '❓';
      default: return '✨';
    }
  };

  return (
    <div className="energy-gain-animation">
      <span className="energy-icon">{getEnergyIcon()}</span>
      <span className="energy-amount">+{amount}</span>
    </div>
  );
}

// Main animation manager component
export function BattleAnimationManager({ 
  animations, 
  onAnimationComplete 
}: BattleAnimationManagerProps) {
  return (
    <div className="battle-animation-container">
      {animations.map(anim => (
        <div 
          key={anim.id} 
          className={`animation-wrapper target-${anim.targetId}`}
        >
          {anim.type === 'damage' && (
            <FloatingNumber 
              value={anim.value || 0} 
              type="damage"
              onComplete={() => onAnimationComplete(anim.id)}
            />
          )}
          {anim.type === 'critical' && (
            <FloatingNumber 
              value={anim.value || 0} 
              type="critical"
              onComplete={() => onAnimationComplete(anim.id)}
            />
          )}
          {anim.type === 'heal' && (
            <FloatingNumber 
              value={anim.value || 0} 
              type="heal"
              onComplete={() => onAnimationComplete(anim.id)}
            />
          )}
          {(anim.type === 'buff' || anim.type === 'debuff' || anim.type === 'stun' || 
            anim.type === 'invulnerable' || anim.type === 'reflect' || 
            anim.type === 'dodge' || anim.type === 'counter') && (
            <StatusEffect 
              type={anim.type}
              duration={anim.duration}
              onComplete={() => onAnimationComplete(anim.id)}
            />
          )}
          {anim.type === 'skillUsed' && (
            <SkillAnimation 
              skillName={anim.text || 'Skill'}
              onComplete={() => onAnimationComplete(anim.id)}
            />
          )}
          {anim.type === 'death' && (
            <DeathAnimation 
              pokemonName={anim.text || 'Pokémon'}
              onComplete={() => onAnimationComplete(anim.id)}
            />
          )}
          {anim.type === 'energyGain' && (
            <EnergyGainAnimation 
              energyType={anim.text || 'random'}
              amount={anim.value || 1}
              onComplete={() => onAnimationComplete(anim.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Hook para gerenciar animações de batalha
export function useBattleAnimations() {
  const [animations, setAnimations] = useState<BattleAnimation[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const addAnimation = useCallback((animation: Omit<BattleAnimation, 'id'>) => {
    const id = `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setAnimations(prev => [...prev, { ...animation, id }]);
    setIsAnimating(true);
    return id;
  }, []);

  const removeAnimation = useCallback((id: string) => {
    setAnimations(prev => {
      const newAnims = prev.filter(a => a.id !== id);
      if (newAnims.length === 0) {
        setIsAnimating(false);
      }
      return newAnims;
    });
  }, []);

  const clearAnimations = useCallback(() => {
    setAnimations([]);
    setIsAnimating(false);
  }, []);

  // Função para animar uma sequência de ações de batalha
  const animateBattleActions = useCallback(async (actions: Array<{
    type: AnimationType;
    targetId: string;
    value?: number;
    text?: string;
  }>) => {
    setIsAnimating(true);
    
    for (const action of actions) {
      addAnimation({
        type: action.type,
        targetId: action.targetId,
        value: action.value,
        text: action.text,
        duration: 1500,
      });
      
      // Esperar um pouco entre animações
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }, [addAnimation]);

  return {
    animations,
    isAnimating,
    addAnimation,
    removeAnimation,
    clearAnimations,
    animateBattleActions,
  };
}
