'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import './clan-wars.css';

interface ClanWarData {
  id: string;
  attacker: { id: string; name: string; tag: string };
  defender: { id: string; name: string; tag: string };
  status: 'pending' | 'active' | 'finished';
  attackerWins: number;
  defenderWins: number;
  startedAt: string;
  finishedAt: string | null;
}

interface MyClan {
  id: string;
  name: string;
  tag: string;
  myRole: string;
}

export default function ClanWarsPage() {
  const [wars, setWars] = useState<ClanWarData[]>([]);
  const [myClan, setMyClan] = useState<MyClan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [targetClanTag, setTargetClanTag] = useState('');
  const [declareError, setDeclareError] = useState('');
  const [declareSuccess, setDeclareSuccess] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [warsRes, clanRes] = await Promise.all([
        fetch('/api/clan-wars'),
        fetch('/api/clans/my-clan'),
      ]);

      if (warsRes.ok) {
        const warsData = await warsRes.json();
        setWars(warsData.wars || []);
      }
      if (clanRes.ok) {
        const clanData = await clanRes.json();
        setMyClan({ id: clanData.id, name: clanData.name, tag: clanData.tag, myRole: clanData.myRole || 'member' });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeclareWar = async () => {
    setDeclareError('');
    setDeclareSuccess('');
    if (!targetClanTag.trim()) {
      setDeclareError('Enter the target clan tag');
      return;
    }
    try {
      const res = await fetch('/api/clan-wars/declare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defenderTag: targetClanTag.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to declare war');
      setDeclareSuccess(`War declared against [${targetClanTag}]!`);
      setTargetClanTag('');
      await fetchData();
      setTimeout(() => setShowDeclareModal(false), 1500);
    } catch (err) {
      setDeclareError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleAcceptWar = async (warId: string) => {
    try {
      const res = await fetch('/api/clan-wars/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      await fetchData();
    } catch {
      // handle silently
    }
  };

  const canDeclare = myClan && (myClan.myRole === 'leader' || myClan.myRole === 'officer');

  const activeWars = wars.filter(w => w.status === 'active');
  const pendingWars = wars.filter(w => w.status === 'pending');
  const finishedWars = wars.filter(w => w.status === 'finished');

  return (
    <div className="cw-page">
      <nav className="cw-nav">
        <Link href="/" className="cw-nav-back">&larr; Home</Link>
        <h1 className="cw-nav-title">Clan Wars</h1>
        <div className="cw-nav-actions">
          {canDeclare && (
            <button className="cw-declare-btn" onClick={() => setShowDeclareModal(true)}>
              Declare War
            </button>
          )}
        </div>
      </nav>

      <div className="cw-content">
        {loading ? (
          <div className="cw-loading">Loading wars...</div>
        ) : !myClan ? (
          <div className="cw-no-clan">
            <h2>Join a Clan First</h2>
            <p>You need to be in a clan to participate in Clan Wars.</p>
            <Link href="/clans" className="cw-join-btn">Browse Clans</Link>
          </div>
        ) : (
          <>
            {/* Active Wars */}
            <section className="cw-section">
              <h2 className="cw-section-title">
                <span className="cw-dot cw-dot-active" />
                Active Wars ({activeWars.length})
              </h2>
              {activeWars.length === 0 ? (
                <p className="cw-empty">No active wars. Declare war on a rival clan!</p>
              ) : (
                <div className="cw-wars-grid">
                  {activeWars.map(war => (
                    <WarCard key={war.id} war={war} myClanId={myClan.id} />
                  ))}
                </div>
              )}
            </section>

            {/* Pending Wars */}
            {pendingWars.length > 0 && (
              <section className="cw-section">
                <h2 className="cw-section-title">
                  <span className="cw-dot cw-dot-pending" />
                  Pending Challenges ({pendingWars.length})
                </h2>
                <div className="cw-wars-grid">
                  {pendingWars.map(war => (
                    <WarCard
                      key={war.id}
                      war={war}
                      myClanId={myClan.id}
                      onAccept={war.defender.id === myClan.id && canDeclare ? () => handleAcceptWar(war.id) : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* War History */}
            <section className="cw-section">
              <h2 className="cw-section-title">
                <span className="cw-dot cw-dot-finished" />
                War History ({finishedWars.length})
              </h2>
              {finishedWars.length === 0 ? (
                <p className="cw-empty">No completed wars yet.</p>
              ) : (
                <div className="cw-wars-grid">
                  {finishedWars.slice(0, 10).map(war => (
                    <WarCard key={war.id} war={war} myClanId={myClan.id} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Declare War Modal */}
      {showDeclareModal && (
        <div className="cw-modal-overlay" onClick={() => setShowDeclareModal(false)}>
          <div className="cw-modal" onClick={e => e.stopPropagation()}>
            <h3 className="cw-modal-title">Declare Clan War</h3>
            <p className="cw-modal-desc">
              Challenge another clan to a best-of series. Wins in ranked PvP between clan members count toward the war score.
            </p>
            <div className="cw-modal-field">
              <label>Target Clan Tag</label>
              <input
                type="text"
                value={targetClanTag}
                onChange={e => setTargetClanTag(e.target.value)}
                placeholder="e.g. RKTS"
                maxLength={10}
              />
            </div>
            {declareError && <p className="cw-modal-error">{declareError}</p>}
            {declareSuccess && <p className="cw-modal-success">{declareSuccess}</p>}
            <div className="cw-modal-actions">
              <button className="cw-modal-cancel" onClick={() => setShowDeclareModal(false)}>Cancel</button>
              <button className="cw-modal-confirm" onClick={handleDeclareWar}>Declare War</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WarCard({ war, myClanId, onAccept }: { war: ClanWarData; myClanId: string; onAccept?: () => void }) {
  const isAttacker = war.attacker.id === myClanId;
  const myScore = isAttacker ? war.attackerWins : war.defenderWins;
  const theirScore = isAttacker ? war.defenderWins : war.attackerWins;
  const opponent = isAttacker ? war.defender : war.attacker;
  const totalGames = war.attackerWins + war.defenderWins;
  const bestOf = 5;
  const progress = Math.min((totalGames / bestOf) * 100, 100);

  const isWinner = war.status === 'finished' && myScore > theirScore;
  const isLoser = war.status === 'finished' && myScore < theirScore;

  return (
    <div className={`cw-war-card cw-war-${war.status} ${isWinner ? 'cw-war-won' : ''} ${isLoser ? 'cw-war-lost' : ''}`}>
      <div className="cw-war-header">
        <span className={`cw-war-status cw-status-${war.status}`}>
          {war.status === 'pending' ? 'Pending' : war.status === 'active' ? 'Active' : 'Finished'}
        </span>
        <span className="cw-war-date">
          {new Date(war.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="cw-war-versus">
        <div className="cw-war-clan cw-war-clan-left">
          <span className="cw-war-tag">[{war.attacker.tag}]</span>
          <span className="cw-war-name">{war.attacker.name}</span>
        </div>
        <div className="cw-war-score">
          <span className="cw-score-num">{war.attackerWins}</span>
          <span className="cw-score-vs">VS</span>
          <span className="cw-score-num">{war.defenderWins}</span>
        </div>
        <div className="cw-war-clan cw-war-clan-right">
          <span className="cw-war-tag">[{war.defender.tag}]</span>
          <span className="cw-war-name">{war.defender.name}</span>
        </div>
      </div>

      {war.status === 'active' && (
        <div className="cw-war-progress">
          <div className="cw-war-progress-bar">
            <div className="cw-war-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="cw-war-progress-text">Best of {bestOf} - {totalGames} played</span>
        </div>
      )}

      {onAccept && war.status === 'pending' && (
        <button className="cw-accept-btn" onClick={onAccept}>Accept Challenge</button>
      )}

      {war.status === 'finished' && (
        <div className={`cw-war-result ${isWinner ? 'cw-result-win' : isLoser ? 'cw-result-loss' : 'cw-result-draw'}`}>
          {isWinner ? 'VICTORY' : isLoser ? 'DEFEAT' : 'DRAW'}
        </div>
      )}
    </div>
  );
}
