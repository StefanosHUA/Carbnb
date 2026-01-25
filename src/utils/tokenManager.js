/**
 * Token Manager
 * Handles automatic token refresh and session management
 * Best practices:
 * - Validates tokens before API requests
 * - Automatic refresh before expiration
 * - Handles inactive user sessions
 * - Secure token storage and cleanup
 */

import { isUserActive } from './userActivity';

let refreshTimer = null;
let tokenExpiryTime = null;
let isRefreshing = false;
let refreshSubscribers = [];

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
 * Check if token is completely expired (past expiration time)
 */
export const isTokenExpired = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  
  return Date.now() >= expiry;
};

/**
 * Validate token exists and is not expired
 * @returns {boolean} True if token is valid, false otherwise
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('carbnb_token');
  if (!token) return false;
  
  return !isTokenExpired(token);
};

/**
 * Add subscriber to be notified when token refresh completes
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers when token refresh completes
 */
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * Refresh the access token
 * Prevents concurrent refresh requests using a promise queue
 */
const refreshAccessToken = async () => {
  // If already refreshing, wait for that refresh to complete
  if (isRefreshing) {
    console.log('[TokenManager] Refresh already in progress, waiting...');
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(!!token);
      });
    });
  }

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

  isRefreshing = true;

  try {
    console.log('[TokenManager] Attempting to refresh token...');
    const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8002';
    const response = await fetch(`${USER_SERVICE_URL}/api/v1/auth/refresh-token`, {
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
        
        // Notify all waiting requests
        onTokenRefreshed(data.access_token);
        
        // Schedule next refresh
        scheduleTokenRefresh(data.access_token);
        isRefreshing = false;
        return true;
      }
    } else {
      console.error('[TokenManager] Token refresh failed with status:', response.status);
      // If refresh fails, log the user out
      isRefreshing = false;
      onTokenRefreshed(null);
      logout();
      return false;
    }
  } catch (error) {
    console.error('[TokenManager] Token refresh error:', error);
    isRefreshing = false;
    onTokenRefreshed(null);
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
    // Check if token is valid and not expired
    const expiry = getTokenExpiry(token);
    const now = Date.now();
    
    if (expiry && expiry > now) {
      // Token is still valid, start auto-refresh
      console.log('[TokenManager] User session found with valid token, starting auto-refresh');
      startAutoRefresh();
    } else {
      // Token is expired, clear it out
      console.log('[TokenManager] Token is expired, clearing session');
      localStorage.removeItem('carbnb_token');
      localStorage.removeItem('carbnb_user');
    }
  } else {
    console.log('[TokenManager] No active session found');
  }
};

/**
 * Ensure token is valid before making an API request
 * Automatically refreshes if token is expiring soon
 * @returns {Promise<boolean>} True if token is valid, false otherwise
 */
export const ensureValidToken = async () => {
  const token = localStorage.getItem('carbnb_token');
  
  if (!token) {
    console.log('[TokenManager] No token found');
    return false;
  }
  
  // Check if token is completely expired
  if (isTokenExpired(token)) {
    console.log('[TokenManager] Token is expired, attempting refresh');
    return await refreshAccessToken();
  }
  
  // Check if token is expiring soon
  if (isTokenExpiringSoon(token, 5)) {
    console.log('[TokenManager] Token expiring soon, refreshing proactively');
    return await refreshAccessToken();
  }
  
  // Token is valid
  return true;
};

/**
 * Get current token if valid, otherwise refresh and return new token
 * @returns {Promise<string|null>} Valid token or null
 */
export const getValidToken = async () => {
  const isValid = await ensureValidToken();
  if (!isValid) {
    return null;
  }
  return localStorage.getItem('carbnb_token');
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
  });
}

