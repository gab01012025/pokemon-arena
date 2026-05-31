import Link from 'next/link';
import { AccountBox } from '@/components/auth/AccountBox';
import { NewsFeed } from '@/components/NewsFeed';
import { DiscordInviteCard } from '@/components/DiscordWidget';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">P</span>
            <span className="landing-logo-text">Pokemon Arena</span>
          </div>
          <div className="landing-nav-links">
            <Link href="/play" className="landing-nav-link">Play</Link>
            <Link href="/multiplayer" className="landing-nav-link">PvP Online</Link>
            <Link href="/ladders" className="landing-nav-link">Ladders</Link>
            <Link href="/battle-pass" className="landing-nav-link">Battle Pass</Link>
            <Link href="/pokedex" className="landing-nav-link">Pokedex</Link>
          </div>
          <div className="landing-nav-auth">
            <Link href="/login" className="landing-btn-login">Login</Link>
            <Link href="/register" className="landing-btn-register">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            POKEMON<br /><span className="landing-hero-accent">ARENA</span>
          </h1>
          <p className="landing-hero-subtitle">
            Strategic turn-based battles. Build your team. Conquer the ladder.
          </p>
          <div className="landing-hero-actions">
            <Link href="/play" className="landing-cta-primary">
              Play Now
            </Link>
            <Link href="/register" className="landing-cta-secondary">
              Create Account
            </Link>
          </div>
          <div className="landing-hero-stats">
            <div className="landing-stat">
              <span className="landing-stat-value">3v3</span>
              <span className="landing-stat-label">Team Battles</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">150+</span>
              <span className="landing-stat-label">Pokemon</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">Real-time</span>
              <span className="landing-stat-label">PvP Matches</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h2 className="landing-section-title">Choose Your Path</h2>
        <p className="landing-section-subtitle">Multiple ways to prove your skills as a Pokemon trainer</p>
        <div className="landing-features-grid">
          <Link href="/multiplayer" className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-pvp">VS</div>
            <h3>PvP Battles</h3>
            <p>Face real trainers in strategic 3v3 turn-based combat. Climb the ranked ladder and become Champion.</p>
          </Link>
          <Link href="/play" className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-ai">AI</div>
            <h3>AI Training</h3>
            <p>Hone your skills against intelligent AI opponents. Perfect your team synergy and strategy.</p>
          </Link>
          <Link href="/characters" className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-team">+</div>
            <h3>Team Building</h3>
            <p>Choose from 150+ Pokemon. Master energy types, abilities, and create unstoppable combinations.</p>
          </Link>
          <Link href="/ladders" className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-rank">&#9733;</div>
            <h3>Ranked Seasons</h3>
            <p>Compete in seasonal ladders. Earn rewards, climb rankings, and cement your legacy.</p>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <h2 className="landing-section-title">How It Works</h2>
        <div className="landing-how-steps">
          <div className="landing-step">
            <div className="landing-step-number">1</div>
            <h3>Choose Your Team</h3>
            <p>Select 3 Pokemon for your battle squad. Balance types and abilities for maximum synergy.</p>
          </div>
          <div className="landing-step-arrow">&rarr;</div>
          <div className="landing-step">
            <div className="landing-step-number">2</div>
            <h3>Select Energy Types</h3>
            <p>Pick up to 3 energy types that power your moves. Match them to your team composition.</p>
          </div>
          <div className="landing-step-arrow">&rarr;</div>
          <div className="landing-step">
            <div className="landing-step-number">3</div>
            <h3>Battle &amp; Win</h3>
            <p>Use abilities strategically each turn. Outplay your opponent to claim victory!</p>
          </div>
        </div>
      </section>

      {/* Starter Pokemon Showcase */}
      <section className="landing-showcase">
        <h2 className="landing-section-title">Starter Pokemon</h2>
        <p className="landing-section-subtitle">Begin your journey with these classic partners</p>
        <div className="landing-pokemon-grid">
          <div className="landing-pokemon-card landing-pokemon-fire">
            <div className="landing-pokemon-type">Fire</div>
            <div className="landing-pokemon-name">Charmander</div>
            <div className="landing-pokemon-desc">A fierce fire-type with powerful offensive moves</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-water">
            <div className="landing-pokemon-type">Water</div>
            <div className="landing-pokemon-name">Squirtle</div>
            <div className="landing-pokemon-desc">A sturdy water-type with strong defensive options</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-grass">
            <div className="landing-pokemon-type">Grass</div>
            <div className="landing-pokemon-name">Bulbasaur</div>
            <div className="landing-pokemon-desc">A versatile grass-type with healing and poison</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-electric">
            <div className="landing-pokemon-type">Electric</div>
            <div className="landing-pokemon-name">Pikachu</div>
            <div className="landing-pokemon-desc">A fast electric-type with paralyzing attacks</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-normal">
            <div className="landing-pokemon-type">Normal</div>
            <div className="landing-pokemon-name">Eevee</div>
            <div className="landing-pokemon-desc">An adaptable Pokemon with diverse evolution potential</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-normal2">
            <div className="landing-pokemon-type">Normal</div>
            <div className="landing-pokemon-name">Meowth</div>
            <div className="landing-pokemon-desc">A tricky Pokemon that disrupts enemy strategies</div>
          </div>
        </div>
      </section>

      {/* News & Community Section */}
      <section className="landing-news-section">
        <h2 className="landing-section-title">Latest News</h2>
        <p className="landing-section-subtitle">Balance updates, new features, and community events</p>
        <NewsFeed limit={4} />
      </section>

      {/* Community & Account Section */}
      <section className="landing-community">
        <div className="landing-community-grid">
          <div className="landing-community-info">
            <h2 className="landing-section-title" style={{ textAlign: 'left' }}>Join the Community</h2>
            <p className="landing-community-text">
              Connect with thousands of trainers worldwide. Join our Discord server for team discussions,
              tournaments, and balance updates.
            </p>
            <DiscordInviteCard />
            <div className="landing-community-links">
              <a href="https://discord.gg/cnnM32wK" className="landing-discord-btn" target="_blank" rel="noopener noreferrer">
                Join Discord
              </a>
              <Link href="/ladders" className="landing-link-subtle">
                View Ladders &rarr;
              </Link>
            </div>
          </div>
          <div className="landing-community-account">
            <AccountBox />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span className="landing-logo-icon">P</span>
            <span>Pokemon Arena</span>
          </div>
          <div className="landing-footer-links">
            <Link href="/tutorial">Tutorial</Link>
            <Link href="/pokedex">Pokedex</Link>
            <Link href="/ladders">Ladders</Link>
            <a href="https://discord.gg/pokemonarena">Discord</a>
          </div>
          <div className="landing-footer-copy">
            Version 1.0 &mdash; A fan-made Pokemon strategy game
          </div>
        </div>
      </footer>
    </div>
  );
}
