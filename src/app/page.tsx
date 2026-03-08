import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroStats, SocialProofSection } from '@/components/LandingClient';
import './landing.css';

export const metadata: Metadata = {
  title: 'Pokémon Arena — Free Online Pokémon Battle Game',
  description: "Battle trainers worldwide in real-time PvP or challenge AI. 27+ Pokémon to collect, ranked competitive ladder, daily missions, card packs — 100% free, no pay to win!",
  alternates: {
    canonical: '/',
  },
};

const SHOWCASE_POKEMON = [
  'pikachu', 'charizard', 'mewtwo', 'gengar', 'lucario', 'garchomp', 'dragonite', 'blastoise',
];

export default function Home() {
  return (
    <div className="landing">
      {/* Fixed Navbar */}
      <nav className="landing-nav">
        <Link href="/" className="landing-nav-logo">POKÉMON ARENA</Link>
        <div className="landing-nav-links">
          <Link href="/tutorial" className="landing-nav-link">Tutorial</Link>
          <Link href="/ladders" className="landing-nav-link">Ladders</Link>
          <Link href="/pokedex" className="landing-nav-link">Pokédex</Link>
          <Link href="/login" className="landing-nav-link">Login</Link>
          <Link href="/play" className="landing-nav-cta">Play Now</Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        {/* Floating pokémon sprites */}
        <div className="hero-particles" aria-hidden="true">
          {SHOWCASE_POKEMON.map((name) => (
            <img
              key={name}
              className="hero-particle"
              src={`/images/pokemon/${name}.png`}
              alt=""
              width={60}
              height={60}
              loading="eager"
            />
          ))}
        </div>

        <div className="hero-content">
          <h1 className="hero-title">POKÉMON ARENA</h1>
          <p className="hero-subtitle">Battle. Rank. Dominate.</p>

          <Link href="/play" className="hero-cta" prefetch={true}>
            <span>⚡</span> PLAY NOW — FREE
          </Link>

          <HeroStats />

          {/* Pokémon showcase circles */}
          <div className="hero-pokemon-showcase">
            {SHOWCASE_POKEMON.map((name) => (
              <div key={name} className="showcase-pokemon">
                <img
                  src={`/images/pokemon/${name}.png`}
                  alt={name}
                  width={52}
                  height={52}
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hero-scroll-indicator" aria-hidden="true">▼</div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-section">
        <h2 className="section-title">Why Trainers Choose Us</h2>
        <p className="section-subtitle">Everything you need. Nothing you don&apos;t.</p>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">⚔️</span>
            <h3>Real-Time PvP Battles</h3>
            <p>Pick 3 Pokémon and battle other trainers in strategic turn-based combat with real-time matchmaking.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎴</span>
            <h3>27+ Pokémon to Collect</h3>
            <p>Unlock new Pokémon by leveling up, earning streaks, opening card packs, and completing achievements.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏆</span>
            <h3>Ranked Competitive Ladder</h3>
            <p>Climb from Poké Ball to Master Ball. Earn LP, track your rank, and compete for the leaderboard.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎮</span>
            <h3>Free to Play, No Pay to Win</h3>
            <p>Every Pokémon is earnable through gameplay. No loot boxes with real money. Pure skill-based competition.</p>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <SocialProofSection />

      {/* ===== FINAL CTA ===== */}
      <section className="final-cta-section">
        <h2 className="final-cta-title">Your Pokémon team is waiting</h2>
        <p className="final-cta-subtitle">Join trainers already battling — start in 30 seconds.</p>
        <div className="final-cta-buttons">
          <Link href="/register" className="btn-cta-primary">
            Create Free Account
          </Link>
          <Link href="/login" className="btn-cta-secondary">
            Already have an account? Log in
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-links">
          <Link href="/play" className="footer-link">Play</Link>
          <Link href="/tutorial" className="footer-link">Tutorial</Link>
          <Link href="/ladders" className="footer-link">Ladders</Link>
          <Link href="/pokedex" className="footer-link">Pokédex</Link>
          <Link href="/collection" className="footer-link">Collection</Link>
          <Link href="/missions" className="footer-link">Missions</Link>
          <a href="https://discord.gg/pokemonarena" className="footer-link" target="_blank" rel="noopener noreferrer">Discord</a>
        </div>
        <p className="footer-credit">Made with ❤️ by Pokémon Arena Team</p>
      </footer>
    </div>
  );
}
