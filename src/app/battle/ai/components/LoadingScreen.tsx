'use client';

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isSearching?: boolean;
  onSearchComplete?: () => void;
}

export default function LoadingScreen({ isSearching = false, onSearchComplete }: LoadingScreenProps) {
  const [searchText, setSearchText] = useState('Searching for opponent');
  const [dots, setDots] = useState('');
  const [pokeballOpen, setPokeballOpen] = useState(false);
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
      setPokeballOpen(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isSearching]);

  useEffect(() => {
    if (!pokeballOpen) return;
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
  }, [pokeballOpen, onSearchComplete]);

  if (isSearching) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className={`pokeball-search ${pokeballOpen ? 'open' : ''}`}>
            <div className="pokeball-top" />
            <div className="pokeball-center">
              <div className="pokeball-button" />
            </div>
            <div className="pokeball-bottom" />
          </div>
          {pokeballOpen && (
            <div className="search-flash" />
          )}
          <p className="loading-text" style={{ fontSize: 14, marginTop: 20 }}>
            {pokeballOpen ? `Entering battle in ${countdown}...` : `${searchText}${dots}`}
          </p>
          {!pokeballOpen && (
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
        <div className="pokeball-loader" />
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
}
