#!/usr/bin/env python3
"""
Test script to verify LLM integration is working
"""

import requests
import json
import time

def test_topic_analysis():
    """Test the topic analysis API endpoint"""
    
    print("🧪 Testing LLM Integration...")
    print("=" * 50)
    
    # Test topics
    test_topics = [
        "gemini-2.5-flash-lite",
        "best wireless headphones",
        "eco friendly homes",
        "crypto trading strategies"
    ]
    
    base_url = "http://localhost:8000"
    
    for topic in test_topics:
        print(f"\n🔍 Testing topic: '{topic}'")
        
        try:
            # Make API request
            response = requests.post(
                f"{base_url}/api/topic-analysis/analyze",
                json={
                    "topic": topic,
                    "include_affiliate_programs": True,
                    "max_related_areas": 8,
                    "max_affiliate_programs": 6
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Got {len(data.get('related_areas', []))} related areas")
                print(f"   Affiliate programs: {len(data.get('affiliate_programs', []))}")
                
                # Show first few related areas
                areas = data.get('related_areas', [])[:3]
                if areas:
                    print(f"   Sample areas: {', '.join(areas)}")
                
                # Show first affiliate program
                programs = data.get('affiliate_programs', [])
                if programs:
                    first_program = programs[0]
                    print(f"   Sample program: {first_program.get('name', 'Unknown')} ({first_program.get('commission', 'N/A')})")
                
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {str(e)}")
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
        
        time.sleep(1)  # Rate limiting
    
    print("\n" + "=" * 50)
    print("🎉 LLM Integration Test Complete!")

def test_llm_providers():
    """Test LLM providers endpoint"""
    
    print("\n🔧 Testing LLM Providers...")
    
    try:
        response = requests.get("http://localhost:8000/api/admin/llm/providers")
        
        if response.status_code == 200:
            providers = response.json()
            print(f"✅ Found {len(providers)} LLM providers:")
            
            for provider in providers:
                status = "🔥 DEFAULT" if provider.get('is_default') else "✅ Active"
                print(f"   {status} {provider.get('name')} ({provider.get('provider_type')})")
        else:
            print(f"❌ Error getting providers: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 TrendTap LLM Integration Test")
    print("Make sure the backend is running on http://localhost:8000")
    print()
    
    # Test LLM providers first
    test_llm_providers()
    
    # Test topic analysis
    test_topic_analysis()
    
    print("\n💡 Next steps:")
    print("1. Check the admin interface at http://localhost:3000/admin/llm")
    print("2. Test different topics in the frontend")
    print("3. Monitor usage and costs")


