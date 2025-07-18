import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
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
          <Link to="/login" className="login-btn">
            Log in
          </Link>
          <Link to="/register" className="signup-btn">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header; 