import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  // Hide search bar on login and register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/register-car';
  const isHomePage = location.pathname === '/';

  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('carbnb_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('carbnb_user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className={`header ${isHomePage ? 'header-home' : 'header-other'}`}>
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>Carbnb</h1>
          </Link>
        </div>
        
        {!isAuthPage && (
          <div className="header-center">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Which car would you like to rent?" 
                className="search-input"
              />
              <button className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        )}
        
        <div className="header-right">
          <Link to="/register-car" className="register-car-btn">
            Register Your Car
          </Link>
          
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <img 
                  src={user.profile_picture || '/default-avatar.png'} 
                  alt={user.first_name}
                  className="user-avatar"
                />
                <span className="user-name">{user.first_name}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <>
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