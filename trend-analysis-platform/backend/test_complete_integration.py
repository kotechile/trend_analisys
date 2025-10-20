#!/usr/bin/env python3
"""
Complete integration test for both trend analysis and idea burst features
"""

import asyncio
import httpx
import json
from datetime import datetime

async def test_trend_analysis():
    """Test trend analysis feature"""
    print("🔍 Testing Trend Analysis...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Test trend analysis endpoint
        response = await client.get(
            "http://localhost:8000/api/v1/trend-analysis/dataforseo",
            params={
                "subtopics": "rugby,cricket",
                "location": "United States", 
                "time_range": "12m"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Trend Analysis: {len(data)} trends returned")
            for trend in data:
                print(f"   - {trend['subtopic']}: {trend['average_interest']}% interest")
            return True
        else:
            print(f"❌ Trend Analysis failed: {response.status_code}")
            print(response.text)
            return False

async def test_keyword_research():
    """Test keyword research feature"""
    print("\n🔍 Testing Keyword Research...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Test keyword research endpoint
        response = await client.post(
            "http://localhost:8000/api/v1/keyword-research/dataforseo",
            json={
                "seed_keywords": ["phone"],
                "max_difficulty": 50,
                "min_volume": 100,
                "intent_types": ["COMMERCIAL"],
                "max_results": 5
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Keyword Research: {len(data)} keywords returned")
            for keyword in data[:3]:  # Show first 3
                print(f"   - {keyword['keyword']}: {keyword['search_volume']} volume, {keyword['keyword_difficulty']} difficulty")
            return True
        else:
            print(f"❌ Keyword Research failed: {response.status_code}")
            print(response.text)
            return False

async def test_content_ideas():
    """Test content ideas generation"""
    print("\n🔍 Testing Content Ideas Generation...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Test content ideas endpoint
        response = await client.post(
            "http://localhost:8000/api/content-ideas/generate",
            json={
                "topic_id": "test-topic",
                "topic_title": "Phone Technology",
                "subtopics": ["phone", "mobile"],
                "keywords": ["phone", "mobile", "smartphone"],
                "user_id": "test-user",
                "content_types": ["blog", "software"]
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Content Ideas: {data.get('total_ideas', 0)} ideas generated")
            print(f"   - Blog ideas: {data.get('blog_ideas', 0)}")
            print(f"   - Software ideas: {data.get('software_ideas', 0)}")
            return True
        else:
            print(f"❌ Content Ideas failed: {response.status_code}")
            print(response.text)
            return False

async def test_related_keywords():
    """Test related keywords feature"""
    print("\n🔍 Testing Related Keywords...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Test related keywords endpoint (POST method)
        response = await client.post(
            "http://localhost:8000/api/v1/keyword-research/dataforseo/related",
            json={
                "keywords": ["phone"],
                "language_name": "English",
                "location_code": 2840,
                "limit": 5
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Related Keywords: {len(data)} related keywords returned")
            for kw in data[:3]:  # Show first 3
                print(f"   - {kw['keyword']}: {kw['search_volume']} volume")
            return True
        else:
            print(f"❌ Related Keywords failed: {response.status_code}")
            print(response.text)
            return False

async def main():
    """Run all tests"""
    print("🚀 Starting Complete Integration Test")
    print("=" * 50)
    
    # Test all features
    results = await asyncio.gather(
        test_trend_analysis(),
        test_keyword_research(), 
        test_content_ideas(),
        test_related_keywords(),
        return_exceptions=True
    )
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    
    features = [
        "Trend Analysis",
        "Keyword Research", 
        "Content Ideas",
        "Related Keywords"
    ]
    
    passed = 0
    for i, (feature, result) in enumerate(zip(features, results)):
        if isinstance(result, Exception):
            print(f"❌ {feature}: Error - {result}")
        elif result:
            print(f"✅ {feature}: PASSED")
            passed += 1
        else:
            print(f"❌ {feature}: FAILED")
    
    print(f"\n🎯 Overall: {passed}/{len(features)} features working")
    
    if passed == len(features):
        print("🎉 All features are working correctly!")
        print("\n📝 Frontend Integration Notes:")
        print("1. Trend Analysis: Call /api/v1/trend-analysis/dataforseo with GET + URL params")
        print("2. Keyword Research: Call /api/v1/keyword-research/dataforseo with POST + JSON body")
        print("3. Content Ideas: Call /api/content-ideas/generate with POST + JSON body")
        print("4. Related Keywords: Call /api/v1/dataforseo/related-keywords with GET + URL params")
    else:
        print("⚠️  Some features need attention. Check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())
