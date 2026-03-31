/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { prisma } from '@/lib/prisma';
import { formatRank, getRankIcon, getRankColor } from '@/lib/ranking';
import { getAchievementDef } from '@/lib/achievements';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

// ==================== OG META TAGS ====================
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const trainer = await prisma.trainer.findFirst({
    where: { username: decodeURIComponent(username) },
    select: { username: true, wins: true, losses: true, ladderPoints: true, level: true },
  });

  if (!trainer) {
    return { title: 'Trainer Not Found — Pokémon Arena' };
  }

  const rank = formatRank(trainer.ladderPoints);
  const winRate = trainer.wins + trainer.losses > 0
    ? Math.round((trainer.wins / (trainer.wins + trainer.losses)) * 100)
    : 0;
  const desc = `${getRankIcon(trainer.ladderPoints)} ${rank} | Lv.${trainer.level} | ${trainer.wins}W/${trainer.losses}L (${winRate}%) | Challenge ${trainer.username} on Pokémon Arena!`;

  return {
    title: `${trainer.username} — Pokémon Arena Profile`,
    description: desc,
    openGraph: {
      title: `${trainer.username} — ${rank}`,
      description: desc,
      type: 'profile',
      siteName: 'Pokémon Arena',
    },
    twitter: {
      card: 'summary',
      title: `${trainer.username} — ${rank}`,
      description: desc,
    },
  };
}

async function getProfile(username: string) {
  const trainer = await prisma.trainer.findFirst({
    where: { 
      username: username
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      createdAt: true,
      level: true,
      experience: true,
      wins: true,
      losses: true,
      streak: true,
      maxStreak: true,
      ladderPoints: true,
      referralCode: true,
      clanMember: {
        select: {
          role: true,
          clan: {
            select: { id: true, name: true, tag: true }
          }
        }
      },
      achievements: {
        select: { code: true, unlockedAt: true },
        orderBy: { unlockedAt: 'desc' },
      },
      unlockedPokemon: {
        select: {
          pokemon: {
            select: { id: true, name: true, types: true }
          }
        },
        orderBy: { unlockedAt: 'desc' },
        take: 6
      }
    }
  });

  if (!trainer) return null;

  // Get recent battles
  const recentBattles = await prisma.battle.findMany({
    where: {
      OR: [
        { player1Id: trainer.id },
        { player2Id: trainer.id }
      ],
      status: 'finished'
    },
    select: {
      id: true,
      winnerId: true,
      finishedAt: true,
      player1: { select: { username: true } },
      player2: { select: { username: true } },
      player1Id: true,
    },
    orderBy: { finishedAt: 'desc' },
    take: 5
  });

  // Calculate rank
  const rank = await prisma.trainer.count({
    where: { ladderPoints: { gt: trainer.ladderPoints } }
  }) + 1;

  return {
    ...trainer,
    rank,
    winRate: trainer.wins + trainer.losses > 0 
      ? Math.round((trainer.wins / (trainer.wins + trainer.losses)) * 100) 
      : 0,
    recentBattles: recentBattles.map(b => ({
      id: b.id,
      result: b.winnerId === trainer.id ? 'win' as const : 'loss' as const,
      opponent: b.player1Id === trainer.id ? b.player2.username : b.player1.username,
      date: b.finishedAt,
    }))
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
}

function timeAgo(date: Date | null) {
  if (!date) return 'Never';
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function getLevelTitle(level: number) {
  if (level >= 50) return 'Champion';
  if (level >= 40) return 'Elite';
  if (level >= 30) return 'Veteran';
  if (level >= 20) return 'Expert';
  if (level >= 10) return 'Trainer';
  return 'Rookie';
}

function getAvatarUrl(avatar: string): string {
  if (!avatar || avatar === 'default') {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'; // Pikachu default
  }
  // Pokemon sprite avatar
  if (avatar.startsWith('pokemon-')) {
    const pokemonId = avatar.replace('pokemon-', '');
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  }
  // External URL (imgur, etc)
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // Fallback to Pikachu
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(decodeURIComponent(username));

  if (!profile) {
    notFound();
  }

  const levelTitle = getLevelTitle(profile.level);
  const competitiveRank = formatRank(profile.ladderPoints);
  const rankIcon = getRankIcon(profile.ladderPoints);
  const rankColor = getRankColor(profile.ladderPoints);

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">Profile: {profile.username}</h1>

          {/* Profile Header */}
          <div className="content-box profile-header-box">
            <div className="profile-header">
              <div className="profile-avatar">
                <img 
                  src={getAvatarUrl(profile.avatar)} 
                  alt={profile.username} 
                />
                <span className={`level-badge level-${levelTitle?.toLowerCase() || 'newbie'}`}>
                  {levelTitle}
                </span>
              </div>
              <div className="profile-info">
                <h2 className="profile-username">{profile.username}</h2>
                <div className="profile-meta">
                  <span className="profile-rank">Rank #{profile.rank}</span>
                  {profile.clanMember && (
                    <span className="profile-clan">
                      Clan: <Link href={`/clan/${profile.clanMember.clan.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}>
                        [{profile.clanMember.clan.tag}] {profile.clanMember.clan.name}
                      </Link>
                    </span>
                  )}
                </div>
                <div className="profile-dates">
                  <span>Joined: {formatDate(profile.createdAt)}</span>
                  <span>Level: {profile.level}</span>
                  <span style={{ color: rankColor, fontWeight: 600 }}>{rankIcon} {competitiveRank}</span>
                </div>
              </div>
              <div className="profile-actions">
                <Link 
                  href={`/battle/challenge/${encodeURIComponent(profile.username)}`}
                  className="btn-primary"
                >
                  Challenge
                </Link>
                <Link href="/change-avatar" className="btn-secondary">Change Avatar</Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Statistics</h2>
            </div>
            <div className="content-box-body">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value stat-wins">{profile.wins}</span>
                  <span className="stat-label">Wins</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value stat-losses">{profile.losses}</span>
                  <span className="stat-label">Losses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{profile.winRate}%</span>
                  <span className="stat-label">Win Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value stat-streak">
                    {profile.streak > 0 ? `🔥 ${profile.streak}` : profile.streak}
                  </span>
                  <span className="stat-label">Current Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{profile.maxStreak}</span>
                  <span className="stat-label">Max Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{profile.ladderPoints}</span>
                  <span className="stat-label">Ladder Points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {profile.achievements.length > 0 && (
            <div className="content-box">
              <div className="content-box-header">
                <h2>🏅 Achievements ({profile.achievements.length})</h2>
              </div>
              <div className="content-box-body">
                <div className="achievement-badges">
                  {profile.achievements.map((a) => {
                    const def = getAchievementDef(a.code);
                    if (!def) return null;
                    return (
                      <div key={a.code} className="achievement-badge" title={def.description}>
                        <span className="achievement-badge-icon">{def.icon}</span>
                        <span className="achievement-badge-name">{def.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Unlocked Pokemon */}
          {profile.unlockedPokemon.length > 0 && (
            <div className="content-box">
              <div className="content-box-header">
                <h2>Recent Pokemon ({profile.unlockedPokemon.length})</h2>
              </div>
              <div className="content-box-body">
                <div className="favorite-chars">
                  {profile.unlockedPokemon.map((up) => (
                    <div key={up.pokemon.id} className="favorite-char">
                      <div className="char-placeholder">
                        <span>{up.pokemon.name.charAt(0)}</span>
                      </div>
                      <span className="char-name">{up.pokemon.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Matches */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Recent Matches</h2>
            </div>
            <div className="content-box-body">
              {profile.recentBattles.length === 0 ? (
                <p className="no-data">No battles yet</p>
              ) : (
                <div className="match-history">
                  {profile.recentBattles.map((match) => (
                    <div key={match.id} className={`match-item match-${match.result}`}>
                      <span className={`match-result result-${match.result}`}>
                        {match.result.toUpperCase()}
                      </span>
                      <span className="match-opponent">
                        vs <Link href={`/profile/${match.opponent}`}>{match.opponent}</Link>
                      </span>
                      <span className="match-date">{timeAgo(match.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
