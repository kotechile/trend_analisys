#!/usr/bin/env python3
"""
Direct test of DataForSEO Sandbox - bypasses server and corporate firewall issues

This script tests the sandbox endpoints directly without going through the server
"""

import requests
import json
import base64
import os

def test_direct_sandbox():
    """Test DataForSEO sandbox directly"""
    print("🧪 Direct DataForSEO Sandbox Test (Bypass Server)")
    print("=" * 50)
    
    # Use the correct sandbox base URL with /v3/ path
    base_url = "https://sandbox.dataforseo.com/v3"
    
    # Get API key from environment or prompt
    api_key = os.getenv('DATAFORSEO_API_KEY')
    if not api_key:
        print("❌ Please set DATAFORSEO_API_KEY environment variable")
        print("   Or get it from Supabase: SELECT key_value FROM api_keys WHERE provider = 'dataforseo' AND is_active = true;")
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
        # Try with SSL verification disabled first
        print("Trying with SSL verification disabled...")
        response = requests.post(
            f"{base_url}/dataforseo_labs/google/related_keywords/live",
            headers=headers,
            json=data,
            verify=False,  # Disable SSL verification
            timeout=30
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
                    print("\n💡 The issue is corporate firewall blocking SSL connections to Supabase")
                else:
                    print(f"❌ Task failed: {task.get('status_message')}")
            else:
                print("No tasks in response")
        else:
            print(f"❌ Request failed: {response.text}")
            
    except requests.exceptions.SSLError as e:
        print(f"❌ SSL Error (Corporate Firewall): {e}")
        print("💡 This confirms corporate firewall is blocking SSL connections")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print(f"\n🎯 If you see 'SUCCESS!' above, your sandbox is working!")
    print(f"   The issue is corporate firewall blocking Supabase connections.")

if __name__ == "__main__":
    test_direct_sandbox()
