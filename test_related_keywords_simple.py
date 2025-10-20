#!/usr/bin/env python3
"""
Simple test to check related keywords API response
"""

import requests
import json

def test_related_keywords_api():
    """Test the related keywords API directly"""
    
    # Test the API endpoint
    url = "http://localhost:8000/api/v1/keyword-research/related-keywords"
    
    payload = {
        "keywords": ["green homes"],
        "depth": 2
    }
    
    print("Testing related keywords API...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("=" * 50)
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            print(f"Number of results: {len(data) if isinstance(data, list) else 'Not a list'}")
            
            if isinstance(data, list) and len(data) > 0:
                print("\nFirst result:")
                first_result = data[0]
                print(f"  Keys: {list(first_result.keys())}")
                print(f"  Keyword: {first_result.get('keyword', 'N/A')}")
                print(f"  Difficulty: {first_result.get('keyword_difficulty', 'N/A')} (type: {type(first_result.get('keyword_difficulty'))})")
                print(f"  Search Volume: {first_result.get('search_volume', 'N/A')}")
                print(f"  Source: {first_result.get('source', 'N/A')}")
                
                # Show raw data structure
                print(f"\nRaw first result:")
                print(json.dumps(first_result, indent=2, default=str))
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_related_keywords_api()
