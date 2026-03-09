'use client';

/**
 * Official Pokémon TCG-style energy icons as inline SVGs.
 * Each energy type renders its proper TCG symbol inside a colored circle.
 */

interface EnergyIconProps {
  type: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const COLORS: Record<string, [string, string]> = {
  grass:     ['#78C850', '#4a8828'],
  fire:      ['#F08030', '#c06020'],
  water:     ['#6890F0', '#4870c8'],
  lightning: ['#F8D030', '#c8a820'],
  psychic:   ['#F85888', '#c04868'],
  fighting:  ['#C03028', '#901810'],
  darkness:  ['#705848', '#483830'],
  metal:     ['#B8B8D0', '#9090a8'],
  colorless: ['#A8A878', '#888860'],
};

function TCGSymbol({ type }: { type: string }) {
  switch (type) {
    case 'grass':
      return (
        <>
          <path d="M12 5c-2.5 2.2-5 5.8-5 9.2 0 3 2.2 5.3 5 5.3s5-2.3 5-5.3c0-3.4-2.5-7-5-9.2z" fill="#fff" fillOpacity="0.93"/>
          <path d="M12 19V11" stroke="#5a9838" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.4"/>
          <path d="M12 14.5l-2.8-2.3M12 12.5l2.8-2" stroke="#5a9838" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
        </>
      );
    case 'fire':
      return (
        <path d="M12 4c0 0-5.5 5.2-5.5 10.2 0 3.5 2.5 5.8 5.5 5.8s5.5-2.3 5.5-5.8c0-5-5.5-10.2-5.5-10.2zm0 13.5c-1.3 0-2.3-1.1-2.3-2.6s2.3-4.4 2.3-4.4 2.3 2.9 2.3 4.4-1 2.6-2.3 2.6z" fill="#fff" fillOpacity="0.93"/>
      );
    case 'water':
      return (
        <path d="M12 4.5L7.2 14.2c0 3 2.1 5.3 4.8 5.3s4.8-2.3 4.8-5.3L12 4.5z" fill="#fff" fillOpacity="0.93"/>
      );
    case 'lightning':
      return (
        <polygon points="14.5,3 7.5,13 11.5,13 9.5,21 16.5,10 12.5,10" fill="#fff" fillOpacity="0.93"/>
      );
    case 'psychic':
      return (
        <>
          <circle cx="12" cy="12" r="7.2" fill="none" stroke="#fff" strokeWidth="2.2" opacity="0.93"/>
          <circle cx="12" cy="12" r="2.8" fill="#fff" fillOpacity="0.93"/>
        </>
      );
    case 'fighting':
      return (
        <polygon
          points="12,3.5 14.3,9.2 20.5,9.5 15.8,13.8 17.2,20 12,16.8 6.8,20 8.2,13.8 3.5,9.5 9.7,9.2"
          fill="#fff" fillOpacity="0.93"
        />
      );
    case 'darkness':
      return (
        <path d="M16 5.5c-2.2 0.8-4.5 3.5-4.5 6.5s2.3 5.7 4.5 6.5c-1 0.3-2 0.5-3.2 0.5-4 0-7.3-3.3-7.3-7s3.3-7 7.3-7c1.2 0 2.2 0.2 3.2 0.5z" fill="#fff" fillOpacity="0.93"/>
      );
    case 'metal':
      return (
        <polygon
          points="12,4 17.5,7.5 17.5,16.5 12,20 6.5,16.5 6.5,7.5"
          fill="none" stroke="#fff" strokeWidth="2.3" opacity="0.93"
        />
      );
    case 'colorless':
      return (
        <polygon
          points="12,3 13.9,9.3 20.5,9.3 15.3,13.3 17.2,19.8 12,15.8 6.8,19.8 8.7,13.3 3.5,9.3 10.1,9.3"
          fill="#fff" fillOpacity="0.93"
        />
      );
    default:
      return <circle cx="12" cy="12" r="5" fill="#fff" fillOpacity="0.93"/>;
  }
}

export default function EnergyIcon({ type, size = 20, className, style }: EnergyIconProps) {
  const [bg, border] = COLORS[type] || COLORS.colorless;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Circle background */}
      <circle cx="12" cy="12" r="11.5" fill={bg} />
      {/* Glossy highlight */}
      <ellipse cx="9.5" cy="7.5" rx="6" ry="4.5" fill="rgba(255,255,255,0.18)" />
      {/* Border ring */}
      <circle cx="12" cy="12" r="11" fill="none" stroke={border} strokeWidth="0.8" />
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
      {/* TCG symbol */}
      <TCGSymbol type={type} />
    </svg>
  );
}

export { COLORS as ENERGY_ICON_COLORS };
