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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

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
          <p>{error || 'Perfil nao encontrado'}</p>
          <Link href="/play" className="btn btn-primary">Voltar</Link>
        </div>
      </div>
    );
  }

  const expToNextLevel = profile.level * 1000;
  const expProgress = (profile.experience / expToNextLevel) * 100;
  const totalBattles = profile.wins + profile.losses;
  const winRate = totalBattles > 0
    ? ((profile.wins / totalBattles) * 100).toFixed(1)
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

  const handleResetAccount = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/trainer/reset', { method: 'POST' });
      if (res.ok) {
        localStorage.clear();
        router.push('/login');
      }
    } catch {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Header */}
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
      </div>

      {/* Stats Row */}
      <div className="profile-content">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{profile.wins}</span>
            <span className="stat-name">Wins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{profile.losses}</span>
            <span className="stat-name">Losses</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{winRate}%</span>
            <span className="stat-name">Win Rate</span>
          </div>
          <div className="stat-item highlight">
            <span className="stat-value">{profile.ladderPoints}</span>
            <span className="stat-name">Ladder Points</span>
          </div>
        </div>

        {/* Team */}
        <div className="profile-card">
          <h3>Team</h3>
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
              <p>No team selected</p>
              <Link href="/select-team" className="btn btn-primary">Select Team</Link>
            </div>
          )}
        </div>

        {/* Recent Battles */}
        {profile.recentBattles && profile.recentBattles.length > 0 && (
          <div className="profile-card">
            <h3>Recent Battles</h3>
            <div className="battle-history">
              {profile.recentBattles.slice(0, 5).map((battle) => (
                <div key={battle.id} className={`battle-record ${battle.result}`}>
                  <div className="battle-result-icon">
                    {battle.result === 'win' ? 'W' : 'L'}
                  </div>
                  <div className="battle-info">
                    <span className="battle-opponent">vs {battle.opponent}</span>
                  </div>
                  <div className="battle-date">
                    {new Date(battle.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="profile-actions">
        <Link href="/play" className="btn btn-primary">Back to Game</Link>
        <Link href="/settings" className="btn btn-secondary">Settings</Link>
        <button
          className="btn btn-danger"
          onClick={() => setShowResetConfirm(true)}
          style={{ background: '#c0392b', border: '1px solid #e74c3c', color: '#fff', cursor: 'pointer', padding: '10px 20px', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
        >
          Reset Account
        </button>
      </div>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0c0f1e', border: '2px solid #e74c3c', borderRadius: 12, padding: 30, maxWidth: 400, textAlign: 'center' }}>
            <h3 style={{ color: '#e74c3c', marginBottom: 12 }}>RESET ACCOUNT</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20, fontSize: 14 }}>
              This will reset all your stats, level, LP, wins and losses. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{ padding: '10px 24px', background: '#1e2340', border: '1px solid #2a2f55', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetAccount}
                disabled={resetting}
                style={{ padding: '10px 24px', background: '#e74c3c', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14 }}
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
