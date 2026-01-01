/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

const characterCategories = [
  {
    name: 'Kanto Region',
    characters: [
      { id: 'pikachu', name: 'Pikachu' },
      { id: 'charizard', name: 'Charizard' },
      { id: 'bulbasaur', name: 'Bulbasaur' },
      { id: 'squirtle', name: 'Squirtle' },
      { id: 'mewtwo', name: 'Mewtwo' },
      { id: 'mew', name: 'Mew' },
      { id: 'gengar', name: 'Gengar' },
      { id: 'alakazam', name: 'Alakazam' },
      { id: 'machamp', name: 'Machamp' },
      { id: 'gyarados', name: 'Gyarados' },
      { id: 'dragonite', name: 'Dragonite' },
      { id: 'snorlax', name: 'Snorlax' },
      { id: 'lapras', name: 'Lapras' },
    ]
  },
  {
    name: 'Team Rocket',
    characters: [
      { id: 'giovanni', name: 'Giovanni' },
      { id: 'meowth', name: 'Meowth' },
      { id: 'arbok', name: 'Arbok' },
      { id: 'weezing', name: 'Weezing' },
      { id: 'persian', name: 'Persian' },
      { id: 'nidoking', name: 'Nidoking' },
      { id: 'rhydon', name: 'Rhydon' },
      { id: 'kangaskhan', name: 'Kangaskhan' },
      { id: 'dugtrio', name: 'Dugtrio' },
      { id: 'victreebel', name: 'Victreebel' },
    ]
  },
  {
    name: 'Johto Region',
    characters: [
      { id: 'typhlosion', name: 'Typhlosion' },
      { id: 'feraligatr', name: 'Feraligatr' },
      { id: 'meganium', name: 'Meganium' },
    ]
  },
  {
    name: 'Hoenn Region',
    characters: [
      { id: 'blaziken', name: 'Blaziken' },
      { id: 'swampert', name: 'Swampert' },
      { id: 'sceptile', name: 'Sceptile' },
      { id: 'rayquaza', name: 'Rayquaza' },
      { id: 'groudon', name: 'Groudon' },
      { id: 'kyogre', name: 'Kyogre' },
      { id: 'deoxys', name: 'Deoxys' },
    ]
  },
  {
    name: 'Legendary Pokemon',
    characters: [
      { id: 'articuno', name: 'Articuno' },
      { id: 'zapdos', name: 'Zapdos' },
      { id: 'moltres', name: 'Moltres' },
    ]
  },
  {
    name: 'Evolution Forms',
    characters: [
      { id: 'pikachu-evolved', name: 'Raichu' },
      { id: 'charizard-mega', name: 'Mega Charizard' },
      { id: 'blastoise', name: 'Blastoise' },
      { id: 'venusaur', name: 'Venusaur' },
      { id: 'mewtwo-mega', name: 'Mega Mewtwo' },
      { id: 'gengar-mega', name: 'Mega Gengar' },
    ]
  },
];

export default function CharactersPage() {
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
              <a href="https://discord.gg/pokemonarena" className="nav-btn-top discord-btn">🎮 DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <img src="https://i.imgur.com/GNheiTq.png" alt="Pokemon Arena Banner" className="header-logo" />
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">Characters</h1>
            
            <div className="content-section">
              <div className="section-title">All Characters</div>
              <div className="section-content">
                <p className="characters-intro">
                  Browse all available characters in Pokemon Arena. Click on a character to view their skills and abilities.
                </p>
                
                {characterCategories.map((category) => (
                  <div key={category.name} className="character-category-section">
                    <h3 className="category-header">{category.name}</h3>
                    <div className="characters-list">
                      {category.characters.map((char) => (
                        <Link 
                          key={char.id} 
                          href={`/chars/${char.id}`} 
                          className="character-list-item"
                        >
                          <div className="character-avatar">
                            <img 
                              src={`https://i.imgur.com/placeholder.png`} 
                              alt={char.name} 
                            />
                          </div>
                          <div className="character-name">{char.name}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Character Classes */}
            <div className="content-section">
              <div className="section-title">Character Classes</div>
              <div className="section-content">
                <div className="classes-grid">
                  <div className="class-item">
                    <div className="class-icon bloodline">B</div>
                    <div className="class-info">
                      <strong>Bloodline</strong>
                      <p>Special inherited abilities</p>
                    </div>
                  </div>
                  <div className="class-item">
                    <div className="class-icon ninjutsu">S</div>
                    <div className="class-info">
                      <strong>Special</strong>
                      <p>Energy-based techniques</p>
                    </div>
                  </div>
                  <div className="class-item">
                    <div className="class-icon taijutsu">P</div>
                    <div className="class-info">
                      <strong>Physical</strong>
                      <p>Physical combat skills</p>
                    </div>
                  </div>
                  <div className="class-item">
                    <div className="class-icon genjutsu">St</div>
                    <div className="class-info">
                      <strong>Status</strong>
                      <p>Status effect techniques</p>
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
