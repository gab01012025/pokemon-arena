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
  requirements: { level?: number; missions?: string[] };
  objectives: { type: string; target: number; description: string }[];
  rewardExp: number;
  rewardPokemon: string;
  rewardItems: { name: string; amount: number }[] | null;
  userStatus: string;
  userProgress: { current?: number; target?: number } | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#e53935',
  expert: '#9C27B0',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Special Missions': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  'Tales Missions': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/old-amber.png',
  'D Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  'C Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  'B Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  'A Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
  'S Rank': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  'Evolution': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png',
  'Elite Four': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',
  'League Tournament': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png',
};

function getSpriteUrl(pokemonName: string): string {
  const name = pokemonName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${name}.png`;
}

function getSpriteById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

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
        setCategories(data.data.categories || []);
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
    ? Object.entries(grouped).filter(([cat]) => !activeCategory || cat === activeCategory)
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
            <p>Complete missions to unlock new Pokemon, earn experience, and progress through the ranks. Missions are completed passively during regular battles.</p>
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
            {categories.map(cat => (
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
                {cat}
              </button>
            ))}
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
                    {filtered.length} mission{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {filtered.map((mission) => (
                    <div
                      key={mission.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        background: '#0a0d1c',
                        borderLeft: `3px solid ${DIFFICULTY_COLORS[mission.difficulty] || '#444'}`,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#0f1428')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#0a0d1c')}
                    >
                      {/* Pokemon reward sprite */}
                      <div style={{ flexShrink: 0, width: '48px', height: '48px' }}>
                        {mission.rewardPokemon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getSpriteUrl(mission.rewardPokemon)}
                            alt={mission.rewardPokemon}
                            width={48}
                            height={48}
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = getSpriteById(1); }}
                          />
                        )}
                      </div>

                      {/* Mission info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{mission.name}</span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: DIFFICULTY_COLORS[mission.difficulty] || '#444',
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            {mission.difficulty}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#888', margin: 0, lineHeight: 1.4 }}>
                          {mission.description}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '10px', color: '#666' }}>
                          <span>+{mission.rewardExp} XP</span>
                          {mission.rewardPokemon && <span>Unlocks: {mission.rewardPokemon}</span>}
                          {mission.requirements?.level && <span>Req: Lv.{mission.requirements.level}</span>}
                        </div>
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
                  ))}
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
