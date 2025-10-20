#!/usr/bin/env python3
"""
Quick test of DataForSEO Sandbox with correct base URL

This script tests the sandbox endpoints with the correct base URL including /v3/
"""

import requests
import json
import base64

def test_sandbox_quick():
    """Test DataForSEO sandbox with correct base URL"""
    print("🧪 Quick DataForSEO Sandbox Test")
    print("=" * 40)
    
    # Use the correct sandbox base URL with /v3/ path
    base_url = "https://sandbox.dataforseo.com/v3"
    
    # You need to replace this with your actual sandbox API key
    # Get it from your Supabase database:
    # SELECT key_value FROM api_keys WHERE provider = 'dataforseo' AND is_active = true;
    api_key = "YOUR_SANDBOX_API_KEY_HERE"
    
    if api_key == "YOUR_SANDBOX_API_KEY_HERE":
        print("❌ Please update the API key in this script")
        print("Get it from Supabase: SELECT key_value FROM api_keys WHERE provider = 'dataforseo' AND is_active = true;")
        return
    
    # Create Basic auth header
    cred = base64.b64encode(f"{api_key}:{api_key}".encode()).decode()
    headers = {
        "Authorization": f"Basic {cred}",
        "Content-Type": "application/json"
    }
    
    # Test Related Keywords endpoint
    print(f"\n🔍 Testing Related Keywords...")
    print(f"URL: {base_url}/dataforseo_labs/google/related_keywords/live")
    
    data = [{
        "keyword": "phone",
        "language_name": "English",
        "location_code": 2840,
        "limit": 3
    }]
    
    try:
        response = requests.post(
            f"{base_url}/dataforseo_labs/google/related_keywords/live",
            headers=headers,
            json=data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! Sandbox endpoint is working!")
            result = response.json()
            print(f"Response keys: {list(result.keys())}")
            
            if 'tasks' in result and result['tasks']:
                task = result['tasks'][0]
                print(f"Task status: {task.get('status_code')}")
                if task.get('status_code') == 20000:
                    print("✅ Task completed successfully!")
                    print("🎉 Your sandbox setup is working correctly!")
                else:
                    print(f"❌ Task failed: {task.get('status_message')}")
            else:
                print("No tasks in response")
        else:
            print(f"❌ Request failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print(f"\n🎯 If you see 'SUCCESS!' above, your sandbox is working!")
    print(f"   The issue is just that the server can't read from Supabase due to SSL.")

if __name__ == "__main__":
    test_sandbox_quick()
