#!/usr/bin/env python3
"""
Simple test to check DataForSEO API response structure
"""

import asyncio
import base64
import json
import httpx

async def test_dataforseo_simple():
    """Test DataForSEO API with hardcoded credentials for testing"""
    
    # Test with sample credentials (you'll need to replace these with real ones)
    username = "your-username"
    password = "your-password"
    
    # Create auth header
    auth_string = f"{username}:{password}"
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    # Test with 4 keywords
    test_keywords = ["Eco friendly homes", "Eco homes design", "Sustainable houses", "Green living homes"]
    
    payload = [{
        "keywords": test_keywords,
        "location_code": 2840,
        "language_code": "en",
        "include_serp_info": True,
        "limit": 10
    }]
    
    print(f"🧪 Testing DataForSEO API with {len(test_keywords)} keywords...")
    print(f"   Keywords: {test_keywords}")
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live",
                headers={
                    "Authorization": f"Basic {auth_b64}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30.0
            )
            
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success! Response structure:")
                print(f"   Type: {type(result)}")
                print(f"   Keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
                
                # Analyze the response structure
                if isinstance(result, dict) and 'tasks' in result:
                    tasks = result.get('tasks', [])
                    print(f"   Tasks count: {len(tasks)}")
                    
                    if tasks and len(tasks) > 0:
                        task = tasks[0]
                        print(f"   First task type: {type(task)}")
                        print(f"   First task keys: {list(task.keys()) if isinstance(task, dict) else 'Not a dict'}")
                        
                        if isinstance(task, dict) and 'result' in task:
                            task_results = task.get('result', [])
                            print(f"   Task results type: {type(task_results)}")
                            print(f"   Task results count: {len(task_results)}")
                            
                            if task_results and len(task_results) > 0:
                                task_result = task_results[0]
                                print(f"   First task result type: {type(task_result)}")
                                print(f"   First task result keys: {list(task_result.keys()) if isinstance(task_result, dict) else 'Not a dict'}")
                                
                                if isinstance(task_result, dict) and 'items' in task_result:
                                    items = task_result.get('items', [])
                                    print(f"   Items type: {type(items)}")
                                    print(f"   Items count: {len(items)}")
                                    
                                    if items and len(items) > 0:
                                        item = items[0]
                                        print(f"   First item type: {type(item)}")
                                        print(f"   First item keys: {list(item.keys()) if isinstance(item, dict) else 'Not a dict'}")
                                        
                                        # Check for None values that might cause issues
                                        none_keys = []
                                        for key, value in item.items():
                                            if value is None:
                                                none_keys.append(key)
                                        
                                        if none_keys:
                                            print(f"   ⚠️  Found None values for keys: {none_keys}")
                                        else:
                                            print(f"   ✅ No None values found in first item")
                                
                print(f"\n📄 Full response (first 2000 chars):")
                print(json.dumps(result, indent=2)[:2000] + "...")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("⚠️  Note: This test uses placeholder credentials.")
    print("   Replace 'your-username' and 'your-password' with real DataForSEO credentials.")
    print("   You can get these from your Supabase database or DataForSEO dashboard.")
    print()
    asyncio.run(test_dataforseo_simple())
