'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const POKEBALL_IMG = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

interface LoadingScreenProps {
  isSearching?: boolean;
  onSearchComplete?: () => void;
}

export default function LoadingScreen({ isSearching = false, onSearchComplete }: LoadingScreenProps) {
  const [searchText, setSearchText] = useState('Searching for opponent');
  const [dots, setDots] = useState('');
  const [found, setFound] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isSearching) return;
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(dotInterval);
  }, [isSearching]);

  useEffect(() => {
    if (!isSearching) return;
    const timer = setTimeout(() => {
      setSearchText('Opponent found!');
      setFound(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isSearching]);

  useEffect(() => {
    if (!found) return;
    const cdInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(cdInterval);
          onSearchComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 800);
    return () => clearInterval(cdInterval);
  }, [found, onSearchComplete]);

  if (isSearching) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className={`pokeball-img-container ${found ? 'found' : ''}`}>
            <Image src={POKEBALL_IMG} alt="Pokeball" width={80} height={80} unoptimized className="pokeball-img" />
          </div>
          <p className="loading-text" style={{ fontSize: 14, marginTop: 20 }}>
            {found ? `Entering battle in ${countdown}...` : `${searchText}${dots}`}
          </p>
          {!found && (
            <div className="search-waves">
              <div className="search-wave" />
              <div className="search-wave" style={{ animationDelay: '0.3s' }} />
              <div className="search-wave" style={{ animationDelay: '0.6s' }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="pokeball-img-container">
          <Image src={POKEBALL_IMG} alt="Pokeball" width={60} height={60} unoptimized className="pokeball-img spinning" />
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
}
