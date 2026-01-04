'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Clan {
  rank: number;
  id: string;
  name: string;
  tag: string;
  description: string;
  experience: number;
  wins: number;
  losses: number;
  members: number;
}

interface ClansClientProps {
  initialClans: Clan[];
}

export function ClansClient({ initialClans }: ClansClientProps) {
  const router = useRouter();
  const [clans] = useState<Clan[]>(initialClans);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClans = clans.filter(clan =>
    clan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clan.tag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinClan = async () => {
    if (!selectedClan) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await fetch('/api/clans/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clanId: selectedClan.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao entrar no clã');
      }

      setSuccess(data.message);
      setShowJoinModal(false);

      setTimeout(() => {
        router.push('/my-clan');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clans-page">
      <div className="clans-header">
        <h1>🏰 Ranking de Clãs</h1>
        <p>Encontre um clã para se juntar ou crie o seu próprio!</p>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="clans-actions-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar clã por nome ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <Link href="/create-clan" className="btn-create-clan">
            ➕ Criar Clã
          </Link>
          <Link href="/my-clan" className="btn-my-clan">
            🏠 Meu Clã
          </Link>
        </div>
      </div>

      {filteredClans.length === 0 ? (
        <div className="no-clans">
          <h2>😔 Nenhum clã encontrado</h2>
          <p>Seja o primeiro a criar um clã!</p>
          <Link href="/create-clan" className="btn-primary">
            Criar Clã
          </Link>
        </div>
      ) : (
        <div className="clans-list">
          {filteredClans.map((clan) => (
            <div key={clan.id} className="clan-card">
              <div className="clan-rank">#{clan.rank}</div>
              <div className="clan-info">
                <h3>
                  <span className="clan-tag">[{clan.tag}]</span>
                  {' '}{clan.name}
                </h3>
                <p className="clan-description">
                  {clan.description || 'Sem descrição'}
                </p>
              </div>
              <div className="clan-stats">
                <div className="stat">
                  <span className="stat-label">XP</span>
                  <span className="stat-value">{clan.experience.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">W/L</span>
                  <span className="stat-value">{clan.wins}/{clan.losses}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Membros</span>
                  <span className="stat-value">{clan.members}/50</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedClan(clan);
                  setShowJoinModal(true);
                }}
                className="btn-join"
                disabled={clan.members >= 50}
              >
                {clan.members >= 50 ? 'Cheio' : 'Entrar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Entrar no Clã */}
      {showJoinModal && selectedClan && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🏰 Entrar no Clã?</h2>
            <div className="clan-preview">
              <h3>[{selectedClan.tag}] {selectedClan.name}</h3>
              <p>{selectedClan.description || 'Sem descrição'}</p>
              <div className="preview-stats">
                <span>⭐ {selectedClan.experience.toLocaleString()} XP</span>
                <span>🏆 {selectedClan.wins} Vitórias</span>
                <span>👥 {selectedClan.members} Membros</span>
              </div>
            </div>
            <p className="confirm-text">
              Deseja realmente entrar neste clã?
            </p>
            <div className="modal-actions">
              <button 
                onClick={handleJoinClan} 
                className="btn-confirm"
                disabled={loading}
              >
                {loading ? 'Entrando...' : '✅ Confirmar'}
              </button>
              <button onClick={() => setShowJoinModal(false)} className="btn-cancel">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
