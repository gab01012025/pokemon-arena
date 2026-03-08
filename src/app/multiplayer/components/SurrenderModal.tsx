'use client';

interface SurrenderModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SurrenderModal({ onConfirm, onCancel }: SurrenderModalProps) {
  return (
    <div className="surrender-modal-overlay" onClick={onCancel}>
      <div className="surrender-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Surrender?</h2>
        <p>Are you sure you want to surrender this battle?</p>
        <p className="surrender-warning">This will count as a loss.</p>
        <div className="surrender-buttons">
          <button className="surrender-confirm" onClick={onConfirm}>
            Yes, Surrender
          </button>
          <button className="surrender-cancel" onClick={onCancel}>
            Continue Battle
          </button>
        </div>
      </div>
    </div>
  );
}
