'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

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

const roleLabel = (role: string) => {
  switch (role) {
    case 'leader': return 'Líder';
    case 'officer': return 'Oficial';
    default: return 'Membro';
  }
};

const roleColor = (role: string) => {
  switch (role) {
    case 'leader': return '#f59e0b';
    case 'officer': return '#60a5fa';
    default: return '#94a3b8';
  }
};

export default function MyClanPage() {
  const router = useRouter();
  const [clan, setClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showKickModal, setShowKickModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ClanMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const fetchClan = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/clans/my-clan');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar clã');
      setClan(data);
      setEditDescription(data.description || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setClan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClan(); }, [fetchClan]);

  const handleLeaveClan = async () => {
    try {
      setError(''); setSuccessMsg('');
      const res = await fetch('/api/clans/leave', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao sair do clã');
      setSuccessMsg('Você saiu do clã com sucesso!');
      setShowLeaveModal(false);
      setTimeout(() => router.push('/clans'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleKickMember = async () => {
    if (!selectedMember) return;
    try {
      setError(''); setSuccessMsg('');
      const res = await fetch('/api/clans/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: selectedMember.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao expulsar membro');
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
      setError(''); setSuccessMsg('');
      const res = await fetch('/api/clans/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar clã');
      setSuccessMsg('Clã atualizado com sucesso!');
      setShowEditModal(false);
      await fetchClan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handlePromoteMember = async (memberId: number) => {
    try {
      setError(''); setSuccessMsg('');
      const res = await fetch('/api/clans/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao promover membro');
      setSuccessMsg('Membro promovido com sucesso!');
      await fetchClan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleDemoteMember = async (memberId: number) => {
    try {
      setError(''); setSuccessMsg('');
      const res = await fetch('/api/clans/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao rebaixar membro');
      setSuccessMsg('Membro rebaixado com sucesso!');
      await fetchClan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const isLeader = clan?.myRole === 'leader';
  const isOfficer = clan?.myRole === 'officer';
  const canManage = isLeader || isOfficer;

  // Modal overlay style
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };
  const modalStyle: React.CSSProperties = {
    background: '#0f1428', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '24px', maxWidth: '420px', width: '90%',
  };
  const btnConfirmStyle: React.CSSProperties = {
    padding: '8px 20px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)',
    background: 'rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: '12px',
  };
  const btnCancelStyle: React.CSSProperties = {
    padding: '8px 20px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '12px',
  };

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
              <h2>Meu Clã</h2>
            </div>
            <div className="content-box-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  Carregando clã...
                </div>
              ) : !clan ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '15px' }}>
                    Você não está em um clã
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                    Junte-se a um clã para batalhar em equipe!
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <Link href="/clans" style={{
                      padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                      color: '#f87171', textDecoration: 'none',
                    }}>
                      Procurar Clãs
                    </Link>
                    <Link href="/create-clan" style={{
                      padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', textDecoration: 'none',
                    }}>
                      Criar Clã
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '12px', marginBottom: '12px' }}>
                      {successMsg}
                    </div>
                  )}

                  {/* Clan Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px 0' }}>
                        [{clan.tag}] {clan.name}
                      </h3>
                      <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                        Rank #{clan.rank} Mundial
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isLeader && (
                        <button onClick={() => setShowEditModal(true)} style={{
                          padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)',
                          color: '#60a5fa', cursor: 'pointer',
                        }}>
                          Editar
                        </button>
                      )}
                      <button onClick={() => setShowLeaveModal(true)} style={{
                        padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171', cursor: 'pointer',
                      }}>
                        Sair do Clã
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {[
                      { label: 'Membros', value: clan.memberCount },
                      { label: 'XP Total', value: clan.experience.toLocaleString() },
                      { label: 'Vitórias', value: clan.wins },
                      { label: 'Derrotas', value: clan.losses },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px', padding: '10px', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>{stat.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Descrição</h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                      {clan.description || 'Sem descrição.'}
                    </p>
                  </div>

                  {/* Members Table */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
                      Membros ({clan.memberCount})
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 6px', color: '#64748b', fontWeight: 600 }}>Usuário</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', color: '#64748b', fontWeight: 600 }}>Cargo</th>
                            <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: 600 }}>XP</th>
                            <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: 600 }}>W/L</th>
                            <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: 600 }}>Entrou</th>
                            {canManage && <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: 600 }}>Ações</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {clan.members.map(member => (
                            <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '8px 6px' }}>
                                <Link href={`/profile/${member.username}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                                  {member.username}
                                </Link>
                              </td>
                              <td style={{ padding: '8px 6px' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                                  background: `${roleColor(member.role)}20`, color: roleColor(member.role),
                                }}>
                                  {roleLabel(member.role)}
                                </span>
                              </td>
                              <td style={{ padding: '8px 6px', textAlign: 'right', color: '#e2e8f0' }}>
                                {member.experience.toLocaleString()}
                              </td>
                              <td style={{ padding: '8px 6px', textAlign: 'right', color: '#94a3b8' }}>
                                {member.wins}W / {member.losses}L
                              </td>
                              <td style={{ padding: '8px 6px', textAlign: 'right', color: '#64748b' }}>
                                {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                              </td>
                              {canManage && member.role !== 'leader' && (
                                <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                    {isLeader && member.role === 'member' && (
                                      <button onClick={() => handlePromoteMember(member.id)} title="Promover" style={{
                                        padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e',
                                      }}>
                                        Promover
                                      </button>
                                    )}
                                    {isLeader && member.role === 'officer' && (
                                      <button onClick={() => handleDemoteMember(member.id)} title="Rebaixar" style={{
                                        padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b',
                                      }}>
                                        Rebaixar
                                      </button>
                                    )}
                                    <button onClick={() => { setSelectedMember(member); setShowKickModal(true); }} title="Expulsar" style={{
                                      padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171',
                                    }}>
                                      Expulsar
                                    </button>
                                  </div>
                                </td>
                              )}
                              {canManage && member.role === 'leader' && (
                                <td style={{ padding: '8px 6px' }} />
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div style={overlayStyle} onClick={() => setShowLeaveModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '10px', fontSize: '14px' }}>Sair do Clã?</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
              Tem certeza que deseja sair de [{clan?.tag}] {clan?.name}?
            </p>
            {isLeader && (
              <p style={{ color: '#f59e0b', fontSize: '11px', marginBottom: '12px' }}>
                Atenção: Você é o líder! Ao sair, o clã será dissolvido.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setShowLeaveModal(false)} style={btnCancelStyle}>Cancelar</button>
              <button onClick={handleLeaveClan} style={btnConfirmStyle}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={overlayStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '12px', fontSize: '14px' }}>Editar Clã</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '6px' }}>Descrição</label>
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                maxLength={500}
                rows={5}
                style={{
                  width: '100%', padding: '10px', borderRadius: '6px', fontSize: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', resize: 'vertical',
                }}
              />
              <span style={{ fontSize: '10px', color: '#64748b' }}>{editDescription.length}/500</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditModal(false)} style={btnCancelStyle}>Cancelar</button>
              <button onClick={handleUpdateClan} style={{ ...btnConfirmStyle, background: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.4)', color: '#60a5fa' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Kick Modal */}
      {showKickModal && selectedMember && (
        <div style={overlayStyle} onClick={() => setShowKickModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '10px', fontSize: '14px' }}>Expulsar Membro?</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
              Tem certeza que deseja expulsar <strong style={{ color: '#e2e8f0' }}>{selectedMember.username}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowKickModal(false)} style={btnCancelStyle}>Cancelar</button>
              <button onClick={handleKickMember} style={btnConfirmStyle}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
