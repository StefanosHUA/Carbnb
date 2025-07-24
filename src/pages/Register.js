import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sanitizeFormData, validateUrl } from '../utils/security';
import { 
  initializeGoogleAuth, 
  handleGoogleSignIn, 
  createUserFromGoogle, 
  validateGoogleUser 
} from '../utils/googleAuth';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    
    // Basic validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    }
    
    // Validate profile picture URL if provided
    if (formData.profile_picture && !validateUrl(formData.profile_picture)) {
      newErrors.profile_picture = 'Please enter a valid URL';
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData)
      });
      
      if (response.ok) {
        // Registration successful
        navigate('/login');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const googleData = await handleGoogleSignIn();
      const googleUser = googleData.user;
      
      // Validate Google user data
      const validation = validateGoogleUser(googleUser);
      if (!validation.isValid) {
        setErrors({ general: validation.errors.join(', ') });
        return;
      }
      
      // Create user data from Google profile
      const userData = createUserFromGoogle(googleUser);
      
      // Pre-fill form with Google data
      setFormData(prev => ({
        ...prev,
        ...userData
      }));
      
      // Show success message
      alert('Google authentication successful! Please complete your profile and submit.');
      
    } catch (error) {
      setErrors({ general: 'Google authentication failed. Please try again.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Sign up</h1>
          <p>Join Carbnb and start your journey</p>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First name</label>
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
              <label htmlFor="last_name">Last name</label>
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
            <label htmlFor="phone_number">Phone number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={errors.phone_number ? 'error' : ''}
              required
            />
            {errors.phone_number && (
              <span className="error-text">{errors.phone_number}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password">Confirm password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirm_password ? 'error' : ''}
                required
              />
              {errors.confirm_password && (
                <span className="error-text">{errors.confirm_password}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className={errors.address ? 'error' : ''}
              required
            />
            {errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                className={errors.city ? 'error' : ''}
                required
              />
              {errors.city && (
                <span className="error-text">{errors.city}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter your country"
                className={errors.country ? 'error' : ''}
                required
              />
              {errors.country && (
                <span className="error-text">{errors.country}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="postal_code">Postal code</label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="Enter your postal code"
              className={errors.postal_code ? 'error' : ''}
              required
            />
            {errors.postal_code && (
              <span className="error-text">{errors.postal_code}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="profile_picture">Profile picture URL</label>
            <input
              type="url"
              id="profile_picture"
              name="profile_picture"
              value={formData.profile_picture}
              onChange={handleChange}
              placeholder="Enter profile picture URL"
              className={errors.profile_picture ? 'error' : ''}
            />
            {errors.profile_picture && (
              <span className="error-text">{errors.profile_picture}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button 
            type="submit" 
            className={`register-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="social-login">
          <button 
            type="button"
            className={`social-btn google-btn ${googleLoading ? 'loading' : ''}`}
            onClick={handleGoogleSignIn}
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

        <div className="login-link">
          <p>
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register; 