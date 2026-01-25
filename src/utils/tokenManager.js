/**
 * Token Manager
 * Handles automatic token refresh and session management
 */

import { isUserActive } from './userActivity';

let refreshTimer = null;
let tokenExpiryTime = null;

/**
 * Parse JWT token to get expiration time
 */
const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[TokenManager] Error parsing JWT:', error);
    return null;
  }
};

/**
 * Get token expiration time in milliseconds
 */
const getTokenExpiry = (token) => {
  if (!token) return null;
  
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return null;
  
  // exp is in seconds, convert to milliseconds
  return payload.exp * 1000;
};

/**
 * Check if token is expired or will expire soon
 */
export const isTokenExpiringSoon = (token, bufferMinutes = 5) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true; // If we can't determine expiry, assume it's expiring
  
  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;
  
  return expiry - now < bufferMs;
};

/**
 * Refresh the access token
 */
const refreshAccessToken = async () => {
  const token = localStorage.getItem('carbnb_token');
  const userData = localStorage.getItem('carbnb_user');
  
  if (!token || !userData) {
    console.log('[TokenManager] No token or user data found, skipping refresh');
    stopAutoRefresh();
    return false;
  }

  // Check if user is still active
  if (!isUserActive()) {
    console.log('[TokenManager] User inactive, logging out instead of refreshing');
    logout();
    return false;
  }

  try {
    console.log('[TokenManager] Attempting to refresh token...');
    const response = await fetch('http://localhost:8002/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access_token) {
        console.log('[TokenManager] Token refreshed successfully');
        localStorage.setItem('carbnb_token', data.access_token);
        
        // Schedule next refresh
        scheduleTokenRefresh(data.access_token);
        return true;
      }
    } else {
      console.error('[TokenManager] Token refresh failed with status:', response.status);
      // If refresh fails, log the user out
      logout();
      return false;
    }
  } catch (error) {
    console.error('[TokenManager] Token refresh error:', error);
    logout();
    return false;
  }
};

/**
 * Logout user and clear all session data
 */
const logout = () => {
  console.log('[TokenManager] Logging out user due to token expiration');
  
  // Clear all auth data
  localStorage.removeItem('carbnb_token');
  localStorage.removeItem('carbnb_user');
  
  // Stop refresh timer
  stopAutoRefresh();
  
  // Redirect to login page with message
  window.location.href = '/login?reason=session_expired';
};

/**
 * Schedule automatic token refresh
 */
const scheduleTokenRefresh = (token) => {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  if (!token) {
    token = localStorage.getItem('carbnb_token');
  }

  if (!token) {
    console.log('[TokenManager] No token available for scheduling refresh');
    return;
  }

  const expiry = getTokenExpiry(token);
  if (!expiry) {
    console.warn('[TokenManager] Could not determine token expiry, will not schedule refresh');
    return;
  }

  tokenExpiryTime = expiry;
  const now = Date.now();
  const timeUntilExpiry = expiry - now;
  
  // Refresh 5 minutes before expiry, or immediately if less than 5 minutes remaining
  const refreshBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
  const timeUntilRefresh = Math.max(timeUntilExpiry - refreshBuffer, 0);

  console.log('[TokenManager] Token expires at:', new Date(expiry).toISOString());
  console.log('[TokenManager] Scheduling refresh in:', Math.round(timeUntilRefresh / 1000), 'seconds');

  if (timeUntilRefresh <= 0) {
    // Token is already expired or expiring very soon, refresh immediately
    refreshAccessToken();
  } else {
    refreshTimer = setTimeout(() => {
      refreshAccessToken();
    }, timeUntilRefresh);
  }
};

/**
 * Stop automatic token refresh
 */
export const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  tokenExpiryTime = null;
  console.log('[TokenManager] Auto-refresh stopped');
};

/**
 * Start automatic token refresh
 */
export const startAutoRefresh = () => {
  const token = localStorage.getItem('carbnb_token');
  
  if (!token) {
    console.log('[TokenManager] No token found, cannot start auto-refresh');
    return;
  }

  // Check if token is already expired
  if (isTokenExpiringSoon(token, 0)) {
    console.log('[TokenManager] Token is expired, attempting immediate refresh');
    refreshAccessToken();
  } else {
    scheduleTokenRefresh(token);
  }
};

/**
 * Initialize token manager
 * Call this when the app starts
 */
export const initTokenManager = () => {
  console.log('[TokenManager] Initializing...');
  
  // Check if user is logged in
  const token = localStorage.getItem('carbnb_token');
  const userData = localStorage.getItem('carbnb_user');
  
  if (token && userData) {
    console.log('[TokenManager] User session found, starting auto-refresh');
    startAutoRefresh();
  } else {
    console.log('[TokenManager] No active session found');
  }
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
  });
}

