'use client';

import Image from 'next/image';
import { RankInfo, getRankByLevel, getRankByTier, RankTier } from '@/lib/ranks';
import './RankBadge.css';

interface RankBadgeProps {
  level?: number;
  tier?: RankTier;
  ladderPosition?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showLevel?: boolean;
  animated?: boolean;
}

export default function RankBadge({
  level,
  tier,
  ladderPosition,
  size = 'md',
  showName = false,
  showLevel = false,
  animated = false,
}: RankBadgeProps) {
  const rank: RankInfo = tier 
    ? getRankByTier(tier) 
    : getRankByLevel(level || 1, ladderPosition);
  
  const sizeClasses = {
    sm: 'rank-badge-sm',
    md: 'rank-badge-md',
    lg: 'rank-badge-lg',
    xl: 'rank-badge-xl',
  };

  const sizePx = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  return (
    <div 
      className={`rank-badge ${sizeClasses[size]} ${animated ? 'rank-badge-animated' : ''}`}
      style={{ '--rank-glow': rank.glow, '--rank-color': rank.color } as React.CSSProperties}
      title={`${rank.name}${level ? ` - Level ${level}` : ''}`}
    >
      <div className="rank-badge-icon">
        <Image 
          src={rank.badge} 
          alt={rank.name}
          width={sizePx[size]}
          height={sizePx[size]}
          unoptimized
          onError={(e) => {
            // Fallback to placeholder if image fails
            (e.target as HTMLImageElement).src = '/images/badges/placeholder.png';
          }}
        />
      </div>
      {showName && (
        <span className="rank-badge-name" style={{ color: rank.color }}>
          {rank.name}
        </span>
      )}
      {showLevel && level && (
        <span className="rank-badge-level">Lv.{level}</span>
      )}
    </div>
  );
}

// Crown component to show above character
interface RankCrownProps {
  level?: number;
  tier?: RankTier;
  ladderPosition?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RankCrown({ level, tier, ladderPosition, size = 'md' }: RankCrownProps) {
  const rank: RankInfo = tier 
    ? getRankByTier(tier) 
    : getRankByLevel(level || 1, ladderPosition);

  const sizePx = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  return (
    <div className={`rank-crown rank-crown-${size}`}>
      <Image 
        src={rank.crown} 
        alt={`${rank.name} Crown`}
        width={sizePx[size]}
        height={sizePx[size]}
        unoptimized
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
