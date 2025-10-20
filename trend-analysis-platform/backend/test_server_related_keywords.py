#!/usr/bin/env python3
"""
Test the server's related keywords function directly
"""

import asyncio
import sys
from pathlib import Path

# Add the backend src to the path
sys.path.append(str(Path(__file__).parent / "src"))

async def test_server_related_keywords():
    """Test the server's related keywords function"""
    
    try:
        # Import the function
        from routers.functional_dataforseo_router import get_related_keywords
        
        print("🔍 Testing server's related keywords function...")
        
        # Test with the same data as the API call
        request_data = {
            "keywords": ["phone"],
            "language_name": "English",
            "location_code": 2840,
            "limit": 3
        }
        
        print(f"Request data: {request_data}")
        
        # Call the function
        result = await get_related_keywords(request_data)
        
        print(f"✅ Success! Got {len(result)} related keywords")
        for kw in result:
            print(f"   - {kw['keyword']}: {kw['search_volume']} volume")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_server_related_keywords())
