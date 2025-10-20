#!/usr/bin/env python3
"""
Test the database function directly to see the exact error
"""

import asyncio
import sys
import os

# Add the backend src directory to the path
sys.path.append('/Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/backend/src')

async def test_direct_function():
    """Test the database function directly"""
    
    try:
        from dataforseo.database import DataForSEORepository, DatabaseManager
        
        # Create database manager and repository
        db_manager = DatabaseManager()
        repository = DataForSEORepository(db_manager)
        
        # Initialize database connection
        await db_manager.initialize()
        print("✅ Database connection initialized")
        
        # Test data with valid UUIDs
        test_keywords = [
            {
                "keyword": "test-keyword-direct-function",
                "search_volume": 1000,
                "cpc": 0.5,
                "competition": 0.3,
                "competition_level": "MEDIUM",
                "keyword_difficulty": 25,
                "difficulty": 25,
                "main_intent": "COMMERCIAL",
                "source": "keyword_ideas",
                "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
                "user_id": "f248b7ed-b8df-4464-8304d7ae4c30"
            }
        ]
        
        print(f"📝 Testing with {len(test_keywords)} keywords")
        print(f"📝 Keyword: {test_keywords[0]['keyword']}")
        print(f"📝 Topic ID: {test_keywords[0]['topic_id']}")
        print(f"📝 User ID: {test_keywords[0]['user_id']}")
        
        # Test database storage
        success = await repository.save_keyword_data_batch(test_keywords)
        
        if success:
            print("✅ Keywords stored successfully!")
        else:
            print("❌ Failed to store keywords")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'db_manager' in locals():
            await db_manager.close()

if __name__ == "__main__":
    asyncio.run(test_direct_function())
