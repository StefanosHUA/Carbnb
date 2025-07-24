// Security Features Test Script
// Run this in your browser console to test the security features

console.log('🔒 Testing Carbnb Security Features...');

// Test 1: Input Sanitization
function testInputSanitization() {
  console.log('\n🧪 Test 1: Input Sanitization');
  
  const maliciousInputs = [
    '<script>alert("xss")</script>',
    '<iframe src="javascript:alert(1)"></iframe>',
    'javascript:alert("xss")',
    'data:text/html,<script>alert("xss")</script>',
    '&#x3C;script&#x3E;alert("xss")&#x3C;/script&#x3E;'
  ];
  
  maliciousInputs.forEach((input, index) => {
    // Import the sanitize function (you'll need to make it globally available)
    if (typeof window.sanitizeInput === 'function') {
      const sanitized = window.sanitizeInput(input);
      const isClean = !sanitized.includes('<script>') && 
                     !sanitized.includes('javascript:') && 
                     !sanitized.includes('data:');
      
      console.log(`Input ${index + 1}: ${isClean ? '✅ Clean' : '❌ Still contains malicious content'}`);
      console.log(`  Original: ${input}`);
      console.log(`  Sanitized: ${sanitized}`);
    } else {
      console.log('⚠️ sanitizeInput function not available globally');
    }
  });
}

// Test 2: URL Validation
function testUrlValidation() {
  console.log('\n🧪 Test 2: URL Validation');
  
  const testUrls = [
    'https://google.com',
    'http://localhost:3000',
    'javascript:alert("xss")',
    'data:text/html,<script>alert("xss")</script>',
    'file:///etc/passwd',
    'ftp://malicious.com',
    'https://legitimate-site.com'
  ];
  
  testUrls.forEach((url, index) => {
    if (typeof window.validateUrl === 'function') {
      const isValid = window.validateUrl(url);
      console.log(`URL ${index + 1}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`  URL: ${url}`);
    } else {
      console.log('⚠️ validateUrl function not available globally');
    }
  });
}

// Test 3: File Validation (Mock)
function testFileValidation() {
  console.log('\n🧪 Test 3: File Validation (Mock)');
  
  const dangerousExtensions = ['.py', '.js', '.php', '.exe', '.bat', '.sh'];
  const safeExtensions = ['.jpg', '.png', '.pdf', '.txt', '.doc'];
  
  console.log('Dangerous extensions that should be blocked:');
  dangerousExtensions.forEach(ext => {
    console.log(`  ${ext}: ❌ Should be blocked`);
  });
  
  console.log('Safe extensions that should be allowed:');
  safeExtensions.forEach(ext => {
    console.log(`  ${ext}: ✅ Should be allowed`);
  });
}

// Test 4: Google OAuth Status
function testGoogleOAuth() {
  console.log('\n🧪 Test 4: Google OAuth Status');
  
  // Check if Google API is loaded
  if (window.google && window.google.accounts) {
    console.log('✅ Google API loaded successfully');
  } else {
    console.log('❌ Google API not loaded');
  }
  
  // Check environment variables
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (clientId && clientId !== 'your-google-client-id-here') {
    console.log('✅ Google Client ID configured');
  } else {
    console.log('❌ Google Client ID not configured');
    console.log('  Please update your .env file with your Google OAuth credentials');
  }
}

// Test 5: Form Validation
function testFormValidation() {
  console.log('\n🧪 Test 5: Form Validation');
  
  const testCases = [
    { email: 'test@example.com', password: 'password123', expected: true },
    { email: 'invalid-email', password: 'short', expected: false },
    { email: '', password: '', expected: false },
    { email: 'test@example.com', password: '', expected: false },
    { email: '', password: 'password123', expected: false }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`Test case ${index + 1}:`);
    console.log(`  Email: ${testCase.email}`);
    console.log(`  Password: ${testCase.password}`);
    console.log(`  Expected: ${testCase.expected ? 'Valid' : 'Invalid'}`);
  });
}

// Test 6: Security Headers Check
function testSecurityHeaders() {
  console.log('\n🧪 Test 6: Security Headers Check');
  
  // Check if we're on HTTPS (important for OAuth)
  if (window.location.protocol === 'https:') {
    console.log('✅ HTTPS enabled (required for production)');
  } else {
    console.log('⚠️ HTTP detected (OK for development, HTTPS required for production)');
  }
  
  // Check for common security headers
  fetch(window.location.href)
    .then(response => {
      const headers = response.headers;
      const securityHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection'
      ];
      
      securityHeaders.forEach(header => {
        if (headers.get(header)) {
          console.log(`✅ ${header} header present`);
        } else {
          console.log(`⚠️ ${header} header missing`);
        }
      });
    })
    .catch(error => {
      console.log('⚠️ Could not check security headers:', error.message);
    });
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Security Features Test Suite...\n');
  
  testInputSanitization();
  testUrlValidation();
  testFileValidation();
  testGoogleOAuth();
  testFormValidation();
  testSecurityHeaders();
  
  console.log('\n✅ Security tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Follow the GOOGLE_OAUTH_SETUP.md guide');
  console.log('2. Create your .env file with Google credentials');
  console.log('3. Test the actual Google OAuth flow');
  console.log('4. Test file uploads with the SecureFileUpload component');
}

// Make functions globally available for testing
window.testSecurityFeatures = {
  testInputSanitization,
  testUrlValidation,
  testFileValidation,
  testGoogleOAuth,
  testFormValidation,
  testSecurityHeaders,
  runAllTests
};

// Auto-run tests if this script is loaded
if (typeof window !== 'undefined') {
  // Wait a bit for the page to load
  setTimeout(() => {
    console.log('🔒 Carbnb Security Test Suite Loaded');
    console.log('Run window.testSecurityFeatures.runAllTests() to test all features');
  }, 1000);
} 