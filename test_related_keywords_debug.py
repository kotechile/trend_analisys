#!/usr/bin/env python3
"""
Debug script for related keywords API
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append('/Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/backend')

from src.services.dataforseo_service import DataForSEOService

async def test_related_keywords():
    """Test the related keywords functionality"""
    print("Testing related keywords...")
    
    # Initialize service
    service = DataForSEOService()
    await service.initialize()
    
    print(f"Service initialized. Base URL: {service.base_url}")
    print(f"Client: {service.client}")
    
    # Test related keywords
    try:
        keywords = await service.get_related_keywords(
            keywords=["eco friendly houses"],
            location_code=2840,
            language_code="en",
            depth=2,
            limit=3
        )
        
        print(f"Got {len(keywords)} related keywords:")
        for i, kw in enumerate(keywords):
            print(f"  {i+1}. {kw.get('keyword', 'N/A')} (source: {kw.get('source', 'N/A')})")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_related_keywords())