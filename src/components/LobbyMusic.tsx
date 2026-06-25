'use client';

import { useEffect } from 'react';
import { useSounds } from '@/components/SoundManager';

export function LobbyMusic() {
  const { playBgm } = useSounds();
  useEffect(() => { playBgm('lobby'); }, [playBgm]);
  return null;
}
