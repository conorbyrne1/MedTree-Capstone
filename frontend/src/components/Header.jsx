import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout, user, isOfficeAuthenticated, logoutOffice, office } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOfficeLogout = () => {
    logoutOffice();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to={isAuthenticated ? '/home' : '/'} className="logo">
          <img src="../images/MedTreeLogoRound.png" alt={"logo"} width={100} height={100} />
          <h1>MedTree</h1>
        </Link>
        
        <nav className="nav">
          <Link 
            to={isAuthenticated ? '/home' : '/'} 
            className={`nav-link ${location.pathname === '/' || location.pathname === '/home' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>

          {isOfficeAuthenticated ? (
              <button onClick={handleOfficeLogout} className="logout-btn">
                Sign Out
              </button>
          ) : isAuthenticated ? (
              <div className="account-section">
                <Link
                    to="/account"
                    className={`nav-link account-link ${location.pathname === '/account' ? 'active' : ''}`}
                >
                  <svg className="account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Account
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
          ) : (
              <Link to="/login" className="nav-link login-link">
                Login
              </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
