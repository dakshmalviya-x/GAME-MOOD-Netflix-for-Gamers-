import React, { useEffect, useState } from 'react';
import GameCard from './GameCard';
import { Flame, Sparkles, ChevronRight, AlertCircle, Loader } from 'lucide-react';

export default function TrendingDashboard({ onStartQuiz, wishlist, onWishlistToggle, token, isPremium, onUpgradeRequired }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/games/trending');
        if (!response.ok) {
          throw new Error('Failed to load trending games from server.');
        }
        const data = await response.json();
        setGames(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Hero Showcase Panel */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(var(--accent-secondary-rgb), 0.05) 100%)',
        padding: '3rem 2.5rem',
        borderRadius: 'var(--card-radius)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow behind hero */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(var(--accent-rgb), 0.15)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />

        <span className="badge badge-vibe" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} />
          FIND YOUR PERFECT VIBE
        </span>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: '650px',
          margin: 0
        }}>
          What PC Game should you play next?
        </h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          lineHeight: 1.5,
          maxWidth: '550px',
          margin: 0
        }}>
          Tell us about your current energy level, how much time you have, and your preferred gaming vibe. We'll suggest games tailored perfectly to your mood!
        </p>

        <button 
          onClick={onStartQuiz}
          className="btn btn-primary"
          style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem', gap: '8px', marginTop: '0.5rem' }}
        >
          Take Mood Quiz
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Trending Games Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <Flame size={24} color="var(--accent)" fill="var(--accent)" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Trending PC Games</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Check out what the gaming community is playing right now.
        </p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <Loader className="animate-spin" size={36} color="var(--accent)" style={{ animation: 'spin 1.5s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading trending database...</span>
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Failed to Load Catalog</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          </div>
        ) : (
          <div className="grid-cards">
            {games.map(game => (
              <GameCard 
                key={game.id} 
                game={game}
                isWishlist={wishlist.some(w => w.id === game.id)}
                onWishlistToggle={onWishlistToggle}
                token={token}
                isPremium={isPremium}
                onUpgradeRequired={onUpgradeRequired}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
