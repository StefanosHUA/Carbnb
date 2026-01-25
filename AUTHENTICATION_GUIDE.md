# JWT Authentication Implementation Guide

## Overview

The Carbnb frontend now implements a comprehensive JWT (JSON Web Token) authentication system following industry best practices. Every API call (except public endpoints like login/register) includes a valid JWT bearer token for authentication.

## Key Features

### 🔐 Security Features

1. **Automatic Token Validation**
   - Every API request validates the token before sending
   - Expired tokens are automatically refreshed
   - Invalid tokens trigger re-authentication

2. **Token Refresh Strategy**
   - Proactive refresh 5 minutes before expiration
   - Automatic retry of failed requests with new token
   - Prevents concurrent refresh requests

3. **User Activity Tracking**
   - Monitors user interaction with the app
   - Inactive users are logged out instead of refreshing tokens
   - Configurable inactivity timeout (default: 5 minutes)

4. **Session Management**
   - Secure token storage in localStorage
   - Automatic cleanup on logout
   - Session expiry notifications

## Architecture

### Core Components

#### 1. Token Manager (`src/utils/tokenManager.js`)

**Key Functions:**
- `initTokenManager()` - Initialize on app startup
- `startAutoRefresh()` - Begin automatic token refresh cycle
- `stopAutoRefresh()` - Stop refresh timer (on logout)
- `ensureValidToken()` - Validate token before API requests
- `getValidToken()` - Get current valid token or refresh
- `isTokenValid()` - Check if token exists and is not expired
- `isTokenExpired()` - Check if token is past expiration
- `isTokenExpiringSoon()` - Check if token expires within buffer time

**Features:**
- Parses JWT to extract expiration time
- Schedules refresh 5 minutes before expiry
- Handles refresh failures gracefully
- Prevents concurrent refresh requests using promise queue
- Redirects to login on session expiration

#### 2. API Service (`src/utils/api.js`)

**Enhanced with:**
- Pre-request token validation
- Automatic token refresh on 401 errors
- Request retry with new token
- Public endpoint detection (no auth required)

**Public Endpoints (No Token Required):**
- `/auth/login`
- `/auth/register`
- `/auth/google`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/health`

**Protected Endpoints (Token Required):**
- All vehicle operations
- All booking operations
- User profile and dashboard
- Search operations (for tracking)
- Admin operations
- Document uploads

#### 3. User Activity Tracker (`src/utils/userActivity.js`)

**Tracks:**
- Mouse movements and clicks
- Keyboard input
- Scrolling
- Touch events
- Page visibility changes

**Purpose:**
- Determine if user is actively using the app
- Decide whether to refresh token or logout
- Default inactivity timeout: 5 minutes

#### 4. Token Expiry Warning (`src/components/TokenExpiryWarning.js`)

**Features:**
- Monitors token expiration every 30 seconds
- Warns user 2 minutes before expiry
- Shows toast notification
- Automatically resets after token refresh

## Implementation Flow

### App Initialization

```javascript
// src/App.js
useEffect(() => {
  // 1. Initialize user activity tracking
  initUserActivityTracker();
  
  // 2. Initialize token manager with auto-refresh
  initTokenManager();
}, []);
```

### Login Flow

```javascript
// 1. User submits credentials
const response = await authAPI.login({ login, password });

// 2. Store token and user data
localStorage.setItem('carbnb_token', response.access_token);
localStorage.setItem('carbnb_user', JSON.stringify(response.user));

// 3. Start automatic token refresh
startAutoRefresh();

// 4. Navigate to home page
navigate('/');
```

### API Request Flow

```javascript
// 1. Pre-request validation
const tokenValid = await ensureValidToken();
if (!tokenValid) {
  throw new Error('Authentication required');
}

// 2. Make request with token
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId,
    'X-User-Role': userRole
  }
});

// 3. Handle 401 (if token expired during request)
if (response.status === 401 && isUserActive()) {
  // Refresh token and retry request
  const newToken = await refreshAccessToken();
  // Retry with new token
}
```

### Token Refresh Flow

```javascript
// 1. Check if refresh already in progress
if (isRefreshing) {
  // Wait for existing refresh to complete
  return new Promise((resolve) => {
    subscribeTokenRefresh(resolve);
  });
}

// 2. Check user activity
if (!isUserActive()) {
  // User is inactive, logout instead
  logout();
  return false;
}

// 3. Call refresh endpoint
const response = await fetch('/api/v1/auth/refresh-token', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${currentToken}` }
});

// 4. Update token and notify subscribers
localStorage.setItem('carbnb_token', newToken);
onTokenRefreshed(newToken);
scheduleTokenRefresh(newToken);
```

### Logout Flow

```javascript
// 1. Clear all auth data
localStorage.removeItem('carbnb_token');
localStorage.removeItem('carbnb_user');

// 2. Stop refresh timer
stopAutoRefresh();

// 3. Redirect to login
window.location.href = '/login?reason=session_expired';
```

## Security Best Practices Implemented

### ✅ Token Storage
- Tokens stored in localStorage (accessible only to same origin)
- Cleared on logout and session expiration
- Not exposed in URLs or logs

### ✅ Token Validation
- Validated before every API request
- Expiration checked client-side
- Server-side validation on every request

### ✅ Token Refresh
- Proactive refresh before expiration
- Prevents concurrent refresh requests
- Handles refresh failures gracefully

### ✅ Session Management
- User activity tracking
- Automatic logout on inactivity
- Session expiry warnings

### ✅ Error Handling
- Graceful handling of network errors
- Clear error messages for users
- Automatic retry with new token

### ✅ Request Security
- Authorization header on all protected endpoints
- User ID and role headers for backend validation
- Content-Type validation

## Configuration

### Environment Variables

```bash
# User Service (Auth)
REACT_APP_USER_SERVICE_URL=http://localhost:8002

# Vehicle Service
REACT_APP_VEHICLE_SERVICE_URL=http://localhost:3003

# Booking Service
REACT_APP_BOOKING_SERVICE_URL=http://localhost:8003

# Search Service
REACT_APP_SEARCH_SERVICE_URL=http://localhost:8004
```

### Token Manager Settings

```javascript
// Token refresh buffer (refresh 5 minutes before expiry)
const refreshBuffer = 5 * 60 * 1000; // 5 minutes

// User inactivity timeout
const inactivityTimeout = 5 * 60 * 1000; // 5 minutes

// Token expiry warning (warn 2 minutes before expiry)
const warningBuffer = 2; // 2 minutes
```

## Testing the Implementation

### 1. Test Login
```bash
# Start the frontend
npm start

# Navigate to http://localhost:3000/login
# Login with valid credentials
# Check browser console for token initialization logs
```

### 2. Test Token Validation
```bash
# Open browser DevTools > Console
# Look for logs:
# [API] Validating token before request...
# [API] Token validated successfully
```

### 3. Test Token Refresh
```bash
# Wait for token to approach expiration (or manually set short expiry)
# Check console for:
# [TokenManager] Token expiring soon, refreshing proactively
# [TokenManager] Token refreshed successfully
```

### 4. Test Inactivity Logout
```bash
# Login and don't interact with the page for 5 minutes
# You should be automatically logged out
# Check console for:
# [TokenManager] User inactive, logging out instead of refreshing
```

### 5. Test API Calls
```bash
# Navigate to /cars page
# Open Network tab in DevTools
# Check request headers for:
# Authorization: Bearer <token>
# X-User-Id: <user_id>
# X-User-Role: <role>
```

## Troubleshooting

### Token Not Being Sent

**Issue:** API requests return 401 Unauthorized

**Solutions:**
1. Check if token exists: `localStorage.getItem('carbnb_token')`
2. Verify token is not expired: Use JWT decoder
3. Check console for validation errors
4. Ensure `includeAuth: true` in API call

### Token Refresh Failing

**Issue:** User is logged out unexpectedly

**Solutions:**
1. Verify backend refresh endpoint is working
2. Check if refresh token is valid
3. Verify user service URL is correct
4. Check network connectivity

### Concurrent Refresh Requests

**Issue:** Multiple refresh requests sent simultaneously

**Solutions:**
- Already handled by `isRefreshing` flag
- Subsequent requests wait for first refresh to complete
- Uses promise queue pattern

### Session Expiring Too Quickly

**Issue:** User logged out while actively using app

**Solutions:**
1. Check user activity tracker is initialized
2. Verify activity events are being tracked
3. Adjust inactivity timeout if needed
4. Check token expiry time from backend

## API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/v1/auth/register` | POST | No | Register new user |
| `/api/v1/auth/login` | POST | No | Login user |
| `/api/v1/auth/refresh-token` | POST | Yes | Refresh access token |
| `/api/v1/auth/logout` | POST | Yes | Logout user |
| `/api/v1/auth/me` | GET | Yes | Get current user |
| `/api/v1/auth/forgot-password` | POST | No | Request password reset |
| `/api/v1/auth/reset-password` | POST | No | Reset password |

### Protected Endpoints

All other endpoints require authentication:
- Vehicle operations (`/api/v1/vehicles/*`)
- Booking operations (`/api/v1/bookings/*`)
- User operations (`/api/v1/users/*`)
- Search operations (`/api/v1/search/*`)
- Admin operations (`/api/v1/admin/*`)

## Best Practices for Developers

### 1. Always Use API Service
```javascript
// ✅ Good
import { vehiclesAPI } from '../utils/api';
const cars = await vehiclesAPI.getAll();

// ❌ Bad
const response = await fetch('http://localhost:3003/api/v1/vehicles');
```

### 2. Handle Authentication Errors
```javascript
try {
  const data = await vehiclesAPI.getAll();
} catch (error) {
  if (error.status === 401) {
    // User will be redirected to login automatically
    toast.error('Please log in to continue');
  }
}
```

### 3. Check User Authentication State
```javascript
import { isTokenValid } from '../utils/tokenManager';

if (isTokenValid()) {
  // User is authenticated
} else {
  // Redirect to login
}
```

### 4. Start Token Refresh After Login
```javascript
import { startAutoRefresh } from '../utils/tokenManager';

// After successful login
localStorage.setItem('carbnb_token', token);
startAutoRefresh();
```

### 5. Stop Token Refresh on Logout
```javascript
import { stopAutoRefresh } from '../utils/tokenManager';

// Before logout
stopAutoRefresh();
localStorage.removeItem('carbnb_token');
localStorage.removeItem('carbnb_user');
```

## Security Considerations

### What's Protected
- ✅ All API requests include valid JWT token
- ✅ Tokens are validated before every request
- ✅ Expired tokens are automatically refreshed
- ✅ User activity is tracked to prevent unauthorized refresh
- ✅ Session data is cleared on logout

### What to Avoid
- ❌ Don't store tokens in cookies (CSRF vulnerability)
- ❌ Don't expose tokens in URLs
- ❌ Don't log tokens to console in production
- ❌ Don't skip token validation
- ❌ Don't use same token indefinitely

### Future Enhancements
- [ ] Implement refresh token rotation
- [ ] Add device fingerprinting
- [ ] Implement rate limiting on client side
- [ ] Add token revocation list check
- [ ] Implement secure token storage (consider httpOnly cookies)

## Summary

The JWT authentication system is now fully implemented with:
- ✅ Automatic token validation on every request
- ✅ Proactive token refresh before expiration
- ✅ User activity tracking
- ✅ Session management
- ✅ Error handling and retry logic
- ✅ Security best practices

All API calls (except public endpoints) now require and include a valid JWT bearer token for authentication.

