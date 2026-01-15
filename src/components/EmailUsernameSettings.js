import React, { useState } from 'react';
import { useToastContext } from '../context/ToastContext';
import { authAPI } from '../utils/api';

function EmailUsernameSettings({ user, onUpdate }) {
  const toast = useToastContext();
  const [activeSection, setActiveSection] = useState(null); // 'email' or 'username'
  const [formData, setFormData] = useState({
    new_email: '',
    new_username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const updatedUser = await authAPI.updateEmail(
        formData.new_email,
        formData.password || null
      );
      toast.success('Email updated successfully!');
      setActiveSection(null);
      setFormData({ new_email: '', new_username: '', password: '' });
      if (onUpdate) {
        onUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Email update error:', error);
      const errorMessage = error.message || 'Failed to update email. Please try again.';
      setErrors({ email: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const updatedUser = await authAPI.updateUsername(
        formData.new_username,
        formData.password || null
      );
      toast.success('Username updated successfully!');
      setActiveSection(null);
      setFormData({ new_email: '', new_username: '', password: '' });
      if (onUpdate) {
        onUpdate(updatedUser);
      }
    } catch (error) {
      console.error('Username update error:', error);
      const errorMessage = error.message || 'Failed to update username. Please try again.';
      setErrors({ username: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="email-username-settings">
      <h2>Account Information</h2>
      <p className="section-description">Update your email address or username</p>

      <div className="account-info-section">
        <div className="info-item">
          <div className="info-label">
            <label>Email Address</label>
            <span className="current-value">{user?.email || 'Not set'}</span>
          </div>
          {activeSection !== 'email' ? (
            <button
              className="secondary-btn"
              onClick={() => setActiveSection('email')}
            >
              Change Email
            </button>
          ) : (
            <form onSubmit={handleEmailUpdate} className="update-form">
              <div className="form-group">
                <label htmlFor="new_email">New Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="new_email"
                    name="new_email"
                    value={formData.new_email}
                    onChange={handleChange}
                    placeholder="Enter new email address"
                    className={errors.email ? 'error' : ''}
                    required
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>
              </div>
              {user?.auth_provider === 'password' && (
                <div className="form-group">
                  <label htmlFor="email_password">Current Password</label>
                  <div className="input-wrapper">
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="email_password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setActiveSection(null);
                    setFormData({ new_email: '', new_username: '', password: '' });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn update-btn" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Email'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="info-item">
          <div className="info-label">
            <label>Username</label>
            <span className="current-value">{user?.username || 'Not set'}</span>
          </div>
          {activeSection !== 'username' ? (
            <button
              className="secondary-btn"
              onClick={() => setActiveSection('username')}
            >
              Change Username
            </button>
          ) : (
            <form onSubmit={handleUsernameUpdate} className="update-form">
              <div className="form-group">
                <label htmlFor="new_username">New Username</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="new_username"
                    name="new_username"
                    value={formData.new_username}
                    onChange={handleChange}
                    placeholder="Enter new username"
                    className={errors.username ? 'error' : ''}
                    required
                    minLength="3"
                    maxLength="30"
                  />
                  {errors.username && (
                    <span className="error-text">{errors.username}</span>
                  )}
                  <small className="form-hint">3-30 characters, letters, numbers, underscores, and hyphens only</small>
                </div>
              </div>
              {user?.auth_provider === 'password' && (
                <div className="form-group">
                  <label htmlFor="username_password">Current Password</label>
                  <div className="input-wrapper">
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="username_password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setActiveSection(null);
                    setFormData({ new_email: '', new_username: '', password: '' });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn update-btn" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Username'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailUsernameSettings;

