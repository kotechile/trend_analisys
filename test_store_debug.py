#!/usr/bin/env python3
"""
Debug script to test keyword storage
"""

import asyncio
import sys
from pathlib import Path

# Add the backend src directory to Python path
backend_src = Path(__file__).parent / "trend-analysis-platform" / "backend" / "src"
sys.path.insert(0, str(backend_src))

async def test_keyword_storage():
    """Test keyword storage directly"""
    try:
        from dataforseo.database import DataForSEORepository, DatabaseManager
        
        # Initialize database manager
        db_manager = DatabaseManager()
        await db_manager.initialize()
        repository = DataForSEORepository(db_manager)
        
        # Test data
        test_keywords = [{
            "keyword": "test keyword",
            "search_volume": 1000,
            "difficulty": 50,
            "keyword_difficulty": 50,
            "cpc": 1.50,
            "competition": 0.5,
            "competition_level": "MEDIUM",
            "main_intent": "COMMERCIAL",
            "intent_type": "COMMERCIAL",
            "priority_score": 75,
            "source": "test",
            "topic_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
            "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30"
        }]
        
        print("Testing keyword storage...")
        result = await repository.save_keyword_data_batch(test_keywords)
        print(f"Storage result: {result}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_keyword_storage())


