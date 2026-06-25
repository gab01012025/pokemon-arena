'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

interface PokemonImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

export function PokemonImage({ src, alt, fallback = '/pokemon-anime/25.png', className = '' }: PokemonImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallback)}
    />
  );
}
