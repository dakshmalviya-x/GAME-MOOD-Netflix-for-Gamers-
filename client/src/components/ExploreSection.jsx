import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';
import { Search, Compass, Loader, Frown } from 'lucide-react';

export default function ExploreSection({ wishlist, onWishlistToggle, token, isPremium, onUpgradeRequired }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGenre, setActiveGenre] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const genres = [
    { id: '', name: 'All Games' },
    { id: 'RPG', name: 'RPG' },
    { id: 'Action', name: 'Action' },
    { id: 'Puzzle', name: 'Puzzle' },
    { id: 'Horror', name: 'Horror' },
    { id: 'Adventure', name: 'Adventure' },
    { id: 'Shooter', name: 'Shooter' },
    { id: 'Platformer', name: 'Platformer' }
  ];

  const fetchGames = async (search = '', genre = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = 'http://localhost:5000/api/games/explore';
      const params = [];
      if (search) params.push(`q=${encodeURIComponent(search)}`);
      if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to search games catalog');
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

  // Initial catalog load
  useEffect(() => {
    fetchGames(searchTerm, activeGenre);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGames(searchTerm, activeGenre);
  };

  const handleGenreToggle = (genreId) => {
    setActiveGenre(genreId);
    fetchGames(searchTerm, genreId);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
        <Compass size={24} color="var(--accent)" />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Explore Catalog</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
        Browse our full internal vault of PC games or search using keywords.
      </p>

      {/* Search & Genre Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, keywords or descriptions..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
            Search
          </button>
        </form>

        {/* Genre Pill Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginRight: '4px' }}>Genres:</span>
          {genres.map(g => (
            <button
              key={g.id}
              onClick={() => handleGenreToggle(g.id)}
              className={`btn`}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: '20px',
                background: activeGenre === g.id ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                border: activeGenre === g.id ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                color: activeGenre === g.id ? '#ffffff' : 'var(--text-primary)',
                transition: 'all 0.2s'
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

      </div>

      {/* Results grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
          <Loader className="animate-spin" size={32} color="var(--accent)" style={{ animation: 'spin 1.5s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Searching vault...</span>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <p style={{ color: '#ef4444' }}>⚠️ Failed to load catalog: {error}</p>
        </div>
      ) : games.length === 0 ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Frown size={40} color="var(--text-secondary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Games Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
            We couldn't find any games matching "{searchTerm}" {activeGenre ? `in the ${activeGenre} genre` : ''}. Try adjusting your keywords.
          </p>
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
  );
}
