'use client';

import { useState } from 'react';
import Link from 'next/link';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav-wrapper">
      <button
        className="mobile-nav-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={`mobile-nav-bar ${open ? 'mobile-nav-bar-open' : ''}`} />
        <span className={`mobile-nav-bar ${open ? 'mobile-nav-bar-open' : ''}`} />
        <span className={`mobile-nav-bar ${open ? 'mobile-nav-bar-open' : ''}`} />
      </button>

      {open && (
        <div className="mobile-nav-overlay" onClick={() => setOpen(false)}>
          <div className="mobile-nav-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span className="mobile-nav-logo">P</span>
              <span className="mobile-nav-title">Pokemon Arena</span>
              <button className="mobile-nav-close" onClick={() => setOpen(false)}>&times;</button>
            </div>
            <div className="mobile-nav-links">
              <Link href="/play" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">&#9654;</span> Play Now
              </Link>
              <Link href="/multiplayer" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">VS</span> PvP Online
              </Link>
              <Link href="/spectate" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">&#9734;</span> Spectate
              </Link>
              <Link href="/clan-wars" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">&#9876;</span> Clan Wars
              </Link>
              <Link href="/ladders" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">&#9733;</span> Ladders
              </Link>
              <Link href="/tutorial" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">&#63;</span> Tutorial
              </Link>
              <Link href="/battle-pass" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">&#9830;</span> Battle Pass
              </Link>
              <Link href="/pokedex" className="mobile-nav-link" onClick={() => setOpen(false)}>
                <span className="mobile-nav-icon">&#9673;</span> Pokedex
              </Link>
            </div>
            <div className="mobile-nav-footer">
              <Link href="/login" className="mobile-nav-btn mobile-nav-btn-login" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="mobile-nav-btn mobile-nav-btn-register" onClick={() => setOpen(false)}>
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
