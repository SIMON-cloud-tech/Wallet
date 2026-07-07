import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useSEO } from '../../../hooks/useSEO';
import LogoVideo from '../../../assets/logo.mp4';
import '../css/Auth.css';

const Auth = ({ setUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  
  useSEO({
    title: isLogin ? 'Login' : 'Sign Up',
    description: isLogin ? 'Secure login to your Simoncees FinTech account.' : 'Create your Simoncees FinTech account and start managing your finances today.',
    keywords: isLogin ? 'fintech login, account access, secure authentication' : 'fintech signup, create account, financial management',
    robots: 'index, follow',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (err) {
      setMessage('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      {/* Left Branding */}
      <div className="auth-left">
        <div className="logo-container">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="logo-video"
          >
            <source src={LogoVideo} type="video/mp4" />
          </video>
        </div>
        <h1>FintechApp</h1>
        <p>Manage your finances, track allocations, and grow your savings all in one place.</p>
      </div>

      {/* Right Form */}
      <div className="auth-right">
        <div className="auth-form">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <span 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {message && (
              <p className={`auth-message ${message.includes('successful') || message.includes('created') ? 'success' : 'error'}`}>
                {message}
              </p>
            )}

            {isLogin && (
              <p className="forgot-password" onClick={() => navigate('/reset')}>
                Forgot Password?
              </p>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="auth-toggle">
            {isLogin ? (
              <>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign up</span></>
            ) : (
              <>Already signed in? <span onClick={() => setIsLogin(true)}>Log in</span></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;