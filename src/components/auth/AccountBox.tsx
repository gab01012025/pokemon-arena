'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export function AccountBox() {
  const { user, isAuthenticated, isLoading, checkSession, logout } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  
  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };
  
  if (isLoading) {
    return (
      <div className="sidebar-box">
        <div className="sidebar-box-header">Account</div>
        <div className="sidebar-box-content">
          <p style={{ textAlign: 'center' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    return (
      <div className="sidebar-box">
        <div className="sidebar-box-header">Account</div>
        <div className="sidebar-box-content">
          <div className="account-links">
            <p>Welcome, <strong>{user.username}</strong></p>
            <p>Level: {user.level} | W/L: {user.wins}/{user.losses}</p>
            <hr style={{ margin: '8px 0', borderColor: '#ccc' }} />
            <p><Link href={`/profile/${user.username}`}>View Profile</Link></p>
            <p><Link href="/settings">Control Panel</Link></p>
            <p><Link href="/characters">Choose Pokemon</Link></p>
            <p><Link href="/clans">Clan Panel</Link></p>
            <hr style={{ margin: '8px 0', borderColor: '#ccc' }} />
            <p>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--link-blue)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit',
                }}
              >
                Logout
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="sidebar-box">
      <div className="sidebar-box-header">Account</div>
      <div className="sidebar-box-content">
        <form className="login-form" action="/login" method="GET">
          <p style={{ marginBottom: '10px', fontSize: '11px' }}>
            <Link href="/login" className="btn-login" style={{ display: 'block', textAlign: 'center', padding: '8px', background: '#fff', border: '1px solid #333', textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
              Login
            </Link>
          </p>
          <p style={{ marginBottom: '10px', fontSize: '11px' }}>
            <Link href="/register" className="btn-register" style={{ display: 'block', textAlign: 'center', padding: '8px', background: 'var(--header-blue)', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
              Register
            </Link>
          </p>
          <p className="lost-password" style={{ textAlign: 'center' }}>
            <Link href="/forgot-password">Lost your password?</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
