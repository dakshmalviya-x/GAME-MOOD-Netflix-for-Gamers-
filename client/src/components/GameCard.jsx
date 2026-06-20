import React, { useState } from 'react';
import { Heart, Star, ExternalLink, Lock, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';

export default function GameCard({ game, isWishlist, onWishlistToggle, token, isPremium, onUpgradeRequired }) {
  const [deals, setDeals] = useState([]);
  const [showDeals, setShowDeals] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [dealsError, setDealsError] = useState(null);

  const handleFetchDeals = async () => {
    if (!token) return;
    if (!isPremium) {
      onUpgradeRequired();
      return;
    }

    if (showDeals) {
      setShowDeals(false);
      return;
    }

    setLoadingDeals(true);
    setDealsError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/deals?steamAppId=${game.steamAppId}&title=${encodeURIComponent(game.title)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch deals');
      }

      const data = await response.json();
      setDeals(data);
      setShowDeals(true);
    } catch (err) {
      console.error(err);
      setDealsError(err.message || 'Deals are currently unavailable.');
      setShowDeals(true);
    } finally {
      setLoadingDeals(false);
    }
  };

  return (
    <div className="glass-panel game-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Game Image Banner */}
      <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
        <img
          src={game.thumbnail}
          alt={game.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {game.fitPercentage && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} color="var(--accent)" />
            {game.fitPercentage}% Match
          </div>
        )}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#cbd5e1'
        }}>
          {game.releaseYear}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{game.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
            <Star size={14} fill="#fbbf24" />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{game.rating}</span>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 'semibold', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          {game.genre}
        </p>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.25rem', flexGrow: 1 }}>
          {game.description}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {token ? (
              <button
                onClick={() => onWishlistToggle(game, isWishlist)}
                className="btn btn-secondary"
                style={{ flexGrow: 1, padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                <Heart size={16} fill={isWishlist ? 'var(--accent)' : 'none'} color={isWishlist ? 'var(--accent)' : 'currentColor'} />
                {isWishlist ? 'Wishlisted' : 'Wishlist'}
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-disabled"
                style={{ flexGrow: 1, padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                title="Login to add to Wishlist"
                onClick={onUpgradeRequired} // triggers login notice
              >
                <Heart size={16} /> Wishlist
              </button>
            )}

            <button
              onClick={handleFetchDeals}
              className={`btn ${isPremium ? 'btn-accent' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
              disabled={loadingDeals}
            >
              {loadingDeals ? 'Loading...' : (isPremium ? 'View Deals' : '🛒 Deals')}
              {!isPremium && <Lock size={12} style={{ marginLeft: '4px', opacity: 0.7 }} />}
            </button>
          </div>

          {/* Deals Drawer/Section */}
          {showDeals && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem',
              border: '1px solid var(--glass-border)',
              marginTop: '0.5rem',
              animation: 'fadeIn 0.2s ease'
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShoppingCart size={12} color="var(--accent-secondary)" /> Best Deals Found:
              </h4>

              {dealsError ? (
                <p style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {dealsError}
                </p>
              ) : deals.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No active discounts found at retailers.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {deals.map((deal, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '4px 6px',
                      borderRadius: '4px'
                    }}>
                      <span>{deal.storeName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>${deal.salePrice}</span>
                        {deal.savingsPercent > 0 && (
                          <span style={{
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.7rem',
                            padding: '1px 4px',
                            borderRadius: '3px'
                          }}>-{deal.savingsPercent}%</span>
                        )}
                        <a href={deal.dealLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-secondary)' }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
