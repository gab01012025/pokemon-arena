import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  const referrer = await prisma.trainer.findUnique({
    where: { referralCode: code.toUpperCase() },
    select: { username: true },
  });

  const title = referrer
    ? `${referrer.username} invited you to Pokémon Arena!`
    : 'Join Pokémon Arena!';

  return {
    title,
    description: '🎮 Join Pokémon Arena and battle other trainers in real-time! Free to play. Use the invite link for bonus rewards!',
    openGraph: {
      title: `🎮 ${title}`,
      description: 'Build your team, battle trainers, climb the ranks! Join the arena and claim bonus XP rewards.',
      type: 'website',
      siteName: 'Pokémon Arena',
    },
    twitter: {
      card: 'summary_large_image',
      title: `🎮 ${title}`,
      description: 'Build your team, battle trainers, climb the ranks!',
    },
  };
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  const referrer = await prisma.trainer.findUnique({
    where: { referralCode: upperCode },
    select: { username: true, avatar: true, wins: true, ladderPoints: true },
  });

  if (!referrer) notFound();

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
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Invite header */}
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎮</div>
        <h1 style={{
          fontSize: '24px',
          color: '#FFD700',
          margin: '0 0 4px',
          fontWeight: 800,
        }}>
          You&apos;re Invited!
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: '#fff' }}>{referrer.username}</strong> invited you to Pokémon Arena!
          <br />Sign up and both of you get bonus XP rewards.
        </p>

        {/* Referral bonus card */}
        <div style={{
          background: 'rgba(255, 215, 0, 0.08)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFD700', marginBottom: '8px' }}>
            🎁 Referral Bonus
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
            ✅ <strong>+200 XP</strong> for your friend<br />
            ✅ <strong>+200 XP</strong> for you when you sign up<br />
            ✅ Head start on your ranking journey!
          </div>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '24px',
        }}>
          {[
            { emoji: '⚔️', text: 'Real-time PvP' },
            { emoji: '🏆', text: 'Ranked Battles' },
            { emoji: '🎯', text: '30+ Pokémon' },
            { emoji: '👥', text: 'Clan System' },
          ].map(item => (
            <div key={item.text} style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}>
              <span style={{ fontSize: '16px' }}>{item.emoji}</span>
              <br />{item.text}
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={`/register?ref=${upperCode}`}
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
          }}>
          🚀 JOIN NOW — FREE
        </a>

        <a
          href="/login"
          style={{
            display: 'block',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '13px',
            textDecoration: 'none',
            padding: '8px',
          }}>
          Already have an account? Log in →
        </a>
      </div>
    </div>
  );
}
