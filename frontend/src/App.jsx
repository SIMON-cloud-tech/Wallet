import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SEOInit from './components/SEOInit';
import { trackCoreWebVitals, trackPageLoadTime } from './utils/performanceMonitoring';
import Auth from './components/Main/jsx/Auth';
import Dashboard from './components/Main/jsx/Dashboard';
import Reset from './components/Main/jsx/Reset';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize SEO and performance tracking
  useEffect(() => {
    trackCoreWebVitals();
    trackPageLoadTime();
  }, []);

  // Verify user token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token by calling a protected endpoint
      fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            setUser({ token });
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="app-loading">Loading...</div>;

  return (
    <>
      <SEOInit />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/dashboard" element={user ? <Dashboard setUser={setUser} /> : <Navigate to="/auth" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;