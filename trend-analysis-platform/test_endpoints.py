#!/usr/bin/env python3
"""
Test DataForSEO Endpoints

This script tests the DataForSEO API endpoints to verify they're working.
"""

import requests
import json

def test_endpoints():
    """Test all available endpoints"""
    base_url = "http://localhost:8000"
    
    print("🔍 Testing DataForSEO Endpoints")
    print("=" * 50)
    
    # Test basic health
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test DataForSEO health
    try:
        response = requests.get(f"{base_url}/api/v1/dataforseo/health")
        print(f"✅ DataForSEO health: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ DataForSEO health failed: {e}")
    
    # Test trend analysis
    try:
        response = requests.get(f"{base_url}/api/v1/trend-analysis/dataforseo", params={
            "subtopics": ["artificial intelligence"],
            "location": "United States",
            "time_range": "12m"
        })
        print(f"✅ Trend analysis: {response.status_code}")
        if response.status_code != 200:
            print(f"   Error: {response.text}")
        else:
            print(f"   Response: {json.dumps(response.json(), indent=2)[:200]}...")
    except Exception as e:
        print(f"❌ Trend analysis failed: {e}")
    
    # Test keyword research
    try:
        response = requests.post(f"{base_url}/api/v1/keyword-research/dataforseo", json={
            "seed_keywords": ["AI tools"],
            "max_difficulty": 50,
            "max_keywords": 10
        })
        print(f"✅ Keyword research: {response.status_code}")
        if response.status_code != 200:
            print(f"   Error: {response.text}")
        else:
            print(f"   Response: {json.dumps(response.json(), indent=2)[:200]}...")
    except Exception as e:
        print(f"❌ Keyword research failed: {e}")
    
    # List all available endpoints
    try:
        response = requests.get(f"{base_url}/openapi.json")
        if response.status_code == 200:
            openapi = response.json()
            paths = list(openapi.get("paths", {}).keys())
            print(f"\n📋 Available endpoints ({len(paths)}):")
            for path in sorted(paths):
                if "dataforseo" in path.lower():
                    print(f"   🔥 {path}")
                else:
                    print(f"   📍 {path}")
    except Exception as e:
        print(f"❌ Could not get endpoint list: {e}")

if __name__ == "__main__":
    test_endpoints()
