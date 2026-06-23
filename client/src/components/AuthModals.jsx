import React, { useState } from 'react';
import { apiUrl } from '../api';
import { Shield, Lock, User, Sparkles, X } from 'lucide-react';

export default function AuthModals({ isOpen, onClose, onAuthSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLoginMode ? 'login' : 'register';

    try {
      const response = await fetch(apiUrl(`/api/auth/${endpoint}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${endpoint}`);
      }

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content animate-fade-in" style={{ maxWidth: '420px', border: '1px solid var(--accent)' }}>
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '50%',
            background: 'rgba(var(--accent-rgb), 0.1)',
            border: '1px solid var(--glass-border)',
            color: 'var(--accent)',
            marginBottom: '1rem'
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {isLoginMode ? 'Welcome Back Slayer' : 'Join the Gaming Hub'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isLoginMode ? 'Sign in to access your game wishlist' : 'Create an account to save personal recommendations'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input" 
                placeholder="e.g. MasterChief" 
                style={{ paddingLeft: '36px' }}
                required 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input" 
                placeholder="Min 6 characters" 
                style={{ paddingLeft: '36px' }}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Register Account')}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          {isLoginMode ? "Don't have an account?" : "Already registered?"}{' '}
          <button 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLoginMode ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
