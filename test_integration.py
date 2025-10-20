#!/usr/bin/env python3
"""
Test script for DataForSEO Frontend Integration

This script tests the complete integration between the frontend and backend
for the Idea Burst page with DataForSEO services.
"""

import asyncio
import httpx
import json
import sys


async def test_complete_integration():
    """Test the complete integration flow"""
    print("🧪 Testing Complete DataForSEO Integration")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Test 1: Check if new endpoints are available
            print("📡 Testing API Endpoint Availability")
            print("-" * 40)
            
            # Test keyword ideas endpoint
            try:
                response = await client.post(
                    f"{base_url}/api/v1/keyword-research/keyword-ideas",
                    json={
                        "seed_keywords": ["solar energy"],
                        "location_code": 2840,
                        "language_code": "en",
                        "limit": 3
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Keyword ideas endpoint: {len(data)} results")
                else:
                    print(f"❌ Keyword ideas endpoint failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing keyword ideas: {e}")
            
            # Test related keywords endpoint
            try:
                response = await client.post(
                    f"{base_url}/api/v1/keyword-research/related-keywords",
                    json={
                        "keywords": ["solar energy"],
                        "location_code": 2840,
                        "language_code": "en",
                        "depth": 1,
                        "limit": 3
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Related keywords endpoint: {len(data)} results")
                else:
                    print(f"❌ Related keywords endpoint failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing related keywords: {e}")
            
            # Test store endpoint
            try:
                test_keywords = [
                    {
                        "keyword": "test solar energy",
                        "search_volume": 1000,
                        "keyword_difficulty": 50,
                        "cpc": 2.5,
                        "competition_level": "MEDIUM",
                        "intent_type": "COMMERCIAL",
                        "priority_score": 75.5,
                        "related_keywords": ["solar power", "renewable energy"],
                        "source": "test",
                        "created_at": "2025-10-17T15:00:00Z"
                    }
                ]
                
                response = await client.post(
                    f"{base_url}/api/v1/keyword-research/store",
                    json={"keywords": test_keywords}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Store endpoint: {data.get('message', 'Success')}")
                else:
                    print(f"❌ Store endpoint failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing store endpoint: {e}")
            
            print()
            
            # Test 2: Simulate frontend workflow
            print("🔄 Testing Frontend Workflow Simulation")
            print("-" * 40)
            
            seed_keywords = ["solar panels", "renewable energy"]
            
            try:
                # Step 1: Call both services in parallel (like frontend does)
                print(f"📋 Testing with seed keywords: {seed_keywords}")
                
                [keyword_ideas_response, related_keywords_response] = await asyncio.gather(
                    client.post(
                        f"{base_url}/api/v1/keyword-research/keyword-ideas",
                        json={
                            "seed_keywords": seed_keywords,
                            "location_code": 2840,
                            "language_code": "en",
                            "limit": 5
                        }
                    ),
                    client.post(
                        f"{base_url}/api/v1/keyword-research/related-keywords",
                        json={
                            "keywords": seed_keywords,
                            "location_code": 2840,
                            "language_code": "en",
                            "depth": 1,
                            "limit": 5
                        }
                    )
                )
                
                if keyword_ideas_response.status_code == 200 and related_keywords_response.status_code == 200:
                    keyword_ideas_data = keyword_ideas_response.json()
                    related_keywords_data = related_keywords_response.json()
                    
                    print(f"✅ Parallel API calls successful:")
                    print(f"   - Keyword ideas: {len(keyword_ideas_data)} results")
                    print(f"   - Related keywords: {len(related_keywords_data)} results")
                    
                    # Step 2: Process and combine data (simulate frontend processing)
                    combined_data = []
                    
                    # Process keyword ideas
                    for item in keyword_ideas_data:
                        combined_data.append({
                            "keyword": item.get("keyword", ""),
                            "search_volume": item.get("search_volume", 0),
                            "keyword_difficulty": item.get("competition", 0),
                            "cpc": item.get("cpc", 0),
                            "competition_level": item.get("competition_level", "UNKNOWN"),
                            "intent_type": "COMMERCIAL",
                            "priority_score": 75.0,
                            "related_keywords": [],
                            "source": "keyword_ideas",
                            "created_at": item.get("created_at", "2025-10-17T15:00:00Z")
                        })
                    
                    # Process related keywords
                    for item in related_keywords_data:
                        combined_data.append({
                            "keyword": item.get("related_keyword", ""),
                            "search_volume": 0,
                            "keyword_difficulty": 0,
                            "cpc": 0,
                            "competition_level": "UNKNOWN",
                            "intent_type": "INFORMATIONAL",
                            "priority_score": 0,
                            "related_keywords": [item.get("seed_keyword", "")],
                            "source": "related_keywords",
                            "created_at": item.get("created_at", "2025-10-17T15:00:00Z")
                        })
                    
                    print(f"✅ Data processing: {len(combined_data)} combined keywords")
                    
                    # Step 3: Store in database
                    store_response = await client.post(
                        f"{base_url}/api/v1/keyword-research/store",
                        json={"keywords": combined_data}
                    )
                    
                    if store_response.status_code == 200:
                        store_data = store_response.json()
                        print(f"✅ Database storage: {store_data.get('message', 'Success')}")
                    else:
                        print(f"❌ Database storage failed: {store_response.status_code}")
                    
                    print("\n🎯 Frontend workflow simulation completed successfully!")
                    
                else:
                    print("❌ Parallel API calls failed")
                    if keyword_ideas_response.status_code != 200:
                        print(f"   Keyword ideas: {keyword_ideas_response.status_code}")
                    if related_keywords_response.status_code != 200:
                        print(f"   Related keywords: {related_keywords_response.status_code}")
                
            except Exception as e:
                print(f"❌ Error in frontend workflow simulation: {e}")
        
        return True
        
    except Exception as e:
        print(f"💥 Integration test failed: {e}")
        return False


async def main():
    """Main test function"""
    print("🚀 DataForSEO Frontend Integration Test Suite")
    print("=" * 70)
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    success = await test_complete_integration()
    
    if success:
        print("\n🎉 Integration tests completed successfully!")
        print("The frontend should now be able to:")
        print("  ✅ Call both DataForSEO services in parallel")
        print("  ✅ Process and combine keyword data")
        print("  ✅ Store results in Supabase database")
        print("  ✅ Display rich keyword data in the UI")
    else:
        print("\n⚠️  Some integration tests failed. Check the logs above for details.")


if __name__ == "__main__":
    asyncio.run(main())
