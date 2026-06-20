import React, { useState } from 'react';
import { Gamepad2, User, LogOut, ShieldCheck, Sparkles, Palette } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, user, token, onLogout, onOpenLogin, onOpenPremium, currentTheme, onThemeChange }) {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const themesList = [
    { id: 'default', name: 'Vaporwave Violet' },
    { id: 'cyberpunk', name: 'Cyberpunk Amber' },
    { id: 'matrix', name: 'Matrix Emerald' },
    { id: 'crimson', name: 'Crimson Sith' }
  ];

  return (
    <nav className="glass-panel" style={{
      margin: '1rem 1.5rem',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 90,
      position: 'relative'
    }}>
      {/* Brand logo */}
      <div 
        onClick={() => onTabChange('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
      >
        <Gamepad2 size={28} color="var(--accent)" />
        <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '1px', background: 'linear-gradient(135deg, #ffffff 40%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GameMood
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {['home', 'explore', 'quiz', 'wishlist'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'color 0.2s',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              padding: '0.25rem 0'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Actions (Auth / Premium / Theme Swapping) */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>
        
        {/* Theme Swapper Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '8px' }}
            title="Switch Theme"
          >
            <Palette size={18} />
          </button>
          
          {themeDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '0.5rem',
              minWidth: '160px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 100,
              boxShadow: 'var(--glow-shadow)'
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '4px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                Select Visual Style:
              </p>
              {themesList.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setThemeDropdownOpen(false);
                  }}
                  style={{
                    background: currentTheme === theme.id ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: 'none',
                    color: currentTheme === theme.id ? 'var(--accent)' : 'var(--text-primary)',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: currentTheme === theme.id ? 'bold' : 'normal',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={(e) => {
                    if (currentTheme !== theme.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseOut={(e) => {
                    if (currentTheme !== theme.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Account Controls */}
        {token && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user.isPremium ? (
              <span className="badge badge-premium" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem' }}>
                <Sparkles size={12} fill="#000" />
                PREMIUM
              </span>
            ) : (
              <button
                onClick={onOpenPremium}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              >
                Go Premium (₹500)
              </button>
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <User size={16} />
              <span>{user.username}</span>
            </div>

            <button 
              onClick={onLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', borderRadius: '8px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Login / Register
          </button>
        )}
      </div>
    </nav>
  );
}
