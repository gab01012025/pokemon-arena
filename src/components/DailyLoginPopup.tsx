'use client';

import { useState, useEffect, useCallback } from 'react';

interface DailyLoginReward {
  day: number;
  xp: number;
  label: string;
  icon: string;
}

interface DailyLoginStatus {
  streak: number;
  claimedToday: boolean;
  rewards: DailyLoginReward[];
}

interface ClaimResult {
  claimed: boolean;
  alreadyClaimed: boolean;
  reward: DailyLoginReward | null;
  newStreak: number;
  streakReset: boolean;
  newAchievements: string[];
  rewards: DailyLoginReward[];
}

export default function DailyLoginPopup() {
  const [status, setStatus] = useState<DailyLoginStatus | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Check daily login status on mount
  useEffect(() => {
    const checkDaily = async () => {
      try {
        const res = await fetch('/api/social/daily-login');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && !data.data.claimedToday) {
          setStatus(data.data);
          setVisible(true);
        }
      } catch {
        // Not logged in or error — don't show popup
      }
    };

    // Small delay so it doesn't flash on page load
    const timer = setTimeout(checkDaily, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClaim = useCallback(async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/social/daily-login', { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setClaimResult(data.data);
      }
    } catch {
      // ignore
    } finally {
      setClaiming(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setTimeout(() => setVisible(false), 300);
  }, []);

  if (!visible || dismissed) return null;
  if (!status) return null;

  const streak = claimResult?.newStreak ?? status.streak;
  const rewards = claimResult?.rewards ?? status.rewards;
  const currentDay = ((streak - 1) % 7) + 1; // 1-7 cycle

  return (
    <div className="daily-login-overlay" onClick={handleDismiss}>
      <div className="daily-login-card" onClick={e => e.stopPropagation()}>
        <h2 className="daily-login-title">📅 Daily Login Bonus</h2>
        <p className="daily-login-subtitle">
          {claimResult?.claimed
            ? `+${claimResult.reward?.xp} XP! ${claimResult.streakReset ? 'Streak reset' : ''}`
            : 'Claim your daily reward!'}
        </p>

        <div className="daily-rewards-grid">
          {rewards.map((reward) => {
            let dayClass = 'daily-reward-day';
            if (claimResult?.claimed) {
              if (reward.day < currentDay) dayClass += ' claimed';
              else if (reward.day === currentDay) dayClass += ' claimed current';
              else dayClass += ' future';
            } else {
              if (reward.day < currentDay + 1) dayClass += ' claimed';
              else if (reward.day === currentDay + 1) dayClass += ' current';
              else dayClass += ' future';
            }

            return (
              <div key={reward.day} className={dayClass}>
                <span className="daily-reward-icon">{reward.icon}</span>
                <span className="daily-reward-xp">{reward.xp}</span>
                <span className="daily-reward-label">Day {reward.day}</span>
              </div>
            );
          })}
        </div>

        <p className="daily-login-streak">
          🔥 Streak: <strong>{streak}</strong> {streak === 1 ? 'day' : 'days'}
        </p>

        {!claimResult?.claimed ? (
          <button
            className="daily-login-claim-btn"
            onClick={handleClaim}
            disabled={claiming}
          >
            {claiming ? '⏳ Claiming...' : '🎁 Claim Reward'}
          </button>
        ) : (
          <button className="daily-login-claim-btn" onClick={handleDismiss}>
            ✅ Awesome!
          </button>
        )}

        <button className="daily-login-dismiss" onClick={handleDismiss}>
          Close
        </button>
      </div>
    </div>
  );
}
