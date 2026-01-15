// Google Authentication utilities

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';
// Use environment variable if set, otherwise use current origin
// For production, make sure REACT_APP_GOOGLE_REDIRECT_URI is set in Netlify environment variables
const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

/**
 * Initialize Google OAuth
 */
export const initializeGoogleAuth = () => {
  // Load Google API script if not already loaded
  if (!window.google) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
};

/**
 * Get Google OAuth configuration
 */
export const getGoogleConfig = () => ({
  client_id: GOOGLE_CLIENT_ID,
  scope: 'email profile',
  redirect_uri: GOOGLE_REDIRECT_URI,
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent'
});

/**
 * Handle Google Sign In
 * @returns {Promise<Object>} - Google user data
 */
export const handleGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google API not loaded. Please refresh the page and try again.'));
      return;
    }

    // Check if Google Client ID is configured
    if (GOOGLE_CLIENT_ID === 'your-google-client-id' || !GOOGLE_CLIENT_ID) {
      reject(new Error('Google OAuth is not configured yet. Please contact the development team.'));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response) => {
        if (response.error) {
          // Handle specific OAuth errors
          if (response.error === 'popup_closed_by_user') {
            reject(new Error('Sign-in was cancelled. You can try again.'));
          } else if (response.error === 'access_denied') {
            reject(new Error('Access was denied. Please try again or contact support.'));
          } else if (response.error === 'invalid_client') {
            reject(new Error('Google OAuth is not configured yet. Please contact the development team.'));
          } else {
            reject(new Error(`Google sign-in failed: ${response.error}. Please try again.`));
          }
          return;
        }

        try {
          // Get user info using the access token
          const userInfo = await getUserInfo(response.access_token);
          resolve({
            access_token: response.access_token,
            user: userInfo
          });
        } catch (error) {
          reject(new Error('Failed to get user information. Please try again.'));
        }
      }
    });

    client.requestAccessToken();
  });
};

/**
 * Get user information from Google
 * @param {string} accessToken - Google access token
 * @returns {Promise<Object>} - User information
 */
export const getUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to get user information from Google');
  }
};

/**
 * Create user data from Google profile
 * @param {Object} googleUser - Google user data
 * @returns {Object} - Formatted user data for registration
 */
export const createUserFromGoogle = (googleUser) => {
  return {
    first_name: googleUser.given_name || '',
    last_name: googleUser.family_name || '',
    email: googleUser.email || '',
    profile_picture: googleUser.picture || '',
    google_id: googleUser.id,
    email_verified: googleUser.verified_email || false,
    // Set default values for required fields
    phone_number: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    postal_code: ''
  };
};

/**
 * Validate Google user data
 * @param {Object} googleUser - Google user data
 * @returns {Object} - Validation result
 */
export const validateGoogleUser = (googleUser) => {
  const errors = [];

  if (!googleUser.email) {
    errors.push('Email is required');
  }

  if (!googleUser.given_name && !googleUser.family_name) {
    errors.push('Name is required');
  }

  if (!googleUser.id) {
    errors.push('Google ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Handle Google Sign In with redirect flow
 */
export const handleGoogleSignInRedirect = () => {
  const config = getGoogleConfig();
  const params = new URLSearchParams(config);
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  // Store state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('google_oauth_state', state);
  
  // Add state parameter
  const authUrl = `${googleAuthUrl}&state=${state}`;
  
  window.location.href = authUrl;
};

/**
 * Handle Google OAuth callback
 * @param {string} code - Authorization code
 * @param {string} state - State parameter for CSRF protection
 * @returns {Promise<Object>} - User data
 */
export const handleGoogleCallback = async (code, state) => {
  // Verify state parameter
  const storedState = sessionStorage.getItem('google_oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter');
  }
  
  sessionStorage.removeItem('google_oauth_state');

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Get user info
    const userInfo = await getUserInfo(tokenData.access_token);
    
    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      user: userInfo
    };
  } catch (error) {
    throw new Error('Failed to complete Google authentication');
  }
}; 