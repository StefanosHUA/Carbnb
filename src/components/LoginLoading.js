import React from 'react';
import './LoginLoading.css';

function LoginLoading({ message = 'Logging you in...' }) {
  return (
    <div className="login-loading-overlay">
      <div className="login-loading-container">
        <div className="car-loader">
          <div className="car-body">
            <i className="fas fa-car"></i>
          </div>
          <div className="wheel wheel-left">
            <div className="wheel-inner"></div>
          </div>
          <div className="wheel wheel-right">
            <div className="wheel-inner"></div>
          </div>
        </div>
        <div className="loading-message">{message}</div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default LoginLoading;

