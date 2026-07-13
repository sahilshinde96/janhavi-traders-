import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const from = location.state?.from?.pathname || '/';

  const [loginType, setLoginType] = useState('email');
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  if (isAuthenticated) return null;

  // Google Sign-In callback stale closure workaround (BUG-10 fix).
  // Because the Google client library initializes once and holds a reference to the callback,
  // any updates to component state or props (like the 'from' redirect path) would not be captured.
  // Using a mutable useRef allows us to always retrieve the latest callback reference inside the callback wrapper.
  const googleCallbackRef = useRef(null);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/', { credential: response.credential });
      
      // Escape Google's third-party callback context to ensure React Router navigates correctly
      setTimeout(() => {
        login(data.user, data.access, data.refresh);
        toast.success(data.is_new_user ? 'Welcome to BLUSHH! 🎉' : 'Welcome back! 👋');
        navigate(data.user.is_staff ? '/admin' : from, { replace: true });
        setLoading(false);
      }, 100);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  // Keep the ref updated with the latest handler callback on every render.
  googleCallbackRef.current = handleGoogleCredentialResponse;

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!googleClientId) {
      return;
    }

    const initGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          // Instead of passing the stale function direct reference, we pass a wrapper that calls the latest ref.
          callback: (response) => googleCallbackRef.current(response),
        });
        
        const btnContainer = document.getElementById('google-signin-button');
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      } else {
        setTimeout(initGoogleSignIn, 100);
      }
    };

    if (step === 1) {
      initGoogleSignIn();
    }
  }, [step]);

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const handleSendOTP = async () => {
    if (!identifier.trim()) { toast.error(`Please enter your ${loginType === 'email' ? 'email address' : 'phone number'}`); return; }
    setLoading(true);
    try {
      await api.post('/auth/send-otp/', { identifier: identifier.trim(), type: loginType });
      toast.success(`OTP sent to ${identifier}`);
      setStep(2);
      startCountdown();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPInput = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      // Auto-verify
      setTimeout(() => handleVerify(newOtp.join('')), 100);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async (code = otp.join('')) => {
    if (code.length < 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp/', { identifier: identifier.trim(), type: loginType, code });
      login(data.user, data.access, data.refresh);
      toast.success(data.is_new_user ? 'Welcome to BLUSHH! 🎉' : 'Welcome back! 👋');
      navigate(data.user.is_staff ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="text-center mb-32 flex-col flex align-center">
          <img src={logo} alt="BLUSHH Logo" style={{ height: 80, width: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700,
            color: 'var(--color-primary)', marginBottom: 4, margin: 0
          }}>BLUSHH</h1>
          <p className="text-medium fs-sm mt-4">Your premium beauty destination</p>
        </div>

        {step === 1 ? (
          <>
            <h2 className="fw-700" style={{ fontSize: '1.3rem', marginBottom: 6 }}>Sign In / Register</h2>
            <p className="text-medium fs-sm mb-24">
              Enter your email or phone. New users will be registered automatically!
            </p>

            {/* Type toggle */}
            <div className="auth-tabs">
              {[
                { type: 'email', icon: Mail, label: 'Email' }, 
                { type: 'phone', icon: Phone, label: 'SMS' }
              ].map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => {
                  setLoginType(type);
                  setIdentifier('');
                }}
                  className={`auth-tab${loginType === type ? ' auth-tab--active' : ''}`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">
                {loginType === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                className="input"
                type={loginType === 'email' ? 'email' : 'tel'}
                placeholder={loginType === 'email' ? 'you@example.com' : '+91 98765 43210'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                autoFocus
              />
            </div>

            <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginTop: 8 }}
              onClick={handleSendOTP} disabled={loading}>
              {loading ? '⏳ Sending...' : <><span>Send OTP</span> <ArrowRight size={18} /></>}
            </button>

            {/* Google Sign-in section */}
            <div className="flex align-center gap-12" style={{ margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span className="fs-xs text-light fw-600">OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <div id="google-signin-button" style={{ width: '100%', minHeight: 40, display: 'flex', justifyContent: 'center' }}></div>
          </>
        ) : (
          <>
            <div className="flex align-center gap-8 mb-24">
              <button onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-medium)', padding: 0 }}>
                ←
              </button>
              <div>
                <h2 className="fw-700" style={{ fontSize: '1.2rem', marginBottom: 2 }}>Enter OTP</h2>
                <p className="text-medium" style={{ fontSize: '0.8rem' }}>
                  Sent to <strong>{identifier}</strong>
                </p>
              </div>
            </div>

            {/* 6-box OTP input */}
            <div className="flex gap-10" style={{ justifyContent: 'center', marginBottom: 28 }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={e => handleOTPInput(e.target.value, idx)}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  style={{
                    width: 52, height: 56, textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
                    border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 10, outline: 'none', transition: 'border-color 0.2s',
                  }}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginBottom: 16 }}
              onClick={() => handleVerify()} disabled={loading || otp.join('').length < 6}>
              {loading ? '⏳ Verifying...' : 'Verify & Login'}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-medium fs-sm">
                  Resend OTP in <strong>{countdown}s</strong>
                </p>
              ) : (
                <button onClick={handleSendOTP} disabled={loading} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto',
                }}>
                  <RefreshCw size={14} /> Resend OTP
                </button>
              )}
            </div>

            <div className="text-center" style={{ marginTop: 28, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
                Powered by
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#FFFFFF',
                background: '#000000',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.75px',
                fontFamily: 'Inter, sans-serif'
              }}>
                BLACKSMS
              </span>
            </div>
          </>
        )}

        <p className="text-center text-primary fw-600 mt-24" style={{ fontSize: '0.825rem' }}>
          Don't have an account? Just enter your details above to sign up instantly!
        </p>
        <p className="text-center text-light mt-12" style={{ fontSize: '0.7rem' }}>
          By signing in, you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}
