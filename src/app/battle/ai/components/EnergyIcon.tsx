'use client';

/**
 * Pokémon TCG-style energy icons as inline SVGs.
 * Faithful recreations of the official TCG energy type symbols.
 */

interface EnergyIconProps {
  type: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const COLORS: Record<string, [string, string]> = {
  grass:     ['#5DBE3B', '#3D8B28'],
  fire:      ['#F25C2E', '#C9451A'],
  water:     ['#5B9AE0', '#3A72B5'],
  lightning: ['#FBC531', '#D4A21A'],
  psychic:   ['#C968B9', '#A04A90'],
  fighting:  ['#D56723', '#A84E18'],
  darkness:  ['#3B3736', '#1E1A19'],
  metal:     ['#A8A8AB', '#7B7B80'],
  colorless: ['#E8E8E0', '#B8B8A8'],
};

function TCGSymbol({ type }: { type: string }) {
  switch (type) {
    case 'grass':
      // Official TCG: Leaf shape
      return (
        <g transform="translate(12,12)">
          <path d="M0-8.5C-3.2-5-6.8 0-6.8 4.5c0 3.8 3 6.8 6.8 6.8s6.8-3 6.8-6.8C6.8 0 3.2-5 0-8.5z" fill="#fff" fillOpacity="0.95"/>
          <path d="M0 7V-1" stroke="#3D8B28" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.45"/>
          <path d="M0 2.5L-3-0.5M0 0.5L3-1.5" stroke="#3D8B28" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
        </g>
      );
    case 'fire':
      // Official TCG: Flame shape
      return (
        <g transform="translate(12,12)">
          <path d="M0-9C-1.5-5-6.5-1-6.5 3.5c0 3.8 2.9 6.5 6.5 6.5s6.5-2.7 6.5-6.5C6.5-1 1.5-5 0-9zM0 7.5c-1.5 0-2.8-1.3-2.8-3s2.8-5 2.8-5 2.8 3.3 2.8 5-1.3 3-2.8 3z" fill="#fff" fillOpacity="0.95"/>
        </g>
      );
    case 'water':
      // Official TCG: Water drop
      return (
        <g transform="translate(12,12)">
          <path d="M0-9L-5.5 3c0 0-0.5 1-0.5 2.2C-6 8 -3.3 10 0 10s6-2 6-4.8c0-1.2-0.5-2.2-0.5-2.2L0-9z" fill="#fff" fillOpacity="0.95"/>
        </g>
      );
    case 'lightning':
      // Official TCG: Lightning bolt
      return (
        <g transform="translate(12,12)">
          <polygon points="2.5,-10 -4.5,1.5 -0.5,1.5 -2.5,10 4.5,-1.5 0.5,-1.5" fill="#fff" fillOpacity="0.95"/>
        </g>
      );
    case 'psychic':
      // Official TCG: Eye/third eye
      return (
        <g transform="translate(12,12)">
          <circle cx="0" cy="0" r="8" fill="none" stroke="#fff" strokeWidth="2.4" opacity="0.95"/>
          <circle cx="0" cy="0" r="3.2" fill="#fff" fillOpacity="0.95"/>
        </g>
      );
    case 'fighting':
      // Official TCG: Fist/star
      return (
        <g transform="translate(12,12)">
          <polygon
            points="0,-9 2.5,-3 9,-3 4,1.5 5.8,8.5 0,4.5 -5.8,8.5 -4,1.5 -9,-3 -2.5,-3"
            fill="#fff" fillOpacity="0.95"
          />
        </g>
      );
    case 'darkness':
      // Official TCG: Crescent moon
      return (
        <g transform="translate(12,12)">
          <path d="M4.5-7C1.2-5-1.5-1.5-1.5 2s2.7 7 6 8.5C3.3 11 2 11-0.5 11c-5.5 0-10-4.5-10-10s4.5-10 10-10c2.5 0 3.8 0.5 5 2z" fill="#fff" fillOpacity="0.95"/>
        </g>
      );
    case 'metal':
      // Official TCG: Hexagon
      return (
        <g transform="translate(12,12)">
          <polygon
            points="0,-9 7.8,-4.5 7.8,4.5 0,9 -7.8,4.5 -7.8,-4.5"
            fill="none" stroke="#fff" strokeWidth="2.6" opacity="0.95"
          />
        </g>
      );
    case 'colorless':
      // Official TCG: Six-pointed star
      return (
        <g transform="translate(12,12)">
          <polygon
            points="0,-9 2.2,-3 8.5,-3 3.5,0.8 5.5,7.5 0,3.8 -5.5,7.5 -3.5,0.8 -8.5,-3 -2.2,-3"
            fill="#fff" fillOpacity="0.95"
          />
        </g>
      );
    default:
      return <circle cx="12" cy="12" r="5" fill="#fff" fillOpacity="0.95"/>;
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
      {/* Outer ring - dark border */}
      <circle cx="12" cy="12" r="11.8" fill={border} />
      {/* Main colored circle */}
      <circle cx="12" cy="12" r="10.8" fill={bg} />
      {/* Glossy highlight - subtle */}
      <ellipse cx="9" cy="7" rx="6.5" ry="5" fill="rgba(255,255,255,0.2)" />
      {/* Inner ring accent */}
      <circle cx="12" cy="12" r="10.8" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      {/* TCG symbol */}
      <TCGSymbol type={type} />
    </svg>
  );
}

export { COLORS as ENERGY_ICON_COLORS };
