#!/usr/bin/env python3
"""
Test DataForSEO authentication issue
"""

import requests
import json
import base64

def test_auth():
    """Test DataForSEO authentication"""
    print("🔐 Testing DataForSEO Authentication")
    print("=" * 40)
    
    # Get API key from environment or use a test one
    api_key = "YOUR_API_KEY_HERE"  # Replace with actual key
    
    if api_key == "YOUR_API_KEY_HERE":
        print("❌ Please update the API key in this script")
        print("Get it from Supabase: SELECT key_value FROM api_keys WHERE provider = 'dataforseo' AND is_active = true;")
        return
    
    # Create Basic auth header
    cred = base64.b64encode(f"{api_key}:{api_key}".encode()).decode()
    headers = {
        "Authorization": f"Basic {cred}",
        "Content-Type": "application/json"
    }
    
    # Test with minimal request
    data = [{
        "keyword": "test",
        "language_name": "English",
        "location_code": 2840,
        "limit": 1
    }]
    
    try:
        response = requests.post(
            "https://sandbox.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live",
            headers=headers,
            json=data,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('status_code') == 20000:
                print("✅ Authentication successful!")
            else:
                print(f"❌ API Error: {result.get('status_message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_auth()
