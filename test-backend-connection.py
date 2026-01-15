#!/usr/bin/env python3
"""Quick test script to check backend connection"""

import requests
import sys

def test_backend():
    url = "http://localhost:8002"
    
    print("=" * 50)
    print("Testing Backend Connection")
    print("=" * 50)
    print(f"\nTesting: {url}")
    
    # Test health endpoint
    try:
        print("\n1. Testing /health endpoint...")
        response = requests.get(f"{url}/health", timeout=5)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        if response.status_code == 200:
            print("   ✓ Health check passed!")
        else:
            print("   ✗ Health check failed!")
    except requests.exceptions.ConnectionError as e:
        print(f"   ✗ Connection Error: {e}")
        print("   → Backend is not running or not accessible")
        return False
    except requests.exceptions.Timeout:
        print("   ✗ Request timed out")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    # Test CORS with OPTIONS request
    try:
        print("\n2. Testing CORS (OPTIONS request)...")
        response = requests.options(
            f"{url}/api/v1/auth/login",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            },
            timeout=5
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"     {header}: {value}")
        if 'access-control-allow-origin' in response.headers:
            print("   ✓ CORS is configured!")
        else:
            print("   ⚠ CORS headers not found")
    except Exception as e:
        print(f"   ⚠ CORS test error: {e}")
    
    # Test actual login endpoint (should fail with 422, not connection error)
    try:
        print("\n3. Testing /api/v1/auth/login endpoint...")
        response = requests.post(
            f"{url}/api/v1/auth/login",
            json={"login": "test", "password": "test"},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        if response.status_code in [200, 401, 422]:
            print("   ✓ Endpoint is reachable (got expected response)")
        else:
            print(f"   ⚠ Unexpected status code: {response.status_code}")
    except requests.exceptions.ConnectionError as e:
        print(f"   ✗ Connection Error: {e}")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✓ Backend is running and accessible!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)

