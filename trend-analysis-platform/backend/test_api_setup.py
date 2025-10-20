#!/usr/bin/env python3
"""
Test your current DataForSEO API setup

This script tests your API through the server endpoints to see if the fixes work.
"""

import requests
import json

def test_health_endpoint():
    """Test the DataForSEO health endpoint"""
    print("🧪 Testing DataForSEO Health Endpoint")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:8000/api/v1/dataforseo/health", timeout=10)
        print(f"📈 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check successful!")
            print(f"📊 Response: {json.dumps(data, indent=2)}")
            
            if data.get("api_connected"):
                print("🎉 DataForSEO API is connected and ready!")
            else:
                print("⚠️  DataForSEO API is not connected")
                print(f"   Message: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ Health check failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_trend_analysis():
    """Test the trend analysis endpoint"""
    print("\n🧪 Testing Trend Analysis Endpoint")
    print("=" * 40)
    
    try:
        url = "http://localhost:8000/api/v1/trend-analysis/dataforseo"
        params = {
            "subtopics": "rugby,cricket",
            "location": "United States",
            "time_range": "12m"
        }
        
        print(f"🔗 URL: {url}")
        print(f"📊 Params: {params}")
        
        response = requests.get(url, params=params, timeout=30)
        print(f"📈 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Trend analysis successful!")
            print(f"📊 Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Trend analysis failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("DataForSEO API Setup Test")
    print("=" * 30)
    print("This tests your current API setup through the server.")
    print("Make sure your server is running: uvicorn main:app --reload")
    print()
    
    test_health_endpoint()
    test_trend_analysis()
