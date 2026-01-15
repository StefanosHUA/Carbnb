# Fix Google OAuth Redirect URI Mismatch for Netlify

## Problem
You're getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google on Netlify.

## Solution

### Step 1: Get Your Netlify Domain
1. Go to your Netlify dashboard
2. Find your site's URL (e.g., `https://your-site-name.netlify.app`)

### Step 2: Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Find your OAuth 2.0 Client ID (the one you're using for Carbnb)
   - Click on it to edit

3. **Add Authorized Redirect URIs**
   Add these URIs (replace `your-site-name` with your actual Netlify site name):
   ```
   https://your-site-name.netlify.app
   https://your-site-name.netlify.app/
   http://localhost:3000
   http://localhost:3000/
   ```

4. **Add Authorized JavaScript Origins**
   Add these origins:
   ```
   https://your-site-name.netlify.app
   http://localhost:3000
   ```

5. **Click "Save"**

### Step 3: Configure Netlify Environment Variables

1. **Go to Netlify Dashboard**
   - Select your site
   - Go to "Site settings" → "Environment variables"

2. **Add/Update These Variables:**
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
   REACT_APP_GOOGLE_REDIRECT_URI=https://your-site-name.netlify.app
   ```

   **Important:** Replace:
   - `your-google-client-id-here` with your actual Google Client ID
   - `your-site-name` with your actual Netlify site name

3. **Save the environment variables**

### Step 4: Redeploy Your Site

1. **Trigger a new deployment** in Netlify (or push a new commit)
2. Wait for the build to complete

### Step 5: Test

1. Go to your Netlify site
2. Try to sign in with Google
3. It should work now!

## Troubleshooting

### Still getting the error?

1. **Double-check the redirect URI matches exactly:**
   - In Google Console: Should be `https://your-site-name.netlify.app` (no trailing slash, or with trailing slash - but be consistent)
   - In Netlify env var: Should match exactly what's in Google Console

2. **Check for typos:**
   - Make sure there are no extra spaces
   - Make sure you're using `https://` not `http://` for Netlify
   - Make sure the domain is correct

3. **Wait a few minutes:**
   - Google sometimes takes a few minutes to propagate changes

4. **Check the browser console:**
   - Open Developer Tools (F12)
   - Look for any errors in the Console tab
   - The error message might give you a clue about what redirect URI is being used

## For Local Development

Make sure your `.env` file has:
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
```

And make sure `http://localhost:3000` is also added to Google Console's authorized redirect URIs.

