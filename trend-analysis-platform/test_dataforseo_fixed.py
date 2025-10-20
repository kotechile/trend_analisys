#!/usr/bin/env python3
"""
Test DataForSEO API with corrected implementation

This script tests the DataForSEO API using the exact format from your working curl example.
"""

import asyncio
import httpx
import base64
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_dataforseo_api():
    """Test DataForSEO API with corrected format"""
    print("🧪 Testing DataForSEO API with Corrected Format")
    print("=" * 60)
    
    # Configuration - you'll need to update these with your actual credentials
    login = "your_login_here"  # Replace with your DataForSEO login
    password = "your_password_here"  # Replace with your DataForSEO password
    base_url = "https://api.dataforseo.com/v3"  # or sandbox URL if testing sandbox
    
    if login == "your_login_here" or password == "your_password_here":
        print("❌ Please update the login and password in this script")
        print("Get them from your Supabase database:")
        print("SELECT key_value FROM api_keys WHERE provider = 'dataforseo' AND is_active = true;")
        print("Note: The key_value should be the base64 encoded login:password")
        return
    
    # Create Basic auth header exactly like your working curl example
    cred = base64.b64encode(f"{login}:{password}".encode()).decode()
    headers = {
        "Authorization": f"Basic {cred}",
        "Content-Type": "application/json"
    }
    
    # Test data using the exact format from your working example
    test_data = [{
        "location_name": "United States",
        "date_from": "2019-01-01",
        "date_to": "2020-01-01",
        "type": "youtube",
        "category_code": 3,
        "keywords": [
            "rugby",
            "cricket"
        ]
    }]
    
    url = f"{base_url}/keywords_data/google_trends/explore/live"
    
    print(f"🔗 URL: {url}")
    print(f"📊 Data: {json.dumps(test_data, indent=2)}")
    print(f"🔑 Auth: Basic {cred[:20]}...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print("\n🚀 Making API request...")
            response = await client.post(url, headers=headers, json=test_data)
            
            print(f"📈 Response Status: {response.status_code}")
            print(f"📋 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS! API call worked")
                print(f"📊 Response Data: {json.dumps(data, indent=2)}")
                
                # Check if we have tasks in the response
                if "tasks" in data and len(data["tasks"]) > 0:
                    task = data["tasks"][0]
                    print(f"📋 Task Status: {task.get('status_code', 'Unknown')}")
                    print(f"💬 Task Message: {task.get('status_message', 'No message')}")
                    
                    if "result" in task and len(task["result"]) > 0:
                        print(f"📈 Results: {len(task['result'])} items")
                        for i, result in enumerate(task["result"]):
                            print(f"  Result {i+1}: {json.dumps(result, indent=4)}")
                    else:
                        print("📭 No results in response (this is normal for sandbox)")
                else:
                    print("📭 No tasks in response")
            else:
                print(f"❌ FAILED! Status: {response.status_code}")
                print(f"📄 Response: {response.text}")
                
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP Error: {e.response.status_code}")
        print(f"📄 Response: {e.response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")

async def test_sandbox_api():
    """Test DataForSEO Sandbox API"""
    print("\n🧪 Testing DataForSEO Sandbox API")
    print("=" * 60)
    
    # Sandbox configuration
    login = "your_sandbox_login_here"
    password = "your_sandbox_password_here"
    base_url = "https://sandbox.dataforseo.com/v3"
    
    if login == "your_sandbox_login_here" or password == "your_sandbox_password_here":
        print("❌ Please update the sandbox login and password in this script")
        return
    
    # Create Basic auth header
    cred = base64.b64encode(f"{login}:{password}".encode()).decode()
    headers = {
        "Authorization": f"Basic {cred}",
        "Content-Type": "application/json"
    }
    
    # Test data
    test_data = [{
        "location_name": "United States",
        "date_from": "2019-01-01",
        "date_to": "2020-01-01",
        "type": "youtube",
        "category_code": 3,
        "keywords": [
            "rugby",
            "cricket"
        ]
    }]
    
    url = f"{base_url}/keywords_data/google_trends/explore/live"
    
    print(f"🔗 Sandbox URL: {url}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print("🚀 Making sandbox API request...")
            response = await client.post(url, headers=headers, json=test_data)
            
            print(f"📈 Sandbox Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Sandbox API call worked!")
                print(f"📊 Sandbox Response: {json.dumps(data, indent=2)}")
            else:
                print(f"❌ Sandbox API failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Sandbox Error: {e}")

if __name__ == "__main__":
    print("DataForSEO API Test Script")
    print("=" * 60)
    print("This script tests the DataForSEO API using the exact format from your working curl example.")
    print("\nTo use this script:")
    print("1. Update the login and password variables with your actual DataForSEO credentials")
    print("2. Run: python test_dataforseo_fixed.py")
    print("\nFor sandbox testing:")
    print("1. Update the sandbox login and password variables")
    print("2. The script will test both production and sandbox endpoints")
    
    # Run the tests
    asyncio.run(test_dataforseo_api())
    asyncio.run(test_sandbox_api())
