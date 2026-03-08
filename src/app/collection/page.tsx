'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const CardPackOpener = dynamic(() => import('@/components/CardPackOpener'), { ssr: false });

// ==========================================
// COLLECTION PAGE
// Shows all Pokemon with silhouettes for locked ones
// ==========================================

interface CollectionPokemon {
  id: string;
  name: string;
  types: string;
  category: string;
  health: number;
  description: string | null;
  owned: boolean;
  isNew: boolean;
  obtainedMethod: string | null;
  unlockedAt: string | null;
  canUnlock: boolean;
  unlockMethod: string | null;
  unlockRequirement: string | number | null;
  unlockDescription: string;
}

interface CollectionData {
  collection: CollectionPokemon[];
  stats: { owned: number; total: number; percentage: number };
  level: number;
}

interface ProgressionStatus {
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  progress: number;
  totalXP: number;
  pendingPacks: number;
  packWinCounter: number;
  winsUntilPack: number;
  ownedPokemon: number;
  totalPokemon: number;
  dailyQuests: QuestData[];
  weeklyQuests: QuestData[];
  stats: { wins: number; losses: number; streak: number; maxStreak: number; ladderPoints: number };
}

interface QuestData {
  id: string;
  type: string;
  description: string;
  current: number;
  target: number;
  rewardXP: number;
  rewardPack?: boolean;
  completed: boolean;
  expiresAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  Fire: '#F08030', Water: '#6890F0', Grass: '#78C850', Electric: '#F8D030',
  Psychic: '#F85888', Fighting: '#C03028', Ghost: '#705898', Dragon: '#7038F8',
  Normal: '#A8A878', Flying: '#A890F0', Poison: '#A040A0', Ground: '#E0C068',
  Rock: '#B8A038', Bug: '#A8B820', Ice: '#98D8D8', Steel: '#B8B8D0',
  Dark: '#705848', Fairy: '#EE99AC',
};

const METHOD_ICONS: Record<string, string> = {
  starter: '🌟', level: '📈', streak: '🔥', achievement: '🏆', pack: '🎁', mission: '📜',
};

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [progression, setProgression] = useState<ProgressionStatus | null>(null);
  const [filter, setFilter] = useState<'all' | 'owned' | 'locked'>('all');
  const [showPackOpener, setShowPackOpener] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<CollectionPokemon | null>(null);
  const [tab, setTab] = useState<'collection' | 'quests'>('collection');

  const fetchData = useCallback(async () => {
    try {
      const [colRes, progRes] = await Promise.all([
        fetch('/api/progression/collection'),
        fetch('/api/progression/status'),
      ]);

      if (colRes.ok) {
        const colData = await colRes.json();
        setCollection(colData.data);
      }
      if (progRes.ok) {
        const progData = await progRes.json();
        setProgression(progData.data);
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch missions on first load
  useEffect(() => {
    fetch('/api/progression/missions').catch(() => {});
  }, []);

  const claimQuest = async (questId: string, questType: 'daily' | 'weekly') => {
    try {
      const res = await fetch('/api/progression/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, questType }),
      });
      if (res.ok) {
        fetchData(); // Refresh
      }
    } catch { /* */ }
  };

  const filteredCollection = collection?.collection.filter(p => {
    if (filter === 'owned') return p.owned;
    if (filter === 'locked') return !p.owned;
    return true;
  }) ?? [];

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p>Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header with XP Bar */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.pageTitle}>📦 Collection</h1>
          <div style={styles.headerActions}>
            {progression && progression.pendingPacks > 0 && (
              <button style={styles.packButton} onClick={() => setShowPackOpener(true)}>
                🎁 Open Pack ({progression.pendingPacks})
              </button>
            )}
            <a href="/play" style={styles.backLink}>← Back to Play</a>
          </div>
        </div>

        {progression && (
          <div style={styles.progressionBar}>
            <div style={styles.levelInfo}>
              <span style={styles.levelBadge}>Lv. {progression.level}</span>
              <span style={styles.xpText}>
                {progression.currentLevelXP} / {progression.xpToNextLevel} XP
              </span>
              <span style={styles.totalXP}>Total: {progression.totalXP} XP</span>
            </div>
            <div style={styles.xpBarOuter}>
              <div
                style={{ ...styles.xpBarInner, width: `${progression.progress}%` }}
              />
            </div>
            <div style={styles.statsRow}>
              <span>🏆 {collection?.stats.owned}/{collection?.stats.total} Pokémon ({collection?.stats.percentage}%)</span>
              <span>🔥 Streak: {progression.stats.streak}</span>
              <span>🎁 {progression.winsUntilPack} wins until next pack</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'collection' ? styles.tabBtnActive : {}) }}
          onClick={() => setTab('collection')}
        >
          📦 Collection
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'quests' ? styles.tabBtnActive : {}) }}
          onClick={() => setTab('quests')}
        >
          📋 Quests
        </button>
      </div>

      {tab === 'collection' && (
        <>
          {/* Filters */}
          <div style={styles.filters}>
            {(['all', 'owned', 'locked'] as const).map(f => (
              <button
                key={f}
                style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'owned' ? '✅ Owned' : '🔒 Locked'}
                {f === 'all' ? ` (${collection?.stats.total})` :
                 f === 'owned' ? ` (${collection?.stats.owned})` :
                 ` (${(collection?.stats.total ?? 0) - (collection?.stats.owned ?? 0)})`}
              </button>
            ))}
          </div>

          {/* Pokemon Grid */}
          <div style={styles.grid}>
            {filteredCollection.map(poke => {
              const types = JSON.parse(poke.types || '[]') as string[];
              const primaryColor = TYPE_COLORS[types[0]] || '#A8A878';

              return (
                <div
                  key={poke.id}
                  style={{
                    ...styles.pokemonCard,
                    ...(poke.owned ? {
                      borderColor: primaryColor,
                      boxShadow: `0 0 15px ${primaryColor}33`,
                    } : {
                      opacity: 0.5,
                      filter: poke.canUnlock ? 'none' : 'grayscale(0.8)',
                    }),
                  }}
                  onClick={() => setSelectedPokemon(poke)}
                >
                  {poke.isNew && <div style={styles.newTag}>NEW</div>}

                  <div style={styles.pokemonEmoji}>
                    {poke.owned ? (
                      <span style={{ fontSize: '40px' }}>
                        {types[0] === 'Fire' ? '🔥' : types[0] === 'Water' ? '💧' :
                         types[0] === 'Grass' ? '🌿' : types[0] === 'Electric' ? '⚡' :
                         types[0] === 'Psychic' ? '🔮' : types[0] === 'Fighting' ? '👊' :
                         types[0] === 'Ghost' ? '👻' : types[0] === 'Dragon' ? '🐉' :
                         types[0] === 'Ice' ? '❄️' : types[0] === 'Rock' ? '🪨' :
                         types[0] === 'Bug' ? '🐛' : types[0] === 'Steel' ? '⚙️' :
                         types[0] === 'Dark' ? '🌑' : types[0] === 'Poison' ? '☠️' :
                         types[0] === 'Flying' ? '🦅' : '⭐'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '40px', filter: 'brightness(0)' }}>❓</span>
                    )}
                  </div>

                  <div style={styles.pokemonName}>
                    {poke.owned ? poke.name : poke.canUnlock ? poke.name : '???'}
                  </div>

                  <div style={styles.typeBadges}>
                    {poke.owned && types.map(t => (
                      <span key={t} style={{ ...styles.typeBadge, backgroundColor: TYPE_COLORS[t] || '#A8A878' }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {!poke.owned && (
                    <div style={styles.lockInfo}>
                      {poke.canUnlock ? (
                        <span style={{ color: '#78c850' }}>✅ Ready to claim!</span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                          {METHOD_ICONS[poke.unlockMethod || ''] || '🔒'} {poke.unlockDescription}
                        </span>
                      )}
                    </div>
                  )}

                  {poke.owned && poke.obtainedMethod && (
                    <div style={styles.obtainedBadge}>
                      {METHOD_ICONS[poke.obtainedMethod] || ''} {poke.obtainedMethod}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'quests' && progression && (
        <div style={styles.questsContainer}>
          {/* Daily Quests */}
          <div style={styles.questSection}>
            <h3 style={styles.questSectionTitle}>📋 Daily Quests</h3>
            {progression.dailyQuests.length === 0 ? (
              <p style={styles.noQuests}>No active daily quests. Play a battle to generate them!</p>
            ) : (
              progression.dailyQuests.map(q => (
                <div key={q.id} style={{ ...styles.questCard, ...(q.completed ? styles.questCompleted : {}) }}>
                  <div style={styles.questInfo}>
                    <div style={styles.questDesc}>{q.description}</div>
                    <div style={styles.questProgress}>
                      <div style={styles.questProgressBar}>
                        <div style={{ ...styles.questProgressFill, width: `${Math.min(100, (q.current / q.target) * 100)}%` }} />
                      </div>
                      <span style={styles.questProgressText}>{q.current}/{q.target}</span>
                    </div>
                  </div>
                  <div style={styles.questReward}>
                    <span style={styles.questXP}>+{q.rewardXP} XP</span>
                    {q.completed && (
                      <button style={styles.claimBtn} onClick={() => claimQuest(q.id, 'daily')}>
                        Claim!
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Weekly Quests */}
          <div style={styles.questSection}>
            <h3 style={styles.questSectionTitle}>📅 Weekly Quests</h3>
            {progression.weeklyQuests.length === 0 ? (
              <p style={styles.noQuests}>No active weekly quests.</p>
            ) : (
              progression.weeklyQuests.map(q => (
                <div key={q.id} style={{ ...styles.questCard, ...(q.completed ? styles.questCompleted : {}) }}>
                  <div style={styles.questInfo}>
                    <div style={styles.questDesc}>{q.description}</div>
                    <div style={styles.questProgress}>
                      <div style={styles.questProgressBar}>
                        <div style={{ ...styles.questProgressFill, width: `${Math.min(100, (q.current / q.target) * 100)}%` }} />
                      </div>
                      <span style={styles.questProgressText}>{q.current}/{q.target}</span>
                    </div>
                  </div>
                  <div style={styles.questReward}>
                    <span style={styles.questXP}>+{q.rewardXP} XP</span>
                    {q.rewardPack && <span style={styles.questPackReward}>🎁 +1 Pack</span>}
                    {q.completed && (
                      <button style={styles.claimBtn} onClick={() => claimQuest(q.id, 'weekly')}>
                        Claim!
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <div style={styles.detailOverlay} onClick={() => setSelectedPokemon(null)}>
          <div style={styles.detailModal} onClick={e => e.stopPropagation()}>
            <button style={styles.detailClose} onClick={() => setSelectedPokemon(null)}>✕</button>
            <h3 style={styles.detailName}>{selectedPokemon.owned ? selectedPokemon.name : '???'}</h3>
            <div style={styles.detailTypes}>
              {JSON.parse(selectedPokemon.types || '[]').map((t: string) => (
                <span key={t} style={{ ...styles.typeBadge, backgroundColor: TYPE_COLORS[t] || '#A8A878' }}>
                  {selectedPokemon.owned ? t : '??'}
                </span>
              ))}
            </div>
            {selectedPokemon.owned && (
              <>
                <p style={styles.detailDesc}>{selectedPokemon.description}</p>
                <p style={styles.detailHP}>❤️ HP: {selectedPokemon.health}</p>
                <p style={styles.detailCategory}>Category: {selectedPokemon.category}</p>
                <p style={styles.detailObtained}>
                  Obtained via: {METHOD_ICONS[selectedPokemon.obtainedMethod || ''] || ''} {selectedPokemon.obtainedMethod}
                  {selectedPokemon.unlockedAt && ` on ${new Date(selectedPokemon.unlockedAt).toLocaleDateString()}`}
                </p>
              </>
            )}
            {!selectedPokemon.owned && (
              <div style={styles.detailLock}>
                <p style={styles.detailLockText}>🔒 Locked</p>
                <p style={styles.detailUnlockReq}>
                  {METHOD_ICONS[selectedPokemon.unlockMethod || ''] || ''} {selectedPokemon.unlockDescription}
                </p>
                {selectedPokemon.canUnlock && (
                  <p style={{ color: '#78c850', fontWeight: 700 }}>✅ You meet the requirements!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Pack Opener */}
      {showPackOpener && progression && (
        <CardPackOpener
          onClose={() => { setShowPackOpener(false); fetchData(); }}
          pendingPacks={progression.pendingPacks}
          onPackOpened={fetchData}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: '#fff',
    fontFamily: "'Rajdhani', sans-serif",
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #f8d030',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 24px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  packButton: {
    background: 'linear-gradient(135deg, #f8d030, #e8a020)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    animation: 'pulse 2s ease-in-out infinite',
  },
  backLink: {
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    fontSize: '14px',
  },
  progressionBar: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  levelInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  levelBadge: {
    background: 'linear-gradient(135deg, #f8d030, #e8a020)',
    color: '#1a1a2e',
    padding: '2px 12px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '14px',
  },
  xpText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
  },
  totalXP: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    marginLeft: 'auto',
  },
  xpBarOuter: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  xpBarInner: {
    height: '100%',
    background: 'linear-gradient(90deg, #f8d030, #78c850)',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    flexWrap: 'wrap' as const,
  },
  tabNav: {
    display: 'flex',
    gap: '8px',
    maxWidth: '1200px',
    margin: '0 auto 16px',
  },
  tabBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 20px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif",
  },
  tabBtnActive: {
    background: 'rgba(248,208,48,0.15)',
    borderColor: '#f8d030',
    color: '#f8d030',
  },
  filters: {
    display: 'flex',
    gap: '8px',
    maxWidth: '1200px',
    margin: '0 auto 20px',
    flexWrap: 'wrap' as const,
  },
  filterBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '6px 16px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif",
  },
  filterBtnActive: {
    background: 'rgba(104,144,240,0.2)',
    borderColor: '#6890f0',
    color: '#6890f0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pokemonCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  },
  newTag: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    background: '#78c850',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
  },
  pokemonEmoji: {
    marginBottom: '8px',
  },
  pokemonName: {
    fontSize: '14px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  typeBadges: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: '6px',
  },
  typeBadge: {
    fontSize: '10px',
    padding: '1px 6px',
    borderRadius: '4px',
    color: '#fff',
    fontWeight: 600,
  },
  lockInfo: {
    marginTop: '4px',
  },
  obtainedBadge: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '4px',
    textTransform: 'capitalize' as const,
  },
  questsContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  questSection: {
    marginBottom: '24px',
  },
  questSectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#f8d030',
  },
  noQuests: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  questCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '8px',
    gap: '16px',
  },
  questCompleted: {
    borderColor: '#78c850',
    background: 'rgba(120,200,80,0.1)',
  },
  questInfo: {
    flex: 1,
  },
  questDesc: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '6px',
  },
  questProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  questProgressBar: {
    flex: 1,
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6890f0, #78c850)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  questProgressText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    minWidth: '40px',
  },
  questReward: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '4px',
  },
  questXP: {
    color: '#f8d030',
    fontWeight: 700,
    fontSize: '14px',
  },
  questPackReward: {
    fontSize: '12px',
    color: '#78c850',
  },
  claimBtn: {
    background: 'linear-gradient(135deg, #78c850, #68b040)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  detailOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
  },
  detailModal: {
    background: 'linear-gradient(145deg, rgba(20,20,50,0.95), rgba(10,10,30,0.98))',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90vw',
    position: 'relative' as const,
    textAlign: 'center' as const,
  },
  detailClose: {
    position: 'absolute' as const,
    top: '12px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '20px',
    cursor: 'pointer',
  },
  detailName: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '12px',
  },
  detailTypes: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  detailDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    marginBottom: '12px',
    lineHeight: 1.4,
  },
  detailHP: {
    fontSize: '16px',
    marginBottom: '8px',
  },
  detailCategory: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '8px',
  },
  detailObtained: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
  },
  detailLock: {
    padding: '16px',
  },
  detailLockText: {
    fontSize: '24px',
    marginBottom: '12px',
  },
  detailUnlockReq: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
  },
};
