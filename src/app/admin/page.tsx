'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './admin.css';

interface Stats {
  totalTrainers: number;
  totalBattles: number;
  activeBattles: number;
  totalPokemon: number;
  totalClans: number;
  totalMissions: number;
  avgWinRate: string;
}

interface Trainer {
  id: string;
  username: string;
  email: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  ladderPoints: number;
  createdAt: string;
  clanMember?: { clan: { name: string } };
}

interface Battle {
  id: string;
  status: string;
  turn: number;
  battleType: string;
  startedAt: string;
  finishedAt?: string;
  player1: { username: string };
  player2: { username: string };
  winner?: { username: string };
}

interface Clan {
  id: string;
  name: string;
  tag: string;
  points: number;
  memberCount: number;
  leader: { username: string };
  createdAt: string;
}

interface Pokemon {
  id: string;
  name: string;
  category: string;
  health: number;
  isStarter: boolean;
  unlockCost: number;
  _count: { trainers: number };
}

type Tab = 'dashboard' | 'trainers' | 'battles' | 'clans' | 'pokemon';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard data
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTrainers, setRecentTrainers] = useState<Trainer[]>([]);
  const [topPlayers, setTopPlayers] = useState<Trainer[]>([]);
  
  // List data
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit modal
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [editType, setEditType] = useState<string>('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 401) {
        setError('Você precisa estar logado para acessar esta página');
        return;
      }
      if (res.status === 403) {
        setError('Acesso negado. Você não tem permissão de administrador.');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao carregar dados');
      }
      
      const data = await res.json();
      setStats(data.stats);
      setRecentTrainers(data.recentTrainers);
      setTopPlayers(data.topPlayers);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainers = async (pageNum = 1, search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trainers?page=${pageNum}&search=${search}`);
      if (!res.ok) throw new Error('Erro ao carregar treinadores');
      
      const data = await res.json();
      setTrainers(data.trainers);
      setTotalPages(data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadBattles = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/battles?page=${pageNum}`);
      if (!res.ok) throw new Error('Erro ao carregar batalhas');
      
      const data = await res.json();
      setBattles(data.battles);
      setTotalPages(data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadClans = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clans?page=${pageNum}`);
      if (!res.ok) throw new Error('Erro ao carregar clãs');
      
      const data = await res.json();
      setClans(data.clans);
      setTotalPages(data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadPokemon = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pokemon');
      if (!res.ok) throw new Error('Erro ao carregar pokémon');
      
      const data = await res.json();
      setPokemon(data.pokemon);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchTerm('');
    
    switch (tab) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'trainers':
        loadTrainers();
        break;
      case 'battles':
        loadBattles();
        break;
      case 'clans':
        loadClans();
        break;
      case 'pokemon':
        loadPokemon();
        break;
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;
    
    try {
      const res = await fetch(`/api/admin/${type}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [`${type.slice(0, -1)}Id`]: id })
      });
      
      if (!res.ok) throw new Error('Erro ao deletar');
      
      // Reload current tab
      handleTabChange(activeTab);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar');
    }
  };

  const handleEdit = (type: string, item: Record<string, unknown>) => {
    setEditType(type);
    setEditingItem({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editType) return;
    
    try {
      const endpoint = editType === 'trainer' ? 'trainers' : 
                       editType === 'battle' ? 'battles' :
                       editType === 'clan' ? 'clans' : 'pokemon';
      
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`${editType}Id`]: editingItem.id,
          updates: editingItem
        })
      });
      
      if (!res.ok) throw new Error('Erro ao salvar');
      
      setEditingItem(null);
      setEditType('');
      handleTabChange(activeTab);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !stats) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Carregando painel de administração...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-container">
        <div className="admin-error">
          <h2>Erro</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/')}>Voltar ao Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1>⚙️ Admin</h1>
          <span>Pokémon Arena</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'trainers' ? 'active' : ''}`}
            onClick={() => handleTabChange('trainers')}
          >
            👤 Treinadores
          </button>
          <button 
            className={`nav-item ${activeTab === 'battles' ? 'active' : ''}`}
            onClick={() => handleTabChange('battles')}
          >
            ⚔️ Batalhas
          </button>
          <button 
            className={`nav-item ${activeTab === 'clans' ? 'active' : ''}`}
            onClick={() => handleTabChange('clans')}
          >
            🏰 Clãs
          </button>
          <button 
            className={`nav-item ${activeTab === 'pokemon' ? 'active' : ''}`}
            onClick={() => handleTabChange('pokemon')}
          >
            🐾 Pokémon
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="back-btn" onClick={() => router.push('/')}>
            ← Voltar ao Jogo
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <>
            <header className="main-header">
              <h2>Dashboard</h2>
              <button className="refresh-btn" onClick={loadDashboard}>🔄 Atualizar</button>
            </header>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalTrainers}</span>
                  <span className="stat-label">Treinadores</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚔️</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalBattles}</span>
                  <span className="stat-label">Batalhas Totais</span>
                </div>
              </div>
              <div className="stat-card active-battles">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.activeBattles}</span>
                  <span className="stat-label">Batalhas Ativas</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🐾</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalPokemon}</span>
                  <span className="stat-label">Pokémon</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏰</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalClans}</span>
                  <span className="stat-label">Clãs</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📜</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalMissions}</span>
                  <span className="stat-label">Missões</span>
                </div>
              </div>
            </div>

            <div className="dashboard-panels">
              <div className="panel">
                <h3>🆕 Novos Treinadores</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Level</th>
                      <th>W/L</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrainers.map(trainer => (
                      <tr key={trainer.id}>
                        <td>{trainer.username}</td>
                        <td>{trainer.level}</td>
                        <td>{trainer.wins}/{trainer.losses}</td>
                        <td>{formatDate(trainer.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <h3>🏆 Top Jogadores</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Pontos</th>
                      <th>W/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.map((player, index) => (
                      <tr key={player.id}>
                        <td>{index + 1}</td>
                        <td>{player.username}</td>
                        <td>{player.ladderPoints}</td>
                        <td>{player.wins}/{player.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <>
            <header className="main-header">
              <h2>Gerenciar Treinadores</h2>
              <div className="header-actions">
                <input
                  type="text"
                  placeholder="Buscar por username ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadTrainers(1, searchTerm)}
                  className="search-input"
                />
                <button onClick={() => loadTrainers(1, searchTerm)}>🔍 Buscar</button>
              </div>
            </header>

            <div className="table-container">
              <table className="admin-table full-width">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Level</th>
                    <th>EXP</th>
                    <th>Vitórias</th>
                    <th>Derrotas</th>
                    <th>Ladder</th>
                    <th>Clã</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map(trainer => (
                    <tr key={trainer.id}>
                      <td><strong>{trainer.username}</strong></td>
                      <td>{trainer.email}</td>
                      <td>{trainer.level}</td>
                      <td>{trainer.experience}</td>
                      <td className="wins">{trainer.wins}</td>
                      <td className="losses">{trainer.losses}</td>
                      <td>{trainer.ladderPoints}</td>
                      <td>{trainer.clanMember?.clan?.name || '-'}</td>
                      <td>{formatDate(trainer.createdAt)}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit('trainer', trainer as unknown as Record<string, unknown>)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete('trainers', trainer.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => loadTrainers(page - 1, searchTerm)}>
                  ← Anterior
                </button>
                <span>Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => loadTrainers(page + 1, searchTerm)}>
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}

        {/* Battles Tab */}
        {activeTab === 'battles' && (
          <>
            <header className="main-header">
              <h2>Gerenciar Batalhas</h2>
              <button className="refresh-btn" onClick={() => loadBattles(page)}>🔄 Atualizar</button>
            </header>

            <div className="table-container">
              <table className="admin-table full-width">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Jogador 1</th>
                    <th>Jogador 2</th>
                    <th>Status</th>
                    <th>Turno</th>
                    <th>Tipo</th>
                    <th>Vencedor</th>
                    <th>Iniciada</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {battles.map(battle => (
                    <tr key={battle.id}>
                      <td className="id-cell">{battle.id.slice(0, 8)}...</td>
                      <td>{battle.player1.username}</td>
                      <td>{battle.player2.username}</td>
                      <td>
                        <span className={`status-badge ${battle.status}`}>
                          {battle.status}
                        </span>
                      </td>
                      <td>{battle.turn}</td>
                      <td>{battle.battleType}</td>
                      <td>{battle.winner?.username || '-'}</td>
                      <td>{formatDate(battle.startedAt)}</td>
                      <td className="actions">
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete('battles', battle.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => loadBattles(page - 1)}>
                  ← Anterior
                </button>
                <span>Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => loadBattles(page + 1)}>
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}

        {/* Clans Tab */}
        {activeTab === 'clans' && (
          <>
            <header className="main-header">
              <h2>Gerenciar Clãs</h2>
              <button className="refresh-btn" onClick={() => loadClans(page)}>🔄 Atualizar</button>
            </header>

            <div className="table-container">
              <table className="admin-table full-width">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tag</th>
                    <th>Líder</th>
                    <th>Membros</th>
                    <th>Pontos</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clans.map(clan => (
                    <tr key={clan.id}>
                      <td><strong>{clan.name}</strong></td>
                      <td>[{clan.tag}]</td>
                      <td>{clan.leader.username}</td>
                      <td>{clan.memberCount}</td>
                      <td>{clan.points}</td>
                      <td>{formatDate(clan.createdAt)}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit('clan', clan as unknown as Record<string, unknown>)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete('clans', clan.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => loadClans(page - 1)}>
                  ← Anterior
                </button>
                <span>Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => loadClans(page + 1)}>
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}

        {/* Pokemon Tab */}
        {activeTab === 'pokemon' && (
          <>
            <header className="main-header">
              <h2>Gerenciar Pokémon</h2>
              <button className="refresh-btn" onClick={loadPokemon}>🔄 Atualizar</button>
            </header>

            <div className="table-container">
              <table className="admin-table full-width">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>HP</th>
                    <th>Starter</th>
                    <th>Custo</th>
                    <th>Desbloqueados</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pokemon.map(poke => (
                    <tr key={poke.id}>
                      <td><strong>{poke.name}</strong></td>
                      <td>{poke.category}</td>
                      <td>{poke.health}</td>
                      <td>{poke.isStarter ? '✅' : '❌'}</td>
                      <td>{poke.unlockCost}</td>
                      <td>{poke._count.trainers}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit('pokemon', poke as unknown as Record<string, unknown>)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete('pokemon', poke.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Editar {editType === 'trainer' ? 'Treinador' : editType === 'clan' ? 'Clã' : 'Pokémon'}</h3>
            
            <div className="modal-content">
              {editType === 'trainer' && (
                <>
                  <div className="form-group">
                    <label>Level</label>
                    <input 
                      type="number" 
                      value={editingItem.level as number} 
                      onChange={e => setEditingItem({...editingItem, level: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Experience</label>
                    <input 
                      type="number" 
                      value={editingItem.experience as number} 
                      onChange={e => setEditingItem({...editingItem, experience: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vitórias</label>
                    <input 
                      type="number" 
                      value={editingItem.wins as number} 
                      onChange={e => setEditingItem({...editingItem, wins: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Derrotas</label>
                    <input 
                      type="number" 
                      value={editingItem.losses as number} 
                      onChange={e => setEditingItem({...editingItem, losses: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ladder Points</label>
                    <input 
                      type="number" 
                      value={editingItem.ladderPoints as number} 
                      onChange={e => setEditingItem({...editingItem, ladderPoints: parseInt(e.target.value)})}
                    />
                  </div>
                </>
              )}
              
              {editType === 'clan' && (
                <>
                  <div className="form-group">
                    <label>Nome</label>
                    <input 
                      type="text" 
                      value={editingItem.name as string} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pontos</label>
                    <input 
                      type="number" 
                      value={editingItem.points as number} 
                      onChange={e => setEditingItem({...editingItem, points: parseInt(e.target.value)})}
                    />
                  </div>
                </>
              )}
              
              {editType === 'pokemon' && (
                <>
                  <div className="form-group">
                    <label>Nome</label>
                    <input 
                      type="text" 
                      value={editingItem.name as string} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>HP</label>
                    <input 
                      type="number" 
                      value={editingItem.health as number} 
                      onChange={e => setEditingItem({...editingItem, health: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Custo de Desbloqueio</label>
                    <input 
                      type="number" 
                      value={editingItem.unlockCost as number} 
                      onChange={e => setEditingItem({...editingItem, unlockCost: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={editingItem.isStarter as boolean} 
                        onChange={e => setEditingItem({...editingItem, isStarter: e.target.checked})}
                      />
                      Starter
                    </label>
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setEditingItem(null)}>Cancelar</button>
              <button className="save-btn" onClick={handleSaveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
