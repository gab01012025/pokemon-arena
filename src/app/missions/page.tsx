'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { logger } from '@/lib/logger';

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
      const json = await res.json();
      setMissionsData(json.data ?? json);
    } catch (err) {
      setError('Erro ao carregar missões');
      logger.error('Mission fetch error', err instanceof Error ? err : undefined);
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
      logger.error('Mission start error', err instanceof Error ? err : undefined);
    } finally {
      setStartingMission(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return '#64748b';
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#22c55e';
      case 'normal': return '#3b82f6';
      case 'hard': return '#f97316';
      case 'expert': return '#ef4444';
      default: return '#64748b';
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

  const currentMissions = missionsData?.grouped[selectedCategory] || [];

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/tutorial" className="nav-btn-top">Tutorial</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/missions" className="nav-btn-top">Missões</Link>
              <Link href="/unlock-pokemon" className="nav-btn-top">Desbloquear</Link>
              <Link href="/my-clan" className="nav-btn-top">Meu Clã</Link>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <div className="content-box">
            <div className="content-box-header">
              <h2>Missões</h2>
            </div>
            <div className="content-box-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  Carregando missões...
                </div>
              ) : error || !missionsData ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: '#ef4444', marginBottom: '12px' }}>{error || 'Erro ao carregar missões'}</p>
                  <Link href="/" style={{ color: '#60a5fa' }}>Voltar ao Início</Link>
                </div>
              ) : (
                <>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                    Complete missões para ganhar XP e desbloquear Pokémon.
                  </p>

                  {/* Category Tabs */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {missionsData.categories.map(category => {
                      const categoryMissions = missionsData.grouped[category] || [];
                      const completedCount = categoryMissions.filter(m => m.userStatus === 'completed').length;
                      const total = categoryMissions.length;
                      const isActive = selectedCategory === category;

                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: isActive ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            background: isActive ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                            color: isActive ? '#f87171' : '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                        >
                          {category}
                          <span style={{ marginLeft: '6px', opacity: 0.6, fontSize: '11px' }}>
                            {completedCount}/{total}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Missions List */}
                  {currentMissions.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
                      Nenhuma missão disponível nesta categoria.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentMissions.map(mission => {
                        const progress = calculateProgress(mission);
                        const canStart = mission.userStatus === 'available';
                        const isStarting = startingMission === mission.id;
                        const isLocked = mission.userStatus === 'locked';
                        const isCompleted = mission.userStatus === 'completed';

                        return (
                          <div
                            key={mission.id}
                            style={{
                              background: isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                              border: isCompleted
                                ? '1px solid rgba(34,197,94,0.2)'
                                : '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '8px',
                              padding: '14px',
                              opacity: isLocked ? 0.5 : 1,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                                {mission.name}
                              </h3>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: getDifficultyColor(mission.difficulty),
                                  color: '#fff',
                                }}>
                                  {mission.difficulty}
                                </span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(255,255,255,0.08)',
                                  color: isCompleted ? '#22c55e' : isLocked ? '#64748b' : '#f59e0b',
                                }}>
                                  {getStatusText(mission.userStatus)}
                                </span>
                              </div>
                            </div>

                            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: 1.5 }}>
                              {mission.description}
                            </p>

                            {/* Progress Bar */}
                            {mission.userStatus === 'in_progress' && (
                              <div style={{ marginBottom: '8px' }}>
                                <div style={{
                                  height: '4px',
                                  background: 'rgba(255,255,255,0.08)',
                                  borderRadius: '2px',
                                  overflow: 'hidden',
                                }}>
                                  <div style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                                    borderRadius: '2px',
                                    transition: 'width 0.3s',
                                  }} />
                                </div>
                                <span style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                                  {progress}% Completo
                                </span>
                              </div>
                            )}

                            {/* Objectives */}
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 600, color: '#cbd5e1' }}>Objetivos: </span>
                              {mission.objectives.wins && (
                                <span>
                                  Vencer {mission.objectives.wins} batalhas
                                  {mission.userProgress?.wins !== undefined && (
                                    <span style={{ color: '#f59e0b' }}> ({mission.userProgress.wins}/{mission.objectives.wins})</span>
                                  )}
                                </span>
                              )}
                              {mission.objectives.battles && (
                                <span>
                                  Completar {mission.objectives.battles} batalhas
                                  {mission.userProgress?.battles !== undefined && (
                                    <span style={{ color: '#f59e0b' }}> ({mission.userProgress.battles}/{mission.objectives.battles})</span>
                                  )}
                                </span>
                              )}
                              {mission.objectives.damage && (
                                <span>
                                  Causar {mission.objectives.damage} de dano
                                  {mission.userProgress?.damage !== undefined && (
                                    <span style={{ color: '#f59e0b' }}> ({mission.userProgress.damage}/{mission.objectives.damage})</span>
                                  )}
                                </span>
                              )}
                              {mission.objectives.useSkill && (
                                <span>Usar: {mission.objectives.useSkill}</span>
                              )}
                            </div>

                            {/* Rewards + Action */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>Recompensas:</span>
                              {mission.rewardExp > 0 && (
                                <span style={{
                                  fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                                  background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
                                }}>
                                  +{mission.rewardExp} XP
                                </span>
                              )}
                              {mission.rewardPokemon && (
                                <span style={{
                                  fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                                  background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                                }}>
                                  {mission.rewardPokemon}
                                </span>
                              )}
                              {mission.rewardItems && Object.entries(mission.rewardItems).map(([item, count]) => (
                                <span key={item} style={{
                                  fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                                  background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                                }}>
                                  {count}x {item}
                                </span>
                              ))}
                              {canStart && (
                                <button
                                  onClick={() => startMission(mission.id)}
                                  disabled={isStarting}
                                  style={{
                                    marginLeft: 'auto', padding: '4px 12px', fontSize: '10px', fontWeight: 600,
                                    borderRadius: '4px', border: '1px solid rgba(239,68,68,0.4)',
                                    background: 'rgba(239,68,68,0.12)', color: '#f87171',
                                    cursor: isStarting ? 'not-allowed' : 'pointer', opacity: isStarting ? 0.5 : 1,
                                  }}
                                >
                                  {isStarting ? 'Iniciando...' : 'Iniciar Missão'}
                                </button>
                              )}
                              {isCompleted && (
                                <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#22c55e' }}>
                                  Concluída
                                </span>
                              )}
                              {isLocked && (
                                <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#64748b' }}>
                                  Bloqueada
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
