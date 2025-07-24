import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>Carbnb</h1>
          </Link>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Where do you want to go?" 
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        
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