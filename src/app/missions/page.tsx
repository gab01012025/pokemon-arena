'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Mission {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  requirements: {
    level?: number;
    wins?: number;
    pokemon?: string[];
  };
  objectives: {
    wins?: number;
    useSkill?: string;
    damage?: number;
    battles?: number;
  };
  rewardExp: number;
  rewardPokemon: string | null;
  rewardItems: Record<string, number> | null;
  userStatus: string;
  userProgress: Record<string, number> | null;
}

interface MissionsData {
  missions: Mission[];
  grouped: Record<string, Mission[]>;
  categories: string[];
}

export default function MissionsPage() {
  const router = useRouter();
  const [missionsData, setMissionsData] = useState<MissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Daily');
  const [startingMission, setStartingMission] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch('/api/missions?myProgress=true');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Falha ao carregar missões');
      }
      const data = await res.json();
      setMissionsData(data);
    } catch (err) {
      setError('Erro ao carregar missões');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const startMission = async (missionId: string) => {
    setStartingMission(missionId);
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao iniciar missão');
        return;
      }

      alert('Missão iniciada! Boa sorte!');
      fetchMissions();
    } catch (err) {
      alert('Erro ao iniciar missão');
      console.error(err);
    } finally {
      setStartingMission(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return '#9ca3af';
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4ade80';
      case 'normal': return '#60a5fa';
      case 'hard': return '#f97316';
      case 'expert': return '#dc2626';
      default: return '#9ca3af';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#eab308';
      case 'available': return '#3b82f6';
      case 'locked': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Progresso';
      case 'available': return 'Disponível';
      case 'locked': return 'Bloqueada';
      default: return status;
    }
  };

  const calculateProgress = (mission: Mission): number => {
    if (mission.userStatus === 'completed') return 100;
    if (!mission.userProgress) return 0;

    const objectives = mission.objectives;
    const progress = mission.userProgress;
    
    let completed = 0;
    let total = 0;

    Object.keys(objectives).forEach(key => {
      const target = objectives[key as keyof typeof objectives];
      const current = progress[key] || 0;
      if (typeof target === 'number') {
        completed += Math.min(current, target);
        total += target;
      }
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="missions-page">
        <div className="loading-container">
          <div className="pokeball-loader large" />
          <p>Carregando missões...</p>
        </div>
      </div>
    );
  }

  if (error || !missionsData) {
    return (
      <div className="missions-page">
        <div className="error-container">
          <h2>❌ Erro</h2>
          <p>{error || 'Erro ao carregar missões'}</p>
          <button onClick={() => router.push('/')}>Voltar ao Início</button>
        </div>
      </div>
    );
  }

  const currentMissions = missionsData.grouped[selectedCategory] || [];

  return (
    <div className="missions-page">
      <div className="missions-header">
        <div className="header-content">
          <Link href="/" className="back-button">← Voltar</Link>
          <h1>📋 Missões</h1>
          <p>Complete missões para ganhar XP e desbloquear Pokémon!</p>
        </div>
      </div>

      <div className="missions-container">
        {/* Category Tabs */}
        <div className="category-tabs">
          {missionsData.categories.map(category => {
            const categoryMissions = missionsData.grouped[category] || [];
            const completed = categoryMissions.filter(m => m.userStatus === 'completed').length;
            const total = categoryMissions.length;

            return (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="category-name">{category}</span>
                <span className="category-count">{completed}/{total}</span>
              </button>
            );
          })}
        </div>

        {/* Missions List */}
        <div className="missions-list">
          {currentMissions.length === 0 ? (
            <div className="no-missions">
              <p>Nenhuma missão disponível nesta categoria</p>
            </div>
          ) : (
            currentMissions.map(mission => {
              const progress = calculateProgress(mission);
              const canStart = mission.userStatus === 'locked' || mission.userStatus === 'available';
              const isStarting = startingMission === mission.id;

              return (
                <div key={mission.id} className={`mission-card ${mission.userStatus}`}>
                  <div className="mission-header">
                    <div className="mission-title-section">
                      <h3>{mission.name}</h3>
                      <div className="mission-badges">
                        <span 
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(mission.difficulty) }}
                        >
                          {mission.difficulty}
                        </span>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(mission.userStatus) }}
                        >
                          {getStatusText(mission.userStatus)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mission-description">{mission.description}</p>

                  {/* Progress Bar */}
                  {mission.userStatus === 'in_progress' && (
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{progress}% Completo</span>
                    </div>
                  )}

                  {/* Requirements */}
                  {mission.requirements && Object.keys(mission.requirements).length > 0 && (
                    <div className="mission-requirements">
                      <h4>📌 Requisitos:</h4>
                      <ul>
                        {mission.requirements.level && (
                          <li>Nível {mission.requirements.level}</li>
                        )}
                        {mission.requirements.wins && (
                          <li>{mission.requirements.wins} vitórias</li>
                        )}
                        {mission.requirements.pokemon && (
                          <li>Pokémon: {mission.requirements.pokemon.join(', ')}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Objectives */}
                  <div className="mission-objectives">
                    <h4>🎯 Objetivos:</h4>
                    <ul>
                      {mission.objectives.wins && (
                        <li>
                          Vencer {mission.objectives.wins} batalhas
                          {mission.userProgress && mission.userProgress.wins !== undefined && (
                            <span className="objective-progress">
                              ({mission.userProgress.wins}/{mission.objectives.wins})
                            </span>
                          )}
                        </li>
                      )}
                      {mission.objectives.battles && (
                        <li>
                          Completar {mission.objectives.battles} batalhas
                          {mission.userProgress && mission.userProgress.battles !== undefined && (
                            <span className="objective-progress">
                              ({mission.userProgress.battles}/{mission.objectives.battles})
                            </span>
                          )}
                        </li>
                      )}
                      {mission.objectives.damage && (
                        <li>
                          Causar {mission.objectives.damage} de dano total
                          {mission.userProgress && mission.userProgress.damage !== undefined && (
                            <span className="objective-progress">
                              ({mission.userProgress.damage}/{mission.objectives.damage})
                            </span>
                          )}
                        </li>
                      )}
                      {mission.objectives.useSkill && (
                        <li>Usar a habilidade: {mission.objectives.useSkill}</li>
                      )}
                    </ul>
                  </div>

                  {/* Rewards */}
                  <div className="mission-rewards">
                    <h4>🎁 Recompensas:</h4>
                    <div className="rewards-list">
                      {mission.rewardExp > 0 && (
                        <span className="reward-item exp">+{mission.rewardExp} XP</span>
                      )}
                      {mission.rewardPokemon && (
                        <span className="reward-item pokemon">
                          🔓 {mission.rewardPokemon}
                        </span>
                      )}
                      {mission.rewardItems && Object.entries(mission.rewardItems).map(([item, count]) => (
                        <span key={item} className="reward-item item">
                          {count}x {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {canStart && mission.userStatus !== 'locked' && (
                    <button
                      className="start-mission-btn"
                      onClick={() => startMission(mission.id)}
                      disabled={isStarting}
                    >
                      {isStarting ? 'Iniciando...' : 'Iniciar Missão'}
                    </button>
                  )}

                  {mission.userStatus === 'completed' && (
                    <div className="completed-badge">
                      ✅ Missão Concluída!
                    </div>
                  )}

                  {mission.userStatus === 'locked' && (
                    <div className="locked-overlay">
                      🔒 Bloqueada
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
