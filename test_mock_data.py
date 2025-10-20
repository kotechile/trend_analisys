#!/usr/bin/env python3
"""
Test script to verify mock data generation works correctly.
"""

import sys
import os
sys.path.append('trend-analysis-platform/backend/src')

from dataforseo.api_integration import DataForSEOAPIClient
import asyncio

async def test_mock_data():
    """Test the mock data generation"""
    print("🧪 Testing Mock Data Generation")
    print("=" * 50)
    
    try:
        client = DataForSEOAPIClient()
        
        # Test the mock data generation directly
        subtopics = ["Market Analysis", "Consumer Behavior", "Competitive Landscape"]
        location = "United States"
        time_range = "12m"
        
        print(f"📝 Testing with subtopics: {subtopics}")
        
        # Call the mock data generation method directly
        mock_data = client._generate_mock_trend_data(subtopics, location, time_range)
        
        print(f"✅ Generated {len(mock_data)} mock data items")
        
        for i, item in enumerate(mock_data):
            print(f"\n📊 Item {i+1}:")
            print(f"   Keyword: {item.keyword}")
            print(f"   Average Interest: {item.average_interest}")
            print(f"   Peak Interest: {item.peak_interest}")
            print(f"   Timeline Points: {len(item.time_series)}")
            print(f"   Geographic Data: {len(item.geographic_data) if item.geographic_data else 0} items")
            print(f"   Related Queries: {len(item.related_queries) if item.related_queries else 0} items")
            
            if item.time_series:
                print(f"   First timeline value: {item.time_series[0].value}")
                print(f"   Last timeline value: {item.time_series[-1].value}")
        
        print(f"\n🎉 Mock data generation test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing mock data: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_mock_data())
    if success:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)
