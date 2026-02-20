'use client';

import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

export default function MultiplayerPage() {
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
          <h1 className="page-title">Multiplayer</h1>

          <div className="content-section">
            <div className="section-title">Batalhas Online PvP</div>
            <div className="section-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
              
              <div style={{ 
                background: 'rgba(255, 193, 7, 0.1)', 
                border: '2px solid #FFC107',
                borderRadius: '15px',
                padding: '30px',
                marginBottom: '30px',
                maxWidth: '600px',
                margin: '0 auto 30px',
              }}>
                <h2 style={{ color: '#FFC107', marginBottom: '15px' }}>
                  Em Desenvolvimento
                </h2>
                <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>
                  O modo Multiplayer PvP está sendo desenvolvido! Em breve você poderá 
                  batalhar contra outros jogadores em tempo real.
                </p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#fff', marginBottom: '20px' }}>O que está por vir:</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px',
                  maxWidth: '600px',
                  margin: '0 auto',
                }}>
                  <div style={{ 
                    background: 'rgba(233, 30, 99, 0.1)', 
                    border: '1px solid #e91e63',
                    borderRadius: '10px',
                    padding: '20px',
                  }}>
                    <span style={{ fontSize: '2rem' }}>⚔️</span>
                    <p style={{ color: '#e91e63', margin: '10px 0 0', fontWeight: 'bold' }}>
                      Batalhas PvP
                    </p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '5px 0 0' }}>
                      Enfrente outros jogadores
                    </p>
                  </div>
                  <div style={{ 
                    background: 'rgba(156, 39, 176, 0.1)', 
                    border: '1px solid #9c27b0',
                    borderRadius: '10px',
                    padding: '20px',
                  }}>
                    <span style={{ fontSize: '2rem' }}></span>
                    <p style={{ color: '#9c27b0', margin: '10px 0 0', fontWeight: 'bold' }}>
                      Ranked Mode
                    </p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '5px 0 0' }}>
                      Suba no ranking global
                    </p>
                  </div>
                  <div style={{ 
                    background: 'rgba(33, 150, 243, 0.1)', 
                    border: '1px solid #2196f3',
                    borderRadius: '10px',
                    padding: '20px',
                  }}>
                    <span style={{ fontSize: '2rem' }}></span>
                    <p style={{ color: '#2196f3', margin: '10px 0 0', fontWeight: 'bold' }}>
                      Torneios
                    </p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '5px 0 0' }}>
                      Competições semanais
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <p style={{ color: '#888', marginBottom: '20px' }}>
                  Enquanto isso, pratique suas habilidades contra a IA!
                </p>
                <Link 
                  href="/play"
                  style={{
                    display: 'inline-block',
                    padding: '15px 40px',
                    background: 'linear-gradient(135deg, #e91e63, #c2185b)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(233, 30, 99, 0.4)',
                  }}
                >
                  🤖 Jogar contra IA
                </Link>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
