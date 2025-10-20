#!/usr/bin/env python3
"""
Test DataForSEO API Integration

This script tests the DataForSEO API integration with your sandbox credentials.
Run this after creating the DataForSEO tables in your remote database.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add the backend src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "backend" / "src"))

async def test_trend_analysis():
    """Test trend analysis API"""
    print("📈 Testing Trend Analysis API...")
    
    try:
        from backend.src.dataforseo.api_integration import api_client
        
        # Initialize API client
        await api_client.initialize()
        print("✅ API client initialized")
        
        # Test trend data retrieval
        subtopics = ["artificial intelligence", "machine learning"]
        location = "United States"
        time_range = "12m"
        
        print(f"   Fetching trend data for: {subtopics}")
        print(f"   Location: {location}")
        print(f"   Time range: {time_range}")
        
        trend_data = await api_client.get_trend_data(subtopics, location, time_range)
        
        if trend_data:
            print(f"✅ Successfully retrieved {len(trend_data)} trend data points")
            for data in trend_data[:2]:  # Show first 2 results
                print(f"   - {data.subtopic}: {data.average_interest} avg interest")
        else:
            print("⚠️  No trend data returned (this might be normal for sandbox)")
            
    except Exception as e:
        print(f"❌ Trend analysis test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_keyword_research():
    """Test keyword research API"""
    print("\n🔍 Testing Keyword Research API...")
    
    try:
        from backend.src.dataforseo.api_integration import api_client
        
        # Test keyword research
        seed_keywords = ["AI tools", "machine learning software"]
        max_difficulty = 50
        max_keywords = 10
        
        print(f"   Researching keywords for: {seed_keywords}")
        print(f"   Max difficulty: {max_difficulty}")
        print(f"   Max keywords: {max_keywords}")
        
        keyword_data = await api_client.get_keyword_ideas(seed_keywords, max_difficulty, max_keywords)
        
        if keyword_data:
            print(f"✅ Successfully retrieved {len(keyword_data)} keywords")
            for data in keyword_data[:3]:  # Show first 3 results
                print(f"   - {data.keyword}: Vol={data.search_volume}, KD={data.keyword_difficulty}")
        else:
            print("⚠️  No keyword data returned (this might be normal for sandbox)")
            
    except Exception as e:
        print(f"❌ Keyword research test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_database_operations():
    """Test database operations"""
    print("\n💾 Testing Database Operations...")
    
    try:
        from backend.src.dataforseo.database import db_manager, dataforseo_repository
        
        # Initialize database
        await db_manager.initialize()
        print("✅ Database connection established")
        
        # Test API credentials retrieval
        credentials = await dataforseo_repository.get_api_credentials("dataforseo")
        
        if credentials:
            print(f"✅ API credentials retrieved:")
            print(f"   Provider: {credentials.provider}")
            print(f"   Base URL: {credentials.base_url}")
            print(f"   Is Active: {credentials.is_active}")
        else:
            print("❌ No API credentials found")
            return False
            
        # Test saving sample data
        from backend.src.models.trend_data import TrendData
        from datetime import datetime
        
        sample_trend = TrendData(
            subtopic="test topic",
            location="United States",
            time_range="12m",
            average_interest=75.5,
            peak_interest=85.0,
            timeline_data=[{"date": "2024-01-01", "value": 75}],
            related_queries=["test query 1", "test query 2"]
        )
        
        success = await dataforseo_repository.save_trend_data(sample_trend)
        
        if success:
            print("✅ Successfully saved sample trend data")
        else:
            print("❌ Failed to save sample trend data")
            
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        try:
            await db_manager.close()
        except:
            pass

async def main():
    """Main test function"""
    print("🚀 DataForSEO API Integration Test")
    print("=" * 50)
    
    # Test database operations first
    db_success = await test_database_operations()
    
    if not db_success:
        print("\n❌ Database test failed. Please check:")
        print("   1. DataForSEO tables are created in your remote database")
        print("   2. API credentials are properly set in api_keys table")
        print("   3. Database connection settings are correct")
        return
    
    # Test API operations
    await test_trend_analysis()
    await test_keyword_research()
    
    print("\n" + "=" * 50)
    print("🏁 API Integration Test Complete!")
    print()
    print("Next steps:")
    print("1. Start your backend server: python backend/main.py")
    print("2. Test the REST API endpoints with curl or Postman")
    print("3. Integrate with your frontend components")

if __name__ == "__main__":
    asyncio.run(main())
