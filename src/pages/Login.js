import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sanitizeFormData } from '../utils/security';
import { 
  initializeGoogleAuth, 
  handleGoogleSignIn, 
  createUserFromGoogle 
} from '../utils/googleAuth';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  // Initialize Google Auth on component mount
  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sanitize form data
      const sanitizedData = sanitizeFormData(formData);
      
      // Simulate API call with sanitized data
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData)
      });
      
      if (response.ok) {
        // Login successful
        navigate('/cars');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setGoogleLoading(true);
    
    try {
      const googleData = await handleGoogleSignIn();
      const googleUser = googleData.user;
      
      // Create user data from Google profile
      const userData = createUserFromGoogle(googleUser);
      
      // Simulate Google login API call
      const response = await fetch('/api/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_id: googleUser.id,
          email: googleUser.email,
          user_data: userData
        })
      });
      
      // For demo purposes, we'll simulate successful login
      // In a real app, you'd check the response from your backend
      localStorage.setItem('carbnb_user', JSON.stringify(userData));
      
      // Google login successful
      navigate('/cars');
      
    } catch (error) {
      // Show user-friendly error message
      const errorMessage = error.message || 'Google authentication failed. Please try again.';
      setErrors({ general: errorMessage });
      
      // Clear the error after 5 seconds to allow retry
      setTimeout(() => {
        setErrors({});
      }, 5000);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Log in</h1>
          <p>Welcome back</p>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="social-login">
          <button 
            type="button"
            className={`social-btn google-btn ${googleLoading ? 'loading' : ''}`}
            onClick={handleGoogleSignInClick}
            disabled={googleLoading}
          >
            <i className="fab fa-google"></i>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>
          <button className="social-btn facebook-btn" disabled>
            <i className="fab fa-facebook-f"></i>
            Continue with Facebook
          </button>
          <button className="social-btn apple-btn" disabled>
            <i className="fab fa-apple"></i>
            Continue with Apple
          </button>
        </div>

        <div className="signup-link">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; 