'use client';

/**
 * Pokémon TCG energy icons.
 * Uses official TCG card images cropped to circles for all sizes.
 * Only the energy select grid (variant="card") shows the full card shape.
 */

interface EnergyIconProps {
  type: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** "card" = rectangular TCG card shape, "orb" (default) = circular */
  variant?: 'orb' | 'card';
}

/* TCG energy card image paths */
const ENERGY_CARDS: Record<string, string> = {
  grass: '/energy/grass.png',
  fire: '/energy/fire.png',
  water: '/energy/water.png',
  lightning: '/energy/lightning.png',
  psychic: '/energy/psychic.png',
  fighting: '/energy/fighting.png',
  darkness: '/energy/darkness.png',
  metal: '/energy/metal.png',
  fairy: '/energy/fairy.png',
  colorless: '/energy/colorless.png',
};

/* [background, dark-border] color pairs per energy type */
const COLORS: Record<string, [string, string]> = {
  grass:     ['#78C850', '#4E8234'],
  fire:      ['#F08030', '#C0501C'],
  water:     ['#6890F0', '#445AA8'],
  lightning: ['#F8D030', '#C4A018'],
  psychic:   ['#F85888', '#C03060'],
  fighting:  ['#C03028', '#7E201A'],
  darkness:  ['#705848', '#453428'],
  metal:     ['#B8B8D0', '#8080A0'],
  fairy:     ['#EE99AC', '#C06878'],
  colorless: ['#C0C0B8', '#909088'],
};

export default function EnergyIcon({ type, size = 20, className, style, variant = 'orb' }: EnergyIconProps) {
  const cardSrc = ENERGY_CARDS[type];

  if (cardSrc && variant === 'card') {
    // Full rectangular TCG card (only for energy select grid)
    const width = size;
    const height = Math.round(size * 1.4);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cardSrc}
        alt={`${type} energy`}
        width={width}
        height={height}
        className={className}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          borderRadius: Math.max(1, size * 0.08),
          objectFit: 'cover',
          boxShadow: size >= 20 ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
          ...style,
        }}
      />
    );
  }

  if (cardSrc) {
    // Circular orb using TCG card image (default for everywhere)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cardSrc}
        alt={`${type} energy`}
        width={size}
        height={size}
        className={className}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          boxShadow: size >= 16 ? `0 1px 3px rgba(0,0,0,0.4)` : 'none',
          border: size >= 16 ? '1px solid rgba(0,0,0,0.2)' : 'none',
          ...style,
        }}
      />
    );
  }

  // Fallback SVG for unknown types
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
      <circle cx="12" cy="12" r="11.8" fill={border} />
      <circle cx="12" cy="12" r="10.6" fill={bg} />
      <g transform="translate(12,12)">
        <polygon points="0,-9 3.2,-3 9,-3 5,1 6.5,8 0,4.5 -6.5,8 -5,1 -9,-3 -3.2,-3" fill="#fff" fillOpacity="0.97"/>
      </g>
    </svg>
  );
}

/** TCG energy orb — uses official card image in circular format */
export function EnergyOrb({ type, size = 16 }: { type: string; size?: number }) {
  const cardSrc = ENERGY_CARDS[type];
  if (cardSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cardSrc}
        alt={`${type} energy`}
        width={size}
        height={size}
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          flexShrink: 0,
          verticalAlign: 'middle',
          border: '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
        title={type.charAt(0).toUpperCase() + type.slice(1)}
      />
    );
  }
  // Fallback colored circle
  const [bg, border] = COLORS[type] || COLORS.colorless;
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${bg}ee, ${border})`,
        border: `2px solid ${border}`,
        flexShrink: 0,
        verticalAlign: 'middle',
      }}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    />
  );
}

export { COLORS as ENERGY_ICON_COLORS };
