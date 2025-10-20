#!/usr/bin/env python3
"""
Test script to verify backend API call works correctly.
"""

import asyncio
import sys
import os
sys.path.append('trend-analysis-platform/backend/src')

from dataforseo.api_integration import DataForSEOAPIClient

async def test_backend_api():
    """Test the backend API call directly"""
    print("🧪 Testing Backend API Call")
    print("=" * 50)
    
    try:
        client = DataForSEOAPIClient()
        await client.initialize()
        
        print("✅ Client initialized successfully")
        
        # Test the API call directly
        result = await client.get_trend_data(["Market Analysis", "Consumer Behavior"], "United States", "12m")
        
        print(f"✅ API call completed")
        print(f"📊 Result type: {type(result)}")
        print(f"📊 Result length: {len(result) if result else 0}")
        
        if result:
            print(f"📊 First item: {result[0] if len(result) > 0 else 'None'}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = asyncio.run(test_backend_api())
    if result:
        print(f"\n🎉 SUCCESS: Got {len(result)} results")
    else:
        print(f"\n❌ FAILED: No results")
