#!/usr/bin/env python3
"""
Test with the exact format the frontend is sending
"""

import requests
import json
import time

def test_frontend_format():
    """Test with the exact format the frontend is sending"""
    
    # Test the store endpoint
    url = "http://localhost:8000/api/v1/keyword-research/store"
    
    # Create test data in the exact format the frontend sends
    test_keywords = [
        {
            "keyword": "green home",
            "search_volume": 1300,
            "keyword_difficulty": 33,
            "difficulty": 33,
            "cpc": 6.33,
            "competition": 0.3,
            "competition_level": "MEDIUM",
            "main_intent": "COMMERCIAL",
            "source": "keyword_ideas",
            "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
            "user_id": "f248b7ed-b8df-4464-8304d7ae4c30"
        },
        {
            "keyword": "eco friendly house",
            "search_volume": 880,
            "keyword_difficulty": 16,
            "difficulty": 16,
            "cpc": 3.96,
            "competition": 0.2,
            "competition_level": "LOW",
            "main_intent": "COMMERCIAL",
            "source": "related_keywords",
            "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
            "user_id": "f248b7ed-b8df-4464-8304d7ae4c30"
        }
    ]
    
    print("Testing with frontend data format...")
    print(f"URL: {url}")
    print(f"Number of keywords: {len(test_keywords)}")
    print(f"First keyword: {test_keywords[0]['keyword']}")
    print(f"Topic ID: {test_keywords[0]['topic_id']}")
    print(f"User ID: {test_keywords[0]['user_id']}")
    print("=" * 50)
    
    try:
        response = requests.post(url, json=test_keywords, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data}")
        else:
            print(f"❌ Error Response: {response.text}")
            try:
                error_data = response.json()
                print(f"❌ Error JSON: {json.dumps(error_data, indent=2)}")
            except:
                print("Could not parse error as JSON")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_frontend_format()
