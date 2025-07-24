# Google OAuth Setup Guide for Carbnb

This guide will walk you through setting up Google OAuth for your Carbnb application step by step.

## 📋 Prerequisites

- A Google account
- Access to Google Cloud Console
- Your React application running on localhost:3000

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: `carbnb-app`
   - Click "Create"

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

### Step 2: Enable Google OAuth APIs

1. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

2. **Enable Google OAuth 2.0**
   - Go to "APIs & Services" > "Library"
   - Search for "Google OAuth 2.0"
   - Click on it and click "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"

2. **Configure OAuth Consent Screen**
   - If prompted, click "Configure Consent Screen"
   - Choose "External" user type
   - Click "Create"

3. **Fill in App Information**
   - **App name**: `Carbnb`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
   - Click "Save and Continue"

4. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Select these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "Update"
   - Click "Save and Continue"

5. **Add Test Users** (Optional for development)
   - Add your email address as a test user
   - Click "Save and Continue"
   - Click "Back to Dashboard"

6. **Create OAuth Client ID**
   - Go back to "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - **Application type**: Web application
   - **Name**: `Carbnb Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:3001`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:3000/callback`
   - Click "Create"

7. **Save Your Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Keep them safe - you'll need them for the next step

### Step 4: Configure Environment Variables

1. **Create .env file**
   - In your project root, create a file named `.env`
   - Copy the content from `env.example` to `.env`

2. **Update .env with your credentials**
   ```env
   # Google OAuth Configuration
   REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here
   REACT_APP_GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
   REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000

   # API Configuration
   REACT_APP_API_URL=http://localhost:3001

   # Development Configuration
   REACT_APP_ENV=development
   ```

3. **Replace the placeholder values**
   - Replace `your-actual-client-id-here` with your Google Client ID
   - Replace `your-actual-client-secret-here` with your Google Client Secret

### Step 5: Test the Setup

1. **Start your React application**
   ```bash
   npm start
   ```

2. **Test Google Sign-in**
   - Go to http://localhost:3000
   - Click "Sign in with Google" in the header
   - You should see the Google OAuth popup
   - Sign in with your Google account
   - You should be redirected back to your app

3. **Check the console**
   - Open browser developer tools (F12)
   - Look for any errors in the Console tab
   - If there are errors, check the Network tab for failed requests

## 🔧 Troubleshooting Common Issues

### Issue 1: "Error: popup_closed_by_user"
**Solution**: This is normal if the user closes the popup. The error is handled gracefully.

### Issue 2: "Error: access_denied"
**Solution**: 
- Check that your app is in the allowed domains
- Make sure you're using the correct Client ID
- Verify the redirect URI matches exactly

### Issue 3: "Error: invalid_client"
**Solution**:
- Check that your Client ID is correct
- Make sure you copied the entire Client ID
- Verify the Client ID is for a Web application, not Android/iOS

### Issue 4: "Error: redirect_uri_mismatch"
**Solution**:
- Go back to Google Cloud Console
- Check that `http://localhost:3000` is in your authorized redirect URIs
- Make sure there are no extra spaces or characters

### Issue 5: "Error: invalid_request"
**Solution**:
- Check that your app is running on localhost:3000
- Verify the redirect URI in your .env file matches exactly
- Make sure you're using HTTPS in production

## 🧪 Testing Security Features

### Test 1: Input Sanitization
1. Go to the registration page
2. Try entering this in any text field: `<script>alert('xss')</script>`
3. Submit the form
4. Check that the script tags are removed

### Test 2: File Upload Security
1. Go to car registration page
2. Try uploading a file with extension `.py`, `.js`, or `.exe`
3. You should see an error message about dangerous file types

### Test 3: Google OAuth
1. Click "Sign in with Google" in the header
2. Complete the Google sign-in process
3. You should be redirected back and see your name in the header
4. Click "Logout" to test the logout functionality

## 📝 Production Setup

When deploying to production:

1. **Update Google Cloud Console**
   - Add your production domain to authorized origins
   - Add your production domain to redirect URIs
   - Example: `https://yourdomain.com`

2. **Update Environment Variables**
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-production-client-id
   REACT_APP_GOOGLE_CLIENT_SECRET=your-production-client-secret
   REACT_APP_GOOGLE_REDIRECT_URI=https://yourdomain.com
   ```

3. **Enable HTTPS**
   - Google OAuth requires HTTPS in production
   - Make sure your hosting provider supports HTTPS

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Use different Client IDs for development and production
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage in Google Cloud Console

## 📞 Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Google Cloud Console settings
3. Test with a different browser
4. Check that your app is running on the correct port
5. Verify your environment variables are loaded correctly

## ✅ Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] .env file created with correct credentials
- [ ] React app starts without errors
- [ ] Google sign-in button appears in header
- [ ] Google OAuth popup opens
- [ ] User can sign in with Google
- [ ] User data appears in header after sign-in
- [ ] Logout functionality works
- [ ] Input sanitization works
- [ ] File upload security works

Once you've completed all these steps, your Carbnb application will have full Google OAuth integration with comprehensive security features! 