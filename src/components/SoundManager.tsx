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
  | 'click' | 'hover' | 'attack' | 'damage' | 'heal' | 'faint'
  | 'levelup' | 'select' | 'error' | 'turn' | 'victory' | 'defeat' | 'queue';

const SoundContext = createContext<SoundContextType | null>(null);

export function useSounds() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      bgmEnabled: false, sfxEnabled: true, bgmVolume: 0.3, sfxVolume: 0.5,
      toggleBgm: () => {}, toggleSfx: () => {},
      setBgmVolume: () => {}, setSfxVolume: () => {},
      playBgm: () => {}, stopBgm: () => {}, playSfx: () => {},
    };
  }
  return ctx;
}

// ── Note Frequency Table ──
const F: Record<string, number> = {
  _: 0,
  C3: 131, D3: 147, Eb3: 156, E3: 165, F3: 175, G3: 196, Ab3: 208, A3: 220, Bb3: 233, B3: 247,
  C4: 262, D4: 294, Eb4: 311, E4: 330, F4: 349, G4: 392, Ab4: 415, A4: 440, Bb4: 466, B4: 494,
  C5: 523, D5: 587, Eb5: 622, E5: 659, F5: 698, G5: 784, Ab5: 831, A5: 880, Bb5: 932, B5: 988,
};

type NoteSeq = [string, number][]; // [noteName, beats]

interface TrackDef {
  bpm: number;
  melody: NoteSeq;
  bass: NoteSeq;
}

// ── BGM Track Definitions ──
// Pokemon Center vibes - warm, cheerful, healing (C major, 120 BPM)
const TRACK_LOBBY: TrackDef = {
  bpm: 120,
  melody: [
    ['E5', .5], ['D5', .5], ['C5', .5], ['D5', .5], ['E5', 1], ['G5', .5], ['E5', .5],
    ['D5', .5], ['E5', .5], ['F5', .5], ['E5', .5], ['D5', 1], ['_', .5], ['G4', .5],
    ['A4', .5], ['B4', .5], ['C5', .5], ['D5', .5], ['E5', 1], ['C5', 1],
    ['D5', .5], ['B4', .5], ['C5', 2], ['_', 1],
  ],
  bass: [
    ['C3', 2], ['E3', 2], ['F3', 2], ['G3', 2],
    ['C3', 2], ['E3', 2], ['G3', 2], ['C3', 2],
  ],
};

// Intense battle theme - driving, energetic (A minor, 160 BPM)
const TRACK_BATTLE: TrackDef = {
  bpm: 160,
  melody: [
    ['A4', .25], ['A4', .25], ['_', .25], ['A4', .25], ['_', .25], ['F4', .25], ['A4', .5],
    ['C5', .5], ['_', .5], ['A4', .5], ['_', .5],
    ['G4', .25], ['_', .25], ['E4', .5], ['F4', .5], ['G4', .5],
    ['Ab4', .25], ['A4', .75], ['_', .5], ['F4', .25], ['A4', .25],
    ['C5', .5], ['D5', .5], ['C5', .25], ['A4', .25], ['G4', .5],
    ['E4', .5], ['F4', .5], ['E4', .5], ['_', .5],
    ['A4', .25], ['C5', .25], ['E5', .5], ['D5', .5], ['C5', .5],
    ['A4', .5], ['Bb4', .5], ['A4', .5], ['G4', .5],
    ['F4', .5], ['G4', .5], ['A4', 1],
    ['G4', .5], ['F4', .5], ['E4', 1],
    ['A4', .5], ['_', .5], ['A4', .5], ['_', .5],
    ['E4', .75], ['_', .25], ['E4', .5], ['_', .5],
  ],
  bass: [
    ['A3', 1], ['A3', 1], ['F3', 1], ['F3', 1],
    ['E3', 1], ['E3', 1], ['F3', .5], ['G3', .5], ['A3', 1],
    ['A3', 1], ['D3', 1], ['A3', 1], ['E3', 1],
    ['F3', 1], ['G3', 1], ['A3', 1], ['E3', 1],
    ['A3', 1], ['A3', 1], ['E3', 1], ['E3', 1],
    ['D3', 1], ['E3', 1], ['A3', 1], ['_', 1],
  ],
};

// Victory fanfare - triumphant, celebratory (Bb major, 138 BPM)
const TRACK_VICTORY: TrackDef = {
  bpm: 138,
  melody: [
    ['Bb4', .25], ['Bb4', .25], ['Bb4', .25], ['Bb4', .25], ['D5', .5], ['F5', .5],
    ['Bb5', 1], ['_', .5], ['F5', .5],
    ['Eb5', .5], ['D5', .5], ['C5', .5], ['D5', .5],
    ['Eb5', .5], ['F5', .5], ['Eb5', .5], ['D5', .5],
    ['C5', .5], ['Bb4', .5], ['C5', 1],
    ['D5', .5], ['Eb5', .5], ['F5', .5], ['D5', .5],
    ['Eb5', .5], ['D5', .5], ['C5', .5], ['Bb4', .5],
    ['C5', .5], ['D5', .5], ['Eb5', 1],
    ['F5', 1], ['Eb5', .5], ['D5', .5],
    ['Bb4', 1], ['_', 1],
  ],
  bass: [
    ['Bb3', 2], ['F3', 2],
    ['Eb3', 2], ['Bb3', 2],
    ['F3', 2], ['Bb3', 2],
    ['Eb3', 2], ['F3', 2],
    ['Bb3', 2], ['_', 2],
  ],
};

// Route/adventure theme - adventurous, walking pace (C major, 128 BPM)
const TRACK_MENU: TrackDef = {
  bpm: 128,
  melody: [
    ['C5', .5], ['E5', .5], ['G5', .5], ['E5', .5],
    ['F5', .5], ['A5', .5], ['G5', 1],
    ['E5', .5], ['C5', .5], ['D5', .5], ['E5', .5],
    ['F5', .75], ['E5', .25], ['D5', 1],
    ['C5', .5], ['E5', .5], ['G5', .5], ['B5', .5],
    ['A5', .5], ['G5', .5], ['E5', 1],
    ['F5', .5], ['E5', .5], ['D5', .5], ['C5', .5],
    ['D5', .5], ['B4', .5], ['C5', 1],
    ['G4', .5], ['C5', .5], ['E5', .5], ['G5', .5],
    ['F5', .5], ['D5', .5], ['E5', 1],
    ['D5', .5], ['C5', .5], ['B4', .5], ['D5', .5],
    ['C5', 1.5], ['_', .5],
  ],
  bass: [
    ['C3', 2], ['F3', 2],
    ['C3', 2], ['G3', 2],
    ['C3', 2], ['A3', 2],
    ['F3', 2], ['G3', 2],
    ['C3', 2], ['F3', 2],
    ['G3', 2], ['C3', 2],
  ],
};

const BGM_TRACKS: Record<BgmTrack, TrackDef> = {
  lobby: TRACK_LOBBY,
  battle: TRACK_BATTLE,
  victory: TRACK_VICTORY,
  menu: TRACK_MENU,
};

// ── Chiptune BGM Player ──
class ChiptunePlayer {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private oscillators: OscillatorNode[] = [];
  private loopTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.connect(ctx.destination);
  }

  setVolume(v: number) {
    this.masterGain.gain.value = v;
  }

  play(track: BgmTrack) {
    this.stop();
    this.stopped = false;
    this.scheduleLoop(BGM_TRACKS[track]);
  }

  stop() {
    this.stopped = true;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    for (const osc of this.oscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.oscillators = [];
  }

  private scheduleLoop(track: TrackDef) {
    if (this.stopped) return;

    const beatDur = 60 / track.bpm;
    const now = this.ctx.currentTime + 0.05;

    // Schedule melody voice (square wave - classic Game Boy sound)
    let melTime = now;
    for (const [note, beats] of track.melody) {
      const dur = beats * beatDur;
      const freq = F[note];
      if (freq && freq > 0) {
        this.scheduleNote(freq, melTime, dur, 'square', 0.15);
      }
      melTime += dur;
    }
    const loopDuration = melTime - now;

    // Schedule bass voice (triangle wave - NES style)
    let bassTime = now;
    for (const [note, beats] of track.bass) {
      const dur = beats * beatDur;
      const freq = F[note];
      if (freq && freq > 0) {
        this.scheduleNote(freq, bassTime, dur, 'triangle', 0.10);
      }
      bassTime += dur;
    }

    // Schedule next loop slightly before this one ends
    const nextLoopMs = Math.max((loopDuration - 0.15) * 1000, 500);
    this.loopTimer = setTimeout(() => {
      // Clean up any finished oscillators
      this.oscillators = this.oscillators.filter(() => true);
      this.scheduleLoop(track);
    }, nextLoopMs);
  }

  private scheduleNote(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    // Chiptune envelope: full volume, then quick cut
    gain.gain.setValueAtTime(vol, start);
    gain.gain.setValueAtTime(vol, start + dur * 0.85);
    gain.gain.linearRampToValueAtTime(0.001, start + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(start);
    osc.stop(start + dur + 0.01);
    this.oscillators.push(osc);

    osc.onended = () => {
      const i = this.oscillators.indexOf(osc);
      if (i >= 0) this.oscillators.splice(i, 1);
    };
  }
}

// ── Sound Provider ──
export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [bgmVolume, setBgmVolumeState] = useState(0.3);
  const [sfxVolume, setSfxVolumeState] = useState(0.5);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmPlayerRef = useRef<ChiptunePlayer | null>(null);
  const currentTrackRef = useRef<BgmTrack | null>(null);
  const bgmEnabledRef = useRef(bgmEnabled);
  const bgmVolumeRef = useRef(bgmVolume);

  // Keep refs in sync
  bgmEnabledRef.current = bgmEnabled;
  bgmVolumeRef.current = bgmVolume;

  useEffect(() => {
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

  const getPlayer = useCallback(() => {
    const ctx = getAudioContext();
    if (!bgmPlayerRef.current) {
      bgmPlayerRef.current = new ChiptunePlayer(ctx);
    }
    return bgmPlayerRef.current;
  }, [getAudioContext]);

  const startBgmInternal = useCallback((track: BgmTrack) => {
    try {
      const player = getPlayer();
      player.setVolume(bgmVolumeRef.current);
      player.play(track);
    } catch {
      // Web Audio not supported
    }
  }, [getPlayer]);

  const stopBgmInternal = useCallback(() => {
    if (bgmPlayerRef.current) {
      bgmPlayerRef.current.stop();
    }
  }, []);

  const playBgm = useCallback((track: BgmTrack) => {
    currentTrackRef.current = track;
    if (bgmEnabledRef.current) {
      startBgmInternal(track);
    }
  }, [startBgmInternal]);

  const stopBgm = useCallback(() => {
    currentTrackRef.current = null;
    stopBgmInternal();
  }, [stopBgmInternal]);

  const toggleBgm = useCallback(() => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    bgmEnabledRef.current = next;
    if (!next) {
      stopBgmInternal();
    } else if (currentTrackRef.current) {
      startBgmInternal(currentTrackRef.current);
    }
    savePrefs(next, sfxEnabled, bgmVolume, sfxVolume);
  }, [bgmEnabled, sfxEnabled, bgmVolume, sfxVolume, savePrefs, stopBgmInternal, startBgmInternal]);

  const toggleSfx = useCallback(() => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    savePrefs(bgmEnabled, next, bgmVolume, sfxVolume);
  }, [bgmEnabled, sfxEnabled, bgmVolume, sfxVolume, savePrefs]);

  const setBgmVolume = useCallback((v: number) => {
    setBgmVolumeState(v);
    bgmVolumeRef.current = v;
    if (bgmPlayerRef.current) {
      bgmPlayerRef.current.setVolume(v);
    }
    savePrefs(bgmEnabled, sfxEnabled, v, sfxVolume);
  }, [bgmEnabled, sfxEnabled, sfxVolume, savePrefs]);

  const setSfxVolume = useCallback((v: number) => {
    setSfxVolumeState(v);
    savePrefs(bgmEnabled, sfxEnabled, bgmVolume, v);
  }, [bgmEnabled, sfxEnabled, bgmVolume, savePrefs]);

  // ── SFX (unchanged synthesized effects) ──
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
          osc.start(now); osc.stop(now + 0.08);
          break;
        case 'hover':
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.value = sfxVolume * 0.1;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          osc.start(now); osc.stop(now + 0.03);
          break;
        case 'attack':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
          break;
        case 'damage':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.setValueAtTime(100, now + 0.05);
          osc.frequency.setValueAtTime(60, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
          break;
        case 'heal':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now); osc.stop(now + 0.4);
          break;
        case 'faint':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.start(now); osc.stop(now + 0.6);
          break;
        case 'levelup':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.1);
          osc.frequency.setValueAtTime(784, now + 0.2);
          osc.frequency.setValueAtTime(1047, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now); osc.stop(now + 0.5);
          break;
        case 'select':
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now); osc.stop(now + 0.1);
          break;
        case 'error':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.setValueAtTime(150, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
          break;
        case 'turn':
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(550, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
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
          osc.start(now); osc.stop(now + 0.8);
          break;
        case 'defeat':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
          osc.start(now); osc.stop(now + 0.7);
          break;
        case 'queue':
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1100, now + 0.1);
          osc.frequency.setValueAtTime(880, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now); osc.stop(now + 0.3);
          break;
      }
    } catch {
      // Web Audio not supported
    }
  }, [sfxEnabled, sfxVolume, getAudioContext]);

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

// ── Sound Controls UI ──
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
        {sfxEnabled || bgmEnabled ? '\u266B' : '\u266A'}
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
                type="range" min="0" max="1" step="0.1"
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
                type="range" min="0" max="1" step="0.1"
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
