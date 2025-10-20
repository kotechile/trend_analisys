#!/usr/bin/env python3
"""
Direct test of DataForSEO Sandbox endpoints

This script tests the sandbox endpoints directly to verify they work with the correct base URL.
"""

import requests
import json
import base64

def test_sandbox_direct():
    """Test DataForSEO sandbox endpoints directly"""
    print("🧪 Testing DataForSEO Sandbox Endpoints Directly")
    print("=" * 60)
    
    # Use the correct sandbox base URL with /v3/ path
    base_url = "https://sandbox.dataforseo.com/v3"
    
    # You'll need to replace this with your actual sandbox API key
    # For testing, we'll use a placeholder
    api_key = "your_sandbox_api_key_here"
    
    print(f"Base URL: {base_url}")
    print(f"API Key: {api_key[:10]}..." if api_key != "your_sandbox_api_key_here" else "API Key: [Please set your actual API key]")
    
    if api_key == "your_sandbox_api_key_here":
        print("\n❌ Please update the API key in this script with your actual sandbox API key")
        print("You can get it from your Supabase database:")
        print("SELECT key_value FROM api_keys WHERE provider = 'dataforseo' AND is_active = true;")
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
    
    print(f"URL: {related_keywords_url}")
    print(f"Data: {json.dumps(related_keywords_data, indent=2)}")
    
    try:
        response = requests.post(related_keywords_url, headers=headers, json=related_keywords_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Related Keywords endpoint working!")
            result = response.json()
            print(f"Response keys: {list(result.keys())}")
            
            if 'tasks' in result and result['tasks']:
                print(f"Number of tasks: {len(result['tasks'])}")
                task = result['tasks'][0]
                print(f"Task status code: {task.get('status_code')}")
                
                if task.get('status_code') == 20000:
                    print("✅ Task completed successfully!")
                    if task.get('result'):
                        print(f"Sample result: {json.dumps(task['result'][0], indent=2)}")
                    else:
                        print("No results in response (this is normal for sandbox)")
                else:
                    print(f"❌ Task failed with status: {task.get('status_code')}")
                    print(f"Error: {task.get('status_message', 'Unknown error')}")
            else:
                print("No tasks in response")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
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
    
    print(f"URL: {keyword_ideas_url}")
    print(f"Data: {json.dumps(keyword_ideas_data, indent=2)}")
    
    try:
        response = requests.post(keyword_ideas_url, headers=headers, json=keyword_ideas_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Keyword Ideas endpoint working!")
            result = response.json()
            print(f"Response keys: {list(result.keys())}")
            
            if 'tasks' in result and result['tasks']:
                print(f"Number of tasks: {len(result['tasks'])}")
                task = result['tasks'][0]
                print(f"Task status code: {task.get('status_code')}")
                
                if task.get('status_code') == 20000:
                    print("✅ Task completed successfully!")
                    if task.get('result'):
                        print(f"Sample result: {json.dumps(task['result'][0], indent=2)}")
                    else:
                        print("No results in response (this is normal for sandbox)")
                else:
                    print(f"❌ Task failed with status: {task.get('status_code')}")
                    print(f"Error: {task.get('status_message', 'Unknown error')}")
            else:
                print("No tasks in response")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing keyword ideas: {e}")
    
    print("\n🎯 Summary:")
    print("If both endpoints return 200 status codes, your sandbox setup is working!")
    print("The responses will contain dummy data as expected in sandbox mode.")
    print("\nTo use this script:")
    print("1. Get your sandbox API key from Supabase database")
    print("2. Replace 'your_sandbox_api_key_here' with your actual key")
    print("3. Run: python test_sandbox_direct.py")

if __name__ == "__main__":
    test_sandbox_direct()
