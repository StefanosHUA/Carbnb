# JWT Authentication Flow Diagram

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APP INITIALIZATION                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. App.js useEffect()                                             │
│     ├─> initUserActivityTracker()                                  │
│     │   └─> Track: mouse, keyboard, scroll, touch, visibility      │
│     │                                                               │
│     └─> initTokenManager()                                         │
│         ├─> Check localStorage for token                           │
│         └─> If token exists → startAutoRefresh()                   │
│             └─> scheduleTokenRefresh() (5 min before expiry)       │
│                                                                     │
│  2. TokenExpiryWarning Component                                   │
│     └─> Check token every 30 seconds                               │
│         └─> Warn user 2 minutes before expiry                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           LOGIN FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User enters credentials                                           │
│         ↓                                                           │
│  authAPI.login({ login, password })                                │
│         ↓                                                           │
│  [includeAuth: false] → No token validation                        │
│         ↓                                                           │
│  Backend validates credentials                                     │
│         ↓                                                           │
│  Response: { access_token, user }                                  │
│         ↓                                                           │
│  localStorage.setItem('carbnb_token', access_token)                │
│  localStorage.setItem('carbnb_user', JSON.stringify(user))         │
│         ↓                                                           │
│  startAutoRefresh()                                                │
│         ↓                                                           │
│  Navigate to home page                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      API REQUEST FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User action (e.g., view cars)                                     │
│         ↓                                                           │
│  vehiclesAPI.getAll()                                              │
│         ↓                                                           │
│  apiRequest('/api/v1/vehicles', { includeAuth: true })             │
│         ↓                                                           │
│  ┌──────────────────────────────────────┐                          │
│  │ Is this a public endpoint?           │                          │
│  │ (login, register, health, etc.)      │                          │
│  └──────────────────────────────────────┘                          │
│         ↓                 ↓                                         │
│       YES               NO                                          │
│         ↓                 ↓                                         │
│   Skip validation   ensureValidToken()                             │
│         ↓                 ↓                                         │
│         │           ┌─────────────────────┐                        │
│         │           │ Token exists?       │                        │
│         │           └─────────────────────┘                        │
│         │                 ↓         ↓                               │
│         │               YES        NO                              │
│         │                 ↓         ↓                               │
│         │           Check expiry   Throw 401 error                 │
│         │                 ↓                                         │
│         │           ┌─────────────────────┐                        │
│         │           │ Token expired or    │                        │
│         │           │ expiring soon?      │                        │
│         │           └─────────────────────┘                        │
│         │                 ↓         ↓                               │
│         │               YES        NO                              │
│         │                 ↓         ↓                               │
│         │        refreshAccessToken()  Token valid                 │
│         │                 ↓         ↓                               │
│         │           Update token    │                              │
│         │                 ↓         ↓                               │
│         └─────────────────┴─────────┘                              │
│                       ↓                                             │
│  Build request with headers:                                       │
│    - Authorization: Bearer <token>                                 │
│    - X-User-Id: <user_id>                                          │
│    - X-User-Role: <role>                                           │
│    - Content-Type: application/json                                │
│                       ↓                                             │
│  fetch(url, config)                                                │
│                       ↓                                             │
│  ┌──────────────────────────────────────┐                          │
│  │ Response status?                     │                          │
│  └──────────────────────────────────────┘                          │
│         ↓         ↓         ↓                                       │
│       200       401       Other                                    │
│         ↓         ↓         ↓                                       │
│    Success   Refresh &   Handle error                              │
│              Retry                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    TOKEN REFRESH FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Trigger: Scheduled (5 min before expiry) OR 401 response          │
│         ↓                                                           │
│  refreshAccessToken()                                              │
│         ↓                                                           │
│  ┌──────────────────────────────────────┐                          │
│  │ Is refresh already in progress?      │                          │
│  └──────────────────────────────────────┘                          │
│         ↓         ↓                                                 │
│       YES        NO                                                 │
│         ↓         ↓                                                 │
│   Wait for    Set isRefreshing = true                              │
│   completion        ↓                                               │
│         │     Check user activity                                  │
│         │           ↓                                               │
│         │     ┌─────────────────────┐                              │
│         │     │ User active?        │                              │
│         │     └─────────────────────┘                              │
│         │           ↓         ↓                                     │
│         │         YES        NO                                    │
│         │           ↓         ↓                                     │
│         │     Refresh    Logout user                               │
│         │           ↓                                               │
│         │     POST /api/v1/auth/refresh-token                      │
│         │     Headers: { Authorization: Bearer <old_token> }       │
│         │           ↓                                               │
│         │     ┌─────────────────────┐                              │
│         │     │ Refresh successful? │                              │
│         │     └─────────────────────┘                              │
│         │           ↓         ↓                                     │
│         │         YES        NO                                    │
│         │           ↓         ↓                                     │
│         │     Update token  Logout                                 │
│         │           ↓                                               │
│         │     localStorage.setItem('carbnb_token', new_token)      │
│         │           ↓                                               │
│         │     onTokenRefreshed(new_token)                          │
│         │           ↓                                               │
│         │     Notify all waiting requests                          │
│         │           ↓                                               │
│         │     scheduleTokenRefresh(new_token)                      │
│         │           ↓                                               │
│         └───────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     LOGOUT FLOW                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Trigger: User clicks logout OR Token refresh fails OR Inactivity  │
│         ↓                                                           │
│  logout()                                                          │
│         ↓                                                           │
│  localStorage.removeItem('carbnb_token')                           │
│  localStorage.removeItem('carbnb_user')                            │
│         ↓                                                           │
│  stopAutoRefresh()                                                 │
│         ↓                                                           │
│  clearTimeout(refreshTimer)                                        │
│         ↓                                                           │
│  window.location.href = '/login?reason=session_expired'            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  USER ACTIVITY TRACKING                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Events tracked:                                                   │
│    - mousedown, mousemove                                          │
│    - keypress                                                      │
│    - scroll                                                        │
│    - touchstart                                                    │
│    - click                                                         │
│    - visibilitychange                                              │
│         ↓                                                           │
│  updateActivity()                                                  │
│         ↓                                                           │
│  lastActivity = Date.now()                                         │
│  isActive = true                                                   │
│         ↓                                                           │
│  resetInactivityTimer()                                            │
│         ↓                                                           │
│  setTimeout(() => {                                                │
│    isActive = false                                                │
│  }, 5 minutes)                                                     │
│                                                                     │
│  isUserActive() → returns isActive                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  TOKEN EXPIRY WARNING                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Every 30 seconds:                                                 │
│         ↓                                                           │
│  Get token from localStorage                                       │
│         ↓                                                           │
│  isTokenExpiringSoon(token, 2 minutes)                             │
│         ↓                                                           │
│  ┌──────────────────────────────────────┐                          │
│  │ Expiring soon AND not warned yet?    │                          │
│  └──────────────────────────────────────┘                          │
│         ↓         ↓                                                 │
│       YES        NO                                                 │
│         ↓         ↓                                                 │
│  Show warning  Continue                                            │
│  toast message                                                     │
│         ↓                                                           │
│  setHasWarned(true)                                                │
│                                                                     │
│  When token refreshed:                                             │
│         ↓                                                           │
│  setHasWarned(false)                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Components Interaction

```
┌──────────────────┐
│     App.js       │
│                  │
│  - Init Activity │──────┐
│  - Init Token    │      │
│  - Render UI     │      │
└──────────────────┘      │
                          │
┌──────────────────┐      │
│  TokenExpiry     │      │
│  Warning         │      │
│                  │      │
│  - Monitor       │      │
│  - Warn User     │      │
└──────────────────┘      │
                          │
┌──────────────────┐      │
│  API Service     │◄─────┤
│                  │      │
│  - Validate      │      │
│  - Request       │      │
│  - Handle 401    │      │
└──────────────────┘      │
         ↕                │
┌──────────────────┐      │
│  Token Manager   │◄─────┤
│                  │      │
│  - Validate      │      │
│  - Refresh       │      │
│  - Schedule      │      │
└──────────────────┘      │
         ↕                │
┌──────────────────┐      │
│  User Activity   │◄─────┘
│  Tracker         │
│                  │
│  - Track Events  │
│  - Check Active  │
└──────────────────┘
```

## Security Layers

```
Layer 1: User Activity Tracking
         ↓
Layer 2: Token Validation (Client-Side)
         ↓
Layer 3: Token Refresh (Proactive)
         ↓
Layer 4: Authorization Header
         ↓
Layer 5: Token Validation (Server-Side)
         ↓
Layer 6: Request Processing
```

## Timeline Example

```
Time    Event                           Action
────────────────────────────────────────────────────────────
00:00   User logs in                    Store token (expires at 01:00)
00:00   startAutoRefresh()              Schedule refresh at 00:55
00:05   User views cars                 Token valid → Request succeeds
00:10   User searches                   Token valid → Request succeeds
00:30   User inactive for 5 min         isActive = false
00:55   Scheduled refresh               User inactive → Logout instead
00:55   Redirect to login               Session expired message

Alternative timeline (active user):
────────────────────────────────────────────────────────────
00:00   User logs in                    Store token (expires at 01:00)
00:00   startAutoRefresh()              Schedule refresh at 00:55
00:05   User views cars                 Token valid → Request succeeds
00:10   User searches                   Token valid → Request succeeds
00:30   User still active               isActive = true
00:55   Scheduled refresh               User active → Refresh token
00:55   New token stored                New expiry at 01:55
00:56   Schedule next refresh           At 01:50
01:00   User continues browsing         Seamless experience
```

## Error Handling Flow

```
API Request Error
       ↓
┌──────────────────┐
│ Error Type?      │
└──────────────────┘
   ↓    ↓    ↓
  401  403  Other
   ↓    ↓    ↓
   │    │    └──> Show error message
   │    │
   │    └──> Check user role
   │         └──> Show permission error
   │
   └──> Check if user active
        ↓         ↓
      YES        NO
        ↓         ↓
   Refresh    Logout
   token
        ↓
   Retry
   request
```

This visual guide complements the detailed documentation in `AUTHENTICATION_GUIDE.md`.

