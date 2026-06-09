import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import logo from '../assets/logo.jpg';

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

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/', { credential: response.credential });
      login(data.user, data.access, data.refresh);
      toast.success(data.is_new_user ? 'Welcome to Janhavi Traders! 🎉' : 'Welcome back! 👋');
      navigate(data.user.is_staff ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!googleClientId) {
      return;
    }

    const initGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
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
      toast.success(data.is_new_user ? 'Welcome to Janhavi Traders! 🎉' : 'Welcome back! 👋');
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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B3D 50%, #4A1942 100%)',
      padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: 40, width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        animation: 'scaleIn 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={logo} alt="Janhavi Traders Logo" style={{ height: 64, width: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700,
            color: 'var(--color-primary)', marginBottom: 4, margin: 0
          }}>JANHAVI<span style={{ color: 'var(--color-dark)' }}> TRADERS</span></h1>
          <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem', marginTop: 4 }}>Your premium beauty destination</p>
        </div>

        {step === 1 ? (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 6 }}>Sign In / Register</h2>
            <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem', marginBottom: 24 }}>
              Enter your email or phone. New users will be registered automatically!
            </p>

            {/* Type toggle */}
            <div style={{ display: 'flex', background: 'var(--color-bg)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
              {[{ type: 'email', icon: Mail, label: 'Email' }, { type: 'phone', icon: Phone, label: 'Phone' }].map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => setLoginType(type)} style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: loginType === type ? 'white' : 'transparent',
                  boxShadow: loginType === type ? 'var(--shadow-sm)' : 'none',
                  color: loginType === type ? 'var(--color-primary)' : 'var(--color-text-medium)',
                  fontWeight: loginType === type ? 700 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: '0.875rem', transition: 'all 0.2s',
                }}>
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

            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={handleSendOTP} disabled={loading}>
              {loading ? '⏳ Sending...' : <><span>Send OTP</span> <ArrowRight size={18} /></>}
            </button>

            {/* Google Sign-in section */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 500 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <div id="google-signin-button" style={{ width: '100%', minHeight: 40, display: 'flex', justifyContent: 'center' }}></div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <button onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-medium)', padding: 0 }}>
                ←
              </button>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 2 }}>Enter OTP</h2>
                <p style={{ color: 'var(--color-text-medium)', fontSize: '0.8rem' }}>
                  Sent to <strong>{identifier}</strong>
                </p>
              </div>
            </div>

            {/* 6-box OTP input */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
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

            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
              onClick={() => handleVerify()} disabled={loading || otp.join('').length < 6}>
              {loading ? '⏳ Verifying...' : 'Verify & Login'}
            </button>

            <div style={{ textAlign: 'center' }}>
              {countdown > 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-medium)' }}>
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
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 500, marginTop: 24 }}>
          Don't have an account? Just enter your details above to sign up instantly!
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: 12 }}>
          By signing in, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
