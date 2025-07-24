# Carbnb Security Features Setup Guide

This guide explains the security features implemented in the Carbnb application and how to configure them.

## 🔒 Security Features Implemented

### 1. Input Sanitization
- **XSS Prevention**: All user inputs are sanitized to remove potentially dangerous HTML tags and scripts
- **SQL Injection Prevention**: Input validation and sanitization before database operations
- **URL Validation**: Prevents malicious redirects and data URI attacks

### 2. File Upload Security
- **File Type Validation**: Blocks dangerous file extensions (.py, .js, .php, .exe, etc.)
- **MIME Type Checking**: Validates file content type against allowed types
- **File Size Limits**: Maximum 10MB file size limit
- **Executable Detection**: Scans file headers to detect executable files
- **Drag & Drop Security**: Secure file upload component with real-time validation

### 3. Google OAuth Integration
- **Secure Authentication**: Google OAuth 2.0 for user registration and login
- **CSRF Protection**: State parameter validation for OAuth flows
- **User Data Validation**: Validates Google user data before processing

### 4. Form Validation
- **Client-side Validation**: Real-time input validation with error messages
- **Server-side Sanitization**: All form data sanitized before API calls
- **Rate Limiting**: Built-in rate limiting utility for API requests

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000

# API Configuration
REACT_APP_API_URL=http://localhost:3001
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth 2.0
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
5. Copy the Client ID and Client Secret to your `.env` file

### 3. Security Configuration

The security features are automatically enabled. You can customize them in `src/utils/security.js`:

```javascript
// Customize dangerous file extensions
const DANGEROUS_EXTENSIONS = [
  '.py', '.js', '.php', '.exe', // Add more as needed
];

// Customize file size limits
const maxSize = 10 * 1024 * 1024; // 10MB

// Customize rate limiting
const rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
```

## 🛡️ Security Features in Detail

### Input Sanitization (`src/utils/security.js`)

```javascript
// Sanitizes user input to prevent XSS attacks
const sanitizedInput = sanitizeInput(userInput);

// Sanitizes entire form data objects
const sanitizedFormData = sanitizeFormData(formData);

// Validates URLs to prevent malicious redirects
const isValidUrl = validateUrl(userUrl);
```

### File Upload Security (`src/components/SecureFileUpload.js`)

```javascript
import SecureFileUpload from '../components/SecureFileUpload';

<SecureFileUpload
  onFileSelect={handleFileSelect}
  acceptedTypes={['image/*']}
  maxSize={5 * 1024 * 1024} // 5MB
  multiple={false}
/>
```

### Google Authentication (`src/utils/googleAuth.js`)

```javascript
// Initialize Google Auth
initializeGoogleAuth();

// Handle Google Sign In
const handleGoogleSignIn = async () => {
  try {
    const googleData = await handleGoogleSignIn();
    const userData = createUserFromGoogle(googleData.user);
    // Process user data
  } catch (error) {
    // Handle error
  }
};
```

## 🔧 API Integration

### Registration with Security

```javascript
// In your registration form
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) return;
  
  // Sanitize data
  const sanitizedData = sanitizeFormData(formData);
  
  // Send to API
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitizedData)
  });
};
```

### File Upload with Validation

```javascript
// In your file upload component
const handleFileUpload = async (file) => {
  const validation = await validateFileUpload(file);
  
  if (!validation.isValid) {
    setError(validation.error);
    return;
  }
  
  // Proceed with upload
  uploadFile(file);
};
```

## 🚨 Security Best Practices

### 1. Always Sanitize Input
```javascript
// ✅ Good
const sanitizedData = sanitizeFormData(userInput);

// ❌ Bad
const rawData = userInput; // Never use raw user input
```

### 2. Validate File Uploads
```javascript
// ✅ Good
const validation = await validateFileUpload(file);
if (!validation.isValid) {
  throw new Error(validation.error);
}

// ❌ Bad
const file = event.target.files[0]; // Never trust file input directly
```

### 3. Use HTTPS in Production
```javascript
// ✅ Good
const API_URL = 'https://api.carbnb.com';

// ❌ Bad
const API_URL = 'http://api.carbnb.com'; // Not secure
```

### 4. Implement Rate Limiting
```javascript
// ✅ Good
const rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
if (!rateLimiter.isAllowed(userId)) {
  throw new Error('Too many requests');
}
```

## 🔍 Testing Security Features

### Test Input Sanitization
```javascript
// Test XSS prevention
const maliciousInput = '<script>alert("xss")</script>';
const sanitized = sanitizeInput(maliciousInput);
console.log(sanitized); // Should not contain script tags
```

### Test File Validation
```javascript
// Test dangerous file rejection
const dangerousFile = new File([''], 'malware.exe', { type: 'application/x-msdownload' });
const validation = await validateFileUpload(dangerousFile);
console.log(validation.isValid); // Should be false
```

### Test Google OAuth
```javascript
// Test Google authentication
try {
  const googleData = await handleGoogleSignIn();
  console.log('Google auth successful:', googleData.user);
} catch (error) {
  console.error('Google auth failed:', error);
}
```

## 📝 Notes

- All security features are enabled by default
- File upload validation happens client-side for immediate feedback
- Server-side validation should also be implemented for complete security
- Google OAuth requires proper HTTPS setup in production
- Rate limiting is implemented client-side; server-side rate limiting is recommended

## 🆘 Troubleshooting

### Google OAuth Issues
1. Check that your Google Client ID is correct
2. Verify redirect URIs match exactly
3. Ensure HTTPS is used in production
4. Check browser console for OAuth errors

### File Upload Issues
1. Check file size limits
2. Verify accepted file types
3. Ensure file is not corrupted
4. Check browser console for validation errors

### Input Validation Issues
1. Check that all inputs are being sanitized
2. Verify error messages are displayed
3. Ensure form validation is working
4. Test with malicious input to verify sanitization

For additional security concerns or questions, please refer to the security utilities in `src/utils/security.js` and `src/utils/googleAuth.js`. 