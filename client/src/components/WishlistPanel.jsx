import React, { useEffect, useState } from 'react';
import GameCard from './GameCard';
import { Heart, Lock, Loader, HeartCrack, ChevronRight } from 'lucide-react';

export default function WishlistPanel({ wishlist, setWishlist, onWishlistToggle, token, onOpenLogin, isPremium, onUpgradeRequired, onTabChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load wishlist from server.');
        }

        const data = await response.json();
        setWishlist(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token, setWishlist]);

  // If not logged in
  if (!token) {
    return (
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{
          padding: '12px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-secondary)'
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '350px' }}>
          Please register or log in to your account to save games to a personal wishlist and track prices.
        </p>
        <button onClick={onOpenLogin} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', marginTop: '0.5rem' }}>
          Login / Register
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
        <Heart size={24} color="var(--accent)" fill="var(--accent)" />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>My Wishlist</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
        Your personal library of PC games you intend to play or track deals for.
      </p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
          <Loader className="animate-spin" size={32} color="var(--accent)" style={{ animation: 'spin 1.5s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading saved games...</span>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <p style={{ color: '#ef4444' }}>⚠️ Error: {error}</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="glass-panel animate-fade-in" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <HeartCrack size={40} color="var(--text-secondary)" />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', lineHeight: '1.5' }}>
            You haven't added any games to your wishlist yet. Take the quiz or search our catalog to find exciting titles!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button onClick={() => onTabChange('quiz')} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              Take Quiz
            </button>
            <button onClick={() => onTabChange('explore')} className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', gap: '4px' }}>
              Explore Games <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-cards">
          {wishlist.map(game => (
            <GameCard
              key={game.id}
              game={game}
              isWishlist={true} // all games inside here are wishlisted
              onWishlistToggle={onWishlistToggle}
              token={token}
              isPremium={isPremium}
              onUpgradeRequired={onUpgradeRequired}
            />
          ))}
        </div>
      )}

    </div>
  );
}
