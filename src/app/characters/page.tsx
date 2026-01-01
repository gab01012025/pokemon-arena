/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

const characterCategories = [
  {
    name: 'Konoha Village',
    characters: [
      { id: 'naruto', name: 'Naruto Uzumaki' },
      { id: 'sasuke', name: 'Sasuke Uchiha' },
      { id: 'sakura', name: 'Sakura Haruno' },
      { id: 'kakashi', name: 'Kakashi Hatake' },
      { id: 'rock-lee', name: 'Rock Lee' },
      { id: 'neji', name: 'Neji Hyuga' },
      { id: 'tenten', name: 'Tenten' },
      { id: 'hinata', name: 'Hinata Hyuga' },
      { id: 'shino', name: 'Shino Aburame' },
      { id: 'kiba', name: 'Kiba Inuzuka' },
      { id: 'shikamaru', name: 'Shikamaru Nara' },
      { id: 'choji', name: 'Choji Akimichi' },
      { id: 'ino', name: 'Ino Yamanaka' },
    ]
  },
  {
    name: 'Akatsuki',
    characters: [
      { id: 'itachi', name: 'Itachi Uchiha' },
      { id: 'kisame', name: 'Kisame Hoshigaki' },
      { id: 'deidara', name: 'Deidara' },
      { id: 'sasori', name: 'Sasori' },
      { id: 'hidan', name: 'Hidan' },
      { id: 'kakuzu', name: 'Kakuzu' },
      { id: 'pain', name: 'Pain' },
      { id: 'konan', name: 'Konan' },
      { id: 'tobi', name: 'Tobi' },
      { id: 'zetsu', name: 'Zetsu' },
    ]
  },
  {
    name: 'Sand Village',
    characters: [
      { id: 'gaara', name: 'Gaara' },
      { id: 'temari', name: 'Temari' },
      { id: 'kankuro', name: 'Kankuro' },
    ]
  },
  {
    name: 'Sound Village',
    characters: [
      { id: 'orochimaru', name: 'Orochimaru' },
      { id: 'kabuto', name: 'Kabuto Yakushi' },
      { id: 'kimimaro', name: 'Kimimaro' },
      { id: 'tayuya', name: 'Tayuya' },
      { id: 'sakon', name: 'Sakon' },
      { id: 'kidomaru', name: 'Kidomaru' },
      { id: 'jirobo', name: 'Jirobo' },
    ]
  },
  {
    name: 'Legendary Sannin',
    characters: [
      { id: 'jiraiya', name: 'Jiraiya' },
      { id: 'tsunade', name: 'Tsunade' },
      { id: 'orochimaru-sannin', name: 'Orochimaru' },
    ]
  },
  {
    name: 'Shippuden',
    characters: [
      { id: 'naruto-shippuden', name: 'Naruto (S)' },
      { id: 'sasuke-shippuden', name: 'Sasuke (S)' },
      { id: 'sakura-shippuden', name: 'Sakura (S)' },
      { id: 'sage-naruto', name: 'Sage Naruto' },
      { id: 'kcm-naruto', name: 'KCM Naruto' },
      { id: 'ems-sasuke', name: 'EMS Sasuke' },
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
              <Link href="/ninja-missions" className="nav-btn-top">Ninja Missions</Link>
              <a href="https://discord.gg/narutoarena" className="nav-btn-top discord-btn">🎮 DISCORD</a>
            </div>
          </div>
          <div className="header-banner">
            <img src="https://i.imgur.com/GNheiTq.png" alt="Naruto Arena Banner" className="header-logo" />
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <h1 className="page-title">Characters</h1>
            
            <div className="content-section">
              <div className="section-title">All Characters</div>
              <div className="section-content">
                <p className="characters-intro">
                  Browse all available characters in Naruto Arena. Click on a character to view their skills and abilities.
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
                    <div className="class-icon ninjutsu">N</div>
                    <div className="class-info">
                      <strong>Ninjutsu</strong>
                      <p>Chakra-based techniques</p>
                    </div>
                  </div>
                  <div className="class-item">
                    <div className="class-icon taijutsu">T</div>
                    <div className="class-info">
                      <strong>Taijutsu</strong>
                      <p>Physical combat skills</p>
                    </div>
                  </div>
                  <div className="class-item">
                    <div className="class-icon genjutsu">G</div>
                    <div className="class-info">
                      <strong>Genjutsu</strong>
                      <p>Illusion techniques</p>
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
