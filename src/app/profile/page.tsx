'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PokemonSprite } from '@/components/PokemonSprite';
import { getTypeColor } from '@/lib/pokemon-images';
import Link from 'next/link';

interface TrainerProfile {
  id: number;
  username: string;
  email: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  ladderPoints: number;
  createdAt: string;
  clan?: {
    id: number;
    name: string;
    tag: string;
  };
  team?: {
    id: number;
    name: string;
    pokemon: Array<{
      id: number;
      pokemon: {
        id: number;
        name: string;
        type: string;
        hp: number;
        attack: number;
        defense: number;
        speed: number;
      };
    }>;
  };
  recentBattles?: Array<{
    id: number;
    result: 'win' | 'loss';
    opponent: string;
    date: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'history' | 'achievements'>('overview');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/trainer/profile');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      setProfile(data);
    } catch {
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="pokeball-loader large" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <p>{error || 'Perfil não encontrado'}</p>
          <Link href="/play" className="btn btn-primary">Voltar</Link>
        </div>
      </div>
    );
  }

  const expToNextLevel = profile.level * 1000;
  const expProgress = (profile.experience / expToNextLevel) * 100;
  const winRate = profile.wins + profile.losses > 0 
    ? ((profile.wins / (profile.wins + profile.losses)) * 100).toFixed(1)
    : '0.0';

  const getRankTier = (points: number) => {
    if (points >= 2000) return { name: 'Champion', color: '#FFD700', icon: '🏆' };
    if (points >= 1500) return { name: 'Master', color: '#E74C3C', icon: '💎' };
    if (points >= 1200) return { name: 'Expert', color: '#9B59B6', icon: '⭐' };
    if (points >= 900) return { name: 'Advanced', color: '#3498DB', icon: '🔷' };
    if (points >= 600) return { name: 'Intermediate', color: '#2ECC71', icon: '🔹' };
    if (points >= 300) return { name: 'Beginner', color: '#95A5A6', icon: '▫️' };
    return { name: 'Rookie', color: '#BDC3C7', icon: '⚪' };
  };

  const rank = getRankTier(profile.ladderPoints);

  return (
    <div className="profile-page">
      {/* Header com Info Principal */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-frame">
            <Image
              src="/images/trainer-avatar.png"
              alt="Trainer"
              width={120}
              height={120}
              className="avatar-img"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`;
              }}
            />
          </div>
          <div className="level-badge">Lv.{profile.level}</div>
        </div>

        <div className="profile-info">
          <h1 className="username">
            {profile.username}
            {profile.clan && (
              <span className="clan-tag">[{profile.clan.tag}]</span>
            )}
          </h1>
          
          <div className="rank-display" style={{ color: rank.color }}>
            <span className="rank-icon">{rank.icon}</span>
            <span className="rank-name">{rank.name}</span>
            <span className="rank-points">({profile.ladderPoints} LP)</span>
          </div>

          <div className="exp-bar">
            <div className="exp-label">
              <span>EXP</span>
              <span>{profile.experience} / {expToNextLevel}</span>
            </div>
            <div className="exp-progress">
              <div className="exp-fill" style={{ width: `${expProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="profile-stats-quick">
          <div className="stat-box wins">
            <span className="stat-number">{profile.wins}</span>
            <span className="stat-label">Vitórias</span>
          </div>
          <div className="stat-box losses">
            <span className="stat-number">{profile.losses}</span>
            <span className="stat-label">Derrotas</span>
          </div>
          <div className="stat-box winrate">
            <span className="stat-number">{winRate}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Visão Geral
        </button>
        <button 
          className={`tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          Meu Time
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico
        </button>
        <button 
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Conquistas
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="profile-content">
        {/* Tab: Visão Geral */}
        {activeTab === 'overview' && (
          <div className="tab-content overview">
            <div className="content-grid">
              {/* Card: Time Atual */}
              <div className="profile-card">
                <h3>Time Atual</h3>
                {profile.team ? (
                  <div className="current-team">
                    {profile.team.pokemon.map((tp) => (
                      <div key={tp.id} className="team-member">
                        <PokemonSprite
                          name={tp.pokemon.name}
                          pokemonId={tp.pokemon.id}
                          size="medium"
                          spriteType="artwork"
                        />
                        <span className="pokemon-name">{tp.pokemon.name}</span>
                        <span 
                          className="pokemon-type"
                          style={{ backgroundColor: getTypeColor(tp.pokemon.type).bg }}
                        >
                          {tp.pokemon.type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-team">
                    <p>Você ainda não selecionou um time!</p>
                    <Link href="/select-team" className="btn btn-primary">
                      Selecionar Time
                    </Link>
                  </div>
                )}
              </div>

              {/* Card: Estatísticas */}
              <div className="profile-card">
                <h3>Estatísticas</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{profile.wins + profile.losses}</span>
                    <span className="stat-name">Batalhas Totais</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{profile.wins}</span>
                    <span className="stat-name">Vitórias</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{profile.losses}</span>
                    <span className="stat-name">Derrotas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{winRate}%</span>
                    <span className="stat-name">Taxa de Vitória</span>
                  </div>
                  <div className="stat-item highlight">
                    <span className="stat-value">{profile.ladderPoints}</span>
                    <span className="stat-name">Ladder Points</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{rank.name}</span>
                    <span className="stat-name">Rank</span>
                  </div>
                </div>
              </div>

              {/* Card: Clã */}
              <div className="profile-card">
                <h3>Clã</h3>
                {profile.clan ? (
                  <div className="clan-info">
                    <div className="clan-emblem">
                      <span className="clan-tag-large">{profile.clan.tag}</span>
                    </div>
                    <span className="clan-name">{profile.clan.name}</span>
                    <Link href={`/clan/${profile.clan.id}`} className="btn btn-secondary">
                      Ver Clã
                    </Link>
                  </div>
                ) : (
                  <div className="no-clan">
                    <p>Você não faz parte de nenhum clã</p>
                    <Link href="/clans" className="btn btn-secondary">
                      Procurar Clãs
                    </Link>
                  </div>
                )}
              </div>

              {/* Card: Info da Conta */}
              <div className="profile-card">
                <h3>Informações da Conta</h3>
                <div className="account-info">
                  <div className="info-row">
                    <span className="info-label">Membro desde</span>
                    <span className="info-value">
                      {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profile.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ID do Treinador</span>
                    <span className="info-value">#{profile.id.toString().padStart(6, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Meu Time */}
        {activeTab === 'team' && (
          <div className="tab-content team">
            {profile.team ? (
              <div className="team-detail-view">
                <h2>Time: {profile.team.name}</h2>
                <div className="team-members-grid">
                  {profile.team.pokemon.map((tp, index) => (
                    <div key={tp.id} className="team-member-card">
                      <div className="member-number">#{index + 1}</div>
                      <div className="member-image">
                        <PokemonSprite
                          name={tp.pokemon.name}
                          pokemonId={tp.pokemon.id}
                          size="large"
                          spriteType="artwork"
                        />
                      </div>
                      <h3>{tp.pokemon.name}</h3>
                      <span 
                        className="type-badge"
                        style={{ 
                          backgroundColor: getTypeColor(tp.pokemon.type).bg,
                          color: getTypeColor(tp.pokemon.type).text
                        }}
                      >
                        {tp.pokemon.type}
                      </span>
                      <div className="member-stats">
                        <div className="stat-row">
                          <span>HP</span>
                          <div className="stat-bar">
                            <div 
                              className="stat-fill hp" 
                              style={{ width: `${(tp.pokemon.hp / 200) * 100}%` }}
                            />
                          </div>
                          <span>{tp.pokemon.hp}</span>
                        </div>
                        <div className="stat-row">
                          <span>ATK</span>
                          <div className="stat-bar">
                            <div 
                              className="stat-fill atk" 
                              style={{ width: `${(tp.pokemon.attack / 150) * 100}%` }}
                            />
                          </div>
                          <span>{tp.pokemon.attack}</span>
                        </div>
                        <div className="stat-row">
                          <span>DEF</span>
                          <div className="stat-bar">
                            <div 
                              className="stat-fill def" 
                              style={{ width: `${(tp.pokemon.defense / 150) * 100}%` }}
                            />
                          </div>
                          <span>{tp.pokemon.defense}</span>
                        </div>
                        <div className="stat-row">
                          <span>SPD</span>
                          <div className="stat-bar">
                            <div 
                              className="stat-fill spd" 
                              style={{ width: `${(tp.pokemon.speed / 150) * 100}%` }}
                            />
                          </div>
                          <span>{tp.pokemon.speed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="team-actions">
                  <Link href="/select-team" className="btn btn-primary">
                    Trocar Time
                  </Link>
                </div>
              </div>
            ) : (
              <div className="no-team-message">
                <h2>Nenhum time selecionado</h2>
                <p>Selecione seu time inicial para começar a batalhar!</p>
                <Link href="/select-team" className="btn btn-primary btn-large">
                  Selecionar Time Inicial
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Histórico */}
        {activeTab === 'history' && (
          <div className="tab-content history">
            <h2>Histórico de Batalhas</h2>
            {profile.recentBattles && profile.recentBattles.length > 0 ? (
              <div className="battle-history">
                {profile.recentBattles.map((battle) => (
                  <div 
                    key={battle.id} 
                    className={`battle-record ${battle.result}`}
                  >
                    <div className="battle-result-icon">
                      {battle.result === 'win' ? '🏆' : '❌'}
                    </div>
                    <div className="battle-info">
                      <span className="battle-result-text">
                        {battle.result === 'win' ? 'Vitória' : 'Derrota'}
                      </span>
                      <span className="battle-opponent">vs {battle.opponent}</span>
                    </div>
                    <div className="battle-date">
                      {new Date(battle.date).toLocaleDateString('pt-BR')}
                    </div>
                    <Link href={`/battle/${battle.id}/replay`} className="btn btn-small">
                      Ver Replay
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <p>Nenhuma batalha registrada ainda.</p>
                <Link href="/play" className="btn btn-primary">
                  Jogar Agora
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Conquistas */}
        {activeTab === 'achievements' && (
          <div className="tab-content achievements">
            <h2>Conquistas</h2>
            <div className="achievements-grid">
              <div className={`achievement ${profile.wins >= 1 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🎖️</div>
                <div className="achievement-info">
                  <h4>Primeira Vitória</h4>
                  <p>Vença sua primeira batalha</p>
                </div>
              </div>
              <div className={`achievement ${profile.wins >= 10 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">⚔️</div>
                <div className="achievement-info">
                  <h4>Guerreiro</h4>
                  <p>Vença 10 batalhas</p>
                </div>
                <div className="achievement-progress">{Math.min(profile.wins, 10)}/10</div>
              </div>
              <div className={`achievement ${profile.wins >= 50 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🏆</div>
                <div className="achievement-info">
                  <h4>Campeão</h4>
                  <p>Vença 50 batalhas</p>
                </div>
                <div className="achievement-progress">{Math.min(profile.wins, 50)}/50</div>
              </div>
              <div className={`achievement ${profile.wins >= 100 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">👑</div>
                <div className="achievement-info">
                  <h4>Lenda</h4>
                  <p>Vença 100 batalhas</p>
                </div>
                <div className="achievement-progress">{Math.min(profile.wins, 100)}/100</div>
              </div>
              <div className={`achievement ${profile.ladderPoints >= 1000 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">📈</div>
                <div className="achievement-info">
                  <h4>Escalada</h4>
                  <p>Alcance 1000 Ladder Points</p>
                </div>
              </div>
              <div className={`achievement ${profile.level >= 10 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">⭐</div>
                <div className="achievement-info">
                  <h4>Veterano</h4>
                  <p>Alcance nível 10</p>
                </div>
              </div>
              <div className={`achievement ${profile.clan ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🛡️</div>
                <div className="achievement-info">
                  <h4>Aliado</h4>
                  <p>Entre em um clã</p>
                </div>
              </div>
              <div className={`achievement locked`}>
                <div className="achievement-icon">🔥</div>
                <div className="achievement-info">
                  <h4>Invicto</h4>
                  <p>Vença 5 batalhas seguidas</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ações do Perfil */}
      <div className="profile-actions">
        <Link href="/play" className="btn btn-primary">
          Voltar ao Jogo
        </Link>
        <Link href="/settings" className="btn btn-secondary">
          Configurações
        </Link>
      </div>
    </div>
  );
}
