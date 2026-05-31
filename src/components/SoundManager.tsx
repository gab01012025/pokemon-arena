'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface SoundContextType {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  bgmVolume: number;
  sfxVolume: number;
  toggleBgm: () => void;
  toggleSfx: () => void;
  setBgmVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  playBgm: (track: BgmTrack) => void;
  stopBgm: () => void;
  playSfx: (effect: SfxType) => void;
}

export type BgmTrack = 'lobby' | 'battle' | 'victory' | 'menu';
export type SfxType =
  | 'click'
  | 'hover'
  | 'attack'
  | 'damage'
  | 'heal'
  | 'faint'
  | 'levelup'
  | 'select'
  | 'error'
  | 'turn'
  | 'victory'
  | 'defeat'
  | 'queue';

// Synthesized sounds using Web Audio API (no external files needed)
const SoundContext = createContext<SoundContextType | null>(null);

export function useSounds() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      bgmEnabled: false,
      sfxEnabled: true,
      bgmVolume: 0.3,
      sfxVolume: 0.5,
      toggleBgm: () => {},
      toggleSfx: () => {},
      setBgmVolume: () => {},
      setSfxVolume: () => {},
      playBgm: () => {},
      stopBgm: () => {},
      playSfx: () => {},
    };
  }
  return ctx;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [bgmVolume, setBgmVolumeState] = useState(0.3);
  const [sfxVolume, setSfxVolumeState] = useState(0.5);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmNodeRef = useRef<OscillatorNode | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Load preferences from localStorage
    const stored = localStorage.getItem('pokearena-sound');
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        setBgmEnabled(prefs.bgm ?? false);
        setSfxEnabled(prefs.sfx ?? true);
        setBgmVolumeState(prefs.bgmVol ?? 0.3);
        setSfxVolumeState(prefs.sfxVol ?? 0.5);
      } catch { /* ignore */ }
    }
  }, []);

  const savePrefs = useCallback((bgm: boolean, sfx: boolean, bgmVol: number, sfxVol: number) => {
    localStorage.setItem('pokearena-sound', JSON.stringify({ bgm, sfx, bgmVol, sfxVol }));
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSfx = useCallback((effect: SfxType) => {
    if (!sfxEnabled) return;

    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = sfxVolume * 0.3;

      const now = ctx.currentTime;

      switch (effect) {
        case 'click':
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        case 'hover':
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.value = sfxVolume * 0.1;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        case 'attack':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'damage':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.setValueAtTime(100, now + 0.05);
          osc.frequency.setValueAtTime(60, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        case 'heal':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        case 'faint':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        case 'levelup':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, now); // C5
          osc.frequency.setValueAtTime(659, now + 0.1); // E5
          osc.frequency.setValueAtTime(784, now + 0.2); // G5
          osc.frequency.setValueAtTime(1047, now + 0.3); // C6
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        case 'select':
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'error':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.setValueAtTime(150, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'turn':
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(550, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        case 'victory':
          osc.type = 'sine';
          gain.gain.value = sfxVolume * 0.4;
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.15);
          osc.frequency.setValueAtTime(784, now + 0.3);
          osc.frequency.setValueAtTime(1047, now + 0.45);
          gain.gain.setValueAtTime(sfxVolume * 0.4, now + 0.45);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        case 'defeat':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
          osc.start(now);
          osc.stop(now + 0.7);
          break;
        case 'queue':
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1100, now + 0.1);
          osc.frequency.setValueAtTime(880, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
      }
    } catch {
      // Web Audio not supported
    }
  }, [sfxEnabled, sfxVolume, getAudioContext]);

  const playBgm = useCallback((track: BgmTrack) => {
    if (!bgmEnabled) return;

    try {
      const ctx = getAudioContext();

      // Stop existing BGM
      if (bgmNodeRef.current) {
        bgmNodeRef.current.stop();
        bgmNodeRef.current = null;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.value = bgmVolume * 0.08; // BGM is very quiet

      // Simple ambient tones per track
      switch (track) {
        case 'lobby':
          osc.type = 'sine';
          osc.frequency.value = 220;
          break;
        case 'battle':
          osc.type = 'triangle';
          osc.frequency.value = 165;
          break;
        case 'victory':
          osc.type = 'sine';
          osc.frequency.value = 330;
          break;
        case 'menu':
          osc.type = 'sine';
          osc.frequency.value = 196;
          break;
      }

      osc.start();
      bgmNodeRef.current = osc;
      bgmGainRef.current = gain;
    } catch {
      // Web Audio not supported
    }
  }, [bgmEnabled, bgmVolume, getAudioContext]);

  const stopBgm = useCallback(() => {
    if (bgmNodeRef.current) {
      try { bgmNodeRef.current.stop(); } catch { /* ignore */ }
      bgmNodeRef.current = null;
    }
  }, []);

  const toggleBgm = useCallback(() => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    if (!next) stopBgm();
    savePrefs(next, sfxEnabled, bgmVolume, sfxVolume);
  }, [bgmEnabled, sfxEnabled, bgmVolume, sfxVolume, savePrefs, stopBgm]);

  const toggleSfx = useCallback(() => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    savePrefs(bgmEnabled, next, bgmVolume, sfxVolume);
  }, [bgmEnabled, sfxEnabled, bgmVolume, sfxVolume, savePrefs]);

  const setBgmVolume = useCallback((v: number) => {
    setBgmVolumeState(v);
    if (bgmGainRef.current) bgmGainRef.current.gain.value = v * 0.08;
    savePrefs(bgmEnabled, sfxEnabled, v, sfxVolume);
  }, [bgmEnabled, sfxEnabled, sfxVolume, savePrefs]);

  const setSfxVolume = useCallback((v: number) => {
    setSfxVolumeState(v);
    savePrefs(bgmEnabled, sfxEnabled, bgmVolume, v);
  }, [bgmEnabled, sfxEnabled, bgmVolume, savePrefs]);

  return (
    <SoundContext.Provider value={{
      bgmEnabled, sfxEnabled, bgmVolume, sfxVolume,
      toggleBgm, toggleSfx, setBgmVolume, setSfxVolume,
      playBgm, stopBgm, playSfx,
    }}>
      {children}
    </SoundContext.Provider>
  );
}

// Sound Controls UI Component
export function SoundControls() {
  const { bgmEnabled, sfxEnabled, bgmVolume, sfxVolume, toggleBgm, toggleSfx, setBgmVolume, setSfxVolume } = useSounds();
  const [open, setOpen] = useState(false);

  return (
    <div className="sound-controls">
      <button
        className="sound-toggle-btn"
        onClick={() => setOpen(!open)}
        title="Sound Settings"
      >
        {sfxEnabled || bgmEnabled ? '♫' : '♪'}
      </button>

      {open && (
        <div className="sound-panel">
          <div className="sound-panel-row">
            <label>Music</label>
            <button
              className={`sound-switch ${bgmEnabled ? 'sound-switch-on' : ''}`}
              onClick={toggleBgm}
            >
              {bgmEnabled ? 'ON' : 'OFF'}
            </button>
            {bgmEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={bgmVolume}
                onChange={e => setBgmVolume(parseFloat(e.target.value))}
                className="sound-slider"
              />
            )}
          </div>
          <div className="sound-panel-row">
            <label>SFX</label>
            <button
              className={`sound-switch ${sfxEnabled ? 'sound-switch-on' : ''}`}
              onClick={toggleSfx}
            >
              {sfxEnabled ? 'ON' : 'OFF'}
            </button>
            {sfxEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sfxVolume}
                onChange={e => setSfxVolume(parseFloat(e.target.value))}
                className="sound-slider"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
