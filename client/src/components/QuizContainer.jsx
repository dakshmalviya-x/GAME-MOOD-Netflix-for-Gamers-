import React, { useState } from 'react';
import GameCard from './GameCard';
import { Sparkles, ArrowLeft, RefreshCw, Zap, Clock, Users, Smile, HelpCircle, Loader } from 'lucide-react';

export default function QuizContainer({ wishlist, onWishlistToggle, token, isPremium, onUpgradeRequired }) {
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState('');
  const [commitment, setCommitment] = useState('');
  const [playstyle, setPlaystyle] = useState('');
  const [vibe, setVibe] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stepsCount = 4;

  const handleNextStep = (value) => {
    if (step === 1) {
      setEnergy(value);
      setStep(2);
    } else if (step === 2) {
      setCommitment(value);
      setStep(3);
    } else if (step === 3) {
      setPlaystyle(value);
      setStep(4);
    } else if (step === 4) {
      setVibe(value);
      submitQuiz(energy, commitment, playstyle, value);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const submitQuiz = async (nrg, cmt, style, vb) => {
    setLoading(true);
    setError(null);
    setStep(5); // step 5 represents results loading/view

    try {
      const response = await fetch('http://localhost:5000/api/games/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          energy: nrg,
          commitment: cmt,
          playstyle: style,
          vibe: vb,
          isPremiumFilter: isPremium
        })
      });

      if (!response.ok) {
        throw new Error('Failed to compute game recommendation.');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEnergy('');
    setCommitment('');
    setPlaystyle('');
    setVibe('');
    setRecommendations([]);
    setStep(1);
  };

  const renderProgressBar = () => {
    if (step > stepsCount) return null;
    const percentage = ((step - 1) / stepsCount) * 100;
    return (
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '2rem' }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-secondary) 100%)',
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Quiz Progress & Headers */}
      {step <= stepsCount && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              Step {step} of {stepsCount}
            </span>
            {step > 1 && (
              <button 
                onClick={handlePrevStep} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>
          {renderProgressBar()}
        </div>
      )}

      {/* STEP 1: Energy Level */}
      {step === 1 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Zap size={40} color="var(--accent)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>How is your energy level right now?</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            <button onClick={() => handleNextStep('chill')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              🧘 Chill & Relaxed <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Sit back and coast</span>
            </button>
            <button onClick={() => handleNextStep('adrenaline')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              ⚡ High Adrenaline <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Intense, fast-paced action</span>
            </button>
            <button onClick={() => handleNextStep('intellectual')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              🧠 Brainy & Intellectual <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Puzzles, tactics & thinking</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Time Commitment */}
      {step === 2 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Clock size={40} color="var(--accent)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>How much time do you want to play for?</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            <button onClick={() => handleNextStep('short')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              ⏱️ Quick Session <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Under 30–45 mins</span>
            </button>
            <button onClick={() => handleNextStep('medium')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              ⏳ Average Session <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>1 to 2 hours</span>
            </button>
            <button onClick={() => handleNextStep('long')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              🌌 Deep Dive <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Massive, multi-hour campaign</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Playstyle */}
      {step === 3 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Users size={40} color="var(--accent)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Who are you gaming with?</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            <button onClick={() => handleNextStep('solo')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              👤 Just Me <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Immersion & solo campaigns</span>
            </button>
            <button onClick={() => handleNextStep('co-op')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              🤝 Cooperating <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Team up with friends</span>
            </button>
            <button onClick={() => handleNextStep('versus')} className="btn btn-secondary" style={{ padding: '1rem 1.5rem', justifyContent: 'flex-start', fontSize: '1.05rem' }}>
              ⚔️ Competitive <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>Battle against others</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Vibe */}
      {step === 4 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Smile size={40} color="var(--accent)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>What is the main vibe you want?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '560px', margin: '0 auto' }}>
            <button onClick={() => handleNextStep('cozy')} className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1rem' }}>🌻 Cozy & Warm</button>
            <button onClick={() => handleNextStep('action')} className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1rem' }}>💥 Action-Packed</button>
            <button onClick={() => handleNextStep('spooky')} className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1rem' }}>👻 Dark & Spooky</button>
            <button onClick={() => handleNextStep('brainy')} className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1rem' }}>🧩 Puzzle / Cerebral</button>
            <button onClick={() => handleNextStep('social')} className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1rem' }}>🗣️ Fun & Social</button>
            <button onClick={() => handleNextStep('epic')} className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1rem' }}>👑 Grand & Epic</button>
          </div>
        </div>
      )}

      {/* STEP 5: Results / Loading */}
      {step === 5 && (
        <div className="animate-fade-in">
          {loading ? (
            <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <Loader className="animate-spin" size={48} color="var(--accent)" style={{ animation: 'spin 1.5s linear infinite' }} />
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Calculating Perfect Recommendations</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Matching mood parameters to the gaming index...</p>
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ef4444', marginBottom: '1rem' }}>Recommendation Error</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={handleReset} className="btn btn-primary">Try Again</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={24} color="#fbbf24" fill="#fbbf24" /> Matches for Your Mood
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Here are the best games tailored to your selections.
                  </p>
                </div>
                <button onClick={handleReset} className="btn btn-secondary" style={{ gap: '6px', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  <RefreshCw size={14} /> Retake Quiz
                </button>
              </div>

              <div className="grid-cards">
                {recommendations.map(game => (
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
            </div>
          )}
        </div>
      )}

    </div>
  );
}
