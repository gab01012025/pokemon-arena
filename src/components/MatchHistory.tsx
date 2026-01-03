'use client';

import { useState, useEffect } from 'react';
import './match-history.css';

interface MatchHistoryItem {
  id: string;
  opponent: {
    username: string;
    level: number;
    avatar: string;
  };
  result: 'victory' | 'defeat';
  turns: number;
  battleType: string;
  date: string;
  duration: number | null;
}

interface MatchHistoryProps {
  limit?: number;
  showPagination?: boolean;
  compact?: boolean;
}

export default function MatchHistory({ limit = 5, showPagination = false, compact = false }: MatchHistoryProps) {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMatches();
  }, [offset, limit]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/battle/history?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view match history');
          return;
        }
        throw new Error('Failed to fetch match history');
      }
      
      const data = await response.json();
      setMatches(data.history);
      setHasMore(data.pagination.hasMore);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && matches.length === 0) {
    return (
      <div className="match-history-loading">
        <div className="loading-spinner"></div>
        <span>Loading match history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-history-error">
        <span>⚠️ {error}</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="match-history-empty">
        <span>🎮 No battles yet</span>
        <p>Start playing to see your match history!</p>
      </div>
    );
  }

  return (
    <div className={`match-history ${compact ? 'compact' : ''}`}>
      <div className="match-history-header">
        <h3>⚔️ Recent Battles</h3>
        {total > 0 && <span className="match-count">{total} total</span>}
      </div>
      
      <div className="match-list">
        {matches.map((match) => (
          <div 
            key={match.id} 
            className={`match-item ${match.result}`}
          >
            <div className="match-result-indicator">
              {match.result === 'victory' ? '🏆' : '💀'}
            </div>
            
            <div className="match-opponent">
              <span className="opponent-name">{match.opponent.username}</span>
              <span className="opponent-level">Lv.{match.opponent.level}</span>
            </div>
            
            <div className="match-details">
              <span className="match-turns">{match.turns} turns</span>
              <span className="match-duration">{formatDuration(match.duration)}</span>
              <span className="match-type">{match.battleType}</span>
            </div>
            
            <div className="match-date">
              {formatDate(match.date)}
            </div>
          </div>
        ))}
      </div>
      
      {showPagination && (
        <div className="match-pagination">
          <button 
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            {offset + 1} - {Math.min(offset + limit, total)} of {total}
          </span>
          <button 
            onClick={() => setOffset(offset + limit)}
            disabled={!hasMore}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
