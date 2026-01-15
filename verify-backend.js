/**
 * Quick script to verify backend connection
 * Run with: node verify-backend.js
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function verifyBackend() {
  console.log('🔍 Verifying backend connection...');
  console.log(`📍 Backend URL: ${API_URL}\n`);

  try {
    // Test 1: Basic connectivity
    console.log('Test 1: Checking if backend is running...');
    const response = await fetch(`${API_URL}/api/v1/vehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running and responding!');
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📦 Data received: ${JSON.stringify(data).substring(0, 100)}...`);
      return true;
    } else {
      console.log(`⚠️  Backend responded with status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is NOT running or not accessible');
    console.log(`Error: ${error.message}`);
    console.log('\n💡 Make sure:');
    console.log('   1. Backend server is started (npm start in backend directory)');
    console.log('   2. Backend is running on port 3001');
    console.log('   3. CORS is configured to allow requests from localhost:3000');
    return false;
  }
}

// Run verification
verifyBackend().then(success => {
  process.exit(success ? 0 : 1);
});
