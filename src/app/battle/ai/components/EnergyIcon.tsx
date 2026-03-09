'use client';

/**
 * Official Pokémon TCG energy icons – accurate inline SVG reproductions.
 * Colors and symbol shapes based on the Pokémon TCG Pocket design.
 */

interface EnergyIconProps {
  type: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

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
  colorless: ['#C0C0B8', '#909088'],
};

/**
 * Renders the white TCG symbol centred in a 24×24 viewBox.
 * Every path was traced from the official TCG Pocket energy artwork.
 */
function TCGSymbol({ type }: { type: string }) {
  const w = '#fff';
  const o = 0.97;

  switch (type) {
    /* ─── Grass ─── leaf with central vein & side veins */
    case 'grass':
      return (
        <g transform="translate(12,12)">
          <path
            d="M0-8C-4-4.5-7.5 0-7 4.2c.3 2.5 1.8 4.2 3.5 5.2L0 5.5l3.5 3.9c1.7-1 3.2-2.7 3.5-5.2C7.5 0 4-4.5 0-8z"
            fill={w} fillOpacity={o}
          />
          <line x1="0" y1="-1" x2="0" y2="8" stroke="#4E8234" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
          <line x1="0" y1="2" x2="-3.5" y2="-0.5" stroke="#4E8234" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
          <line x1="0" y1="4" x2="3.5" y2="1.5" stroke="#4E8234" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        </g>
      );

    /* ─── Fire ─── teardrop flame with inner cutout */
    case 'fire':
      return (
        <g transform="translate(12,11.5)">
          <path
            d="M0-9C-2-5.5-7-1.5-7 3.5 -7 7-3.9 9.5 0 9.5S7 7 7 3.5C7-1.5 2-5.5 0-9z"
            fill={w} fillOpacity={o}
          />
          <path
            d="M0 9.5C-2.2 9.5-3.8 7.8-3.8 5.8-3.8 3.2 0-0.5 0-0.5S3.8 3.2 3.8 5.8C3.8 7.8 2.2 9.5 0 9.5z"
            fill="#F08030" fillOpacity="0.85"
          />
        </g>
      );

    /* ─── Water ─── water droplet */
    case 'water':
      return (
        <g transform="translate(12,12)">
          <path
            d="M0-9C-1.2-6.5-6.5 0-6.5 4 -6.5 7.5-3.6 9.5 0 9.5S6.5 7.5 6.5 4C6.5 0 1.2-6.5 0-9z"
            fill={w} fillOpacity={o}
          />
        </g>
      );

    /* ─── Lightning ─── zigzag bolt */
    case 'lightning':
      return (
        <g transform="translate(12,12)">
          <polygon
            points="1.5,-10 -5,0.5 -1,0.5 -3,10 5,-0.5 1,-0.5 3.5,-10"
            fill={w} fillOpacity={o}
          />
        </g>
      );

    /* ─── Psychic ─── stylised eye (almond shape + iris) */
    case 'psychic':
      return (
        <g transform="translate(12,12)">
          <path
            d="M-9 0C-6-5-3-7 0-7S6-5 9 0C6 5 3 7 0 7S-6 5-9 0z"
            fill={w} fillOpacity={o}
          />
          <circle cx="0" cy="0" r="3.2" fill="#C03060" fillOpacity="0.8"/>
        </g>
      );

    /* ─── Fighting ─── starburst / fist */
    case 'fighting':
      return (
        <g transform="translate(12,12)">
          <path
            d="M0-9.5L2.3-3.5 8.8-3.5 3.6 0.8 5.5 7.5 0 3.5 -5.5 7.5 -3.6 0.8 -8.8-3.5 -2.3-3.5z"
            fill={w} fillOpacity={o}
          />
        </g>
      );

    /* ─── Darkness ─── crescent moon */
    case 'darkness':
      return (
        <g transform="translate(12,12)">
          <path
            d="M3-9C-2.5-7-6-3-6 2S-2.5 11 3 13C-1 12-4 8.5-4 4S0-6 3-9z"
            fill={w} fillOpacity={o}
          />
        </g>
      );

    /* ─── Metal ─── hexagonal outline (split) */
    case 'metal':
      return (
        <g transform="translate(12,12)">
          <polygon
            points="0,-9 7.8,-4.5 7.8,4.5 0,9 -7.8,4.5 -7.8,-4.5"
            fill="none" stroke={w} strokeWidth="3" strokeLinejoin="round" opacity={o}
          />
          <polygon
            points="0,-5 4.3,-2.5 4.3,2.5 0,5 -4.3,2.5 -4.3,-2.5"
            fill="none" stroke={w} strokeWidth="1" opacity="0.45"
          />
        </g>
      );

    /* ─── Colorless ─── six-pointed star (Star of David) */
    case 'colorless':
      return (
        <g transform="translate(12,12)">
          <polygon points="0,-9 3.2,-3 9,-3 5,1 6.5,8 0,4.5 -6.5,8 -5,1 -9,-3 -3.2,-3" fill={w} fillOpacity={o}/>
        </g>
      );

    default:
      return <circle cx="12" cy="12" r="5" fill={w} fillOpacity="0.95"/>;
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
      {/* Outer dark ring */}
      <circle cx="12" cy="12" r="11.8" fill={border} />
      {/* Main coloured circle */}
      <circle cx="12" cy="12" r="10.6" fill={bg} />
      {/* Subtle glossy highlight */}
      <ellipse cx="10" cy="7.5" rx="6" ry="4.5" fill="rgba(255,255,255,0.22)" />
      {/* Inner ring accent */}
      <circle cx="12" cy="12" r="10.6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      {/* TCG symbol */}
      <TCGSymbol type={type} />
    </svg>
  );
}

export { COLORS as ENERGY_ICON_COLORS };
