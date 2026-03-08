'use client';

import { type ClientLogEntry } from '@/lib/game-socket';
import BattleChat from './BattleChat';

const EMOTES = ['GG', 'Nice!', 'Wow!', 'Sorry'] as const;

interface BattleLogProps {
  battleLog: ClientLogEntry[];
  targetingSlot: { fighterIdx: number; skillIdx: number } | null;
  allReady: boolean;
  isReady: boolean;
  readyCount: number;
  aliveFighterCount: number;
  onSubmitMoves: () => void;
  onSurrenderClick: () => void;
  onCancelTarget: () => void;
  chatMessages: Array<{ username: string; message: string; timestamp: number }>;
  onSendChat: (msg: string) => void;
  onSendEmote?: (emote: string) => void;
}

export default function BattleLog({
  battleLog,
  targetingSlot,
  allReady,
  isReady,
  readyCount,
  aliveFighterCount,
  onSubmitMoves,
  onSurrenderClick,
  onCancelTarget,
  chatMessages,
  onSendChat,
  onSendEmote,
}: BattleLogProps) {
  return (
    <div className="battle-center">
      {/* Targeting indicator */}
      {targetingSlot !== null && (
        <div className="target-selection">
          <h3>Select Target</h3>
          <p>Choose an opponent Pokemon to target</p>
          <button className="cancel-target" onClick={onCancelTarget}>
            Cancel
          </button>
        </div>
      )}

      {/* Battle Log */}
      <div className="battle-log">
        {battleLog.length === 0 && (
          <div className="log-entry info">Battle Start! Select your moves.</div>
        )}
        {battleLog.map((entry, idx) => (
          <div key={idx} className={`log-entry ${entry.type}`}>
            {entry.message}
          </div>
        ))}
      </div>

      {/* Emote Bar */}
      {onSendEmote && (
        <div className="emote-bar">
          {EMOTES.map(emote => (
            <button key={emote} className="emote-btn" onClick={() => onSendEmote(emote)}>
              {emote}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className={`ready-btn ${isReady ? 'waiting' : ''}`}
          disabled={!allReady || isReady}
          onClick={onSubmitMoves}
        >
          {isReady ? 'Waiting for Opponent...' : allReady ? 'Submit Moves' : `Select Moves (${readyCount}/${aliveFighterCount})`}
        </button>
        <button className="surrender-btn" onClick={onSurrenderClick}>
          Surrender
        </button>
      </div>

      {/* Chat */}
      <BattleChat messages={chatMessages} onSend={onSendChat} />
    </div>
  );
}
