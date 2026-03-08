'use client';

import { BattleItem, LogEntry, GamePhase } from '../types';

interface BattleBottomBarProps {
  phase: GamePhase;
  items: BattleItem[];
  showItems: boolean;
  setShowItems: (show: boolean) => void;
  battleLog: LogEntry[];
  evolvableList: { idx: number; name: string }[];
  onEvolve: (idx: number) => void;
  onSurrender: () => void;
  usedItemThisTurn: boolean;
}

export default function BattleBottomBar({
  phase,
  items,
  showItems,
  setShowItems,
  battleLog,
  evolvableList,
  onEvolve,
  onSurrender,
  usedItemThisTurn,
}: BattleBottomBarProps) {
  return (
    <div className="bottom-bar">
      <div className="bottom-left">
        <div className="action-buttons">
          <button className="action-btn danger" onClick={onSurrender}>SURRENDER</button>
          <button className="action-btn item" onClick={() => setShowItems(!showItems)} disabled={phase !== 'player1-turn' || usedItemThisTurn}>
            {usedItemThisTurn ? 'ITEM USED' : `ITEMS (${items.reduce((s, i) => s + i.uses, 0)})`}
          </button>
          {evolvableList.map(e => (
            <button
              key={e.idx}
              className="action-btn evolve"
              onClick={() => onEvolve(e.idx)}
              disabled={phase !== 'player1-turn'}
            >
              EVOLVE {e.name} ✨
            </button>
          ))}
        </div>
      </div>
      <div className="battle-log">
        {battleLog.map(entry => (
          <div key={entry.id} className={`log-entry ${entry.type}`}>{entry.text}</div>
        ))}
      </div>
    </div>
  );
}
