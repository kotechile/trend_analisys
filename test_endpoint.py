#!/usr/bin/env python3
"""
Test script to check if the endpoint is working
"""

import asyncio
import sys
import os

# Add the backend src to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'trend-analysis-platform', 'backend', 'src'))

from dataforseo.database import dataforseo_repository

async def test_get_keywords():
    """Test the get_keywords_by_topic_and_user method"""
    try:
        print("Testing get_keywords_by_topic_and_user method...")
        keywords = await dataforseo_repository.get_keywords_by_topic_and_user(
            "38ca070b-3238-4a27-ab75-860395c663b4", 
            "f248b7ed-b8df-4464-8544-8304d7ae4c30"
        )
        print(f"Success! Retrieved {len(keywords)} keywords")
        print(f"Keywords: {keywords}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_get_keywords())
