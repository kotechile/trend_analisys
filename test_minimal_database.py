#!/usr/bin/env python3
"""
Minimal test to isolate the database error
"""

import requests
import json

def test_minimal_database():
    """Test with minimal data to isolate the database error"""
    
    # Test the store endpoint with minimal data
    url = "http://localhost:8000/api/v1/keyword-research/store"
    
    # Create minimal test keyword data
    test_keywords = [
        {
            "keyword": "test keyword minimal",
            "search_volume": 1000,
            "cpc": 0.5,
            "competition": 0.3,
            "keyword_difficulty": 25,
            "difficulty": 25,
            "source": "keyword_ideas",
            "topic_id": "test-topic-123",
            "user_id": "test-user-123"
        }
    ]
    
    payload = test_keywords
    
    print("Testing minimal database storage...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("=" * 50)
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_minimal_database()
