'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ───
interface SocialData {
  totalTrainers: number;
  totalBattles: number;
  onlineNow: number;
  recentWinners: Array<{
    username: string;
    avatar: string;
    rankLabel: string;
  }>;
}

interface TopPlayer {
  username: string;
  ladderPoints: number;
}

// ─── Hero Stats (live counters under CTA) ───
export function HeroStats() {
  const [data, setData] = useState<SocialData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/social/social-proof');
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch { /* ignore */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-live-stats">
      <div className="stat-item">
        <span>🔥</span>
        <span className="stat-value">{data ? data.onlineNow.toLocaleString() : '—'}</span>
        <span>players online</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span>⚔️</span>
        <span className="stat-value">{data ? data.totalBattles.toLocaleString() : '—'}</span>
        <span>battles played</span>
      </div>
    </div>
  );
}

// ─── Social Proof Section (battle ticker + top players + counters) ───
export function SocialProofSection() {
  const [data, setData] = useState<SocialData | null>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/social/social-proof');
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch { /* ignore */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch('/api/ladder?limit=5');
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTopPlayers(json.data.slice(0, 5));
        } else if (json.success && json.data?.players) {
          setTopPlayers(json.data.players.slice(0, 5));
        }
      } catch { /* ignore */ }
    };
    fetchTop();
  }, []);

  return (
    <section className="social-proof-section">
      <h2 className="section-title">Trainers Are Battling Right Now</h2>

      {/* Stats counters */}
      <div className="stats-counter-grid">
        <div className="stats-counter-item">
          <div className="stats-counter-value">
            {data ? data.totalTrainers.toLocaleString() : '—'}
          </div>
          <div className="stats-counter-label">Trainers</div>
        </div>
        <div className="stats-counter-item">
          <div className="stats-counter-value">
            {data ? data.totalBattles.toLocaleString() : '—'}
          </div>
          <div className="stats-counter-label">Battles</div>
        </div>
        <div className="stats-counter-item">
          <div className="stats-counter-value">
            {data ? data.onlineNow.toLocaleString() : '—'}
          </div>
          <div className="stats-counter-label">Online Now</div>
        </div>
      </div>

      <div className="social-proof-grid" style={{ marginTop: '32px' }}>
        {/* Recent battles */}
        <div className="proof-card">
          <div className="proof-card-title">🏆 Recent Winners</div>
          <div className="battle-ticker">
            {data && data.recentWinners.length > 0 ? (
              data.recentWinners.slice(0, 5).map((w, i) => (
                <div key={i} className="battle-ticker-item">
                  <span className="winner">{w.username}</span>
                  <span className="vs-text">won a battle</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.5 }}>{w.rankLabel}</span>
                </div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="battle-ticker-item" style={{ opacity: 0.3 }}>
                  <span>Loading...</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top ranked */}
        <div className="proof-card">
          <div className="proof-card-title">👑 Top Ranked Players</div>
          <div className="top-player-list">
            {topPlayers.length > 0 ? (
              topPlayers.map((p, i) => (
                <div key={p.username} className="top-player-row">
                  <span className={`top-player-rank ${i < 3 ? `rank-${i + 1}` : ''}`}>
                    #{i + 1}
                  </span>
                  <Link href={`/profile/${p.username}`} className="top-player-name" style={{ color: '#fff', textDecoration: 'none' }}>
                    {p.username}
                  </Link>
                  <span className="top-player-lp">{p.ladderPoints} LP</span>
                </div>
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="top-player-row" style={{ opacity: 0.3 }}>
                  <span className="top-player-rank">#{i + 1}</span>
                  <span className="top-player-name">Loading...</span>
                  <span className="top-player-lp">—</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
