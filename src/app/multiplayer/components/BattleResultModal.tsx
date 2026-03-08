'use client';

import { useState, useEffect } from 'react';
import { type BattleEndData } from '@/lib/game-socket';
import { getTierInfo, getDivisionProgress } from '@/lib/ranking';
import ShareBattleResult from '@/components/battle/ShareBattleResult';

interface BattleResultModalProps {
  result: BattleEndData;
  trainerId: string | null;
  username?: string;
  onReturn: () => void;
  onRematch?: () => void;
  onNewMatch?: () => void;
}

export default function BattleResultModal({ result, trainerId, username, onReturn, onRematch, onNewMatch }: BattleResultModalProps) {
  const isVictory = result.result?.won ?? (result.winnerId === trainerId);
  const stats = result.result;
  const [showRankAnim, setShowRankAnim] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Trigger rank animation after a short delay
  useEffect(() => {
    if (stats?.rankUp || stats?.rankDown) {
      const timer = setTimeout(() => setShowRankAnim(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [stats?.rankUp, stats?.rankDown]);

  // Get tier info for displaying rank colors/icons
  const newTierInfo = stats?.newLP !== undefined ? getTierInfo(stats.newLP) : null;
  const oldTierInfo = stats?.newLP !== undefined && stats?.ladderChange !== undefined
    ? getTierInfo(Math.max(0, stats.newLP - stats.ladderChange))
    : null;
  const progress = stats?.newLP !== undefined ? getDivisionProgress(stats.newLP) : null;

  return (
    <div className={`result-screen ${isVictory ? 'victory' : 'defeat'}`}>
      <h1>{isVictory ? '🏆 VICTORY!' : 'DEFEAT'}</h1>
      <p className="result-reason">
        {result.reason === 'knockout' && (isVictory ? 'All opponent Pokemon were knocked out!' : 'Your team was knocked out!')}
        {result.reason === 'surrender' && (isVictory ? 'Opponent surrendered!' : 'You surrendered.')}
        {result.reason === 'disconnect' && (isVictory ? 'Opponent disconnected.' : 'You were disconnected.')}
        {result.reason === 'timeout' && 'Battle timed out.'}
      </p>

      {/* Stats Panel */}
      <div className="result-stats-panel">
        <div className="result-stats-title">Battle Stats</div>
        <div className="result-stats-grid">
          <div className="result-stat-item">
            <span className="result-stat-label">Result</span>
            <span className={`result-stat-value ${isVictory ? 'positive' : 'negative'}`}>
              {isVictory ? 'WIN' : 'LOSS'}
            </span>
          </div>
          <div className="result-stat-item">
            <span className="result-stat-label">Turns</span>
            <span className="result-stat-value">{result.turns}</span>
          </div>

          {stats && (
            <>
              <div className="result-stat-item">
                <span className="result-stat-label">EXP</span>
                <span className="result-stat-value positive">+{stats.expGained}</span>
              </div>
              <div className="result-stat-item">
                <span className="result-stat-label">LP</span>
                <span className={`result-stat-value ${stats.ladderChange >= 0 ? 'positive' : 'negative'}`}>
                  {stats.ladderChange >= 0 ? '+' : ''}{stats.ladderChange}
                </span>
              </div>
              <div className="result-stat-item">
                <span className="result-stat-label">Current LP</span>
                <span className="result-stat-value gold">{stats.newLP}</span>
              </div>
              <div className="result-stat-item">
                <span className="result-stat-label">Rank</span>
                <span className="result-stat-value" style={{ color: newTierInfo?.color }}>
                  {stats.newRankIcon || ''} {stats.newRankLabel || `Lv.${stats.newLevel}`}
                </span>
              </div>
            </>
          )}
        </div>

        {/* LP Progress bar */}
        {progress && newTierInfo && (
          <div className="rank-progress-section">
            <div className="rank-progress-bar">
              <div
                className="rank-progress-fill"
                style={{ width: `${progress.percentage}%`, background: newTierInfo.gradient }}
              />
            </div>
            <div className="rank-progress-info">
              <span className="rank-progress-pct" style={{ color: newTierInfo.color }}>{progress.percentage}%</span>
              <span className="rank-progress-next">{progress.lpToNextDivision} LP to next division</span>
            </div>
          </div>
        )}

        {/* RANK UP Animation */}
        {showRankAnim && stats?.rankUp && (
          <div className={`rank-change-banner rank-up-banner ${stats.tierChanged ? 'tier-changed' : ''}`}>
            <div className="rank-change-content">
              <span className="rank-change-arrow">⬆</span>
              <div className="rank-change-info">
                <span className="rank-change-title">RANK UP!</span>
                <div className="rank-change-transition">
                  <span className="rank-old" style={{ color: oldTierInfo?.color }}>
                    {stats.oldRankIcon} {stats.oldRankLabel}
                  </span>
                  <span className="rank-arrow">→</span>
                  <span className="rank-new" style={{ color: newTierInfo?.color }}>
                    {stats.newRankIcon} {stats.newRankLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RANK DOWN Animation */}
        {showRankAnim && stats?.rankDown && (
          <div className="rank-change-banner rank-down-banner">
            <div className="rank-change-content">
              <span className="rank-change-arrow down">⬇</span>
              <div className="rank-change-info">
                <span className="rank-change-title rank-down-title">RANK DOWN</span>
                <div className="rank-change-transition">
                  <span className="rank-old" style={{ color: oldTierInfo?.color }}>
                    {stats.oldRankIcon} {stats.oldRankLabel}
                  </span>
                  <span className="rank-arrow">→</span>
                  <span className="rank-new" style={{ color: newTierInfo?.color }}>
                    {stats.newRankIcon} {stats.newRankLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Win streak */}
        {stats && stats.newStreak > 1 && (
          <div className={`result-streak-badge ${isVictory ? 'victory-streak' : 'defeat-streak'}`}>
            🔥 {stats.newStreak} Win Streak!
          </div>
        )}

        {/* Level up */}
        {stats?.leveledUp && (
          <div className="level-up-banner">
            <span className="level-up-text">LEVEL UP!</span>
            <span className="level-up-number">Lv. {stats.newLevel}</span>
          </div>
        )}
      </div>

      {/* Result Buttons */}
      <div className="result-buttons">
        {onRematch && (
          <button className="result-btn rematch-btn" onClick={onRematch}>
            ⚔️ Rematch
          </button>
        )}
        {onNewMatch && (
          <button className="result-btn new-match-btn" onClick={onNewMatch}>
            🔍 New Match
          </button>
        )}
        <button className="result-btn share-result-btn" onClick={() => setShowShare(!showShare)} style={{
          background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.2), rgba(156, 39, 176, 0.2))',
          color: '#bb86fc',
          border: '1px solid rgba(156, 39, 176, 0.3)',
        }}>
          📤 Share
        </button>
        <button className="result-btn exit-btn" onClick={onReturn}>
          Exit to Lobby
        </button>
      </div>

      {/* Share Panel */}
      {showShare && stats && username && (
        <ShareBattleResult
          username={username}
          won={isVictory}
          turns={result.turns}
          lpGained={stats.ladderChange}
          currentLP={stats.newLP}
          rankLabel={stats.newRankLabel}
          rankIcon={stats.newRankIcon}
          rankColor={newTierInfo?.color || '#FFD700'}
          newStreak={stats.newStreak}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
