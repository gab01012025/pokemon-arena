'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface BattleByType {
  battleType: string;
  _count: { id: number };
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

interface RecentBattle {
  id: string;
  status: string;
  battleType: string;
  startedAt: string;
  player1: { username: string };
  player2: { username: string };
  winner?: { username: string };
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

const TAB_CONFIG: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'trainers', label: 'Treinadores', icon: '👤' },
  { key: 'battles', label: 'Batalhas', icon: '⚔️' },
  { key: 'clans', label: 'Clãs', icon: '🏰' },
  { key: 'pokemon', label: 'Pokémon', icon: '🐾' },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Dashboard data
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTrainers, setRecentTrainers] = useState<Trainer[]>([]);
  const [recentBattles, setRecentBattles] = useState<RecentBattle[]>([]);
  const [topPlayers, setTopPlayers] = useState<Trainer[]>([]);
  const [battlesByType, setBattlesByType] = useState<BattleByType[]>([]);

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

  // Sidebar collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadDashboard = useCallback(async () => {
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

      const json = await res.json();
      const payload = json.data || json;
      setStats(payload.stats);
      setRecentTrainers(payload.recentTrainers || []);
      setRecentBattles(payload.recentBattles || []);
      setTopPlayers(payload.topPlayers || []);
      setBattlesByType(payload.battlesByType || []);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadTrainers = async (pageNum = 1, search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trainers?page=${pageNum}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Erro ao carregar treinadores');

      const json = await res.json();
      const payload = json.data || json;
      setTrainers(payload.trainers || []);
      setTotalPages(payload.pagination?.pages || 1);
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

      const json = await res.json();
      const payload = json.data || json;
      setBattles(payload.battles || []);
      setTotalPages(payload.pagination?.pages || 1);
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

      const json = await res.json();
      const payload = json.data || json;
      setClans(payload.clans || []);
      setTotalPages(payload.pagination?.pages || 1);
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

      const json = await res.json();
      const payload = json.data || json;
      setPokemon(payload.pokemon || []);
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
      case 'dashboard': loadDashboard(); break;
      case 'trainers': loadTrainers(); break;
      case 'battles': loadBattles(); break;
      case 'clans': loadClans(); break;
      case 'pokemon': loadPokemon(); break;
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

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  if (loading && !stats) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="loading-pokeball">
            <div className="pokeball-top" />
            <div className="pokeball-center" />
            <div className="pokeball-bottom" />
          </div>
          <p>Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-container">
        <div className="admin-error">
          <div className="error-icon">⚠️</div>
          <h2>Erro de Acesso</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary">Voltar ao Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">🎮</span>
            <div className="brand-text">
              <h1>Admin Panel</h1>
              <span className="brand-sub">Pokémon Arena</span>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
              title={tab.label}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
              {tab.key === 'battles' && stats && stats.activeBattles > 0 && (
                <span className="nav-badge">{stats.activeBattles}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="server-status">
            <span className="status-dot online" />
            <span className="status-text">Servidor Online</span>
          </div>
          <button className="back-btn" onClick={() => router.push('/')}>
            ← Voltar ao Jogo
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* ── Dashboard ── */}
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-content">
            <header className="main-header">
              <div className="header-left">
                <h2>Dashboard</h2>
                {lastUpdated && (
                  <span className="last-updated">
                    Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </div>
              <button className="btn-refresh" onClick={loadDashboard} disabled={loading}>
                <span className={loading ? 'spin' : ''}>⟳</span> Atualizar
              </button>
            </header>

            {/* Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-trainers">
                <div className="stat-card-inner">
                  <div className="stat-icon-wrap"><span>👤</span></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalTrainers}</span>
                    <span className="stat-label">Treinadores</span>
                  </div>
                </div>
                <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '100%' }} /></div>
              </div>

              <div className="stat-card stat-battles">
                <div className="stat-card-inner">
                  <div className="stat-icon-wrap"><span>⚔️</span></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalBattles}</span>
                    <span className="stat-label">Batalhas</span>
                  </div>
                </div>
                <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '100%' }} /></div>
              </div>

              <div className="stat-card stat-active">
                <div className="stat-card-inner">
                  <div className="stat-icon-wrap pulse"><span>🔥</span></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.activeBattles}</span>
                    <span className="stat-label">Ativas Agora</span>
                  </div>
                </div>
                <div className="stat-bar"><div className="stat-bar-fill" style={{ width: stats.totalBattles > 0 ? `${(stats.activeBattles / stats.totalBattles) * 100}%` : '0%' }} /></div>
              </div>

              <div className="stat-card stat-pokemon">
                <div className="stat-card-inner">
                  <div className="stat-icon-wrap"><span>🐾</span></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalPokemon}</span>
                    <span className="stat-label">Pokémon</span>
                  </div>
                </div>
                <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '100%' }} /></div>
              </div>

              <div className="stat-card stat-clans">
                <div className="stat-card-inner">
                  <div className="stat-icon-wrap"><span>🏰</span></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalClans}</span>
                    <span className="stat-label">Clãs</span>
                  </div>
                </div>
                <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '100%' }} /></div>
              </div>

              <div className="stat-card stat-winrate">
                <div className="stat-card-inner">
                  <div className="stat-icon-wrap"><span>📈</span></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.avgWinRate}%</span>
                    <span className="stat-label">Win Rate Médio</span>
                  </div>
                </div>
                <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${Number(stats.avgWinRate) || 0}%` }} /></div>
              </div>
            </div>

            {/* Quick Stats Row */}
            {battlesByType.length > 0 && (
              <div className="quick-stats-row">
                <span className="quick-stats-label">Batalhas por tipo:</span>
                {battlesByType.map(bt => (
                  <span key={bt.battleType} className="quick-stat-chip">
                    {bt.battleType === 'ai' ? '🤖 IA' : bt.battleType === 'pvp' ? '🎮 PvP' : bt.battleType}
                    <strong>{bt._count.id}</strong>
                  </span>
                ))}
              </div>
            )}

            {/* Dashboard Panels */}
            <div className="dashboard-panels">
              {/* Top Players */}
              <div className="panel panel-top-players">
                <div className="panel-header">
                  <h3>🏆 Top Jogadores</h3>
                  <span className="panel-badge">{topPlayers.length}</span>
                </div>
                <div className="panel-body">
                  {topPlayers.map((player, index) => (
                    <div key={player.id} className={`player-row ${index < 3 ? 'top-three' : ''}`}>
                      <div className="player-rank">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="player-info">
                        <span className="player-name">{player.username}</span>
                        <span className="player-stats">Lv.{player.level} • {player.wins}W / {player.losses}L</span>
                      </div>
                      <div className="player-points">
                        <span className="points-value">{player.ladderPoints}</span>
                        <span className="points-label">pts</span>
                      </div>
                    </div>
                  ))}
                  {topPlayers.length === 0 && <div className="empty-state">Nenhum jogador ainda</div>}
                </div>
              </div>

              {/* Recent Trainers */}
              <div className="panel panel-recent">
                <div className="panel-header">
                  <h3>🆕 Novos Treinadores</h3>
                  <span className="panel-badge">{recentTrainers.length}</span>
                </div>
                <div className="panel-body">
                  {recentTrainers.map(trainer => (
                    <div key={trainer.id} className="trainer-row">
                      <div className="trainer-avatar">
                        {trainer.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="trainer-info">
                        <span className="trainer-name">{trainer.username}</span>
                        <span className="trainer-meta">Lv.{trainer.level} • {trainer.wins}W/{trainer.losses}L</span>
                      </div>
                      <span className="trainer-time">{formatTimeAgo(trainer.createdAt)}</span>
                    </div>
                  ))}
                  {recentTrainers.length === 0 && <div className="empty-state">Nenhum treinador recente</div>}
                </div>
              </div>

              {/* Recent Battles */}
              <div className="panel panel-battles-recent">
                <div className="panel-header">
                  <h3>⚡ Batalhas Recentes</h3>
                  <span className="panel-badge">{recentBattles.length}</span>
                </div>
                <div className="panel-body">
                  {recentBattles.map(battle => (
                    <div key={battle.id} className="battle-row">
                      <div className="battle-players">
                        <span className={battle.winner?.username === battle.player1.username ? 'winner' : ''}>
                          {battle.player1.username}
                        </span>
                        <span className="vs">vs</span>
                        <span className={battle.winner?.username === battle.player2.username ? 'winner' : ''}>
                          {battle.player2.username}
                        </span>
                      </div>
                      <div className="battle-meta">
                        <span className={`status-dot-inline ${battle.status}`} />
                        <span className="battle-type-tag">{battle.battleType === 'ai' ? 'IA' : 'PvP'}</span>
                        <span className="battle-time">{formatTimeAgo(battle.startedAt)}</span>
                      </div>
                    </div>
                  ))}
                  {recentBattles.length === 0 && <div className="empty-state">Nenhuma batalha recente</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Trainers Tab ── */}
        {activeTab === 'trainers' && (
          <div className="tab-content">
            <header className="main-header">
              <h2>Gerenciar Treinadores</h2>
              <div className="header-actions">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar por username ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadTrainers(1, searchTerm)}
                    className="search-input"
                  />
                </div>
                <button className="btn-primary" onClick={() => loadTrainers(1, searchTerm)}>Buscar</button>
              </div>
            </header>

            <div className="table-container">
              <table className="admin-table">
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
                      <td className="text-muted">{trainer.email}</td>
                      <td><span className="level-badge">Lv.{trainer.level}</span></td>
                      <td>{trainer.experience.toLocaleString()}</td>
                      <td className="wins">{trainer.wins}</td>
                      <td className="losses">{trainer.losses}</td>
                      <td><span className="ladder-points">{trainer.ladderPoints}</span></td>
                      <td>{trainer.clanMember?.clan?.name || <span className="text-muted">—</span>}</td>
                      <td className="text-muted">{formatDate(trainer.createdAt)}</td>
                      <td className="actions">
                        <button className="btn-icon btn-edit" onClick={() => handleEdit('trainer', trainer as unknown as Record<string, unknown>)} title="Editar">✏️</button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete('trainers', trainer.id)} title="Deletar">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {trainers.length === 0 && !loading && (
                    <tr><td colSpan={10} className="empty-table">Nenhum treinador encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => loadTrainers(page - 1, searchTerm)}>← Anterior</button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <span key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && <span className="page-dots">...</span>}
                        <button className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => loadTrainers(p, searchTerm)}>{p}</button>
                      </span>
                    ))}
                </div>
                <button disabled={page === totalPages} onClick={() => loadTrainers(page + 1, searchTerm)}>Próxima →</button>
              </div>
            )}
          </div>
        )}

        {/* ── Battles Tab ── */}
        {activeTab === 'battles' && (
          <div className="tab-content">
            <header className="main-header">
              <h2>Gerenciar Batalhas</h2>
              <button className="btn-refresh" onClick={() => loadBattles(page)}>
                <span className={loading ? 'spin' : ''}>⟳</span> Atualizar
              </button>
            </header>

            <div className="table-container">
              <table className="admin-table">
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
                      <td className="text-mono">{battle.id.slice(0, 8)}</td>
                      <td><strong>{battle.player1.username}</strong></td>
                      <td><strong>{battle.player2.username}</strong></td>
                      <td>
                        <span className={`status-badge status-${battle.status}`}>
                          {battle.status}
                        </span>
                      </td>
                      <td>{battle.turn}</td>
                      <td><span className="type-tag">{battle.battleType === 'ai' ? '🤖 IA' : '🎮 PvP'}</span></td>
                      <td>{battle.winner?.username || <span className="text-muted">—</span>}</td>
                      <td className="text-muted">{formatDate(battle.startedAt)}</td>
                      <td className="actions">
                        <button className="btn-icon btn-delete" onClick={() => handleDelete('battles', battle.id)} title="Deletar">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {battles.length === 0 && !loading && (
                    <tr><td colSpan={9} className="empty-table">Nenhuma batalha encontrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => loadBattles(page - 1)}>← Anterior</button>
                <span className="page-info">Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => loadBattles(page + 1)}>Próxima →</button>
              </div>
            )}
          </div>
        )}

        {/* ── Clans Tab ── */}
        {activeTab === 'clans' && (
          <div className="tab-content">
            <header className="main-header">
              <h2>Gerenciar Clãs</h2>
              <button className="btn-refresh" onClick={() => loadClans(page)}>
                <span className={loading ? 'spin' : ''}>⟳</span> Atualizar
              </button>
            </header>

            <div className="table-container">
              <table className="admin-table">
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
                      <td><span className="clan-tag">[{clan.tag}]</span></td>
                      <td>{clan.leader.username}</td>
                      <td><span className="member-count">{clan.memberCount}</span></td>
                      <td><span className="ladder-points">{clan.points}</span></td>
                      <td className="text-muted">{formatDate(clan.createdAt)}</td>
                      <td className="actions">
                        <button className="btn-icon btn-edit" onClick={() => handleEdit('clan', clan as unknown as Record<string, unknown>)} title="Editar">✏️</button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete('clans', clan.id)} title="Deletar">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {clans.length === 0 && !loading && (
                    <tr><td colSpan={7} className="empty-table">Nenhum clã encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => loadClans(page - 1)}>← Anterior</button>
                <span className="page-info">Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => loadClans(page + 1)}>Próxima →</button>
              </div>
            )}
          </div>
        )}

        {/* ── Pokemon Tab ── */}
        {activeTab === 'pokemon' && (
          <div className="tab-content">
            <header className="main-header">
              <h2>Gerenciar Pokémon</h2>
              <button className="btn-refresh" onClick={loadPokemon}>
                <span className={loading ? 'spin' : ''}>⟳</span> Atualizar
              </button>
            </header>

            <div className="table-container">
              <table className="admin-table">
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
                      <td><span className="category-tag">{poke.category}</span></td>
                      <td><span className="hp-value">{poke.health}</span></td>
                      <td>{poke.isStarter ? <span className="badge-yes">Sim</span> : <span className="badge-no">Não</span>}</td>
                      <td>{poke.unlockCost > 0 ? `${poke.unlockCost.toLocaleString()} 🪙` : <span className="text-muted">Grátis</span>}</td>
                      <td><span className="member-count">{poke._count.trainers}</span></td>
                      <td className="actions">
                        <button className="btn-icon btn-edit" onClick={() => handleEdit('pokemon', poke as unknown as Record<string, unknown>)} title="Editar">✏️</button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete('pokemon', poke.id)} title="Deletar">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {pokemon.length === 0 && !loading && (
                    <tr><td colSpan={7} className="empty-table">Nenhum pokémon encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar {editType === 'trainer' ? 'Treinador' : editType === 'clan' ? 'Clã' : 'Pokémon'}</h3>
              <button className="modal-close" onClick={() => setEditingItem(null)}>✕</button>
            </div>

            <div className="modal-content">
              {editType === 'trainer' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Level</label>
                      <input type="number" value={editingItem.level as number} onChange={e => setEditingItem({...editingItem, level: parseInt(e.target.value)})} />
                    </div>
                    <div className="form-group">
                      <label>Experience</label>
                      <input type="number" value={editingItem.experience as number} onChange={e => setEditingItem({...editingItem, experience: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Vitórias</label>
                      <input type="number" value={editingItem.wins as number} onChange={e => setEditingItem({...editingItem, wins: parseInt(e.target.value)})} />
                    </div>
                    <div className="form-group">
                      <label>Derrotas</label>
                      <input type="number" value={editingItem.losses as number} onChange={e => setEditingItem({...editingItem, losses: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ladder Points</label>
                    <input type="number" value={editingItem.ladderPoints as number} onChange={e => setEditingItem({...editingItem, ladderPoints: parseInt(e.target.value)})} />
                  </div>
                </>
              )}

              {editType === 'clan' && (
                <>
                  <div className="form-group">
                    <label>Nome</label>
                    <input type="text" value={editingItem.name as string} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Pontos</label>
                    <input type="number" value={editingItem.points as number} onChange={e => setEditingItem({...editingItem, points: parseInt(e.target.value)})} />
                  </div>
                </>
              )}

              {editType === 'pokemon' && (
                <>
                  <div className="form-group">
                    <label>Nome</label>
                    <input type="text" value={editingItem.name as string} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>HP</label>
                      <input type="number" value={editingItem.health as number} onChange={e => setEditingItem({...editingItem, health: parseInt(e.target.value)})} />
                    </div>
                    <div className="form-group">
                      <label>Custo de Desbloqueio</label>
                      <input type="number" value={editingItem.unlockCost as number} onChange={e => setEditingItem({...editingItem, unlockCost: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="form-group form-check">
                    <label>
                      <input type="checkbox" checked={editingItem.isStarter as boolean} onChange={e => setEditingItem({...editingItem, isStarter: e.target.checked})} />
                      <span>Starter</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditingItem(null)}>Cancelar</button>
              <button className="btn-save" onClick={handleSaveEdit}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
