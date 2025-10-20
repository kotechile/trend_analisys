#!/usr/bin/env python3
"""
Test database storage directly to debug the issue
"""

import asyncio
import sys
import os

# Add the backend src directory to the path
sys.path.append('/Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/backend/src')

from dataforseo.database import DataForSEORepository, DatabaseManager

async def test_direct_database():
    """Test database storage directly"""
    
    # Create database manager and repository
    db_manager = DatabaseManager()
    repository = DataForSEORepository(db_manager)
    
    try:
        # Initialize database connection
        await db_manager.initialize()
        print("✅ Database connection initialized")
        
        # Test data
        test_keywords = [
            {
                "keyword": "test keyword 1",
                "search_volume": 1000,
                "cpc": 0.5,
                "competition": 0.3,
                "competition_level": "MEDIUM",
                "keyword_difficulty": 25,
                "difficulty": 25,
                "main_intent": "COMMERCIAL",
                "source": "keyword_ideas",
                "topic_id": "test-topic-123",
                "user_id": "test-user-123"
            }
        ]
        
        print(f"📝 Testing with {len(test_keywords)} keywords")
        print(f"📝 Keyword: {test_keywords[0]['keyword']}")
        print(f"📝 Competition: {test_keywords[0]['competition']} (type: {type(test_keywords[0]['competition'])})")
        
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
        await db_manager.close()

if __name__ == "__main__":
    asyncio.run(test_direct_database())
