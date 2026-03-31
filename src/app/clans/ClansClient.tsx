'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

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
      setLoading(true); setError(''); setSuccess('');
      const res = await fetch('/api/clans/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clanId: selectedClan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar no clã');
      setSuccess(data.message);
      setShowJoinModal(false);
      setTimeout(() => router.push('/my-clan'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
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
              <h2>Ranking de Clãs</h2>
            </div>
            <div className="content-box-body">
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                Encontre um clã para se juntar ou crie o seu próprio!
              </p>

              {error && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '12px', marginBottom: '12px' }}>
                  {success}
                </div>
              )}

              {/* Search + Actions */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Buscar clã..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1, minWidth: '140px', padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0', outline: 'none',
                  }}
                />
                <Link href="/create-clan" style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#f87171', textDecoration: 'none', whiteSpace: 'nowrap',
                }}>
                  Criar Clã
                </Link>
                <Link href="/my-clan" style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', textDecoration: 'none', whiteSpace: 'nowrap',
                }}>
                  Meu Clã
                </Link>
              </div>

              {/* Clans List */}
              {filteredClans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>Nenhum clã encontrado</p>
                  <Link href="/create-clan" style={{ color: '#60a5fa', fontSize: '12px' }}>Criar Clã</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredClans.map(clan => (
                    <div key={clan.id} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '12px',
                      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 700, color: '#f59e0b', minWidth: '36px',
                      }}>
                        #{clan.rank}
                      </span>
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                          <span style={{ color: '#64748b' }}>[{clan.tag}]</span> {clan.name}
                        </h4>
                        <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0', lineHeight: 1.4 }}>
                          {clan.description || 'Sem descrição'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#94a3b8' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{clan.experience.toLocaleString()}</div>
                          <div>XP</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{clan.wins}/{clan.losses}</div>
                          <div>W/L</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{clan.members}/50</div>
                          <div>Membros</div>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedClan(clan); setShowJoinModal(true); }}
                        disabled={clan.members >= 50}
                        style={{
                          padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          background: clan.members >= 50 ? 'rgba(255,255,255,0.04)' : 'rgba(239,68,68,0.12)',
                          border: clan.members >= 50 ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(239,68,68,0.3)',
                          color: clan.members >= 50 ? '#334155' : '#f87171',
                          cursor: clan.members >= 50 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {clan.members >= 50 ? 'Cheio' : 'Entrar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      {/* Join Modal */}
      {showJoinModal && selectedClan && (
        <div style={overlayStyle} onClick={() => setShowJoinModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0f1428', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '24px', maxWidth: '400px', width: '90%',
          }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '12px' }}>Entrar no Clã?</h3>
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                [{selectedClan.tag}] {selectedClan.name}
              </h4>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                {selectedClan.description || 'Sem descrição'}
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#94a3b8' }}>
                <span>{selectedClan.experience.toLocaleString()} XP</span>
                <span>{selectedClan.wins} Vitórias</span>
                <span>{selectedClan.members} Membros</span>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
              Deseja realmente entrar neste clã?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowJoinModal(false)} style={{
                padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', cursor: 'pointer',
              }}>
                Cancelar
              </button>
              <button onClick={handleJoinClan} disabled={loading} style={{
                padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
              }}>
                {loading ? 'Entrando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
