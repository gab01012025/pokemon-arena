'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ClanMember {
  id: number;
  username: string;
  experience: number;
  wins: number;
  losses: number;
  role: string;
  joinedAt: string;
}

interface Clan {
  id: number;
  name: string;
  tag: string;
  description: string;
  memberCount: number;
  experience: number;
  wins: number;
  losses: number;
  rank: number;
  createdAt: string;
  founder: {
    username: string;
  };
  members: ClanMember[];
  myRole?: string;
}

export default function MyClanPage() {
  const router = useRouter();
  const [clan, setClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Gerenciamento de membros
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [showKickModal, setShowKickModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ClanMember | null>(null);
  
  // Edição do clã
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  
  // Sair do clã
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const fetchClan = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/clans/my-clan');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao buscar clã');
      }
      
      setClan(data);
      setEditDescription(data.description || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setClan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClan();
  }, [fetchClan]);

  const handleLeaveClan = async () => {
    try {
      setError('');
      setSuccessMsg('');
      
      const res = await fetch('/api/clans/leave', {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao sair do clã');
      }
      
      setSuccessMsg('Você saiu do clã com sucesso!');
      setShowLeaveModal(false);
      
      setTimeout(() => {
        router.push('/clans');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleKickMember = async () => {
    if (!selectedMember) return;
    
    try {
      setError('');
      setSuccessMsg('');
      
      const res = await fetch('/api/clans/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: selectedMember.id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao expulsar membro');
      }
      
      setSuccessMsg(`${selectedMember.username} foi expulso do clã!`);
      setShowKickModal(false);
      setSelectedMember(null);
      
      await fetchClan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleUpdateClan = async () => {
    try {
      setError('');
      setSuccessMsg('');
      
      const res = await fetch('/api/clans/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDescription }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar clã');
      }
      
      setSuccessMsg('Clã atualizado com sucesso!');
      setShowEditModal(false);
      
      await fetchClan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handlePromoteMember = async (memberId: number) => {
    try {
      setError('');
      setSuccessMsg('');
      
      const res = await fetch('/api/clans/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao promover membro');
      }
      
      setSuccessMsg('Membro promovido com sucesso!');
      await fetchClan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleDemoteMember = async (memberId: number) => {
    try {
      setError('');
      setSuccessMsg('');
      
      const res = await fetch('/api/clans/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao rebaixar membro');
      }
      
      setSuccessMsg('Membro rebaixado com sucesso!');
      await fetchClan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  if (loading) {
    return (
      <div className="my-clan-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando clã...</p>
        </div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="my-clan-page">
        <div className="no-clan-container">
          <h1>😢 Você não está em um clã</h1>
          <p>Junte-se a um clã para batalhar em equipe!</p>
          <div className="no-clan-actions">
            <Link href="/clans" className="btn-primary">
              🔍 Procurar Clãs
            </Link>
            <Link href="/create-clan" className="btn-secondary">
              ➕ Criar Clã
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLeader = clan.myRole === 'leader';
  const isOfficer = clan.myRole === 'officer';
  const canManage = isLeader || isOfficer;

  return (
    <div className="my-clan-page">
      <div className="clan-header">
        <div className="clan-title-section">
          <h1>
            [{clan.tag}] {clan.name}
          </h1>
          <p className="clan-rank">Rank #{clan.rank} Mundial</p>
        </div>
        
        <div className="clan-actions">
          {isLeader && (
            <button onClick={() => setShowEditModal(true)} className="btn-edit">
              ✏️ Editar Clã
            </button>
          )}
          <button onClick={() => setShowLeaveModal(true)} className="btn-leave">
            🚪 Sair do Clã
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {successMsg && <div className="success-msg">{successMsg}</div>}

      <div className="clan-info-grid">
        <div className="info-card">
          <div className="info-icon">👥</div>
          <div className="info-content">
            <span className="info-label">Membros</span>
            <span className="info-value">{clan.memberCount}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">⭐</div>
          <div className="info-content">
            <span className="info-label">XP Total</span>
            <span className="info-value">{clan.experience.toLocaleString()}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🏆</div>
          <div className="info-content">
            <span className="info-label">Vitórias</span>
            <span className="info-value">{clan.wins}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">💔</div>
          <div className="info-content">
            <span className="info-label">Derrotas</span>
            <span className="info-value">{clan.losses}</span>
          </div>
        </div>
      </div>

      <div className="clan-description-section">
        <h2>📝 Descrição</h2>
        <p>{clan.description || 'Sem descrição.'}</p>
      </div>

      <div className="clan-members-section">
        <div className="members-header">
          <h2>👥 Membros ({clan.memberCount})</h2>
          {canManage && (
            <button onClick={() => setShowInviteModal(true)} className="btn-invite">
              ➕ Convidar
            </button>
          )}
        </div>

        <div className="members-table">
          <div className="table-header">
            <div className="col-username">Usuário</div>
            <div className="col-rank">Cargo</div>
            <div className="col-xp">XP</div>
            <div className="col-record">W/L</div>
            <div className="col-joined">Entrou em</div>
            {canManage && <div className="col-actions">Ações</div>}
          </div>

          {clan.members.map((member) => (
            <div key={member.id} className="table-row">
              <div className="col-username">
                <Link href={`/profile/${member.username}`}>
                  {member.username}
                </Link>
              </div>
              <div className="col-rank">
                <span className={`rank-badge ${member.role.toLowerCase()}`}>
                  {member.role === 'leader' ? '👑' : member.role === 'officer' ? '⚔️' : '🛡️'}
                  {' '}
                  {member.role === 'leader' ? 'Líder' : member.role === 'officer' ? 'Oficial' : 'Membro'}
                </span>
              </div>
              <div className="col-xp">{member.experience.toLocaleString()}</div>
              <div className="col-record">
                {member.wins}W / {member.losses}L
              </div>
              <div className="col-joined">
                {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
              </div>
              {canManage && member.role !== 'leader' && (
                <div className="col-actions">
                  {isLeader && member.role === 'member' && (
                    <button
                      onClick={() => handlePromoteMember(member.id)}
                      className="btn-action promote"
                      title="Promover a Oficial"
                    >
                      ⬆️
                    </button>
                  )}
                  {isLeader && member.role === 'officer' && (
                    <button
                      onClick={() => handleDemoteMember(member.id)}
                      className="btn-action demote"
                      title="Rebaixar a Membro"
                    >
                      ⬇️
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowKickModal(true);
                    }}
                    className="btn-action kick"
                    title="Expulsar"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Sair do Clã */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🚪 Sair do Clã?</h2>
            <p>Tem certeza que deseja sair de [{clan.tag}] {clan.name}?</p>
            {isLeader && (
              <p className="warning">
                ⚠️ Você é o líder! Ao sair, o clã será dissolvido.
              </p>
            )}
            <div className="modal-actions">
              <button onClick={handleLeaveClan} className="btn-confirm">
                Confirmar
              </button>
              <button onClick={() => setShowLeaveModal(false)} className="btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Clã */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Editar Clã</h2>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição do clã..."
                maxLength={500}
                rows={5}
              />
              <small>{editDescription.length}/500 caracteres</small>
            </div>
            <div className="modal-actions">
              <button onClick={handleUpdateClan} className="btn-confirm">
                Salvar
              </button>
              <button onClick={() => setShowEditModal(false)} className="btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Expulsar Membro */}
      {showKickModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowKickModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>❌ Expulsar Membro?</h2>
            <p>Tem certeza que deseja expulsar <strong>{selectedMember.username}</strong>?</p>
            <div className="modal-actions">
              <button onClick={handleKickMember} className="btn-confirm">
                Confirmar
              </button>
              <button onClick={() => setShowKickModal(false)} className="btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
