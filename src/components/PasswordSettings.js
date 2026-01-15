import React, { useState } from 'react';
import { useToastContext } from '../context/ToastContext';
import { authAPI } from '../utils/api';

function PasswordSettings() {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password = 'New password must be different from current password';
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
    setErrors({});

    try {
      await authAPI.changePassword(formData.current_password, formData.new_password);
      toast.success('Password changed successfully!');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.message || 'Failed to change password. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-settings">
      <h2>Change Password</h2>
      <p className="section-description">Update your password to keep your account secure</p>

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="current_password">Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="current_password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              className={errors.current_password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
            >
              <i className={showPasswords.current ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>
          {errors.current_password && (
            <span className="error-text">{errors.current_password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="new_password">New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter your new password"
              className={errors.new_password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
            >
              <i className={showPasswords.new ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>
          {errors.new_password && (
            <span className="error-text">{errors.new_password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm_password">Confirm New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className={errors.confirm_password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
            >
              <i className={showPasswords.confirm ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>
          {errors.confirm_password && (
            <span className="error-text">{errors.confirm_password}</span>
          )}
        </div>

        <button
          type="submit"
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default PasswordSettings;

