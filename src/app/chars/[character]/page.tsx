/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getPokemonImageUrl, pokemonNameToId } from '@/lib/pokemon-images';

interface CharacterPageProps {
  params: Promise<{
    character: string;
  }>;
}

interface Move {
  id: string;
  name: string;
  description: string;
  classes: string;
  cost: string;
  cooldown: number;
  damage: number;
  healing: number;
  effects: string;
  target: string;
  slot: number;
}

const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
  flying: '#A890F0', poison: '#A040A0', ground: '#E0C068', rock: '#B8A038',
  bug: '#A8B820', ghost: '#705898', steel: '#B8B8D0', psychic: '#F85888',
  ice: '#98D8D8', dragon: '#7038F8', dark: '#705848', fairy: '#EE99AC',
  normal: '#A8A878', fighting: '#C03028',
};

const TYPE_COLORS_DARK: Record<string, string> = {
  fire: '#9C531F', water: '#445E9C', grass: '#4E8234', electric: '#A1871F',
  flying: '#6D5E9C', poison: '#682A68', ground: '#927D44', rock: '#786824',
  bug: '#6D7815', ghost: '#493963', steel: '#787887', psychic: '#A13959',
  ice: '#638D8D', dragon: '#4924A1', dark: '#49392F', fairy: '#9B6470',
  normal: '#6D6D4E', fighting: '#7D1F1A',
};

const TCG_ENERGY_MAP: Record<string, string> = {
  fire: 'fire', water: 'water', grass: 'grass',
  electric: 'lightning', psychic: 'psychic', fighting: 'fighting',
  dark: 'darkness', steel: 'metal', fairy: 'fairy',
  dragon: 'colorless', normal: 'colorless', flying: 'colorless',
  ice: 'water', poison: 'psychic', ground: 'fighting',
  rock: 'fighting', bug: 'grass', ghost: 'psychic',
};

// TCG energy type display colors (for accents)
const TCG_ENERGY_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850',
  lightning: '#F8D030', psychic: '#F85888', fighting: '#C03028',
  darkness: '#705848', metal: '#B8B8D0', fairy: '#EE99AC',
  colorless: '#A8A878',
};

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { character } = await params;
  const charName = decodeURIComponent(character).replace(/-/g, ' ');

  const pokemon = await prisma.pokemon.findFirst({
    where: {
      OR: [
        { id: character },
        { name: { equals: charName, mode: 'insensitive' } },
      ],
    },
    include: {
      moves: { orderBy: { slot: 'asc' } },
    },
  });

  if (!pokemon) {
    notFound();
  }

  // Parse types
  let types: string[] = ['Normal'];
  try {
    const parsed = JSON.parse(pokemon.types);
    types = Array.isArray(parsed) ? parsed : [pokemon.types];
  } catch {
    types = pokemon.types ? pokemon.types.split(',') : ['Normal'];
  }

  // Parse traits
  let traits: string[] = [];
  try {
    if (pokemon.traits) {
      const parsed = JSON.parse(pokemon.traits);
      traits = Array.isArray(parsed) ? parsed : [pokemon.traits];
    }
  } catch {
    traits = pokemon.traits ? [pokemon.traits] : [];
  }

  const primaryType = types[0]?.toLowerCase() || 'normal';
  const typeColor = TYPE_COLORS[primaryType] || '#A8A878';
  const typeColorDark = TYPE_COLORS_DARK[primaryType] || '#6D6D4E';

  // Get Pokedex number
  const normalizedName = pokemon.name.toLowerCase().replace(/[^a-z-]/g, '');
  const pokedexNum = pokemonNameToId[normalizedName] || 0;

  // Parse cost helper
  const parseCost = (costStr: string): { type: string; amount: number }[] => {
    try {
      const cost = JSON.parse(costStr);
      return Object.entries(cost)
        .filter(([, amount]) => (amount as number) > 0)
        .map(([type, amount]) => ({ type, amount: amount as number }));
    } catch {
      return [];
    }
  };


  return (
    <div className="page-wrapper">
      <div className="main-container">
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          {/* Back nav */}
          <div style={{ marginBottom: '12px' }}>
            <Link href="/characters" style={{
              color: '#8892b0',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              ← Back to Characters
            </Link>
          </div>

          {/* ===== HERO CARD ===== */}
          <div className="pdx-hero" style={{
            background: `linear-gradient(160deg, ${typeColor}18 0%, #0d102080 40%, ${typeColor}10 100%)`,
            border: `2px solid ${typeColor}50`,
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '16px',
            position: 'relative',
          }}>
            {/* Type stripe accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${typeColor}, ${typeColorDark})`,
            }} />

            <div style={{
              display: 'flex',
              gap: '20px',
              padding: '24px 20px 20px',
              alignItems: 'flex-start',
            }}>
              {/* Artwork */}
              <div style={{
                width: '140px',
                height: '140px',
                flexShrink: 0,
                background: `radial-gradient(circle, ${typeColor}20 0%, transparent 70%)`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <img
                  src={getPokemonImageUrl(pokemon.name, 'default')}
                  alt={pokemon.name}
                  style={{
                    width: '130px',
                    height: '130px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + Number */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                  <h1 style={{
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '0.5px',
                  }}>
                    {pokemon.name}
                  </h1>
                  {pokedexNum > 0 && (
                    <span style={{
                      color: `${typeColor}aa`,
                      fontSize: '16px',
                      fontWeight: 700,
                    }}>
                      #{String(pokedexNum).padStart(3, '0')}
                    </span>
                  )}
                </div>

                {/* Type badges */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {types.map((type, idx) => {
                    const tc = TYPE_COLORS[type.toLowerCase()] || '#A8A878';
                    return (
                      <span key={idx} style={{
                        background: tc,
                        color: '#fff',
                        padding: '3px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: `0 2px 8px ${tc}66`,
                      }}>
                        {type}
                      </span>
                    );
                  })}
                </div>

                {/* Description */}
                <p style={{
                  color: '#a0aec0',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  margin: '0 0 14px',
                  fontStyle: 'italic',
                }}>
                  {pokemon.description}
                </p>

                {/* Stats row */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}>
                  {/* HP */}
                  <div className="pdx-stat-chip">
                    <span className="pdx-stat-label">HP</span>
                    <span className="pdx-stat-val" style={{ color: '#48bb78' }}>{pokemon.health}</span>
                  </div>
                  {/* Category */}
                  <div className="pdx-stat-chip">
                    <span className="pdx-stat-label">Category</span>
                    <span className="pdx-stat-val" style={{ color: typeColor }}>{pokemon.category}</span>
                  </div>
                  {/* Cost / Status */}
                  {pokemon.isStarter ? (
                    <div className="pdx-stat-chip">
                      <span className="pdx-stat-label">Status</span>
                      <span className="pdx-stat-val" style={{ color: '#48bb78' }}>Starter</span>
                    </div>
                  ) : pokemon.unlockCost > 0 ? (
                    <div className="pdx-stat-chip">
                      <span className="pdx-stat-label">Unlock</span>
                      <span className="pdx-stat-val" style={{ color: '#ffd700' }}>{pokemon.unlockCost}</span>
                    </div>
                  ) : (
                    <div className="pdx-stat-chip">
                      <span className="pdx-stat-label">Status</span>
                      <span className="pdx-stat-val" style={{ color: '#a78bfa' }}>Mission</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Traits bar */}
            {traits.length > 0 && (
              <div style={{
                padding: '10px 20px',
                borderTop: `1px solid ${typeColor}25`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: `${typeColor}08`,
              }}>
                <span style={{ color: '#718096', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Abilities
                </span>
                {traits.map((trait, i) => (
                  <span key={i} style={{
                    background: `${typeColor}20`,
                    border: `1px solid ${typeColor}40`,
                    color: '#e2e8f0',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}>
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ===== MOVES SECTION ===== */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              padding: '0 2px',
            }}>
              <span style={{
                color: typeColor,
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Moves
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: `linear-gradient(90deg, ${typeColor}40, transparent)`,
              }} />
              <span style={{ color: '#4a5568', fontSize: '11px' }}>
                {pokemon.moves.length} moves
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pokemon.moves.map((move: Move) => {
                const cost = parseCost(move.cost);

                // Determine move's TCG energy type from first cost entry
                const moveType = cost.length > 0 ? cost[0].type.toLowerCase() : primaryType;
                const tcgEnergy = TCG_ENERGY_MAP[moveType] || 'colorless';
                const energyColor = TCG_ENERGY_COLORS[tcgEnergy] || '#A8A878';

                return (
                  <div key={move.id} className="pdx-move-card" style={{
                    borderLeft: `3px solid ${energyColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                  }}>
                    {/* Energy card thumbnail */}
                    <div style={{
                      width: '42px',
                      height: '58px',
                      flexShrink: 0,
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: `0 2px 8px ${energyColor}40`,
                    }}>
                      <img
                        src={`/energy/${tcgEnergy}.png`}
                        alt={tcgEnergy}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                    </div>

                    {/* Move name + description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '14px',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {move.name}
                      </div>
                      <div style={{
                        color: '#8892b0',
                        fontSize: '11px',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {move.description}
                      </div>
                    </div>

                    {/* Damage / Heal number */}
                    {(move.damage > 0 || move.healing > 0) && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexShrink: 0,
                        minWidth: '36px',
                      }}>
                        <span style={{
                          color: move.damage > 0 ? '#fc8181' : '#48bb78',
                          fontSize: '22px',
                          fontWeight: 800,
                          lineHeight: 1,
                        }}>
                          {move.damage > 0 ? move.damage : move.healing}
                        </span>
                        <span style={{ color: '#718096', fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {move.damage > 0 ? 'DMG' : 'HEAL'}
                        </span>
                      </div>
                    )}

                    {/* Energy cost cards */}
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                      {cost.length === 0 && (
                        <span style={{ color: '#48bb78', fontSize: '10px', fontWeight: 600 }}>FREE</span>
                      )}
                      {cost.map((c, i) => {
                        const typeLower = c.type.toLowerCase();
                        const tcgFile = TCG_ENERGY_MAP[typeLower] || 'colorless';
                        return Array.from({ length: c.amount }).map((_, ai) => (
                          <img
                            key={`${i}-${ai}`}
                            src={`/energy/${tcgFile}.png`}
                            alt={c.type}
                            title={c.type}
                            style={{
                              width: '20px',
                              height: '28px',
                              objectFit: 'cover',
                              borderRadius: '2px',
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                            }}
                          />
                        ));
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== SPRITE GALLERY ===== */}
          <div style={{
            background: '#0f1428',
            border: '1px solid #1a1e38',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '16px',
          }}>
            <div style={{
              color: '#718096',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}>
              Sprites
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: 'Front', type: 'default' as const },
                { label: 'Back', type: 'back' as const },
                { label: 'Shiny', type: 'shiny' as const },
              ].map(({ label, type }) => (
                <div key={type} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    background: '#1a202c',
                    borderRadius: '8px',
                    border: '1px solid #2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                  }}>
                    <img
                      src={getPokemonImageUrl(pokemon.name, type)}
                      alt={`${pokemon.name} ${label}`}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                    />
                  </div>
                  <span style={{ color: '#4a5568', fontSize: '10px' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <Link href="/characters" style={{
              color: typeColor,
              fontSize: '13px',
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              ← Back to Characters
            </Link>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
