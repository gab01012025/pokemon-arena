import Link from 'next/link';
import Image from 'next/image';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';
import { NewsFeed } from '@/components/NewsFeed';

export default function Home() {
  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Header Section - same as login page */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top active">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/pokemon-missions" className="nav-btn-top">Pokemon Missions</Link>
              <a href="https://discord.gg/cnnM32wK" className="nav-btn-top discord-btn" target="_blank" rel="noopener noreferrer">DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          {/* Welcome Banner */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Welcome to Pokemon Arena</h2>
            </div>
            <div className="content-box-body home-welcome">
              <div className="home-welcome-hero">
                <div className="home-welcome-pokemon">
                  <Image
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
                    alt="Charizard"
                    width={120}
                    height={120}
                    unoptimized
                  />
                  <Image
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
                    alt="Mewtwo"
                    width={140}
                    height={140}
                    unoptimized
                  />
                  <Image
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
                    alt="Blastoise"
                    width={120}
                    height={120}
                    unoptimized
                  />
                </div>
                <p className="home-welcome-text">
                  Strategic turn-based 3v3 battles. Choose your team of Pokemon, master energy types, and climb the ranked ladder to become the ultimate Champion.
                </p>
                <div className="home-welcome-actions">
                  <Link href="/play" className="home-btn-play">Start Playing</Link>
                  <Link href="/register" className="home-btn-register">Create Account</Link>
                  <Link href="/the-basics" className="home-btn-tutorial">Learn the Basics</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Latest News */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Latest News &amp; Updates</h2>
            </div>
            <div className="content-box-body">
              <NewsFeed limit={5} />
            </div>
          </div>

          {/* Featured Pokemon */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>Featured Pokemon</h2>
            </div>
            <div className="content-box-body">
              <div className="home-featured-grid">
                {[
                  { id: 6, name: 'Charizard', type: 'Fire', desc: 'A powerful fire-type with devastating offensive moves.' },
                  { id: 9, name: 'Blastoise', type: 'Water', desc: 'A sturdy water-type with strong defensive options.' },
                  { id: 3, name: 'Venusaur', type: 'Grass', desc: 'A versatile grass-type with healing and poison abilities.' },
                  { id: 25, name: 'Pikachu', type: 'Electric', desc: 'A fast electric-type with paralyzing attacks.' },
                  { id: 150, name: 'Mewtwo', type: 'Psychic', desc: 'The ultimate psychic pokemon with unmatched power.' },
                  { id: 149, name: 'Dragonite', type: 'Dragon', desc: 'A versatile dragon-type with balanced stats.' },
                ].map((pokemon) => (
                  <Link key={pokemon.id} href="/characters" className="home-pokemon-card">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                      alt={pokemon.name}
                      width={80}
                      height={80}
                      unoptimized
                    />
                    <div className="home-pokemon-info">
                      <span className="home-pokemon-name">{pokemon.name}</span>
                      <span className="home-pokemon-type">{pokemon.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="content-box">
            <div className="content-box-header">
              <h2>How to Play</h2>
            </div>
            <div className="content-box-body">
              <div className="home-howto">
                <div className="home-howto-step">
                  <span className="home-howto-num">1</span>
                  <div>
                    <strong>Choose Your Team</strong>
                    <p>Select 3 Pokemon for your battle squad. Balance types and abilities for maximum synergy.</p>
                  </div>
                </div>
                <div className="home-howto-step">
                  <span className="home-howto-num">2</span>
                  <div>
                    <strong>Select Energy Types</strong>
                    <p>Pick up to 3 energy types that power your moves. Match them to your team composition.</p>
                  </div>
                </div>
                <div className="home-howto-step">
                  <span className="home-howto-num">3</span>
                  <div>
                    <strong>Battle &amp; Win</strong>
                    <p>Use abilities strategically each turn. Outplay your opponent to claim victory!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
