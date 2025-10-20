#!/usr/bin/env python3
"""
Test DataForSEO Sandbox Endpoints

This script tests the DataForSEO sandbox endpoints to verify they work correctly.
"""

import requests
import json
import base64
import os

def test_sandbox_endpoints():
    """Test DataForSEO sandbox endpoints"""
    print("🧪 Testing DataForSEO Sandbox Endpoints")
    print("=" * 50)
    
    # Get credentials from environment or database
    # For testing, we'll use the sandbox base URL with /v3/ path
    base_url = "https://sandbox.dataforseo.com/v3"
    
    # You'll need to set these environment variables or get from database
    api_key = os.getenv("DATAFORSEO_API_KEY")
    if not api_key:
        print("❌ DATAFORSEO_API_KEY not found in environment")
        print("Please set: export DATAFORSEO_API_KEY='your_sandbox_api_key'")
        return
    
    # Create Basic auth header
    cred = base64.b64encode(f"{api_key}:{api_key}".encode()).decode()
    headers = {
        "Authorization": f"Basic {cred}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Related Keywords endpoint
    print("\n🔍 Testing Related Keywords endpoint...")
    related_keywords_url = f"{base_url}/dataforseo_labs/google/related_keywords/live"
    related_keywords_data = [{
        "keyword": "phone",
        "language_name": "English",
        "location_code": 2840,
        "limit": 3
    }]
    
    try:
        response = requests.post(related_keywords_url, headers=headers, json=related_keywords_data)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Related Keywords endpoint working!")
            result = response.json()
            print(f"Response keys: {list(result.keys())}")
            if 'tasks' in result and result['tasks']:
                print(f"Number of tasks: {len(result['tasks'])}")
                if result['tasks'][0].get('status_code') == 20000:
                    print("✅ Task completed successfully!")
                    print(f"Sample result: {json.dumps(result['tasks'][0]['result'][0] if result['tasks'][0].get('result') else 'No results', indent=2)}")
                else:
                    print(f"❌ Task failed with status: {result['tasks'][0].get('status_code')}")
                    print(f"Error: {result['tasks'][0].get('status_message', 'Unknown error')}")
        else:
            print(f"❌ Request failed: {response.text}")
    except Exception as e:
        print(f"❌ Error testing related keywords: {e}")
    
    # Test 2: Keyword Ideas endpoint
    print("\n🔍 Testing Keyword Ideas endpoint...")
    keyword_ideas_url = f"{base_url}/dataforseo_labs/google/keyword_ideas/live"
    keyword_ideas_data = [{
        "keyword": "phone",
        "language_name": "English",
        "location_code": 2840,
        "limit": 3
    }]
    
    try:
        response = requests.post(keyword_ideas_url, headers=headers, json=keyword_ideas_data)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Keyword Ideas endpoint working!")
            result = response.json()
            print(f"Response keys: {list(result.keys())}")
            if 'tasks' in result and result['tasks']:
                print(f"Number of tasks: {len(result['tasks'])}")
                if result['tasks'][0].get('status_code') == 20000:
                    print("✅ Task completed successfully!")
                    print(f"Sample result: {json.dumps(result['tasks'][0]['result'][0] if result['tasks'][0].get('result') else 'No results', indent=2)}")
                else:
                    print(f"❌ Task failed with status: {result['tasks'][0].get('status_code')}")
                    print(f"Error: {result['tasks'][0].get('status_message', 'Unknown error')}")
        else:
            print(f"❌ Request failed: {response.text}")
    except Exception as e:
        print(f"❌ Error testing keyword ideas: {e}")
    
    print("\n🎯 Summary:")
    print("If both endpoints return 200 status codes, your sandbox setup is working!")
    print("The responses will contain dummy data as expected in sandbox mode.")

if __name__ == "__main__":
    test_sandbox_endpoints()
