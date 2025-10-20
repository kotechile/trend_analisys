#!/usr/bin/env python3
"""
Detailed test to debug the database storage issue
"""

import requests
import json
import sys

def test_detailed_debug():
    """Test with detailed debugging to see what's happening"""
    
    # Test the store endpoint
    url = "http://localhost:8000/api/v1/keyword-research/store"
    
    # Create test keyword data with explicit types
    test_keywords = [
        {
            "keyword": "test keyword 1",
            "search_volume": 1000,
            "cpc": 0.5,
            "competition": 0.3,  # This should be converted to 30
            "competition_level": "MEDIUM",
            "keyword_difficulty": 25,
            "difficulty": 25,
            "main_intent": "COMMERCIAL",
            "source": "keyword_ideas",
            "topic_id": "test-topic-123",
            "user_id": "test-user-123"
        }
    ]
    
    payload = test_keywords
    
    print("Testing database storage with detailed debugging...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("=" * 50)
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
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
    test_detailed_debug()
