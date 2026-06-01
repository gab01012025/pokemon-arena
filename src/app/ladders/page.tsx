'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface LeaderboardEntry {
  position: number;
  id: string;
  username: string;
  avatar: string;
  level: number;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  maxStreak: number;
  clan: string | null;
  clanTag: string | null;
  rankLabel: string;
  rankTier: string;
  rankDivision: string;
  tierColor: string;
  tierGradient: string;
  tierGlow: string;
  tierIcon: string;
  divisionProgress: number;
  lpToNextDivision: number;
}

interface MyPosition {
  position: number;
  username: string;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
  rankLabel: string;
  rankTier: string;
  tierColor: string;
  tierIcon: string;
  divisionProgress: number;
}

interface Season {
  name: string;
  number: number;
}

const TIER_FILTERS = [
  { value: '', label: 'All Tiers' },
  { value: 'pokeball', label: 'Pokeball' },
  { value: 'greatball', label: 'Great Ball' },
  { value: 'ultraball', label: 'Ultra Ball' },
  { value: 'masterball', label: 'Master Ball' },
  { value: 'champion', label: 'Champion' },
];

export default function Ladders() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myPosition, setMyPosition] = useState<MyPosition | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [page, tierFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (tierFilter) params.set('tier', tierFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/leaderboard?${params}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.data.leaderboard || []);
        setMyPosition(data.data.myPosition || null);
        setSeason(data.data.season || null);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        setError(data.error?.message || 'Failed to load leaderboard');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchLeaderboard();
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
          <h1 className="page-title">Ladders</h1>
          <div className="breadcrumb">
            <Link href="/">Pokemon Arena</Link> &gt; <span className="current">Ladders</span>
          </div>

          {season && (
            <div style={{
              textAlign: 'center',
              padding: '10px',
              background: '#0f1223',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #1e2340',
            }}>
              <span style={{ color: '#FFD700', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>
                {season.name} - Season {season.number}
              </span>
            </div>
          )}

          {/* My Position Card */}
          {myPosition && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 18px',
              background: '#0f1223',
              border: `1px solid ${myPosition.tierColor}`,
              borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '24px' }}>{myPosition.tierIcon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                  #{myPosition.position} - {myPosition.username}
                </div>
                <div style={{ fontSize: '11px', color: myPosition.tierColor, fontWeight: 600 }}>
                  {myPosition.rankLabel}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#FFD700' }}>{myPosition.lp} LP</div>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  {myPosition.wins}W / {myPosition.losses}L ({myPosition.winRate}%)
                </div>
              </div>
              <div style={{ width: '80px' }}>
                <div style={{ height: '6px', background: '#1a1a2e', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${myPosition.divisionProgress}%`, background: myPosition.tierColor, borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search trainer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '8px 12px',
                background: '#141830',
                border: '1px solid #1e2340',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              SEARCH
            </button>
          </div>

          {/* Tier filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
            {TIER_FILTERS.map(tf => (
              <button
                key={tf.value}
                onClick={() => { setTierFilter(tf.value); setPage(1); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: tierFilter === tf.value ? '#FFD700' : '#1e2340',
                  background: tierFilter === tf.value ? '#1e1808' : '#0f1223',
                  color: tierFilter === tf.value ? '#FFD700' : '#aaa',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Loading / Error */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
              Loading leaderboard...
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#e53935' }}>
              {error}
            </div>
          )}

          {/* Leaderboard Table */}
          {!loading && !error && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 100px 80px 60px 60px',
                gap: '0',
                fontSize: '10px',
                fontWeight: 700,
                color: '#888',
                padding: '8px 12px',
                background: '#0f1223',
                borderRadius: '6px 6px 0 0',
                borderBottom: '1px solid #1e2340',
                letterSpacing: '0.5px',
              }}>
                <span>#</span>
                <span>TRAINER</span>
                <span>RANK</span>
                <span style={{ textAlign: 'right' }}>LP</span>
                <span style={{ textAlign: 'right' }}>W/L</span>
                <span style={{ textAlign: 'right' }}>WR%</span>
              </div>

              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr 100px 80px 60px 60px',
                    gap: '0',
                    padding: '8px 12px',
                    background: '#0a0d1c',
                    borderBottom: '1px solid #0f1223',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                    fontSize: '12px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#0f1428')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0a0d1c')}
                >
                  <span style={{
                    fontWeight: 800,
                    color: entry.position <= 3 ? '#FFD700' : '#aaa',
                    fontSize: entry.position <= 3 ? '14px' : '12px',
                  }}>
                    {entry.position}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.username}
                    </span>
                    {entry.clanTag && (
                      <span style={{ fontSize: '9px', color: '#888', fontWeight: 600 }}>[{entry.clanTag}]</span>
                    )}
                    {entry.streak >= 3 && (
                      <span style={{ fontSize: '9px', color: '#ff9800' }}>{entry.streak} streak</span>
                    )}
                  </div>
                  <span style={{ color: entry.tierColor, fontWeight: 700, fontSize: '10px' }}>
                    {entry.tierIcon} {entry.rankLabel}
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: '#FFD700' }}>
                    {entry.lp}
                  </span>
                  <span style={{ textAlign: 'right', color: '#aaa', fontSize: '10px' }}>
                    {entry.wins}/{entry.losses}
                  </span>
                  <span style={{
                    textAlign: 'right',
                    fontWeight: 700,
                    color: entry.winRate >= 60 ? '#4CAF50' : entry.winRate >= 50 ? '#FF9800' : '#e53935',
                  }}>
                    {entry.winRate}%
                  </span>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888', background: '#0a0d1c' }}>
                  No trainers found{search ? ` for "${search}"` : ''}.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{
                      padding: '6px 14px',
                      background: page <= 1 ? '#0f1223' : '#141830',
                      border: '1px solid #1e2340',
                      borderRadius: '6px',
                      color: page <= 1 ? '#444' : '#fff',
                      cursor: page <= 1 ? 'default' : 'pointer',
                      fontWeight: 700,
                      fontSize: '11px',
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: '6px 12px', color: '#aaa', fontSize: '11px', display: 'flex', alignItems: 'center' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{
                      padding: '6px 14px',
                      background: page >= totalPages ? '#0f1223' : '#141830',
                      border: '1px solid #1e2340',
                      borderRadius: '6px',
                      color: page >= totalPages ? '#444' : '#fff',
                      cursor: page >= totalPages ? 'default' : 'pointer',
                      fontWeight: 700,
                      fontSize: '11px',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
