#!/usr/bin/env python3
"""
Test script to verify DataForSEO integration is working correctly.
"""

import httpx
import asyncio
import json

async def test_dataforseo_integration():
    """Test all DataForSEO endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing DataForSEO Integration")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/api/v1/dataforseo/health")
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ Health Check: {health_data.get('status')}")
                print(f"   API Connected: {health_data.get('api_connected')}")
                print(f"   Base URL: {health_data.get('base_url')}")
            else:
                print(f"❌ Health Check Failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Health Check Error: {e}")
        return False
    
    # Test 2: Keyword Research
    print("\n2. Testing Keyword Research...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/api/v1/keyword-research/dataforseo",
                json={
                    "seed_keywords": ["AI tools"],
                    "max_difficulty": 50,
                    "max_keywords": 3
                }
            )
            if response.status_code == 200:
                keywords = response.json()
                print(f"✅ Keyword Research: {len(keywords)} keywords returned")
                if keywords:
                    print(f"   Sample: {keywords[0]}")
                else:
                    print("   Note: Empty results (expected with sandbox)")
            else:
                print(f"❌ Keyword Research Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Keyword Research Error: {e}")
    
    # Test 3: Related Keywords
    print("\n3. Testing Related Keywords...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/api/v1/keyword-research/dataforseo/related",
                json={
                    "keywords": ["AI tools"],
                    "limit": 3
                }
            )
            if response.status_code == 200:
                related = response.json()
                print(f"✅ Related Keywords: {len(related)} keywords returned")
                if related:
                    print(f"   Sample: {related[0]}")
                else:
                    print("   Note: Empty results (expected with sandbox)")
            else:
                print(f"❌ Related Keywords Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Related Keywords Error: {e}")
    
    # Test 4: Trend Analysis
    print("\n4. Testing Trend Analysis...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{base_url}/api/v1/trend-analysis/dataforseo",
                params={
                    "subtopics": "AI tools",
                    "location": "United States",
                    "time_range": "12m"
                }
            )
            if response.status_code == 200:
                trends = response.json()
                print(f"✅ Trend Analysis: {len(trends)} trends returned")
                if trends:
                    print(f"   Sample: {trends[0]}")
                else:
                    print("   Note: Empty results (expected with sandbox)")
            else:
                print(f"❌ Trend Analysis Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Trend Analysis Error: {e}")
    
    print("\n🎯 Integration Test Complete!")
    print("Note: Empty results are expected with DataForSEO sandbox environment.")
    print("The important thing is that endpoints are responding without errors.")

if __name__ == "__main__":
    asyncio.run(test_dataforseo_integration())
