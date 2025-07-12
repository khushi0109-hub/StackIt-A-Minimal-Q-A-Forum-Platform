import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <h1 className="logo-text">StackIt</h1>
            <span className="logo-subtitle">Q&A Forum</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search questions, tags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
            
            {isAuthenticated() ? (
              <>
                <Link to="/ask" className={`nav-link ${location.pathname === '/ask' ? 'active' : ''}`}>
                  Ask Question
                </Link>
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                  Dashboard
                </Link>
                
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* User Menu */}
                <div className="user-menu">
                  <div className="user-info">
                    <img 
                      src={user?.avatar || '/default-avatar.png'} 
                      alt={user?.name || 'User'}
                      className="user-avatar"
                    />
                    <span className="user-name">{user?.name}</span>
                  </div>
                  
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-link">
                      Profile
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" className="dropdown-link">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-link logout-btn">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                  Login
                </Link>
                <Link to="/register" className={`nav-link register-btn ${location.pathname === '/register' ? 'active' : ''}`}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
              Home
            </Link>
            
            {isAuthenticated() ? (
              <>
                <Link to="/ask" className="mobile-nav-link" onClick={closeMenu}>
                  Ask Question
                </Link>
                <Link to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                  Profile
                </Link>
                
                {isAdmin() && (
                  <Link to="/admin" className="mobile-nav-link" onClick={closeMenu}>
                    Admin Panel
                  </Link>
                )}
                
                <div className="mobile-user-info">
                  <img 
                    src={user?.avatar || '/default-avatar.png'} 
                    alt={user?.name || 'User'}
                    className="mobile-user-avatar"
                  />
                  <span className="mobile-user-name">{user?.name}</span>
                </div>
                
                <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="mobile-nav-link register-btn" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isMenuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;