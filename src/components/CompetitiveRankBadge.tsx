'use client';

import { getRank, getTierInfo, getDivisionProgress, TIERS } from '@/lib/ranking';
import './CompetitiveRankBadge.css';

interface CompetitiveRankBadgeProps {
  lp: number;
  wins?: number;
  losses?: number;
  streak?: number;
  /** sm = inline, md = card, lg = profile hero */
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showStats?: boolean;
  animated?: boolean;
}

export default function CompetitiveRankBadge({
  lp,
  wins = 0,
  losses = 0,
  streak = 0,
  size = 'md',
  showProgress = true,
  showStats = false,
  animated = false,
}: CompetitiveRankBadgeProps) {
  const rank = getRank(lp);
  const tierInfo = getTierInfo(lp);
  const progress = getDivisionProgress(lp);
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div
      className={`cr-badge cr-badge-${size} ${animated ? 'cr-badge-animated' : ''}`}
      style={{
        '--cr-color': tierInfo.color,
        '--cr-gradient': tierInfo.gradient,
        '--cr-glow': tierInfo.glow,
      } as React.CSSProperties}
    >
      {/* Rank icon + label */}
      <div className="cr-rank-header">
        <span className="cr-rank-icon">{tierInfo.icon}</span>
        <div className="cr-rank-text">
          <span className="cr-rank-label" style={{ color: tierInfo.color }}>
            {rank.label}
          </span>
          <span className="cr-rank-lp">{lp} LP</span>
        </div>
      </div>

      {/* Progress bar to next division */}
      {showProgress && (
        <div className="cr-progress-section">
          <div className="cr-progress-bar">
            <div
              className="cr-progress-fill"
              style={{
                width: `${progress.percentage}%`,
                background: tierInfo.gradient,
              }}
            />
          </div>
          <div className="cr-progress-info">
            <span className="cr-progress-pct">{progress.percentage}%</span>
            <span className="cr-progress-next">{progress.lpToNextDivision} LP to next</span>
          </div>
        </div>
      )}

      {/* Stats row */}
      {showStats && (
        <div className="cr-stats-row">
          <div className="cr-stat">
            <span className="cr-stat-label">W/L</span>
            <span className="cr-stat-value">
              <span className="cr-wins">{wins}</span>/<span className="cr-losses">{losses}</span>
            </span>
          </div>
          <div className="cr-stat">
            <span className="cr-stat-label">Win Rate</span>
            <span className={`cr-stat-value ${winRate >= 60 ? 'cr-high' : winRate >= 50 ? 'cr-mid' : 'cr-low'}`}>
              {winRate}%
            </span>
          </div>
          {streak > 0 && (
            <div className="cr-stat">
              <span className="cr-stat-label">Streak</span>
              <span className="cr-stat-value cr-streak">🔥 {streak}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Inline rank pill for use in tables, headers, etc. */
export function RankPill({ lp }: { lp: number }) {
  const rank = getRank(lp);
  const tierInfo = getTierInfo(lp);

  return (
    <span
      className="cr-pill"
      style={{ background: tierInfo.gradient }}
      title={`${rank.label} — ${lp} LP`}
    >
      <span className="cr-pill-icon">{tierInfo.icon}</span>
      <span className="cr-pill-label">{rank.label}</span>
    </span>
  );
}

/** Compact tier list for showing all tiers at a glance */
export function TierList({ currentLP }: { currentLP?: number }) {
  const currentTier = currentLP !== undefined ? getTierInfo(currentLP).tier : null;

  return (
    <div className="cr-tier-list">
      {TIERS.map(t => (
        <div
          key={t.tier}
          className={`cr-tier-item ${currentTier === t.tier ? 'cr-tier-current' : ''}`}
          style={{ '--t-color': t.color, '--t-gradient': t.gradient, '--t-glow': t.glow } as React.CSSProperties}
        >
          <span className="cr-tier-icon">{t.icon}</span>
          <span className="cr-tier-name">{t.name}</span>
          <span className="cr-tier-lp">{t.minLP}+ LP</span>
        </div>
      ))}
    </div>
  );
}
