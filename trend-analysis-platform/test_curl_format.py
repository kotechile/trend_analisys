#!/usr/bin/env python3
"""
Test DataForSEO API using the exact curl format from your working example

This script replicates your working curl command in Python to verify the API works.
"""

import requests
import base64
import json

def test_dataforseo_curl_format():
    """Test DataForSEO API using the exact format from your working curl example"""
    print("🧪 Testing DataForSEO API - Curl Format Replication")
    print("=" * 60)
    
    # Your working curl example parameters
    login = "your_login_here"  # Replace with your actual login
    password = "your_password_here"  # Replace with your actual password
    
    if login == "your_login_here" or password == "your_password_here":
        print("❌ Please update the login and password in this script")
        print("Use the same credentials from your working curl example")
        return
    
    # Create Basic auth exactly like your curl example
    cred = base64.b64encode(f"{login}:{password}".encode()).decode()
    
    # Headers exactly like your curl example
    headers = {
        "Authorization": f"Basic {cred}",
        "Content-Type": "application/json"
    }
    
    # Data exactly like your curl example
    data = [{
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
    
    # URL exactly like your curl example
    url = "https://api.dataforseo.com/v3/keywords_data/google_trends/explore/live"
    
    print(f"🔗 URL: {url}")
    print(f"🔑 Auth: Basic {cred[:20]}...")
    print(f"📊 Data: {json.dumps(data, indent=2)}")
    
    try:
        print("\n🚀 Making request...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"📈 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! API call worked")
            data = response.json()
            print(f"📊 Response: {json.dumps(data, indent=2)}")
            
            # Check for tasks
            if "tasks" in data and len(data["tasks"]) > 0:
                task = data["tasks"][0]
                print(f"\n📋 Task Status: {task.get('status_code', 'Unknown')}")
                print(f"💬 Task Message: {task.get('status_message', 'No message')}")
                
                if "result" in task and len(task["result"]) > 0:
                    print(f"📈 Results: {len(task['result'])} items")
                    for i, result in enumerate(task["result"]):
                        print(f"\n  Result {i+1}:")
                        print(f"    Keywords: {result.get('keywords', [])}")
                        if 'interest_over_time' in result:
                            print(f"    Interest Over Time: {result['interest_over_time']}")
                        if 'related_queries' in result:
                            print(f"    Related Queries: {result['related_queries']}")
                else:
                    print("📭 No results in response")
            else:
                print("📭 No tasks in response")
        else:
            print(f"❌ FAILED! Status: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")

def test_sandbox_curl_format():
    """Test DataForSEO Sandbox using curl format"""
    print("\n🧪 Testing DataForSEO Sandbox - Curl Format")
    print("=" * 60)
    
    # Sandbox credentials
    login = "your_sandbox_login_here"
    password = "your_sandbox_password_here"
    
    if login == "your_sandbox_login_here" or password == "your_sandbox_password_here":
        print("❌ Please update the sandbox login and password")
        return
    
    # Create Basic auth
    cred = base64.b64encode(f"{login}:{password}".encode()).decode()
    
    headers = {
        "Authorization": f"Basic {cred}",
        "Content-Type": "application/json"
    }
    
    data = [{
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
    
    # Sandbox URL
    url = "https://sandbox.dataforseo.com/v3/keywords_data/google_trends/explore/live"
    
    print(f"🔗 Sandbox URL: {url}")
    
    try:
        print("🚀 Making sandbox request...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"📈 Sandbox Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Sandbox API call worked!")
            data = response.json()
            print(f"📊 Sandbox Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Sandbox failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Sandbox Error: {e}")

if __name__ == "__main__":
    print("DataForSEO API Test - Curl Format Replication")
    print("=" * 60)
    print("This script replicates your working curl command exactly.")
    print("\nTo use:")
    print("1. Update login and password with your actual DataForSEO credentials")
    print("2. Run: python test_curl_format.py")
    print("\nThis will test both production and sandbox endpoints.")
    
    # Test production API
    test_dataforseo_curl_format()
    
    # Test sandbox API
    test_sandbox_curl_format()
