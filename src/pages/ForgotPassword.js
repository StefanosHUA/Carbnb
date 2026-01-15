import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToastContext } from '../context/ToastContext';
import { authAPI } from '../utils/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent! Please check your inbox.');
      setStep('reset');
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.message || 'Failed to send reset email. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters long' });
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(token, newPassword);
      toast.success('Password reset successfully! You can now log in with your new password.');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.message || 'Failed to reset password. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h1>{step === 'request' ? 'Forgot Password' : 'Reset Password'}</h1>
          <p className="subtitle">
            {step === 'request'
              ? 'Enter your email address and we\'ll send you a link to reset your password.'
              : 'Enter the token from your email and your new password.'}
          </p>

          {errors.general && (
            <div className="error-message general-error" style={{ marginBottom: '24px' }}>
              {errors.general}
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <button type="submit" className="primary-btn forgot-password-btn" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="token">Reset Token</label>
                <input
                  type="text"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter token from email"
                  required
                  className={errors.token ? 'error' : ''}
                />
                {errors.token && (
                  <span className="error-text">{errors.token}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength="8"
                    className={errors.newPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    <i className={showPasswords.new ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="error-text">{errors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength="8"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    <i className={showPasswords.confirm ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>

              <button type="submit" className="primary-btn forgot-password-btn" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="form-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

