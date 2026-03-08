'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    if (localStorage.getItem('pwa-install-dismissed') === '1') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing banner slightly for better UX
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect when installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', '1');
  }, []);

  if (isInstalled || !showBanner) return null;

  return (
    <div className="install-banner" role="alert">
      <div className="install-banner-content">
        <div className="install-banner-icon">📱</div>
        <div className="install-banner-text">
          <strong>Instale o Pokémon Arena!</strong>
          <span>Jogue como um app nativo no seu celular</span>
        </div>
        <div className="install-banner-actions">
          <button className="install-btn-primary" onClick={handleInstall}>
            Install
          </button>
          <button className="install-btn-dismiss" onClick={handleDismiss} aria-label="Dismiss">
            ✕
          </button>
        </div>
      </div>

      <style jsx>{`
        .install-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          padding: 12px 16px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-top: 2px solid #FFD700;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.4s ease-out;
        }
        .install-banner-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .install-banner-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }
        .install-banner-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .install-banner-text strong {
          color: #FFD700;
          font-size: 0.95rem;
        }
        .install-banner-text span {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
        }
        .install-banner-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .install-btn-primary {
          padding: 8px 20px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #1a1a2e;
          border: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .install-btn-primary:hover {
          transform: scale(1.05);
        }
        .install-btn-dismiss {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px 8px;
        }
        .install-btn-dismiss:hover {
          color: #fff;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
