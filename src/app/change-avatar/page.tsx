'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

// Avatares pré-definidos baseados em Pokémon (removidos trainers para evitar confusão)
const PREDEFINED_AVATARS = [
  // Pokemon populares (usando sprites da PokeAPI)
  { id: 'pokemon-25', name: 'Pikachu', pokemonId: 25 },
  { id: 'pokemon-6', name: 'Charizard', pokemonId: 6 },
  { id: 'pokemon-150', name: 'Mewtwo', pokemonId: 150 },
  { id: 'pokemon-151', name: 'Mew', pokemonId: 151 },
  { id: 'pokemon-149', name: 'Dragonite', pokemonId: 149 },
  { id: 'pokemon-94', name: 'Gengar', pokemonId: 94 },
  { id: 'pokemon-131', name: 'Lapras', pokemonId: 131 },
  { id: 'pokemon-143', name: 'Snorlax', pokemonId: 143 },
  { id: 'pokemon-3', name: 'Venusaur', pokemonId: 3 },
  { id: 'pokemon-9', name: 'Blastoise', pokemonId: 9 },
  { id: 'pokemon-130', name: 'Gyarados', pokemonId: 130 },
  { id: 'pokemon-59', name: 'Arcanine', pokemonId: 59 },
  { id: 'pokemon-65', name: 'Alakazam', pokemonId: 65 },
  { id: 'pokemon-68', name: 'Machamp', pokemonId: 68 },
  { id: 'pokemon-76', name: 'Golem', pokemonId: 76 },
  { id: 'pokemon-144', name: 'Articuno', pokemonId: 144 },
  { id: 'pokemon-145', name: 'Zapdos', pokemonId: 145 },
  { id: 'pokemon-146', name: 'Moltres', pokemonId: 146 },
  { id: 'pokemon-1', name: 'Bulbasaur', pokemonId: 1 },
  { id: 'pokemon-4', name: 'Charmander', pokemonId: 4 },
  { id: 'pokemon-7', name: 'Squirtle', pokemonId: 7 },
  { id: 'pokemon-133', name: 'Eevee', pokemonId: 133 },
  { id: 'pokemon-134', name: 'Vaporeon', pokemonId: 134 },
  { id: 'pokemon-135', name: 'Jolteon', pokemonId: 135 },
  { id: 'pokemon-136', name: 'Flareon', pokemonId: 136 },
  // Mais Pokémon
  { id: 'pokemon-26', name: 'Raichu', pokemonId: 26 },
  { id: 'pokemon-38', name: 'Ninetales', pokemonId: 38 },
  { id: 'pokemon-39', name: 'Jigglypuff', pokemonId: 39 },
  { id: 'pokemon-52', name: 'Meowth', pokemonId: 52 },
  { id: 'pokemon-54', name: 'Psyduck', pokemonId: 54 },
  { id: 'pokemon-79', name: 'Slowpoke', pokemonId: 79 },
  { id: 'pokemon-92', name: 'Gastly', pokemonId: 92 },
  { id: 'pokemon-93', name: 'Haunter', pokemonId: 93 },
  { id: 'pokemon-95', name: 'Onix', pokemonId: 95 },
  { id: 'pokemon-103', name: 'Exeggutor', pokemonId: 103 },
  { id: 'pokemon-115', name: 'Kangaskhan', pokemonId: 115 },
  { id: 'pokemon-121', name: 'Starmie', pokemonId: 121 },
  { id: 'pokemon-123', name: 'Scyther', pokemonId: 123 },
  { id: 'pokemon-127', name: 'Pinsir', pokemonId: 127 },
  { id: 'pokemon-137', name: 'Porygon', pokemonId: 137 },
  { id: 'pokemon-139', name: 'Omastar', pokemonId: 139 },
  { id: 'pokemon-141', name: 'Kabutops', pokemonId: 141 },
  { id: 'pokemon-142', name: 'Aerodactyl', pokemonId: 142 },
  { id: 'pokemon-147', name: 'Dratini', pokemonId: 147 },
  { id: 'pokemon-148', name: 'Dragonair', pokemonId: 148 },
];

function getAvatarUrl(avatar: { id: string; pokemonId?: number }): string {
  if (avatar.pokemonId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${avatar.pokemonId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png`; // fallback to Pikachu
}

export default function ChangeAvatarPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; avatar: string } | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setSelectedAvatar(data.user.avatar);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setCustomUrl('');
    setError('');
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url);
    if (url) {
      setSelectedAvatar('custom');
    }
  };

  const handleSubmit = async () => {
    if (!selectedAvatar && !customUrl) {
      setError('Please select an avatar or enter a custom URL');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const avatarValue = customUrl || selectedAvatar;
      
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update avatar');
      }

      setSuccess('Avatar updated successfully!');
      setUser(prev => prev ? { ...prev, avatar: avatarValue } : null);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/profile/${user?.username}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvatars = PREDEFINED_AVATARS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentAvatarUrl = () => {
    if (customUrl) return customUrl;
    if (selectedAvatar === 'default') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
    if (selectedAvatar.startsWith('pokemon-')) {
      const pokemonId = selectedAvatar.replace('pokemon-', '');
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    }
    if (selectedAvatar.startsWith('http')) return selectedAvatar;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/settings" className="nav-btn-top">Settings</Link>
              <Link href={`/profile/${user.username}`} className="nav-btn-top">My Profile</Link>
            </div>
          </div>
          <div className="header-banner">
            <h1>⚡ POKEMON ARENA ⚡</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-yellow-400">Pokemon Arena</Link>
            {' > '}
            <Link href="/settings" className="hover:text-yellow-400">Settings</Link>
            {' > '}
            <span className="text-yellow-400">Change Avatar</span>
          </div>

          <h1 className="page-title" style={{ color: '#dc2626' }}>Change Avatar</h1>

          {/* Instructions */}
          <div className="content-box mb-6">
            <div className="content-box-body text-center p-4" style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
              <p className="text-gray-800">
                Use imgur to upload your custom avatar: <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://imgur.com/upload</a>
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Copy the image address you uploaded (<a href="#" className="text-blue-600 hover:underline">How to copy image address</a>).
              </p>
            </div>
          </div>

          {/* Current Avatar Preview */}
          <div className="content-box mb-6">
            <div className="content-box-body p-6 text-center">
              <div className="inline-block p-4 bg-gray-800 rounded-lg">
                <Image
                  src={getCurrentAvatarUrl()}
                  alt="Current Avatar"
                  width={96}
                  height={96}
                  className="rounded-lg mx-auto"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/ash-ketchum.webp';
                  }}
                />
              </div>
              
              {/* Custom URL Input */}
              <div className="mt-6 max-w-lg mx-auto">
                <div className="flex gap-2">
                  <label className="text-gray-400 self-center">Avatar:</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => handleCustomUrlChange(e.target.value)}
                    placeholder="https://i.imgur.com/example.png"
                    className="flex-1 px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Change Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded border border-gray-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change'}
              </button>

              {/* Messages */}
              {error && (
                <div className="mt-4 p-3 bg-red-600/20 border border-red-500 rounded text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 p-3 bg-green-600/20 border border-green-500 rounded text-green-400">
                  {success}
                </div>
              )}
            </div>
          </div>

          {/* Pre-Defined Avatars */}
          <div className="content-box">
            <div className="content-box-header flex items-center gap-2" style={{ backgroundColor: '#fef3c7' }}>
              <span className="text-yellow-600">★</span>
              <h2 className="text-gray-800 font-bold">Pokémon Avatars</h2>
            </div>
            <div className="content-box-body p-6">
              {/* Search */}
              <div className="flex justify-center mb-6">
                <input
                  type="text"
                  placeholder="Search Pokémon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none w-64"
                />
              </div>

              <p className="text-center text-gray-400 mb-6">Click on a Pokémon to choose it as your avatar.</p>

              {/* Avatar Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 justify-items-center">
                {filteredAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.id)}
                    className={`relative cursor-pointer p-2 rounded-lg transition-all ${
                      selectedAvatar === avatar.id
                        ? 'ring-2 ring-yellow-500 bg-yellow-500/20'
                        : 'hover:bg-gray-700'
                    }`}
                    title={avatar.name}
                  >
                    <Image
                      src={getAvatarUrl(avatar)}
                      alt={avatar.name}
                      width={64}
                      height={64}
                      className="rounded"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/ash-ketchum.webp';
                      }}
                    />
                    {selectedAvatar === avatar.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination (visual only for now) */}
              <div className="flex justify-center mt-6">
                <select className="px-3 py-1 rounded border border-gray-600 bg-gray-700 text-white">
                  <option>Page 1</option>
                </select>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
