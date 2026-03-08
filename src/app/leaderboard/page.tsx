'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TIERS, type CompetitiveTier } from '@/lib/ranking';
import './leaderboard.css';

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
  rankIndex: number;
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
  avatar: string;
  level: number;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  rankLabel: string;
  rankTier: string;
  rankDivision: string;
  tierColor: string;
  tierGradient: string;
  tierIcon: string;
  divisionProgress: number;
  lpToNextDivision: number;
}

interface SeasonInfo {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myPos, setMyPos] = useState<MyPosition | null>(null);
  const [season, setSeason] = useState<SeasonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tierFilter, setTierFilter] = useState<CompetitiveTier | ''>('');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      });
      if (searchTerm) params.set('search', searchTerm);
      if (tierFilter) params.set('tier', tierFilter);

      const res = await fetch(`/api/leaderboard?${params}`);
      const data = await res.json();

      if (data.data) {
        setEntries(data.data.leaderboard || []);
        setMyPos(data.data.myPosition || null);
        setSeason(data.data.season || null);
        setTotalPages(data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, tierFilter]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput);
  };

  const daysRemaining = season
    ? Math.max(0, Math.ceil((new Date(season.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="lb-page">
      {/* Header */}
      <header className="lb-header">
        <div className="lb-header-content">
          <h1 className="lb-title">Competitive Leaderboard</h1>
          {season && (
            <div className="lb-season-info">
              <span className="lb-season-name">{season.name}</span>
              {daysRemaining !== null && (
                <span className="lb-season-timer">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Season ending soon!'}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Tier chips */}
      <div className="lb-tier-chips">
        <button
          className={`lb-tier-chip ${tierFilter === '' ? 'active' : ''}`}
          onClick={() => { setTierFilter(''); setPage(1); }}
        >
          All Tiers
        </button>
        {TIERS.map(t => (
          <button
            key={t.tier}
            className={`lb-tier-chip ${tierFilter === t.tier ? 'active' : ''}`}
            style={{
              '--chip-color': t.color,
              '--chip-gradient': t.gradient,
              '--chip-glow': t.glow,
            } as React.CSSProperties}
            onClick={() => { setTierFilter(t.tier); setPage(1); }}
          >
            <span className="lb-tier-icon">{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <form className="lb-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="lb-search-input"
          placeholder="Search trainer..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="lb-search-btn">Search</button>
      </form>

      {/* My Position card */}
      {myPos && (
        <div className="lb-my-position" style={{ '--rank-color': myPos.tierColor, '--rank-gradient': myPos.tierGradient } as React.CSSProperties}>
          <div className="lb-my-pos-badge">
            <span className="lb-my-pos-number">#{myPos.position}</span>
          </div>
          <div className="lb-my-pos-info">
            <span className="lb-my-pos-name">{myPos.username}</span>
            <span className="lb-my-pos-rank" style={{ color: myPos.tierColor }}>
              {myPos.tierIcon} {myPos.rankLabel}
            </span>
          </div>
          <div className="lb-my-pos-stats">
            <span className="lb-my-pos-lp">{myPos.lp} LP</span>
            <span className="lb-my-pos-wr">{myPos.winRate}% WR</span>
          </div>
          <div className="lb-my-pos-progress">
            <div className="lb-progress-bar">
              <div
                className="lb-progress-fill"
                style={{ width: `${myPos.divisionProgress}%`, background: myPos.tierGradient }}
              />
            </div>
            <span className="lb-progress-text">{myPos.lpToNextDivision} LP to next</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="lb-table-container">
        {loading ? (
          <div className="lb-loading">
            <div className="pokeball-loader large" />
            <p>Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="lb-empty">
            <p>No trainers found.</p>
          </div>
        ) : (
          <table className="lb-table">
            <thead>
              <tr>
                <th className="lb-th-pos">#</th>
                <th className="lb-th-trainer">Trainer</th>
                <th className="lb-th-rank">Rank</th>
                <th className="lb-th-lp">LP</th>
                <th className="lb-th-progress">Progress</th>
                <th className="lb-th-record">W / L</th>
                <th className="lb-th-wr">Win Rate</th>
                <th className="lb-th-streak">Streak</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`lb-row ${entry.position <= 3 ? `lb-top-${entry.position}` : ''}`}
                  style={{ '--row-color': entry.tierColor, '--row-glow': entry.tierGlow } as React.CSSProperties}
                >
                  <td className="lb-cell-pos">
                    {entry.position <= 3 ? (
                      <span className={`lb-medal lb-medal-${entry.position}`}>
                        {entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="lb-pos-num">{entry.position}</span>
                    )}
                  </td>
                  <td className="lb-cell-trainer">
                    <div className="lb-trainer-info">
                      <Link href={`/profile/${entry.username}`} className="lb-trainer-name">
                        {entry.username}
                      </Link>
                      {entry.clanTag && (
                        <span className="lb-clan-tag">[{entry.clanTag}]</span>
                      )}
                      <span className="lb-trainer-level">Lv.{entry.level}</span>
                    </div>
                  </td>
                  <td className="lb-cell-rank">
                    <span
                      className="lb-rank-badge"
                      style={{ background: entry.tierGradient }}
                    >
                      <span className="lb-rank-icon">{entry.tierIcon}</span>
                      {entry.rankLabel}
                    </span>
                  </td>
                  <td className="lb-cell-lp">
                    <span className="lb-lp-value" style={{ color: entry.tierColor }}>{entry.lp}</span>
                  </td>
                  <td className="lb-cell-progress">
                    <div className="lb-mini-progress">
                      <div
                        className="lb-mini-progress-fill"
                        style={{ width: `${entry.divisionProgress}%`, background: entry.tierGradient }}
                      />
                    </div>
                  </td>
                  <td className="lb-cell-record">
                    <span className="lb-wins">{entry.wins}</span>
                    <span className="lb-sep">/</span>
                    <span className="lb-losses">{entry.losses}</span>
                  </td>
                  <td className="lb-cell-wr">
                    <span className={`lb-wr-value ${entry.winRate >= 60 ? 'high' : entry.winRate >= 50 ? 'mid' : 'low'}`}>
                      {entry.winRate}%
                    </span>
                  </td>
                  <td className="lb-cell-streak">
                    {entry.streak > 0 ? (
                      <span className="lb-streak-value">🔥 {entry.streak}</span>
                    ) : (
                      <span className="lb-streak-none">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="lb-pagination">
          <button
            className="lb-page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span className="lb-page-info">Page {page} of {totalPages}</span>
          <button
            className="lb-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}

      {/* Nav */}
      <div className="lb-nav">
        <Link href="/play" className="lb-nav-btn">← Back to Game</Link>
        <Link href="/ladder" className="lb-nav-btn">Legacy Ranking</Link>
      </div>
    </div>
  );
}
