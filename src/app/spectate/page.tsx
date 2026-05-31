'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import './spectate.css';

interface LiveBattle {
  battleId: string;
  player1: { username: string; level: number };
  player2: { username: string; level: number };
  turn: number;
  startedAt: number;
  spectators: number;
}

export default function SpectatePage() {
  const [battles, setBattles] = useState<LiveBattle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBattles = useCallback(async () => {
    try {
      const res = await fetch('/api/spectate/live');
      if (res.ok) {
        const data = await res.json();
        setBattles(data.battles || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBattles();
    const interval = setInterval(fetchBattles, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchBattles]);

  return (
    <div className="spec-page">
      <nav className="spec-nav">
        <Link href="/" className="spec-nav-back">&larr; Home</Link>
        <h1 className="spec-nav-title">Live Battles</h1>
        <div className="spec-nav-live">
          <span className="spec-live-dot" />
          <span>{battles.length} Live</span>
        </div>
      </nav>

      <div className="spec-content">
        <div className="spec-header">
          <h2>Watch Live PvP Battles</h2>
          <p>Spectate ongoing matches between trainers in real-time</p>
        </div>

        {loading ? (
          <div className="spec-loading">
            <div className="spec-loading-spinner" />
            <p>Searching for live battles...</p>
          </div>
        ) : battles.length === 0 ? (
          <div className="spec-empty">
            <div className="spec-empty-icon">&#9734;</div>
            <h3>No Live Battles</h3>
            <p>There are no battles happening right now. Check back later or start a match yourself!</p>
            <div className="spec-empty-actions">
              <Link href="/multiplayer" className="spec-play-btn">Play PvP</Link>
              <Link href="/play" className="spec-play-btn spec-play-btn-secondary">Play vs AI</Link>
            </div>
          </div>
        ) : (
          <div className="spec-battles-grid">
            {battles.map(battle => (
              <Link
                key={battle.battleId}
                href={`/spectate/${battle.battleId}`}
                className="spec-battle-card"
              >
                <div className="spec-battle-live">
                  <span className="spec-live-dot" />
                  LIVE
                </div>

                <div className="spec-battle-players">
                  <div className="spec-player spec-player-left">
                    <span className="spec-player-name">{battle.player1.username}</span>
                    <span className="spec-player-level">Lv.{battle.player1.level}</span>
                  </div>
                  <div className="spec-battle-vs">VS</div>
                  <div className="spec-player spec-player-right">
                    <span className="spec-player-name">{battle.player2.username}</span>
                    <span className="spec-player-level">Lv.{battle.player2.level}</span>
                  </div>
                </div>

                <div className="spec-battle-info">
                  <span className="spec-battle-turn">Turn {battle.turn}</span>
                  <span className="spec-battle-spectators">
                    {battle.spectators} watching
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="spec-info">
          <h3>How Spectating Works</h3>
          <div className="spec-info-grid">
            <div className="spec-info-item">
              <div className="spec-info-num">1</div>
              <p>Click on any live battle to join as a spectator</p>
            </div>
            <div className="spec-info-item">
              <div className="spec-info-num">2</div>
              <p>Watch both teams, moves, and strategy in real-time</p>
            </div>
            <div className="spec-info-item">
              <div className="spec-info-num">3</div>
              <p>Learn from top players and improve your own game</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
