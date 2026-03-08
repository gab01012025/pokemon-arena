import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { formatRank, getRankIcon, getRankColor } from '@/lib/ranking';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const trainer = await prisma.trainer.findUnique({
    where: { username: decodeURIComponent(username) },
    select: { username: true, wins: true, losses: true, ladderPoints: true },
  });

  if (!trainer) {
    return { title: 'Challenge — Pokémon Arena' };
  }

  const rank = formatRank(trainer.ladderPoints);
  const winRate = trainer.wins + trainer.losses > 0
    ? Math.round((trainer.wins / (trainer.wins + trainer.losses)) * 100)
    : 0;

  return {
    title: `Challenge ${trainer.username}! — Pokémon Arena`,
    description: `⚔️ ${trainer.username} challenges you to a battle! ${rank} | ${trainer.wins}W / ${trainer.losses}L | ${winRate}% WR. Can you beat them?`,
    openGraph: {
      title: `⚔️ ${trainer.username} challenges you!`,
      description: `${rank} | ${trainer.wins} Wins | ${winRate}% Win Rate. Accept the challenge on Pokémon Arena!`,
      type: 'website',
      siteName: 'Pokémon Arena',
    },
    twitter: {
      card: 'summary_large_image',
      title: `⚔️ ${trainer.username} challenges you!`,
      description: `${rank} | ${trainer.wins} Wins | ${winRate}% Win Rate`,
    },
  };
}

export default async function ChallengePage({ params }: Props) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const trainer = await prisma.trainer.findUnique({
    where: { username: decodedUsername },
    select: {
      id: true,
      username: true,
      avatar: true,
      wins: true,
      losses: true,
      streak: true,
      ladderPoints: true,
      level: true,
    },
  });

  if (!trainer) notFound();

  const rank = formatRank(trainer.ladderPoints);
  const rankIcon = getRankIcon(trainer.ladderPoints);
  const rankColor = getRankColor(trainer.ladderPoints);
  const winRate = trainer.wins + trainer.losses > 0
    ? Math.round((trainer.wins / (trainer.wins + trainer.losses)) * 100)
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-main)',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: '2px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Challenge header */}
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚔️</div>
        <h1 style={{
          fontSize: '28px',
          color: '#FFD700',
          margin: '0 0 4px',
          fontWeight: 800,
        }}>
          CHALLENGE
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          margin: '0 0 24px',
        }}>
          You&apos;ve been challenged!
        </p>

        {/* Trainer card */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}>
            {trainer.avatar === 'default' ? '🎮' : trainer.avatar}
          </div>

          <h2 style={{
            color: '#fff',
            fontSize: '22px',
            margin: '0 0 4px',
            fontWeight: 700,
          }}>
            {trainer.username}
          </h2>

          <div style={{ color: rankColor, fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            {rankIcon} {rank}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '12px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#4CAF50' }}>{trainer.wins}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Wins</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{winRate}%</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Win Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#ff6b35' }}>
                {trainer.streak > 0 ? `🔥 ${trainer.streak}` : '—'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Streak</div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <a
          href="/multiplayer"
          style={{
            display: 'block',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#1a1a2e',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 800,
            textDecoration: 'none',
            letterSpacing: '1px',
            marginBottom: '10px',
            transition: 'all 0.2s',
          }}>
          ⚔️ ACCEPT CHALLENGE
        </a>

        <a
          href={`/profile/${encodeURIComponent(trainer.username)}`}
          style={{
            display: 'block',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            marginBottom: '10px',
          }}>
          View Profile
        </a>

        <a
          href="/register"
          style={{
            display: 'block',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '13px',
            textDecoration: 'none',
            padding: '8px',
          }}>
          Don&apos;t have an account? Sign up free →
        </a>
      </div>
    </div>
  );
}
