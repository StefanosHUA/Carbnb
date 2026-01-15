import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Hide search bar on login and register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/register-car';
  const isHomePage = location.pathname === '/';

  // Function to load user from localStorage
  const loadUser = () => {
    const savedUser = localStorage.getItem('carbnb_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Check if user is logged in on mount and when location changes
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // Listen for storage changes (when login/register updates localStorage)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'carbnb_user' || e.key === 'carbnb_token') {
        loadUser();
      }
    };

    // Listen for storage events (works across tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (for same-tab updates)
    window.addEventListener('userUpdated', loadUser);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('carbnb_user');
    localStorage.removeItem('carbnb_token');
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className={`header ${isHomePage ? 'header-home' : 'header-other'}`}>
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>Carbnb</h1>
          </Link>
        </div>
        
        
        <div className="header-right">
          {user ? (
            <>
              <span className="welcome-message">
                Welcome, <span className="username">{user.username || user.first_name}</span>
              </span>
              <Link to="/register-car" className="register-car-btn">
                Register Your Car
              </Link>
              <div 
                className="user-menu-container"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="user-menu">
                  <div className="user-icon-wrapper">
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="dropdown-user-details">
                          <span className="dropdown-username">{user.username || user.email || 'User'}</span>
                          {user.email && (
                            <span className="dropdown-email">{user.email.length > 20 ? `${user.email.substring(0, 20)}...` : user.email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" state={{ tab: 'profile' }} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <i className="fas fa-user"></i>
                      My Profile
                    </Link>
                    <Link to="/owner/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <i className="fas fa-car"></i>
                      Owner Dashboard
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <i className="fas fa-shield-alt"></i>
                        Admin Panel
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/register-car" className="register-car-btn">
                Register Your Car
              </Link>
              <Link to="/login" className="login-btn">
                Log in
              </Link>
              <Link to="/register" className="signup-btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 