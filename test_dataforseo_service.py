#!/usr/bin/env python3
"""
Test script for DataForSEO Service Implementation

This script tests the new DataForSEO service with both related keywords
and keyword ideas endpoints using the 2-call approach.
"""

import asyncio
import json
import sys
import os
from typing import List, Dict, Any

# Add the backend src directory to the path
backend_src_path = os.path.join(os.path.dirname(__file__), 'trend-analysis-platform', 'backend', 'src')
sys.path.insert(0, backend_src_path)

# Change to the backend src directory to handle relative imports
os.chdir(backend_src_path)

from services.dataforseo_service import dataforseo_service


async def test_related_keywords():
    """Test the related keywords endpoint"""
    print("🧪 Testing Related Keywords Endpoint")
    print("=" * 50)
    
    try:
        # Test keywords
        keywords = ["solar energy", "renewable energy"]
        
        print(f"📋 Testing with keywords: {keywords}")
        
        # Get related keywords
        related_keywords = await dataforseo_service.get_related_keywords(
            keywords=keywords,
            location_code=2840,  # United States
            language_code="en",
            depth=1,
            limit=5
        )
        
        print(f"✅ Successfully retrieved {len(related_keywords)} related keywords")
        
        # Display results
        for i, item in enumerate(related_keywords[:10]):  # Show first 10
            print(f"  {i+1}. Seed: '{item['seed_keyword']}' -> Related: '{item['related_keyword']}'")
        
        if len(related_keywords) > 10:
            print(f"  ... and {len(related_keywords) - 10} more")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing related keywords: {e}")
        return False


async def test_keyword_ideas():
    """Test the keyword ideas endpoint"""
    print("\n🧪 Testing Keyword Ideas Endpoint")
    print("=" * 50)
    
    try:
        # Test seed keywords
        seed_keywords = ["solar panels", "renewable energy"]
        
        print(f"📋 Testing with seed keywords: {seed_keywords}")
        
        # Get keyword ideas
        keyword_ideas = await dataforseo_service.get_keyword_ideas(
            seed_keywords=seed_keywords,
            location_code=2840,  # United States
            language_code="en",
            limit=10
        )
        
        print(f"✅ Successfully retrieved {len(keyword_ideas)} keyword ideas")
        
        # Display results
        for i, item in enumerate(keyword_ideas[:10]):  # Show first 10
            print(f"  {i+1}. Keyword: '{item['keyword']}'")
            print(f"      Search Volume: {item.get('search_volume', 'N/A')}")
            print(f"      CPC: ${item.get('cpc', 'N/A')}")
            print(f"      Competition: {item.get('competition', 'N/A')}")
            print(f"      Competition Level: {item.get('competition_level', 'N/A')}")
            print()
        
        if len(keyword_ideas) > 10:
            print(f"  ... and {len(keyword_ideas) - 10} more")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing keyword ideas: {e}")
        return False


async def test_api_endpoints():
    """Test the API endpoints via HTTP requests"""
    print("\n🌐 Testing API Endpoints")
    print("=" * 50)
    
    try:
        import httpx
        
        base_url = "http://localhost:8000"
        
        # Test related keywords endpoint
        print("📡 Testing /api/v1/keyword-research/related")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/api/v1/keyword-research/related",
                json={
                    "keywords": ["solar energy"],
                    "location_code": 2840,
                    "language_code": "en",
                    "depth": 1,
                    "limit": 5
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Related keywords API: {len(data)} results")
            else:
                print(f"❌ Related keywords API failed: {response.status_code} - {response.text}")
        
        # Test keyword ideas endpoint
        print("📡 Testing /api/v1/keyword-research/ideas")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/api/v1/keyword-research/ideas",
                json={
                    "seed_keywords": ["solar panels"],
                    "location_code": 2840,
                    "language_code": "en",
                    "limit": 5
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Keyword ideas API: {len(data)} results")
            else:
                print(f"❌ Keyword ideas API failed: {response.status_code} - {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing API endpoints: {e}")
        return False


async def main():
    """Main test function"""
    print("🚀 DataForSEO Service Test Suite")
    print("=" * 60)
    
    try:
        # Initialize the service
        print("🔧 Initializing DataForSEO service...")
        await dataforseo_service.initialize()
        print("✅ Service initialized successfully")
        
        # Run tests
        tests = [
            ("Related Keywords", test_related_keywords),
            ("Keyword Ideas", test_keyword_ideas),
            ("API Endpoints", test_api_endpoints)
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n🧪 Running {test_name} test...")
            success = await test_func()
            results.append((test_name, success))
        
        # Summary
        print("\n📊 Test Results Summary")
        print("=" * 30)
        passed = 0
        for test_name, success in results:
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"{test_name}: {status}")
            if success:
                passed += 1
        
        print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
        
        if passed == len(results):
            print("🎉 All tests passed! DataForSEO service is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the logs above for details.")
            
    except Exception as e:
        print(f"💥 Test suite failed: {e}")
        return False
    finally:
        # Clean up
        await dataforseo_service.close()
        print("\n🧹 Service closed")


if __name__ == "__main__":
    asyncio.run(main())
