'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface Mission {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  requirements: { level?: number; wins?: number; completedMissions?: string[] };
  objectives: Record<string, number>;
  rewardExp: number;
  rewardPokemon: string | null;
  rewardItems: Record<string, number> | null;
  userStatus: string;
  userProgress: Record<string, number> | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#4CAF50',
  easy: '#4CAF50',
  Normal: '#FF9800',
  normal: '#FF9800',
  medium: '#FF9800',
  Hard: '#e53935',
  hard: '#e53935',
  Expert: '#9C27B0',
  expert: '#9C27B0',
};

const CATEGORY_ICONS: Record<string, string> = {
  'D Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  'C Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  'B Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  'A Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
  'S Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  'Event': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png',
};

// Name-to-pokedex-number mapping for reward sprites
const POKEMON_IDS: Record<string, number> = {
  cyndaquil: 155, totodile: 158, chikorita: 152, mareep: 179, shinx: 403,
  torchic: 255, mudkip: 258, treecko: 252, riolu: 447, zorua: 570,
  ralts: 280, bagon: 371, absol: 359, froakie: 656,
  axew: 610, deino: 633, larvesta: 636, honedge: 679,
  beldum: 374, mimikyu: 778, dreepy: 885,
  gible: 443, rowlet: 722, larvitar: 246,
  dragonite: 149, arcanine: 59, mewtwo: 150, jolteon: 135, garchomp: 445, lucario: 448,
};

function getSpriteUrl(pokemonName: string): string {
  const key = pokemonName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const id = POKEMON_IDS[key];
  if (id) return `/pokemon-anime/${id}.png`;
  return `/pokemon-anime/${key}.png`;
}

function getSpriteById(id: number): string {
  return `/pokemon-anime/${id}.png`;
}

// Rank display order
const RANK_ORDER = ['D Rank', 'C Rank', 'B Rank', 'A Rank', 'S Rank', 'Event', 'Story', 'Daily', 'Weekly'];

export default function PokemonMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Mission[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [startingMission, setStartingMission] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/missions?myProgress=true');
      const data = await res.json();
      if (data.success) {
        setMissions(data.data.missions || []);
        setGrouped(data.data.grouped || {});
        // Sort categories by rank order
        const cats: string[] = data.data.categories || [];
        cats.sort((a: string, b: string) => {
          const ia = RANK_ORDER.indexOf(a);
          const ib = RANK_ORDER.indexOf(b);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
        setCategories(cats);
      } else {
        setError(data.error?.message || 'Failed to load missions');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const startMission = async (missionId: string) => {
    try {
      setStartingMission(missionId);
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMissions();
      } else {
        alert(data.error?.message || 'Failed to start mission');
      }
    } catch {
      alert('Failed to start mission');
    } finally {
      setStartingMission(null);
    }
  };

  const filteredMissions = search
    ? missions.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
    : activeCategory
      ? (grouped[activeCategory] || [])
      : missions;

  const displayGroups = search || !activeCategory
    ? Object.entries(grouped)
        .sort(([a], [b]) => {
          const ia = RANK_ORDER.indexOf(a);
          const ib = RANK_ORDER.indexOf(b);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        })
        .filter(([cat]) => !activeCategory || cat === activeCategory)
    : [[activeCategory, grouped[activeCategory] || []] as [string, Mission[]]];

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
          <h1 className="page-title">Pokemon Missions</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; <span className="current">Pokemon Missions</span>
          </div>

          <div className="section-content">
            <p>Complete missions to unlock new Pokemon, earn experience, and progress through the ranks. Complete D Rank missions to unlock C Rank, and so on up to S Rank!</p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search missions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#141830',
                border: '1px solid #1e2340',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: !activeCategory ? '#FFD700' : '#1e2340',
                background: !activeCategory ? '#1e1808' : '#0f1223',
                color: !activeCategory ? '#FFD700' : '#aaa',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              All
            </button>
            {categories.map(cat => {
              const catMissions = grouped[cat] || [];
              const completed = catMissions.filter(m => m.userStatus === 'completed').length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: activeCategory === cat ? '#FFD700' : '#1e2340',
                    background: activeCategory === cat ? '#1e1808' : '#0f1223',
                    color: activeCategory === cat ? '#FFD700' : '#aaa',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {cat} {completed > 0 && <span style={{ color: '#4CAF50', marginLeft: '4px' }}>({completed}/{catMissions.length})</span>}
                </button>
              );
            })}
          </div>

          {/* Loading / Error */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
              Loading missions...
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#e53935' }}>
              {error}
            </div>
          )}

          {/* Missions list */}
          {!loading && !error && displayGroups.map(([category, catMissions]) => {
            const filtered = search
              ? (catMissions as Mission[]).filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
              : catMissions as Mission[];
            if (filtered.length === 0) return null;
            const completedCount = (catMissions as Mission[]).filter(m => m.userStatus === 'completed').length;
            const totalCount = (catMissions as Mission[]).length;
            return (
              <div key={category} style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: '#0f1223',
                  borderRadius: '8px 8px 0 0',
                  borderBottom: '2px solid #FFD700',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={CATEGORY_ICONS[category as string] || CATEGORY_ICONS['Special Missions']}
                    alt=""
                    width={24}
                    height={24}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#FFD700', letterSpacing: '1px' }}>
                    {category as string}
                  </span>
                  <span style={{ fontSize: '11px', color: '#888', marginLeft: 'auto' }}>
                    {completedCount}/{totalCount} completed
                  </span>
                  {/* Progress bar */}
                  <div style={{ width: '60px', height: '4px', background: '#1e2340', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`, height: '100%', background: completedCount === totalCount && totalCount > 0 ? '#4CAF50' : '#FFD700', borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {filtered.map((mission) => {
                    const isLocked = mission.userStatus === 'locked';
                    const prereqs = mission.requirements?.completedMissions || [];
                    return (
                      <div
                        key={mission.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          background: isLocked ? '#080a16' : '#0a0d1c',
                          borderLeft: `3px solid ${DIFFICULTY_COLORS[mission.difficulty] || '#444'}`,
                          transition: 'background 0.15s',
                          opacity: isLocked ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => { if (!isLocked) e.currentTarget.style.background = '#0f1428'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = isLocked ? '#080a16' : '#0a0d1c'; }}
                      >
                        {/* Pokemon reward sprite */}
                        <div style={{ flexShrink: 0, width: '48px', height: '48px', position: 'relative' }}>
                          {mission.rewardPokemon && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getSpriteUrl(mission.rewardPokemon)}
                                alt={mission.rewardPokemon}
                                width={48}
                                height={48}
                                style={{ imageRendering: 'pixelated', filter: isLocked ? 'brightness(0.3)' : 'none' }}
                                onError={(e) => { (e.target as HTMLImageElement).src = getSpriteById(1); }}
                              />
                            </>
                          )}
                        </div>

                        {/* Mission info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: isLocked ? '#666' : '#fff' }}>{mission.name}</span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: DIFFICULTY_COLORS[mission.difficulty] || '#444',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              opacity: isLocked ? 0.5 : 1,
                            }}>
                              {mission.difficulty}
                            </span>
                          </div>
                          <p style={{ fontSize: '11px', color: isLocked ? '#555' : '#888', margin: 0, lineHeight: 1.4 }}>
                            {mission.description}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px', fontSize: '10px', color: '#666' }}>
                            <span>+{mission.rewardExp} XP</span>
                            {mission.rewardPokemon && <span style={{ color: '#FFD700' }}>Unlocks: {mission.rewardPokemon}</span>}
                            {mission.requirements?.level && mission.requirements.level > 1 && <span>Req: Lv.{mission.requirements.level}</span>}
                          </div>
                          {/* Prerequisite info for locked missions */}
                          {isLocked && prereqs.length > 0 && (
                            <div style={{ marginTop: '4px', fontSize: '10px', color: '#e53935' }}>
                              Requer: {prereqs.join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Status / Action */}
                        <div style={{ flexShrink: 0 }}>
                          {mission.userStatus === 'completed' && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#4CAF50', padding: '4px 10px', background: '#1a2e1f', borderRadius: '12px', border: '1px solid #2a4e2f' }}>
                              COMPLETED
                            </span>
                          )}
                          {mission.userStatus === 'in_progress' && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF9800', padding: '4px 10px', background: '#1e1808', borderRadius: '12px', border: '1px solid #3a2a08' }}>
                              IN PROGRESS
                            </span>
                          )}
                          {mission.userStatus === 'available' && (
                            <button
                              onClick={() => startMission(mission.id)}
                              disabled={startingMission === mission.id}
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#fff',
                                padding: '6px 14px',
                                background: '#4CAF50',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                opacity: startingMission === mission.id ? 0.5 : 1,
                              }}
                            >
                              {startingMission === mission.id ? 'STARTING...' : 'START'}
                            </button>
                          )}
                          {mission.userStatus === 'locked' && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#0f1223', borderRadius: '12px', border: '1px solid #1e2340' }}>
                              LOCKED
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!loading && !error && filteredMissions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No missions found{search ? ` for "${search}"` : ''}.
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
