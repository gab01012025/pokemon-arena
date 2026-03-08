'use client';

import { useState, useCallback, useEffect } from 'react';

// ==========================================
// CARD PACK OPENER - Gacha-lite animation
// ==========================================

interface PackCard {
  pokemonName: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra_rare';
  isDuplicate: boolean;
  duplicateXP: number;
}

interface CardPackOpenerProps {
  onClose: () => void;
  pendingPacks: number;
  onPackOpened?: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#a8a878',
  uncommon: '#78c850',
  rare: '#6890f0',
  ultra_rare: '#f8d030',
};

const RARITY_GLOW: Record<string, string> = {
  common: '0 0 20px rgba(168,168,120,0.4)',
  uncommon: '0 0 30px rgba(120,200,80,0.5)',
  rare: '0 0 40px rgba(104,144,240,0.6)',
  ultra_rare: '0 0 60px rgba(248,208,48,0.8), 0 0 100px rgba(248,208,48,0.3)',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  ultra_rare: '★ Ultra Rare ★',
};

export default function CardPackOpener({ onClose, pendingPacks, onPackOpened }: CardPackOpenerProps) {
  const [phase, setPhase] = useState<'ready' | 'opening' | 'reveal' | 'done'>('ready');
  const [cards, setCards] = useState<PackCard[]>([]);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateXPTotal, setDuplicateXPTotal] = useState(0);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [remainingPacks, setRemainingPacks] = useState(pendingPacks);

  const openPack = useCallback(async () => {
    if (remainingPacks <= 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/progression/card-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to open pack');
      }

      const data = await res.json();
      const result = data.data;

      setCards(result.cards);
      setNewUnlocks(result.newUnlocks || []);
      setDuplicateXPTotal(result.duplicateXPGained || 0);
      setRemainingPacks(result.remainingPacks);
      setPhase('opening');

      // Start reveal animation after pack shake
      setTimeout(() => {
        setPhase('reveal');
        setRevealIndex(0);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open pack');
    } finally {
      setLoading(false);
    }
  }, [remainingPacks]);

  // Auto-reveal cards one by one
  useEffect(() => {
    if (phase !== 'reveal' || revealIndex < 0) return;
    if (revealIndex >= cards.length) {
      setPhase('done');
      onPackOpened?.();
      return;
    }

    const timer = setTimeout(() => {
      setRevealIndex(prev => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [phase, revealIndex, cards.length, onPackOpened]);

  const resetForNext = () => {
    setPhase('ready');
    setCards([]);
    setRevealIndex(-1);
    setNewUnlocks([]);
    setDuplicateXPTotal(0);
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && phase === 'ready' && onClose()}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        <h2 style={styles.title}>🎁 Card Pack</h2>

        {phase === 'ready' && (
          <div style={styles.readyContainer}>
            <div style={styles.packIcon}>🃏</div>
            <p style={styles.packCount}>{remainingPacks} pack{remainingPacks !== 1 ? 's' : ''} available</p>
            {error && <p style={styles.error}>{error}</p>}
            <button
              style={styles.openBtn}
              onClick={openPack}
              disabled={loading || remainingPacks <= 0}
            >
              {loading ? 'Opening...' : remainingPacks > 0 ? 'Open Pack!' : 'No Packs Available'}
            </button>
          </div>
        )}

        {phase === 'opening' && (
          <div style={styles.openingContainer}>
            <div style={styles.packShake}>🃏</div>
            <p style={styles.openingText}>Opening...</p>
          </div>
        )}

        {(phase === 'reveal' || phase === 'done') && (
          <div style={styles.revealContainer}>
            <div style={styles.cardsRow}>
              {cards.map((card, i) => {
                const revealed = i < revealIndex || phase === 'done';
                const rarityColor = RARITY_COLORS[card.rarity] || '#a8a878';
                const rarityGlow = RARITY_GLOW[card.rarity] || 'none';
                const isNewThisReveal = i === revealIndex - 1 && phase === 'reveal';

                return (
                  <div
                    key={i}
                    style={{
                      ...styles.card,
                      ...(revealed ? {
                        borderColor: rarityColor,
                        boxShadow: rarityGlow,
                        transform: isNewThisReveal ? 'scale(1.1) rotateY(0deg)' : 'scale(1) rotateY(0deg)',
                      } : {
                        transform: 'rotateY(180deg)',
                      }),
                    }}
                  >
                    {revealed ? (
                      <>
                        <div style={{ ...styles.rarityBadge, backgroundColor: rarityColor }}>
                          {RARITY_LABELS[card.rarity]}
                        </div>
                        <div style={styles.cardPokemonName}>{card.pokemonName}</div>
                        <div style={styles.cardEmoji}>
                          {card.rarity === 'ultra_rare' ? '✨' : card.rarity === 'rare' ? '💎' : '⭐'}
                        </div>
                        {card.isDuplicate ? (
                          <div style={styles.duplicateBadge}>
                            Duplicate +{card.duplicateXP} XP
                          </div>
                        ) : (
                          <div style={styles.newBadge}>NEW!</div>
                        )}
                      </>
                    ) : (
                      <div style={styles.cardBack}>?</div>
                    )}
                  </div>
                );
              })}
            </div>

            {phase === 'done' && (
              <div style={styles.summary}>
                {newUnlocks.length > 0 && (
                  <p style={styles.unlockText}>
                    🎉 New Pokémon: {newUnlocks.join(', ')}
                  </p>
                )}
                {duplicateXPTotal > 0 && (
                  <p style={styles.xpText}>+{duplicateXPTotal} XP from duplicates</p>
                )}
                <div style={styles.doneActions}>
                  {remainingPacks > 0 && (
                    <button style={styles.openBtn} onClick={resetForNext}>
                      Open Another ({remainingPacks} left)
                    </button>
                  )}
                  <button style={styles.closeButton} onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(8px)',
  },
  modal: {
    background: 'linear-gradient(145deg, rgba(20,20,50,0.95), rgba(10,10,30,0.98))',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '600px',
    width: '90vw',
    position: 'relative',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '20px',
    cursor: 'pointer',
  },
  title: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '24px',
    color: '#fff',
  },
  readyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  packIcon: {
    fontSize: '80px',
    filter: 'drop-shadow(0 0 20px rgba(248,208,48,0.4))',
  },
  packCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
  openBtn: {
    background: 'linear-gradient(135deg, #f8d030, #e8a020)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif",
  },
  error: {
    color: '#ff6b6b',
    fontSize: '13px',
  },
  openingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  packShake: {
    fontSize: '80px',
    animation: 'packShake 0.3s ease-in-out infinite alternate',
  },
  openingText: {
    color: '#f8d030',
    fontSize: '18px',
    fontWeight: 600,
  },
  revealContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  cardsRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  card: {
    width: '140px',
    height: '200px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'linear-gradient(145deg, rgba(30,30,60,0.9), rgba(15,15,40,0.95))',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    perspective: '1000px',
  },
  rarityBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#1a1a2e',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  cardPokemonName: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    fontFamily: "'Rajdhani', sans-serif",
  },
  cardEmoji: {
    fontSize: '32px',
  },
  duplicateBadge: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  newBadge: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#78c850',
    textShadow: '0 0 10px rgba(120,200,80,0.5)',
  },
  cardBack: {
    fontSize: '40px',
    color: 'rgba(255,255,255,0.3)',
  },
  summary: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  unlockText: {
    color: '#78c850',
    fontSize: '16px',
    fontWeight: 600,
  },
  xpText: {
    color: '#f8d030',
    fontSize: '14px',
  },
  doneActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  closeButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif",
  },
};
