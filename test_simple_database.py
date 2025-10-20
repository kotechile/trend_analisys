#!/usr/bin/env python3
"""
Simple test to debug database storage
"""

import requests
import json
import time

def test_simple_database():
    """Test with a unique keyword to avoid conflicts"""
    
    # Test the store endpoint with authentication and topic_id parameter
    url = "http://localhost:8000/api/v1/keyword-research/store"
    
    # Create test keyword data with unique keyword (no user_id or topic_id in payload)
    unique_keyword = f"test-keyword-{int(time.time())}"
    test_keywords = [
        {
            "keyword": unique_keyword,
            "search_volume": 1000,
            "cpc": 0.5,
            "competition": 0.3,
            "competition_level": "MEDIUM",
            "keyword_difficulty": 25,
            "difficulty": 25,
            "main_intent": "COMMERCIAL",
            "source": "keyword_ideas"
        }
    ]
    
    # Parameters for the request
    params = {
        "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4"  # Real topic ID from dropdown
    }
    
    # Headers with authentication token (using a test token for now)
    headers = {
        "Authorization": "Bearer test-token",  # This will work with the test auth middleware
        "Content-Type": "application/json"
    }
    
    print("Testing database storage with authentication...")
    print(f"URL: {url}")
    print(f"Topic ID: {params['topic_id']}")
    print(f"Unique keyword: {unique_keyword}")
    print(f"Payload: {json.dumps(test_keywords, indent=2)}")
    print("=" * 50)
    
    try:
        response = requests.post(url, json=test_keywords, params=params, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data}")
        else:
            print(f"Error Response: {response.text}")
            try:
                error_data = response.json()
                print(f"Error JSON: {json.dumps(error_data, indent=2)}")
            except:
                print("Could not parse error as JSON")
            
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_database()
