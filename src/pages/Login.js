import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sanitizeFormData } from '../utils/security';
import { useToastContext } from '../context/ToastContext';
import { 
  initializeGoogleAuth, 
  handleGoogleSignIn, 
  createUserFromGoogle 
} from '../utils/googleAuth';
import { authAPI } from '../utils/api';
import { startAutoRefresh } from '../utils/tokenManager';
import LoginLoading from '../components/LoginLoading';

function Login() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize Google Auth on component mount
  useEffect(() => {
    initializeGoogleAuth();
    
    // Check if user was redirected due to session expiration
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    if (reason === 'session_expired') {
      toast.warning('Your session has expired. Please log in again.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/login');
    }
  }, [toast]);

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
      // Backend expects: login (email or username) and password
      const loginData = {
        login: formData.email.trim(),
        password: formData.password
      };
      
      console.log('[Login] Attempting login with:', { login: loginData.login, passwordLength: loginData.password.length });
      
      // Call API service
      const response = await authAPI.login(loginData);
      
      console.log('[Login] Login response received:', response);
      
      // Validate response structure
      if (!response || !response.access_token) {
        throw new Error('Invalid response from server. Missing access token.');
      }
      
      // Store user data and token
      localStorage.setItem('carbnb_token', response.access_token);
      if (response.user) {
        localStorage.setItem('carbnb_user', JSON.stringify({
          ...response.user,
          token: response.access_token
        }));
        // Dispatch custom event to notify Header component
        window.dispatchEvent(new Event('userUpdated'));
      } else {
        console.warn('Login response missing user data:', response);
      }
      
      // Start automatic token refresh
      startAutoRefresh();
      
      toast.success('Login successful! Welcome back.');
      // Clear loading state and navigate immediately
      setIsLoading(false);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false); // Only stop loading on error
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.status === 0) {
        // Network error - backend not reachable
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8002.';
      } else if (error.message) {
        // error.message is already extracted as string by handleResponse
        errorMessage = error.message;
      } else if (error.data?.detail) {
        // Fallback: handle detail if it's still an object/array
        if (typeof error.data.detail === 'string') {
          errorMessage = error.data.detail;
        } else if (Array.isArray(error.data.detail)) {
          errorMessage = error.data.detail.map(e => e.msg || String(e)).join(', ');
        } else {
          errorMessage = JSON.stringify(error.data.detail);
        }
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleGoogleSignInClick = async () => {
      setGoogleLoading(true);
    
    try {
      console.log('[Login] Starting Google sign-in...');
      const googleData = await handleGoogleSignIn();
      const googleUser = googleData.user;
      
      console.log('[Login] Google sign-in successful, user:', googleUser.email);
      
      // Create user data from Google profile
      const userData = createUserFromGoogle(googleUser);
      
      // Call Google OAuth API - backend expects access_token
      // The backend will use this to verify with Google and get user info
      const googleLoginPayload = {
        access_token: googleData.access_token
      };
      
      console.log('[Login] Calling backend Google login API with access_token:', googleData.access_token ? 'present' : 'missing');
      console.log('[Login] Full payload:', { ...googleLoginPayload, access_token: googleLoginPayload.access_token ? '***' + googleLoginPayload.access_token.slice(-10) : 'missing' });
      
      const response = await authAPI.loginGoogle(googleLoginPayload);
      console.log('[Login] Google login response received:', response);
      
      // Validate response structure
      if (!response || (!response.access_token && !response.token)) {
        throw new Error('Invalid response from server. Missing access token.');
      }
      
      const accessToken = response.access_token || response.token;
      
      // Store user data and token
      localStorage.setItem('carbnb_token', accessToken);
      if (response.user) {
        const userDataWithToken = {
          ...response.user,
          token: accessToken
        };
        localStorage.setItem('carbnb_user', JSON.stringify(userDataWithToken));
        // Dispatch custom event to notify Header component
        window.dispatchEvent(new Event('userUpdated'));
      } else {
        console.warn('Google login response missing user data:', response);
        // Fallback: store the user data we created from Google
        localStorage.setItem('carbnb_user', JSON.stringify({
          ...userData,
          token: accessToken
        }));
        window.dispatchEvent(new Event('userUpdated'));
      }
      
      // Start automatic token refresh
      startAutoRefresh();
      
      toast.success('Google login successful! Welcome to Carbnb.');
      // Clear loading state and navigate immediately
      setGoogleLoading(false);
      navigate('/');
      
    } catch (error) {
      console.error('Google login error:', error);
      // Show user-friendly error message
      setGoogleLoading(false); // Only stop loading on error
      let errorMessage = 'Google authentication failed. Please try again.';
      
      if (error.status === 0) {
        // Network error - backend not reachable
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8002.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.detail) {
        if (typeof error.data.detail === 'string') {
          errorMessage = error.data.detail;
        } else if (Array.isArray(error.data.detail)) {
          errorMessage = error.data.detail.map(e => e.msg || String(e)).join(', ');
        } else {
          errorMessage = JSON.stringify(error.data.detail);
        }
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
      
      // Clear the error after 5 seconds to allow retry
      setTimeout(() => {
        setErrors({});
      }, 5000);
    }
  };

  return (
    <>
      {(isLoading || googleLoading) && (
        <LoginLoading 
          message={googleLoading ? 'Connecting with Google...' : 'Logging you in...'} 
        />
      )}
      <div 
        className="login-page" 
        onMouseDown={(e) => {
          // Track where mouse was pressed
          if (e.target === e.currentTarget) {
            // Pressed on background
            e.currentTarget._mouseDown = { 
              x: e.clientX, 
              y: e.clientY,
              target: e.target,
              currentTarget: e.currentTarget,
              pressedOnContent: false
            };
            e.currentTarget._isDragging = false;
          } else {
            // Pressed on content - don't close even if released outside
            e.currentTarget._mouseDown = {
              x: e.clientX,
              y: e.clientY,
              target: e.target,
              currentTarget: e.currentTarget,
              pressedOnContent: true
            };
            e.currentTarget._isDragging = false;
          }
        }}
        onMouseMove={(e) => {
          if (e.currentTarget._mouseDown) {
            const deltaX = Math.abs(e.clientX - e.currentTarget._mouseDown.x);
            const deltaY = Math.abs(e.clientY - e.currentTarget._mouseDown.y);
            if (deltaX > 5 || deltaY > 5) {
              e.currentTarget._isDragging = true;
            }
          }
        }}
        onMouseUp={(e) => {
          // Reset on mouse up
          if (e.currentTarget._mouseDown) {
            e.currentTarget._mouseDown = null;
            e.currentTarget._isDragging = false;
          }
        }}
        onClick={(e) => {
          // Only close if:
          // 1. Clicking directly on the page background
          // 2. Mouse was pressed on background (not on content)
          // 3. Not dragging
          if (
            e.target === e.currentTarget && 
            e.currentTarget._mouseDown &&
            e.currentTarget._mouseDown.target === e.currentTarget._mouseDown.currentTarget &&
            !e.currentTarget._mouseDown.pressedOnContent &&
            !e.currentTarget._isDragging
          ) {
            handleClose();
          }
          // Reset
          e.currentTarget._mouseDown = null;
          e.currentTarget._isDragging = false;
        }}
      >
        <div 
          className="login-container" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => {
            // Track that mouse was pressed on content
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement._mouseDown = {
                x: e.clientX,
                y: e.clientY,
                target: e.target,
                currentTarget: e.currentTarget.parentElement,
                pressedOnContent: true
              };
              e.currentTarget.parentElement._isDragging = false;
            }
          }}
        >
        <button className="close-btn" onClick={handleClose} aria-label="Close" title="Close">
          <i className="fas fa-times"></i>
        </button>
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
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              Remember me
              <input type="checkbox" />
              <span className="checkmark"></span>
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
        </div>

        <div className="signup-link">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Login; 