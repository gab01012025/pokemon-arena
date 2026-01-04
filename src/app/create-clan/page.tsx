'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    
    // Validação
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
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar clã');
      }
      
      router.push('/my-clan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-clan-page">
      <div className="create-clan-container">
        <div className="form-header">
          <h1>🏰 Criar Novo Clã</h1>
          <p>Forme sua própria equipe e conquiste o topo do ranking!</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="create-clan-form">
          <div className="form-group">
            <label htmlFor="name">
              Nome do Clã <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Guardiões da Floresta"
              minLength={3}
              maxLength={30}
              required
            />
            <small>{formData.name.length}/30 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="tag">
              Tag do Clã <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tag"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
              placeholder="Ex: GDF"
              minLength={2}
              maxLength={5}
              pattern="[A-Z0-9]+"
              required
            />
            <small>2-5 caracteres, apenas letras maiúsculas e números</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva seu clã, seus objetivos e valores..."
              maxLength={500}
              rows={5}
            />
            <small>{formData.description.length}/500 caracteres</small>
          </div>

          <div className="info-box">
            <h3>ℹ️ Informações Importantes</h3>
            <ul>
              <li>🎯 Você será o líder do clã</li>
              <li>👥 Clãs podem ter até 50 membros</li>
              <li>⚔️ Batalhe em equipe para ganhar XP do clã</li>
              <li>🏆 Compita no ranking mundial de clãs</li>
              <li>💎 Custa 10.000 XP para criar um clã</li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Criando...' : '✨ Criar Clã'}
            </button>
            <Link href="/clans" className="btn-secondary">
              ← Voltar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
