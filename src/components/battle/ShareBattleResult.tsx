'use client';

import { useState, useRef, useCallback } from 'react';

interface ShareBattleResultProps {
  username: string;
  won: boolean;
  turns: number;
  lpGained: number;
  currentLP: number;
  rankLabel: string;
  rankIcon: string;
  rankColor: string;
  newStreak: number;
  /** Called to close the share panel */
  onClose?: () => void;
}

const BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'https://pokemon-arena.vercel.app';

export default function ShareBattleResult({
  username,
  won,
  turns,
  lpGained,
  currentLP,
  rankLabel,
  rankIcon,
  rankColor,
  newStreak,
  onClose,
}: ShareBattleResultProps) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const profileUrl = `${BASE_URL}/profile/${encodeURIComponent(username)}`;
  const challengeUrl = `${BASE_URL}/battle/challenge/${encodeURIComponent(username)}`;

  const shareText = won
    ? `🏆 I won on Pokémon Arena in ${turns} turns! +${lpGained} LP (${currentLP} LP - ${rankLabel})${newStreak > 1 ? ` 🔥 ${newStreak} streak!` : ''}. Think you can beat me? ⚔️`
    : `⚔️ Intense battle on Pokémon Arena! ${turns} turns of action. Can you beat me? 🎮`;

  // Generate share card as canvas image
  const generateCard = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    setGenerating(true);
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = 600;
      canvas.height = 315;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 600, 315);
      if (won) {
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(0.5, '#16213e');
        grad.addColorStop(1, '#0f3460');
      } else {
        grad.addColorStop(0, '#1a1a1a');
        grad.addColorStop(0.5, '#2d1a1a');
        grad.addColorStop(1, '#1a1a2e');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 315);

      // Border glow
      ctx.strokeStyle = won ? '#FFD700' : '#666';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, 596, 311);

      // Title
      ctx.fillStyle = won ? '#FFD700' : '#ff4444';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(won ? '🏆 VICTORY!' : '⚔️ BATTLE RESULT', 300, 55);

      // Username
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText(username, 300, 95);

      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 115);
      ctx.lineTo(550, 115);
      ctx.stroke();

      // Stats grid
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';

      // Row 1
      ctx.fillText('TURNS', 150, 145);
      ctx.fillText('LP CHANGE', 300, 145);
      ctx.fillText('TOTAL LP', 450, 145);

      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(String(turns), 150, 180);

      ctx.fillStyle = lpGained >= 0 ? '#4CAF50' : '#ff4444';
      ctx.fillText(`${lpGained >= 0 ? '+' : ''}${lpGained}`, 300, 180);

      ctx.fillStyle = '#FFD700';
      ctx.fillText(String(currentLP), 450, 180);

      // Row 2 — Rank + Streak
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('RANK', 200, 215);
      ctx.fillText('STREAK', 400, 215);

      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillStyle = rankColor || '#FFD700';
      ctx.fillText(`${rankIcon} ${rankLabel}`, 200, 245);

      ctx.fillStyle = newStreak > 1 ? '#ff6b35' : '#fff';
      ctx.fillText(newStreak > 1 ? `🔥 ${newStreak}` : '-', 400, 245);

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Pokémon Arena — pokemon-arena.vercel.app', 300, 290);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } finally {
      setGenerating(false);
    }
  }, [won, username, turns, lpGained, currentLP, rankLabel, rankIcon, rankColor, newStreak]);

  // Copy link
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${challengeUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = `${shareText}\n\n${challengeUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText, challengeUrl]);

  // Copy image
  const handleCopyImage = useCallback(async () => {
    const blob = await generateCard();
    if (!blob) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Download as fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pokemon-arena-${won ? 'victory' : 'battle'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [generateCard, won]);

  // Web Share API
  const handleNativeShare = useCallback(async () => {
    const blob = await generateCard();
    const shareData: ShareData = {
      title: won ? '🏆 Victory on Pokémon Arena!' : '⚔️ Pokémon Arena Battle',
      text: shareText,
      url: challengeUrl,
    };

    // Try sharing with image if supported
    if (blob && navigator.canShare) {
      const file = new File([blob], 'pokemon-arena-battle.png', { type: 'image/png' });
      const shareWithImage = { ...shareData, files: [file] };
      if (navigator.canShare(shareWithImage)) {
        try {
          await navigator.share(shareWithImage);
          return;
        } catch {
          // User cancelled or error — try without image
        }
      }
    }

    // Share without image
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  }, [generateCard, won, shareText, challengeUrl, handleCopyLink]);

  // WhatsApp share
  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${shareText}\n\n${challengeUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [shareText, challengeUrl]);

  // Twitter/X share
  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(challengeUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }, [shareText, challengeUrl]);

  // Discord (copy formatted text)
  const handleDiscord = useCallback(async () => {
    const discordText = won
      ? `## 🏆 Victory on Pokémon Arena!\n**${username}** won in **${turns}** turns!\n> +${lpGained} LP | ${currentLP} LP Total | ${rankIcon} ${rankLabel}${newStreak > 1 ? ` | 🔥 ${newStreak} Streak` : ''}\n\nChallenge me: ${challengeUrl}`
      : `## ⚔️ Pokémon Arena Battle\n**${username}** just had an intense ${turns}-turn battle!\n\nChallenge me: ${challengeUrl}`;

    try {
      await navigator.clipboard.writeText(discordText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [won, username, turns, lpGained, currentLP, rankIcon, rankLabel, newStreak, challengeUrl]);

  return (
    <div className="share-panel">
      <div className="share-panel-header">
        <h3>📤 Share Result</h3>
        {onClose && (
          <button className="share-close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Hidden canvas for card generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Preview text */}
      <div className="share-preview">
        <p className="share-preview-text">{shareText}</p>
      </div>

      {/* Share buttons */}
      <div className="share-buttons-grid">
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button className="share-btn share-btn-native" onClick={handleNativeShare}>
            📤 Share
          </button>
        )}
        <button className="share-btn share-btn-whatsapp" onClick={handleWhatsApp}>
          💬 WhatsApp
        </button>
        <button className="share-btn share-btn-twitter" onClick={handleTwitter}>
          🐦 Twitter/X
        </button>
        <button className="share-btn share-btn-discord" onClick={handleDiscord}>
          🎮 Discord
        </button>
        <button className="share-btn share-btn-image" onClick={handleCopyImage} disabled={generating}>
          {generating ? '⏳' : '🖼️'} Copy Card
        </button>
        <button className="share-btn share-btn-link" onClick={handleCopyLink}>
          {copied ? '✅ Copied!' : '🔗 Copy Link'}
        </button>
      </div>
    </div>
  );
}
