import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { initializeGoogleAuth, handleGoogleSignIn, createUserFromGoogle } from '../utils/googleAuth';

function Header() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Initialize Google Auth on component mount
  useEffect(() => {
    initializeGoogleAuth();
    
    // Check if user is logged in (you can implement your own auth logic here)
    const savedUser = localStorage.getItem('carbnb_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    try {
      const googleData = await handleGoogleSignIn();
      const googleUser = googleData.user;
      
      // Create user data from Google profile
      const userData = createUserFromGoogle(googleUser);
      
      // Save user data to localStorage (in a real app, you'd save to your backend)
      localStorage.setItem('carbnb_user', JSON.stringify(userData));
      setUser(userData);
      
      // Navigate to cars page or dashboard
      navigate('/cars');
      
    } catch (error) {
      console.error('Google authentication failed:', error);
      alert('Google authentication failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
              <button 
                onClick={handleGoogleSignIn}
                className={`google-signin-btn ${isGoogleLoading ? 'loading' : ''}`}
                disabled={isGoogleLoading}
              >
                <i className="fab fa-google"></i>
                {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
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