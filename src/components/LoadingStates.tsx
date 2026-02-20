'use client';

import React from 'react';

// Generic Skeleton Component
export const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '' 
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}) => (
  <div 
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
  >
    <style jsx>{`
      .skeleton {
        background: linear-gradient(
          90deg,
          #f0f0f0 0%,
          #e0e0e0 50%,
          #f0f0f0 100%
        );
        background-size: 200% 100%;
        animation: loading 1.5s ease-in-out infinite;
      }

      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      @media (prefers-color-scheme: dark) {
        .skeleton {
          background: linear-gradient(
            90deg,
            #2d2d2d 0%,
            #3d3d3d 50%,
            #2d2d2d 100%
          );
        }
      }
    `}</style>
  </div>
);

// Pokemon Card Skeleton
export const PokemonCardSkeleton = () => (
  <div className="pokemon-card-skeleton">
    <Skeleton width="100%" height="120px" borderRadius="12px" />
    <div style={{ marginTop: '8px' }}>
      <Skeleton width="80%" height="16px" />
    </div>
    <div style={{ marginTop: '4px' }}>
      <Skeleton width="60%" height="12px" />
    </div>
  </div>
);

// Battle Arena Skeleton
export const BattleArenaSkeleton = () => (
  <div className="battle-arena-skeleton">
    {/* Top Bar */}
    <div className="skeleton-top-bar">
      <Skeleton width="150px" height="40px" borderRadius="8px" />
      <Skeleton width="200px" height="40px" borderRadius="8px" />
      <Skeleton width="150px" height="40px" borderRadius="8px" />
    </div>

    {/* Battle Area */}
    <div className="skeleton-battle-area">
      {/* Enemy Team */}
      <div className="skeleton-team">
        {[1, 2, 3].map(i => (
          <div key={`enemy-${i}`} className="skeleton-pokemon">
            <Skeleton width="100%" height="100px" borderRadius="12px" />
          </div>
        ))}
      </div>

      {/* VS */}
      <div className="skeleton-vs">
        <Skeleton width="60px" height="60px" borderRadius="50%" />
      </div>

      {/* Player Team */}
      <div className="skeleton-team">
        {[1, 2, 3].map(i => (
          <div key={`player-${i}`} className="skeleton-pokemon">
            <Skeleton width="100%" height="100px" borderRadius="12px" />
          </div>
        ))}
      </div>
    </div>

    {/* Bottom Controls */}
    <div className="skeleton-controls">
      <Skeleton width="100%" height="100px" borderRadius="12px" />
    </div>

    <style jsx>{`
      .battle-arena-skeleton {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 16px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      }

      .skeleton-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
      }

      .skeleton-battle-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 24px;
      }

      .skeleton-team {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      .skeleton-pokemon {
        width: 100%;
      }

      .skeleton-vs {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .skeleton-controls {
        padding: 16px;
      }

      @media (max-width: 768px) {
        .skeleton-battle-area {
          flex-direction: column;
        }

        .skeleton-team {
          flex-direction: row;
          width: 100%;
        }
      }
    `}</style>
  </div>
);

// Loading Spinner
export const LoadingSpinner = ({ 
  size = 40, 
  color = '#667eea',
  text = 'Loading...' 
}: {
  size?: number;
  color?: string;
  text?: string;
}) => (
  <div className="loading-spinner-container">
    <div className="spinner" style={{ width: size, height: size, borderColor: `${color}33`, borderTopColor: color }} />
    {text && <p className="loading-text">{text}</p>}

    <style jsx>{`
      .loading-spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 24px;
      }

      .spinner {
        border: 3px solid;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-text {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
    `}</style>
  </div>
);

// Pokeball Loading Animation
export const PokeballLoader = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="pokeball-loader-container">
    <div className="pokeball">
      <div className="pokeball-button" />
    </div>
    {text && <p className="loading-text">{text}</p>}

    <style jsx>{`
      .pokeball-loader-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 40px;
      }

      .pokeball {
        width: 60px;
        height: 60px;
        background: linear-gradient(180deg, #ff1a1a 50%, #fff 50%);
        border-radius: 50%;
        border: 4px solid #333;
        position: relative;
        animation: pokeball-spin 1s ease-in-out infinite;
      }

      .pokeball-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        border: 4px solid #333;
      }

      @keyframes pokeball-spin {
        0% { transform: rotate(0deg); }
        50% { transform: rotate(180deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-text {
        font-family: 'Press Start 2P', monospace;
        font-size: 12px;
        color: #fff;
        text-shadow: 0 0 10px rgba(100, 200, 255, 0.5);
        margin: 0;
      }
    `}</style>
  </div>
);

// Page Loading Overlay
export const PageLoadingOverlay = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="page-loading-overlay">
    <PokeballLoader text={text} />

    <style jsx>{`
      .page-loading-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

// Progress Bar
export const ProgressBar = ({ 
  progress, 
  color = '#667eea',
  height = '4px',
  showPercentage = false 
}: {
  progress: number;
  color?: string;
  height?: string;
  showPercentage?: boolean;
}) => (
  <div className="progress-container">
    <div className="progress-bar" style={{ height }}>
      <div 
        className="progress-fill" 
        style={{ 
          width: `${Math.min(100, Math.max(0, progress))}%`,
          background: color 
        }} 
      />
    </div>
    {showPercentage && (
      <span className="progress-text">{Math.round(progress)}%</span>
    )}

    <style jsx>{`
      .progress-container {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .progress-bar {
        flex: 1;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 999px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 999px;
      }

      .progress-text {
        font-size: 12px;
        font-weight: 600;
        color: #666;
        min-width: 40px;
        text-align: right;
      }
    `}</style>
  </div>
);
