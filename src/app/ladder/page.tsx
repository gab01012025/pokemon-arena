'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRankByLevel, RANKS, RankInfo } from '@/lib/ranks';

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

  // Use new rank system based on level
  const getTrainerRank = (level: number, position: number): RankInfo => {
    return getRankByLevel(level, position);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredTrainers = searchTerm
    ? trainers.filter(t => t.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    : trainers;

  return (
    <div className="ladder-page">
      {/* Header com info da temporada */}
      <div className="ladder-header">
        <div className="header-content">
          <h1>Ranking Global</h1>
          {season && (
            <div className="season-info">
              <span className="season-name">{season.name}</span>
              <span className="season-dates">
                {formatDate(season.startDate)} - {formatDate(season.endDate)}
              </span>
              <span className={`season-status ${season.isActive ? 'active' : ''}`}>
                {season.isActive ? 'Em andamento' : 'Encerrada'}
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
            <div className="my-rank-tier" style={{ background: getTrainerRank(myRank.level, myRank.rank).gradient }}>
              <Image 
                src={getTrainerRank(myRank.level, myRank.rank).badge}
                alt={getTrainerRank(myRank.level, myRank.rank).name}
                width={24}
                height={24}
                unoptimized
              />
              {getTrainerRank(myRank.level, myRank.rank).name}
            </div>
            <span className="my-rank-points">{myRank.ladderPoints} LP</span>
          </div>
        </div>
      )}

      {/* Tiers de ranking - Sistema baseado em Level */}
      <div className="rank-tiers">
        {RANKS.slice(0, 10).map((rank) => (
          <div 
            key={rank.tier}
            className="tier"
            style={{ background: rank.gradient, color: '#fff' }}
          >
            <Image 
              src={rank.badge} 
              alt={rank.name}
              width={24}
              height={24}
              unoptimized
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span>{rank.name}</span>
            <small>Lv.{rank.minLevel}-{rank.maxLevel}</small>
          </div>
        ))}
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
                  const rankInfo = getTrainerRank(trainer.level, trainer.rank);
                  
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
                            <span className="streak">{trainer.streak} wins</span>
                          )}
                        </div>
                      </td>
                      <td className="tier-cell">
                        <span 
                          className="tier-badge"
                          style={{ background: rankInfo.gradient }}
                        >
                          <Image 
                            src={rankInfo.badge} 
                            alt={rankInfo.name}
                            width={20}
                            height={20}
                            unoptimized
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          {rankInfo.name}
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
