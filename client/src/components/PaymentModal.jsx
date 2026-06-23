import React, { useState } from 'react';
import { CreditCard, QrCode, Sparkles, X, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, token, onPaymentSuccess }) {
  const [payMethod, setPayMethod] = useState('card'); // 'card' or 'upi'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [error, setError] = useState(null);
  const [progressMsg, setProgressMsg] = useState('');

  if (!isOpen) return null;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPaymentStep('processing');
    
    // Simulate payment gateway loading
    try {
      setProgressMsg('Connecting to secure payment gateway...');
      await new Promise(r => setTimeout(r, 800));
      
      setProgressMsg('Authorizing transaction of ₹500...');
      await new Promise(r => setTimeout(r, 800));
      
      setProgressMsg('Finalizing premium account enrollment...');
      await new Promise(r => setTimeout(r, 600));

      // Make backend API request to upgrade profile
      const response = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentDetails: {
            method: payMethod,
            amount: 500,
            transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete premium upgrade on server.');
      }

      setPaymentStep('success');
      // Pass the updated token/user details back up
      setTimeout(() => {
        onPaymentSuccess(data.token, data.user);
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
      setPaymentStep('form');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content animate-fade-in" style={{ maxWidth: '480px', border: '1px solid var(--accent)' }}>
        {paymentStep !== 'processing' && (
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        )}

        {/* Phase 1: Form Filling */}
        {paymentStep === 'form' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-premium" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                ⭐ UNLOCK ELITE LEVEL
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Upgrade to Premium</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Join for ₹500 and unlock deal analytics & custom styles.
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
                ⚠️ Payment failed: {error}
              </div>
            )}

            {/* Premium Perks Check */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid var(--glass-border)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Premium Features Unlocked:</p>
              <div style={{ display: 'flex', gap: '8px' }}>🚀 <span><strong>Steam Deal Tracker</strong>: Instant cheapest game store lookup via CheapShark.</span></div>
              <div style={{ display: 'flex', gap: '8px' }}>🎨 <span><strong>Dynamic UI Themes</strong>: Cyberpunk Amber, Matrix Green, Crimson Sith styles.</span></div>
              <div style={{ display: 'flex', gap: '8px' }}>🔥 <span><strong>Priority Quiz Algorithm</strong>: Refined filters for perfect recommendations.</span></div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                className={`btn ${payMethod === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexGrow: 1, padding: '0.5rem 1rem', gap: '8px', fontSize: '0.9rem' }}
              >
                <CreditCard size={16} /> Credit/Debit
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('upi')}
                className={`btn ${payMethod === 'upi' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexGrow: 1, padding: '0.5rem 1rem', gap: '8px', fontSize: '0.9rem' }}
              >
                <QrCode size={16} /> UPI / QR
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              {payMethod === 'card' ? (
                <div>
                  <div className="input-group">
                    <label className="input-label">Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                      className="form-input" 
                      placeholder="4111 2222 3333 4444" 
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-group" style={{ flexGrow: 2 }}>
                      <label className="input-label">Expiry (MM/YY)</label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value.substring(0, 5))}
                        className="form-input" 
                        placeholder="12/28" 
                        required 
                      />
                    </div>
                    <div className="input-group" style={{ flexGrow: 1 }}>
                      <label className="input-label">CVV</label>
                      <input 
                        type="password" 
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        className="form-input" 
                        placeholder="***" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                  {/* Mock QR Code */}
                  <div style={{
                    background: '#ffffff',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Generates a simple SVG grid resembling a QR code */}
                    <svg width="120" height="120" viewBox="0 0 20 20" style={{ shapeRendering: 'crispedges' }}>
                      <path d="M0 0h6v6H0zm14 0h6v6h-6zM0 14h6v6H0zm8 8h4v4H8z" fill="#000"/>
                      <path d="M2 2h2v2H2zm14 0h2v2h-2zm-14 14h2v2H2z" fill="#fff"/>
                      <path d="M7 2h2v1H7zm4 1h1v1h-1zm1 4h2v1h-2zm3 2h1v3h-1zm-4 4h2v1h-2zm-3 2h2v1H7zm11-1h1v2h-1z" fill="#000"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Scan QR with BHIM, Google Pay, PhonePe, or enter UPI ID below:
                  </p>
                  
                  <div className="input-group" style={{ width: '100%' }}>
                    <label className="input-label">UPI ID</label>
                    <input 
                      type="text" 
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="form-input" 
                      placeholder="e.g. gamer@ybl" 
                      required={payMethod === 'upi'} 
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '1.25rem', fontSize: '1rem' }}
              >
                Pay Securely ₹500
              </button>
            </form>
          </div>
        )}

        {/* Phase 2: Processing Payment */}
        {paymentStep === 'processing' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <Loader2 size={48} className="animate-spin" color="var(--accent)" style={{ animation: 'spin 1.5s linear infinite' }} />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Securing Transaction</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{progressMsg}</p>
            </div>
          </div>
        )}

        {/* Phase 3: Payment Success */}
        {paymentStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '12px',
              borderRadius: '50%',
              border: '2px solid #10b981',
              color: '#10b981',
              display: 'inline-flex',
              marginBottom: '1rem',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>Upgrade Complete!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Thank you! Your account has successfully transitioned to **Premium**. Unlocking elite dashboards...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
