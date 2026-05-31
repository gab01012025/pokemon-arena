import Link from 'next/link';
import Image from 'next/image';
import { AccountBox } from '@/components/auth/AccountBox';
import { NewsFeed } from '@/components/NewsFeed';
import { DiscordInviteCard } from '@/components/DiscordWidget';
import { ScrollAnimations } from '@/components/ScrollAnimations';
import { OnlineCounter } from '@/components/OnlineCounter';
import { MobileNav } from '@/components/MobileNav';

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
            <Link href="/spectate" className="landing-nav-link">Spectate</Link>
            <Link href="/clan-wars" className="landing-nav-link">Clan Wars</Link>
            <Link href="/ladders" className="landing-nav-link">Ladders</Link>
            <Link href="/tutorial" className="landing-nav-link">Tutorial</Link>
          </div>
          <div className="landing-nav-auth">
            <Link href="/login" className="landing-btn-login">Login</Link>
            <Link href="/register" className="landing-btn-register">Register</Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-particles">
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png" alt="" width={80} height={80} unoptimized style={{ left: '3%', top: '12%', animationDelay: '0s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png" alt="" width={90} height={90} unoptimized style={{ right: '5%', top: '20%', animationDelay: '-3s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png" alt="" width={70} height={70} unoptimized style={{ left: '10%', bottom: '18%', animationDelay: '-6s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png" alt="" width={85} height={85} unoptimized style={{ right: '8%', bottom: '25%', animationDelay: '-9s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png" alt="" width={75} height={75} unoptimized style={{ left: '22%', top: '72%', animationDelay: '-4s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" alt="" width={80} height={80} unoptimized style={{ right: '20%', top: '68%', animationDelay: '-7s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png" alt="" width={65} height={65} unoptimized style={{ left: '42%', top: '6%', animationDelay: '-2s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png" alt="" width={65} height={65} unoptimized style={{ right: '32%', bottom: '8%', animationDelay: '-5s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png" alt="" width={75} height={75} unoptimized style={{ left: '55%', top: '85%', animationDelay: '-11s' }} />
          <Image className="landing-float-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/376.png" alt="" width={70} height={70} unoptimized style={{ right: '45%', top: '4%', animationDelay: '-13s' }} />
        </div>
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <OnlineCounter />
          </div>
          <h1 className="landing-hero-title">
            POKEMON<br /><span className="landing-hero-accent">ARENA</span>
          </h1>
          <p className="landing-hero-subtitle">
            Strategic turn-based battles. Build your team. Conquer the ladder.
          </p>

          {/* Hero Pokemon Showcase */}
          <div className="landing-hero-pokemon">
            <div className="landing-hero-poke landing-hero-poke-left">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
                alt="Charizard"
                width={180}
                height={180}
                unoptimized
              />
            </div>
            <div className="landing-hero-poke landing-hero-poke-center">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
                alt="Mewtwo"
                width={200}
                height={200}
                unoptimized
              />
            </div>
            <div className="landing-hero-poke landing-hero-poke-right">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
                alt="Blastoise"
                width={180}
                height={180}
                unoptimized
              />
            </div>
          </div>

          <div className="landing-hero-actions">
            <Link href="/play" className="landing-cta-primary">
              <span className="landing-cta-glow" />
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
      <section className="landing-features scroll-reveal">
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
      <section className="landing-how scroll-reveal">
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
      <section className="landing-showcase scroll-reveal">
        <h2 className="landing-section-title">Starter Pokemon</h2>
        <p className="landing-section-subtitle">Begin your journey with these classic partners</p>
        <div className="landing-pokemon-grid">
          <div className="landing-pokemon-card landing-pokemon-fire scroll-reveal-item">
            <div className="landing-pokemon-sprite">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
                alt="Charmander"
                width={120}
                height={120}
                unoptimized
              />
            </div>
            <div className="landing-pokemon-type">Fire</div>
            <div className="landing-pokemon-name">Charmander</div>
            <div className="landing-pokemon-desc">A fierce fire-type with powerful offensive moves</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-water scroll-reveal-item">
            <div className="landing-pokemon-sprite">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png"
                alt="Squirtle"
                width={120}
                height={120}
                unoptimized
              />
            </div>
            <div className="landing-pokemon-type">Water</div>
            <div className="landing-pokemon-name">Squirtle</div>
            <div className="landing-pokemon-desc">A sturdy water-type with strong defensive options</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-grass scroll-reveal-item">
            <div className="landing-pokemon-sprite">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
                alt="Bulbasaur"
                width={120}
                height={120}
                unoptimized
              />
            </div>
            <div className="landing-pokemon-type">Grass</div>
            <div className="landing-pokemon-name">Bulbasaur</div>
            <div className="landing-pokemon-desc">A versatile grass-type with healing and poison</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-electric scroll-reveal-item">
            <div className="landing-pokemon-sprite">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                alt="Pikachu"
                width={120}
                height={120}
                unoptimized
              />
            </div>
            <div className="landing-pokemon-type">Electric</div>
            <div className="landing-pokemon-name">Pikachu</div>
            <div className="landing-pokemon-desc">A fast electric-type with paralyzing attacks</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-normal scroll-reveal-item">
            <div className="landing-pokemon-sprite">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
                alt="Eevee"
                width={120}
                height={120}
                unoptimized
              />
            </div>
            <div className="landing-pokemon-type">Normal</div>
            <div className="landing-pokemon-name">Eevee</div>
            <div className="landing-pokemon-desc">An adaptable Pokemon with diverse evolution potential</div>
          </div>
          <div className="landing-pokemon-card landing-pokemon-normal2 scroll-reveal-item">
            <div className="landing-pokemon-sprite">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png"
                alt="Meowth"
                width={120}
                height={120}
                unoptimized
              />
            </div>
            <div className="landing-pokemon-type">Normal</div>
            <div className="landing-pokemon-name">Meowth</div>
            <div className="landing-pokemon-desc">A tricky Pokemon that disrupts enemy strategies</div>
          </div>
        </div>
      </section>

      {/* News & Community Section */}
      <section className="landing-news-section scroll-reveal">
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

      {/* Scroll Animations Controller */}
      <ScrollAnimations />
    </div>
  );
}
