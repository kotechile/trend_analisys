#!/usr/bin/env python3
"""
Test Frontend Integration

This script tests the endpoints that the frontend is calling to ensure they work correctly.
"""

import requests
import json

def test_trend_analysis_endpoint():
    """Test the trend analysis endpoint that the frontend calls"""
    print("🧪 Testing Trend Analysis Endpoint")
    print("=" * 50)
    
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
            print("✅ SUCCESS!")
            print(f"📊 Response: {json.dumps(data, indent=2)}")
            
            # Check if data has the expected structure
            if isinstance(data, list) and len(data) > 0:
                trend = data[0]
                required_fields = ['subtopic', 'average_interest', 'peak_interest', 'timeline_data']
                missing_fields = [field for field in required_fields if field not in trend]
                
                if missing_fields:
                    print(f"⚠️  Missing fields: {missing_fields}")
                else:
                    print("✅ All required fields present")
            else:
                print("⚠️  Response is not a list or is empty")
        else:
            print(f"❌ FAILED: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_content_ideas_endpoint():
    """Test the content ideas endpoint that the frontend calls"""
    print("\n🧪 Testing Content Ideas Endpoint")
    print("=" * 50)
    
    try:
        url = "http://localhost:8000/api/content-ideas/generate"
        data = {
            "topic_id": "test-topic-123",
            "topic_title": "Test Topic",
            "subtopics": ["rugby", "cricket"],
            "keywords": [],
            "user_id": "demo-user",
            "content_types": ["blog", "software"]
        }
        
        print(f"🔗 URL: {url}")
        print(f"📊 Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data, timeout=30)
        print(f"📈 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"📊 Response: {json.dumps(result, indent=2)}")
            
            # Check if response has the expected structure
            if 'ideas' in result and 'total_ideas' in result:
                print(f"✅ Generated {result['total_ideas']} ideas")
                print(f"✅ Response structure is correct")
            else:
                print("⚠️  Response structure might be unexpected")
        else:
            print(f"❌ FAILED: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_related_keywords_endpoint():
    """Test the related keywords endpoint"""
    print("\n🧪 Testing Related Keywords Endpoint")
    print("=" * 50)
    
    try:
        url = "http://localhost:8000/api/v1/keyword-research/dataforseo/related"
        data = {
            "keywords": ["phone"],
            "location": "United States",
            "limit": 3
        }
        
        print(f"🔗 URL: {url}")
        print(f"📊 Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data, timeout=30)
        print(f"📈 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"📊 Response: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ FAILED: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Frontend Integration Test")
    print("=" * 30)
    print("This tests the endpoints that the frontend calls.")
    print("Make sure your server is running: uvicorn main:app --reload")
    print()
    
    test_trend_analysis_endpoint()
    test_content_ideas_endpoint()
    test_related_keywords_endpoint()
    
    print("\n🎯 Summary:")
    print("If all tests pass, the frontend should now be able to:")
    print("1. ✅ Display trend analysis data")
    print("2. ✅ Generate content ideas (idea burst)")
    print("3. ✅ Show related keywords")
