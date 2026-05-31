'use client';

import { useState, useCallback } from 'react';
import type { ActionIntent, ClientFighter } from '@/lib/game-socket';

interface SkillQueueProps {
  intents: Record<number, ActionIntent | null>;
  fighters: ClientFighter[];
  onReorder: (reorderedIntents: ActionIntent[]) => void;
  onRemove: (fighterIdx: number) => void;
  onSubmit: () => void;
  isReady: boolean;
}

export function SkillQueue({ intents, fighters, onReorder, onRemove, onSubmit, isReady }: SkillQueueProps) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const activeIntents = Object.entries(intents)
    .filter(([, intent]) => intent !== null)
    .map(([key, intent]) => ({ key: parseInt(key), intent: intent! }));

  const handleDragStart = useCallback((idx: number) => {
    setDraggingIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === targetIdx) return;

    const items = [...activeIntents];
    const [moved] = items.splice(draggingIdx, 1);
    items.splice(targetIdx, 0, moved);

    onReorder(items.map(item => item.intent));
    setDraggingIdx(targetIdx);
  }, [draggingIdx, activeIntents, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  const handleMoveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    const items = [...activeIntents];
    [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
    onReorder(items.map(item => item.intent));
  }, [activeIntents, onReorder]);

  const handleMoveDown = useCallback((idx: number) => {
    if (idx >= activeIntents.length - 1) return;
    const items = [...activeIntents];
    [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
    onReorder(items.map(item => item.intent));
  }, [activeIntents, onReorder]);

  if (activeIntents.length === 0) {
    return (
      <div className="skill-queue skill-queue-empty">
        <p className="skill-queue-hint">Select skills for your Pokemon to queue actions</p>
      </div>
    );
  }

  return (
    <div className="skill-queue">
      <div className="skill-queue-header">
        <h4 className="skill-queue-title">Skill Queue</h4>
        <span className="skill-queue-count">{activeIntents.length}/3 Actions</span>
      </div>

      <div className="skill-queue-list">
        {activeIntents.map((item, idx) => {
          const fighter = fighters.find(f => f.slot === item.intent.userSlot);
          const skill = fighter?.skills[item.intent.skillIndex];

          return (
            <div
              key={`${item.key}-${idx}`}
              className={`skill-queue-item ${draggingIdx === idx ? 'skill-queue-item-dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <span className="skill-queue-order">{idx + 1}</span>
              <div className="skill-queue-info">
                <span className="skill-queue-fighter">{fighter?.name || '???'}</span>
                <span className="skill-queue-skill">{skill?.name || '???'}</span>
              </div>
              <div className="skill-queue-arrows">
                <button
                  className="skill-queue-arrow"
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  title="Move up"
                >
                  &#9650;
                </button>
                <button
                  className="skill-queue-arrow"
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx >= activeIntents.length - 1}
                  title="Move down"
                >
                  &#9660;
                </button>
              </div>
              <button
                className="skill-queue-remove"
                onClick={() => onRemove(item.key)}
                title="Remove"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

      <div className="skill-queue-footer">
        <p className="skill-queue-tip">Drag to reorder execution priority</p>
        <button
          className="skill-queue-submit"
          onClick={onSubmit}
          disabled={isReady || activeIntents.length === 0}
        >
          {isReady ? 'Waiting...' : 'Lock In Actions'}
        </button>
      </div>
    </div>
  );
}
