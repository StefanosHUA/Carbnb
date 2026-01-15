import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sanitizeFormData, validateUrl } from '../utils/security';
import { useToastContext } from '../context/ToastContext';
import { 
  initializeGoogleAuth, 
  handleGoogleSignIn, 
  createUserFromGoogle, 
  validateGoogleUser 
} from '../utils/googleAuth';
import { authAPI } from '../utils/api';
import LoginLoading from '../components/LoginLoading';

function Register() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    profile_picture: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize Google Auth on component mount
  useEffect(() => {
    console.log('Initializing Google Auth...');
    initializeGoogleAuth();
    
    // Check if Google API loaded after a delay
    setTimeout(() => {
      if (window.google && window.google.accounts) {
        console.log('Google API loaded successfully');
      } else {
        console.log('Google API not loaded yet');
      }
    }, 2000);
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

  // Validate Step 1: Account Info
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2: Personal Info
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = 'Please enter a valid phone number (e.g., +1234567890)';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 3: Location Info (all optional)
  const validateStep3 = () => {
    const newErrors = {};
    
    // All fields are optional in step 3, but validate format if provided
    if (formData.profile_picture && !validateUrl(formData.profile_picture)) {
      newErrors.profile_picture = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Clear errors when going back
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps before submitting
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      // Go to the first step with errors
      if (!validateStep1()) {
        setCurrentStep(1);
      } else if (!validateStep2()) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Map form data to backend schema
      // Backend supports: email, username, password, first_name, last_name, phone_number
      // Optional: bio, address, city, country, postal_code, profile_picture
      const registrationData = {
        email: formData.email.trim(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim()
      };
      
      // Add optional fields if provided
      if (formData.bio.trim()) {
        registrationData.bio = formData.bio.trim();
      }
      if (formData.address.trim()) {
        registrationData.address = formData.address.trim();
      }
      if (formData.city.trim()) {
        registrationData.city = formData.city.trim();
      }
      if (formData.country.trim()) {
        registrationData.country = formData.country.trim();
      }
      if (formData.postal_code.trim()) {
        registrationData.postal_code = formData.postal_code.trim();
      }
      if (formData.profile_picture.trim()) {
        registrationData.profile_picture = formData.profile_picture.trim();
      }
      
      // Call API service
      const response = await authAPI.register(registrationData);
      
      // Store token and user data if provided
      if (response.access_token) {
        localStorage.setItem('carbnb_token', response.access_token);
        if (response.user) {
          localStorage.setItem('carbnb_user', JSON.stringify({
            ...response.user,
            token: response.access_token
          }));
          // Dispatch custom event to notify Header component
          window.dispatchEvent(new Event('userUpdated'));
        }
      }
      
      // Registration successful
      toast.success('Registration successful! Welcome to Carbnb!');
      // Keep loading visible during navigation
      setTimeout(() => {
        navigate('/cars');
        // Loading will naturally disappear when component unmounts after navigation
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false); // Only stop loading on error
      let errorMessage = 'Registration failed. Please try again.';
      
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
    setErrors({});
    
    try {
      // Get Google access token
      const googleData = await handleGoogleSignIn();
      
      if (!googleData || !googleData.access_token) {
        throw new Error('Failed to get Google access token. Please try again.');
      }
      
      // Call Google OAuth API - backend expects access_token
      // Backend will fetch user info from Google and create/login user
      const response = await authAPI.registerGoogle({
        access_token: googleData.access_token,
        id_token: googleData.id_token || null
      });
      
      // Store user data and token from backend response
      if (response.access_token) {
        localStorage.setItem('carbnb_token', response.access_token);
        if (response.user) {
          localStorage.setItem('carbnb_user', JSON.stringify({
            ...response.user,
            token: response.access_token
          }));
          // Dispatch custom event to notify Header component
          window.dispatchEvent(new Event('userUpdated'));
        }
        
        toast.success('Google registration successful! Welcome to Carbnb!');
        // Keep loading visible during navigation
        setTimeout(() => {
          navigate('/cars');
          // Loading will naturally disappear when component unmounts after navigation
        }, 2000);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setGoogleLoading(false); // Only stop loading on error
      const errorMessage = error.data?.detail || error.message || 'Google authentication failed. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Render Step 1: Account Info
  const renderStep1 = () => (
    <>
      <div className="form-group">
        <label htmlFor="username">Username *</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username"
          className={errors.username ? 'error' : ''}
          required
        />
        {errors.username && (
          <span className="error-text">{errors.username}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
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
        <div className="form-group">
          <label htmlFor="confirm_password">Confirm Password *</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirm_password ? 'error' : ''}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>
          {errors.confirm_password && (
            <span className="error-text">{errors.confirm_password}</span>
          )}
        </div>
      </div>
    </>
  );

  // Render Step 2: Personal Info
  const renderStep2 = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Enter your first name"
            className={errors.first_name ? 'error' : ''}
            required
          />
          {errors.first_name && (
            <span className="error-text">{errors.first_name}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name *</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Enter your last name"
            className={errors.last_name ? 'error' : ''}
            required
          />
          {errors.last_name && (
            <span className="error-text">{errors.last_name}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone_number">Phone Number *</label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="+1234567890"
          className={errors.phone_number ? 'error' : ''}
          required
        />
        {errors.phone_number && (
          <span className="error-text">{errors.phone_number}</span>
        )}
        <small className="form-hint">Include country code (e.g., +1 for USA)</small>
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio (Optional)</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          className={errors.bio ? 'error' : ''}
          rows="4"
          maxLength="500"
        />
        {errors.bio && (
          <span className="error-text">{errors.bio}</span>
        )}
        <small className="form-hint">{formData.bio.length}/500 characters</small>
      </div>
    </>
  );

  // Render Step 3: Location Info
  const renderStep3 = () => (
    <>
      <div className="form-group">
        <label htmlFor="address">Address (Optional)</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your address"
          className={errors.address ? 'error' : ''}
        />
        {errors.address && (
          <span className="error-text">{errors.address}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City (Optional)</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            className={errors.city ? 'error' : ''}
          />
          {errors.city && (
            <span className="error-text">{errors.city}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="country">Country (Optional)</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter your country"
            className={errors.country ? 'error' : ''}
          />
          {errors.country && (
            <span className="error-text">{errors.country}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="postal_code">Postal Code (Optional)</label>
        <input
          type="text"
          id="postal_code"
          name="postal_code"
          value={formData.postal_code}
          onChange={handleChange}
          placeholder="Enter your postal code"
          className={errors.postal_code ? 'error' : ''}
        />
        {errors.postal_code && (
          <span className="error-text">{errors.postal_code}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="profile_picture">Profile Picture URL (Optional)</label>
        <input
          type="url"
          id="profile_picture"
          name="profile_picture"
          value={formData.profile_picture}
          onChange={handleChange}
          placeholder="https://example.com/photo.jpg"
          className={errors.profile_picture ? 'error' : ''}
        />
        {errors.profile_picture && (
          <span className="error-text">{errors.profile_picture}</span>
        )}
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input type="checkbox" required />
          <span>I agree to the Terms of Service and Privacy Policy *</span>
        </label>
      </div>
    </>
  );

  return (
    <>
      {(isLoading || googleLoading) && (
        <LoginLoading 
          message={googleLoading ? 'Connecting with Google...' : 'Creating your account...'} 
        />
      )}
      <div 
        className="register-page" 
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
          className="register-container" 
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
        <div className="register-header">
          <h1>Sign up</h1>
          <p>Join Carbnb and start your journey</p>
        </div>

        {/* Progress Bar */}
        <div className="register-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="progress-icon">
              {currentStep > 1 ? <i className="fas fa-check"></i> : <i className="fas fa-user"></i>}
            </div>
            <span className="progress-label">Account</span>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="progress-icon">
              {currentStep > 2 ? <i className="fas fa-check"></i> : <i className="fas fa-id-card"></i>}
            </div>
            <span className="progress-label">Personal</span>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="progress-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <span className="progress-label">Location</span>
          </div>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="nav-btn back-btn"
                onClick={handleBack}
                disabled={isLoading}
              >
                <i className="fas fa-arrow-left"></i> Back
              </button>
            )}
            {currentStep < 3 ? (
              <button 
                type="button" 
                className="nav-btn next-btn"
                onClick={handleNext}
                disabled={isLoading}
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button 
                type="submit" 
                className={`nav-btn submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>
            )}
          </div>
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

        <div className="login-link">
          <p>
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Register;
