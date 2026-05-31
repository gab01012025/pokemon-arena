'use client';

import { useState } from 'react';
import Link from 'next/link';
import './battle-pass.css';

interface BattlePassTier {
  level: number;
  xpRequired: number;
  freeReward: { type: string; label: string; icon: string };
  premiumReward: { type: string; label: string; icon: string };
}

const BATTLE_PASS_TIERS: BattlePassTier[] = [
  { level: 1, xpRequired: 0, freeReward: { type: 'xp', label: '50 XP', icon: 'XP' }, premiumReward: { type: 'pack', label: 'Common Pack', icon: 'P' } },
  { level: 2, xpRequired: 100, freeReward: { type: 'xp', label: '75 XP', icon: 'XP' }, premiumReward: { type: 'avatar', label: 'Trainer Frame', icon: 'F' } },
  { level: 3, xpRequired: 250, freeReward: { type: 'pack', label: 'Common Pack', icon: 'P' }, premiumReward: { type: 'xp', label: '200 XP', icon: 'XP' } },
  { level: 4, xpRequired: 450, freeReward: { type: 'xp', label: '100 XP', icon: 'XP' }, premiumReward: { type: 'pack', label: 'Rare Pack', icon: 'R' } },
  { level: 5, xpRequired: 700, freeReward: { type: 'pack', label: 'Uncommon Pack', icon: 'U' }, premiumReward: { type: 'pokemon', label: 'Exclusive Skin', icon: 'S' } },
  { level: 6, xpRequired: 1000, freeReward: { type: 'xp', label: '150 XP', icon: 'XP' }, premiumReward: { type: 'xp', label: '300 XP', icon: 'XP' } },
  { level: 7, xpRequired: 1350, freeReward: { type: 'xp', label: '150 XP', icon: 'XP' }, premiumReward: { type: 'pack', label: 'Rare Pack', icon: 'R' } },
  { level: 8, xpRequired: 1750, freeReward: { type: 'pack', label: 'Uncommon Pack', icon: 'U' }, premiumReward: { type: 'avatar', label: 'Ranked Banner', icon: 'B' } },
  { level: 9, xpRequired: 2200, freeReward: { type: 'xp', label: '200 XP', icon: 'XP' }, premiumReward: { type: 'pack', label: 'Ultra Rare Pack', icon: 'UR' } },
  { level: 10, xpRequired: 2700, freeReward: { type: 'pack', label: 'Rare Pack', icon: 'R' }, premiumReward: { type: 'pokemon', label: 'Exclusive Pokemon', icon: 'EP' } },
];

interface DailyQuest {
  id: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  completed: boolean;
}

const SAMPLE_DAILIES: DailyQuest[] = [
  { id: '1', description: 'Win 1 battle', progress: 0, target: 1, xpReward: 30, completed: false },
  { id: '2', description: 'Use a Fire-type Pokemon', progress: 1, target: 1, xpReward: 20, completed: true },
  { id: '3', description: 'Play 3 battles', progress: 2, target: 3, xpReward: 25, completed: false },
];

const SAMPLE_WEEKLIES: DailyQuest[] = [
  { id: 'w1', description: 'Win 10 battles', progress: 4, target: 10, xpReward: 150, completed: false },
  { id: 'w2', description: 'Use 5 different Pokemon', progress: 3, target: 5, xpReward: 100, completed: false },
  { id: 'w3', description: 'Reach a 3 win streak', progress: 1, target: 3, xpReward: 120, completed: false },
];

export default function BattlePass() {
  const [currentXP] = useState(780);
  const [isPremium] = useState(false);

  const currentLevel = BATTLE_PASS_TIERS.filter(t => currentXP >= t.xpRequired).length;
  const nextTier = BATTLE_PASS_TIERS[currentLevel] || BATTLE_PASS_TIERS[BATTLE_PASS_TIERS.length - 1];
  const prevTier = BATTLE_PASS_TIERS[currentLevel - 1] || BATTLE_PASS_TIERS[0];
  const xpInCurrentLevel = currentXP - prevTier.xpRequired;
  const xpForNextLevel = nextTier.xpRequired - prevTier.xpRequired;
  const progressPercent = xpForNextLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 100;

  return (
    <div className="bp-page">
      {/* Header */}
      <div className="bp-header">
        <Link href="/" className="bp-back">&larr; Back</Link>
        <div className="bp-header-info">
          <h1 className="bp-title">Battle Pass</h1>
          <p className="bp-season">Season 1 &mdash; 15 days remaining</p>
        </div>
        {!isPremium && (
          <button className="bp-upgrade-btn">Upgrade to Premium</button>
        )}
      </div>

      {/* Level Progress */}
      <div className="bp-progress-section">
        <div className="bp-level-display">
          <span className="bp-level-badge">Lv {currentLevel}</span>
          <div className="bp-xp-bar">
            <div className="bp-xp-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="bp-xp-text">{currentXP} / {nextTier.xpRequired} XP</span>
        </div>
      </div>

      {/* Tier Track */}
      <div className="bp-track">
        <div className="bp-track-scroll">
          {BATTLE_PASS_TIERS.map((tier) => {
            const isUnlocked = currentXP >= tier.xpRequired;
            const isCurrent = tier.level === currentLevel;
            return (
              <div key={tier.level} className={`bp-tier ${isUnlocked ? 'unlocked' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="bp-tier-level">{tier.level}</div>

                {/* Premium reward */}
                <div className={`bp-reward premium ${!isPremium ? 'locked' : ''} ${isUnlocked && isPremium ? 'claimed' : ''}`}>
                  <span className="bp-reward-icon">{tier.premiumReward.icon}</span>
                  <span className="bp-reward-label">{tier.premiumReward.label}</span>
                  {!isPremium && <span className="bp-lock-badge">PRO</span>}
                </div>

                {/* Progress line */}
                <div className={`bp-tier-line ${isUnlocked ? 'filled' : ''}`} />

                {/* Free reward */}
                <div className={`bp-reward free ${isUnlocked ? 'claimed' : ''}`}>
                  <span className="bp-reward-icon">{tier.freeReward.icon}</span>
                  <span className="bp-reward-label">{tier.freeReward.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quests Section */}
      <div className="bp-quests">
        <div className="bp-quests-column">
          <h3 className="bp-quests-title">Daily Quests</h3>
          {SAMPLE_DAILIES.map(quest => (
            <div key={quest.id} className={`bp-quest ${quest.completed ? 'completed' : ''}`}>
              <div className="bp-quest-info">
                <span className="bp-quest-desc">{quest.description}</span>
                <div className="bp-quest-progress-bar">
                  <div className="bp-quest-progress-fill" style={{ width: `${(quest.progress / quest.target) * 100}%` }} />
                </div>
                <span className="bp-quest-progress-text">{quest.progress}/{quest.target}</span>
              </div>
              <span className="bp-quest-xp">+{quest.xpReward} XP</span>
            </div>
          ))}
        </div>
        <div className="bp-quests-column">
          <h3 className="bp-quests-title">Weekly Quests</h3>
          {SAMPLE_WEEKLIES.map(quest => (
            <div key={quest.id} className={`bp-quest ${quest.completed ? 'completed' : ''}`}>
              <div className="bp-quest-info">
                <span className="bp-quest-desc">{quest.description}</span>
                <div className="bp-quest-progress-bar">
                  <div className="bp-quest-progress-fill" style={{ width: `${(quest.progress / quest.target) * 100}%` }} />
                </div>
                <span className="bp-quest-progress-text">{quest.progress}/{quest.target}</span>
              </div>
              <span className="bp-quest-xp">+{quest.xpReward} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
