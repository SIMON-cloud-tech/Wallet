import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../../../hooks/useSEO';
import Allocations from '../../Sidebaritems/jsx/Allocations.jsx';
import Analytics from '../../Sidebaritems/jsx/Analytics.jsx';
import Revenue from '../../Sidebaritems/jsx/Revenue.jsx';
import Settings from '../../Sidebaritems/jsx/Settings.jsx';   
import Vault from '../../Sidebaritems/jsx/Vault.jsx';

import {
  FiBarChart2, FiPieChart, FiDollarSign, FiSettings,
  FiLogOut, FiChevronLeft, FiChevronRight, FiSun, FiMoon,
  FiBell, FiX, FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiDatabase,
  FiMenu // <-- ADDED
} from 'react-icons/fi';
import '../css/Dashboard.css';

const MENU_ICONS = {
  analytics: FiBarChart2,
  allocations: FiPieChart,
  revenue: FiDollarSign,
  settings: FiSettings,
  vault: FiDatabase,
};

const NOTIFICATION_ICONS = {
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  error: FiXCircle,
  info: FiInfo,
};

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  
  useSEO({
    title: 'Dashboard',
    description: 'Manage your finances, track transactions, and analyze revenue with Simoncees FinTech dashboard.',
    keywords: 'financial dashboard, transaction tracking, revenue analytics',
    robots: 'noindex, follow',
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('analytics');
  const [showNotifications, setShowNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cards, setCards] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const menuItems = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'allocations', label: 'Allocations' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'settings', label: 'Settings' },
    { id: 'vault', label: 'Vault' },
  ];

  // Fetch dashboard data from backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token); 

    const fetchDashboard = async () => {
      try {
        const cardsRes = await fetch('/api/transactions/recent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const cardsData = await cardsRes.json();

        const notifRes = await fetch('/api/transactions/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const notifData = await notifRes.json();

        const profileRes = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        setCards(cardsData.transactions || []);
        console.log('cards data', cardsData.transactions);
        setNotifications(notifData.notifications || []);
        setProfile(profileData);
        setStats(cardsData.stats || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return;
    
    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setProfile(data))
    .catch(err => console.error(err));
  }, [activeMenuItem]);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTimeAgo = (timestamp) => {
    const diffMs = Date.now() - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth');
  };

  const renderContentPanel = () => {
    switch (activeMenuItem) {
      case 'analytics':
        return <Analytics key={activeMenuItem + Date.now()} />;
      case 'allocations':
        return <Allocations key={activeMenuItem + Date.now()} />;
      case 'revenue':
        return <Revenue key={activeMenuItem + Date.now()}/>;
      case 'settings':
        return <Settings key={activeMenuItem + Date.now()}/>;
      case 'vault':
        return <Vault key={activeMenuItem + Date.now()} />;
      default:
        return <p>Section not found</p>;
    }
  };

  if (loading) return <div className="dashboard-status"><p>Loading dashboard...</p></div>;
  if (error) return <div className="dashboard-status"><p>⚠️ {error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

  const activeLabel = menuItems.find((item) => item.id === activeMenuItem)?.label || 'Analytics';

  return (
    <div className={`dashboard ${theme}`}>
      
      {/* HAMBURGER BUTTON - visible on mobile */}
      <button 
        className="mobile-hamburger" 
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
      >
        <FiMenu size={20} />
      </button>

      {/* SIDEBAR OVERLAY - for mobile */}
      <div 
        className={`sidebar-overlay ${mobileSidebarOpen ? 'visible' : ''}`} 
        onClick={closeMobileSidebar}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Wallet</h2>
        </div>

        <nav>
          {menuItems.map((item) => {
            const Icon = MENU_ICONS[item.id] || FiSettings;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${activeMenuItem === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenuItem(item.id);
                  closeMobileSidebar();
                }}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="sidebar-icon"><Icon size={18} /></span>
                {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="sidebar-icon"><FiLogOut size={18} /></span>
            {!sidebarCollapsed && <span className="sidebar-label">Logout</span>}
          </button>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <span className="sidebar-icon">
              {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
            </span>
            {!sidebarCollapsed && (
              <span className="sidebar-label">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        
        {/* TOP SECTION - Cards + Profile */}
        <section className="dashboard-row">
          <div className="cards-grid">
            {cards.slice(0, 4).map((txn) => (
              <div key={txn._id} className="card">
                <h3 className="card-title">KSH. {txn.amount?.toLocaleString()}</h3>
                <p className="card-sender">{txn.senderPhone}</p>
                <p className="card-mpesa">{txn.mpesaCode}</p>
              </div>
            ))}
          </div>

          <div className="profile">
            <img 
              src={profile?.avatar || 'https://ui-avatars.com/api/?name=User&background=95a5a6&color=fff&size=128'} 
              alt={profile?.fullName} 
            />
            <h4>{profile?.fullName}</h4>
            <button onClick={handleLogout}>Log out</button>
          </div>
        </section>

        {/* MIDDLE SECTION - Content + Notifications */}
        <section className="dashboard-row">
          <div className="content-panel">
            <h3>{activeLabel}</h3>
            {renderContentPanel()}
          </div>

          {showNotifications ? (
            <div className="notifications-panel">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <button onClick={() => setShowNotifications(false)} aria-label="Hide notifications">
                  <FiX />
                </button>
              </div>
              {notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                <>
                  {(expandedNotifications ? notifications : notifications.slice(0, 5)).map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type] || FiInfo;
                    return (
                      <div key={notification.id} className={`notification-item ${notification.type}`}>
                        <span><Icon /></span>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">{getTimeAgo(notification.timestamp)}</span>
                        </div>
                        <button onClick={() => clearNotification(notification.id)} aria-label="Dismiss">×</button>
                      </div>
                    );
                  })}

                  {notifications.length > 4 && (
                    <p className="show-more-link" onClick={() => setExpandedNotifications(!expandedNotifications)}>
                      {expandedNotifications ? 'Show less' : 'Show more (' + (notifications.length - 4) + ' more)'}
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <button className="notifications-toggle" onClick={() => setShowNotifications(true)} aria-label="Show notifications">
              <FiBell />
            </button>
          )}
        </section>

        <footer className="dashboard-footer">
          <p>© 2024 Prestige Web Room Depository Wallet. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;