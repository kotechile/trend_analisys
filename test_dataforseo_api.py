#!/usr/bin/env python3
"""
Test script for DataForSEO API Endpoints

This script tests the new DataForSEO API endpoints using HTTP requests.
"""

import asyncio
import httpx
import json
import sys


async def test_api_endpoints():
    """Test the API endpoints via HTTP requests"""
    print("🌐 Testing DataForSEO API Endpoints")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Test related keywords endpoint
            print("📡 Testing /api/v1/keyword-research/related-keywords")
            print("-" * 40)
            
            try:
                response = await client.post(
                    f"{base_url}/api/v1/keyword-research/related-keywords",
                    json={
                        "keywords": ["solar energy", "renewable energy"],
                        "location_code": 2840,
                        "language_code": "en",
                        "depth": 1,
                        "limit": 5
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Related keywords API: {len(data)} results")
                    
                    # Show first few results
                    for i, item in enumerate(data[:3]):
                        print(f"  {i+1}. Seed: '{item.get('seed_keyword', 'N/A')}' -> Related: '{item.get('related_keyword', 'N/A')}'")
                    
                    if len(data) > 3:
                        print(f"  ... and {len(data) - 3} more")
                else:
                    print(f"❌ Related keywords API failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing related keywords: {e}")
            
            print()
            
            # Test keyword ideas endpoint
            print("📡 Testing /api/v1/keyword-research/keyword-ideas")
            print("-" * 40)
            
            try:
                response = await client.post(
                    f"{base_url}/api/v1/keyword-research/keyword-ideas",
                    json={
                        "seed_keywords": ["solar panels", "renewable energy"],
                        "location_code": 2840,
                        "language_code": "en",
                        "limit": 5
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Keyword ideas API: {len(data)} results")
                    
                    # Show first few results
                    for i, item in enumerate(data[:3]):
                        print(f"  {i+1}. Keyword: '{item.get('keyword', 'N/A')}'")
                        print(f"      Search Volume: {item.get('search_volume', 'N/A')}")
                        print(f"      CPC: ${item.get('cpc', 'N/A')}")
                        print(f"      Competition: {item.get('competition', 'N/A')}")
                        print()
                    
                    if len(data) > 3:
                        print(f"  ... and {len(data) - 3} more")
                else:
                    print(f"❌ Keyword ideas API failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing keyword ideas: {e}")
            
            print()
            
            # Test health endpoint
            print("📡 Testing /api/v1/dataforseo/health")
            print("-" * 40)
            
            try:
                response = await client.get(f"{base_url}/api/v1/dataforseo/health")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Health check: {data.get('status', 'unknown')}")
                    print(f"   Message: {data.get('message', 'N/A')}")
                    print(f"   API Connected: {data.get('api_connected', False)}")
                    if 'base_url' in data:
                        print(f"   Base URL: {data.get('base_url', 'N/A')}")
                else:
                    print(f"❌ Health check failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing health check: {e}")
        
        print("\n🎯 API endpoint testing completed!")
        return True
        
    except Exception as e:
        print(f"💥 Test failed: {e}")
        return False


async def main():
    """Main test function"""
    print("🚀 DataForSEO API Test Suite")
    print("=" * 60)
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    success = await test_api_endpoints()
    
    if success:
        print("\n🎉 API tests completed successfully!")
    else:
        print("\n⚠️  Some API tests failed. Check the logs above for details.")


if __name__ == "__main__":
    asyncio.run(main())
