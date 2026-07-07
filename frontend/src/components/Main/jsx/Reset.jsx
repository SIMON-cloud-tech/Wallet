import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../../../hooks/useSEO';
import '../css/Reset.css';

const Reset = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: 'Reset Password',
    description: 'Reset your Simoncees FinTech account password securely.',
    keywords: 'password reset, account recovery, security',
    robots: 'noindex, follow',
  });
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const inputRefs = useRef([]);

  // Step 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('/api/reset/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('OTP sent to your email');
        setStep(2);
      } else {
        setStatus(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setStatus('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP Input
  const handleOtpChange = async (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify when all 6 digits entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      setStatus('Verifying...');
      setLoading(true);

      try {
        const res = await fetch('/api/reset/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: newOtp.join('') })
        });
        const data = await res.json();

        if (res.ok) {
          setStatus('Verification done');
          setTimeout(() => {
            setStatus('');
            setStep(3);
          }, 1500);
        } else {
          setStatus(data.message || 'Invalid OTP');
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } catch (err) {
        setStatus('Network error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Step 3: Save new password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      setStatus('Passwords do not match');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('/api/reset/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.join(''),
          newPassword: passwords.new
        })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('Password reset successful! Redirecting...');
        setTimeout(() => navigate('/auth'), 2000);
      } else {
        setStatus(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setStatus('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset">
      <div className="reset-card">
        <p className="reset-title">Reset your password here</p>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className="otp-section">
            <p>Enter 6-digit code</p>
            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="otp-box"
                  disabled={loading}
                />
              ))}
            </div>
            {status && (
              <p className={`otp-status ${status === 'Verification done' || status.includes('sent') || status.includes('successful') ? 'done' : ''}`}>
                {status}
              </p>
            )}
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="password-section">
            <input
              type="password"
              placeholder="Enter new password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
            />
            {status && (
              <p className={`otp-status ${status.includes('successful') ? 'done' : ''}`}>
                {status}
              </p>
            )}
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Reset;