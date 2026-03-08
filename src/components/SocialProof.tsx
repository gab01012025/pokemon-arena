'use client';

import { useState, useEffect } from 'react';

interface SocialProofData {
  totalTrainers: number;
  totalBattles: number;
  onlineNow: number;
  recentWinners: Array<{
    username: string;
    avatar: string;
    rankLabel: string;
  }>;
}

export function LiveOnlineCount() {
  const [stats, setStats] = useState<SocialProofData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/social/social-proof');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch {
        // ignore
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <span className="users-online-number">—</span>
    );
  }

  return (
    <span className="users-online-number">{stats.onlineNow || stats.totalTrainers}</span>
  );
}

export function SocialProofTicker() {
  const [stats, setStats] = useState<SocialProofData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/social/social-proof');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch {
        // ignore
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="sidebar-box">
      <div className="sidebar-box-header" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
        📊 Live Stats
      </div>
      <div className="sidebar-box-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Total Trainers</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#4CAF50' }}>{stats.totalTrainers.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Battles Played</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFD700' }}>{stats.totalBattles.toLocaleString()}</span>
          </div>

          {/* Recent Winners Ticker */}
          {stats.recentWinners.length > 0 && (
            <div style={{ marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '6px' }}>
                🏆 Recent Winners
              </div>
              {stats.recentWinners.slice(0, 3).map((w, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3px 0',
                  fontSize: '12px',
                }}>
                  <a href={`/profile/${w.username}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                    {w.username}
                  </a>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {w.rankLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
