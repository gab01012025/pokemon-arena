'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function CreateClanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.length < 3 || formData.name.length > 30) {
      setError('O nome deve ter entre 3 e 30 caracteres');
      return;
    }
    if (formData.tag.length < 2 || formData.tag.length > 5) {
      setError('A tag deve ter entre 2 e 5 caracteres');
      return;
    }
    if (!/^[A-Z0-9]+$/.test(formData.tag)) {
      setError('A tag deve conter apenas letras maiúsculas e números');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/clans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar clã');
      router.push('/my-clan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '12px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#e2e8f0', outline: 'none',
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
              <h2>Criar Novo Clã</h2>
            </div>
            <div className="content-box-body">
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>
                Forme sua própria equipe e conquiste o topo do ranking!
              </p>

              {error && (
                <div style={{
                  padding: '8px 12px', borderRadius: '6px', marginBottom: '16px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', fontSize: '12px',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                    Nome do Clã <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Guardiões da Floresta"
                    minLength={3}
                    maxLength={30}
                    required
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    {formData.name.length}/30 caracteres
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                    Tag do Clã <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                    placeholder="Ex: GDF"
                    minLength={2}
                    maxLength={5}
                    pattern="[A-Z0-9]+"
                    required
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    2-5 caracteres, apenas maiúsculas e números
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva seu clã..."
                    maxLength={500}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    {formData.description.length}/500 caracteres
                  </span>
                </div>

                {/* Info */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', padding: '12px', marginBottom: '20px',
                }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                    Informações Importantes
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#94a3b8', lineHeight: 2 }}>
                    <li>Você será o líder do clã</li>
                    <li>Clãs podem ter até 50 membros</li>
                    <li>Batalhe em equipe para ganhar XP do clã</li>
                    <li>Compita no ranking mundial de clãs</li>
                    <li>Custa 10.000 XP para criar um clã</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} style={{
                    padding: '10px 24px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                    color: '#f87171', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
                  }}>
                    {loading ? 'Criando...' : 'Criar Clã'}
                  </button>
                  <Link href="/clans" style={{
                    padding: '10px 24px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', textDecoration: 'none',
                  }}>
                    Voltar
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
