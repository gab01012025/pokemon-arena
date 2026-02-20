'use client';

export function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '1rem',
        background: '#667eea',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
      }}
      onFocus={(e) => { e.currentTarget.style.left = '0'; }}
      onBlur={(e) => { e.currentTarget.style.left = '-9999px'; }}
    >
      Skip to main content
    </a>
  );
}
