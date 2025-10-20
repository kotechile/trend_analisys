#!/usr/bin/env python3
"""
Test database storage to debug the remaining error
"""

import requests
import json

def test_database_storage():
    """Test storing keyword data to see the debugging output"""
    
    # Test the store endpoint
    url = "http://localhost:8000/api/v1/keyword-research/store"
    
    # Create test keyword data
    test_keywords = [
        {
            "keyword": "test keyword 1",
            "search_volume": 1000,
            "cpc": 0.50,
            "competition": 0.3,
            "competition_level": "MEDIUM",
            "keyword_difficulty": 25,
            "difficulty": 25,
            "main_intent": "COMMERCIAL",
            "source": "keyword_ideas",
            "topic_id": "test-topic-123",
            "user_id": "test-user-123"
        },
        {
            "keyword": "test keyword 2", 
            "search_volume": 2000,
            "cpc": 0.75,
            "competition": 0.5,
            "competition_level": "HIGH",
            "keyword_difficulty": 40,
            "difficulty": 40,
            "main_intent": "TRANSACTIONAL",
            "source": "related_keywords",
            "topic_id": "test-topic-123",
            "user_id": "test-user-123"
        }
    ]
    
    payload = test_keywords
    
    print("Testing database storage...")
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
    test_database_storage()
