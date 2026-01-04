'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
        } else {
          router.push('/login?redirect=/settings');
        }
      } catch {
        console.error('Failed to fetch user');
        router.push('/login?redirect=/settings');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      return;
    }
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="main-container">
          <div className="content-area">
            <div className="content-section">
              <div className="section-content" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="loading-spinner"></div>
                <p>Loading settings...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <LeftSidebar />
      
      <div className="main-container">
        {/* Header */}
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/game-manual" className="nav-btn-top">Game Manual</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/settings" className="nav-btn-top active">Settings</Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          <div className="content-section">
            <div className="section-title">⚙️ Account Settings</div>
            <div className="section-content">
              {userData && (
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Username:</strong> {userData.username}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Level:</strong> {userData.level}</p>
                  <p><strong>Record:</strong> {userData.wins}W / {userData.losses}L</p>
                </div>
              )}
            </div>
          </div>

          <div className="content-section">
            <div className="section-title">🔒 Change Password</div>
            <div className="section-content">
              {message && (
                <div style={{
                  padding: '10px',
                  marginBottom: '15px',
                  borderRadius: '5px',
                  backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: message.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                }}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      maxWidth: '300px',
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      maxWidth: '300px',
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      maxWidth: '300px',
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>

          <div className="content-section">
            <div className="section-title">🔗 Quick Links</div>
            <div className="section-content">
              <p><Link href={`/profile/${userData?.username}`}>View Profile</Link></p>
              <p><Link href="/characters">Manage Pokemon</Link></p>
              <p><Link href="/clans">Clan Panel</Link></p>
              <p><Link href="/missions">Missions</Link></p>
            </div>
          </div>
        </div>
      </div>
      
      <RightSidebar />
    </div>
  );
}
