import React, { useState, useEffect } from 'react';
import { apiUrl } from './api';
import Navbar from './components/Navbar';
import TrendingDashboard from './components/TrendingDashboard';
import ExploreSection from './components/ExploreSection';
import QuizContainer from './components/QuizContainer';
import WishlistPanel from './components/WishlistPanel';
import AuthModals from './components/AuthModals';
import PaymentModal from './components/PaymentModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('gamemood_token') || null);
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('gamemood_theme') || 'default');
  
  const [authOpen, setAuthOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  // Sync token parsing to load user object
  useEffect(() => {
    if (token) {
      localStorage.setItem('gamemood_token', token);
      
      // Parse payload to get user
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          username: payload.username,
          isPremium: payload.isPremium
        });
      } catch (err) {
        console.error('Failed to parse token payload:', err);
        handleLogout();
      }
    } else {
      localStorage.removeItem('gamemood_token');
      setUser(null);
      setWishlist([]);
    }
  }, [token]);

  // Load wishlist if logged in on start
  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(apiUrl('/api/wishlist'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error('Error auto-syncing wishlist:', err);
    }
  };

  // Sync theme changes to body class list
  useEffect(() => {
    // Remove all theme classes first
    document.body.classList.remove('theme-cyberpunk', 'theme-matrix', 'theme-crimson');
    
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }
    
    localStorage.setItem('gamemood_theme', theme);
  }, [theme]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setWishlist([]);
    setActiveTab('home');
  };

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setAuthOpen(false);
  };

  const handlePaymentSuccess = (updatedToken, updatedUser) => {
    setToken(updatedToken);
    setUser(updatedUser);
    setPremiumOpen(false);
  };

  // Wishlist dynamic trigger handler
  const handleWishlistToggle = async (game, isWishlisted) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(apiUrl(`/api/wishlist/${game.id}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setWishlist(prev => prev.filter(w => w.id !== game.id));
        } else {
          const errData = await response.json();
          alert(errData.error || 'Failed to remove from wishlist.');
        }
      } else {
        // Add to wishlist
        const response = await fetch(apiUrl('/api/wishlist'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ game })
        });

        if (response.ok) {
          const addedData = await response.json();
          setWishlist(prev => [...prev, addedData.game]);
        } else {
          const errData = await response.json();
          alert(errData.error || 'Failed to add to wishlist.');
        }
      }
    } catch (err) {
      console.error('Wishlist toggle request error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar Header */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        user={user}
        token={token}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthOpen(true)}
        onOpenPremium={() => setPremiumOpen(true)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

      {/* Main Page Content Body Router */}
      <main className="main-content">
        {activeTab === 'home' && (
          <TrendingDashboard
            onStartQuiz={() => setActiveTab('quiz')}
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            token={token}
            isPremium={user?.isPremium || false}
            onUpgradeRequired={() => token ? setPremiumOpen(true) : setAuthOpen(true)}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreSection
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            token={token}
            isPremium={user?.isPremium || false}
            onUpgradeRequired={() => token ? setPremiumOpen(true) : setAuthOpen(true)}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizContainer
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            token={token}
            isPremium={user?.isPremium || false}
            onUpgradeRequired={() => token ? setPremiumOpen(true) : setAuthOpen(true)}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistPanel
            wishlist={wishlist}
            setWishlist={setWishlist}
            onWishlistToggle={handleWishlistToggle}
            token={token}
            onOpenLogin={() => setAuthOpen(true)}
            isPremium={user?.isPremium || false}
            onUpgradeRequired={() => setPremiumOpen(true)}
            onTabChange={setActiveTab}
          />
        )}
      </main>

      {/* Modal Dialog Portals */}
      <AuthModals 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

      <PaymentModal 
        isOpen={premiumOpen} 
        onClose={() => setPremiumOpen(false)}
        token={token}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Dynamic footer details */}
      <footer style={{
        marginTop: 'auto',
        padding: '2rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <p>© 2026 GameMood Platform. Personalized Recommendations for Gamers.</p>
        <p style={{ marginTop: '4px', fontSize: '0.75rem', opacity: 0.8 }}>Powered by CheapShark API & RAWG DB Engine</p>
      </footer>
    </div>
  );
}
