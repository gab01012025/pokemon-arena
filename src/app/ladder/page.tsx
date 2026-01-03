'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TrainerRanking {
  id: number;
  username: string;
  level: number;
  ladderPoints: number;
  wins: number;
  losses: number;
  winRate: number;
  rank: number;
  streak: number;
  maxStreak: number;
  clan?: string;
  clanTag?: string;
}

interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function LadderPage() {
  const [trainers, setTrainers] = useState<TrainerRanking[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [myRank] = useState<TrainerRanking | null>(null);

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ladder?page=${page}&limit=20`);
      const data = await res.json();
      
      setTrainers(data.trainers);
      setTotalPages(data.pagination?.totalPages || 1);
      
      // Buscar info da temporada separadamente
      try {
        const seasonRes = await fetch('/api/seasons/current');
        if (seasonRes.ok) {
          const seasonData = await seasonRes.json();
          setSeason(seasonData);
        }
      } catch {
        // Ignora erro de temporada
      }
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const getRankTier = (points: number) => {
    if (points >= 2000) return { name: 'Champion', color: '#FFD700', icon: '🏆', bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' };
    if (points >= 1500) return { name: 'Master', color: '#E74C3C', icon: '💎', bg: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)' };
    if (points >= 1200) return { name: 'Expert', color: '#9B59B6', icon: '⭐', bg: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)' };
    if (points >= 900) return { name: 'Advanced', color: '#3498DB', icon: '🔷', bg: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)' };
    if (points >= 600) return { name: 'Intermediate', color: '#2ECC71', icon: '🔹', bg: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' };
    if (points >= 300) return { name: 'Beginner', color: '#95A5A6', icon: '▫️', bg: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)' };
    return { name: 'Rookie', color: '#BDC3C7', icon: '⚪', bg: 'linear-gradient(135deg, #BDC3C7 0%, #A6ACAF 100%)' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredTrainers = searchTerm
    ? trainers.filter(t => t.username.toLowerCase().includes(searchTerm.toLowerCase()))
    : trainers;

  return (
    <div className="ladder-page">
      {/* Header com info da temporada */}
      <div className="ladder-header">
        <div className="header-content">
          <h1>🏆 Ranking Global</h1>
          {season && (
            <div className="season-info">
              <span className="season-name">{season.name}</span>
              <span className="season-dates">
                {formatDate(season.startDate)} - {formatDate(season.endDate)}
              </span>
              <span className={`season-status ${season.isActive ? 'active' : ''}`}>
                {season.isActive ? '🔴 Em andamento' : 'Encerrada'}
              </span>
            </div>
          )}
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar treinador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Minha posição no ranking */}
      {myRank && (
        <div className="my-rank-card">
          <div className="my-rank-header">Sua Posição</div>
          <div className="my-rank-content">
            <span className="my-rank-position">#{myRank.rank}</span>
            <span className="my-rank-name">{myRank.username}</span>
            <div className="my-rank-tier" style={{ background: getRankTier(myRank.ladderPoints).bg }}>
              {getRankTier(myRank.ladderPoints).icon} {getRankTier(myRank.ladderPoints).name}
            </div>
            <span className="my-rank-points">{myRank.ladderPoints} LP</span>
          </div>
        </div>
      )}

      {/* Tiers de ranking */}
      <div className="rank-tiers">
        <div className="tier champion"><span>🏆</span> Champion (2000+)</div>
        <div className="tier master"><span>💎</span> Master (1500+)</div>
        <div className="tier expert"><span>⭐</span> Expert (1200+)</div>
        <div className="tier advanced"><span>🔷</span> Advanced (900+)</div>
        <div className="tier intermediate"><span>🔹</span> Intermediate (600+)</div>
        <div className="tier beginner"><span>▫️</span> Beginner (300+)</div>
        <div className="tier rookie"><span>⚪</span> Rookie</div>
      </div>

      {/* Tabela de ranking */}
      <div className="ranking-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="pokeball-loader large" />
            <p>Carregando ranking...</p>
          </div>
        ) : (
          <>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Treinador</th>
                  <th>Time</th>
                  <th>Tier</th>
                  <th>LP</th>
                  <th>V/D</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainers.map((trainer) => {
                  const tier = getRankTier(trainer.ladderPoints);
                  
                  return (
                    <tr 
                      key={trainer.id}
                      className={`rank-row ${trainer.rank <= 3 ? `top-${trainer.rank}` : ''} ${myRank?.id === trainer.id ? 'is-me' : ''}`}
                    >
                      <td className="rank-cell">
                        {trainer.rank <= 3 ? (
                          <span className={`medal rank-${trainer.rank}`}>
                            {trainer.rank === 1 ? '🥇' : trainer.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="rank-number">{trainer.rank}</span>
                        )}
                      </td>
                      <td className="trainer-cell">
                        <div className="trainer-info">
                          <span className="trainer-name">
                            {trainer.username}
                            {trainer.clanTag && (
                              <span className="clan-tag">[{trainer.clanTag}]</span>
                            )}
                          </span>
                          <span className="trainer-level">Lv.{trainer.level}</span>
                        </div>
                      </td>
                      <td className="team-cell">
                        <div className="streak-info">
                          {trainer.streak > 0 && (
                            <span className="streak">🔥 {trainer.streak}</span>
                          )}
                        </div>
                      </td>
                      <td className="tier-cell">
                        <span 
                          className="tier-badge"
                          style={{ background: tier.bg }}
                        >
                          {tier.icon} {tier.name}
                        </span>
                      </td>
                      <td className="lp-cell">
                        <span className="lp-value">{trainer.ladderPoints}</span>
                      </td>
                      <td className="record-cell">
                        <span className="wins">{trainer.wins}</span>
                        <span className="separator">/</span>
                        <span className="losses">{trainer.losses}</span>
                      </td>
                      <td className="winrate-cell">
                        <div className="winrate-bar">
                          <div 
                            className="winrate-fill"
                            style={{ 
                              width: `${trainer.winRate}%`,
                              backgroundColor: trainer.winRate >= 60 
                                ? '#4CAF50' 
                                : trainer.winRate >= 50 
                                  ? '#FFCB05' 
                                  : '#F44336'
                            }}
                          />
                        </div>
                        <span className="winrate-text">{trainer.winRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  ← Anterior
                </button>
                
                <span className="pagination-info">
                  Página {page} de {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Voltar */}
      <div className="ladder-actions">
        <Link href="/play" className="btn btn-primary">
          Voltar ao Jogo
        </Link>
      </div>
    </div>
  );
}
