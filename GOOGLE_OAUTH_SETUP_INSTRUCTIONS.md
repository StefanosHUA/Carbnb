# Google OAuth Setup Instructions

## What You Need to Make Google Registration Work

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing one
   - Name it something like "Carbnb" or "Car Rental App"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "People API"
   - Click on it and click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (unless you have a Google Workspace)
   - Fill in:
     - **App name**: Carbnb (or your app name)
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (if in testing mode) or publish the app
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `Carbnb Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:3001`
     - (Add your production domain when ready)
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:3000/callback`
     - (Add production URIs when ready)
   - Click "Create"
   - **Copy the Client ID** (you'll need this)

### 2. Frontend Configuration

1. **Create or Update `.env` file** in the root of your project:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-actual-google-client-id-here.apps.googleusercontent.com
   REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
   ```

2. **Replace the placeholder**:
   - Replace `your-actual-google-client-id-here.apps.googleusercontent.com` with your actual Client ID from Google Cloud Console

3. **Restart your React development server**:
   ```bash
   npm start
   ```
   (The server needs to restart to pick up new environment variables)

### 3. Backend Configuration (Already Set Up)

The backend is already configured to handle Google OAuth. It expects:
- `access_token` from Google
- Backend will fetch user info from Google and create/login the user

### 4. Testing

1. **Start your backend** (if not running):
   ```bash
   cd newBackend/car-rental-backend-v2/user_service
   uvicorn app.main:app --reload --port 8002
   ```

2. **Start your frontend**:
   ```bash
   npm start
   ```

3. **Test the flow**:
   - Go to the registration page
   - Click "Continue with Google"
   - You should see Google's sign-in popup
   - Sign in with your Google account
   - You should be redirected back and logged in

## Troubleshooting

### "Google OAuth is not configured yet"
- Make sure you've set `REACT_APP_GOOGLE_CLIENT_ID` in your `.env` file
- Make sure you've restarted your React dev server after adding the env variable
- Check that the Client ID is correct (should end with `.apps.googleusercontent.com`)

### "Invalid client" error
- Check that your Client ID is correct
- Make sure you've added `http://localhost:3000` to Authorized JavaScript origins
- Make sure the OAuth consent screen is configured

### "Access denied" error
- Make sure you've added your email as a test user (if app is in testing mode)
- Or publish your app in Google Cloud Console

### Popup blocked
- Make sure popups are allowed for localhost
- Try clicking the button again

## What Happens When User Clicks "Continue with Google"

1. Frontend calls Google Identity Services API
2. Google shows sign-in popup
3. User signs in with Google account
4. Google returns access token
5. Frontend sends access token to backend (`/api/v1/auth/google`)
6. Backend fetches user info from Google using the access token
7. Backend creates new user (if first time) or logs in existing user
8. Backend returns JWT token and user data
9. Frontend stores token and user data
10. User is logged in and redirected to `/cars`

## Security Notes

- Never commit your `.env` file with real credentials to Git
- The Client ID is safe to expose (it's public)
- The Client Secret should NEVER be exposed in frontend code
- For production, use environment variables or secure configuration

