#!/usr/bin/env python3
"""
Test DataForSEO API directly to check response structure
"""

import asyncio
import base64
import json
import httpx
from supabase import create_client
import os

async def test_dataforseo_direct():
    """Test DataForSEO API directly"""
    
    # Initialize Supabase client
    supabase_url = "https://dgcsqiaciyqvprtpopxg.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzA0NTk5NywiZXhwIjoyMDMyNjIxOTk3fQ.2j8X5YQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ"
    
    supabase = create_client(supabase_url, supabase_key)
    
    try:
        # Get DataForSEO credentials
        result = supabase.table('api_keys').select('key_value, base_url, user_name, password').eq('provider', 'dataforseo').eq('is_active', True).execute()
        
        if not result.data:
            print("❌ No DataForSEO credentials found")
            return
            
        cred = result.data[0]
        print(f"✅ Found credentials:")
        print(f"   Base URL: {cred.get('base_url')}")
        print(f"   User: {cred.get('user_name')}")
        print(f"   Password: {'*' * len(cred.get('password', ''))}")
        
        # Create auth header
        username = cred.get('user_name', '')
        password = cred.get('password', '')
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
        
        print(f"\n🧪 Testing DataForSEO API with {len(test_keywords)} keywords...")
        print(f"   Keywords: {test_keywords}")
        
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
                
                if isinstance(result, dict) and 'tasks' in result:
                    tasks = result.get('tasks', [])
                    print(f"   Tasks count: {len(tasks)}")
                    
                    if tasks and len(tasks) > 0:
                        task = tasks[0]
                        print(f"   First task keys: {list(task.keys()) if isinstance(task, dict) else 'Not a dict'}")
                        
                        if isinstance(task, dict) and 'result' in task:
                            task_results = task.get('result', [])
                            print(f"   Task results count: {len(task_results)}")
                            
                            if task_results and len(task_results) > 0:
                                task_result = task_results[0]
                                print(f"   First task result keys: {list(task_result.keys()) if isinstance(task_result, dict) else 'Not a dict'}")
                                
                                if isinstance(task_result, dict) and 'items' in task_result:
                                    items = task_result.get('items', [])
                                    print(f"   Items count: {len(items)}")
                                    
                                    if items and len(items) > 0:
                                        item = items[0]
                                        print(f"   First item keys: {list(item.keys()) if isinstance(item, dict) else 'Not a dict'}")
                                        
                                        # Check for None values that might cause issues
                                        for key, value in item.items():
                                            if value is None:
                                                print(f"   ⚠️  Found None value for key: {key}")
                                
                print(f"\n📄 Full response (first 1000 chars):")
                print(json.dumps(result, indent=2)[:1000] + "...")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_dataforseo_direct())
